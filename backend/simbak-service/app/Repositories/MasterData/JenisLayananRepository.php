<?php

namespace App\Repositories\MasterData;

use App\Repositories\BaseRepository;

class JenisLayananRepository extends BaseRepository
{
    public function getList(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $kategori = $params['kategori'] ?? null;
        $bindings = [];

        $where = "WHERE soft_delete = false";

        if ($search) {
            $where .= " AND (LOWER(kode_layanan) LIKE ? OR LOWER(nm_layanan) LIKE ?)";
            $bindings[] = '%' . strtolower($search) . '%';
            $bindings[] = '%' . strtolower($search) . '%';
        }
        if ($kategori) {
            $where .= " AND kategori = ?";
            $bindings[] = $kategori;
        }

        $countSql = "SELECT COUNT(*) as total FROM ref.jenis_layanan {$where}";
        $total = $this->pgCount($countSql, $bindings);

        $dataSql = "
            SELECT id_jenis_layanan, kode_layanan, nm_layanan, deskripsi, kategori,
                   a_aktif, a_batch, urutan, sla_hari, created_at, updated_at
            FROM ref.jenis_layanan
            {$where}
            ORDER BY urutan ASC, nm_layanan ASC
            {$this->buildPagination($page, $limit)}
        ";
        $data = $this->pgSelect($dataSql, $bindings);

        return ['data' => $data, 'total' => $total];
    }

    public function findById(string $id): ?object
    {
        return $this->pgSelectOne(
            "SELECT * FROM ref.jenis_layanan WHERE id_jenis_layanan = ? AND soft_delete = false",
            [$id]
        );
    }

    public function findByKode(string $kode): ?object
    {
        return $this->pgSelectOne(
            "SELECT * FROM ref.jenis_layanan WHERE kode_layanan = ? AND soft_delete = false",
            [$kode]
        );
    }

    public function create(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO ref.jenis_layanan (kode_layanan, nm_layanan, deskripsi, kategori, a_aktif, a_batch, urutan, sla_hari, id_creator)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        ", [
            $data['kode_layanan'],
            $data['nm_layanan'],
            $data['deskripsi'] ?? null,
            $data['kategori'],
            $data['a_aktif'] ?? true,
            $data['a_batch'] ?? false,
            $data['urutan'] ?? 0,
            $data['sla_hari'] ?? null,
            $data['id_creator'] ?? null,
        ]);
    }

    public function update(string $id, array $data): ?object
    {
        return $this->pgInsertReturning("
            UPDATE ref.jenis_layanan
            SET kode_layanan = ?, nm_layanan = ?, deskripsi = ?, kategori = ?,
                a_aktif = ?, a_batch = ?, urutan = ?, sla_hari = ?, id_updater = ?
            WHERE id_jenis_layanan = ? AND soft_delete = false
            RETURNING *
        ", [
            $data['kode_layanan'],
            $data['nm_layanan'],
            $data['deskripsi'] ?? null,
            $data['kategori'],
            $data['a_aktif'] ?? true,
            $data['a_batch'] ?? false,
            $data['urutan'] ?? 0,
            $data['sla_hari'] ?? null,
            $data['id_updater'] ?? null,
            $id,
        ]);
    }

    public function delete(string $id, ?string $userId = null): bool
    {
        return $this->pgUpdate(
            "UPDATE ref.jenis_layanan SET soft_delete = true, id_updater = ? WHERE id_jenis_layanan = ?",
            [$userId, $id]
        ) > 0;
    }

    public function getPublicList(): array
    {
        return $this->pgSelect("
            SELECT id_jenis_layanan, kode_layanan, nm_layanan, deskripsi, kategori, urutan, sla_hari
            FROM ref.jenis_layanan
            WHERE a_aktif = true AND soft_delete = false
            ORDER BY urutan ASC
        ");
    }

    public function getPersyaratanByLayanan(string $idJenisLayanan): array
    {
        return $this->pgSelect("
            SELECT id_persyaratan, kode_dokumen, nm_dokumen, deskripsi, a_wajib, urutan, tipe_file, max_size_mb
            FROM ref.persyaratan_layanan
            WHERE id_jenis_layanan = ? AND soft_delete = false
            ORDER BY urutan ASC
        ", [$idJenisLayanan]);
    }

    public function getTahapanByLayanan(string $idJenisLayanan): array
    {
        return $this->pgSelect("
            SELECT id_tahapan, urutan, nm_tahapan, kode_role, status_masuk, status_selesai, a_opsional, deskripsi
            FROM ref.tahapan_layanan
            WHERE id_jenis_layanan = ? AND soft_delete = false
            ORDER BY urutan ASC
        ", [$idJenisLayanan]);
    }
}
