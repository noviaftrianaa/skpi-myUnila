<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use App\Models\ManAkses\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use DB;
use SSO\SSO;
use App\Models\ManAkses\RolePengguna;
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
                $check = Pengguna::where('username', SSO::getUser()->username)->first();
                if(!is_null($check)) {
                    Auth::loginUsingId($check->id_pengguna);
                    alert()->success('You are logged in!');
                    // $role = RolePengguna::where('id_pengguna', $check->id_pengguna)->where('id_peran',1)->first();
                    // if(is_null($role)) {
                    //     $role = RolePengguna::where('id_pengguna', $check->id_pengguna)->orderBy('last_active','DESC')->first();
                    // }
                    Session::put('login.log_address', get_client_ip());
                    // Session::put('login.role', (!is_null($role)) ? $role : NULL);
                    return redirect()->route('home');
                } else {
                    alert()->error('Data pengguna tidak ditemukan, silahkan hubungi administrator.')->html(true);
                    return redirect()->route('auth.signing_process');
                }
            }
        } else {
            return redirect()->route('auth.logout');
        }
    }

    public function authenticate(Request $input){
        $username   = $input['username'];
        $password   = sha1($input['password']);

        $checkUser = Pengguna::where('username', $username)->first();

        if(!is_null($checkUser) && ($password==$checkUser->password)) {
            $cari = Pengguna::where('username',$username)->first();
        } else {
            $cari = null;
        }
        
        if (!is_null($cari)) {
            if ($cari->a_aktif==1) {
                if (Auth::loginUsingId($cari->id_pengguna)) {

                    $role = RolePengguna::where('id_pengguna', $cari->id_pengguna)->where('id_peran',1)->first();

                    Session::put('login.log_address', get_client_ip());
                    Session::put('login.role', (!is_null($role)) ? $role : NULL);

                    alert()->success(Auth::user()->nm_pengguna, 'Selamat Datang')->persistent("OK");

                    return redirect()->to('/');

                } else {
                    alert()->error('Login gagal')->persistent('Coba lagi');
                    return redirect()->back()->withInput(['username'=>$username]);
                }
            } else {
                alert()->error('Harap hubungi administrator untuk mengaktifkannya kembali','Pengguna tidak aktif')->persistent('Coba lagi');
                return redirect()->back();
            }
        } else {
            alert()->error('Username dan Password tidak ditemukan','Silahkan coba kembali')->persistent('Coba lagi');
            return redirect()->back()->withInput(['username'=>$username]);
        }
    }

    public function logout(){
        if(Auth::check()) {

            // UPDATE LAST ACTIVE
            if(session()->has('login.role')) {
                $response = Http::get('http://onedata.unila.ac.id/api/live/0.1/man_akses/ubah_keaktifan?id_role_pengguna='.session()->get('login.role')->id_role_pengguna);
            }
            
            Auth::logout(); //Destroy Auth
            Session::flush(); //Destroy Session
            alert()->success('Berhasil logout'); //Alert
            return redirect('/')->with('pesan', 'berhasil logout');
        } else {
            return redirect('auth/login/sso');
        }
    }
}
