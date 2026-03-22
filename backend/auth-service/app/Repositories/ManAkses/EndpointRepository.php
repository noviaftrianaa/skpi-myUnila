<?php

namespace App\Repositories\ManAkses;

use Illuminate\Support\Facades\DB;

/**
 * Endpoint Repository
 * Handle all WS endpoint related database operations for Manajemen Akses
 */
class EndpointRepository
{
    /**
     * Get paginated list of endpoints with search and filters
     *
     * @param array $params [page, limit, search, nm_group, nm_method, a_active]
     * @return array
     */
    public function getList(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $nmGroup = $params['nm_group'] ?? null;
        $nmMethod = $params['nm_method'] ?? null;
        $aActive = $params['a_active'] ?? null;
        $idAplikasi = $params['id_aplikasi'] ?? null;
        $offset = ($page - 1) * $limit;

        $dataSql = "
            SELECT
                CONVERT(VARCHAR(36), e.id_ws_endpoint) as id_ws_endpoint,
                CONVERT(VARCHAR(36), e.id_aplikasi) as id_aplikasi,
                e.nm_group as nm_group,
                e.nm_method,
                e.nm_endpoint,
                e.path_url,
                e.a_active,
                e.created_at,
                e.updated_at
            FROM man_akses.ws_endpoint e
            WHERE e.soft_delete = 0
        ";

        $countSql = "
            SELECT COUNT(*) as total
            FROM man_akses.ws_endpoint e
            WHERE e.soft_delete = 0
        ";

        $bindings = [];
        $countBindings = [];

        if (!empty($search)) {
            $searchCondition = " AND (
                e.nm_endpoint LIKE ?
                OR e.path_url LIKE ?
                OR e.nm_group LIKE ?
            )";
            $countSql .= $searchCondition;
            $dataSql .= $searchCondition;
            $searchTerm = "%{$search}%";
            $bindings = array_merge($bindings, [$searchTerm, $searchTerm, $searchTerm]);
            $countBindings = array_merge($countBindings, [$searchTerm, $searchTerm, $searchTerm]);
        }

        if ($nmGroup) {
            $condition = " AND e.nm_group = ?";
            $countSql .= $condition;
            $dataSql .= $condition;
            $bindings[] = $nmGroup;
            $countBindings[] = $nmGroup;
        }

        if ($nmMethod) {
            $condition = " AND e.nm_method = ?";
            $countSql .= $condition;
            $dataSql .= $condition;
            $bindings[] = $nmMethod;
            $countBindings[] = $nmMethod;
        }

        if ($aActive !== null) {
            $condition = " AND e.a_active = ?";
            $countSql .= $condition;
            $dataSql .= $condition;
            $bindings[] = $aActive ? 1 : 0;
            $countBindings[] = $aActive ? 1 : 0;
        }

        if ($idAplikasi) {
            $condition = " AND e.id_aplikasi = ?";
            $countSql .= $condition;
            $dataSql .= $condition;
            $bindings[] = $idAplikasi;
            $countBindings[] = $idAplikasi;
        }

        $countResult = DB::selectOne($countSql, $countBindings);
        $total = $countResult->total ?? 0;

        $dataSql .= " ORDER BY e.nm_group ASC, e.nm_endpoint ASC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
        $bindings[] = $offset;
        $bindings[] = $limit;

        $data = DB::select($dataSql, $bindings);

        return [
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $total > 0 ? ceil($total / $limit) : 0
        ];
    }

    /**
     * Get endpoint detail by ID
     *
     * @param string $id
     * @return object|null
     */
    public function getDetail(string $id): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), e.id_ws_endpoint) as id_ws_endpoint,
                e.nm_group as nm_group,
                e.nm_method,
                e.nm_endpoint,
                e.path_url,
                e.a_active,
                e.created_at,
                e.updated_at,
                e.last_sync
            FROM man_akses.ws_endpoint e
            WHERE e.id_ws_endpoint = ? AND e.soft_delete = 0
        ";

        return DB::selectOne($sql, [$id]);
    }

    /**
     * Get all groups for dropdown
     *
     * @return array
     */
    public function getGroups(): array
    {
        $sql = "
            SELECT DISTINCT nm_group as nm_group
            FROM man_akses.ws_endpoint
            WHERE soft_delete = 0 AND nm_group IS NOT NULL
            ORDER BY nm_group ASC
        ";

        return DB::select($sql);
    }

    /**
     * Get distinct applications that have endpoints registered
     *
     * @return array
     */
    public function getAppsWithEndpoints(): array
    {
        $sql = "
            SELECT DISTINCT
                CONVERT(VARCHAR(36), e.id_aplikasi) as id_aplikasi,
                a.nm_aplikasi,
                COUNT(*) as total_endpoint
            FROM man_akses.ws_endpoint e
            JOIN man_akses.aplikasi a ON a.id_aplikasi = e.id_aplikasi
            WHERE e.soft_delete = 0
            GROUP BY e.id_aplikasi, a.nm_aplikasi
            ORDER BY a.nm_aplikasi ASC
        ";

        return DB::select($sql);
    }

    /**
     * Get statistics for endpoints
     *
     * @return object
     */
    public function getStats(): object
    {
        $sql = "
            SELECT
                COUNT(*) as total_endpoint,
                SUM(CASE WHEN a_active = 1 THEN 1 ELSE 0 END) as total_aktif,
                SUM(CASE WHEN a_active = 0 THEN 1 ELSE 0 END) as total_nonaktif,
                COUNT(DISTINCT nm_group) as total_group,
                SUM(CASE WHEN nm_method = 'GET' THEN 1 ELSE 0 END) as total_get,
                SUM(CASE WHEN nm_method = 'POST' THEN 1 ELSE 0 END) as total_post,
                SUM(CASE WHEN nm_method = 'PUT' THEN 1 ELSE 0 END) as total_put,
                SUM(CASE WHEN nm_method = 'DELETE' THEN 1 ELSE 0 END) as total_delete
            FROM man_akses.ws_endpoint
            WHERE soft_delete = 0
        ";

        return DB::selectOne($sql);
    }

    /**
     * Create new endpoint
     *
     * @param array $data
     * @return string ID of created endpoint
     */
    public function create(array $data): string
    {
        $id = $this->generateUuid();
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            INSERT INTO man_akses.ws_endpoint (
                id_ws_endpoint, nm_group, nm_method, nm_endpoint, path_url,
                a_active, created_at, updated_at, last_sync, soft_delete
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ";

        DB::insert($sql, [
            $id,
            $data['nm_group'] ?? null,
            $data['nm_method'] ?? 'GET',
            $data['nm_endpoint'],
            $data['path_url'],
            $data['a_active'] ?? 1,
            $now,
            $now,
            $now,
            0,
        ]);

        return $id;
    }

    /**
     * Update existing endpoint
     *
     * @param string $id
     * @param array $data
     * @return bool
     */
    public function update(string $id, array $data): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            UPDATE man_akses.ws_endpoint SET
                nm_group = ?,
                nm_method = ?,
                nm_endpoint = ?,
                path_url = ?,
                a_active = ?,
                updated_at = ?,
                last_sync = ?
            WHERE id_ws_endpoint = ?
        ";

        $affected = DB::update($sql, [
            $data['nm_group'] ?? null,
            $data['nm_method'] ?? 'GET',
            $data['nm_endpoint'],
            $data['path_url'],
            $data['a_active'] ?? 1,
            $now,
            $now,
            $id,
        ]);

        return $affected > 0;
    }

    /**
     * Delete endpoint (soft delete)
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            UPDATE man_akses.ws_endpoint SET
                soft_delete = 1,
                updated_at = ?,
                last_sync = ?
            WHERE id_ws_endpoint = ?
        ";

        $affected = DB::update($sql, [$now, $now, $id]);

        return $affected > 0;
    }

    /**
     * Check if endpoint path exists
     *
     * @param string $pathUrl
     * @param string $method
     * @param string|null $excludeId
     * @return bool
     */
    public function pathExists(string $pathUrl, string $method, ?string $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) as count FROM man_akses.ws_endpoint WHERE path_url = ? AND nm_method = ? AND soft_delete = 0";
        $bindings = [$pathUrl, $method];

        if ($excludeId) {
            $sql .= " AND id_ws_endpoint != ?";
            $bindings[] = $excludeId;
        }

        $result = DB::selectOne($sql, $bindings);
        return ($result->count ?? 0) > 0;
    }

    /**
     * Generate UUID for new record
     */
    private function generateUuid(): string
    {
        return strtoupper(sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        ));
    }
}
