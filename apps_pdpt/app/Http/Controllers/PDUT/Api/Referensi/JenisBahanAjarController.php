<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JenisBahanAjarController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/jenis_bahan_ajar",
     *      operationId="getJenisBahanAjar",
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
    public function jenis_bahan_ajar(Request $request)
    {
        $listdata = DB::table('ref.jenis_bahan_ajar')->select('id_jns_bhn_ajar','nm_jns_bhn_ajar')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_bhn_ajar'  => $each_data->id_jns_bhn_ajar,
                'nm_jns_bhn_ajar'  => $each_data->nm_jns_bhn_ajar,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
