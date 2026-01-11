<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\DosenSebaranService;
use Illuminate\Http\JsonResponse;

class DosenSebaranController extends Controller
{
    protected $service;

    public function __construct(DosenSebaranService $service)
    {
        $this->service = $service;
    }

    /**
     * Get sebaran dosen by fakultas
     * 
     * @return JsonResponse
     */
    public function getSebaranByFakultas(): JsonResponse
    {
        try {
            $result = $this->service->getSebaranByFakultas();

            return response()->json([
                'success' => true,
                'message' => 'Data sebaran dosen per fakultas berhasil diambil',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sebaran dosen per fakultas',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sebaran dosen by prodi in fakultas
     * 
     * @param string $idFakultas
     * @return JsonResponse
     */
    public function getSebaranByProdiInFakultas(string $idFakultas): JsonResponse
    {
        try {
            $result = $this->service->getSebaranByProdiInFakultas($idFakultas);

            return response()->json([
                'success' => true,
                'message' => 'Data sebaran dosen per prodi berhasil diambil',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sebaran dosen per prodi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
