<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use App\Services\ManAkses\RolePenggunaService;
use App\Repositories\ManAkses\RolePenggunaRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Role Pengguna Controller
 * API endpoints for role pengguna management
 */
class RolePenggunaController extends Controller
{
    protected RolePenggunaService $service;

    public function __construct()
    {
        $repository = new RolePenggunaRepository();
        $this->service = new RolePenggunaService($repository);
    }

    /**
     * Get paginated list of role pengguna
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
                'id_pengguna' => $request->get('id_pengguna'),
                'id_peran' => $request->get('id_peran'),
                'id_organisasi' => $request->get('id_organisasi'),
            ];

            $result = $this->service->getList($params);

            return response()->json([
                'success' => true,
                'message' => 'Data role pengguna berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data role pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get role pengguna detail
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
                    'message' => 'Role pengguna tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail role pengguna berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail role pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get roles by pengguna ID
     *
     * @param string $idPengguna
     * @return JsonResponse
     */
    public function byPengguna(string $idPengguna): JsonResponse
    {
        try {
            $result = $this->service->getByPengguna($idPengguna);

            return response()->json([
                'success' => true,
                'message' => 'Data role pengguna berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data role pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Create new role pengguna
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'id_pengguna' => 'required|string|max:36',
                'id_peran' => 'required|integer',
                'id_organisasi' => 'nullable|string|max:36',
                'sk_penugasan' => 'nullable|string|max:100',
                'tgl_sk_penugasan' => 'nullable|date',
                'approval_peran' => 'nullable|boolean',
                'tgl_kadaluarsa' => 'nullable|date',
            ]);

            $data = $request->all();
            $result = $this->service->create($data);

            return response()->json([
                'success' => true,
                'message' => 'Role pengguna berhasil ditambahkan',
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
                'message' => 'Gagal menambahkan role pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update existing role pengguna
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'id_peran' => 'required|integer',
                'id_organisasi' => 'nullable|string|max:36',
                'sk_penugasan' => 'nullable|string|max:100',
                'tgl_sk_penugasan' => 'nullable|date',
                'approval_peran' => 'nullable|boolean',
                'tgl_kadaluarsa' => 'nullable|date',
            ]);

            $data = $request->all();
            $result = $this->service->update($id, $data);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Role pengguna tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Role pengguna berhasil diperbarui',
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
                'message' => 'Gagal memperbarui role pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Delete role pengguna (soft delete)
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
                    'message' => 'Role pengguna tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Role pengguna berhasil dihapus',
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus role pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
