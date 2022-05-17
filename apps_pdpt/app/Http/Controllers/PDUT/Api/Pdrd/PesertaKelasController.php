<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\Nilai;
use App\Models\PDUT\Pdrd\NilaiSmtMhs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule as ValidationRule;

class PesertaKelasController extends Controller
{
    protected $request;
    protected $kelasKuliah;
    protected $nilaiMhs;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->kelasKuliah = new KelasKuliah();
        $this->nilaiMhs = new NilaiSmtMhs();
    }

    public function index()
    {
        $idProdi = $this->request->input('idProdi', NULL);
        InputValidator([
            'page' => 'numeric|min:1',
            'count' => 'numeric|min:1|max:50',
            ['idProdi' => 'regex:/^[a-zA-Z0-9\-\(\)\s]+$/',],
            ['idProdi.regex' => 'input harus berupa campuran alpa_numeric dan dash',]
        ]);

        DB::beginTransaction();
        try {
            $query = "
            SELECT
                kk.id_kls,
                smt.nm_smt,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                kk.nm_kls,
                mk.kode_mk,
                mk.nm_mk,
                mk.sks_mk,
                CASE
                    WHEN mk.jns_mk = 'A' THEN 'Wajib'
                    WHEN mk.jns_mk = 'B' THEN 'Pilihan'
                    WHEN mk.jns_mk = 'C' THEN 'Wajib peminatan'
                    WHEN mk.jns_mk = 'D' THEN 'Pilihan peminatan'
                    WHEN mk.jns_mk = 'S' THEN 'Tugas'
                END AS status,
                kk.create_date AS waktu_data_ditambahkan,
                kk.last_update AS terakhir_diubah
            FROM
                pdrd.kelas_kuliah AS kk WITH(NOLOCK)
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = kk.id_sms
                AND sms.id_sms = '" . $idProdi . "'
                AND sms.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                LEFT JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = kk.id_mk
                AND mk.soft_delete = 0
                JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = kk.id_smt
                AND smt.expired_date IS NULL
            WHERE
                kk.soft_delete = 0
            ORDER BY
                mk.nm_mk ASC ";

            // $query = DB::connection('sqlsrv_live')->select($query);
            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $page = $pagination['page'];
            $item = $pagination['limit'];

            $kelas = DB::select($query);
            if (empty($kelas)) {
                return WrapResponse(['data' => null], 'tidak ada daftar kelas yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($query as $each_data) {
                $data[] = [
                    'id_kls' => $each_data->id_kls,
                    'nm_smt' => $each_data->nm_smt,
                    'nm_prodi' => $each_data->nm_prodi,
                    'nm_kls' => $each_data->nm_kls,
                    'kode_mk' => $each_data->kode_mk,
                    'nm_mk' => $each_data->nm_mk,
                    'sks_mk' => $each_data->sks_mk,
                    'status' => $each_data->status,
                    'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                    'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
                ];
            }

        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar kelas', FALSE);
        }
        return WrapResponse(['currentPage' => $page, 'itemsPerPage' => $item, 'data' => $data], 'daftar mata kuliah', TRUE);
    }
}
