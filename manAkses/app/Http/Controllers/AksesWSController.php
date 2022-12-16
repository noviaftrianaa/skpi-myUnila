<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use App\Models\PJAplikasi;
use App\Models\Aplikasi;
use App\Models\WSAuthorization;
use App\Models\WSEndpoint;
use App\Models\WSReqBody;
use App\Models\WSReqBodyTerms;
use App\Models\User;
use Auth;

class AksesWSController extends Controller
{

    private $basepath;

    public function __construct()
    {
        $this->basepath = 'aplikasi.pj_aplikasi.akses_ws';
    }

    public function create($id)
    {
        $id = Crypt::decrypt($id);
        $d['id'] = $id;
        $d['pj'] = PJAplikasi::with("user","aplikasi")->where('id_pj_aplikasi',$id)->first();
        $d['data'] = WSEndpoint::with("req.terms")->where('soft_delete',0)->where('a_active',1)->orderBy('nm_group')->get();
        // dd($d);

        return view('manajemen.aplikasi.akses_ws.form', $d);
    }

    public function req($id)
    {
        $data = WSEndpoint::select('id_ws_endpoint AS id','path_url AS text')->orderBy('path_url')->get();
        // $data = WSReqBody::where('id_ws_endpoint', $id)->select('id_ws_req_body AS id','nm_req AS text')->orderBy('nm_req')->get();

        return response()->json($data);
    }

    public function terms($id)
    {
        $data = WSEndpoint::select('id_ws_endpoint AS id','path_url AS text')->orderBy('path_url')->get();
        // $data = WSReqBodyTerms::where('id_ws_req_body', $id)->select('id_ws_req_body_terms AS id','req_terms AS text')->orderBy('req_terms')->get();

        return response()->json($data);
    }

    public function store(Request $request, $id)
    {
        dd($request->all());
    }
}
