<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JalurDaftarController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/jalur_daftar",
     *      operationId="getJalurDaftar",
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
    public function jalur_daftar(Request $request)
    {
        $listdata = DB::table('ref.jalur_daftar')->select('id_jalur_daftar','nm_jalur_daftar')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jalur_daftar'  => $each_data->id_jalur_daftar,
                'nm_jalur_daftar'  => $each_data->nm_jalur_daftar,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
