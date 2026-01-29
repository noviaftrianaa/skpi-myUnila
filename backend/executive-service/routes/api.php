<?php

use App\Http\Controllers\AkreditasiController;
use App\Http\Controllers\RasioController;
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
        Route::get('/fakultas', [AkreditasiController::class, 'getDataAkreditasiFakultas']);
        Route::get('/fakultas/{idProdi}', [AkreditasiController::class, 'getDataAkreditasiProdi']);
    });
    Route::prefix('rasio')->group(function () {
        // Master data routes
        Route::get('/master/fakultas', [RasioController::class, 'getFakultasList']);
        Route::get('/master/tahun-ajaran', [RasioController::class, 'getTahunAjaranList']);

        // Rasio routes
        Route::get('/fakultas', [RasioController::class, 'getRasioFakultas']);
        Route::get('/fakultas/{idProdi}', [RasioController::class, 'getRasioProdi']);

        // Detail data with pagination
        Route::get('/data/mahasiswa', [RasioController::class, 'getDataMahasiswa']);
        Route::get('/data/dosen', [RasioController::class, 'getDataDosen']);
    });
});
