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
 *          @OA\Property(property="app_key", type="string", format="text", example="base64:xgyD/eUvr5fhJskP1Z6ueW2Pt3tuR1/g5GtxV783vHC8M="),
 *          @OA\Property(property="username", type="string", format="email", example="rio.ananda@staff.unila.ac.id"),
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
