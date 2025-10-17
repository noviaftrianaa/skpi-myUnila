<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SsoController;
use App\Http\Controllers\DebugController;
use App\Http\Controllers\CacheController;
use App\Http\Controllers\MfaController;

/*
|--------------------------------------------------------------------------
| API Routes - Auth Service
|--------------------------------------------------------------------------
|
| Authentication service routes
| Base URL: /api (configured in bootstrap/app.php)
|
*/

// Health check
Route::get('/health', [HealthController::class, 'check'] ?? function () {
    return response()->json([
        'service' => 'Auth Service',
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// API version 1
Route::prefix('v1')->group(function () {

    // Public routes (no authentication required)
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

    // Protected routes (JWT authentication required)
    Route::middleware('jwt.auth')->group(function () {
        // Auth endpoints
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/logout-all', [AuthController::class, 'logoutAllDevices']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/switch-role', [AuthController::class, 'switchRole']);

        // Token management endpoints
        Route::get('/auth/sessions', [AuthController::class, 'activeSessions']);
        Route::get('/auth/token-info', [AuthController::class, 'tokenInfo']);

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

});
