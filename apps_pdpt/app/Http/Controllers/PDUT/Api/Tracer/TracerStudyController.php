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
        $data_alumni = DB::SELECT("
            SELECT
                reg.id_reg_pd, pd.id_pd, pd.nm_pd, reg.nipd AS npm, CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi,
                ts.id_thn_ajaran AS angkatan, kul.biaya_smt, kul.ipk, kul.total_sks, pd.nik, pd.jk, pd.tlpn_hp, jd.nm_jalur_daftar,
                reg.tgl_keluar AS tgl_lulus, reg.tgl_sk_yudisium AS tgl_wisuda, tc_study.create_date AS waktu_data_ditambahkan,
                tc_study.last_update AS terakhir_diubah
            FROM tracer.hasil_tracer_study AS tc_study WITH(NOLOCK)
            JOIN ref.wilayah AS wilayah WITH(NOLOCK) ON wilayah.id_wil = tc_study.id_wil
                AND wilayah.expired_date IS NULL

            LEFT JOIN (
                SELECT
                    DISTINCT id_reg_pd
                FROM pdrd.reg_pd
            ) AS regis ON regis.id_reg_pd = tc_study.id_reg_pd
            JOIN pdrd.reg_pd as reg ON reg.id_reg_pd = regis.id_reg_pd

            JOIN ref.jalur_daftar AS jd WITH(NOLOCK) ON jd.id_jalur_daftar = reg.id_jalur_daftar
                AND jd.expired_date IS NULL


            LEFT JOIN (
                SELECT
                    DISTINCT id_pd
                 FROM pdrd.peserta_didik
            ) AS pedik ON pedik.id_pd = reg.id_pd
            JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                AND pd.soft_delete = 0


            LEFT JOIN (
                SELECT MAX(id_smt) as smt, id_reg_pd FROM pdrd.kuliah_mhs WITH(NOLOCK)
                WHERE soft_delete = 0
                GROUP BY id_reg_pd
            )AS kuliah ON kuliah.id_reg_pd = reg.id_reg_pd
            JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_smt = kuliah.smt
                AND kul.id_reg_pd = kuliah.id_reg_pd
                AND kul.soft_delete = 0
            JOIN pdrd.sms AS sms WITH(NOLOCK) ON  sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt=reg.id_semester_masuk
                AND ts.expired_date IS NULL
            WHERE tc_study.soft_delete = 0;
        ");

        $hasil_tracer_study = [];

        foreach ($data_alumni as $each_data) {

                $id =  $each_data->id_reg_pd;

        $hasil_tracer_study[$id] = DB::SELECT("
            SELECT
                tc_study.id_hasil_tracer_study, tc_study.id_thn_ajaran, tc_study.id_smt,
                tc_study.wkt_pengisian, tc_study.wkt_tunggu,
                tc_study.status_lulusan, tc_study.jns_tmpt_bekerja,
                wilayah.nm_wil, tc_study.nm_tmpt_bekerja,
                tc_study.income_per_bln
                FROM tracer.hasil_tracer_study AS tc_study WITH(NOLOCK)
            JOIN ref.wilayah AS wilayah WITH(NOLOCK) ON wilayah.id_wil = tc_study.id_wil
                AND wilayah.expired_date IS NULL
            WHERE tc_study.id_reg_pd = '".$id."'
                AND tc_study.soft_delete = 0;
        ");
}

        // foreach ($tracer_study as $each_data) {
        //     $hasil_tracer_study[] = [
        //         'id_hasil_tracer_study' => $each_data->id_hasil_tracer_study,
        //         'id_thn_ajaran' => $each_data->id_thn_ajaran,
        //         'id_smt' => $each_data->id_smt,
        //         'wkt_pengisian' => $each_data->wkt_pengisian,
        //         'wkt_tunggu' => $each_data->wkt_tunggu,
        //         'status_lulusan' => $each_data->status_lulusan,
        //         'jns_tmpt_bekerja' => $each_data->jns_tmpt_bekerja,
        //         'nm_wil' => $each_data->nm_wil,
        //         'nm_tmpt_bekerja' => $each_data->nm_tmpt_bekerja,
        //         'income_per_bln' => $each_data->income_per_bln
        //     ];
        // }

        // $tracer_study_atasan = DB::SELECT("
        //     SELECT
        //         tc_study_ats.id_hasil_tracer_atasan, tc_study_ats.email_atasan, tc_study_ats.nm_atasan,
        //         wilayah.nm_wil, negara.nm_negara, tc_study_ats.jabatan_atasan, tc_study_ats.nm_tmpt_bekerja,
        //         tc_study_ats.bidang_tempat_bekerja, tc_study_ats.saran, tc_study_ats.harapan
        //     FROM tracer.hasil_tracer_atasan AS tc_study_ats WITH(NOLOCK)
        //     JOIN ref.wilayah AS wilayah WITH(NOLOCK) ON wilayah.id_wil = tc_study_ats.id_wil
        //         AND wilayah.expired_date IS NULL
        //     JOIN ref.negara AS negara WITH(NOLOCK) ON negara.id_negara = tc_study_ats.id_negara
        //         AND wilayah.expired_date IS NULL
        //     WHERE tc_study_ats.id_hasil_tracer_study = '".$hasil_tracer_study[0]->id_hasil_tracer_study."'
        //         AND tc_study_ats.soft_delete = 0;
        // ");

        foreach ($data_alumni as $each_data) {
            $data[] = [
                'id_pd' => $each_data->id_pd,
                'id_reg_pd' => $each_data->id_reg_pd,
                'nm_pd' => $each_data->nm_pd,
                'npm' => $each_data->npm,
                'nm_prodi' => $each_data->nm_prodi,
                'angkatan' => $each_data->angkatan,
                'biaya_smt' => $each_data->biaya_smt,
                'ipk' => $each_data->ipk,
                'total_sks' => $each_data->total_sks,
                'nik' => $each_data->nik,
                'jk' => $each_data->jk,
                'tlpn_hp' => $each_data->tlpn_hp,
                'nm_jalur_daftar' => $each_data->nm_jalur_daftar,
                'tgl_lulus' => $each_data->tgl_lulus,
                'tgl_wisuda' => $each_data->tgl_wisuda,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah)),
                'hasil_tracer_study' => $hasil_tracer_study[$each_data->id_reg_pd]
            ];
        }


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
        //
    }

    /**
     * @OA\Post(
     *      path="/hasil_tracer_study/simpan",
     *      operationId="postTracerStudy",
     *      tags={"Tracer Study"},
     *      summary="Simpan hasil Tracer Study",
     *      description="Menyimpan data Hasil TracerStudy",
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
     * @param  \Illuminate\Http\Request
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

            HasilTracerAtasan::create([
                'id_hasil_tracer_atasan' => $id_hasil_tracer_atasan,
                'id_hasil_tracer_study' => $data->id_hasil_tracer_study,
                'id_negara' => $request->id_negara,
                'id_wil' => $request->id_wil_atasan,
                'email_atasan' => $request->email_atasan,
                'nm_atasan' => $request->nm_atasan,
                'jabatan_atasan' => $request->jabatan_atasan,
                'nm_tmpt_bekerja' => $request->nm_tmpt_bekerja_atasan,
                'bidang_tempat_bekerja' => $request->bidang_tempat_bekerja,
                'saran' => $request->saran,
                'harapan' => $request->harapan,
                'id_creator' => $id_creator,
                'id_updater' => $id_updater,
                'create_date' => $data->create_date,
                'last_update' => $data->last_update,
                'last_sync' => $data->last_sync,
                'soft_delete' => 0
            ]);


            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Tersimpan'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Message ' . $e->getMessage() . ' - ' . $e->getLine());
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
     * @OA\Post(
     *      path="/hasil_tracer_study/update",
     *      operationId="putHasilTracerStudy",
     *      tags={"Tracer Study"},
     *      summary="Memperbaharui hasil Tracer Study",
     *      description="Memperbaharui  data Hasil TracerStudy",
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
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        DB::beginTransaction();
        try {

            $hasil_tracer_study = HasilTracerStudy::where('id_hasil_tracer_study', $request->id_hasil_tracer_study)->first();
            $hasil_tracer_study->update([
                'wkt_pengisian' => $request->wkt_pengisian,
                'wkt_tunggu' => $request->wkt_tunggu,
                'status_lulusan' => $request->status_lulusan,
                'jns_tmpt_bekerja' => $request->jns_tmpt_bekerja,
                'nm_tmpt_bekerja' => $request->nm_tmpt_bekerja,
                'income_per_bln' => $request->income_per_bln,
                ]);

            $hasil_tracer_study_atasan = HasilTracerAtasan::where('id_hasil_tracer_study', $hasil_tracer_study->id_hasil_tracer_study)->first();
            $hasil_tracer_study_atasan->update([
                'email_atasan' => $request->email_atasan,
                'nm_atasan' => $request->nm_atasan,
                'jabatan_atasan' => $request->jabatan_atasan,
                'nm_tmpt_bekerja' => $request->nm_tmpt_bekerja_atasan,
                'bidang_tempat_bekerja' => $request->bidang_tempat_bekerja,
                'saran' => $request->saran,
                'harapan' => $request->harapan,
            ]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diupdate'
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Data gagal diupdate'
            ], 400);
        }
    }

    /**
     * @OA\Post(
     *      path="/hasil_tracer_study/delete",
     *      operationId="deleteTracerStudy",
     *      tags={"Tracer Study"},
     *      summary="Menghapus hasil Tracer Study",
     *      description="Menghapus data hasil TracerStudy",
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
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        DB::beginTransaction();
        try {

        $hasil_tracer_study = HasilTracerStudy::where('id_hasil_tracer_study', $request->id_hasil_tracer_study)->first();
        $hasil_tracer_study->update([ 'soft_delete' => 1 ]);

        $hasil_tracer_study_atasan = HasilTracerAtasan::where('id_hasil_tracer_study', $hasil_tracer_study->id_hasil_tracer_study)->first();
        $hasil_tracer_study_atasan->update([ 'soft_delete' => 1 ]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Data berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Data gagal dihapus'
            ], 400);
        }
    }
}
