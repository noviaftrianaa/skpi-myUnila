<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use DataTables;
use App\Models\User;
use App\Models\Aplikasi;
use Session;
use Cookie;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        $datas = User::all();
        $apps = Aplikasi::all();
        $db = DB::table('man_akses.versi_db')->first();

        return view('manajemen.index', [
            'data'  => $datas,
            'apps'  => $apps,
            'db'    => $db
        ]);
    }
}
