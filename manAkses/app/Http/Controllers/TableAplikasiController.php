<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Aplikasi;
use App\Models\TableAplikasi;
use App\Models\AksesTableAplikasi;
use Auth;
use Crypt;
use DB;

class TableAplikasiController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($id)
    {
        $id = Crypt::decrypt($id);
        $data = Aplikasi::lock('WITH(NOLOCK)')->where('id_aplikasi', $id)->first();
        $table = DB::table('man_akses.akses_table_aplikasi AS akses')
            ->where('akses.soft_delete',0)
            ->where('akses.id_aplikasi','=',$id)
            ->join('man_akses.table_aplikasi AS tabel', 'tabel.id_table_app','=','akses.id_table_app')
            ->select('*')
            ->orderBy('akses.last_sync','DESC')
            ->get();

        return view('manajemen.aplikasi.table.index', [
            'data'=>$data,
            'table'=>$table
        ]);
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
    public function store(Request $request, $id)
    {
        $id = Crypt::decrypt($id);
        $array = $request->all();

        $table = TableAplikasi::lock('WITH(NOLOCK)')->create([
            'id_table_app' => guid(),
            'skema_tbl' => $array['skema_tbl'],
            'nm_tbl' => $array['nm_tbl'],
            'sync_seq' => $array['sync_seq'],
            'a_table_aktif' => 1,
            'expired_date' => $array['expired_date'] ?? null,
            'tgl_create' => currDateTime(),
            'last_update' => currDateTime(),
            'last_sync' => currDateTime(),

            'tabel_alias' => $array['tabel_alias'] ?? null,
            'kode_primary' => $array['kode_primary'] ?? null,
            'kolom_kecuali' => $array['kolom_kecuali'] ?? null,
            'table_status' => $array['table_status'] ?? null,
            'table_ket' => $array['table_ket'] ?? null,
            'jml_thread' => $array['jml_thread'] ?? null,
            'baris_per_thread' => $array['baris_per_thread'] ?? null,
            'order_ekstra' => $array['order_ekstra'] ?? null
        ]);

        $pengaturan = AksesTableAplikasi::lock('WITH(NOLOCK)')->create([
            'id_akses_table_app' => guid(),
            'id_table_app' => $table->id_table_app,
            'id_aplikasi' => $id,
            'a_boleh_get' => (!empty($array['a_boleh_get'])) ? 1 : 0,
            'a_boleh_insert' => (!empty($array['a_boleh_insert'])) ? 1 : 0,
            'a_boleh_show' => (!empty($array['a_boleh_show'])) ? 1 : 0,
            'a_boleh_delete' => (!empty($array['a_boleh_delete'])) ? 1 : 0,
            'a_boleh_update' => (!empty($array['a_boleh_update'])) ? 1 : 0,
            'a_aktif' => 1,
            'expired_date' => $array['expired_date'] ?? null,
            'tgl_create' => currDateTime(),
            'last_update' => currDateTime(),
            'soft_delete' => 0,
            'last_sync' => currDateTime(),
            'id_updater' => Auth::user()->id_pengguna
        ]);

        if(!$pengaturan) {
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

        $table = TableAplikasi::where('id_table_app', $id[0])->update([
            'skema_tbl' => $array['skema_tbl'],
            'nm_tbl' => $array['nm_tbl'],
            'sync_seq' => $array['sync_seq'],
            'a_table_aktif' => 1,
            'expired_date' => $array['expired_date'] ?? null,
            'last_update' => currDateTime(),
            'last_sync' => currDateTime(),

            'tabel_alias' => $array['tabel_alias'] ?? null,
            'kode_primary' => $array['kode_primary'] ?? null,
            'kolom_kecuali' => $array['kolom_kecuali'] ?? null,
            'table_status' => $array['table_status'] ?? null,
            'table_ket' => $array['table_ket'] ?? null,
            'jml_thread' => $array['jml_thread'] ?? null,
            'baris_per_thread' => $array['baris_per_thread'] ?? null,
            'order_ekstra' => $array['order_ekstra'] ?? null
        ]);

        $pengaturan = AksesTableAplikasi::where('id_akses_table_app', $id[1])->update([
            'a_boleh_get' => (!empty($array['a_boleh_get'])) ? 1 : 0,
            'a_boleh_insert' => (!empty($array['a_boleh_insert'])) ? 1 : 0,
            'a_boleh_show' => (!empty($array['a_boleh_show'])) ? 1 : 0,
            'a_boleh_delete' => (!empty($array['a_boleh_delete'])) ? 1 : 0,
            'a_boleh_update' => (!empty($array['a_boleh_update'])) ? 1 : 0,
            'a_aktif' => 1,
            'last_update' => currDateTime(),
            'last_sync' => currDateTime(),
            'id_updater' => Auth::user()->id_pengguna
        ]);

        if(!$pengaturan) {
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
}
