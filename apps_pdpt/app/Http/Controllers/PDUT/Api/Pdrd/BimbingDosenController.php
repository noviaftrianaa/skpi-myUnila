<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class BimbingDosenController extends Controller
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
                    bd.id_bimbing_dosen,
                    kg.nm_kat,
                    bd.tgl_mulai,
                    bd.tgl_selesai,
                    bd.bid_ahli_pembimbing,
                    bd.bid_ahli_bimbingan,
                    bd.desk_kegiatan,
                    bd.sk_tugas,
                    bd.tgl_sk_tugas,
                    bd.create_date,
                    bd.last_update
                FROM
                    pdrd.bimbing_dosen AS bd WITH(NOLOCK)
                    JOIN ref.kategori_kegiatan AS kg WITH(NOLOCK) ON bd.id_katgiat = kg.id_katgiat
                WHERE
                    bd.soft_delete = 0
                ORDER BY
                    bd.id_bimbing_dosen $sort
            ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $datas = DB::select($query);
            if (empty($datas)) {
                return WrapResponse(['data' => null], 'tidak ada daftar bimbing dosen yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($datas as $value) {
                $data[] = [
                    'id_bimbing_dosen' => $value->id_bimbing_dosen,
                    'kategori_kegiatan' => $value->nm_kat,
                    'tgl_mulai' => $value->tgl_mulai,
                    'tgl_selesai' => $value->tgl_selesai,
                    'bidang_ahli_pembimbing' => $value->bid_ahli_pembimbing,
                    'bidang_ahli_bimbingan' => $value->bid_ahli_bimbingan,
                    'deskripsi_kegiatan' => $value->desk_kegiatan,
                    'sk_tugas' => $value->sk_tugas,
                    'tgl_sk_tugas' => $value->tgl_sk_tugas,
                    'tgl_dibuat' => $value->create_date,
                    'tgl_diupdate' => $value->last_update,
                ];
            }

        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar bimbing dosen', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar bimbing dosen', TRUE);
    }
}
