<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;

/**
 * Health Controller
 * Check service health status
 */
class HealthController extends Controller
{
    use ApiResponse;

    /**
     * Check service health
     */
    public function check()
    {
        return $this->successResponse([
            'service' => 'auth-service',
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'version' => '1.0.0',
        ], 'Auth service is running');
    }
}
