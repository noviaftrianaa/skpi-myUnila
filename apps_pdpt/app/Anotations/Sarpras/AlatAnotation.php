<?php

/**
 * @OA\Get(
 *     path="/sarpras/alat/daftar",
 *     tags={"Sarana dan Prasarana"},
 *     summary="Mendapatkan Daftar Sarpras Alat",
 *     description="Menampilkan Daftar Sarpras Alat",
 *     operationId="daftarSarprasAlat",
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
 *          name="item",
 *          description="",
 *          example="25",
 *          required=false,
 *          in="query",
 *          @OA\Schema(
 *              type="number"
 *          )
 *     ),
 *     @OA\Parameter(
 *          name="sortby",
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
 * )
 */
/**
 * @OA\Get(
 *     path="/sarpras/alat/detail",
 *     tags={"Sarana dan Prasarana"},
 *     summary="Mendapatkan Detail Sarpras Alat",
 *     description="Menampilkan Detail Sarpras Alat",
 *     operationId="detailSarprasAlat",
 *     @OA\Parameter(
 *          name="id_orang",
 *          description="",
 *          example="91BF4D2B-E204-44C3-BF6C-7060CBF808B8",
 *          required=true,
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
 * )
 */


/**
 * @OA\Post (
 *      path="/sarpras/alat/tambah",
 *      operationId="tambahSarprasAlat",
 *      tags={"Sarana dan Prasarana"},
 *      summary="Tambah Sarpras Alat",
 *      description="Menambah Sarpras Alat",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah Sarpras Alat",
 *      @OA\JsonContent(
 *          required={"id_negara","jln","rt","rw","nm_dsn","ds_kel","kode_pos","nm_orang","jk","nik","tmpt_lahir","tgl_lahir","no_tel_rmh","no_hp","email","npwp"},
 *          @OA\Property(property="id_negara", type="string", format="text", example="ID"),
 *          @OA\Property(property="jln", type="string", format="text", example="Nama Jalan"),
 *          @OA\Property(property="rt", type="number", format="number", example="1"),
 *          @OA\Property(property="rw", type="number", format="number", example="2"),
 *          @OA\Property(property="nm_dsn", type="string", format="text", example="Nama Dusun"),
 *          @OA\Property(property="ds_kel", type="string", format="text", example="Nama Kelurahan"),
 *          @OA\Property(property="kode_pos", type="number", format="number", example="31158"),
 *          @OA\Property(property="nm_orang", type="string", format="text", example="Nama Orang"),
 *          @OA\Property(property="jk", type="string", format="text", example="L"),
 *          @OA\Property(property="nik", type="string", format="text", example="1234567890"),
 *          @OA\Property(property="tmpt_lahir", type="string", format="text", example="Tempat Lahir"),
 *          @OA\Property(property="tgl_lahir", type="string", format="text", example="1998-01-25"),
 *          @OA\Property(property="no_tel_rmh", type="string", format="text", example="1234567890"),
 *          @OA\Property(property="no_hp", type="string", format="text", example="1234567890"),
 *          @OA\Property(property="email", type="string", format="text", example="nama@email.com"),
 *          @OA\Property(property="npwp", type="string", format="text", example="1234567890"),
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
 *      path="/sarpras/alat/ubah",
 *      operationId="ubahSarprasAlat",
 *      tags={"Sarana dan Prasarana"},
 *      summary="Ubah Sarpras Alat",
 *      description="Mengubah Sarpras Alat",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah Sarpras Alat",
 *      @OA\JsonContent(
 *          required={"id_orang","id_negara","jln","rt","rw","nm_dsn","ds_kel","kode_pos","nm_orang","jk","nik","tmpt_lahir","tgl_lahir","no_tel_rmh","no_hp","email","npwp"},
 *          @OA\Property(property="id_orang", type="string", format="text", example="27022d9d-bb97-4f1c-9e42-a6b8cf7be0da"),
 *          @OA\Property(property="id_negara", type="string", format="text", example="ID"),
 *          @OA\Property(property="jln", type="string", format="text", example="Ubah Nama Jalan"),
 *          @OA\Property(property="rt", type="number", format="number", example="91"),
 *          @OA\Property(property="rw", type="number", format="number", example="92"),
 *          @OA\Property(property="nm_dsn", type="string", format="text", example="Ubah Nama Dusun"),
 *          @OA\Property(property="ds_kel", type="string", format="text", example="Ubah Nama Kelurahan"),
 *          @OA\Property(property="kode_pos", type="number", format="number", example="931158"),
 *          @OA\Property(property="nm_orang", type="string", format="text", example="Ubah Nama Orang"),
 *          @OA\Property(property="jk", type="string", format="text", example="L"),
 *          @OA\Property(property="nik", type="string", format="text", example="91234567890"),
 *          @OA\Property(property="tmpt_lahir", type="string", format="text", example="Ubah Tempat Lahir"),
 *          @OA\Property(property="tgl_lahir", type="string", format="text", example="1999-01-25"),
 *          @OA\Property(property="no_tel_rmh", type="string", format="text", example="91234567890"),
 *          @OA\Property(property="no_hp", type="string", format="text", example="91234567890"),
 *          @OA\Property(property="email", type="string", format="text", example="ubahnama@email.com"),
 *          @OA\Property(property="npwp", type="string", format="text", example="91234567890"),
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
 *      path="/sarpras/alat/hapus",
 *      operationId="hapusSarprasAlat",
 *      tags={"Sarana dan Prasarana"},
 *      summary="Hapus Sarpras Alat",
 *      description="Menghapus Sarpras Alat",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menghapus Sarpras Alat",
 *      @OA\JsonContent(
 *          required={"id_orang"},
 *          @OA\Property(property="id_orang", type="string", format="text", example="ad656747-2860-4ba9-b712-e57f9dce02e5")
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
