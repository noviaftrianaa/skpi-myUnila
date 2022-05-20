<?php

/**
 * @OA\Get(
 *      path="/pengabdian/list",
 *      operationId="getListPengabdian",
 *      tags={"Pengabdian"},
 *      summary="Dapatkan daftar Pengabdian",
 *      description="Menampilkan daftar data Pengabdian",
 *      @OA\Parameter( name="sortby", description="Masukan urutan by ASC/DESC", example="DESC", required=false, in="query",
 *          @OA\Schema(type="string")),
 *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="count", description="masukan jumlah data", example="10", required=false, in="query",
 *          @OA\Schema(type="number")),
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
 *      path="/pengabdian/list_id",
 *      operationId="getListPengabdianById",
 *      tags={"Pengabdian"},
 *      summary="Dapatkan daftar Pengabdian Berdasarkan ID",
 *      description="Menampilkan daftar data Pengabdian Berdasarkan ID",
 *      @OA\Parameter( name="sdmid", description="masukan id sdm", example="bcb6de9a-2e7c-43c7-b192-029750754fe7", required=false, in="query",
 *          @OA\Schema(type="string")),
 *      @OA\Parameter( name="sortby", description="Masukan urutan by ASC/DESC", example="DESC", required=false, in="query",
 *          @OA\Schema(type="string")),
 *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="count", description="masukan jumlah data", example="10", required=false, in="query",
 *          @OA\Schema(type="number")),
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
 *      path="/pengabdian/detail/{id}",
 *      operationId="getPengabdianDetail",
 *      tags={"Pengabdian"},
 *      summary="Dapatkan Detail Pengabdian By ID",
 *      description="Menampilkan Detail Pengabdian By ID",
 *      @OA\Parameter(
 *         description="Pengabdian ID",
 *         in="path",
 *         name="id",
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
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Post(
 *      path="/pengabdian/tambah",
 *      operationId="storePengabdian",
 *      tags={"Pengabdian"},
 *      summary="Menambahkan Data Pengabdian",
 *      description="Menambahkan data pengabdian baru berdasarkan ID Katgiat berikut: <br><br>
 *      1. 130201 <br>
 *      2. 130202 <br>
 *      3. 130203 <br>
 *      4. 130204 <br>
 *      5. 130401 <br>
 *      6. 130402 <br>
 *      7. 130403 <br>",
 *       @OA\Parameter(
 *         name="Id",
 *         in="query",
 *         description="ID Katgiat",
 *         required=true,
 *         @OA\Schema(
 *         type="array",
 *           @OA\Items(
 *               type="integer",
 *               enum={"130201","130202","130203","130204","130401","130402","130403"},
 *               default="available"
 *           ),
 *         ),
 *         style="form"
 *     ),
 *      @OA\RequestBody(
 *         @OA\MediaType(
 *             mediaType="applicatin/json",
 *             @OA\Schema(
 *                 @OA\Property(
 *                     property="judul_kegiatan",
 *                     type="string",
 *                     format="text",
 *                     example="Test Input Litabmas Bagian Penelitian 12"
 *                 ),
 *                 @OA\Property(
 *                     property="afiliasi",
 *                     type="string",
 *                     format="text",
 *                     example="e2b705a7-173e-464a-9fac-509128709515"
 *                 ),
 *                 @OA\Property(
 *                     property="kel_bidang",
 *                     type="string",
 *                     format="text",
 *                     example="e7377434-ed85-4f5b-9e7c-feb08d4c39e0"
 *                 ),
 *                 @OA\Property(
 *                     property="litabmas_lanjutan",
 *                     type="string",
 *                     format="text",
 *                     example=NULL
 *                 ),
 *                 @OA\Property(
 *                     property="jenis_skim",
 *                     type="string",
 *                     format="text",
 *                     example=NULL
 *                 ),
 *                 @OA\Property(
 *                     property="lokasi_kegiatan",
 *                     type="string",
 *                     format="text",
 *                     example="upt tik universitas lampung"
 *                 ),
 *                 @OA\Property(
 *                     property="lama_kegiatan",
 *                     type="string",
 *                     format="text",
 *                     example="1"
 *                 ),
 *                 @OA\Property(
 *                     property="tahun_usulan",
 *                     type="string",
 *                     format="text",
 *                     example="2022"
 *                 ),
 *                 @OA\Property(
 *                     property="tahun_pelaksanaan",
 *                     type="string",
 *                     format="text",
 *                     example="2022"
 *                 ),
 *                 @OA\Property(
 *                     property="tahun_kegiatan",
 *                     type="string",
 *                     format="text",
 *                     example="2022"
 *                 ),
 *                 @OA\Property(
 *                     property="dana_dikti",
 *                     type="string",
 *                     format="text",
 *                     example="0"
 *                 ),
 *                 @OA\Property(
 *                     property="dana_pt",
 *                     type="string",
 *                     format="text",
 *                     example="6000000"
 *                 ),
 *                 @OA\Property(
 *                     property="dana_institusi_lain",
 *                     type="string",
 *                     format="text",
 *                     example="0"
 *                 ),
 *                 @OA\Property(
 *                     property="in_kind",
 *                     type="string",
 *                     format="text",
 *                     example=NULL
 *                 ),
 *                 @OA\Property(
 *                     property="no_sk_penugasan",
 *                     type="string",
 *                     format="text",
 *                     example="1234/TIK03.03/TIK/2022"
 *                 ),
 *                 @OA\Property(
 *                     property="tgl_sk_penugasan",
 *                     type="string",
 *                     format="text",
 *                     example="2022-01-01"
 *                 ),
 *                 @OA\Property(
 *                     property="anggota_dosen",
 *                     type="array",
 *                     collectionFormat="multi",
 *                     @OA\Items(type="string", format="id", example="bcb6de9a-2e7c-43c7-b192-029750754fe7"),
 *                 ),
 *                 @OA\Property(
 *                     property="peran_dosen",
 *                     type="array",
 *                     collectionFormat="multi",
 *                     @OA\Items(type="string", format="id", example="K"),
 *                 ),
 *                 @OA\Property(
 *                     property="status_dosen",
 *                     type="array",
 *                     collectionFormat="multi",
 *                     @OA\Items(type="int", format="id", example=1),
 *                 ),
 *                 @OA\Property(
 *                     property="anggota_mahasiswa",
 *                     type="array",
 *                     collectionFormat="multi",
 *                     @OA\Items(type="string", format="id", example="1327d056-ed42-4e11-9d20-d4040441998a"),
 *                 ),
 *                 @OA\Property(
 *                     property="peran_mahasiswa",
 *                     type="array",
 *                     collectionFormat="multi",
 *                     @OA\Items(type="string", format="id", example="A"),
 *                 ),
 *                 @OA\Property(
 *                     property="status_mahasiswa",
 *                     type="array",
 *                     collectionFormat="multi",
 *                     @OA\Items(type="int", format="id", example=1),
 *                 ),
 *                 @OA\Property(
 *                     property="anggota_non_ca",
 *                     type="array",
 *                     collectionFormat="multi",
 *                     nullable="true",
 *                     @OA\Items(type="string", format="id", example=null),
 *                 ),
 *                 @OA\Property(
 *                     property="peran_non_ca",
 *                     type="array",
 *                     collectionFormat="multi",
 *                     @OA\Items(type="string", format="id", example="A"),
 *                 ),
 *                 @OA\Property(
 *                     property="status_non_ca",
 *                     type="array",
 *                     collectionFormat="multi",
 *                     @OA\Items(type="int", format="id", example=1),
 *                 ),
 *                 @OA\Property(
 *                     property="dok_penelitian",
 *                     type="array",
 *                     collectionFormat="multi",
 *                     nullable="true",
 *                     @OA\Items(type="string", format="id", example=null),
 *                 ),
 *              )
 *          )
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
 * @OA\Delete(
 *      path="/pengabdian/hapus",
 *      operationId="hapusPengabdian",
 *      tags={"Pengabdian"},
 *      summary="Hapus Data Pengabdian",
 *      description="Hapus Data Pengabdian",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Hapus Data Pengabdian",
 *      @OA\JsonContent(
 *          required={"pengabdianid"},
 *          @OA\Property(property="pengabdianid", type="string", format="text", example="54DBF3BD-93AB-45D7-AE39-CC074C45E854")
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