<?php

namespace App\Services\Dashboard;

use App\Repositories\Dashboard\DosenRepository;
use App\Repositories\Dashboard\IkuRepository;
use App\Services\CacheService;
use Illuminate\Support\Facades\Log;

class IkuService
{
    protected IkuRepository $repository;
    protected DosenRepository $dosenRepository;
    protected CacheService $cache;

    public function __construct()
    {
        $this->repository = new IkuRepository();
        $this->dosenRepository = new DosenRepository();
        $this->cache = new CacheService();
    }

    // =========================================
    // CONFIG
    // =========================================

    /**
     * Get target IKU dari config/iku.php.
     * Cek override tahun dulu, fallback ke default.
     */
    private function getTarget(string $ikuKey, int $year): float
    {
        $yearConfig = config("iku.{$year}.{$ikuKey}.target");
        if ($yearConfig !== null) {
            return (float) $yearConfig;
        }
        return (float) config("iku.default.{$ikuKey}.target", 0);
    }

    /**
     * Build list IKU opsional dari config.
     * Data belum tersedia di database, kirim metadata + value 0.
     */
    private function buildOpsionalList(int $currentYear): array
    {
        $opsional = config('iku.opsional', []);
        $result = [];

        foreach ($opsional as $id => $meta) {
            $ikuKey = 'iku' . $id;
            $target = $this->getTarget($ikuKey, $currentYear);

            $result[] = [
                'id' => $id,
                'code' => $meta['code'],
                'title' => $meta['title'],
                'definition' => '',
                'value' => 0,
                'target' => $target,
                'color' => $meta['color'] ?? '#9ca3af',
                'unit' => $meta['unit'] ?? '%',
                'trendData' => [],
                'drilldownData' => [],
            ];
        }

        return $result;
    }

    // =========================================
    // MAIN
    // =========================================

    /**
     * Get all IKU data.
     * Filter: tahun (single, e.g. "2026").
     * Semester di-derive dari config/iku.php → semesters.
     *
     * Setiap IKU di-cache terpisah agar:
     * - Partial success: jika satu IKU timeout, yang lain tetap ter-cache
     * - Warm-up lebih cepat: cache key per-IKU lebih granular
     */
    public function getData(array $params): array
    {
        $currentYear = !empty($params['tahun']) ? (int) $params['tahun'] : (int) date('Y');
        $years = [$currentYear];
        $fakultas = $params['fakultas'] ?? null;

        // Derive semesters dari config
        $semesters = $this->getSemestersForYear($currentYear);

        $baseFilters = ['tahun' => $currentYear, 'fakultas' => $fakultas];

        return [
            'ikuWajib' => config('iku.wajib', [1, 2, 3, 5, 7, 9]),
            'ikuOpsional' => $this->buildOpsionalList($currentYear),
            'iku1' => $this->cacheIku('iku1', $baseFilters, fn() => $this->buildIKU1($semesters, $years, $fakultas)),
            'iku2' => $this->cacheIku('iku2', $baseFilters, fn() => $this->buildIKU2($years, $fakultas)),
            'iku3' => $this->cacheIku('iku3', $baseFilters, fn() => $this->buildIKU3($semesters, $years, $fakultas)),
            'iku5' => $this->cacheIku('iku5', $baseFilters, fn() => $this->buildIKU5($years, $fakultas)),
            'iku7' => $this->cacheIku('iku7', $baseFilters, fn() => $this->buildIKU7($years, $fakultas)),
            'iku9' => $this->cacheIku('iku9', $baseFilters, fn() => $this->buildIKU9($years, $fakultas)),
        ];
    }

    /**
     * Cache individual IKU. Jika error/timeout, return null agar IKU lain tetap jalan.
     */
    private function cacheIku(string $ikuKey, array $filters, \Closure $builder): ?array
    {
        $key = $this->cache->buildKey('iku', $ikuKey, $filters);

        try {
            return $this->cache->remember($key, CacheService::TTL_IKU, $builder);
        } catch (\Exception $e) {
            Log::error("IKU {$ikuKey} failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Cache trend data terpisah dengan TTL 24 jam.
     * Trend = 5 tahun historis, jarang berubah → cache lebih lama.
     */
    private function cacheTrend(string $ikuKey, int $currentYear, \Closure $builder): array
    {
        $key = $this->cache->buildKey('iku', "trend_{$ikuKey}", ['year' => $currentYear]);

        try {
            return $this->cache->remember($key, CacheService::TTL_REFERENCE, $builder);
        } catch (\Exception $e) {
            Log::warning("Trend {$ikuKey} failed: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get semester id_smt list for a given tahun from config.
     * e.g. tahun 2026 + config default ['1','2'] → ['20261','20262']
     */
    private function getSemestersForYear(int $year): array
    {
        $yearOverride = config("iku.semesters.{$year}");
        $suffixes = $yearOverride ?? config('iku.semesters.default', ['1', '2']);

        return array_map(function ($suffix) use ($year) {
            return $year . $suffix;
        }, $suffixes);
    }

    // =========================================
    // IKU 1: AEE
    // =========================================

    private function buildIKU1(array $semesters, array $years, ?string $fakultas): array
    {
        $currentYear = $years[0] ?? (int) date('Y');
        $target = $this->getTarget('iku1', $currentYear);
        $aeeData = $this->repository->calculateAEEPT($semesters, $years, $fakultas);
        $trend = $this->cacheTrend('iku1', $currentYear, fn() => $this->repository->getTrendAEE($currentYear));
        $drilldown = $this->buildDrilldownFakultas($semesters, $years, $target);

        return [
            'id' => 1,
            'code' => 'IKU 1',
            'title' => 'Angka Efisiensi Edukasi Perguruan Tinggi (AEE)',
            'definition' => 'Indikator yang mengukur tingkat keberhasilan mahasiswa menyelesaikan studi tepat waktu sesuai masa studi standar, dibandingkan dengan total mahasiswa yang masuk pada periode tertentu.',
            'value' => $aeeData['aee_pt'],
            'target' => $target,
            'color' => '#10b981',
            'description' => 'Rumus: Rata-rata Tingkat Pencapaian AEE per Jenjang (D3, S1, S2, S3)',
            'perJenjang' => $aeeData['per_jenjang'],
            'trendData' => $trend,
            'drilldownData' => $drilldown,
        ];
    }

    // =========================================
    // IKU 2: LULUSAN PRODUKTIF
    // =========================================

    private function buildIKU2(array $years, ?string $fakultas): array
    {
        $currentYear = $years[0] ?? (int) date('Y');
        $target = $this->getTarget('iku2', $currentYear);
        $data = $this->repository->calculateIKU2($years, $fakultas);
        $trend = $this->cacheTrend('iku2', $currentYear, fn() => $this->repository->getTrendIKU2($currentYear));
        $drilldown = $this->buildDrilldownFakultasIKU2($years, $target);

        return [
            'id' => 2,
            'code' => 'IKU 2',
            'title' => 'Lulusan Langsung Bekerja/Studi Lanjut/Wiraswasta',
            'definition' => 'Persentase lulusan S1 dan program diploma yang langsung bekerja, melanjutkan jenjang pendidikan berikutnya, atau berwirausaha dalam jangka waktu 1 tahun setelah kelulusan.',
            'value' => $data['persentase'],
            'target' => $target,
            'color' => '#3b82f6',
            'description' => 'Sumber: Tracer Study lulusan S1 & Diploma',
            'statusBreakdown' => [
                'bekerja' => $data['bekerja'],
                'wiraswasta' => $data['wiraswasta'],
                'kuliah_lanjut' => $data['kuliah_lanjut'],
                'belum_bekerja' => $data['belum_bekerja'],
            ],
            'kategoriKerja' => $data['kategori_kerja'],
            'totalLulusan' => $data['total_lulusan'],
            'totalResponden' => $data['total_responden'],
            'responseRate' => $data['response_rate'],
            'trendData' => $trend,
            'drilldownData' => $drilldown,
        ];
    }

    // =========================================
    // IKU 3: MBKM / PRESTASI
    // =========================================

    private function buildIKU3(array $semesters, array $years, ?string $fakultas): array
    {
        $currentYear = $years[0] ?? (int) date('Y');
        $target = $this->getTarget('iku3', $currentYear);
        $data = $this->repository->calculateIKU3($semesters, $years, $fakultas);
        $trend = $this->cacheTrend('iku3', $currentYear, fn() => $this->repository->getTrendIKU3($currentYear));
        $drilldown = $this->buildDrilldownFakultasIKU3($semesters, $years, $target);
        $breakdown = $this->repository->getIKU3Breakdown($semesters, $fakultas);

        return [
            'id' => 3,
            'code' => 'IKU 3',
            'title' => 'Mahasiswa Berkegiatan di Luar Program Studi',
            'definition' => 'Persentase mahasiswa S1 dan D4/D3/D2/D1 yang berkegiatan di luar program studi atau meraih prestasi minimal tingkat nasional.',
            'value' => $data['persentase'],
            'target' => $target,
            'color' => '#f59e0b',
            'description' => 'Sumber: Data MBKM & Prestasi Mahasiswa',
            'kegiatanBreakdown' => $breakdown,
            'mbkm' => $data['mbkm'],
            'prestasiNasional' => $data['prestasi_nasional'],
            'totalAktif' => $data['total_aktif'],
            'totalBerkegiatan' => $data['total_berkegiatan'],
            'trendData' => $trend,
            'drilldownData' => $drilldown,
        ];
    }

    // =========================================
    // IKU 5: RASIO LUARAN KERJASAMA
    // =========================================

    private function buildIKU5(array $years, ?string $fakultas): array
    {
        $currentYear = $years[0] ?? (int) date('Y');
        $target = $this->getTarget('iku5', $currentYear);
        $data = $this->repository->calculateIKU5($years, $fakultas);
        $trend = $this->cacheTrend('iku5', $currentYear, fn() => $this->repository->getTrendIKU5($currentYear));
        $drilldown = $this->buildDrilldownFakultasIKU5($years, $target);
        $breakdown = $this->repository->getIKU5Breakdown($years, $fakultas);

        return [
            'id' => 5,
            'code' => 'IKU 5',
            'title' => 'Rasio Luaran Hasil Kerjasama Mitra',
            'definition' => 'Rasio jumlah luaran hasil kerjasama PT dan start-up/industri/lembaga terhadap total dosen PT.',
            'value' => $data['rasio'],
            'target' => $target,
            'color' => '#ec4899',
            'description' => 'Rumus: (Jumlah Luaran Kerjasama / Total Dosen) × 100',
            'totalLuaran' => $data['total_luaran'],
            'totalDosen' => $data['total_dosen'],
            'kerjasamaBreakdown' => $breakdown,
            'trendData' => $trend,
            'drilldownData' => $drilldown,
        ];
    }

    // =========================================
    // DRILLDOWN BUILDERS
    // =========================================

    /**
     * Helper: Build drilldown array dari fakultas list (tanpa children/prodi).
     * Children di-load lazy via endpoint terpisah untuk menghindari N+1 query.
     */
    private function formatDrilldown(array $fakultasList, float $target): array
    {
        return array_map(function ($fak) use ($target) {
            return [
                'id' => $fak['id'],
                'name' => $fak['name'],
                'value' => round($fak['value'], 1),
                'target' => $target,
                'status' => $fak['value'] >= $target ? 'Tercapai' : 'Belum Tercapai',
            ];
        }, $fakultasList);
    }

    private function buildDrilldownFakultas(array $semesters, array $years, float $target): array
    {
        return $this->formatDrilldown($this->repository->getAEEPerFakultas($semesters, $years), $target);
    }

    private function buildDrilldownFakultasIKU2(array $years, float $target): array
    {
        return $this->formatDrilldown($this->repository->getIKU2PerFakultas($years), $target);
    }

    private function buildDrilldownFakultasIKU3(array $semesters, array $years, float $target): array
    {
        return $this->formatDrilldown($this->repository->getIKU3PerFakultas($semesters, $years), $target);
    }

    private function buildDrilldownFakultasIKU5(array $years, float $target): array
    {
        return $this->formatDrilldown($this->repository->getIKU5PerFakultas($years), $target);
    }

    // =========================================
    // IKU 9: PENDAPATAN NON PENDIDIKAN / NON-UKT
    // =========================================

    private function buildIKU9(array $years, ?string $fakultas): array
    {
        $currentYear = $years[0] ?? (int) date('Y');
        $target = $this->getTarget('iku9', $currentYear);
        $data = $this->repository->calculateIKU9($years, $fakultas);
        $trend = $this->cacheTrend('iku9', $currentYear, fn() => $this->repository->getTrendIKU9($currentYear));
        $drilldown = $this->buildDrilldownFakultasIKU9($years, $target);
        $breakdown = $this->repository->getRevenueBreakdown($years, $fakultas);

        return [
            'id' => 9,
            'code' => 'IKU 9',
            'title' => 'Pendapatan Non Pendidikan/Non-UKT',
            'definition' => 'Persentase pendapatan PT dari sumber selain biaya pendidikan mahasiswa (SPP/UKT), meliputi dana riset, kerjasama industri, dan pendapatan operasional lainnya.',
            'value' => $data['persentase'],
            'target' => $target,
            'color' => '#6366f1',
            'description' => 'Rumus: (Pendapatan Non Mahasiswa / Total Pendapatan PT) × 100',
            'pendapatanMahasiswa' => $data['pendapatan_mahasiswa'],
            'pendapatanNonMahasiswa' => $data['pendapatan_non_mahasiswa'],
            'totalPendapatan' => $data['total_pendapatan'],
            'detailLitabmas' => $data['detail_litabmas'],
            'detailKerjasama' => $data['detail_kerjasama'],
            'detailOperasional' => $data['detail_operasional'],
            'revenueBreakdown' => $breakdown,
            'trendData' => $trend,
            'drilldownData' => $drilldown,
        ];
    }

    private function buildDrilldownFakultasIKU9(array $years, float $target): array
    {
        return $this->formatDrilldown($this->repository->getIKU9PerFakultas($years), $target);
    }

    // =========================================
    // IKU 7: KETERLIBATAN PT DALAM SDGs
    // =========================================

    private function buildIKU7(array $years, ?string $fakultas): array
    {
        $currentYear = $years[0] ?? (int) date('Y');
        $target = $this->getTarget('iku7', $currentYear);
        $data = $this->repository->calculateIKU7($years, $fakultas);
        $trend = $this->cacheTrend('iku7', $currentYear, fn() => $this->repository->getTrendIKU7($currentYear));
        $drilldown = $this->buildDrilldownFakultasIKU7($years, $target);
        $sdgBreakdown = $this->repository->getSDGBreakdown($years, $fakultas);

        return [
            'id' => 7,
            'code' => 'IKU 7',
            'title' => 'Keterlibatan PT dalam SDGs',
            'definition' => 'Persentase program/kegiatan Tri Dharma PT yang berkontribusi pada SDG 1 (Tanpa Kemiskinan), SDG 4 (Pendidikan Berkualitas), SDG 17 (Kemitraan), dan 2 SDGs lain sesuai keunggulan PT.',
            'value' => $data['persentase'],
            'target' => $target,
            'color' => '#f97316',
            'description' => 'Pendekatan: keyword matching pada judul litabmas + kerjasama sebagai SDG 17',
            'kegiatanSDG' => $data['kegiatan_sdg'],
            'litabmasSDG' => $data['litabmas_sdg'],
            'kerjasamaSDG' => $data['kerjasama_sdg'],
            'totalKegiatan' => $data['total_kegiatan'],
            'totalLitabmas' => $data['total_litabmas'],
            'totalKerjasama' => $data['total_kerjasama'],
            'sdgBreakdown' => $sdgBreakdown,
            'sdgWajib' => config('iku.sdg.sdg_wajib', [1, 4, 17]),
            'sdgPilihan' => config('iku.sdg.sdg_pilihan', []),
            'trendData' => $trend,
            'drilldownData' => $drilldown,
        ];
    }

    private function buildDrilldownFakultasIKU7(array $years, float $target): array
    {
        return $this->formatDrilldown($this->repository->getIKU7PerFakultas($years), $target);
    }
}
