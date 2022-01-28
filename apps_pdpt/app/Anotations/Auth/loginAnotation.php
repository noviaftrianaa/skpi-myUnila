<?php

/**
 * @OA\Post(
 * path="/auth/login",
 * summary="Authentication",
 * description="Mendapatkan token untuk otorisasi",
 * operationId="authLogin",
 * tags={"Auth"},
 * @OA\RequestBody(
 * required=true,
 * description="Pass user credentials",
 * @OA\JsonContent(
 * required={"email","password"},
 * @OA\Property(property="id_aplikasi", type="uuid", format="text", example="948df317-78f7-4b92-a53f-0a56215e07de"),
 * @OA\Property(property="username", type="string", format="email", example="rio.ananda@staff.unila.ac.id"),
 * @OA\Property(property="password", type="string", format="password", example="12345678"),
 * ),
 * ),
 * @OA\Response(
 * response=200,
 * description="successful operation",
 * ),
 * @OA\Response(
 * response=404,
 * description="page not found",
 * @OA\JsonContent(
 * @OA\Property(property="message", type="string", example="Maaf, halaman tidak ditemukan")
 * )
 * )
 * )
 *
 **/
