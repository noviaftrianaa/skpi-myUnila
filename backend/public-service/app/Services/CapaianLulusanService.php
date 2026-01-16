<?php

namespace App\Services;

use App\Repositories\CapaianLulusanRepository;
use Illuminate\Support\Facades\Cache;

class CapaianLulusanService
{
    protected $capaianLulusanRepository;

    // Cache TTL: 12 jam
    protected const CACHE_TTL = 43200;

    public function __construct(CapaianLulusanRepository $capaianLulusanRepository)
    {
        $this->capaianLulusanRepository = $capaianLulusanRepository;
    }

    /**
     * Get capaian lulusan statistics (tracer study data)
     *
     * @return array Capaian lulusan statistics data
     */
    public function getCapaianLulusanStatistics(): array
    {
        $cacheKey = 'capaian_lulusan:statistics';

        return Cache::remember($cacheKey, self::CACHE_TTL, function () {
            $stats = $this->capaianLulusanRepository->getTracerStudyStatistics();
            $kesesuaianBidang = $this->capaianLulusanRepository->getKesesuaianBidangKerja();
            $levelPerusahaan = $this->capaianLulusanRepository->getLevelPerusahaan();
            $waktuTungguTrend = $this->capaianLulusanRepository->getWaktuTungguTrend();
            $incomeDistribution = $this->capaianLulusanRepository->getIncomeDistribution();
            $lokasiKerjaProvinsi = $this->capaianLulusanRepository->getLokasiKerjaByProvinsi();
            $lokasiKerjaInternational = $this->capaianLulusanRepository->getLokasiKerjaInternational();

            return [
                'total_alumni' => $stats['total_alumni'],
                'avg_waktu_tunggu' => $stats['avg_waktu_tunggu'],
                'avg_income' => $stats['avg_income'],
                'bekerja_sebelum_lulus' => $stats['bekerja_sebelum_lulus'],
                'persentase_bekerja_sebelum_lulus' => $stats['persentase_bekerja_sebelum_lulus'],
                'status_lulusan' => $stats['status_lulusan'],
                'kesesuaian_bidang' => $kesesuaianBidang,
                'level_perusahaan' => $levelPerusahaan,
                'waktu_tunggu_trend' => $waktuTungguTrend,
                'income_distribution' => $incomeDistribution,
                'lokasi_kerja_provinsi' => $lokasiKerjaProvinsi,
                'lokasi_kerja_international' => $lokasiKerjaInternational,
            ];
        });
    }
}
