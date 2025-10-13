<?php

namespace App\Swagger\Controllers;

/**
 * @OA\Post(
 *     path="/auth-service/api/v1/auth/login",
 *     operationId="login",
 *     tags={"Authentication"},
 *     summary="User login with username and password",
 *     description="Authenticate user and return JWT tokens",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(ref="#/components/schemas/LoginRequest")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Login successful",
 *         @OA\JsonContent(ref="#/components/schemas/LoginResponse")
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Invalid credentials",
 *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
 *     ),
 *     @OA\Response(
 *         response=422,
 *         description="Validation error",
 *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
 *     )
 * )
 *
 * @OA\Post(
 *     path="/auth-service/api/v1/auth/refresh",
 *     operationId="refreshToken",
 *     tags={"Authentication"},
 *     summary="Refresh access token",
 *     description="Generate new access token using refresh token from cookie",
 *     @OA\RequestBody(
 *         required=false,
 *         description="Refresh token can also be sent in cookie",
 *         @OA\JsonContent(ref="#/components/schemas/RefreshTokenRequest")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Token refreshed successfully",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Token refreshed successfully"),
 *             @OA\Property(
 *                 property="data",
 *                 type="object",
 *                 @OA\Property(property="access_token", type="string"),
 *                 @OA\Property(property="token_type", type="string", example="Bearer"),
 *                 @OA\Property(property="expires_in", type="integer", example=900)
 *             )
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Invalid or expired refresh token",
 *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
 *     )
 * )
 *
 * @OA\Post(
 *     path="/auth-service/api/v1/auth/logout",
 *     operationId="logout",
 *     tags={"Authentication"},
 *     summary="Logout current session",
 *     description="Revoke current access and refresh tokens",
 *     security={{"bearerAuth": {}}},
 *     @OA\Response(
 *         response=200,
 *         description="Logout successful",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Logout successful")
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Unauthenticated",
 *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
 *     )
 * )
 *
 * @OA\Post(
 *     path="/auth-service/api/v1/auth/logout-all",
 *     operationId="logoutAllDevices",
 *     tags={"Authentication"},
 *     summary="Logout from all devices",
 *     description="Revoke all refresh tokens and end all sessions",
 *     security={{"bearerAuth": {}}},
 *     @OA\Response(
 *         response=200,
 *         description="Logged out from all devices successfully",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Logged out from all devices successfully")
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Unauthenticated",
 *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
 *     )
 * )
 *
 * @OA\Get(
 *     path="/auth-service/api/v1/auth/me",
 *     operationId="getCurrentUser",
 *     tags={"User Management"},
 *     summary="Get current authenticated user",
 *     description="Returns current user information from JWT token",
 *     security={{"bearerAuth": {}}},
 *     @OA\Response(
 *         response=200,
 *         description="User information retrieved",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(
 *                 property="data",
 *                 type="object",
 *                 @OA\Property(
 *                     property="user",
 *                     type="object",
 *                     @OA\Property(property="id", type="string"),
 *                     @OA\Property(property="username", type="string"),
 *                     @OA\Property(property="name", type="string"),
 *                     @OA\Property(property="email", type="string"),
 *                     @OA\Property(property="role", type="string")
 *                 )
 *             )
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Unauthenticated",
 *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
 *     )
 * )
 *
 * @OA\Get(
 *     path="/auth-service/api/v1/auth/sessions",
 *     operationId="getActiveSessions",
 *     tags={"Token Management"},
 *     summary="Get all active sessions",
 *     description="Returns list of all active sessions for current user",
 *     security={{"bearerAuth": {}}},
 *     @OA\Response(
 *         response=200,
 *         description="Active sessions retrieved",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(
 *                 property="data",
 *                 type="object",
 *                 @OA\Property(
 *                     property="sessions",
 *                     type="array",
 *                     @OA\Items(
 *                         type="object",
 *                         @OA\Property(property="session_id", type="string"),
 *                         @OA\Property(property="device_name", type="string"),
 *                         @OA\Property(property="ip_address", type="string"),
 *                         @OA\Property(property="browser", type="string"),
 *                         @OA\Property(property="os", type="string"),
 *                         @OA\Property(property="created_at", type="string"),
 *                         @OA\Property(property="is_active", type="boolean")
 *                     )
 *                 ),
 *                 @OA\Property(property="active_tokens", type="integer"),
 *                 @OA\Property(property="total_sessions", type="integer"),
 *                 @OA\Property(property="cached", type="boolean")
 *             )
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Unauthenticated",
 *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
 *     )
 * )
 *
 * @OA\Get(
 *     path="/auth-service/api/v1/auth/token-info",
 *     operationId="getTokenInfo",
 *     tags={"Token Management"},
 *     summary="Get current token information",
 *     description="Returns detailed information about the current access token",
 *     security={{"bearerAuth": {}}},
 *     @OA\Response(
 *         response=200,
 *         description="Token information retrieved",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(
 *                 property="data",
 *                 type="object",
 *                 @OA\Property(property="jti", type="string"),
 *                 @OA\Property(property="type", type="string", example="access"),
 *                 @OA\Property(property="user_id", type="string"),
 *                 @OA\Property(property="issued_at", type="string"),
 *                 @OA\Property(property="expires_at", type="string"),
 *                 @OA\Property(property="time_remaining", type="string"),
 *                 @OA\Property(property="ip_address", type="string"),
 *                 @OA\Property(property="is_expired", type="boolean")
 *             )
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Unauthenticated",
 *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
 *     )
 * )
 *
 * @OA\Post(
 *     path="/auth-service/api/v1/auth/revoke-token",
 *     operationId="revokeToken",
 *     tags={"Token Management"},
 *     summary="Revoke a specific refresh token",
 *     description="Manually revoke a refresh token by its ID",
 *     security={{"bearerAuth": {}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             type="object",
 *             required={"token_id"},
 *             @OA\Property(property="token_id", type="string", format="uuid", example="550e8400-e29b-41d4-a716-446655440000")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Token revoked successfully",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Token revoked successfully")
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Unauthenticated",
 *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Token not found",
 *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
 *     )
 * )
 *
 * @OA\Post(
 *     path="/auth-service/api/v1/auth/switch-role",
 *     operationId="switchRole",
 *     tags={"Authentication"},
 *     summary="Switch user active role",
 *     description="Switch the active role for the authenticated user. Updates the last_active timestamp for the selected role.",
 *     security={{"bearerAuth": {}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"role_name"},
 *             @OA\Property(property="role_name", type="string", example="mahasiswa", description="Name of the role to switch to")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Role switched successfully",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Role switched successfully"),
 *             @OA\Property(
 *                 property="data",
 *                 type="object",
 *                 @OA\Property(property="user", type="object")
 *             )
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Unauthorized",
 *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Role not found",
 *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
 *     ),
 *     @OA\Response(
 *         response=422,
 *         description="Validation error",
 *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
 *     )
 * )
 */
class AuthAnnotations
{
    // This class only contains OpenAPI documentation annotations for AuthController
}
