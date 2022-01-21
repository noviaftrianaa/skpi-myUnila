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
            sdm.nidn,
            sdm.nip,
            sdm.nm_sdm
        FROM
            pdrd.sdm AS sdm
            LEFT JOIN ref.jenis_sdm AS jsdm ON jsdm.id_jns_sdm = sdm.id_jns_sdm
            LEFT JOIN ref.negara AS ngr ON ngr.id_negara = sdm.kewarganegaraan
            LEFT JOIN ref.wilayah AS wil ON wil.id_wil = sdm.id_wil
            LEFT JOIN ref.status_keaktifan_pegawai AS aktf ON aktf.id_stat_aktif = sdm.id_stat_aktif
            LEFT JOIN ref.agama AS agm ON agm.id_agama = sdm.id_agama
            LEFT JOIN ref.keahlian_lab AS khlb ON khlb.id_keahlian_lab = sdm.id_keahlian_lab
            LEFT JOIN ref.pekerjaan AS pkrj ON pkrj.id_pekerjaan = sdm.id_pekerjaan_suami_istri
            LEFT JOIN ref.lembaga_pengangkat AS lpeng ON lpeng.id_lemb_angkat = sdm.id_lemb_angkat
        WHERE
            sdm.id_jns_sdm = 12
        ORDER BY
            sdm.nm_sdm ".$sortby."
        OFFSET (@PageNumber -1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$page, $count]);

        // foreach ($buku_ajar as $each_data) {
        //     $data[] = [
        //         'id_tulis_buku_ajar' => $each_data->id_tulis_buku_ajar,
        //         'id_buku_ajar' => $each_data->id_buku_ajar,
        //         'judul_buku' => $each_data->judul_buku,
        //         'isbn' => $each_data->isbn,
        //         'tanggal_terbit' => $each_data->tgl_terbit,
        //         'penerbit' => $each_data->penerbit,
        //         'rubrik_bkd' => null,
        //         'waktu_data_ditambahkan' => $each_data->create_date,
        //         'terakhir_diubah' => $each_data->last_update
        //     ];
        // }

        return response()->json([
            'success' => true,
            'message' => 'Get all data Buku Ajar',
            'page' => $page,
            'count' => $count,
            'data'  => $dosen
        ], 200);
    }
    public function detail(Request $request)
    {
        # code...
    }
}
