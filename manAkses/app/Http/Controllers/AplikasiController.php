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
use App\Models\LargeObject;
use Auth;
use Illuminate\Support\Facades\Storage;
use DB;

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

        if(!empty($array['file'])) {
            $file = $array['file'];
            $size = $file->getSize();
            if ($size <= 1000000) {
                $path = Storage::putFile('app', $file);
                $mime = $file->getClientMimeType();
                $nama_asli = $file->getClientOriginalName();
                $bytea = base64_encode(file_get_contents($file->getPathName()));
                
                $dok                = new LargeObject();
                $dok->id_blob       = guid();
                $dok->blob_content  = DB::raw("CONVERT(VARBINARY(MAX), '" . $bytea . "')");
                $dok->file_name     = $nama_asli;
                $dok->mime_type     = $mime;
                $dok->create_date   = currDateTime();
                $dok->id_creator    = Auth::user()->id_pengguna;
                $dok->last_update   = currDateTime();
                $dok->soft_delete   = 0;
                $dok->last_sync     = currDateTime();
                $dok->save();
            } else {
                alert()->error('Foto melebihi 1MB')->persistent('OK');
                return redirect()->back();
            }
        }

        $aplikasi = Aplikasi::create([
            'id_aplikasi' => guid(),
            'id_blob' => $dok->id_blob ?? NULL,
            'id_organisasi' => $array['id_organisasi'],
            'nm_aplikasi' => $array['nm_aplikasi'],
            'ket_aplikasi' => $array['ket_aplikasi'],
            'url' => $array['url'],
            'a_generate_menu' => (!empty($array['a_generate_menu'])) ? 1 : 0,
            'a_integrasi_cas' => (!empty($array['a_integrasi_cas'])) ? 1 : 0,
            'a_sistem_internal_pt' => (!empty($array['a_sistem_internal_pt'])) ? 1 : 0,
            'tgl_create' => currDateTime(),
            'last_update' => currDateTime(),
            'last_sync' => currDateTime()
        ]);

        // $pengguna = User::create([
        //     'id_pengguna' => guid(),
        //     'username' => $array['username'],
        //     'password' => sha1('12345678'),
        //     'nm_pengguna' => $array['nm_pj'],
        //     'jenis_kelamin' => $array['jenis_kelamin'],
        //     'no_hp' => $array['no_hp'],
        //     'approval_pengguna' => 1,
        //     'a_aktif' => 1,
        //     'jabatan' => $array['jabatan_pj'],
        //     'disable' => 0,
        //     'tgl_create' => currDateTime(),
        //     'last_update' => currDateTime(),
        //     'soft_delete' => 0,
        //     'last_sync' => currDateTime(),
        //     'id_updater' => Auth::user()->id_pengguna
        // ]);

        // $pj = PJAplikasi::create([
        //     'id_pj_aplikasi' => guid(),
        //     'id_aplikasi' => $aplikasi->id_aplikasi,
        //     'id_pengguna' => $pengguna->id_pengguna,
        //     'nm_pj' => $pengguna->nm_pengguna,
        //     'jabatan_pj' => $pengguna->jabatan,
        //     'no_hp' => $pengguna->no_hp,
        //     'email' => $pengguna->username,
        //     'a_masih' => $array['a_masih'],
        //     'wkt_selesai' => $array['wkt_selesai'],
        //     'tgl_create' => currDateTime(),
        //     'last_update' => currDateTime(),
        //     'soft_delete' => 0,
        //     'last_sync' => currDateTime(),
        //     'id_updater' => Auth::user()->id_pengguna
        // ]);

        if(!$aplikasi) {
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
    public function detail($id)
    {
        $id = Crypt::decrypt($id);
        $data = Aplikasi::with('UnitOrganisasi','LargeObject')->lock('WITH(NOLOCK)')->where('id_aplikasi', $id)->first();
        // $data = DB::table("man_akses.aplikasi AS aplikasi")->join("man_akses.unit_organisasi AS unit", "aplikasi.id_organisasi","=","unit.id_organisasi")->leftJoin("dok.large_object AS dok","dok.id_blob","=","aplikasi.id_blob")->lock('WITH(NOLOCK)')->where("aplikasi.id_aplikasi", $id)->first();
        $pj = DB::SELECT("
            SELECT *
            FROM man_akses.pj_aplikasi WITH (NOLOCK)
            WHERE id_aplikasi='".$id."' AND soft_delete=0
        ");
        $menu = DB::SELECT("
            SELECT *
            FROM man_akses.menu WITH (NOLOCK)
            WHERE id_aplikasi='".$id."'
        ");

        return view('manajemen.aplikasi.show', [
            'data'  => $data,
            'pj'    => $pj,
            'menu'  => $menu
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
        $aplikasi = Aplikasi::where('id_aplikasi',$id)->first();

        if(!empty($array['file'])) {
            $file = $array['file'];
            $size = $file->getSize();
            if ($size <= 1000000) {
                $path = Storage::putFile('app', $file);
                $mime = $file->getClientMimeType();
                $nama_asli = $file->getClientOriginalName();
                $bytea = base64_encode(file_get_contents($file->getPathName()));
                
                $dok                = new LargeObject();
                $dok->id_blob       = guid();
                $dok->blob_content  = DB::raw("CONVERT(VARBINARY(MAX), '" . $bytea . "')");
                $dok->file_name     = $nama_asli;
                $dok->mime_type     = $mime;
                $dok->create_date   = currDateTime();
                $dok->id_creator    = Auth::user()->id_pengguna;
                $dok->last_update   = currDateTime();
                $dok->soft_delete   = 0;
                $dok->last_sync     = currDateTime();
                $dok->save();
            } else {
                alert()->error('Foto melebihi 1MB')->persistent('OK');
                return redirect()->back();
            }
        }

        $store = Aplikasi::lock('WITH(NOLOCK)')->where('id_aplikasi', $id)->update([
            'nm_aplikasi' => $array['nm_aplikasi'],
            'ket_aplikasi' => $array['ket_aplikasi'],
            'url' => $array['url'],
            'last_update' => currDateTime(),
            'last_sync' => currDateTime(),
            'id_blob' => $dok->id_blob ?? $aplikasi->id_blob,
            'id_organisasi' => $array['id_organisasi'],
            'a_generate_menu' => (!empty($array['a_generate_menu'])) ? 1 : 0,
            'a_integrasi_cas' => (!empty($array['a_integrasi_cas'])) ? 1 : 0,
            'a_sistem_internal_pt' => (!empty($array['a_sistem_internal_pt'])) ? 1 : 0
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
