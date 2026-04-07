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
            // Read operations (no permission middleware)
            Route::get('jenis-layanan', [\App\Http\Controllers\Api\MasterData\JenisLayananController::class, 'index']);
            Route::get('jenis-layanan/{id}', [\App\Http\Controllers\Api\MasterData\JenisLayananController::class, 'show']);
            Route::get('jenis-layanan/{id}/persyaratan', [\App\Http\Controllers\Api\MasterData\JenisLayananController::class, 'persyaratan']);
            Route::get('jenis-layanan/{id}/tahapan', [\App\Http\Controllers\Api\MasterData\JenisLayananController::class, 'tahapan']);
            Route::get('persyaratan', [\App\Http\Controllers\Api\MasterData\PersyaratanController::class, 'index']);
            Route::get('persyaratan/{id}', [\App\Http\Controllers\Api\MasterData\PersyaratanController::class, 'show']);
            Route::get('tahapan', [\App\Http\Controllers\Api\MasterData\TahapanController::class, 'index']);
            Route::get('tahapan/{id}', [\App\Http\Controllers\Api\MasterData\TahapanController::class, 'show']);
            Route::get('template-dokumen', [\App\Http\Controllers\Api\MasterData\TemplateDokumenController::class, 'index']);
            Route::get('template-dokumen/{id}', [\App\Http\Controllers\Api\MasterData\TemplateDokumenController::class, 'show']);

            // Write operations (permission middleware)
            Route::post('jenis-layanan', [\App\Http\Controllers\Api\MasterData\JenisLayananController::class, 'store'])->middleware('permission:insert,sim-bak');
            Route::put('jenis-layanan/{id}', [\App\Http\Controllers\Api\MasterData\JenisLayananController::class, 'update'])->middleware('permission:update,sim-bak');
            Route::delete('jenis-layanan/{id}', [\App\Http\Controllers\Api\MasterData\JenisLayananController::class, 'destroy'])->middleware('permission:delete,sim-bak');

            Route::post('persyaratan', [\App\Http\Controllers\Api\MasterData\PersyaratanController::class, 'store'])->middleware('permission:insert,sim-bak');
            Route::put('persyaratan/{id}', [\App\Http\Controllers\Api\MasterData\PersyaratanController::class, 'update'])->middleware('permission:update,sim-bak');
            Route::delete('persyaratan/{id}', [\App\Http\Controllers\Api\MasterData\PersyaratanController::class, 'destroy'])->middleware('permission:delete,sim-bak');

            Route::post('tahapan', [\App\Http\Controllers\Api\MasterData\TahapanController::class, 'store'])->middleware('permission:insert,sim-bak');
            Route::put('tahapan/{id}', [\App\Http\Controllers\Api\MasterData\TahapanController::class, 'update'])->middleware('permission:update,sim-bak');
            Route::delete('tahapan/{id}', [\App\Http\Controllers\Api\MasterData\TahapanController::class, 'destroy'])->middleware('permission:delete,sim-bak');

            Route::post('template-dokumen', [\App\Http\Controllers\Api\MasterData\TemplateDokumenController::class, 'store'])->middleware('permission:insert,sim-bak');
            Route::put('template-dokumen/{id}', [\App\Http\Controllers\Api\MasterData\TemplateDokumenController::class, 'update'])->middleware('permission:update,sim-bak');
            Route::delete('template-dokumen/{id}', [\App\Http\Controllers\Api\MasterData\TemplateDokumenController::class, 'destroy'])->middleware('permission:delete,sim-bak');
        });

        // -----------------------------------------
        // Referensi: data dari PDUT (dropdown)
        // -----------------------------------------
        Route::prefix('layanan/referensi')->group(function () {
            Route::get('/fakultas', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'refFakultas']);
            Route::get('/prodi', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'refProdi']);
            Route::get('/semester', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'refSemester']);
        });

        // -----------------------------------------
        // Layanan: Pengajuan (mahasiswa)
        // -----------------------------------------
        Route::prefix('layanan')->group(function () {
            Route::get('/my-profile', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'myProfile']);
            Route::get('/my-pengajuan', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'myPengajuan']);
            Route::get('/pengajuan/{id}', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'show']);
            Route::get('/dokumen/{id}/download', [\App\Http\Controllers\Api\Layanan\DokumenController::class, 'download']);
            Route::get('/dokumen-hasil/{id}/download', [\App\Http\Controllers\Api\Layanan\DokumenController::class, 'downloadHasil']);

            Route::post('/pengajuan', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'store'])->middleware('permission:insert,sim-bak');
            Route::post('/pengajuan/{id}/upload', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'uploadDokumen'])->middleware('permission:insert,sim-bak');
            Route::post('/pengajuan/{id}/ajukan', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'ajukan'])->middleware('permission:insert,sim-bak');
            Route::delete('/dokumen/{id}', [\App\Http\Controllers\Api\Layanan\DokumenController::class, 'destroy'])->middleware('permission:delete,sim-bak');
            Route::delete('/pengajuan/{id}', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'destroy'])->middleware('permission:delete,sim-bak');
        });

        // -----------------------------------------
        // Admin: Verifikasi & Penerbitan
        // -----------------------------------------
        Route::prefix('admin')->group(function () {
            Route::get('/pengajuan', [\App\Http\Controllers\Api\Layanan\PengajuanController::class, 'index']);
            Route::get('/pengajuan/{id}/progress', [\App\Http\Controllers\Api\Layanan\VerifikasiController::class, 'progress']);
            Route::post('/pengajuan/{id}/verifikasi', [\App\Http\Controllers\Api\Layanan\VerifikasiController::class, 'verifikasi'])->middleware('permission:approve,sim-bak');
            Route::post('/pengajuan/{id}/perbaikan', [\App\Http\Controllers\Api\Layanan\VerifikasiController::class, 'mintaPerbaikan'])->middleware('permission:reject,sim-bak');
            Route::post('/pengajuan/{id}/terbitkan', [\App\Http\Controllers\Api\Layanan\VerifikasiController::class, 'terbitkan'])->middleware('permission:approve,sim-bak');
        });

        // -----------------------------------------
        // Approval: Persetujuan pejabat
        // -----------------------------------------
        Route::prefix('approval')->group(function () {
            Route::get('/queue', [\App\Http\Controllers\Api\Layanan\PersetujuanController::class, 'queue']);
            Route::post('/{id}/approve', [\App\Http\Controllers\Api\Layanan\PersetujuanController::class, 'approve'])->middleware('permission:approve,sim-bak');
            Route::post('/{id}/reject', [\App\Http\Controllers\Api\Layanan\PersetujuanController::class, 'reject'])->middleware('permission:reject,sim-bak');
            Route::post('/{id}/terima-tujuan', [\App\Http\Controllers\Api\Layanan\PersetujuanController::class, 'terimaTujuan'])->middleware('permission:approve,sim-bak');
        });

        // -----------------------------------------
        // Batch Administrasi (admin)
        // -----------------------------------------
        Route::prefix('batch')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Batch\BatchController::class, 'index']);
            Route::get('/preview-candidates', [\App\Http\Controllers\Api\Batch\BatchController::class, 'previewCandidates']);
            Route::get('/{id}', [\App\Http\Controllers\Api\Batch\BatchController::class, 'show']);
            Route::get('/{id}/kandidat', [\App\Http\Controllers\Api\Batch\BatchController::class, 'candidates']);

            Route::post('/', [\App\Http\Controllers\Api\Batch\BatchController::class, 'store'])->middleware('permission:insert,sim-bak');
            Route::post('/{id}/pull-candidates', [\App\Http\Controllers\Api\Batch\BatchController::class, 'pullCandidates'])->middleware('permission:insert,sim-bak');
            Route::post('/{id}/upload-sk-dekan', [\App\Http\Controllers\Api\Batch\BatchController::class, 'uploadSkDekan'])->middleware('permission:approve,sim-bak');
            Route::post('/kandidat/{id}/verifikasi', [\App\Http\Controllers\Api\Batch\BatchController::class, 'verifikasiKandidat'])->middleware('permission:approve,sim-bak');
            Route::post('/{id}/finalize', [\App\Http\Controllers\Api\Batch\BatchController::class, 'finalize'])->middleware('permission:approve,sim-bak');
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
            Route::get('/stats', [\App\Http\Controllers\Api\Dashboard\MonitoringController::class, 'stats']);
            Route::get('/mahasiswa-aktif', [\App\Http\Controllers\Api\Dashboard\MonitoringController::class, 'mahasiswaAktif']);
            Route::get('/lulusan', [\App\Http\Controllers\Api\Dashboard\MonitoringController::class, 'lulusan']);
            Route::get('/export', [\App\Http\Controllers\Api\Dashboard\MonitoringController::class, 'export']);
        });
    });
});
