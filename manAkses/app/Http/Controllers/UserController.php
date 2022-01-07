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
        $user = DB::SELECT('
            SELECT pengguna.*, role.last_active, peran.nm_peran
            FROM man_akses.pengguna AS pengguna
            LEFT JOIN (
                SELECT *
                FROM man_akses.role_pengguna
            ) AS role ON role.id_pengguna=pengguna.id_pengguna
            LEFT JOIN (
                SELECT *
                FROM man_akses.peran
            ) AS peran ON peran.id_peran=role.id_peran
        ');
        $role = RolePengguna::all();
        $unit = UnitOrganisasi::where('a_aktif',1)->get();
        $peran = Peran::all();

        return view('manajemen.pengguna.index', [
            'user'=>$user,
            'unit'=>$unit,
            'peran'=>$peran,
            'role'=>$role
        ]);
    }

    public function create()
    {
        return view('manajemen.pengguna.create');
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
        $data = User::create([
            'id_pengguna'   => $uuid,
            'nm_pengguna'   => $array['nama'],
            'username'      => $array['username'],
            'password'      => sha1($array['password']),
            'jenis_kelamin' => $array['jenis_kelamin'],
            'tempat_lahir'  => $array['tempat_lahir'],
            'tgl_lahir'     => $array['tgl_lahir'],
            'alamat'        => $array['alamat'],
            'jabatan'       => $array['jabatan'],
            'no_tel'        => $array['no_tel'],
            'no_hp'         => $array['no_hp'],
            'approval_pengguna' => $array['approval_pengguna'],
            'a_aktif'       => $array['a_aktif'],
            'disable'       => $array['disable'],
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
                'sk_penugasan' => $array['sk_penugasan'],
                'tgl_sk_penugasan' => $array['tgl_sk_penugasan'],
                'approval_pengguna' => $array['role_approval_pengguna'],
                'tgl_kadaluarsa' => $array['tgl_kadaluarsa'],
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
        return redirect()->back();
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $id = Crypt::decrypt($id);
        $data = User::findOrFail($id);
        // $role = DB::SELECT('
        //     SELECT role.id_role_pengguna, role.id_pengguna, role.sk_penugasan, role.tgl_sk_penugasan, role.approval_pengguna, role.tgl_kadaluarsa, organisasi.nm_lemb, CONCAT(peran.nm_peran)
        //     FROM man_akses.role_pengguna as role
        //     LEFT JOIN (
        //         SELECT *
        //         FROM man_akses.peran
        //     ) as peran on peran.id_peran=role.id_peran
        //     LEFT JOIN (
        //         SELECT *
        //         FROM man_akses.unit_organisasi
        //     ) as organisasi on organisasi.id_organisasi=role.id_organisasi
        //     WHERE role.id_pengguna="'.$id.'"
        //     GROUP BY role.id_role_pengguna, role.id_pengguna, role.sk_penugasan, role.tgl_sk_penugasan, role.approval_pengguna, role.tgl_kadaluarsa, organisasi.nm_lemb
        // ');
        
        return view('manajemen.pengguna.show', [
            'data'=>$data
            // 'role'=>$role
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
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update_user(Request $request, $id)
    {
        $id = Crypt::decrypt($id);
        $array = $request->all();

        $data = User::where('id_pengguna',$id)->update([
            'nm_pengguna'      => $array['nama'],
            'last_update'      => currDateTime(),
            'id_updater'       => Auth::user()->id_pengguna
        ]);

        $role = RolePengguna::where('id_pengguna', $id)->where('id_peran', $array['peran'])->first();
        if(is_null($role)) {
            $uuid = guid();
            $peran = RolePengguna::create([
                'id_role_pengguna'  => $uuid,
                'id_pengguna'       => $id,
                'id_organisasi'     => $array['unit'],
                'id_peran'          => $array['peran'],
                'approval_peran'    => 1,
                'tgl_create'        => currDateTime(),
                'last_update'       => currDateTime(),
                'soft_delete'       => 0,
                'last_sync'         => currDateTime(),
                'id_updater'        => Auth::user()->id_pengguna
            ]);
        } else {
            $peran = RolePengguna::where('id_role_pengguna', $role->id_role_pengguna)->update([
                'id_organisasi'     => $array['unit'],
                'id_peran'          => $array['peran'],
                'last_update'       => currDateTime(),
                'last_sync'         => currDateTime(),
                'id_updater'        => Auth::user()->id_pengguna
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
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
    
    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function reset(Request $request, $id)
    {
        $id = Crypt::decrypt($id);
        $data = User::where('id_pengguna', $id)->update([
            'password'         => sha1('password'),
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
        session()->put('login.role', $array['id_peran']);
        return redirect()->back();
    }

    public function password(Request $request)
    {
        $request->validate([
            'password' => ['required','max:8']
        ]);

        $array = $request->all();

        if($array['password']==$array['confirm_password']) {
            $pengguna = User::findOrFail(Auth::user()->id_pengguna);
            $pengguna = User::where('id_pengguna', $pengguna->id_pengguna)->update([
                'password'  => sha1($array['password'])
            ]);
            alert()->success('Password Berhasil Diupdate!');
        } else {
            alert()->error('Konfirmasi Password Tidak Sama!');
        }
        return redirect()->back();
    }
}
