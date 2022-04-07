<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule as ValidationRule;

class MataKuliahController extends Controller
{
    public function listMatkul(Request $request)
    {
        $currentPage = $request->input('page', 1);
        $itemsPerPage = $request->input('item', 50);
        $idProdi = $request->input('idProdi', NULL);

        InputValidator(
            ['idProdi' => 'regex:/^[a-zA-Z0-9\-\(\)\s]+$/',],
            ['idProdi.regex' => 'input harus berupa campuran alpa_numeric dan dash',]
        );

        if (!empty($itemsPerPage)) {
            if ($itemsPerPage > 50) {
                $itemsPerPage = 50;
            }
        }

        $query = DB::SELECT("
            DECLARE @PageNumber AS INT
            DECLARE @RowsOfPage AS INT
            SET @PageNumber= ?
            SET @RowsOfPage= ?
            SELECT
                mk.id_mk,
                mk.kode_mk,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                mk.nm_mk,
                mk.sks_mk,
                CASE
                    WHEN mk.jns_mk = 'A' THEN 'Wajib'
                    WHEN mk.jns_mk = 'B' THEN 'Pilihan'
                    WHEN mk.jns_mk = 'C' THEN 'Wajib peminatan'
                    WHEN mk.jns_mk = 'D' THEN 'Pilihan peminatan'
                    WHEN mk.jns_mk = 'S' THEN 'Tugas'
                END AS status,
                mk.tgl_mulai_efektif,
                mk.create_date AS waktu_data_ditambahkan,
                mk.last_update AS terakhir_diubah
            FROM
                pdrd.matkul AS mk WITH(NOLOCK)
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = mk.id_sms
                AND sms.id_sms = '". $idProdi ."'
                AND sms.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE
                mk.tgl_mulai_efektif IS NOT NULL
                AND mk.soft_delete = 0
            ORDER BY
                mk.nm_mk ASC
            OFFSET (@PageNumber-1)*@RowsOfPage ROWS
            FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$currentPage, $itemsPerPage]);

        // $query = DB::connection('sqlsrv_live')->select($query);

        $data = [];
        foreach ($query as $each_data) {
            $data[] = [
                'id_mk' => $each_data->id_mk,
                'nm_prodi' => $each_data->nm_prodi,
                'kode_mk' => $each_data->kode_mk,
                'nm_mk' => $each_data->nm_mk,
                'sks_mk' => $each_data->sks_mk,
                'status' => $each_data->status,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
            ];
        }

        if (empty($data)) {
            return WrapResponse([], "Data tidak ditemukan", FALSE);
        }

        return WrapResponse(compact('currentPage', 'itemsPerPage', 'data'), 'Berhasil mengambil data list mata kuliah');
    }

    public function listKelas(Request $request)
    {
        $currentPage = $request->input('page', 1);
        $itemsPerPage = $request->input('item', 50);
        $idProdi = $request->input('idProdi', NULL);

        InputValidator(
            ['idProdi' => 'regex:/^[a-zA-Z0-9\-\(\)\s]+$/',],
            ['idProdi.regex' => 'input harus berupa campuran alpa_numeric dan dash',]
        );

        $query = DB::SELECT("
            DECLARE @PageNumber AS INT
            DECLARE @RowsOfPage AS INT
            SET @PageNumber= ?
            SET @RowsOfPage= ?
            SELECT
                kk.id_kls,
                smt.nm_smt,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                kk.nm_kls,
                mk.kode_mk,
                mk.nm_mk,
                mk.sks_mk,
                CASE
                    WHEN mk.jns_mk = 'A' THEN 'Wajib'
                    WHEN mk.jns_mk = 'B' THEN 'Pilihan'
                    WHEN mk.jns_mk = 'C' THEN 'Wajib peminatan'
                    WHEN mk.jns_mk = 'D' THEN 'Pilihan peminatan'
                    WHEN mk.jns_mk = 'S' THEN 'Tugas'
                END AS status,
                kk.create_date AS waktu_data_ditambahkan,
                kk.last_update AS terakhir_diubah
            FROM
                pdrd.kelas_kuliah AS kk WITH(NOLOCK)
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = kk.id_sms
                AND sms.id_sms = '54BBD27B-2376-4CAE-9951-76EF54BD2CA2'
                AND sms.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                LEFT JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = kk.id_mk
                AND mk.soft_delete = 0
                JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = kk.id_smt
                AND smt.expired_date IS NULL
            WHERE
                kk.soft_delete = 0
            ORDER BY
                mk.nm_mk ASC
            OFFSET (@PageNumber-1)*@RowsOfPage ROWS
            FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$currentPage, $itemsPerPage]);

        // $query = DB::connection('sqlsrv_live')->select($query);

        $data = [];
        foreach ($query as $each_data) {
            $data[] = [
                'id_kls' => $each_data->id_kls,
                'nm_smt' => $each_data->nm_smt,
                'nm_prodi' => $each_data->nm_prodi,
                'nm_kls' => $each_data->nm_kls,
                'kode_mk' => $each_data->kode_mk,
                'nm_mk' => $each_data->nm_mk,
                'sks_mk' => $each_data->sks_mk,
                'status' => $each_data->status,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
            ];
        }

        if (empty($data)) {
            return WrapResponse([], "Data tidak ditemukan", FALSE);
        }

        return WrapResponse(compact('currentPage', 'itemsPerPage', 'data'), 'Berhasil mengambil data list kelas');
    }
}
