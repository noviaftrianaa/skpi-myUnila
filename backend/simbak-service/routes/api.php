<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;

/*
|--------------------------------------------------------------------------
| API Routes - BAK Service (SIMBAK)
|--------------------------------------------------------------------------
|
| Layanan administrasi kemahasiswaan BAK
| Base URL: /api (configured in bootstrap/app.php)
|
| Structure:
| - /api/health                          - Health check (public)
| - /api/v1/master-data/*                - Master data CRUD (admin)
| - /api/v1/layanan/*                    - Pengajuan layanan (mahasiswa + admin)
| - /api/v1/admin/*                      - Admin verifikasi & penerbitan
| - /api/v1/approval/*                   - Persetujuan pejabat
| - /api/v1/batch/*                      - Batch administrasi (admin)
| - /api/v1/dashboard/*                  - Dashboard & statistik
| - /api/v1/monitoring/*                 - Monitoring mahasiswa
|
*/

// Health check (public)
Route::get('/health', [HealthController::class, 'check']);

// API version 1
Route::prefix('v1')->group(function () {

    // =========================================
    // PUBLIC: Daftar jenis layanan yang tersedia
    // =========================================
    Route::get('/layanan/jenis-layanan', [
        \App\Http\Controllers\Api\MasterData\JenisLayananController::class, 'publicList'
    ]);

    // =========================================
    // PROTECTED: Semua endpoint butuh JWT auth
    // =========================================
    Route::middleware(['jwt.auth'])->group(function () {

        // -----------------------------------------
        // Master Data (admin only)
        // -----------------------------------------
        Route::prefix('master-data')->group(function () {
            Route::apiResource('jenis-layanan', \App\Http\Controllers\Api\MasterData\JenisLayananController::class);
            Route::get('jenis-layanan/{id}/persyaratan', [\App\Http\Controllers\Api\MasterData\JenisLayananController::class, 'persyaratan']);
            Route::get('jenis-layanan/{id}/tahapan', [\App\Http\Controllers\Api\MasterData\JenisLayananController::class, 'tahapan']);

            Route::apiResource('persyaratan', \App\Http\Controllers\Api\MasterData\PersyaratanController::class);
            Route::apiResource('tahapan', \App\Http\Controllers\Api\MasterData\TahapanController::class);
            Route::apiResource('template-dokumen', \App\Http\Controllers\Api\MasterData\TemplateDokumenController::class);
        });

        // -----------------------------------------
        // Layanan: Pengajuan (mahasiswa)
        // -----------------------------------------
        Route::prefix('layanan')->group(function () {
            Route::get('/my-pengajuan', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'myPengajuan']);
            Route::post('/pengajuan', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'store']);
            Route::get('/pengajuan/{id}', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'show']);
            Route::post('/pengajuan/{id}/upload', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'uploadDokumen']);
            Route::post('/pengajuan/{id}/ajukan', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'ajukan']);
            Route::get('/dokumen/{id}/download', [\App\Http\Controllers\Api\Layanan\DokumenController::class, 'download']);
            Route::get('/dokumen-hasil/{id}/download', [\App\Http\Controllers\Api\Layanan\DokumenController::class, 'downloadHasil']);
            Route::delete('/dokumen/{id}', [\App\Http\Controllers\Api\Layanan\DokumenController::class, 'destroy']);
        });

        // -----------------------------------------
        // Admin: Verifikasi & Penerbitan
        // -----------------------------------------
        Route::prefix('admin')->group(function () {
            Route::get('/pengajuan', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'index']);
            Route::post('/pengajuan/{id}/verifikasi', [\App\Http\Controllers\Api\Layanan\VerifikasiController::class, 'verifikasi']);
            Route::post('/pengajuan/{id}/perbaikan', [\App\Http\Controllers\Api\Layanan\VerifikasiController::class, 'mintaPerbaikan']);
            Route::post('/pengajuan/{id}/terbitkan', [\App\Http\Controllers\Api\Layanan\VerifikasiController::class, 'terbitkan']);
        });

        // -----------------------------------------
        // Approval: Persetujuan pejabat
        // -----------------------------------------
        Route::prefix('approval')->group(function () {
            Route::get('/queue', [\App\Http\Controllers\Api\Layanan\PersetujuanController::class, 'queue']);
            Route::post('/{id}/approve', [\App\Http\Controllers\Api\Layanan\PersetujuanController::class, 'approve']);
            Route::post('/{id}/reject', [\App\Http\Controllers\Api\Layanan\PersetujuanController::class, 'reject']);
        });

        // -----------------------------------------
        // Batch Administrasi (admin)
        // -----------------------------------------
        Route::prefix('batch')->group(function () {
            Route::post('/', [\App\Http\Controllers\Api\Batch\BatchController::class, 'store']);
            Route::get('/', [\App\Http\Controllers\Api\Batch\BatchController::class, 'index']);
            Route::get('/{id}', [\App\Http\Controllers\Api\Batch\BatchController::class, 'show']);
            Route::get('/{id}/kandidat', [\App\Http\Controllers\Api\Batch\BatchController::class, 'candidates']);
            Route::post('/kandidat/{id}/verifikasi', [\App\Http\Controllers\Api\Batch\BatchController::class, 'verifikasiKandidat']);
            Route::post('/{id}/finalize', [\App\Http\Controllers\Api\Batch\BatchController::class, 'finalize']);
        });

        // -----------------------------------------
        // Dashboard & Statistik
        // -----------------------------------------
        Route::prefix('dashboard')->group(function () {
            Route::get('/overview', [\App\Http\Controllers\Api\Dashboard\DashboardController::class, 'overview']);
            Route::get('/sla', [\App\Http\Controllers\Api\Dashboard\DashboardController::class, 'sla']);
            Route::get('/activity-log', [\App\Http\Controllers\Api\Dashboard\DashboardController::class, 'activityLog']);
            Route::get('/trends', [\App\Http\Controllers\Api\Dashboard\DashboardController::class, 'trends']);
        });

        // -----------------------------------------
        // Monitoring Mahasiswa
        // -----------------------------------------
        Route::prefix('monitoring')->group(function () {
            Route::get('/mahasiswa-aktif', [\App\Http\Controllers\Api\Dashboard\MonitoringController::class, 'mahasiswaAktif']);
            Route::get('/lulusan', [\App\Http\Controllers\Api\Dashboard\MonitoringController::class, 'lulusan']);
            Route::get('/export', [\App\Http\Controllers\Api\Dashboard\MonitoringController::class, 'export']);
        });
    });
});
