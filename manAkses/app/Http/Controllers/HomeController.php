<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use DataTables;
use App\Models\User;
use App\Models\Aplikasi;
use App\Models\RolePengguna;
use App\Models\UnitOrganisasi;
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
        $datas = User::all();
        $apps = Aplikasi::all();
        $unit = UnitOrganisasi::all();
        $role = Rolepengguna::all();
        $db = DB::table('man_akses.versi_db')->first();
        $app_inter = Aplikasi::with('LargeObject')->lock('WITH(NOLOCK)')->where('a_integrasi_cas',1)->get();
        $app_non_inter = Aplikasi::with('LargeObject')->lock('WITH(NOLOCK)')->where('a_integrasi_cas',0)->get();
            
        if(Session::has('login.role') && Session::get('login.role')->id_peran == 1) {
            $views = 'manajemen.index_admin';
            $data_compact = [
                'data'  => $datas,
                'apps'  => $apps,
                'db'    => $db,
                'role'  => $role,
                'unit'  => $unit
            ];
        } else {
            $views = 'manajemen.index';
            $data_compact = [
                'app_inter' => $app_inter,
                'app_non_inter'=>$app_non_inter
            ];
        }
        return view($views, $data_compact);
    }

    public function biodata()
    {
        $data = User::findOrFail(Auth::user()->id_pengguna);

        return view('manajemen.profile.biodata', [
            'data'=>$data
        ]);
    }

    public function index_ubah_password()
    {
        return view('manajemen.profile.ubah_password');
    }
    
}
