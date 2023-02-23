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

    private $basepath;

    public function __construct()
    {
        $this->basepath = 'aplikasi.pj_aplikasi';
    }

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
        $array = $request->all();
        $aplikasi = Aplikasi::lock('WITH(NOLOCK)')->where('id_aplikasi', $array['id_aplikasi'])->first();
        if(!empty($array['id_pengguna'])) {
            foreach($array['id_pengguna'] AS $item) {
                $pengguna = User::where('id_pengguna', $item)->first();
                $pj = PJAplikasi::lock('WITH(NOLOCK)')->create([
                    'id_pj_aplikasi' => guid(),
                    'id_aplikasi' => $aplikasi->id_aplikasi,
                    'id_pengguna' => $pengguna->id_pengguna,
                    'nm_pj' => $pengguna->nm_pengguna,
                    'jabatan_pj' => $array['jabatan_pj'],
                    'no_hp' => (!is_null($pengguna->no_hp)) ? $pengguna->no_hp : '-',
                    'email' => (!is_null($pengguna->email)) ? $pengguna->email : '-',
                    'a_masih' => $array['a_masih'],
                    'wkt_selesai' => $array['wkt_selesai'],
                    'tgl_create' => currDateTime(),
                    'last_update' => currDateTime(),
                    'soft_delete' => 0,
                    'last_sync' => currDateTime(),
                    'id_updater' => Auth::user()->id_pengguna
                ]);
            }
        } else {
            $request->validate([
                'username' => ['required', 'string', 'max:60', 'unique:sqlsrv.man_akses.pengguna'],
            ]);
            $pengguna = User::lock('WITH(NOLOCK)')->create([
                'id_pengguna' => guid(),
                'username' => $array['username'],
                'password' => sha1('unilajaya'),
                'nm_pengguna' => $array['nm_pj'],
                'jenis_kelamin' => $array['jenis_kelamin'],
                'no_hp' => $array['no_hp'],
                'approval_pengguna' => 1,
                'a_aktif' => 1,
                'jabatan' => $array['jabatan_pj'],
                'email' => $array['email'],
                'disable' => 0,
                'tgl_create' => currDateTime(),
                'last_update' => currDateTime(),
                'soft_delete' => 0,
                'last_sync' => currDateTime(),
                'id_updater' => Auth::user()->id_pengguna
            ]);
    
            $pj = PJAplikasi::lock('WITH(NOLOCK)')->create([
                'id_pj_aplikasi' => guid(),
                'id_aplikasi' => $aplikasi->id_aplikasi,
                'id_pengguna' => $pengguna->id_pengguna,
                'nm_pj' => $array['nm_pj'],
                'jabatan_pj' => $array['jabatan_pj'],
                'no_hp' => $array['no_hp'],
                'email' => $array['email'],
                'a_masih' => $array['a_masih'],
                'wkt_selesai' => $array['wkt_selesai'],
                'tgl_create' => currDateTime(),
                'last_update' => currDateTime(),
                'soft_delete' => 0,
                'last_sync' => currDateTime(),
                'id_updater' => Auth::user()->id_pengguna
            ]);
        }
        
        
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
        $array = $request->all();

        $pengguna = User::whereIn('id_pengguna', $array['id_pengguna'])->first();
        
        $pj = PJAplikasi::lock('WITH(NOLOCK)')->where('id_pj_aplikasi', $id)->update([
            'id_pengguna' => $pengguna->id_pengguna,
            'nm_pj' => $pengguna->nm_pengguna,
            'jabatan_pj' => $array['jabatan_pj'],
            'no_hp' => $pengguna->no_hp ?? '-',
            'email' => $pengguna->username,
            'a_masih' => $array['a_masih'],
            'wkt_selesai' => $array['wkt_selesai'],
            'last_update' => currDateTime(),
            'soft_delete' => 0,
            'last_sync' => currDateTime(),
            'id_updater' => Auth::user()->id_pengguna
        ]);
        if(!$pj) {
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
        $data = PJAplikasi::lock('WITH(NOLOCK)')->where('id_pj_aplikasi', $id)->update([
            'soft_delete' => 1,
            'id_updater' => Auth::user()->id_pengguna
        ]);
        if(!$data) {
            alert()->error('Data gagal dihapus!');
        } else {
            alert()->success('Data berhasil dihapus!');
        }
        return redirect()->back();
    }
}
