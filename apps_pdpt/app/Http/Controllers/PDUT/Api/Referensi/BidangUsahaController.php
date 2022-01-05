<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BidangUsahaController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/bidang_usaha",
     *      operationId="getBidangUsaha",
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
    public function bidang_usaha(Request $request)
    {
        $listdata = DB::table('ref.bidang_usaha')->select('id_bu','nm_bu')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_bu'  => $each_data->id_bu,
                'nm_bu'  => $each_data->nm_bu,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
