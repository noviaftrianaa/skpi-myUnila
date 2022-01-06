<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GelarAkademikController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/gelar_akademik",
     *      operationId="getGelarAkademik",
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
    public function gelar_akademik(Request $request)
    {
        $listdata = DB::table('ref.gelar_akademik')->select('id_gelar_akad','singkat_gelar','nm_gelar_akad','posisi_gelar')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_gelar_akad'  => $each_data->id_gelar_akad,
                'singkat_gelar'  => $each_data->singkat_gelar,
                'nm_gelar_akad'  => $each_data->nm_gelar_akad,
                'posisi_gelar'  => $each_data->posisi_gelar,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
