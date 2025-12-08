<?php

namespace App\Repositories\ManAkses;

use Illuminate\Support\Facades\DB;

/**
 * Unit Organisasi Repository
 * Handle all unit organisasi related database operations for Manajemen Akses
 */
class UnitOrganisasiRepository
{
    /**
     * Get paginated list of unit organisasi with search and filters
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
        $offset = ($page - 1) * $limit;

        $dataSql = "
            SELECT
                CONVERT(VARCHAR(36), uo.id_organisasi) as id_organisasi,
                uo.nm_lemb,
                uo.jln,
                uo.no_tel,
                uo.email,
                uo.website,
                uo.level_organisasi,
                uo.a_aktif,
                CONVERT(VARCHAR(36), uo.id_induk_organisasi) as id_induk_organisasi,
                induk.nm_lemb as nm_induk_organisasi,
                uo.tgl_create,
                uo.last_update
            FROM man_akses.unit_organisasi uo
            LEFT JOIN man_akses.unit_organisasi induk ON induk.id_organisasi = uo.id_induk_organisasi
            WHERE uo.soft_delete = 0
        ";

        $countSql = "
            SELECT COUNT(*) as total
            FROM man_akses.unit_organisasi uo
            WHERE uo.soft_delete = 0
        ";

        $bindings = [];
        $countBindings = [];

        if (!empty($search)) {
            $searchCondition = " AND (
                uo.nm_lemb LIKE ?
                OR uo.jln LIKE ?
                OR uo.email LIKE ?
            )";
            $countSql .= $searchCondition;
            $dataSql .= $searchCondition;
            $searchTerm = "%{$search}%";
            $bindings = array_merge($bindings, [$searchTerm, $searchTerm, $searchTerm]);
            $countBindings = array_merge($countBindings, [$searchTerm, $searchTerm, $searchTerm]);
        }

        if ($status !== null) {
            $statusCondition = " AND uo.a_aktif = ?";
            $countSql .= $statusCondition;
            $dataSql .= $statusCondition;
            $bindings[] = $status === 'aktif' ? 1 : 0;
            $countBindings[] = $status === 'aktif' ? 1 : 0;
        }

        $countResult = DB::selectOne($countSql, $countBindings);
        $total = $countResult->total ?? 0;

        $dataSql .= " ORDER BY uo.nm_lemb ASC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
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
     * Get unit organisasi detail by ID
     *
     * @param string $id
     * @return object|null
     */
    public function getDetail(string $id): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), uo.id_organisasi) as id_organisasi,
                uo.nm_lemb,
                uo.jln,
                uo.rt,
                uo.rw,
                uo.nm_dsn,
                uo.ds_kel,
                uo.kode_pos,
                uo.lintang,
                uo.bujur,
                uo.no_tel,
                uo.no_fax,
                uo.email,
                uo.website,
                uo.kd_kl,
                uo.kd_satker,
                uo.level_organisasi,
                CONVERT(VARCHAR(36), uo.id_lembaga_asal) as id_lembaga_asal,
                uo.a_aktif,
                uo.id_jns_lemb,
                CONVERT(VARCHAR(36), uo.id_induk_organisasi) as id_induk_organisasi,
                induk.nm_lemb as nm_induk_organisasi,
                uo.id_wil,
                uo.tgl_create,
                uo.last_update,
                uo.last_sync
            FROM man_akses.unit_organisasi uo
            LEFT JOIN man_akses.unit_organisasi induk ON induk.id_organisasi = uo.id_induk_organisasi
            WHERE uo.id_organisasi = ? AND uo.soft_delete = 0
        ";

        return DB::selectOne($sql, [$id]);
    }

    /**
     * Get all unit organisasi for dropdown
     *
     * @return array
     */
    public function getAll(): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), id_organisasi) as id_organisasi,
                nm_lemb,
                level_organisasi,
                a_aktif
            FROM man_akses.unit_organisasi
            WHERE soft_delete = 0 AND a_aktif = 1
            ORDER BY nm_lemb ASC
        ";

        return DB::select($sql);
    }

    /**
     * Get statistics for unit organisasi
     *
     * @return object
     */
    public function getStats(): object
    {
        $sql = "
            SELECT
                COUNT(*) as total_unit,
                SUM(CASE WHEN a_aktif = 1 THEN 1 ELSE 0 END) as total_aktif,
                SUM(CASE WHEN a_aktif = 0 THEN 1 ELSE 0 END) as total_nonaktif,
                SUM(CASE WHEN level_organisasi = 1 THEN 1 ELSE 0 END) as total_level_1,
                SUM(CASE WHEN level_organisasi = 2 THEN 1 ELSE 0 END) as total_level_2,
                SUM(CASE WHEN level_organisasi = 3 THEN 1 ELSE 0 END) as total_level_3
            FROM man_akses.unit_organisasi
            WHERE soft_delete = 0
        ";

        return DB::selectOne($sql);
    }

    /**
     * Create new unit organisasi
     *
     * @param array $data
     * @return string ID of created unit organisasi
     */
    public function create(array $data): string
    {
        $id = $this->generateUuid();
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            INSERT INTO man_akses.unit_organisasi (
                id_organisasi, nm_lemb, jln, rt, rw, nm_dsn, ds_kel,
                kode_pos, lintang, bujur, no_tel, no_fax, email, website,
                kd_kl, kd_satker, level_organisasi, id_lembaga_asal, a_aktif,
                id_jns_lemb, id_induk_organisasi, id_wil,
                tgl_create, last_update, soft_delete, last_sync
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ";

        DB::insert($sql, [
            $id,
            $data['nm_lemb'],
            $data['jln'] ?? null,
            $data['rt'] ?? null,
            $data['rw'] ?? null,
            $data['nm_dsn'] ?? null,
            $data['ds_kel'] ?? null,
            $data['kode_pos'] ?? null,
            $data['lintang'] ?? null,
            $data['bujur'] ?? null,
            $data['no_tel'] ?? null,
            $data['no_fax'] ?? null,
            $data['email'] ?? null,
            $data['website'] ?? null,
            $data['kd_kl'] ?? null,
            $data['kd_satker'] ?? null,
            $data['level_organisasi'] ?? null,
            $data['id_lembaga_asal'] ?? null,
            $data['a_aktif'] ?? 1,
            $data['id_jns_lemb'] ?? null,
            $data['id_induk_organisasi'] ?? null,
            $data['id_wil'] ?? null,
            $now,
            $now,
            0,
            $now,
        ]);

        return $id;
    }

    /**
     * Update existing unit organisasi
     *
     * @param string $id
     * @param array $data
     * @return bool
     */
    public function update(string $id, array $data): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            UPDATE man_akses.unit_organisasi SET
                nm_lemb = ?,
                jln = ?,
                rt = ?,
                rw = ?,
                nm_dsn = ?,
                ds_kel = ?,
                kode_pos = ?,
                lintang = ?,
                bujur = ?,
                no_tel = ?,
                no_fax = ?,
                email = ?,
                website = ?,
                kd_kl = ?,
                kd_satker = ?,
                level_organisasi = ?,
                id_lembaga_asal = ?,
                a_aktif = ?,
                id_jns_lemb = ?,
                id_induk_organisasi = ?,
                id_wil = ?,
                last_update = ?,
                last_sync = ?
            WHERE id_organisasi = ?
        ";

        $affected = DB::update($sql, [
            $data['nm_lemb'],
            $data['jln'] ?? null,
            $data['rt'] ?? null,
            $data['rw'] ?? null,
            $data['nm_dsn'] ?? null,
            $data['ds_kel'] ?? null,
            $data['kode_pos'] ?? null,
            $data['lintang'] ?? null,
            $data['bujur'] ?? null,
            $data['no_tel'] ?? null,
            $data['no_fax'] ?? null,
            $data['email'] ?? null,
            $data['website'] ?? null,
            $data['kd_kl'] ?? null,
            $data['kd_satker'] ?? null,
            $data['level_organisasi'] ?? null,
            $data['id_lembaga_asal'] ?? null,
            $data['a_aktif'] ?? 1,
            $data['id_jns_lemb'] ?? null,
            $data['id_induk_organisasi'] ?? null,
            $data['id_wil'] ?? null,
            $now,
            $now,
            $id,
        ]);

        return $affected > 0;
    }

    /**
     * Delete unit organisasi (soft delete)
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            UPDATE man_akses.unit_organisasi SET
                soft_delete = 1,
                last_update = ?,
                last_sync = ?
            WHERE id_organisasi = ?
        ";

        $affected = DB::update($sql, [$now, $now, $id]);

        return $affected > 0;
    }

    /**
     * Check if unit organisasi name exists
     *
     * @param string $name
     * @param string|null $excludeId
     * @return bool
     */
    public function nameExists(string $name, ?string $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) as count FROM man_akses.unit_organisasi WHERE nm_lemb = ? AND soft_delete = 0";
        $bindings = [$name];

        if ($excludeId) {
            $sql .= " AND id_organisasi != ?";
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
