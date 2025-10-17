<?php

namespace App\Http\Controllers\OpenApi;

/**
 * Class AuthEndpoints
 *
 * This file contains ONLY OpenAPI documentation annotations.
 * It does NOT contain any actual controller code.
 * Controllers are safe and will NOT be deleted when generating swagger docs.
 */
class AuthEndpoints
{
    /**
     * @OA\Post(
     *     path="/api/v1/auth/login",
     *     tags={"Authentication"},
     *     summary="User Login",
     *     description="Authenticate user with username and password, returns JWT token",
     *     operationId="login",
     *     @OA\RequestBody(
     *         required=true,
     *         description="Login credentials",
     *         @OA\JsonContent(
     *             required={"username","password"},
     *             @OA\Property(property="username", type="string", example="DWI.RETNO21", description="Username"),
     *             @OA\Property(property="password", type="string", format="password", example="password123", description="Password")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Login successful"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="user",
     *                     type="object",
     *                     @OA\Property(property="id", type="string", example="8A9B55FC-E142-4DCE-A736-0000356DE151"),
     *                     @OA\Property(property="username", type="string", example="DWI.RETNO21"),
     *                     @OA\Property(property="name", type="string", example="DWI RETNO SEPTIANA"),
     *                     @OA\Property(property="email", type="string", example="DWI.RETNO21@students.unila.ac.id"),
     *                     @OA\Property(property="role", type="string", example="MAHASISWA"),
     *                     @OA\Property(property="roles", type="array", @OA\Items(type="string"), example={"MAHASISWA", "USER"})
     *                 ),
     *                 @OA\Property(
     *                     property="tokens",
     *                     type="object",
     *                     @OA\Property(property="access_token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGc..."),
     *                     @OA\Property(property="token_type", type="string", example="bearer"),
     *                     @OA\Property(property="expires_in", type="integer", example=900)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Invalid credentials",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Invalid credentials")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="User has no assigned roles",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="User has no assigned roles")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function login() {}

    /**
     * @OA\Post(
     *     path="/api/v1/auth/logout",
     *     tags={"Authentication"},
     *     summary="Logout",
     *     description="Logout current user session",
     *     operationId="logout",
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logged out successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Logged out successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized - Token not provided or invalid",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Token not provided")
     *         )
     *     )
     * )
     */
    public function logout() {}

    /**
     * @OA\Post(
     *     path="/api/v1/auth/logout-all",
     *     tags={"Authentication"},
     *     summary="Logout from all devices",
     *     description="Logout user from all devices and revoke all active tokens",
     *     operationId="logoutAllDevices",
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logged out from all devices successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Logged out from all devices successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function logoutAllDevices() {}

    /**
     * @OA\Get(
     *     path="/api/v1/auth/me",
     *     tags={"User"},
     *     summary="Get current user information",
     *     description="Retrieve authenticated user information",
     *     operationId="me",
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="User information retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="User information retrieved successfully"),
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
     *                     @OA\Property(property="role", type="string"),
     *                     @OA\Property(property="roles", type="array", @OA\Items(type="string")),
     *                     @OA\Property(property="satuan_pendidikan", type="string", nullable=true),
     *                     @OA\Property(property="fakultas", type="string", nullable=true),
     *                     @OA\Property(property="jurusan", type="string", nullable=true),
     *                     @OA\Property(property="prodi", type="string", nullable=true)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function me() {}

    /**
     * @OA\Post(
     *     path="/api/v1/auth/switch-role",
     *     tags={"User"},
     *     summary="Switch user role",
     *     description="Switch active role for users with multiple roles",
     *     operationId="switchRole",
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"role_name"},
     *             @OA\Property(property="role_name", type="string", example="MAHASISWA", description="Role name to switch to")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Role switched successfully",
     *         @OA\JsonContent(
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
     *         description="Unauthorized"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Role not found or not authorized"
     *     )
     * )
     */
    public function switchRole() {}

    /**
     * @OA\Get(
     *     path="/api/v1/auth/sessions",
     *     tags={"User"},
     *     summary="Get active sessions",
     *     description="Retrieve active login sessions for current user",
     *     operationId="activeSessions",
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Active sessions retrieved successfully"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function activeSessions() {}

    /**
     * @OA\Get(
     *     path="/api/v1/auth/token-info",
     *     tags={"User"},
     *     summary="Get token information",
     *     description="Retrieve information about current JWT token",
     *     operationId="tokenInfo",
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Token information retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="token",
     *                     type="object",
     *                     @OA\Property(property="user_id", type="string"),
     *                     @OA\Property(property="username", type="string"),
     *                     @OA\Property(property="role", type="string"),
     *                     @OA\Property(property="issued_at", type="integer"),
     *                     @OA\Property(property="expires_at", type="integer")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function tokenInfo() {}

    /**
     * @OA\Get(
     *     path="/api/health",
     *     tags={"Health"},
     *     summary="Health check",
     *     description="Check if auth service is running and healthy",
     *     operationId="health",
     *     @OA\Response(
     *         response=200,
     *         description="Service is healthy",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Auth service is running"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="service", type="string", example="auth-service"),
     *                 @OA\Property(property="status", type="string", example="healthy"),
     *                 @OA\Property(property="timestamp", type="string"),
     *                 @OA\Property(property="version", type="string", example="1.0.0")
     *             )
     *         )
     *     )
     * )
     */
    public function health() {}
}
