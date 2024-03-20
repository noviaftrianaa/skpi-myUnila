<?php

namespace App\Http\Controllers\Main\Perkuliahan;

use App\Http\Controllers\Controller;
use App\Models\Pdrd\PesertaDidik;
use App\Models\Pdrd\SatuanPendidikan;
use App\Models\Pdrd\SMS;
use App\Models\Referensi\TahunAjaran;
use App\Models\Referensi\Semester;
use App\Models\Pdrd\AktMahasiswa;
use App\Models\UnitOrganisasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;

class KurikulumController extends Controller
{
    private $url;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->currDateTime = currDateTime();
        $this->url = ENV('URL_WS_SIAKADU');
    }


    public function index(Request $request)
    {
        $role = session()->get("login.role");
        $unit = UnitOrganisasi::find($role->id_organisasi);
        if ($unit->id_jns_lemb == 24) {
            $sms = Sms::find($unit->id_organisasi);
            $judul =
                "Kurikulum Program Studi " .
                $sms->nm_lemb .
                " (" .
                $sms->jenjang->nm_jenj_didik .
                ")";
        } elseif ($unit->id_jns_lemb == 28) {
            $sms = Sms::find($unit->id_organisasi);
            $judul = "Kurikulum Jurusan " . $sms->nm_lemb;
        } elseif ($unit->id_jns_lemb == 23) {
            $sms = Sms::find($unit->id_organisasi);
            $judul = "Kurikulum Fakultas " . $sms->nm_lemb;
        } else {
            $sp = SatuanPendidikan::find(env("APP_ID_SP"));
            $token = cek_token_siakadu();
            $response = curlApiSiakadu('GET', $this->url . '/referensi/tahun_kurikulum/list', null, $token);

            if(isset($response['success'])){
                $ta_list = $response['payload'];
                $thn = $response['payload'][0];
                $list_prodi = $this->unitProdi();
            }else{
                $ta_list = null;
                $thn = null;
                $list_prodi= null;
            }
            $judul = "Kurikulum " . $sp->nm_lemb;
        }
        return view(
            "content.main.perkuliahan.kurikulum.index",
            compact("ta_list", "thn", "judul", "unit", "list_prodi")
        );
    }

    public function list(Request $request)
    {
        // dd($request->all());
        $token = cek_token_siakadu();
        $page = 1;
        $page_size = 99999999999;
        $thn_kurikulum = $request->input('thn_kurikulum');
        $id_unit = $request->input('id_unit');

        if(!is_null($thn_kurikulum) && !is_null($id_unit)){
            $query = "page=".$page."&page_size=".$page_size."&thn_kurikulum=".$thn_kurikulum."&id_unit=".$id_unit;
        }elseif(!is_null($thn_kurikulum)){
            $query = "page=".$page."&page_size=".$page_size."&thn_kurikulum=".$thn_kurikulum;
        }elseif(!is_null($thn_kurikulum)){
            $query = "page=".$page."&page_size=".$page_size."&id_unit=".$id_unit;
        }else{
            $query = "page=".$page."&page_size=".$page_size;
        }
        $response = curlApiSiakadu('GET', $this->url . '/kurikulum/list?'. $query, null, $token);

        if(isset($response['success'])){
            return [
                'draw' => intval($request->input('draw')), // Penting untuk sinkronisasi request
                'recordsTotal' => intval($response['query']['total_count']), // Total record tanpa filtering
                'recordsFiltered' => intval($response['query']['page_size']), // Total record setelah diterapkan filtering
                'data' => $response['payload'] // Data yang akan ditampilkan
            ];
        }else{
            return $response;
        }

    }

    public function unitProdi(){
        $token = cek_token_siakadu();
        $jns_unit = 'P';
        $response = curlApiSiakadu('GET', $this->url . '/referensi/unit/list?jns_unit='.$jns_unit, null, $token);
        $unit = $response['payload'];

        return $unit;
    }

}
