<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MahasiswaController extends Controller
{
        /**
     * @OA\Get(
     *      path="/pdrd/mahasiswa/list",
     *      operationId="getListMahasiswa",
     *      tags={"Mahasiwa"},
     *      summary="Dapatkan daftar Mahasiswa",
     *      description="Menampilkan daftar data Mahasiswa",
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      ),
     *      security={{"bearer_token":{}}}
     *     )
     */
    public function list()
    {
        $listdata = DB::SELECT("
            SELECT
                pd.id_pd,
                pd.nm_pd, pd.jk,
                pd.id_stat_mhs,
                reg.nipd AS npm,
                smt.id_thn_ajaran AS angkatan,
                kuliah.id_stat_mhs AS status_sekarang,
                CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
            JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_semester_masuk
                AND smt.expired_date IS NULL
            JOIN pdrd.kuliah_mhs AS kuliah WITH(NOLOCK) ON kuliah.id_reg_pd = reg.id_reg_pd
                AND kuliah.soft_delete = 0 AND kuliah.id_smt = 20211
                AND kuliah.id_stat_mhs = 'A'
            JOIN pdrd.sms AS sms WITH(NOLOCK) ON  sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE pd.soft_delete = 0
        ");

        // foreach ($listdata as $each_data) {
        //     $data[] = [
        //         'id_pd' => $each_data->id_pd,
        //         'nm_pd' => $each_data->nm_pd,
        //         'id_stat_mhs' => $each_data->id_stat_mhs,
        //         'npm' => $each_data->npm,
        //         'status_sekarang' => $each_data->status_sekarang,
        //         'nm_prodi' => $each_data->nm_prodi,
        //     ];
        // }

        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $listdata
        ]);
    }
}
