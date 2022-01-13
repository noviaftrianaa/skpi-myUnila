<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use App\Models\Aplikasi;
use App\Models\UnitOrganisasi;
use App\Models\User;
use App\Models\PJAplikasi;
use App\Models\Menu;
use App\Models\Peran;
use Auth;

class AplikasiController extends Controller
{
    public function index()
    {
        $data = Aplikasi::with(['UnitOrganisasi','PJAplikasi'])->lock('WITH(NOLOCK)')->get();
        $user = User::lock('WITH(NOLOCK)')->where('a_aktif',1)->get();

        return view('manajemen.aplikasi.index', [
            'data'=>$data,
            'user'=>$user
        ]);
    }

    public function create()
    {
        $unit = UnitOrganisasi::lock('WITH(NOLOCK)')->get();

        return view('manajemen.aplikasi.create', ['unit'=>$unit]);
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

        $aplikasi = Aplikasi::create([
            'id_aplikasi' => $uuid,
            'id_organisasi' => $array['id_organisasi'],
            'nm_aplikasi' => $array['nm_aplikasi'],
            'ket_aplikasi' => $array['ket_aplikasi'],
            'url' => $array['url'],
            'a_generate_menu' => $array['a_generate_menu'],
            'tgl_create' => currDateTime(),
            'last_update' => currDateTime(),
            'last_sync' => currDateTime()
        ]);

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
        return redirect()->route('aplikasi.index');
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
        $data = Aplikasi::with('UnitOrganisasi')->lock('WITH(NOLOCK)')->where('id_aplikasi', $id)->first();
        $pj = PJAplikasi::lock('WITH(NOLOCK)')->where('id_aplikasi', $id)->where('soft_delete',0)->get();
        $menu = Menu::lock('WITH(NOLOCK)')->where('id_aplikasi', $id)->get();
        $unit = UnitOrganisasi::all();
        $pengguna = User::lock('WITH(NOLOCK)')->where('soft_delete',0)->where('a_aktif',1)->get();
        $peran = Peran::whereNull('expired_date')->get();

        return view('manajemen.aplikasi.show', [
            'data'=>$data,
            'pj'=>$pj,
            'menu'=>$menu,
            'unit'=>$unit,
            'pengguna'=>$pengguna,
            'peran'=>$peran
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
        $data = Aplikasi::lock('WITH(NOLOCK)')->where('id_aplikasi', $id)->first();
        $unit = UnitOrganisasi::lock('WITH(NOLOCK)')->get();

        return view('manajemen.aplikasi.edit', [
            'data'=>$data,
            'unit'=>$unit
        ]);
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

        $store = Aplikasi::lock('WITH(NOLOCK)')->where('id_aplikasi', $id)->update([
            'nm_aplikasi' => $array['nm_aplikasi'],
            'ket_aplikasi' => $array['ket_aplikasi'],
            'url' => $array['url'],
            'a_generate_menu' => $array['a_generate_menu'],
            'last_update' => currDateTime(),
            'last_sync' => currDateTime()
        ]);

        if(!$store) {
            alert()->error('Data gagal diupdate!');
        } else {
            alert()->success('Data berhasil diupdate!');
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

    public function create_menu()
    {
        return view('manajemen.aplikasi.create_menu');
    }

    public function pj_aplikasi()
    {
        return view('manajemen.aplikasi.create_menu');
    }

    public function store_menu(Request $request, $id)
    {
        // $id = Crypt::decrypt($id);
        // $aplikasi = Aplikasi::lock('WITH(NOLOCK)')->where('id_aplikasi',$id)->first();
        // $array = $request->all();

        // $store = Menu::create([
        //     'id_menu' > guid(),
        //     'nm_menu' => $array['nm_menu'],
        //     'nm_file' => $array['nm_file'],
        //     'urutan_menu' => $array['urutan_menu'],
        //     'a_aktif' => $array['a_aktif'],
        //     'a_tampil' => $array['a_tampil'],
        //     'icon' => $array['nm_menu'],
        //     'level_menu' => $array['level_menu'],
        //     'id_aplikasi' => $aplikasi->id_aplikasi,
        //     'tgl_create' => currDateTime(),
        //     'last_update' => currDateTime(),
        //     'last_sync' => currDateTime()
        // ]);

        // if(!$store) {
        //     alert()->error('Data gagal disimpan!');
        // } else {
        //     alert()->success('Data berhasil disimpan!');
        // }
        // return redirect()->route('aplikasi.index');
    }
}
