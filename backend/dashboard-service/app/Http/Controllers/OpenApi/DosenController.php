<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\DosenService;
use Illuminate\Http\JsonResponse;

class DosenController extends Controller
{
    protected $dosenService;

    public function __construct(DosenService $dosenService)
    {
        $this->dosenService = $dosenService;
    }

    /**
     * Get dosen by jenjang pendidikan
     *
     * @return JsonResponse
     */
    public function getDosenByJenjangPendidikan(): JsonResponse
    {
        try {
            $data = $this->dosenService->getDosenByJenjangPendidikan();

            return response()->json([
                'success' => true,
                'message' => 'Data dosen per jenjang pendidikan berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data dosen per jenjang pendidikan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get dosen by jabatan fungsional
     *
     * @return JsonResponse
     */
    public function getDosenByJabatanFungsional(): JsonResponse
    {
        try {
            $data = $this->dosenService->getDosenByJabatanFungsional();

            return response()->json([
                'success' => true,
                'message' => 'Data dosen per jabatan fungsional berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data dosen per jabatan fungsional',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get statistics lengkap dosen
     *
     * @return JsonResponse
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $data = $this->dosenService->getStatistics();

            return response()->json([
                'success' => true,
                'message' => 'Data statistik dosen berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data statistik dosen',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
