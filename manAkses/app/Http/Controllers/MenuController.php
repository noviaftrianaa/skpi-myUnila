<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Menu;
use App\Models\Aplikasi;
use App\Models\MenuRole;
use Crypt;
use Auth;

class MenuController extends Controller
{
    
    public function __construct()
    {
        $this->middleware('admin');
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $menu = Menu::lock('WITH(NOLOCK)')->get();
        return view('manajemen.menu.index', ['menu'=>$menu]);
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
        // dd($array);

        $aplikasi = Aplikasi::lock('WITH(NOLOCK)')->where('id_aplikasi', $array['id_aplikasi'])->first();
        $data = Menu::lock('WITH(NOLOCK)')->create([
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

        foreach($array['id_peran'] as $item) {
            $datas = MenuRole::lock('WITH(NOLOCK)')->create([
                'id_peran' => $item,
                'id_menu' => $data->id_menu,
                'a_boleh_insert' => (!empty($array['a_boleh_insert'])) ? 1 : 0,
                'a_boleh_show' => (!empty($array['a_boleh_show'])) ? 1 : 0,
                'a_boleh_delete' => (!empty($array['a_boleh_delete'])) ? 1 : 0,
                'a_boleh_update' => (!empty($array['a_boleh_update'])) ? 1 : 0,
                'a_boleh_sanggah' => (!empty($array['a_boleh_sanggah'])) ? 1 : 0,
                'approval_menu' => 1,
                'tgl_create' => currDateTime(),
                'last_update' => currDateTime(),
                'soft_delete' => 0,
                'last_sync' => currDateTime(),
                'id_updater' => Auth::user()->id_pengguna
            ]);
        }

        if(!$data && !$datas) {
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

        $data = Menu::lock('WITH(NOLOCK)')->where('id_menu', $id)->update([
            'nm_menu' => $array['nm_menu'],
            'nm_file' => $array['nm_file'],
            'urutan_menu' => $array['urutan_menu'],
            'id_group_menu' => (!empty($array['id_group_menu'])) ? $array['id_group_menu'] : null,
            'a_aktif' => $array['a_aktif'],
            'a_tampil' => $array['a_tampil'],
            'last_update' => currDateTime(),
            'last_sync' => currDateTime()
        ]);

        //Check Menu
        MenuRole::lock('WITH(NOLOCK)')->where('id_menu', $id)->whereNotIn('id_peran', $array['id_peran'])->update([
            'soft_delete'=>1,
            'last_update'=>currDateTime(),
            'last_sync'=>currDateTime()
        ]);

        foreach($array['id_peran'] as $item) {
            $check = MenuRole::lock('WITH(NOLOCK)')->where('id_menu', $id)->where('id_peran', $item)->first();
            if(!is_null($check)) {
                $datas = MenuRole::lock('WITH(NOLOCK)')->where('id_menu', $id)->where('id_peran', $item)->update([
                    'a_boleh_insert' => (!empty($array['a_boleh_insert'])) ? 1 : 0,
                    'a_boleh_show' => (!empty($array['a_boleh_show'])) ? 1 : 0,
                    'a_boleh_delete' => (!empty($array['a_boleh_delete'])) ? 1 : 0,
                    'a_boleh_update' => (!empty($array['a_boleh_update'])) ? 1 : 0,
                    'a_boleh_sanggah' => (!empty($array['a_boleh_sanggah'])) ? 1 : 0,
                    'last_update' => currDateTime(),
                    'last_sync' => currDateTime(),
                    'soft_delete' => 0,
                    'id_updater' => Auth::user()->id_pengguna
                ]);
            } else {
                $datas = MenuRole::lock('WITH(NOLOCK)')->create([
                    'id_peran' => $item,
                    'id_menu' => $id,
                    'a_boleh_insert' => (!empty($array['a_boleh_insert'])) ? 1 : 0,
                    'a_boleh_show' => (!empty($array['a_boleh_show'])) ? 1 : 0,
                    'a_boleh_delete' => (!empty($array['a_boleh_delete'])) ? 1 : 0,
                    'a_boleh_update' => (!empty($array['a_boleh_update'])) ? 1 : 0,
                    'a_boleh_sanggah' => (!empty($array['a_boleh_sanggah'])) ? 1 : 0,
                    'approval_menu' => 1,
                    'tgl_create' => currDateTime(),
                    'last_update' => currDateTime(),
                    'soft_delete' => 0,
                    'last_sync' => currDateTime(),
                    'id_updater' => Auth::user()->id_pengguna
                ]);
            }
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
}
