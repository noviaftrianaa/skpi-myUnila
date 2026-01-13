<?php

namespace App\Http\Controllers\OpenApi;

/**
 * @OA\Info(
 *     title="My Unila Auth Service API",
 *     version="1.0.0",
 *     description="Authentication & Authorization Service for My Unila Platform. Handles user authentication (SSO, MFA), authorization (RBAC), session management, and access control.",
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
 *     url="http://localhost:8081/api/v1",
 *     description="Local Development (Direct Access)"
 * )
 *
 * @OA\Server(
 *     url="http://localhost:9800/auth-service/api/v1",
 *     description="Local Development (via Kong Gateway)"
 * )
 *
 * @OA\Server(
 *     url="https://api.unila.ac.id/auth-service/api/v1",
 *     description="Production"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Enter JWT Bearer token obtained from login endpoint"
 * )
 *
 * @OA\Tag(
 *     name="Authentication",
 *     description="Authentication endpoints - Login, Logout, SSO, Token Refresh"
 * )
 *
 * @OA\Tag(
 *     name="MFA",
 *     description="Multi-Factor Authentication endpoints - Setup, Enable, Verify"
 * )
 *
 * @OA\Tag(
 *     name="User Context",
 *     description="User context and role/unit selection for application access"
 * )
 *
 * @OA\Tag(
 *     name="Profile",
 *     description="User profile endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Manajemen Akses - Dashboard",
 *     description="Access management dashboard statistics"
 * )
 *
 * @OA\Tag(
 *     name="Manajemen Akses - Pengguna",
 *     description="User management (CRUD operations)"
 * )
 *
 * @OA\Tag(
 *     name="Manajemen Akses - Aplikasi",
 *     description="Application management (CRUD operations)"
 * )
 *
 * @OA\Tag(
 *     name="Manajemen Akses - Unit Organisasi",
 *     description="Organization unit management (CRUD operations)"
 * )
 *
 * @OA\Tag(
 *     name="Manajemen Akses - Peran",
 *     description="Role management (CRUD operations)"
 * )
 *
 * @OA\Tag(
 *     name="Manajemen Akses - Role Pengguna",
 *     description="User role assignment management"
 * )
 *
 * @OA\Tag(
 *     name="Manajemen Akses - Menu",
 *     description="Application menu management"
 * )
 *
 * @OA\Tag(
 *     name="Manajemen Akses - Menu Role",
 *     description="RBAC - Role-based menu access control"
 * )
 *
 * @OA\Tag(
 *     name="Manajemen Akses - Endpoint",
 *     description="WS Endpoint management"
 * )
 *
 * @OA\Tag(
 *     name="Manajemen Akses - Kategori Aplikasi",
 *     description="Application category management"
 * )
 *
 * @OA\Tag(
 *     name="Logger",
 *     description="Activity logs - Login, JWT, Role Access"
 * )
 *
 * @OA\Tag(
 *     name="Cache",
 *     description="Cache management endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Debug",
 *     description="Debug & Development endpoints"
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
