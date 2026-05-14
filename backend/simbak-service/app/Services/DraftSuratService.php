<?php

namespace App\Services;

use App\Repositories\Layanan\PengajuanRepository;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;

/**
 * Generate draft surat keterangan (PDF) untuk SK-* sebelum ditandatangani pimpinan.
 *
 * Alur:
 * 1. Admin BAK verifikasi pengajuan
 * 2. Klik "Download Draft" -> service ini render PDF dari template Blade
 * 3. Admin BAK kirim PDF ke pimpinan untuk TTD elektronik (BSrE)
 * 4. PDF signed di-upload kembali via tombol "Terbitkan Surat"
 */
class DraftSuratService
{
    protected PengajuanRepository $repository;

    /**
     * Mapping kode_layanan ke nama view Blade.
     */
    private const TEMPLATE_MAP = [
        'SK-KTM'    => 'templates.sk-ktm',
        'SK-PKKMB'  => 'templates.sk-pkkmb',
        'SK-HERREG' => 'templates.sk-herreg',
        'SK-LOA'    => 'templates.sk-loa',
    ];

    public function __construct()
    {
        $this->repository = new PengajuanRepository();
    }

    /**
     * Generate draft PDF untuk pengajuan tertentu.
     * Return: binary PDF content.
     */
    public function generate(string $idPengajuan): string
    {
        $pengajuan = $this->repository->findById($idPengajuan);
        if (!$pengajuan) {
            throw new \RuntimeException('Pengajuan tidak ditemukan');
        }

        $kodeLayanan = $pengajuan->kode_layanan ?? '';
        if (!isset(self::TEMPLATE_MAP[$kodeLayanan])) {
            throw new \RuntimeException("Template draft belum tersedia untuk layanan {$kodeLayanan}");
        }

        $dataPemohon = $this->repository->getDataPemohon($idPengajuan);
        $pejabat = $this->getPejabatSettings();
        $data = $this->buildTemplateData($pengajuan, $dataPemohon, $pejabat);

        // 1. Coba load body_html dari DB (template editable)
        $bodyHtml = $this->getEditableBody($pengajuan->id_jenis_layanan ?? null);

        if ($bodyHtml) {
            // Render placeholder {{key}} di body
            $data['body_html'] = $this->renderPlaceholder($bodyHtml, $data);
            $pdf = Pdf::loadView('templates.layout-surat', $data)->setPaper('a4', 'portrait');
        } else {
            // Fallback: pakai Blade template static
            $template = self::TEMPLATE_MAP[$kodeLayanan];
            $pdf = Pdf::loadView($template, $data)->setPaper('a4', 'portrait');
        }

        return $pdf->output();
    }

    /**
     * Generate preview PDF dengan data dummy (untuk preview di master data).
     */
    public function generatePreview(string $idJenisLayanan, ?string $bodyOverride = null): string
    {
        $jenisLayanan = DB::connection('pgsql')->selectOne(
            "SELECT kode_layanan, nm_layanan FROM ref.jenis_layanan WHERE id_jenis_layanan = ?",
            [$idJenisLayanan]
        );
        if (!$jenisLayanan) {
            throw new \RuntimeException('Jenis layanan tidak ditemukan');
        }

        $pejabat = $this->getPejabatSettings();
        $data = [
            'nomor_surat'           => '',
            'tahun'                 => date('Y'),
            'tgl_terbit'            => $this->formatTanggalIndo(date('Y-m-d')),
            'tempat_terbit'         => $pejabat['tempat_terbit'],
            // Dummy data
            'nm_mahasiswa'          => 'Revo Aulia Rahmando',
            'nim'                   => '2254221004',
            'nm_prodi'              => 'Ilmu Kelautan',
            'nm_fakultas'           => 'Pertanian',
            'angkatan'              => '2022',
            'tahun_pkkmb'           => '2022',
            'nomor_surat_polisi'    => 'TBL/C/284/IV/2026/LPG/RESTA BALAM/SEKTOR LB. RATU',
            'nomor_surat_ket_aktif' => '352/UN26.14/KM.00.03/2026',
            'nomor_sk_cuti'         => '123/UN26/PP/2025',
            'tgl_sk_cuti'           => $this->formatTanggalIndo('2025-09-01'),
            'pejabat_nama'          => $pejabat['nama'],
            'pejabat_nip'           => $pejabat['nip'],
            'pejabat_jabatan'       => $pejabat['jabatan'],
        ];

        // Pakai body override (saat user edit di CKEditor) atau dari DB
        $bodyHtml = $bodyOverride ?? $this->getEditableBody($idJenisLayanan);
        if (!$bodyHtml) {
            throw new \RuntimeException('Template HTML belum tersedia untuk layanan ini');
        }

        $data['body_html'] = $this->renderPlaceholder($bodyHtml, $data);
        $pdf = Pdf::loadView('templates.layout-surat', $data)->setPaper('a4', 'portrait');
        return $pdf->output();
    }

    /**
     * Render placeholder {{key}} di HTML dengan nilai dari $data.
     */
    public function renderPlaceholder(string $html, array $data): string
    {
        foreach ($data as $key => $val) {
            if (is_scalar($val) || $val === null) {
                $html = str_replace('{{' . $key . '}}', (string) ($val ?? ''), $html);
            }
        }
        return $html;
    }

    /**
     * Ambil body_html aktif dari template_dokumen untuk jenis layanan tertentu.
     */
    private function getEditableBody(?string $idJenisLayanan): ?string
    {
        if (!$idJenisLayanan) return null;
        $row = DB::connection('pgsql')->selectOne("
            SELECT body_html
            FROM ref.template_dokumen
            WHERE id_jenis_layanan = ?
              AND tipe_template = 'html_editable'
              AND a_aktif = true
              AND soft_delete = false
            ORDER BY created_at DESC
            LIMIT 1
        ", [$idJenisLayanan]);
        return $row?->body_html;
    }

    /**
     * Suggested filename untuk download.
     */
    public function filename(string $idPengajuan): string
    {
        $pengajuan = $this->repository->findById($idPengajuan);
        $dataPemohon = $pengajuan ? $this->repository->getDataPemohon($idPengajuan) : null;
        $kode = $pengajuan->kode_layanan ?? 'SURAT';
        $nim = $dataPemohon->nim ?? 'NPM';
        $tgl = date('Ymd');
        return "Draft-{$kode}-{$nim}-{$tgl}.pdf";
    }

    /**
     * Susun data untuk template.
     */
    private function buildTemplateData(object $pengajuan, ?object $dataPemohon, array $pejabat): array
    {
        // Format tanggal Indonesia
        $tglTerbit = $this->formatTanggalIndo(date('Y-m-d'));

        // Tahun PKKMB dari angkatan
        $tahunPkkmb = $dataPemohon->angkatan ?? null;

        return [
            'nomor_surat'           => '', // sengaja kosong, diisi saat terbitkan
            'tahun'                 => date('Y'),
            'tgl_terbit'            => $tglTerbit,
            'tempat_terbit'         => $pejabat['tempat_terbit'],
            // Data mahasiswa
            'nm_mahasiswa'          => $dataPemohon->nm_mahasiswa ?? '',
            'nim'                   => $dataPemohon->nim ?? '',
            'nm_prodi'              => $dataPemohon->nm_prodi ?? '',
            'nm_fakultas'           => $dataPemohon->nm_fakultas ?? '',
            'angkatan'              => $dataPemohon->angkatan ?? '',
            'tahun_pkkmb'           => $tahunPkkmb,
            // Surat pendukung (SK-KTM & SK-PKKMB)
            'nomor_surat_polisi'    => $pengajuan->nomor_surat_polisi ?? '',
            'nomor_surat_ket_aktif' => $pengajuan->nomor_surat_ket_aktif ?? '',
            // SK-HERREG
            'nomor_sk_cuti'         => $pengajuan->nomor_sk_cuti ?? '',
            'tgl_sk_cuti'           => $pengajuan->tgl_sk_cuti ? $this->formatTanggalIndo($pengajuan->tgl_sk_cuti) : '',
            // Pejabat
            'pejabat_nama'          => $pejabat['nama'],
            'pejabat_nip'           => $pejabat['nip'],
            'pejabat_jabatan'       => $pejabat['jabatan'],
        ];
    }

    /**
     * Ambil setting pejabat penandatangan dari ref.pengaturan_notifikasi.
     */
    private function getPejabatSettings(): array
    {
        $rows = DB::connection('pgsql')->select("
            SELECT kode, nilai FROM ref.pengaturan_notifikasi
            WHERE kode IN ('pejabat_nama', 'pejabat_nip', 'pejabat_jabatan', 'tempat_terbit')
        ");
        $map = [];
        foreach ($rows as $r) $map[$r->kode] = $r->nilai;

        return [
            'nama'          => $map['pejabat_nama'] ?? '___________',
            'nip'           => $map['pejabat_nip'] ?? '___________',
            'jabatan'       => $map['pejabat_jabatan'] ?? 'Kepala Biro Akademik dan Kemahasiswaan',
            'tempat_terbit' => $map['tempat_terbit'] ?? 'Bandar Lampung',
        ];
    }

    private function formatTanggalIndo(string $date): string
    {
        $bulan = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        $ts = strtotime($date);
        if (!$ts) return $date;
        return date('j', $ts) . ' ' . $bulan[(int) date('n', $ts)] . ' ' . date('Y', $ts);
    }
}
