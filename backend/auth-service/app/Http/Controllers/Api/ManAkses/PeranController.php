<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use App\Services\ManAkses\PeranService;
use App\Repositories\ManAkses\PeranRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Peran Controller
 * API endpoints for peran (role) management
 */
class PeranController extends Controller
{
    protected PeranService $service;

    public function __construct()
    {
        $repository = new PeranRepository();
        $this->service = new PeranService($repository);
    }

    /**
     * Get paginated list of peran
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
                'status' => $request->get('status'),
                'sort_by' => $request->get('sort_by'), // column name
                'sort_order' => $request->get('sort_order'), // 'asc', 'desc'
            ];

            $result = $this->service->getList($params);

            return response()->json([
                'success' => true,
                'message' => 'Data peran berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data peran: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get all peran for dropdown
     *
     * @return JsonResponse
     */
    public function all(): JsonResponse
    {
        try {
            $result = $this->service->getAll();

            return response()->json([
                'success' => true,
                'message' => 'Data peran berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data peran: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get peran detail
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $result = $this->service->getDetail($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peran tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail peran berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail peran: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get peran statistics
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        try {
            $result = $this->service->getStats();

            return response()->json([
                'success' => true,
                'message' => 'Statistik peran berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik peran: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Create new peran
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'nm_peran' => 'required|string|max:100',
                'a_perlu_sk' => 'nullable|boolean',
            ]);

            $data = $request->only(['nm_peran', 'a_perlu_sk']);
            $result = $this->service->create($data);

            return response()->json([
                'success' => true,
                'message' => 'Peran berhasil ditambahkan',
                'data' => $result
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan peran: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update existing peran
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $request->validate([
                'nm_peran' => 'required|string|max:100',
                'a_perlu_sk' => 'nullable|boolean',
            ]);

            $data = $request->only(['nm_peran', 'a_perlu_sk']);
            $result = $this->service->update($id, $data);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peran tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Peran berhasil diperbarui',
                'data' => $result
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui peran: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Delete peran (soft delete)
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $result = $this->service->delete($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peran tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Peran berhasil dihapus',
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus peran: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
