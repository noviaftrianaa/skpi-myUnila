<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use DB;
use SSO\SSO;
use App\Http\Traits\Uuid;
use App\Models\RolePengguna;
use Cookie;
use Exception;
use Illuminate\Http\Client\HttpClientException;

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
        return view('auth.login');
    }

    public function signing_process()
    {
        if (SSO::authenticate()) {
            if (SSO::check()) {
                $check = User::where('username', SSO::getUser()->username)->first();
                if (!is_null($check)) {
                    $d['check'] = $check;
                    return view('auth.captcha', $d);
                } else {
                    alert()->error('Data pengguna tidak ditemukan, silahkan hubungi administrator.')->html(true);
                    return redirect()->to('otorisasi');
                }
            }
        } else {
            return redirect()->route('auth.logout');
        }
    }

    public function submitCaptcha(Request $request)
    {
        $array = $request->all();
        $check = json_decode($array['check']);

        return $this->authenticate($check);
    }

    private function authenticate($check)
    {
        Auth::loginUsingId($check->id_pengguna);
        alert()->success('You are logged in!');
        $role = RolePengguna::where('id_pengguna', $check->id_pengguna)->where('id_peran', 1)->first();
        if (is_null($role)) {
            $role = RolePengguna::where('id_pengguna', $check->id_pengguna)->orderBy('last_active', 'DESC')->first();
        }
        Session::put('login.log_address', get_client_ip());
        Session::put('login.role', (!is_null($role)) ? $role : NULL);
        MenuRole();

        return redirect()->route('dashboard.index');
    }

    public function logout()
    {
        if (Auth::check()) {
            try {
                // UPDATE LAST ACTIVE
                if (session()->has('login.role')) {
                    if (config('env') == 'local') {
                        $endpoint = env('API_ENDPOINT_SANDBOX');
                    } else {
                        $endpoint = env('API_ENDPOINT_LIVE');
                    }
                    Http::get($endpoint . '/man_akses/ubah_keaktifan?id_role_pengguna=' . session()->get('login.role')->id_role_pengguna);
                }
            } catch (HttpClientException $he) {
                logger()->error(__CLASS__ . DIRECTORY_SEPARATOR . __FUNCTION__ . ':' . $he->getMessage());
            } catch (Exception $e) {
                logger()->error(__CLASS__ . DIRECTORY_SEPARATOR . __FUNCTION__ . ':' . $e->getMessage());
            } finally {
                Auth::logout(); //Destroy Auth
                Session::flush(); //Destroy Session
                alert()->success('Berhasil logout'); //Alert
                if (SSO::check()) { //SSO Check
                    SSO::logout(route('auth.logout')); //Logout with redirect to index page
                } else {
                    return redirect('auth/login')->with('pesan', 'berhasil logout');
                }
            }
        } else {
            return redirect('auth/login');
        }
    }
}
