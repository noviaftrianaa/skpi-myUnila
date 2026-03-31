<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PembicaraController extends Controller
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
                    p.id_pembicara,
                    s.nm_sdm,
                    kg.nm_kat,
                    kcl.nm_kat_capaian,
                    l.judul_litabmas,
                    p.judul_makalah,
                    p.nm_temu_ilmiah,
                    p.penyelenggara,
                    p.tgl_laks,
                    p.bahasa,
                    p.sk_tugas,
                    p.tgl_sk_tugas,
                    p.create_date,
                    p.last_update
                FROM
                    pdrd.pembicara AS p WITH(NOLOCK)
                    JOIN pdrd.sdm AS s WITH(NOLOCK) ON p.id_sdm = s.id_sdm
                    JOIN ref.kategori_kegiatan AS kg WITH(NOLOCK) ON p.id_katgiat = kg.id_katgiat
                    LEFT JOIN ref.kategori_capaian_luaran AS kcl WITH(NOLOCK) ON p.id_kat_capaian = kcl.id_kat_capaian
                    LEFT JOIN pdrd.litabmas AS l WITH(NOLOCK) ON p.id_litabmas = l.id_litabmas
                WHERE
                    p.soft_delete = 0
                ORDER BY
                    p.id_pembicara $sort
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
                    'id_pembicara' => $value->id_pembicara,
                    'nama_dosen' => $value->nm_sdm,
                    'nama_kategori_kegiatan' => $value->nm_kat,
                    'nama_kategori_capaian' => $value->nm_kat_capaian,
                    'judul_litabmas' => $value->judul_litabmas,
                    'judul_makalah' => $value->judul_makalah,
                    'nama_temu_ilmiah' => $value->nm_temu_ilmiah,
                    'penyelenggara' => $value->penyelenggara,
                    'tgl_laks' => $value->tgl_laks,
                    'bahasa' => $value->bahasa,
                    'sk_tugas' => $value->sk_tugas,
                    'tgl_sk_tugas' => $value->tgl_sk_tugas,
                    'tgl_dibuat' => $value->create_date,
                    'tgl_diupdate' => $value->last_update,
                ];
            }

        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar pembicara', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar pembicara', TRUE);
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
                    p.id_pembicara,
                    s.id_sdm,
                    s.nm_sdm,
                    kg.nm_kat,
                    kcl.nm_kat_capaian,
                    l.judul_litabmas,
                    p.judul_makalah,
                    p.nm_temu_ilmiah,
                    p.penyelenggara,
                    p.tgl_laks,
                    p.bahasa,
                    p.sk_tugas,
                    p.tgl_sk_tugas,
                    p.create_date,
                    p.last_update
                FROM
                    pdrd.pembicara AS p WITH(NOLOCK)
                    JOIN pdrd.sdm AS s WITH(NOLOCK) ON p.id_sdm = s.id_sdm
                    JOIN ref.kategori_kegiatan AS kg WITH(NOLOCK) ON p.id_katgiat = kg.id_katgiat
                    LEFT JOIN ref.kategori_capaian_luaran AS kcl WITH(NOLOCK) ON p.id_kat_capaian = kcl.id_kat_capaian
                    LEFT JOIN pdrd.litabmas AS l WITH(NOLOCK) ON p.id_litabmas = l.id_litabmas
                WHERE
                    p.soft_delete = 0
                    AND p.id_sdm = '$id_sdm'
                ORDER BY
                    p.id_pembicara $sort
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
                    'id_pembicara' => $value->id_pembicara,
                    'id_dosen' => $value->id_sdm,
                    'nama_dosen' => $value->nm_sdm,
                    'nama_kategori_kegiatan' => $value->nm_kat,
                    'nama_kategori_capaian' => $value->nm_kat_capaian,
                    'judul_litabmas' => $value->judul_litabmas,
                    'judul_makalah' => $value->judul_makalah,
                    'nama_temu_ilmiah' => $value->nm_temu_ilmiah,
                    'penyelenggara' => $value->penyelenggara,
                    'tgl_laks' => $value->tgl_laks,
                    'bahasa' => $value->bahasa,
                    'sk_tugas' => $value->sk_tugas,
                    'tgl_sk_tugas' => $value->tgl_sk_tugas,
                    'tgl_dibuat' => $value->create_date,
                    'tgl_diupdate' => $value->last_update,
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar pembicara', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar pembicara', TRUE);
    }
}
