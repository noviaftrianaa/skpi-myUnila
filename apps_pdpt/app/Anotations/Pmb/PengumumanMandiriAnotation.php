<?php

/**
 * @OA\Get(
 *      path="/pmb/list_pengumuman",
 *      operationId="getAllPengumuman",
 *      tags={"PMB"},
 *      summary="Dapatkan daftar Pengumuman",
 *      description="Menampilkan daftar data Pengumuman",
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
 *          description="Urutan pengumuman",
 *          example="DESC",
 *          required=false,
 *          in="query",
 *          @OA\Schema(
 *              type="string"
 *          )
 *     ),
 *      @OA\Response(
 *          response=200,
 *          description="Berhasil mendapatkan daftar pengumuman",
 *       ),
 *      @OA\Response(
 *          response=401,
 *          description="Tidak terautentikasi",
 *      ),
 *      @OA\Response(
 *          response=403,
 *          description="Tidak memiliki akses"
 *      ),
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Post (
 *      path="/pmb/tambah_pengumuman",
 *      operationId="tambahPengumuman",
 *      tags={"PMB"},
 *      summary="Tambah Pengumuman Baru",
 *      description="Menambah data pengumuman baru",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Data pengumuman yang akan ditambahkan",
 *      @OA\JsonContent(
 *          required={"id_thn_ajaran","no_peserta","nm_peserta","tgl_lahir","jns_kelamin","nm_slta","prov_slta","wil_tmpt_tinggal","jenis_pendaftaran","status_lulus","fak_lulus","prodi_lulus","kuota","pil_lulus"},
 *          @OA\Property(property="id_thn_ajaran", type="number", format="number", example="2024"),
 *          @OA\Property(property="no_peserta", type="string", example="202412345678"),
 *          @OA\Property(property="nm_peserta", type="string", example="John Doe"),
 *          @OA\Property(property="tgl_lahir", type="date", example="2000-01-01"),
 *          @OA\Property(property="jns_kelamin", type="string", enum={"L","P"}, example="L"),
 *          @OA\Property(property="nm_slta", type="string", example="SMA Negeri 1"),
 *          @OA\Property(property="prov_slta", type="string", example="DKI Jakarta"),
 *          @OA\Property(property="wil_tmpt_tinggal", type="string", example="Jakarta"),
 *          @OA\Property(property="jenis_pendaftaran", type="string", example="Mandiri"),
 *          @OA\Property(property="status_lulus", type="string", example="Lulus"),
 *          @OA\Property(property="fak_lulus", type="uuid", example="b1a72a6c-1f8d-4b3b-b1aa-bb8d2c8729cc"),
 *          @OA\Property(property="prodi_lulus", type="uuid", example="b9a72a6c-1f8d-4b3b-b1aa-bb8d2c8729bb"),
 *          @OA\Property(property="kuota", type="number", example="20"),
 *          @OA\Property(property="pil_lulus", type="number", example="1")
 *          ),
 *      ),
 *      @OA\Response(
 *          response=200,
 *          description="Pengumuman berhasil ditambahkan",
 *       ),
 *      @OA\Response(
 *          response=401,
 *          description="Tidak terautentikasi",
 *      ),
 *      @OA\Response(
 *          response=403,
 *          description="Tidak memiliki akses"
 *      ),
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Put (
 *      path="/pmb/ubah_pengumuman",
 *      operationId="ubahPengumuman",
 *      tags={"PMB"},
 *      summary="Ubah Pengumuman",
 *      description="Mengubah data pengumuman",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Data pengumuman yang akan diubah",
 *      @OA\JsonContent(
 *          required={"id_pengumuman","id_thn_ajaran","no_peserta","nm_peserta","tgl_lahir","jns_kelamin","nm_slta","prov_slta","wil_tmpt_tinggal","jenis_pendaftaran","status_lulus","fak_lulus","prodi_lulus","kuota","pil_lulus"},
 *          @OA\Property(property="id_pengumuman", type="string", example="123e4567-e89b-12d3-a456-426614174000"),
 *          @OA\Property(property="id_thn_ajaran", type="number", format="number", example="2024"),
 *          @OA\Property(property="no_peserta", type="string", example="202412345678"),
 *          @OA\Property(property="nm_peserta", type="string", example="John Doe"),
 *          @OA\Property(property="tgl_lahir", type="date", example="2000-01-01"),
 *          @OA\Property(property="jns_kelamin", type="string", enum={"L","P"}, example="L"),
 *          @OA\Property(property="nm_slta", type="string", example="SMA Negeri 1"),
 *          @OA\Property(property="prov_slta", type="string", example="DKI Jakarta"),
 *          @OA\Property(property="wil_tmpt_tinggal", type="string", example="Jakarta"),
 *          @OA\Property(property="jenis_pendaftaran", type="string", example="Mandiri"),
 *          @OA\Property(property="status_lulus", type="string", example="Lulus"),
 *          @OA\Property(property="fak_lulus", type="uuid", example="b1a72a6c-1f8d-4b3b-b1aa-bb8d2c8729cc"),
 *          @OA\Property(property="prodi_lulus", type="uuid", example="b9a72a6c-1f8d-4b3b-b1aa-bb8d2c8729bb"),
 *          @OA\Property(property="kuota", type="number", example="20"),
 *          @OA\Property(property="pil_lulus", type="number", example="1")
 *          ),
 *      ),
 *      @OA\Response(
 *          response=200,
 *          description="Pengumuman berhasil diubah",
 *       ),
 *      @OA\Response(
 *          response=401,
 *          description="Tidak terautentikasi",
 *      ),
 *      @OA\Response(
 *          response=403,
 *          description="Tidak memiliki akses"
 *      ),
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Delete (
 *      path="/pmb/hapus_pengumuman",
 *      operationId="hapusPengumuman",
 *      tags={"PMB"},
 *      summary="Hapus Pengumuman",
 *      description="Menghapus data pengumuman",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Data pengumuman yang akan dihapus",
 *      @OA\JsonContent(
 *          required={"id_pengumuman"},
 *          @OA\Property(property="id_pengumuman", type="string", example="123e4567-e89b-12d3-a456-426614174000")
 *          ),
 *      ),
 *      @OA\Response(
 *          response=200,
 *          description="Pengumuman berhasil dihapus",
 *       ),
 *      @OA\Response(
 *          response=401,
 *          description="Tidak terautentikasi",
 *      ),
 *      @OA\Response(
 *          response=403,
 *          description="Tidak memiliki akses"
 *      ),
 *      security={{"token":{}}}
 *     )
 */
