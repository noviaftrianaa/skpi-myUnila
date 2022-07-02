<?php

/**
 * @OA\Get(
 *      path="/mata_kuliah/list_kurikulum",
 *      operationId="getKurikulum",
 *      tags={"Mata Kuliah"},
 *      summary="Data daftar Kurikulum",
 *      description="Menampilkan Kurikulum",
 *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="limit", description="masukan jumlah data", example="50", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="id_prodi", description="Masukan idProdi", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2", required=true, in="query",
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
 *      path="/mata_kuliah/kurikulum/tambah",
 *      operationId="postKurikulum",
 *      tags={"Mata Kuliah"},
 *      summary="Tambah Kurikulum",
 *      description="Menyimpan data Kurikulum",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Simpan data kurikulum",
 *        @OA\JsonContent(
 *          required={"id_jenj_didik","id_smt","id_sms","nm_kurikulum_sp","jmlh_smt_normal","jmlh_sks_lulus","jmlh_sks_wajib","jmlh_sks_pilihan","jmlh_sks_mk_wajib", "jmlh_sks_mk_pilih"},
 *          @OA\Property(property="id_jenj_didik", type="number", format="number", example="30"),
 *          @OA\Property(property="id_smt", type="string", format="text", example="20251"),
 *          @OA\Property(property="id_sms", type="string", format="text", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2"),
 *          @OA\Property(property="nm_kurikulum_sp", type="string", format="text", example="KURIKULUM COBA99"),
 *          @OA\Property(property="jmlh_smt_normal", type="number", format="number", example="8"),
 *          @OA\Property(property="jmlh_sks_lulus", type="number", format="number", example="185"),
 *          @OA\Property(property="jmlh_sks_wajib", type="number", format="number", example="147"),
 *          @OA\Property(property="jmlh_sks_pilihan", type="number", format="number", example="38"),
 *          @OA\Property(property="jmlh_sks_mk_wajib", type="number", format="number", example="23"),
 *          @OA\Property(property="jmlh_sks_mk_pilih", type="number", format="number", example="00"),

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
 *      path="/mata_kuliah/kurikulum/ubah",
 *      operationId="putKurikulum",
 *      tags={"Mata Kuliah"},
 *      summary="Ubah Kurikulum",
 *      description="Mengubah data Kurikulum",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Ubah data kurikulum kuliah",
 *        @OA\JsonContent(
 *          required={"id_kurikulum_sp","id_jenj_didik","id_smt","id_sms","nm_kurikulum_sp","jmlh_smt_normal","jmlh_sks_lulus","jmlh_sks_wajib","jmlh_sks_pilihan","jmlh_sks_mk_wajib", "jmlh_sks_mk_pilih", "a_digunakan"},
 *          @OA\Property(property="id_kurikulum_sp", type="string", format="text", example="EF5CF090-1CB9-4C57-A187-C384C2A6F326"),
 *          @OA\Property(property="id_jenj_didik", type="number", format="number", example="30"),
 *          @OA\Property(property="id_smt", type="string", format="text", example="20251"),
 *          @OA\Property(property="id_sms", type="string", format="text", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2"),
 *          @OA\Property(property="nm_kurikulum_sp", type="string", format="text", example="KURIKULUM COBA99"),
 *          @OA\Property(property="jmlh_smt_normal", type="number", format="number", example="8"),
 *          @OA\Property(property="jmlh_sks_lulus", type="number", format="number", example="185"),
 *          @OA\Property(property="jmlh_sks_wajib", type="number", format="number", example="147"),
 *          @OA\Property(property="jmlh_sks_pilihan", type="number", format="number", example="38"),
 *          @OA\Property(property="jmlh_sks_mk_wajib", type="number", format="number", example="23"),
 *          @OA\Property(property="jmlh_sks_mk_pilih", type="number", format="number", example="00"),
 *          @OA\Property(property="a_digunakan", type="number", format="number", example="1"),

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
 *      path="/mata_kuliah/kurikulum/hapus",
 *      operationId="deleteKelasKuliah",
 *      tags={"Mata Kuliah"},
 *      summary="Hapus Kurikulum",
 *      description="Menghapus data Kurikulum",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Hapus data kurikulum",
 *        @OA\JsonContent(
 *          required={"id_kurikulum_sp"},
 *          @OA\Property(property="id_kurikulum_sp", type="string", format="text", example="EF5CF090-1CB9-4C57-A187-C384C2A6F326"),
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
