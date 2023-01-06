<?php

namespace MP\ManAkses;

use Closure;
use Illuminate\Contracts\Auth\Guard;
use Auth, Alert, DB;

class ManAksesMiddleware
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

        if (empty($request->user()->akses()))
        {
            alert()->error('Anda tidak mempunyai hak akses untuk bisa mengakses halaman ini','Maaf!');
            return back();
        }

        return $next($request);
    }
}
