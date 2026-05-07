<?php

namespace App\Repositories\MasterData;

use App\Repositories\BaseRepository;

/**
 * Repository: ref.periode_kkn
 *
 * Tabel master periode KKN (gelombang, tanggal pendaftaran, pelaksanaan, kuota, dll).
 * Soft delete via kolom `soft_delete BOOLEAN NOT NULL DEFAULT false`.
 *
 * Pattern repository ini dipakai sebagai TEMPLATE untuk modul master-data lain.
 * Copy-paste struktur ini lalu sesuaikan kolom dgn tabel target.
 */
class PeriodeKknRepository extends BaseRepository
{
    /**
     * List periode dengan pagination + filter + search.
     *
     * @param array $filters [tahun_akademik, gelombang, a_aktif, search, page, limit, sort_by, order]
     * @return array{data: array, total: int}
     */
    public function list(array $filters): array
    {
        $page  = max(1, (int) ($filters['page'] ?? 1));
        $limit = min(100, max(1, (int) ($filters['limit'] ?? 10)));
        $sortBy = $filters['sort_by'] ?? 'tgl_pelaksanaan_mulai';
        $order  = strtoupper($filters['order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
        $offset = ($page - 1) * $limit;

        // Whitelist sort columns (cegah SQL injection via sort_by)
        $allowedSort = ['kode_periode', 'nm_periode', 'gelombang', 'tahun_akademik',
                        'tgl_daftar_mulai', 'tgl_pelaksanaan_mulai', 'created_at'];
        if (!in_array($sortBy, $allowedSort, true)) {
            $sortBy = 'tgl_pelaksanaan_mulai';
        }

        // Build WHERE clause
        $where = ['p.soft_delete = false'];
        $bindings = [];

        if (!empty($filters['tahun_akademik'])) {
            $where[] = 'p.tahun_akademik = ?';
            $bindings[] = $filters['tahun_akademik'];
        }
        if (isset($filters['gelombang']) && $filters['gelombang'] !== '') {
            $where[] = 'p.gelombang = ?';
            $bindings[] = (int) $filters['gelombang'];
        }
        if (isset($filters['a_aktif']) && $filters['a_aktif'] !== '') {
            $where[] = 'p.a_aktif = ?';
            $bindings[] = (bool) $filters['a_aktif'];
        }
        if (!empty($filters['search'])) {
            $where[] = '(p.kode_periode ILIKE ? OR p.nm_periode ILIKE ?)';
            $term = '%' . $filters['search'] . '%';
            $bindings[] = $term;
            $bindings[] = $term;
        }

        $whereSql = 'WHERE ' . implode(' AND ', $where);

        // Total count
        $countQuery = "SELECT COUNT(*) AS total FROM ref.periode_kkn p {$whereSql}";
        $total = $this->pgCount($countQuery, $bindings);

        // Data query
        $dataQuery = "
            SELECT p.id_periode_kkn, p.kode_periode, p.nm_periode,
                   p.id_smt, p.tahun_akademik, p.gelombang,
                   p.tgl_daftar_mulai, p.tgl_daftar_selesai,
                   p.tgl_pembekalan_mulai, p.tgl_pembekalan_selesai,
                   p.tgl_pelaksanaan_mulai, p.tgl_pelaksanaan_selesai,
                   p.durasi_hari, p.kuota_total, p.deskripsi, p.a_aktif,
                   p.created_at, p.updated_at
            FROM ref.periode_kkn p
            {$whereSql}
            ORDER BY p.{$sortBy} {$order}, p.created_at DESC
            LIMIT {$limit} OFFSET {$offset}
        ";
        $data = $this->pgSelect($dataQuery, $bindings);

        return [
            'data'  => $data,
            'total' => $total,
            'page'  => $page,
            'limit' => $limit,
        ];
    }

    /**
     * Detail satu periode by id.
     */
    public function findById(string $id): ?object
    {
        $query = "
            SELECT * FROM ref.periode_kkn
            WHERE id_periode_kkn = ?::uuid AND soft_delete = false
        ";
        return $this->pgSelectOne($query, [$id]);
    }

    /**
     * Cek apakah kode_periode sudah dipakai (untuk validasi unique).
     */
    public function existsByKode(string $kode, ?string $exceptId = null): bool
    {
        if ($exceptId) {
            $query = "SELECT 1 FROM ref.periode_kkn
                      WHERE kode_periode = ? AND id_periode_kkn != ?::uuid AND soft_delete = false LIMIT 1";
            $row = $this->pgSelectOne($query, [$kode, $exceptId]);
        } else {
            $query = "SELECT 1 FROM ref.periode_kkn
                      WHERE kode_periode = ? AND soft_delete = false LIMIT 1";
            $row = $this->pgSelectOne($query, [$kode]);
        }
        return $row !== null;
    }

    /**
     * Insert periode baru. Return row hasil INSERT (RETURNING *).
     *
     * @param array $data field-field periode
     * @param string|null $idCreator UUID pengguna pembuat
     */
    public function create(array $data, ?string $idCreator = null): ?object
    {
        $query = "
            INSERT INTO ref.periode_kkn (
                kode_periode, nm_periode, id_smt, tahun_akademik, gelombang,
                tgl_daftar_mulai, tgl_daftar_selesai,
                tgl_pembekalan_mulai, tgl_pembekalan_selesai,
                tgl_pelaksanaan_mulai, tgl_pelaksanaan_selesai,
                durasi_hari, kuota_total, deskripsi, a_aktif, id_creator
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?,
                ?, ?,
                ?, ?,
                ?, ?, ?, ?, ?::uuid
            )
            RETURNING *
        ";

        return $this->pgInsertReturning($query, [
            $data['kode_periode'],
            $data['nm_periode'],
            $data['id_smt']                ?? null,
            $data['tahun_akademik']        ?? null,
            $data['gelombang']             ?? 1,
            $data['tgl_daftar_mulai']      ?? null,
            $data['tgl_daftar_selesai']    ?? null,
            $data['tgl_pembekalan_mulai']  ?? null,
            $data['tgl_pembekalan_selesai']?? null,
            $data['tgl_pelaksanaan_mulai'] ?? null,
            $data['tgl_pelaksanaan_selesai']?? null,
            $data['durasi_hari']           ?? 40,
            $data['kuota_total']           ?? null,
            $data['deskripsi']             ?? null,
            $data['a_aktif']               ?? true,
            $idCreator,
        ]);
    }

    /**
     * Update periode. Return row hasil UPDATE.
     */
    public function update(string $id, array $data, ?string $idUpdater = null): ?object
    {
        $sets = [];
        $bindings = [];

        $updatable = ['kode_periode', 'nm_periode', 'id_smt', 'tahun_akademik', 'gelombang',
                      'tgl_daftar_mulai', 'tgl_daftar_selesai',
                      'tgl_pembekalan_mulai', 'tgl_pembekalan_selesai',
                      'tgl_pelaksanaan_mulai', 'tgl_pelaksanaan_selesai',
                      'durasi_hari', 'kuota_total', 'deskripsi', 'a_aktif'];

        foreach ($updatable as $col) {
            if (array_key_exists($col, $data)) {
                $sets[] = "{$col} = ?";
                $bindings[] = $data[$col];
            }
        }

        if (empty($sets)) {
            return $this->findById($id);
        }

        $sets[] = 'id_updater = ?::uuid';
        $bindings[] = $idUpdater;

        $bindings[] = $id;

        $query = "
            UPDATE ref.periode_kkn
            SET " . implode(', ', $sets) . "
            WHERE id_periode_kkn = ?::uuid AND soft_delete = false
            RETURNING *
        ";

        return $this->pgInsertReturning($query, $bindings);
    }

    /**
     * Soft delete: set soft_delete = true (kolom updated_at otomatis via trigger).
     * Return jumlah row terdampak.
     */
    public function softDelete(string $id, ?string $idUpdater = null): int
    {
        $query = "
            UPDATE ref.periode_kkn
            SET soft_delete = true, id_updater = ?::uuid
            WHERE id_periode_kkn = ?::uuid AND soft_delete = false
        ";
        return $this->pgUpdate($query, [$idUpdater, $id]);
    }
}
