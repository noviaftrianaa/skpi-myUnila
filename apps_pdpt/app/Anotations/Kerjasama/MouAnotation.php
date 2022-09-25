<?php

/**
 * @OA\Get(
 *      path="/kerjasama/list_mou",
 *      operationId="getListMou",
 *      tags={"Kerjasama"},
 *      summary="Dapatkan daftar Mou Kerjasama",
 *      description="Menampilkan daftar data Mou Kerjasama",
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
 *          name="sort_by",
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
 *      security={{"token":{}}}
 *     )
 */

/**
 * @OA\Post (
 *      path="/kerjasama/tambah_mou",
 *      operationId="postTambahMou",
 *      tags={"Kerjasama"},
 *      summary="Tambah data Mou Kerjasama",
 *      description="Menambah data Mou Kerjasama",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah data Mou Kerjasama",
 *      @OA\JsonContent(
 *          required={"sk_mou","judul_mou","tgl_mulai","tgl_selesai","nm_dudi","nm_bu","id_dudi"},
 *          @OA\Property(property="sk_mou", type="string", format="text", example="Masukkan Nomor SK Mou"),
 *          @OA\Property(property="judul_mou", type="string", format="text", example="Masukkan Judul Mou"),
 *          @OA\Property(property="uraian_mou", type="string", format="text", example="Masukkan Uraian Mou"),
 *          @OA\Property(property="tgl_mulai",  type="date", format="date", example="2022-09-21"),
 *          @OA\Property(property="tgl_selesai", type="date", format="date", example="2027-09-21"),
 *          @OA\Property(property="nm_dudi", type="string", format="text", example="Masukkan Nama Dunia Industri"),
 *          @OA\Property(property="npwp_dudi",type="number", format="number", example="1"),
 *          @OA\Property(property="nm_bu", type="string", format="text", example="Masukkan Nama Bidang Usaha"),
 *          @OA\Property(property="tel_kantor", type="string", format="text", example="Masukkan Telfon Kantor"),
 *          @OA\Property(property="fax",type="string", format="text", example="Masukkan Fax"),
 *          @OA\Property(property="cp", type="string", format="text", example="Masukkan CP"),
 *          @OA\Property(property="tel_cp", type="string", format="text", example="Masukkan Tel CP"),
 *          @OA\Property(property="jab_cp", type="string", format="text", example="Masukkan Jab CP"),
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
    *      path="/kerjasama/ubah_mou",
    *      operationId="ubahMou",
    *      tags={"Kerjasama"},
    *      summary="Mengubah daftar Mou Kerjasama",
    *      description="Mengubah daftar Mou Kerjasama",
    *      @OA\RequestBody(
    *      required=true,
    *      description="Mengubah daftar Mou kerjsama ",
    *      @OA\JsonContent(
    *          required={"id_mou","sk_mou","judul_mou","tgl_mulai","tgl_selesai","nm_dudi","nm_bu","id_dudi"},
    *          @OA\Property(property="id_mou", type="string", format="text", example="Masukkan ID Mou"),
    *          @OA\Property(property="sk_mou", type="string", format="text", example="Masukkan Nomor SK Mou"),
    *          @OA\Property(property="judul_mou", type="string", format="text", example="Masukkan Judul Mou"),
    *          @OA\Property(property="uraian_mou", type="string", format="text", example="Masukkan Uraian Mou"),
    *          @OA\Property(property="tgl_mulai",  type="date", format="date", example="2022-09-21"),
    *          @OA\Property(property="tgl_selesai", type="date", format="date", example="2027-09-21"),
    *          @OA\Property(property="nm_dudi", type="string", format="text", example="Masukkan Nama Dunia Industri"),
    *          @OA\Property(property="npwp_dudi",type="number", format="number", example="1"),
    *          @OA\Property(property="nm_bu", type="string", format="text", example="Masukkan Nama Bidang Usaha"),
    *          @OA\Property(property="tel_kantor", type="string", format="text", example="Masukkan Telfon Kantor"),
    *          @OA\Property(property="fax",type="string", format="text", example="Masukkan Fax"),
    *          @OA\Property(property="cp", type="string", format="text", example="Masukkan CP"),
    *          @OA\Property(property="tel_cp", type="string", format="text", example="Masukkan Tel CP"),
    *          @OA\Property(property="jab_cp", type="string", format="text", example="Masukkan Jab CP"),
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
    *      path="/kerjasama/hapus_mou",
    *      operationId="hapusMou",
    *      tags={"Kerjasama"},
    *      summary="Menghapus daftar Mou Kerjasama",
    *      description="Menghapus daftar Mou Kerjasama",
    *      @OA\RequestBody(
    *      required=true,
    *      description="Menghapus data Mou Kerjasama berdasarkan id_mou",
    *      @OA\JsonContent(
    *          required={"id_mou"},
    *          @OA\Property(property="id_mou", type="string", format="text", example="masukan id_mou disini")
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