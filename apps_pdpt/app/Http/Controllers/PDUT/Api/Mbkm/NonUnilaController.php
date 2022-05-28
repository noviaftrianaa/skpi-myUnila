<?php

namespace App\Http\Controllers\PDUT\Api\Mbkm;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\SatuanPendidikan;
use App\Models\PDUT\Pdrd\Sms;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

use Illuminate\Http\Response;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;

class NonUnilaController extends Controller
{
    protected $request;
    protected $satuanPendidikan;
    protected $sms;
    protected $wrapResponse;

    public function __construct()
    {
        $this->sanitizeRequest();

        $this->satuanPendidikan = new SatuanPendidikan();
        $this->sms = new Sms();
        $this->wrapResponse = new WrapResponse;
    }

    public function cariPt()
    {
        $nmPt = $this->request->input('nmPt', NULL);
        InputValidator([
            'nmPt' => 'required'
        ]);

        $query = "
            SELECT
                sp.id_sp,
                sp.nm_lemb,
                sp.create_date AS waktu_data_ditambahkan,
                sp.last_update AS terakhir_diubah
            FROM
                pdrd.satuan_pendidikan AS sp WITH(NOLOCK)
            WHERE
                sp.nm_lemb LIKE '%" . $nmPt . "%'
                AND sp.soft_delete = 0
            ORDER BY
                sp.nm_lemb ASC
        ";

        // $result = DB::connection('sqlsrv_live')->select($query);
        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError('tidak ada daftar perguruan tinggi yang ditampilkan')
                ->render();
        }

        return $this->wrapResponse
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->render($result->query());
    }

    public function cariProdi()
    {
        $nmProdi = $this->request->input('nmProdi', NULL);
        InputValidator([
            'nmProdi' => 'required'
        ]);

        $query = "
            SELECT
                sms.id_sms,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                sms.create_date AS waktu_data_ditambahkan,
                sms.last_update AS terakhir_diubah
            FROM
                pdrd.sms AS sms WITH(NOLOCK)
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE
                sms.nm_lemb LIKE '%" . $nmProdi . "%'
                AND sms.id_jns_sms = 3
                AND sms.soft_delete = 0
            ORDER BY
                sms.nm_lemb ASC
        ";

        // $result = DB::connection('sqlsrv_live')->select($query);
        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError('tidak ada daftar prodi yang ditampilkan')
                ->render();
        }

        return $this->wrapResponse
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->render($result->query());
    }

    // cari mahasiswa non unila
    public function cariMhs()
    {
        $nim = $this->request->input('nim', NULL);
        InputValidator([
            'nim' => 'required'
        ]);

        $query = "
            SELECT
                *
            FROM
                pdrd.reg_pd AS reg WITH(NOLOCK)
            WHERE
                reg.nipd = '" .$nim. "'
                AND reg.soft_delete = 0
        ";

        $result = DB::select($query);
        // $result = DB::connection('sqlsrv_live')->select($query);
        if (empty($result)) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError('tidak ada profil mahasiswa yang ditampilkan')
                ->render();
        }

        $data = [];
            foreach ($result as $each_data) {
                $data[] = [
                    'nipd' => $each_data->nipd,
                    'id_pd' => $each_data->id_pd
                ];
            }

        return $this->wrapResponse
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->render($data);
    }


}
