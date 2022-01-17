<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SmsController extends Controller
{
    /**
     * @OA\Get(
     *      path="/pdrd/sms",
     *      operationId="getSms",
     *      tags={"Pdrd"},
     *      summary="Dapatkan daftar Sms",
     *      description="Menampilkan daftar data Sms",
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
    public function sms(Request $request)
    {
        $listdata = DB::table('pdrd.sms')->select('id_sms', 'nm_lemb', 'kd_kl', 'kd_satker', 'smt_mulai', 'a_selenggara_subst', 'kode_prodi', 
        'nm_prodi_english', 'jln', 'rt', 'rw', 'nm_dsn', 'ds_kel', 'kode_pos', 'lintang', 'bujur', 
        'no_tel', 'no_fax', 'email', 'website', 'singkatan', 'tgl_berdiri', 'sk_selenggara', 'tgl_sk_selenggara', 'tmt_sk_selenggara', 
        'tst_sk_selenggara', 'kpst_pd', 'sks_lulus', 'gelar_lulusan', 'stat_prodi', 'polesei_nilai', 'a_kependidikan', 'sistem_ajar', 'a_pjj',
        'a_psdku', 'luas_lab', 'kapasitas_prak_satu_shift', 'jml_mhs_pengguna', 'jml_jam_penggunaan', 'jml_prodi_pengguna', 'jml_modul_prak_sendiri', 
        'jml_modul_prak_lain', 'fungsi_selain_prak', 'penggunaan_lab', 'a_pkl', 'id_sp', 'id_jenj_didik', 'id_jns_sms', 'id_fungsi_lab', 
        'id_kel_usaha', 'id_blob', 'id_wil', 'id_jur', 'id_induk_sms' )->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_sms' => $each_data->id_sms,
                'nm_lemb' => $each_data->nm_lemb,
                'kd_kl' => $each_data->kd_kl,
                'kd_satker' => $each_data->kd_satker,
                'smt_mulai' => $each_data->smt_mulai,
                'a_selenggara_subst' => $each_data->a_selenggara_subst,
                'kode_prodi' => $each_data->kode_prodi,
                'nm_prodi_english' => $each_data->nm_prodi_english,
                'jln' => $each_data->jln,
                'rt' => $each_data->rt,
                'rw' => $each_data->rw,
                'nm_dsn' => $each_data->nm_dsn,
                'ds_kel' => $each_data->ds_kel,
                'kode_pos' => $each_data->kode_pos,
                'lintang' => $each_data->lintang,
                'bujur' => $each_data->bujur,
                'no_tel' => $each_data->no_tel,
                'no_fax' => $each_data->no_fax,
                'email' => $each_data->email,
                'website' => $each_data->website,
                'singkatan' => $each_data->singkatan,
                'tgl_berdiri' => $each_data->tgl_berdiri,
                'sk_selenggara' => $each_data->sk_selenggara,
                'tgl_sk_selenggara' => $each_data->tgl_sk_selenggara,
                'tmt_sk_selenggara' => $each_data->tmt_sk_selenggara,
                'tst_sk_selenggara' => $each_data->tst_sk_selenggara,
                'kpst_pd' => $each_data->kpst_pd,
                'sks_lulus' => $each_data->sks_lulus,
                'gelar_lulusan' => $each_data->gelar_lulusan,
                'stat_prodi' => $each_data->stat_prodi,
                'polesei_nilai' => $each_data->polesei_nilai,
                'a_kependidikan' => $each_data->a_kependidikan,
                'sistem_ajar' => $each_data->sistem_ajar,
                'a_pjj' => $each_data->a_pjj,
                'a_psdku' => $each_data->a_psdku,
                'luas_lab' => $each_data->luas_lab,
                'kapasitas_prak_satu_shift' => $each_data->kapasitas_prak_satu_shift,
                'jml_mhs_pengguna' => $each_data->jml_mhs_pengguna,
                'jml_jam_penggunaan' => $each_data->jml_jam_penggunaan,
                'jml_prodi_pengguna' => $each_data->jml_prodi_pengguna,
                'jml_modul_prak_sendiri' => $each_data->jml_modul_prak_sendiri,
                'jml_modul_prak_lain' => $each_data->jml_modul_prak_lain,
                'fungsi_selain_prak' => $each_data->fungsi_selain_prak,
                'penggunaan_lab' => $each_data->penggunaan_lab,
                'a_pkl' => $each_data->a_pkl,
                'id_sp' => $each_data->id_sp,
                'id_jenj_didik' => $each_data->id_jenj_didik,
                'id_jns_sms' => $each_data->id_jns_sms,
                'id_fungsi_lab' => $each_data->id_fungsi_lab,
                'id_kel_usaha' => $each_data->id_kel_usaha,
                'id_blob' => $each_data->id_blob,
                'id_wil' => $each_data->id_wil,
                'id_jur' => $each_data->id_jur,
                'id_induk_sms' => $each_data->id_induk_sms,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
}
