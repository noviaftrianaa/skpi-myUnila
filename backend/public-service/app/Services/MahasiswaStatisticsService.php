<?php

namespace App\Services;

use App\Repositories\MahasiswaStatisticsRepository;
use Illuminate\Support\Facades\Cache;

class MahasiswaStatisticsService
{
    protected $repository;

    // Cache TTL: 12 jam
    protected const CACHE_TTL = 43200;

    public function __construct(MahasiswaStatisticsRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get mahasiswa aktif trend for last 5 years
     *
     * @return array
     */
    public function getMahasiswaAktifTrend(): array
    {
        $cacheKey = 'mahasiswa_aktif_trend';
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () {
            $data = $this->repository->getMahasiswaAktifTrend();

            return [
                'data' => $data,
                'total_years' => count($data),
            ];
        });
    }

    /**
     * Get sebaran mahasiswa by jenjang pendidikan
     *
     * @return array
     */
    public function getSebaranByJenjang(): array
    {
        $cacheKey = 'mahasiswa_sebaran_jenjang';
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () {
            $data = $this->repository->getSebaranByJenjang();

            // Calculate total and percentage
            $total = array_sum(array_column($data, 'jumlah_mahasiswa'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'jenjang' => $item['jenjang'],
                        'jumlah_mahasiswa' => $item['jumlah_mahasiswa'],
                        'persentase' => $total > 0 ? round(($item['jumlah_mahasiswa'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total_mahasiswa' => $total,
            ];
        });
    }

    /**
     * Get sebaran mahasiswa by status
     *
     * @return array
     */
    public function getSebaranByStatus(): array
    {
        $cacheKey = 'mahasiswa_sebaran_status';
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () {
            $data = $this->repository->getSebaranByStatus();

            // Calculate total and percentage
            $total = array_sum(array_column($data, 'jumlah_mahasiswa'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'status' => $item['status'],
                        'jumlah_mahasiswa' => $item['jumlah_mahasiswa'],
                        'persentase' => $total > 0 ? round(($item['jumlah_mahasiswa'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total_mahasiswa' => $total,
            ];
        });
    }

    /**
     * Get sebaran mahasiswa by jenis kelamin
     *
     * @return array
     */
    public function getSebaranByJenisKelamin(): array
    {
        $cacheKey = 'mahasiswa_sebaran_jenis_kelamin';
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () {
            $data = $this->repository->getSebaranByJenisKelamin();

            // Calculate total and percentage
            $total = array_sum(array_column($data, 'jumlah_mahasiswa'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'jenis_kelamin' => $item['jenis_kelamin'],
                        'jumlah_mahasiswa' => $item['jumlah_mahasiswa'],
                        'persentase' => $total > 0 ? round(($item['jumlah_mahasiswa'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total_mahasiswa' => $total,
            ];
        });
    }

    /**
     * Get sebaran mahasiswa by jalur daftar
     *
     * @return array
     */
    public function getSebaranByJalurDaftar(): array
    {
        $cacheKey = 'mahasiswa_sebaran_jalur_daftar';
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () {
            $data = $this->repository->getSebaranByJalurDaftar();

            // Calculate total and percentage
            $total = array_sum(array_column($data, 'jumlah_mahasiswa'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'jalur_daftar' => $item['jalur_daftar'],
                        'jumlah_mahasiswa' => $item['jumlah_mahasiswa'],
                        'persentase' => $total > 0 ? round(($item['jumlah_mahasiswa'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total_mahasiswa' => $total,
            ];
        });
    }

    /**
     * Get sebaran mahasiswa by jenis pendaftaran
     *
     * @return array
     */
    public function getSebaranByJenisPendaftaran(): array
    {
        $cacheKey = 'mahasiswa_sebaran_jenis_pendaftaran';
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () {
            $data = $this->repository->getSebaranByJenisPendaftaran();

            // Calculate total and percentage
            $total = array_sum(array_column($data, 'jumlah_mahasiswa'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'jenis_pendaftaran' => $item['jenis_pendaftaran'],
                        'jumlah_mahasiswa' => $item['jumlah_mahasiswa'],
                        'persentase' => $total > 0 ? round(($item['jumlah_mahasiswa'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total_mahasiswa' => $total,
            ];
        });
    }

    /**
     * Get sebaran mahasiswa by pembiayaan
     *
     * @return array
     */
    public function getSebaranByPembiayaan(): array
    {
        $cacheKey = 'mahasiswa_sebaran_pembiayaan';
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () {
            $data = $this->repository->getSebaranByPembiayaan();

            // Calculate total and percentage
            $total = array_sum(array_column($data, 'jumlah_mahasiswa'));

            return [
                'data' => array_map(function($item) use ($total) {
                    return [
                        'pembiayaan' => $item['pembiayaan'],
                        'jumlah_mahasiswa' => $item['jumlah_mahasiswa'],
                        'persentase' => $total > 0 ? round(($item['jumlah_mahasiswa'] / $total) * 100, 2) : 0,
                    ];
                }, $data),
                'total_mahasiswa' => $total,
            ];
        });
    }

    /**
     * Get sebaran mahasiswa asing
     *
     * @return array
     */
    public function getSebaranMahasiswaAsing(): array
    {
        $cacheKey = 'mahasiswa_sebaran_asing';
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () {
            $data = $this->repository->getSebaranMahasiswaAsing();
            $lokalVsAsing = $this->repository->getTotalLokalVsAsing();

            // Calculate total asing
            $totalAsing = array_sum(array_column($data, 'jumlah_mahasiswa'));

            return [
                'data' => $data,
                'total_mahasiswa_asing' => $totalAsing,
                'lokal_vs_asing' => $lokalVsAsing,
            ];
        });
    }

    /**
     * Get all statistics combined
     *
     * @return array
     */
    public function getAllStatistics(): array
    {
        $cacheKey = 'mahasiswa_all_statistics';
        $cacheDuration = self::CACHE_TTL;

        return Cache::remember($cacheKey, $cacheDuration, function () {
            return [
                'summary' => $this->repository->getStatisticsSummary(),
                'trend' => $this->getMahasiswaAktifTrend(),
                'jenjang' => $this->getSebaranByJenjang(),
                'status' => $this->getSebaranByStatus(),
                'jenis_kelamin' => $this->getSebaranByJenisKelamin(),
                'jalur_daftar' => $this->getSebaranByJalurDaftar(),
                'jenis_pendaftaran' => $this->getSebaranByJenisPendaftaran(),
                'pembiayaan' => $this->getSebaranByPembiayaan(),
                'mahasiswa_asing' => $this->getSebaranMahasiswaAsing(),
            ];
        });
    }
}
