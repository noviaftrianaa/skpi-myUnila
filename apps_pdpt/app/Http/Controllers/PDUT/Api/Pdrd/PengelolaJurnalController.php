<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PengelolaJurnalController extends Controller
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
                    pj.id_kelola_jurnal,
                    s.nm_sdm,
                    kg.nm_kat,
                    mp.nm_media_pub,
                    sp.nm_lemb,
                    pj.peran,
                    pj.sk_tugas,
                    pj.tmt_sk_tugas,
                    pj.tst_sk_tugas,
                    pj.create_date,
                    pj.last_update
                FROM
                    pdrd.pengelola_jurnal AS pj WITH(NOLOCK)
                    JOIN pdrd.sdm AS s WITH(NOLOCK) ON pj.id_sdm = s.id_sdm
                    JOIN ref.kategori_kegiatan AS kg WITH(NOLOCK) ON pj.id_katgiat = kg.id_katgiat
                    JOIN ref.media_publikasi AS mp WITH(NOLOCK) ON pj.id_media_pub = mp.id_media_pub
                    JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON mp.id_sp = sp.id_sp
                WHERE
                    pj.soft_delete = 0
                ORDER BY
                    pj.create_date $sort
            ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $datas = DB::select($query);
            if (empty($datas)) {
                return WrapResponse(['data' => null], 'tidak ada daftar pengelola jurnal yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($datas as $value) {
                $data[] = [
                    'id_pengelola_jurnal' => $value->id_kelola_jurnal,
                    'nama_dosen' => $value->nm_sdm,
                    'nama_media_publikasi' => $value->nm_media_pub,
                    'nama_kategori_kegiatan' => $value->nm_kat,
                    'instansi' => $value->nm_lemb,
                    'peran' => $value->peran,
                    'sk_tugas' => $value->sk_tugas,
                    'tmt_sk_tugas' => $value->tmt_sk_tugas,
                    'tst_sk_tugas' => $value->tst_sk_tugas,
                    'tgl_dibuat' => $value->create_date,
                    'tgl_diupdate' => $value->last_update,
                ];
            }

        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar pengelola jurnal', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar pengelola jurnal', TRUE);
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
                    pj.id_kelola_jurnal,
                    s.id_sdm,
                    s.nm_sdm,
                    kg.nm_kat,
                    mp.nm_media_pub,
                    sp.nm_lemb,
                    pj.peran,
                    pj.sk_tugas,
                    pj.tmt_sk_tugas,
                    pj.tst_sk_tugas,
                    pj.create_date,
                    pj.last_update
                FROM
                    pdrd.pengelola_jurnal AS pj WITH(NOLOCK)
                    JOIN pdrd.sdm AS s WITH(NOLOCK) ON pj.id_sdm = s.id_sdm
                    JOIN ref.kategori_kegiatan AS kg WITH(NOLOCK) ON pj.id_katgiat = kg.id_katgiat
                    JOIN ref.media_publikasi AS mp WITH(NOLOCK) ON pj.id_media_pub = mp.id_media_pub
                    JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON mp.id_sp = sp.id_sp
                WHERE
                    pj.soft_delete = 0
                    AND pj.id_sdm = '$id_sdm'
                ORDER BY
                    pj.create_date $sort
            ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $datas = DB::select($query);
            if (empty($datas)) {
                return WrapResponse(['data' => null], 'tidak ada daftar pengelola jurnal yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($datas as $value) {
                $data[] = [
                    'id_pengelola_jurnal' => $value->id_kelola_jurnal,
                    'id_dosen' => $value->id_sdm,
                    'nama_dosen' => $value->nm_sdm,
                    'nama_media_publikasi' => $value->nm_media_pub,
                    'nama_kategori_kegiatan' => $value->nm_kat,
                    'instansi' => $value->nm_lemb,
                    'peran' => $value->peran,
                    'sk_tugas' => $value->sk_tugas,
                    'tmt_sk_tugas' => $value->tmt_sk_tugas,
                    'tst_sk_tugas' => $value->tst_sk_tugas,
                    'tgl_dibuat' => $value->create_date,
                    'tgl_diupdate' => $value->last_update,
                ];
            }

        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar pengelola jurnal', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar pengelola jurnal', TRUE);
    }
}
