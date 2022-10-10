<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use SSO\SSO;
use Auth;

class MainMiddleware
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
        // (SSO::check()&&Auth::check()) ||
        if( Auth::check() ) {
            return $next($request);
        } else {
            return redirect()->route('auth.logout');
        }
    }
}
