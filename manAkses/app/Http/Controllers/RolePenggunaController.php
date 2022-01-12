<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use Crypt;
use App\Models\RolePengguna;
use App\Models\User;
use App\Models\Peran;
use App\Models\UnitOrganisasi;

class RolePenggunaController extends Controller
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
        $pengguna = User::where('id_pengguna', $array['id_pengguna'])->first();
        foreach($array['id_peran'] as $item) {
            $role = RolePengguna::create([
                'id_role_pengguna' => guid(),
                'id_pengguna' => $pengguna->id_pengguna,
                'id_organisasi' => $array['id_organisasi'],
                'id_peran' => $item,
                'sk_penugasan' => (!empty($array['sk_penugasan'])) ? $array['sk_penugasan'] : null,
                'tgl_sk_penugasan' => (!empty($array['tgl_sk_penugasan'])) ? $array['tgl_sk_penugasan'] : null,
                'approval_peran' => 1,
                'tgl_create' => currDateTime(),
                'last_active' => currDateTime(),
                'last_update' => currDateTime(),
                'soft_delete' => 0,
                'last_sync' => currDateTime(),
                'id_updater' => $pengguna->id_pengguna
            ]);
        }
    
        if(!$role) {
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
        $role = RolePengguna::where('id_role_pengguna', $id)->update([
            'id_organisasi' => $array['id_organisasi'],
            'id_peran' => $array['id_peran'],
            'sk_penugasan' => (!empty($array['sk_penugasan'])) ? $array['sk_penugasan'] : null,
            'tgl_sk_penugasan' => (!empty($array['tgl_sk_penugasan'])) ? $array['tgl_sk_penugasan'] : null,
            'approval_peran' => 1,
            'last_update' => currDateTime(),
            'last_sync' => currDateTime(),
            'id_updater' => $array['id_pengguna']
        ]);
    
        if(!$role) {
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
