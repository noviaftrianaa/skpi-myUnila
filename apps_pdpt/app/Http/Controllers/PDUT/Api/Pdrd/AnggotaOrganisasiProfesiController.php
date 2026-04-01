<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AnggotaOrganisasiProfesiController extends Controller
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
                    aop.id_ang_orgprof,
                    s.nm_sdm,
                    kg.nm_kat,
                    aop.nm_org,
                    aop.peran,
                    aop.mulai_anggota,
                    aop.selesai_anggota,
                    aop.instansi_profesi,
                    aop.create_date,
                    aop.last_update
                FROM
                    pdrd.anggota_orgprof AS aop WITH(NOLOCK)
                    JOIN pdrd.sdm AS s WITH(NOLOCK) ON aop.id_sdm = s.id_sdm
                    JOIN ref.kategori_kegiatan AS kg WITH(NOLOCK) ON aop.id_katgiat = kg.id_katgiat
                WHERE
                    aop.soft_delete = 0
                ORDER BY
                    aop.create_date " . $sort . "
            ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $datas = DB::select($query);
            if (empty($datas)) {
                return WrapResponse(['data' => null], 'tidak ada daftar anggota organisasi profesi yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($datas as $value) {
                $data[] = [
                    'id_anggota_orgprof' => $value->id_ang_orgprof,
                    'nm_dosen' => $value->nm_sdm,
                    'nm_kategori_kegiatan' => $value->nm_kat,
                    'nm_organisasi_profesi' => $value->nm_org,
                    'peran' => $value->peran,
                    'tgl_mulai' => $value->mulai_anggota,
                    'tgl_selesai' => $value->selesai_anggota,
                    'instansi_profesi' => $value->instansi_profesi,
                    'tgl_dibuat' => $value->create_date,
                    'tgl_diupdate' => $value->last_update,
                ];
            }

        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar anggota organisasi profesi', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar anggota organisasi profesi', TRUE);
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
                    aop.id_ang_orgprof,
                    s.id_sdm,
                    s.nm_sdm,
                    kg.nm_kat,
                    aop.nm_org,
                    aop.peran,
                    aop.mulai_anggota,
                    aop.selesai_anggota,
                    aop.instansi_profesi,
                    aop.create_date,
                    aop.last_update
                FROM
                    pdrd.anggota_orgprof AS aop WITH(NOLOCK)
                    JOIN pdrd.sdm AS s WITH(NOLOCK) ON aop.id_sdm = s.id_sdm
                    JOIN ref.kategori_kegiatan AS kg WITH(NOLOCK) ON aop.id_katgiat = kg.id_katgiat
                WHERE
                    aop.soft_delete = 0
                    AND aop.id_sdm = '$id_sdm'
                ORDER BY
                    aop.create_date $sort
            ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];
            $datas = DB::select($query);
            if (empty($datas)) {
                return WrapResponse(['data' => null], 'tidak ada daftar anggota organisasi profesi yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($datas as $value) {
                $data[] = [
                    'id_anggota_orgprof' => $value->id_ang_orgprof,
                    'id_dosen' => $value->id_sdm,
                    'nm_dosen' => $value->nm_sdm,
                    'nm_kategori_kegiatan' => $value->nm_kat,
                    'nm_organisasi_profesi' => $value->nm_org,
                    'peran' => $value->peran,
                    'tgl_mulai' => $value->mulai_anggota,
                    'tgl_selesai' => $value->selesai_anggota,
                    'instansi_profesi' => $value->instansi_profesi,
                    'tgl_dibuat' => $value->create_date,
                    'tgl_diupdate' => $value->last_update,
                ];
            }

        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar anggota organisasi profesi', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar anggota organisasi profesi', TRUE);
    }
}
