<?php

/**
 * @OA\Get(
 *     path="/publikasi/daftar",
 *     tags={"Publikasi"},
 *     summary="Mendapatkan Daftar Publikasi",
 *     description="Menampilkan Daftar Publikasi",
 *     operationId="daftarPublikasi",
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
 *          example="10",
 *          required=false,
 *          in="query",
 *          @OA\Schema(
 *              type="number"
 *          )
 *     ),
 *     @OA\Parameter(
 *          name="sort_by",
 *          description="",
 *          example="DESC",
 *          required=false,
 *          in="query",
 *          @OA\Schema(
 *              type="string"
 *          )
 *     ),
 *     @OA\Parameter(
 *          name="type",
 *          description="",
 *          example="120101",
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
 *      security={{"token":{}}}
 *     )
 * )
 */

 /**
 * @OA\Get(
 *      path="/publikasi/daftar_id",
 *      tags={"Publikasi"},
 *      summary="Mendapatkan Daftar Publikasi Berdasarkan ID SDM",
 *      description="Menampilkan Daftar Publikasi Berdasarkan ID SDM",
 *      operationId="daftar_idPublikasi",
 *      @OA\Parameter(
 *           name="page",
 *           description="",
 *           example="1",
 *           required=false,
 *           in="query",
 *           @OA\Schema(
 *               type="number"
 *           )
 *      ),
 *      @OA\Parameter(
 *           name="limit",
 *           description="",
 *           example="10",
 *           required=false,
 *           in="query",
 *           @OA\Schema(
 *               type="number"
 *           )
 *      ),
 *      @OA\Parameter(
 *           name="sort_by",
 *           description="",
 *           example="DESC",
 *           required=false,
 *           in="query",
 *           @OA\Schema(
 *               type="string"
 *           )
 *      ),
 *      @OA\Parameter(
 *           name="id_sdm",
 *           description="",
 *           example="bcb6de9a-2e7c-43c7-b192-029750754fe7",
 *           required=false,
 *           in="query",
 *           @OA\Schema(
 *               type="string"
 *           )
 *      ),
 *       @OA\Response(
 *           response=200,
 *           description="Successful operation",
 *        ),
 *       @OA\Response(
 *           response=401,
 *           description="Unauthenticated",
 *       ),
 *       @OA\Response(
 *           response=403,
 *           description="Forbidden"
 *       ),
 *       security={{"token":{}}}
 *      )
 * )
 */

 /**
 * @OA\Get(
 *      path="/publikasi/detail",
 *      tags={"Publikasi"},
 *      summary="Mendapatkan Detail Publikasi Berdasarkan ID Publikasi",
 *      description="Menampilkan Detail Publikasi Berdasarkan ID Publikasi",
 *      operationId="detailPublikasi",
 *      @OA\Parameter(
 *           name="id_publikasi",
 *           description="",
 *           example="80B78EED-7C41-4DE9-93B7-E675369501AD",
 *           required=false,
 *           in="query",
 *           @OA\Schema(
 *               type="string"
 *           )
 *      ),
 *       @OA\Response(
 *           response=200,
 *           description="Successful operation",
 *        ),
 *       @OA\Response(
 *           response=401,
 *           description="Unauthenticated",
 *       ),
 *       @OA\Response(
 *           response=403,
 *           description="Forbidden"
 *       ),
 *       security={{"token":{}}}
 *      )
 * )
 */

 /**
 * @OA\Post(
 *      path="/publikasi/tambah",
 *      tags={"Publikasi"},
 *      summary="Menambahkan Publikasi",
 *      description="Menambahkan Publikasi",
 *      operationId="tambahPublikasi",
 *      @OA\Parameter(
 *           name="id_publikasi",
 *           description="",
 *           example="80B78EED-7C41-4DE9-93B7-E675369501AD",
 *           required=false,
 *           in="query",
 *           @OA\Schema(
 *               type="string"
 *           )
 *      ),
 *       @OA\Response(
 *           response=200,
 *           description="Successful operation",
 *        ),
 *       @OA\Response(
 *           response=401,
 *           description="Unauthenticated",
 *       ),
 *       @OA\Response(
 *           response=403,
 *           description="Forbidden"
 *       ),
 *       security={{"token":{}}}
 *      )
 * )
 */

  /**
 * @OA\Put(
 *      path="/publikasi/ubah",
 *      tags={"Publikasi"},
 *      summary="Ubah Data Publikasi",
 *      description="Ubah Data Publikasi",
 *      operationId="ubahPublikasi",
 *      @OA\Parameter(
 *           name="id_publikasi",
 *           description="",
 *           example="80B78EED-7C41-4DE9-93B7-E675369501AD",
 *           required=false,
 *           in="query",
 *           @OA\Schema(
 *               type="string"
 *           )
 *      ),
 *       @OA\Response(
 *           response=200,
 *           description="Successful operation",
 *        ),
 *       @OA\Response(
 *           response=401,
 *           description="Unauthenticated",
 *       ),
 *       @OA\Response(
 *           response=403,
 *           description="Forbidden"
 *       ),
 *       security={{"token":{}}}
 *      )
 * )
 */

  /**
 * @OA\Delete(
 *      path="/publikasi/hapus",
 *      tags={"Publikasi"},
 *      summary="Hapus Publikasi",
 *      description="Menghapus Publikasi",
 *      operationId="hapusPublikasi",
 *      @OA\Parameter(
 *           name="id_publikasi",
 *           description="",
 *           example="80B78EED-7C41-4DE9-93B7-E675369501AD",
 *           required=false,
 *           in="query",
 *           @OA\Schema(
 *               type="string"
 *           )
 *      ),
 *       @OA\Response(
 *           response=200,
 *           description="Successful operation",
 *        ),
 *       @OA\Response(
 *           response=401,
 *           description="Unauthenticated",
 *       ),
 *       @OA\Response(
 *           response=403,
 *           description="Forbidden"
 *       ),
 *       security={{"token":{}}}
 *      )
 * )
 */
