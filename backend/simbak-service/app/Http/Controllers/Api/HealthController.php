<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function check()
    {
        $checks = [
            'service' => 'BAK Service (SIMBAK)',
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'connections' => [],
        ];

        // Check PostgreSQL (simbak)
        try {
            DB::connection('pgsql')->selectOne('SELECT 1');
            $checks['connections']['postgresql'] = 'connected';
        } catch (\Exception $e) {
            $checks['connections']['postgresql'] = 'disconnected';
            $checks['status'] = 'degraded';
        }

        // Check SQL Server (pdut)
        try {
            DB::connection('sqlsrv')->selectOne('SELECT 1');
            $checks['connections']['sqlserver'] = 'connected';
        } catch (\Exception $e) {
            $checks['connections']['sqlserver'] = 'disconnected';
            $checks['status'] = 'degraded';
        }

        $code = $checks['status'] === 'healthy' ? 200 : 503;
        return response()->json($checks, $code);
    }
}
