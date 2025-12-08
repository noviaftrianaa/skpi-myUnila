<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use App\Services\ManAkses\EndpointService;
use App\Repositories\ManAkses\EndpointRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Endpoint Controller
 * API endpoints for WS endpoint management
 */
class EndpointController extends Controller
{
    protected EndpointService $service;

    public function __construct()
    {
        $repository = new EndpointRepository();
        $this->service = new EndpointService($repository);
    }

    /**
     * Get paginated list of endpoints
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
                'nm_group' => $request->get('nm_group'),
                'nm_method' => $request->get('nm_method'),
                'a_active' => $request->has('a_active') ? filter_var($request->get('a_active'), FILTER_VALIDATE_BOOLEAN) : null,
            ];

            $result = $this->service->getList($params);

            return response()->json([
                'success' => true,
                'message' => 'Data endpoint berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data endpoint: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get endpoint detail
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
                    'message' => 'Endpoint tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail endpoint berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail endpoint: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get all groups for dropdown
     *
     * @return JsonResponse
     */
    public function groups(): JsonResponse
    {
        try {
            $result = $this->service->getGroups();

            return response()->json([
                'success' => true,
                'message' => 'Data group berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data group: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get endpoint statistics
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        try {
            $result = $this->service->getStats();

            return response()->json([
                'success' => true,
                'message' => 'Statistik endpoint berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik endpoint: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Create new endpoint
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'nm_endpoint' => 'required|string|max:255',
                'path_url' => 'required|string|max:500',
                'nm_group' => 'nullable|string|max:100',
                'nm_method' => 'nullable|string|in:GET,POST,PUT,PATCH,DELETE',
                'a_active' => 'nullable|boolean',
            ]);

            $data = $request->all();
            $result = $this->service->create($data);

            return response()->json([
                'success' => true,
                'message' => 'Endpoint berhasil ditambahkan',
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
                'message' => 'Gagal menambahkan endpoint: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update existing endpoint
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'nm_endpoint' => 'required|string|max:255',
                'path_url' => 'required|string|max:500',
                'nm_group' => 'nullable|string|max:100',
                'nm_method' => 'nullable|string|in:GET,POST,PUT,PATCH,DELETE',
                'a_active' => 'nullable|boolean',
            ]);

            $data = $request->all();
            $result = $this->service->update($id, $data);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Endpoint tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Endpoint berhasil diperbarui',
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
                'message' => 'Gagal memperbarui endpoint: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Delete endpoint (soft delete)
     *
     * @param string $id
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $result = $this->service->delete($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Endpoint tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Endpoint berhasil dihapus',
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus endpoint: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
