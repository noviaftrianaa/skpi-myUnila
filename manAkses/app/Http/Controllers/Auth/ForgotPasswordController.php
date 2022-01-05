<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use App\Models\Login;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\ForgotPassword;
use App\Http\Requests\Auth\AktivasiRequest;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;
use App\Mail\InformasiAkun;

class ForgotPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset emails and
    | includes a trait which assists in sending these notifications from
    | your application to your users. Feel free to explore this trait.
    |
    */

    use SendsPasswordResetEmails;

    public function index()
    {
        return view('auth.forgot-password');
    }

    public function create(Request $request)
    {
        $email = $request->username;
        $data = Login::where('username', $email)->first();

        if (is_null($data)) {
            alert()->error('Email anda <b>'.$request->username.'</b><br>tidak terdaftar di Aplikasi Palaseko.Id.','Forgot Password Gagal!')->persistent("OK")->html(true);
        } else {
            $waktu_expired = date("Y-m-d H:i:s", strtotime("+30 minutes"));

            $data = [
                'email'     => $email,
                'created'   => currDateTime(),
                'expired'   => $waktu_expired
            ];

            Mail::to($email)->send(new ForgotPassword($data));

            alert()->success('Buka email <b>'.$email.'</b><br>untuk melakukan aktivasi reset akun.<br><br><small>*Jika tidak ada pada folder inbox, silahkan periksa pada folder spam</small>','Forgot Password terkirim!')->persistent("OK")->html(true);
        }
        return back();
    }

    public function show($id)
    {
        $data = Crypt::decrypt($id);
        $pengguna = Login::where('username', $data['email'])->first();
        if ($data['created']<=currDateTime() && $data['expired']>=currDateTime() && !is_null($pengguna)) {

            $pwd = Str::random(8);

            $pengguna->password = sha1($pwd);
            $pengguna->save();

            Mail::to($pengguna->username)->send(new InformasiAkun($pengguna, $pwd));

            alert()->success('Silahkan buka email <b>'.$pengguna->username.'</b><br>untuk mengetahui username dan password akun.<br><br><small>*Jika tidak ada pada folder inbox, silahkan periksa pada folder spam</small>', 'Proses Aktivasi Berhasil')->persistent('OK')->html(true);
        } else {
            alert()->error('Kode verifikasi sudah expired, silahkan lakukan registrasi kembali melalui Admin.','Proses Aktifasi Gagal')->persistent('OK');
        }
        return redirect()->route('auth.login');
    }

    public function active(AktivasiRequest $request, $id)
    {
        $data = Crypt::decrypt($id);
        // $info = $data['info'];
        if ($data['created']<=currDateTime() && $data['expired']>=currDateTime()) {
            $input = $request->all();
            alert()->success('Proses Aktifvasi Berhasil')->persistent('OK');
        } else {
            alert()->error('Kode verifikasi sudah expired, silahkan lakukan registrasi kembali melalui Admin Prodi','Proses Aktifasi Gagal')->persistent('OK');
        }
        return redirect()->route('auth.login');
    }
}
