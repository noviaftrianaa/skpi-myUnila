<?php

namespace App\Http\Controllers\PDUT\Api\Referensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JenisEvaluasiController extends Controller
{
        /**
     * @OA\Get(
     *      path="/referensi/jenis_evaluasi",
     *      operationId="getJenisEvaluasi",
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
    public function jenis_evaluasi(Request $request)
    {
        $listdata = DB::table('ref.jenis_evaluasi')->select('id_jns_eval','ket_hapus_buku','ket_jns_eval')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_eval'  => $each_data->id_jns_eval,
                'nm_jns_eval'  => $each_data->nm_jns_eval,
                'ket_jns_eval'  => $each_data->ket_jns_eval
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

        /**
     * @OA\Get(
     *      path="/referensi/jenis_hapus_buku",
     *      operationId="getJenisHapusBuku",
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
    public function jenis_hapus_buku(Request $request)
    {
        $listdata = DB::table('ref.jenis_hapus_buku')->select('id_hapus_buku','ket_hapus_buku')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_hapus_buku'  => $each_data->id_hapus_buku,
                'ket_hapus_buku'  => $each_data->ket_hapus_buku
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

            /**
     * @OA\Get(
     *      path="/referensi/jenis_keluar",
     *      operationId="getJenisKeluar",
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
    public function jenis_keluar(Request $request)
    {
        $listdata = DB::table('ref.jenis_keluar')->select('id_jns_keluar','ket_keluar','a_pd','a_ptk', 'a_sdm_iptek')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_keluar'  => $each_data->id_jns_keluar,
                'ket_keluar'  => $each_data->ket_keluar,
                'a_pd'  => $each_data->a_pd,
                'a_ptk'  => $each_data->a_ptk,
                'a_sdm_iptek'  => $each_data->a_sdm_iptek
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    /**
     * @OA\Get(
     *      path="/referensi/jenis_kepanitiaan",
     *      operationId="getJenisKepanitiaan",
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
    public function jenis_kepanitiaan(Request $request)
    {
        $listdata = DB::table('ref.jenis_kepanitiaan')->select('id_jns_panitia','nm_jns_panitia')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_panitia'  => $each_data->id_jns_panitia,
                'nm_jns_panitia'  => $each_data->nm_jns_panitia
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    /**
     * @OA\Get(
     *      path="/referensi/jenis_kesejahteraan",
     *      operationId="getJenisKesejahteraan",
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
    public function jenis_kesejahteraan(Request $request)
    {
        $listdata = DB::table('ref.jenis_kesejahteraan')->select('id_jns_sejahtera','nm_jns_sejahtera')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_sejahtera'  => $each_data->id_jns_sejahtera,
                'nm_jns_sejahtera'  => $each_data->nm_jns_sejahtera
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    /**
     * @OA\Get(
     *      path="/referensi/jenis_keuangan",
     *      operationId="getJenisKeuangan",
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
    public function jenis_keuangan(Request $request)
    {
        $listdata = DB::table('ref.jenis_keuangan')->select('id_jns_keuangan','nm_jns_keuangan','a_pengeluaran','a_pemasukan')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_keuangan'  => $each_data->id_jns_keuangan,
                'nm_jns_keuangan'  => $each_data->nm_jns_keuangan,
                'a_pengeluaran'  => $each_data->a_pengeluaran,
                'a_pemasukan'  => $each_data->a_pemasukan
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    /**
     * @OA\Get(
     *      path="/referensi/jenis_lembaga",
     *      operationId="getJenisLembaga",
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
    public function jenis_lembaga(Request $request)
    {
        $listdata = DB::table('ref.jenis_lembaga')->select('id_jns_lemb','nm_jns_lemb','a_sp','a_lemb_akred','a_pengelola_pendidikan','a_sms','a_tmpt_pengawas','a_lemb_iptek','a_smi','sort')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_lemb'  => $each_data->id_jns_lemb,
                'nm_jns_lemb'  => $each_data->nm_jns_lemb,
                'a_sp'  => $each_data->a_sp,
                'a_lemb_akred'  => $each_data->a_lemb_akred,
                'a_pengelola_pendidikan'  => $each_data->a_pengelola_pendidikan,
                'a_sms'  => $each_data->a_sms,
                'a_tmpt_pengawas'  => $each_data->a_tmpt_pengawas,
                'a_lemb_iptek'  => $each_data->a_lemb_iptek,
                'a_smi'  => $each_data->a_smi,
                'sort'  => $each_data->sort,

            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    /**
     * @OA\Get(
     *      path="/referensi/jenis_media_pub",
     *      operationId="getJenisMediaPub",
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
    public function jenis_media_pub(Request $request)
    {
        $listdata = DB::table('ref.jenis_media_pub')->select('id_jns_media','nm_jns_media')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_media'  => $each_data->id_jns_media,
                'nm_jns_media'  => $each_data->nm_jns_media
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    /**
     * @OA\Get(
     *      path="/referensi/jenis_pendaftaran",
     *      operationId="getJenisPendaftaran",
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
    public function jenis_pendaftaran(Request $request)
    {
        $listdata = DB::table('ref.jenis_pendaftaran')->select('id_jns_daftar','nm_jns_daftar','u_daftar_sekolah','u_daftar_rombel')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_daftar'  => $each_data->id_jns_daftar,
                'nm_jns_daftar'  => $each_data->nm_jns_daftar,
                'u_daftar_sekolah'  => $each_data->u_daftar_sekolah,
                'u_daftar_rombel'  => $each_data->u_daftar_rombel,

            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    /**
     * @OA\Get(
     *      path="/referensi/jenis_penelitian",
     *      operationId="getJenisPenelitian",
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
    public function jenis_penelitian(Request $request)
    {
        $listdata = DB::table('ref.jenis_penelitian')->select('id_jns_lit','nm_jns_media')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_lit'  => $each_data->id_jns_lit,
                'nm_jns_media'  => $each_data->nm_jns_media
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    /**
     * @OA\Get(
     *      path="/referensi/jenis_penghargaan",
     *      operationId="getJenisPenghargaan",
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
    public function jenis_penghargaan(Request $request)
    {
        $listdata = DB::table('ref.jenis_penghargaan')->select('id_jns_penghargaan','nm_jns_penghargaan','u_sdm,', 'u_lembaga')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jns_penghargaan'  => $each_data->id_jns_penghargaan,
                'nm_jns_penghargaan,'  => $each_data->nm_jns_penghargaan,
                'u_sdm,'  => $each_data->u_sdm,
                'u_lembaga,'  => $each_data->u_lembaga,
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    /**
     * @OA\Get(
     *      path="/referensi/jenis_prasarana",
     *      operationId="getJenisPrasarana",
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
    public function jenis_prasarana(Request $request)
    {
        $listdata = DB::table('ref.jenis_prasarana')->select('jenis_prasarana','nm_jns_prasarana')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'jenis_prasarana'  => $each_data->jenis_prasarana,
                'nm_jns_prasarana'  => $each_data->nm_jns_prasarana
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }

    /**
     * @OA\Get(
     *      path="/referensi/jenis_prestasi",
     *      operationId="getJenisPrestasi",
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
    public function jenis_prestasi(Request $request)
    {
        $listdata = DB::table('ref.jenis_prestasi')->select('id_jenis_prestasi','nm_jenis_prestasi')->get();
        foreach ($listdata AS $each_data) {
            $data[] = [
                'id_jenis_prestasi'  => $each_data->id_jenis_prestasi,
                'nm_jenis_prestasi'  => $each_data->nm_jenis_prestasi
            ];
        }
        return response()->json([
            'status' => true,
            'message'=> 'success',
            'data'  => $data
        ]);
    }
}
