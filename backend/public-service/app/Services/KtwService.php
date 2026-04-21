<?php

namespace App\Services;

use App\Repositories\KtwRepository;
use App\Repositories\KtwSporditRepository;
use Illuminate\Support\Facades\Cache;

/**
 * Cache strategy:
 *   - TTL default 600 detik (10 menit) untuk semua data KTW
 *   - Cache key: `ktw:{scope}:{params}` — mudah di-invalidate per-scope
 *   - Method `flushCache()` untuk force refresh (dipanggil dari endpoint /ktw/refresh)
 */

/**
 * KtwService — orchestrator KTW (Kelulusan Tepat Waktu).
 *
 * Primary: pdut realtime (KtwRepository)
 * Reconcile: spordit (KtwSporditRepository)
 *
 * Semua response termasuk metadata:
 *   - source: "pdut" (primary)
 *   - formula: "DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar) / 365.25 <= masa_normatif"
 *   - masa_normatif_tahun: 4.0 (S1), dst
 *   - as_of: timestamp query
 */
class KtwService
{
    /** TTL cache default 10 menit — data KTW berubah lambat (lulusan baru muncul harian). */
    protected const CACHE_TTL = 600;

    public function __construct(
        protected KtwRepository $pdut,
        protected KtwSporditRepository $spordit,
    ) {}

    /**
     * Dynamic cutoff presets — dari ref.semester + static common.
     */
    public function getSemesterPresets(): array
    {
        return Cache::remember("ktw:presets", 3600, function () {
            return [
                'data' => $this->pdut->getSemesterPresets(),
                'as_of' => now()->toIso8601String(),
            ];
        });
    }

    /**
     * Top N prodi KTW tertinggi untuk angkatan + jenjang + cutoff.
     */
    public function getTopProdi(int $cohortYear, string $jenjang = 'S1', int $limit = 10, ?string $cutoffDate = null): array
    {
        $cutoff = $cutoffDate ?: date('Y-m-d');
        return Cache::remember("ktw:top_prodi:{$cohortYear}:{$jenjang}:{$limit}:{$cutoff}", self::CACHE_TTL, function () use ($cohortYear, $jenjang, $limit, $cutoff) {
            return [
                'scope' => 'top_prodi',
                'cohort_year' => $cohortYear,
                'jenjang' => $jenjang,
                'cutoff_date' => $cutoff,
                'limit' => $limit,
                'data' => $this->pdut->getTopProdi($cohortYear, $jenjang, $limit, $cutoff),
                'meta' => $this->baseMeta($jenjang, $cohortYear, $cutoff),
            ];
        });
    }

    /**
     * Flush semua cache KTW. Dipanggil saat tombol "Refresh" di UI.
     */
    public function flushCache(): int
    {
        // Redis tags not used; pakai pattern delete
        $store = Cache::getStore();
        if (method_exists($store, 'getPrefix')) {
            $prefix = $store->getPrefix();
            try {
                $conn = Cache::connection ?? null;
            } catch (\Throwable) {}
        }
        // Simpler: flush specific keys manually — loop known key patterns
        $patterns = ['overview', 'by_fak', 'by_prodi', 'prodi_detail', 'trend', 'status', 'gender', 'jalur', 'masa_stats'];
        $count = 0;
        // Best-effort: delete by common prefix (cache will auto-rebuild on next fetch)
        foreach ($patterns as $p) {
            // use Redis directly if available
            try {
                $keys = Cache::store('redis')->getStore()->connection()->keys("*ktw:{$p}*");
                foreach ($keys as $k) {
                    $plainKey = str_replace(Cache::getPrefix(), '', $k);
                    Cache::forget($plainKey);
                    $count++;
                }
            } catch (\Throwable $e) {
                // fallback: cache.clear via laravel (costly)
            }
        }
        return $count;
    }

    /**
     * Overview univ-wide per jenjang untuk angkatan tertentu.
     */
    public function getOverviewByCohort(int $cohortYear, string $jenjang = 'S1', bool $withReconcile = false, ?string $cutoffDate = null): array
    {
        $cutoff = $cutoffDate ?: date('Y-m-d');
        $cacheKey = "ktw:overview:{$cohortYear}:{$jenjang}:{$cutoff}" . ($withReconcile ? ':recon' : '');

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($cohortYear, $jenjang, $withReconcile, $cutoff) {
            $data = $this->pdut->getOverviewByCohort($cohortYear, $jenjang, $cutoff);

            $response = [
                'scope' => 'univ_angkatan',
                'cohort_year' => $cohortYear,
                'jenjang' => $jenjang,
                'cutoff_date' => $cutoff,
                'data' => $data,
                'meta' => $this->baseMeta($jenjang, $cohortYear, $cutoff),
            ];

            if ($withReconcile) {
                $response['reconcile'] = $this->reconcileOverview($cohortYear, $jenjang, $data);
            }

            return $response;
        });
    }

    /**
     * Per-fakultas list untuk 1 jenjang + angkatan.
     */
    public function getByFakultas(int $cohortYear, string $jenjang = 'S1', ?string $cutoffDate = null): array
    {
        $cutoff = $cutoffDate ?: date('Y-m-d');
        return Cache::remember("ktw:by_fak:{$cohortYear}:{$jenjang}:{$cutoff}", self::CACHE_TTL, function () use ($cohortYear, $jenjang, $cutoff) {
            $rows = $this->pdut->getByFakultas($cohortYear, $jenjang, $cutoff);
            $summary = $this->summarize($rows);

            return [
                'scope' => 'univ_angkatan_per_fakultas',
                'cohort_year' => $cohortYear,
                'jenjang' => $jenjang,
                'cutoff_date' => $cutoff,
                'summary' => $summary,
                'data' => $rows,
                'meta' => $this->baseMeta($jenjang, $cohortYear, $cutoff),
            ];
        });
    }

    /**
     * Per-prodi list, bisa filter by fakultas (uniqueidentifier id_sms fakultas).
     */
    public function getByProdi(int $cohortYear, string $jenjang = 'S1', ?string $idFakultas = null, ?string $cutoffDate = null): array
    {
        $cutoff = $cutoffDate ?: date('Y-m-d');
        $cacheKey = "ktw:by_prodi:{$cohortYear}:{$jenjang}:" . ($idFakultas ?? 'all') . ":{$cutoff}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($cohortYear, $jenjang, $idFakultas, $cutoff) {
            $rows = $this->pdut->getByProdi($cohortYear, $jenjang, $idFakultas, $cutoff);
            $summary = $this->summarize($rows);

            return [
                'scope' => 'univ_angkatan_per_prodi',
                'cohort_year' => $cohortYear,
                'jenjang' => $jenjang,
                'id_fakultas' => $idFakultas,
                'cutoff_date' => $cutoff,
                'summary' => $summary,
                'data' => $rows,
                'meta' => $this->baseMeta($jenjang, $cohortYear, $cutoff),
            ];
        });
    }

    /**
     * Detail satu prodi + reconcile ke spordit.
     */
    public function getProdiDetail(string $idSms, int $cohortYear, bool $withReconcile = true): array
    {
        $cacheKey = "ktw:prodi_detail:{$idSms}:{$cohortYear}" . ($withReconcile ? ':recon' : '');

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($idSms, $cohortYear, $withReconcile) {
            $detail = $this->pdut->getProdiDetail($idSms, $cohortYear);
            if (!$detail) return ['error' => 'prodi not found'];

            $response = [
                'scope' => 'prodi_detail',
                'cohort_year' => $cohortYear,
                'prodi' => $detail['prodi'],
                'jenjang' => $detail['jenjang_kode'],
                'overview' => $detail['overview'],
                'meta' => $this->baseMeta($detail['jenjang_kode']),
            ];

            if ($withReconcile) {
                $response['reconcile'] = $this->reconcileOverview(
                    $cohortYear,
                    $detail['jenjang_kode'],
                    $detail['overview']
                );
            }

            return $response;
        });
    }

    /**
     * Trend KTW 5-10 tahun (cohort range) univ-wide per jenjang.
     */
    public function getTrend(string $jenjang, int $startYear, int $endYear): array
    {
        return Cache::remember("ktw:trend:{$jenjang}:{$startYear}:{$endYear}", 1800, function () use ($jenjang, $startYear, $endYear) {
            $rows = $this->pdut->getTrendAllCohorts($jenjang, $startYear, $endYear);

            return [
                'scope' => 'univ_trend',
                'jenjang' => $jenjang,
                'cohort_range' => ['start' => $startYear, 'end' => $endYear],
                'data' => $rows,
                'meta' => $this->baseMeta($jenjang),
            ];
        });
    }

    /**
     * Individual mahasiswa list per prodi (paginated).
     * NOTE: TIDAK dipakai di infografis public. Hanya dashboard pimpinan + raw data service.
     */
    public function getMahasiswaListByProdi(string $idSms, int $cohortYear, int $page = 1, int $limit = 50): array
    {
        $result = $this->pdut->getMahasiswaListByProdi($idSms, $cohortYear, $page, $limit);

        return [
            'scope' => 'prodi_mahasiswa_list',
            'cohort_year' => $cohortYear,
            'id_prodi' => $idSms,
            'jenjang' => $result['jenjang_kode'] ?? null,
            'data' => $result['data'],
            'pagination' => [
                'total' => $result['total'],
                'per_page' => $limit,
                'current_page' => $page,
                'last_page' => max(1, (int) ceil(($result['total'] ?? 0) / max($limit, 1))),
            ],
            'meta' => $this->baseMeta($result['jenjang_kode'] ?? 'S1'),
        ];
    }

    /**
     * Breakdown status mahasiswa (Lulus/Aktif/DO/PS/Undur/Mutasi/etc.) per angkatan.
     */
    public function getStatusBreakdown(int $cohortYear, string $jenjang = 'S1', ?string $cutoffDate = null): array
    {
        $cutoff = $cutoffDate ?: date('Y-m-d');
        return Cache::remember("ktw:status:{$cohortYear}:{$jenjang}:{$cutoff}", self::CACHE_TTL, function () use ($cohortYear, $jenjang, $cutoff) {
            return [
                'scope' => 'status_breakdown',
                'cohort_year' => $cohortYear,
                'jenjang' => $jenjang,
                'cutoff_date' => $cutoff,
                'data' => $this->pdut->getStatusBreakdown($cohortYear, $jenjang, $cutoff),
                'meta' => $this->baseMeta($jenjang, $cohortYear, $cutoff),
            ];
        });
    }

    /**
     * Breakdown per jalur daftar (SBMPTN/SNMPTN/Mandiri/dll).
     */
    public function getJalurBreakdown(int $cohortYear, string $jenjang = 'S1', ?string $cutoffDate = null): array
    {
        $cutoff = $cutoffDate ?: date('Y-m-d');
        return Cache::remember("ktw:jalur:{$cohortYear}:{$jenjang}:{$cutoff}", self::CACHE_TTL, function () use ($cohortYear, $jenjang, $cutoff) {
            return [
                'scope' => 'jalur_breakdown',
                'cohort_year' => $cohortYear,
                'jenjang' => $jenjang,
                'cutoff_date' => $cutoff,
                'data' => $this->pdut->getJalurBreakdown($cohortYear, $jenjang, $cutoff),
                'meta' => $this->baseMeta($jenjang, $cohortYear, $cutoff),
            ];
        });
    }

    /**
     * Statistik masa mukim lulusan.
     */
    public function getMasaMukimStats(int $cohortYear, string $jenjang = 'S1', ?string $cutoffDate = null): array
    {
        $cutoff = $cutoffDate ?: date('Y-m-d');
        return Cache::remember("ktw:masa_stats:{$cohortYear}:{$jenjang}:{$cutoff}", self::CACHE_TTL, function () use ($cohortYear, $jenjang, $cutoff) {
            return [
                'scope' => 'masa_mukim_stats',
                'cohort_year' => $cohortYear,
                'jenjang' => $jenjang,
                'cutoff_date' => $cutoff,
                'data' => $this->pdut->getMasaMukimStats($cohortYear, $jenjang, $cutoff),
                'meta' => $this->baseMeta($jenjang, $cohortYear, $cutoff),
            ];
        });
    }

    /**
     * Breakdown gender Laki-laki vs Perempuan per angkatan + KTW per gender.
     */
    public function getGenderBreakdown(int $cohortYear, string $jenjang = 'S1', ?string $cutoffDate = null): array
    {
        $cutoff = $cutoffDate ?: date('Y-m-d');
        return Cache::remember("ktw:gender:{$cohortYear}:{$jenjang}:{$cutoff}", self::CACHE_TTL, function () use ($cohortYear, $jenjang, $cutoff) {
            return [
                'scope' => 'gender_breakdown',
                'cohort_year' => $cohortYear,
                'jenjang' => $jenjang,
                'cutoff_date' => $cutoff,
                'data' => $this->pdut->getGenderBreakdown($cohortYear, $jenjang, $cutoff),
                'meta' => $this->baseMeta($jenjang, $cohortYear, $cutoff),
            ];
        });
    }

    /**
     * Reconciliation summary: pdut vs spordit raw + spordit batch.
     */
    public function reconcile(int $cohortYear, string $jenjang = 'S1'): array
    {
        $pdutData = $this->pdut->getOverviewByCohort($cohortYear, $jenjang);
        return [
            'cohort_year' => $cohortYear,
            'jenjang' => $jenjang,
            'pdut' => $pdutData,
            'spordit_connected' => $this->spordit->isConnected(),
            'reconcile' => $this->reconcileOverview($cohortYear, $jenjang, $pdutData),
        ];
    }

    // ================================
    // Helpers
    // ================================

    protected function reconcileOverview(int $cohortYear, string $jenjang, array $pdutData): array
    {
        $sporditRaw = $this->spordit->getOverviewByCohortRaw($cohortYear, $jenjang);
        $sporditBatch = $this->spordit->getBatchAggregateByCohort($cohortYear, $jenjang);

        $driftMabaRaw = $sporditRaw['maba'] - $pdutData['maba'];
        $driftKtwRaw = $sporditRaw['ktw_strict'] - $pdutData['ktw_strict'];
        $driftMabaBatch = $sporditBatch['maba'] - $pdutData['maba'];
        $driftKtwBatch = $sporditBatch['ktw_strict'] - $pdutData['ktw_strict'];

        $pctDriftKtwRaw = $pdutData['maba'] > 0 ? round(abs($driftKtwRaw) / $pdutData['maba'] * 100, 2) : 0;
        $pctDriftKtwBatch = $pdutData['maba'] > 0 ? round(abs($driftKtwBatch) / $pdutData['maba'] * 100, 2) : 0;

        return [
            'spordit_raw' => array_merge($sporditRaw, [
                'drift_maba' => $driftMabaRaw,
                'drift_ktw_strict' => $driftKtwRaw,
                'pct_drift_ktw' => $pctDriftKtwRaw,
                'status' => $pctDriftKtwRaw < 1.0 ? 'ok' : ($pctDriftKtwRaw < 5.0 ? 'warning' : 'drift'),
            ]),
            'spordit_batch' => array_merge($sporditBatch, [
                'drift_maba' => $driftMabaBatch,
                'drift_ktw_strict' => $driftKtwBatch,
                'pct_drift_ktw' => $pctDriftKtwBatch,
                'status' => $pctDriftKtwBatch < 5.0 ? 'ok' : ($pctDriftKtwBatch < 15.0 ? 'warning' : 'drift'),
                'note' => 'Batch spordit sering undercount karena filter tambahan (stat_prodi, no_seri_ijazah). Bukan authoritative.',
            ]),
        ];
    }

    protected function summarize(array $rows): array
    {
        $maba = 0; $lulus = 0; $strict = 0; $tol = 0;
        foreach ($rows as $r) {
            $maba += (int) ($r['maba'] ?? 0);
            $lulus += (int) ($r['sudah_lulus'] ?? 0);
            $strict += (int) ($r['ktw_strict'] ?? 0);
            $tol += (int) ($r['ktw_tolerant'] ?? 0);
        }
        return [
            'maba' => $maba,
            'sudah_lulus' => $lulus,
            'ktw_strict' => $strict,
            'ktw_tolerant' => $tol,
            'pct_ktw_strict' => $maba > 0 ? round($strict / $maba * 100, 2) : 0.0,
            'pct_ktw_tolerant' => $maba > 0 ? round($tol / $maba * 100, 2) : 0.0,
            'pct_survival' => $maba > 0 ? round($lulus / $maba * 100, 2) : 0.0,
        ];
    }

    protected function baseMeta(string $jenjang, ?int $cohortYear = null, ?string $cutoff = null): array
    {
        $idSmt = $cohortYear ? sprintf('%d1', $cohortYear) : null;
        return [
            'source' => 'pdut (realtime)',
            'formula' => 'DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar) / 365.25 <= masa_normatif',
            'masa_normatif_tahun' => KtwRepository::MASA_NORMATIF[$jenjang] ?? null,
            'tolerance_tahun' => KtwRepository::TOLERANCE_YEARS,
            'jenjang' => $jenjang,
            'filter_jns_daftar' => 'id_jns_daftar = 1 (Peserta Didik Baru murni — exclude Pindahan, Lintas Jalur, Alih Jenjang, RPL)',
            'filter_periode_masuk' => $idSmt ? "id_smt = '{$idSmt}' (hanya angkatan Gasal)" : null,
            'cutoff_date' => $cutoff,
            'cutoff_note' => $cutoff ? "Mahasiswa dihitung lulus kalau tgl_keluar <= {$cutoff}." : null,
            'as_of' => now()->toIso8601String(),
            'note_cuti' => 'Masa mukim dihitung kalender (tgl_keluar - tgl_masuk_sp) tanpa exclude cuti, sesuai PDDIKTI feeder standard.',
            'note_wali_data' => 'Per arahan tim wali data 2026-04-21: KTW hanya untuk angkatan Gasal + Peserta Didik Baru murni, cutoff bisa disesuaikan.',
        ];
    }
}
