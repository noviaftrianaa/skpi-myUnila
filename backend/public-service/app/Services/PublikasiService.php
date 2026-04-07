<?php

namespace App\Services;

use App\Repositories\PublikasiRepository;
use Illuminate\Support\Facades\Cache;

class PublikasiService
{
    protected $publikasiRepository;

    // Cache TTL: 12 jam
    protected const CACHE_TTL = 43200;

    public function __construct(PublikasiRepository $publikasiRepository)
    {
        $this->publikasiRepository = $publikasiRepository;
    }

    /**
     * Get publikasi statistics with Redis caching
     *
     * @param int|null $startYear Start year for filtering
     * @param int|null $endYear End year for filtering
     * @return array Publikasi statistics data
     */
    public function getPublikasiStatistics(?int $startYear = null, ?int $endYear = null): array
    {
        $cacheKey = 'publikasi:statistics:' . ($startYear ?? 'null') . ':' . ($endYear ?? 'null');

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($startYear, $endYear) {
            $byJenis = $this->publikasiRepository->getPublikasiByJenis();
            $byYear = $this->publikasiRepository->getPublikasiByYear();
            $byKategoriCapaian = $this->publikasiRepository->getPublikasiByKategoriCapaian($startYear, $endYear);
            $byPeran = $this->publikasiRepository->getPublikasiByPeran($startYear, $endYear);
            $byFakultas = $this->publikasiRepository->getPublikasiByFakultas($startYear, $endYear);
            $total = $this->publikasiRepository->getTotalPublikasi();

            return [
                'total' => $total,
                'by_jenis' => $byJenis,
                'by_year' => $byYear,
                'by_kategori_capaian' => $byKategoriCapaian,
                'by_peran' => $byPeran,
                'by_fakultas' => $byFakultas,
            ];
        });
    }
}
