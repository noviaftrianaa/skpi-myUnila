<?php

/**
 * @OA\Get(
 *      path="/mata_kuliah/list_kelas",
 *      operationId="getKelas",
 *      tags={"Mata Kuliah"},
 *      summary="Data daftar Kelas",
 *      description="Menampilkan Kelas",
 *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="limit", description="masukan jumlah data", example="50", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="id_prodi", description="Masukan idProdi", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2", required=true, in="query",
 *          @OA\Schema(type="string")),
 *      @OA\Parameter( name="id_semester", description="Masukan idSmt", example="20201", required=true, in="query",
 *          @OA\Schema(type="string")),
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
 *      path="/mata_kuliah/kelas/tambah",
 *      operationId="postKelasKuliah",
 *      tags={"Mata Kuliah"},
 *      summary="Tambah Kelas Kuliah",
 *      description="Menyimpan data Kelas Kuliah",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Simpan data kelas kuliah",
 *        @OA\JsonContent(
 *          required={"id_smt","id_sms","id_mk","nm_kls","a_selenggara_pditt","a_pengguna_pditt","kuota_pditt"},
 *          @OA\Property(property="id_smt", type="string", format="text", example="20251"),
 *          @OA\Property(property="id_sms", type="string", format="text", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2"),
 *          @OA\Property(property="id_mk", type="string", format="text", example="479111A2-61FA-4D25-8415-A7C9B39A77FB"),
 *          @OA\Property(property="sks_mk", type="number", format="number", example="3"),
 *          @OA\Property(property="sks_tm", type="number", format="number", example="2"),
 *          @OA\Property(property="sks_prak", type="number", format="number", example="1"),
 *          @OA\Property(property="sks_prak_lap", type="number", format="number", example="0"),
 *          @OA\Property(property="sks_sim", type="number", format="number", example="0"),
 *          @OA\Property(property="nm_kls", type="string", format="text", example="ABC"),
 *          @OA\Property(property="bahasan_case", type="string", format="text", example=""),
 *          @OA\Property(property="a_selenggara_pditt", type="number", format="number", example="0"),
 *          @OA\Property(property="a_pengguna_pditt", type="number", format="number", example="0"),
 *          @OA\Property(property="kuota_pditt", type="number", format="number", example="0"),
 *          @OA\Property(property="kode_vclass", type="string", format="text", example=""),
 *          @OA\Property(property="url_vclass", type="string", format="text", example=""),

 *          ),
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
 * @OA\Put(
 *      path="/mata_kuliah/kelas/ubah",
 *      operationId="putKelasKuliah",
 *      tags={"Mata Kuliah"},
 *      summary="Ubah Kelas Kuliah",
 *      description="Mengubah data Kelas Kuliah",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Ubah data kelas kuliah",
 *        @OA\JsonContent(
 *          required={"id_kls","id_smt","id_sms","id_mk","nm_kls","a_selenggara_pditt","a_pengguna_pditt","kuota_pditt"},
 *          @OA\Property(property="id_kls", type="string", format="text", example="840CA467-4873-4E1B-8E4C-31DD27059537"),
 *          @OA\Property(property="id_smt", type="string", format="text", example="20251"),
 *          @OA\Property(property="id_sms", type="string", format="text", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2"),
 *          @OA\Property(property="id_mk", type="string", format="text", example="479111A2-61FA-4D25-8415-A7C9B39A77FB"),
 *          @OA\Property(property="sks_mk", type="number", format="number", example="3"),
 *          @OA\Property(property="sks_tm", type="number", format="number", example="2"),
 *          @OA\Property(property="sks_prak", type="number", format="number", example="1"),
 *          @OA\Property(property="sks_prak_lap", type="number", format="number", example="0"),
 *          @OA\Property(property="sks_sim", type="number", format="number", example="0"),
 *          @OA\Property(property="nm_kls", type="string", format="text", example="ABC"),
 *          @OA\Property(property="bahasan_case", type="string", format="text", example=""),
 *          @OA\Property(property="a_selenggara_pditt", type="number", format="number", example="0"),
 *          @OA\Property(property="a_pengguna_pditt", type="number", format="number", example="0"),
 *          @OA\Property(property="kuota_pditt", type="number", format="number", example="0"),
 *          @OA\Property(property="kode_vclass", type="string", format="text", example=""),
 *          @OA\Property(property="url_vclass", type="string", format="text", example=""),

 *          ),
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
 * @OA\Delete(
 *      path="/mata_kuliah/kelas/hapus",
 *      operationId="deleteKelasKuliah",
 *      tags={"Mata Kuliah"},
 *      summary="Hapus Kelas Kuliah",
 *      description="Menghapus data Kelas Kuliah",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Hapus data kelas kuliah",
 *        @OA\JsonContent(
 *          required={"id_kls"},
 *          @OA\Property(property="id_kls", type="string", format="text", example="840CA467-4873-4E1B-8E4C-31DD27059537"),
 *          ),
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
