<?php

/**
 * @OA\Get(
 *     path="/sdm/dosen/daftar",
 *     tags={"Sumber Daya Manusia"},
 *     summary="Mendapatkan Daftar Dosen",
 *     description="Menampilkan Daftar Dosen",
 *     operationId="daftarDosen",
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
 *          name="count",
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
 *     path="/sdm/dosen/daftar_id",
 *     tags={"Sumber Daya Manusia"},
 *     summary="Mendapatkan Daftar Dosen Dengan Id Prodi",
 *     description="Menampilkan Daftar Dosen Dengan Id Prodi",
 *     operationId="daftar_idDosen",
  *     @OA\Parameter(
 *          name="id_prodi",
 *          description="",
 *          example="34bb110b-3d47-4170-bbe0-f4a1527b33cc",
 *          required=true,
 *          in="query",
 *          @OA\Schema(
 *              type="string"
 *          )
 *     ),
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
 *          name="count",
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
 *     path="/sdm/dosen/detail",
 *     tags={"Sumber Daya Manusia"},
 *     summary="Mendapatkan Detail Dosen",
 *     description="Menampilkan Detail Dosen",
 *     operationId="detailDosen",
 *     @OA\Parameter(
 *          name="id_sdm",
 *          description="",
 *          example="1816b0ce-8c9f-4df9-91aa-002a69f6bed0",
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
 * @OA\Get(
 *     path="/sdm/tendik/daftar",
 *     tags={"Sumber Daya Manusia"},
 *     summary="Mendapatkan Daftar Tendik",
 *     description="Menampilkan Daftar Tendik",
 *     operationId="daftarTendik",
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
 *          name="count",
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
 *     path="/sdm/tendik/daftar_id",
 *     tags={"Sumber Daya Manusia"},
 *     summary="Mendapatkan Daftar Tendik Dengan Id Prodi",
 *     description="Menampilkan Daftar Tendik Dengan Id Prodi",
 *     operationId="daftar_idTendik",
  *     @OA\Parameter(
 *          name="id_prodi",
 *          description="",
 *          example="34bb110b-3d47-4170-bbe0-f4a1527b33cc",
 *          required=true,
 *          in="query",
 *          @OA\Schema(
 *              type="string"
 *          )
 *     ),
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
 *          name="count",
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
 *     path="/sdm/tendik/detail",
 *     tags={"Sumber Daya Manusia"},
 *     summary="Mendapatkan Detail Tendik",
 *     description="Menampilkan Detail Tendik",
 *     operationId="detailTendik",
 *     @OA\Parameter(
 *          name="id_sdm",
 *          description="",
 *          example="219EE6A1-CE97-4151-932B-2C924F8F6FB2",
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
 * @OA\Get(
 *     path="/sdm/nonca/daftar",
 *     tags={"Sumber Daya Manusia"},
 *     summary="Mendapatkan Daftar Non Citivitas Akademik",
 *     description="Menampilkan Daftar Non Citivitas Akademik",
 *     operationId="daftarNonCa",
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
 *          name="count",
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
 *     path="/sdm/nonca/detail",
 *     tags={"Sumber Daya Manusia"},
 *     summary="Mendapatkan Detail Non Citivitas Akademik",
 *     description="Menampilkan Detail Non Citivitas Akademik",
 *     operationId="detailNonCa",
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
 *      path="/sdm/nonca/tambah",
 *      operationId="tambahNonCa",
 *      tags={"Sumber Daya Manusia"},
 *      summary="Tambah Non Citivitas Akademik",
 *      description="Menambah Non Citivitas Akademik",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah Non Citivitas Akademik",
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
 *      path="/sdm/nonca/ubah",
 *      operationId="ubahNonCa",
 *      tags={"Sumber Daya Manusia"},
 *      summary="Ubah Non Citivitas Akademik",
 *      description="Mengubah Non Citivitas Akademik",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah Non Citivitas Akademik",
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
 *      path="/sdm/nonca/hapus",
 *      operationId="hapusNonCa",
 *      tags={"Sumber Daya Manusia"},
 *      summary="Hapus Non Citivitas Akademik",
 *      description="Menghapus Non Citivitas Akademik",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menghapus Non Citivitas Akademik",
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
