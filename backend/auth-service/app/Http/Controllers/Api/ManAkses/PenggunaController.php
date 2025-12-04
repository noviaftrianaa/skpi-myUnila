<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use App\Services\ManAkses\PenggunaService;
use App\Repositories\ManAkses\PenggunaRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Pengguna Controller
 * API endpoints for pengguna (user) management
 */
class PenggunaController extends Controller
{
    protected PenggunaService $service;

    public function __construct()
    {
        $repository = new PenggunaRepository();
        $this->service = new PenggunaService($repository);
    }

    /**
     * Get paginated list of pengguna
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'search' => $request->get('search'),
                'status' => $request->get('status'), // 'aktif', 'nonaktif'
                'has_sso' => $request->get('has_sso'), // 'yes', 'no'
            ];

            $result = $this->service->getList($params);

            return response()->json([
                'success' => true,
                'message' => 'Data pengguna berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get pengguna detail
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        try {
            $result = $this->service->getDetail($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengguna tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail pengguna berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get pengguna statistics
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        try {
            $result = $this->service->getStats();

            return response()->json([
                'success' => true,
                'message' => 'Statistik pengguna berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
