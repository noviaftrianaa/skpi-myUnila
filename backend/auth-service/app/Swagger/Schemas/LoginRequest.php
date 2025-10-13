<?php

namespace App\Swagger\Schemas;

/**
 * @OA\Schema(
 *     schema="LoginRequest",
 *     type="object",
 *     required={"username", "password"},
 *     @OA\Property(
 *         property="username",
 *         type="string",
 *         example="DWI.RETNO21",
 *         description="User's username or email"
 *     ),
 *     @OA\Property(
 *         property="password",
 *         type="string",
 *         format="password",
 *         example="test123",
 *         description="User's password"
 *     )
 * )
 */
class LoginRequest
{
}
