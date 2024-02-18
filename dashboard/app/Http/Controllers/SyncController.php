<?php

namespace App\Http\Controllers;

use App\Http\Controllers\SyncTrait;
use App\Models\Sync\KelompokTabelAplikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class SyncController extends Controller
{
    use SyncTrait;

    public function index()
    {
        $data = KelompokTabelAplikasi::whereNull('expired_date')
            ->where('level',0)
            ->orderBy('enpoint','ASC')->get();
        return view('sync.index',compact('data'));
    }

    public function create()
    {
        return view('_partials.__partial.form.create',[
            'judul_halaman' => 'Tambah Sync Grup MyUNILA',
            'route'         => 'sinkronisasi.simpan',
            'backLink'      => 'sinkronisasi',
            'form'          => 'sync.create',
        ]);
    }

    public function store(Request $request)
    {
        $input = $request->all();
        $input['level'] = 0;
        $data = new KelompokTabelAplikasi();
        $data->fill($data->prepare($input));
        $data->save();

        alert()->success('Berhasil menyimpan data')->persistent('OK');
        return redirect()->route('sinkronisasi');
    }

    public function show($id)
    {
        $id_kel_table_app = Crypt::decrypt($id);
        $data = KelompokTabelAplikasi::find($id_kel_table_app);
        return view('sync.detail',compact('data'));
    }

    public function edit($id)
    {
        $id_kel_table_app = Crypt::decrypt($id);
        $data = KelompokTabelAplikasi::find($id_kel_table_app);
        return view('_partials.__partial.form.edit',[
            'judul_halaman' => 'Ubah data Sync Grup MyUNILA',
            'id'            => $data->id_kel_table_app,
            'data'          => $data,
            'route'         => 'sinkronisasi.update',
            'backLink'      => 'sinkronisasi',
            'form'          => 'sync.edit',
        ]);
    }

    public function update(Request $request, $id)
    {
        $id_kel_table_app = Crypt::decrypt($id);
        $input = $request->all();
        $data = KelompokTabelAplikasi::find($id_kel_table_app);
        $data->fill($data->prepare($input));
        $data->save();

        alert()->success('Berhasil mengubah data')->persistent('OK');
        return redirect()->route('sinkronisasi');
    }
}
