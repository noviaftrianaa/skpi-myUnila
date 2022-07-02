<?php

/**
 * @OA\Get(
 *      path="/mata_kuliah/list_re_mk",
 *      operationId="getReMk",
 *      tags={"Mata Kuliah"},
 *      summary="Data daftar Rencana Evaluasi Matkul",
 *      description="Menampilkan Rencana Evaluasi Matkul",
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
 *      path="/mata_kuliah/re_mk/tambah",
 *      operationId="postReMk",
 *      tags={"Mata Kuliah"},
 *      summary="Tambah Rencana Evaluasi Matkul",
 *      description="Menyimpan data Rencana Evaluasi Matkul",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Simpan data Rencana Evaluasi Matkul",
 *        @OA\JsonContent(
 *          required={"id_jns_eval","id_mk", "desk_indo"},
 *          @OA\Property(property="id_jns_eval", type="number", format="number", example="1"),
 *          @OA\Property(property="id_mk", type="string", format="text", example="0e6294a8-edc2-4297-8e8b-001363bcc401"),
 *          @OA\Property(property="no_urut", type="number", format="number", example="1"),
 *          @OA\Property(property="komponen_evaluasi", type="string", format="string", example="UAS"),
 *          @OA\Property(property="desk_indo", type="string", format="text", example="online test"),
 *          @OA\Property(property="desk_ing", type="string", format="text", example=""),
 *          @OA\Property(property="bobot_evaluasi", type="number", format="number", example="50"),
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
 *      path="/mata_kuliah/re_mk/ubah",
 *      operationId="putReMk",
 *      tags={"Mata Kuliah"},
 *      summary="Ubah Rencana Evaluasi Matkul",
 *      description="Mengubah data Rencana Evaluasi Matkul",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Ubah data rencana evaluasi matkul",
 *        @OA\JsonContent(
 *          required={"id_re_mk","id_jns_eval","id_mk", "desk_indo"},
 *          @OA\Property(property="id_re_mk", type="string", format="text", example="7F56B225-C83C-4C7E-81CC-B3EEF34B0B1A"),
 *          @OA\Property(property="id_jns_eval", type="number", format="number", example="1"),
 *          @OA\Property(property="id_mk", type="string", format="text", example="0e6294a8-edc2-4297-8e8b-001363bcc401"),
 *          @OA\Property(property="no_urut", type="number", format="number", example="1"),
 *          @OA\Property(property="komponen_evaluasi", type="string", format="string", example="UAS"),
 *          @OA\Property(property="desk_indo", type="string", format="text", example="online test"),
 *          @OA\Property(property="desk_ing", type="string", format="text", example=""),
 *          @OA\Property(property="bobot_evaluasi", type="number", format="number", example="50"),
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
 *      path="/mata_kuliah/re_mk/hapus",
 *      operationId="deleteReMk",
 *      tags={"Mata Kuliah"},
 *      summary="Hapus Rencana Evaluasi Matkul",
 *      description="Menghapus data Rencana Evaluasi Matkul",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Hapus data rencana evaluasi matkul",
 *        @OA\JsonContent(
 *          required={"id_re_mk"},
*          @OA\Property(property="id_re_mk", type="string", format="text", example="7F56B225-C83C-4C7E-81CC-B3EEF34B0B1A"),
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






