<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SdmDosenController extends Controller
{
    public function list(Request $request)
    {
        $page = 1;
        $count = 10;
        $sortby = "ASC";

        if (!empty($request->sortby)) {
            $sortby = $request->sortby;
        }
        if (!empty($request->page)) {
            $page = $request->page;
        }
        if (!empty($request->count)) {
            if ($request->count > 50) {
                $count = 50;
            } else {
                $count = $request->count;
            }
        }

        $dosen = DB::select("
        DECLARE @PageNumber AS INT DECLARE @RowsOfPage AS INT
        SET
            @PageNumber = ?
        SET
            @RowsOfPage = ?
            SELECT
            sdm.id_sdm,
            sdm.nm_sdm,
            sdm.jk,
            sdm.nidn,
            sdm.nip,
            aktf.nm_stat_aktif,
            skep.nm_stat_pegawai,
            jsdm.nm_jns_sdm
        FROM
            pdrd.sdm AS sdm
            JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm = sdm.id_sdm
            AND ptk.soft_delete = 0
            AND ptk.id_jns_keluar IS NULL
            AND (
                ptk.tgl_ptk_keluar IS NULL
                OR ptk.tgl_ptk_keluar > GETDATE()
            )
            JOIN ref.status_kepegawaian AS skep ON skep.id_stat_pegawai = ptk.id_stat_pegawai
            JOIN pdrd.keaktifan_ptk AS aktfptk ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
            AND aktfptk.soft_delete = 0
            AND aktfptk.a_sp_homebase = 1
            AND aktfptk.id_thn_ajaran = '".get_tahun_keaktifan()."'
            LEFT JOIN ref.jenis_sdm AS jsdm ON jsdm.id_jns_sdm = sdm.id_jns_sdm
            LEFT JOIN ref.status_keaktifan_pegawai AS aktf ON aktf.id_stat_aktif = sdm.id_stat_aktif
        WHERE
            sdm.id_jns_sdm = 13
        ORDER BY
            sdm.nm_sdm ".$sortby."
        OFFSET (@PageNumber -1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$page, $count]);

        foreach ($dosen as $each_data) {
                $data[] = [
                    'id_sdm' => $each_data->id_sdm,
                    'nama_sdm' => $each_data->nm_sdm,
                    'nidn' => $each_data->nidn,
                    'nip' => $each_data->nip,
                    'nama_status_aktif' => $each_data->nm_stat_aktif,
                    'nama_status_pegawai' => $each_data->nm_stat_pegawai,
                    'jenis_sdm' => $each_data->nm_jns_sdm
                ];
        }
        return WrapResponse(['page' => $page, 'count' => $count, 'data' => $data], 'Daftar Buku Ajar By All', TRUE);

    }
    public function detail(Request $request)
    {
        # code...
    }
}
