<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use App\Models\PJAplikasi;
use App\Models\Aplikasi;
use App\Models\WSAuthorization;
use App\Models\WSEndpoint;
use App\Models\WSEndpointBody;
use App\Models\WSEndpointBodyTerms;
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
        $d['authorization'] = WSAuthorization::with('terms')->where('soft_delete',0)->where('a_active',1)->where('id_pengguna', \Auth::user()->id_pengguna)->where('id_aplikasi', $d['pj']->aplikasi->id_aplikasi)->get();
        // dd($d['authorization']->toArray());
        return view('manajemen.aplikasi.akses_ws.form', $d);
    }

    public function body($id)
    {
        $data = WSEndpointBody::where('id_ws_endpoint', $id)->select('id_ws_endpoint_body', 'nm_req', 'type_data')->orderBy('nm_req')->get();

        return response()->json($data);
    }

    public function store(Request $request, $id)
    {
        $request->validate([
            'id_pengguna'   => 'required',
            'id_aplikasi'   => 'required',
            'ws'            => 'required'
        ]);

        $input = $request->all();

        if(count($input['ws']) == 0) {
            alert()->error('Tidak ada akses web services yang dipilih!');
            return redirect()->back();
        }

        foreach($input['ws'] AS $r) {
            $authorization = WSAuthorization::create([
                'id_ws_authorization'   => guid(),
                'id_pengguna'           => $input['id_pengguna'],
                'id_aplikasi'           => $input['id_aplikasi'],
                'id_ws_endpoint'        => $r['id'],
                'a_active'              => 1,
                'created_at'            => now()
            ]);

            foreach($r['body'] AS $s=>$t) {
                if($t[1] != null) {
                    WSEndpointBodyTerms::create([
                        'id_ws_endpoint_body_terms' => guid(),
                        'id_ws_authorization'       => $authorization->id_ws_authorization,
                        'id_ws_endpoint_body'       => $s,
                        'terms_logic'               => $t[0],
                        'terms_value'               => $t[1],
                        'created_at'                => now()
                    ]);
                }
            }
        }

        alert()->success('Sukses menambahkan hak akses web services');
        return redirect()->route('aplikasi.detail', Crypt::encrypt($input['id_aplikasi']));
    }
}
