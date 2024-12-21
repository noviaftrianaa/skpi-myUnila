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
        $thn = $request->has("tahun") ? $request->tahun : get_tahun_keaktifan();
        $role = session()->get("login.role");
        $unit = UnitOrganisasi::find($role->id_organisasi);
        $token = cek_token_siakadu();
        $select_unit = '';

        if ($unit->id_jns_lemb == 24) {
            $sms = SMS::find($unit->id_organisasi);
            $judul = "Kelas Program Studi " . $sms->nm_lemb . " (" . $sms->jenjang->nm_jenj_didik . ")";
            $jns_unit = 'P';
            $id_sms = $sms->id_sms;
        } elseif ($unit->id_jns_lemb == 28) {
            $sms = SMS::find($unit->id_organisasi);
            $judul = "Kelas Kuliah Jurusan " . $sms->nm_lemb;
            $jns_unit = 'J';
            $id_sms = $sms->id_sms;
        } elseif ($unit->id_jns_lemb == 23) {
            $sms = SMS::find($unit->id_organisasi);
            $judul = "Kelas Kuliah Fakultas " . $sms->nm_lemb;
            $jns_unit = 'F';
            $id_sms = $sms->id_sms;
        } else {
            $sp = SatuanPendidikan::find(env("APP_ID_SP"));
            $judul = "Kelas Kuliah " . $sp->nm_lemb;
            $jns_unit = '';
            $id_sms = '';
        }

        // Mendapatkan daftar semester
        $ta_list = Semester::select('id_smt', 'nm_smt')
            ->where('id_smt', '>=', 20191)
            ->where('tgl_mulai', '<', date('Y-m-d'))
            ->whereNull('expired_date')
            ->where('smt', '!=', 3)
            ->orderBy('id_smt', 'DESC')
            ->pluck('nm_smt', 'id_smt')
            ->toArray();

        return view(
            "content.main.perkuliahan.kelaskuliah.index",
            compact("ta_list", "thn", "judul", "unit", "select_unit", "jns_unit", "id_sms")
        );
    }

    public function list(Request $request)
    {
        $token = cek_token_siakadu();
        $page = 1;
        $page_size = 99999999999;
        $id_semester = $request->input('id_semester');
        $jns_unit = $request->input('jns_unit');
        $id_sms = $request->input('id_sms');
        $search = $request->input('search');

        // Mencari id_unit siakad
        $id_units = getSiakadUnits($jns_unit, $id_sms);

        // Ambil data dari API
        $mergedResponse = [];

        // Inisialisasi query dasar
        $query = "page=" . $page . "&page_size=" . $page_size;

        // Tambahkan parameter id_semester jika ada
        if (!empty($id_semester)) {
            $query .= "&id_semester=" . $id_semester;
        }

        if (empty($jns_unit)) {
            // Jika $jns_unit kosong, gunakan query tanpa id_unit
            $response = curlApiSiakadu('GET', $this->url . '/kelas/list?' . $query, null, $token);

            if (isset($response['success']) && $response['success']) {
                $mergedResponse = $response['payload'];
            }
        } else {
            // Jika $jns_unit tidak kosong, proses unit-unit yang ada
            foreach ($id_units as $id_unit) {
                $queryWithUnit = $query . "&id_unit=" . $id_unit;

                // Panggil API untuk setiap unit
                $response = curlApiSiakadu('GET', $this->url . '/kelas/list?' . $queryWithUnit, null, $token);

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
