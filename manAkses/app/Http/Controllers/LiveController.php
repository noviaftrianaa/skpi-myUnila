<?php

namespace App\Http\Controllers;

class LiveController
{
    /**
     * @OA\Info(
     *      version="1.0",
     *      title="Manajemen Akses Unila - Live Web Service",
     *      description="Version 1.0",
     *      @OA\Contact(
     *          email=""
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
