<?php

/**
 * @OA\Get(
 *      path="/mata_kuliah/list_re_ajar",
 *      operationId="getRencanaAjar",
 *      tags={"Mata Kuliah"},
 *      summary="Data daftar Rencana Ajar",
 *      description="Menampilkan Rencana Ajar",
 *      @OA\Parameter( name="page", description="masukan jumlah halaman", example="1", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="limit", description="masukan jumlah data", example="50", required=false, in="query",
 *          @OA\Schema(type="number")),
 *      @OA\Parameter( name="id_mata_kuliah", description="Masukan idMk", example="0e6294a8-edc2-4297-8e8b-001363bcc401", required=true, in="query",
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
 *      path="/mata_kuliah/re_ajar/tambah",
 *      operationId="postRencanaAjar",
 *      tags={"Mata Kuliah"},
 *      summary="Tambah Rencana Ajar",
 *      description="Menyimpan data Rencana Ajar",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Simpan data Rencana Ajar",
 *        @OA\JsonContent(
 *          required={"id_mk","pertemuan"},
 *          @OA\Property(property="id_mk", type="string", format="text", example="0e6294a8-edc2-4297-8e8b-001363bcc401"),
 *          @OA\Property(property="no_urut", type="number", format="number", example="1"),
 *          @OA\Property(property="pertemuan", type="numver", format="number", example="1"),
 *          @OA\Property(property="materi_indonesia", type="string", format="text", example="STRATEGI PEMBELAJARAN CEPAT"),
 *          @OA\Property(property="materi_inggris", type="string", format="text", example=""),
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
 *      path="/mata_kuliah/re_ajar/ubah",
 *      operationId="putRencanaAjar",
 *      tags={"Mata Kuliah"},
 *      summary="Ubah Rencana Ajar",
 *      description="Mengubah data Rencana Ajar",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Ubah data rencana Ajar",
 *        @OA\JsonContent(
 *          required={"id_renc_ajar","id_mk","pertemuan"},
 *          @OA\Property(property="id_renc_ajar", type="string", format="text", example="50C175D0-6FD3-4BE7-86F6-23E7D0AAEB0C"),
 *          @OA\Property(property="id_mk", type="string", format="text", example="0e6294a8-edc2-4297-8e8b-001363bcc401"),
 *          @OA\Property(property="no_urut", type="number", format="number", example="1"),
 *          @OA\Property(property="pertemuan", type="numver", format="number", example="1"),
 *          @OA\Property(property="materi_indonesia", type="string", format="text", example="STRATEGI PEMBELAJARAN CEPAT"),
 *          @OA\Property(property="materi_inggris", type="string", format="text", example=""),
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
 *      path="/mata_kuliah/re_ajar/hapus",
 *      operationId="deleteRencanaAjar",
 *      tags={"Mata Kuliah"},
 *      summary="Hapus Rencana Ajar",
 *      description="Menghapus data Rencana Ajar",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Hapus data rencana Ajar",
 *        @OA\JsonContent(
 *          required={"id_renc_ajar"},
*          @OA\Property(property="id_renc_ajar", type="string", format="text", example="50C175D0-6FD3-4BE7-86F6-23E7D0AAEB0C"),
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
