<?php

namespace App\Repositories\ManAkses;

use App\Services\RadiusApi\RadiusApiClient;
use App\Services\RadiusApi\RadiusUserService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Pengguna Repository
 * Handle all pengguna (user) related database operations for Manajemen Akses
 *
 * Updated: Sekarang menggunakan Radius API untuk mengecek status SSO
 * Fallback ke database connection jika API tidak tersedia/disabled
 */
class PenggunaRepository
{
    protected ?RadiusUserService $radiusUserService = null;

    /**
     * Get Radius User Service instance (lazy loading)
     */
    private function getRadiusUserService(): RadiusUserService
    {
        if ($this->radiusUserService === null) {
            $client = new RadiusApiClient();
            $this->radiusUserService = new RadiusUserService($client);
        }
        return $this->radiusUserService;
    }

    /**
     * Check if Radius API is enabled and configured
     */
    private function isRadiusApiEnabled(): bool
    {
        return config('radius_api.enabled', true) &&
               !empty(config('radius_api.base_url'));
    }

    /**
     * Check if radius is available (API or database)
     */
    private function isRadiusAvailable(): bool
    {
        // Try API first if enabled
        if ($this->isRadiusApiEnabled()) {
            return $this->getRadiusUserService()->isAvailable();
        }

        // Fallback to database connection
        return $this->isRadiusDatabaseAvailable();
    }

    /**
     * Check if radius database (MySQL) is available (fallback)
     */
    private function isRadiusDatabaseAvailable(): bool
    {
        try {
            DB::connection('radius')->select("SELECT 1");
            return true;
        } catch (\Exception $e) {
            Log::warning('Radius database not available: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get usernames from Radius (via API or database)
     * Returns array of usernames for efficient lookup
     */
    private function getRadiusUsernames(): array
    {
        // Try API first if enabled
        if ($this->isRadiusApiEnabled()) {
            $usernames = $this->getRadiusUserService()->getAllUsernames();
            if (!empty($usernames)) {
                return $usernames;
            }
        }

        // Fallback to database if API failed or not enabled
        return $this->getRadiusUsernamesFromDatabase();
    }

    /**
     * Get usernames from radius database (fallback method)
     */
    private function getRadiusUsernamesFromDatabase(): array
    {
        if (!$this->isRadiusDatabaseAvailable()) {
            return [];
        }

        try {
            $results = DB::connection('radius')->table('radcheck')
                ->select('username')
                ->whereNotNull('username')
                ->where('username', '!=', '')
                ->distinct()
                ->pluck('username')
                ->toArray();
            // Filter out any null/empty values that might slip through
            return array_filter($results, fn($v) => is_string($v) && $v !== '');
        } catch (\Exception $e) {
            Log::warning('Failed to get radius usernames from database: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get paginated list of pengguna with search and filters
     * Note: Radius is MySQL, main DB is SQL Server - no cross-db JOIN possible
     * We fetch radius usernames separately and merge in PHP
     *
     * @param array $params [page, limit, search, status, has_sso]
     * @return array
     */
    public function getList(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $status = $params['status'] ?? null; // 'aktif', 'nonaktif', null for all
        $hasSso = $params['has_sso'] ?? null; // 'yes', 'no', null for all
        $offset = ($page - 1) * $limit;

        // Get radius usernames from MySQL for SSO check
        $radiusUsernames = $this->getRadiusUsernames();
        $radiusAvailable = !empty($radiusUsernames) || $this->isRadiusAvailable();

        // Base query for data from SQL Server
        $dataSql = "
            SELECT
                CONVERT(VARCHAR(36), p.id_pengguna) as id_pengguna,
                p.username,
                p.nm_pengguna,
                p.email,
                p.jenis_kelamin,
                p.no_hp,
                p.jabatan,
                p.a_aktif,
                p.disable,
                p.tgl_create,
                p.last_update,
                ll.waktu_login as last_login_at,
                rp_active.nm_peran as active_role,
                rp_active.nm_organisasi as active_organisasi
            FROM man_akses.pengguna p
            LEFT JOIN (
                SELECT id_pengguna, MAX(waktu_login) as waktu_login
                FROM logger.log_login
                GROUP BY id_pengguna
            ) ll ON ll.id_pengguna = p.id_pengguna
            LEFT JOIN (
                SELECT rp.id_pengguna, pr.nm_peran, uo.nm_lemb as nm_organisasi, rp.last_active,
                       ROW_NUMBER() OVER (PARTITION BY rp.id_pengguna ORDER BY COALESCE(rp.last_active, '1900-01-01') DESC) as rn
                FROM man_akses.role_pengguna rp
                LEFT JOIN man_akses.peran pr ON pr.id_peran = rp.id_peran
                LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
                WHERE rp.soft_delete = 0
            ) rp_active ON rp_active.id_pengguna = p.id_pengguna AND rp_active.rn = 1
            WHERE p.soft_delete = 0
        ";

        // Base query for count
        $countSql = "
            SELECT COUNT(*) as total
            FROM man_akses.pengguna p
            WHERE p.soft_delete = 0
        ";

        $bindings = [];
        $countBindings = [];

        // Add search filter
        if (!empty($search)) {
            $searchCondition = " AND (
                p.username LIKE ?
                OR p.nm_pengguna LIKE ?
                OR p.email LIKE ?
            )";
            $countSql .= $searchCondition;
            $dataSql .= $searchCondition;
            $searchTerm = "%{$search}%";
            $bindings[] = $searchTerm;
            $bindings[] = $searchTerm;
            $bindings[] = $searchTerm;
            $countBindings[] = $searchTerm;
            $countBindings[] = $searchTerm;
            $countBindings[] = $searchTerm;
        }

        // Add status filter
        if ($status !== null) {
            if ($status === 'aktif') {
                $statusCondition = " AND p.a_aktif = 1 AND p.disable = 0";
            } else {
                $statusCondition = " AND (p.a_aktif = 0 OR p.disable = 1)";
            }
            $countSql .= $statusCondition;
            $dataSql .= $statusCondition;
        }

        // For SSO filter, we need to filter BEFORE pagination
        // Get matching usernames from pengguna that exist/don't exist in radius
        $filterBySso = $hasSso !== null && $radiusAvailable;

        if ($filterBySso && !empty($radiusUsernames)) {
            // Get all pengguna usernames first (without pagination)
            $allPenggunaSql = str_replace('SELECT COUNT(*) as total', 'SELECT p.username', $countSql);
            $allPenggunaUsernames = DB::select($allPenggunaSql, $countBindings);
            $allPenggunaUsernames = array_column($allPenggunaUsernames, 'username');

            // Filter usernames based on SSO status
            $radiusSet = array_flip($radiusUsernames);
            $filteredUsernames = [];
            foreach ($allPenggunaUsernames as $username) {
                $inRadius = isset($radiusSet[$username]);
                if ($hasSso === 'yes' && $inRadius) {
                    $filteredUsernames[] = $username;
                } elseif ($hasSso === 'no' && !$inRadius) {
                    $filteredUsernames[] = $username;
                }
            }

            // If no matching usernames, return empty
            if (empty($filteredUsernames)) {
                return [
                    'data' => [],
                    'total' => 0,
                    'page' => $page,
                    'limit' => $limit,
                    'total_pages' => 0
                ];
            }

            // Add username filter to query - chunk to avoid 2100 parameter limit
            // Take only usernames needed for current page + some buffer
            $paginatedUsernames = array_slice($filteredUsernames, $offset, $limit);
            if (!empty($paginatedUsernames)) {
                $placeholders = implode(',', array_fill(0, count($paginatedUsernames), '?'));
                $dataSql .= " AND p.username IN ($placeholders)";
                $bindings = array_merge($bindings, $paginatedUsernames);
            }

            $total = count($filteredUsernames);
        } else {
            $countResult = DB::selectOne($countSql, $countBindings);
            $total = $countResult->total ?? 0;
        }

        // Add ordering and pagination (only if not filtering by SSO, as we handle that above)
        if (!$filterBySso) {
            $dataSql .= " ORDER BY p.username ASC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
            $bindings[] = $offset;
            $bindings[] = $limit;
        } else {
            $dataSql .= " ORDER BY p.username ASC";
        }

        // Get data from SQL Server
        $data = DB::select($dataSql, $bindings);

        // Add SSO status from radius MySQL database
        $radiusSet = isset($radiusSet) ? $radiusSet : array_flip($radiusUsernames);
        foreach ($data as $item) {
            $hasSsoFlag = isset($radiusSet[$item->username]);
            $item->has_sso = $hasSsoFlag ? 1 : 0;
            $item->sumber_data = $hasSsoFlag ? 'SSO Radius' : 'Manajemen Akses';
        }

        return [
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $total > 0 ? ceil($total / $limit) : 0
        ];
    }

    /**
     * Count pengguna with SSO filter applied
     * Strategy: Get pengguna usernames first, then filter against radius MySQL
     */
    private function countWithSsoFilter(string $baseSql, array $bindings, string $hasSso, array $radiusUsernames): int
    {
        // Get all matching pengguna usernames from SQL Server first
        $usernameSql = str_replace('SELECT COUNT(*) as total', 'SELECT p.username', $baseSql);
        $penggunaUsernames = DB::select($usernameSql, $bindings);
        $penggunaUsernames = array_column($penggunaUsernames, 'username');

        if (empty($penggunaUsernames)) {
            return 0;
        }

        if (empty($radiusUsernames)) {
            // No radius users available
            if ($hasSso === 'yes') {
                return 0;
            }
            return count($penggunaUsernames);
        }

        // Convert radius usernames to set for O(1) lookup
        $radiusSet = array_flip($radiusUsernames);

        // Count based on SSO filter
        $count = 0;
        foreach ($penggunaUsernames as $username) {
            $inRadius = isset($radiusSet[$username]);
            if ($hasSso === 'yes' && $inRadius) {
                $count++;
            } elseif ($hasSso === 'no' && !$inRadius) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Get pengguna detail by ID
     * Note: Radius is MySQL, main DB is SQL Server - check SSO status separately
     *
     * @param string $id
     * @return object|null
     */
    public function getDetail(string $id): ?object
    {
        // Get pengguna from SQL Server
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), p.id_pengguna) as id_pengguna,
                p.username,
                p.nm_pengguna,
                p.email,
                p.jenis_kelamin,
                p.tempat_lahir,
                p.tgl_lahir,
                p.alamat,
                p.no_tel,
                p.no_hp,
                p.jabatan,
                p.a_aktif,
                p.disable,
                p.approval_pengguna,
                p.tgl_create,
                p.last_update,
                ll.waktu_login as last_login_at,
                ll.ip_address as last_login_ip
            FROM man_akses.pengguna p
            LEFT JOIN (
                SELECT id_pengguna, waktu_login, ip_address
                FROM logger.log_login l1
                WHERE waktu_login = (
                    SELECT MAX(waktu_login) FROM logger.log_login l2 WHERE l2.id_pengguna = l1.id_pengguna
                )
            ) ll ON ll.id_pengguna = p.id_pengguna
            WHERE p.id_pengguna = ?
              AND p.soft_delete = 0
        ";

        $pengguna = DB::selectOne($sql, [$id]);

        if ($pengguna) {
            // Check SSO status from MySQL radius database
            $hasSso = $this->checkSsoStatus($pengguna->username);
            $pengguna->has_sso = $hasSso ? 1 : 0;
            $pengguna->sumber_data = $hasSso ? 'SSO Radius' : 'Manajemen Akses';
        }

        return $pengguna;
    }

    /**
     * Get pengguna roles
     *
     * @param string $id
     * @return array
     */
    public function getRoles(string $id): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), rp.id_role_pengguna) as id_role_pengguna,
                CONVERT(VARCHAR(36), rp.id_peran) as id_peran,
                pr.nm_peran,
                CONVERT(VARCHAR(36), rp.id_organisasi) as id_organisasi,
                uo.nm_lemb as nm_organisasi,
                rp.approval_peran,
                rp.tgl_create,
                rp.last_active
            FROM man_akses.role_pengguna rp
            LEFT JOIN man_akses.peran pr ON pr.id_peran = rp.id_peran
            LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
            WHERE rp.id_pengguna = ?
              AND rp.soft_delete = 0
            ORDER BY COALESCE(rp.last_active, '1900-01-01') DESC
        ";

        return DB::select($sql, [$id]);
    }

    /**
     * Get statistics for pengguna
     * Note: Radius data diambil via API atau database (dengan fallback)
     *
     * @return object
     */
    public function getStats(): object
    {
        // Get base stats from SQL Server (fast - single aggregate query)
        $sql = "
            SELECT
                COUNT(*) as total_pengguna,
                SUM(CASE WHEN p.a_aktif = 1 AND p.disable = 0 THEN 1 ELSE 0 END) as total_aktif,
                SUM(CASE WHEN p.a_aktif = 0 OR p.disable = 1 THEN 1 ELSE 0 END) as total_nonaktif
            FROM man_akses.pengguna p
            WHERE p.soft_delete = 0
        ";

        $stats = DB::selectOne($sql);

        // Get SSO count from Radius API or database
        if ($this->isRadiusApiEnabled()) {
            // Try Radius API first
            try {
                $radiusStats = $this->getRadiusUserService()->getStats();
                if ($radiusStats['available']) {
                    $stats->total_sso = $radiusStats['total_sso'];
                    $stats->total_non_sso = max(0, $stats->total_pengguna - $radiusStats['total_sso']);
                } else {
                    // API not available, try database fallback
                    $this->getSsoStatsFromDatabase($stats);
                }
            } catch (\Exception $e) {
                Log::warning('Failed to get SSO stats from API: ' . $e->getMessage());
                // Try database fallback
                $this->getSsoStatsFromDatabase($stats);
            }
        } else {
            // API disabled, use database
            $this->getSsoStatsFromDatabase($stats);
        }

        return $stats;
    }

    /**
     * Get SSO stats from database (fallback method)
     */
    private function getSsoStatsFromDatabase(object $stats): void
    {
        if ($this->isRadiusDatabaseAvailable()) {
            try {
                $ssoResult = DB::connection('radius')->selectOne("
                    SELECT COUNT(DISTINCT username) as total_sso
                    FROM radcheck
                    WHERE username IS NOT NULL AND username != ''
                ");

                $ssoCount = $ssoResult->total_sso ?? 0;
                $stats->total_sso = $ssoCount;
                $stats->total_non_sso = max(0, $stats->total_pengguna - $ssoCount);
            } catch (\Exception $e) {
                Log::warning('Failed to get SSO stats from database: ' . $e->getMessage());
                $stats->total_sso = 0;
                $stats->total_non_sso = $stats->total_pengguna;
            }
        } else {
            // Radius not available, all users are non-SSO
            $stats->total_sso = 0;
            $stats->total_non_sso = $stats->total_pengguna;
        }
    }

    /**
     * Check if username exists in SSO Radius (via API or database)
     *
     * @param string $username
     * @return bool
     */
    public function checkSsoStatus(string $username): bool
    {
        // Try API first if enabled
        if ($this->isRadiusApiEnabled()) {
            return $this->getRadiusUserService()->usernameExists($username);
        }

        // Fallback to database
        return $this->checkSsoStatusFromDatabase($username);
    }

    /**
     * Check SSO status from database (fallback method)
     */
    private function checkSsoStatusFromDatabase(string $username): bool
    {
        if (!$this->isRadiusDatabaseAvailable()) {
            return false;
        }

        try {
            $result = DB::connection('radius')
                ->table('radcheck')
                ->where('username', $username)
                ->first();
            return $result !== null;
        } catch (\Exception $e) {
            Log::warning('Failed to check SSO status from database: ' . $e->getMessage());
            return false;
        }
    }
}
