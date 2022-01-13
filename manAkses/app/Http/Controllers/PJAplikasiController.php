<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use App\Models\PJAplikasi;
use App\Models\Aplikasi;
use App\Models\User;
use Auth;

class PJAplikasiController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'username' => ['required', 'string', 'max:60', 'unique:sqlsrv.man_akses.pengguna'],
        ]);

        $array = $request->all();
        $aplikasi = Aplikasi::lock('WITH(NOLOCK)')->where('id_aplikasi', $array['id_aplikasi'])->first();
        $pengguna = User::create([
            'id_pengguna' => guid(),
            'username' => $array['username'],
            'password' => sha1('12345678'),
            'nm_pengguna' => $array['nm_pj'],
            'jenis_kelamin' => $array['jenis_kelamin'],
            'no_hp' => $array['no_hp'],
            'approval_pengguna' => 1,
            'a_aktif' => 1,
            'jabatan' => $array['jabatan_pj'],
            'disable' => 0,
            'tgl_create' => currDateTime(),
            'last_update' => currDateTime(),
            'soft_delete' => 0,
            'last_sync' => currDateTime(),
            'id_updater' => Auth::user()->id_pengguna
        ]);

        $pj = PJAplikasi::create([
            'id_pj_aplikasi' => guid(),
            'id_aplikasi' => $aplikasi->id_aplikasi,
            'id_pengguna' => $pengguna->id_pengguna,
            'nm_pj' => $pengguna->nm_pengguna,
            'jabatan_pj' => $pengguna->jabatan,
            'no_hp' => $pengguna->no_hp,
            'email' => $pengguna->username,
            'a_masih' => $array['a_masih'],
            'wkt_selesai' => $array['wkt_selesai'],
            'tgl_create' => currDateTime(),
            'last_update' => currDateTime(),
            'soft_delete' => 0,
            'last_sync' => currDateTime(),
            'id_updater' => Auth::user()->id_pengguna
        ]);
        
        if(!$pj) {
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
        //
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
    public function update(Request $request, $id)
    {
        $id = Crypt::decrypt($id);
        $array = $request->all();

        $pengguna = User::findOrFail($array['id_pengguna']);
        
        $pj = PJAplikasi::lock('WITH(NOLOCK)')->where('id_pj_aplikasi', $id)->update([
            'id_pengguna' => $pengguna->id_pengguna,
            'nm_pj' => $pengguna->nm_pengguna,
            'jabatan_pj' => $pengguna->jabatan,
            'no_hp' => $pengguna->no_hp,
            'email' => $pengguna->username,
            'a_masih' => $array['a_masih'],
            'wkt_selesai' => $array['wkt_selesai'],
            'last_update' => currDateTime(),
            'soft_delete' => 0,
            'last_sync' => currDateTime(),
            'id_updater' => Auth::user()->id_pengguna
        ]);
        if(!$pj) {
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
        $data = PJAplikasi::lock('WITH(NOLOCK)')->where('id_pj_aplikasi', $id)->update([
            'soft_delete' => 1,
            'id_updater' => Auth::user()->id_pengguna
        ]);
        if(!$data) {
            alert()->error('Data gagal disimpan!');
        } else {
            alert()->success('Data berhasil disimpan!');
        }
        return redirect()->back();
    }
}
