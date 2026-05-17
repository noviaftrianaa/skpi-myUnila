<?php

namespace App\Http\Controllers\Api\DataUnila;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\DataUnila\KerjasamaDataService;
use App\Services\DataUnila\TracerDataService;
use App\Services\DataUnila\TridarmaDataService;
use App\Services\DataUnila\KeuanganDataService;
use App\Services\DataUnila\TendikDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Overview Controller — universal totals untuk beranda Data Unila.
 *
 * Endpoint ini SENGAJA di-LUAR `scope` middleware → selalu return data
 * skala universitas, untuk navigasi/orientasi.
 *
 * Query canonical mengikuti pola public-service supaya angka KONSISTEN
 * antara portal publik dan dashboard internal.
 */
class OverviewController extends Controller
{
    use ApiResponse;

    private const UNILA_ID_SP = 'E2B705A7-173E-464A-9FAC-509128709515';

    public function totals(): JsonResponse
    {
        try {
            return $this->success([
                'mahasiswa' => [
                    'total' => $this->countMahasiswaAktif(),
                    'aktif' => $this->countMahasiswaAktif(),
                ],
                'dosen' => [
                    'total' => $this->countDosenAktif(),
                    'aktif' => $this->countDosenAktif(),
                ],
                'tendik' => [
                    'total' => $this->countTendikAktif(),
                ],
                'prodi' => [
                    'total' => $this->countProdiAktifAkreditasi(),
                ],
                'tridarma' => $this->getTridarmaTotals(),
                'kerjasama' => $this->getKerjasamaTotals(),
                'tracer' => $this->getTracerTotals(),
                'keuangan' => $this->getKeuanganTotals(),
            ], 'Total data Universitas Lampung');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    /**
     * Mahasiswa AKTIF — konsisten dgn public-service UnilaStatisticsRepository.
     * Filter: reg.id_jns_keluar IS NULL + pd.id_stat_mhs='A' + sms.stat_prodi='A'.
     */
    private function countMahasiswaAktif(): int
    {
        return Cache::remember('overview:mhs_aktif', 300, function () {
            // CANONICAL match Pimpinan beranda 37.181: count by reg_pd (per enrollment),
            // bukan COUNT DISTINCT pd.id_pd. 69 mhs punya >1 reg_pd aktif (S1+S2 dual).
            // Drop sms+jenjang JOIN supaya tidak filter sms.stat_prodi (sama dgn public-service).
            $row = DB::connection('sqlsrv')->select("
                SELECT COUNT(reg.id_reg_pd) AS total
                FROM pdrd.reg_pd AS reg
                INNER JOIN pdrd.peserta_didik AS pd
                    ON pd.id_pd = reg.id_pd AND pd.soft_delete = 0
                WHERE reg.soft_delete = 0
                    AND reg.id_jns_keluar IS NULL
                    AND pd.id_stat_mhs = 'A'
                    AND CAST(reg.id_sp AS VARCHAR(50)) = ?
            ", [self::UNILA_ID_SP]);
            return (int) ($row[0]->total ?? 0);
        });
    }

    /**
     * Dosen AKTIF — konsisten dgn public-service DosenRepository.getTotalDosen().
     * Filter: keaktifan_ptk homebase=1 + tahun_ajaran aktif + prodi aktif.
     */
    private function countDosenAktif(): int
    {
        return Cache::remember('overview:dosen_aktif', 300, function () {
            $thnAjaran = $this->getActiveTahunAjaran();
            $row = DB::connection('sqlsrv')->select("
                SELECT COUNT(DISTINCT ptk.id_sdm) AS total
                FROM pdrd.reg_ptk AS ptk
                INNER JOIN pdrd.sdm AS sdm
                    ON sdm.id_sdm = ptk.id_sdm AND sdm.soft_delete = 0
                    AND sdm.id_jns_sdm = '12'
                INNER JOIN pdrd.sms AS sms
                    ON sms.id_sms = ptk.id_sms AND sms.soft_delete = 0
                    AND sms.stat_prodi = 'A' AND sms.id_jns_sms = '3'
                    AND sms.id_fak_unila IS NOT NULL
                INNER JOIN ref.jenjang_pendidikan AS didik
                    ON didik.id_jenj_didik = sms.id_jenj_didik
                    AND didik.expired_date IS NULL
                INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                    ON keaktifan.id_reg_ptk = ptk.id_reg_ptk
                    AND keaktifan.soft_delete = 0
                    AND keaktifan.a_sp_homebase = 1
                    AND keaktifan.id_thn_ajaran = ?
                WHERE ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL
                    AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
            ", [$thnAjaran, self::UNILA_ID_SP]);
            return (int) ($row[0]->total ?? 0);
        });
    }

    /**
     * Prodi AKTIF — konsisten dgn public-service ProgramStudiRepository.
     * Filter: stat_prodi='A' + id_jns_sms='3' (reguler) + id_fak_unila NOT NULL.
     * Target count: 132 (sama dgn portal publik).
     */
    private function countProdiAktifAkreditasi(): int
    {
        return Cache::remember('overview:prodi_aktif', 300, function () {
            $row = DB::connection('sqlsrv')->select("
                SELECT COUNT(*) AS total
                FROM pdrd.sms
                WHERE soft_delete = 0
                  AND stat_prodi = 'A'
                  AND id_jns_sms = '3'
                  AND id_fak_unila IS NOT NULL
                  AND id_sp = ?
            ", [self::UNILA_ID_SP]);
            return (int) ($row[0]->total ?? 0);
        });
    }

    /**
     * Tridarma = pengajaran + penelitian + pengabdian + publikasi.
     * Pengajaran dihitung dari pdrd.kelas_kuliah utk semester aktif.
     */
    private function getTridarmaTotals(): array
    {
        $tridarmaService = new TridarmaDataService();
        $litabmasStats = $tridarmaService->getLitabmasStats();
        $publikasiStats = $tridarmaService->getPublikasiStats();
        $pengajaran = $this->countPengajaran();

        $penelitian = (int) ($litabmasStats['penelitian'] ?? 0);
        $pengabdian = (int) ($litabmasStats['pengabdian'] ?? 0);
        $publikasi  = (int) ($publikasiStats['total'] ?? 0);

        return [
            'total'      => $pengajaran + $penelitian + $pengabdian + $publikasi,
            'pengajaran' => $pengajaran,
            'penelitian' => $penelitian,
            'pengabdian' => $pengabdian,
            'publikasi'  => $publikasi,
        ];
    }

    /**
     * Pengajaran = jumlah kelas kuliah di semester aktif (a_periode_aktif=1).
     */
    private function countPengajaran(): int
    {
        return Cache::remember('overview:pengajaran', 300, function () {
            $row = DB::connection('sqlsrv')->select("
                SELECT COUNT(DISTINCT kk.id_kls) AS total
                FROM pdrd.kelas_kuliah kk WITH(NOLOCK)
                INNER JOIN ref.semester sm ON sm.id_smt = kk.id_smt
                    AND sm.a_periode_aktif = 1 AND sm.expired_date IS NULL
                INNER JOIN pdrd.sms s ON s.id_sms = kk.id_sms
                    AND s.soft_delete = 0 AND s.id_sp = ?
                WHERE kk.soft_delete = 0
            ", [self::UNILA_ID_SP]);
            return (int) ($row[0]->total ?? 0);
        });
    }

    private function getKerjasamaTotals(): array
    {
        $stats = (new KerjasamaDataService())->getStats();
        return [
            'total' => (int) ($stats['total'] ?? 0),
            'aktif' => (int) ($stats['aktif'] ?? 0),
        ];
    }

    private function getTracerTotals(): array
    {
        $stats = (new TracerDataService())->getStats([]);
        return ['total' => (int) ($stats['total'] ?? 0)];
    }

    private function getKeuanganTotals(): array
    {
        $stats = (new KeuanganDataService())->getUktStats();
        return ['total' => (int) ($stats['total'] ?? 0)];
    }

    /**
     * Tendik AKTIF dari sikep.pegawai (bukan PDDikti).
     * Filter: bukan Dosen (jns_tenaga != 'Dosen' AND nidn IS NULL).
     */
    private function countTendikAktif(): int
    {
        return Cache::remember('overview:tendik_aktif', 300, function () {
            $row = DB::connection('sqlsrv')->select("
                SELECT COUNT(*) AS total
                FROM sikep.pegawai
                WHERE status = 'Aktif'
                  AND (jns_tenaga IS NULL OR jns_tenaga != 'Dosen')
                  AND (nidn IS NULL OR nidn = '')
            ");
            return (int) ($row[0]->total ?? 0);
        });
    }

    private function getActiveTahunAjaran(): string
    {
        return Cache::remember('overview:active_thn_ajaran', 3600, function () {
            $row = DB::connection('sqlsrv')->select("
                SELECT TOP 1 id_thn_ajaran
                FROM ref.tahun_ajaran
                WHERE a_periode_aktif = 1 AND expired_date IS NULL
                ORDER BY id_thn_ajaran DESC
            ");
            return $row[0]->id_thn_ajaran ?? (string) date('Y');
        });
    }
}
