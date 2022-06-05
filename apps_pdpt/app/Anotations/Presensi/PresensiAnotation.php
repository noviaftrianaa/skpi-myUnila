<?php

/**
 * @OA\Get(
 * path="/presensi/list_id",
 * operationId="getListKehadiranById",
 * tags={"Presensi"},
 * summary="Mendapatkan Daftar Kehadiran Berdasarkan ID",
 * description="Menampilkan Daftar Kehadiran Berdasarkan ID",
 *  * @OA\Parameter(
 *          name="sdmid", description="masukan id sdm", example="bcb6de9a-2e7c-43c7-b192-029750754fe7", required=false, in="query",
 * @OA\Schema(type="string")),
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
 *          name="limit",
 *          description="",
 *          example="25",
 *          required=false,
 * 
 *          in="query",
 *          @OA\Schema(
 *              type="number"
 *          )
 *     ),
 *     @OA\Parameter(
 *          name="sort",
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
 * @OA\Post(
 *      path="/presensi/tambah",
 *      operationId="tambahKehadiranSdm",
 *      tags={"Presensi"},
 *      summary="Menambahkan Data Kehadiran Baru",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambahkan Data Kehadiran Baru",
 *        @OA\JsonContent(
 *             type="object",
 *             @OA\Property(
 *                property="data",
 *                type="array",
 *                @OA\Items(
 *                 @OA\Property( property="id_sdm", type="string", format="text", example="bcb6de9a-2e7c-43c7-b192-029750754fe7"),
 *                 @OA\Property( property="lokasi_presensi", type="string", format="text", example="UPT TIK UNILA"),
 *                 @OA\Property( property="rencana_hari_ini", type="string", format="text", example=NULL),
 *                 @OA\Property( property="realisasi_hari_ini", type="string", format="text", example= NULL)
 *                ),
 *             ),
 *        ),
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
 */


/**
 * @OA\Put (
 *      path="/presensi/ubah",
 *      operationId="ubahKehadiranSdm",
 *      tags={"Presensi"},
 *      summary= "Mengubah Data Kehadiran",
 *      description="Mengubah Data Kehadiran",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah Data Kehadiran",
 *      @OA\JsonContent(
 *          required={"id_kehadiran_sdm", "id_sdm", "lokasi_pulang"},
 *          @OA\Property( property="id_kehadiran_sdm", type="string", format="text", example="BD7129F5-8B55-4A03-9829-0BE2A27F60EC"),
 *          @OA\Property( property="id_sdm", type="string", format="text", example="bcb6de9a-2e7c-43c7-b192-029750754fe7"),
 *          @OA\Property( property="lokasi_pulang", type="string", format="text", example="UPT TIK UNILA"),
 *          @OA\Property( property="rencana_hari_ini", type="string", format="text", example=NULL),
 *          @OA\Property( property="realisasi_hari_ini", type="string", format="text", example= NULL)
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
 *      security={{"token":{}}}
 *     )
 */



/**
 * @OA\Get(
 * path="/presensi/list_mhs",
 * operationId="getListKehadiranMhs",
 * tags={"Presensi"},
 * summary="Mendapatkan Daftar Kehadiran Mahasiswa",
 * description="Menampilkan Daftar Kehadiran Mahasiswa",
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
 *          name="sort",
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
 * @OA\Post(
 *      path="/presensi/tambah_kehadiran_mhs",
 *      operationId="tambahKehadiranMahasiswa",
 *      tags={"Presensi"},
 *      summary="Menambahkan Data Kehadiran Mahasiswa Baru",
 *      description="Menambahkan Data Kehadiran Mahasiswa Baru",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambahkan Data Kehadiran Mahasiswa Baru",
 *        @OA\JsonContent(
 *          required={"id_reg_ptk","id_kls","stat_hadir"},
 *                 @OA\Property( property="id_reg_ptk", type="string", format="text", example="2ce745a7-d7fb-4248-91df-0048a276d2c8"),
 *                 @OA\Property( property="id_kls", type="string", format="text", example="6710efdc-894a-4a7a-8a6c-00000b1155c3"),
 *                 @OA\Property( property="stat_hadir", type="string", format="text", example= "1")
 *         ),
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
 */
