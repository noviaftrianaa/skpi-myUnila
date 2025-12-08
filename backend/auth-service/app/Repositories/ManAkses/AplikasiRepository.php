<?php

namespace App\Repositories\ManAkses;

use Illuminate\Support\Facades\DB;

/**
 * Aplikasi Repository
 * Handle all aplikasi (application) related database operations for Manajemen Akses
 */
class AplikasiRepository
{
    /**
     * Get paginated list of aplikasi with search and filters
     *
     * @param array $params [page, limit, search, status, jenis]
     * @return array
     */
    public function getList(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $status = $params['status'] ?? null; // 'aktif', 'nonaktif', null for all
        $jenis = $params['jenis'] ?? null; // 'internal', 'external', null for all
        $offset = ($page - 1) * $limit;

        // Base query for data from SQL Server
        $dataSql = "
            SELECT
                CONVERT(VARCHAR(36), a.id_aplikasi) as id_aplikasi,
                a.nm_aplikasi,
                a.ket_aplikasi,
                a.url,
                a.port,
                a.teknologi,
                a.endpoint_ws,
                a.a_generate_menu,
                a.a_integrasi_cas,
                a.a_sistem_internal_pt,
                a.tgl_create,
                a.last_update,
                a.expired_date,
                CONVERT(VARCHAR(36), a.id_organisasi) as id_organisasi,
                uo.nm_lemb as nm_organisasi,
                (SELECT COUNT(*) FROM man_akses.akses_table_aplikasi ata WHERE ata.id_aplikasi = a.id_aplikasi) as jumlah_table,
                (SELECT COUNT(*) FROM man_akses.pj_aplikasi pj WHERE pj.id_aplikasi = a.id_aplikasi) as jumlah_pj
            FROM man_akses.aplikasi a
            LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = a.id_organisasi
            WHERE 1=1
        ";

        // Base query for count
        $countSql = "
            SELECT COUNT(*) as total
            FROM man_akses.aplikasi a
            WHERE 1=1
        ";

        $bindings = [];
        $countBindings = [];

        // Add search filter
        if (!empty($search)) {
            $searchCondition = " AND (
                a.nm_aplikasi LIKE ?
                OR a.ket_aplikasi LIKE ?
                OR a.url LIKE ?
                OR a.teknologi LIKE ?
            )";
            $countSql .= $searchCondition;
            $dataSql .= $searchCondition;
            $searchTerm = "%{$search}%";
            $bindings[] = $searchTerm;
            $bindings[] = $searchTerm;
            $bindings[] = $searchTerm;
            $bindings[] = $searchTerm;
            $countBindings[] = $searchTerm;
            $countBindings[] = $searchTerm;
            $countBindings[] = $searchTerm;
            $countBindings[] = $searchTerm;
        }

        // Add status filter (based on expired_date)
        if ($status !== null) {
            if ($status === 'aktif') {
                $statusCondition = " AND (a.expired_date IS NULL OR a.expired_date > GETDATE())";
            } else {
                $statusCondition = " AND a.expired_date IS NOT NULL AND a.expired_date <= GETDATE()";
            }
            $countSql .= $statusCondition;
            $dataSql .= $statusCondition;
        }

        // Add jenis filter (internal/external based on a_sistem_internal_pt)
        if ($jenis !== null) {
            if ($jenis === 'internal') {
                $jenisCondition = " AND a.a_sistem_internal_pt = 1";
            } else {
                $jenisCondition = " AND a.a_sistem_internal_pt = 0";
            }
            $countSql .= $jenisCondition;
            $dataSql .= $jenisCondition;
        }

        // Get total count
        $countResult = DB::selectOne($countSql, $countBindings);
        $total = $countResult->total ?? 0;

        // Add ordering and pagination
        $dataSql .= " ORDER BY a.nm_aplikasi ASC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
        $bindings[] = $offset;
        $bindings[] = $limit;

        // Get data from SQL Server
        $data = DB::select($dataSql, $bindings);

        // Add computed status field
        $now = now();
        foreach ($data as $item) {
            $isExpired = $item->expired_date && strtotime($item->expired_date) <= $now->timestamp;
            $item->status = $isExpired ? 'Tidak Aktif' : 'Aktif';
            $item->jenis = $item->a_sistem_internal_pt ? 'Internal' : 'External';
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
     * Get aplikasi detail by ID
     *
     * @param string $id
     * @return object|null
     */
    public function getDetail(string $id): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), a.id_aplikasi) as id_aplikasi,
                CONVERT(VARCHAR(36), a.id_blob) as id_blob,
                CONVERT(VARCHAR(36), a.id_organisasi) as id_organisasi,
                a.nm_aplikasi,
                a.ket_aplikasi,
                a.token_aplikasi,
                a.app_key,
                a.url,
                a.port,
                a.teknologi,
                a.endpoint_ws,
                a.a_generate_menu,
                a.a_integrasi_cas,
                a.a_sistem_internal_pt,
                a.tgl_create,
                a.last_update,
                a.expired_date,
                a.last_sync,
                uo.nm_organisasi
            FROM man_akses.aplikasi a
            LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = a.id_organisasi
            WHERE a.id_aplikasi = ?
        ";

        $aplikasi = DB::selectOne($sql, [$id]);

        if ($aplikasi) {
            $now = now();
            $isExpired = $aplikasi->expired_date && strtotime($aplikasi->expired_date) <= $now->timestamp;
            $aplikasi->status = $isExpired ? 'Tidak Aktif' : 'Aktif';
            $aplikasi->jenis = $aplikasi->a_sistem_internal_pt ? 'Internal' : 'External';

            // Get tables for this application
            $aplikasi->tables = $this->getTables($id);

            // Get PJs (project owners) for this application
            $aplikasi->pj_list = $this->getPjList($id);
        }

        return $aplikasi;
    }

    /**
     * Get tables for an application
     *
     * @param string $idAplikasi
     * @return array
     */
    public function getTables(string $idAplikasi): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), ata.id_akses_table_app) as id_akses_table_app,
                CONVERT(VARCHAR(36), ta.id_table_app) as id_table_app,
                ta.nm_tbl as nm_table,
                ta.tabel_alias,
                ta.skema_tbl,
                ata.a_boleh_get,
                ata.a_boleh_insert,
                ata.a_boleh_update,
                ata.a_boleh_delete,
                ata.tgl_create,
                ata.last_update
            FROM man_akses.akses_table_aplikasi ata
            INNER JOIN man_akses.table_aplikasi ta ON ta.id_table_app = ata.id_table_app
            WHERE ata.id_aplikasi = ?
            ORDER BY ta.nm_tbl ASC
        ";

        return DB::select($sql, [$idAplikasi]);
    }

    /**
     * Get PJ list for an application
     *
     * @param string $idAplikasi
     * @return array
     */
    public function getPjList(string $idAplikasi): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), pj.id_pj_aplikasi) as id_pj_aplikasi,
                CONVERT(VARCHAR(36), pj.id_pengguna) as id_pengguna,
                p.nm_pengguna,
                p.username,
                p.email,
                pj.tgl_create,
                pj.last_update
            FROM man_akses.pj_aplikasi pj
            LEFT JOIN man_akses.pengguna p ON p.id_pengguna = pj.id_pengguna
            WHERE pj.id_aplikasi = ?
            ORDER BY p.nm_pengguna ASC
        ";

        return DB::select($sql, [$idAplikasi]);
    }

    /**
     * Get statistics for aplikasi
     *
     * @return object
     */
    public function getStats(): object
    {
        $sql = "
            SELECT
                COUNT(*) as total_aplikasi,
                SUM(CASE WHEN a.expired_date IS NULL OR a.expired_date > GETDATE() THEN 1 ELSE 0 END) as total_aktif,
                SUM(CASE WHEN a.expired_date IS NOT NULL AND a.expired_date <= GETDATE() THEN 1 ELSE 0 END) as total_nonaktif,
                SUM(CASE WHEN a.a_sistem_internal_pt = 1 THEN 1 ELSE 0 END) as total_internal,
                SUM(CASE WHEN a.a_sistem_internal_pt = 0 THEN 1 ELSE 0 END) as total_external,
                SUM(CASE WHEN a.a_integrasi_cas = 1 THEN 1 ELSE 0 END) as total_integrasi_cas
            FROM man_akses.aplikasi a
        ";

        return DB::selectOne($sql);
    }

    /**
     * Create new aplikasi
     *
     * @param array $data
     * @return string ID of created aplikasi
     */
    public function create(array $data): string
    {
        $id = $this->generateUuid();
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            INSERT INTO man_akses.aplikasi (
                id_aplikasi, id_organisasi, nm_aplikasi, ket_aplikasi,
                token_aplikasi, app_key, url, port, teknologi, endpoint_ws,
                a_generate_menu, a_integrasi_cas, a_sistem_internal_pt,
                tgl_create, last_update, last_sync
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ";

        DB::insert($sql, [
            $id,
            $data['id_organisasi'] ?? null,
            $data['nm_aplikasi'],
            $data['ket_aplikasi'] ?? null,
            $data['token_aplikasi'] ?? $this->generateToken(),
            $data['app_key'] ?? $this->generateAppKey(),
            $data['url'] ?? null,
            $data['port'] ?? null,
            $data['teknologi'] ?? null,
            $data['endpoint_ws'] ?? null,
            $data['a_generate_menu'] ?? 0,
            $data['a_integrasi_cas'] ?? 0,
            $data['a_sistem_internal_pt'] ?? 1,
            $now,
            $now,
            $now,
        ]);

        return $id;
    }

    /**
     * Update existing aplikasi
     *
     * @param string $id
     * @param array $data
     * @return bool
     */
    public function update(string $id, array $data): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            UPDATE man_akses.aplikasi SET
                id_organisasi = ?,
                nm_aplikasi = ?,
                ket_aplikasi = ?,
                url = ?,
                port = ?,
                teknologi = ?,
                endpoint_ws = ?,
                a_generate_menu = ?,
                a_integrasi_cas = ?,
                a_sistem_internal_pt = ?,
                last_update = ?,
                last_sync = ?
            WHERE id_aplikasi = ?
        ";

        $affected = DB::update($sql, [
            $data['id_organisasi'] ?? null,
            $data['nm_aplikasi'],
            $data['ket_aplikasi'] ?? null,
            $data['url'] ?? null,
            $data['port'] ?? null,
            $data['teknologi'] ?? null,
            $data['endpoint_ws'] ?? null,
            $data['a_generate_menu'] ?? 0,
            $data['a_integrasi_cas'] ?? 0,
            $data['a_sistem_internal_pt'] ?? 1,
            $now,
            $now,
            $id,
        ]);

        return $affected > 0;
    }

    /**
     * Delete aplikasi (soft delete via expired_date)
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            UPDATE man_akses.aplikasi SET
                expired_date = ?,
                last_update = ?,
                last_sync = ?
            WHERE id_aplikasi = ?
        ";

        $affected = DB::update($sql, [$now, $now, $now, $id]);

        return $affected > 0;
    }

    /**
     * Check if aplikasi name exists
     *
     * @param string $name
     * @param string|null $excludeId
     * @return bool
     */
    public function nameExists(string $name, ?string $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) as count FROM man_akses.aplikasi WHERE nm_aplikasi = ?";
        $bindings = [$name];

        if ($excludeId) {
            $sql .= " AND id_aplikasi != ?";
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

    /**
     * Generate random token for aplikasi
     */
    private function generateToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Generate random app key
     */
    private function generateAppKey(): string
    {
        return 'APP_' . strtoupper(bin2hex(random_bytes(16)));
    }
}
