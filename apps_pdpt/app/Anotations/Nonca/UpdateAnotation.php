<?php
/**
 * @OA\Put (
 *      path="/nonca/update",
 *      operationId="updateNonCa",
 *      tags={"Non Citivitas Akademik"},
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
