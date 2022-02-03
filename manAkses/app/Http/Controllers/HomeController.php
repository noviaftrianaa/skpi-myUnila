<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use DataTables;
use App\Models\User;
use App\Models\Aplikasi;
use App\Models\RolePengguna;
use App\Models\LargeObject;
use Session;
use Cookie;
use Auth;

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
        if(Session::get('login.role')->id_peran != 1) {
            $app_inter = Aplikasi::with('LargeObject')->lock('WITH(NOLOCK)')->where('a_integrasi_cas',1)->get();
            $app_non_inter = Aplikasi::with('LargeObject')->lock('WITH(NOLOCK)')->where('a_integrasi_cas',0)->get();
            return view('default.index', ['app_inter'=>$app_inter,'app_non_inter'=>$app_non_inter]);
        } else {
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

    public function biodata()
    {
        $data = User::findOrFail(Auth::user()->id_pengguna);

        return view('default.biodata.index', [
            'data'=>$data
        ]);
    }
}
