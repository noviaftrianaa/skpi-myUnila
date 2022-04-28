<?php
/**
 * @OA\Get(
 *     path="/buku_ajar/daftar",
 *     tags={"Buku Ajar"},
 *     summary="Mendapatkan Daftar Buku Ajar",
 *     description="Menampilkan Daftar Buku Ajar",
 *     operationId="daftarBukuAjar",
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
 *      security={{"bearer_token":{}}}
 *     )
 * )
 */

/**
 * @OA\Get(
 *     path="/buku_ajar/daftar_id",
 *     tags={"Buku Ajar"},
 *     summary="Mendapatkan Daftar Buku Ajar Berdasarkan id_sdm",
 *     description="Menampilkan Daftar Buku Ajar Berdasarkan id_sdm",
 *     operationId="daftar_idBukuAjar",
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
 *     @OA\Parameter(
 *          name="id_sdm",
 *          description="",
 *          example="9C466255-68E3-4476-97A4-A42CED793202",
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
 *     path="/buku_ajar/detail",
 *     tags={"Buku Ajar"},
 *     summary="Mendapatkan Detail Buku Ajar Berdasarkan id_buku_ajar",
 *     description="Menampilkan Detail Buku Ajar Berdasarkan id_buku_ajar",
 *     operationId="detailBukuAjar",
 *     @OA\Parameter(
 *          name="id_buku_ajar",
 *          description="",
 *          example="7C8621CC-35FA-408E-AC5D-BCFB6436DBD2",
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
 * @OA\Post (
 *      path="/buku_ajar/tambah",
 *      operationId="tambahBukuAjar",
 *      tags={"Buku Ajar"},
 *      summary="Tambah Buku Ajar",
 *      description="Menambah Buku Ajar",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah Buku Ajar",
 *      @OA\JsonContent(
 *          required={"id_litabmas", "judul_buku", "penulis", "penerbit", "tgl_terbit"},
 *          @OA\Property(property="id_litabmas", type="string", format="text", example="bb96579f-e5d4-40d2-81b3-f4886aa32a09"),
 *          @OA\Property(property="judul_buku", type="string", format="text", example="Judul Buku"),
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
 * @OA\Put (
 *      path="/buku_ajar/ubah",
 *      operationId="ubahBukuAjar",
 *      tags={"Buku Ajar"},
 *      summary="Ubah Buku Ajar",
 *      description="Mengubah Buku Ajar",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah Buku Ajar",
 *      @OA\JsonContent(
 *          required={"id_buku_ajar", "id_litabmas", "judul_buku", "penulis", "penerbit", "tgl_terbit"},
 *          @OA\Property(property="id_buku_ajar", type="string", format="text", example="5157d30e-e1e7-482a-989c-008524536862"),
 *          @OA\Property(property="id_litabmas", type="string", format="text", example="bb96579f-e5d4-40d2-81b3-f4886aa32a09"),
 *          @OA\Property(property="judul_buku", type="string", format="text", example="Judul Buku"),
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
 *      path="/buku_ajar/hapus",
 *      operationId="hapusBukuAjar",
 *      tags={"Buku Ajar"},
 *      summary="Hapus Buku Ajar",
 *      description="Menghapus Buku Ajar",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menghapus Buku Ajar",
 *      @OA\JsonContent(
 *          required={"id_buku_ajar"},
 *          @OA\Property(property="id_buku_ajar", type="string", format="text", example="7C8621CC-35FA-408E-AC5D-BCFB6436DBD2")
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
