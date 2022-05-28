<?php

/**
 * @OA\Get(
 *      path="/mata_kuliah/list_peserta",
 *      operationId="getPesertaKelas",
 *      tags={"Mata Kuliah"},
 *      summary="Data daftar Peserta Kelas",
 *      description="Menampilkan Peserta Kelas",
 *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="item", description="masukan jumlah data", example="50", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="idKelas", description="Masukan idKelas", example="22696C0D-5D31-4E9C-8A92-7107E5D9ED71", required=true, in="query",
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
 *      path="/mata_kuliah/peserta/tambah",
 *      operationId="postPesertaKelas",
 *      tags={"Mata Kuliah"},
 *      summary="Tambah Peserta Kelas",
 *      description="Menyimpan data Peserta Kelas",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Simpan data mata kuliah",
 *        @OA\JsonContent(
 *          required={"id_kls","id_reg_pd"},
 *          @OA\Property(property="id_kls", type="string", format="text", example="22696C0D-5D31-4E9C-8A92-7107E5D9ED71"),
 *          @OA\Property(property="id_reg_pd", type="string", format="text", example="85B8D0FA-05F2-4ACA-9945-357A3154C5AE"),
 *          @OA\Property(property="nilai_angka", type="number", format="number", example="79"),
 *          @OA\Property(property="nilai_huruf", type="string", format="string", example="A"),
 *          @OA\Property(property="nilai_indeks", type="number", format="number", example="3"),
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
 *      path="/mata_kuliah/peserta/ubah",
 *      operationId="putPesertaKelas",
 *      tags={"Mata Kuliah"},
 *      summary="Ubah Peserta Kelas",
 *      description="Mengubah data Peserta Kelas",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Ubah data mata kuliah",
 *        @OA\JsonContent(
 *          required={"id_kls","id_reg_pd"},
 *          @OA\Property(property="id_kls", type="string", format="text", example="22696C0D-5D31-4E9C-8A92-7107E5D9ED71"),
 *          @OA\Property(property="id_reg_pd", type="string", format="text", example="85B8D0FA-05F2-4ACA-9945-357A3154C5AE"),
 *          @OA\Property(property="nilai_angka", type="number", format="number", example="79"),
 *          @OA\Property(property="nilai_huruf", type="string", format="string", example="A"),
 *          @OA\Property(property="nilai_indeks", type="number", format="number", example="3"),
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
 *      path="/mata_kuliah/peserta/hapus",
 *      operationId="deletePesertaKelas",
 *      tags={"Mata Kuliah"},
 *      summary="Hapus Mata Kuliah",
 *      description="Menghapus data Mata Kuliah",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Hapus data mata kuliah",
 *        @OA\JsonContent(
 *          required={"id_kls","id_reg_pd"},
 *          @OA\Property(property="id_kls", type="string", format="text", example="22696C0D-5D31-4E9C-8A92-7107E5D9ED71"),
 *          @OA\Property(property="id_reg_pd", type="string", format="text", example="85B8D0FA-05F2-4ACA-9945-357A3154C5AE"),
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






