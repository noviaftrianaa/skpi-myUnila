<?php

namespace App\Repositories\Dashboard;

use App\Repositories\BaseRepository;

class DashboardRepository extends BaseRepository
{
    public function getOverviewStats(): object
    {
        return $this->pgSelectOne("
            SELECT
                COUNT(*) as total_pengajuan,
                COUNT(*) FILTER (WHERE status IN ('diajukan')) as pengajuan_baru,
                COUNT(*) FILTER (WHERE status IN ('diverifikasi','menunggu_persetujuan')) as pengajuan_proses,
                COUNT(*) FILTER (WHERE status IN ('disetujui','terbit')) as pengajuan_selesai,
                COUNT(*) FILTER (WHERE status = 'ditolak') as pengajuan_ditolak,
                COUNT(*) FILTER (WHERE status = 'perlu_perbaikan') as pengajuan_perbaikan
            FROM layanan.pengajuan
            WHERE soft_delete = false
        ") ?? (object)['total_pengajuan' => 0];
    }

    public function getMyStats(string $idPemohon): object
    {
        return $this->pgSelectOne("
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'draft') as draft,
                COUNT(*) FILTER (WHERE status IN ('diajukan','diverifikasi','menunggu_persetujuan')) as proses,
                COUNT(*) FILTER (WHERE status IN ('disetujui','terbit')) as selesai,
                COUNT(*) FILTER (WHERE status = 'ditolak') as ditolak,
                COUNT(*) FILTER (WHERE status = 'perlu_perbaikan') as perbaikan
            FROM layanan.pengajuan
            WHERE id_pemohon = ? AND soft_delete = false
        ", [$idPemohon]) ?? (object)['total' => 0];
    }

    public function getSlaCompliance(): object
    {
        return $this->pgSelectOne("
            SELECT
                COUNT(*) FILTER (WHERE tgl_selesai IS NOT NULL) as total_selesai,
                COUNT(*) FILTER (
                    WHERE tgl_selesai IS NOT NULL
                    AND tgl_diajukan IS NOT NULL
                    AND EXTRACT(DAY FROM tgl_selesai - tgl_diajukan) <= COALESCE(jl.sla_hari, 14)
                ) as tepat_waktu
            FROM layanan.pengajuan p
            JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = p.id_jenis_layanan
            WHERE p.soft_delete = false
        ") ?? (object)['total_selesai' => 0, 'tepat_waktu' => 0];
    }

    public function getTrend6Bulan(): array
    {
        return $this->pgSelect("
            SELECT
                TO_CHAR(DATE_TRUNC('month', p.created_at), 'YYYY-MM') as bulan,
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE jl.kategori = 'surat_mandiri') as surat_mandiri,
                COUNT(*) FILTER (WHERE jl.kategori = 'permohonan_akademik') as permohonan,
                COUNT(*) FILTER (WHERE jl.kategori = 'batch_administrasi') as batch
            FROM layanan.pengajuan p
            JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = p.id_jenis_layanan
            WHERE p.soft_delete = false AND p.created_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', p.created_at)
            ORDER BY bulan ASC
        ");
    }

    public function getRecentActivity(int $limit = 10): array
    {
        return $this->pgSelect("
            SELECT r.*, p.nomor_permohonan, jl.nm_layanan
            FROM layanan.riwayat_pengajuan r
            JOIN layanan.pengajuan p ON p.id_pengajuan = r.id_pengajuan AND p.soft_delete = false
            JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = p.id_jenis_layanan
            WHERE r.status_ke != 'draft'
            ORDER BY r.created_at DESC
            LIMIT ?
        ", [$limit]);
    }

    /**
     * Monitoring: mahasiswa aktif dari pdut (SQL Server, read-only).
     * Status mahasiswa ada di siakadu.kuliah_mhs (bukan pdrd.reg_pd).
     */
    public function getMahasiswaAktif(array $params = []): array
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $fakultas = $params['fakultas'] ?? null;
        $bindings = [];

        $where = "WHERE km.id_stat_mhs = 'A'";
        if ($fakultas) {
            $where .= " AND sms.nm_lemb LIKE ?";
            $bindings[] = '%' . $fakultas . '%';
        }

        $countSql = "
            SELECT COUNT(*) as total
            FROM siakadu.kuliah_mhs km
            JOIN pdrd.reg_pd rp ON rp.id_reg_pd = km.id_reg_pd
            JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd
            JOIN pdrd.sms sms ON sms.id_sms = rp.id_sms
            {$where}
        ";
        $total = $this->pdutSelectOne($countSql, $bindings)->total ?? 0;

        $offset = ($page - 1) * $limit;
        $dataSql = "
            SELECT
                rp.nipd as nim, pd.nm_pd as nama,
                sms.nm_lemb as prodi,
                km.id_stat_mhs as status
            FROM siakadu.kuliah_mhs km
            JOIN pdrd.reg_pd rp ON rp.id_reg_pd = km.id_reg_pd
            JOIN pdrd.peserta_didik pd ON pd.id_pd = rp.id_pd
            JOIN pdrd.sms sms ON sms.id_sms = rp.id_sms
            {$where}
            ORDER BY pd.nm_pd ASC
            OFFSET {$offset} ROWS FETCH NEXT {$limit} ROWS ONLY
        ";
        $data = $this->pdutSelect($dataSql, $bindings);

        return ['data' => $data, 'total' => (int)$total];
    }
}
