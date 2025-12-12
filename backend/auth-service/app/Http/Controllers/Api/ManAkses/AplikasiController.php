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

    /**
     * Get categories for dropdown
     *
     * @return JsonResponse
     */
    public function categories(): JsonResponse
    {
        try {
            $result = $this->service->getCategories();

            return response()->json([
                'success' => true,
                'message' => 'Kategori aplikasi berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil kategori aplikasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Create new aplikasi
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'nm_aplikasi' => 'required|string|max:255',
                'ket_aplikasi' => 'nullable|string',
                'id_organisasi' => 'nullable|string|max:36',
                'id_kategori' => 'nullable|string|max:36',
                'url' => 'nullable|string|max:255',
                'port' => 'nullable|string|max:10',
                'teknologi' => 'nullable|string|max:100',
                'endpoint_ws' => 'nullable|string|max:255',
                'icon_name' => 'nullable|string|max:100',
                'icon_color' => 'nullable|string|max:50',
                'app_slug' => 'nullable|string|max:100',
                'urutan' => 'nullable|integer',
                'a_generate_menu' => 'nullable|boolean',
                'a_integrasi_cas' => 'nullable|boolean',
                'a_sistem_internal_pt' => 'nullable|boolean',
                'a_tampil_portal' => 'nullable|boolean',
                'a_maintenance' => 'nullable|boolean',
                'a_coming_soon' => 'nullable|boolean',
                'a_terintegrasi' => 'nullable|boolean',
            ]);

            $data = $request->only([
                'nm_aplikasi', 'ket_aplikasi', 'id_organisasi', 'id_kategori',
                'url', 'port', 'teknologi', 'endpoint_ws',
                'icon_name', 'icon_color', 'app_slug', 'urutan',
                'a_generate_menu', 'a_integrasi_cas', 'a_sistem_internal_pt',
                'a_tampil_portal', 'a_maintenance', 'a_coming_soon', 'a_terintegrasi'
            ]);

            $result = $this->service->create($data);

            return response()->json([
                'success' => true,
                'message' => 'Aplikasi berhasil ditambahkan',
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
                'message' => 'Gagal menambahkan aplikasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update existing aplikasi
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'nm_aplikasi' => 'required|string|max:255',
                'ket_aplikasi' => 'nullable|string',
                'id_organisasi' => 'nullable|string|max:36',
                'id_kategori' => 'nullable|string|max:36',
                'url' => 'nullable|string|max:255',
                'port' => 'nullable|string|max:10',
                'teknologi' => 'nullable|string|max:100',
                'endpoint_ws' => 'nullable|string|max:255',
                'icon_name' => 'nullable|string|max:100',
                'icon_color' => 'nullable|string|max:50',
                'app_slug' => 'nullable|string|max:100',
                'urutan' => 'nullable|integer',
                'a_generate_menu' => 'nullable|boolean',
                'a_integrasi_cas' => 'nullable|boolean',
                'a_sistem_internal_pt' => 'nullable|boolean',
                'a_tampil_portal' => 'nullable|boolean',
                'a_maintenance' => 'nullable|boolean',
                'a_coming_soon' => 'nullable|boolean',
                'a_terintegrasi' => 'nullable|boolean',
            ]);

            $data = $request->only([
                'nm_aplikasi', 'ket_aplikasi', 'id_organisasi', 'id_kategori',
                'url', 'port', 'teknologi', 'endpoint_ws',
                'icon_name', 'icon_color', 'app_slug', 'urutan',
                'a_generate_menu', 'a_integrasi_cas', 'a_sistem_internal_pt',
                'a_tampil_portal', 'a_maintenance', 'a_coming_soon', 'a_terintegrasi'
            ]);

            $result = $this->service->update($id, $data);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aplikasi tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Aplikasi berhasil diperbarui',
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
                'message' => 'Gagal memperbarui aplikasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Delete aplikasi (soft delete)
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
                    'message' => 'Aplikasi tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Aplikasi berhasil dihapus',
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus aplikasi: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
