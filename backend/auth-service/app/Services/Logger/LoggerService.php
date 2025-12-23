<?php

namespace App\Services\Logger;

use App\Repositories\Logger\LoggerRepository;
use Illuminate\Support\Facades\Log;

/**
 * Logger Service
 * Business logic for logger management
 */
class LoggerService
{
    protected LoggerRepository $repository;

    public function __construct(LoggerRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get paginated list of login logs
     *
     * @param array $params
     * @return array
     */
    public function getLoginLogs(array $params = []): array
    {
        try {
            $result = $this->repository->getLoginLogs($params);

            // Transform data
            $result['data'] = array_map(function ($item) {
                return [
                    'id_log_login' => $item->id_log_login,
                    'id_aplikasi' => $item->id_aplikasi,
                    'id_pengguna' => $item->id_pengguna,
                    'waktu_login' => $item->waktu_login,
                    'waktu_logout' => $item->waktu_logout,
                    'ip_address' => $item->ip_address,
                    'browser' => $item->browser,
                    'os' => $item->os,
                    'a_sesi_aktif' => (bool) $item->a_sesi_aktif,
                    'username' => $item->username,
                    'nm_pengguna' => $item->nm_pengguna,
                    'email' => $item->email,
                    'nm_aplikasi' => $item->nm_aplikasi,
                    'app_key' => $item->app_key,
                    'durasi_menit' => $item->durasi_menit,
                    'status_sesi' => $item->a_sesi_aktif ? 'Aktif' : 'Berakhir',
                ];
            }, $result['data']);

            return $result;
        } catch (\Exception $e) {
            Log::error('LoggerService::getLoginLogs error', [
                'message' => $e->getMessage(),
                'params' => $params
            ]);
            throw $e;
        }
    }

    /**
     * Get login log detail
     *
     * @param string $idLogLogin
     * @return array|null
     */
    public function getLoginLogDetail(string $idLogLogin): ?array
    {
        try {
            $log = $this->repository->getLoginLogDetail($idLogLogin);

            if (!$log) {
                return null;
            }

            return [
                'id_log_login' => $log->id_log_login,
                'id_aplikasi' => $log->id_aplikasi,
                'id_pengguna' => $log->id_pengguna,
                'waktu_login' => $log->waktu_login,
                'waktu_logout' => $log->waktu_logout,
                'ip_address' => $log->ip_address,
                'browser' => $log->browser,
                'os' => $log->os,
                'a_sesi_aktif' => (bool) $log->a_sesi_aktif,
                'username' => $log->username,
                'nm_pengguna' => $log->nm_pengguna,
                'email' => $log->email,
                'jenis_kelamin' => $log->jenis_kelamin,
                'no_hp' => $log->no_hp,
                'jabatan' => $log->jabatan,
                'nm_aplikasi' => $log->nm_aplikasi,
                'app_key' => $log->app_key,
                'aplikasi_url' => $log->aplikasi_url,
                'durasi_menit' => $log->durasi_menit,
                'durasi_detik' => $log->durasi_detik,
                'status_sesi' => $log->a_sesi_aktif ? 'Aktif' : 'Berakhir',
            ];
        } catch (\Exception $e) {
            Log::error('LoggerService::getLoginLogDetail error', [
                'message' => $e->getMessage(),
                'id_log_login' => $idLogLogin
            ]);
            throw $e;
        }
    }

    /**
     * Get paginated list of JWT logs
     *
     * @param array $params
     * @return array
     */
    public function getJwtLogs(array $params = []): array
    {
        try {
            $result = $this->repository->getJwtLogs($params);

            // Transform data
            $result['data'] = array_map(function ($item) {
                return [
                    'id_log_jwt' => $item->id_log_jwt,
                    'id_pengguna' => $item->id_pengguna,
                    'id_aplikasi' => $item->id_aplikasi,
                    'token_value' => $item->token_value,
                    'url' => $item->url,
                    'ip_address' => $item->ip_address,
                    'waktu_create' => $item->waktu_create,
                    'waktu_expired' => $item->waktu_expired,
                    'username' => $item->username,
                    'nm_pengguna' => $item->nm_pengguna,
                    'email' => $item->email,
                    'nm_aplikasi' => $item->nm_aplikasi,
                    'app_key' => $item->app_key,
                    'is_expired' => (bool) $item->is_expired,
                    'status' => $item->is_expired ? 'Expired' : 'Valid',
                ];
            }, $result['data']);

            return $result;
        } catch (\Exception $e) {
            Log::error('LoggerService::getJwtLogs error', [
                'message' => $e->getMessage(),
                'params' => $params
            ]);
            throw $e;
        }
    }

    /**
     * Get JWT log detail
     *
     * @param string $idLogJwt
     * @return array|null
     */
    public function getJwtLogDetail(string $idLogJwt): ?array
    {
        try {
            $log = $this->repository->getJwtLogDetail($idLogJwt);

            if (!$log) {
                return null;
            }

            // Get access logs for this JWT
            $accessLogs = $this->repository->getAccessLogsByJwt($idLogJwt, 50);

            return [
                'id_log_jwt' => $log->id_log_jwt,
                'id_pengguna' => $log->id_pengguna,
                'id_aplikasi' => $log->id_aplikasi,
                'token_value' => $log->token_value,
                'url' => $log->url,
                'ip_address' => $log->ip_address,
                'waktu_create' => $log->waktu_create,
                'waktu_expired' => $log->waktu_expired,
                'username' => $log->username,
                'nm_pengguna' => $log->nm_pengguna,
                'email' => $log->email,
                'jenis_kelamin' => $log->jenis_kelamin,
                'no_hp' => $log->no_hp,
                'jabatan' => $log->jabatan,
                'nm_aplikasi' => $log->nm_aplikasi,
                'app_key' => $log->app_key,
                'aplikasi_url' => $log->aplikasi_url,
                'is_expired' => (bool) $log->is_expired,
                'valid_durasi_menit' => $log->valid_durasi_menit,
                'status' => $log->is_expired ? 'Expired' : 'Valid',
                'access_logs' => array_map(function ($access) {
                    return [
                        'id_log_akses_jwt' => $access->id_log_akses_jwt,
                        'menu_akses' => $access->menu_akses,
                        'method' => $access->method,
                        'waktu_akses' => $access->waktu_akses,
                        'a_berhasil' => (bool) $access->a_berhasil,
                        'ket' => $access->ket,
                    ];
                }, $accessLogs),
            ];
        } catch (\Exception $e) {
            Log::error('LoggerService::getJwtLogDetail error', [
                'message' => $e->getMessage(),
                'id_log_jwt' => $idLogJwt
            ]);
            throw $e;
        }
    }

    /**
     * Get paginated list of JWT access logs
     *
     * @param array $params
     * @return array
     */
    public function getJwtAccessLogs(array $params = []): array
    {
        try {
            $result = $this->repository->getJwtAccessLogs($params);

            // Transform data
            $result['data'] = array_map(function ($item) {
                return [
                    'id_log_akses_jwt' => $item->id_log_akses_jwt,
                    'id_log_jwt' => $item->id_log_jwt,
                    'menu_akses' => $item->menu_akses,
                    'method' => $item->method,
                    'request_list' => $item->request_list,
                    'waktu_akses' => $item->waktu_akses,
                    'a_berhasil' => (bool) $item->a_berhasil,
                    'ket' => $item->ket,
                    'hasil_akses' => $item->hasil_akses,
                    'id_pengguna' => $item->id_pengguna,
                    'id_aplikasi' => $item->id_aplikasi,
                    'ip_address' => $item->ip_address,
                    'username' => $item->username,
                    'nm_pengguna' => $item->nm_pengguna,
                    'email' => $item->email,
                    'nm_aplikasi' => $item->nm_aplikasi,
                    'app_key' => $item->app_key,
                    'status' => $item->a_berhasil ? 'Berhasil' : 'Gagal',
                ];
            }, $result['data']);

            return $result;
        } catch (\Exception $e) {
            Log::error('LoggerService::getJwtAccessLogs error', [
                'message' => $e->getMessage(),
                'params' => $params
            ]);
            throw $e;
        }
    }

    /**
     * Get JWT access log detail
     *
     * @param string $idLogAksesJwt
     * @return array|null
     */
    public function getJwtAccessLogDetail(string $idLogAksesJwt): ?array
    {
        try {
            $log = $this->repository->getJwtAccessLogDetail($idLogAksesJwt);

            if (!$log) {
                return null;
            }

            return [
                'id_log_akses_jwt' => $log->id_log_akses_jwt,
                'id_log_jwt' => $log->id_log_jwt,
                'menu_akses' => $log->menu_akses,
                'method' => $log->method,
                'request_list' => $log->request_list,
                'waktu_akses' => $log->waktu_akses,
                'a_berhasil' => (bool) $log->a_berhasil,
                'ket' => $log->ket,
                'hasil_akses' => $log->hasil_akses,
                'id_pengguna' => $log->id_pengguna,
                'id_aplikasi' => $log->id_aplikasi,
                'token_value' => $log->token_value,
                'url' => $log->url,
                'ip_address' => $log->ip_address,
                'jwt_waktu_create' => $log->jwt_waktu_create,
                'jwt_waktu_expired' => $log->jwt_waktu_expired,
                'username' => $log->username,
                'nm_pengguna' => $log->nm_pengguna,
                'email' => $log->email,
                'jenis_kelamin' => $log->jenis_kelamin,
                'no_hp' => $log->no_hp,
                'jabatan' => $log->jabatan,
                'nm_aplikasi' => $log->nm_aplikasi,
                'app_key' => $log->app_key,
                'aplikasi_url' => $log->aplikasi_url,
                'status' => $log->a_berhasil ? 'Berhasil' : 'Gagal',
            ];
        } catch (\Exception $e) {
            Log::error('LoggerService::getJwtAccessLogDetail error', [
                'message' => $e->getMessage(),
                'id_log_akses_jwt' => $idLogAksesJwt
            ]);
            throw $e;
        }
    }

    /**
     * Get logger statistics
     *
     * @return array
     */
    public function getStats(): array
    {
        try {
            $stats = $this->repository->getStats();

            return [
                'login' => [
                    'total_logins' => $stats['login']->total_logins ?? 0,
                    'unique_users' => $stats['login']->unique_users ?? 0,
                    'unique_apps' => $stats['login']->unique_apps ?? 0,
                    'active_sessions' => $stats['login']->active_sessions ?? 0,
                    'logins_last_7days' => $stats['login']->logins_last_7days ?? 0,
                    'logins_last_30days' => $stats['login']->logins_last_30days ?? 0,
                ],
                'jwt' => [
                    'total_jwt_logs' => $stats['jwt']->total_jwt_logs ?? 0,
                    'unique_users' => $stats['jwt']->unique_users ?? 0,
                    'valid_tokens' => $stats['jwt']->valid_tokens ?? 0,
                    'expired_tokens' => $stats['jwt']->expired_tokens ?? 0,
                    'tokens_last_7days' => $stats['jwt']->tokens_last_7days ?? 0,
                ],
                'access' => [
                    'total_access_logs' => $stats['access']->total_access_logs ?? 0,
                    'successful_access' => $stats['access']->successful_access ?? 0,
                    'failed_access' => $stats['access']->failed_access ?? 0,
                    'access_last_7days' => $stats['access']->access_last_7days ?? 0,
                    'access_last_24hours' => $stats['access']->access_last_24hours ?? 0,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('LoggerService::getStats error', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get most active users
     *
     * @param int $limit
     * @return array
     */
    public function getMostActiveUsers(int $limit = 10): array
    {
        try {
            $users = $this->repository->getMostActiveUsers($limit);

            return array_map(function ($user) {
                return [
                    'id_pengguna' => $user->id_pengguna,
                    'username' => $user->username,
                    'nm_pengguna' => $user->nm_pengguna,
                    'email' => $user->email,
                    'login_count' => $user->login_count,
                    'access_count' => $user->access_count,
                    'last_login' => $user->last_login,
                ];
            }, $users);
        } catch (\Exception $e) {
            Log::error('LoggerService::getMostActiveUsers error', [
                'message' => $e->getMessage(),
                'limit' => $limit
            ]);
            throw $e;
        }
    }

    /**
     * Get role access logs with pagination and filters
     *
     * @param array $params
     * @return array
     */
    public function getRoleAccessLogs(array $params): array
    {
        try {
            return $this->repository->getRoleAccessLogs($params);
        } catch (\Exception $e) {
            Log::error('LoggerService::getRoleAccessLogs error', [
                'message' => $e->getMessage(),
                'params' => $params
            ]);
            throw $e;
        }
    }

    /**
     * Get role access log detail by ID
     *
     * @param string $idLogAkses
     * @return object|null
     */
    public function getRoleAccessLogDetail(string $idLogAkses): ?object
    {
        try {
            return $this->repository->getRoleAccessLogDetail($idLogAkses);
        } catch (\Exception $e) {
            Log::error('LoggerService::getRoleAccessLogDetail error', [
                'message' => $e->getMessage(),
                'id_log_akses' => $idLogAkses
            ]);
            throw $e;
        }
    }
}
