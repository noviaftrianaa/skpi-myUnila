<?php

namespace App\Swagger\Schemas;

/**
 * @OA\Schema(
 *     schema="LoginResponse",
 *     type="object",
 *     @OA\Property(
 *         property="success",
 *         type="boolean",
 *         example=true
 *     ),
 *     @OA\Property(
 *         property="message",
 *         type="string",
 *         example="Login successful"
 *     ),
 *     @OA\Property(
 *         property="data",
 *         type="object",
 *         @OA\Property(property="access_token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGc..."),
 *         @OA\Property(property="refresh_token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGc..."),
 *         @OA\Property(property="token_type", type="string", example="Bearer"),
 *         @OA\Property(property="expires_in", type="integer", example=900),
 *         @OA\Property(
 *             property="user",
 *             type="object",
 *             @OA\Property(property="id", type="string", example="8A9B55FC-E142-4DCE-A736-0000356DE151"),
 *             @OA\Property(property="username", type="string", example="DWI.RETNO21"),
 *             @OA\Property(property="email", type="string", example="DWI.RETNO21@students.unila.ac.id"),
 *             @OA\Property(property="name", type="string", example="DWI RETNO SEPTIANA"),
 *             @OA\Property(property="role", type="string", example="user")
 *         )
 *     )
 * )
 */
class LoginResponse
{
}
