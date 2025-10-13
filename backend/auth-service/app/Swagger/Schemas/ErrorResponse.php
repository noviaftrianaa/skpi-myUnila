<?php

namespace App\Swagger\Schemas;

/**
 * @OA\Schema(
 *     schema="ErrorResponse",
 *     type="object",
 *     @OA\Property(
 *         property="success",
 *         type="boolean",
 *         example=false
 *     ),
 *     @OA\Property(
 *         property="message",
 *         type="string",
 *         example="Error message"
 *     ),
 *     @OA\Property(
 *         property="errors",
 *         type="object",
 *         example={"field": {"validation error message"}}
 *     )
 * )
 */
class ErrorResponse
{
}
