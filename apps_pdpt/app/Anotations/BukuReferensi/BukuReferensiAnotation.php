<?php
/**
* @OA\Get(
*      path="/buku_referensi/list",
*      tags={"Buku Referensi"},
*      summary="Mendapatkan Daftar Buku Referensi",
*      description="Menampilkan Daftar Buku Referensi",
*      operationId="getBukuReferensi",
*      @OA\Parameter(
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
     *      path="/buku_referensi/list_id",
     *      tags={"Buku Referensi"},
     *      summary="Mendapatkan Daftar Buku Referensi Berdasarkan ID",
     *      description="Menampilkan Daftar Buku Referensi Berdasarkan ID",
     *      operationId="getBukuReferensiById",
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
     *     @OA\Parameter(
     *          name="id_sdm",
     *          description="",
     *          example="A1E4BD6F-7C27-4346-99E1-002CB8CCA6AC",
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
     *      path="/buku_referensi/detail",
     *      tags={"Buku Referensi"},
     *      summary="Dapatkan Detail Buku Referensi",
     *      description="Menampilkan Detail Buku Referensi",
     *      operationId="getDetailBukuReferensi",
     *    @OA\Parameter(
     *          name="id_publikasi",
     *          description="",
     *          example="D27CA0E6-6537-4E9D-AEC4-001FE4C238FC",
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
     * @OA\Post(
     *      path="/buku_referensi/add",
     *      operationId="addBukuReferensi",
     *      tags={"Buku Referensi"},
     *      summary="Tambah Buku Referensi",
     *      description="Menambah Buku Referensi",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Menambah Buku Referensi",
     *      @OA\JsonContent(
     *          required={"id_litabmas", "judul", "penulis", "penerbit", "tgl_terbit"},
     *          @OA\Property(property="id_litabmas", type="string", format="text", example="bb96579f-e5d4-40d2-81b3-f4886aa32a10"),
     *          @OA\Property(property="judul", type="string", format="text", example="Judul Buku Referensi"),
     *          @OA\Property(property="penulis", type="string", format="text", example="Penulis"),
     *          @OA\Property(property="penerbit", type="string", format="text", example="Penerbit"),
     *          @OA\Property(property="isbn", type="string", format="text", example="1"),
     *          @OA\Property(property="tgl_terbit", type="date", format="date", example="2022-01-25"),
     *          @OA\Property(property="sk_tugas", type="string", format="text", example="SK TUGAS"),
     *          @OA\Property(property="tgl_sk_tugas", type="date", format="date", example="2022-01-25"),
     *
     *                 @OA\Property(
     *                     property="id_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="9c466255-68e3-4476-97a4-a42ced793203"),
     *                 ),
     *                  @OA\Property(
     *                     property="urutan_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="afiliasi_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Universitas Lampung"),
     *                 ),
     *                 @OA\Property(
     *                     property="peran_tulis_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="A"),
     *                 ),
     *                 @OA\Property(
     *                     property="jns_penulis_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *
     *                 @OA\Property(
     *                     property="id_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="faae58b0-d2b2-4b88-9966-0000458f9fce"),
     *                 ),
     *                  @OA\Property(
     *                     property="urutan_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="afiliasi_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Universitas Lampung"),
     *                 ),
     *                 @OA\Property(
     *                     property="peran_tulis_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="A"),
     *                 ),
     *                 @OA\Property(
     *                     property="jns_penulis_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="nm_pd_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Nama Mahasiswa"),
     *                 ),
     *                 @OA\Property(
     *                     property="nipd_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     nullable="true",
     *                     @OA\Items(type="string", format="string", example="null"),
     *                 ),
     *
     *                 @OA\Property(
     *                     property="id_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="9878daeb-7c52-41be-afa0-28bd6f6c6ddg"),
     *                 ),
     *                  @OA\Property(
     *                     property="urutan_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="afiliasi_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Universitas Lampung"),
     *                 ),
     *                 @OA\Property(
     *                     property="peran_tulis_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="A"),
     *                 ),
     *                 @OA\Property(
     *                     property="jns_penulis_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
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

     /**
     * @OA\Put (
     *      path="/buku_referensi/update",
     *      operationId="updateBukuReferensi",
     *      tags={"Buku Referensi"},
     *      summary="Ubah Buku Referensi",
     *      description="Mengubah Buku Referensi",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Mengubah Buku Referensi",
     *      @OA\JsonContent(
     *          required={"id_publikasi", "id_litabmas", "judul", "penulis", "penerbit", "tgl_terbit"},
     *          @OA\Property(property="id_publikasi", type="string", format="text", example="1"),
     *          @OA\Property(property="id_litabmas", type="string", format="text", example="1"),
     *          @OA\Property(property="judul", type="string", format="text", example="Judul Publikasi"),
     *          @OA\Property(property="penulis", type="string", format="text", example="Penulis"),
     *          @OA\Property(property="penerbit", type="string", format="text", example="Penerbit"),
     *          @OA\Property(property="isbn", type="string", format="text", example="1"),
     *          @OA\Property(property="tgl_terbit", type="date", format="date", example="2022-01-25"),
     *          @OA\Property(property="sk_tugas", type="string", format="text", example="SK TUGAS"),
     *          @OA\Property(property="tgl_sk_tugas", type="date", format="date", example="2022-01-25"),
     * 
     *                  @OA\Property(
     *                     property="id_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="9c466255-68e3-4476-97a4-a42ced793202"),
     *                 ),
     *                  @OA\Property(
     *                     property="urutan_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="afiliasi_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Universitas Lampung"),
     *                 ),
     *                 @OA\Property(
     *                     property="peran_tulis_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="A"),
     *                 ),
     *                 @OA\Property(
     *                     property="jns_penulis_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *
     *                 @OA\Property(
     *                     property="id_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="faae58b0-d2b2-4b88-9966-0000458f9fcd"),
     *                 ),
     *                  @OA\Property(
     *                     property="urutan_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="afiliasi_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Universitas Lampung"),
     *                 ),
     *                 @OA\Property(
     *                     property="peran_tulis_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="A"),
     *                 ),
     *                 @OA\Property(
     *                     property="jns_penulis_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="nm_pd_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Nama Mahasiswa"),
     *                 ),
     *                 @OA\Property(
     *                     property="nipd_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     nullable="true",
     *                     @OA\Items(type="string", format="string", example="null"),
     *                 ),
     *
     *                 @OA\Property(
     *                     property="id_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="9878daeb-7c52-41be-afa0-28bd6f6c6ddf"),
     *                 ),
     *                  @OA\Property(
     *                     property="urutan_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="afiliasi_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Universitas Lampung"),
     *                 ),
     *                 @OA\Property(
     *                     property="peran_tulis_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="A"),
     *                 ),
     *                 @OA\Property(
     *                     property="jns_penulis_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
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

     /**
     * @OA\Delete (
     *      path="/buku_referensi/delete",
     *      operationId="deleteBukuReferensi",
     *      tags={"Buku Referensi"},
     *      summary="Hapus Buku Referensi",
     *      description="Menghapus Buku Referensi",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Menghapus Buku Referensi",
     *      @OA\JsonContent(
     *          required={"id_publikasi"},
     *          @OA\Property(property="id_publikasi", type="string", format="text", example="1")
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