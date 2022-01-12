<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Menu;
use App\Models\Aplikasi;
use Crypt;

class MenuController extends Controller
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
        $array = $request->all();

        $aplikasi = Aplikasi::where('id_aplikasi', $array['id_aplikasi'])->first();
        $data = Menu::create([
            'id_menu' => guid(),
            'id_aplikasi' => $aplikasi->id_aplikasi,
            'nm_menu' => $array['nm_menu'],
            'nm_file' => $array['nm_file'],
            'urutan_menu' => $array['urutan_menu'],
            'id_group_menu' => (!empty($array['id_group_menu'])) ? $array['id_group_menu'] : null,
            'a_aktif' => $array['a_aktif'],
            'a_tampil' => $array['a_tampil'],
            'tgl_create' => currDateTime(),
            'last_update' => currDateTime(),
            'last_sync' => currDateTime()
        ]);

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

        $data = Menu::where('id_menu', $id)->update([
            'nm_menu' => $array['nm_menu'],
            'nm_file' => $array['nm_file'],
            'urutan_menu' => $array['urutan_menu'],
            'id_group_menu' => (!empty($array['id_group_menu'])) ? $array['id_group_menu'] : null,
            'a_aktif' => $array['a_aktif'],
            'a_tampil' => $array['a_tampil'],
            'last_update' => currDateTime(),
            'last_sync' => currDateTime()
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
        //
    }
}
