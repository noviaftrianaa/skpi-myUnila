<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\PublikasiSebaranService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublikasiSebaranController extends Controller
{
    protected $service;

    public function __construct(PublikasiSebaranService $service)
    {
        $this->service = $service;
    }

    /**
     * Get sebaran publikasi by fakultas
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getSebaranByFakultas(Request $request): JsonResponse
    {
        try {
            $startYear = $request->query('start_year');
            $endYear = $request->query('end_year');

            $result = $this->service->getSebaranByFakultas($startYear, $endYear);

            return response()->json([
                'success' => true,
                'message' => 'Data sebaran publikasi per fakultas berhasil diambil',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sebaran publikasi per fakultas',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sebaran publikasi by prodi in fakultas
     *
     * @param string $idFakultas
     * @param Request $request
     * @return JsonResponse
     */
    public function getSebaranByProdiInFakultas(string $idFakultas, Request $request): JsonResponse
    {
        try {
            $startYear = $request->query('start_year');
            $endYear = $request->query('end_year');

            $result = $this->service->getSebaranByProdiInFakultas($idFakultas, $startYear, $endYear);

            return response()->json([
                'success' => true,
                'message' => 'Data sebaran publikasi per prodi berhasil diambil',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sebaran publikasi per prodi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
