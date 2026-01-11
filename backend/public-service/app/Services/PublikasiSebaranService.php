<?php

namespace App\Services;

use App\Repositories\PublikasiSebaranRepository;
use Illuminate\Support\Facades\Cache;

class PublikasiSebaranService
{
    protected $repository;

    public function __construct(PublikasiSebaranRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get sebaran publikasi by fakultas with cache
     *
     * @param int|null $startYear
     * @param int|null $endYear
     * @return array
     */
    public function getSebaranByFakultas(?int $startYear = null, ?int $endYear = null): array
    {
        $currentYear = (int) date('Y');
        $startYear = $startYear ?? ($currentYear - 5);
        $endYear = $endYear ?? $currentYear;

        $cacheKey = "publikasi_sebaran_fakultas_{$startYear}_{$endYear}";
        $cacheDuration = 3600; // 1 hour

        return Cache::remember($cacheKey, $cacheDuration, function () use ($startYear, $endYear) {
            $data = $this->repository->getSebaranPublikasiByFakultas($startYear, $endYear);
            $total = array_sum(array_column($data, 'jumlah'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'id_fakultas' => $item['id_fakultas'],
                        'nama_fakultas' => $item['nama_fakultas'],
                        'jumlah' => $item['jumlah'],
                        'persentase' => $total > 0 ? round(($item['jumlah'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total' => $total,
                'jumlah_fakultas' => count($data),
            ];
        });
    }

    /**
     * Get sebaran publikasi by prodi in fakultas with cache
     *
     * @param string $idFakultas
     * @param int|null $startYear
     * @param int|null $endYear
     * @return array
     */
    public function getSebaranByProdiInFakultas(string $idFakultas, ?int $startYear = null, ?int $endYear = null): array
    {
        $currentYear = (int) date('Y');
        $startYear = $startYear ?? ($currentYear - 5);
        $endYear = $endYear ?? $currentYear;

        $cacheKey = "publikasi_sebaran_prodi_{$idFakultas}_{$startYear}_{$endYear}";
        $cacheDuration = 3600; // 1 hour

        return Cache::remember($cacheKey, $cacheDuration, function () use ($idFakultas, $startYear, $endYear) {
            $data = $this->repository->getSebaranPublikasiByProdiInFakultas($idFakultas, $startYear, $endYear);
            $total = array_sum(array_column($data, 'jumlah'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'id_prodi' => $item['id_prodi'],
                        'nama_prodi' => $item['nama_prodi'],
                        'jenjang' => $item['jenjang'],
                        'jumlah' => $item['jumlah'],
                        'persentase' => $total > 0 ? round(($item['jumlah'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total' => $total,
                'jumlah_prodi' => count($data),
            ];
        });
    }
}
