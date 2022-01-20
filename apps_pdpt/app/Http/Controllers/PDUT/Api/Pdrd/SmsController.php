<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SmsController extends Controller
{
    /**
     * @OA\Get(
     *      path="/sms/list",
     *      operationId="getSms",
     *      tags={"Kelembagaan"},
     *      summary="Dapatkan daftar Sms",
     *      description="Menampilkan daftar data Sms",
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
    public function index(Request $request)
    {
        $listdata = DB::SELECT("
            SELECT 	
                sms.id_sms,
                sms.nm_lemb,
                sms.smt_mulai,
                sms.kode_prodi,
                sms.no_tel,
                sms.no_fax,
                sms.email,
                sms.tgl_berdiri,
                sms.sk_selenggara,
                sms.tgl_sk_selenggara,
                sms.sks_lulus,
                sms.gelar_lulusan,
                sms.stat_prodi,
                jp.id_jenj_didik AS id_jenj_didik,
                js.id_jns_sms AS id_jns_sms,
                wil.id_wil AS id_wil,
                jur.id_jur AS id_jur,
                sms.id_induk_sms AS id_induk_sms
            FROM
                pdrd.sms AS sms WITH(NOLOCK)
                JOIN ref.jenjang_pendidikan AS jp ON jp.id_jenj_didik = sms.id_jenj_didik
                AND jp.expired_date IS NULL
                JOIN ref.jenis_sms AS js ON js.id_jns_sms = sms.id_jns_sms
                AND js.expired_date IS NULL
                JOIN ref.wilayah AS wil ON wil.id_wil = sms.id_wil
                AND wil.expired_date IS NULL
                JOIN ref.jurusan AS jur ON jur.id_jur = sms.id_jur
                AND jur.expired_date IS NULL
                
            WHERE
                sms.soft_delete = 0 
                ORDER BY sms.nm_lemb ASC
                ");

            foreach ($listdata as $each_data) {
                $data[] = [
                    'id_sms' => $each_data->id_sms,
                    'nm_lemb' => $each_data->nm_lemb,
                    'kode_prodi' => $each_data->kode_prodi,
                    'no_tel' => $each_data->no_tel,
                    'no_fax' => $each_data->no_fax,
                    'email' => $each_data->email,
                    'tgl_berdiri' => $each_data->tgl_berdiri,
                    'sk_selenggara' => $each_data->sk_selenggara,
                    'tgl_sk_selenggara' => $each_data->tgl_sk_selenggara,
                    'sks_lulus' => $each_data->sks_lulus,
                    'gelar_lulusan' => $each_data->gelar_lulusan,
                    'stat_prodi' => $each_data->stat_prodi,
                    'id_jenj_didik' => $each_data->id_jenj_didik,
                    'id_jns_sms' => $each_data->id_jns_sms,
                    'id_wil' => $each_data->id_wil,
                    'id_jur' => $each_data->id_jur,
                    'id_induk_sms' => $each_data->id_induk_sms,
                ];
            }
            return response()->json([
                'status' => true,
                'message' => 'success',
                'data'  => $listdata
        ]);
    }
}
