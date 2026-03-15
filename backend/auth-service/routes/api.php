<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SsoController;
use App\Http\Controllers\DebugController;
use App\Http\Controllers\CacheController;
use App\Http\Controllers\MfaController;
use App\Http\Controllers\Api\ManAkses\PenggunaController;
use App\Http\Controllers\Api\ManAkses\AplikasiController;
use App\Http\Controllers\Api\ManAkses\UnitOrganisasiController;
use App\Http\Controllers\Api\ManAkses\PeranController;
use App\Http\Controllers\Api\ManAkses\RolePenggunaController;
use App\Http\Controllers\Api\ManAkses\EndpointController;
use App\Http\Controllers\Api\ManAkses\KategoriAplikasiController;
use App\Http\Controllers\Api\ManAkses\MenuController;
use App\Http\Controllers\Api\ManAkses\MenuRoleController;
use App\Http\Controllers\Api\ManAkses\DashboardController;
use App\Http\Controllers\Api\UserContextController;
use App\Http\Controllers\Api\Logger\LoggerController;
use App\Http\Controllers\Api\Logger\KongLogController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\DocsController;

/*
|--------------------------------------------------------------------------
| API Routes - Auth Service
|--------------------------------------------------------------------------
|
| Authentication service routes
| Base URL: /api (configured in bootstrap/app.php)
|
| Structure:
| - /api/v1/* - All endpoints (no JWT required at Kong level)
|   Auth service handles its own JWT validation for protected endpoints
|
*/

// Health check (public)
Route::get('/health', [HealthController::class, 'check'] ?? function () {
    return response()->json([
        'service' => 'Auth Service',
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Kong Log Receiver (internal endpoint - called by Kong Gateway)
// No middleware - Kong will send logs here directly
Route::post('/v1/internal/kong-logs', [KongLogController::class, 'store']);
Route::get('/v1/internal/kong-logs/health', [KongLogController::class, 'health']);

// API version 1
Route::prefix('v1')->group(function () {

    // Public authentication endpoints (no JWT required)
    Route::prefix('auth')->group(function () {
        // Standard Authentication
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/login-mfa', [AuthController::class, 'loginWithMfa']); // MFA login
        Route::post('/refresh', [AuthController::class, 'refresh']);

        // SSO Authentication (CAS Unila)
        Route::get('/sso/url', [SsoController::class, 'getSsoUrl']); // Get SSO URL for API clients
        Route::get('/sso/redirect', [SsoController::class, 'redirectToSso']); // Direct redirect to SSO
        Route::get('/sso/callback', [SsoController::class, 'handleCallback']); // SSO callback (web)
        Route::post('/sso/callback', [SsoController::class, 'handleCallbackApi']); // SSO callback (API)
        Route::post('/sso/validate', [SsoController::class, 'validateToken']); // Validate SSO token only

        // TODO: Implement these later
        // Route::post('/register', [AuthController::class, 'register']);
        // Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        // Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // MFA routes (public - for login verification)
    Route::prefix('mfa')->group(function () {
        Route::post('/verify', [MfaController::class, 'verify']); // Verify MFA code during login
    });

    // Protected routes (JWT authentication required - validated by auth service itself)
    Route::middleware(['jwt.auth', 'log.jwt.access'])->group(function () {
        // Auth endpoints
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/logout-all', [AuthController::class, 'logoutAllDevices']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/switch-role', [AuthController::class, 'switchRole']);

            // Token management endpoints
            Route::get('/sessions', [AuthController::class, 'activeSessions']);
            Route::get('/token-info', [AuthController::class, 'tokenInfo']);
        });

        // MFA endpoints (Protected)
        Route::prefix('mfa')->group(function () {
            Route::post('/setup', [MfaController::class, 'setup']);     // Generate secret & QR
            Route::post('/enable', [MfaController::class, 'enable']);   // Enable MFA
            Route::post('/disable', [MfaController::class, 'disable']); // Disable MFA
            Route::get('/status', [MfaController::class, 'status']);    // Get MFA status
        });

        // Debug endpoints (Development only)
        Route::prefix('debug')->group(function () {
            Route::get('/jwt-logs', [DebugController::class, 'getJwtLogs']);
            Route::get('/refresh-token-status', [DebugController::class, 'checkRefreshTokenStatus']);
            Route::get('/all-sessions', [DebugController::class, 'getAllActiveSessions']);
        });

        // Cache management endpoints (Development/Admin only)
        Route::prefix('cache')->group(function () {
            Route::get('/stats', [CacheController::class, 'stats']);
            Route::get('/health', [CacheController::class, 'health']);
            Route::post('/clear', [CacheController::class, 'clear']);
            Route::post('/invalidate-user', [CacheController::class, 'invalidateUser']);

            // Permission cache invalidation endpoints
            Route::post('/invalidate-menu-role', [CacheController::class, 'invalidateMenuRole']);
            Route::post('/invalidate-app-info', [CacheController::class, 'invalidateAppInfo']);
            Route::post('/invalidate-portal-apps', [CacheController::class, 'invalidatePortalApps']);
            Route::post('/invalidate-all-permissions', [CacheController::class, 'invalidateAllPermissions']);
        });

        // User Context endpoints (role/unit selection for app access)
        Route::prefix('user-context')->group(function () {
            Route::get('/', [UserContextController::class, 'getUserContext']);           // Get all roles & units
            Route::post('/select', [UserContextController::class, 'selectContext']);      // Select role + unit
            Route::get('/active', [UserContextController::class, 'getActiveContext']);    // Get active context
            Route::get('/check-access', [UserContextController::class, 'checkAppAccess']); // Check app access
            Route::delete('/clear', [UserContextController::class, 'clearContext']);      // Clear context

            // Portal Apps endpoints (filtered by organization access)
            Route::get('/portal-apps', [UserContextController::class, 'getPortalApps']);       // Get portal apps for user
            Route::get('/portal-categories', [UserContextController::class, 'getPortalCategories']); // Get all categories

            // App Menus endpoint (RBAC-based menu visibility)
            Route::get('/app-menus', [UserContextController::class, 'getAppMenus']);           // Get user's accessible menus for an app
        });

        // Profile endpoints (get complete user profile with roles and detailed data)
        Route::get('/profile', [ProfileController::class, 'getProfile']);

    });

    // Manajemen Akses endpoints (protected with JWT)
    // Permission middleware uses app_key from header X-App-Key or query param
    Route::middleware(['jwt.auth', 'log.role.access'])->prefix('manakses')->group(function () {
        // Dashboard
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/recent-activities', [DashboardController::class, 'recentActivities']);

        // Pengguna (User Management)
        Route::prefix('pengguna')->group(function () {
            // Read operations - no permission check (show permission assumed for authenticated users)
            Route::get('/', [PenggunaController::class, 'index']);
            Route::get('/stats', [PenggunaController::class, 'stats']);
            Route::get('/peran-options', [PenggunaController::class, 'peranOptions']);
            Route::get('/radius-status', [PenggunaController::class, 'radiusStatus']);
            Route::get('/sso-users', [PenggunaController::class, 'ssoUsers']);
            Route::get('/{id}', [PenggunaController::class, 'show']);
            Route::get('/{id}/mfa-status', [PenggunaController::class, 'mfaStatus']);

            // Write operations - require permission check
            Route::post('/clear-radius-cache', [PenggunaController::class, 'clearRadiusCache'])->middleware('permission:update,manajemen-akses');
            Route::post('/{id}/reset-mfa', [PenggunaController::class, 'resetMfa'])->middleware('permission:update,manajemen-akses');
            Route::post('/{id}/reset-password', [PenggunaController::class, 'resetPassword'])->middleware('permission:update,manajemen-akses');
            Route::put('/{id}', [PenggunaController::class, 'update'])->middleware('permission:update,manajemen-akses');
            Route::delete('/{id}', [PenggunaController::class, 'destroy'])->middleware('permission:delete,manajemen-akses');
        });

        // Aplikasi (Application Management)
        Route::prefix('aplikasi')->group(function () {
            // Read operations
            Route::get('/', [AplikasiController::class, 'index']);
            Route::get('/stats', [AplikasiController::class, 'stats']);
            Route::get('/categories', [AplikasiController::class, 'categories']);

            // Organisasi whitelist per app (HARUS sebelum /{id} agar tidak conflict)
            Route::get('/{id}/organisasi', [AplikasiController::class, 'getOrganisasi']);
            Route::post('/{id}/organisasi', [AplikasiController::class, 'addOrganisasi'])->middleware('permission:insert,manajemen-akses');
            Route::delete('/{id}/organisasi/{orgId}', [AplikasiController::class, 'removeOrganisasi'])->middleware('permission:delete,manajemen-akses');

            Route::get('/{id}', [AplikasiController::class, 'show']);

            // Write operations
            Route::post('/', [AplikasiController::class, 'store'])->middleware('permission:insert,manajemen-akses');
            Route::put('/{id}', [AplikasiController::class, 'update'])->middleware('permission:update,manajemen-akses');
            Route::delete('/{id}', [AplikasiController::class, 'destroy'])->middleware('permission:delete,manajemen-akses');
            Route::post('/{id}/regenerate-app-key', [AplikasiController::class, 'regenerateAppKey'])->middleware('permission:update,manajemen-akses');
        });

        // Unit Organisasi (Organization Unit Management)
        Route::prefix('unit-organisasi')->group(function () {
            // Read operations
            Route::get('/', [UnitOrganisasiController::class, 'index']);
            Route::get('/all', [UnitOrganisasiController::class, 'all']);
            Route::get('/stats', [UnitOrganisasiController::class, 'stats']);
            Route::get('/{id}', [UnitOrganisasiController::class, 'show']);

            // Write operations - require permission check
            Route::post('/', [UnitOrganisasiController::class, 'store'])->middleware('permission:insert,manajemen-akses');
            Route::put('/{id}', [UnitOrganisasiController::class, 'update'])->middleware('permission:update,manajemen-akses');
            Route::delete('/{id}', [UnitOrganisasiController::class, 'destroy'])->middleware('permission:delete,manajemen-akses');
        });

        // Peran (Role Management)
        Route::prefix('peran')->group(function () {
            // Read operations
            Route::get('/', [PeranController::class, 'index']);
            Route::get('/all', [PeranController::class, 'all']);
            Route::get('/stats', [PeranController::class, 'stats']);
            Route::get('/{id}', [PeranController::class, 'show']);

            // Write operations - require permission check
            Route::post('/', [PeranController::class, 'store'])->middleware('permission:insert,manajemen-akses');
            Route::put('/{id}', [PeranController::class, 'update'])->middleware('permission:update,manajemen-akses');
            Route::delete('/{id}', [PeranController::class, 'destroy'])->middleware('permission:delete,manajemen-akses');
        });

        // Role Pengguna (User Role Assignment Management)
        Route::prefix('role-pengguna')->group(function () {
            // Read operations
            Route::get('/', [RolePenggunaController::class, 'index']);
            Route::get('/by-pengguna/{idPengguna}', [RolePenggunaController::class, 'byPengguna']);
            Route::get('/{id}', [RolePenggunaController::class, 'show']);

            // Write operations - require permission check
            Route::post('/', [RolePenggunaController::class, 'store'])->middleware('permission:insert,manajemen-akses');
            Route::put('/{id}', [RolePenggunaController::class, 'update'])->middleware('permission:update,manajemen-akses');
            Route::delete('/{id}', [RolePenggunaController::class, 'destroy'])->middleware('permission:delete,manajemen-akses');
        });

        // Endpoint (WS Endpoint Management)
        Route::prefix('endpoint')->group(function () {
            // Read operations
            Route::get('/', [EndpointController::class, 'index']);
            Route::get('/groups', [EndpointController::class, 'groups']);
            Route::get('/stats', [EndpointController::class, 'stats']);
            Route::get('/{id}', [EndpointController::class, 'show']);

            // Write operations - require permission check
            Route::post('/', [EndpointController::class, 'store'])->middleware('permission:insert,manajemen-akses');
            Route::put('/{id}', [EndpointController::class, 'update'])->middleware('permission:update,manajemen-akses');
            Route::delete('/{id}', [EndpointController::class, 'destroy'])->middleware('permission:delete,manajemen-akses');
        });

        // Kategori Aplikasi (Application Category Management)
        Route::prefix('kategori-aplikasi')->group(function () {
            // Read operations
            Route::get('/', [KategoriAplikasiController::class, 'index']);
            Route::get('/all', [KategoriAplikasiController::class, 'all']);
            Route::get('/stats', [KategoriAplikasiController::class, 'stats']);
            Route::get('/{id}', [KategoriAplikasiController::class, 'show']);

            // Write operations - require permission check
            Route::post('/', [KategoriAplikasiController::class, 'store'])->middleware('permission:insert,manajemen-akses');
            Route::put('/{id}', [KategoriAplikasiController::class, 'update'])->middleware('permission:update,manajemen-akses');
            Route::delete('/{id}', [KategoriAplikasiController::class, 'destroy'])->middleware('permission:delete,manajemen-akses');
        });

        // Menu (Application Menu Management)
        Route::prefix('menu')->group(function () {
            // Read operations
            Route::get('/', [MenuController::class, 'index']);
            Route::get('/stats', [MenuController::class, 'stats']);
            Route::get('/by-aplikasi/{idAplikasi}', [MenuController::class, 'byAplikasi']);
            Route::get('/{id}', [MenuController::class, 'show']);
            Route::get('/{id}/roles', [MenuController::class, 'roles']);

            // Write operations - require permission check
            Route::post('/sync/{idAplikasi}', [MenuController::class, 'sync'])->middleware('permission:update,manajemen-akses');
            Route::post('/', [MenuController::class, 'store'])->middleware('permission:insert,manajemen-akses');
            Route::put('/{id}', [MenuController::class, 'update'])->middleware('permission:update,manajemen-akses');
            Route::delete('/{id}', [MenuController::class, 'destroy'])->middleware('permission:delete,manajemen-akses');
        });

        // Menu Role (RBAC - Role Based Access Control)
        Route::prefix('menu-role')->group(function () {
            // Read operations
            Route::get('/', [MenuRoleController::class, 'index']);
            Route::get('/stats', [MenuRoleController::class, 'stats']);
            Route::get('/by-menu/{idMenu}', [MenuRoleController::class, 'byMenu']);
            Route::get('/by-role/{idPeran}', [MenuRoleController::class, 'byRole']);
            Route::get('/{idMenu}/{idPeran}', [MenuRoleController::class, 'show']);

            // Write operations - require permission check
            Route::post('/', [MenuRoleController::class, 'store'])->middleware('permission:insert,manajemen-akses');
            Route::post('/bulk-assign-roles', [MenuRoleController::class, 'bulkAssignRoles'])->middleware('permission:insert,manajemen-akses');
            Route::post('/bulk-assign-menus', [MenuRoleController::class, 'bulkAssignMenus'])->middleware('permission:insert,manajemen-akses');
            Route::put('/{idMenu}/{idPeran}', [MenuRoleController::class, 'update'])->middleware('permission:update,manajemen-akses');
            Route::delete('/{idMenu}/{idPeran}', [MenuRoleController::class, 'destroy'])->middleware('permission:delete,manajemen-akses');
        });

        // Logger (Activity Logs Management)
        Route::prefix('logger')->group(function () {
            // Statistics
            Route::get('/stats', [LoggerController::class, 'stats']);
            Route::get('/most-active-users', [LoggerController::class, 'mostActiveUsers']);

            // Login Logs
            Route::get('/login', [LoggerController::class, 'loginLogs']);
            Route::get('/login/{id}', [LoggerController::class, 'loginLogDetail']);

            // JWT Logs
            Route::get('/jwt', [LoggerController::class, 'jwtLogs']);
            Route::get('/jwt/{id}', [LoggerController::class, 'jwtLogDetail']);

            // JWT Access Logs
            Route::get('/jwt-access', [LoggerController::class, 'jwtAccessLogs']);
            Route::get('/jwt-access/{id}', [LoggerController::class, 'jwtAccessLogDetail']);

            // Role Access Logs
            Route::get('/role-access', [LoggerController::class, 'roleAccessLogs']);
            Route::get('/role-access/{id}', [LoggerController::class, 'roleAccessLogDetail']);
        });
    });
});
