<?php

namespace App\Http\Controllers\PDUT\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    /**
     * @OA\Post(
     * path="/login/do_login",
     * summary="AKSES",
     * description="Mendapatkan token untuk otorisasi",
     * operationId="authLogin",
     * tags={"Auth"},
     * @OA\RequestBody(
     *    required=true,
     *    description="Pass user credentials",
     *    @OA\JsonContent(
     *       required={"email","password"},
     *       @OA\Property(property="username", type="string", format="email", example="user1@mail.com"),
     *       @OA\Property(property="password", type="string", format="password", example="PassWord12345"),
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
}
