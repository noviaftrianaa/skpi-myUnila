<?php
/**
 * @OA\Post (
 *      path="/nonca/add",
 *      operationId="addNonCa",
 *      tags={"Non Citivitas Akademik"},
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
