<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JenisDokumenController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/agama",
     *      operationId="getJenisDokumen",
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
        $listdata = DB::table('ref.agama')->select('id_jns_dok','nm_jns_dok')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_dok'  => $each_data->id_jns_dok,
                'nm_jns_dok'  => $each_data->nm_jns_dok,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
