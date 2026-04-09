<?php

namespace App\Repositories\Layanan;

use App\Repositories\BaseRepository;

class PengajuanRepository extends BaseRepository
{
    /**
     * List pengajuan — raw SQL multi-table join (no Eloquent).
     */
    public function getList(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $status = $params['status'] ?? null;
        $kodeLayanan = $params['kode_layanan'] ?? null;
        $idPemohon = $params['id_pemohon'] ?? null;
        $bindings = [];

        $where = "WHERE p.soft_delete = false";

        if ($search) {
            $where .= " AND (LOWER(p.nomor_permohonan) LIKE ? OR LOWER(dp.nm_mahasiswa) LIKE ? OR LOWER(dp.nim) LIKE ?)";
            $s = '%' . strtolower($search) . '%';
            array_push($bindings, $s, $s, $s);
        }
        if ($status) {
            $where .= " AND p.status = ?";
            $bindings[] = $status;
        }
        if ($kodeLayanan) {
            $where .= " AND jl.kode_layanan = ?";
            $bindings[] = $kodeLayanan;
        }
        if ($idPemohon) {
            $where .= " AND p.id_pemohon = ?";
            $bindings[] = $idPemohon;
        }

        $countSql = "
            SELECT COUNT(*) as total
            FROM layanan.pengajuan p
            LEFT JOIN layanan.data_pemohon dp ON dp.id_pengajuan = p.id_pengajuan AND dp.soft_delete = false
            LEFT JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = p.id_jenis_layanan
            {$where}
        ";
        $total = $this->pgCount($countSql, $bindings);

        $dataSql = "
            SELECT
                p.id_pengajuan, p.nomor_permohonan, p.status, p.alasan, p.catatan_pemohon,
                p.tgl_diajukan, p.tgl_selesai, p.nomor_dokumen_hasil, p.tgl_dokumen_hasil,
                p.created_at, p.updated_at,
                jl.id_jenis_layanan, jl.kode_layanan, jl.nm_layanan, jl.kategori, jl.sla_hari,
                dp.nm_mahasiswa, dp.nim, dp.nm_prodi, dp.nm_fakultas,
                dp.semester_aktif, dp.ipk
            FROM layanan.pengajuan p
            JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = p.id_jenis_layanan
            LEFT JOIN layanan.data_pemohon dp ON dp.id_pengajuan = p.id_pengajuan AND dp.soft_delete = false
            {$where}
            ORDER BY p.created_at DESC
            {$this->buildPagination($page, $limit)}
        ";
        $data = $this->pgSelect($dataSql, $bindings);

        return ['data' => $data, 'total' => $total];
    }

    /**
     * Detail pengajuan — single row, raw SQL multi-table join.
     */
    public function findById(string $id): ?object
    {
        return $this->pgSelectOne("
            SELECT
                p.*,
                jl.kode_layanan, jl.nm_layanan, jl.kategori, jl.sla_hari
            FROM layanan.pengajuan p
            JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = p.id_jenis_layanan
            WHERE p.id_pengajuan = ? AND p.soft_delete = false
        ", [$id]);
    }

    public function getDataPemohon(string $idPengajuan): ?object
    {
        return $this->pgSelectOne(
            "SELECT * FROM layanan.data_pemohon WHERE id_pengajuan = ? AND soft_delete = false",
            [$idPengajuan]
        );
    }

    public function getDokumen(string $idPengajuan): array
    {
        return $this->pgSelect(
            "SELECT * FROM layanan.dokumen_pengajuan WHERE id_pengajuan = ? AND soft_delete = false ORDER BY created_at ASC",
            [$idPengajuan]
        );
    }

    public function getRiwayat(string $idPengajuan): array
    {
        return $this->pgSelect(
            "SELECT * FROM layanan.riwayat_pengajuan WHERE id_pengajuan = ? ORDER BY urutan ASC, created_at ASC",
            [$idPengajuan]
        );
    }

    public function getPersetujuan(string $idPengajuan): array
    {
        return $this->pgSelect(
            "SELECT * FROM layanan.persetujuan_pengajuan WHERE id_pengajuan = ? AND soft_delete = false ORDER BY tgl_keputusan ASC",
            [$idPengajuan]
        );
    }

    public function getDokumenHasil(string $idPengajuan): array
    {
        return $this->pgSelect(
            "SELECT * FROM layanan.dokumen_hasil WHERE id_pengajuan = ? AND soft_delete = false ORDER BY created_at DESC",
            [$idPengajuan]
        );
    }

    /**
     * Generate nomor permohonan: BAK/KODE/YYYY/NNNN
     */
    public function generateNomor(string $kodeLayanan): string
    {
        $year = date('Y');
        $prefix = "BAK/{$kodeLayanan}/{$year}";
        $result = $this->pgSelectOne(
            "SELECT COUNT(*) as cnt FROM layanan.pengajuan WHERE nomor_permohonan LIKE ?",
            ["{$prefix}/%"]
        );
        $seq = ($result->cnt ?? 0) + 1;
        return "{$prefix}/" . str_pad($seq, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Create pengajuan — single table INSERT (Eloquent-safe).
     */
    public function create(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO layanan.pengajuan (
                id_jenis_layanan, nomor_permohonan, id_pemohon, status, alasan, catatan_pemohon,
                id_smt_mulai_cuti, jumlah_semester_cuti, id_prodi_tujuan, id_fakultas_tujuan,
                id_creator
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        ", [
            $data['id_jenis_layanan'],
            $data['nomor_permohonan'],
            $data['id_pemohon'],
            $data['status'] ?? 'draft',
            $data['alasan'] ?? null,
            $data['catatan_pemohon'] ?? null,
            $data['id_smt_mulai_cuti'] ?? null,
            $data['jumlah_semester_cuti'] ?? null,
            $data['id_prodi_tujuan'] ?? null,
            $data['id_fakultas_tujuan'] ?? null,
            $data['id_creator'] ?? null,
        ]);
    }

    public function updateDokumenHasil(string $id, string $nomorDokumen, ?string $tglDokumen = null): bool
    {
        return $this->pgUpdate(
            "UPDATE layanan.pengajuan SET nomor_dokumen_hasil = ?, tgl_dokumen_hasil = ? WHERE id_pengajuan = ?",
            [$nomorDokumen, $tglDokumen ?? date('Y-m-d'), $id]
        ) >= 0;
    }

    public function updateStatus(string $id, string $status, ?string $userId = null, ?string $expectedStatus = null): bool
    {
        $extra = '';
        $bindings = [$status, $userId, $id];
        if ($status === 'diajukan') {
            $extra = ", tgl_diajukan = NOW()";
        } elseif (in_array($status, ['terbit', 'ditolak'])) {
            $extra = ", tgl_selesai = NOW()";
        }
        $whereExtra = '';
        if ($expectedStatus) {
            $whereExtra = ' AND status = ?';
            $bindings[] = $expectedStatus;
        }
        $affected = $this->pgUpdate(
            "UPDATE layanan.pengajuan SET status = ?, id_updater = ? {$extra} WHERE id_pengajuan = ? AND soft_delete = false{$whereExtra}",
            $bindings
        );
        return $affected > 0;
    }

    public function createDataPemohon(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO layanan.data_pemohon (
                id_pengajuan, id_mahasiswa, nim, nm_mahasiswa, tempat_lahir, tgl_lahir, jenis_kelamin,
                id_fakultas, nm_fakultas, id_prodi, nm_prodi, id_jenj_didik, nm_jenjang,
                angkatan, semester_aktif, id_smt, ipk, sks_lulus, masa_studi_semester,
                status_mahasiswa, status_registrasi, status_pembayaran, id_creator
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        ", [
            $data['id_pengajuan'], $data['id_mahasiswa'], $data['nim'], $data['nm_mahasiswa'],
            $data['tempat_lahir'] ?? null, $data['tgl_lahir'] ?? null, $data['jenis_kelamin'] ?? null,
            $data['id_fakultas'] ?? null, $data['nm_fakultas'] ?? null,
            $data['id_prodi'] ?? null, $data['nm_prodi'] ?? null,
            $data['id_jenj_didik'] ?? null, $data['nm_jenjang'] ?? null,
            $data['angkatan'] ?? null, $data['semester_aktif'] ?? null, $data['id_smt'] ?? null,
            $data['ipk'] ?? null, $data['sks_lulus'] ?? null, $data['masa_studi_semester'] ?? null,
            $data['status_mahasiswa'] ?? null, $data['status_registrasi'] ?? null, $data['status_pembayaran'] ?? null,
            $data['id_creator'] ?? null,
        ]);
    }

    public function createRiwayat(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO layanan.riwayat_pengajuan (
                id_pengajuan, id_tahapan, urutan, nm_tahapan, status_dari, status_ke,
                id_aktor, nm_aktor, kode_role_aktor, catatan, tgl_mulai
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            RETURNING *
        ", [
            $data['id_pengajuan'], $data['id_tahapan'] ?? null,
            $data['urutan'], $data['nm_tahapan'],
            $data['status_dari'], $data['status_ke'],
            $data['id_aktor'] ?? null, $data['nm_aktor'] ?? null,
            $data['kode_role_aktor'] ?? null, $data['catatan'] ?? null,
        ]);
    }

    public function createDokumen(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO layanan.dokumen_pengajuan (
                id_pengajuan, id_persyaratan, nm_dokumen, nama_file_asli, path_file,
                tipe_file, ukuran_byte, id_pengunggah, keterangan, id_creator
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        ", [
            $data['id_pengajuan'], $data['id_persyaratan'] ?? null,
            $data['nm_dokumen'], $data['nama_file_asli'], $data['path_file'],
            $data['tipe_file'], $data['ukuran_byte'], $data['id_pengunggah'],
            $data['keterangan'] ?? null, $data['id_creator'] ?? null,
        ]);
    }

    public function deleteDokumen(string $id, ?string $userId = null): bool
    {
        return $this->pgUpdate(
            "UPDATE layanan.dokumen_pengajuan SET soft_delete = true, id_updater = ? WHERE id_dokumen = ?",
            [$userId, $id]
        ) > 0;
    }

    public function createPersetujuan(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO layanan.persetujuan_pengajuan (
                id_pengajuan, id_riwayat, id_approver, nm_approver, kode_role_approver,
                keputusan, catatan, id_creator
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        ", [
            $data['id_pengajuan'], $data['id_riwayat'] ?? null,
            $data['id_approver'], $data['nm_approver'] ?? null, $data['kode_role_approver'],
            $data['keputusan'], $data['catatan'] ?? null, $data['id_creator'] ?? null,
        ]);
    }

    public function createDokumenHasil(array $data): ?object
    {
        return $this->pgInsertReturning("
            INSERT INTO layanan.dokumen_hasil (
                id_pengajuan, id_template, jenis_output, nomor_dokumen, tgl_dokumen,
                nm_dokumen, path_file, tipe_file, ukuran_byte, id_penerbit, a_final, keterangan, id_creator
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        ", [
            $data['id_pengajuan'], $data['id_template'] ?? null,
            $data['jenis_output'], $data['nomor_dokumen'] ?? null, $data['tgl_dokumen'] ?? null,
            $data['nm_dokumen'], $data['path_file'], $data['tipe_file'] ?? 'application/pdf',
            $data['ukuran_byte'] ?? null, $data['id_penerbit'],
            $data['a_final'] ?? false, $data['keterangan'] ?? null, $data['id_creator'] ?? null,
        ]);
    }

    /**
     * Pengajuan mahasiswa saya — filtered by id_pemohon.
     */
    public function getMyPengajuan(string $idPemohon, array $params = []): array
    {
        $params['id_pemohon'] = $idPemohon;
        return $this->getList($params);
    }

    /**
     * Pengajuan queue verifikasi — only diajukan/perlu_perbaikan/diverifikasi.
     */
    public function getVerifikasiQueue(array $params = []): array
    {
        $statuses = "'diajukan','perlu_perbaikan','diverifikasi'";
        $params['_extra_where'] = "AND p.status IN ({$statuses})";
        // Use getList but with extra status filter
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $bindings = [];

        $where = "WHERE p.soft_delete = false AND p.status IN ('diajukan','perlu_perbaikan','diverifikasi')";

        $countSql = "SELECT COUNT(*) as total FROM layanan.pengajuan p {$where}";
        $total = $this->pgCount($countSql, $bindings);

        $dataSql = "
            SELECT p.id_pengajuan, p.nomor_permohonan, p.status, p.tgl_diajukan, p.created_at,
                   jl.kode_layanan, jl.nm_layanan, jl.kategori,
                   dp.nm_mahasiswa, dp.nim, dp.nm_prodi, dp.nm_fakultas
            FROM layanan.pengajuan p
            JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = p.id_jenis_layanan
            LEFT JOIN layanan.data_pemohon dp ON dp.id_pengajuan = p.id_pengajuan AND dp.soft_delete = false
            {$where}
            ORDER BY p.tgl_diajukan ASC NULLS LAST
            {$this->buildPagination($page, $limit)}
        ";
        $data = $this->pgSelect($dataSql, $bindings);

        return ['data' => $data, 'total' => $total];
    }

    /**
     * Approval queue — menunggu_persetujuan (legacy, backward compat).
     */
    public function getApprovalQueue(array $params = []): array
    {
        $params['kode_role'] = null;
        return $this->getApprovalQueueByRole($params);
    }

    /**
     * Approval queue filtered by role — hanya tampilkan pengajuan
     * yang ada di tahapan milik kode_role tertentu.
     *
     * Logika: JOIN ke ref.tahapan_layanan, cocokkan status pengajuan
     * dengan status_masuk tahapan yang punya kode_role = :role.
     */
    public function getApprovalQueueByRole(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $search = $params['search'] ?? null;
        $kodeRole = $params['kode_role'] ?? null;
        $bindings = [];

        $where = "WHERE p.soft_delete = false AND p.status NOT IN ('draft', 'terbit', 'ditolak')";

        if ($kodeRole) {
            // Hanya tampilkan pengajuan yang ada tahapan dengan kode_role ini pada status saat ini
            $where .= "
                AND EXISTS (
                    SELECT 1 FROM ref.tahapan_layanan t
                    WHERE t.id_jenis_layanan = p.id_jenis_layanan
                      AND t.status_masuk = p.status
                      AND t.kode_role = ?
                      AND t.soft_delete = false
                )
            ";
            $bindings[] = $kodeRole;
        }

        if ($search) {
            $where .= " AND (LOWER(p.nomor_permohonan) LIKE ? OR LOWER(dp.nm_mahasiswa) LIKE ? OR LOWER(dp.nim) LIKE ?)";
            $s = '%' . strtolower($search) . '%';
            array_push($bindings, $s, $s, $s);
        }

        $countSql = "
            SELECT COUNT(*) as total
            FROM layanan.pengajuan p
            LEFT JOIN layanan.data_pemohon dp ON dp.id_pengajuan = p.id_pengajuan AND dp.soft_delete = false
            {$where}
        ";
        $total = $this->pgCount($countSql, $bindings);

        $dataSql = "
            SELECT p.id_pengajuan, p.nomor_permohonan, p.status, p.tgl_diajukan, p.created_at,
                   jl.kode_layanan, jl.nm_layanan, jl.kategori,
                   dp.nm_mahasiswa, dp.nim, dp.nm_prodi, dp.nm_fakultas
            FROM layanan.pengajuan p
            JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = p.id_jenis_layanan
            LEFT JOIN layanan.data_pemohon dp ON dp.id_pengajuan = p.id_pengajuan AND dp.soft_delete = false
            {$where}
            ORDER BY p.tgl_diajukan ASC NULLS LAST
            {$this->buildPagination($page, $limit)}
        ";
        $data = $this->pgSelect($dataSql, $bindings);

        return ['data' => $data, 'total' => $total];
    }
}
