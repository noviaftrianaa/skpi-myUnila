<?php
/**
 * @OA\Get(
 *     path="/keuangan/list_kelasukt",
 *     tags={"Keuangan"},
 *     summary="Mendapatkan Daftar Kelas UKT",
 *     description="Menampilkan Daftar Kelas UKT",
 *     operationId="getKelasUkt",
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
 * @OA\Post (
 *      path="/keuangan/add_kelasukt",
 *      operationId="addKelasUkt",
 *      tags={"Keuangan"},
 *      summary="Tambah Kelas UKT",
 *      description="Menambah Kelas UKT",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menambah Kelas UKT",
 *      @OA\JsonContent(
 *          required={"nm_kelas_ukt","nominal_ukt"},
 *          @OA\Property(property="nm_kelas_ukt", type="string", format="text", example="Nama Kelas UKT"),
 *          @OA\Property(property="nominal_ukt", type="number", format="number", example="5000000"),
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
 *      path="/keuangan/update_kelasukt",
 *      operationId="updateKelasUkt",
 *      tags={"Keuangan"},
 *      summary="Ubah Kelas UKT",
 *      description="Mengubah Kelas UKT",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Mengubah Kelas UKT",
 *      @OA\JsonContent(
 *          required={"id_kelas_ukt","nm_kelas_ukt","nominal_ukt"},
 *          @OA\Property(property="id_kelas_ukt", type="string", format="text", example="E71398A6-C126-4335-8512-1A84D35DF443"),
 *          @OA\Property(property="nm_kelas_ukt", type="string", format="text", example="Ubah Nama Kelas UKT"),
 *          @OA\Property(property="nominal_ukt", type="number", format="number", example="5000000"),
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
 *      path="/keuangan/delete_kelasukt",
 *      operationId="deleteNonCa",
 *      tags={"Keuangan"},
 *      summary="Hapus Kelas UKT",
 *      description="Menghapus Kelas UKT",
 *      @OA\RequestBody(
 *      required=true,
 *      description="Menghapus Kelas UKT",
 *      @OA\JsonContent(
 *          required={"id_kelas_ukt"},
 *          @OA\Property(property="id_kelas_ukt", type="string", format="text", example="E71398A6-C126-4335-8512-1A84D35DF443")
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
