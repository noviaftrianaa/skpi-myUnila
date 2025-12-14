<?php

namespace App\Repositories\ManAkses;

use Illuminate\Support\Facades\DB;

/**
 * Peran Repository
 * Handle all peran (role) related database operations for Manajemen Akses
 */
class PeranRepository
{
    /**
     * Get paginated list of peran with search and filters
     *
     * @param array $params [page, limit, search, status]
     * @return array
     */
    public function getList(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $status = $params['status'] ?? null;
        $sortBy = $params['sort_by'] ?? 'nm_peran'; // column to sort by
        $sortOrder = $params['sort_order'] ?? 'asc'; // 'asc' or 'desc'
        $offset = ($page - 1) * $limit;

        // Validate sort column to prevent SQL injection
        $allowedSortColumns = [
            'id_peran' => 'p.id_peran',
            'nm_peran' => 'p.nm_peran',
            'jumlah_pengguna' => 'jumlah_pengguna',
            'tgl_create' => 'p.tgl_create',
            'last_update' => 'p.last_update',
        ];
        $sortColumn = $allowedSortColumns[$sortBy] ?? 'p.nm_peran';
        $sortDirection = strtolower($sortOrder) === 'desc' ? 'DESC' : 'ASC';

        $dataSql = "
            SELECT
                p.id_peran,
                p.nm_peran,
                p.a_perlu_sk,
                p.tgl_create,
                p.last_update,
                p.expired_date,
                (SELECT COUNT(*) FROM man_akses.role_pengguna rp WHERE rp.id_peran = p.id_peran AND rp.soft_delete = 0) as jumlah_pengguna
            FROM man_akses.peran p
            WHERE (p.expired_date IS NULL OR p.expired_date > GETDATE())
        ";

        $countSql = "
            SELECT COUNT(*) as total
            FROM man_akses.peran p
            WHERE (p.expired_date IS NULL OR p.expired_date > GETDATE())
        ";

        $bindings = [];
        $countBindings = [];

        if (!empty($search)) {
            $searchCondition = " AND p.nm_peran LIKE ?";
            $countSql .= $searchCondition;
            $dataSql .= $searchCondition;
            $searchTerm = "%{$search}%";
            $bindings[] = $searchTerm;
            $countBindings[] = $searchTerm;
        }

        // Status filter is already applied in base query (only showing active/non-expired)
        // This filter allows showing ALL (including expired) or only specific status
        if ($status === 'semua') {
            // Remove default filter to show all including expired
            $dataSql = str_replace(
                "WHERE (p.expired_date IS NULL OR p.expired_date > GETDATE())",
                "WHERE 1=1",
                $dataSql
            );
            $countSql = str_replace(
                "WHERE (p.expired_date IS NULL OR p.expired_date > GETDATE())",
                "WHERE 1=1",
                $countSql
            );
        } elseif ($status === 'nonaktif') {
            // Show only expired
            $dataSql = str_replace(
                "WHERE (p.expired_date IS NULL OR p.expired_date > GETDATE())",
                "WHERE p.expired_date IS NOT NULL AND p.expired_date <= GETDATE()",
                $dataSql
            );
            $countSql = str_replace(
                "WHERE (p.expired_date IS NULL OR p.expired_date > GETDATE())",
                "WHERE p.expired_date IS NOT NULL AND p.expired_date <= GETDATE()",
                $countSql
            );
        }
        // Default: status=null or status='aktif' keeps the base filter (only active)

        $countResult = DB::selectOne($countSql, $countBindings);
        $total = $countResult->total ?? 0;

        $dataSql .= " ORDER BY {$sortColumn} {$sortDirection} OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
        $bindings[] = $offset;
        $bindings[] = $limit;

        $data = DB::select($dataSql, $bindings);

        $now = now();
        foreach ($data as $item) {
            $isExpired = $item->expired_date && strtotime($item->expired_date) <= $now->timestamp;
            $item->status = $isExpired ? 'Tidak Aktif' : 'Aktif';
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
     * Get peran detail by ID
     *
     * @param int $id
     * @return object|null
     */
    public function getDetail(int $id): ?object
    {
        $sql = "
            SELECT
                p.id_peran,
                p.nm_peran,
                p.a_perlu_sk,
                p.tgl_create,
                p.last_update,
                p.expired_date,
                p.last_sync,
                (SELECT COUNT(*) FROM man_akses.role_pengguna rp WHERE rp.id_peran = p.id_peran AND rp.soft_delete = 0) as jumlah_pengguna
            FROM man_akses.peran p
            WHERE p.id_peran = ?
        ";

        $peran = DB::selectOne($sql, [$id]);

        if ($peran) {
            $now = now();
            $isExpired = $peran->expired_date && strtotime($peran->expired_date) <= $now->timestamp;
            $peran->status = $isExpired ? 'Tidak Aktif' : 'Aktif';
        }

        return $peran;
    }

    /**
     * Get all peran for dropdown
     *
     * @return array
     */
    public function getAll(): array
    {
        $sql = "
            SELECT
                id_peran,
                nm_peran,
                a_perlu_sk
            FROM man_akses.peran
            WHERE expired_date IS NULL OR expired_date > GETDATE()
            ORDER BY nm_peran ASC
        ";

        return DB::select($sql);
    }

    /**
     * Get statistics for peran
     *
     * @return object
     */
    public function getStats(): object
    {
        $sql = "
            SELECT
                COUNT(*) as total_peran,
                SUM(CASE WHEN expired_date IS NULL OR expired_date > GETDATE() THEN 1 ELSE 0 END) as total_aktif,
                SUM(CASE WHEN expired_date IS NOT NULL AND expired_date <= GETDATE() THEN 1 ELSE 0 END) as total_nonaktif,
                SUM(CASE WHEN a_perlu_sk = 1 THEN 1 ELSE 0 END) as total_dengan_sk,
                SUM(CASE WHEN a_perlu_sk = 0 OR a_perlu_sk IS NULL THEN 1 ELSE 0 END) as total_tanpa_sk,
                (SELECT COUNT(*) FROM man_akses.role_pengguna WHERE soft_delete = 0) as total_pengguna_assigned
            FROM man_akses.peran
        ";

        return DB::selectOne($sql);
    }

    /**
     * Create new peran
     *
     * @param array $data
     * @return int ID of created peran
     */
    public function create(array $data): int
    {
        $now = now()->format('Y-m-d H:i:s');

        // Get next ID
        $maxId = DB::selectOne("SELECT MAX(id_peran) as max_id FROM man_akses.peran");
        $newId = ($maxId->max_id ?? 0) + 1;

        $sql = "
            INSERT INTO man_akses.peran (
                id_peran, nm_peran, a_perlu_sk, tgl_create, last_update, last_sync
            ) VALUES (?, ?, ?, ?, ?, ?)
        ";

        DB::insert($sql, [
            $newId,
            $data['nm_peran'],
            $data['a_perlu_sk'] ?? 0,
            $now,
            $now,
            $now,
        ]);

        return $newId;
    }

    /**
     * Update existing peran
     *
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update(int $id, array $data): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            UPDATE man_akses.peran SET
                nm_peran = ?,
                a_perlu_sk = ?,
                last_update = ?,
                last_sync = ?
            WHERE id_peran = ?
        ";

        $affected = DB::update($sql, [
            $data['nm_peran'],
            $data['a_perlu_sk'] ?? 0,
            $now,
            $now,
            $id,
        ]);

        return $affected > 0;
    }

    /**
     * Delete peran (soft delete via expired_date)
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            UPDATE man_akses.peran SET
                expired_date = ?,
                last_update = ?,
                last_sync = ?
            WHERE id_peran = ?
        ";

        $affected = DB::update($sql, [$now, $now, $now, $id]);

        return $affected > 0;
    }

    /**
     * Check if peran name exists
     *
     * @param string $name
     * @param int|null $excludeId
     * @return bool
     */
    public function nameExists(string $name, ?int $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) as count FROM man_akses.peran WHERE nm_peran = ?";
        $bindings = [$name];

        if ($excludeId) {
            $sql .= " AND id_peran != ?";
            $bindings[] = $excludeId;
        }

        $result = DB::selectOne($sql, $bindings);
        return ($result->count ?? 0) > 0;
    }
}
