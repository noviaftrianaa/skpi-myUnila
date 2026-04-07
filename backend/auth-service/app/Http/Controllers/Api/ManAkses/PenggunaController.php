<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use App\Services\ManAkses\PenggunaService;
use App\Services\RadiusApi\RadiusApiClient;
use App\Services\RadiusApi\RadiusUserService;
use App\Repositories\ManAkses\PenggunaRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Pengguna Controller
 * API endpoints for pengguna (user) management
 */
class PenggunaController extends Controller
{
    protected PenggunaService $service;
    protected PenggunaRepository $repository;

    public function __construct()
    {
        $this->repository = new PenggunaRepository();
        $this->service = new PenggunaService($this->repository);
    }

    /**
     * Get paginated list of pengguna
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
                'has_sso' => $request->get('has_sso'), // 'yes', 'no'
                'id_peran' => $request->get('id_peran'), // filter by peran id
                'sort_by' => $request->get('sort_by', 'username'), // column to sort by
                'sort_order' => $request->get('sort_order', 'asc'), // 'asc' or 'desc'
            ];

            $result = $this->service->getList($params);

            return response()->json([
                'success' => true,
                'message' => 'Data pengguna berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get pengguna detail
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
                    'message' => 'Pengguna tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail pengguna berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get pengguna statistics
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        try {
            $result = $this->service->getStats();

            return response()->json([
                'success' => true,
                'message' => 'Statistik pengguna berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get Radius API status and configuration info
     *
     * @return JsonResponse
     */
    public function radiusStatus(): JsonResponse
    {
        try {
            $apiEnabled = config('radius_api.enabled', false);
            $apiConfigured = !empty(config('radius_api.base_url'));

            $status = [
                'api_enabled' => $apiEnabled,
                'api_configured' => $apiConfigured,
                'api_available' => false,
                'fallback_available' => false,
                'source' => 'none',
            ];

            if ($apiEnabled && $apiConfigured) {
                $client = new RadiusApiClient();
                $radiusService = new RadiusUserService($client);
                $status['api_available'] = $radiusService->isAvailable();

                if ($status['api_available']) {
                    $status['source'] = 'api';
                }
            }

            // Check database fallback
            if (!$status['api_available']) {
                try {
                    \DB::connection('radius')->select("SELECT 1");
                    $status['fallback_available'] = true;
                    if (!$status['api_available']) {
                        $status['source'] = 'database';
                    }
                } catch (\Exception $e) {
                    $status['fallback_available'] = false;
                }
            }

            if (!$status['api_available'] && !$status['fallback_available']) {
                $status['source'] = 'none';
            }

            return response()->json([
                'success' => true,
                'message' => 'Status Radius berhasil diambil',
                'data' => $status
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil status Radius: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get SSO users from Radius API
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function ssoUsers(Request $request): JsonResponse
    {
        try {
            $page = (int) $request->get('page', 1);
            $limit = (int) $request->get('limit', 100);
            $search = $request->get('search');

            // Check if API is enabled
            if (!config('radius_api.enabled', false) || empty(config('radius_api.base_url'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Radius API tidak dikonfigurasi',
                    'data' => null
                ], 400);
            }

            $client = new RadiusApiClient();
            $radiusService = new RadiusUserService($client);

            if (!$radiusService->isAvailable()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Radius API tidak tersedia',
                    'data' => null
                ], 503);
            }

            $result = $radiusService->getUsers($page, $limit, $search);

            if ($result === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengambil data SSO users',
                    'data' => null
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Data SSO users berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data SSO users: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Clear Radius API cache
     *
     * @return JsonResponse
     */
    public function clearRadiusCache(): JsonResponse
    {
        try {
            $client = new RadiusApiClient();
            $radiusService = new RadiusUserService($client);
            $radiusService->clearCache();

            return response()->json([
                'success' => true,
                'message' => 'Cache Radius API berhasil dibersihkan',
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membersihkan cache: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update pengguna
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'nm_pengguna' => 'nullable|string|max:100',
                'email' => 'nullable|email|max:100',
                'jenis_kelamin' => 'nullable|string|in:L,P',
                'tempat_lahir' => 'nullable|string|max:100',
                'tgl_lahir' => 'nullable|date',
                'alamat' => 'nullable|string|max:255',
                'no_tel' => 'nullable|string|max:20',
                'no_hp' => 'nullable|string|max:20',
                'jabatan' => 'nullable|string|max:100',
                'a_aktif' => 'nullable|boolean',
                'disable' => 'nullable|boolean',
            ]);

            $data = $request->only([
                'nm_pengguna', 'email', 'jenis_kelamin', 'tempat_lahir',
                'tgl_lahir', 'alamat', 'no_tel', 'no_hp', 'jabatan',
                'a_aktif', 'disable'
            ]);

            $result = $this->service->update($id, $data);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengguna tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil diperbarui',
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
                'message' => 'Gagal memperbarui pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Delete pengguna (soft delete)
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
                    'message' => 'Pengguna tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil dihapus',
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus pengguna: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get distinct peran options for filter dropdown
     * Only returns peran that have at least one user assigned
     *
     * @return JsonResponse
     */
    public function peranOptions(): JsonResponse
    {
        try {
            $result = $this->repository->getPeranOptions();

            return response()->json([
                'success' => true,
                'message' => 'Data peran options berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil peran options: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get MFA status for a pengguna
     *
     * @param string $id
     * @return JsonResponse
     */
    public function mfaStatus(string $id): JsonResponse
    {
        try {
            $result = $this->service->getMfaStatus($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengguna tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Status MFA berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil status MFA: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Reset MFA for a pengguna
     *
     * @param string $id
     * @return JsonResponse
     */
    public function resetMfa(string $id): JsonResponse
    {
        try {
            $result = $this->service->resetMfa($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengguna tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mereset MFA: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Reset password for a pengguna to default "unilajaya"
     *
     * @param string $id
     * @return JsonResponse
     */
    public function resetPassword(string $id): JsonResponse
    {
        try {
            $result = $this->service->resetPassword($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengguna tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mereset password: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Create new pengguna
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'username' => 'required|string|max:60',
                'password' => 'required|string|min:6',
                'nm_pengguna' => 'required|string|max:200',
                'email' => 'nullable|string|max:60',
                'tempat_lahir' => 'nullable|string|max:60',
                'tgl_lahir' => 'nullable|date',
                'jenis_kelamin' => 'required|string|in:L,P',
                'alamat' => 'nullable|string|max:255',
                'no_tel' => 'nullable|string|max:20',
                'no_hp' => 'nullable|string|max:20',
                'jabatan' => 'nullable|string|max:80',
                'id_peran' => 'nullable|integer',
            ]);

            $username = $request->input('username');

            // Check username uniqueness
            $existing = \Illuminate\Support\Facades\DB::selectOne(
                "SELECT id_pengguna FROM man_akses.pengguna WHERE username = ? AND soft_delete = 0",
                [$username]
            );
            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Username sudah terdaftar',
                ], 422);
            }

            $idPengguna = strtoupper(\Illuminate\Support\Str::uuid()->toString());
            $now = now()->format('Y-m-d H:i:s');

            // Insert pengguna using raw SQL
            \Illuminate\Support\Facades\DB::insert("
                INSERT INTO man_akses.pengguna (
                    id_pengguna, username, password, nm_pengguna, email,
                    tempat_lahir, tgl_lahir, jenis_kelamin, alamat, no_tel, no_hp,
                    jabatan, approval_pengguna, a_aktif, disable, 
                    tgl_create, last_update, soft_delete, last_sync, id_updater,
                    google2fa_enabled, failed_login_attempts
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 0, ?, ?, 0, ?, ?, 0, 0)
            ", [
                $idPengguna,
                $username,
                sha1($request->input('password')),
                $request->input('nm_pengguna'),
                $request->input('email'),
                $request->input('tempat_lahir'),
                $request->input('tgl_lahir'),
                $request->input('jenis_kelamin', 'L'),
                $request->input('alamat'),
                $request->input('no_tel'),
                $request->input('no_hp'),
                $request->input('jabatan'),
                $now, $now, $now,
                $idPengguna,
            ]);

            // Auto-assign role if provided
            $idPeran = $request->input('id_peran');
            if ($idPeran) {
                $idRolePengguna = strtoupper(\Illuminate\Support\Str::uuid()->toString());
                \Illuminate\Support\Facades\DB::insert("
                    INSERT INTO man_akses.role_pengguna (
                        id_role_pengguna, id_pengguna, id_peran, approval_peran,
                        tgl_create, last_update, soft_delete, last_sync, id_updater
                    ) VALUES (?, ?, ?, 1, ?, ?, 0, ?, ?)
                ", [$idRolePengguna, $idPengguna, $idPeran, $now, $now, $now, $idPengguna]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil ditambahkan',
                'data' => [
                    'id_pengguna' => $idPengguna,
                    'username' => $username,
                    'nm_pengguna' => $request->input('nm_pengguna'),
                ]
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->validator->errors()->first(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan pengguna: ' . $e->getMessage(),
            ], 500);
        }
    }
}
