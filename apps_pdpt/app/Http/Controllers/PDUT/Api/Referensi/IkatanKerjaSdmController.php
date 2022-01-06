<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class IkatanKerjaSdmController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/ikatan_kerja_sdm",
     *      operationId="getIkatanKerjaSdm",
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
    public function ikatan_kerja_sdm(Request $request)
    {
        $listdata = DB::table('ref.ikatan_kerja_sdm')->select('id_ikatan_kerja','nm_ikatan_kerja','ket_ikatan_kerja')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_ikatan_kerja'  => $each_data->id_ikatan_kerja,
                'nm_ikatan_kerja'  => $each_data->nm_ikatan_kerja,
                'ket_ikatan_kerja'  => $each_data->ket_ikatan_kerja,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
