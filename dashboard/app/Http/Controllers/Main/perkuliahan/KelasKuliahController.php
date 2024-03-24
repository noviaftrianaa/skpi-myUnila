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

class KelasKuliahController extends Controller
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
        if ($request->has("tahun")) {
            $thn = $request->tahun;
        } else {
            $thn = get_tahun_keaktifan();
        }

        $select_unit = '';
        $role = session()->get("login.role");
        $unit = UnitOrganisasi::find($role->id_organisasi);
        if ($unit->id_jns_lemb == 24) {
            $sms = Sms::find($unit->id_organisasi);
            $ta_list = Semester::select('id_smt', 'nm_smt')
                ->where('id_smt', '>=', $sms->smt_mulai)
                ->where('tgl_mulai', '<', date('Y-m-d'))
                ->whereNull('expired_date')
                ->where('smt', '!=', 3)
                ->orderBy('id_smt', 'DESC')
                ->pluck('nm_smt', 'id_smt')
                ->toArray();

            $judul = "Kelas Program Studi " . $sms->nm_lemb . " (" . $sms->jenjang->nm_jenj_didik . ")";
            $jenj= JenjangPendidikan::find($sms->id_jenj_didik);
            $nm_lemb = $jenj->nm_jenj_didik .'-'.$sms->nm_lemb;
            $jns_unit = 'P';
            $list_prodi = $this->unitProdi($jns_unit);
            foreach( $list_prodi as $target){
                if(is_array($target)){
                  foreach($target as $index => $value){
                    if(strpos($target[$index], $nm_lemb) !== false){
                      $select_unit = $target[$index];
                    }
                  }
                }
              }
        } elseif ($unit->id_jns_lemb == 28) {
            $sms = Sms::find($unit->id_organisasi);
            $ta_list = Semester::select('id_smt', 'nm_smt')
                ->where('id_smt', '>=', 20191)
                ->where('tgl_mulai', '<', date('Y-m-d'))
                ->whereNull('expired_date')
                ->where('smt', '!=', 3)
                ->orderBy('id_smt', 'DESC')
                ->pluck('nm_smt', 'id_smt')
                ->toArray();

            $judul = "Kelas Kuliah Jurusan " . $sms->nm_lemb . " (" . $sms->jenjang->nm_jenj_didik . ")";
            $jenj= JenjangPendidikan::find($sms->id_jenj_didik);
            $nm_lemb = $jenj->nm_jenj_didik .'-'.$sms->nm_lemb;
            $jns_unit = 'J';
            $list_prodi = $this->unitProdi($jns_unit);
            foreach( $list_prodi as $target){
                if(is_array($target)){
                  foreach($target as $index => $value){
                    if(strpos($target[$index], $nm_lemb) !== false){
                      $select_unit = $target[$index];
                    }
                  }
                }
              }
        } elseif ($unit->id_jns_lemb == 23) {
            $sms = Sms::find($unit->id_organisasi);
            $ta_list = Semester::select('id_smt', 'nm_smt')
                ->where('id_smt', '>=', 20191)
                ->where('tgl_mulai', '<', date('Y-m-d'))
                ->whereNull('expired_date')
                ->where('smt', '!=', 3)
                ->orderBy('id_smt', 'DESC')
                ->pluck('nm_smt', 'id_smt')
                ->toArray();

            $judul = "Kelas Kuliah Fakultas " . $sms->nm_lemb . " (" . $sms->jenjang->nm_jenj_didik . ")";
            $jenj= JenjangPendidikan::find($sms->id_jenj_didik);
            $nm_lemb = $jenj->nm_jenj_didik .'-'.$sms->nm_lemb;
            $jns_unit = 'F';
            $list_prodi = $this->unitProdi($jns_unit);
            foreach( $list_prodi as $target){
                if(is_array($target)){
                  foreach($target as $index => $value){
                    if(strpos($target[$index], $nm_lemb) !== false){
                      $select_unit = $target[$index];
                    }
                  }
                }
              }
        } else {
            $sp = SatuanPendidikan::find(env("APP_ID_SP"));
            $token = cek_token_siakadu();
            $ta_list = Semester::select('id_smt', 'nm_smt')
            ->where('id_smt', '>=', 20191)
            ->where('tgl_mulai', '<', date('Y-m-d'))
            ->whereNull('expired_date')
            ->where('smt', '!=', 3)
            ->orderBy('id_smt', 'DESC')
            ->pluck('nm_smt', 'id_smt')
            ->toArray();

            $judul = "Kelas Kuliah " . $sp->nm_lemb;
            $jns_unit = '';
            $list_prodi = $this->unitProdi($jns_unit);
        }
        return view(
            "content.main.perkuliahan.kelaskuliah.index",
            compact("ta_list", "thn", "judul", "unit", "list_prodi", "select_unit")
        );
    }

    public function list(Request $request)
    {
        // dd($request->all());
        $token = cek_token_siakadu();
        $page = 1;
        $page_size = 99999999999;
        $id_semester = $request->input('id_semester');
        $id_unit = $request->input('id_unit');

        if(!is_null($id_semester) && !is_null($id_unit)){
            $query = "page=".$page."&page_size=".$page_size."&id_semester=".$id_semester."&id_unit=".$id_unit;
        }elseif(!is_null($id_semester)){
            $query = "page=".$page."&page_size=".$page_size."&id_semester=".$id_semester;
        }elseif(!is_null($id_semester)){
            $query = "page=".$page."&page_size=".$page_size."&id_unit=".$id_unit;
        }else{
            $query = "page=".$page."&page_size=".$page_size;
        }
        $response = curlApiSiakadu('GET', $this->url . '/kelas/list?'. $query, null, $token);

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
