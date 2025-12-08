<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    /**
     * Handle an incoming request.
     *
     * Skip CORS headers if Kong/Nginx already added them (via X-Kong-* headers or existing CORS headers).
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip CORS handling if request came through Kong (Kong handles CORS)
        if ($request->hasHeader('X-Kong-Request-Id') || $request->hasHeader('X-Forwarded-By')) {
            return $next($request);
        }

        $allowedOrigins = config('cors.allowed_origins', ['*']);
        $origin = $request->header('Origin');

        // Handle preflight OPTIONS request (only if not from Kong)
        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Auth-Token')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Max-Age', '86400');
        }

        $response = $next($request);

        // Add CORS headers only if not already set (avoid duplicates)
        if (!$response->headers->has('Access-Control-Allow-Origin')) {
            if (in_array('*', $allowedOrigins) || ($origin && in_array($origin, $allowedOrigins))) {
                $response->headers->set('Access-Control-Allow-Origin', in_array('*', $allowedOrigins) ? '*' : $origin);
                $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
                $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Auth-Token');
                $response->headers->set('Access-Control-Allow-Credentials', 'true');
            }
        }

        return $response;
    }
}
