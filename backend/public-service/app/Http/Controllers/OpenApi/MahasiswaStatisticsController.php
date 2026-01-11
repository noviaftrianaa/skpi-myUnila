<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\MahasiswaStatisticsService;
use Illuminate\Http\JsonResponse;

class MahasiswaStatisticsController extends Controller
{
    protected $service;

    public function __construct(MahasiswaStatisticsService $service)
    {
        $this->service = $service;
    }

    /**
     * Get all statistics combined
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $data = $this->service->getAllStatistics();

            return response()->json([
                'success' => true,
                'message' => 'Data statistik mahasiswa berhasil diambil',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data statistik mahasiswa',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get mahasiswa aktif trend for last 5 years
     *
     * @return JsonResponse
     */
    public function getTrend(): JsonResponse
    {
        try {
            $data = $this->service->getMahasiswaAktifTrend();

            return response()->json([
                'success' => true,
                'message' => 'Data trend mahasiswa aktif berhasil diambil',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data trend mahasiswa aktif',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sebaran mahasiswa by jenjang pendidikan
     *
     * @return JsonResponse
     */
    public function getSebaranByJenjang(): JsonResponse
    {
        try {
            $data = $this->service->getSebaranByJenjang();

            return response()->json([
                'success' => true,
                'message' => 'Data sebaran mahasiswa per jenjang berhasil diambil',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sebaran mahasiswa per jenjang',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sebaran mahasiswa by status
     *
     * @return JsonResponse
     */
    public function getSebaranByStatus(): JsonResponse
    {
        try {
            $data = $this->service->getSebaranByStatus();

            return response()->json([
                'success' => true,
                'message' => 'Data sebaran mahasiswa per status berhasil diambil',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sebaran mahasiswa per status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sebaran mahasiswa by jenis kelamin
     *
     * @return JsonResponse
     */
    public function getSebaranByJenisKelamin(): JsonResponse
    {
        try {
            $data = $this->service->getSebaranByJenisKelamin();

            return response()->json([
                'success' => true,
                'message' => 'Data sebaran mahasiswa per jenis kelamin berhasil diambil',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sebaran mahasiswa per jenis kelamin',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sebaran mahasiswa by jalur daftar
     *
     * @return JsonResponse
     */
    public function getSebaranByJalurDaftar(): JsonResponse
    {
        try {
            $data = $this->service->getSebaranByJalurDaftar();

            return response()->json([
                'success' => true,
                'message' => 'Data sebaran mahasiswa per jalur daftar berhasil diambil',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sebaran mahasiswa per jalur daftar',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sebaran mahasiswa asing
     *
     * @return JsonResponse
     */
    public function getSebaranMahasiswaAsing(): JsonResponse
    {
        try {
            $data = $this->service->getSebaranMahasiswaAsing();

            return response()->json([
                'success' => true,
                'message' => 'Data sebaran mahasiswa asing berhasil diambil',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sebaran mahasiswa asing',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
