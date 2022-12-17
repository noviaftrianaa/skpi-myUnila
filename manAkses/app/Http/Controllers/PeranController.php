<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Peran;
use Illuminate\Support\Facades\Crypt;

class PeranController extends Controller
{

    private $basepath;

    public function __construct()
    {
        $this->basepath = 'peran';
    }

    public function index()
    {
        $peran = Peran::lock('WITH(NOLOCK)')->whereNull('expired_date')->orderBy('nm_peran','ASC')->get();

        return view('manajemen.peran.index', [
            'peran'=>$peran
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
    public function store(Request $request)
    {
        $array = $request->all();
        $sum = Peran::get()->count();

        $data = Peran::lock('WITH(NOLOCK)')->create([
            'id_peran'=>($sum+1),
            'nm_peran'=>$array['nm_peran'],
            'a_perlu_sk'=>$array['a_perlu_sk'],
            'tgl_create'=>currDateTime(),
            'last_update'=>currDateTime(),
            'last_sync'=>currDateTime()
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

        $data = Peran::lock('WITH(NOLOCK)')->where('id_peran', $id)->update([
            'nm_peran'=>$array['nm_peran'],
            'a_perlu_sk'=>$array['a_perlu_sk'],
            'last_update'=>currDateTime(),
            'last_sync'=>currDateTime()
        ]);

        if(!$data) {
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
        $id = Crypt::decrypt($id);
        $data = Peran::lock('WITH(NOLOCK)')->where('id_peran', $id)->update([
            'expired_date' => currDateTime(),
            'id_updater' => Auth::user()->id_pengguna
        ]);

        if(!$data) {
            alert()->error('Data berhasil dihapus!');
        } else {
            alert()->success('Data berhasil dihapus!');
        }
        return redirect()->back();
    }
}
