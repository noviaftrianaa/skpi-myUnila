<?php

namespace App\Services;

use App\Repositories\DosenSebaranRepository;
use Illuminate\Support\Facades\Cache;

class DosenSebaranService
{
    protected $repository;

    // Cache TTL: 12 jam
    protected const CACHE_TTL = 43200;

    public function __construct(DosenSebaranRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get sebaran dosen by fakultas with cache and ratio
     *
     * @return array
     */
    public function getSebaranByFakultas(): array
    {
        $cacheKey = 'dosen_sebaran_fakultas';
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () {
            $data = $this->repository->getSebaranDosenByFakultas();
            $total = array_sum(array_column($data, 'jumlah_dosen'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'id_fakultas' => $item['id_fakultas'],
                        'nama_fakultas' => $item['nama_fakultas'],
                        'jumlah_dosen' => $item['jumlah_dosen'],
                        'jumlah_mahasiswa' => $item['jumlah_mahasiswa'],
                        'rasio' => $item['rasio'],
                        'persentase' => $total > 0 ? round(($item['jumlah_dosen'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total_dosen' => $total,
                'jumlah_fakultas' => count($data),
            ];
        });
    }

    /**
     * Get sebaran dosen by prodi in fakultas with cache and ratio
     *
     * @param string $idFakultas
     * @return array
     */
    public function getSebaranByProdiInFakultas(string $idFakultas): array
    {
        $cacheKey = "dosen_sebaran_prodi_{$idFakultas}";
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () use ($idFakultas) {
            $data = $this->repository->getSebaranDosenByProdiInFakultas($idFakultas);
            $total = array_sum(array_column($data, 'jumlah_dosen'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'id_prodi' => $item['id_prodi'],
                        'nama_prodi' => $item['nama_prodi'],
                        'jenjang' => $item['jenjang'],
                        'jumlah_dosen' => $item['jumlah_dosen'],
                        'jumlah_mahasiswa' => $item['jumlah_mahasiswa'],
                        'rasio' => $item['rasio'],
                        'persentase' => $total > 0 ? round(($item['jumlah_dosen'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total_dosen' => $total,
                'jumlah_prodi' => count($data),
            ];
        });
    }
}
