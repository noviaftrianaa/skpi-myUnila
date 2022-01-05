<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class BentukPendidikanController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/agama",
     *      operationId="getBentukPendidikan",
     *      tags={"Referensi"},
     *      summary="Get list of projects",
     *      description="Returns list of projects",
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
    public function agama(Request $request)
    {
        $listdata = DB::table('ref.agama')->select('id_bp','nm_bp','a_jenj_paud','a_jenj_tk','a_jenj_sd','a_jenj_smp','a_jenj_sma','a_jenj_tinggi','dir_bina','a_aktif')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_bp' => $each_data->id_bp,
                'nm_bp' => $each_data->nm_bp,
                'a_jenj_paud' => $each_data->a_jenj_paud,
                'a_jenj_tk' => $each_data->a_jenj_tk,
                'a_jenj_sd' => $each_data->a_jenj_sd,
                'a_jenj_smp' => $each_data->a_jenj_smp,
                'a_jenj_sma' => $each_data->a_jenj_sma,
                'a_jenj_tinggi' => $each_data->a_jenj_tinggi,
                'dir_bina' => $each_data->dir_bina,
                'a_aktif' => $each_data->a_aktif
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
