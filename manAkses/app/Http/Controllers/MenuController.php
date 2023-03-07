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
                    $button = '<a class="btn btn-info" title="Show User" href="#editItem'.$data->id_menu.'" data-toggle="modal">Edit</a>';
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
    public function data($id)
    {
        $data = Menu::where('id_menu', $id)->first();
        return response()->json($data);
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
        $array = $request->all();

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
        $data = Menu::where('id_menu', $id);
        $menu_pj = MenuRole::where('id_menu', $data->first()->id_menu)->delete();
        $data->delete();
        
        if(!$data) {
            alert()->error('Data gagal dihapus!');
        } else {
            alert()->success('Data berhasil dihapus!');
        }
        return redirect()->back();
        
    }
}
