<?php

namespace App\Http\Controllers\PDUT\Api\Tracer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PDUT\Tracer\HasilTracerStudy;
use App\Models\PDUT\Tracer\HasilTracerAtasan;

class TracerStudyController extends Controller
{
     /**
     * @OA\Get(
     *      path="/hasil_tracer_study/",
     *      operationId="getTracerStudy",
     *      tags={"Tracer Study"},
     *      summary="Data hasil Tracer Study",
     *      description="Menampilkan Hasil TracerStudy",
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
                tc_study.id_thn_ajaran,
                tc_study.id_reg_pd,
                tc_study.id_smt,
                tc_study.wkt_pengisian,
                tc_study.wkt_tunggu,
                tc_study.status_lulusan,
                tc_study.jns_tmpt_bekerja,
                tc_study.nm_tmpt_bekerja,
                tc_study.income_per_bln,
                wilayah.nm_wil,
                reg.nipd AS npm,
                CONCAT(sms.nm_lemb, '(',jenjang.nm_jenj_didik,')')  AS nm_prodi
            FROM tracer.hasil_tracer_study AS tc_study WITH(NOLOCK)
            JOIN ref.wilayah AS wilayah WITH(NOLOCK) ON wilayah.id_wil = tc_study.id_wil
                AND wilayah.expired_date IS NULL
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_reg_pd = tc_study.id_reg_pd
                AND reg.soft_delete = 0
            JOIN pdrd.sms AS sms WITH(NOLOCK) ON  sms.id_sms = reg.id_sms
                AND reg.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE tc_study.soft_delete = 0;
        ");

        foreach ($listdata as $each_data) {
            $data[] = [
                'id_thn_ajaran' => $each_data->id_thn_ajaran,
                'id_reg_pd' => $each_data->id_reg_pd,
                'id_smt' => $each_data->id_smt,
                'wkt_pengisian' => $each_data->wkt_pengisian,
                'wkt_tunggu' => $each_data->wkt_tunggu,
                'status_lulusan' => $each_data->status_lulusan,
                'jns_tmpt_bekerja' => $each_data->jns_tmpt_bekerja,
                'nm_wil' => $each_data->nm_wil,
                'income_per_bln' => $each_data->income_per_bln,
                'npm' => $each_data->npm,
            ];
        }

        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $listdata
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

            /**
     * @OA\Post(
     *      path="/hasil_tracer_study/simpan",
     *      operationId="postTracerStudy",
     *      tags={"Tracer Study"},
     *      summary="Simpan hasil Tracer Study",
     *      description="Menampilkan daftar data TracerStudy",
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
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // $data = DB::table('tracer.hasil_tracer_study')->insert([
            $data = HasilTracerStudy::create([
                'id_thn_ajaran' => $request->id_thn_ajaran,
                'id_wil' => $request->id_wil,
                'id_reg_pd' => $request->id_reg_pd,
                'id_smt' => $request->id_smt,
                'wkt_pengisian' => $request->wkt_pengisian,
                'wkt_tunggu' => $request->wkt_tunggu,
                'status_lulusan' => $request->status_lulusan,
                'jns_tmpt_bekerja' => $request->jns_tmpt_bekerja,
                'nm_tmpt_bekerja' => $request->nm_tmpt_bekerja,
                'income_per_bln' => $request->income_per_bln,
                'create_date' => $request->create_date,
                'id_creator' => $request->id_creator,
                'last_update' => $request->last_update,
                'id_updater' => $request->id_updater,
                'soft_delete' => $request->soft_delete,
                'last_sync' => $request->last_sync
		]);

        // DB::table('tracer.hasil_tracer_atasan')->insert([
            $data = HasilTracerStudy::create([
                'id_hasil_tracer_study' => $data->id_hasil_tracer_study,
                'id_negara' => $request->id_negara,
                'id_wil' => $request->id_wil,
                'email_atasan' => $request->email_atasan,
                'nm_atasan' => $request->nm_atasan,
                'jabatan_atasan' => $request->jabatan_atasan,
                'nm_tmpt_bekerja' => $request->nm_tmpt_bekerja,
                'bidang_tempat_bekerja' => $request->bidang_tempat_bekerja,
                'saran' => $request->saran,
                'harapan' => $request->harapan,
                'create_date' => $data->create_date,
                'id_creator' => $data->id_creator,
                'last_update' => $data->last_update,
                'id_updater' => $data->id_updater,
                'soft_delete' => $data->soft_delete,
                'last_sync' => $data->last_sync
		]);

        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);

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
