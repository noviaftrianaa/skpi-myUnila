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

/**
 * @OA\Post(
 * path="/auth/token",
 * summary="Mengecek Waktu Kadarluasa Token",
 * description="Cek token kadarluasa",
 * operationId="authToken",
 * tags={"Akses"},
 * @OA\RequestBody(
 *    required=true,
 *    description="Masukan token",
 *    @OA\JsonContent(
 *       required={"token"},
 *       @OA\Property(property="token", type="string", format="string", example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJCMTM5QzA5RS01QzkzLTQyRjEtOTYzOS01MTFDMTY0RDg3REUiLCJpc3MiOiJodHRwOlwvXC9wZHV0LXVuaWxhLnRlc3RcL2FwaVwvMC4xXC9hdXRoXC9sb2dpbiIsImlhdCI6MTY0MjcwODc5MSwiZXhwIjoxNjQyNzEyMzkxLCJuYmYiOjE2NDI3MDg3OTEsImp0aSI6ImQ4OWEwYjYzYjExZTI4YjkifQ.HLk1XnC95YAAvzM28BbRbrSVmbFtzvIla0hjSuT1FE0")
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
