<?php

namespace App\Http\Controllers;

use App\Http\Controllers\SyncTrait;
use App\Models\Sync\KelompokTabelAplikasi;
use Illuminate\Http\Request;
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
      $data = new KelompokTabelAplikasi();
      $data->fill($data->prepare($input));
      dd($data);
    }
}
