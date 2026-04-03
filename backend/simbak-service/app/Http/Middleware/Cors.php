<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    public function handle(Request $request, Closure $next): Response
    {
        $allowedOrigins = config('cors.allowed_origins', []);
        $origin = $request->header('Origin');

        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $origin && in_array($origin, $allowedOrigins) ? $origin : '')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-App-Key')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Max-Age', '86400');
        }

        $response = $next($request);

<<<<<<<< HEAD:backend/public-service/app/Http/Middleware/Cors.php
        // Add CORS headers only if not already set (avoid duplicates from Kong)
        if (!$response->headers->has('Access-Control-Allow-Origin')) {
            if (in_array('*', $allowedOrigins) || ($origin && in_array($origin, $allowedOrigins))) {
                $response->headers->set('Access-Control-Allow-Origin', in_array('*', $allowedOrigins) ? '*' : $origin);
                $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
                $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Auth-Token');
                $response->headers->set('Access-Control-Allow-Credentials', 'true');
            }
========
        if ($origin && in_array($origin, $allowedOrigins)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-App-Key');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
>>>>>>>> c3c52c3942c48e0a2bb32f77ac672825b20df7ff:backend/simbak-service/app/Http/Middleware/Cors.php
        }

        return $response;
    }
}
