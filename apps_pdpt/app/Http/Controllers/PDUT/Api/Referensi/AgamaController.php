<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class AgamaController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/agama",
     *      operationId="getAgama",
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
        $listdata = DB::table('ref.agama')->select('id_agama','nm_agama')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_agama'  => $each_data->id_agama,
                'nm_agama'  => $each_data->nm_agama,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
