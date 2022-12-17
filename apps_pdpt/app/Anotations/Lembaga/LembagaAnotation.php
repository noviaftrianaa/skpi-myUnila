<?php
/**
     * @OA\Get(
     *      path="/lembaga/daftar_lembaga",
     *      operationId="getSms",
     *      tags={"Lembaga"},
     *      summary="Dapatkan daftar Lembaga",
     *      description="Menampilkan daftar data lembaga dengan id_jns_sms berikut : <br>
     *      -. 1 = Fakultas <br>
     *      -. 2 = Jurusan <br>
     *      -. 3 = Program Studi <br>
     *      -. 4 = Laboratorium <br>
     *      -. 5 = UPT <br>
     *      -. 6 = Penyelenggara MKU <br>
     *      -. 7 = Rektorat <br>
     *      -. 8 = Unit Kerja <br>",
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
     *      security={{"token":{}}}
     *     )
     */


     /**
     * @OA\Get(
     *      path="/lembaga/daftar_prodi/detail",
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
     *          name="limit",
     *          description="",
     *          example="25",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="sort_by",
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
     *      security={{"token":{}}}
     *     )
     * )
     */

     /**
     * @OA\Get(
     *      path="/lembaga/profil_prodi/daftar",
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
     *          name="limit",
     *          description="",
     *          example="25",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="sort_by",
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
     *      security={{"token":{}}}
     *     )
     * )
     */

     /**
     * @OA\Put (
     *      path="/lembaga/profil_prodi/ubah",
     *      operationId="ubahProfilProdi",
     *      tags={"Lembaga"},
     *      summary="Ubah Data Profil Prodi",
     *      description="Mengubah Profil Prodi",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Mengubah Profil Prodi",
     *      @OA\JsonContent(
     *          required={"id_sms", "id_akreditasi_prodi", "sk_akreditasi_prodi", "nm_lemb", "lembaga_akreditasi"},
     *          @OA\Property(property="id_sms", type="string", format="text", example="95d78c8a-ddc0-4faa-8982-039360a73056"),
     *          @OA\Property(property="id_akreditasi_prodi", type="string", format="text", example="f4488b4f-7e87-475a-ace6-015b1e3f64d2"),
     *          @OA\Property(property="sk_akreditasi_prodi", type="string", format="text", example="2959/SK/BAN-PT/Akred/S/VIII/2017"),
     *          @OA\Property(property="tanggal_sk_akreditasi_prodi", type="date", format="date", example="2017-08-22"),
     *          @OA\Property(property="nm_lemb", type="string", format="text", example="Pendidikan Guru Sekolah Dasar"),
     *          @OA\Property(property="lembaga_akreditasi", type="string", format="text", example="BAN PT"),
     *          @OA\Property(property="visi", type="string", format="text", example="misi"),
     *          @OA\Property(property="tujuan", type="string", format="text", example="tujuan"),
     *          @OA\Property(property="sasaran", type="string", format="text", example="sasaran"),
     *          @OA\Property(property="kompetensi", type="string", format="text", example="kompetensi"),
     *          @OA\Property(property="himp_alumni", type="string", format="text", example="himp_alumni"),
     *        ),
     * ),
     *
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
     *      security={{"token":{}}}
     *     )
     */

/**
     * @OA\Get(
     *      path="/lembaga/profil_pt/detail",
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
     *      security={{"token":{}}}
     *     )
     * )
     */

/**
     * @OA\Get(
     *      path="/lembaga/akreditasi_pt",
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
     *          name="limit",
     *          description="",
     *          example="25",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="sort_by",
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
     *      security={{"token":{}}}
     *     )
     * )
     */



