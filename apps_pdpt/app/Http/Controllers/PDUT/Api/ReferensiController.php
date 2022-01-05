<?php

namespace App\Http\Controllers\PDUT\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReferensiController extends Controller
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
    public function negara(Request $request)
    {
        $listdata = DB::table('ref.negara')->select('id_negara','nm_negara')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_negara'  => $each_data->id_negara,
                'nama_negara'  => $each_data->nm_negara,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    /**
     * @OA\Get(
     *      path="/referensi/wilayah",
     *      operationId="getWilayah",
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
    public function wilayah(Request $request)
    {
        return 'a';
    }

    /**
     * @OA\Get(
     *      path="/referensi/bentuk_pendidikan",
     *      operationId="getBentukPendidikan",
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
    public function bentuk_pendidikan(Request $request)
    {
        $listData = DB::table('ref.bentuk_pendidikan')
            ->select('id_bp','nm_bp')
            ->whereNull('expired_date')
            ->get();
        foreach ($listData AS $each_data) {
            $data[] = [
                'id_bentuk_pendidikan'  => $each_data->id_bp,
                'nama_bentuk_pendidikan'  => $each_data->nm_bp,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

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
        $listData = DB::table('ref.agama')
            ->select('id_agama','nm_agama')
            ->whereNull('expired_date')
            ->get();
        foreach ($listData AS $each_data) {
            $data[] = [
                'id_agama'  => $each_data->id_agama,
                'nama_agama'  => $each_data->nm_agama,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
