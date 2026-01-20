<?php

use App\Http\Controllers\AkreditasiController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check endpoint (public)
Route::get('/health', [HealthController::class, 'check']);

// API version 1
Route::prefix('v1')->group(function () {

    // Public routes (no authentication required)
    Route::prefix('public')->group(function () {
        // Add your public routes here
    });

    // Protected routes (JWT authentication required)
    // Route::middleware(['jwt.auth'])->group(function () {
    //     // Add your protected routes here
    // });

    Route::prefix('akreditasi')->group(function () {
        Route::get('/fakultas', [AkreditasiController::class, 'getFakultas']);
        Route::get('/cobak', [AkreditasiController::class, 'getFakultas']);
    });
});
