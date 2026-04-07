<?php

namespace App\Repositories\MasterData;

use App\Repositories\BaseRepository;

class TahapanRepository extends BaseRepository
{
    public function getList(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $idJenisLayanan = $params['id_jenis_layanan'] ?? null;
        $bindings = [];

        $where = "WHERE t.soft_delete = false";

        if ($search) {
            $where .= " AND (LOWER(t.nm_tahapan) LIKE ? OR LOWER(t.kode_role) LIKE ?)";
            $bindings[] = '%' . strtolower($search) . '%';
            $bindings[] = '%' . strtolower($search) . '%';
        }
        if ($idJenisLayanan) {
            $where .= " AND t.id_jenis_layanan = ?";
            $bindings[] = $idJenisLayanan;
        }

        $countSql = "SELECT COUNT(*) as total FROM ref.tahapan_layanan t {$where}";
        $total = $this->pgCount($countSql, $bindings);

        $dataSql = "
            SELECT t.*, jl.nm_layanan, jl.kode_layanan
            FROM ref.tahapan_layanan t
            JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = t.id_jenis_layanan AND jl.soft_delete = false
            {$where}
            ORDER BY jl.urutan ASC, t.urutan ASC
            {$this->buildPagination($page, $limit)}
        ";
        $data = $this->pgSelect($dataSql, $bindings);

        return ['data' => $data, 'total' => $total];
    }

    public function findById(string $id): ?object
    {
        return $this->pgSelectOne(
            "SELECT * FROM ref.tahapan_layanan WHERE id_tahapan = ? AND soft_delete = false",
            [$id]
        );
    }

    public function create(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO ref.tahapan_layanan (id_jenis_layanan, urutan, nm_tahapan, kode_role, status_masuk, status_selesai, a_opsional, deskripsi, id_creator)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        ", [
            $data['id_jenis_layanan'],
            $data['urutan'],
            $data['nm_tahapan'],
            $data['kode_role'],
            $data['status_masuk'],
            $data['status_selesai'],
            $data['a_opsional'] ?? false,
            $data['deskripsi'] ?? null,
            $data['id_creator'] ?? null,
        ]);
    }

    public function update(string $id, array $data): ?object
    {
        return $this->pgInsertReturning("
            UPDATE ref.tahapan_layanan
            SET urutan = ?, nm_tahapan = ?, kode_role = ?, status_masuk = ?,
                status_selesai = ?, a_opsional = ?, deskripsi = ?, id_updater = ?
            WHERE id_tahapan = ? AND soft_delete = false
            RETURNING *
        ", [
            $data['urutan'],
            $data['nm_tahapan'],
            $data['kode_role'],
            $data['status_masuk'],
            $data['status_selesai'],
            $data['a_opsional'] ?? false,
            $data['deskripsi'] ?? null,
            $data['id_updater'] ?? null,
            $id,
        ]);
    }

    public function delete(string $id, ?string $userId = null): bool
    {
        return $this->pgUpdate(
            "UPDATE ref.tahapan_layanan SET soft_delete = true, id_updater = ? WHERE id_tahapan = ?",
            [$userId, $id]
        ) > 0;
    }
}
