<?php

namespace App\Http\Controllers\PDUT\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    /**
     * @OA\Post(
     * path="/login/do_login",
     * summary="Authentication",
     * description="Mendapatkan token untuk otorisasi",
     * operationId="authLogin",
     * tags={"Auth"},
     * @OA\RequestBody(
     *    required=true,
     *    description="Pass user credentials",
     *    @OA\JsonContent(
     *       required={"email","password"},
     *       @OA\Property(property="id_aplikasi", type="uuid", format="text", example="948DF317-78F7-4B92-A53F-0A56215E07DE"),
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
    public function do_login(Request $request)
    {
        $input = $request->all();

    }
}
