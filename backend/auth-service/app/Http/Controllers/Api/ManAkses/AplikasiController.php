<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use App\Services\ManAkses\AplikasiService;
use App\Repositories\ManAkses\AplikasiRepository;
use App\Repositories\UserContext\UserContextRepository;
use App\Services\UserContext\UserContextService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
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
        $userContextRepository = new UserContextRepository();
        $userContextService = new UserContextService($userContextRepository);
        $this->service = new AplikasiService($repository, $userContextService);
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
                'mode' => $request->get('mode'), // 'production', 'development'
                'portal' => $request->get('portal'), // 'ya', 'tidak'
                'terintegrasi' => $request->get('terintegrasi'), // 'ya', 'tidak'
                'sso_cas' => $request->get('sso_cas'), // 'ya', 'tidak'
                'maintenance' => $request->get('maintenance'), // 'ya', 'tidak'
                'coming_soon' => $request->get('coming_soon'), // 'ya', 'tidak'
                'sort_by' => $request->get('sort_by'), // column name
                'sort_order' => $request->get('sort_order'), // 'asc', 'desc'
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
                'a_live' => 'nullable|boolean',
                'a_filter_organisasi' => 'nullable|boolean',
                'status' => 'nullable|string|in:Aktif,Tidak Aktif',
            ]);

            $data = $request->only([
                'nm_aplikasi', 'ket_aplikasi', 'id_organisasi', 'id_kategori',
                'url', 'port', 'teknologi', 'endpoint_ws',
                'icon_name', 'icon_color', 'app_slug', 'urutan',
                'a_generate_menu', 'a_integrasi_cas', 'a_sistem_internal_pt',
                'a_tampil_portal', 'a_maintenance', 'a_coming_soon', 'a_terintegrasi', 'a_live', 'a_filter_organisasi',
                'status'
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
                'a_live' => 'nullable|boolean',
                'status' => 'nullable|string|in:Aktif,Tidak Aktif',
                'a_filter_organisasi' => 'nullable|boolean',
            ]);

            $data = $request->only([
                'nm_aplikasi', 'ket_aplikasi', 'id_organisasi', 'id_kategori',
                'url', 'port', 'teknologi', 'endpoint_ws',
                'icon_name', 'icon_color', 'app_slug', 'urutan',
                'a_generate_menu', 'a_integrasi_cas', 'a_sistem_internal_pt',
                'a_tampil_portal', 'a_maintenance', 'a_coming_soon', 'a_terintegrasi', 'a_live', 'a_filter_organisasi',
                'status'
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

    /**
     * Regenerate app_key for aplikasi
     *
     * @param string $id
     * @return JsonResponse
     */
    public function regenerateAppKey(string $id): JsonResponse
    {
        try {
            $result = $this->service->regenerateAppKey($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aplikasi tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'App Key berhasil di-generate ulang',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal generate app key: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get whitelisted organisations for an application
     */
    public function getOrganisasi(string $id): JsonResponse
    {
        try {
            $orgs = DB::select("
                SELECT ao.id_app_org, CONVERT(VARCHAR(36), ao.id_organisasi) as id_organisasi, 
                       ao.a_include_children, ao.ket,
                       uo.nm_lemb as nm_organisasi
                FROM man_akses.aplikasi_organisasi ao
                LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = ao.id_organisasi
                WHERE ao.id_aplikasi = ? AND ISNULL(ao.soft_delete, 0) = 0
                ORDER BY uo.nm_lemb
            ", [$id]);

            return response()->json([
                'success' => true,
                'data' => $orgs
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data organisasi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add organisation to app whitelist
     */
    public function addOrganisasi(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'id_organisasi' => 'required|string|max:36',
                'a_include_children' => 'nullable|boolean',
                'ket' => 'nullable|string|max:255',
            ]);

            // Cek duplicate
            $exists = DB::selectOne("
                SELECT COUNT(*) as cnt FROM man_akses.aplikasi_organisasi 
                WHERE id_aplikasi = ? AND id_organisasi = ? AND ISNULL(soft_delete, 0) = 0
            ", [$id, $request->id_organisasi]);

            if ($exists && $exists->cnt > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Organisasi sudah terdaftar untuk aplikasi ini'
                ], 409);
            }

            DB::insert("
                INSERT INTO man_akses.aplikasi_organisasi 
                (id_app_org, id_aplikasi, id_organisasi, a_include_children, ket, tgl_create, last_update, soft_delete, last_sync, id_updater)
                VALUES (NEWID(), ?, ?, ?, ?, GETDATE(), GETDATE(), 0, GETDATE(), '00000000-0000-0000-0000-000000000000')
            ", [$id, $request->id_organisasi, $request->a_include_children ?? 1, $request->ket]);

            return response()->json([
                'success' => true,
                'message' => 'Organisasi berhasil ditambahkan'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambah organisasi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove organisation from app whitelist
     */
    public function removeOrganisasi(string $id, string $orgId): JsonResponse
    {
        try {
            $affected = DB::update("
                UPDATE man_akses.aplikasi_organisasi 
                SET soft_delete = 1, last_update = GETDATE()
                WHERE id_aplikasi = ? AND id_organisasi = ? AND ISNULL(soft_delete, 0) = 0
            ", [$id, $orgId]);

            if ($affected === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Organisasi berhasil dihapus dari whitelist'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus organisasi: ' . $e->getMessage()
            ], 500);
        }
    }
}
