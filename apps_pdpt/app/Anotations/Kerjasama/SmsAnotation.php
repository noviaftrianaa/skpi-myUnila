<?php

/**
 * @OA\Get(
 *      path="/kerjasama/list_sms",
 *      operationId="getListSmsKerjasama",
 *      tags={"Kerjasama"},
 *      summary="Dapatkan daftar Sms Kerjasama",
 *      description="Menampilkan daftar data Sms Kerjasama",
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
 *          name="sort_by",
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
 */

/**
 * @OA\Post (
 *      path="/kerjasama/tambah_sms",
 *      operationId="postTambahSmsKerjasama",
 *      tags={"Kerjasama"},
 *      summary="Tambah data Sms Kerjasama",
 *      description="Menambah data Sms Kerjasama",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah data Sms Kerjasama",
 *      @OA\JsonContent(
 *          required={"id_tingkat_kerjasama","id_sms","id_mou"},
 *          @OA\Property(property="id_tingkat_kerjasama", type="number", format="number", example="Masukkan ID Tingkat Kerjasama"),
 *          @OA\Property(property="id_sumber_dana", type="number", format="number", example="Masukkan ID Sumber Dana"),
 *          @OA\Property(property="id_stat_kerjasama",  type="number", format="number", example="Masukkan ID Status Kerjasama"),
 *          @OA\Property(property="id_sms",  type="string", format="text", example="Masukkan ID Sms"),
 *          @OA\Property(property="id_mou",  type="string", format="text", example="Masukkan ID Mou"),
 *          @OA\Property(property="id_bid_kerjasama", type="number", format="number", example="Masukkan ID Bidang Kerjasama"),
 *          @OA\Property(property="id_kriteria_mitra", type="number", format="number", example="Masukkan ID Kriteria Mitra"),
 *          @OA\Property(property="id_bntk_giat_kerjasama",  type="number", format="number", example="Masukkan ID Bentuk Kegiatan Kerjasama"),
 *          @OA\Property(property="hsl_prod_brg",type="string", format="text", example="Masukkan Hasil Produk Barang"),
 *          @OA\Property(property="hsl_prod_jasa", type="string", format="text", example="Masukkan Hasil Produk Jasa"),
 *          @OA\Property(property="omzet_barang_per_bulan", type="number", format="number", example="Masukkan Omzet Barang per bulan"),
 *          @OA\Property(property="omzet_jasa_per_bulan", type="number", format="number", example="Masukkan Omzet Jasa per bulan"),
 *          @OA\Property(property="prestasi_penghargaan",type="string", format="text", example="Masukkan Prestasi Penghargaan"),
 *          @OA\Property(property="pangsa_psr_brg", type="string", format="text", example="Masukkan Pangsa Pasar Barang"),
 *          @OA\Property(property="pangsa_psr_jasa", type="string", format="text", example="Masukkan Pangsa Pasar Jasa"),
 *          @OA\Property(property="besaran_kerjasama", type="number", format="number", example="Masukkan Besaran Kerjasama"),
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
 *      path="/kerjasama/ubah_sms",
 *      operationId="ubahMou",
 *      tags={"Kerjasama"},
 *      summary="Mengubah daftar Mou Kerjasama",
 *      description="Mengubah daftar Mou Kerjasama",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah daftar Mou kerjsama ",
 *      @OA\JsonContent(
 *          required={"id_sms_kerjasama","id_tingkat_kerjasama","id_sms","id_mou"},
 *          @OA\Property(property="id_sms_kerjasama", type="string", format="text", example="Masukkan ID Sms Kerjasama"),
 *          @OA\Property(property="id_tingkat_kerjasama", type="number", format="number", example="Masukkan ID Tingkat Kerjasama"),
 *          @OA\Property(property="id_sumber_dana", type="number", format="number", example="Masukkan ID Sumber Dana"),
 *          @OA\Property(property="id_stat_kerjasama",  type="number", format="number", example="Masukkan ID Status Kerjasama"),
 *          @OA\Property(property="id_sms",  type="string", format="text", example="Masukkan ID Sms"),
 *          @OA\Property(property="id_mou",  type="string", format="text", example="Masukkan ID Mou"),
 *          @OA\Property(property="id_bid_kerjasama", type="number", format="number", example="Masukkan ID Bidang Kerjasama"),
 *          @OA\Property(property="id_kriteria_mitra", type="number", format="number", example="Masukkan ID Kriteria Mitra"),
 *          @OA\Property(property="id_bntk_giat_kerjasama",  type="number", format="number", example="Masukkan ID Bentuk Kegiatan Kerjasama"),
 *          @OA\Property(property="hsl_prod_brg",type="string", format="text", example="Masukkan Hasil Produk Barang"),
 *          @OA\Property(property="hsl_prod_jasa", type="string", format="text", example="Masukkan Hasil Produk Jasa"),
 *          @OA\Property(property="omzet_barang_per_bulan", type="number", format="number", example="Masukkan Omzet Barang per bulan"),
 *          @OA\Property(property="omzet_jasa_per_bulan", type="number", format="number", example="Masukkan Omzet Jasa per bulan"),
 *          @OA\Property(property="prestasi_penghargaan",type="string", format="text", example="Masukkan Prestasi Penghargaan"),
 *          @OA\Property(property="pangsa_psr_brg", type="string", format="text", example="Masukkan Pangsa Pasar Barang"),
 *          @OA\Property(property="pangsa_psr_jasa", type="string", format="text", example="Masukkan Pangsa Pasar Jasa"),
 *          @OA\Property(property="besaran_kerjasama", type="number", format="number", example="Masukkan Besaran Kerjasama"),
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
 *      path="/kerjasama/hapus_sms",
 *      operationId="hapusSms",
 *      tags={"Kerjasama"},
 *      summary="Menghapus daftar Sms Kerjasama",
 *      description="Menghapus daftar Sms Kerjasama",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menghapus data Sms Kerjasama berdasarkan id_sms_kerjasama",
 *      @OA\JsonContent(
 *          required={"id_sms_kerjasama"},
 *          @OA\Property(property="id_sms_kerjasama", type="string", format="text", example="masukan id_sms_kerjasama disini")
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