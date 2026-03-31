<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class DetaseringController extends Controller
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
                    d.id_detasering,
                    s.nm_sdm,
                    kg.nm_kat,
                    spsumber.nm_lemb AS nm_lemb_sumber,
                    sptujuan.nm_lemb AS nm_lemb_sasaran,
                    d.tgl_mulai,
                    d.tgl_selesai,
                    d.desk_keg,
                    d.sk_tugas,
                    d.tgl_sk_tugas,
                    d.create_date,
                    d.last_update
                FROM
                    pdrd.detasering AS d WITH(NOLOCK)
                    JOIN pdrd.sdm AS s WITH(NOLOCK) ON d.id_sdm = s.id_sdm
                    JOIN ref.kategori_kegiatan AS kg WITH(NOLOCK) ON d.id_katgiat = kg.id_katgiat
                    LEFT JOIN pdrd.satuan_pendidikan AS spsumber WITH(NOLOCK) ON d.id_sp_sumber = spsumber.id_sp
                    LEFT JOIN pdrd.satuan_pendidikan AS sptujuan WITH(NOLOCK) ON d.id_sp_sasaran = sptujuan.id_sp
                WHERE
                    d.soft_delete = 0
                ORDER BY
                    d.id_detasering $sort
            ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $datas = DB::select($query);
            if (empty($datas)) {
                return WrapResponse(['data' => null], 'tidak ada daftar detasering yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($datas as $value) {
                $data[] = [
                    'id_detasering' => $value->id_detasering,
                    'nm_dosen' => $value->nm_sdm,
                    'nm_kategori_kegiatan' => $value->nm_kat,
                    'instansi_sumber' => $value->nm_lemb_sumber,
                    'instansi_sasaran' => $value->nm_lemb_sasaran,
                    'tgl_mulai' => $value->tgl_mulai,
                    'tgl_selesai' => $value->tgl_selesai,
                    'deskripsi' => $value->desk_keg,
                    'sk_tugas' => $value->sk_tugas,
                    'tgl_sk_tugas' => $value->tgl_sk_tugas,
                    'tgl_dibuat' => $value->create_date,
                    'tgl_diupdate' => $value->last_update,
                ];
            }

        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar detasering', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar detasering', TRUE);
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
                    d.id_detasering,
                    d.id_sdm,
                    s.nm_sdm,
                    kg.nm_kat,
                    spsumber.nm_lemb AS nm_lemb_sumber,
                    sptujuan.nm_lemb AS nm_lemb_sasaran,
                    d.tgl_mulai,
                    d.tgl_selesai,
                    d.desk_keg,
                    d.sk_tugas,
                    d.tgl_sk_tugas,
                    d.create_date,
                    d.last_update
                FROM
                    pdrd.detasering AS d WITH(NOLOCK)
                    JOIN pdrd.sdm AS s WITH(NOLOCK) ON d.id_sdm = s.id_sdm
                    JOIN ref.kategori_kegiatan AS kg WITH(NOLOCK) ON d.id_katgiat = kg.id_katgiat
                    LEFT JOIN pdrd.satuan_pendidikan AS spsumber WITH(NOLOCK) ON d.id_sp_sumber = spsumber.id_sp
                    LEFT JOIN pdrd.satuan_pendidikan AS sptujuan WITH(NOLOCK) ON d.id_sp_sasaran = sptujuan.id_sp
                WHERE
                    d.soft_delete = 0
                    AND d.id_sdm = '$id_sdm'
                ORDER BY
                    d.id_detasering $sort
            ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $datas = DB::select($query);
            if (empty($datas)) {
                return WrapResponse(['data' => null], 'tidak ada daftar detasering yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($datas as $value) {
                $data[] = [
                    'id_detasering' => $value->id_detasering,
                    'id_sdm' => $value->id_sdm,
                    'nm_dosen' => $value->nm_sdm,
                    'nm_kategori_kegiatan' => $value->nm_kat,
                    'instansi_sumber' => $value->nm_lemb_sumber,
                    'instansi_sasaran' => $value->nm_lemb_sasaran,
                    'tgl_mulai' => $value->tgl_mulai,
                    'tgl_selesai' => $value->tgl_selesai,
                    'deskripsi' => $value->desk_keg,
                    'sk_tugas' => $value->sk_tugas,
                    'tgl_sk_tugas' => $value->tgl_sk_tugas,
                    'tgl_dibuat' => $value->create_date,
                    'tgl_diupdate' => $value->last_update,
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar detasering', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar detasering', TRUE);
    }
}
