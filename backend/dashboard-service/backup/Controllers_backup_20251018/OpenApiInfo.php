<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="Dashboard Service API",
 *     version="1.0.0",
 *     description="Public API for University Lampung information and homepage data. Some endpoints require JWT authentication.",
 *     @OA\Contact(
 *         name="My Unila Support",
 *         email="support@unila.ac.id"
 *     )
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8082",
 *     description="Development Server - Direct Access"
 * )
 *
 * @OA\Server(
 *     url="http://localhost:9800/dashboard-service",
 *     description="Kong API Gateway - Via Proxy (Recommended for protected endpoints)"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="JWT token from Auth Service. Get token from: POST http://localhost:9800/auth-service/api/v1/auth/login"
 * )
 *
 * @OA\Tag(
 *     name="University Profile",
 *     description="Public endpoints for university information (no authentication required)"
 * )
 *
 * @OA\Tag(
 *     name="User Favorites",
 *     description="Protected endpoints for user favorites management (requires JWT authentication)"
 * )
 *
 * @OA\Tag(
 *     name="User Profile",
 *     description="Protected endpoints for user profile (requires JWT authentication)"
 * )
 *
 * @OA\Tag(
 *     name="Health",
 *     description="Service health check"
 * )
 */
class OpenApiInfo
{
    // This class only contains OpenAPI annotations for documentation
}
