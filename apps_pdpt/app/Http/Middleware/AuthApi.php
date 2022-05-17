<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AuthApi
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (is_null($request->header('authorization'))) {
            return response()->json([
                'message'   => 'Terjadi Kesalahan',
                'detail'    => 'Token tidak ditemukan',
                'request'   => $request->all()
            ],401);
        } else {
            return $next($request);
        }
    }
}
