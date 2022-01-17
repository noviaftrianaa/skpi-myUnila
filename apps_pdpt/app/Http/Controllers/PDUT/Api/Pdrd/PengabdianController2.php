<?php

namespace App\Http\Controllers\PDUT\API\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class PengabdianController extends Controller
{
      /**
     * @OA\Get(
     *      path="/pdrd/pengabdian/list",
     *      operationId="getListPengabdian",
     *      tags={"Mahasiwa"},
     *      summary="Dapatkan daftar Pengabdian",
     *      description="Menampilkan daftar data Pengabdian",
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
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $listdata = DB::SELECT("
        SELECT 
            TOP 50 lm.judul_litabmas AS judul_penelitian, 
            lm.id_kel_bidang AS bidang_keilmuan, 
            CONCAT((lm.id_thn_laks - 1),'/',lm.id_thn_laks) AS tahun_pelaksanaan,
            lm.lama_kegiatan AS lama_kegiatan,
            sal.stat_aktif AS status_keaktifan

        FROM 
            pdrd.litabmas AS lm  
            JOIN pdrd.sdm_anggota_litabmas AS sal ON sal.id_litabmas = lm.id_litabmas 
            AND sal.id_katgiat IN ('130201','130202','130203','130204','130401','130402','130403')
            AND sal.soft_delete = 0 
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm = sal.id_sdm 
            AND sdm.soft_delete = 0 
            AND sdm.id_sdm = 'bcb6de9a-2e7c-43c7-b192-029750754fe7'

        WHERE lm.soft_delete = 0
        ");


        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $array = $request->all();
        $sum = Litabmas::get()->count();

        $store = Litabmas::create([
            'id_peran'=>$uuid,
            'nm_peran'=>$array['nm_peran'],
            'a_perlu_sk'=>$array['a_perlu_sk'],
            'tgl_create'=>currDateTime(),
            'last_update'=>currDateTime(),
            'last_sync'=>currDateTime()
        ]);

        if(!$store) {
            alert()->error('Data gagal disimpan!');
        } else {
            alert()->success('Data berhasil disimpan!');
        }
        return redirect()->back();
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
