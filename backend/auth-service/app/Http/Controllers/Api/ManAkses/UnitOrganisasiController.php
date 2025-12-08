<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use App\Services\ManAkses\UnitOrganisasiService;
use App\Repositories\ManAkses\UnitOrganisasiRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Unit Organisasi Controller
 * API endpoints for unit organisasi management
 */
class UnitOrganisasiController extends Controller
{
    protected UnitOrganisasiService $service;

    public function __construct()
    {
        $repository = new UnitOrganisasiRepository();
        $this->service = new UnitOrganisasiService($repository);
    }

    /**
     * Get paginated list of unit organisasi
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
            ];

            $result = $this->service->getList($params);

            return response()->json([
                'success' => true,
                'message' => 'Data unit organisasi berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data unit organisasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get all unit organisasi for dropdown
     *
     * @return JsonResponse
     */
    public function all(): JsonResponse
    {
        try {
            $result = $this->service->getAll();

            return response()->json([
                'success' => true,
                'message' => 'Data unit organisasi berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data unit organisasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get unit organisasi detail
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
                    'message' => 'Unit organisasi tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail unit organisasi berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail unit organisasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get unit organisasi statistics
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        try {
            $result = $this->service->getStats();

            return response()->json([
                'success' => true,
                'message' => 'Statistik unit organisasi berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik unit organisasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Create new unit organisasi
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'nm_lemb' => 'required|string|max:255',
                'jln' => 'nullable|string|max:255',
                'no_tel' => 'nullable|string|max:50',
                'email' => 'nullable|email|max:100',
                'website' => 'nullable|string|max:255',
                'level_organisasi' => 'nullable|integer',
                'a_aktif' => 'nullable|boolean',
                'id_induk_organisasi' => 'nullable|string|max:36',
            ]);

            $data = $request->all();
            $result = $this->service->create($data);

            return response()->json([
                'success' => true,
                'message' => 'Unit organisasi berhasil ditambahkan',
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
                'message' => 'Gagal menambahkan unit organisasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update existing unit organisasi
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'nm_lemb' => 'required|string|max:255',
                'jln' => 'nullable|string|max:255',
                'no_tel' => 'nullable|string|max:50',
                'email' => 'nullable|email|max:100',
                'website' => 'nullable|string|max:255',
                'level_organisasi' => 'nullable|integer',
                'a_aktif' => 'nullable|boolean',
                'id_induk_organisasi' => 'nullable|string|max:36',
            ]);

            $data = $request->all();
            $result = $this->service->update($id, $data);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unit organisasi tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Unit organisasi berhasil diperbarui',
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
                'message' => 'Gagal memperbarui unit organisasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Delete unit organisasi (soft delete)
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
                    'message' => 'Unit organisasi tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Unit organisasi berhasil dihapus',
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus unit organisasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
