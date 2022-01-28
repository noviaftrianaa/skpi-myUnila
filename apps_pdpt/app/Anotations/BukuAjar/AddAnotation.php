<?php
    /**
     * @OA\Post (
     *      path="/buku_ajar/add",
     *      operationId="addBukuAjar",
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
