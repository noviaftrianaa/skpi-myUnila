<?php

namespace App\Http\Controllers\PDUT\Api\Sarpras;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Sarpras\AlatLong;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;
use Illuminate\Http\Response;

class AlatLongController extends Controller
{
    protected $request;
    protected $alatLong;
    protected $wrapResponse;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->alatLong = new AlatLong();
        $this->wrapResponse = new WrapResponse;
    }

    public function daftar()
    {
        InputValidator([
            'sortby' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'numeric',
            'count' => 'numeric'
        ]);

        $sortby = $this->request->input('sortby');
        if (empty($sortby)) {
            $sortby = 'DESC';
        }

        $query = "
            SELECT
                along.id_alat,
                along.id_smt,
                semes.nm_smt,
                along.jml_laik,
                along.jml_tidak_laik
            FROM
                sarpras.alat_long AS along WITH(NOLOCK)
                LEFT JOIN ref.semester AS semes WITH(NOLOCK) ON along.id_smt = semes.id_smt
                AND semes.expired_date IS NULL
            WHERE
                along.soft_delete = 0
            ORDER BY
                semes.id_smt ".$sortby;

        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError(['query' => 'tidak ada daftar alat long yang ditampilkan'])
                ->render();
        }

        return $this->wrapResponse
            // ->setTransformer(new AlatTransformer, __FUNCTION__)
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->withPagination($result->pagination())
            ->render($result->query());
    }

    public function tambah()
    {
    }

    public function ubah()
    {
    }

    public function hapus()
    {
    }
}
