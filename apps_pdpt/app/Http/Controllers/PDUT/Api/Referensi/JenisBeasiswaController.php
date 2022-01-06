<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JenisBeasiswaController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/jenis_beasiswa",
     *      operationId="getJenisBeasiswa",
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
    public function jenis_beasiswa(Request $request)
    {
        $listdata = DB::table('ref.jenis_beasiswa')->select('id_jns_beasiswa','id_sumber_dana','nm_jns_beasiswa','u_pd','u_ptk','u_non_ca','kat_beasiswa')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_beasiswa'  => $each_data->id_jns_beasiswa,
                'id_sumber_dana'  => $each_data->id_sumber_dana,
                'nm_jns_beasiswa'  => $each_data->nm_jns_beasiswa,
                'u_pd'  => $each_data->u_pd,
                'u_ptk'  => $each_data->u_ptk,
                'u_non_ca'  => $each_data->u_non_ca,
                'kat_beasiswa'  => $each_data->kat_beasiswa,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
