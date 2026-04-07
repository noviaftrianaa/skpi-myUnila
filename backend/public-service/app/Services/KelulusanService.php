<?php

namespace App\Services;

use App\Repositories\KelulusanRepository;
use Illuminate\Support\Facades\Cache;

class KelulusanService
{
    protected $kelulusanRepository;

    // Cache TTL: 12 jam
    protected const CACHE_TTL = 43200;

    public function __construct(KelulusanRepository $kelulusanRepository)
    {
        $this->kelulusanRepository = $kelulusanRepository;
    }

    /**
     * Get kelulusan tepat waktu statistics
     * - Total, tepat_waktu, by_jenjang, by_masa_studi: Current year only
     * - by_year: Last 5 years for trend chart
     *
     * @param int|null $startYear Start year for by_year filtering (default: current year - 5)
     * @param int|null $endYear End year for by_year filtering (default: current year)
     * @return array Kelulusan statistics data
     */
    public function getKelulusanStatistics(?int $startYear = null, ?int $endYear = null): array
    {
        $cacheKey = 'kelulusan:statistics:' . ($startYear ?? 'null') . ':' . ($endYear ?? 'null');

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($startYear, $endYear) {
            // Current year data only
            $total = $this->kelulusanRepository->getTotalLulusan();
            $byJenjang = $this->kelulusanRepository->getKelulusanByJenjang();
            $byMasaStudi = $this->kelulusanRepository->getKelulusanByMasaStudi();
            $byFakultas = $this->kelulusanRepository->getKelulusanByFakultas();

            // Trend data (5 years) for chart
            $byYear = $this->kelulusanRepository->getKelulusanByYear($startYear, $endYear);

            // Calculate tepat waktu from current year only (first item in byYear if available)
            $currentYearData = !empty($byYear) ? $byYear[0] : null;
            $totalTepatWaktu = $currentYearData ? $currentYearData['tepat_waktu'] : 0;
            $persentaseKeseluruhan = $currentYearData ? $currentYearData['persentase_tepat_waktu'] : 0;

            return [
                'total' => $total,
                'total_tepat_waktu' => $totalTepatWaktu,
                'persentase_tepat_waktu' => $persentaseKeseluruhan,
                'by_year' => $byYear,
                'by_jenjang' => $byJenjang,
                'by_masa_studi' => $byMasaStudi,
                'by_fakultas' => $byFakultas,
            ];
        });
    }
}
