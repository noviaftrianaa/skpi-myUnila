<?php

namespace App\Services;

use App\Repositories\PenelitianSebaranRepository;
use Illuminate\Support\Facades\Cache;

class PenelitianSebaranService
{
    protected $repository;

    // Cache TTL: 12 jam
    protected const CACHE_TTL = 43200;

    public function __construct(PenelitianSebaranRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get sebaran penelitian by fakultas with cache
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

        $cacheKey = "penelitian_sebaran_fakultas_{$startYear}_{$endYear}";
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () use ($startYear, $endYear) {
            $data = $this->repository->getSebaranPenelitianByFakultas($startYear, $endYear);
            $totalPenelitian = array_sum(array_column($data, 'jumlah_penelitian'));
            $totalPengabdian = array_sum(array_column($data, 'jumlah_pengabdian'));
            $total = array_sum(array_column($data, 'jumlah_total'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'id_fakultas' => $item['id_fakultas'],
                        'nama_fakultas' => $item['nama_fakultas'],
                        'jumlah_penelitian' => $item['jumlah_penelitian'],
                        'jumlah_pengabdian' => $item['jumlah_pengabdian'],
                        'jumlah_total' => $item['jumlah_total'],
                        'persentase' => $total > 0 ? round(($item['jumlah_total'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total' => $total,
                'total_penelitian' => $totalPenelitian,
                'total_pengabdian' => $totalPengabdian,
                'jumlah_fakultas' => count($data),
            ];
        });
    }

    /**
     * Get sebaran penelitian by prodi in fakultas with cache
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

        $cacheKey = "penelitian_sebaran_prodi_{$idFakultas}_{$startYear}_{$endYear}";
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () use ($idFakultas, $startYear, $endYear) {
            $data = $this->repository->getSebaranPenelitianByProdiInFakultas($idFakultas, $startYear, $endYear);
            $totalPenelitian = array_sum(array_column($data, 'jumlah_penelitian'));
            $totalPengabdian = array_sum(array_column($data, 'jumlah_pengabdian'));
            $total = array_sum(array_column($data, 'jumlah_total'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'id_prodi' => $item['id_prodi'],
                        'nama_prodi' => $item['nama_prodi'],
                        'jenjang' => $item['jenjang'],
                        'jumlah_penelitian' => $item['jumlah_penelitian'],
                        'jumlah_pengabdian' => $item['jumlah_pengabdian'],
                        'jumlah_total' => $item['jumlah_total'],
                        'persentase' => $total > 0 ? round(($item['jumlah_total'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total' => $total,
                'total_penelitian' => $totalPenelitian,
                'total_pengabdian' => $totalPengabdian,
                'jumlah_prodi' => count($data),
            ];
        });
    }
}
