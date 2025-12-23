<?php

namespace App\Http\Controllers\Api\Logger;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Kong Log Receiver Controller
 *
 * Receives access logs from Kong API Gateway and stores them in logger.log_akses_jwt table
 * This endpoint is called by Kong's HTTP Log plugin for ALL services (auth, dashboard, sister, feeder, myunila)
 *
 * Kong sends POST request with JSON body containing request/response details
 * @see https://docs.konghq.com/hub/kong-inc/http-log/
 */
class KongLogController extends Controller
{
    /**
     * Receive and store Kong access logs
     *
     * This endpoint receives logs from Kong HTTP Log plugin and stores them in logger.log_akses_jwt
     *
     * Expected JSON structure from Kong:
     * {
     *   "request": {
     *     "uri": "/api/v1/manakses/pengguna",
     *     "method": "GET",
     *     "headers": { "authorization": "Bearer xxx", ... },
     *     "querystring": {},
     *     "size": 123
     *   },
     *   "response": {
     *     "status": 200,
     *     "size": 456,
     *     "headers": {}
     *   },
     *   "latencies": {
     *     "request": 45,
     *     "kong": 2,
     *     "proxy": 43
     *   },
     *   "service": {
     *     "name": "auth-service",
     *     "id": "xxx"
     *   },
     *   "route": {
     *     "name": "auth-service-route",
     *     "id": "xxx"
     *   },
     *   "client_ip": "127.0.0.1",
     *   "started_at": 1640000000000
     * }
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $logData = $request->all();

            // Extract request data
            $method = $logData['request']['method'] ?? 'UNKNOWN';
            $uri = $logData['request']['uri'] ?? '/';
            $requestHeaders = $logData['request']['headers'] ?? [];
            $querystring = $logData['request']['querystring'] ?? [];
            $requestSize = $logData['request']['size'] ?? 0;

            // Extract response data
            $statusCode = $logData['response']['status'] ?? 0;
            $responseSize = $logData['response']['size'] ?? 0;

            // Extract latency
            $latencyMs = $logData['latencies']['request'] ?? 0;

            // Extract service info
            $serviceName = $logData['service']['name'] ?? 'unknown';
            $routeName = $logData['route']['name'] ?? 'unknown';

            // Extract client info
            $clientIp = $logData['client_ip'] ?? null;
            $userAgent = $requestHeaders['user-agent'][0] ?? null;

            // Extract JWT info from headers (Kong injects JWT claims as headers)
            $jwtPayload = $requestHeaders['x-consumer-custom-id'][0] ?? null;
            $username = $requestHeaders['x-consumer-username'][0] ?? null;

            // Parse JWT token to get id_log_jwt
            $idLogJwt = null;
            $authHeader = $requestHeaders['authorization'][0] ?? null;
            if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
                // Try to find id_log_jwt from JWT token in database
                $jwtLog = DB::selectOne("
                    SELECT TOP 1 id_log_jwt
                    FROM logger.log_jwt
                    WHERE token = ?
                    ORDER BY waktu_create DESC
                ", [$token]);

                if ($jwtLog) {
                    $idLogJwt = $jwtLog->id_log_jwt;
                }
            }

            // Determine if request was successful (2xx or 3xx status codes)
            $isSuccessful = $statusCode >= 200 && $statusCode < 400;

            // Build request details for logging
            $requestList = json_encode([
                'service' => $serviceName,
                'route' => $routeName,
                'querystring' => $querystring,
                'request_size' => $requestSize,
                'response_size' => $responseSize,
                'latency_ms' => $latencyMs,
                'user_agent' => $userAgent,
            ]);

            // Build ket (keterangan/notes)
            $ket = $isSuccessful
                ? "Success via {$serviceName}"
                : "HTTP {$statusCode} via {$serviceName}";

            // Insert into logger.log_akses_jwt
            DB::insert("
                INSERT INTO logger.log_akses_jwt (
                    id_log_jwt,
                    menu_akses,
                    method,
                    request_list,
                    waktu_akses,
                    a_berhasil,
                    ket
                ) VALUES (?, ?, ?, ?, GETDATE(), ?, ?)
            ", [
                $idLogJwt,
                $uri,
                $method,
                $requestList,
                $isSuccessful ? 1 : 0,
                $ket
            ]);

            // Return 200 to Kong (always return success to prevent Kong from retrying)
            return response()->json([
                'success' => true,
                'message' => 'Log recorded'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Kong log receiver error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            // IMPORTANT: Return 200 even on error to prevent Kong from retrying
            // We don't want to DDoS our own log receiver if there's a persistent error
            return response()->json([
                'success' => false,
                'error' => 'Internal error',
                'message' => 'Log receiver error - check Laravel logs'
            ], 200);
        }
    }

    /**
     * Health check endpoint for Kong log receiver
     *
     * @return JsonResponse
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'service' => 'Kong Log Receiver',
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
