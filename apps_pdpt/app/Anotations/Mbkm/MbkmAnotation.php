<?php

/**
 * @OA\Get(
 *      path="/mbkm/list_periode",
 *      operationId="getPeriodeMbkm",
 *      tags={"MBKM"},
 *      summary="Data daftar Periode MBKM",
 *      description="Menampilkan Periode MBKM",
 *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="count", description="masukan jumlah data", example="50", required=false, in="query",
 *          @OA\Schema(type="number")),
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
 * @OA\Post (
 *      path="/mbkm/tambah_periode",
 *      operationId="postPeriodeMbkm",
 *      tags={"MBKM"},
 *      summary="Tambah Periode MBKM",
 *      description="Menambah Periode MBKM",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah Periode MBKM",
 *      @OA\JsonContent(
 *          required={"id_smt","id_jns_akt_mhs","nm_periode_mbkm","nm_penyelenggara","waktu_mulai","waktu_selesai"},
 *          @OA\Property(property="id_smt", type="string", format="text", example="20212"),
 *          @OA\Property(property="id_jns_akt_mhs", type="number", format="number", example="1"),
 *          @OA\Property(property="nm_periode_mbkm", type="string", format="text", example="Nama Periode Mbkm"),
 *          @OA\Property(property="nm_penyelenggara", type="string", format="text", example="Nama Penyelenggara"),
 *          @OA\Property(property="waktu_mulai", type="string", format="string", example="08:00"),
 *          @OA\Property(property="waktu_selesai", type="string", format="string", example="15:00"),
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
 * @OA\Get(
 *      path="/mbkm/list_peserta",
 *      operationId="getPesertaMbkm",
 *      tags={"MBKM"},
 *      summary="Data daftar Peserta MBKM",
 *      description="Menampilkan Peserta MBKM",
 *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="count", description="masukan jumlah data", example="50", required=false, in="query",
 *          @OA\Schema(type="number")),
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
 * @OA\Post (
 *      path="/mbkm/tambah_peserta",
 *      operationId="postPesertaMbkm",
 *      tags={"MBKM"},
 *      summary="Tambah Peserta MBKM",
 *      description="Menambah Peserta MBKM",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah Peserta MBKM",
 *      @OA\JsonContent(
 *          required={"id_periode_mbkm","id_reg_pd","lokasi_mbkm","a_diluar_pt","judul_akt_mhs","sk_tugas", "tgl_sk_tugas", "ket_akt","a_komunal","id_sdm","urutan_promotor"},
 *          @OA\Property(property="id_periode_mbkm", type="string", format="text", example="52ADB968-128F-4EF6-8E83-4F16BD4150C2"),
 *          @OA\Property(property="id_reg_pd", type="string", format="text", example="A1E96B11-2373-4DBD-A1B6-DA7C47FA89F5"),
 *          @OA\Property(property="lokasi_mbkm", type="string", format="text", example="Universitas Indonesia"),
 *          @OA\Property(property="a_diluar_pt", type="number", format="number", example="1"),
 *          @OA\Property(property="judul_akt_mhs", type="string", format="text", example="Asistensi Mengajar di Satuan Pendidikan"),
 *          @OA\Property(property="sk_tugas", type="string", format="text", example="File SK tugas"),
 *          @OA\Property(property="tgl_sk_tugas", type="string", format="string", example="2022-02-04 06:56:22"),
 *          @OA\Property(property="ket_akt", type="string", format="string", example="Asistensi Mengajar di Universitas Indonesia"),
 *          @OA\Property(property="a_komunal", type="number", format="number", example="1"),
 *          @OA\Property(property="id_sdm", type="number", format="number", example="5E2D9D48-78E6-44E1-83BC-ABCF4215FA50"),
 *          @OA\Property(property="urutan_promotor", type="number", format="number", example="1"),
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
 *      path="/mbkm/hapus_peserta",
 *      operationId="deletePesertaMbkm",
 *      tags={"MBKM"},
 *      summary="Hapus Peserta MBKM",
 *      description="Menghapus Peserta MBKM",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menghapus data Peserta MBKM berdasarkan id_daftar_kampus_merdeka",
 *      @OA\JsonContent(
 *          required={"id_daftar_kampus_merdeka"},
 *          @OA\Property(property="id_daftar_kampus_merdeka", type="string", format="text", example="masukan id_daftar_kampus_merdeka disini")
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
