<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use Illuminate\Foundation\Auth\ResetsPasswords;
use App\Models\Login;
use App\Models\ManajemenAkses\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;

class ResetPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset requests
    | and uses a simple trait to include this behavior. You're free to
    | explore this trait and override any methods you wish to tweak.
    |
    */

    use ResetsPasswords;

    /**
     * Where to redirect users after resetting their password.
     *
     * @var string
     */
    protected $redirectTo = RouteServiceProvider::HOME;

    public function index()
    {
        return view('pengaturan.password');
    }

    public function update(Request $request, $id)
    {
        $id_pengguna = Crypt::decrypt($id);
        $cari_pengguna = Login::findorfail($id_pengguna);
        if(Hash::check($request->pass_lama, $cari_pengguna->password)) {
            $this->validate($request, [
                'password'  => 'required|min:6|confirmed'
            ]);
            $input = $request->all();
            unset($input['pass_lama']);
            unset($input['password_confirmation']);
            Pengguna::where('id_pengguna',$id_pengguna)->update([
                'password'  => Hash::make($input['password'])
            ]);

            alert()->success('Password berhasil diubah')->persistent('OK');
            
            $request->session()->regenerate();
            return redirect()->back();
        } else {
            alert()->error('Password yang anda masukkan salah','Silahkan coba lagi')->persistent('OK');
            return redirect()->back();
        }
    }
}
