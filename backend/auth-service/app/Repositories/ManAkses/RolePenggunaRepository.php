<?php

namespace App\Repositories\ManAkses;

use Illuminate\Support\Facades\DB;

/**
 * Role Pengguna Repository
 * Handle all role pengguna related database operations for Manajemen Akses
 */
class RolePenggunaRepository
{
    /**
     * Get paginated list of role pengguna with search and filters
     *
     * @param array $params [page, limit, search, id_pengguna, id_peran, id_organisasi]
     * @return array
     */
    public function getList(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $idPengguna = $params['id_pengguna'] ?? null;
        $idPeran = $params['id_peran'] ?? null;
        $idOrganisasi = $params['id_organisasi'] ?? null;
        $offset = ($page - 1) * $limit;

        $dataSql = "
            SELECT
                CONVERT(VARCHAR(36), rp.id_role_pengguna) as id_role_pengguna,
                CONVERT(VARCHAR(36), rp.id_pengguna) as id_pengguna,
                p.nm_pengguna,
                p.username,
                rp.id_peran,
                pr.nm_peran,
                CONVERT(VARCHAR(36), rp.id_organisasi) as id_organisasi,
                uo.nm_lemb as nm_organisasi,
                rp.sk_penugasan,
                rp.tgl_sk_penugasan,
                rp.approval_peran,
                rp.last_active,
                rp.tgl_create,
                rp.last_update
            FROM man_akses.role_pengguna rp
            LEFT JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
            LEFT JOIN man_akses.peran pr ON pr.id_peran = rp.id_peran
            LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
            WHERE rp.soft_delete = 0
        ";

        $countSql = "
            SELECT COUNT(*) as total
            FROM man_akses.role_pengguna rp
            LEFT JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
            WHERE rp.soft_delete = 0
        ";

        $bindings = [];
        $countBindings = [];

        if (!empty($search)) {
            $searchCondition = " AND (p.nm_pengguna LIKE ? OR p.username LIKE ?)";
            $countSql .= $searchCondition;
            $dataSql .= $searchCondition;
            $searchTerm = "%{$search}%";
            $bindings = array_merge($bindings, [$searchTerm, $searchTerm]);
            $countBindings = array_merge($countBindings, [$searchTerm, $searchTerm]);
        }

        if ($idPengguna) {
            $condition = " AND rp.id_pengguna = ?";
            $countSql .= $condition;
            $dataSql .= $condition;
            $bindings[] = $idPengguna;
            $countBindings[] = $idPengguna;
        }

        if ($idPeran) {
            $condition = " AND rp.id_peran = ?";
            $countSql .= $condition;
            $dataSql .= $condition;
            $bindings[] = $idPeran;
            $countBindings[] = $idPeran;
        }

        if ($idOrganisasi) {
            $condition = " AND rp.id_organisasi = ?";
            $countSql .= $condition;
            $dataSql .= $condition;
            $bindings[] = $idOrganisasi;
            $countBindings[] = $idOrganisasi;
        }

        $countResult = DB::selectOne($countSql, $countBindings);
        $total = $countResult->total ?? 0;

        $dataSql .= " ORDER BY rp.tgl_create DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
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
     * Get role pengguna detail by ID
     *
     * @param string $id
     * @return object|null
     */
    public function getDetail(string $id): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), rp.id_role_pengguna) as id_role_pengguna,
                CONVERT(VARCHAR(36), rp.id_pengguna) as id_pengguna,
                p.nm_pengguna,
                p.username,
                p.email,
                rp.id_peran,
                pr.nm_peran,
                CONVERT(VARCHAR(36), rp.id_organisasi) as id_organisasi,
                uo.nm_lemb as nm_organisasi,
                rp.sk_penugasan,
                rp.tgl_sk_penugasan,
                rp.approval_peran,
                rp.last_active,
                rp.tgl_create,
                rp.last_update,
                rp.last_sync
            FROM man_akses.role_pengguna rp
            LEFT JOIN man_akses.pengguna p ON p.id_pengguna = rp.id_pengguna
            LEFT JOIN man_akses.peran pr ON pr.id_peran = rp.id_peran
            LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
            WHERE rp.id_role_pengguna = ? AND rp.soft_delete = 0
        ";

        return DB::selectOne($sql, [$id]);
    }

    /**
     * Get roles by pengguna ID
     *
     * @param string $idPengguna
     * @return array
     */
    public function getByPengguna(string $idPengguna): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), rp.id_role_pengguna) as id_role_pengguna,
                rp.id_peran,
                pr.nm_peran,
                CONVERT(VARCHAR(36), rp.id_organisasi) as id_organisasi,
                uo.nm_lemb as nm_organisasi,
                rp.approval_peran,
                rp.last_active
            FROM man_akses.role_pengguna rp
            LEFT JOIN man_akses.peran pr ON pr.id_peran = rp.id_peran
            LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
            WHERE rp.id_pengguna = ? AND rp.soft_delete = 0
            ORDER BY rp.last_active DESC
        ";

        return DB::select($sql, [$idPengguna]);
    }

    /**
     * Create new role pengguna
     *
     * @param array $data
     * @return string ID of created role pengguna
     */
    public function create(array $data): string
    {
        $id = $this->generateUuid();
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            INSERT INTO man_akses.role_pengguna (
                id_role_pengguna, id_pengguna, id_organisasi, id_peran,
                sk_penugasan, tgl_sk_penugasan, approval_peran,
                last_active, tgl_create, last_update, soft_delete, last_sync, id_updater
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ";

        DB::insert($sql, [
            $id,
            $data['id_pengguna'],
            $data['id_organisasi'] ?? null,
            $data['id_peran'],
            $data['sk_penugasan'] ?? null,
            $data['tgl_sk_penugasan'] ?? null,
            $data['approval_peran'] ?? 1,
            $now,
            $now,
            $now,
            0,
            $now,
            $data['id_updater'] ?? null,
        ]);

        return $id;
    }

    /**
     * Update existing role pengguna
     *
     * @param string $id
     * @param array $data
     * @return bool
     */
    public function update(string $id, array $data): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            UPDATE man_akses.role_pengguna SET
                id_organisasi = ?,
                id_peran = ?,
                sk_penugasan = ?,
                tgl_sk_penugasan = ?,
                approval_peran = ?,
                last_update = ?,
                last_sync = ?,
                id_updater = ?
            WHERE id_role_pengguna = ?
        ";

        $affected = DB::update($sql, [
            $data['id_organisasi'] ?? null,
            $data['id_peran'],
            $data['sk_penugasan'] ?? null,
            $data['tgl_sk_penugasan'] ?? null,
            $data['approval_peran'] ?? 1,
            $now,
            $now,
            $data['id_updater'] ?? null,
            $id,
        ]);

        return $affected > 0;
    }

    /**
     * Delete role pengguna (soft delete)
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            UPDATE man_akses.role_pengguna SET
                soft_delete = 1,
                last_update = ?,
                last_sync = ?
            WHERE id_role_pengguna = ?
        ";

        $affected = DB::update($sql, [$now, $now, $id]);

        return $affected > 0;
    }

    /**
     * Check if role already exists for pengguna
     *
     * @param string $idPengguna
     * @param int $idPeran
     * @param string|null $idOrganisasi
     * @param string|null $excludeId
     * @return bool
     */
    public function roleExists(string $idPengguna, int $idPeran, ?string $idOrganisasi = null, ?string $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) as count FROM man_akses.role_pengguna WHERE id_pengguna = ? AND id_peran = ? AND soft_delete = 0";
        $bindings = [$idPengguna, $idPeran];

        if ($idOrganisasi) {
            $sql .= " AND id_organisasi = ?";
            $bindings[] = $idOrganisasi;
        }

        if ($excludeId) {
            $sql .= " AND id_role_pengguna != ?";
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
