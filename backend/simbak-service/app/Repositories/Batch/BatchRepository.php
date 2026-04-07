<?php

namespace App\Repositories\Batch;

use App\Repositories\BaseRepository;

class BatchRepository extends BaseRepository
{
    public function getList(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $jenisBatch = $params['jenis_batch'] ?? null;
        $status = $params['status'] ?? null;
        $bindings = [];

        $where = "WHERE b.soft_delete = false";
        if ($jenisBatch) {
            $where .= " AND b.jenis_batch = ?";
            $bindings[] = $jenisBatch;
        }
        if ($status) {
            $where .= " AND b.status = ?";
            $bindings[] = $status;
        }

        $countSql = "SELECT COUNT(*) as total FROM batch.batch_penetapan b {$where}";
        $total = $this->pgCount($countSql, $bindings);

        $dataSql = "
            SELECT b.*, jl.kode_layanan, jl.nm_layanan
            FROM batch.batch_penetapan b
            JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = b.id_jenis_layanan
            {$where}
            ORDER BY b.created_at DESC
            {$this->buildPagination($page, $limit)}
        ";
        $data = $this->pgSelect($dataSql, $bindings);

        return ['data' => $data, 'total' => $total];
    }

    public function findById(string $id): ?object
    {
        return $this->pgSelectOne("
            SELECT b.*, jl.kode_layanan, jl.nm_layanan
            FROM batch.batch_penetapan b
            JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = b.id_jenis_layanan
            WHERE b.id_batch_penetapan = ? AND b.soft_delete = false
        ", [$id]);
    }

    public function create(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO batch.batch_penetapan (
                id_jenis_layanan, kode_batch, nm_batch, jenis_batch, id_smt,
                status, id_pembuat, kriteria_snapshot, catatan, id_creator
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        ", [
            $data['id_jenis_layanan'], $data['kode_batch'], $data['nm_batch'],
            $data['jenis_batch'], $data['id_smt'],
            $data['status'] ?? 'draft', $data['id_pembuat'],
            $data['kriteria_snapshot'] ?? '{}', $data['catatan'] ?? null,
            $data['id_creator'] ?? null,
        ]);
    }

    public function updateStatus(string $id, string $status, ?string $userId = null): bool
    {
        $extra = '';
        if ($status === 'terbit') {
            $extra = ", tgl_selesai = NOW()";
        }
        return $this->pgUpdate(
            "UPDATE batch.batch_penetapan SET status = ?, id_updater = ? {$extra} WHERE id_batch_penetapan = ? AND soft_delete = false",
            [$status, $userId, $id]
        ) > 0;
    }

    public function getKandidatList(string $idBatch, array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 100;
        $statusKandidat = $params['status_kandidat'] ?? null;
        $idFakultas = $params['id_fakultas'] ?? null;
        $search = $params['search'] ?? null;
        $bindings = [$idBatch];

        $where = "WHERE k.id_batch_penetapan = ? AND k.soft_delete = false";
        if ($statusKandidat) {
            $where .= " AND k.status_kandidat = ?";
            $bindings[] = $statusKandidat;
        }
        if ($idFakultas) {
            $where .= " AND k.id_fakultas = ?";
            $bindings[] = $idFakultas;
        }
        if ($search) {
            $where .= " AND (LOWER(k.nim) LIKE ? OR LOWER(k.nm_mahasiswa) LIKE ? OR LOWER(k.nm_prodi) LIKE ? OR LOWER(k.nm_fakultas) LIKE ?)";
            $s = '%' . strtolower($search) . '%';
            array_push($bindings, $s, $s, $s, $s);
        }

        $countSql = "SELECT COUNT(*) as total FROM batch.kandidat_batch k {$where}";
        $total = $this->pgCount($countSql, $bindings);

        $dataSql = "
            SELECT k.*,
                   v.id_verifikasi, v.hasil as hasil_verifikasi, v.catatan as catatan_verifikasi,
                   v.nm_verifikator, v.tgl_verifikasi
            FROM batch.kandidat_batch k
            LEFT JOIN batch.verifikasi_batch v ON v.id_kandidat = k.id_kandidat
            {$where}
            ORDER BY k.nm_fakultas ASC, k.nm_prodi ASC, k.nim ASC
            {$this->buildPagination($page, $limit)}
        ";
        $data = $this->pgSelect($dataSql, $bindings);

        return ['data' => $data, 'total' => $total];
    }

    public function createKandidat(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO batch.kandidat_batch (
                id_batch_penetapan, id_mahasiswa, nim, nm_mahasiswa,
                id_fakultas, nm_fakultas, id_prodi, nm_prodi, nm_jenjang,
                angkatan, semester_aktif, ipk, sks_lulus, masa_studi_semester,
                status_mahasiswa, status_registrasi, status_pembayaran,
                status_kandidat, id_creator
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        ", [
            $data['id_batch_penetapan'], $data['id_mahasiswa'], $data['nim'], $data['nm_mahasiswa'],
            $data['id_fakultas'] ?? null, $data['nm_fakultas'] ?? null,
            $data['id_prodi'] ?? null, $data['nm_prodi'] ?? null, $data['nm_jenjang'] ?? null,
            $data['angkatan'] ?? null, $data['semester_aktif'] ?? null,
            $data['ipk'] ?? null, $data['sks_lulus'] ?? null, $data['masa_studi_semester'] ?? null,
            $data['status_mahasiswa'] ?? null, $data['status_registrasi'] ?? null, $data['status_pembayaran'] ?? null,
            $data['status_kandidat'] ?? 'masuk', $data['id_creator'] ?? null,
        ]);
    }

    public function updateKandidatStatus(string $idKandidat, string $status, ?string $alasan = null, ?string $userId = null): bool
    {
        return $this->pgUpdate(
            "UPDATE batch.kandidat_batch SET status_kandidat = ?, alasan_exclusion = ?, id_updater = ? WHERE id_kandidat = ? AND soft_delete = false",
            [$status, $alasan, $userId, $idKandidat]
        ) > 0;
    }

    public function createVerifikasi(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO batch.verifikasi_batch (
                id_batch_penetapan, id_kandidat, id_verifikator, nm_verifikator, id_fakultas, hasil, catatan
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        ", [
            $data['id_batch_penetapan'], $data['id_kandidat'],
            $data['id_verifikator'], $data['nm_verifikator'] ?? null,
            $data['id_fakultas'] ?? null, $data['hasil'], $data['catatan'] ?? null,
        ]);
    }

    public function updateBatchCounts(string $idBatch): bool
    {
        return $this->pgUpdate("
            UPDATE batch.batch_penetapan SET
                jumlah_kandidat = (SELECT COUNT(*) FROM batch.kandidat_batch WHERE id_batch_penetapan = ? AND soft_delete = false),
                jumlah_terverifikasi = (SELECT COUNT(*) FROM batch.verifikasi_batch WHERE id_batch_penetapan = ?),
                jumlah_dikeluarkan = (SELECT COUNT(*) FROM batch.kandidat_batch WHERE id_batch_penetapan = ? AND status_kandidat = 'dikeluarkan' AND soft_delete = false)
            WHERE id_batch_penetapan = ?
        ", [$idBatch, $idBatch, $idBatch, $idBatch]) >= 0;
    }
}
