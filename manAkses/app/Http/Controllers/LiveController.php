<?php

namespace App\Http\Controllers;

class LiveController
{
    /**
     * @OA\Info(
     *      version="1.0",
     *      title="MANAJEMEN AKSES UNILA - Live Web Service",
     *      description="Versi 1.0.0",
     *      @OA\Contact(
     *          email="muhammadikhsan208@gmail.com"
     *      )
     * )
     *
     * @OA\Server(
     *      url=L5_SWAGGER_CONST_HOST_LIVE,
     *      description="Server Live",
     * ),
     *  @OA\PathItem(
     *      path="/"
     *  )

     *
     * @OA\SecurityScheme(
     *     type="apiKey",
     *     description="Manajemen Akses WebService Auth",
     *     in="header",
     *     securityScheme="token",
     *     name="Authorization"
     * )
     */
}
