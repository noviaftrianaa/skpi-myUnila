<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="Public Service API",
 *     version="1.0.0",
 *     description="Public API for University Lampung information and homepage data.",
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
 *     url="http://localhost:9800/public-service",
 *     description="Kong API Gateway - Via Proxy"
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
 *     name="Health",
 *     description="Service health check"
 * )
 */
class OpenApiInfo
{
    // This class only contains OpenAPI annotations for documentation
}
