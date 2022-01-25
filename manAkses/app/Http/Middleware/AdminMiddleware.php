<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\RolePengguna;
use DB;
use Auth;
use SSO\SSO;
use Session;

class AdminMiddleware
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
        //CHECK ADMIN
        // $check = RolePengguna::where('id_pengguna', auth()->user()->id_pengguna)->where('id_peran', 1)->first();
        if(Session::get('login.role')->id_peran==1) {
            if(SSO::check()==true) {
                return $next($request);
            } else {
                return redirect()->route('auth.logout');
            }
        } else {
            alert()->error('Anda tidak memiliki otorisasi untuk mengakses halaman ini','Otorisasi Gagal');
            return redirect()->back();
        }
    }
}
