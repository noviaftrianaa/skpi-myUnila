<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JenisPublikasiController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/negara",
     *      operationId="getNegara",
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
    public function getJenisPublikasi(Request $request)
    {
        $listdata = DB::table('ref.jenis_publikasi')->select('id-jns-pub','nm_jns_pub','a_pub_prestasi')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_pub'  => $each_data->id_jns_pub,
                'nm_jns_pub'  => $each_data->nm_jns_pub,
                'a_pub_prestasi'  => $each_data->a_pub_prestasi,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
