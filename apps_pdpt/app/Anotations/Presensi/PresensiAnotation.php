<?php

/**
 * @OA\Get(
 * path="/presensi/list_id",
 * operationId="getListKehadiranById",
 * tags={"Presensi"},
 * summary="Mendapatkan Daftar Kehadiran Berdasarkan ID",
 * description="Menampilkan Daftar Kehadiran Berdasarkan ID",
 * @OA\Parameter(name="sdmid", description="masukan id sdm", example="bcb6de9a-2e7c-43c7-b192-029750754fe7", required=false, in="query",
 * @OA\Schema(type="string")),
 * @OA\Parameter( name="sortby", description="Masukan urutan by ASC/DESC", example="DESC", required=false, in="query",
 * @OA\Schema(type="string")),
 * @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
 * @OA\Schema(type="number")),
 * @OA\Parameter( name="count", description="masukan jumlah data", example="10", required=false, in="query",
 * @OA\Schema(type="number")),
 * @OA\Response(
 * response=200,
 * description="Successful operation",
 * ),
 * @OA\Response(
 * response=401,
 * description="Unauthenticated",
 * ),
 * @OA\Response(
 * response=403,
 * description="Forbidden"
 * ),
 * security={{"bearer_token":{}}}
 * )
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
 *      security={{"bearer_token":{}}}
 *     )
 */


/**
* @OA\Put(
* path="/presensi/ubah",
* operationId="ubahKehadiranSdm", 
* tags={"Presensi"},
* summary="Mengubah Data Kehadiran",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah Data Kehadiran",
 *        @OA\JsonContent(
 *             type="object",
 *             @OA\Property(
 *                property="data",
 *                type="array",
 *                @OA\Items(
 *                 @OA\Property( property="id_hehadiran_sdm", type="string", format="text", example="BD7129F5-8B55-4A03-9829-0BE2A27F60EC"),
 *                 @OA\Property( property="id_sdm", type="string", format="text", example="bcb6de9a-2e7c-43c7-b192-029750754fe7"),
 *                 @OA\Property( property="lokasi_pulang", type="string", format="text", example="UPT TIK UNILA"),
 *                 @OA\Property( property="rencana_hari_ini", type="string", format="text", example=NULL),
 *                 @OA\Property( property="realisasi_hari_ini", type="string", format="text", example= NULL)
 *                ),
 *             ),
 *         ),
 *     ),
*        @OA\Response(
*        response=200,
*        description="Successful operation",
*        ),
*        @OA\Response(
*        response=401,
*        description="Unauthenticated",
*        ),
*        @OA\Response(
*        response=403,
*        description="Forbidden"
*        ),
*       security={{"bearer_token":{}}}
* )
*/
