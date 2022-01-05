<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class KbliController extends Controller
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
    public function Kbli(Request $request)
    {
        $listdata = DB::table('ref.kbli')->select('id_kbli','id_induk_kbli','kategori','kode','judul','lv_kbli')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_kbli'  => $each_data->id_kbli,
                'id_induk_kbli'  => $each_data->id_induk_kbli,
                'kategori'  => $each_data->kategori,
                'kode'  => $each_data->kode,
                'judul'  => $each_data->judul,
                'lv_kbli'  => $each_data->lv_kbli,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    public function KeahlianLab(Request $request)
    {
        $listdata = DB::table('ref.keahlian_lab')->select('id_keahlian_lab','nm_keahlian_lab')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_keahlian_lab'  => $each_data->id_id_keahlian_labnegara,
                'nm_keahlian_lab'  => $each_data->nm_keahlian_lab,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    public function KebutuhanKhusus(Request $request)
    {
        $listdata = DB::table('ref.negara')->select('id_kk','nm_kk')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_kk'  => $each_data->id_kk,
                'nm_kk'  => $each_data->nm_kk,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    public function KelompokBidang(Request $request)
    {
        $listdata = DB::table('ref.kelompok_bidang')->select('id_kel_bidang','kode_kel_bidang','nm_kel_bidang','u_sma',
        'u_smk','u_pt','u_iptek','u_kepakaran','kat_kel','ket_kel_bidang','a_leaf_node','id_induk_bidang')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_kel_bidang'  => $each_data->id_kel_bidang,
                'kode_kel_bidang'  => $each_data->kode_kel_bidang,
                'nm_kel_bidang'  => $each_data->nm_kel_bidang,
                'u_sma'  => $each_data->u_sma,
                'u_smk'  => $each_data->u_smk,
                'u_pt'  => $each_data->u_pt,
                'u_iptek'  => $each_data->u_iptek,
                'u_kepakaran'  => $each_data->u_kepakaran,
                'kat_kel'  => $each_data->kat_kel,
                'ket_kel_bidang'  => $each_data->ket_kel_bidang,
                'a_leaf_node'  => $each_data->a_leaf_node,
                'id_induk_bidang'  => $each_data->id_induk_bidang,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    public function KelompokProfesi(Request $request)
    {
        $listdata = DB::table('ref.negara')->select('id_kel_prof','nm_kel_prof','ket_kel_prof')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_kel_prof'  => $each_data->id_kel_prof,
                'nm_kel_prof'  => $each_data->nm_kel_prof,
                'ket_kel_prof'  => $each_data->ket_kel_prof,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    public function KelompokUsaha(Request $request)
    {
        $listdata = DB::table('ref.kelompok_usaha')->select('id_kel_usaha','nm_kel_usaha')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_kel_usaha'  => $each_data->id_kel_usaha,
                'nm_kel_usaha'  => $each_data->nm_kel_usaha,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    public function LembagaAkred(Request $request)
    {
        $listdata = DB::table('ref.lembaga_akred')->select('id_lemb_akred','nm_lemb','jln','rt','rw','nm_dsn','ds_kel','kode_pos','lintang','bujur',
        'no_tel','no_fax','email','webscite','kd_kl','kd_satker','tgl_mulai_beroperasi','ket','target_akred')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_lemb_akred'  => $each_data->id_lemb_akred,
                'nm_lemb'  => $each_data->nm_lemb,
                'jln'  => $each_data->jln,
                'rt'  => $each_data->rt,
                'rw'  => $each_data->rw,
                'nm_dsn'  => $each_data->nm_dsn,
                'ds_kel'  => $each_data->ds_kel,
                'kode_pos'  => $each_data->kode_pos,
                'lintang'  => $each_data->lintang,
                'bujur'  => $each_data->bujur,
                'no_tel'  => $each_data->no_tel,
                'no_fax'  => $each_data->no_fax,
                'email'  => $each_data->email,
                'webscite'  => $each_data->webscite,
                'kd_kl'  => $each_data->kd_kl,
                'kd_satker'  => $each_data->kd_satker,
                'tgl_mulai_beroperasi'  => $each_data->tgl_mulai_beroperasi,
                'ket'  => $each_data->ket,
                'target_akred'  => $each_data->target_akred,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    public function LembagaPengangkat(Request $request)
    {
        $listdata = DB::table('ref.lembaga_pengangkat')->select('id_lemb_angkat','nm_lemb_angkat')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_lemb_angkat'  => $each_data->id_lemb_angkat,
                'nm_lemb_angkat'  => $each_data->nm_lemb_angkat,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    public function LevelWilayah(Request $request)
    {
        $listdata = DB::table('ref.level_wilayah')->select('id_level_wil','nm_level_wilayah')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_level_wil'  => $each_data->id_level_wil,
                'nm_level_wilayah'  => $each_data->nm_level_wilayah,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    public function MediaPublikasi(Request $request)
    {
        $listdata = DB::table('ref.media_publikasi')->select('id_media_pub','id_jns_media','id_kel_bidang','id_sp','id_negara','nm_media_pub',
        'bentuk_media_pub','grade_sinta','jns_penerbit')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_media_pub'  => $each_data->id_media_pub,
                'id_jns_media'  => $each_data->id_jns_media,
                'id_kel_bidang'  => $each_data->id_kel_bidang,
                'id_sp'  => $each_data->id_sp,
                'id_negara'  => $each_data->id_negara,
                'nm_media_pub'  => $each_data->nm_media_pub,
                'bentuk_media_pub'  => $each_data->bentuk_media_pub,
                'grade_sinta'  => $each_data->grade_sinta,
                'jns_penerbit'  => $each_data->jns_penerbit,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    public function Negara(Request $request)
    {
        $listdata = DB::table('ref.negara')->select('id_negara','nm_negara','a_ln','benua')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_negara'  => $each_data->id_negara,
                'nm_negara'  => $each_data->nm_negara,
                'a_ln'  => $each_data->a_ln,
                'benua'  => $each_data->benua,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    public function NilaiAkred(Request $request)
    {
        $listdata = DB::table('ref.nilai_akred')->select('id_akred','nm_akred')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_akred'  => $each_data->id_akred,
                'nm_akred'  => $each_data->nm_akred,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    public function PangkatGolongan(Request $request)
    {
        $listdata = DB::table('ref.pangkat_golongan')->select('id_pangkat_gol','kode_gol','nm_pangkat')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_pangkat_gol'  => $each_data->id_pangkat_gol,
                'kode_gol'  => $each_data->kode_gol,
                'nm_pangkat'  => $each_data->nm_pangkat,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

}
