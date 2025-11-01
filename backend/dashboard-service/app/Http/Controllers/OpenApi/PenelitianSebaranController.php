<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\PenelitianSebaranService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PenelitianSebaranController extends Controller
{
    protected $service;

    public function __construct(PenelitianSebaranService $service)
    {
        $this->service = $service;
    }

    /**
     * Get sebaran penelitian by fakultas
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
                'message' => 'Data sebaran penelitian per fakultas berhasil diambil',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sebaran penelitian per fakultas',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sebaran penelitian by prodi in fakultas
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
                'message' => 'Data sebaran penelitian per prodi berhasil diambil',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sebaran penelitian per prodi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
