<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DocsController;

Route::get('/', function () {
    return view('welcome');
});

// API Documentation (Scalar UI)
// Protected by Kong JWT auth and Developer role check
// Exclude from middleware that requires encryption/session
Route::withoutMiddleware([
    \Illuminate\Cookie\Middleware\EncryptCookies::class,
    \Illuminate\Session\Middleware\StartSession::class,
    \Illuminate\View\Middleware\ShareErrorsFromSession::class,
    \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
])->group(function () {
    // Protected docs routes (Kong JWT + Developer role)
    Route::middleware(['kong.auth', 'require.developer'])->group(function () {
        Route::get('/docs', [DocsController::class, 'index']);
        Route::get('/docs/openapi.json', [DocsController::class, 'openApiJson']);
    });

    // Static assets (no auth required)
    Route::get('/docs/favicon.png', [DocsController::class, 'favicon']);
});
