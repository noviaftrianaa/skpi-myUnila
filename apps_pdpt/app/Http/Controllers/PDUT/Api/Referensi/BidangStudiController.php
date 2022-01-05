<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BidangStudiController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/bidang_studi",
     *      operationId="getBidangStudi",
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
    public function bidang_studi(Request $request)
    {
        $listdata = DB::table('ref.bidang_studi')->select('id_bid_studi', 'id_induk_bidang_studi', 'kode_bid_studi', 'nm_bid_studi', 'a_kel', 'a_jenj_paud', 'a_jenj_tk', 'a_jenj_sd', 'a_jenj_smp', 'a_jenj_sma', 'a_jenj_tinggi')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_bid_studi' => $each_data->id_bid_studi,
                'id_induk_bidang_studi' => $each_data->id_induk_bidang_studi,
                'kode_bid_studi' => $each_data->kode_bid_studi,
                'nm_bid_studi' => $each_data->nm_bid_studi,
                'a_kel' => $each_data->a_kel,
                'a_jenj_paud' => $each_data->a_jenj_paud,
                'a_jenj_tk' => $each_data->a_jenj_tk,
                'a_jenj_sd' => $each_data->a_jenj_sd,
                'a_jenj_smp' => $each_data->a_jenj_smp,
                'a_jenj_sma' => $each_data->a_jenj_sma,
                'a_jenj_tinggi' => $each_data->a_jenj_tinggi
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
