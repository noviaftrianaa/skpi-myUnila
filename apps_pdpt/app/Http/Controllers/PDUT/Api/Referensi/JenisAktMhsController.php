<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JenisAktMhsController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/jenis_akt_mhs",
     *      operationId="getJenisAktMhs",
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
    public function jenis_akt_mhs(Request $request)
    {
        $listdata = DB::table('ref.jenis_akt_mhs')->select('id_jns_akt_mhs','nm_jns_akt_mhs','ket_jns_akt_mhs','a_kegiatan_kampus_merdeka')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_akt_mhs'  => $each_data->id_jns_akt_mhs,
                'nm_jns_akt_mhs'  => $each_data->nm_jns_akt_mhs,
                'ket_jns_akt_mhs'  => $each_data->ket_jns_akt_mhs,
                'a_kegiatan_kampus_merdeka'  => $each_data->a_kegiatan_kampus_merdeka,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
