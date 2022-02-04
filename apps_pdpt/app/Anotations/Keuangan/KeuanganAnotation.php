<?php

//  KELAS UKT //

/**
 * @OA\Get(
 *     path="/keuangan/list_kelasukt",
 *     tags={"Keuangan"},
 *     summary="Mendapatkan Daftar Kelas UKT",
 *     description="Menampilkan Daftar Kelas UKT",
 *     operationId="getKelasUkt",
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
 *      path="/keuangan/add_kelasukt",
 *      operationId="addKelasUkt",
 *      tags={"Keuangan"},
 *      summary="Tambah Kelas UKT",
 *      description="Menambah Kelas UKT",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah Kelas UKT",
 *      @OA\JsonContent(
 *          required={"nm_kelas_ukt","nominal_ukt"},
 *          @OA\Property(property="nm_kelas_ukt", type="string", format="text", example="Nama Kelas UKT"),
 *          @OA\Property(property="nominal_ukt", type="number", format="number", example="5000000"),
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
 *      path="/keuangan/update_kelasukt",
 *      operationId="updateKelasUkt",
 *      tags={"Keuangan"},
 *      summary="Ubah Kelas UKT",
 *      description="Mengubah Kelas UKT",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah Kelas UKT",
 *      @OA\JsonContent(
 *          required={"id_kelas_ukt","nm_kelas_ukt","nominal_ukt"},
 *          @OA\Property(property="id_kelas_ukt", type="string", format="text", example="E71398A6-C126-4335-8512-1A84D35DF443"),
 *          @OA\Property(property="nm_kelas_ukt", type="string", format="text", example="Ubah Nama Kelas UKT"),
 *          @OA\Property(property="nominal_ukt", type="number", format="number", example="5000000"),
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
 *      path="/keuangan/delete_kelasukt",
 *      operationId="deleteKelasUkt",
 *      tags={"Keuangan"},
 *      summary="Hapus Kelas UKT",
 *      description="Menghapus Kelas UKT",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menghapus Kelas UKT",
 *      @OA\JsonContent(
 *          required={"id_kelas_ukt"},
 *          @OA\Property(property="id_kelas_ukt", type="string", format="text", example="E71398A6-C126-4335-8512-1A84D35DF443")
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

//  GAJI SDM //

 /**
 * @OA\Get(
 *     path="/keuangan/list_gajisdm",
 *     tags={"Keuangan"},
 *     summary="Mendapatkan Daftar Riwayat Gaji Berkala SDM",
 *     description="Menampilkan Daftar Riwayat Gaji Berkala SDM",
 *     operationId="getGajiSdm",
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
 *      path="/keuangan/add_gajisdm",
 *      operationId="addGajiSdm",
 *      tags={"Keuangan"},
 *      summary="Tambah Riwayat Gaji Berkala SDM",
 *      description="Menambah Riwayat Gaji Berkala SDM",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah Riwayat Gaji Berkala SDM",
 *      @OA\JsonContent(
 *          required={"id_sdm","id_pangkat_gol","sk_gaji_berkala","tgl_sk_gaji_berkala","tmt_kgb","masa_kerja_thn","masa_kerja_bln","gaji_pokok"},
 *              @OA\Property(property="id_sdm", type="string", format="text", example="18c445c4-a5c4-497d-85c1-00003c173a3c"),
 *              @OA\Property(property="id_pangkat_gol", type="number", format="number", example="1"),
 *              @OA\Property(property="sk_gaji_berkala", type="string", format="text", example="sk_gaji_berkala"),
 *              @OA\Property(property="tgl_sk_gaji_berkala", type="string", format="string", example="2022-02-04 06:56:22"),
 *              @OA\Property(property="tmt_kgb", type="string", format="text", example="2022-02-04 06:56:22"),
 *              @OA\Property(property="masa_kerja_thn", type="number", format="number", example="1"),
 *              @OA\Property(property="masa_kerja_bln", type="number", format="number", example="1"),
 *              @OA\Property(property="gaji_pokok", type="number", format="number", example="1"),
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
 *      path="/keuangan/update_gajisdm",
 *      operationId="updateGajiSdm",
 *      tags={"Keuangan"},
 *      summary="Ubah Riwayat Gaji Berkala SDM",
 *      description="Mengubah Riwayat Gaji Berkala SDM",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah Riwayat Gaji Berkala SDM",
 *      @OA\JsonContent(
 *          required={"id_rwy_gaji_berkala","id_sdm","id_pangkat_gol","sk_gaji_berkala","tgl_sk_gaji_berkala","tmt_kgb","masa_kerja_thn","masa_kerja_bln","gaji_pokok"},
 *              @OA\Property(property="id_rwy_gaji_berkala", type="string", format="text", example="94b5352e-e352-4e6b-83cc-a1e5737b1545"),
 *              @OA\Property(property="id_sdm", type="string", format="text", example="18c445c4-a5c4-497d-85c1-00003c173a3c"),
 *              @OA\Property(property="id_pangkat_gol", type="number", format="number", example="11"),
 *              @OA\Property(property="sk_gaji_berkala", type="string", format="text", example="ubah sk_gaji_berkala"),
 *              @OA\Property(property="tgl_sk_gaji_berkala", type="string", format="string", example="2022-02-04 06:56:22"),
 *              @OA\Property(property="tmt_kgb", type="string", format="text", example="2022-02-04 06:56:22"),
 *              @OA\Property(property="masa_kerja_thn", type="number", format="number", example="1"),
 *              @OA\Property(property="masa_kerja_bln", type="number", format="number", example="1"),
 *              @OA\Property(property="gaji_pokok", type="number", format="number", example="1"),
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
 *      path="/keuangan/delete_gajisdm",
 *      operationId="deleteGajiSdm",
 *      tags={"Keuangan"},
 *      summary="Hapus Riwayat Gaji Berkala SDM",
 *      description="Menghapus Riwayat Gaji Berkala SDM",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menghapus Riwayat Gaji Berkala SDM",
 *      @OA\JsonContent(
 *          required={"id_rwy_gaji_berkala"},
 *          @OA\Property(property="id_rwy_gaji_berkala", type="string", format="text", example="94b5352e-e352-4e6b-83cc-a1e5737b1545")
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
