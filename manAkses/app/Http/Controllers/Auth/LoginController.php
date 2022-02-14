<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use App\Models\User;
use Illuminate\Http\Request;
use DB;
use SSO\SSO;
use App\Http\Traits\Uuid;
use App\Models\RolePengguna;
use Cookie;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;
    use Uuid;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = RouteServiceProvider::HOME;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }

    public function username()
    { 
        return 'username'; // this string is column of accounts table which we are going use for login
    }

    public function showLoginForm()
    {
        // dd(Session::all(), Cookie::get());
        return view('auth.login');
    }

    public function signing_process()
    {
        if(SSO::authenticate())
        {
            if(SSO::check()) {
                $check = User::where('username', SSO::getUser()->username)->first();
                if(!is_null($check)) {
                    Auth::loginUsingId($check->id_pengguna);
                    alert()->success('You are logged in!');
                    User::where('id_pengguna', $check->id_pengguna)->update([
                        'last_sync' => date('Y-m-d h:i:s')
                    ]);
                    $role = RolePengguna::where('id_pengguna', $check->id_pengguna)->where('id_peran',1)->first();
                    if(is_null($role)) {
                        $role = RolePengguna::where('id_pengguna', $check->id_pengguna)->orderBy('last_active','DESC')->first();
                    }
                    Session::put('login.log_address', get_client_ip());
                    Session::put('login.role', (!is_null($role)) ? $role : NULL);
                    return redirect()->route('index');
                } else {
                    alert()->error('Data pengguna tidak ditemukan, silahkan hubungi administrator.')->html(true);
                    return redirect()->route('auth.login');
                }
            }
        } else {
            return redirect()->route('auth.logout');
        }
    }

    public function logout(){
        if(Auth::check()) {
            Auth::logout(); //Destroy Auth
            Session::flush(); //Destroy Session
            alert()->success('Berhasil logout'); //Alert
            if(SSO::check()) { //SSO Check
                SSO::logout(route('auth.logout')); //Logout SSO with destroy auth again
            } else {
                return redirect('auth/login')->with('pesan', 'berhasil logout');
            }
        } else {
            return redirect('auth/login');
        }
    }
}
