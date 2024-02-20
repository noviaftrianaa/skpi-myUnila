<?php

namespace MP\ManAkses;

use Closure;
use Illuminate\Contracts\Auth\Guard;
use MP\ManAkses\RouteTransformer;
use Auth, Alert, DB;

class AuthenticateMiddleware
{
    /**
     * The Guard implementation.
     *
     * @var Guard
     */
    protected $auth;

    /**
     * Create a new middleware instance.
     *
     * @param  Guard  $auth
     * @return void
     */
    public function __construct(Guard $auth)
    {
        $this->auth = $auth;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if ($this->auth->guest()) {
            if ($request->ajax()) {
                return response('Unauthorized.', 401);
            } else {
                return redirect('/');
            }
        }

        if ($this->userCanAccess($request->route()->getName(), session()->get('login.role')->id_peran)) {
            return $next($request);
        } else {
            alert()->error('Maaf, Anda tidak mempunyai akses untuk membuka halaman tersebut.');
            return redirect()->back();
        }
    }

    public function userCanAccess($route, $peran)
    {
        $transformer = new RouteTransformer;
        if ($transformer->hasSuffix($route)) {
            $suffix             = $transformer->suffix($route);
            $routeWithoutSuffix = $transformer->withoutSuffix($route);

            $menu = DB::table('man_akses.menu')->where('nm_file', $routeWithoutSuffix)->where('a_aktif',1)->first();

            if (is_null($menu)) {
                return false;
            }

            $menuRole = DB::table('man_akses.menu_role')->where('id_menu', $menu->id_menu)->where('a_boleh_' . $suffix, 1)->where('id_peran', $peran)->first();
            return !is_null($menuRole);
        } else {
            return !is_null(DB::table('man_akses.menu')->where('nm_file', $route)->where('a_aktif',1)->first());
        }
    }
}
