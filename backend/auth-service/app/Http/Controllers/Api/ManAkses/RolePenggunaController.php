<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use App\Services\ManAkses\RolePenggunaService;
use App\Services\UserContext\UserContextService;
use App\Repositories\ManAkses\RolePenggunaRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Role Pengguna Controller
 * API endpoints for role pengguna management
 *
 * Setiap mutasi role-pengguna (store/update/destroy) otomatis trigger
 * cache invalidation untuk user terkait, supaya perubahan langsung terasa
 * tanpa perlu user logout / wait TTL 60 menit.
 */
class RolePenggunaController extends Controller
{
    protected RolePenggunaService $service;
    protected UserContextService $userContextService;

    public function __construct(UserContextService $userContextService)
    {
        $repository = new RolePenggunaRepository();
        $this->service = new RolePenggunaService($repository);
        $this->userContextService = $userContextService;
    }

    /**
     * Invalidate cache untuk user yang role-nya baru saja berubah.
     * Dipanggil setelah store/update/destroy supaya frontend user tsb
     * langsung dapat data baru saat refresh tanpa logout dulu.
     *
     * Cache yang di-clear:
     *   - user_context:<userId>   (peran/organisasi/active context)
     *   - portal_apps:role:*       (daftar app yang accessible per role)
     */
    private function invalidateUserCache(?string $userId, ?string $orgId = null): void
    {
        if (!$userId) {
            return;
        }
        try {
            $this->userContextService->clearContext($userId);
            $this->userContextService->invalidatePortalAppsCache($orgId);
            Log::info('Auto-invalidated cache after role-pengguna mutation', [
                'user_id' => $userId,
                'org_id' => $orgId,
            ]);
        } catch (\Exception $e) {
            // Cache invalidation failure jangan block response — cuma log warning.
            Log::warning('Failed to invalidate user cache: ' . $e->getMessage(), [
                'user_id' => $userId,
            ]);
        }
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
                'sort_by' => $request->get('sort_by'), // column name
                'sort_order' => $request->get('sort_order'), // 'asc', 'desc'
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
            // Add id_updater from authenticated user
            $data['id_updater'] = $request->user()->id_pengguna ?? $request->user()->id ?? null;
            $result = $this->service->create($data);

            // Invalidate cache user yg role-nya baru di-tambah supaya realtime
            $this->invalidateUserCache($data['id_pengguna'] ?? null, $data['id_organisasi'] ?? null);

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
            // Add id_updater from authenticated user
            $data['id_updater'] = $request->user()->id_pengguna ?? $request->user()->id ?? null;
            $result = $this->service->update($id, $data);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Role pengguna tidak ditemukan',
                    'data' => null
                ], 404);
            }

            // Invalidate cache user yg role-nya baru di-update supaya realtime.
            // id_pengguna dari result (kalau service return), atau dari $data sebagai fallback.
            $userId = is_array($result) ? ($result['id_pengguna'] ?? null)
                                         : ($result->id_pengguna ?? null);
            $this->invalidateUserCache($userId ?? ($data['id_pengguna'] ?? null), $data['id_organisasi'] ?? null);

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
            // Ambil id_pengguna SEBELUM delete supaya tahu user mana yg cache-nya
            // perlu di-invalidate (setelah delete, repository return null).
            $existing = $this->service->getDetail($id);
            $affectedUserId = is_array($existing) ? ($existing['id_pengguna'] ?? null)
                                                   : ($existing->id_pengguna ?? null);
            $affectedOrgId = is_array($existing) ? ($existing['id_organisasi'] ?? null)
                                                  : ($existing->id_organisasi ?? null);

            $result = $this->service->delete($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Role pengguna tidak ditemukan',
                    'data' => null
                ], 404);
            }

            // Invalidate cache user yg role-nya baru di-hapus supaya realtime.
            $this->invalidateUserCache($affectedUserId, $affectedOrgId);

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
