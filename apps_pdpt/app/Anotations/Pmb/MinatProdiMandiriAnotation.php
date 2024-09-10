<?php

/**
 * @OA\Get(
 *      path="/pmb/list_minat_prodi",
 *      operationId="getAllMinatProdi",
 *      tags={"PMB"},
 *      summary="Dapatkan daftar minat prodi",
 *      description="Menampilkan daftar data minat prodi mandiri",
 *     @OA\Parameter(
 *          name="page",
 *          description="Halaman yang diinginkan",
 *          example="1",
 *          required=false,
 *          in="query",
 *          @OA\Schema(
 *              type="number"
 *          )
 *     ),
 *     @OA\Parameter(
 *          name="count",
 *          description="Jumlah data per halaman",
 *          example="10",
 *          required=false,
 *          in="query",
 *          @OA\Schema(
 *              type="number"
 *          )
 *     ),
 *     @OA\Parameter(
 *          name="sortby",
 *          description="Urutan data minat prodi",
 *          example="DESC",
 *          required=false,
 *          in="query",
 *          @OA\Schema(
 *              type="string"
 *          )
 *     ),
 *      @OA\Response(
 *          response=200,
 *          description="Berhasil mendapatkan daftar minat prodi",
 *       ),
 *      @OA\Response(
 *          response=401,
 *          description="Tidak terautentikasi",
 *      ),
 *      @OA\Response(
 *          response=403,
 *          description="Tidak memiliki akses"
 *      ),
 *      @OA\Response(
 *          response=500,
 *          description="Terjadi kesalahan saat mengambil data"
 *      ),
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Post(
 *      path="/pmb/tambah_minat_prodi",
 *      operationId="tambahMinatProdi",
 *      tags={"PMB"},
 *      summary="Tambah minat prodi",
 *      description="Menambahkan data minat prodi baru",
 *      @OA\RequestBody(
 *          required=true,
 *          description="Data minat prodi yang akan ditambahkan",
 *          @OA\JsonContent(
 *              required={"id_thn_ajaran", "id_prodi", "kategori", "jml_peminat"},
 *              @OA\Property(property="id_thn_ajaran", type="number", example="2024"),
 *              @OA\Property(property="id_prodi", type="uuid", example="b1a72a6c-1f8d-4b3b-b1aa-bb8d2c8729cc"),
 *              @OA\Property(property="kategori", type="string", maxLength=50, example="Mandiri"),
 *              @OA\Property(property="jml_peminat", type="number", example="100")
 *          ),
 *      ),
 *      @OA\Response(
 *          response=200,
 *          description="Berhasil menambahkan minat prodi",
 *       ),
 *      @OA\Response(
 *          response=401,
 *          description="Tidak terautentikasi",
 *      ),
 *      @OA\Response(
 *          response=403,
 *          description="Tidak memiliki akses"
 *      ),
 *      @OA\Response(
 *          response=500,
 *          description="Terjadi kesalahan saat menambahkan data"
 *      ),
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Put(
 *      path="/pmb/ubah_minat_prodi",
 *      operationId="ubahMinatProdi",
 *      tags={"PMB"},
 *      summary="Ubah data minat prodi",
 *      description="Mengubah data minat prodi yang sudah ada",
 *      @OA\RequestBody(
 *          required=true,
 *          description="Data minat prodi yang akan diubah",
 *          @OA\JsonContent(
 *              required={"id_minat_prodi", "id_thn_ajaran", "id_prodi", "kategori", "jml_peminat"},
 *              @OA\Property(property="id_minat_prodi", type="uuid", example="123e4567-e89b-12d3-a456-426614174000"),
 *              @OA\Property(property="id_thn_ajaran", type="number", example="2024"),
 *              @OA\Property(property="id_prodi", type="uuid", example="b1a72a6c-1f8d-4b3b-b1aa-bb8d2c8729cc"),
 *              @OA\Property(property="kategori", type="string", maxLength=50, example="Mandiri"),
 *              @OA\Property(property="jml_peminat", type="number", example="100")
 *          ),
 *      ),
 *      @OA\Response(
 *          response=200,
 *          description="Berhasil mengubah minat prodi",
 *       ),
 *      @OA\Response(
 *          response=401,
 *          description="Tidak terautentikasi",
 *      ),
 *      @OA\Response(
 *          response=403,
 *          description="Tidak memiliki akses"
 *      ),
 *      @OA\Response(
 *          response=500,
 *          description="Terjadi kesalahan saat mengubah data"
 *      ),
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Delete(
 *      path="/pmb/hapus_minat_prodi",
 *      operationId="hapusMinatProdi",
 *      tags={"PMB"},
 *      summary="Hapus minat prodi",
 *      description="Menghapus data minat prodi yang sudah ada",
 *      @OA\RequestBody(
 *          required=true,
 *          description="ID minat prodi yang akan dihapus",
 *          @OA\JsonContent(
 *              required={"id_minat_prodi"},
 *              @OA\Property(property="id_minat_prodi", type="uuid", example="123e4567-e89b-12d3-a456-426614174000")
 *          ),
 *      ),
 *      @OA\Response(
 *          response=200,
 *          description="Berhasil menghapus minat prodi",
 *       ),
 *      @OA\Response(
 *          response=401,
 *          description="Tidak terautentikasi",
 *      ),
 *      @OA\Response(
 *          response=403,
 *          description="Tidak memiliki akses"
 *      ),
 *      @OA\Response(
 *          response=500,
 *          description="Terjadi kesalahan saat menghapus data"
 *      ),
 *      security={{"token":{}}}
 *     )
 */
