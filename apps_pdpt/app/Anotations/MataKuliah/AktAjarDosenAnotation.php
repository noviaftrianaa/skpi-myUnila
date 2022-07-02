<?php

/**
 * @OA\Get(
 *      path="/mata_kuliah/list_dosen_ajar",
 *      operationId="getDosenAjar",
 *      tags={"Mata Kuliah"},
 *      summary="Data daftar Dosen Ajar",
 *      description="Menampilkan Dosen Ajar",
 *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="limit", description="masukan jumlah data", example="50", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="id_kelas", description="Masukan idMk", example="9DCF2A1B-61BE-4E72-8F93-022D58D0F17D", required=true, in="query",
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
 *      path="/mata_kuliah/dosen_ajar/tambah",
 *      operationId="postDosenAjar",
 *      tags={"Mata Kuliah"},
 *      summary="Tambah Dosen Ajar",
 *      description="Menyimpan data Dosen Ajar",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Simpan data Dosen Ajar",
 *        @OA\JsonContent(
 *          required={"id_kls","id_reg_ptk","sks_subst_tot", "sks_tm_subst", "sks_prak_subst", "sks_prak_lap_subst", "sks_sim_subst", "jml_tm_renc"},
 *          @OA\Property(property="id_reg_ptk", type="string", format="text", example="1a048c2d-9be3-4809-ba59-a08b9fd1a4a4"),
 *          @OA\Property(property="id_kls", type="string", format="text", example="9DCF2A1B-61BE-4E72-8F93-022D58D0F17D"),
 *          @OA\Property(property="sks_subst_tot", type="number", format="number", example="1"),
 *          @OA\Property(property="sks_tm_subst", type="numver", format="number", example="0"),
 *          @OA\Property(property="sks_prak_subst", type="string", format="text", example="0"),
 *          @OA\Property(property="sks_prak_lap_subst", type="string", format="text", example="0"),
 *          @OA\Property(property="sks_sim_subst", type="string", format="text", example="0"),
 *          @OA\Property(property="jml_tm_renc", type="string", format="text", example="16"),
 *          @OA\Property(property="jml_tm_real", type="string", format="text", example="14"),
 *          @OA\Property(property="jml_mhs", type="string", format="text", example=""),
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
 *      path="/mata_kuliah/dosen_ajar/ubah",
 *      operationId="putDosenAjar",
 *      tags={"Mata Kuliah"},
 *      summary="Ubah Dosen Ajar",
 *      description="Mengubah data Dosen Ajar",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Ubah data Dosen Ajar",
 *        @OA\JsonContent(
 *          required={"id_ajar","id_kls","id_reg_ptk","sks_subst_tot", "sks_tm_subst", "sks_prak_subst", "sks_prak_lap_subst", "sks_sim_subst", "jml_tm_renc"},
 *          @OA\Property(property="id_ajar", type="string", format="text", example="1a048c2d-9be3-4809-ba59-a08b9fd1a4a4"),
 *          @OA\Property(property="id_reg_ptk", type="string", format="text", example="1a048c2d-9be3-4809-ba59-a08b9fd1a4a4"),
 *          @OA\Property(property="id_kls", type="string", format="text", example="9DCF2A1B-61BE-4E72-8F93-022D58D0F17D"),
 *          @OA\Property(property="sks_subst_tot", type="number", format="number", example="1"),
 *          @OA\Property(property="sks_tm_subst", type="numver", format="number", example="0"),
 *          @OA\Property(property="sks_prak_subst", type="string", format="text", example="0"),
 *          @OA\Property(property="sks_prak_lap_subst", type="string", format="text", example="0"),
 *          @OA\Property(property="sks_sim_subst", type="string", format="text", example="0"),
 *          @OA\Property(property="jml_tm_renc", type="string", format="text", example="16"),
 *          @OA\Property(property="jml_tm_real", type="string", format="text", example="14"),
 *          @OA\Property(property="jml_mhs", type="string", format="text", example=""),
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
 *      path="/mata_kuliah/dosen_ajar/hapus",
 *      operationId="deleteDosenAjar",
 *      tags={"Mata Kuliah"},
 *      summary="Hapus Dosen Ajar",
 *      description="Menghapus data Dosen Ajar",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Hapus data Dosen Ajar",
 *        @OA\JsonContent(
 *          required={"id_ajar"},
*          @OA\Property(property="id_ajar", type="string", format="text", example="1a048c2d-9be3-4809-ba59-a08b9fd1a4a4"),
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
