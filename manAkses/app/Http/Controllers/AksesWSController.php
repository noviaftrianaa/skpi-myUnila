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

    public function index($id, Request $request)
    {
        $id = Crypt::decrypt($id);
        $d['menus'] = collect(session()->get('login.menu'))->where('nm_file', 'aplikasi.index')->first();
        $d['id'] = $id;
        $d['data'] = \DB::SELECT("
            SELECT DISTINCT
                p.id_pengguna,
                p.nm_pengguna
            FROM
                man_akses.ws_authorization AS ws
                JOIN man_akses.pengguna AS p ON p.id_pengguna=ws.id_pengguna AND p.soft_delete=0
            WHERE
                ws.id_aplikasi='".$id."'
                AND ws.soft_delete = 0
                AND ws.a_active = 1
            ORDER BY
                p.nm_pengguna ASC
        ");

        return view('manajemen.aplikasi.akses_ws.index', $d);
    }

    public function create($id)
    {
        $d['id'] = $id;
        $d['pj'] = PJAplikasi::with("user","aplikasi")->where('id_pj_aplikasi',$id)->first();
        $d['data'] = WSEndpoint::with("req.terms")->where('soft_delete',0)->where('a_active',1)->orderBy('nm_group')->get();
        $d['authorization'] = WSAuthorization::with('terms')->where('soft_delete',0)->where('a_active',1)->where('id_pengguna', \Auth::user()->id_pengguna)->where('id_aplikasi', $d['pj']->aplikasi->id_aplikasi)->get();
        // dd($d['authorization']->toArray());
        return view('manajemen.aplikasi.akses_ws.form', $d);
    }

    public function edit($id)
    {
        $array = \Crypt::decrypt($id);
        $id_aplikasi = $array[0];
        $id_pengguna = $array[1];

        $d['aplikasi'] = Aplikasi::findOrFail($id_aplikasi);
        $d['pengguna'] = \App\Models\User::findOrFail($id_pengguna);
        $d['id'] = $id;

        $endpoint = \DB::SELECT("
            SELECT
                wse.*,
                CASE
                    WHEN wsa.id_ws_authorization IS NOT NULL THEN 1
                    ELSE 0
                END AS aktif
            FROM
                man_akses.ws_endpoint as wse
                LEFT JOIN man_akses.ws_authorization AS wsa ON wsa.id_ws_endpoint=wse.id_ws_endpoint AND wsa.id_aplikasi='".$id_aplikasi."' AND wsa.id_pengguna='".$id_pengguna."'
            WHERE
                wse.soft_delete=0
                AND wse.a_active=1
            ORDER BY
                wse.nm_group,
                wse.nm_method,
                wse.path_url ASC
        ");
        $d['endpoint'] = collect($endpoint)->groupBy('nm_group');
        // dd($d, $endpoint);

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
        dd($input);

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
