<?php

namespace App\Http\Controllers;

use App\Models\Pdrd\RegPTK;
use App\Models\Pdrd\SDM;
use App\Models\Sync\KelompokTabelAplikasi;
use App\Models\TableAplikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class SyncDataController extends Controller
{
  use SyncTrait;
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
      ->where('a_table_aktif', 1)
      ->select('skema_tbl')
      ->groupBy('skema_tbl')
      ->get()
      ->pluck('skema_tbl', 'skema_tbl')
      ->toArray();
    if ($request->has('schema')) {
      $schema = $request->schema;
      $data_table = DB::table('man_akses.table_aplikasi')
        ->whereNull('expired_date')
        ->where('a_table_aktif', 1)
        ->where('skema_tbl', $schema)
        ->orderBy('tabel_alias')
        ->get();
    } else {
      $schema = null;
      $data_table = collect();
    }
    return view('content.main.sync.sync_data.create', [
      'judul_halaman' => 'Tambah Tabel Sync Grup MyUNILA',
      'route' => 'sinkronisasi.tabel.simpan',
      'param_form' => $data->id_kel_table_app,
      'schema' => $schema,
      'data' => $data,
      'data_schema' => $data_schema,
      'data_table' => $data_table,
      'backLink' => 'sinkronisasi.tabel',
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
    if (0 == count($input['id_table_app'])) {
      alert()
        ->error('Silahkan pilih tabel grup terlebih dahulu', 'Gagal menyimpan')
        ->persistent('OK');
      return redirect()->back();
    } else {
      foreach ($input['id_table_app'] as $id_table_app) {
        $get_table_app = TableAplikasi::find($id_table_app);
        $input_data = [
          'id_table_app' => $get_table_app->id_table_app,
          'id_induk_kel_table_app' => $data->id_kel_table_app,
          'level' => 1,
        ];

        $data_simpan = new KelompokTabelAplikasi();
        $data_simpan->fill($data_simpan->prepare($input_data))->save();
      }
      alert()
        ->success('Berhasil menyimpan tabel grup')
        ->persistent('OK');
      return redirect()->route('sinkronisasi.tabel', Crypt::encrypt($data->id_kel_table_app));
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
  public function edit($id, $id_tabel)
  {
    $id_induk_kel_tabel_app = Crypt::decrypt($id);
    $id_kel_tabel_app = Crypt::decrypt($id_tabel);
    $data_induk = KelompokTabelAplikasi::find($id_induk_kel_tabel_app);
    $data = KelompokTabelAplikasi::find($id_kel_tabel_app);
    return view('_partials.__partial.form.edit', [
      'data' => $data,
      'data_induk' => $data_induk,
      'id' => $data->id_kel_table_app,
      'param_form' => $data_induk->id_kel_table_app,
      'judul_halaman' => 'Ubah rincian tabel sync',
      'route' => 'sinkronisasi.tabel.update',
      'backLink' => 'sinkronisasi.tabel',
      'form' => 'content.main.sync.sync_data.edit',
    ]);
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, $id, $id_tabel)
  {
    $id_induk_kel_tabel_app = Crypt::decrypt($id);
    $id_kel_tabel_app = Crypt::decrypt($id_tabel);
    $input = $request->all();
    $data_induk = KelompokTabelAplikasi::find($id_induk_kel_tabel_app);
    $data = KelompokTabelAplikasi::find($id_kel_tabel_app);
    $data->fill($data->prepare($input))->save();

    alert()
      ->success('Berhasil mengubah data')
      ->persistent('OK');
    return redirect()->route('sinkronisasi.tabel', Crypt::encrypt($data_induk->id_kel_table_app));
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(string $id)
  {
    //
  }

  public function mulai_sync(Request $request, $id, $id_tabel)
  {
    ini_set('max_execution_time', 0);
    $waktu_mulai = currDateTime();
    $id_induk_kel_tabel_app = Crypt::decrypt($id);
    $id_kel_tabel_app = Crypt::decrypt($id_tabel);
    $data_induk = KelompokTabelAplikasi::find($id_induk_kel_tabel_app);
    $update_time = currDateTime();
    $data = KelompokTabelAplikasi::find($id_kel_tabel_app);
    $url = $data->url;
    if ($url == env('URL_WS_SISTER')) {
      $token = generate_token_sister();
      $this->sync_table(
        $data->tabel_app->skema_tbl,
        $data->tabel_app->nm_tbl,
        $token,
        $url,
        $data,
        $update_time,
        $waktu_mulai
      );
    } elseif ($data->url == env('URL_WS_NEO_FEEDER')) {
      dd('');
    }
    return redirect()->back();
  }
}
