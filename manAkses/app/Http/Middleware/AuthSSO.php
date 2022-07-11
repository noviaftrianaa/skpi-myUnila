<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use SSO\SSO;

class AuthSSO
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if( SSO::check() ) {
            return $next($request);
        } else {
            alert()->error('Anda tidak memiliki otorisasi untuk mengakses halaman ini','Otorisasi Gagal');
            return redirect()->back();
        }
    }
}
