<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PackageVersions\FallbackVersions;
use Illuminate\Validation\Rule as ValidationRule;

class MahasiswaController extends Controller
{
    /**
     * @OA\Post(
     *      path="/mahasiswa/list_mahasiswa",
     *      operationId="getListMahasiswa",
     *      tags={"Mahasiwa"},
     *      summary="Dapatkan daftar Mahasiswa",
     *      description="Menampilkan daftar data Mahasiswa",
     *      @OA\RequestBody(
     *      description="Daftar daftar list mahasiswa berdasarkan idProdi menggunakan parameter berikut :",
     *      @OA\JsonContent(
     *          @OA\Property(property="page", type="number", format="number", example="1"),
     *          @OA\Property(property="item", type="number", format="number", example="10"),
     *          @OA\Property(property="sortby", type="string", format="text", example="asc"),
     *          @OA\Property(property="idProdi", type="string", format="text", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2")
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
    public function list(Request $request)
    {
        $currentPage = $request->input('page', 1);
        $itemsPerPage = $request->input('item', 10);
        $sortBy = $request->input('sortby', 'ASC');
        $idProdi = $request->input('idProdi');

        InputValidator([
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])],
            'idProdi' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
        ], [
            'idProdi.required' => 'field ini harus diisi',
            'idProdi.regex' => 'input harus berupa campuran alpa_numeric dan dash',
            'sortby.alpha' => 'input penyortiran harus kata',
            'sortby.in' => 'input pernyortiran hanya ASC atau DESC'
        ]);

        if (!empty($itemsPerPage)) {
            if ($itemsPerPage > 50) {
                $itemsPerPage = 50;
            }
        }

        $query = DB::SELECT(
            "
            DECLARE @PageNumber AS INT
            DECLARE @RowsOfPage AS INT
            SET @PageNumber= ?
            SET @RowsOfPage= ?
            SELECT
                pd.id_pd, reg.nipd AS npm, pd.nm_pd,
                CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi,
                ts.nm_smt AS periode_masuk, kul.ips, kul.ipk, pd.create_date AS waktu_data_ditambahkan,
                pd.last_update AS terakhir_diubah, kuliah.smt_skrng, kul.id_stat_mhs AS status
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.id_sms='" . $idProdi . "'
                AND reg.id_jns_keluar IS NULL
                AND reg.soft_delete = 0
            JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_semester_masuk
                AND smt.expired_date IS NULL
            LEFT JOIN (
                SELECT MAX(id_smt) as smt, COUNT(*) as smt_skrng, id_reg_pd FROM pdrd.kuliah_mhs WITH(NOLOCK)
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
            ORDER BY ts.id_thn_ajaran DESC, pd.nm_pd " . $sortBy . "
            OFFSET (@PageNumber-1)*@RowsOfPage ROWS
            FETCH NEXT @RowsOfPage ROWS ONLY
            ",
            [$currentPage, $itemsPerPage]
        );

        if (empty($query)) {
            return WrapResponse([], "Data tidak ditemukan", FALSE);
        }

        $data = [];
        foreach ($query as $each_data) {
            $data[] = [
                'id_peserta_didik' => $each_data->id_pd,
                'NPM' => $each_data->npm,
                'nama_mahasiswa' => $each_data->nm_pd,
                'program_studi' => $each_data->nm_prodi,
                'periode_masuk' => $each_data->periode_masuk,
                'semester_sekarang,' => $each_data->smt_skrng,
                'ips' => $each_data->ips,
                'ipk' => $each_data->ipk,
                'status' => $each_data->status,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
            ];
        }

        return WrapResponse(compact('currentPage', 'itemsPerPage', 'sortBy', 'data'), 'Berhasil mengambil data list Mahasiswa');
    }


    /**
     * @OA\Post(
     *      path="/mahasiswa/detail",
     *      operationId="getDetailMahasiswa",
     *      tags={"Mahasiwa"},
     *      summary="Dapatkan detail profil Mahasiswa",
     *      description="Menampilkan detail data profil Mahasiswa",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Detail Mahasiswa Berdasarkan idPesertaDidik",
     *      @OA\JsonContent(
     *          required={"idPesertaDidik"},
     *          @OA\Property(property="idPesertaDidik", type="string", format="text", example="11D42109-7F99-49EA-96E3-15F314C40523"),
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
    public function detail(Request $request)
    {
        $idPesertaDidik = $request->input('idPesertaDidik');
        InputValidator([
            'idPesertaDidik' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
        ], [
            'idPesertaDidik.required' => 'field ini harus diisi',
            'idPesertaDidik.regex' => 'input harus berupa campuran alpa_numeric dan dash',
        ]);

        $query = DB::SELECT("
            SELECT
                reg.id_reg_pd, reg.nipd AS npm, pd.nm_pd, CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi, kul.id_stat_mhs AS status_sekarang, reg.tgl_masuk_sp,
                smt.nm_smt AS periode_masuk, reg.nm_pt_asal, reg.nm_prodi_asal, reg.tgl_keluar, reg.ket, reg.skhun, reg.no_peserta_ujian, reg.no_seri_ijazah, reg.asal_data_ijazah,
                reg.bidang_mayor, reg.bidang_minor, reg.sks_diakui, reg.jalur_skripsi, reg.judul_skripsi, reg.bln_awal_bimbingan, reg.bln_akhir_bimbingan, reg.sk_yudisium,
                reg.tgl_sk_yudisium, reg.ipk, reg.sert_prof, reg.a_pindah_mhs_asing, reg.biaya_masuk_kuliah, sp.nm_lemb, pd.nm_pd, pd.nik, pd.id_kk, agama.nm_agama, pd.jk,
                pd.tlpn_hp, pd.tlpn_rumah, pd.tmpt_lahir, pd.tgl_lahir, pd.jln, pd.rt, pd.rw, pd.ds_kel, jp.nm_jns_daftar,
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
            JOIN ref.agama AS agama WITH(NOLOCK) ON agama.id_agama = pd.id_agama
                AND agama.expired_date IS NULL
            WHERE reg.id_pd = '" . $idPesertaDidik . "'
                AND reg.soft_delete = 0;
        ");

        if (empty($query)) {
            return WrapResponse([], "Data tidak ditemukan", FALSE);
        }

        $data = [];
        foreach ($query as $each_data) {
            $data[] = [
                'npm' => $each_data->npm,
                'nama' => $each_data->nm_pd,
                'program_studi' => $each_data->nm_prodi,
                'status_sekarang' => $each_data->status_sekarang,
                'tgl_masuk' => $each_data->tgl_masuk_sp,
                'periode_masuk' => $each_data->periode_masuk,
                'nm_pt_asal' => $each_data->nm_pt_asal,
                'nm_prodi_asal' => $each_data->nm_prodi_asal,
                'tgl_keluar' => $each_data->tgl_keluar,
                'ket' => $each_data->ket,
                'skhun' => $each_data->skhun,
                'no_peserta_ujian' => $each_data->no_peserta_ujian,
                'no_seri_ijazah' => $each_data->no_seri_ijazah,
                'asal_data_ijazah' => $each_data->asal_data_ijazah,
                'bidang_mayor' => $each_data->bidang_mayor,
                'bidang_minor' => $each_data->bidang_minor,
                'sks_diakui' => $each_data->sks_diakui,
                'jalur_skripsi' => $each_data->jalur_skripsi,
                'judul_skripsi' => $each_data->judul_skripsi,
                'bln_awal_bimbingan' => $each_data->bln_awal_bimbingan,
                'bln_akhir_bimbingan' => $each_data->bln_akhir_bimbingan,
                'sk_yudisium,' => $each_data->sk_yudisium,
                'tgl_sk_yudisium' => $each_data->tgl_sk_yudisium,
                'ipk' => $each_data->ipk,
                'sert_prof' => $each_data->sert_prof,
                'a_pindah_mhs_asing' => $each_data->a_pindah_mhs_asing,
                'biaya_masuk_kuliah' => $each_data->biaya_masuk_kuliah,
                'nm_lemb' => $each_data->nm_lemb,
                'nik' => $each_data->nik,
                'id_kk' => $each_data->id_kk,
                'nm_agama' => $each_data->nm_agama,
                'jk' => $each_data->jk,
                'tlpn_hp' => $each_data->tlpn_hp,
                'tlpn_rumah' => $each_data->tlpn_rumah,
                'tmpt_lahir' => $each_data->tmpt_lahir,
                'tgl_lahir' => $each_data->tgl_lahir,
                'jln' => $each_data->jln,
                'rt' => $each_data->rt,
                'rw' => $each_data->rw,
                'ds_kel' => $each_data->ds_kel,
                'nm_jns_daftar,' => $each_data->nm_jns_daftar,
                'nm_jalur_daftar' => $each_data->nm_jalur_daftar,
                'nm_pembiayaan' => $each_data->nm_pembiayaan
            ];
        }

        return WrapResponse(compact('data'), 'Berhasil mengambil data detail Mahasiswa');
    }

    /**
     * @OA\Post(
     *      path="/mahasiswa/list_status",
     *      operationId="getListStatusMahasiswa",
     *      tags={"Mahasiwa"},
     *      summary="Dapatkan daftar Mahasiswa sesuai Status Mahasiswa",
     *      description="Menampilkan daftar data Mahasiswa sesuai Status Mahasiswa",
     *      @OA\RequestBody(
     *      description="Daftar daftar list mahasiswa berdasarkan idProdi dan status mahasiswa sebagai berikut : <br><br>
     *       A : Aktif <br>
     *       C : Cuti <br>
     *       D : Drop Out / Dikeluarkan <br>
     *       G : Sedang Double Degree <br>
     *       H : Hilang <br>
     *       K : Mengundurkan Diri / Keluar <br>
     *       L : Lulus <br>
     *       M : Mutasi <br>
     *       N : Non Aktif <br>
     *       T : Transfer <br>
     *       U : Unknown <br>
     *       W : Wafat <br>",
     *      @OA\JsonContent(
     *          @OA\Property(property="page", type="number", format="number", example="1"),
     *          @OA\Property(property="item", type="number", format="number", example="10"),
     *          @OA\Property(property="sortby", type="string", format="text", example="asc"),
     *          @OA\Property(property="statMhs", type="string", format="text", example="A"),
     *          @OA\Property(property="idProdi", type="string", format="text", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2")
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
    public function status(Request $request)
    {
        $currentPage = $request->input('page', 1);
        $itemsPerPage = $request->input('item', 10);
        $sortBy = $request->input('sortby', 'ASC');
        $idProdi = $request->input('idProdi');
        $statMhs = $request->input('statMhs', 'A');

        InputValidator([
            'idProdi' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
            'statMhs' => ['alpha', ValidationRule::in([
                'A', 'C', 'D', 'G', 'H', 'K', 'L', 'M', 'N', 'T', 'U', 'W',
                'a', 'c', 'd', 'g', 'h', 'k', 'l', 'm', 'n', 't', 'u', 'w'
            ])],
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])],
        ], [
            'idProdi.required' => 'field ini harus diisi',
            'idProdi.regex' => 'input harus berupa campuran alpa_numeric dan dash',
            'statMhs.regex' => 'input harus sesuai',
            'sortby.alpha' => 'input penyortiran harus kata',
            'sortby.in' => 'input pernyortiran hanya ASC atau DESC'
        ]);

        if (!empty($itemsPerPage)) {
            if ($itemsPerPage > 50) {
                $itemsPerPage = 50;
            }
        }

        $query = DB::SELECT(
            "
            DECLARE @PageNumber AS INT
            DECLARE @RowsOfPage AS INT
            SET @PageNumber= ?
            SET @RowsOfPage= ?
            SELECT
                pd.id_pd, reg.nipd AS npm, pd.nm_pd,
                CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi,
                ts.nm_smt AS periode_masuk, kul.ips, kul.ipk, pd.create_date AS waktu_data_ditambahkan,
                pd.last_update AS terakhir_diubah, kuliah.smt_skrng, kul.id_stat_mhs AS status
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.id_sms='" . $idProdi . "'
                AND reg.id_jns_keluar IS NULL
                AND reg.soft_delete = 0
            JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_semester_masuk
                AND smt.expired_date IS NULL
            LEFT JOIN (
                SELECT MAX(id_smt) as smt, COUNT(*) as smt_skrng, id_reg_pd FROM pdrd.kuliah_mhs WITH(NOLOCK)
                WHERE soft_delete = 0
                GROUP BY id_reg_pd
            )AS kuliah ON kuliah.id_reg_pd = reg.id_reg_pd
            JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_smt = kuliah.smt
                AND kul.id_reg_pd = kuliah.id_reg_pd
				AND kul.id_stat_mhs = '" . $statMhs . "'
                AND kul.soft_delete = 0
            JOIN pdrd.sms AS sms WITH(NOLOCK) ON  sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
            JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
            JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt=reg.id_semester_masuk
                AND ts.expired_date IS NULL
            WHERE pd.soft_delete = 0
            ORDER BY ts.id_thn_ajaran DESC, pd.nm_pd " . $sortBy . "
            OFFSET (@PageNumber-1)*@RowsOfPage ROWS
            FETCH NEXT @RowsOfPage ROWS ONLY
            ",
            [$currentPage, $itemsPerPage]
        );

        if (empty($query)) {
            return WrapResponse([], "Data tidak ditemukan", FALSE);
        }

        $data = [];
        foreach ($query as $each_data) {
            $data[] = [
                'NPM' => $each_data->npm,
                'nama_mahasiswa' => $each_data->nm_pd,
                'program_studi' => $each_data->nm_prodi,
                'periode_masuk' => $each_data->periode_masuk,
                'semester_sekarang,' => $each_data->smt_skrng,
                'ips' => $each_data->ips,
                'ipk' => $each_data->ipk,
                'status' => $each_data->status,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
            ];
        }

        return WrapResponse(compact('currentPage', 'itemsPerPage', 'sortBy', 'data'), 'Berhasil mengambil data list Mahasiswa');
    }

    /**
     * @OA\Post(
     *      path="/mahasiswa/list_regis",
     *      operationId="getRegisMahasiswa",
     *      tags={"Mahasiwa"},
     *      summary="Dapatkan daftar Mahasiswa Berdasarkan Jenis Pendaftaran",
     *      description="Menampilkan daftar data List Mahasiswa Berdasarkan Jenis Pendaftaran",
     *      @OA\RequestBody(
     *      description="Daftar daftar list mahasiswa berdasarkan idProdi dan status idJenisDaftar sebagai berikut : <br><br>
     *      1 : Peserta didik baru <br>
     *      2 : Pindahan <br>
     *      3 : Naik kelas <br>
     *      4 : Akselerasi <br>
     *      5 : Mengulang <br>
     *      6 : Lanjutan semester <br>
     *      8 : Pindahan Alih Bentuk <br>
     *      11 : Alih Jenjang <br>
     *      12 : Lintas Jalur <br>
     *      13 : Rekognisi Pembelajaran Lampau (RPL) <br>
     *      14 : Course <br>
     *      15 : Fast Track <br>",
     *      @OA\JsonContent(
     *          @OA\Property(property="page", type="number", format="number", example="1"),
     *          @OA\Property(property="item", type="number", format="number", example="10"),
     *          @OA\Property(property="sortby", type="string", format="text", example="asc"),
     *          @OA\Property(property="idJenisDaftar", type="number", format="number", example="1"),
     *          @OA\Property(property="idProdi", type="string", format="text", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2")
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
    public function regis(Request $request)
    {
        $currentPage = $request->input('page', 1);
        $itemsPerPage = $request->input('item', 10);
        $sortBy = $request->input('sortby', 'ASC');
        $idProdi = $request->input('idProdi');
        $idJenisDaftar = $request->input('idJenisDaftar', '1');

        InputValidator([
            'idProdi' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
            'idJenisDaftar' => ['numeric', ValidationRule::in(['1', '2', '3', '4', '5', '6', '8', '11', '12', '13', '14', '15'])],
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])],
        ], [
            'idProdi.required' => 'field ini harus diisi',
            'idProdi.regex' => 'input harus berupa campuran alpa_numeric dan dash',
            'idJenisDaftar.regex' => 'input harus numerik',
            'sortby.alpha' => 'input penyortiran harus kata',
            'sortby.in' => 'input pernyortiran hanya ASC atau DESC'
        ]);

        if (!empty($itemsPerPage)) {
            if ($itemsPerPage > 50) {
                $itemsPerPage = 50;
            }
        }

        $query = DB::SELECT(
            "
            DECLARE @PageNumber AS INT
            DECLARE @RowsOfPage AS INT
            SET @PageNumber= ?
            SET @RowsOfPage= ?
            SELECT
                pd.id_pd, reg.nipd AS npm, pd.nm_pd, daftar.nm_jns_daftar,
                CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi,
                ts.nm_smt AS periode_masuk, kul.ips, kul.ipk, pd.create_date AS waktu_data_ditambahkan,
                pd.last_update AS terakhir_diubah, kuliah.smt_skrng, kul.id_stat_mhs AS status
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.id_sms='" . $idProdi . "'
                AND reg.id_jns_daftar = '" . $idJenisDaftar . "'
                AND reg.id_jns_keluar IS NULL
                AND reg.soft_delete = 0
            JOIN ref.jenis_pendaftaran AS daftar WITH(NOLOCK) ON daftar.id_jns_daftar = reg.id_jns_daftar
                AND daftar.expired_date IS NULL
            JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_semester_masuk
                AND smt.expired_date IS NULL
            LEFT JOIN (
                SELECT MAX(id_smt) as smt, COUNT(*) as smt_skrng, id_reg_pd FROM pdrd.kuliah_mhs WITH(NOLOCK)
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
            ORDER BY ts.id_thn_ajaran DESC, pd.nm_pd " . $sortBy . "
            OFFSET (@PageNumber-1)*@RowsOfPage ROWS
            FETCH NEXT @RowsOfPage ROWS ONLY
            ",
            [$currentPage, $itemsPerPage]
        );

        if (empty($query)) {
            return WrapResponse([], "Data tidak ditemukan", FALSE);
        }

        $data = [];
        foreach ($query as $each_data) {
            $data[] = [
                'NPM' => $each_data->npm,
                'nama_mahasiswa' => $each_data->nm_pd,
                'program_studi' => $each_data->nm_prodi,
                'jenis_daftar' => $each_data->nm_jns_daftar,
                'periode_masuk' => $each_data->periode_masuk,
                'semester_sekarang,' => $each_data->smt_skrng,
                'ips' => $each_data->ips,
                'ipk' => $each_data->ipk,
                'status' => $each_data->status,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
            ];
        }

        return WrapResponse(compact('currentPage', 'itemsPerPage', 'sortBy', 'data'), 'Berhasil mengambil data list Mahasiswa');
    }

    /**
     * @OA\Post(
     *      path="/mahasiswa/smt_keaktifan",
     *      operationId="getSemesterKeaktifan",
     *      tags={"Mahasiwa"},
     *      summary="Dapatkan daftar Semester Keaktifan Mahasiswa",
     *      description="Menampilkan daftar Semester Keaktifan Mahasiswa",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Daftar keaktifan semester Mahasiswa Berdasarkan idPesertaDidik",
     *      @OA\JsonContent(
     *          required={"idPesertaDidik"},
     *          @OA\Property(property="idPesertaDidik", type="string", format="text", example="11D42109-7F99-49EA-96E3-15F314C40523"),
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
    public function semester_keaktifan(Request $request)
    {
        $idPesertaDidik = $request->input('idPesertaDidik');
        InputValidator([
            'idPesertaDidik' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
        ], [
            'idPesertaDidik.required' => 'field ini harus diisi',
            'idPesertaDidik.regex' => 'input harus berupa campuran alpa_numeric dan dash',
        ]);

        $query = DB::SELECT("
            SELECT
                pd.id_pd, reg.id_reg_pd, reg.nipd AS npm, pd.nm_pd,
                CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi,
                kul.id_stat_mhs AS status_sekarang, kuliah.smt_skrng, ts.nm_smt AS periode_masuk,
                kul.ips, kul.ipk, ts.id_thn_ajaran as angkatan,  kul.id_stat_mhs AS status
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.id_pd = '" . $idPesertaDidik . "'
                AND reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
            JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_semester_masuk
                AND smt.expired_date IS NULL
                LEFT JOIN (
                SELECT MAX(id_smt) as smt, COUNT(*) as smt_skrng, id_reg_pd FROM pdrd.kuliah_mhs WITH(NOLOCK)
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
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_reg_pd = kul.id_reg_pd
                AND reg.soft_delete = 0
            JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt=kul.id_smt
                AND ts.expired_date IS NULL
            WHERE kul.id_reg_pd = '" . $query[0]->id_reg_pd . "'
                AND kul.soft_delete = 0
            ORDER BY ts.id_smt DESC;
        ");

        if (empty($query)) {
            return WrapResponse([], "Data tidak ditemukan", FALSE);
        }

        $data = [];
        foreach ($query as $each_data) {
            $data[] = [
                'NPM' => $each_data->npm,
                'nama_mahasiswa' => $each_data->nm_pd,
                'program_studi' => $each_data->nm_prodi,
                'periode_masuk' => $each_data->periode_masuk,
                'semester_sekarang' => $each_data->smt_skrng,
                'angkatan' => $each_data->angkatan,
                'status' => $each_data->status,
                'semester' => $semester
            ];
        }

        return WrapResponse(compact('data'), 'Berhasil mengambil data keaktifan semester Mahasiswa');
    }

    /**
     * @OA\Post(
     *      path="/mahasiswa/list_alumni",
     *      operationId="getAlumni",
     *      tags={"Mahasiwa"},
     *      summary="Dapatkan list alumni berdasarkan prodi",
     *      description="Menampilkan list alumni berdasarkan prodi",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Daftar Alumni Berdasarkan id_prodi Contoh Ilmu Komputer = 54BBD27B-2376-4CAE-9951-76EF54BD2CA2",
     *      @OA\JsonContent(
     *          required={"id_prodi"},
     *          @OA\Property(property="id_prodi", type="string", format="text", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2"),
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
    public function alumni(Request $request)
    {
        $currentPage = $request->input('page', 1);
        $itemsPerPage = $request->input('item', 10);
        $sortBy = $request->input('sortby', 'ASC');
        $idProdi = $request->input('idProdi');

        InputValidator([
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])],
            'idProdi' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
        ], [
            'idProdi.required' => 'field ini harus diisi',
            'idProdi.regex' => 'input harus berupa campuran alpa_numeric dan dash',
            'sortby.alpha' => 'input penyortiran harus kata',
            'sortby.in' => 'input pernyortiran hanya ASC atau DESC'
        ]);

        if (!empty($itemsPerPage)) {
            if ($itemsPerPage > 50) {
                $itemsPerPage = 50;
            }
        }

        $query = DB::SELECT(
            "
            DECLARE @PageNumber AS INT
            DECLARE @RowsOfPage AS INT
            SET @PageNumber= ?
            SET @RowsOfPage= ?
            SELECT
                pd.id_pd, pd.nm_pd, reg.nipd AS npm, CONCAT(sms.nm_lemb, ' (',jenjang.nm_jenj_didik,')')  AS nm_prodi,
                ts.id_thn_ajaran AS angkatan, kul.biaya_smt, kul.ipk, kul.total_sks, pd.nik, pd.jk, pd.tlpn_hp, jd.nm_jalur_daftar,
                reg.tgl_keluar AS tgl_lulus, reg.tgl_sk_yudisium AS tgl_wisuda, pd.create_date AS waktu_data_ditambahkan,
                pd.last_update AS terakhir_diubah
            FROM pdrd.peserta_didik AS pd WITH(NOLOCK)
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd=pd.id_pd
                AND reg.id_jns_keluar='1'
                AND reg.id_sms='" . $idProdi . "'
                AND reg.soft_delete=0
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
            ORDER BY reg.id_semester_masuk DESC, pd.nm_pd " . $sortBy . "
            OFFSET (@PageNumber-1)*@RowsOfPage ROWS
            FETCH NEXT @RowsOfPage ROWS ONLY
            ",
            [$currentPage, $itemsPerPage]
        );

        if (empty($query)) {
            return WrapResponse([], "Data tidak ditemukan", FALSE);
        }

        $data = [];
        foreach ($query as $each_data) {
            $data[] = [
                'id_peserta_didik' => $each_data->id_pd,
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
                'tanggal_lulus' => $each_data->tgl_lulus,
                'tanggal_wisuda' => $each_data->tgl_wisuda,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($each_data->waktu_data_ditambahkan)),
                'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($each_data->terakhir_diubah))
            ];
        }



        return WrapResponse(compact('currentPage', 'itemsPerPage', 'sortBy', 'data'), 'Berhasil mengambil data list Alumni');
    }
}
