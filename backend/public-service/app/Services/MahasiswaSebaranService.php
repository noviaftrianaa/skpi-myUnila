<?php

namespace App\Services;

use App\Repositories\MahasiswaSebaranRepository;
use Illuminate\Support\Facades\Cache;

class MahasiswaSebaranService
{
    protected $repository;

    // Cache TTL: 12 jam
    protected const CACHE_TTL = 43200;

    public function __construct(MahasiswaSebaranRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get sebaran mahasiswa by kabupaten with caching
     *
     * @return array
     */
    public function getSebaranByKabupaten(): array
    {
        $cacheKey = 'mahasiswa_sebaran_kabupaten';
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () {
            $data = $this->repository->getSebaranMahasiswaByKabupaten();

            // Calculate total and percentage
            $total = array_sum(array_column($data, 'jumlah_mahasiswa'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'id_kabupaten' => $item['id_kabupaten'],
                        'nama_kabupaten' => $item['nama_kabupaten'],
                        'jumlah_mahasiswa' => $item['jumlah_mahasiswa'],
                        'persentase' => $total > 0 ? round(($item['jumlah_mahasiswa'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total_mahasiswa' => $total,
                'jumlah_kabupaten' => count($data),
            ];
        });
    }

    /**
     * Get sebaran mahasiswa by provinsi with caching
     * Hitung dari data kabupaten jika data provinsi kosong
     *
     * @return array
     */
    public function getSebaranByProvinsi(): array
    {
        $cacheKey = 'mahasiswa_sebaran_provinsi';
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () {
            $data = $this->repository->getSebaranMahasiswaByProvinsi();

            // Jika data provinsi kosong, hitung dari data kabupaten
            if (empty($data)) {
                $kabupatenData = $this->repository->getSebaranMahasiswaByKabupaten();

                // Group kabupaten by provinsi (2 digit pertama dari kode kabupaten)
                $provinsiGrouped = [];
                foreach ($kabupatenData as $item) {
                    $provinsiCode = substr($item['id_kabupaten'], 0, 2);

                    if (!isset($provinsiGrouped[$provinsiCode])) {
                        $provinsiGrouped[$provinsiCode] = [
                            'id_provinsi' => $provinsiCode,
                            'nama_provinsi' => $this->getProvinsiName($provinsiCode),
                            'jumlah_mahasiswa' => 0,
                        ];
                    }

                    $provinsiGrouped[$provinsiCode]['jumlah_mahasiswa'] += $item['jumlah_mahasiswa'];
                }

                $data = array_values($provinsiGrouped);

                // Sort by jumlah_mahasiswa descending
                usort($data, function($a, $b) {
                    return $b['jumlah_mahasiswa'] - $a['jumlah_mahasiswa'];
                });
            }

            // Calculate total and percentage
            $total = array_sum(array_column($data, 'jumlah_mahasiswa'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'id_provinsi' => $item['id_provinsi'],
                        'nama_provinsi' => $item['nama_provinsi'],
                        'jumlah_mahasiswa' => $item['jumlah_mahasiswa'],
                        'persentase' => $total > 0 ? round(($item['jumlah_mahasiswa'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total_mahasiswa' => $total,
                'jumlah_provinsi' => count($data),
            ];
        });
    }

    /**
     * Get provinsi name from code
     *
     * @param string $code
     * @return string
     */
    private function getProvinsiName(string $code): string
    {
        $provinsiMap = [
            '11' => 'Aceh',
            '12' => 'Sumatera Utara',
            '13' => 'Sumatera Barat',
            '14' => 'Riau',
            '15' => 'Jambi',
            '16' => 'Sumatera Selatan',
            '17' => 'Bengkulu',
            '18' => 'Lampung',
            '19' => 'Kepulauan Bangka Belitung',
            '21' => 'Kepulauan Riau',
            '31' => 'DKI Jakarta',
            '32' => 'Jawa Barat',
            '33' => 'Jawa Tengah',
            '34' => 'DI Yogyakarta',
            '35' => 'Jawa Timur',
            '36' => 'Banten',
            '51' => 'Bali',
            '52' => 'Nusa Tenggara Barat',
            '53' => 'Nusa Tenggara Timur',
            '61' => 'Kalimantan Barat',
            '62' => 'Kalimantan Tengah',
            '63' => 'Kalimantan Selatan',
            '64' => 'Kalimantan Timur',
            '65' => 'Kalimantan Utara',
            '71' => 'Sulawesi Utara',
            '72' => 'Sulawesi Tengah',
            '73' => 'Sulawesi Selatan',
            '74' => 'Sulawesi Tenggara',
            '75' => 'Gorontalo',
            '76' => 'Sulawesi Barat',
            '81' => 'Maluku',
            '82' => 'Maluku Utara',
            '91' => 'Papua Barat',
            '94' => 'Papua',
        ];

        return $provinsiMap[$code] ?? 'Provinsi ' . $code;
    }

    /**
     * Get sebaran mahasiswa by fakultas with caching
     *
     * @return array
     */
    public function getSebaranByFakultas(): array
    {
        $cacheKey = 'mahasiswa_sebaran_fakultas';
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () {
            $data = $this->repository->getSebaranMahasiswaByFakultas();

            // Calculate total and percentage
            $total = array_sum(array_column($data, 'jumlah_mahasiswa'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'id_fakultas' => $item['id_fakultas'],
                        'nama_fakultas' => $item['nama_fakultas'],
                        'jumlah_mahasiswa' => $item['jumlah_mahasiswa'],
                        'persentase' => $total > 0 ? round(($item['jumlah_mahasiswa'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total_mahasiswa' => $total,
                'jumlah_fakultas' => count($data),
            ];
        });
    }

    /**
     * Get sebaran mahasiswa by prodi dalam fakultas with caching
     *
     * @param string $idFakultas
     * @return array
     */
    public function getSebaranByProdiInFakultas(string $idFakultas): array
    {
        $cacheKey = "mahasiswa_sebaran_prodi_{$idFakultas}";
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () use ($idFakultas) {
            $data = $this->repository->getSebaranMahasiswaByProdiInFakultas($idFakultas);

            // Calculate total and percentage
            $total = array_sum(array_column($data, 'jumlah_mahasiswa'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'id_prodi' => $item['id_prodi'],
                        'nama_prodi' => $item['nama_prodi'],
                        'jenjang' => $item['jenjang'],
                        'jumlah_mahasiswa' => $item['jumlah_mahasiswa'],
                        'persentase' => $total > 0 ? round(($item['jumlah_mahasiswa'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total_mahasiswa' => $total,
                'jumlah_prodi' => count($data),
            ];
        });
    }

    /**
     * Get combined statistics
     *
     * @return array
     */
    public function getSebaranStatistics(): array
    {
        $provinsi = $this->getSebaranByProvinsi();
        $kabupaten = $this->getSebaranByKabupaten();

        // Get top provinsi (for quick stats)
        $topProvinsi = !empty($provinsi['data']) ? $provinsi['data'][0] : null;
        $mahasiswaLokal = $topProvinsi ? $topProvinsi['persentase'] : 0;
        $mahasiswaLuarDaerah = 100 - $mahasiswaLokal;

        return [
            'provinsi' => $provinsi,
            'kabupaten' => $kabupaten,
            'statistics' => [
                'mahasiswa_lokal_persen' => round($mahasiswaLokal, 1),
                'mahasiswa_luar_daerah_persen' => round($mahasiswaLuarDaerah, 1),
                'total_provinsi' => $provinsi['jumlah_provinsi'] ?? 0,
                'total_kabupaten' => $kabupaten['jumlah_kabupaten'] ?? 0,
            ]
        ];
    }
}
