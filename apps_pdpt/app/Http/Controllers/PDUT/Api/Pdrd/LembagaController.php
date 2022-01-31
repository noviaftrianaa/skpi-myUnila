<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LembagaController extends Controller
{
    /**
     * @OA\Get(
     *      path="/lembaga/profilpt/detail",
     *      tags={"Lembaga"},
     *      summary="Mendapatkan Detail Profil Perguruan Tinggi berdasarkan id_sp",
     *      description="Menampilkan Detail Profil Perguruan Tinggi berdasarkan id_sp",
     *      operationId="getDetailProfilPt",
     *    @OA\Parameter(
     *          name="id_sp",
     *          description="",
     *          example="C3319E33-8F0F-451E-9FF3-00160F4C4D61",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="string"
     *          )
     *     ),
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
     * )
     */
    public function detailProfilPt(Request $request)
    {
        $id = $request->id_sp;
        if (empty($id)) {
            return response()->json([
                'status' => FALSE,
                'message' => "id_sp tidak ditemukan"
            ]);
        }

        $profilpt= DB::select(" SELECT 
            sp.id_sp, sp.nm_lemb, ppt.visi, 
            ppt.misi, ppt.tujuan, ppt.sasaran
        FROM pdrd.profil_pt AS ppt WITH(NOLOCK)
        JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON sp.id_sp = ppt.id_sp AND sp.soft_delete = 0
        WHERE sp.soft_delete = 0 AND sp.id_sp = ? ", [$id]);



        foreach ($profilpt as $each_data) {
            $data[] = [
                'id_sp' => $each_data->id_sp,
                'nm_lemb' => $each_data->id_publikasi,
                'visi' => $each_data->visi,
                'misi' => $each_data->misi,
                'tujuan' => $each_data->tujuan,
                'sasaran' => $each_data->sasaran,
            ];
        }
        return WrapResponse(['data' => $data], 'Detail Perguruan Tinggi berdasarkan id_sp', TRUE);
    }

    /**
     * @OA\Get(
     *      path="/lembaga/akreditasipt",
     *      tags={"Lembaga"},
     *      summary="Mendapatkan Daftar Akreditasi Perguruan Tinggi",
     *      description="Menampilkan Daftar Akreditasi Perguruan Tinggi",
     *      operationId="getDaftarAkreditasiPt",
     *   @OA\Parameter(
     *          name="page",
     *          description="",
     *          example="1",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="count",
     *          description="",
     *          example="25",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="sortby",
     *          description="",
     *          example="DESC",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="string"
     *          )
     *     ),
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
     * )
     */
    public function listAkreditasiPt(Request $request)
    {
        $page = 1; $count = 10;
        if(!empty($request->page)) {
            $page = $request->page; 
        } 
        if (!empty($request->count)) {
            if ($request->count > 50) {
                $count = 50;
            } else {
                $count = $request->count; 
            }
        }

        $akreditasipt= DB::SELECT("
        DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= ?
        SET @RowsOfPage= ?
        SELECT 
            asp.id_akred_sp, 
            asp.id_sp,
            asp.id_akred,
			sp.nm_lemb,
            nakred.nm_akred,
            asp.sk_akred_sp,
            asp.tgl_sk_akred_sp
        FROM pdrd.akred_sp AS asp WITH(NOLOCK)
        JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON sp.id_sp = asp.id_sp AND sp.soft_delete = 0
        LEFT JOIN ref.nilai_akred AS nakred WITH(NOLOCK) ON nakred.id_akred = asp.id_akred
        ORDER BY asp.id_sp ASC
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$page, $count]);

        $data = [];
        foreach ($akreditasipt as $each_data) {
            $data[] = [
                'id_akred_sp' => $each_data->id_akred_sp,
                'id_sp' => $each_data->id_sp,
                'id_akred' => $each_data->id_akred,
                'nm_lemb' => $each_data->nm_lemb,
                'nm_akred' => $each_data->nm_akred,
                'sk_akred_sp' => $each_data->sk_akred_sp,
                'tgl_sk_akred_sp' => $each_data->tgl_sk_akred_sp,
            ];
        }
        return response()->json([
            'success' => true,
            'message' => 'Mendapatkan data',
            'page' => $page,
            'count' => $count,
            'data'  => $data
        ], 200);
    }


    /**
     * @OA\Get(
     *      path="/lembaga/daftarprodi/detail",
     *      tags={"Lembaga"},
     *      summary="Mendapatkan Detail Daftar Prodi",
     *      description="Menampilkan Detail Daftar Prodi",
     *      operationId="getDetailDaftarProdi",
     *   @OA\Parameter(
     *          name="page",
     *          description="",
     *          example="1",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="count",
     *          description="",
     *          example="25",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="sortby",
     *          description="",
     *          example="DESC",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="string"
     *          )
     *     ),
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
     * )
     */
    public function detailDaftarProdi(Request $request)
    {
        $page = 1; $count = 10;
        if(!empty($request->page)) {
            $page = $request->page; 
        } 
        if (!empty($request->count)) {
            if ($request->count > 50) {
                $count = 50;
            } else {
                $count = $request->count; 
            }
        }

        $detail_prodi= DB::SELECT("
        DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= ?
        SET @RowsOfPage= ?
        SELECT 
            sms.id_sms, 
            sms.nm_lemb,
            sms.kode_prodi,
            sms.stat_prodi,
            sms.sks_lulus
        FROM pdrd.sms AS sms WITH(NOLOCK)
        WHERE sms.soft_delete = 0
        ORDER BY sms.id_sms ASC
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$page, $count]);

        $data = [];
        foreach ($detail_prodi as $each_data) {
            $data[] = [
                'id_sms' => $each_data->id_sms,
                'nm_lemb' => $each_data->nm_lemb,
                'kode_prodi' => $each_data->kode_prodi,
                'stat_prodi' => $each_data->stat_prodi,
                'sks_lulus' => $each_data->sks_lulus,
            ];
        }
        return response()->json([
            'success' => true,
            'message' => 'Mendapatkan data',
            'page' => $page,
            'count' => $count,
            'data'  => $data
        ], 200);
    }
   
     /**
     * @OA\Get(
     *      path="/lembaga/profilprodi/list",
     *      tags={"Lembaga"},
     *      summary="Mendapatkan Daftar Prodi",
     *      description="Menampilkan Daftar Prodi",
     *      operationId="getDaftarProdi",
     *   @OA\Parameter(
     *          name="page",
     *          description="",
     *          example="1",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="count",
     *          description="",
     *          example="25",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="sortby",
     *          description="",
     *          example="DESC",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="string"
     *          )
     *     ),
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
     * )
     */
    public function listProfilProdi(Request $request)
    {
        $page = 1; $count = 10;
        if(!empty($request->page)) {
            $page = $request->page; 
        } 
        if (!empty($request->count)) {
            if ($request->count > 50) {
                $count = 50;
            } else {
                $count = $request->count; 
            }
        }

        $profilprodi = DB::SELECT("
        DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= ?
        SET @RowsOfPage= ?
        SELECT
            sms.id_sms, 
            akredpd.id_akreditasi_prodi, 
            akredpd.sk_akreditasi_prodi, 
            akredpd.tanggal_sk_akreditasi_prodi, 
            sms.nm_lemb,
			akreditasi.nm_akred,
            lembak.nm_lemb,
            profilpd.visi,
            profilpd.misi,
            profilpd.tujuan,
            profilpd.sasaran,
            profilpd.kompetensi,
            profilpd.himp_alumni
        FROM pdrd.akreditasi_prodi AS akredpd WITH(NOLOCK)
        JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = akredpd.id_sms AND sms.soft_delete = 0
            LEFT JOIN pdrd.profil_prodi AS profilpd WITH(NOLOCK) ON profilpd.id_sms = akredpd.id_sms AND profilpd.soft_delete = 0
            LEFT JOIN ref.lembaga_akred AS lembak WITH(NOLOCK) ON lembak.id_lemb_akred = akredpd.id_lemb_akred AND lembak.expired_date IS NULL
            LEFT JOIN ref.nilai_akred AS akreditasi WITH(NOLOCK) ON akreditasi.id_akred = akredpd.id_akred AND akreditasi.expired_date IS NULL
        WHERE akredpd.soft_delete = 0
        ORDER BY akredpd.create_date DESC
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$page, $count]);

        $data = [];
        foreach ($profilprodi as $each_data) {
            $data[] = [
                'id_sms' => $each_data->id_sms,
                'id_akreditasi_prodi' => $each_data->id_akreditasi_prodi,
                'sk_akreditasi_prodi' => $each_data->sk_akreditasi_prodi,
                'tanggal_sk_akreditasi_prodi' => $each_data->tanggal_sk_akreditasi_prodi,
                'nm_lemb' => $each_data->nm_lemb,
                'nm_lemb' => $each_data->nm_lemb,
                'lembaga_akreditasi' => $each_data->himp_alumni,
                'visi' => $each_data->misi,
                'tujuan' => $each_data->sasaran,
                'kompetensi' => $each_data->kompetensi,
                'himp_alumni' => $each_data->himp_alumni
               
            ];
        }

        return response()->json([
            'status' => true,
            'message' => 'Berhasil mengambil data Profil Prodi',
            'page' => $page,
            'count' => $count,
            'data'  => $profilprodi
        ], 200);
    }

    /**
     * @OA\Get(
     *      path="/lembaga/profilprodi/list_id",
     *      tags={"Lembaga"},
     *      summary="Mendapatkan Detail Profil Prodi berdasarkan id_sms",
     *      description="Menampilkan Detail Profil Prodi berdasarkan id_sms",
     *      operationId="getDetailProfilProdi",
     *    @OA\Parameter(
     *          name="id_sms",
     *          description="",
     *          example="A31F9448-2E48-4991-AEC6-0630F9801A09",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="string"
     *          )
     *     ),
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
     * )
     */
    public function listProfilProdiById(Request $request)
    {

        $id = $request->id_sms;
        if (empty($id)) {
            return response()->json([
                'status' => FALSE,
                'message' => "id_sms kosong"
            ]);
        }

        $profilprodi = DB::select("SELECT
            sms.id_sms, 
            akredpd.id_akreditasi_prodi, 
            akredpd.sk_akreditasi_prodi, 
            akredpd.tanggal_sk_akreditasi_prodi, 
            sms.nm_lemb,
			akreditasi.nm_akred,
            lembak.nm_lemb,
            profilpd.visi,
            profilpd.misi,
            profilpd.tujuan,
            profilpd.sasaran,
            profilpd.kompetensi,
            profilpd.himp_alumni
        FROM pdrd.akreditasi_prodi AS akredpd WITH(NOLOCK)
        JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = akredpd.id_sms AND sms.soft_delete = 0
            LEFT JOIN pdrd.profil_prodi AS profilpd WITH(NOLOCK) ON profilpd.id_sms = akredpd.id_sms AND profilpd.soft_delete = 0
            LEFT JOIN ref.lembaga_akred AS lembak WITH(NOLOCK) ON lembak.id_lemb_akred = akredpd.id_lemb_akred AND lembak.expired_date IS NULL
            LEFT JOIN ref.nilai_akred AS akreditasi WITH(NOLOCK) ON akreditasi.id_akred = akredpd.id_akred AND akreditasi.expired_date IS NULL
        WHERE sms.soft_delete = 0 AND sms.id_sms = ? ", [$id]);
        
        $data = [];
        foreach ($profilprodi as $each_data) {
            $data[] = [
                'id_sms' => $each_data->id_sms,
                'id_akreditasi_prodi' => $each_data->id_akreditasi_prodi,
                'sk_akreditasi_prodi' => $each_data->sk_akreditasi_prodi,
                'tanggal_sk_akreditasi_prodi' => $each_data->tanggal_sk_akreditasi_prodi,
                'prodi' => $each_data->nm_lemb,
                'nm_akred' => $each_data->nm_akred,
                'nm_lemb' => $each_data->nm_lemb,
                'lembaga_akreditasi' => $each_data->himp_alumni,
                'visi' => $each_data->misi,
                'tujuan' => $each_data->sasaran,
                'kompetensi' => $each_data->kompetensi,
                'himp_alumni' => $each_data->himp_alumni
               
            ];
        }

        return WrapResponse(['data' => $data], 'Detail Profil Prodi By id_sms', TRUE);
    }

    /**
     * @OA\Get(
     *      path="/lembaga/daftarsms",
     *      operationId="getSms",
     *      tags={"Lembaga"},
     *      summary="Dapatkan daftar Sms",
     *      description="Menampilkan daftar data Sms berdasarkan id berikut : <br>
     *      -. 1 = Fakultas <br> 
     *      -. 2 = Jurusan <br>
     *      -. 3 = Program Studi <br>
     *      -. 4 = Laboratorium <br>
     *      -. 5 = UPT <br>
     *      -. 6 = Penyelenggara MKU <br>
     *      -. 7 = Rektorat <br>
     *      -. 8 = Unit Kerja <br>",
     *     @OA\Parameter(
     *          name="id_jns_sms",
     *          description="",
     *          example="1",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="page",
     *          description="",
     *          example="1",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="count",
     *          description="",
     *          example="25",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="sortby",
     *          description="",
     *          example="DESC",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="string"
     *          )
     *     ),
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
    public function listSms(Request $request)
    {
        $page = 1; $count = 10;
        if(!empty($request->page)) {
            $page = $request->page; 
        } 
        if (!empty($request->count)) {
            if ($request->count > 50) {
                $count = 50;
            } else {
                $count = $request->count; 
            }
        }

        $id = $request->id_jns_sms;
        if (empty($id)) {
            return response()->json([
                'status' => FALSE,
                'message' => "id_jns_sms kosong"
            ]);
        }

        $listdata = DB::SELECT("SELECT 	
                sms.id_sms,
                js.nm_jns_sms,
                sms.nm_lemb,
                sms.smt_mulai,
                sms.kode_prodi,
                sms.no_tel,
                sms.no_fax,
                sms.email,
                sms.tgl_berdiri,
                sms.sk_selenggara,
                sms.tgl_sk_selenggara,
                sms.sks_lulus,
                sms.gelar_lulusan,
                sms.stat_prodi,
                jp.id_jenj_didik AS id_jenj_didik,
                js.id_jns_sms AS id_jns_sms,
                wil.id_wil AS id_wil,
                jur.id_jur AS id_jur,
                sms.id_induk_sms AS id_induk_sms
            FROM
                pdrd.sms AS sms WITH(NOLOCK)
                JOIN ref.jenjang_pendidikan AS jp ON jp.id_jenj_didik = sms.id_jenj_didik
                AND jp.expired_date IS NULL
                JOIN ref.jenis_sms AS js ON js.id_jns_sms = sms.id_jns_sms
                AND js.expired_date IS NULL
                JOIN ref.wilayah AS wil ON wil.id_wil = sms.id_wil
                AND wil.expired_date IS NULL
                JOIN ref.jurusan AS jur ON jur.id_jur = sms.id_jur
                AND jur.expired_date IS NULL
                
            WHERE
                sms.soft_delete = 0 AND sms.id_jns_sms = ? ", [$id]);
               

            foreach ($listdata as $each_data) {
                $data[] = [
                    'id_sms' => $each_data->id_sms,
                    'nm_jns_sms' => $each_data->nm_jns_sms,
                    'nm_lemb' => $each_data->nm_lemb,
                    'kode_prodi' => $each_data->kode_prodi,
                    'no_tel' => $each_data->no_tel,
                    'no_fax' => $each_data->no_fax,
                    'email' => $each_data->email,
                    'tgl_berdiri' => $each_data->tgl_berdiri,
                    'sk_selenggara' => $each_data->sk_selenggara,
                    'tgl_sk_selenggara' => $each_data->tgl_sk_selenggara,
                    'sks_lulus' => $each_data->sks_lulus,
                    'gelar_lulusan' => $each_data->gelar_lulusan,
                    'stat_prodi' => $each_data->stat_prodi,
                    'id_jenj_didik' => $each_data->id_jenj_didik,
                    'id_jns_sms' => $each_data->id_jns_sms,
                    'id_wil' => $each_data->id_wil,
                    'id_jur' => $each_data->id_jur,
                    'id_induk_sms' => $each_data->id_induk_sms,
                ];
            }
           return response()->json([
            'success' => true,
            'message' => 'Mendapatkan data',
            'page' => $page,
            'count' => $count,
            'data'  => $data
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
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
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateProfilProdi(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            DB::update("UPDATE pdrd.akreditasi_prodi 
                SET id_akreditasi_prodi = ?,
                SET id_sms = ?, 
                SET id_lemb_akred = ?, 
                SET id_akred = ?,
                SET sk_akreditasi_prodi = ?, 
                SET tanggal_sk_akreditasi_prodi' = ?, 
                SET isbn = ?, 
                SET tgl_terbit = ?, 
                SET sk_tugas = ?,
                SET tgl_sk_tugas = ? 
            WHERE id_publikasi = ?", [
                $request->id_kat_capaian,
                $request->id_jns_pub, 
                $request->id_litabmas, 
                $request->judul,
                $request->penulis, 
                $request->penerbit, 
                $request->isbn, 
                $request->tgl_terbit,
                $request->sk_tugas, 
                $request->tgl_sk_tugas, 
                $request->id_publikasi
            ]);

            DB::update("UPDATE pdrd.tulis_pub SET id_publikasi = ?, SET id_sdm = ?,
            SET id_pd = ?, SET id_orang = ?, SET urutan2 = ?, SET afiliasi = ?, SET peran_tulis = ?,
            SET jns_penulis = ?, SET nm_pd = ?, SET nipd = ? WHERE id_tulis_pub = ?", [
                $request->id_publikasi,
                $request->id_sdm, 
                $request->id_pd, 
                $request->id_orang, 
                $request->urutan2, 
                $request->afiliasi,
                $request->peran_tulis, 
                $request->jns_penulis, 
                $request->nm_pd, 
                $request->nipd, 
                $request->id_tulis_pub
            ]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Berhasil ubah data'
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal ubah data'
            ], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
