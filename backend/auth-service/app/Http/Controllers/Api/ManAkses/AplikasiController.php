<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use App\Services\ManAkses\AplikasiService;
use App\Repositories\ManAkses\AplikasiRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Aplikasi Controller
 * API endpoints for aplikasi (application) management
 */
class AplikasiController extends Controller
{
    protected AplikasiService $service;

    public function __construct()
    {
        $repository = new AplikasiRepository();
        $this->service = new AplikasiService($repository);
    }

    /**
     * Get paginated list of aplikasi
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
                'jenis' => $request->get('jenis'), // 'internal', 'external'
            ];

            $result = $this->service->getList($params);

            return response()->json([
                'success' => true,
                'message' => 'Data aplikasi berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data aplikasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get aplikasi detail
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
                    'message' => 'Aplikasi tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail aplikasi berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail aplikasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get aplikasi statistics
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        try {
            $result = $this->service->getStats();

            return response()->json([
                'success' => true,
                'message' => 'Statistik aplikasi berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik aplikasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
