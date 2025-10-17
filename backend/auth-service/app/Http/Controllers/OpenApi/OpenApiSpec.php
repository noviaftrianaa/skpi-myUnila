<?php

namespace App\Http\Controllers\OpenApi;

/**
 * @OA\Info(
 *     title="My Unila Auth Service API",
 *     version="1.0.0",
 *     description="Authentication & Authorization Service for My Unila Platform",
 *     @OA\Contact(
 *         email="support@unila.ac.id",
 *         name="My Unila Support"
 *     )
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8081",
 *     description="Development Server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Enter JWT Bearer token"
 * )
 *
 * @OA\Tag(
 *     name="Authentication",
 *     description="Authentication endpoints (Login, Logout, etc)"
 * )
 *
 * @OA\Tag(
 *     name="User",
 *     description="User management endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Debug",
 *     description="Debug & Development endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Cache",
 *     description="Cache management endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Health",
 *     description="Health check endpoints"
 * )
 */
class OpenApiSpec
{
    // This class is just for OpenAPI annotations
}
