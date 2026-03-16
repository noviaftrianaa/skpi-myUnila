<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\Dashboard\ReferenceController;
use App\Http\Controllers\Api\Dashboard\BerandaController;
use App\Http\Controllers\Api\Dashboard\MahasiswaController;
use App\Http\Controllers\Api\Dashboard\DosenController;
use App\Http\Controllers\Api\Dashboard\AkreditasiController;
use App\Http\Controllers\Api\Dashboard\LulusanController;
use App\Http\Controllers\Api\Dashboard\LitabmasController;
use App\Http\Controllers\Api\Dashboard\PublikasiController;
use App\Http\Controllers\Api\Dashboard\PegawaiController;
use App\Http\Controllers\Api\Dashboard\KeuanganController;
use App\Http\Controllers\Api\Dashboard\PrestasiController;
use App\Http\Controllers\Api\Dashboard\KerjasamaController;
use App\Http\Controllers\Api\Dashboard\IkuController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check endpoint (public)
Route::get('/health', [HealthController::class, 'check']);

// API version 1
Route::prefix('v1')->group(function () {

    // Reference data (dropdown filters)
    Route::prefix('reference')->group(function () {
        Route::get('/fakultas', [ReferenceController::class, 'fakultas']);
        Route::get('/prodi', [ReferenceController::class, 'prodi']);
        Route::get('/semester', [ReferenceController::class, 'semester']);
    });

    // Dashboard endpoints
    Route::prefix('dashboard')->group(function () {
        Route::get('/beranda', [BerandaController::class, 'index']);
        Route::get('/mahasiswa', [MahasiswaController::class, 'index']);
        Route::get('/dosen', [DosenController::class, 'index']);
        Route::get('/akreditasi', [AkreditasiController::class, 'index']);
        Route::get('/lulusan', [LulusanController::class, 'index']);
        Route::get('/litabmas', [LitabmasController::class, 'index']);
        Route::get('/publikasi', [PublikasiController::class, 'index']);
        Route::get('/pegawai', [PegawaiController::class, 'index']);
        Route::get('/keuangan', [KeuanganController::class, 'index']);
        Route::get('/prestasi', [PrestasiController::class, 'index']);
        Route::get('/kerjasama', [KerjasamaController::class, 'index']);
        Route::get('/iku', [IkuController::class, 'index']);
    });

    // ================================================================
    // DATA UNILA — Raw Data Portal
    // ================================================================
    Route::prefix('data')->group(function () {
        // Mahasiswa
        Route::prefix('mahasiswa')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\DataUnila\MahasiswaDataController::class, 'index']);
            Route::get('/stats', [\App\Http\Controllers\Api\DataUnila\MahasiswaDataController::class, 'stats']);
            Route::get('/filters', [\App\Http\Controllers\Api\DataUnila\MahasiswaDataController::class, 'filters']);
            Route::get('/export', [\App\Http\Controllers\Api\DataUnila\MahasiswaDataController::class, 'export']);
            Route::get('/{id}', [\App\Http\Controllers\Api\DataUnila\MahasiswaDataController::class, 'show']);
        });
    });
});
