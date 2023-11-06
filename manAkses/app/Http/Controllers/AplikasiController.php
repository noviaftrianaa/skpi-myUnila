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
use Illuminate\Encryption\Encrypter;
use Config;

class AplikasiController extends Controller
{

    private $basepath;

    public function __construct()
    {
        $this->basepath = 'aplikasi';
    }

    private function keyGenerate()
    {
        \Artisan::call('key:generate --show');
        $app_key = \Artisan::output();
        $app_key = trim(preg_replace('/\s+/', ' ', $app_key));
        return strrev($app_key);
        // $crypt = new Encrypter('TBfJxbPdM8WoXviHuuoHZSscTZkBOoWd', Config::get('app.cipher'));
        // return $crypt->encrypt(strrev($app_key));
    }

    public function index()
    {
        $menus = collect(session()->get('login.menu'))->where('nm_file', $this->basepath.'.index')->first();

        if($menus->a_boleh_insert == "1") {
            $data = Aplikasi::with(['UnitOrganisasi','PJAplikasi'])->lock('WITH(NOLOCK)')->get();
        } else {
            $data = PJAplikasi::with(['aplikasi.unitorganisasi'])->lock('WITH(NOLOCK)')->where('soft_delete', 0)->where('id_pengguna', auth()->user()->id_pengguna)->get();
        }
        return view('manajemen.aplikasi.index', [
            'data'=>$data,
            'menus'=>$menus
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

        $aplikasi = Aplikasi::updateOrCreate(
            [
                'id_aplikasi' => guid(),
                'id_blob' => $dok->id_blob ?? NULL,
                'id_organisasi' => $array['id_organisasi'],
                'nm_aplikasi' => $array['nm_aplikasi'],
                'ket_aplikasi' => $array['ket_aplikasi'],
                'url' => $array['url'],
                'app_key' => $this->keyGenerate(),
                'a_generate_menu' => (!empty($array['a_generate_menu'])) ? 1 : 0,
                'a_integrasi_cas' => (!empty($array['a_integrasi_cas'])) ? 1 : 0,
                'a_sistem_internal_pt' => (!empty($array['a_sistem_internal_pt'])) ? 1 : 0,
                'tgl_create' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime()
            ]
        );

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
        $menus = collect(session()->get('login.menu'))->where('nm_file', $this->basepath.'.index')->first();
        // dd($menus);

        return view('manajemen.aplikasi.show', [
            'id'    => $id,
            'data'  => $data,
            'menus' => $menus
        ]);
    }

    public function dataPJ($id)
    {
        $data = DB::SELECT("
            SELECT *
            FROM man_akses.pj_aplikasi WITH (NOLOCK)
            WHERE id_aplikasi='".$id."' AND soft_delete=0
        ");
        return \DataTables::of($data)->addIndexColumn()->make(true);
    }

    public function dataMenu($id)
    {
        $data = Menu::with('group_menu')->lock('WITH(NOLOCK)')->where('id_aplikasi', $id)->where('a_aktif', 1)->get();
        return \DataTables::of($data)->addIndexColumn()->make(true);
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
            'a_sistem_internal_pt' => (!empty($array['a_sistem_internal_pt'])) ? 1 : 0,
            'expired_date' => $array['expired_date']
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
        $id = Crypt::decrypt($id);
        $aplikasi = Aplikasi::lock('WITH(NOLOCK)')->where('id_aplikasi', $id)->delete();

        if(!$aplikasi) {
            alert()->error('Data gagal dihapus!');
        } else {
            alert()->success('Data berhasil dihapus!');
        }
        return redirect()->back();
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
        $id = Crypt::decrypt($id);
        $array = $request->all();

        $store = Menu::create([
            'id_menu' > guid(),
            'nm_menu' => $array['nm_menu'],
            'nm_file' => $array['nm_file'],
            'urutan_menu' => $array['urutan_menu'],
            'icon' => $array['icon'],
            'level_menu' => $array['level_menu'],
            'a_aktif' => $array['a_aktif'],
            'a_tampil' => $array['a_tampil'],
            'id_aplikasi' => $id,
            'tgl_create' => currDateTime(),
            'last_update' => currDateTime(),
            'last_sync' => currDateTime()
        ]);

        if(!$store) {
            alert()->error('Data gagal disimpan!');
        } else {
            alert()->success('Data berhasil disimpan!');
        }
        return redirect()->route('aplikasi.index');
    }

    public function edit_menu(Request $request, $id)
    {
        $id = Crypt::decrypt($id);
        $array = $request->all();

        $store = Menu::where('id_menu', $id)->update([
            'nm_menu' => $array['nm_menu'],
            'nm_file' => $array['nm_file'],
            'urutan_menu' => $array['urutan_menu'],
            'icon' => $array['icon'],
            'level_menu' => $array['level_menu'],
            'a_aktif' => $array['a_aktif'],
            'a_tampil' => $array['a_tampil'],
            'last_update' => currDateTime(),
            'last_sync' => currDateTime()
        ]);

        if(!$store) {
            alert()->error('Data gagal disimpan!');
        } else {
            alert()->success('Data berhasil disimpan!');
        }
        return redirect()->route('aplikasi.index');
    }

    public function appKeyGenerate($id)
    {
        $aplikasi = Aplikasi::where('id_aplikasi',$id)->first();
        $store = Aplikasi::lock('WITH(NOLOCK)')->where('id_aplikasi', $id)->update([
            'app_key' => $this->keyGenerate()
        ]);

        if(!$store) {
            alert()->error('Data gagal diupdate!');
        } else {
            alert()->success('Data berhasil diupdate!');
        }
        return redirect()->back();
    }

    public function ws($id)
    {
        $id = \Crypt::decrypt($id);

        $d['data'] = \App\Models\WSEndpoint::where('id_aplikasi', $id)->where('soft_delete', 0)->select('nm_group','nm_method','path_url','a_active','id_ws_endpoint')->orderBy('nm_group','ASC')->orderBy('nm_method','ASC')->get();
        $d['group'] = \App\Models\WSEndpoint::where('id_aplikasi', $id)->select('nm_group')->distinct()->orderBy('nm_group','Asc')->get();
        $d['id'] = $id;

        return view('manajemen.aplikasi.ws.index', $d);
    }

    public function wsStore($id, Request $request)
    {
        $id = \Crypt::decrypt($id);
        $array = $request->all();

        $data = new \App\Models\WSEndpoint();
        $data->created_at = NOW();
        $data->id_ws_endpoint = guid();
        if(!empty($array['id_ws_endpoint'])) {
            $data = \App\Models\WSEndpoint::findOrFail($array['id_ws_endpoint']);
        }
        if(is_null($array['nm_group_lama']) AND is_null($array['nm_group_baru'])) {
            alert()->error('Group tidak boleh kosong!');
            return redirect()->back();
        }
        $data->nm_group = is_null($array['nm_group_baru']) ? $array['nm_group_lama'] : $array['nm_group_baru'];
        $data->nm_method = $array['nm_method'];
        $data->path_url = $array['path_url'];
        $data->a_active = $array['a_active'];
        $data->id_aplikasi = $id;
        $data->soft_delete = 0;
        $data->updated_at = NOW();
        $data->id_creator = \Auth::user()->id_pengguna;
        $data->id_updater = \Auth::user()->id_pengguna;
        $data->save();

        if(!$data) {
            alert()->error('Data gagal disimpan!');
        } else {
            alert()->success('Data berhasil disimpan!');
        }
        return redirect()->back();
    }

    public function wsDelete($id)
    {
        $id = \Crypt::decrypt($id);

        $data = \App\Models\WSEndpoint::findOrFail($id);

        if(!$data) {
            alert()->error('Data tidak ditemukan!');
        } else {
            $data->soft_delete = 1;
            $data->id_updater = \Auth::user()->id_pengguna;
            $data->save();

            alert()->success('Data berhasil disimpan!');
        }
        return redirect()->back();
    }
}
