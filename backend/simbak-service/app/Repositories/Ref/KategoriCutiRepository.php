<?php

namespace App\Repositories\Ref;

use App\Repositories\BaseRepository;

class KategoriCutiRepository extends BaseRepository
{
    public function getList(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 50;
        $search = $params['search'] ?? null;
        $bindings = [];

        $where = "WHERE 1=1";

        if ($search) {
            $where .= " AND (LOWER(nm_kategori) LIKE ? OR LOWER(deskripsi) LIKE ?)";
            $bindings[] = '%' . strtolower($search) . '%';
            $bindings[] = '%' . strtolower($search) . '%';
        }

        $countSql = "SELECT COUNT(*) as total FROM ref.kategori_cuti {$where}";
        $total = $this->pgCount($countSql, $bindings);

        $dataSql = "
            SELECT * FROM ref.kategori_cuti
            {$where}
            ORDER BY urutan ASC
            {$this->buildPagination($page, $limit)}
        ";
        $data = $this->pgSelect($dataSql, $bindings);

        return ['data' => $data, 'total' => $total];
    }

    public function getActive(): array
    {
        return $this->pgSelect(
            "SELECT * FROM ref.kategori_cuti WHERE a_aktif = true ORDER BY urutan ASC"
        );
    }

    public function findById(string $id): ?object
    {
        return $this->pgSelectOne(
            "SELECT * FROM ref.kategori_cuti WHERE id_kategori_cuti = ?",
            [$id]
        );
    }

    public function create(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO ref.kategori_cuti (id_kategori_cuti, nm_kategori, deskripsi, a_aktif, urutan)
            VALUES (?, ?, ?, ?, ?)
            RETURNING *
        ", [
            $data['id_kategori_cuti'],
            $data['nm_kategori'],
            $data['deskripsi'] ?? null,
            $data['a_aktif'] ?? true,
            $data['urutan'] ?? 1,
        ]);
    }

    public function update(string $id, array $data): ?object
    {
        return $this->pgInsertReturning("
            UPDATE ref.kategori_cuti
            SET nm_kategori = ?, deskripsi = ?, a_aktif = ?, urutan = ?, updated_at = NOW()
            WHERE id_kategori_cuti = ?
            RETURNING *
        ", [
            $data['nm_kategori'],
            $data['deskripsi'] ?? null,
            $data['a_aktif'] ?? true,
            $data['urutan'] ?? 1,
            $id,
        ]);
    }

    public function delete(string $id): bool
    {
        return $this->pgUpdate(
            "DELETE FROM ref.kategori_cuti WHERE id_kategori_cuti = ?",
            [$id]
        ) > 0;
    }
}
