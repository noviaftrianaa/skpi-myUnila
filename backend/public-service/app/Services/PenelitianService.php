<?php

namespace App\Services;

use App\Repositories\PenelitianRepository;
use Illuminate\Support\Facades\Cache;

class PenelitianService
{
    protected $penelitianRepository;

    // Cache TTL: 12 jam
    protected const CACHE_TTL = 43200;

    public function __construct(PenelitianRepository $penelitianRepository)
    {
        $this->penelitianRepository = $penelitianRepository;
    }

    /**
     * Get penelitian statistics with Redis caching
     *
     * @param int|null $startYear Start year for filtering
     * @param int|null $endYear End year for filtering
     * @return array Penelitian statistics data
     */
    public function getPenelitianStatistics(?int $startYear = null, ?int $endYear = null): array
    {
        $cacheKey = 'penelitian:statistics:' . ($startYear ?? 'null') . ':' . ($endYear ?? 'null');

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($startYear, $endYear) {
            $byKategori = $this->penelitianRepository->getPenelitianByKategori();
            $byYear = $this->penelitianRepository->getPenelitianByYear();
            $byFunding = $this->penelitianRepository->getPenelitianFundingByYear($startYear, $endYear);
            $byKelompokBidang = $this->penelitianRepository->getPenelitianByKelompokBidang($startYear, $endYear);
            $byFakultas = $this->penelitianRepository->getPenelitianByFakultas($startYear, $endYear);
            $total = $this->penelitianRepository->getTotalPenelitian();

            return [
                'total' => $total,
                'by_kategori' => $byKategori,
                'by_year' => $byYear,
                'by_funding' => $byFunding,
                'by_kelompok_bidang' => $byKelompokBidang,
                'by_fakultas' => $byFakultas,
            ];
        });
    }
}
