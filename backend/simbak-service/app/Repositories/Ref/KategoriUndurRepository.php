<?php

namespace App\Repositories\Ref;

use App\Repositories\BaseRepository;

class KategoriUndurRepository extends BaseRepository
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

        $countSql = "SELECT COUNT(*) as total FROM ref.kategori_undur {$where}";
        $total = $this->pgCount($countSql, $bindings);

        $dataSql = "
            SELECT * FROM ref.kategori_undur
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
            "SELECT * FROM ref.kategori_undur WHERE a_aktif = true ORDER BY urutan ASC"
        );
    }

    public function findById(string $id): ?object
    {
        return $this->pgSelectOne(
            "SELECT * FROM ref.kategori_undur WHERE id_kategori_undur = ?",
            [$id]
        );
    }

    public function create(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO ref.kategori_undur (id_kategori_undur, nm_kategori, deskripsi, a_aktif, urutan)
            VALUES (?, ?, ?, ?, ?)
            RETURNING *
        ", [
            $data['id_kategori_undur'],
            $data['nm_kategori'],
            $data['deskripsi'] ?? null,
            $data['a_aktif'] ?? true,
            $data['urutan'] ?? 1,
        ]);
    }

    public function update(string $id, array $data): ?object
    {
        return $this->pgInsertReturning("
            UPDATE ref.kategori_undur
            SET nm_kategori = ?, deskripsi = ?, a_aktif = ?, urutan = ?, updated_at = NOW()
            WHERE id_kategori_undur = ?
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
            "DELETE FROM ref.kategori_undur WHERE id_kategori_undur = ?",
            [$id]
        ) > 0;
    }
}
