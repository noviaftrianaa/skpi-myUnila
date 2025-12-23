<?php

namespace App\Http\Controllers\Api\Logger;

use App\Http\Controllers\Controller;
use App\Services\Logger\LoggerService;
use App\Repositories\Logger\LoggerRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Logger Controller
 * API endpoints for logger management (log_login, log_jwt, log_akses_jwt)
 */
class LoggerController extends Controller
{
    protected LoggerService $service;
    protected LoggerRepository $repository;

    public function __construct()
    {
        $this->repository = new LoggerRepository();
        $this->service = new LoggerService($this->repository);
    }

    /**
     * Get logger statistics
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        try {
            $result = $this->service->getStats();

            return response()->json([
                'success' => true,
                'message' => 'Statistik logger berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik logger: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get most active users
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function mostActiveUsers(Request $request): JsonResponse
    {
        try {
            $limit = (int) $request->get('limit', 10);
            $result = $this->service->getMostActiveUsers($limit);

            return response()->json([
                'success' => true,
                'message' => 'Data pengguna paling aktif berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pengguna paling aktif: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    // ==================== LOG LOGIN ====================

    /**
     * Get paginated list of login logs
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function loginLogs(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'search' => $request->get('search'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'id_aplikasi' => $request->get('id_aplikasi'),
                'id_pengguna' => $request->get('id_pengguna'),
                'a_sesi_aktif' => $request->get('a_sesi_aktif'),
                'sort_by' => $request->get('sort_by', 'waktu_login'),
                'sort_order' => $request->get('sort_order', 'desc'),
            ];

            $result = $this->service->getLoginLogs($params);

            return response()->json([
                'success' => true,
                'message' => 'Data log login berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data log login: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get login log detail
     *
     * @param string $id
     * @return JsonResponse
     */
    public function loginLogDetail(string $id): JsonResponse
    {
        try {
            $result = $this->service->getLoginLogDetail($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Log login tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail log login berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail log login: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    // ==================== LOG JWT ====================

    /**
     * Get paginated list of JWT logs
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function jwtLogs(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'search' => $request->get('search'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'id_aplikasi' => $request->get('id_aplikasi'),
                'id_pengguna' => $request->get('id_pengguna'),
                'sort_by' => $request->get('sort_by', 'waktu_create'),
                'sort_order' => $request->get('sort_order', 'desc'),
            ];

            $result = $this->service->getJwtLogs($params);

            return response()->json([
                'success' => true,
                'message' => 'Data log JWT berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data log JWT: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get JWT log detail
     *
     * @param string $id
     * @return JsonResponse
     */
    public function jwtLogDetail(string $id): JsonResponse
    {
        try {
            $result = $this->service->getJwtLogDetail($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Log JWT tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail log JWT berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail log JWT: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    // ==================== LOG AKSES JWT ====================

    /**
     * Get paginated list of JWT access logs
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function jwtAccessLogs(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'search' => $request->get('search'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'id_log_jwt' => $request->get('id_log_jwt'),
                'a_berhasil' => $request->get('a_berhasil'),
                'method' => $request->get('method'),
                'sort_by' => $request->get('sort_by', 'waktu_akses'),
                'sort_order' => $request->get('sort_order', 'desc'),
            ];

            $result = $this->service->getJwtAccessLogs($params);

            return response()->json([
                'success' => true,
                'message' => 'Data log akses JWT berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data log akses JWT: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get JWT access log detail
     *
     * @param string $id
     * @return JsonResponse
     */
    public function jwtAccessLogDetail(string $id): JsonResponse
    {
        try {
            $result = $this->service->getJwtAccessLogDetail($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Log akses JWT tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail log akses JWT berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail log akses JWT: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get role access logs with pagination
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function roleAccessLogs(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'search' => $request->get('search'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'id_role_pengguna' => $request->get('id_role_pengguna'),
                'a_berhasil' => $request->get('a_berhasil'),
                'method' => $request->get('method'),
                'sort_by' => $request->get('sort_by', 'waktu_akses'),
                'sort_order' => $request->get('sort_order', 'desc'),
            ];

            $result = $this->service->getRoleAccessLogs($params);

            return response()->json([
                'success' => true,
                'message' => 'Data log akses role berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data log akses role: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get role access log detail
     *
     * @param string $id
     * @return JsonResponse
     */
    public function roleAccessLogDetail(string $id): JsonResponse
    {
        try {
            $result = $this->service->getRoleAccessLogDetail($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Log akses role tidak ditemukan',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail log akses role berhasil diambil',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail log akses role: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
