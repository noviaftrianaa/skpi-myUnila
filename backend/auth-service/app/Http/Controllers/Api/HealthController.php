<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiController;
use Illuminate\Http\Request;

class HealthController extends ApiController
{
    /**
     * Check service health
     *
     * @return \Illuminate\Http\JsonResponse
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
