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
 *      description="<strong>APP_KEY</strong> didapat dari Laman Manajemen Akses https://akses.unila.ac.id<i>ex: base64:xxxxxxxxxxxxxxxx</i><br><strong>Username</strong> adalah username akun SSO",
 *      @OA\JsonContent(
 *          required={"app_key","username"},
 *          @OA\Property(property="app_key", type="string", format="text", example="Masukkan APP_KEY aplikasi anda"),
 *          @OA\Property(property="username", type="string", format="text", example="Masukkan username anda"),
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

/**
 * @OA\Post(
 *  path="/auth/cek_token",
 *  summary="Mengecek Keaktifan Token",
 *  description="Cek token kadaluarsa",
 *  operationId="authCekToken",
 *  tags={"Login"},
 *  @OA\RequestBody(
 *      required=true,
 *      description="<strong>TOKEN</strong> didapat dari Login API atau Login API SSO",
 *      @OA\JsonContent(
 *          required={"token"},
 *          @OA\Property(property="token", type="string", format="text", example="Masukkan token disini"),
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
