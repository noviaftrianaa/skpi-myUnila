<?php

/**
 * @OA\Get(
 *      path="/pmb/list_periode",
 *      operationId="getListPeriodePmb",
 *      tags={"PMB"},
 *      summary="Dapatkan daftar Periode PMB",
 *      description="Menampilkan daftar data Periode PMB",
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
 *          name="sort",
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
 */

/**
 * @OA\Post (
 *      path="/pmb/tambah_periode",
 *      operationId="postTambahPeriodePMB",
 *      tags={"PMB"},
 *      summary="Tambah data Periode PMB",
 *      description="Menambah data Periode PMB",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah data Periode PMB",
 *      @OA\JsonContent(
 *          required={"id_pembiayaan","id_jenj_didik","id_jns_daftar","id_thn_ajaran","id_jalur_daftar","nm_periode_pmb","gelombang","smt","a_internal","jml_jam","no_sert","tgl_sert","tempat","tgl_mulai","tgl_selesai","sk_tugas","tgl_sk_tugas"},
 *          @OA\Property(property="id_pembiayaan", type="string", format="text", example="1"),
 *          @OA\Property(property="id_jenj_didik", type="string", format="text", example="23"),
 *          @OA\Property(property="id_jns_daftar", type="string", format="text", example="1"),
 *          @OA\Property(property="id_thn_ajaran", type="string", format="text", example="2001"),
 *          @OA\Property(property="id_jalur_daftar", type="string", format="text", example="1"),
 *          @OA\Property(property="nm_periode_pmb", type="string", format="text", example="Nama periode PMB"),
 *          @OA\Property(property="gelombang", type="string", format="text", example="Gelombang Ke-"),
 *          @OA\Property(property="smt", type="string", format="text", example="Semester Ke-"),
 *          @OA\Property(property="a_internal", type="string", format="text", example=NULL),
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
 *      path="/pmb/ubah_periode",
 *      operationId="ubahPeriodePMB",
 *      tags={"PMB"},
 *      summary="Mengubah daftar Periode PMB",
 *      description="Mengubah daftar Periode PMB",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah daftar Periode PMB",
 *      @OA\JsonContent(
 *          required={"id_periode_pmb","id_pembiayaan","id_jenj_didik","id_jns_daftar","id_thn_ajaran","id_jalur_daftar","nm_periode_pmb","gelombang","smt","a_internal","jml_jam","no_sert","tgl_sert","tempat","tgl_mulai","tgl_selesai","sk_tugas","tgl_sk_tugas"},
 *          @OA\Property(property="id_periode_pmb", type="string", format="text", example="masukan id_periode_pmb disini"),
 *          @OA\Property(property="id_pembiayaan", type="string", format="text", example="1"),
 *          @OA\Property(property="id_jenj_didik", type="string", format="text", example="23"),
 *          @OA\Property(property="id_jns_daftar", type="string", format="text", example="1"),
 *          @OA\Property(property="id_thn_ajaran", type="string", format="text", example="2001"),
 *          @OA\Property(property="id_jalur_daftar", type="string", format="text", example="1"),
 *          @OA\Property(property="nm_periode_pmb", type="string", format="text", example="Nama periode PMB"),
 *          @OA\Property(property="gelombang", type="string", format="text", example="Gelombang Ke-"),
 *          @OA\Property(property="smt", type="string", format="text", example="Semester Ke-"),
 *          @OA\Property(property="a_internal", type="string", format="text", example=NULL),
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
 *      path="/pmb/hapus_periode",
 *      operationId="hapusPeriodePMB",
 *      tags={"PMB"},
 *      summary="Menghapus daftar Periode PMB",
 *      description="Menghapus daftar Periode PMB",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menghapus data Periode PMB berdasarkan id_periode_pmb",
 *      @OA\JsonContent(
 *          required={"id_periode_pmb"},
 *          @OA\Property(property="id_periode_pmb", type="string", format="text", example="masukan id_periode_pmb disini")
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


























































