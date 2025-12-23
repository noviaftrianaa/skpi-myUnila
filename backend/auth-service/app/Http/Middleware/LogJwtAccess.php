<?php

namespace App\Http\Middleware;

use App\Repositories\Logger\LoggerRepository;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to log all JWT authenticated requests to logger.log_akses_jwt
 *
 * This middleware should be placed AFTER JwtAuthenticate middleware
 * so that we have access to the authenticated user and validated JWT token.
 */
class LogJwtAccess
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
        // Extract JWT token
        $token = $this->extractToken($request);

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
        if ($token) {
            $this->logAccess(
                $token,
                $menuAkses,
                $method,
                $requestData,
                $response
            );
        }

        return $response;
    }

    /**
     * Log the JWT access to database
     */
    private function logAccess(
        string $token,
        string $menuAkses,
        string $method,
        ?string $requestData,
        Response $response
    ): void {
        try {
            // Get JWT log record from database
            $jwtLog = $this->loggerRepo->getJwtLogByToken($token);

            if (!$jwtLog) {
                // Token not found in log_jwt table - this might be a refresh token or invalid token
                // Skip logging
                return;
            }

            // Determine if the request was successful
            $statusCode = $response->getStatusCode();
            $aBerhasil = $statusCode >= 200 && $statusCode < 300 ? 1 : 0;

            // Get response content (limit size)
            $hasilAkses = $this->getResponseContent($response);

            // Get status message
            $ket = $aBerhasil
                ? "HTTP {$statusCode}"
                : "HTTP {$statusCode} - " . ($response->getContent() ? substr($response->getContent(), 0, 200) : 'Error');

            // Prepare log data
            $logData = [
                'id_log_akses_jwt' => Str::uuid()->toString(),
                'id_log_jwt' => $jwtLog->id_log_jwt,
                'menu_akses' => $menuAkses,
                'method' => $method,
                'request_list' => $requestData,
                'a_berhasil' => $aBerhasil,
                'ket' => $ket,
                'hasil_akses' => $hasilAkses,
            ];

            // Save to database (don't block the response if logging fails)
            $this->loggerRepo->logJwtAccess($logData);

        } catch (\Exception $e) {
            // Log error but don't fail the request
            Log::error('LogJwtAccess middleware error', [
                'message' => $e->getMessage(),
                'menu_akses' => $menuAkses,
                'method' => $method,
            ]);
        }
    }

    /**
     * Extract token from request
     */
    private function extractToken(Request $request): ?string
    {
        // Try to get from Authorization header
        $header = $request->header('Authorization');
        if ($header && str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }

        // Try to get from query string
        return $request->query('token');
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
     * Get response content (with size limit)
     */
    private function getResponseContent(Response $response): ?string
    {
        try {
            $content = $response->getContent();

            if (!$content) {
                return null;
            }

            // Limit size
            if (strlen($content) > 5000) {
                $content = substr($content, 0, 5000) . '... (truncated)';
            }

            return $content;
        } catch (\Exception $e) {
            return null;
        }
    }
}
