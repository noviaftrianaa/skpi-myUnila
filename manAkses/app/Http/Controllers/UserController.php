<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use Auth;
use App\Models\User;
use App\Models\UnitOrganisasi;
use App\Models\Peran;
use App\Models\RolePengguna;
use Illuminate\Support\Facades\Crypt;

class UserController extends Controller
{

    public function index()
    {
        // $user = User::lock('WITH(NOLOCK)')->where('soft_delete', 0)->orderBy('a_aktif','DESC')->orderBy('nm_pengguna', 'ASC')->get();
        $user = DB::SELECT('
            SELECT *
            FROM man_akses.pengguna WITH(NOLOCK)
            WHERE soft_delete=0
            ORDER BY a_aktif DESC, nm_pengguna ASC
        ');

        return view('manajemen.pengguna.index', [
            'user'=>$user
        ]);
    }

    public function create()
    {
        $unit = UnitOrganisasi::lock('WITH(NOLOCK)')->where('a_aktif',1)->get();
        $peran = Peran::all();
        return view('manajemen.pengguna.create', [
            'unit'=>$unit,
            'peran'=>$peran
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $array = $request->all();

        $uuid = guid();
        $data = User::lock('WITH(NOLOCK)')->create([
            'id_pengguna'   => $uuid,
            'nm_pengguna'   => $array['nm_pengguna'],
            'username'      => $array['username'],
            'password'      => sha1('12345678'),
            'jenis_kelamin' => $array['jenis_kelamin'],
            'tempat_lahir'  => $array['tempat_lahir'],
            'tgl_lahir'     => $array['tgl_lahir'],
            'alamat'        => $array['alamat'],
            'jabatan'       => $array['jabatan'],
            'no_tel'        => $array['no_tel'],
            'no_hp'         => $array['no_hp'],
            'approval_pengguna' => 1,
            'a_aktif'       => 1,
            'disable'       => 0,
            'tgl_create'    => currDateTime(),
            'last_update'   => currDateTime(),
            'last_sync'     => currDateTime(),
            'id_updater'    => $uuid,
            'soft_delete'   => 0
        ]);
        foreach($array['id_peran'] as $item) {
            $role = RolePengguna::create([
                'id_role_pengguna' => guid(),
                'id_pengguna' => $uuid,
                'id_organisasi' => $array['id_organisasi'],
                'id_peran' => $item,
                'sk_penugasan' => (!empty($array['sk_penugasan'])) ? $array['sk_penugasan'] : null,
                'tgl_sk_penugasan' => (!empty($array['tgl_sk_penugasan'])) ? $array['tgl_sk_penugasan'] : null,
                'approval_peran' => 1,
                'tgl_create' => currDateTime(),
                'last_active' => currDateTime(),
                'last_update' => currDateTime(),
                'soft_delete' => 0,
                'last_sync' => currDateTime(),
                'id_updater' => $uuid
            ]);
        }
    
        if(!$data) {
            alert()->error('Data gagal disimpan!');
        } else {
            alert()->success('Data berhasil disimpan!');
        }
        return redirect()->route('user.index');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function detail($id)
    {
        $id = Crypt::decrypt($id);
        $data = User::findOrFail($id);
        $role = RolePengguna::with('Peran')->lock('WITH(NOLOCK)')->where('soft_delete',0)->where('id_pengguna', $id)->get();
        $peran = Peran::all();
        $unit = UnitOrganisasi::lock('WITH(NOLOCK)')->where('soft_delete', 0)->get();
        
        return view('manajemen.pengguna.show', [
            'data'=>$data,
            'role'=>$role,
            'peran'=>$peran,
            'unit'=>$unit
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $id = Crypt::decrypt($id);
        $pengguna = User::lock('WITH(NOLOCK)')->where('id_pengguna', $id)->first();
        if($pengguna->a_aktif==1) {
            $data = User::lock('WITH(NOLOCK)')->where('id_pengguna', $id)->update([
                'a_aktif'=>0,
                'disable' => 1,
                'last_update'=>currDateTime(),
                'last_sync'=>currDateTime()
            ]);
        } else {
            $data = User::lock('WITH(NOLOCK)')->where('id_pengguna', $id)->update([
                'a_aktif'=>1,
                'disable' => 0,
                'last_update'=>currDateTime(),
                'last_sync'=>currDateTime()
            ]);
        }

        if(!$data) {
            alert()->error('Data gagal disimpan!');
        } else {
            alert()->success('Data berhasil disimpan!');
        }
        return redirect()->back();
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $id = Crypt::decrypt($id);
        $array = $request->all();

        $data = User::lock('WITH(NOLOCK)')->where('id_pengguna',$id)->update([
            'nm_pengguna'   => $array['nm_pengguna'],
            'username'      => $array['username'],
            'jenis_kelamin' => $array['jenis_kelamin'],
            'tempat_lahir'  => $array['tempat_lahir'],
            'tgl_lahir'     => $array['tgl_lahir'],
            'alamat'        => $array['alamat'],
            'jabatan'       => $array['jabatan'],
            'no_tel'        => $array['no_tel'],
            'no_hp'         => $array['no_hp'],
            'approval_pengguna' => 1,
            'a_aktif'       => 1,
            'disable'       => 0,
            'last_update'   => currDateTime(),
            'last_sync'     => currDateTime(),
            'id_updater'    => $id,
        ]);

        if(!$data) {
            alert()->error('Data gagal disimpan!');
        } else {
            alert()->success('Data berhasil disimpan!');
        }
        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $id = Crypt::decrypt($id);
        $data = User::lock('WITH(NOLOCK)')->where('id_pengguna', $id)->update([
            'soft_delete' => 1,
            'last_update' => currDateTime(),
            'last_sync' => currDateTime(),
            'id_updater' => Auth::user()->id_pengguna
        ]);
        if(!$data) {
            alert()->error('Data gagal dihapus!');
        } else {
            alert()->success('Data berhasil dihapus!');
        }
        return redirect()->back();
    }
    
    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function reset(Request $request, $id)
    {
        $id = Crypt::decrypt($id);
        $data = User::lock('WITH(NOLOCK)')->where('id_pengguna', $id)->update([
            'password'         => sha1('12345678'),
            'last_update'      => currDateTime(),
            'id_updater'       => Auth::user()->id_pengguna
        ]);
        if(!$data) {
            alert()->error('Password gagal direset!');
        } else {
            alert()->success('Password berhasil direset!');
        }
        return redirect()->back();
    }

    public function role(Request $request)
    {
        $array = $request->all();
        $role = RolePengguna::where('id_pengguna', Auth::user()->id_pengguna)->where('id_peran',$array['id_peran'])->first();
        session()->put('login.role', $role);
        return redirect()->to('/');
    }

    public function password(Request $request)
    {
        $request->validate(
            [
                'password' => 'required|min:8',
                'old_password' => 'required|min:8',
                'confirm_password' => 'required|min:8'
            ],
            [
                'password.min' => "Atribut :attribute harus terdiri dari 8 karakter.",
                'old_password.min' => "Atribut :attribute harus terdiri dari 8 karakter.",
                'confirm_password.min' => "Atribut :attribute harus terdiri dari 8 karakter."
            ]
        );

        $array = $request->all();
        $pengguna = User::findOrFail(Auth::user()->id_pengguna);

        if($pengguna->password != sha1($array['old_password'])) {
            alert()->error('Password Lama Anda Salah!');
            return redirect()->back();
        }

        if($array['password']==$array['confirm_password']) {
            $pengguna = User::lock('WITH(NOLOCK)')->where('id_pengguna', $pengguna->id_pengguna)->update([
                'password'  => sha1($array['password'])
            ]);
            alert()->success('Password Berhasil Diupdate!');
        } else {
            alert()->error('Konfirmasi Password Tidak Sama!');
        }
        return redirect()->back();
    }
}
