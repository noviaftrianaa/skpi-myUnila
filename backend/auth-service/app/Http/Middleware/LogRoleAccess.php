<?php

namespace App\Http\Middleware;

use App\Repositories\Logger\LoggerRepository;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to log all authenticated requests to logger.log_akses
 *
 * This middleware should be placed AFTER JwtAuthenticate middleware
 * so that we have access to the authenticated user.
 */
class LogRoleAccess
{
    private LoggerRepository $loggerRepo;

    public function __construct()
    {
        $this->loggerRepo = new LoggerRepository();
    }

    /**
     * Handle an incoming request and log the access
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get authenticated user
        $user = $request->user();

        if (!$user) {
            // If no user, just pass through
            return $next($request);
        }

        // Get menu_akses (the route path)
        $menuAkses = $request->path();

        // Get HTTP method
        $method = $request->method();

        // Get request data (but limit size to avoid huge logs)
        $requestData = $this->getRequestData($request);

        // Execute the request first
        $response = $next($request);

        // Log the access AFTER the request completes
        // This way we can log if it was successful or failed
        $this->logAccess(
            $user,
            $menuAkses,
            $method,
            $requestData,
            $response
        );

        return $response;
    }

    /**
     * Log the access to database
     */
    private function logAccess(
        object $user,
        string $menuAkses,
        string $method,
        ?string $requestData,
        Response $response
    ): void {
        try {
            // Get user's active role_pengguna
            $roleData = $this->getActiveRolePengguna($user->id_pengguna);

            if (!$roleData) {
                // User has no active role - skip logging
                return;
            }

            // Get active login session
            $loginLog = $this->getActiveLoginLog($user->id_pengguna);

            // Determine if the request was successful
            $statusCode = $response->getStatusCode();
            $aBerhasil = $statusCode >= 200 && $statusCode < 300 ? 1 : 0;

            // Get status message
            $ket = $aBerhasil
                ? "HTTP {$statusCode}"
                : "HTTP {$statusCode} - " . ($this->getErrorMessage($response) ?? 'Error');

            // Prepare log data
            $logData = [
                'id_log_akses' => Str::uuid()->toString(),
                'id_role_pengguna' => $roleData->id_role_pengguna,
                'id_log_login' => $loginLog?->id_log_login ?? null,
                'menu_akses' => $menuAkses,
                'method' => $method,
                'request_list' => $requestData,
                'a_berhasil' => $aBerhasil,
                'ket' => $ket,
            ];

            // Save to database (don't block the response if logging fails)
            $this->loggerRepo->logRoleAccess($logData);

        } catch (\Exception $e) {
            // Log error but don't fail the request
            Log::error('LogRoleAccess middleware error', [
                'message' => $e->getMessage(),
                'user_id' => $user->id_pengguna ?? null,
                'menu_akses' => $menuAkses,
                'method' => $method,
            ]);
        }
    }

    /**
     * Get active role_pengguna for user
     */
    private function getActiveRolePengguna(string $userId): ?object
    {
        try {
            $sql = "
                SELECT TOP 1 id_role_pengguna
                FROM man_akses.role_pengguna
                WHERE id_pengguna = ?
                  AND soft_delete = 0
                  AND approval_peran = 1
                ORDER BY last_active DESC
            ";

            return DB::selectOne($sql, [$userId]);
        } catch (\Exception $e) {
            Log::error('Failed to get active role_pengguna', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get active login log for user
     */
    private function getActiveLoginLog(string $userId): ?object
    {
        try {
            $sql = "
                SELECT TOP 1 id_log_login
                FROM logger.log_login
                WHERE id_pengguna = ?
                  AND id_aplikasi = ?
                  AND a_sesi_aktif = 1
                ORDER BY waktu_login DESC
            ";

            return DB::selectOne($sql, [$userId, config('app.aplikasi_id')]);
        } catch (\Exception $e) {
            Log::error('Failed to get active login log', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get request data in JSON format (with size limit)
     */
    private function getRequestData(Request $request): ?string
    {
        try {
            $data = [];

            // Get query parameters
            if ($request->query()) {
                $data['query'] = $request->query();
            }

            // Get request body (limit to first 5000 characters)
            if ($request->getContent()) {
                $content = $request->getContent();
                if (strlen($content) > 5000) {
                    $content = substr($content, 0, 5000) . '... (truncated)';
                }

                // Try to decode JSON
                $decoded = json_decode($content, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $data['body'] = $decoded;
                } else {
                    $data['body'] = $content;
                }
            }

            return empty($data) ? null : json_encode($data, JSON_UNESCAPED_SLASHES);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get error message from response
     */
    private function getErrorMessage(Response $response): ?string
    {
        try {
            $content = $response->getContent();

            if (!$content) {
                return null;
            }

            // Try to decode JSON and get message
            $decoded = json_decode($content, true);
            if (json_last_error() === JSON_ERROR_NONE && isset($decoded['message'])) {
                return substr($decoded['message'], 0, 200);
            }

            // Return first 200 characters of response
            return substr($content, 0, 200);
        } catch (\Exception $e) {
            return null;
        }
    }
}
