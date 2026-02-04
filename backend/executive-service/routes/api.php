<?php

use App\Http\Controllers\AkreditasiController;
use App\Http\Controllers\RasioController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\JabFungController;
use App\Http\Controllers\JenjangPendidikanController;

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

    Route::prefix('dosen')->group(function () {
        Route::prefix('jabfung')->group(function () {
            // Master data routes
            Route::get('/master/tahun-ajaran', [JabFungController::class, 'getTahunAjaranList']);
            Route::get('/master/fakultas', [JabFungController::class, 'getFakultasList']);
            Route::get('/master/prodi', [JabFungController::class, 'getProdiList']);

            // Jabfung data routes
            Route::get('/fakultas', [JabFungController::class, 'getJabfungFakultas']);
            Route::get('/fakultas/{idFakultas}', [JabFungController::class, 'getJabfungProdi']);

            // Detail data with pagination
            Route::get('/data', [JabFungController::class, 'getDataDosen']);
        });

        Route::prefix('jenjang-pendidikan')->group(function () {
            // Master data routes
            Route::get('/master/tahun-ajaran', [JenjangPendidikanController::class, 'getTahunAjaranList']);
            Route::get('/master/fakultas', [JenjangPendidikanController::class, 'getFakultasList']);
            Route::get('/master/prodi', [JenjangPendidikanController::class, 'getProdiList']);

            // Jenjang pendidikan data routes
            Route::get('/fakultas', [JenjangPendidikanController::class, 'getJenjangFakultas']);
            Route::get('/fakultas/{idFakultas}', [JenjangPendidikanController::class, 'getJenjangProdi']);

            // Detail data with pagination
            Route::get('/data', [JenjangPendidikanController::class, 'getDataDosen']);
        });
    });
});
