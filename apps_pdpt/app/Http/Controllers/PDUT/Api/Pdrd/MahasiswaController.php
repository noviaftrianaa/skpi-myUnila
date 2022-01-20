<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PackageVersions\FallbackVersions;

class MahasiswaController extends Controller
{
    /**
     * @OA\Get(
     *      path="/mahasiswa/list_mahasiswa",
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
        $query = DB::SELECT("
            SELECT TOP 5
                pd.id_pd, reg.nipd AS npm, pd.nm_pd,
                CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi,
                reg.id_semester_masuk, kul.id_stat_mhs AS status_sekarang,
                ts.smt, kul.ips, kul.ipk, pd.create_date AS waktu_data_ditambahkan,
                pd.last_update AS terakhir_diubah
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
            JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_semester_masuk
                AND smt.expired_date IS NULL
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
            JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt=reg.id_semester_masuk
                AND ts.expired_date IS NULL
            WHERE pd.soft_delete = 0
            ORDER BY ts.id_thn_ajaran DESC, pd.nm_pd ASC;
        ");

        $list_mahasiswa = [];
        foreach ($query as $each_data) {
            $list_mahasiswa[] = [
                'id_peserta_didik' => $each_data->id_pd,
                'NPM' => $each_data->npm,
                'nama_mahasiswa' => $each_data->nm_pd,
                'program_study' => $each_data->nm_prodi,
                'semester_masuk' => $each_data->id_semester_masuk,
                'status_sekarang' => $each_data->status_sekarang,
                'semester_sekarang,' => $each_data->smt,
                'ips' => $each_data->ips,
                'ipk' => $each_data->ipk,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
            ];
        }

        return response()->json([
            'status' => true,
            'message' => 'Berhasil mengambil data list Mahasiswa',
            'data'  => $list_mahasiswa
        ]);
    }


    /**
     * @OA\Get(
     *      path="/mahasiswa/detail/{$id_peserta_didik}",
     *      operationId="getDetailMahasiswa",
     *      tags={"Mahasiwa"},
     *      summary="Dapatkan detail profil Mahasiswa",
     *      description="Menampilkan detail data profil Mahasiswa",
     * @OA\Parameter(
     *         description="Sorting Data Penelitian",
     *         in="path",
     *         name="sortby",
     *         @OA\Schema(type="string"),
     *       ),
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
    public function detail(Request $request)
    {
        if (empty($request->id_reg_pd)) {
            return response()->json([
                'status' => False,
                'message' => "Parameter tidak sesuai"
            ]);
        }

        $detail_mahasiswa = DB::SELECT("
            SELECT
                    reg.id_reg_pd, reg.nipd AS npm, pd.nm_pd, CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi, reg.id_semester_masuk, kul.id_stat_mhs AS status_sekarang, reg.tgl_masuk_sp, reg.id_semester_masuk, reg.id_pt_asal, reg.nm_pt_asal, reg.id_prodi_asal, reg.nm_prodi_asal,
                    reg.id_jns_keluar, reg.tgl_keluar, reg.ket, reg.skhun, reg.no_peserta_ujian, reg.no_seri_ijazah, reg.asal_data_ijazah, reg.bidang_mayor,
                    reg.bidang_minor, reg.sks_diakui, reg.jalur_skripsi, reg.judul_skripsi, reg.bln_awal_bimbingan, reg.bln_akhir_bimbingan, reg.sk_yudisium,
                    reg.tgl_sk_yudisium, reg.ipk, reg.sert_prof, reg.a_pindah_mhs_asing, reg.biaya_masuk_kuliah, sp.nm_lemb,
                    pd.nm_pd, pd.nik, pd.id_kk, pd.id_agama,
                    pd.tlpn_hp, pd.tlpn_rumah, pd.email, pd.tmpt_lahir, pd.tgl_lahir, pd.jln, pd.rt, pd.rw, pd.ds_kel, jp.nm_jns_daftar,
                    jd.nm_jalur_daftar, pmb.nm_pembiayaan
                FROM pdrd.reg_pd as reg WITH(NOLOCK)
                JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_semester_masuk
                    AND smt.expired_date IS NULL
                    LEFT JOIN (
                    SELECT MAX(id_smt) as smt, id_reg_pd FROM pdrd.kuliah_mhs WITH(NOLOCK)
                    WHERE soft_delete = 0
                    GROUP BY id_reg_pd
                )AS kuliah ON kuliah.id_reg_pd = reg.id_reg_pd
                JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_smt = kuliah.smt
                    AND kul.id_reg_pd = kuliah.id_reg_pd
                    AND kul.soft_delete = 0
                JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON sp.id_sp = reg.id_sp
                    AND sp.soft_delete = 0
                JOIN pdrd.sms AS sms WITH(NOLOCK) ON  sms.id_sms = reg.id_sms
                    AND sms.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                    AND jenjang.expired_date IS NULL
                JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = reg.id_pd
                    AND pd.soft_delete = 0
                JOIN ref.jenis_pendaftaran AS jp WITH(NOLOCK) ON jp.id_jns_daftar = reg.id_jns_daftar
                    AND jp.expired_date IS NULL
                JOIN ref.jalur_daftar AS jd WITH(NOLOCK) ON jd.id_jalur_daftar = reg.id_jalur_daftar
                    AND jd.expired_date IS NULL
                JOIN ref.pembiayaan AS pmb WITH(NOLOCK) ON pmb.id_pembiayaan = reg.id_pembiayaan
                    AND jd.expired_date IS NULL
                WHERE reg.id_reg_pd = '".$request->id_reg_pd."'
                    AND reg.soft_delete = 0;
        ");

        if (empty($detail_mahasiswa)) {
            return response()->json([
                'status' => False,
                'message' => "Data tidak ditemukan"
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Berhasil mengambil data detail Mahasiswa',
            'data'  => $detail_mahasiswa
        ]);
    }

    /**
     * @OA\Get(
     *      path="/mahasiswa/{status}",
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
    public function status(Request $request)
    {
        if (empty($request->id_stat_mhs)) {
            return response()->json([
                'status' => False,
                'message' => "Parameter tidak sesuai"
            ]);
        }

        $list_status_mahasiswa = DB::SELECT("
            SELECT TOP 50
                pd.id_pd, reg.nipd AS npm, pd.nm_pd,
                CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi,
                reg.id_semester_masuk, kul.id_stat_mhs AS status_sekarang,
                ts.smt, kul.ips, kul.ipk
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
            JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_semester_masuk
                AND smt.expired_date IS NULL
                LEFT JOIN (
                SELECT MAX(id_smt) as smt, id_reg_pd FROM pdrd.kuliah_mhs WITH(NOLOCK)
                WHERE soft_delete = 0
                GROUP BY id_reg_pd
            )AS kuliah ON kuliah.id_reg_pd = reg.id_reg_pd
            JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_smt = kuliah.smt
                AND kul.id_reg_pd = kuliah.id_reg_pd
                AND kul.id_stat_mhs = '".$request->id_stat_mhs."'
                AND kul.soft_delete = 0
            JOIN pdrd.sms AS sms WITH(NOLOCK) ON  sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt=reg.id_semester_masuk
                AND ts.expired_date IS NULL
            WHERE pd.soft_delete = 0
            ORDER BY ts.id_thn_ajaran DESC, pd.nm_pd ASC;
        ");

        if (empty($list_status_mahasiswa)) {
            return response()->json([
                'status' => False,
                'message' => "Data tidak ditemukan"
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Berhasil mendapatkan data list mahasiswa',
            'data'  => $list_status_mahasiswa
        ]);
    }

        /**
     * @OA\Get(
     *      path="/mahasiswa/regis",
     *      operationId="getRegisMahasiswa",
     *      tags={"Mahasiwa"},
     *      summary="Dapatkan daftar Mahasiswa Berdasarkan Jenis Pendaftaran",
     *      description="Menampilkan daftar data List Mahasiswa Berdasarkan Jenis Pendaftaran",
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
    public function regis(Request $request)
    {
        if (empty($request->id_jns_daftar)) {
            return response()->json([
                'status' => False,
                'message' => "Parameter tidak sesuai"
            ]);
        }

        $query = DB::SELECT("
            SELECT TOP 50
                pd.id_pd, daftar.nm_jns_daftar, reg.nipd AS npm, pd.nm_pd,
                CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi,
                reg.id_semester_masuk, kul.id_stat_mhs AS status_sekarang,
                ts.smt, kul.ips, kul.ipk
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.id_jns_daftar = '".$request->id_jns_daftar."'
                AND reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
            JOIN ref.jenis_pendaftaran AS daftar WITH(NOLOCK) ON daftar.id_jns_daftar = reg.id_jns_daftar
                AND daftar.expired_date IS NULL
            JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_semester_masuk
                AND smt.expired_date IS NULL
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
            JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt=reg.id_semester_masuk
                AND ts.expired_date IS NULL
            WHERE pd.soft_delete = 0
            ORDER BY ts.id_thn_ajaran DESC, pd.nm_pd ASC;
        ");

        if (empty($query)) {
            return response()->json([
                'status' => False,
                'message' => "Data tidak ditemukan"
            ]);
        }

        $list_jns_daftar = [];
        foreach ($query as $each_data) {
            $list_jns_daftar[] = [
                'id_peserta_didik' => $each_data->id_pd,
                'jenis_pendaftaran' => $each_data->nm_jns_daftar,
                'NPM' => $each_data->npm,
                'nama_mahasiswa' => $each_data->nm_pd,
                'program_study' => $each_data->nm_prodi,
                'semester_masuk' => $each_data->id_semester_masuk,
                'status_sekarang' => $each_data->status_sekarang,
                'semester_sekarang,' => $each_data->smt,
                'ips' => $each_data->ips,
                'ipk' => $each_data->ipk
            ];
        }

        return response()->json([
            'status' => true,
            'message' => 'Berhasil mengambil data list Mahasiswa',
            'data'  => $list_jns_daftar
        ]);
    }

    /**
     * @OA\Get(
     *      path="/mahasiswa/semester",
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
    public function semester_keaktifan(Request $request)
    {
        if (empty($request->id_pd)) {
            return response()->json([
                'status' => False,
                'message' => "Parameter tidak sesuai"
            ]);
        }

        $data_mahasiswa = DB::SELECT("
            SELECT
                pd.id_pd, reg.id_reg_pd, reg.nipd AS npm, pd.nm_pd,
                CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi,
                kul.id_stat_mhs AS status_sekarang,
                ts.smt, kul.ips, kul.ipk, ts.id_thn_ajaran as angkatan
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.id_pd = '".$request->id_pd."'
                AND reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
            JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_semester_masuk
                AND smt.expired_date IS NULL
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
            JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt=reg.id_semester_masuk
                AND ts.expired_date IS NULL
            WHERE reg.soft_delete = 0;
        ");

        $semester = DB::SELECT("
            SELECT
                ts.nm_smt AS periode,
                kul.id_stat_mhs,
                kul.sks_semester,
                kul.ips,
                kul.ipk,
                kul.total_sks AS sks_lulus
            FROM pdrd.kuliah_mhs as kul
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_reg_pd = kul. id_reg_pd
            JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt=kul.id_smt
                AND ts.expired_date IS NULL
            WHERE kul.id_reg_pd = '".$data_mahasiswa[0]->id_reg_pd."';
        ");

        foreach ($data_mahasiswa as $each_data) {
            $data[] = [
                'id_pd' => $each_data->id_pd,
                'id_reg_pd' => $each_data->id_reg_pd,
                'npm' => $each_data->npm,
                'nm_pd' => $each_data->nm_pd,
                'nm_prodi' => $each_data->nm_prodi,
                'status_sekarang' => $each_data->status_sekarang,
                'smt ' => $each_data->smt,
                'ips ' => $each_data->ips,
                'ipk' => $each_data->ipk,
                'angkatan' => $each_data->angkatan,
                'semester' => $semester
            ];
        }

        if (empty($data_mahasiswa)) {
            return response()->json([
                'status' => False,
                'message' => "Data tidak ditemukan"
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Berhasil mengambil data keaktifan semester mahasiswa',
            'data'  => $data
        ]);
    }

        /**
     * @OA\Get(
     *      path="/mahasiswa/list_alumni",
     *      operationId="getAlumni",
     *      tags={"Mahasiwa"},
     *      summary="Dapatkan list alumni berdasarkan prodi",
     *      description="Menampilkan list alumni berdasarkan prodi",
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
    public function alumni(Request $request)
    {
        if (empty($request->id_sms)) {
            return response()->json([
                'status' => False,
                'message' => "Parameter tidak sesuai"
            ]);
        }

        $alumni = DB::SELECT("
            SELECT TOP 50
                pd.id_pd, pd.nm_pd, reg.nipd AS npm, CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi,
                ts.id_thn_ajaran AS angkatan, kul.biaya_smt, kul.ipk, kul.total_sks, pd.nik, pd.jk, pd.tlpn_hp, pd.email, jd.nm_jalur_daftar,
                reg.tgl_keluar AS tgl_lulus, reg.tgl_sk_yudisium AS tgl_wisuda, pd.create_date AS waktu_data_ditambahkan,
                pd.last_update AS terakhir_diubah
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd=pd.id_pd
                AND reg.soft_delete=0 AND reg.id_jns_keluar='1'
                AND reg.id_sms='".$request->id_sms."'
            JOIN pdrd.sms AS sms WITH(NOLOCK) ON  sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            JOIN ref.jalur_daftar AS jd WITH(NOLOCK) ON jd.id_jalur_daftar = reg.id_jalur_daftar
                AND jd.expired_date IS NULL
            JOIN (
                SELECT MAX(id_smt) AS smt, id_reg_pd FROM pdrd.kuliah_mhs WITH(NOLOCK)
                WHERE soft_delete=0
                GROUP BY id_reg_pd
            ) AS tk ON tk.id_reg_pd=reg.id_reg_pd
            JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_reg_pd=reg.id_reg_pd
                AND tk.smt=kul.id_smt
                AND kul.soft_delete=0
            JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt=reg.id_semester_masuk
                AND ts.expired_date IS NULL
            WHERE pd.soft_delete=0
            ORDER BY reg.id_semester_masuk ASC, pd.nm_pd ASC
        ");

        if (empty($alumni)) {
            return response()->json([
                'status' => False,
                'message' => "Data tidak ditemukan"
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Berhasil mengambil data list alumni',
            'data'  => $alumni
        ]);
    }
}
