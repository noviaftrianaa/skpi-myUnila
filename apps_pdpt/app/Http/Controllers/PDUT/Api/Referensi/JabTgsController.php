<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JabTgsController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/jab_tgs",
     *      operationId="getJabTgs",
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
    public function jab_tgs(Request $request)
    {
        $listdata = DB::table('ref.jab_tgs')->select('id_jab_tgs','id_kel_prof','nm_jab_tgs','a_jab_utama_sek','a_jab_utama_pt','a_jab_utama_lpnk','a_jab_utama_lpk','jml_jam_diakui')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jab_tgs'  => $each_data->id_jab_tgs,
                'id_kel_prof'  => $each_data->id_kel_prof,
                'nm_jab_tgs'  => $each_data->nm_jab_tgs,
                'a_jab_utama_sek'  => $each_data->a_jab_utama_sek,
                'a_jab_utama_pt'  => $each_data->a_jab_utama_pt,
                'a_jab_utama_lpnk'  => $each_data->a_jab_utama_lpnk,
                'a_jab_utama_lpk'  => $each_data->a_jab_utama_lpk,
                'jml_jam_diakui'  => $each_data->jml_jam_diakui,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
