<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\LookupController;
use App\Http\Controllers\Api\PrestasiMandiriController;

/*
|--------------------------------------------------------------------------
| API Routes - SI-Prestasi Service
|--------------------------------------------------------------------------
|
| Layanan pelaporan prestasi mahasiswa + integrasi SIMKATMAWA.
| Base URL: /api (configured in bootstrap/app.php)
|
| Phase 1 skeleton (scope sekarang):
|   - /api/health                          Health check (public)
|   - /api/lookup/mahasiswa                Lookup by NIM (JWT)
|   - /api/lookup/mahasiswa/search         Autocomplete (JWT)
|   - /api/lookup/dosen                    Lookup by NUPTK/NIDN (JWT)
|   - /api/lookup/dosen/search             Autocomplete (JWT)
|   - /api/lookup/fakultas                 List fakultas (JWT)
|
| Phase 1 berikutnya (batch 3):
|   - /api/v1/prestasi-mandiri             CRUD (admin)
|   - /api/v1/sertifikasi                  CRUD (admin)
|   - /api/v1/rekognisi                    CRUD (admin)
|   - /api/v1/master-data/*                Referensi (admin)
|   - /api/v1/master-data/api-config       setting.api_config (admin root)
|   - /api/v1/sync/*                       Submit + sync log (admin)
|   - /api/v1/files                        Upload dokumen
|
*/

// Health check (public, no JWT)
Route::get('/health', [HealthController::class, 'check']);

// JWT-protected routes (reuse jwt.auth middleware dari SIMBAK)
Route::middleware(['jwt.auth'])->group(function () {
    Route::prefix('lookup')->group(function () {
        Route::get('mahasiswa',          [LookupController::class, 'mahasiswaByNim']);
        Route::get('mahasiswa/search',   [LookupController::class, 'searchMahasiswa']);
        Route::get('dosen',              [LookupController::class, 'dosenByIdentifier']);
        Route::get('dosen/search',       [LookupController::class, 'searchDosen']);
        Route::get('fakultas',           [LookupController::class, 'listFakultas']);
    });

    Route::prefix('v1')->group(function () {
        // Prestasi Mandiri — CRUD + workflow transition
        Route::get('prestasi-mandiri',              [PrestasiMandiriController::class, 'index']);
        Route::get('prestasi-mandiri/{id}',         [PrestasiMandiriController::class, 'show']);
        Route::post('prestasi-mandiri',             [PrestasiMandiriController::class, 'store']);
        Route::put('prestasi-mandiri/{id}',         [PrestasiMandiriController::class, 'update']);
        Route::delete('prestasi-mandiri/{id}',      [PrestasiMandiriController::class, 'destroy']);
        Route::post('prestasi-mandiri/{id}/transition', [PrestasiMandiriController::class, 'transition']);

        // Phase 1 batch 3 berikutnya — Sertifikasi, Rekognisi, Master Data, Files, Sync:
        //   Route::apiResource('sertifikasi', SertifikasiController::class);
        //   Route::apiResource('rekognisi',   RekognisiController::class);
    });
});
