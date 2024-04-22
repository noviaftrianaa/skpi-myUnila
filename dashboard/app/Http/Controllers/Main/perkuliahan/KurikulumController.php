<?php

namespace App\Http\Controllers\Main\Perkuliahan;

use App\Http\Controllers\Controller;
use App\Models\Pdrd\PesertaDidik;
use App\Models\Pdrd\SatuanPendidikan;
use App\Models\Pdrd\SMS;
use App\Models\Referensi\JenjangPendidikan;
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
        $token = cek_token_siakadu();
        $response = curlApiSiakadu('GET', $this->url . '/referensi/tahun_kurikulum/list', null, $token);
        $select_unit = '';

        if(isset($response['success'])){
            $ta_list = $response['payload'];
            $thn = $response['payload'][0];
        }else{
            $ta_list = null;
            $thn = null;
        }

        if ($unit->id_jns_lemb == 24) {
            $sms = Sms::find($unit->id_organisasi);
            $judul = "Kurikulum Program Studi " . $sms->nm_lemb . " (" . $sms->jenjang->nm_jenj_didik . ")";
            $jenj= JenjangPendidikan::find($sms->id_jenj_didik);
            $nm_lemb = $jenj->nm_jenj_didik .'-'.$sms->nm_lemb;
            $jns_unit = 'P';
            $list_prodi = $this->unitProdi($jns_unit, $nm_lemb);
            $select_unit = $list_prodi[0]['nm_unit'];

        } elseif ($unit->id_jns_lemb == 28) {
            $sms = Sms::find($unit->id_organisasi);
            $judul = "Kurikulum Jurusan " . $sms->nm_lemb;
            $nm_lemb = $sms->nm_lemb;
            $jns_unit = 'J';
            $list_prodi = $this->unitProdi($jns_unit, $nm_lemb);
            $select_unit = $list_prodi[0]['nm_unit'];

        } elseif ($unit->id_jns_lemb == 23) {
            $sms = Sms::find($unit->id_organisasi);
            $judul = "Kurikulum Fakultas " . $sms->nm_lemb;
            $nm_lemb = $sms->nm_lemb;
            $jns_unit = 'F';
            $list_prodi = $this->unitProdi($jns_unit, $nm_lemb);
            $select_unit = $list_prodi[0]['nm_unit'];

        } else {
            $sp = SatuanPendidikan::find(env("APP_ID_SP"));
            $judul = "Kurikulum " . $sp->nm_lemb;
            $jns_unit = '';
            $list_prodi = $this->unitProdi($jns_unit, $select_unit);
        }

        return view(
            "content.main.perkuliahan.kurikulum.index",
            compact("ta_list", "thn", "judul", "unit", "list_prodi", "select_unit")
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
        $search = $request->input('search');

        if(!is_null($thn_kurikulum) && !is_null($id_unit)){
            $query = "page=".$page."&page_size=".$page_size."&thn_kurikulum=".$thn_kurikulum."&id_unit=".$id_unit."&search=".urlencode($search);
        }elseif(!is_null($thn_kurikulum)){
            $query = "page=".$page."&page_size=".$page_size."&thn_kurikulum=".$thn_kurikulum."&search=".urlencode($search);
        }elseif(!is_null($id_unit)){
            $query = "page=".$page."&page_size=".$page_size."&id_unit=".$id_unit."&search=".urlencode($search);
        }else{
            $query = "page=".$page."&page_size=".$page_size."&search=".urlencode($search);;
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

    public function unitProdi($jns_unit, $nm_lemb){
        $token = cek_token_siakadu();
        $response = curlApiSiakadu('GET', $this->url.'/referensi/unit/list?jns_unit='.$jns_unit.'&search='.urlencode($nm_lemb), null, $token);
        if(isset($response['payload'])){
            $unit = $response['payload'];
            return $unit;
        }else{
            $unit = [];
            return $unit;
        }
    }

}
