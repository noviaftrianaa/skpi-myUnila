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
 *      @OA\Parameter( name="limit", description="masukan jumlah data", example="50", required=false, in="query",
 *          @OA\Schema(type="number")),
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
 *          @OA\Property(property="id_jns_akt_mhs", type="number", format="number", example="14"),
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
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Put (
 *      path="/mbkm/ubah_periode",
 *      operationId="putPeriodeMbkm",
 *      tags={"MBKM"},
 *      summary="Ubah Periode MBKM",
 *      description="Mengubah Periode MBKM",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah Periode MBKM",
 *      @OA\JsonContent(
 *          required={"id_periode_mbkm","id_smt","id_jns_akt_mhs","nm_periode_mbkm","nm_penyelenggara","waktu_mulai","waktu_selesai"},
 *          @OA\Property(property="id_periode_mbkm", type="string", format="text", example="masukan id_periode_mbkm disini"),
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
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Delete (
 *      path="/mbkm/hapus_periode",
 *      operationId="deletePeriodeMbkm",
 *      tags={"MBKM"},
 *      summary="Hapus Periode MBKM",
 *      description="Menghapus Periode MBKM",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menghapus data Periode MBKM berdasarkan id_periode_mbkm",
 *      @OA\JsonContent(
 *          required={"id_periode_mbkm"},
 *          @OA\Property(property="id_periode_mbkm", type="string", format="text", example="masukan id_periode_mbkm disini")
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
 *      path="/mbkm/list_peserta",
 *      operationId="getPesertaMbkm",
 *      tags={"MBKM"},
 *      summary="Data daftar Peserta MBKM",
 *      description="Menampilkan Peserta MBKM",
 *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="limit", description="masukan jumlah data", example="50", required=false, in="query",
 *          @OA\Schema(type="number")),
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
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Put (
 *      path="/mbkm/ubah_peserta",
 *      operationId="putPesertaMbkm",
 *      tags={"MBKM"},
 *      summary="Ubah Peserta MBKM",
 *      description="Mengubah Peserta MBKM",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah Peserta MBKM",
 *      @OA\JsonContent(
 *          required={"id_daftar_kampus_merdeka","id_periode_mbkm","id_reg_pd","lokasi_mbkm","a_diluar_pt","judul_akt_mhs","sk_tugas", "tgl_sk_tugas", "ket_akt","a_komunal","id_sdm","urutan_promotor"},
 *          @OA\Property(property="id_daftar_kampus_merdeka", type="string", format="text", example="masukan id_daftar_kampus_merdeka"),
 *          @OA\Property(property="id_periode_mbkm", type="string", format="text", example="52ADB968-128F-4EF6-8E83-4F16BD4150C2"),
 *          @OA\Property(property="id_reg_pd", type="string", format="text", example="A1E96B11-2373-4DBD-A1B6-DA7C47FA89F5"),
 *          @OA\Property(property="lokasi_mbkm", type="string", format="text", example="Universitas Indonesia"),
 *          @OA\Property(property="a_diluar_pt", type="number", format="number", example="1"),
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
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Get(
 *      path="/mbkm/detail_konversi",
 *      operationId="getKonversiMbkm",
 *      tags={"MBKM"},
 *      summary="Detail Konversi MBKM",
 *      description="Detail Konversi MBKM",
 *      @OA\Parameter( name="id_reg_pd", description="masukan id_reg_pd", example="Masukan id_reg_pd Mahasiswa", required=true, in="query",
 *          @OA\Schema(type="string")),
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
 *      path="/mbkm/tambah_konversi",
 *      operationId="postKonversiMbkm",
 *      tags={"MBKM"},
 *      summary="Tambah Konversi MBKM",
 *      description="Menambah Konversi MBKM",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah Konversi MBKM",
 *      @OA\JsonContent(
 *          required={"id_ang_akt_mhs","id_daftar_kampus_merdeka","konversi_mbkm"},
 *          @OA\Property(property="id_ang_akt_mhs", type="string", format="text", example="7c8e098b-bedd-4f4c-aa5f-e2284a94ade9"),
 *          @OA\Property(property="id_daftar_kampus_merdeka", type="string", format="text", example="4073c359-5aa6-43c3-9307-1fc1df2e5a77"),
 *             @OA\Property(
 *                property="konversi_mbkm",
 *                type="array",
 *                @OA\Items(
 *                  @OA\Property(property="id_mk", type="string", format="text", example="4c8e4762-c151-4ac4-b12f-0006d931803f"),
 *                  @OA\Property(property="nilai_angka", type="string", format="number", example="78"),
 *                  @OA\Property(property="nilai_huruf", type="string", format="number", example="A"),
 *                  @OA\Property(property="nilai_indeks", type="string", format="number", example="31.01"),
 *                  @OA\Property(property="sks_mk", type="string", format="number", example="3")
 *                ),
 *             ),
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
 *      path="/mbkm/ubah_konversi",
 *      operationId="putKonversiMbkm",
 *      tags={"MBKM"},
 *      summary="Ubah Konversi MBKM",
 *      description="Mengubah Konversi MBKM",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah Konversi MBKM",
 *      @OA\JsonContent(
 *          required={"id_konversi","id_mk","nilai_angka","nilai_huruf","nilai_indeks","sks_mk"},
 *          @OA\Property(property="id_konversi", type="string", format="text", example="masukan id_konversi disini"),
 *                  @OA\Property(property="id_mk", type="string", format="text", example="masukin id_mk"),
 *                  @OA\Property(property="nilai_angka", type="string", format="number", example="masukin nilai_angka"),
 *                  @OA\Property(property="nilai_huruf", type="string", format="number", example="masukin nilai_huruf"),
 *                  @OA\Property(property="nilai_indeks", type="string", format="number", example="masukin nilai_indeks"),
 *                  @OA\Property(property="sks_mk", type="string", format="number", example="masukin sks_mk"),
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
 *      path="/mbkm/hapus_konversi",
 *      operationId="deleteKonversiMbkm",
 *      tags={"MBKM"},
 *      summary="Hapus Konversi MBKM",
 *      description="Menghapus Konversi MBKM",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menghapus data Konversi MBKM berdasarkan id_konversi",
 *      @OA\JsonContent(
 *          required={"id_konversi"},
 *          @OA\Property(property="id_konversi", type="string", format="text", example="masukan id_konversi disini")
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
