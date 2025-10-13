<?php

namespace App\Swagger;

/**
 * @OA\Info(
 *     title="My Unila Auth Service API",
 *     version="1.0.0",
 *     description="Authentication & Token Management Service for My Unila Platform",
 *     @OA\Contact(
 *         email="admin@myunila.ac.id",
 *         name="My Unila IT Team"
 *     )
 * )
 *
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="Kong API Gateway (Recommended for production)"
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8081",
 *     description="Direct Access (Development only)"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Enter JWT Bearer token (without 'Bearer' prefix)"
 * )
 *
 * @OA\Tag(
 *     name="Authentication",
 *     description="Login, logout, and token management operations"
 * )
 *
 * @OA\Tag(
 *     name="Token Management",
 *     description="Manage active tokens and sessions"
 * )
 *
 * @OA\Tag(
 *     name="Cache Management",
 *     description="Redis cache monitoring and management"
 * )
 *
 * @OA\Tag(
 *     name="User Management",
 *     description="User profile and settings"
 * )
 */
class OpenApiInfo
{
    // This class only contains OpenAPI documentation annotations
}
