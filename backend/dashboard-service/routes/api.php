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

        // Dosen & SDM
        Route::prefix('dosen')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\DataUnila\DosenDataController::class, 'index']);
            Route::get('/stats', [\App\Http\Controllers\Api\DataUnila\DosenDataController::class, 'stats']);
            Route::get('/export', [\App\Http\Controllers\Api\DataUnila\DosenDataController::class, 'export']);
            Route::get('/{id}', [\App\Http\Controllers\Api\DataUnila\DosenDataController::class, 'show']);
        });

        // Tridarma (Litabmas + Publikasi + Prestasi)
        Route::prefix('tridarma')->group(function () {
            Route::get('/litabmas', [\App\Http\Controllers\Api\DataUnila\TridarmaDataController::class, 'litabmas']);
            Route::get('/litabmas/stats', [\App\Http\Controllers\Api\DataUnila\TridarmaDataController::class, 'litabmasStats']);
            Route::get('/publikasi', [\App\Http\Controllers\Api\DataUnila\TridarmaDataController::class, 'publikasi']);
            Route::get('/publikasi/stats', [\App\Http\Controllers\Api\DataUnila\TridarmaDataController::class, 'publikasiStats']);
            Route::get('/prestasi', [\App\Http\Controllers\Api\DataUnila\TridarmaDataController::class, 'prestasi']);
        });

        // Akademik (Prodi, Akreditasi, Matkul)
        Route::prefix('akademik')->group(function () {
            Route::get('/prodi', [\App\Http\Controllers\Api\DataUnila\AkademikDataController::class, 'prodi']);
            Route::get('/akreditasi', [\App\Http\Controllers\Api\DataUnila\AkademikDataController::class, 'akreditasi']);
            Route::get('/matkul', [\App\Http\Controllers\Api\DataUnila\AkademikDataController::class, 'matkul']);
        });

        // Kerjasama
        Route::prefix('kerjasama')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\DataUnila\KerjasamaDataController::class, 'index']);
            Route::get('/stats', [\App\Http\Controllers\Api\DataUnila\KerjasamaDataController::class, 'stats']);
        });

        // Tracer Study
        Route::prefix('tracer')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\DataUnila\TracerDataController::class, 'index']);
            Route::get('/stats', [\App\Http\Controllers\Api\DataUnila\TracerDataController::class, 'stats']);
        });
    });
});
