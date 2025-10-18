<?php

namespace App\Http\Controllers\OpenApi;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="My Unila Dashboard Service API",
 *     description="Dashboard Service - University Profile, Rankings, Statistics, and Public Information",
 *     @OA\Contact(
 *         email="mizar.zulmi@staff.unila.ac.id",
 *         name="Universitas Lampung - UPT TIK"
 *     ),
 *     @OA\License(
 *         name="Proprietary",
 *         url="https://unila.ac.id"
 *     )
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8082/api/v1",
 *     description="Local Development (Direct Access)"
 * )
 *
 * @OA\Server(
 *     url="http://localhost:9800/dashboard-service/api/v1",
 *     description="Local Development (via Kong Gateway)"
 * )
 *
 * @OA\Server(
 *     url="https://api.unila.ac.id/dashboard-service/api/v1",
 *     description="Production"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Enter JWT Bearer token. Format: Bearer {token}"
 * )
 *
 * @OA\Tag(
 *     name="Health",
 *     description="Health check endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Rankings",
 *     description="World University Rankings - GreenMetric, QS, THE, Webometrics"
 * )
 *
 * @OA\Tag(
 *     name="University Profile",
 *     description="University profile and information"
 * )
 *
 * @OA\Tag(
 *     name="User Favorites",
 *     description="User favorite applications (Protected)"
 * )
 */
class OpenApiInfo
{
    // This class only contains OpenAPI annotations
}
