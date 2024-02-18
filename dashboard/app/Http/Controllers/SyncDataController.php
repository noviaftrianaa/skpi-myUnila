<?php

namespace App\Http\Controllers;

use App\Models\Sync\KelompokTabelAplikasi;
use App\Models\TableAplikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class SyncDataController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request, $id)
    {
        $id_kel_table_app = Crypt::decrypt($id);
        $data = KelompokTabelAplikasi::find($id_kel_table_app);
        $data_schema = DB::table('man_akses.table_aplikasi')
            ->whereNull('expired_date')
            ->where('a_table_aktif',1)
            ->select('skema_tbl')
            ->groupBy('skema_tbl')
            ->get()->pluck('skema_tbl','skema_tbl')
            ->toArray();
        if ($request->has('schema')) {
            $schema = $request->schema;
            $data_table = DB::table('man_akses.table_aplikasi')
                ->whereNull('expired_date')
                ->where('a_table_aktif',1)
                ->where('skema_tbl',$schema)
                ->orderBy('tabel_alias')
                ->get();
        } else {
            $schema = null;
            $data_table = collect();
        }
        return view('sync.sync_data.create',[
            'judul_halaman' => 'Tambah Tabel Sync Grup MyUNILA',
            'route'         => 'sinkronisasi.tabel.simpan',
            'param_form'    => $data->id_kel_table_app,
            'schema'        => $schema,
            'data'          => $data,
            'data_schema'   => $data_schema,
            'data_table'    => $data_table,
            'backLink'      => 'sinkronisasi.tabel',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $id)
    {
        $id_kel_table_app = Crypt::decrypt($id);
        $data = KelompokTabelAplikasi::find($id_kel_table_app);
        $input = $request->all();
        if (0==count($input['id_table_app'])) {
            alert()->error('Silahkan pilih tabel grup terlebih dahulu','Gagal menyimpan')->persistent('OK');
            return redirect()->back();
        } else {
            foreach ($input['id_table_app'] AS $id_table_app) {
                $get_table_app = TableAplikasi::find($id_table_app);
                $input_data = [
                    'id_table_app'          => $get_table_app->id_table_app,
                    'id_induk_kel_table_app'=> $data->id_kel_table_app,
                    'level'                 => 1,
                ];

                $data_simpan = new KelompokTabelAplikasi();
                $data_simpan->fill($data_simpan->prepare($input_data))->save();
            }
            alert()->success('Berhasil menyimpan tabel grup')->persistent('OK');
            return redirect()->route('sinkronisasi.tabel',Crypt::encrypt($data->id_kel_table_app));
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
