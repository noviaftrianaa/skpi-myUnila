<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * KtwSporditRepository — read-only query ke DB spordit (dashboard internal Unila PDDIKTI).
 *
 * Tujuan: reconcile angka KTW MyUnila (dari pdut realtime) vs spordit batch bulanan.
 * Bila drift > 2% → log + alert. Spordit TIDAK dijadikan source of truth.
 *
 * Connection: 'spordit' (config/database.php), env SPORDIT_DB_*.
 */
class KtwSporditRepository
{
    /**
     * Info batch terbaru dari generate_lulusan.
     */
    public function getLatestBatchInfo(): ?array
    {
        try {
            $r = DB::connection('spordit')->selectOne("
                SELECT id_log, tgl_generate::text AS tgl_generate, total_lulusan, flag_finish
                FROM akademik.generate_lulusan
                WHERE flag_finish = 1
                ORDER BY tgl_generate DESC
                LIMIT 1
            ");
            return $r ? (array) $r : null;
        } catch (\Throwable $e) {
            Log::warning('KtwSporditRepository.getLatestBatchInfo: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Raw count dari mahasiswa_feeder (lebih realtime daripada generate_lulusan batch).
     * Mirror struktur KtwRepository::getOverviewByCohort.
     */
    public function getOverviewByCohortRaw(int $cohortYear, string $jenjang = 'S1'): array
    {
        // Map angkatan tahun → id_periode_masuk (format YYYY1 gasal, YYYY2 genap)
        $periodeMasuk = $cohortYear * 10 + 1;  // contoh 2021 → 20211

        $strataMap = ['D3' => 'D3', 'S1' => 'S1', 'S2' => 'S2', 'S3' => 'S3'];
        $strataKode = $strataMap[$jenjang] ?? 'S1';

        // Masa normatif per strata (tahun)
        $normatifMap = ['D3' => 3.0, 'S1' => 4.0, 'S2' => 2.0, 'S3' => 3.0];
        $normatif = $normatifMap[$jenjang] ?? 4.0;
        $tolerant = $normatif + 0.25;

        try {
            $r = DB::connection('spordit')->selectOne("
                SELECT
                    COUNT(*) AS maba,
                    SUM(CASE WHEN mf.id_jenis_keluar = 1 THEN 1 ELSE 0 END) AS sudah_lulus,
                    SUM(CASE WHEN mf.id_jenis_keluar = 1
                        AND mf.masa_mukim_by_tglkeluar <= ?
                    THEN 1 ELSE 0 END) AS ktw_strict,
                    SUM(CASE WHEN mf.id_jenis_keluar = 1
                        AND mf.masa_mukim_by_tglkeluar <= ?
                    THEN 1 ELSE 0 END) AS ktw_tolerant,
                    SUM(CASE WHEN mf.id_jenis_keluar = 0 THEN 1 ELSE 0 END) AS masih_aktif
                FROM akademik.mahasiswa_feeder mf
                INNER JOIN master_ref.program_studi ps ON ps.kode_dikti = mf.kdpst
                INNER JOIN master_ref.strata_program sp ON sp.kode_strata = ps.kode_strata
                WHERE mf.id_periode_masuk = ?
                  AND sp.nama_strata = ?
            ", [$normatif, $tolerant, $periodeMasuk, $strataKode]);

            if (!$r) return $this->emptyOverview();

            $maba = (int) ($r->maba ?? 0);
            return [
                'maba' => $maba,
                'sudah_lulus' => (int) ($r->sudah_lulus ?? 0),
                'ktw_strict' => (int) ($r->ktw_strict ?? 0),
                'ktw_tolerant' => (int) ($r->ktw_tolerant ?? 0),
                'masih_aktif' => (int) ($r->masih_aktif ?? 0),
                'pct_ktw_strict' => $maba > 0 ? round($r->ktw_strict / $maba * 100, 2) : 0.0,
                'pct_ktw_tolerant' => $maba > 0 ? round($r->ktw_tolerant / $maba * 100, 2) : 0.0,
                'pct_survival' => $maba > 0 ? round($r->sudah_lulus / $maba * 100, 2) : 0.0,
            ];
        } catch (\Throwable $e) {
            Log::warning('KtwSporditRepository.getOverviewByCohortRaw: ' . $e->getMessage());
            return $this->emptyOverview();
        }
    }

    /**
     * Batch pre-aggregated dari masa_studi_generate_lulusan (snapshot bulanan).
     * Catatan: batch sering undercount karena filter tambahan yang tidak terdokumentasi.
     * Dipakai untuk compare saja, bukan authoritative.
     */
    public function getBatchAggregateByCohort(int $cohortYear, string $jenjang = 'S1'): array
    {
        try {
            $latest = $this->getLatestBatchInfo();
            if (!$latest) return $this->emptyOverview();

            $r = DB::connection('spordit')->selectOne("
                SELECT
                    SUM(m.jml_mahasiswa) AS maba,
                    SUM(m.jml_lulusan_angkatan) AS sudah_lulus,
                    SUM(m.jml_ktw) AS ktw_strict
                FROM akademik.masa_studi_generate_lulusan m
                JOIN master_ref.strata_program sp ON sp.kode_strata = m.kode_strata
                WHERE m.id_log = ?
                  AND m.flag_pindahan = 0
                  AND sp.nama_strata = ?
                  AND m.tahun = ?
            ", [$latest['id_log'], $jenjang, $cohortYear]);

            if (!$r) return $this->emptyOverview();

            $maba = (int) ($r->maba ?? 0);
            return [
                'maba' => $maba,
                'sudah_lulus' => (int) ($r->sudah_lulus ?? 0),
                'ktw_strict' => (int) ($r->ktw_strict ?? 0),
                'ktw_tolerant' => 0, // batch tidak hitung tolerant
                'masih_aktif' => 0,
                'pct_ktw_strict' => $maba > 0 ? round($r->ktw_strict / $maba * 100, 2) : 0.0,
                'pct_ktw_tolerant' => 0.0,
                'pct_survival' => $maba > 0 ? round($r->sudah_lulus / $maba * 100, 2) : 0.0,
                'batch_id_log' => $latest['id_log'],
                'batch_tgl_generate' => $latest['tgl_generate'],
            ];
        } catch (\Throwable $e) {
            Log::warning('KtwSporditRepository.getBatchAggregateByCohort: ' . $e->getMessage());
            return $this->emptyOverview();
        }
    }

    /**
     * Check koneksi. Return true kalau bisa.
     */
    public function isConnected(): bool
    {
        try {
            DB::connection('spordit')->selectOne('SELECT 1 AS ok');
            return true;
        } catch (\Throwable $e) {
            return false;
        }
    }

    protected function emptyOverview(): array
    {
        return [
            'maba' => 0, 'sudah_lulus' => 0,
            'ktw_strict' => 0, 'ktw_tolerant' => 0, 'masih_aktif' => 0,
            'pct_ktw_strict' => 0.0, 'pct_ktw_tolerant' => 0.0, 'pct_survival' => 0.0,
        ];
    }
}
