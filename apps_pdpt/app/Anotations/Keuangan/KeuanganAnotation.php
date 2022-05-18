<?php

/**
 * @OA\Get(
 *     path="/keuangan/kelasukt/daftar",
 *     tags={"Keuangan"},
 *     summary="Mendapatkan Daftar Kelas UKT",
 *     description="Menampilkan Daftar Kelas UKT",
 *     operationId="daftarKelasUkt",
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
 *      security={{"token":{}}}
 *     )
 * )
 */

/**
 * @OA\Post (
 *      path="/keuangan/kelasukt/tambah",
 *      operationId="tambahKelasUkt",
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
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Put (
 *      path="/keuangan/kelasukt/ubah",
 *      operationId="ubahKelasUkt",
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
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Delete (
 *      path="/keuangan/kelasukt/hapus",
 *      operationId="hapusKelasUkt",
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
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Get(
 *     path="/keuangan/gajisdm/daftar",
 *     tags={"Keuangan"},
 *     summary="Mendapatkan Daftar Riwayat Gaji Berkala SDM",
 *     description="Menampilkan Daftar Riwayat Gaji Berkala SDM",
 *     operationId="daftarGajiSdm",
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
 *      security={{"token":{}}}
 *     )
 * )
 */

/**
 * @OA\Post (
 *      path="/keuangan/gajisdm/tambah",
 *      operationId="tambahGajiSdm",
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
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Put (
 *      path="/keuangan/gajisdm/ubah",
 *      operationId="ubahGajiSdm",
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
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Delete (
 *      path="/keuangan/gajisdm/hapus",
 *      operationId="hapusGajiSdm",
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
 *      security={{"token":{}}}
 *     )
 */


/**
 * @OA\Get(
 *     path="/keuangan/uktmhs/daftar",
 *     tags={"Keuangan"},
 *     summary="Mendapatkan Daftar UKT Mahasiswa",
 *     description="Menampilkan Daftar UKT Mahasiswa",
 *     operationId="daftarUktMhs",
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
 *      security={{"token":{}}}
 *     )
 * )
 */

/**
 * @OA\Get(
 *      path="/keuangan/uktmhs/daftar_id/",
 *      tags={"Keuangan"},
 *      summary="Mendapatkan Daftar UKT Mahasiswa Berdasarkan NPM",
 *      description="Menampilkan Daftar UKT Mahasiswa Berdasarkan NPM",
 *      operationId="daftar_idUktMhs",
 * @OA\Parameter(
 *      name="npm",
 *      description="",
 *      example="1705110111",
 *      required=true,
 *      in="query",
 *     @OA\Schema(
 *        type="string"
 *    )
 * ),
 * @OA\Response(
 *    response=200,
 *   description="Successful operation",
 * ),
 *
 * @OA\Response(
 *   response=401,
 *  description="Unauthenticated",
 * ),
 * @OA\Response(
 *  response=403,
 * description="Forbidden"
 * ),
 * security={{"token":{}}}
 *
 * )
 */

/**
 * @OA\Post (
 *      path="/keuangan/uktmhs/tambah",
 *      operationId="tambahUktMhs",
 *      tags={"Keuangan"},
 *      summary="Tambah UKT Mahasiswa",
 *      description="Menambah UKT Mahasiswa",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah UKT Mahasiswa",
 *      @OA\JsonContent(
 *          required={"id_kelas_ukt","id_smt","id_reg_pd","tgl_bayar","nominal","kode_pembayaran","nomor_pin","kode_akses","bill_ref","flag_by","ket"},
 *               @OA\Property(property="id_kelas_ukt", type="string", format="text", example="5e37d177-cd63-4421-bfb3-a34390589087"),
 *               @OA\Property(property="id_smt", type="string", format="text", example="20221"),
 *               @OA\Property(property="id_reg_pd", type="string", format="text", example="830c07c0-bc64-4193-b6ad-0000eeb6fc87"),
 *               @OA\Property(property="tgl_bayar", type="string", format="text", example="2022-01-11 12:23:24.000"),
 *               @OA\Property(property="nominal", type="number", format="number", example="3000000"),
 *               @OA\Property(property="kode_pembayaran", type="string", format="text", example="11"),
 *               @OA\Property(property="nomor_pin", type="string", format="text", example="11"),
 *               @OA\Property(property="kode_akses", type="string", format="text", example="11"),
 *               @OA\Property(property="bill_ref", type="string", format="text", example="11"),
 *               @OA\Property(property="flag_by", type="string", format="text", example="11"),
 *               @OA\Property(property="ket", type="string", format="text", example="11"),
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
 *      path="/keuangan/uktmhs/ubah",
 *      operationId="ubahUktMhs",
 *      tags={"Keuangan"},
 *      summary="Ubah UKT Mahasiswa",
 *      description="Mengubah UKT Mahasiswa",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah UKT Mahasiswa",
 *      @OA\JsonContent(
 *          required={"id_spp_mhs","id_kelas_ukt","id_smt","id_reg_pd","tgl_bayar","nominal","kode_pembayaran","nomor_pin","kode_akses","bill_ref","flag_by","ket"},
 *           @OA\Property(property="id_spp_mhs", type="string", format="text", example=""),
 *              @OA\Property(property="id_kelas_ukt", type="string", format="text", example=""),
 *               @OA\Property(property="id_smt", type="string", format="text", example=""),
 *               @OA\Property(property="id_reg_pd", type="string", format="text", example=""),
 *               @OA\Property(property="tgl_bayar", type="string", format="text", example=""),
 *               @OA\Property(property="nominal", type="number", format="number", example=""),
 *               @OA\Property(property="kode_pembayaran", type="string", format="text", example=""),
 *               @OA\Property(property="nomor_pin", type="string", format="text", example=""),
 *               @OA\Property(property="kode_akses", type="string", format="text", example=""),
 *               @OA\Property(property="bill_ref", type="string", format="text", example=""),
 *               @OA\Property(property="flag_by", type="string", format="text", example=""),
 *               @OA\Property(property="ket", type="string", format="text", example=""),
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
 *      path="/keuangan/uktmhs/hapus",
 *      operationId="hapusUktMhs",
 *      tags={"Keuangan"},
 *      summary="Hapus UKT Mahasiswa",
 *      description="Menghapus UKT Mahasiswa",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menghapus UKT Mahasiswa",
 *      @OA\JsonContent(
 *          required={"id_spp_mhs"},
 *          @OA\Property(property="id_spp_mhs", type="string", format="text", example="")
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
