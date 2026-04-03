<?php

namespace App\Repositories\MasterData;

use App\Repositories\BaseRepository;

class PersyaratanRepository extends BaseRepository
{
    public function getList(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $idJenisLayanan = $params['id_jenis_layanan'] ?? null;
        $bindings = [];

        $where = "WHERE p.soft_delete = false";

        if ($search) {
            $where .= " AND (LOWER(p.nm_dokumen) LIKE ? OR LOWER(p.kode_dokumen) LIKE ?)";
            $bindings[] = '%' . strtolower($search) . '%';
            $bindings[] = '%' . strtolower($search) . '%';
        }
        if ($idJenisLayanan) {
            $where .= " AND p.id_jenis_layanan = ?";
            $bindings[] = $idJenisLayanan;
        }

        $countSql = "SELECT COUNT(*) as total FROM ref.persyaratan_layanan p {$where}";
        $total = $this->pgCount($countSql, $bindings);

        $dataSql = "
            SELECT p.*, jl.nm_layanan, jl.kode_layanan
            FROM ref.persyaratan_layanan p
            JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = p.id_jenis_layanan AND jl.soft_delete = false
            {$where}
            ORDER BY jl.urutan ASC, p.urutan ASC
            {$this->buildPagination($page, $limit)}
        ";
        $data = $this->pgSelect($dataSql, $bindings);

        return ['data' => $data, 'total' => $total];
    }

    public function findById(string $id): ?object
    {
        return $this->pgSelectOne(
            "SELECT * FROM ref.persyaratan_layanan WHERE id_persyaratan = ? AND soft_delete = false",
            [$id]
        );
    }

    public function create(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO ref.persyaratan_layanan (id_jenis_layanan, kode_dokumen, nm_dokumen, deskripsi, a_wajib, urutan, tipe_file, max_size_mb, id_creator)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        ", [
            $data['id_jenis_layanan'],
            $data['kode_dokumen'],
            $data['nm_dokumen'],
            $data['deskripsi'] ?? null,
            $data['a_wajib'] ?? true,
            $data['urutan'] ?? 0,
            $data['tipe_file'] ?? 'application/pdf',
            $data['max_size_mb'] ?? 5,
            $data['id_creator'] ?? null,
        ]);
    }

    public function update(string $id, array $data): ?object
    {
        return $this->pgInsertReturning("
            UPDATE ref.persyaratan_layanan
            SET kode_dokumen = ?, nm_dokumen = ?, deskripsi = ?, a_wajib = ?,
                urutan = ?, tipe_file = ?, max_size_mb = ?, id_updater = ?
            WHERE id_persyaratan = ? AND soft_delete = false
            RETURNING *
        ", [
            $data['kode_dokumen'],
            $data['nm_dokumen'],
            $data['deskripsi'] ?? null,
            $data['a_wajib'] ?? true,
            $data['urutan'] ?? 0,
            $data['tipe_file'] ?? 'application/pdf',
            $data['max_size_mb'] ?? 5,
            $data['id_updater'] ?? null,
            $id,
        ]);
    }

    public function delete(string $id, ?string $userId = null): bool
    {
        return $this->pgUpdate(
            "UPDATE ref.persyaratan_layanan SET soft_delete = true, id_updater = ? WHERE id_persyaratan = ?",
            [$userId, $id]
        ) > 0;
    }
}
