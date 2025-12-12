<?php

namespace App\Repositories\ManAkses;

use Illuminate\Support\Facades\DB;

/**
 * Kategori Aplikasi Repository
 * Handle all kategori_aplikasi related database operations
 */
class KategoriAplikasiRepository
{
    /**
     * Get all categories
     *
     * @return array
     */
    public function getAll(): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), id_kategori) as id_kategori,
                nm_kategori,
                icon_kategori,
                icon_color,
                urutan,
                a_aktif,
                tgl_create,
                last_update
            FROM man_akses.kategori_aplikasi
            WHERE soft_delete = 0
            ORDER BY urutan ASC, nm_kategori ASC
        ";

        return DB::select($sql);
    }

    /**
     * Get paginated list of categories with optional search
     *
     * @param array $params [page, limit, search]
     * @return array
     */
    public function getList(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $offset = ($page - 1) * $limit;

        // Base query for data
        $dataSql = "
            SELECT
                CONVERT(VARCHAR(36), k.id_kategori) as id_kategori,
                k.nm_kategori,
                k.icon_kategori,
                k.icon_color,
                k.urutan,
                k.a_aktif,
                k.tgl_create,
                k.last_update,
                (SELECT COUNT(*) FROM man_akses.aplikasi a WHERE a.id_kategori = k.id_kategori AND a.expired_date IS NULL) as jumlah_aplikasi
            FROM man_akses.kategori_aplikasi k
            WHERE k.soft_delete = 0
        ";

        // Base query for count
        $countSql = "
            SELECT COUNT(*) as total
            FROM man_akses.kategori_aplikasi k
            WHERE k.soft_delete = 0
        ";

        $bindings = [];
        $countBindings = [];

        // Add search filter
        if (!empty($search)) {
            $searchCondition = " AND k.nm_kategori LIKE ?";
            $dataSql .= $searchCondition;
            $countSql .= $searchCondition;
            $searchTerm = "%{$search}%";
            $bindings[] = $searchTerm;
            $countBindings[] = $searchTerm;
        }

        // Get total count
        $countResult = DB::selectOne($countSql, $countBindings);
        $total = $countResult->total ?? 0;

        // Add ordering and pagination
        $dataSql .= " ORDER BY k.urutan ASC, k.nm_kategori ASC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
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
     * Get category detail by ID
     *
     * @param string $id
     * @return object|null
     */
    public function getDetail(string $id): ?object
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), k.id_kategori) as id_kategori,
                k.nm_kategori,
                k.icon_kategori,
                k.icon_color,
                k.urutan,
                k.a_aktif,
                k.tgl_create,
                k.last_update
            FROM man_akses.kategori_aplikasi k
            WHERE k.id_kategori = ?
              AND k.soft_delete = 0
        ";

        $kategori = DB::selectOne($sql, [$id]);

        if ($kategori) {
            // Get apps in this category
            $kategori->aplikasi = $this->getAppsInCategory($id);
        }

        return $kategori;
    }

    /**
     * Get apps in a category
     *
     * @param string $idKategori
     * @return array
     */
    public function getAppsInCategory(string $idKategori): array
    {
        $sql = "
            SELECT
                CONVERT(VARCHAR(36), id_aplikasi) as id_aplikasi,
                nm_aplikasi,
                icon_name,
                icon_color,
                urutan,
                a_tampil_portal,
                a_maintenance,
                a_coming_soon
            FROM man_akses.aplikasi
            WHERE id_kategori = ?
              AND (expired_date IS NULL OR expired_date > GETDATE())
            ORDER BY urutan ASC, nm_aplikasi ASC
        ";

        return DB::select($sql, [$idKategori]);
    }

    /**
     * Get statistics
     *
     * @return object
     */
    public function getStats(): object
    {
        $sql = "
            SELECT
                COUNT(*) as total_kategori,
                SUM(CASE WHEN a_aktif = 1 THEN 1 ELSE 0 END) as total_aktif,
                SUM(CASE WHEN a_aktif = 0 THEN 1 ELSE 0 END) as total_nonaktif
            FROM man_akses.kategori_aplikasi
            WHERE soft_delete = 0
        ";

        return DB::selectOne($sql);
    }

    /**
     * Create new category
     *
     * @param array $data
     * @return string ID of created category
     */
    public function create(array $data): string
    {
        $id = $this->generateUuid();
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            INSERT INTO man_akses.kategori_aplikasi (
                id_kategori, nm_kategori, icon_kategori, icon_color,
                urutan, a_aktif, tgl_create, last_update, soft_delete
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
        ";

        DB::insert($sql, [
            $id,
            $data['nm_kategori'],
            $data['icon_kategori'] ?? null,
            $data['icon_color'] ?? null,
            $data['urutan'] ?? 0,
            $data['a_aktif'] ?? 1,
            $now,
            $now,
        ]);

        return $id;
    }

    /**
     * Update existing category
     *
     * @param string $id
     * @param array $data
     * @return bool
     */
    public function update(string $id, array $data): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            UPDATE man_akses.kategori_aplikasi SET
                nm_kategori = ?,
                icon_kategori = ?,
                icon_color = ?,
                urutan = ?,
                a_aktif = ?,
                last_update = ?
            WHERE id_kategori = ?
        ";

        $affected = DB::update($sql, [
            $data['nm_kategori'],
            $data['icon_kategori'] ?? null,
            $data['icon_color'] ?? null,
            $data['urutan'] ?? 0,
            $data['a_aktif'] ?? 1,
            $now,
            $id,
        ]);

        return $affected > 0;
    }

    /**
     * Delete category (soft delete)
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool
    {
        $now = now()->format('Y-m-d H:i:s');

        $sql = "
            UPDATE man_akses.kategori_aplikasi SET
                soft_delete = 1,
                last_update = ?
            WHERE id_kategori = ?
        ";

        $affected = DB::update($sql, [$now, $id]);

        return $affected > 0;
    }

    /**
     * Check if category name exists
     *
     * @param string $name
     * @param string|null $excludeId
     * @return bool
     */
    public function nameExists(string $name, ?string $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) as count FROM man_akses.kategori_aplikasi WHERE nm_kategori = ? AND soft_delete = 0";
        $bindings = [$name];

        if ($excludeId) {
            $sql .= " AND id_kategori != ?";
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
        return strtolower(sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        ));
    }
}
