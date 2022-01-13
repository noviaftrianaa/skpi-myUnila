<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MahasiswaController extends Controller
{
    /**
     * @OA\Get(
     *      path="/pdrd/mahasiswa/list",
     *      operationId="getListMahasiswa",
     *      tags={"Mahasiwa"},
     *      summary="Dapatkan daftar Mahasiswa",
     *      description="Menampilkan daftar data Mahasiswa",
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
    public function list()
    {
        $listdata = DB::SELECT("
        SELECT TOP 50
                pd.id_pd,
                pd.nm_pd,
                pd.jk,
                pd.id_stat_mhs,
                reg.nipd AS npm,
                smt.id_thn_ajaran AS angkatan,
                kuliah.id_stat_mhs AS status_sekarang,
                CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
            JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_semester_masuk
                AND smt.expired_date IS NULL
            JOIN pdrd.kuliah_mhs AS kuliah WITH(NOLOCK) ON kuliah.id_reg_pd = reg.id_reg_pd
                AND kuliah.soft_delete = 0
            JOIN pdrd.sms AS sms WITH(NOLOCK) ON  sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE pd.soft_delete = 0
        ");

        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $listdata
        ]);
    }

    /**
     * @OA\Get(
     *      path="/pdrd/mahasiswa/{status}",
     *      operationId="getListStatusMahasiswa",
     *      tags={"Mahasiwa"},
     *      summary="Dapatkan daftar Mahasiswa sesuai Status Mahasiswa",
     *      description="Menampilkan daftar data Mahasiswa sesuai Status Mahasiswa",
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
    public function status($status)
    {
        $listdata = DB::SELECT("
            SELECT
                pd.id_pd,
                pd.nm_pd, pd.jk,
                pd.id_stat_mhs,
                reg.nipd AS npm,
                smt.id_thn_ajaran AS angkatan,
                kuliah.id_stat_mhs AS status_sekarang,
                CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
            JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_semester_masuk
                AND smt.expired_date IS NULL
            JOIN pdrd.kuliah_mhs AS kuliah WITH(NOLOCK) ON kuliah.id_reg_pd = reg.id_reg_pd
                AND kuliah.soft_delete = 0 AND kuliah.id_smt = 20211
                AND kuliah.id_stat_mhs = '".$status."'
            JOIN pdrd.sms AS sms WITH(NOLOCK) ON  sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE pd.soft_delete = 0
        ");

        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $listdata
        ]);
    }

        /**
     * @OA\Get(
     *      path="/pdrd/mahasiswa/regis",
     *      operationId="getRegisMahasiswa",
     *      tags={"Mahasiwa"},
     *      summary="Dapatkan daftar Regis",
     *      description="Menampilkan daftar data Regis Mahasiswa",
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
    public function regis()
    {
        $listdata = DB::SELECT("
            SELECT TOP 50
                reg.id_reg_pd,
                reg.id_sp,
                reg.id_sms,
                reg.id_pd,
                reg.id_jns_daftar,
                reg.id_jalur_daftar,
                reg.id_pembiayaan,
                reg.id_smt,
                reg.tgl_masuk_sp,
                reg.nipd,
                reg.id_semester_masuk,
                reg.id_pt_asal,
                reg.nm_pt_asal,
                reg.id_prodi_asal,
                reg.nm_prodi_asal,
                reg.id_jns_keluar,
                reg.tgl_keluar,
                reg.ket,
                reg.skhun,
                reg.no_peserta_ujian,
                reg.no_seri_ijazah,
                reg.asal_data_ijazah,
                reg.bidang_mayor,
                reg.bidang_minor,
                reg.sks_diakui,
                reg.jalur_skripsi,
                reg.judul_skripsi,
                reg.bln_awal_bimbingan,
                reg.bln_akhir_bimbingan,
                reg.sk_yudisium,
                reg.tgl_sk_yudisium,
                reg.ipk,
                reg.sert_prof,
                reg.a_pindah_mhs_asing,
                reg.biaya_masuk_kuliah
            FROM pdrd.reg_pd as reg WITH(NOLOCK)
            JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON sp.id_sp = reg.id_sp
                AND sp.soft_delete = 0
            JOIN pdrd.sms AS sms WITH(NOLOCK) ON  sms.id_sms = reg.id_sms
                AND reg.soft_delete = 0
            JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                AND reg.soft_delete = 0
            JOIN ref.jenis_pendaftaran AS jp WITH(NOLOCK) ON jp.id_jns_daftar = reg.id_jns_daftar
                AND jp.expired_date IS NULL
            JOIN ref.jalur_daftar AS jd WITH(NOLOCK) ON jd.id_jalur_daftar = reg.id_jalur_daftar
                AND jd.expired_date IS NULL
            JOIN ref.pembiayaan AS pmb WITH(NOLOCK) ON pmb.id_pembiayaan = reg.id_pembiayaan
                AND jd.expired_date IS NULL
            JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_smt
                AND jd.expired_date IS NULL
            WHERE reg.soft_delete = 0;
        ");


        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $listdata
        ]);
    }

    /**
     * @OA\Get(
     *      path="/pdrd/mahasiswa/semester",
     *      operationId="getSemesterKeaktifan",
     *      tags={"Mahasiwa"},
     *      summary="Dapatkan daftar Semester Keaktifan Mahasiswa",
     *      description="Menampilkan daftar Semester Keaktifan Mahasiswa",
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
    public function semester_keaktifan()
    {
        $listdata = DB::SELECT("
        SELECT TOP 50
                pd.id_pd,
                pd.nm_pd,
                pd.jk,
                pd.id_stat_mhs,
                reg.nipd AS npm,
                smt.id_thn_ajaran AS angkatan,
                kuliah.id_stat_mhs AS status_sekarang,
                CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
            JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_semester_masuk
                AND smt.expired_date IS NULL
            JOIN pdrd.kuliah_mhs AS kuliah WITH(NOLOCK) ON kuliah.id_reg_pd = reg.id_reg_pd
                AND kuliah.soft_delete = 0
            JOIN pdrd.sms AS sms WITH(NOLOCK) ON  sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            WHERE pd.soft_delete = 0
        ");


        return response()->json([
            'status' => true,
            'message' => 'success',
            'data'  => $listdata
        ]);
    }
}
