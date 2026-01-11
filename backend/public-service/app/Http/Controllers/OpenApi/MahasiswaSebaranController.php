<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\MahasiswaSebaranService;
use Illuminate\Http\JsonResponse;

class MahasiswaSebaranController extends Controller
{
    protected $service;

    public function __construct(MahasiswaSebaranService $service)
    {
        $this->service = $service;
    }

    /**
     * Get sebaran mahasiswa by kabupaten
     *
     * @return JsonResponse
     */
    public function getSebaranByKabupaten(): JsonResponse
    {
        try {
            $data = $this->service->getSebaranByKabupaten();

            return response()->json([
                'success' => true,
                'message' => 'Data sebaran mahasiswa per kabupaten berhasil diambil',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sebaran mahasiswa',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sebaran mahasiswa by provinsi
     *
     * @return JsonResponse
     */
    public function getSebaranByProvinsi(): JsonResponse
    {
        try {
            $data = $this->service->getSebaranByProvinsi();

            return response()->json([
                'success' => true,
                'message' => 'Data sebaran mahasiswa per provinsi berhasil diambil',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sebaran mahasiswa',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sebaran mahasiswa by fakultas
     *
     * @return JsonResponse
     */
    public function getSebaranByFakultas(): JsonResponse
    {
        try {
            $data = $this->service->getSebaranByFakultas();

            return response()->json([
                'success' => true,
                'message' => 'Data sebaran mahasiswa per fakultas berhasil diambil',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sebaran mahasiswa',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sebaran mahasiswa by prodi dalam fakultas
     *
     * @param string $idFakultas
     * @return JsonResponse
     */
    public function getSebaranByProdiInFakultas(string $idFakultas): JsonResponse
    {
        try {
            $data = $this->service->getSebaranByProdiInFakultas($idFakultas);

            return response()->json([
                'success' => true,
                'message' => 'Data sebaran mahasiswa per prodi berhasil diambil',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sebaran mahasiswa per prodi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get combined sebaran statistics
     *
     * @return JsonResponse
     */
    public function getSebaranStatistics(): JsonResponse
    {
        try {
            $data = $this->service->getSebaranStatistics();

            return response()->json([
                'success' => true,
                'message' => 'Data statistik sebaran mahasiswa berhasil diambil',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data statistik sebaran mahasiswa',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
