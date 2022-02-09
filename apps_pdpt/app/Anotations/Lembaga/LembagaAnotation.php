<?php
/**
     * @OA\Get(
     *      path="/lembaga/daftar_sms",
     *      operationId="getSms",
     *      tags={"Lembaga"},
     *      summary="Dapatkan daftar Sms",
     *      description="Menampilkan daftar data Sms & id_jns_sms berikut : <br>
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
     *      security={{"bearer_token":{}}}
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

     /**
     * @OA\Get(
     *      path="/lembaga/profil_prodi/list",
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
     *      security={{"bearer_token":{}}}
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



