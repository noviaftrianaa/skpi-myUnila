<?php

namespace App\Http\Controllers\PDUT\pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AkreditasiProdiController extends Controller
{
   /**
     * @OA\Get(
     *      path="/referensi/wilayah",
     *      operationId="getWilayah",
     *      tags={"Referensi"},
     *      summary="Dapatkan daftar Wilayah",
     *      description="Menampilkan daftar data Wilayah",
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
        $listdata = DB::table('pdrd.akreditasi_prodi')->select('id_akreditasi_prodi', 'id_sms', 'id_lemb_akred', 'id_akred', 'sk_akreditasi_prodi', 'tanggal_sk_akreditasi_prodi', 'tst_sk_akreditasi_prodi', 'asal_data')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_akreditasi_prodi' => $each_data->id_akreditasi_prodi,
                'id_sms' => $each_data->id_sms,
                'id_lemb_akred' => $each_data->id_lemb_akred,
                'id_akred' => $each_data->id_akred,
                'sk_akreditasi_prodi' => $each_data->sk_akreditas_prodi,
                'tanggal_sk_akreditasi_prodi' => $each_data->tanggal_sk_akreditasi_prodi,
                'tst_sk_akreditasi_prodi' => $each_data->tst_sk_akreditasi_prodi,
                'asal-data' => $each_data->asal_data,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
}