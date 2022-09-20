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
use Illuminate\Support\Facades\Http;
use SSO\SSO;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        // $this->middleware('auth');
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
        $app_inter = Aplikasi::with('LargeObject')->lock('WITH(NOLOCK)')->whereNull('expired_date')->orWhere('expired_date', '>=', currDateTime())->simplePaginate(18);
        // $app_non_inter = Aplikasi::with('LargeObject')->lock('WITH(NOLOCK)')->where('a_integrasi_cas',0)->get();
            
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
                'app_inter' => $app_inter
                // 'app_non_inter'=>$app_non_inter
            ];
        }
        return view($views, $data_compact);
    }

    public function searchApps($name)
    {
        $data = Aplikasi::with('LargeObject')->lock('WITH(NOLOCK)')->where('nm_aplikasi', 'like', '%'.$name.'%')->whereNull('expired_date')->orWhere('expired_date', '>=', currDateTime())->orderBy("nm_aplikasi", "ASC")->get();

        foreach($data as $items) {
            $items->url_logo = (!is_null($items->largeobject)) ? 'data:image/' . $items->largeobject->mime_type . ';base64,' . $items->largeobject->blob_content : asset('auth/img/logo.png');
        }

        return response()->json($data);
    }

    public function biodata()
    {
        $data = User::findOrFail(Auth::user()->id_pengguna);

        return view('manajemen.profile.biodata', [
            'data'=>$data
        ]);
    }

    public function riwayat_pendidikan()
    {
        $user = User::find(Auth::user()->id_pengguna);
        if(!is_null($user->id_sdm_pengguna)) {
            //GET API
            $response = Http::get('http://onedata.unila.ac.id/api/live/0.1/sdm/detail?id_jns_sdm=12&id_sdm='.$user->id_sdm_pengguna);
            if(is_null($response['data'])) {
                $response = Http::get('http://onedata.unila.ac.id/api/live/0.1/sdm/detail?id_jns_sdm=13&id_sdm='.$user->id_sdm_pengguna);
            }

            $message = $response['message'];
            if(!empty($message) && !is_null($response['data'])) {
                $data = $response['data']['pendidikan'];
            } else {
                $data = [];
            }
        } else if (!is_null($user->id_pd_pengguna)) {
            $response = Http::get('http://onedata.unila.ac.id/api/live/0.1/mahasiswa/detail?idPesertaDidik='.$user->id_pd_pengguna);
            $message = $response['message'];
            if(!empty($message) && !is_null($response['data'])) {
                $data = $response['data'];
            } else {
                $data = [];
            }
        } else {
            $data = [];
        }
        return view('manajemen.profile.riwayat_pendidikan', compact('data','user'));
    }

    public function index_ubah_password()
    {
        if(SSO::check()) {
            return view('auth.ubah_password');
        }
    }
    
}
