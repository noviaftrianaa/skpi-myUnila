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
use App\Http\Controllers\Api\UserContextController;

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
    Route::middleware('jwt.auth')->group(function () {
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
        });

    });

    // Manajemen Akses endpoints (protected with JWT)
    Route::middleware('jwt.auth')->prefix('manakses')->group(function () {
        // Pengguna (User Management)
        Route::prefix('pengguna')->group(function () {
            Route::get('/', [PenggunaController::class, 'index']);
            Route::get('/stats', [PenggunaController::class, 'stats']);
            Route::get('/peran-options', [PenggunaController::class, 'peranOptions']);
            Route::get('/radius-status', [PenggunaController::class, 'radiusStatus']);
            Route::get('/sso-users', [PenggunaController::class, 'ssoUsers']);
            Route::post('/clear-radius-cache', [PenggunaController::class, 'clearRadiusCache']);
            Route::get('/{id}', [PenggunaController::class, 'show']);
            Route::get('/{id}/mfa-status', [PenggunaController::class, 'mfaStatus']);
            Route::post('/{id}/reset-mfa', [PenggunaController::class, 'resetMfa']);
            Route::post('/{id}/reset-password', [PenggunaController::class, 'resetPassword']);
            Route::put('/{id}', [PenggunaController::class, 'update']);
            Route::delete('/{id}', [PenggunaController::class, 'destroy']);
        });

        // Aplikasi (Application Management)
        Route::prefix('aplikasi')->group(function () {
            Route::get('/', [AplikasiController::class, 'index']);
            Route::get('/stats', [AplikasiController::class, 'stats']);
            Route::get('/categories', [AplikasiController::class, 'categories']);
            Route::post('/', [AplikasiController::class, 'store']);
            Route::get('/{id}', [AplikasiController::class, 'show']);
            Route::put('/{id}', [AplikasiController::class, 'update']);
            Route::delete('/{id}', [AplikasiController::class, 'destroy']);
            Route::post('/{id}/regenerate-app-key', [AplikasiController::class, 'regenerateAppKey']);
        });

        // Unit Organisasi (Organization Unit Management)
        Route::prefix('unit-organisasi')->group(function () {
            Route::get('/', [UnitOrganisasiController::class, 'index']);
            Route::get('/all', [UnitOrganisasiController::class, 'all']);
            Route::get('/stats', [UnitOrganisasiController::class, 'stats']);
            Route::post('/', [UnitOrganisasiController::class, 'store']);
            Route::get('/{id}', [UnitOrganisasiController::class, 'show']);
            Route::put('/{id}', [UnitOrganisasiController::class, 'update']);
            Route::delete('/{id}', [UnitOrganisasiController::class, 'destroy']);
        });

        // Peran (Role Management)
        Route::prefix('peran')->group(function () {
            Route::get('/', [PeranController::class, 'index']);
            Route::get('/all', [PeranController::class, 'all']);
            Route::get('/stats', [PeranController::class, 'stats']);
            Route::post('/', [PeranController::class, 'store']);
            Route::get('/{id}', [PeranController::class, 'show']);
            Route::put('/{id}', [PeranController::class, 'update']);
            Route::delete('/{id}', [PeranController::class, 'destroy']);
        });

        // Role Pengguna (User Role Assignment Management)
        Route::prefix('role-pengguna')->group(function () {
            Route::get('/', [RolePenggunaController::class, 'index']);
            Route::get('/by-pengguna/{idPengguna}', [RolePenggunaController::class, 'byPengguna']);
            Route::post('/', [RolePenggunaController::class, 'store']);
            Route::get('/{id}', [RolePenggunaController::class, 'show']);
            Route::put('/{id}', [RolePenggunaController::class, 'update']);
            Route::delete('/{id}', [RolePenggunaController::class, 'destroy']);
        });

        // Endpoint (WS Endpoint Management)
        Route::prefix('endpoint')->group(function () {
            Route::get('/', [EndpointController::class, 'index']);
            Route::get('/groups', [EndpointController::class, 'groups']);
            Route::get('/stats', [EndpointController::class, 'stats']);
            Route::post('/', [EndpointController::class, 'store']);
            Route::get('/{id}', [EndpointController::class, 'show']);
            Route::put('/{id}', [EndpointController::class, 'update']);
            Route::delete('/{id}', [EndpointController::class, 'destroy']);
        });

        // Kategori Aplikasi (Application Category Management)
        Route::prefix('kategori-aplikasi')->group(function () {
            Route::get('/', [KategoriAplikasiController::class, 'index']);
            Route::get('/all', [KategoriAplikasiController::class, 'all']);
            Route::get('/stats', [KategoriAplikasiController::class, 'stats']);
            Route::post('/', [KategoriAplikasiController::class, 'store']);
            Route::get('/{id}', [KategoriAplikasiController::class, 'show']);
            Route::put('/{id}', [KategoriAplikasiController::class, 'update']);
            Route::delete('/{id}', [KategoriAplikasiController::class, 'destroy']);
        });

        // Menu (Application Menu Management)
        Route::prefix('menu')->group(function () {
            Route::get('/', [MenuController::class, 'index']);
            Route::get('/stats', [MenuController::class, 'stats']);
            Route::get('/by-aplikasi/{idAplikasi}', [MenuController::class, 'byAplikasi']);
            Route::post('/sync/{idAplikasi}', [MenuController::class, 'sync']);
            Route::post('/', [MenuController::class, 'store']);
            Route::get('/{id}', [MenuController::class, 'show']);
            Route::get('/{id}/roles', [MenuController::class, 'roles']);
            Route::put('/{id}', [MenuController::class, 'update']);
            Route::delete('/{id}', [MenuController::class, 'destroy']);
        });

        // Menu Role (RBAC - Role Based Access Control)
        Route::prefix('menu-role')->group(function () {
            Route::get('/', [MenuRoleController::class, 'index']);
            Route::get('/stats', [MenuRoleController::class, 'stats']);
            Route::get('/by-menu/{idMenu}', [MenuRoleController::class, 'byMenu']);
            Route::get('/by-role/{idPeran}', [MenuRoleController::class, 'byRole']);
            Route::post('/', [MenuRoleController::class, 'store']);
            Route::post('/bulk-assign-roles', [MenuRoleController::class, 'bulkAssignRoles']);
            Route::post('/bulk-assign-menus', [MenuRoleController::class, 'bulkAssignMenus']);
            Route::get('/{idMenu}/{idPeran}', [MenuRoleController::class, 'show']);
            Route::put('/{idMenu}/{idPeran}', [MenuRoleController::class, 'update']);
            Route::delete('/{idMenu}/{idPeran}', [MenuRoleController::class, 'destroy']);
        });
    });
});
