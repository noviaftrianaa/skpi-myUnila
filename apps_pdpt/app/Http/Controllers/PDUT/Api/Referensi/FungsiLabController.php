<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FungsiLabController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/fungsi_lab",
     *      operationId="getFungsiLab",
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
    public function fungsi_lab(Request $request)
    {
        $listdata = DB::table('ref.fungsi_lab')->select('id_fungsi_lab','nm_fungsi_lab')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_fungsi_lab'  => $each_data->id_fungsi_lab,
                'nm_fungsi_lab'  => $each_data->nm_fungsi_lab,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
