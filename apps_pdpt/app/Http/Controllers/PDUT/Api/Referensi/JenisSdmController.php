<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JenisSdmController extends Controller
{
   
        /**
         * @OA\Get(
         *      path="/referensi/",
         *      operationId="get",
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
            $listdata = DB::table('ref.jenis_sdm')->select(
                'id_jenis_sdm','nm_jns_sdm','a_guru_kelas','a_guru_mapel',
                'a_guru_bk','a_guru_inklusi','a_pengawasan_sp','a_pengawasan_plb',
                'a_pengawasan_bid','a_tas','a_formal','a_dosen','a_penelitian','a_perekayasa',
                'a_pranata_1','a_pranata_2','a_pranata_3','a_pranata_4','a_pranata_5','a_pranata_6',
                'a_pranata_7','a_pranata_8','a_pranata_9','Create_date','last_update','expired_date','last_sync')->get();
            foreach ($listdata AS $each_data) {
                $data[] = [
                    'id_jns_sdm'  => $each_data->id_jns_sdm,
                    'nm_jns_sdm'  => $each_data->nm_jns_sdm,
                    'a_guru_kelas'  => $each_data->a_guru_kelas,
                    'a_guru_mapel'  => $each_data->a_guru_mapel,
                    'a_guru_bk'  => $each_data->a_guru_bk,
                    'a_guru_inklusi'  => $each_data->a_guru_inklusi,
                    'a_pengawasan_sp'  => $each_data->a_pengawasan_sp,
                    'a_pengawasan_plb'  => $each_data->a_pengawasan_plb,
                    'a_pengawasan_bid'  => $each_data->a_pengawasan_bid,
                    'a_tas'  => $each_data->a_tas,
                    'a_formal'  => $each_data->a_formal,
                    'a_dosen'  => $each_data->a_dosen,
                    'a_penelitian'  => $each_data->a_penelitian,
                    'a_perekayasa'  => $each_data->a_perekayasa,
                    'a_pranata_1'  => $each_data->a_pranata_1,
                    'a_pranata_2'  => $each_data->a_pranata_2,
                    'a_pranata_3'  => $each_data->a_pranata_3,
                    'a_pranata_4'  => $each_data->a_pranata_4,
                    'a_pranata_5'  => $each_data->a_pranata_5,
                    'a_pranata_6'  => $each_data->a_pranata_6,
                    'a_pranata_7'  => $each_data->a_pranata_7,
                    'a_pranata_8'  => $each_data->a_pranata_8,
                    'a_pranata_9'  => $each_data->a_pranata_9,
                    'Create_date'  => $each_data->Create_date,
                    'last_update'  => $each_data->last_update,
                    'expired_date'  => $each_data->expired_date,
                    'last_sync'  => $each_data->last_sync,
                ];
            }
            return response()->json([
                'status' => true,
                'message'=> 'success',
                'data'  => $data
            ]);
        }
    }

