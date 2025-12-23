<?php

namespace App\Repositories\Logger;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Logger Repository
 * Handle all logger related database operations
 *
 * Tables:
 * - logger.log_login: Login/logout logs
 * - logger.log_jwt: JWT token logs
 * - logger.log_akses_jwt: JWT access logs
 */
class LoggerRepository
{
    /**
     * Get paginated list of login logs
     *
     * @param array $params [page, limit, search, date_from, date_to, id_aplikasi, id_pengguna, a_sesi_aktif, sort_by, sort_order]
     * @return array
     */
    public function getLoginLogs(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $dateFrom = $params['date_from'] ?? null;
        $dateTo = $params['date_to'] ?? null;
        $idAplikasi = $params['id_aplikasi'] ?? null;
        $idPengguna = $params['id_pengguna'] ?? null;
        $aSesiAktif = $params['a_sesi_aktif'] ?? null;
        $sortBy = $params['sort_by'] ?? 'waktu_login';
        $sortOrder = $params['sort_order'] ?? 'desc';
        $offset = ($page - 1) * $limit;

        // Validate sort column to prevent SQL injection
        $allowedSortColumns = [
            'waktu_login' => 'll.waktu_login',
            'waktu_logout' => 'll.waktu_logout',
            'username' => 'p.username',
            'nm_pengguna' => 'p.nm_pengguna',
            'nm_aplikasi' => 'a.nm_aplikasi',
            'ip_address' => 'll.ip_address',
        ];
        $sortColumn = $allowedSortColumns[$sortBy] ?? 'll.waktu_login';
        $sortDirection = strtolower($sortOrder) === 'asc' ? 'ASC' : 'DESC';

        // Base query
        $baseSql = "
            FROM logger.log_login ll
            INNER JOIN man_akses.pengguna p ON ll.id_pengguna = p.id_pengguna
            INNER JOIN man_akses.aplikasi a ON ll.id_aplikasi = a.id_aplikasi
            WHERE 1=1
        ";

        $params_bind = [];

        // Search filter
        if ($search) {
            $baseSql .= " AND (p.username LIKE ? OR p.nm_pengguna LIKE ? OR ll.ip_address LIKE ?)";
            $searchTerm = "%{$search}%";
            $params_bind[] = $searchTerm;
            $params_bind[] = $searchTerm;
            $params_bind[] = $searchTerm;
        }

        // Date range filter
        if ($dateFrom) {
            $baseSql .= " AND ll.waktu_login >= ?";
            $params_bind[] = $dateFrom;
        }
        if ($dateTo) {
            $baseSql .= " AND ll.waktu_login <= ?";
            $params_bind[] = $dateTo;
        }

        // Aplikasi filter
        if ($idAplikasi) {
            $baseSql .= " AND ll.id_aplikasi = ?";
            $params_bind[] = $idAplikasi;
        }

        // Pengguna filter
        if ($idPengguna) {
            $baseSql .= " AND ll.id_pengguna = ?";
            $params_bind[] = $idPengguna;
        }

        // Sesi aktif filter
        if ($aSesiAktif !== null) {
            $baseSql .= " AND ll.a_sesi_aktif = ?";
            $params_bind[] = $aSesiAktif;
        }

        // Count query
        $countSql = "SELECT COUNT(*) as total " . $baseSql;
        $totalRecords = DB::select($countSql, $params_bind)[0]->total ?? 0;

        // Data query with pagination
        $dataSql = "
            SELECT
                ll.id_log_login,
                ll.id_aplikasi,
                ll.id_pengguna,
                ll.waktu_login,
                ll.waktu_logout,
                ll.ip_address,
                ll.browser,
                ll.os,
                ll.a_sesi_aktif,
                p.username,
                p.nm_pengguna,
                p.email,
                a.nm_aplikasi,
                a.app_key,
                DATEDIFF(MINUTE, ll.waktu_login, COALESCE(ll.waktu_logout, GETDATE())) as durasi_menit
            " . $baseSql . "
            ORDER BY {$sortColumn} {$sortDirection}
            OFFSET ? ROWS
            FETCH NEXT ? ROWS ONLY
        ";

        $params_bind[] = $offset;
        $params_bind[] = $limit;

        $data = DB::select($dataSql, $params_bind);

        return [
            'data' => $data,
            'total' => $totalRecords,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $totalRecords > 0 ? ceil($totalRecords / $limit) : 0,
        ];
    }

    /**
     * Get login log detail
     *
     * @param string $idLogLogin
     * @return object|null
     */
    public function getLoginLogDetail(string $idLogLogin): ?object
    {
        $sql = "
            SELECT
                ll.id_log_login,
                ll.id_aplikasi,
                ll.id_pengguna,
                ll.waktu_login,
                ll.waktu_logout,
                ll.ip_address,
                ll.browser,
                ll.os,
                ll.a_sesi_aktif,
                p.username,
                p.nm_pengguna,
                p.email,
                p.jenis_kelamin,
                p.no_hp,
                p.jabatan,
                a.nm_aplikasi,
                a.app_key,
                a.url as aplikasi_url,
                DATEDIFF(MINUTE, ll.waktu_login, COALESCE(ll.waktu_logout, GETDATE())) as durasi_menit,
                DATEDIFF(SECOND, ll.waktu_login, COALESCE(ll.waktu_logout, GETDATE())) as durasi_detik
            FROM logger.log_login ll
            INNER JOIN man_akses.pengguna p ON ll.id_pengguna = p.id_pengguna
            INNER JOIN man_akses.aplikasi a ON ll.id_aplikasi = a.id_aplikasi
            WHERE ll.id_log_login = ?
        ";

        $result = DB::select($sql, [$idLogLogin]);
        return $result[0] ?? null;
    }

    /**
     * Get paginated list of JWT logs
     *
     * @param array $params [page, limit, search, date_from, date_to, id_aplikasi, id_pengguna, sort_by, sort_order]
     * @return array
     */
    public function getJwtLogs(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $dateFrom = $params['date_from'] ?? null;
        $dateTo = $params['date_to'] ?? null;
        $idAplikasi = $params['id_aplikasi'] ?? null;
        $idPengguna = $params['id_pengguna'] ?? null;
        $sortBy = $params['sort_by'] ?? 'waktu_create';
        $sortOrder = $params['sort_order'] ?? 'desc';
        $offset = ($page - 1) * $limit;

        // Validate sort column
        $allowedSortColumns = [
            'waktu_create' => 'lj.waktu_create',
            'waktu_expired' => 'lj.waktu_expired',
            'username' => 'p.username',
            'nm_pengguna' => 'p.nm_pengguna',
            'nm_aplikasi' => 'a.nm_aplikasi',
            'ip_address' => 'lj.ip_address',
        ];
        $sortColumn = $allowedSortColumns[$sortBy] ?? 'lj.waktu_create';
        $sortDirection = strtolower($sortOrder) === 'asc' ? 'ASC' : 'DESC';

        // Base query
        $baseSql = "
            FROM logger.log_jwt lj
            INNER JOIN man_akses.pengguna p ON lj.id_pengguna = p.id_pengguna
            LEFT JOIN man_akses.aplikasi a ON lj.id_aplikasi = a.id_aplikasi
            WHERE 1=1
        ";

        $params_bind = [];

        // Search filter
        if ($search) {
            $baseSql .= " AND (p.username LIKE ? OR p.nm_pengguna LIKE ? OR lj.ip_address LIKE ? OR lj.url LIKE ?)";
            $searchTerm = "%{$search}%";
            $params_bind[] = $searchTerm;
            $params_bind[] = $searchTerm;
            $params_bind[] = $searchTerm;
            $params_bind[] = $searchTerm;
        }

        // Date range filter
        if ($dateFrom) {
            $baseSql .= " AND lj.waktu_create >= ?";
            $params_bind[] = $dateFrom;
        }
        if ($dateTo) {
            $baseSql .= " AND lj.waktu_create <= ?";
            $params_bind[] = $dateTo;
        }

        // Aplikasi filter
        if ($idAplikasi) {
            $baseSql .= " AND lj.id_aplikasi = ?";
            $params_bind[] = $idAplikasi;
        }

        // Pengguna filter
        if ($idPengguna) {
            $baseSql .= " AND lj.id_pengguna = ?";
            $params_bind[] = $idPengguna;
        }

        // Count query
        $countSql = "SELECT COUNT(*) as total " . $baseSql;
        $totalRecords = DB::select($countSql, $params_bind)[0]->total ?? 0;

        // Data query with pagination
        $dataSql = "
            SELECT
                lj.id_log_jwt,
                lj.id_pengguna,
                lj.id_aplikasi,
                lj.token_value,
                lj.url,
                lj.ip_address,
                lj.waktu_create,
                lj.waktu_expired,
                p.username,
                p.nm_pengguna,
                p.email,
                a.nm_aplikasi,
                a.app_key,
                CASE
                    WHEN lj.waktu_expired < GETDATE() THEN 1
                    ELSE 0
                END as is_expired
            " . $baseSql . "
            ORDER BY {$sortColumn} {$sortDirection}
            OFFSET ? ROWS
            FETCH NEXT ? ROWS ONLY
        ";

        $params_bind[] = $offset;
        $params_bind[] = $limit;

        $data = DB::select($dataSql, $params_bind);

        return [
            'data' => $data,
            'total' => $totalRecords,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $totalRecords > 0 ? ceil($totalRecords / $limit) : 0,
        ];
    }

    /**
     * Get JWT log detail
     *
     * @param string $idLogJwt
     * @return object|null
     */
    public function getJwtLogDetail(string $idLogJwt): ?object
    {
        $sql = "
            SELECT
                lj.id_log_jwt,
                lj.id_pengguna,
                lj.id_aplikasi,
                lj.token_value,
                lj.url,
                lj.ip_address,
                lj.waktu_create,
                lj.waktu_expired,
                p.username,
                p.nm_pengguna,
                p.email,
                p.jenis_kelamin,
                p.no_hp,
                p.jabatan,
                a.nm_aplikasi,
                a.app_key,
                a.url as aplikasi_url,
                CASE
                    WHEN lj.waktu_expired < GETDATE() THEN 1
                    ELSE 0
                END as is_expired,
                DATEDIFF(MINUTE, lj.waktu_create, lj.waktu_expired) as valid_durasi_menit
            FROM logger.log_jwt lj
            INNER JOIN man_akses.pengguna p ON lj.id_pengguna = p.id_pengguna
            LEFT JOIN man_akses.aplikasi a ON lj.id_aplikasi = a.id_aplikasi
            WHERE lj.id_log_jwt = ?
        ";

        $result = DB::select($sql, [$idLogJwt]);
        return $result[0] ?? null;
    }

    /**
     * Get paginated list of JWT access logs
     *
     * @param array $params [page, limit, search, date_from, date_to, id_aplikasi, id_log_jwt, a_berhasil, method, sort_by, sort_order]
     * @return array
     */
    public function getJwtAccessLogs(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $dateFrom = $params['date_from'] ?? null;
        $dateTo = $params['date_to'] ?? null;
        $idAplikasi = $params['id_aplikasi'] ?? null;
        $idLogJwt = $params['id_log_jwt'] ?? null;
        $aBerhasil = $params['a_berhasil'] ?? null;
        $method = $params['method'] ?? null;
        $sortBy = $params['sort_by'] ?? 'waktu_akses';
        $sortOrder = $params['sort_order'] ?? 'desc';
        $offset = ($page - 1) * $limit;

        // Validate sort column
        $allowedSortColumns = [
            'waktu_akses' => 'la.waktu_akses',
            'menu_akses' => 'la.menu_akses',
            'method' => 'la.method',
            'username' => 'p.username',
            'nm_pengguna' => 'p.nm_pengguna',
        ];
        $sortColumn = $allowedSortColumns[$sortBy] ?? 'la.waktu_akses';
        $sortDirection = strtolower($sortOrder) === 'asc' ? 'ASC' : 'DESC';

        // Base query
        $baseSql = "
            FROM logger.log_akses_jwt la
            INNER JOIN logger.log_jwt lj ON la.id_log_jwt = lj.id_log_jwt
            INNER JOIN man_akses.pengguna p ON lj.id_pengguna = p.id_pengguna
            LEFT JOIN man_akses.aplikasi a ON lj.id_aplikasi = a.id_aplikasi
            WHERE 1=1
        ";

        $params_bind = [];

        // Search filter
        if ($search) {
            $baseSql .= " AND (p.username LIKE ? OR p.nm_pengguna LIKE ? OR la.menu_akses LIKE ? OR la.ket LIKE ?)";
            $searchTerm = "%{$search}%";
            $params_bind[] = $searchTerm;
            $params_bind[] = $searchTerm;
            $params_bind[] = $searchTerm;
            $params_bind[] = $searchTerm;
        }

        // Date range filter
        if ($dateFrom) {
            $baseSql .= " AND la.waktu_akses >= ?";
            $params_bind[] = $dateFrom;
        }
        if ($dateTo) {
            $baseSql .= " AND la.waktu_akses <= ?";
            $params_bind[] = $dateTo;
        }

        // Aplikasi filter
        if ($idAplikasi) {
            $baseSql .= " AND lj.id_aplikasi = ?";
            $params_bind[] = $idAplikasi;
        }

        // JWT log filter
        if ($idLogJwt) {
            $baseSql .= " AND la.id_log_jwt = ?";
            $params_bind[] = $idLogJwt;
        }

        // Berhasil filter
        if ($aBerhasil !== null) {
            $baseSql .= " AND la.a_berhasil = ?";
            $params_bind[] = $aBerhasil;
        }

        // Method filter
        if ($method) {
            $baseSql .= " AND la.method = ?";
            $params_bind[] = $method;
        }

        // Count query
        $countSql = "SELECT COUNT(*) as total " . $baseSql;
        $totalRecords = DB::select($countSql, $params_bind)[0]->total ?? 0;

        // Data query with pagination
        $dataSql = "
            SELECT
                la.id_log_akses_jwt,
                la.id_log_jwt,
                la.menu_akses,
                la.method,
                la.request_list,
                la.waktu_akses,
                la.a_berhasil,
                la.ket,
                la.hasil_akses,
                lj.id_pengguna,
                lj.id_aplikasi,
                lj.ip_address,
                p.username,
                p.nm_pengguna,
                p.email,
                a.nm_aplikasi,
                a.app_key
            " . $baseSql . "
            ORDER BY {$sortColumn} {$sortDirection}
            OFFSET ? ROWS
            FETCH NEXT ? ROWS ONLY
        ";

        $params_bind[] = $offset;
        $params_bind[] = $limit;

        $data = DB::select($dataSql, $params_bind);

        return [
            'data' => $data,
            'total' => $totalRecords,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $totalRecords > 0 ? ceil($totalRecords / $limit) : 0,
        ];
    }

    /**
     * Get JWT access log detail
     *
     * @param string $idLogAksesJwt
     * @return object|null
     */
    public function getJwtAccessLogDetail(string $idLogAksesJwt): ?object
    {
        $sql = "
            SELECT
                la.id_log_akses_jwt,
                la.id_log_jwt,
                la.menu_akses,
                la.method,
                la.request_list,
                la.waktu_akses,
                la.a_berhasil,
                la.ket,
                la.hasil_akses,
                lj.id_pengguna,
                lj.id_aplikasi,
                lj.token_value,
                lj.url,
                lj.ip_address,
                lj.waktu_create as jwt_waktu_create,
                lj.waktu_expired as jwt_waktu_expired,
                p.username,
                p.nm_pengguna,
                p.email,
                p.jenis_kelamin,
                p.no_hp,
                p.jabatan,
                a.nm_aplikasi,
                a.app_key,
                a.url as aplikasi_url
            FROM logger.log_akses_jwt la
            INNER JOIN logger.log_jwt lj ON la.id_log_jwt = lj.id_log_jwt
            INNER JOIN man_akses.pengguna p ON lj.id_pengguna = p.id_pengguna
            LEFT JOIN man_akses.aplikasi a ON lj.id_aplikasi = a.id_aplikasi
            WHERE la.id_log_akses_jwt = ?
        ";

        $result = DB::select($sql, [$idLogAksesJwt]);
        return $result[0] ?? null;
    }

    /**
     * Get logger statistics
     *
     * @return array
     */
    public function getStats(): array
    {
        // Login stats
        $loginStats = DB::select("
            SELECT
                COUNT(*) as total_logins,
                COUNT(DISTINCT id_pengguna) as unique_users,
                COUNT(DISTINCT id_aplikasi) as unique_apps,
                SUM(CASE WHEN a_sesi_aktif = 1 THEN 1 ELSE 0 END) as active_sessions,
                SUM(CASE WHEN waktu_login >= DATEADD(DAY, -7, GETDATE()) THEN 1 ELSE 0 END) as logins_last_7days,
                SUM(CASE WHEN waktu_login >= DATEADD(DAY, -30, GETDATE()) THEN 1 ELSE 0 END) as logins_last_30days
            FROM logger.log_login
        ")[0];

        // JWT stats
        $jwtStats = DB::select("
            SELECT
                COUNT(*) as total_jwt_logs,
                COUNT(DISTINCT id_pengguna) as unique_users,
                SUM(CASE WHEN waktu_expired > GETDATE() THEN 1 ELSE 0 END) as valid_tokens,
                SUM(CASE WHEN waktu_expired <= GETDATE() THEN 1 ELSE 0 END) as expired_tokens,
                SUM(CASE WHEN waktu_create >= DATEADD(DAY, -7, GETDATE()) THEN 1 ELSE 0 END) as tokens_last_7days
            FROM logger.log_jwt
        ")[0];

        // Access stats
        $accessStats = DB::select("
            SELECT
                COUNT(*) as total_access_logs,
                SUM(CASE WHEN a_berhasil = 1 THEN 1 ELSE 0 END) as successful_access,
                SUM(CASE WHEN a_berhasil = 0 THEN 1 ELSE 0 END) as failed_access,
                SUM(CASE WHEN waktu_akses >= DATEADD(DAY, -7, GETDATE()) THEN 1 ELSE 0 END) as access_last_7days,
                SUM(CASE WHEN waktu_akses >= DATEADD(DAY, -1, GETDATE()) THEN 1 ELSE 0 END) as access_last_24hours
            FROM logger.log_akses_jwt
        ")[0];

        return [
            'login' => $loginStats,
            'jwt' => $jwtStats,
            'access' => $accessStats,
        ];
    }

    /**
     * Get most active users
     *
     * @param int $limit
     * @return array
     */
    public function getMostActiveUsers(int $limit = 10): array
    {
        $sql = "
            SELECT TOP (?)
                p.id_pengguna,
                p.username,
                p.nm_pengguna,
                p.email,
                COUNT(DISTINCT ll.id_log_login) as login_count,
                COUNT(DISTINCT la.id_log_akses_jwt) as access_count,
                MAX(ll.waktu_login) as last_login
            FROM man_akses.pengguna p
            LEFT JOIN logger.log_login ll ON p.id_pengguna = ll.id_pengguna
                AND ll.waktu_login >= DATEADD(DAY, -30, GETDATE())
            LEFT JOIN logger.log_jwt lj ON p.id_pengguna = lj.id_pengguna
            LEFT JOIN logger.log_akses_jwt la ON lj.id_log_jwt = la.id_log_jwt
                AND la.waktu_akses >= DATEADD(DAY, -30, GETDATE())
            GROUP BY p.id_pengguna, p.username, p.nm_pengguna, p.email
            HAVING COUNT(DISTINCT ll.id_log_login) > 0
            ORDER BY login_count DESC, access_count DESC
        ";

        return DB::select($sql, [$limit]);
    }

    /**
     * Get access logs by JWT token
     *
     * @param string $idLogJwt
     * @param int $limit
     * @return array
     */
    public function getAccessLogsByJwt(string $idLogJwt, int $limit = 50): array
    {
        $sql = "
            SELECT TOP (?)
                la.id_log_akses_jwt,
                la.menu_akses,
                la.method,
                la.waktu_akses,
                la.a_berhasil,
                la.ket
            FROM logger.log_akses_jwt la
            WHERE la.id_log_jwt = ?
            ORDER BY la.waktu_akses DESC
        ";

        return DB::select($sql, [$limit, $idLogJwt]);
    }

    /**
     * Log JWT access
     *
     * @param array $data
     * @return bool
     */
    public function logJwtAccess(array $data): bool
    {
        try {
            $sql = "
                INSERT INTO logger.log_akses_jwt (
                    id_log_akses_jwt,
                    id_log_jwt,
                    menu_akses,
                    method,
                    request_list,
                    waktu_akses,
                    a_berhasil,
                    ket,
                    hasil_akses
                ) VALUES (?, ?, ?, ?, ?, GETDATE(), ?, ?, ?)
            ";

            DB::insert($sql, [
                $data['id_log_akses_jwt'],
                $data['id_log_jwt'],
                $data['menu_akses'],
                $data['method'],
                $data['request_list'] ?? null,
                $data['a_berhasil'] ?? 1,
                $data['ket'] ?? null,
                $data['hasil_akses'] ?? null,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('LoggerRepository::logJwtAccess error', [
                'message' => $e->getMessage(),
                'data' => $data
            ]);
            return false;
        }
    }

    /**
     * Log role-based access
     *
     * @param array $data
     * @return bool
     */
    public function logRoleAccess(array $data): bool
    {
        try {
            $sql = "
                INSERT INTO logger.log_akses (
                    id_log_akses,
                    id_role_pengguna,
                    id_log_login,
                    menu_akses,
                    method,
                    request_list,
                    waktu_akses,
                    a_berhasil,
                    ket
                ) VALUES (?, ?, ?, ?, ?, ?, GETDATE(), ?, ?)
            ";

            DB::insert($sql, [
                $data['id_log_akses'],
                $data['id_role_pengguna'],
                $data['id_log_login'] ?? null,
                $data['menu_akses'],
                $data['method'],
                $data['request_list'] ?? null,
                $data['a_berhasil'] ?? 1,
                $data['ket'] ?? null,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('LoggerRepository::logRoleAccess error', [
                'message' => $e->getMessage(),
                'data' => $data
            ]);
            return false;
        }
    }

    /**
     * Get JWT log by token value
     *
     * @param string $tokenValue
     * @return object|null
     */
    public function getJwtLogByToken(string $tokenValue): ?object
    {
        $sql = "
            SELECT TOP 1
                id_log_jwt,
                id_pengguna,
                id_aplikasi,
                token_value,
                waktu_expired
            FROM logger.log_jwt
            WHERE token_value = ?
            ORDER BY waktu_create DESC
        ";

        $result = DB::select($sql, [$tokenValue]);
        return $result[0] ?? null;
    }

    /**
     * Get paginated list of access logs (general, non-JWT)
     *
     * @param array $params [page, limit, search, date_from, date_to, id_aplikasi, a_berhasil, method, sort_by, sort_order]
     * @return array
     */
    public function getAccessLogs(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $dateFrom = $params['date_from'] ?? null;
        $dateTo = $params['date_to'] ?? null;
        $idAplikasi = $params['id_aplikasi'] ?? null;
        $aBerhasil = $params['a_berhasil'] ?? null;
        $method = $params['method'] ?? null;
        $sortBy = $params['sort_by'] ?? 'waktu_akses';
        $sortOrder = $params['sort_order'] ?? 'desc';
        $offset = ($page - 1) * $limit;

        // Validate sort column
        $allowedSortColumns = [
            'waktu_akses' => 'la.waktu_akses',
            'menu_akses' => 'la.menu_akses',
            'method' => 'la.method',
            'username' => 'p.username',
            'nm_pengguna' => 'p.nm_pengguna',
            'nm_aplikasi' => 'a.nm_aplikasi',
        ];
        $sortColumn = $allowedSortColumns[$sortBy] ?? 'la.waktu_akses';
        $sortDirection = strtolower($sortOrder) === 'asc' ? 'ASC' : 'DESC';

        // Base query
        $baseSql = "
            FROM logger.log_akses la
            INNER JOIN man_akses.role_pengguna rp ON la.id_role_pengguna = rp.id_role_pengguna
            INNER JOIN man_akses.pengguna p ON rp.id_pengguna = p.id_pengguna
            INNER JOIN man_akses.peran pr ON rp.id_peran = pr.id_peran
            LEFT JOIN man_akses.aplikasi a ON pr.id_aplikasi = a.id_aplikasi
            LEFT JOIN logger.log_login ll ON la.id_log_login = ll.id_log_login
            WHERE 1=1
        ";

        $params_bind = [];

        // Search filter
        if ($search) {
            $baseSql .= " AND (p.username LIKE ? OR p.nm_pengguna LIKE ? OR la.menu_akses LIKE ? OR a.nm_aplikasi LIKE ?)";
            $searchTerm = "%{$search}%";
            $params_bind[] = $searchTerm;
            $params_bind[] = $searchTerm;
            $params_bind[] = $searchTerm;
            $params_bind[] = $searchTerm;
        }

        // Date range filter
        if ($dateFrom) {
            $baseSql .= " AND la.waktu_akses >= ?";
            $params_bind[] = $dateFrom;
        }
        if ($dateTo) {
            $baseSql .= " AND la.waktu_akses <= ?";
            $params_bind[] = $dateTo;
        }

        // Aplikasi filter
        if ($idAplikasi) {
            $baseSql .= " AND pr.id_aplikasi = ?";
            $params_bind[] = $idAplikasi;
        }

        // Berhasil filter
        if ($aBerhasil !== null) {
            $baseSql .= " AND la.a_berhasil = ?";
            $params_bind[] = $aBerhasil;
        }

        // Method filter
        if ($method) {
            $baseSql .= " AND la.method = ?";
            $params_bind[] = $method;
        }

        // Count query
        $countSql = "SELECT COUNT(*) as total " . $baseSql;
        $totalRecords = DB::select($countSql, $params_bind)[0]->total ?? 0;

        // Data query with pagination
        $dataSql = "
            SELECT
                la.id_log_akses,
                la.id_role_pengguna,
                la.id_log_login,
                la.menu_akses,
                la.method,
                la.request_list,
                la.waktu_akses,
                la.a_berhasil,
                la.ket,
                p.id_pengguna,
                p.username,
                p.nm_pengguna,
                p.email,
                pr.nm_peran,
                a.id_aplikasi,
                a.nm_aplikasi,
                a.app_key,
                ll.ip_address
            " . $baseSql . "
            ORDER BY {$sortColumn} {$sortDirection}
            OFFSET ? ROWS
            FETCH NEXT ? ROWS ONLY
        ";

        $params_bind[] = $offset;
        $params_bind[] = $limit;

        $data = DB::select($dataSql, $params_bind);

        return [
            'data' => $data,
            'total' => $totalRecords,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $totalRecords > 0 ? ceil($totalRecords / $limit) : 0,
        ];
    }

    /**
     * Get role access logs with pagination
     *
     * @param array $params
     * @return array
     */
    public function getRoleAccessLogs(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $dateFrom = $params['date_from'] ?? null;
        $dateTo = $params['date_to'] ?? null;
        $idRolePengguna = $params['id_role_pengguna'] ?? null;
        $aBerhasil = $params['a_berhasil'] ?? null;
        $method = $params['method'] ?? null;
        $sortBy = $params['sort_by'] ?? 'waktu_akses';
        $sortOrder = $params['sort_order'] ?? 'desc';
        $offset = ($page - 1) * $limit;

        // Validate sort column
        $allowedSortColumns = [
            'waktu_akses' => 'la.waktu_akses',
            'menu_akses' => 'la.menu_akses',
            'method' => 'la.method',
            'username' => 'p.username',
            'nm_pengguna' => 'p.nm_pengguna',
        ];
        $sortColumn = $allowedSortColumns[$sortBy] ?? 'la.waktu_akses';
        $sortDirection = strtolower($sortOrder) === 'asc' ? 'ASC' : 'DESC';

        // Base query - Note: peran table does NOT have id_aplikasi column
        $baseSql = "
            FROM logger.log_akses la
            INNER JOIN man_akses.role_pengguna rp ON la.id_role_pengguna = rp.id_role_pengguna
            INNER JOIN man_akses.pengguna p ON rp.id_pengguna = p.id_pengguna
            INNER JOIN man_akses.peran pr ON rp.id_peran = pr.id_peran
            LEFT JOIN logger.log_login ll ON la.id_log_login = ll.id_log_login
            WHERE 1=1
        ";

        $params_bind = [];

        // Search filter
        if ($search) {
            $baseSql .= " AND (p.username LIKE ? OR p.nm_pengguna LIKE ? OR la.menu_akses LIKE ? OR la.ket LIKE ? OR pr.nm_peran LIKE ?)";
            $searchTerm = "%{$search}%";
            $params_bind[] = $searchTerm;
            $params_bind[] = $searchTerm;
            $params_bind[] = $searchTerm;
            $params_bind[] = $searchTerm;
            $params_bind[] = $searchTerm;
        }

        // Date range filter
        if ($dateFrom) {
            $baseSql .= " AND la.waktu_akses >= ?";
            $params_bind[] = $dateFrom;
        }
        if ($dateTo) {
            $baseSql .= " AND la.waktu_akses <= ?";
            $params_bind[] = $dateTo;
        }

        // Role pengguna filter
        if ($idRolePengguna) {
            $baseSql .= " AND la.id_role_pengguna = ?";
            $params_bind[] = $idRolePengguna;
        }

        // Berhasil filter
        if ($aBerhasil !== null) {
            $baseSql .= " AND la.a_berhasil = ?";
            $params_bind[] = $aBerhasil;
        }

        // Method filter
        if ($method) {
            $baseSql .= " AND la.method = ?";
            $params_bind[] = $method;
        }

        // Get total count
        $countSql = "SELECT COUNT(*) as total " . $baseSql;
        $totalResult = DB::selectOne($countSql, $params_bind);
        $totalRecords = $totalResult->total ?? 0;

        // Get paginated data - removed aplikasi fields since peran doesn't have id_aplikasi
        $dataSql = "
            SELECT
                la.id_log_akses,
                la.id_role_pengguna,
                la.id_log_login,
                la.menu_akses,
                la.method,
                la.request_list,
                la.waktu_akses,
                la.a_berhasil,
                la.ket,
                p.id_pengguna,
                p.username,
                p.nm_pengguna,
                p.email,
                rp.id_role_pengguna,
                pr.id_peran,
                pr.nm_peran,
                ll.ip_address,
                ll.browser,
                ll.os
            " . $baseSql . "
            ORDER BY {$sortColumn} {$sortDirection}
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        ";

        $params_bind[] = $offset;
        $params_bind[] = $limit;

        $data = DB::select($dataSql, $params_bind);

        return [
            'data' => $data,
            'total' => $totalRecords,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $totalRecords > 0 ? ceil($totalRecords / $limit) : 0,
        ];
    }

    /**
     * Get access log detail
     * Note: Removed aplikasi JOIN since peran doesn't have id_aplikasi
     *
     * @param string $idLogAkses
     * @return object|null
     */
    public function getAccessLogDetail(string $idLogAkses): ?object
    {
        $sql = "
            SELECT
                la.id_log_akses,
                la.id_role_pengguna,
                la.id_log_login,
                la.menu_akses,
                la.method,
                la.request_list,
                la.waktu_akses,
                la.a_berhasil,
                la.ket,
                p.id_pengguna,
                p.username,
                p.nm_pengguna,
                p.email,
                p.jenis_kelamin,
                p.no_hp,
                p.jabatan,
                pr.id_peran,
                pr.nm_peran,
                ll.ip_address,
                ll.browser,
                ll.os,
                ll.waktu_login
            FROM logger.log_akses la
            INNER JOIN man_akses.role_pengguna rp ON la.id_role_pengguna = rp.id_role_pengguna
            INNER JOIN man_akses.pengguna p ON rp.id_pengguna = p.id_pengguna
            INNER JOIN man_akses.peran pr ON rp.id_peran = pr.id_peran
            LEFT JOIN logger.log_login ll ON la.id_log_login = ll.id_log_login
            WHERE la.id_log_akses = ?
        ";

        $result = DB::select($sql, [$idLogAkses]);
        return $result[0] ?? null;
    }
}
