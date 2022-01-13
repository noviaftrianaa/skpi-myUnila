<?php

namespace App\Http\Controllers\PDUT\Api\Tracer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PDUT\Tracer\HasilTracerStudy;
use App\Models\PDUT\Tracer\HasilTracerAtasan;
use Illuminate\Support\Facades\Log;

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
            SELECT TOP 50
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
                pd.nm_pd,
                pd.jk,
            CONCAT(sms.nm_lemb, '(',jenjang.nm_jenj_didik,')')  AS nm_prodi
            FROM tracer.hasil_tracer_study AS tc_study WITH(NOLOCK)
            JOIN ref.wilayah AS wilayah WITH(NOLOCK) ON wilayah.id_wil = tc_study.id_wil
                AND wilayah.expired_date IS NULL
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_reg_pd = tc_study.id_reg_pd
                AND reg.soft_delete = 0
            LEFT JOIN (
                SELECT MAX(id_smt) as smt, id_reg_pd FROM pdrd.kuliah_mhs WITH(NOLOCK)
                WHERE soft_delete = 0
                GROUP BY id_reg_pd
            )AS kuliah ON kuliah.id_reg_pd = reg.id_reg_pd
            JOIN pdrd.sms AS sms WITH(NOLOCK) ON  sms.id_sms = reg.id_sms
                AND reg.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                AND reg.soft_delete = 0
            WHERE tc_study.soft_delete = 0;
        ");


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
        $id_hasil_tracer_study = guid();
        $id_hasil_tracer_atasan = guid();
        $id_updater = guid();
        $id_creator = guid();
        DB::beginTransaction();
        try {
            $data = HasilTracerStudy::create([
                'id_hasil_tracer_study' => $id_hasil_tracer_study,
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
                'id_creator' => $id_creator,
                'id_updater' => $id_updater,
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
                'soft_delete' => 0
            ]);


            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Tersimpan'
            ], 201);
        } catch (\Exception $e) {
            // Log::error('Message ' . $e->getMessage() . ' - ' . $e->getLine());
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal Tersimpan'
            ], 400);
        }


        // return response()->json([
        //     'status' => true,
        //     'message' => 'success',
        //     'data'  => $data
        // ]);
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
