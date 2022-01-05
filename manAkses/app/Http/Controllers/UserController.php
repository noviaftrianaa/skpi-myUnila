<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use Auth;
use App\Models\User;
use App\Models\UnitOrganisasi;
use App\Models\Peran;
use Illuminate\Support\Facades\Crypt;

class UserController extends Controller
{

    public function index()
    {
        $user = User::all();
        $unit = UnitOrganisasi::where('a_aktif',1)->get();
        $peran = Peran::all();

        return view('manajemen.pengguna.index', [
            'user'=>$user,
            'unit'=>$unit,
            'peran'=>$peran
        ]);
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

        $data = User::create([
            'nm_pengguna'      => $array['nama'],
            'nama_id'   => $array['nama_id'],
            'password'  => sha1('12345678'),
            'level'     => 2,
            'unit'      => $array['unit'],
            'status'    => $array['status']
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

        $data = User::where('id_pengguna',$id)->update([
            'nm_pengguna'      => $array['nama']
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
    
    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function reset(Request $request, $id)
    {
        $id = Crypt::decrypt($id);
        $data = User::where('id_pengguna', $id)->update([
            'password' => sha1('12345678')
        ]);
        if(!$data) {
            alert()->error('Password gagal direset!');
        } else {
            alert()->success('Password berhasil direset!');
        }
        return redirect()->back();
    }
}
