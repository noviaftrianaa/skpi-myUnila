<?php

/**
 * @OA\Get(
 *      path="/diklat/list",
 *      operationId="getListDiklat",
 *      tags={"Diklat"},
 *      summary="Dapatkan daftar Diklat",
 *      description="Menampilkan daftar data Diklat",
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
 * @OA\Post (
 *      path="/diklat/tambah",
 *      operationId="postTambahDiklat",
 *      tags={"Diklat"},
 *      summary="Tambah data Diklat",
 *      description="Menambah data Diklat",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah data Diklat",
 *      @OA\JsonContent(
 *          required={"id_sdm","id_kel_bidang","id_katgiat","id_jns_diklat","nm_diklat","penyelenggara","thn","peran","tkt","jml_jam","no_sert","tgl_sert","tempat","tgl_mulai","tgl_selesai","sk_tugas","tgl_sk_tugas"},
 *          @OA\Property(property="id_sdm", type="string", format="text", example="590d9639-e2d2-4996-ab8b-599efa91145c"),
 *          @OA\Property(property="id_kel_bidang", type="string", format="text", example=NULL),
 *          @OA\Property(property="id_katgiat", type="string", format="text", example="111304"),
 *          @OA\Property(property="id_jns_diklat", type="string", format="text", example="80"),
 * @OA\Property(property="nm_diklat", type="string", format="text", example="Nama diklat"),
 * @OA\Property(property="penyelenggara", type="string", format="text", example="Nama penyelenggara"),
 * @OA\Property(property="thn", type="string", format="text", example="2022"),
 * @OA\Property(property="peran", type="string", format="text", example="Peserta"),
 * @OA\Property(property="tkt", type="string", format="text", example="1"),
 * @OA\Property(property="jml_jam", type="string", format="text", example="10"),
 * @OA\Property(property="no_sert", type="string", format="text", example="No Sertifikat"),
 * @OA\Property(property="tgl_sert", type="date", format="date", example="2022-12-28"),
 * @OA\Property(property="tempat", type="string", format="text", example="Universitas Lampung"),
 * @OA\Property(property="tgl_mulai", type="date", format="date", example="2022-09-21"),
 * @OA\Property(property="tgl_selesai", type="date", format="date", example="2022-12-07"),
 *          @OA\Property(property="sk_tugas", type="string", format="string", example="SK Tugas"),
 *          @OA\Property(property="tgl_sk_tugas", type="date", format="date", example="2020-03-30"),
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
 * @OA\Put (
 *      path="/diklat/ubah",
 *      operationId="ubahDiklat",
 *      tags={"Diklat"},
 *      summary="Mengubah daftar Diklat",
 *      description="Mengubah daftar Diklat",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah daftar Diklat",
 *      @OA\JsonContent(
 *         required={"id_diklat","id_sdm","id_kel_bidang","id_katgiat","id_jns_diklat","nm_diklat","penyelenggara","thn","peran","tkt","jml_jam","no_sert","tgl_sert","tempat","tgl_mulai","tgl_selesai","sk_tugas","tgl_sk_tugas"},
 *           @OA\Property(property="id_diklat", type="string", format="text", example="masukan id_diklat disini"),
 *          @OA\Property(property="id_sdm", type="string", format="text", example="590d9639-e2d2-4996-ab8b-599efa91145c"),
 *          @OA\Property(property="id_kel_bidang", type="string", format="text", example=NULL),
 *          @OA\Property(property="id_katgiat", type="string", format="text", example="111304"),
 *          @OA\Property(property="id_jns_diklat", type="string", format="text", example="80"),
 * @OA\Property(property="nm_diklat", type="string", format="text", example="Nama diklat"),
 * @OA\Property(property="penyelenggara", type="string", format="text", example="Nama penyelenggara"),
 * @OA\Property(property="thn", type="string", format="text", example="2022"),
 * @OA\Property(property="peran", type="string", format="text", example="Peserta"),
 * @OA\Property(property="tkt", type="string", format="text", example="1"),
 * @OA\Property(property="jml_jam", type="string", format="text", example="10"),
 * @OA\Property(property="no_sert", type="string", format="text", example="No Sertifikat"),
 * @OA\Property(property="tgl_sert", type="date", format="date", example="2022-12-28"),
 * @OA\Property(property="tempat", type="string", format="text", example="Universitas Lampung"),
 * @OA\Property(property="tgl_mulai", type="date", format="date", example="2022-09-21"),
 * @OA\Property(property="tgl_selesai", type="date", format="date", example="2022-12-07"),
 *          @OA\Property(property="sk_tugas", type="string", format="string", example="SK Tugas"),
 *          @OA\Property(property="tgl_sk_tugas", type="date", format="date", example="2020-03-30"),
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
 * @OA\Delete (
 *      path="/diklat/hapus",
 *      operationId="hapusDiklat",
 *      tags={"Diklat"},
 *      summary="Menghapus daftar Diklat",
 *      description="Menghapus daftar Diklat",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menghapus data Diklat berdasarkan id_diklat",
 *      @OA\JsonContent(
 *          required={"id_diklat"},
 *          @OA\Property(property="id_diklat", type="string", format="text", example="masukan id_diklat disini")
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
