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
use App\Http\Controllers\Api\ManAkses\SyncController;
use App\Http\Controllers\Api\ManAkses\UnitOrganisasiController;
use App\Http\Controllers\Api\ManAkses\PeranController;
use App\Http\Controllers\Api\ManAkses\RolePenggunaController;
use App\Http\Controllers\Api\ManAkses\EndpointController;

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
        });

    });

    // Manajemen Akses endpoints (protected with JWT)
    Route::middleware('jwt.auth')->prefix('manakses')->group(function () {
        // Pengguna (User Management)
        Route::prefix('pengguna')->group(function () {
            Route::get('/', [PenggunaController::class, 'index']);
            Route::get('/stats', [PenggunaController::class, 'stats']);
            Route::get('/radius-status', [PenggunaController::class, 'radiusStatus']);
            Route::get('/sso-users', [PenggunaController::class, 'ssoUsers']);
            Route::post('/clear-radius-cache', [PenggunaController::class, 'clearRadiusCache']);
            Route::get('/{id}', [PenggunaController::class, 'show']);
        });

        // Aplikasi (Application Management)
        Route::prefix('aplikasi')->group(function () {
            Route::get('/', [AplikasiController::class, 'index']);
            Route::get('/stats', [AplikasiController::class, 'stats']);
            Route::post('/', [AplikasiController::class, 'store']);
            Route::get('/{id}', [AplikasiController::class, 'show']);
            Route::put('/{id}', [AplikasiController::class, 'update']);
            Route::delete('/{id}', [AplikasiController::class, 'destroy']);
        });

        // Sync Radius to ManAkses
        Route::prefix('sync')->group(function () {
            // Get sync status and progress
            Route::get('/status', [SyncController::class, 'getStatus']);
            Route::get('/progress', [SyncController::class, 'getProgress']);
            Route::get('/logs', [SyncController::class, 'getLogs']);

            // Get radius database stats
            Route::get('/radius-stats', [SyncController::class, 'getRadiusStats']);

            // Start sync (foreground - blocking)
            Route::post('/start', [SyncController::class, 'startSync']);

            // Start sync (background - non-blocking via queue)
            Route::post('/start-background', [SyncController::class, 'startSyncBackground']);
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
    });
});
