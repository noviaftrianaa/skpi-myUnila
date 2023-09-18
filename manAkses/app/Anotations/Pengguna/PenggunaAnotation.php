<?php

/**
 * @OA\Get(
 *       path="/pengguna/list",
 *       tags={"Pengguna"},
 *       summary="Dapatkan daftar Pengguna",
 *       description="Menampilkan daftar data Pengguna",
 *       operationId="getPengguna",
 *       @OA\Parameter(
 *          name="page",
 *          description="",
 *          example="1",
 *          required=false,
 *          in="query",
 *          @OA\Schema(
 *              type="number"
 *          )
 *      ),
 *      @OA\Parameter(
 *          name="limit",
 *          description="",
 *          example="50",
 *          required=false,
 *          in="query",
 *          @OA\Schema(
 *              type="number"
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
 * @OA\Post(
 *  path="/pengguna/tambah",
 *  summary="Menambah data Pengguna",
 *  description="",
 *  operationId="postTambahPengguna",
 *  tags={"Pengguna"},
 *  @OA\RequestBody(
 *      required=true,
 *      description="Pass user credentials",
 *      @OA\JsonContent(
 *          required={"username","password","jenis_kelamin"},
 *          @OA\Property(property="username", type="string", format="text", example="agus.aja"),
 *          @OA\Property(property="password", type="string", format="password", example="12345678"),
 *          @OA\Property(property="email", type="string", format="text", example="agus.aja@gmail.com"),
 *          @OA\Property(property="tempat_lahir", type="string", format="text", example="Lampung"),
 *          @OA\Property(property="tgl_lahir", type="string", format="text", example="2022-02-02"),
 *          @OA\Property(property="jenis_kelamin", type="string", format="text", example="L"),
 *          @OA\Property(property="alamat", type="string", format="text", example="Bandar Lampung"),
 *          @OA\Property(property="no_telp", type="string", format="text", example="0721 123456"),
 *          @OA\Property(property="no_hp", type="string", format="text", example="0812 1234 1234"),
 *          @OA\Property(property="id_sdm_pengguna", type="string", format="text", example="94637666-e2bc-4c37-aac0-0000c2aef0ad"),
 *          @OA\Property(property="id_pd_pengguna", type="string", format="text", example="94637666-e2bc-4c37-aac0-0000c2aef0ad"),
 *          @OA\Property(property="id_calon_pd_pengguna", type="string", format="text", example="94637666-e2bc-4c37-aac0-0000c2aef0ad"),
 *          @OA\Property(property="token_reg", type="string", format="text", example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiI5NDhERjMxNy03OEY3LTRCOTItQTUzRi0wQTU2MjE1RTA3REUiLCJzdWIiOiI3Qzk5OTg1My0xMDAyLTQzNjMtQjJGRC1DOEIzN0YzRUIyM0UiLCJyb2xlIjoiMTA3IiwiaXNzIjoiaHR0cDpcL1wvb25lZGF0YS51bmlsYS5hYy5pZFwvYXBpXC9saXZlXC8wLjFcL2F1dGhcL2xvZ2luIiwiaWF0IjoxNjYzNTY5NzE4LCJleHAiOjE2NjM1NzMzMTh9.JT8elSJdem7SJMvSUU5yU4Wyg4P4LRhmjHSnDiSm6Zw"),
 *          @OA\Property(property="jabatan", type="string", format="text", example="Developer"),
 *          @OA\Property(property="provider", type="string", format="text", example="-"),
 *          @OA\Property(property="id_updater", type="string", format="text", example="94637666-e2bc-4c37-aac0-0000c2aef0ad"),
 *      ),
 *  ),
 *  @OA\Response(
 *      response=200,
 *      description="successful operation",
 *  ),
 *  @OA\Response(
 *      response=404,
 *      description="page not found",
 *      @OA\JsonContent(
 *          @OA\Property(property="message", type="string", example="Maaf, halaman tidak ditemukan")
 *      )
 *  ),
 *  security={{"token":{}}}
 * )
 **/


/**
 * @OA\Put(
 *  path="/pengguna/ubah_password",
 *  summary="Ubah Password Pengguna",
 *  description="",
 *  operationId="postUbahPasswordPengguna",
 *  tags={"Pengguna"},
 *  @OA\RequestBody(
 *      required=true,
 *      description="Pass user credentials",
 *      @OA\JsonContent(
 *          required={"username","password"},
 *          @OA\Property(property="username", type="string", format="text", example="username sso yang ingin diganti"),
 *          @OA\Property(property="password", type="string", format="password", example="password baru"),
 *      ),
 *  ),
 *  @OA\Response(
 *      response=200,
 *      description="successful operation",
 *  ),
 *  @OA\Response(
 *      response=404,
 *      description="page not found",
 *      @OA\JsonContent(
 *          @OA\Property(property="message", type="string", example="Maaf, halaman tidak ditemukan")
 *      )
 *  ),
 *  security={{"token":{}}}
 * )
 **/
