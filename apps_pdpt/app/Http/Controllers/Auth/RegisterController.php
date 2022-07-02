<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use App\Models\User;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use App\Http\Requests\Auth\AktivasiRequest;
use Illuminate\Support\Str;
use App\Http\Traits\Uuid;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers;
    use Uuid;

    /**
     * Where to redirect users after registration.
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
        $this->middleware('guest');
    }

    public function index()
    {
        return view('auth.register');
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'username' => ['required', 'string', 'email', 'max:255', 'unique:users']
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\Models\User
     */
    protected function create(Request $request)
    {
        $username = $request->username;
        $check = User::where('username', $username)->first();

        if(is_null($check)) {
            $waktu_expired = date("Y-m-d H:i:s", strtotime("+30 minutes"));

            $data = [
                'username'     => $username,
                'created'   => currDateTime(),
                'expired'   => $waktu_expired
            ];

            return $this->show(Crypt::encrypt($data));

            // Mail::to($username)->send(new AktivasiEmail($data));

            alert()->success('Buka email <b>'.$username.'</b><br>untuk melakukan aktivasi akun.<br><br><small>*Jika tidak ada pada folder inbox, silahkan periksa pada folder spam</small>','Registrasi berhasil!')->persistent("OK")->html(true);
        } else {
            alert()->error('Username anda <b>'.$username.'</b><br>telah terdaftar di Sistem Informasi Manajemen Akses Universitas Lampung.<br><br><small>*Silahkan buka email anda untuk mengetahui informasi akun.</small>','Registrasi Gagal!')->persistent("OK")->html(true);
        }
        return back();
    }

    public function show($id)
    {
        $data = Crypt::decrypt($id);
        $check = User::where('username', $data['username'])->first();
        if ($data['created']<=currDateTime() && $data['expired']>=currDateTime() && is_null($check)) {

            // $pwd = Str::random(8);

            $pengguna = new User();
            $pengguna->id_pengguna = guid();
            $pengguna->username = $data['username'];
            $pengguna->password = sha1('password');
            $pengguna->nm_pengguna = strtok($data['username'], '@');
            $pengguna->jenis_kelamin = 'l';
            $pengguna->approval_pengguna = 1;
            $pengguna->a_aktif = 1;
            $pengguna->disable = 0;
            $pengguna->tgl_create = currDateTime();
            $pengguna->last_update = currDateTime();
            $pengguna->soft_delete = 0;
            $pengguna->last_sync = currDateTime();
            $pengguna->id_updater = guid();
            $pengguna->save();

            // Mail::to($pengguna->username)->send(new InformasiAkun($pengguna, $pwd));

            alert()->success('Silahkan buka email <b>'.$pengguna->username.'</b><br>untuk mengetahui username dan password akun.<br><br><small>*Jika tidak ada pada folder inbox, silahkan periksa pada folder spam</small>', 'Proses Aktivasi Berhasil')->persistent('OK')->html(true);
            return redirect()->route('auth.login');
        } else {
            alert()->error('Kode verifikasi sudah expired, silahkan lakukan registrasi kembali melalui Admin.','Proses Aktifasi Gagal')->persistent('OK');
            return redirect()->route('auth.login');
        }
    }

    public function active(AktivasiRequest $request, $id)
    {
        $data = Crypt::decrypt($id);
        // $info = $data['info'];
        if ($data['created']<=currDateTime() && $data['expired']>=currDateTime()) {
            $input = $request->all();
            alert()->success('Proses Aktifvasi Berhasil')->persistent('OK');
            return redirect()->route('auth.login');
        } else {
            alert()->error('Kode verifikasi sudah expired, silahkan lakukan registrasi kembali melalui Admin Prodi','Proses Aktifasi Gagal')->persistent('OK');
            return redirect()->route('auth.login');
        }
    }
}
