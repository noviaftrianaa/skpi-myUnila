<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;

/*
|--------------------------------------------------------------------------
| API Routes - SI KKN Service
|--------------------------------------------------------------------------
|
| Sistem Informasi Kuliah Kerja Nyata Universitas Lampung
| Base URL: /api (configured in bootstrap/app.php)
|
| Roadmap (TODO):
| - /api/v1/master-data/*    - Periode, lokasi, wilayah, kriteria, dokumen, komponen penilaian
| - /api/v1/pendaftaran/*    - Registrasi peserta + verifikasi syarat
| - /api/v1/kelompok/*       - Kelompok KKN, anggota, DPL, pamong desa
| - /api/v1/kegiatan/*       - Kegiatan lapangan, logbook, bimbingan
| - /api/v1/penilaian/*      - Komponen penilaian, nilai akhir, sertifikat
| - /api/v1/dokumen/*        - Upload/download dokumen via MinIO
| - /api/v1/dashboard/*      - Statistik & monitoring
|
*/

// Health check (public)
Route::get('/health', [HealthController::class, 'check']);

// API version 1
Route::prefix('v1')->group(function () {

    // PROTECTED: Semua endpoint v1 butuh JWT auth
    Route::middleware(['jwt.auth'])->group(function () {

        // Stub — siap dikembangkan modul demi modul
        Route::get('/me', function (\Illuminate\Http\Request $r) {
            return response()->json([
                'success' => true,
                'message' => 'SI KKN Service is alive (auth OK)',
                'data' => $r->attributes->get('auth_user'),
            ]);
        });
    });
});
