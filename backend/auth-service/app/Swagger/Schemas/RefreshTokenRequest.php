<?php

namespace App\Swagger\Schemas;

/**
 * @OA\Schema(
 *     schema="RefreshTokenRequest",
 *     type="object",
 *     required={"refresh_token"},
 *     @OA\Property(
 *         property="refresh_token",
 *         type="string",
 *         example="eyJ0eXAiOiJKV1QiLCJhbGc...",
 *         description="Valid refresh token"
 *     )
 * )
 */
class RefreshTokenRequest
{
}
