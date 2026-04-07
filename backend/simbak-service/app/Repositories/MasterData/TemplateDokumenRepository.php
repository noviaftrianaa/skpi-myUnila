<?php

namespace App\Repositories\MasterData;

use App\Repositories\BaseRepository;

class TemplateDokumenRepository extends BaseRepository
{
    public function getList(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $bindings = [];

        $where = "WHERE td.soft_delete = false";

        if ($search) {
            $where .= " AND LOWER(td.nm_template) LIKE ?";
            $bindings[] = '%' . strtolower($search) . '%';
        }

        $countSql = "SELECT COUNT(*) as total FROM ref.template_dokumen td {$where}";
        $total = $this->pgCount($countSql, $bindings);

        $dataSql = "
            SELECT td.*, jl.nm_layanan, jl.kode_layanan
            FROM ref.template_dokumen td
            JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = td.id_jenis_layanan AND jl.soft_delete = false
            {$where}
            ORDER BY jl.urutan ASC, td.nm_template ASC
            {$this->buildPagination($page, $limit)}
        ";
        $data = $this->pgSelect($dataSql, $bindings);

        return ['data' => $data, 'total' => $total];
    }

    public function findById(string $id): ?object
    {
        return $this->pgSelectOne(
            "SELECT * FROM ref.template_dokumen WHERE id_template = ? AND soft_delete = false",
            [$id]
        );
    }

    public function create(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO ref.template_dokumen (id_jenis_layanan, nm_template, versi, path_file, tipe_file, a_aktif, keterangan, id_creator)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        ", [
            $data['id_jenis_layanan'],
            $data['nm_template'],
            $data['versi'] ?? '1.0',
            $data['path_file'] ?? '',
            $data['tipe_file'] ?? 'application/pdf',
            $data['a_aktif'] ?? true,
            $data['keterangan'] ?? null,
            $data['id_creator'] ?? null,
        ]);
    }

    public function update(string $id, array $data): ?object
    {
        return $this->pgInsertReturning("
            UPDATE ref.template_dokumen
            SET nm_template = ?, versi = ?, path_file = ?, tipe_file = ?,
                a_aktif = ?, keterangan = ?, id_updater = ?
            WHERE id_template = ? AND soft_delete = false
            RETURNING *
        ", [
            $data['nm_template'],
            $data['versi'] ?? '1.0',
            $data['path_file'] ?? '',
            $data['tipe_file'] ?? 'application/pdf',
            $data['a_aktif'] ?? true,
            $data['keterangan'] ?? null,
            $data['id_updater'] ?? null,
            $id,
        ]);
    }

    public function delete(string $id, ?string $userId = null): bool
    {
        return $this->pgUpdate(
            "UPDATE ref.template_dokumen SET soft_delete = true, id_updater = ? WHERE id_template = ?",
            [$userId, $id]
        ) > 0;
    }
}
