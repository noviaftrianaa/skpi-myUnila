<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\VisitingScientist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class VisitingScientistController extends Controller
{
    protected $request;
    protected $visiting_scientist;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->visiting_scientist = new VisitingScientist();
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
                    vs.id_visit,
                    s.nm_sdm,
                    kg.nm_kat,
                    sp.nm_lemb,
                    vs.kegiatan_penting,
                    vs.tgl_laks,
                    vs.sk_tugas,
                    vs.tgl_sk_tugas,
                    vs.create_date,
                    vs.last_update
                FROM
                    pdrd.visiting_scientist AS vs WITH(NOLOCK)
                    JOIN pdrd.sdm AS s WITH(NOLOCK) ON vs.id_sdm = s.id_sdm
                    JOIN ref.kategori_kegiatan AS kg WITH(NOLOCK) ON vs.id_katgiat = kg.id_katgiat
                    LEFT JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON vs.id_sp = sp.id_sp
                WHERE
                    vs.soft_delete = 0
                ORDER BY
                    vs.id_visit $sort
            ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $datas = DB::select($query);
            if (empty($datas)) {
                return WrapResponse(['data' => null], 'tidak ada daftar visiting scientist yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($datas as $value) {
                $data[] = [
                    'id_visit' => $value->id_visit,
                    'nm_dosen' => $value->nm_sdm,
                    'nm_kategori_kegiatan' => $value->nm_kat,
                    'instansi' => $value->nm_lemb,
                    'kegiatan_penting' => $value->kegiatan_penting,
                    'tgl_pelaksanaan' => $value->tgl_laks,
                    'sk_tugas' => $value->sk_tugas,
                    'tgl_sk_tugas' => $value->tgl_sk_tugas,
                    'tgl_dibuat' => $value->create_date,
                    'tgl_diupdate' => $value->last_update,
                ];
            }

        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar visiting scientist', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar visiting scientist', TRUE);
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
                    vs.id_visit,
                    vs.id_sdm,
                    s.nm_sdm,
                    kg.nm_kat,
                    sp.nm_lemb,
                    vs.kegiatan_penting,
                    vs.tgl_laks,
                    vs.sk_tugas,
                    vs.tgl_sk_tugas,
                    vs.create_date,
                    vs.last_update
                FROM
                    pdrd.visiting_scientist AS vs WITH(NOLOCK)
                    JOIN pdrd.sdm AS s WITH(NOLOCK) ON vs.id_sdm = s.id_sdm
                    JOIN ref.kategori_kegiatan AS kg WITH(NOLOCK) ON vs.id_katgiat = kg.id_katgiat
                    LEFT JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON vs.id_sp = sp.id_sp
                WHERE
                    vs.soft_delete = 0
                    AND vs.id_sdm = '$id_sdm'
                ORDER BY
                    vs.id_visit $sort
            ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $datas = DB::select($query);
            if (empty($datas)) {
                return WrapResponse(['data' => null], 'tidak ada daftar visiting scientist yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($datas as $value) {
                $data[] = [
                    'id_visit' => $value->id_visit,
                    'id_sdm' => $value->id_sdm,
                    'nm_dosen' => $value->nm_sdm,
                    'nm_kategori_kegiatan' => $value->nm_kat,
                    'instansi' => $value->nm_lemb,
                    'kegiatan_penting' => $value->kegiatan_penting,
                    'tgl_pelaksanaan' => $value->tgl_laks,
                    'sk_tugas' => $value->sk_tugas,
                    'tgl_sk_tugas' => $value->tgl_sk_tugas,
                    'tgl_dibuat' => $value->create_date,
                    'tgl_diupdate' => $value->last_update,
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar visiting scientist', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar visiting scientist', TRUE);
    }
}
