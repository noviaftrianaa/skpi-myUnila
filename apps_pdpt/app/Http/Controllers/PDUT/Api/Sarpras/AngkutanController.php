<?php

namespace App\Http\Controllers\PDUT\Api\Sarpras;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Sarpras\Angkutan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;
use Illuminate\Http\Response;

class AngkutanController extends Controller
{
    protected $request;
    protected $angkutan;
    protected $wrapResponse;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->angkutan = new Angkutan();
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
                altrans.id_alat_transport,
                altrans.nm_alat_transport
            FROM
                sarpras.alat_transportasi AS altrans WITH(NOLOCK)
            WHERE
                altrans.soft_delete = 0
            ORDER BY
                altrans.nm_alat_transport " . $sortby;

        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError(['query' => 'tidak ada daftar angkutan yang ditampilkan'])
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
