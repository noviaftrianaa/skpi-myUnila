<?php

namespace App\Http\Controllers\OpenApi\Schemas;

/**
 * @OA\Schema(
 *     schema="ErrorResponse",
 *     title="Error Response",
 *     description="Standard error response format",
 *     @OA\Property(
 *         property="success",
 *         type="boolean",
 *         example=false,
 *         description="Always false for error responses"
 *     ),
 *     @OA\Property(
 *         property="message",
 *         type="string",
 *         example="An error occurred",
 *         description="Error message"
 *     ),
 *     @OA\Property(
 *         property="error",
 *         type="string",
 *         example="Detailed error information",
 *         description="Detailed error message (only in debug mode)"
 *     ),
 *     required={"success", "message"}
 * )
 */
class ErrorResponse
{
    // This class only contains OpenAPI schema definition
}
