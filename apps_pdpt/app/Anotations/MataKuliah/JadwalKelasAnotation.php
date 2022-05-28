<?php

/**
 * @OA\Get(
 *      path="/mata_kuliah/list_jadwal",
 *      operationId="getJadwal Kelas",
 *      tags={"Mata Kuliah"},
 *      summary="Data daftar Jadwal Kelas",
 *      description="Menampilkan Jadwal Kelas",
 *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="item", description="masukan jumlah data", example="50", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="idProdi", description="Masukan idProdi", example="54BBD27B-2376-4CAE-9951-76EF54BD2CA2", required=true, in="query",
 *          @OA\Schema(type="string")),
 *      @OA\Parameter( name="idSmt", description="Masukan idSmt", example="20201", required=true, in="query",
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
 *      path="/mata_kuliah/jadwal/tambah",
 *      operationId="postJadwalKelas",
 *      tags={"Mata Kuliah"},
 *      summary="Tambah Jadwal Kelas",
 *      description="Menyimpan data Jadwal Kelas",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Simpan data jadwal kelas",
 *        @OA\JsonContent(
 *          required={"id_smt","id_kls"},
 *          @OA\Property(property="id_kls", type="string", format="text", example="9DCF2A1B-61BE-4E72-8F93-022D58D0F17D"),
 *          @OA\Property(property="id_smt", type="string", format="text", example="20201"),
 *          @OA\Property(property="pertemuan", type="string", format="text", example="1"),
 *          @OA\Property(property="tgl_jadwal", type="date", format="date", example="2021-07-01"),
 *          @OA\Property(property="waktu_mulai", type="string", format="text", example="08:00"),
 *          @OA\Property(property="waktu_selesai", type="string", format="text", example="09:30"),
 *          @OA\Property(property="lokasi", type="string", format="text", example="GIK lt 2"),
 *          @OA\Property(property="status", type="string", format="text", example=""),
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
 *      path="/mata_kuliah/jadwal/ubah",
 *      operationId="putJadwalKelas",
 *      tags={"Mata Kuliah"},
 *      summary="Ubah Jadwal Kelas",
 *      description="Mengubah data Jadwal Kelas",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Ubah data jadwal kelas",
 *        @OA\JsonContent(
 *          required={"id_jdwl_kls","id_smt","id_kls"},
 *          @OA\Property(property="id_jdwl_kls", type="string", format="text", example="7F18A1AC-3746-440B-BD65-A8B0168E098E"),
 *          @OA\Property(property="id_kls", type="string", format="text", example="9DCF2A1B-61BE-4E72-8F93-022D58D0F17D"),
 *          @OA\Property(property="id_smt", type="string", format="text", example="20201"),
 *          @OA\Property(property="pertemuan", type="string", format="text", example="1"),
 *          @OA\Property(property="tgl_jadwal", type="date", format="date", example="2021-07-01"),
 *          @OA\Property(property="waktu_mulai", type="string", format="text", example="08:00"),
 *          @OA\Property(property="waktu_selesai", type="string", format="text", example="09:30"),
 *          @OA\Property(property="lokasi", type="string", format="text", example="GIK lt 2"),
 *          @OA\Property(property="status", type="string", format="text", example=""),
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
 *      path="/mata_kuliah/jadwal/hapus",
 *      operationId="deleteJadwalKelas",
 *      tags={"Mata Kuliah"},
 *      summary="Hapus Jadwal Kelas",
 *      description="Menghapus data Jadwal Kelas",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Hapus data jadwal Kelas",
 *        @OA\JsonContent(
 *          required={"id_jdwl_kls"},
 *          @OA\Property(property="id_jdwl_kls", type="string", format="text", example="7F18A1AC-3746-440B-BD65-A8B0168E098E"),
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
