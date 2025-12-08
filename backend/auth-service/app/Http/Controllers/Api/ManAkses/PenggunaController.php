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
}
