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
     *      path="/tracer_study/list",
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
        $data_alumni = collect(DB::SELECT("
        SELECT
            reg.id_reg_pd, pd.id_pd, pd.nm_pd, reg.nipd AS npm, CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi,
            ts.id_thn_ajaran AS angkatan, kul.biaya_smt, kul.ipk, kul.total_sks, pd.nik, pd.jk, pd.tlpn_hp, pd.email, jd.nm_jalur_daftar,
            reg.tgl_keluar AS tgl_lulus, reg.tgl_sk_yudisium AS tgl_wisuda, tc_study.id_hasil_tracer_study, tc_study.create_date AS waktu_data_ditambahkan,
            tc_study.last_update AS terakhir_diubah
        FROM tracer.hasil_tracer_study AS tc_study WITH(NOLOCK)
        JOIN ref.wilayah AS wilayah WITH(NOLOCK) ON wilayah.id_wil = tc_study.id_wil
            AND wilayah.expired_date IS NULL
        LEFT JOIN (
            SELECT DISTINCT id_reg_pd, id_pd
            FROM pdrd.reg_pd WITH(NOLOCK)
            WHERE soft_delete = 0
        ) AS regis ON regis.id_reg_pd = tc_study.id_reg_pd
        JOIN pdrd.reg_pd as reg WITH(NOLOCK) ON reg.id_reg_pd = regis.id_reg_pd
            AND reg.soft_delete = 0
        JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = regis.id_pd
            AND pd.soft_delete = 0
        JOIN ref.jalur_daftar AS jd WITH(NOLOCK) ON jd.id_jalur_daftar = reg.id_jalur_daftar
            AND jd.expired_date IS NULL
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
    "))->unique('id_reg_pd');

        $hasil_tracer_study = [];
        foreach ($data_alumni as $each_data) {
            $id =  $each_data->id_reg_pd;
            $hasil_tracer_study[$id] = DB::SELECT("
                SELECT
                    tc_study.id_hasil_tracer_study, tc_study.id_thn_ajaran, tc_study.id_smt,
                    tc_study.wkt_pengisian, tc_study.wkt_tunggu, tc_study.status_lulusan, tc_study.total_instansi_dilamar,
                    tc_study.jns_tmpt_bekerja, wilayah.nm_wil, tc_study.nm_tmpt_bekerja, b_kerja.nm_bid_kerja,
                    j_kerja.nm_jns_jalur_kerja, tc_study.income_per_bln, tc_study.hub_bidang_kerja, tc_study.tkt_kesesuaian,
                    tc_study.alasan_tidak_sesuai
                    FROM tracer.hasil_tracer_study AS tc_study WITH(NOLOCK)
                JOIN ref.wilayah AS wilayah WITH(NOLOCK) ON wilayah.id_wil = tc_study.id_wil
                    AND wilayah.expired_date IS NULL
                JOIN ref.bidang_pekerjaan AS b_kerja WITH(NOLOCK) ON b_kerja.id_bid_kerja = tc_study.id_bid_kerja
                    AND b_kerja.expired_date IS NULL
                JOIN ref.jenis_jalur_pekerjaan AS j_kerja WITH(NOLOCK) ON j_kerja.id_jns_jalur_kerja = tc_study.id_jns_jalur_kerja
                    AND j_kerja.expired_date IS NULL
                WHERE tc_study.id_reg_pd = '".$id."'
                    AND tc_study.soft_delete = 0;
        ");
        }

        $hasil_tracer_study_atasan = [];
        foreach ($data_alumni as $each_data) {
            $id =  $each_data->id_hasil_tracer_study;
            $hasil_tracer_study_atasan[$id] = DB::SELECT("
                SELECT
                    tc_study_ats.id_hasil_tracer_study, tc_study_ats.id_hasil_tracer_atasan, tc_study_ats.email_atasan, tc_study_ats.nm_atasan,
                    wilayah.nm_wil, negara.nm_negara, tc_study_ats.jabatan_atasan, tc_study_ats.nm_tmpt_bekerja,
                    tc_study_ats.bidang_tempat_bekerja, tc_study_ats.saran, tc_study_ats.harapan
                FROM tracer.hasil_tracer_atasan AS tc_study_ats WITH(NOLOCK)
                JOIN ref.wilayah AS wilayah WITH(NOLOCK) ON wilayah.id_wil = tc_study_ats.id_wil
                    AND wilayah.expired_date IS NULL
                JOIN ref.negara AS negara WITH(NOLOCK) ON negara.id_negara = tc_study_ats.id_negara
                    AND wilayah.expired_date IS NULL
                WHERE tc_study_ats.id_hasil_tracer_study = '".$id."'
                    AND tc_study_ats.soft_delete = 0;
            ");
        }

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
                'hasil_tracer_study' => $hasil_tracer_study[$each_data->id_reg_pd],
                'hasil_tracer_study_atasan' => $hasil_tracer_study_atasan[$each_data->id_hasil_tracer_study]

            ];
        }

        if (empty($data)) {
            return response()->json([
                'status' => False,
                'message' => "Data tidak ditemukan"
            ]);
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
     *      path="/tracer_study/tambah",
     *      operationId="postTracerStudy",
     *      tags={"Tracer Study"},
     *      summary="Simpan hasil Tracer Study",
     *      description="Menyimpan data Hasil TracerStudy",
     *    @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="applicatin/json",
     *             @OA\Schema(
     *                 @OA\Property( property="id_thn_ajaran", type="string", format="number", example="2022"),
     *                 @OA\Property( property="id_bid_kerja", type="string", format="number", example="10"),
     *                 @OA\Property( property="id_wil", type="string", format="number", example="126000"),
     *                 @OA\Property( property="id_reg_pd", type="string", format="text", example="830C07C0-BC64-4193-B6AD-0000EEB6FC87"),
     *                 @OA\Property( property="id_smt", type="string", format="number", example="20213"),
     *                 @OA\Property( property="id_jns_jalur_kerja", type="string", format="number", example="12"),
     *                 @OA\Property( property="wkt_pengisian", type="string", format="date", example="2022-01-01"),
     *                 @OA\Property( property="wkt_tunggu", type="string", format="number", example="3"),
     *                 @OA\Property( property="status_lulusan", type="string", format="number", example="1"),
     *                 @OA\Property( property="jns_tmpt_bekerja", type="string", format="text", example="Institusi"),
     *                 @OA\Property( property="nm_tmpt_bekerja", type="string", format="text", example="Honda"),
     *                 @OA\Property( property="income_per_bln", type="string", format="number", example="2085000"),
     *                 @OA\Property( property="total_instansi_dilamar", type="string", format="number", example="1"),
     *                 @OA\Property( property="hub_bidang_kerja", type="string", format="number", example="1"),
     *                 @OA\Property( property="tkt_kesesuaian", type="string", format="number", example="1"),
     *                 @OA\Property( property="alasan_tidak_sesuai", type="string", format="text", example=" "),
     *                 @OA\Property( property="ket", type="string", format="text", example=" "),
     *                 @OA\Property( property="nm_atasan", type="string", format="text", example="nama bos antum"),
     *                 @OA\Property( property="email_atasan", type="email", format="email", example="emailbos@gmail.com")
     *              )
     *          )
     *      ),
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
                'id_bid_kerja'=> $request->id_bid_kerja,
                'id_wil'=> $request->id_wil,
                'id_reg_pd'=> $request->id_reg_pd,
                'id_smt'=> $request->id_smt,
                'id_jns_jalur_kerja'=> $request->id_jns_jalur_kerja,
                'wkt_pengisian'=> $request->wkt_pengisian,
                'wkt_tunggu'=> $request->wkt_tunggu,
                'status_lulusan'=> $request->status_lulusan,
                'jns_tmpt_bekerja'=> $request->jns_tmpt_bekerja,
                'nm_tmpt_bekerja'=> $request->nm_tmpt_bekerja,
                'income_per_bln'=> $request->income_per_bln,
                'total_instansi_dilamar'=> $request->total_instansi_dilamar,
                'hub_bidang_kerja'=> $request->hub_bidang_kerja,
                'tkt_kesesuaian'=> $request->tkt_kesesuaian,
                'alasan_tidak_sesuai'=> $request->alasan_tidak_sesuai,
                'ket'=> $request->ket,
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
                'message' => 'Data berhasil tersimpan'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Message ' . $e->getMessage() . ' - ' . $e->getLine());
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Data gagal tersimpan'
            ], 400);
        }
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
     * @OA\Put(
     *      path="/tracer_study/ubah",
     *      operationId="putHasilTracerStudy",
     *      tags={"Tracer Study"},
     *      summary="Memperbaharui hasil Tracer Study Atasan",
     *      description="Memperbaharui data Hasil Tracer Study Atasan berdasarkan id_hasil_tracer_study",
     *    @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="applicatin/json",
     *             @OA\Schema(
     *                 @OA\Property( property="id_hasil_tracer_study", type="string", format="text", example="0530FAB5-2E52-4A8C-BE03-285A101062B2"),
     *                 @OA\Property( property="nm_atasan", type="string", format="text", example="nama bos antum"),
     *                 @OA\Property( property="email_atasan", type="email", format="email", example="emailbos@gmail.com"),
     *                 @OA\Property( property="id_negara", type="number", format="number", example="ID"),
     *                 @OA\Property( property="id_wilayah", type="number", format="number", example="126000"),
     *                 @OA\Property( property="nm_tmpt_bekerja_atasan", type="string", format="text", example="Honda"),
     *                 @OA\Property( property="jabatan_atasan", type="string", format="text", example="Kepala Divisi IT"),
     *                 @OA\Property( property="bidang_tempat_bekerja", type="string", format="text", example="Teknologi Informasi"),
     *                 @OA\Property( property="saran", type="string", format="text", example="Jangan deadline terus ya"),
     *                 @OA\Property( property="harapan", type="string", format="text", example="Berani mencoba hal baru")
     *              )
     *          )
     *      ),
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
                'last_update' => currDateTime()
            ]);

            $hasil_tracer_study_atasan = HasilTracerAtasan::where('id_hasil_tracer_study', $hasil_tracer_study->id_hasil_tracer_study)->first();
            $hasil_tracer_study_atasan->update([
                'nm_atasan' => $request->nm_atasan,
                'email_atasan' => $request->email_atasan,
                'id_negara' => $request->id_negara,
                'id_wil' => $request->id_wilayah,
                'nm_tmpt_bekerja' => $request->nm_tmpt_bekerja_atasan,
                'jabatan_atasan' => $request->jabatan_atasan,
                'bidang_tempat_bekerja' => $request->bidang_tempat_bekerja,
                'saran' => $request->saran,
                'harapan' => $request->harapan,
            ]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diperbaharui'
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
     * @OA\Delete(
     *      path="/tracer_study/hapus",
     *      operationId="deleteTracerStudy",
     *      tags={"Tracer Study"},
     *      summary="Menghapus hasil Tracer Study",
     *      description="Menghapus data hasil TracerStudy",
     *@OA\RequestBody(
     *      required=true,
     *      description="Menghapus data hasil TracerStudy berdasarkan id_hasil_tracer_study",
     *      @OA\JsonContent(
     *          required={"id_hasil_tracer_study"},
     *          @OA\Property(property="id_hasil_tracer_study", type="string", format="text"),
     *          ),
     *      ),
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
            $hasil_tracer_study->update(['soft_delete' => 1]);

            $hasil_tracer_study_atasan = HasilTracerAtasan::where('id_hasil_tracer_study', $hasil_tracer_study->id_hasil_tracer_study)->first();
            $hasil_tracer_study_atasan->update(['soft_delete' => 1]);

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
