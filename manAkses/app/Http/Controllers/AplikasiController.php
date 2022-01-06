<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use App\Models\Aplikasi;
use App\Models\UnitOrganisasi;

class AplikasiController extends Controller
{
    public function index()
    {
        $data = Aplikasi::all();
        $unit = UnitOrganisasi::where('a_aktif',1)->get();

        return view('manajemen.aplikasi.index', [
            'data'=>$data,
            'unit'=>$unit
        ]);
    }

    public function create()
    {
        return view('manajemen.aplikasi.create');
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

        $store = Aplikasi::create([
            'id_aplikasi' => $uuid,
            'id_organisasi' => $uuid,
            'nm_aplikasi' => $array['nm_aplikasi'],
            'ket_aplikasi' => $array['ket_aplikasi'],
            'url' => $array['url'],
            'a_generate_menu' => $array['a_generate_menu'],
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
        $id = Crypt::decrypt($id);
        $data = Aplikasi::findOrFail($id);

        return view('manajemen.aplikasi.edit', ['data'=>$data]);
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

        $store = Aplikasi::where('id_aplikasi', $id)->update([
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
        return redirect()->route('aplikasi.index');
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

    public function store_menu(Request $request, $id)
    {
        $id = Crypt::decrypt($id);
        $aplikasi = Aplikasi::findOrFail($id);
        $array = $request->all();
        $uuid = guid();

        $store = Menu::create([
            'id_menu' > $uuid,
            'nm_menu' => $array['nm_menu'],
            'nm_file' => $array['nm_file'],
            'urutan_menu' => $array['urutan_menu'],
            'a_aktif' => $array['a_aktif'],
            'a_tampil' => $array['a_tampil'],
            'icon' => $array['nm_menu'],
            'level_menu' => $array['level_menu'],
            'id_aplikasi' => $aplikasi->id_aplikasi,
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
}
