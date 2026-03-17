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
                'id_aplikasi' => $request->get('id_aplikasi'),
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
     * Get applications that have endpoints registered
     *
     * @return JsonResponse
     */
    public function appsWithEndpoints(): JsonResponse
    {
        try {
            $repository = new \App\Repositories\ManAkses\EndpointRepository();
            $result = $repository->getAppsWithEndpoints();

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
    /**
     * Generate/upsert endpoints from external source (e.g. Go api-service routes)
     * Match by path_url + nm_method → update if exists, insert if new
     */
    public function generate(Request $request): JsonResponse
    {
        try {
            $idAplikasi = $request->input('id_aplikasi');
            $endpoints = $request->input('endpoints', []);

            if (!$idAplikasi || empty($endpoints)) {
                return response()->json([
                    'success' => false,
                    'message' => 'id_aplikasi dan endpoints wajib diisi',
                ], 422);
            }

            $inserted = 0;
            $updated = 0;
            $unchanged = 0;

            foreach ($endpoints as $ep) {
                $pathUrl = $ep['path_url'] ?? '';
                $method = strtoupper($ep['nm_method'] ?? 'GET');
                $group = $ep['nm_group'] ?? 'uncategorized';
                $name = $ep['nm_endpoint'] ?? $pathUrl;

                if (empty($pathUrl)) continue;

                // Check existing by path_url + method + aplikasi
                $existing = \Illuminate\Support\Facades\DB::selectOne("
                    SELECT id_ws_endpoint, nm_group, nm_endpoint, soft_delete
                    FROM man_akses.ws_endpoint 
                    WHERE path_url = ? AND nm_method = ? AND id_aplikasi = ?
                ", [$pathUrl, $method, $idAplikasi]);

                if ($existing) {
                    if ($existing->soft_delete == 1) {
                        // Reactivate
                        \Illuminate\Support\Facades\DB::update("
                            UPDATE man_akses.ws_endpoint 
                            SET nm_group = ?, nm_endpoint = ?, a_active = 1, soft_delete = 0, 
                                last_sync = GETDATE(), updated_at = GETDATE()
                            WHERE id_ws_endpoint = ?
                        ", [$group, $name, $existing->id_ws_endpoint]);
                        $updated++;
                    } elseif ($existing->nm_group !== $group || $existing->nm_endpoint !== $name) {
                        // Update group/name
                        \Illuminate\Support\Facades\DB::update("
                            UPDATE man_akses.ws_endpoint 
                            SET nm_group = ?, nm_endpoint = ?, last_sync = GETDATE(), updated_at = GETDATE()
                            WHERE id_ws_endpoint = ?
                        ", [$group, $name, $existing->id_ws_endpoint]);
                        $updated++;
                    } else {
                        // Touch last_sync only
                        \Illuminate\Support\Facades\DB::update("
                            UPDATE man_akses.ws_endpoint SET last_sync = GETDATE() WHERE id_ws_endpoint = ?
                        ", [$existing->id_ws_endpoint]);
                        $unchanged++;
                    }
                } else {
                    // Insert new
                    \Illuminate\Support\Facades\DB::insert("
                        INSERT INTO man_akses.ws_endpoint 
                        (id_ws_endpoint, nm_group, nm_method, nm_endpoint, path_url, a_active, 
                         id_aplikasi, created_at, updated_at, last_sync, soft_delete)
                        VALUES (NEWID(), ?, ?, ?, ?, 1, ?, GETDATE(), GETDATE(), GETDATE(), 0)
                    ", [$group, $method, $name, $pathUrl, $idAplikasi]);
                    $inserted++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Generate selesai: {$inserted} baru, {$updated} diperbarui, {$unchanged} tidak berubah",
                'inserted' => $inserted,
                'updated' => $updated,
                'unchanged' => $unchanged,
                'total_processed' => count($endpoints),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal generate: ' . $e->getMessage(),
            ], 500);
        }
    }

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
