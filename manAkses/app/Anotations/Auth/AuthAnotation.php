<?php

/**
 * @OA\Post(
 *  path="/auth/login",
 *  summary="Mendapatkan token untuk otorisasi",
 *  description="Dapatkan token otorisasi",
 *  operationId="authLogin",
 *  tags={"Login"},
 *  @OA\RequestBody(
 *      required=true,
 *      description="<strong>APP_KEY</strong> didapat dari Laman Manajemen Akses https://akses.unila.ac.id<br><strong>Username</strong> dan <strong>Password</strong> adalah akun SSO",
 *      @OA\JsonContent(
 *          required={"app_key","username"},
 *          @OA\Property(property="app_key", type="string", format="text", example="base64:xgyD/eUvr5fhJskP1Z6ueW2Pt3tuR1/g5GtxV783vHC8M="),
 *          @OA\Property(property="username", type="string", format="email", example="m.ikhsan@staff.unila.ac.id"),
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
 *  )
 * )
 **/
