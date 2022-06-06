<?php

namespace App\Http\Controllers\PDUT\Api\Tracer;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\RegPd;
use App\Models\PDUT\Ref\BidangPekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PDUT\Tracer\HasilTracerStudy;
use App\Models\PDUT\Tracer\HasilTracerAtasan;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule as ValidationRule;

class TracerStudyController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $currentPage = $request->input('page', 1);
        $itemsPerPage = $request->input('limit', 50);
        $idProdi = $request->input('id_prodi', NULL);

        InputValidator(
            ['id_prodi' => 'regex:/^[a-zA-Z0-9\-\(\)\s]+$/',],
            ['id_prodi.regex' => 'input harus berupa campuran alpa_numeric dan dash',]
        );

        if (!empty($itemsPerPage)) {
            if ($itemsPerPage > 50) {
                $itemsPerPage = 50;
            }
        }


        $data_alumni = collect(DB::SELECT("
            DECLARE @PageNumber AS INT
            DECLARE @RowsOfPage AS INT
            SET @PageNumber= ?
            SET @RowsOfPage= ?
            SELECT
                reg.id_reg_pd, pd.id_pd, pd.nm_pd, reg.nipd AS npm, CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi,
                ts.id_thn_ajaran AS angkatan, kul.biaya_smt, kul.ipk, kul.total_sks, pd.nik, pd.jk, pd.tlpn_hp, pd.email, jd.nm_jalur_daftar,
                reg.tgl_keluar AS tgl_lulus, reg.tgl_sk_yudisium AS tgl_wisuda, tc_study.id_hasil_tracer_study, tc_study.create_date AS waktu_data_ditambahkan,
                tc_study.last_update AS terakhir_diubah, pmb.nm_pembiayaan
            FROM tracer.hasil_tracer_study AS tc_study WITH(NOLOCK)
            LEFT JOIN ref.wilayah AS wilayah WITH(NOLOCK) ON wilayah.id_wil = tc_study.id_wil
                AND wilayah.expired_date IS NULL
            LEFT JOIN (
                SELECT DISTINCT id_reg_pd, id_pd
                FROM pdrd.reg_pd WITH(NOLOCK)
                WHERE soft_delete = 0
            ) AS regis ON regis.id_reg_pd = tc_study.id_reg_pd
            LEFT JOIN pdrd.reg_pd as reg WITH(NOLOCK) ON reg.id_reg_pd = regis.id_reg_pd
                AND reg.id_sms= '" . $idProdi . "'
                AND reg.soft_delete = 0
            JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = regis.id_pd
                AND pd.soft_delete = 0
            LEFT JOIN ref.jalur_daftar AS jd WITH(NOLOCK) ON jd.id_jalur_daftar = reg.id_jalur_daftar
                AND jd.expired_date IS NULL
            LEFT JOIN ref.pembiayaan AS pmb WITH(NOLOCK) ON pmb.id_pembiayaan = reg.id_pembiayaan
                AND jd.expired_date IS NULL
            LEFT JOIN (
                SELECT MAX(id_smt) as smt, id_reg_pd FROM pdrd.kuliah_mhs WITH(NOLOCK)
                WHERE soft_delete = 0
                GROUP BY id_reg_pd
            )AS kuliah ON kuliah.id_reg_pd = reg.id_reg_pd
            LEFT JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_smt = kuliah.smt
                AND kul.id_reg_pd = kuliah.id_reg_pd
                AND kul.soft_delete = 0
            JOIN pdrd.sms AS sms WITH(NOLOCK) ON  sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenjang WITH(NOLOCK) ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt=reg.id_semester_masuk
                AND ts.expired_date IS NULL
            WHERE tc_study.soft_delete = 0
            ORDER BY tc_study.id_thn_ajaran DESC
            OFFSET (@PageNumber-1)*@RowsOfPage ROWS
            FETCH NEXT @RowsOfPage ROWS ONLY
    ", [$currentPage, $itemsPerPage]))->unique('id_reg_pd');

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
                LEFT JOIN ref.wilayah AS wilayah WITH(NOLOCK) ON wilayah.id_wil = tc_study.id_wil
                    AND wilayah.expired_date IS NULL
                LEFT JOIN ref.bidang_pekerjaan AS b_kerja WITH(NOLOCK) ON b_kerja.id_bid_kerja = tc_study.id_bid_kerja
                    AND b_kerja.expired_date IS NULL
                LEFT JOIN ref.jenis_jalur_pekerjaan AS j_kerja WITH(NOLOCK) ON j_kerja.id_jns_jalur_kerja = tc_study.id_jns_jalur_kerja
                    AND j_kerja.expired_date IS NULL
                WHERE tc_study.id_reg_pd = '" . $id . "'
                    AND tc_study.soft_delete = 0
                ORDER BY tc_study.id_thn_ajaran DESC
        ");
        }

        // $hasil_tracer_study_atasan = [];
        // foreach ($data_alumni as $each_data) {
        //     $id =  $each_data->id_reg_pd;
        //     $hasil_tracer_study_atasan[$id] = DB::SELECT("
        //         SELECT
        //             tc_study_ats.id_hasil_tracer_study, tc_study_ats.id_hasil_tracer_atasan, tc_study_ats.email_atasan, tc_study_ats.nm_atasan,
        //             wilayah.nm_wil, negara.nm_negara, tc_study_ats.jabatan_atasan, tc_study_ats.nm_tmpt_bekerja,
        //             tc_study_ats.bidang_tempat_bekerja, tc_study_ats.saran, tc_study_ats.harapan
        //         FROM tracer.hasil_tracer_atasan AS tc_study_ats WITH(NOLOCK)
        //         LEFT JOIN ref.wilayah AS wilayah WITH(NOLOCK) ON wilayah.id_wil = tc_study_ats.id_wil
        //             AND wilayah.expired_date IS NULL
        //         LEFT JOIN ref.negara AS negara WITH(NOLOCK) ON negara.id_negara = tc_study_ats.id_negara
        //             AND wilayah.expired_date IS NULL
        //         LEFT JOIN tracer.hasil_tracer_study AS tc_study WITH(NOLOCK) ON tc_study.id_hasil_tracer_study = tc_study_ats.id_hasil_tracer_study
        //             AND tc_study.id_reg_pd = '" . $id . "'
        //             AND tc_study.soft_delete = 0
        //         WHERE tc_study_ats.soft_delete = 0
        //         ORDER BY tc_study_ats.create_date ASC

        //     ");
        // }


        $data = [];
        foreach ($data_alumni as $each_data) {
            $data[] = [
                'id_reg_pd' => $each_data->id_reg_pd,
                'nama_alumni' => $each_data->nm_pd,
                'NPM' => $each_data->npm,
                'program_studi' => $each_data->nm_prodi,
                'angkatan' => $each_data->angkatan,
                'biaya_semester' => $each_data->biaya_smt,
                'ipk' => $each_data->ipk,
                'total_sks' => $each_data->total_sks,
                'nik' => $each_data->nik,
                'jenis_kelamin' => $each_data->jk,
                'no_telepon' => $each_data->tlpn_hp,
                'jalur_daftar' => $each_data->nm_jalur_daftar,
                'biaya_kuliah' => $each_data->nm_pembiayaan,
                'tanggal_lulus' => $each_data->tgl_lulus,
                'tanggal_wisuda' => $each_data->tgl_wisuda,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah)),
                'hasil_tracer_study' => $hasil_tracer_study[$each_data->id_reg_pd]
                // 'hasil_tracer_study_atasan' => $hasil_tracer_study_atasan[$each_data->id_reg_pd]

            ];
        }


        if (empty($data)) {
            return WrapResponse([], "Data tidak ditemukan", FALSE);
        }

        return WrapResponse(compact('currentPage', 'itemsPerPage', 'data'), 'Berhasil mengambil data list Tracer Study');
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {

        $get_data = $request->all();

        if (empty($get_data['data'])) {
            return WrapResponse([], 'Data kosonng silahkan diisi', FALSE);
        }

        DB::beginTransaction();
        try {
            $tracer = [];
            foreach ($get_data['data'] as $each_data) {

                // $dataRegPd = DB::select("
                //     SELECT
                //         reg.id_reg_pd,
                //         reg.nipd AS npm
                //     FROM
                //         pdrd.reg_pd AS reg
                //     WHERE
                //         reg.nipd = ?
                //         AND reg.soft_delete = 0
                // ", [$each_data['npm']]);

                $tracer = HasilTracerStudy::updateOrInsert([
                    'id_reg_pd' => $each_data['id_reg_pd'],
                    'id_thn_ajaran' => $each_data['id_thn_ajaran'],
                ], [
                    'id_hasil_tracer_study' => guid(),
                    'id_bid_kerja' => $each_data['id_bid_kerja'],
                    'id_wil' => $each_data['id_wil'],
                    'id_smt' => $each_data['id_smt'],
                    'id_jns_jalur_kerja' => $each_data['id_jns_jalur_kerja'],
                    'wkt_pengisian' => $each_data['wkt_pengisian'],
                    'wkt_tunggu' => $each_data['wkt_tunggu'],
                    'a_kerja_sblm_lulus' => $each_data['a_kerja_sblm_lulus'],
                    'status_lulusan' => $each_data['status_lulusan'],
                    'jns_tmpt_bekerja' => $each_data['jns_tmpt_bekerja'],
                    'level_perusahaan' => $each_data['level_perusahaan'],
                    'nm_tmpt_bekerja' => $each_data['nm_tmpt_bekerja'],
                    'income_per_bln' => $each_data['income_per_bln'],
                    'status_jabatan' => $each_data['status_jabatan'],
                    'total_instansi_dilamar' => $each_data['total_instansi_dilamar'],
                    'hub_bidang_kerja' => $each_data['hub_bidang_kerja'],
                    'tkt_kesesuaian' => $each_data['tkt_kesesuaian'],
                    'alasan_tidak_sesuai' => $each_data['alasan_tidak_sesuai'],
                    'nm_pt_lnjt' => $each_data['nm_pt_lnjt'],
                    'nm_prodi_lnjt' => $each_data['nm_prodi_lnjt'],
                    'wkt_masuk' => $each_data['wkt_masuk'],
                    'ket' => $each_data['ket'],
                    'id_creator' => guid(),
                    'id_updater' => guid(),
                    'create_date' => currDateTime(),
                    'last_update' => currDateTime(),
                    'last_sync' => currDateTime(),
                    'soft_delete' => 0
                ]);

                //     $dataBidangKerja = DB::select("
                //         SELECT
                //             bp.nm_bid_kerja
                //         FROM
                //             ref.bidang_pekerjaan AS bp
                //         WHERE
                //             bp.id_bid_kerja = ?
                //             AND bp.expired_date IS NULL
                //     ", [$each_data['id_bid_kerja']]);

                // HasilTracerAtasan::create([
                //     'id_hasil_tracer_atasan' => guid(),
                //     'id_hasil_tracer_study' => $tracer->id_hasil_tracer_study,
                //     // 'id_negara' => $each_data['id_negara'],
                //     'id_wil' => $tracer->id_wil,
                //     // 'email_atasan' => $each_data['email_atasan'],
                //     // 'nm_atasan' => $each_data['nm_atasan'],
                //     // 'jabatan_atasan' => $each_data['jabatan_atasan'],
                //     'nm_tmpt_bekerja' => $dataBidangKerja[0]->nm_bid_kerja,
                //     'bidang_tempat_bekerja' => $dataBidangKerja[0]->nm_bid_kerja,
                //     // 'saran' => $each_data['saran'],
                //     // 'harapan' => $each_data['harapan'],
                //     'id_creator' => $tracer->id_creator,
                //     'id_updater' => $tracer->id_updater,
                //     'create_date' => $tracer->create_date,
                //     'last_update' => $tracer->last_update,
                //     'last_sync' => $tracer->last_sync,
                //     'soft_delete' => 0
                // ]);
            }

            DB::commit();
            $config = config('database.default');
            return WrapResponse([$config], 'sukses menambahkan tracer study');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal menambahkan tracer study");
        }
    }


    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $id_hasil_tracer_study = $request->input('id_hasil_tracer_study');
        InputValidator([
            'id_hasil_tracer_study' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
        ], [
            'id_hasil_tracer_study.required' => 'field ini harus diisi',
            'id_hasil_tracer_study.regex' => 'input harus berupa campuran alpa_numeric dan dash',
        ]);

        DB::beginTransaction();
        try {

            $hasil_tracer_study = HasilTracerStudy::where('id_hasil_tracer_study', $id_hasil_tracer_study)->first();

            if (empty($hasil_tracer_study)) {
                return WrapResponse([], "Data tidak ditemukan", FALSE);
            }

            $hasil_tracer_study->update([
                'id_bid_kerja' => $request->id_bid_kerja,
                'id_wil' => $request->id_wil,
                'id_smt' => $request->id_smt,
                'id_jns_jalur_kerja' => $request->id_jns_jalur_kerja,
                'wkt_pengisian' => $request->wkt_pengisian,
                'wkt_tunggu' => $request->wkt_tunggu,
                'status_lulusan' => $request->status_lulusan,
                'jns_tmpt_bekerja' => $request->jns_tmpt_bekerja,
                'nm_tmpt_bekerja' => $request->nm_tmpt_bekerja,
                'income_per_bln' => $request->income_per_bln,
                'total_instansi_dilamar' => $request->total_instansi_dilamar,
                'hub_bidang_kerja' => $request->hub_bidang_kerja,
                'tkt_kesesuaian' => $request->tkt_kesesuaian,
                'alasan_tidak_sesuai' => $request->alasan_tidak_sesuai,
                'ket' => $request->ket,
                'id_updater' => guid(),
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
            ]);

            // $hasil_tracer_study_atasan = HasilTracerAtasan::where('id_hasil_tracer_study', $hasil_tracer_study->id_hasil_tracer_study)->first();
            // $hasil_tracer_study_atasan->update([
            //     'id_negara' => $request->id_negara,
            //     'id_wil' => $request->id_wil,
            //     'email_atasan' => $request->email_atasan,
            //     'nm_atasan' => $request->nm_atasan,
            //     'jabatan_atasan' => $request->jabatan_atasan,
            //     'nm_tmpt_bekerja' => $request->nm_tmpt_bekerja,
            //     'bidang_tempat_bekerja' => $hasil_tracer_study->id_bid_kerja,
            //     'saran' => $request->saran,
            //     'harapan' => $request->harapan,
            //     'id_updater' => $hasil_tracer_study->id_updater,
            //     'last_update' => $hasil_tracer_study->last_update,
            //     'last_sync' => $hasil_tracer_study->last_sync,
            // ]);

            DB::commit();
            return WrapResponse([], 'sukses memperbaharui tracer study - ' . $hasil_tracer_study->id_hasil_tracer_study);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal memperbaharui tracer study");
        }
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $id_hasil_tracer_study = $request->input('id_hasil_tracer_study');
        InputValidator([
            'id_hasil_tracer_study' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
        ], [
            'id_hasil_tracer_study.required' => 'field ini harus diisi',
            'id_hasil_tracer_study.regex' => 'input harus berupa campuran alpa_numeric dan dash',
        ]);

        DB::beginTransaction();
        try {

            $hasil_tracer_study = HasilTracerStudy::where('id_hasil_tracer_study', $id_hasil_tracer_study)->first();

            if (empty($hasil_tracer_study)) {
                return WrapResponse([], "Data tidak ditemukan", FALSE);
            }

            $hasil_tracer_study->update(['soft_delete' => 1]);

            // $hasil_tracer_study_atasan = HasilTracerAtasan::where('id_hasil_tracer_study', $hasil_tracer_study->id_hasil_tracer_study)->first();
            // $hasil_tracer_study_atasan->update(['soft_delete' => 1]);

            DB::commit();
            return WrapResponse([], 'sukses menghapus tracer study - ' . $hasil_tracer_study->id_hasil_tracer_study);
        } catch (\Exception $e) {
            Log::error('Message ' . $e->getMessage() . ' - ' . $e->getLine());
            DB::rollback();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal menghapus tracer study");
        }
    }

}
