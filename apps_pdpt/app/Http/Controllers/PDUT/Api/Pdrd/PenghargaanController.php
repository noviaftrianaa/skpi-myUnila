<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PenghargaanController extends Controller
{
    protected $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function daftar()
    {
        InputValidator([
            'page' => 'numeric|min:1',
            'limit'    => 'numeric|min:1|max:50',
            'sort_by' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ]);

        $sort = "ASC";
        $sort = $this->request->input('sort_by');

        if (!empty($sort)) {
            $sort = $sort;
        }

        try {

            $query = "
                SELECT
                    p.id_penghargaan,
                    s.nm_sdm,
                    kg.nm_kat,
                    jp.nm_jns_penghargaan,
                    tp.nm_tkt_penghargaan,
                    p.nm_penghargaan,
                    p.tgl_penghargaan,
                    p.thn_penghargaan,
                    p.instansi,
                    p.create_date,
                    p.last_update
                FROM
                    pdrd.penghargaan AS p WITH(NOLOCK)
                    JOIN pdrd.sdm AS s WITH(NOLOCK) ON p.id_sdm = s.id_sdm
                    JOIN ref.kategori_kegiatan AS kg WITH(NOLOCK) ON p.id_katgiat = kg.id_katgiat
                    JOIN ref.jenis_penghargaan AS jp WITH(NOLOCK) ON p.id_jns_penghargaan = jp.id_jns_penghargaan
                    JOIN ref.tingkat_penghargaan AS tp WITH(NOLOCK) ON p.id_tkt_penghargaan = tp.id_tkt_penghargaan
                WHERE
                    p.soft_delete = 0
                ORDER BY
                    p.create_date $sort
            ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $datas = DB::select($query);
            if (empty($datas)) {
                return WrapResponse(['data' => null], 'tidak ada daftar penghargaan yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($datas as $value) {
                $data[] = [
                    'id_penghargaan' => $value->id_penghargaan,
                    'nm_dosen' => $value->nm_sdm,
                    'nama_kategori_kegiatan' => $value->nm_kat,
                    'nama_jenis_penghargaan' => $value->nm_jns_penghargaan,
                    'nama_tingkat_penghargaan' => $value->nm_tkt_penghargaan,
                    'nama_penghargaan' => $value->nm_penghargaan,
                    'tgl_penghargaan' => $value->tgl_penghargaan,
                    'thn_penghargaan' => $value->thn_penghargaan,
                    'instansi' => $value->instansi,
                    'tgl_dibuat' => $value->create_date,
                    'tgl_diupdate' => $value->last_update,
                ];
            }

        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar penghargaan', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar penghargaan', TRUE);
    }

    public function daftar_id()
    {
        InputValidator([
            'id_sdm' => 'required|uuid',
            'page' => 'numeric|min:1',
            'limit'    => 'numeric|min:1|max:50',
            'sort_by' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ]);

        $sort = "ASC";
        $sort = $this->request->input('sort_by');
        $id_sdm = $this->request->input('id_sdm');

        if (!empty($sort)) {
            $sort = $sort;
        }

        try {

            $query = "
                SELECT
                    p.id_penghargaan,
                    s.id_sdm,
                    s.nm_sdm,
                    kg.nm_kat,
                    jp.nm_jns_penghargaan,
                    tp.nm_tkt_penghargaan,
                    p.nm_penghargaan,
                    p.tgl_penghargaan,
                    p.thn_penghargaan,
                    p.instansi,
                    p.create_date,
                    p.last_update
                FROM
                    pdrd.penghargaan AS p WITH(NOLOCK)
                    JOIN pdrd.sdm AS s WITH(NOLOCK) ON p.id_sdm = s.id_sdm
                    JOIN ref.kategori_kegiatan AS kg WITH(NOLOCK) ON p.id_katgiat = kg.id_katgiat
                    JOIN ref.jenis_penghargaan AS jp WITH(NOLOCK) ON p.id_jns_penghargaan = jp.id_jns_penghargaan
                    JOIN ref.tingkat_penghargaan AS tp WITH(NOLOCK) ON p.id_tkt_penghargaan = tp.id_tkt_penghargaan
                WHERE
                    p.soft_delete = 0
                    AND p.id_sdm = '$id_sdm'
                ORDER BY
                    p.create_date $sort
            ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $datas = DB::select($query);
            if (empty($datas)) {
                return WrapResponse(['data' => null], 'tidak ada daftar penghargaan yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($datas as $value) {
                $data[] = [
                    'id_penghargaan' => $value->id_penghargaan,
                    'id_dosen' => $value->id_sdm,
                    'nm_dosen' => $value->nm_sdm,
                    'nama_kategori_kegiatan' => $value->nm_kat,
                    'nama_jenis_penghargaan' => $value->nm_jns_penghargaan,
                    'nama_tingkat_penghargaan' => $value->nm_tkt_penghargaan,
                    'nama_penghargaan' => $value->nm_penghargaan,
                    'tgl_penghargaan' => $value->tgl_penghargaan,
                    'thn_penghargaan' => $value->thn_penghargaan,
                    'instansi' => $value->instansi,
                    'tgl_dibuat' => $value->create_date,
                    'tgl_diupdate' => $value->last_update,
                ];
            }

        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar penghargaan', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar penghargaan', TRUE);
    }
}
