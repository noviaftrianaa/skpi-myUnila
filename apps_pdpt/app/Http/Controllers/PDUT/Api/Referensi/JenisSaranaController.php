<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JenisSaranaController extends Controller
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
        public function getJenisSarana(Request $request)
        {
            $listdata = DB::table('ref.jenis_sarana')->select('id_jns_sarana','nm_jns_sarana','kel','a_penempatan','ket')->get();
            foreach ($listdata AS $each_data) {
                $data[] = [
                    'id_jns_sarana'  => $each_data->id_jns_sarana,
                    'nm_jns_sarana'  => $each_data->nm_jns_sarana,
                    'kel'  => $each_data->kel,
                    'a_penempatan'  => $each_data->a_penempatan,
                    'ket'  => $each_data->ket,
                ];
            }
            return response()->json([
                'status' => true,
                'message'=> 'success',
                'data'  => $data
            ]);
        }
    }

