<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\MenuRole;
use Auth;
use Crypt;

class MenuRoleController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($id)
    {
        $id = Crypt::decrypt($id);
        $data = \App\Models\Aplikasi::lock('WITH(NOLOCK)')->where('id_aplikasi',$id)->first();
        $peran = \DB::SELECT("
            SELECT DISTINCT
                peran.id_peran,
                peran.nm_peran
            FROM
                man_akses.menu_role AS mrole
                JOIN man_akses.menu ON menu.id_menu=mrole.id_menu
                JOIN man_akses.peran ON peran.id_peran=mrole.id_peran
            WHERE
                menu.id_aplikasi='".$id."'
                AND mrole.soft_delete=0
                AND peran.expired_date IS NULL
        ");

        return view('manajemen.aplikasi.menu_role.index', [
            'peran' => $peran,
            'data'=>$data
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create($id)
    {
        $id = Crypt::decrypt($id);
        $data = \App\Models\Aplikasi::lock('WITH(NOLOCK)')->where('id_aplikasi',$id)->first();
        return view('manajemen.aplikasi.menu_role.create', compact('data'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $id)
    {
        $id = \Crypt::decrypt($id);
        $array = $request->all();

        $menu = \App\Models\Menu::where('id_aplikasi', $id)->pluck('id_menu');
        //DELETE
        MenuRole::where('id_peran', $array['id_peran'])->whereIn('id_menu', $menu)->delete();
        
        foreach($array['menu'] AS $n=>$r)
        {
            MenuRole::create(
                [
                    'id_peran' => $array['id_peran'],
                    'id_menu' => $n,
                    'a_boleh_insert' => (!empty($r['insert'])) ? 1 : 0,
                    'a_boleh_show' => (!empty($r['show'])) ? 1 : 0,
                    'a_boleh_delete' => (!empty($r['delete'])) ? 1 : 0,
                    'a_boleh_update' => (!empty($r['update'])) ? 1 : 0,
                    'a_boleh_sanggah' => (!empty($r['sanggah'])) ? 1 : 0,
                    'approval_menu' => 1,
                    'tgl_create' => currDateTime(),
                    'last_update' => currDateTime(),
                    'soft_delete' => 0,
                    'last_sync' => currDateTime(),
                    'id_updater' => \Auth::user()->id_pengguna
                ]
            );
        }

        alert()->success('Data berhasil ditambahkan!');
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
    public function edit($id, $mrole)
    {
        $id_aplikasi = Crypt::decrypt($id);
        $id_peran = Crypt::decrypt($mrole);

        $data = \App\Models\Aplikasi::lock('WITH(NOLOCK)')->where('id_aplikasi', $id_aplikasi)->first();

        return view('manajemen.aplikasi.menu_role.edit', compact('data','id_peran'));
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
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id, $mrole)
    {
        $id_aplikasi = Crypt::decrypt($id);
        $id_peran = Crypt::decrypt($mrole);

        $menu = \App\Models\Menu::lock('WITH(NOLOCK)')->where('id_aplikasi', $id_aplikasi)->pluck('id_menu');
        MenuRole::whereIn('id_menu', $menu)->where('id_peran', $id_peran)->update(
            [
                'soft_delete' => 1
            ]
        );

        alert()->success('Data berhasil dihapus!');
        return redirect()->back();
    }
}
