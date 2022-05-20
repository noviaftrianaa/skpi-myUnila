<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\KelasKuliah;
use App\Models\PDUT\Pdrd\NilaiSmtMhs;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

use Illuminate\Http\Response;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;
use App\Transformers\PesertaKelasTransformer;

class PesertaKelasController extends Controller
{
    protected $request;
    protected $kelasKuliah;
    protected $nilaiMhs;
    protected $wrapResponse;

    public function __construct()
    {
        $this->sanitizeRequest();

        $this->kelasKuliah = new KelasKuliah();
        $this->nilaiMhs = new NilaiSmtMhs();
        $this->wrapResponse = new WrapResponse;
    }

    public function index()
    {
        $idKelas = $this->request->input('idKelas', NULL);
        InputValidator([
            'page' => 'numeric|min:1',
            'count' => 'numeric|min:1|max:50',
            ['idKelas' => 'regex:/^[a-zA-Z0-9\-\(\)\s]+$/',],
            ['idKelas.regex' => 'input harus berupa campuran alpa_numeric dan dash',]
        ]);

        $query = "
                SELECT
                    kk.id_kls,
                    smt.nm_smt,
                    nilai.id_reg_pd,
                    reg.nipd,
                    pd.nm_pd,
                    nilai.nilai_angka,
                    nilai.nilai_huruf,
                    nilai.nilai_indeks,
                    CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                    kk.nm_kls,
                    mk.nm_mk,
                    mk.sks_mk,
                    mk.kode_mk,
                    nilai.create_date AS waktu_data_ditambahkan,
                    nilai.last_update AS terakhir_diubah
                FROM
                    pdrd.nilai_smt_mhs AS nilai WITH(NOLOCK)
                    LEFT JOIN pdrd.kelas_kuliah AS kk WITH(NOLOCK) ON kk.id_kls = nilai.id_kls
                    AND kk.soft_delete = 0
                    LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = kk.id_sms
                    AND sms.soft_delete = 0
                    JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                    AND jenjang.expired_date IS NULL
                    LEFT JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = kk.id_mk
                    AND mk.soft_delete = 0
                    JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = kk.id_smt
                    AND smt.expired_date IS NULL
                    JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_reg_pd = nilai.id_reg_pd
                    AND reg.soft_delete = 0
                    JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                WHERE
                    nilai.id_kls = '" . $idKelas . "'
                    AND nilai.soft_delete = 0
                ORDER BY
                    pd.nm_pd ASC
        ";

        // $result = DB::connection('sqlsrv_live')->select($query);
        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError('tidak ada daftar peserta kelas yang ditampilkan')
                ->render();
        }

        return $this->wrapResponse
            ->setTransformer(new PesertaKelasTransformer, __FUNCTION__)
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->withSimplePagination()
            ->render($result->query());

    }
}
