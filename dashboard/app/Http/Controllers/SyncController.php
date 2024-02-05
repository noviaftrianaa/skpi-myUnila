<?php

namespace App\Http\Controllers;

use App\Http\Controllers\SyncTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SyncController extends Controller
{
    use SyncTrait;

    public function __construct()
    {
      $this->basepath = 'sync_data';
      $this->sp = DB::table('pdrd.satuan_pendidikan')->where('id_sp', env('APP_ID_SP'))->first();
    }

    public function index()
    {
      return view('sync.index');
    }
}
