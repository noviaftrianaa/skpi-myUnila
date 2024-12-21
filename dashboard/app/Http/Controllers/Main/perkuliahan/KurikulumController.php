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
use DB;

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
            $id_sms = $sms->id_sms;
            // $list_prodi = $this->unitProdi($jns_unit, $nm_lemb);
            // $select_unit = $list_prodi[0]['nm_unit'];

        } elseif ($unit->id_jns_lemb == 28) {
            $sms = Sms::find($unit->id_organisasi);
            $judul = "Kurikulum Jurusan " . $sms->nm_lemb;
            $nm_lemb = $sms->nm_lemb;
            $jns_unit = 'J';
            $id_sms = $sms->id_sms;
            // $list_prodi = $this->unitProdi($jns_unit, $nm_lemb);
            // $select_unit = $list_prodi[0]['nm_unit'];

        } elseif ($unit->id_jns_lemb == 23) {
            $sms = Sms::find($unit->id_organisasi);
            $judul = "Kurikulum Fakultas " . $sms->nm_lemb;
            $nm_lemb = $sms->nm_lemb;
            $jns_unit = 'F';
            $id_sms = $sms->id_sms;
            // $list_prodi = $this->unitProdi($jns_unit, $nm_lemb);
            // $select_unit = $list_prodi[0]['nm_unit'];

        } else {
            $sp = SatuanPendidikan::find(env("APP_ID_SP"));
            $judul = "Kurikulum " . $sp->nm_lemb;
            $jns_unit = '';
            $id_sms = '';
            // $list_prodi = $this->unitProdi($jns_unit, $select_unit);
        }

        return view(
            "content.main.perkuliahan.kurikulum.index",
            compact("ta_list", "thn", "judul", "unit", "select_unit", "jns_unit","id_sms")
        );
    }

    public function list(Request $request)
    {
        $token = cek_token_siakadu();
        $page = 1;
        $page_size = 99999999999;
        $thn_kurikulum = $request->input('thn_kurikulum');
        $jns_unit = $request->input('jns_unit');

        $id_sms = $request->input('id_sms');
        $search = $request->input('search');

        //mencari id_unit siakad
        $id_units = getSiakadUnits($jns_unit, $id_sms);

        // Ambil data dari API
        $mergedResponse = [];

        $query = "page=" . $page . "&page_size=" . $page_size . "&thn_kurikulum=" . $thn_kurikulum;

        // Tambahkan parameter thn_kurikulum jika ada
        if (!empty($thn_kurikulum)) {
            $query .= "&thn_kurikulum=" . $thn_kurikulum;
        }

        if (empty($jns_unit)) {
            // Jika $jns_unit kosong, gunakan query tanpa id_unit
            $response = curlApiSiakadu('GET', $this->url . '/kurikulum/list?' . $query, null, $token);

            if (isset($response['success']) && $response['success']) {
                $mergedResponse = $response['payload'];
            }
        } else {
            // Jika $jns_unit tidak kosong, proses unit-unit yang ada
            foreach ($id_units as $id_unit) {
                $queryWithUnit = $query . "&id_unit=" . $id_unit;

                // Panggil API untuk setiap unit
                $response = curlApiSiakadu('GET', $this->url . '/kurikulum/list?' . $queryWithUnit, null, $token);

                // Validasi respons dan payload sebelum digabungkan
                if (isset($response['success']) && $response['success']) {
                    if (!empty($response['payload']) && is_array($response['payload'])) {
                        // Gabungkan payload hanya jika tidak kosong
                        $mergedResponse = array_merge($mergedResponse, $response['payload']);
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $mergedResponse
        ]);

    }

}
