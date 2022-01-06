<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JenisDiklatController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/JenisDiklat",
     *      operationId="getJenisDiklat",
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
    public function JenisDiklat(Request $request)
    {
        $listdata = DB::table('ref.JenisDiklat')->select('id_jns_diklat','nm_jns_diklat','u_guru','u_dosen','u_tendik')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_diklat'  => $each_data->id_jns_diklat,
                'nm_jns_diklat'  => $each_data->nm_jns_diklat,
                'u_guru'  => $each_data->u_guru,
                'u_dosen'  => $each_data->u_dosen,
                'u_tendik'  => $each_data->u_tendik,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
