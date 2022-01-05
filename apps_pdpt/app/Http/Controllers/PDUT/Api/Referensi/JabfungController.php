<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JabfungController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/jabfung",
     *      operationId="getJabfung",
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
    public function jabfung(Request $request)
    {
        $listdata = DB::table('ref.jabfung')->select('id_jabfung','id_kel_prof','nm_jabfung','angka_kredit')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jabfung'  => $each_data->id_jabfung,
                'id_kel_prof'  => $each_data->id_kel_prof,
                'nm_jabfung'  => $each_data->nm_jabfung,
                'angka_kredit'  => $each_data->angka_kredit,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
