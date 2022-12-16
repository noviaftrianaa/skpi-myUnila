<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Menu;
use App\Models\Aplikasi;
use App\Models\MenuRole;
use Crypt;
use Auth;
use DataTables;

class MenuController extends Controller
{

    private $basepath;

    public function __construct()
    {
        $this->basepath = 'menu';
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if($request->ajax()) {
            $data = Menu::with('group_menu')->lock('WITH(NOLOCK)')->get();
            return DataTables::of($data)
                ->addIndexColumn()
                ->addColumn('aksi', function($data) {
                    $button = '<a class="btn btn-info btn-xs" title="Show User" href="#editItem'.$data->id_menu.'" data-toggle="modal"> <i class="fas fa-edit"></i></a>';
                    return $button;
                })
                ->rawColumns(['aksi'])
                ->make(true);
        }
        
        $menu = Menu::with('group_menu')->lock('WITH(NOLOCK)')->get();
        return view('manajemen.menu.index', compact('menu'));
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
            'icon' => $array['icon'] ?? null,
            'level_menu' => $array['level_menu'] ?? null,
            'a_aktif' => $array['a_aktif'],
            'a_tampil' => $array['a_tampil'],
            'tgl_create' => currDateTime(),
            'last_update' => currDateTime(),
            'last_sync' => currDateTime()
        ]);

<<<<<<< Updated upstream
        if(!$data) {
=======
        // foreach($array['id_peran'] as $item) {
        //     $datas = MenuRole::lock('WITH(NOLOCK)')->create([
        //         'id_peran' => $item,
        //         'id_menu' => $data->id_menu,
        //         'a_boleh_insert' => (!empty($array['a_boleh_insert'])) ? 1 : 0,
        //         'a_boleh_show' => (!empty($array['a_boleh_show'])) ? 1 : 0,
        //         'a_boleh_delete' => (!empty($array['a_boleh_delete'])) ? 1 : 0,
        //         'a_boleh_update' => (!empty($array['a_boleh_update'])) ? 1 : 0,
        //         'a_boleh_sanggah' => (!empty($array['a_boleh_sanggah'])) ? 1 : 0,
        //         'approval_menu' => 1,
        //         'tgl_create' => currDateTime(),
        //         'last_update' => currDateTime(),
        //         'soft_delete' => 0,
        //         'last_sync' => currDateTime(),
        //         'id_updater' => Auth::user()->id_pengguna
        //     ]);
        // }

        if(!$data && !$datas) {
>>>>>>> Stashed changes
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
        $id = Crypt::decrypt($id);

        $data = Menu::lock('WITH(NOLOCK)')->where('id_menu', $id)->update([
            'nm_menu' => $array['nm_menu'],
            'nm_file' => $array['nm_file'],
            'urutan_menu' => $array['urutan_menu'],
            'id_group_menu' => (!empty($array['id_group_menu'])) ? $array['id_group_menu'] : null,
            'icon' => $array['icon'] ?? null,
            'level_menu' => $array['level_menu'] ?? null,
            'a_aktif' => $array['a_aktif'],
            'a_tampil' => $array['a_tampil'],
            'last_update' => currDateTime(),
            'last_sync' => currDateTime()
        ]);

<<<<<<< Updated upstream
=======
        //Check Menu
        // MenuRole::lock('WITH(NOLOCK)')->where('id_menu', $id)->whereNotIn('id_peran', $array['id_peran'])->update([
        //     'soft_delete'=>1,
        //     'last_update'=>currDateTime(),
        //     'last_sync'=>currDateTime()
        // ]);

        // foreach($array['id_peran'] as $item) {
        //     $check = MenuRole::lock('WITH(NOLOCK)')->where('id_menu', $id)->where('id_peran', $item)->first();
        //     if(!is_null($check)) {
        //         $datas = MenuRole::lock('WITH(NOLOCK)')->where('id_menu', $id)->where('id_peran', $item)->update([
        //             'a_boleh_insert' => (!empty($array['a_boleh_insert'])) ? 1 : 0,
        //             'a_boleh_show' => (!empty($array['a_boleh_show'])) ? 1 : 0,
        //             'a_boleh_delete' => (!empty($array['a_boleh_delete'])) ? 1 : 0,
        //             'a_boleh_update' => (!empty($array['a_boleh_update'])) ? 1 : 0,
        //             'a_boleh_sanggah' => (!empty($array['a_boleh_sanggah'])) ? 1 : 0,
        //             'last_update' => currDateTime(),
        //             'last_sync' => currDateTime(),
        //             'soft_delete' => 0,
        //             'id_updater' => Auth::user()->id_pengguna
        //         ]);
        //     } else {
        //         $datas = MenuRole::lock('WITH(NOLOCK)')->create([
        //             'id_peran' => $item,
        //             'id_menu' => $id,
        //             'a_boleh_insert' => (!empty($array['a_boleh_insert'])) ? 1 : 0,
        //             'a_boleh_show' => (!empty($array['a_boleh_show'])) ? 1 : 0,
        //             'a_boleh_delete' => (!empty($array['a_boleh_delete'])) ? 1 : 0,
        //             'a_boleh_update' => (!empty($array['a_boleh_update'])) ? 1 : 0,
        //             'a_boleh_sanggah' => (!empty($array['a_boleh_sanggah'])) ? 1 : 0,
        //             'approval_menu' => 1,
        //             'tgl_create' => currDateTime(),
        //             'last_update' => currDateTime(),
        //             'soft_delete' => 0,
        //             'last_sync' => currDateTime(),
        //             'id_updater' => Auth::user()->id_pengguna
        //         ]);
        //     }
        // }

>>>>>>> Stashed changes
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
