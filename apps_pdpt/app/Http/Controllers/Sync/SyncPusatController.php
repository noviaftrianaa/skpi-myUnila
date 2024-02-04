<?php

namespace App\Http\Controllers\Sync;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SyncPusatController extends Controller
{
    use SyncTrait;
    private $reportName = 'Sync';
    private $title = '';
    protected $basepath;
    protected $sp;

    public function __construct()
    {
        $this->basepath = 'sync_data';
        $this->sp = DB::table('pdrd.satuan_pendidikan')->where('id_sp', env('APP_ID_SP'))->first();
    }
    public function pusat(Request $request)
    {

    }

    public function index(Request $request)
    {
        return view('sync.index',[
            'side_active' => 'Sync'
        ]);
    }
}
