<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

use Illuminate\Http\Response;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;
use App\Transformers\JadwalKelasTransformer;

class SatuanPendidikanController extends Controller
{
    protected $request;
    protected $wrapResponse;

    public function __construct()
    {
        $this->sanitizeRequest();

        $this->wrapResponse = new WrapResponse;
    }

    public function index()
    {

        InputValidator([
            'page' => 'numeric|min:1',
            'count' => 'numeric|min:1|max:50'
        ]);

        $query = "
            SELECT
                sp.id_sp,
                sp.nm_lemb,
                sp.nm_singkat,
                sp.nss,
                sp.npsn,
                sp.jln,
                sp.id_wil,
                sp.create_date AS waktu_data_ditambahkan,
                sp.last_update AS terakhir_diubah
            FROM
                pdrd.satuan_pendidikan AS sp WITH(NOLOCK)
            WHERE
                sp.soft_delete = 0
            ORDER BY
                sp.nm_lemb ASC";

        // $result = DB::connection('sqlsrv_live')->select($query);
        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError('tidak ada daftar satuan pendidikan yang ditampilkan')
                ->render();
        }

        return $this->wrapResponse
            // ->setTransformer(new JadwalKelasTransformer, __FUNCTION__)
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->setMessage('Sukses mendapatkan daftar satuan pendidikan')
            ->withSimplePagination()
            ->render($result->query());
    }
}
