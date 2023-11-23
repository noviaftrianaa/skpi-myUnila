<?php

/**
 * @OA\Post(
 *  path="/auth/login",
 *  summary="Mendapatkan token untuk otorisasi",
 *  description="Dapatkan token otorisasi",
 *  operationId="authLogin",
 *  tags={"Akses"},
 *  @OA\RequestBody(
 *      required=true,
 *      description="Pass user credentials",
 *      @OA\JsonContent(
 *          required={"email","password"},
 *          @OA\Property(property="id_aplikasi", type="uuid", format="text", example="948df317-78f7-4b92-a53f-0a56215e07de"),
 *          @OA\Property(property="username", type="string", format="email", example="mizar.zulmi"),
 *          @OA\Property(property="password", type="string", format="password", example="12345678"),
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
 * path="/auth/cek_token",
 * summary="Mengecek Keaktifan Token",
 * description="Cek token kadarluasa",
 * operationId="authToken",
 * tags={"Akses"},
 * @OA\RequestBody(
 *    required=true,
 *    description="Masukan token",
 *    @OA\JsonContent(
 *       required={"token"},
 *       @OA\Property(property="token", type="string", format="string", example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJCMTM5QzA5RS01QzkzLTQyRjEtOTYzOS01MTFDMTY0RDg3REUiLCJyb2xlIjoiRGV2ZWxvcGVyIiwiaXNzIjoiaHR0cHM6XC9cL3BkdXQtdW5pbGEudGVzdFwvYXBpXC9zYW5kYm94XC8wLjFcL2F1dGhcL2xvZ2luIiwiaWF0IjoxNjUyODA5NzYzLCJleHAiOjE2NTI4MTMzNjN9.rgXdi2vbImG8toSQfW_x1f3jmrd-hj2PIXEXjLJC-wE")
 *    ),
 * ),
 * @OA\Response(
 *    response=200,
 *    description="successful operation",
 * ),
 * @OA\Response(
 *    response=404,
 *    description="page not found",
 *    @OA\JsonContent(
 *       @OA\Property(property="message", type="string", example="Maaf, halaman tidak ditemukan")
 *        )
 *     )
 * )
 *
 **/
