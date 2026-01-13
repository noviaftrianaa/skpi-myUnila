<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    /**
     * Health check endpoint
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function check()
    {
        $status = 'healthy';
        $checks = [
            'database' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
        ];

        // If any check fails, set status to unhealthy
        foreach ($checks as $check) {
            if ($check['status'] !== 'ok') {
                $status = 'unhealthy';
                break;
            }
        }

        return response()->json([
            'service' => config('app.name'),
            'status' => $status,
            'timestamp' => now()->toIso8601String(),
            'version' => '1.0.0',
            'checks' => $checks,
        ], $status === 'healthy' ? 200 : 503);
    }

    /**
     * Check database connection
     */
    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            return ['status' => 'ok', 'message' => 'Database connected'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()];
        }
    }

    /**
     * Check Redis connection
     */
    private function checkRedis(): array
    {
        try {
            $redis = app('redis')->connection();
            $redis->ping();
            return ['status' => 'ok', 'message' => 'Redis connected'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Redis connection failed: ' . $e->getMessage()];
        }
    }
}
