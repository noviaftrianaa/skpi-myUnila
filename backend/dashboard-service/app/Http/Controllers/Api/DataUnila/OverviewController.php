<?php

namespace App\Http\Controllers\Api\DataUnila;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\DataUnila\MahasiswaDataService;
use App\Services\DataUnila\DosenDataService;
use App\Services\DataUnila\KerjasamaDataService;
use App\Services\DataUnila\TracerDataService;
use Illuminate\Http\JsonResponse;

/**
 * Overview Controller — universal totals untuk beranda Data Unila.
 *
 * Endpoint ini SENGAJA di-LUAR `scope` middleware → selalu return data
 * skala universitas, untuk navigasi/orientasi.
 *
 * Endpoint detail (mahasiswa, dosen, dst) tetap ter-scope sesuai peran user.
 */
class OverviewController extends Controller
{
    use ApiResponse;

    public function totals(): JsonResponse
    {
        try {
            $mhsService = new MahasiswaDataService();
            $dosenService = new DosenDataService();
            $kerjasamaService = new KerjasamaDataService();
            $tracerService = new TracerDataService();

            // Eksplisit kosongkan scope-related params supaya repository returnnya universal
            $unscopedParams = [];

            $mhsStats = $mhsService->getStats($unscopedParams);
            $dosenStats = $dosenService->getStats($unscopedParams);
            $kerjasamaStats = $kerjasamaService->getStats();
            $tracerStats = $tracerService->getStats($unscopedParams);

            return $this->success([
                'mahasiswa' => [
                    'total' => $mhsStats['total'] ?? 0,
                    'aktif' => $mhsStats['aktif'] ?? 0,
                    'lulus' => $mhsStats['lulus'] ?? 0,
                ],
                'dosen' => [
                    'total' => $dosenStats['total'] ?? 0,
                    'aktif' => $dosenStats['aktif'] ?? 0,
                ],
                'kerjasama' => [
                    'total' => $kerjasamaStats['total'] ?? 0,
                    'aktif' => $kerjasamaStats['aktif'] ?? 0,
                ],
                'tracer' => [
                    'total' => $tracerStats['total'] ?? 0,
                ],
            ], 'Total data Universitas Lampung');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }
}
