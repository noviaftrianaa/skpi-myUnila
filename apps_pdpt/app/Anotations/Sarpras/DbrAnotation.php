<?php

/**
 * @OA\Get(
 *     path="/sarpras/dbr/daftar",
 *     tags={"Sarana dan Prasarana"},
 *     summary="Mendapatkan Daftar Sarpras Dbr",
 *     description="Menampilkan Daftar Sarpras Dbr",
 *     operationId="daftarSarprasDbr",
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
 *      path="/sarpras/dbr/tambah",
 *      operationId="tambahSarprasDbr",
 *      tags={"Sarana dan Prasarana"},
 *      summary="Tambah Sarpras Dbr",
 *      description="Menambah Sarpras Dbr",
 *      @OA\RequestBody(
 *      required=true,
 *      @OA\JsonContent(
 *          required={"id_jns_sarana", "id_hapus_buku", "id_sdm", "id_sms", "id_stat_milik_sarpras", "kd_kl", "kd_satker", "kd_brg", "nup", "kode_eselon1", "nama_eselon1", "kode_sub_satker", "nama_sub_satker", "panjang", "lebar", "luas", "alamat", "lintang", "bujur", "bmn_satker", "bmn_kd_barang", "bmn_nup", "nm_prasarana", "spesifikasi", "tgl_perolehan", "thn_produksi", "nilai_perolehan", "nilai_buku", "merk", "kd_kab_kota", "nm_kab_kota", "kd_prov", "nm_prov", "penggunaan", "kondisi", "no_dok_kepemilikan", "dok_kepemilikan", "jns_dok_kepemilikan", "tgl_hapus_buku", "asal_data"},
 *          @OA\Property(property="id_jns_sarana", type="string", format="text", example=""),
 *          @OA\Property(property="id_hapus_buku", type="string", format="text", example=""),
 *          @OA\Property(property="id_sdm", type="string", format="text", example=""),
 *          @OA\Property(property="id_sms", type="string", format="text", example=""),
 *          @OA\Property(property="id_stat_milik_sarpras", type="string", format="text", example=""),
 *          @OA\Property(property="kd_kl", type="string", format="text", example=""),
 *          @OA\Property(property="kd_satker", type="string", format="text", example=""),
 *          @OA\Property(property="kd_brg", type="string", format="text", example=""),
 *          @OA\Property(property="nup", type="string", format="text", example=""),
 *          @OA\Property(property="kode_eselon1", type="string", format="text", example=""),
 *          @OA\Property(property="nama_eselon1", type="string", format="text", example=""),
 *          @OA\Property(property="kode_sub_satker", type="string", format="text", example=""),
 *          @OA\Property(property="nama_sub_satker", type="string", format="text", example=""),
 *          @OA\Property(property="panjang", type="string", format="text", example=""),
 *          @OA\Property(property="lebar", type="string", format="text", example=""),
 *          @OA\Property(property="luas", type="string", format="text", example=""),
 *          @OA\Property(property="alamat", type="string", format="text", example=""),
 *          @OA\Property(property="lintang", type="string", format="text", example=""),
 *          @OA\Property(property="bujur", type="string", format="text", example=""),
 *          @OA\Property(property="bmn_satker", type="string", format="text", example=""),
 *          @OA\Property(property="bmn_kd_barang", type="string", format="text", example=""),
 *          @OA\Property(property="bmn_nup", type="string", format="text", example=""),
 *          @OA\Property(property="nm_prasarana", type="string", format="text", example=""),
 *          @OA\Property(property="spesifikasi", type="string", format="text", example=""),
 *          @OA\Property(property="tgl_perolehan", type="string", format="text", example=""),
 *          @OA\Property(property="thn_produksi", type="string", format="text", example=""),
 *          @OA\Property(property="nilai_perolehan", type="string", format="text", example=""),
 *          @OA\Property(property="nilai_buku", type="string", format="text", example=""),
 *          @OA\Property(property="merk", type="string", format="text", example=""),
 *          @OA\Property(property="kd_kab_kota", type="string", format="text", example=""),
 *          @OA\Property(property="nm_kab_kota", type="string", format="text", example=""),
 *          @OA\Property(property="kd_prov", type="string", format="text", example=""),
 *          @OA\Property(property="nm_prov", type="string", format="text", example=""),
 *          @OA\Property(property="penggunaan", type="string", format="text", example=""),
 *          @OA\Property(property="kondisi", type="string", format="text", example=""),
 *          @OA\Property(property="no_dok_kepemilikan", type="string", format="text", example=""),
 *          @OA\Property(property="dok_kepemilikan", type="string", format="text", example=""),
 *          @OA\Property(property="jns_dok_kepemilikan", type="string", format="text", example=""),
 *          @OA\Property(property="tgl_hapus_buku", type="string", format="text", example=""),
 *          @OA\Property(property="asal_data", type="string", format="text", example=""),
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
 *      path="/sarpras/dbr/ubah",
 *      operationId="ubahSarprasAlat",
 *      tags={"Sarana dan Prasarana"},
 *      summary="Ubah Sarpras Dbr",
 *      description="Mengubah Sarpras Dbr",
 *      @OA\RequestBody(
 *      required=true,
 *      @OA\JsonContent(
 *          required={"id_alat", "id_jns_sarana", "id_hapus_buku", "id_sdm", "id_sms", "id_stat_milik_sarpras", "kd_kl", "kd_satker", "kd_brg", "nup", "kode_eselon1", "nama_eselon1", "kode_sub_satker", "nama_sub_satker", "panjang", "lebar", "luas", "alamat", "lintang", "bujur", "bmn_satker", "bmn_kd_barang", "bmn_nup", "nm_prasarana", "spesifikasi", "tgl_perolehan", "thn_produksi", "nilai_perolehan", "nilai_buku", "merk", "kd_kab_kota", "nm_kab_kota", "kd_prov", "nm_prov", "penggunaan", "kondisi", "no_dok_kepemilikan", "dok_kepemilikan", "jns_dok_kepemilikan", "tgl_hapus_buku", "asal_data"},
 *          @OA\Property(property="id_alat", type="string", format="text", example=""),
 *          @OA\Property(property="id_jns_sarana", type="string", format="text", example=""),
 *          @OA\Property(property="id_hapus_buku", type="string", format="text", example=""),
 *          @OA\Property(property="id_sdm", type="string", format="text", example=""),
 *          @OA\Property(property="id_sms", type="string", format="text", example=""),
 *          @OA\Property(property="id_stat_milik_sarpras", type="string", format="text", example=""),
 *          @OA\Property(property="kd_kl", type="string", format="text", example=""),
 *          @OA\Property(property="kd_satker", type="string", format="text", example=""),
 *          @OA\Property(property="kd_brg", type="string", format="text", example=""),
 *          @OA\Property(property="nup", type="string", format="text", example=""),
 *          @OA\Property(property="kode_eselon1", type="string", format="text", example=""),
 *          @OA\Property(property="nama_eselon1", type="string", format="text", example=""),
 *          @OA\Property(property="kode_sub_satker", type="string", format="text", example=""),
 *          @OA\Property(property="nama_sub_satker", type="string", format="text", example=""),
 *          @OA\Property(property="panjang", type="string", format="text", example=""),
 *          @OA\Property(property="lebar", type="string", format="text", example=""),
 *          @OA\Property(property="luas", type="string", format="text", example=""),
 *          @OA\Property(property="alamat", type="string", format="text", example=""),
 *          @OA\Property(property="lintang", type="string", format="text", example=""),
 *          @OA\Property(property="bujur", type="string", format="text", example=""),
 *          @OA\Property(property="bmn_satker", type="string", format="text", example=""),
 *          @OA\Property(property="bmn_kd_barang", type="string", format="text", example=""),
 *          @OA\Property(property="bmn_nup", type="string", format="text", example=""),
 *          @OA\Property(property="nm_prasarana", type="string", format="text", example=""),
 *          @OA\Property(property="spesifikasi", type="string", format="text", example=""),
 *          @OA\Property(property="tgl_perolehan", type="string", format="text", example=""),
 *          @OA\Property(property="thn_produksi", type="string", format="text", example=""),
 *          @OA\Property(property="nilai_perolehan", type="string", format="text", example=""),
 *          @OA\Property(property="nilai_buku", type="string", format="text", example=""),
 *          @OA\Property(property="merk", type="string", format="text", example=""),
 *          @OA\Property(property="kd_kab_kota", type="string", format="text", example=""),
 *          @OA\Property(property="nm_kab_kota", type="string", format="text", example=""),
 *          @OA\Property(property="kd_prov", type="string", format="text", example=""),
 *          @OA\Property(property="nm_prov", type="string", format="text", example=""),
 *          @OA\Property(property="penggunaan", type="string", format="text", example=""),
 *          @OA\Property(property="kondisi", type="string", format="text", example=""),
 *          @OA\Property(property="no_dok_kepemilikan", type="string", format="text", example=""),
 *          @OA\Property(property="dok_kepemilikan", type="string", format="text", example=""),
 *          @OA\Property(property="jns_dok_kepemilikan", type="string", format="text", example=""),
 *          @OA\Property(property="tgl_hapus_buku", type="string", format="text", example=""),
 *          @OA\Property(property="asal_data", type="string", format="text", example=""),
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
 *      path="/sarpras/dbr/hapus",
 *      operationId="hapusSarprasAlat",
 *      tags={"Sarana dan Prasarana"},
 *      summary="Hapus Sarpras Alat",
 *      description="Menghapus Sarpras Dbr",
 *      @OA\RequestBody(
 *      required=true,
 *      @OA\JsonContent(
 *          required={"id_alat"},
 *          @OA\Property(property="id_alat", type="string", format="text", example="")
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
