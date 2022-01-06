<?php

namespace App\Http\Controllers\PDUT\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReferensiController extends Controller
{
    /**
     * @OA\Get(
     *      path="/referensi/wilayah",
     *      operationId="getWilayah",
     *      tags={"Referensi"},
     *      summary="Get list of projects Wilayah",
     *      description="Returns list of Wilayah",
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
    public function wilayah(Request $request)
    {
        $listdata = DB::table('ref.wilayah')->select('asal_wil', 'id_induk_wilayah', 'id_level_wil', 'id_negara', 'id_wil', 'kode_bps', 'kode_dagri', 'kode_keu', 'nm_wil')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'asal_wil' => $each_data->asal_wil,
                'id_induk_wilayah' => $each_data->id_induk_wilayah,
                'id_level_wil' => $each_data->id_level_wil,
                'id_negara' => $each_data->id_negara,
                'id_wil' => $each_data->id_wil,
                'kode_bps' => $each_data->kode_bps,
                'kode_dagri' => $each_data->kode_dagri,
                'kode_keu' => $each_data->kode_keu,
                'nm_wil' => $each_data->nm_wil,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/tse",
     *      operationId="getTse",
     *      tags={"Referensi"},
     *      summary="Get list of projects Tse",
     *      description="Returns list of Tse",
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
    public function tse(Request $request)
    {
        $listdata = DB::table('ref.tse')->select('id_tse', 'kode_tse', 'nm_tse')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_tse' => $each_data->id_tse,
                'kode_tse' => $each_data->kode_tse,
                'nm_tse' => $each_data->nm_tse,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/tingkat_prestasi",
     *      operationId="getTingkatPrestasi",
     *      tags={"Referensi"},
     *      summary="Get list of projects TingkatPrestasi",
     *      description="Returns list of TingkatPrestasi",
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
    public function tingkat_prestasi(Request $request)
    {
        $listdata = DB::table('ref.tingkat_prestasi')->select('id_tkt_prestasi', 'nm_tkt_prestasi')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_tkt_prestasi' => $each_data->id_tkt_prestasi,
                'nm_tkt_prestasi' => $each_data->nm_tkt_prestasi,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/tingkat_penghargaan",
     *      operationId="getTingkatPenghargaan",
     *      tags={"Referensi"},
     *      summary="Get list of projects TingkatPenghargaan",
     *      description="Returns list of TingkatPenghargaan",
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
    public function tingkat_penghargaan(Request $request)
    {
        $listdata = DB::table('ref.tingkat_penghargaan')->select('id_tkt_penghargaan', 'nm_tkt_penghargaan')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_tkt_penghargaan' => $each_data->id_tkt_penghargaan,
                'nm_tkt_penghargaan' => $each_data->nm_tkt_penghargaan,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/tahun_anggaran",
     *      operationId="getTahunAnggaran",
     *      tags={"Referensi"},
     *      summary="Get list of projects TahunAnggaran",
     *      description="Returns list of TahunAnggaran",
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
    public function tahun_anggaran(Request $request)
    {
        $listdata = DB::table('ref.tahun_anggaran')->select('a_periode_aktif', 'id_tahun_anggaran', 'nm_tahun_anggaran', 'tgl_mulai', 'tgl_selesai')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_periode_aktif' => $each_data->a_periode_aktif,
                'id_tahun_anggaran' => $each_data->id_tahun_anggaran,
                'nm_tahun_anggaran' => $each_data->nm_tahun_anggaran,
                'tgl_mulai' => $each_data->tgl_mulai,
                'tgl_selesai' => $each_data->tgl_selesai,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/tahun_ajaran",
     *      operationId="getTahunAjaran",
     *      tags={"Referensi"},
     *      summary="Get list of projects TahunAjaran",
     *      description="Returns list of TahunAjaran",
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
    public function tahun_ajaran(Request $request)
    {
        $listdata = DB::table('ref.tahun_ajaran')->select('a_periode_aktif', 'id_thn_ajaran', 'nm_thn_ajaran', 'tgl_mulai', 'tgl_selesai')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_periode_aktif' => $each_data->a_periode_aktif,
                'id_thn_ajaran' => $each_data->id_thn_ajaran,
                'nm_thn_ajaran' => $each_data->nm_thn_ajaran,
                'tgl_mulai' => $each_data->tgl_mulai,
                'tgl_selesai' => $each_data->tgl_selesai,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/sumber_dana",
     *      operationId="getSumberDana",
     *      tags={"Referensi"},
     *      summary="Get list of projects SumberDana",
     *      description="Returns list of SumberDana",
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
    public function sumber_dana(Request $request)
    {
        $listdata = DB::table('ref.sumber_dana')->select('id_sumber_dana', 'nm_sumber_dana', 'u_beasiswa', 'u_blockgrant', 'u_lit', 'u_unit_usaha')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_sumber_dana' => $each_data->id_sumber_dana,
                'nm_sumber_dana' => $each_data->nm_sumber_dana,
                'u_beasiswa' => $each_data->u_beasiswa,
                'u_blockgrant' => $each_data->u_blockgrant,
                'u_lit' => $each_data->u_lit,
                'u_unit_usaha' => $each_data->u_unit_usaha,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/status_milik_sarpras",
     *      operationId="getStatusMilikSarpras",
     *      tags={"Referensi"},
     *      summary="Get list of projects StatusMilikSarpras",
     *      description="Returns list of StatusMilikSarpras",
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
    public function status_milik_sarpras(Request $request)
    {
        $listdata = DB::table('ref.status_milik_sarpras')->select('id_stat_milik_sarpras', 'nm_stat_milik_sarpras')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_stat_milik_sarpras' => $each_data->id_stat_milik_sarpras,
                'nm_stat_milik_sarpras' => $each_data->nm_stat_milik_sarpras,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/status_mahasiswa",
     *      operationId="getStatusMahasiswa",
     *      tags={"Referensi"},
     *      summary="Get list of projects StatusMahasiswa",
     *      description="Returns list of StatusMahasiswa",
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
    public function status_mahasiswa(Request $request)
    {
        $listdata = DB::table('ref.status_mahasiswa')->select('id_stat_mhs', 'ket_stat_mhs', 'nm_stat_mhs')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_stat_mhs' => $each_data->id_stat_mhs,
                'ket_stat_mhs' => $each_data->ket_stat_mhs,
                'nm_stat_mhs' => $each_data->nm_stat_mhs,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/status_kepemilikan",
     *      operationId="getStatusKepemilikan",
     *      tags={"Referensi"},
     *      summary="Get list of projects StatusKepemilikan",
     *      description="Returns list of StatusKepemilikan",
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
    public function status_kepemilikan(Request $request)
    {
        $listdata = DB::table('ref.status_kepemilikan')->select('id_stat_milik', 'nm_stat_milik')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_stat_milik' => $each_data->id_stat_milik,
                'nm_stat_milik' => $each_data->nm_stat_milik,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/status_kepegawaian",
     *      operationId="getStatusKepegawaian",
     *      tags={"Referensi"},
     *      summary="Get list of projects StatusKepegawaian",
     *      description="Returns list of StatusKepegawaian",
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
    public function status_kepegawaian(Request $request)
    {
        $listdata = DB::table('ref.status_kepegawaian')->select('id_stat_pegawai', 'nm_stat_pegawai')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_stat_pegawai' => $each_data->id_stat_pegawai,
                'nm_stat_pegawai' => $each_data->nm_stat_pegawai,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/status_keaktifan_pegawai",
     *      operationId="getStatusKeaktifanPegawai",
     *      tags={"Referensi"},
     *      summary="Get list of projects StatusKeaktifanPegawai",
     *      description="Returns list of StatusKeaktifanPegawai",
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
    public function status_keaktifan_pegawai(Request $request)
    {
        $listdata = DB::table('ref.status_keaktifan_pegawai')->select('id_stat_aktif', 'nm_stat_aktif')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_stat_aktif' => $each_data->id_stat_aktif,
                'nm_stat_aktif' => $each_data->nm_stat_aktif,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/status_anak",
     *      operationId="getStatusAnak",
     *      tags={"Referensi"},
     *      summary="Get list of projects StatusAnak",
     *      description="Returns list of StatusAnak",
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
    public function status_anak(Request $request)
    {
        $listdata = DB::table('ref.status_anak')->select('id_stat_anak', 'nm_stat_anak')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_stat_anak' => $each_data->id_stat_anak,
                'nm_stat_anak' => $each_data->nm_stat_anak,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/skim_kegiatan",
     *      operationId="getSkimKegiatan",
     *      tags={"Referensi"},
     *      summary="Get list of projects SkimKegiatan",
     *      description="Returns list of SkimKegiatan",
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
    public function skim_kegiatan(Request $request)
    {
        $listdata = DB::table('ref.skim_kegiatan')->select('dana_maks_thn_berjalan', 'dana_min_thn_berjalan', 'deviasi_nilai', 'id_jenj_didik', 'id_skim', 'jml_maks_keikutsertaan', 'jml_maks_personil', 'jml_maks_sbg_ketua', 'jml_min_personil', 'kd_skim', 'ket_skim', 'nm_singkat_skim', 'nm_skim', 'passing_grade', 'tst_skim')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'dana_maks_thn_berjalan' => $each_data->dana_maks_thn_berjalan,
                'dana_min_thn_berjalan' => $each_data->dana_min_thn_berjalan,
                'deviasi_nilai' => $each_data->deviasi_nilai,
                'id_jenj_didik' => $each_data->id_jenj_didik,
                'id_skim' => $each_data->id_skim,
                'jml_maks_keikutsertaan' => $each_data->jml_maks_keikutsertaan,
                'jml_maks_personil' => $each_data->jml_maks_personil,
                'jml_maks_sbg_ketua' => $each_data->jml_maks_sbg_ketua,
                'jml_min_personil' => $each_data->jml_min_personil,
                'kd_skim' => $each_data->kd_skim,
                'ket_skim' => $each_data->ket_skim,
                'nm_singkat_skim' => $each_data->nm_singkat_skim,
                'nm_skim' => $each_data->nm_skim,
                'passing_grade' => $each_data->passing_grade,
                'tst_skim' => $each_data->tst_skim,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/semester",
     *      operationId="getSemester",
     *      tags={"Referensi"},
     *      summary="Get list of projects Semester",
     *      description="Returns list of Semester",
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
    public function semester(Request $request)
    {
        $listdata = DB::table('ref.semester')->select('a_periode_aktif', 'id_smt', 'id_thn_ajaran', 'nm_smt', 'smt', 'tgl_mulai', 'tgl_selesai')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_periode_aktif' => $each_data->a_periode_aktif,
                'id_smt' => $each_data->id_smt,
                'id_thn_ajaran' => $each_data->id_thn_ajaran,
                'nm_smt' => $each_data->nm_smt,
                'smt' => $each_data->smt,
                'tgl_mulai' => $each_data->tgl_mulai,
                'tgl_selesai' => $each_data->tgl_selesai,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/satuan",
     *      operationId="getSatuan",
     *      tags={"Referensi"},
     *      summary="Get list of projects Satuan",
     *      description="Returns list of Satuan",
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
    public function satuan(Request $request)
    {
        $listdata = DB::table('ref.satuan')->select('kd_satuan', 'nm_satuan')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'kd_satuan' => $each_data->kd_satuan,
                'nm_satuan' => $each_data->nm_satuan,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/penghasilan",
     *      operationId="getPenghasilan",
     *      tags={"Referensi"},
     *      summary="Get list of projects Penghasilan",
     *      description="Returns list of Penghasilan",
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
    public function penghasilan(Request $request)
    {
        $listdata = DB::table('ref.penghasilan')->select('id_penghasilan', 'nm_penghasilan')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_penghasilan' => $each_data->id_penghasilan,
                'nm_penghasilan' => $each_data->nm_penghasilan,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/pembiayaan",
     *      operationId="getPembiayaan",
     *      tags={"Referensi"},
     *      summary="Get list of projects Pembiayaan",
     *      description="Returns list of Pembiayaan",
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
    public function pembiayaan(Request $request)
    {
        $listdata = DB::table('ref.pembiayaan')->select('id_pembiayaan', 'nm_pembiayaan')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_pembiayaan' => $each_data->id_pembiayaan,
                'nm_pembiayaan' => $each_data->nm_pembiayaan,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/pekerjaan",
     *      operationId="getPekerjaan",
     *      tags={"Referensi"},
     *      summary="Get list of projects Pekerjaan",
     *      description="Returns list of Pekerjaan",
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
    public function pekerjaan(Request $request)
    {
        $listdata = DB::table('ref.pekerjaan')->select('id_pekerjaan', 'nm_pekerjaan')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_pekerjaan' => $each_data->id_pekerjaan,
                'nm_pekerjaan' => $each_data->nm_pekerjaan,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/pangkat_golongan",
     *      operationId="getPangkatGolongan",
     *      tags={"Referensi"},
     *      summary="Get list of projects PangkatGolongan",
     *      description="Returns list of PangkatGolongan",
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
    public function pangkat_golongan(Request $request)
    {
        $listdata = DB::table('ref.pangkat_golongan')->select('id_pangkat_gol', 'kode_gol', 'nm_pangkat')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_pangkat_gol' => $each_data->id_pangkat_gol,
                'kode_gol' => $each_data->kode_gol,
                'nm_pangkat' => $each_data->nm_pangkat,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/nilai_akred",
     *      operationId="getNilaiAkred",
     *      tags={"Referensi"},
     *      summary="Get list of projects NilaiAkred",
     *      description="Returns list of NilaiAkred",
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
    public function nilai_akred(Request $request)
    {
        $listdata = DB::table('ref.nilai_akred')->select('id_akred', 'nm_akred')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_akred' => $each_data->id_akred,
                'nm_akred' => $each_data->nm_akred,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/negara",
     *      operationId="getNegara",
     *      tags={"Referensi"},
     *      summary="Get list of projects Negara",
     *      description="Returns list of Negara",
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
    public function negara(Request $request)
    {
        $listdata = DB::table('ref.negara')->select('a_ln', 'benua', 'id_negara', 'nm_negara')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_ln' => $each_data->a_ln,
                'benua' => $each_data->benua,
                'id_negara' => $each_data->id_negara,
                'nm_negara' => $each_data->nm_negara,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/media_publikasi",
     *      operationId="getMediaPublikasi",
     *      tags={"Referensi"},
     *      summary="Get list of projects MediaPublikasi",
     *      description="Returns list of MediaPublikasi",
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
    public function media_publikasi(Request $request)
    {
        $listdata = DB::table('ref.media_publikasi')->select('bentuk_media_pub', 'grade_sinta', 'id_jns_media', 'id_kel_bidang', 'id_media_pub', 'id_negara', 'id_sp', 'jns_penerbit', 'nm_media_pub')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'bentuk_media_pub' => $each_data->bentuk_media_pub,
                'grade_sinta' => $each_data->grade_sinta,
                'id_jns_media' => $each_data->id_jns_media,
                'id_kel_bidang' => $each_data->id_kel_bidang,
                'id_media_pub' => $each_data->id_media_pub,
                'id_negara' => $each_data->id_negara,
                'id_sp' => $each_data->id_sp,
                'jns_penerbit' => $each_data->jns_penerbit,
                'nm_media_pub' => $each_data->nm_media_pub,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/level_wilayah",
     *      operationId="getLevelWilayah",
     *      tags={"Referensi"},
     *      summary="Get list of projects LevelWilayah",
     *      description="Returns list of LevelWilayah",
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
    public function level_wilayah(Request $request)
    {
        $listdata = DB::table('ref.level_wilayah')->select('id_level_wil', 'nm_level_wilayah')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_level_wil' => $each_data->id_level_wil,
                'nm_level_wilayah' => $each_data->nm_level_wilayah,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/lembaga_pengangkat",
     *      operationId="getLembagaPengangkat",
     *      tags={"Referensi"},
     *      summary="Get list of projects LembagaPengangkat",
     *      description="Returns list of LembagaPengangkat",
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
    public function lembaga_pengangkat(Request $request)
    {
        $listdata = DB::table('ref.lembaga_pengangkat')->select('id_lemb_angkat', 'nm_lemb_angkat')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_lemb_angkat' => $each_data->id_lemb_angkat,
                'nm_lemb_angkat' => $each_data->nm_lemb_angkat,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/lembaga_akred",
     *      operationId="getLembagaAkred",
     *      tags={"Referensi"},
     *      summary="Get list of projects LembagaAkred",
     *      description="Returns list of LembagaAkred",
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
    public function lembaga_akred(Request $request)
    {
        $listdata = DB::table('ref.lembaga_akred')->select('bujur', 'ds_kel', 'email', 'id_lemb_akred', 'jln', 'kd_kl', 'kd_satker', 'ket', 'kode_pos', 'lintang', 'nm_dsn', 'nm_lemb', 'no_fax', 'no_tel', 'rt', 'rw', 'target_akred', 'tgl_mulai_beroperasi', 'website')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'bujur' => $each_data->bujur,
                'ds_kel' => $each_data->ds_kel,
                'email' => $each_data->email,
                'id_lemb_akred' => $each_data->id_lemb_akred,
                'jln' => $each_data->jln,
                'kd_kl' => $each_data->kd_kl,
                'kd_satker' => $each_data->kd_satker,
                'ket' => $each_data->ket,
                'kode_pos' => $each_data->kode_pos,
                'lintang' => $each_data->lintang,
                'nm_dsn' => $each_data->nm_dsn,
                'nm_lemb' => $each_data->nm_lemb,
                'no_fax' => $each_data->no_fax,
                'no_tel' => $each_data->no_tel,
                'rt' => $each_data->rt,
                'rw' => $each_data->rw,
                'target_akred' => $each_data->target_akred,
                'tgl_mulai_beroperasi' => $each_data->tgl_mulai_beroperasi,
                'website' => $each_data->website,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/kelompok_usaha",
     *      operationId="getKelompokUsaha",
     *      tags={"Referensi"},
     *      summary="Get list of projects KelompokUsaha",
     *      description="Returns list of KelompokUsaha",
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
    public function kelompok_usaha(Request $request)
    {
        $listdata = DB::table('ref.kelompok_usaha')->select('id_kel_usaha', 'nm_kel_usaha')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_kel_usaha' => $each_data->id_kel_usaha,
                'nm_kel_usaha' => $each_data->nm_kel_usaha,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/kelompok_profesi",
     *      operationId="getKelompokProfesi",
     *      tags={"Referensi"},
     *      summary="Get list of projects KelompokProfesi",
     *      description="Returns list of KelompokProfesi",
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
    public function kelompok_profesi(Request $request)
    {
        $listdata = DB::table('ref.kelompok_profesi')->select('id_kel_prof', 'ket_kel_prof', 'nm_kel_prof')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_kel_prof' => $each_data->id_kel_prof,
                'ket_kel_prof' => $each_data->ket_kel_prof,
                'nm_kel_prof' => $each_data->nm_kel_prof,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/kelompok_bidang",
     *      operationId="getKelompokBidang",
     *      tags={"Referensi"},
     *      summary="Get list of projects KelompokBidang",
     *      description="Returns list of KelompokBidang",
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
    public function kelompok_bidang(Request $request)
    {
        $listdata = DB::table('ref.kelompok_bidang')->select('a_leaf_node', 'id_induk_bidang', 'id_kel_bidang', 'kat_kel', 'ket_kel_bidang', 'kode_kel_bidang', 'nm_kel_bidang', 'u_iptek', 'u_kepakaran', 'u_pt', 'u_sma', 'u_smk')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_leaf_node' => $each_data->a_leaf_node,
                'id_induk_bidang' => $each_data->id_induk_bidang,
                'id_kel_bidang' => $each_data->id_kel_bidang,
                'kat_kel' => $each_data->kat_kel,
                'ket_kel_bidang' => $each_data->ket_kel_bidang,
                'kode_kel_bidang' => $each_data->kode_kel_bidang,
                'nm_kel_bidang' => $each_data->nm_kel_bidang,
                'u_iptek' => $each_data->u_iptek,
                'u_kepakaran' => $each_data->u_kepakaran,
                'u_pt' => $each_data->u_pt,
                'u_sma' => $each_data->u_sma,
                'u_smk' => $each_data->u_smk,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/kebutuhan_khusus",
     *      operationId="getKebutuhanKhusus",
     *      tags={"Referensi"},
     *      summary="Get list of projects KebutuhanKhusus",
     *      description="Returns list of KebutuhanKhusus",
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
    public function kebutuhan_khusus(Request $request)
    {
        $listdata = DB::table('ref.kebutuhan_khusus')->select('id_kk', 'nm_kk')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_kk' => $each_data->id_kk,
                'nm_kk' => $each_data->nm_kk,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/keahlian_lab",
     *      operationId="getKeahlianLab",
     *      tags={"Referensi"},
     *      summary="Get list of projects KeahlianLab",
     *      description="Returns list of KeahlianLab",
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
    public function keahlian_lab(Request $request)
    {
        $listdata = DB::table('ref.keahlian_lab')->select('id_keahlian_lab', 'nm_keahlian_lab')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_keahlian_lab' => $each_data->id_keahlian_lab,
                'nm_keahlian_lab' => $each_data->nm_keahlian_lab,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/kbli",
     *      operationId="getKbli",
     *      tags={"Referensi"},
     *      summary="Get list of projects Kbli",
     *      description="Returns list of Kbli",
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
    public function kbli(Request $request)
    {
        $listdata = DB::table('ref.kbli')->select('id_induk_kbli', 'id_kbli', 'judul', 'kategori', 'kode', 'lv_kbli')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_induk_kbli' => $each_data->id_induk_kbli,
                'id_kbli' => $each_data->id_kbli,
                'judul' => $each_data->judul,
                'kategori' => $each_data->kategori,
                'kode' => $each_data->kode,
                'lv_kbli' => $each_data->lv_kbli,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/kategori_kegiatan",
     *      operationId="getKategoriKegiatan",
     *      tags={"Referensi"},
     *      summary="Get list of projects KategoriKegiatan",
     *      description="Returns list of KategoriKegiatan",
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
    public function kategori_kegiatan(Request $request)
    {
        $listdata = DB::table('ref.kategori_kegiatan')->select('a_aktif', 'a_anak_bimb', 'a_judul', 'a_peer_review', 'a_sk', 'acuan_waktu', 'ak', 'ak_maks', 'id_induk_katgiat', 'id_jns_sdm', 'id_katgiat', 'kat_unsur', 'ket', 'kode_kat_bkd', 'kode_kat_pak', 'level_kat', 'nm_kat', 'satuan_nilai', 'sks_bkd', 'teks_judul', 'teks_lokasi', 'teks_sk', 'teks_tgl_sk', 'u_bkd', 'u_pak')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_aktif' => $each_data->a_aktif,
                'a_anak_bimb' => $each_data->a_anak_bimb,
                'a_judul' => $each_data->a_judul,
                'a_peer_review' => $each_data->a_peer_review,
                'a_sk' => $each_data->a_sk,
                'acuan_waktu' => $each_data->acuan_waktu,
                'ak' => $each_data->ak,
                'ak_maks' => $each_data->ak_maks,
                'id_induk_katgiat' => $each_data->id_induk_katgiat,
                'id_jns_sdm' => $each_data->id_jns_sdm,
                'id_katgiat' => $each_data->id_katgiat,
                'kat_unsur' => $each_data->kat_unsur,
                'ket' => $each_data->ket,
                'kode_kat_bkd' => $each_data->kode_kat_bkd,
                'kode_kat_pak' => $each_data->kode_kat_pak,
                'level_kat' => $each_data->level_kat,
                'nm_kat' => $each_data->nm_kat,
                'satuan_nilai' => $each_data->satuan_nilai,
                'sks_bkd' => $each_data->sks_bkd,
                'teks_judul' => $each_data->teks_judul,
                'teks_lokasi' => $each_data->teks_lokasi,
                'teks_sk' => $each_data->teks_sk,
                'teks_tgl_sk' => $each_data->teks_tgl_sk,
                'u_bkd' => $each_data->u_bkd,
                'u_pak' => $each_data->u_pak,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/kategori_capaian_luaran",
     *      operationId="getKategoriCapaianLuaran",
     *      tags={"Referensi"},
     *      summary="Get list of projects KategoriCapaianLuaran",
     *      description="Returns list of KategoriCapaianLuaran",
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
    public function kategori_capaian_luaran(Request $request)
    {
        $listdata = DB::table('ref.kategori_capaian_luaran')->select('id_kat_capaian', 'nm_kat_capaian')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_kat_capaian' => $each_data->id_kat_capaian,
                'nm_kat_capaian' => $each_data->nm_kat_capaian,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jurusan",
     *      operationId="getJurusan",
     *      tags={"Referensi"},
     *      summary="Get list of projects Jurusan",
     *      description="Returns list of Jurusan",
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
    public function jurusan(Request $request)
    {
        $listdata = DB::table('ref.jurusan')->select('id_induk_jurusan', 'id_jenj_didik', 'id_jur', 'id_kel_bidang', 'nm_intl_jur', 'nm_jur', 'u_pt', 'u_slb', 'u_sma', 'u_smk')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_induk_jurusan' => $each_data->id_induk_jurusan,
                'id_jenj_didik' => $each_data->id_jenj_didik,
                'id_jur' => $each_data->id_jur,
                'id_kel_bidang' => $each_data->id_kel_bidang,
                'nm_intl_jur' => $each_data->nm_intl_jur,
                'nm_jur' => $each_data->nm_jur,
                'u_pt' => $each_data->u_pt,
                'u_slb' => $each_data->u_slb,
                'u_sma' => $each_data->u_sma,
                'u_smk' => $each_data->u_smk,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenjang_pendidikan",
     *      operationId="getJenjangPendidikan",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenjangPendidikan",
     *      description="Returns list of JenjangPendidikan",
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
    public function jenjang_pendidikan(Request $request)
    {
        $listdata = DB::table('ref.jenjang_pendidikan')->select('id_jenj_didik', 'nm_jenj_didik', 'u_jenj_lemb', 'u_jenj_org')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jenj_didik' => $each_data->id_jenj_didik,
                'nm_jenj_didik' => $each_data->nm_jenj_didik,
                'u_jenj_lemb' => $each_data->u_jenj_lemb,
                'u_jenj_org' => $each_data->u_jenj_org,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_tunjangan",
     *      operationId="getJenisTunjangan",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisTunjangan",
     *      description="Returns list of JenisTunjangan",
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
    public function jenis_tunjangan(Request $request)
    {
        $listdata = DB::table('ref.jenis_tunjangan')->select('id_jns_tunj', 'nm_jns_tunj')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_tunj' => $each_data->id_jns_tunj,
                'nm_jns_tunj' => $each_data->nm_jns_tunj,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_tinggal",
     *      operationId="getJenisTinggal",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisTinggal",
     *      description="Returns list of JenisTinggal",
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
    public function jenis_tinggal(Request $request)
    {
        $listdata = DB::table('ref.jenis_tinggal')->select('id_jns_tinggal', 'nm_jns_tinggal')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_tinggal' => $each_data->id_jns_tinggal,
                'nm_jns_tinggal' => $each_data->nm_jns_tinggal,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_tes",
     *      operationId="getJenisTes",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisTes",
     *      description="Returns list of JenisTes",
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
    public function jenis_tes(Request $request)
    {
        $listdata = DB::table('ref.jenis_tes')->select('id_jns_tes', 'ket', 'nilai_maks', 'nm_jns_tes')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_tes' => $each_data->id_jns_tes,
                'ket' => $each_data->ket,
                'nilai_maks' => $each_data->nilai_maks,
                'nm_jns_tes' => $each_data->nm_jns_tes,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_subst",
     *      operationId="getJenisSubst",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisSubst",
     *      description="Returns list of JenisSubst",
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
    public function jenis_subst(Request $request)
    {
        $listdata = DB::table('ref.jenis_subst')->select('id_jns_subst', 'nm_jns_subst')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_subst' => $each_data->id_jns_subst,
                'nm_jns_subst' => $each_data->nm_jns_subst,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_sms",
     *      operationId="getJenisSms",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisSms",
     *      description="Returns list of JenisSms",
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
    public function jenis_sms(Request $request)
    {
        $listdata = DB::table('ref.jenis_sms')->select('id_jns_sms', 'nm_jns_sms')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_sms' => $each_data->id_jns_sms,
                'nm_jns_sms' => $each_data->nm_jns_sms,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_sert",
     *      operationId="getJenisSert",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisSert",
     *      description="Returns list of JenisSert",
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
    public function jenis_sert(Request $request)
    {
        $listdata = DB::table('ref.jenis_sert')->select('id_jns_sert', 'nm_jns_sert', 'u_kepsek', 'u_laboran', 'u_lembaga', 'u_prof_dosen', 'u_prof_guru')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_sert' => $each_data->id_jns_sert,
                'nm_jns_sert' => $each_data->nm_jns_sert,
                'u_kepsek' => $each_data->u_kepsek,
                'u_laboran' => $each_data->u_laboran,
                'u_lembaga' => $each_data->u_lembaga,
                'u_prof_dosen' => $each_data->u_prof_dosen,
                'u_prof_guru' => $each_data->u_prof_guru,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_sdm",
     *      operationId="getJenisSdm",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisSdm",
     *      description="Returns list of JenisSdm",
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
    public function jenis_sdm(Request $request)
    {
        $listdata = DB::table('ref.jenis_sdm')->select('a_dosen', 'a_formal', 'a_guru_bk', 'a_guru_inklusi', 'a_guru_kelas', 'a_guru_mapel', 'a_peneliti', 'a_pengawas_bid', 'a_pengawas_mapel', 'a_pengawas_plb', 'a_pengawas_sp', 'a_perekayasa', 'a_pranata_1', 'a_pranata_2', 'a_pranata_3', 'a_pranata_4', 'a_pranata_5', 'a_pranata_6', 'a_pranata_7', 'a_pranata_8', 'a_pranata_9', 'a_tas', 'id_jns_sdm', 'nm_jns_sdm')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_dosen' => $each_data->a_dosen,
                'a_formal' => $each_data->a_formal,
                'a_guru_bk' => $each_data->a_guru_bk,
                'a_guru_inklusi' => $each_data->a_guru_inklusi,
                'a_guru_kelas' => $each_data->a_guru_kelas,
                'a_guru_mapel' => $each_data->a_guru_mapel,
                'a_peneliti' => $each_data->a_peneliti,
                'a_pengawas_bid' => $each_data->a_pengawas_bid,
                'a_pengawas_mapel' => $each_data->a_pengawas_mapel,
                'a_pengawas_plb' => $each_data->a_pengawas_plb,
                'a_pengawas_sp' => $each_data->a_pengawas_sp,
                'a_perekayasa' => $each_data->a_perekayasa,
                'a_pranata_1' => $each_data->a_pranata_1,
                'a_pranata_2' => $each_data->a_pranata_2,
                'a_pranata_3' => $each_data->a_pranata_3,
                'a_pranata_4' => $each_data->a_pranata_4,
                'a_pranata_5' => $each_data->a_pranata_5,
                'a_pranata_6' => $each_data->a_pranata_6,
                'a_pranata_7' => $each_data->a_pranata_7,
                'a_pranata_8' => $each_data->a_pranata_8,
                'a_pranata_9' => $each_data->a_pranata_9,
                'a_tas' => $each_data->a_tas,
                'id_jns_sdm' => $each_data->id_jns_sdm,
                'nm_jns_sdm' => $each_data->nm_jns_sdm,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_sarana",
     *      operationId="getJenisSarana",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisSarana",
     *      description="Returns list of JenisSarana",
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
    public function jenis_sarana(Request $request)
    {
        $listdata = DB::table('ref.jenis_sarana')->select('a_penempatan', 'id_jns_sarana', 'kel', 'ket', 'nm_jns_sarana')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_penempatan' => $each_data->a_penempatan,
                'id_jns_sarana' => $each_data->id_jns_sarana,
                'kel' => $each_data->kel,
                'ket' => $each_data->ket,
                'nm_jns_sarana' => $each_data->nm_jns_sarana,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_publikasi",
     *      operationId="getJenisPublikasi",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisPublikasi",
     *      description="Returns list of JenisPublikasi",
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
    public function jenis_publikasi(Request $request)
    {
        $listdata = DB::table('ref.jenis_publikasi')->select('a_pub_prestasi', 'id_jns_pub', 'nm_jns_pub')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_pub_prestasi' => $each_data->a_pub_prestasi,
                'id_jns_pub' => $each_data->id_jns_pub,
                'nm_jns_pub' => $each_data->nm_jns_pub,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_prestasi",
     *      operationId="getJenisPrestasi",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisPrestasi",
     *      description="Returns list of JenisPrestasi",
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
        $listdata = DB::table('ref.jenis_prestasi')->select('id_jenis_prestasi', 'nm_jenis_prestasi')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jenis_prestasi' => $each_data->id_jenis_prestasi,
                'nm_jenis_prestasi' => $each_data->nm_jenis_prestasi,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_prasarana",
     *      operationId="getJenisPrasarana",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisPrasarana",
     *      description="Returns list of JenisPrasarana",
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
        $listdata = DB::table('ref.jenis_prasarana')->select('id_jns_prasarana', 'nm_jns_prasarana')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_prasarana' => $each_data->id_jns_prasarana,
                'nm_jns_prasarana' => $each_data->nm_jns_prasarana,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_penghargaan",
     *      operationId="getJenisPenghargaan",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisPenghargaan",
     *      description="Returns list of JenisPenghargaan",
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
        $listdata = DB::table('ref.jenis_penghargaan')->select('id_jns_penghargaan', 'nm_jns_penghargaan', 'u_lembaga', 'u_sdm')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_penghargaan' => $each_data->id_jns_penghargaan,
                'nm_jns_penghargaan' => $each_data->nm_jns_penghargaan,
                'u_lembaga' => $each_data->u_lembaga,
                'u_sdm' => $each_data->u_sdm,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_penelitian",
     *      operationId="getJenisPenelitian",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisPenelitian",
     *      description="Returns list of JenisPenelitian",
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
        $listdata = DB::table('ref.jenis_penelitian')->select('id_jns_lit', 'nm_jns_lit')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_lit' => $each_data->id_jns_lit,
                'nm_jns_lit' => $each_data->nm_jns_lit,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_pendaftaran",
     *      operationId="getJenisPendaftaran",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisPendaftaran",
     *      description="Returns list of JenisPendaftaran",
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
        $listdata = DB::table('ref.jenis_pendaftaran')->select('id_jns_daftar', 'nm_jns_daftar', 'u_daftar_rombel', 'u_daftar_sekolah')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_daftar' => $each_data->id_jns_daftar,
                'nm_jns_daftar' => $each_data->nm_jns_daftar,
                'u_daftar_rombel' => $each_data->u_daftar_rombel,
                'u_daftar_sekolah' => $each_data->u_daftar_sekolah,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_media_pub",
     *      operationId="getJenisMediaPub",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisMediaPub",
     *      description="Returns list of JenisMediaPub",
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
        $listdata = DB::table('ref.jenis_media_pub')->select('id_jns_media', 'nm_jns_media')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_media' => $each_data->id_jns_media,
                'nm_jns_media' => $each_data->nm_jns_media,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_lembaga",
     *      operationId="getJenisLembaga",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisLembaga",
     *      description="Returns list of JenisLembaga",
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
        $listdata = DB::table('ref.jenis_lembaga')->select('a_lemb_akred', 'a_lemb_iptek', 'a_pengelola_pendidikan', 'a_smi', 'a_sms', 'a_sp', 'a_tmpt_pengawas', 'id_jns_lemb', 'nm_jns_lemb', 'sort')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_lemb_akred' => $each_data->a_lemb_akred,
                'a_lemb_iptek' => $each_data->a_lemb_iptek,
                'a_pengelola_pendidikan' => $each_data->a_pengelola_pendidikan,
                'a_smi' => $each_data->a_smi,
                'a_sms' => $each_data->a_sms,
                'a_sp' => $each_data->a_sp,
                'a_tmpt_pengawas' => $each_data->a_tmpt_pengawas,
                'id_jns_lemb' => $each_data->id_jns_lemb,
                'nm_jns_lemb' => $each_data->nm_jns_lemb,
                'sort' => $each_data->sort,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_keuangan",
     *      operationId="getJenisKeuangan",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisKeuangan",
     *      description="Returns list of JenisKeuangan",
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
        $listdata = DB::table('ref.jenis_keuangan')->select('a_pemasukan', 'a_pengeluaran', 'id_jns_keuangan', 'nm_jns_keuangan')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_pemasukan' => $each_data->a_pemasukan,
                'a_pengeluaran' => $each_data->a_pengeluaran,
                'id_jns_keuangan' => $each_data->id_jns_keuangan,
                'nm_jns_keuangan' => $each_data->nm_jns_keuangan,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_kesejahteraan",
     *      operationId="getJenisKesejahteraan",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisKesejahteraan",
     *      description="Returns list of JenisKesejahteraan",
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
        $listdata = DB::table('ref.jenis_kesejahteraan')->select('id_jns_sejahtera', 'nm_jns_sejahtera')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_sejahtera' => $each_data->id_jns_sejahtera,
                'nm_jns_sejahtera' => $each_data->nm_jns_sejahtera,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_kepanitiaan",
     *      operationId="getJenisKepanitiaan",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisKepanitiaan",
     *      description="Returns list of JenisKepanitiaan",
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
        $listdata = DB::table('ref.jenis_kepanitiaan')->select('id_jns_panitia', 'nm_jns_panitia')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_panitia' => $each_data->id_jns_panitia,
                'nm_jns_panitia' => $each_data->nm_jns_panitia,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_keluar",
     *      operationId="getJenisKeluar",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisKeluar",
     *      description="Returns list of JenisKeluar",
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
        $listdata = DB::table('ref.jenis_keluar')->select('a_pd', 'a_ptk', 'a_sdm_iptek', 'id_jns_keluar', 'ket_keluar')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_pd' => $each_data->a_pd,
                'a_ptk' => $each_data->a_ptk,
                'a_sdm_iptek' => $each_data->a_sdm_iptek,
                'id_jns_keluar' => $each_data->id_jns_keluar,
                'ket_keluar' => $each_data->ket_keluar,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_hapus_buku",
     *      operationId="getJenisHapusBuku",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisHapusBuku",
     *      description="Returns list of JenisHapusBuku",
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
        $listdata = DB::table('ref.jenis_hapus_buku')->select('id_hapus_buku', 'ket_hapus_buku')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_hapus_buku' => $each_data->id_hapus_buku,
                'ket_hapus_buku' => $each_data->ket_hapus_buku,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_evaluasi",
     *      operationId="getJenisEvaluasi",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisEvaluasi",
     *      description="Returns list of JenisEvaluasi",
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
        $listdata = DB::table('ref.jenis_evaluasi')->select('id_jns_eval', 'ket_jns_eval', 'nm_jns_eval')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_eval' => $each_data->id_jns_eval,
                'ket_jns_eval' => $each_data->ket_jns_eval,
                'nm_jns_eval' => $each_data->nm_jns_eval,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_dokumen",
     *      operationId="getJenisDokumen",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisDokumen",
     *      description="Returns list of JenisDokumen",
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
    public function jenis_dokumen(Request $request)
    {
        $listdata = DB::table('ref.jenis_dokumen')->select('id_jns_dok', 'nm_jns_dok')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_dok' => $each_data->id_jns_dok,
                'nm_jns_dok' => $each_data->nm_jns_dok,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_diklat",
     *      operationId="getJenisDiklat",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisDiklat",
     *      description="Returns list of JenisDiklat",
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
    public function jenis_diklat(Request $request)
    {
        $listdata = DB::table('ref.jenis_diklat')->select('id_jns_diklat', 'nm_jns_diklat', 'u_dosen', 'u_guru', 'u_tendik')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_diklat' => $each_data->id_jns_diklat,
                'nm_jns_diklat' => $each_data->nm_jns_diklat,
                'u_dosen' => $each_data->u_dosen,
                'u_guru' => $each_data->u_guru,
                'u_tendik' => $each_data->u_tendik,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_beasiswa",
     *      operationId="getJenisBeasiswa",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisBeasiswa",
     *      description="Returns list of JenisBeasiswa",
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
    public function jenis_beasiswa(Request $request)
    {
        $listdata = DB::table('ref.jenis_beasiswa')->select('id_jns_beasiswa', 'id_sumber_dana', 'kat_beasiswa', 'nm_jns_beasiswa', 'u_non_ca', 'u_pd', 'u_ptk')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_beasiswa' => $each_data->id_jns_beasiswa,
                'id_sumber_dana' => $each_data->id_sumber_dana,
                'kat_beasiswa' => $each_data->kat_beasiswa,
                'nm_jns_beasiswa' => $each_data->nm_jns_beasiswa,
                'u_non_ca' => $each_data->u_non_ca,
                'u_pd' => $each_data->u_pd,
                'u_ptk' => $each_data->u_ptk,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_bahan_ajar",
     *      operationId="getJenisBahanAjar",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisBahanAjar",
     *      description="Returns list of JenisBahanAjar",
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
    public function jenis_bahan_ajar(Request $request)
    {
        $listdata = DB::table('ref.jenis_bahan_ajar')->select('id_jns_bhn_ajar', 'nm_jns_bhn_ajar')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_bhn_ajar' => $each_data->id_jns_bhn_ajar,
                'nm_jns_bhn_ajar' => $each_data->nm_jns_bhn_ajar,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jenis_akt_mhs",
     *      operationId="getJenisAktMhs",
     *      tags={"Referensi"},
     *      summary="Get list of projects JenisAktMhs",
     *      description="Returns list of JenisAktMhs",
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
    public function jenis_akt_mhs(Request $request)
    {
        $listdata = DB::table('ref.jenis_akt_mhs')->select('a_kegiatan_kampus_merdeka', 'id_jns_akt_mhs', 'ket_jns_akt_mhs', 'nm_jns_akt_mhs')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_kegiatan_kampus_merdeka' => $each_data->a_kegiatan_kampus_merdeka,
                'id_jns_akt_mhs' => $each_data->id_jns_akt_mhs,
                'ket_jns_akt_mhs' => $each_data->ket_jns_akt_mhs,
                'nm_jns_akt_mhs' => $each_data->nm_jns_akt_mhs,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jalur_daftar",
     *      operationId="getJalurDaftar",
     *      tags={"Referensi"},
     *      summary="Get list of projects JalurDaftar",
     *      description="Returns list of JalurDaftar",
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
    public function jalur_daftar(Request $request)
    {
        $listdata = DB::table('ref.jalur_daftar')->select('id_jalur_daftar', 'nm_jalur_daftar')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jalur_daftar' => $each_data->id_jalur_daftar,
                'nm_jalur_daftar' => $each_data->nm_jalur_daftar,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jabfung",
     *      operationId="getJabfung",
     *      tags={"Referensi"},
     *      summary="Get list of projects Jabfung",
     *      description="Returns list of Jabfung",
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
    public function jabfung(Request $request)
    {
        $listdata = DB::table('ref.jabfung')->select('angka_kredit', 'id_jabfung', 'id_kel_prof', 'nm_jabfung')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'angka_kredit' => $each_data->angka_kredit,
                'id_jabfung' => $each_data->id_jabfung,
                'id_kel_prof' => $each_data->id_kel_prof,
                'nm_jabfung' => $each_data->nm_jabfung,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/jab_tgs",
     *      operationId="getJabTgs",
     *      tags={"Referensi"},
     *      summary="Get list of projects JabTgs",
     *      description="Returns list of JabTgs",
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
    public function jab_tgs(Request $request)
    {
        $listdata = DB::table('ref.jab_tgs')->select('a_jab_utama_lpk', 'a_jab_utama_lpnk', 'a_jab_utama_pt', 'a_jab_utama_sek', 'id_jab_tgs', 'id_kel_prof', 'jml_jam_diakui', 'nm_jab_tgs')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_jab_utama_lpk' => $each_data->a_jab_utama_lpk,
                'a_jab_utama_lpnk' => $each_data->a_jab_utama_lpnk,
                'a_jab_utama_pt' => $each_data->a_jab_utama_pt,
                'a_jab_utama_sek' => $each_data->a_jab_utama_sek,
                'id_jab_tgs' => $each_data->id_jab_tgs,
                'id_kel_prof' => $each_data->id_kel_prof,
                'jml_jam_diakui' => $each_data->jml_jam_diakui,
                'nm_jab_tgs' => $each_data->nm_jab_tgs,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/ikatan_kerja_sdm",
     *      operationId="getIkatanKerjaSdm",
     *      tags={"Referensi"},
     *      summary="Get list of projects IkatanKerjaSdm",
     *      description="Returns list of IkatanKerjaSdm",
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
    public function ikatan_kerja_sdm(Request $request)
    {
        $listdata = DB::table('ref.ikatan_kerja_sdm')->select('id_ikatan_kerja', 'ket_ikatan_kerja', 'nm_ikatan_kerja')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_ikatan_kerja' => $each_data->id_ikatan_kerja,
                'ket_ikatan_kerja' => $each_data->ket_ikatan_kerja,
                'nm_ikatan_kerja' => $each_data->nm_ikatan_kerja,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/gelar_akademik",
     *      operationId="getGelarAkademik",
     *      tags={"Referensi"},
     *      summary="Get list of projects GelarAkademik",
     *      description="Returns list of GelarAkademik",
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
    public function gelar_akademik(Request $request)
    {
        $listdata = DB::table('ref.gelar_akademik')->select('id_gelar_akad', 'nm_gelar_akad', 'posisi_gelar', 'singkat_gelar')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_gelar_akad' => $each_data->id_gelar_akad,
                'nm_gelar_akad' => $each_data->nm_gelar_akad,
                'posisi_gelar' => $each_data->posisi_gelar,
                'singkat_gelar' => $each_data->singkat_gelar,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/fungsi_lab",
     *      operationId="getFungsiLab",
     *      tags={"Referensi"},
     *      summary="Get list of projects FungsiLab",
     *      description="Returns list of FungsiLab",
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
    public function fungsi_lab(Request $request)
    {
        $listdata = DB::table('ref.fungsi_lab')->select('id_fungsi_lab', 'nm_fungsi_lab')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_fungsi_lab' => $each_data->id_fungsi_lab,
                'nm_fungsi_lab' => $each_data->nm_fungsi_lab,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/bidang_usaha",
     *      operationId="getBidangUsaha",
     *      tags={"Referensi"},
     *      summary="Get list of projects BidangUsaha",
     *      description="Returns list of BidangUsaha",
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
    public function bidang_usaha(Request $request)
    {
        $listdata = DB::table('ref.bidang_usaha')->select('id_bu', 'nm_bu')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_bu' => $each_data->id_bu,
                'nm_bu' => $each_data->nm_bu,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/bidang_studi",
     *      operationId="getBidangStudi",
     *      tags={"Referensi"},
     *      summary="Get list of projects BidangStudi",
     *      description="Returns list of BidangStudi",
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
    public function bidang_studi(Request $request)
    {
        $listdata = DB::table('ref.bidang_studi')->select('a_jenj_paud', 'a_jenj_sd', 'a_jenj_sma', 'a_jenj_smp', 'a_jenj_tinggi', 'a_jenj_tk', 'a_kel', 'id_bid_studi', 'id_induk_bidang_studi', 'kode_bid_studi', 'nm_bid_studi')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_jenj_paud' => $each_data->a_jenj_paud,
                'a_jenj_sd' => $each_data->a_jenj_sd,
                'a_jenj_sma' => $each_data->a_jenj_sma,
                'a_jenj_smp' => $each_data->a_jenj_smp,
                'a_jenj_tinggi' => $each_data->a_jenj_tinggi,
                'a_jenj_tk' => $each_data->a_jenj_tk,
                'a_kel' => $each_data->a_kel,
                'id_bid_studi' => $each_data->id_bid_studi,
                'id_induk_bidang_studi' => $each_data->id_induk_bidang_studi,
                'kode_bid_studi' => $each_data->kode_bid_studi,
                'nm_bid_studi' => $each_data->nm_bid_studi,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/bentuk_pendidikan",
     *      operationId="getBentukPendidikan",
     *      tags={"Referensi"},
     *      summary="Get list of projects BentukPendidikan",
     *      description="Returns list of BentukPendidikan",
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
    public function bentuk_pendidikan(Request $request)
    {
        $listdata = DB::table('ref.bentuk_pendidikan')->select('a_aktif', 'a_jenj_paud', 'a_jenj_sd', 'a_jenj_sma', 'a_jenj_smp', 'a_jenj_tinggi', 'a_jenj_tk', 'dir_bina', 'id_bp', 'nm_bp')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'a_aktif' => $each_data->a_aktif,
                'a_jenj_paud' => $each_data->a_jenj_paud,
                'a_jenj_sd' => $each_data->a_jenj_sd,
                'a_jenj_sma' => $each_data->a_jenj_sma,
                'a_jenj_smp' => $each_data->a_jenj_smp,
                'a_jenj_tinggi' => $each_data->a_jenj_tinggi,
                'a_jenj_tk' => $each_data->a_jenj_tk,
                'dir_bina' => $each_data->dir_bina,
                'id_bp' => $each_data->id_bp,
                'nm_bp' => $each_data->nm_bp,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
    /**
     * @OA\Get(
     *      path="/referensi/agama",
     *      operationId="getAgama",
     *      tags={"Referensi"},
     *      summary="Get list of projects Agama",
     *      description="Returns list of Agama",
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
    public function agama(Request $request)
    {
        $listdata = DB::table('ref.agama')->select('id_agama', 'nm_agama')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_agama' => $each_data->id_agama,
                'nm_agama' => $each_data->nm_agama,
            ];
        }
        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $data
        ]);
    }
}
