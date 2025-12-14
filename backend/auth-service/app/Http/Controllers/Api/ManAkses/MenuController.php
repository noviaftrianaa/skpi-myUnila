<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use App\Services\ManAkses\MenuService;
use App\Repositories\ManAkses\MenuRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Menu Controller
 * API endpoints for menu management within applications
 *
 * Endpoints:
 * - GET    /manakses/menu                      - Get all menus (paginated)
 * - GET    /manakses/menu/stats                - Get menu statistics
 * - GET    /manakses/menu/by-aplikasi/{id}     - Get menus for specific app
 * - POST   /manakses/menu                      - Create new menu
 * - GET    /manakses/menu/{id}                 - Get menu detail
 * - PUT    /manakses/menu/{id}                 - Update menu
 * - DELETE /manakses/menu/{id}                 - Delete menu
 * - POST   /manakses/menu/sync/{idAplikasi}    - Sync menus from frontend config
 */
class MenuController extends Controller
{
    protected MenuService $service;

    public function __construct()
    {
        $repository = new MenuRepository();
        $this->service = new MenuService($repository);
    }

    /**
     * Get all menus (paginated)
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
                'id_aplikasi' => $request->get('id_aplikasi'),
                'a_aktif' => $request->get('a_aktif'),
                'sort_by' => $request->get('sort_by', 'nm_menu'),
                'sort_order' => $request->get('sort_order', 'asc'),
            ];

            $result = $this->service->getList($params);

            return response()->json([
                'success' => true,
                'message' => 'Data menu berhasil diambil',
                'data' => $result['data'],
                'total' => $result['total'],
                'page' => $params['page'],
                'limit' => $params['limit'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data menu: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get menus by aplikasi ID
     *
     * @param Request $request
     * @param string $idAplikasi
     * @return JsonResponse
     */
    public function byAplikasi(Request $request, string $idAplikasi): JsonResponse
    {
        try {
            $params = [
                'include_inactive' => $request->boolean('include_inactive', false),
                'include_roles' => $request->boolean('include_roles', false),
            ];

            $format = $request->get('format', 'tree'); // tree or flat

            if ($format === 'flat') {
                $menus = $this->service->getFlatByAplikasi($idAplikasi);
            } else {
                $menus = $this->service->getByAplikasi($idAplikasi, $params);
            }

            return response()->json([
                'success' => true,
                'message' => 'Data menu berhasil diambil',
                'data' => [
                    'menus' => $menus,
                    'total' => count($menus),
                    'format' => $format,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data menu: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get menu statistics
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            $idAplikasi = $request->get('id_aplikasi');
            $stats = $this->service->getStats($idAplikasi);

            return response()->json([
                'success' => true,
                'message' => 'Statistik menu berhasil diambil',
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik menu: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get menu detail by ID
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        try {
            $menu = $this->service->getDetail($id);

            if (!$menu) {
                return response()->json([
                    'success' => false,
                    'message' => 'Menu tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail menu berhasil diambil',
                'data' => $menu
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail menu: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Create new menu
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'nm_menu' => 'required|string|max:100',
                'id_aplikasi' => 'required|string|max:36',
                'nm_file' => 'nullable|string|max:100',
                'urutan_menu' => 'nullable|integer|min:0',
                'a_aktif' => 'nullable|boolean',
                'a_tampil' => 'nullable|boolean',
                'icon' => 'nullable|string|max:100',
                'id_group_menu' => 'nullable|string|max:36',
            ]);

            $data = $request->only([
                'nm_menu', 'id_aplikasi', 'nm_file', 'urutan_menu',
                'a_aktif', 'a_tampil', 'icon', 'id_group_menu'
            ]);

            $result = $this->service->create($data);

            return response()->json([
                'success' => true,
                'message' => 'Menu berhasil ditambahkan',
                'data' => $result['menu']
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
                'message' => 'Gagal menambahkan menu: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update existing menu
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'nm_menu' => 'required|string|max:100',
                'nm_file' => 'nullable|string|max:100',
                'urutan_menu' => 'nullable|integer|min:0',
                'a_aktif' => 'nullable|boolean',
                'a_tampil' => 'nullable|boolean',
                'icon' => 'nullable|string|max:100',
                'id_group_menu' => 'nullable|string|max:36',
            ]);

            $data = $request->only([
                'nm_menu', 'nm_file', 'urutan_menu',
                'a_aktif', 'a_tampil', 'icon', 'id_group_menu'
            ]);

            $result = $this->service->update($id, $data);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Menu berhasil diperbarui',
                'data' => $result['menu']
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
                'message' => 'Gagal memperbarui menu: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Delete menu (soft delete)
     *
     * @param string $id
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $result = $this->service->delete($id);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Menu berhasil dihapus',
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus menu: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Sync menus from frontend config
     * Bulk create/update menus based on provided JSON structure
     *
     * @param Request $request
     * @param string $idAplikasi
     * @return JsonResponse
     */
    public function sync(Request $request, string $idAplikasi): JsonResponse
    {
        try {
            $request->validate([
                'menus' => 'required|array',
                'menus.*.title' => 'required|string|max:100',
                'menus.*.href' => 'nullable|string|max:255',
                'menus.*.icon' => 'nullable|string|max:100',
                'menus.*.children' => 'nullable|array',
            ]);

            $menus = $request->input('menus');
            $result = $this->service->syncMenus($idAplikasi, $menus);

            return response()->json([
                'success' => true,
                'message' => "Sync berhasil. Created: {$result['stats']['created']}, Updated: {$result['stats']['updated']}",
                'data' => [
                    'stats' => $result['stats'],
                    'menus' => $result['menus'],
                ]
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
                'message' => 'Gagal sync menu: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get role assignments for a menu
     *
     * @param string $id
     * @return JsonResponse
     */
    public function roles(string $id): JsonResponse
    {
        try {
            $menu = $this->service->getDetail($id);

            if (!$menu) {
                return response()->json([
                    'success' => false,
                    'message' => 'Menu tidak ditemukan',
                    'data' => null
                ], 404);
            }

            $roles = $this->service->getMenuRoles($id);

            return response()->json([
                'success' => true,
                'message' => 'Role assignments berhasil diambil',
                'data' => [
                    'menu' => [
                        'id_menu' => $menu->id_menu,
                        'nm_menu' => $menu->nm_menu,
                    ],
                    'roles' => $roles,
                    'total' => count($roles),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil role assignments: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
