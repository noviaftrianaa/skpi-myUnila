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
| Permission middleware syntax:
|   Route::post(...)->middleware('permission:insert,si-kkn')
|   Route::put( ...)->middleware('permission:update,si-kkn')
|   Route::delete(...)->middleware('permission:delete,si-kkn')
|   Route::post('approve/...')->middleware('permission:approve,si-kkn')
|
| App slug `si-kkn` perlu terdaftar di man_akses.aplikasi (pdut SQL Server),
| dan tiap pengguna harus punya entry di man_akses.role_pengguna untuk app ini.
|
*/

// Health check (public)
Route::get('/health', [HealthController::class, 'check']);

// API version 1
Route::prefix('v1')->group(function () {

    // PROTECTED: Semua endpoint v1 butuh JWT auth
    Route::middleware(['jwt.auth'])->group(function () {

        // Profile aktif user (debug + dipakai frontend untuk identitas)
        Route::get('/me', function (\Illuminate\Http\Request $r) {
            return response()->json([
                'success' => true,
                'message' => 'OK',
                'data' => $r->attributes->get('auth_user'),
            ]);
        });

        // ===========================================================
        // MASTER DATA — referensi periode/lokasi/wilayah/dokumen/dll
        // Semua read = JWT-only, write = permission insert/update/delete
        // ===========================================================
        Route::prefix('master-data')->group(function () {

            // Periode KKN  (REFERENSI: ini contoh CRUD lengkap, ikuti pattern ini)
            Route::get   ('/periode-kkn',       [\App\Http\Controllers\Api\MasterData\PeriodeKknController::class, 'index']);
            Route::get   ('/periode-kkn/{id}',  [\App\Http\Controllers\Api\MasterData\PeriodeKknController::class, 'show']);
            Route::post  ('/periode-kkn',       [\App\Http\Controllers\Api\MasterData\PeriodeKknController::class, 'store'])->middleware('permission:insert,si-kkn');
            Route::put   ('/periode-kkn/{id}',  [\App\Http\Controllers\Api\MasterData\PeriodeKknController::class, 'update'])->middleware('permission:update,si-kkn');
            Route::delete('/periode-kkn/{id}',  [\App\Http\Controllers\Api\MasterData\PeriodeKknController::class, 'destroy'])->middleware('permission:delete,si-kkn');

            // TODO (untuk tim magang) — duplikasi pattern di atas:
            // - /lokasi-kkn          (ref.lokasi_kkn)
            // - /wilayah-kkn         (ref.wilayah_kkn)
            // - /jenis-dokumen       (ref.jenis_dokumen)
            // - /komponen-penilaian  (ref.komponen_penilaian)
            // - /kriteria-pendaftaran(ref.kriteria_pendaftaran)
        });

        // ===========================================================
        // PENDAFTARAN — registrasi mhs + verifikasi
        // TODO: tim magang lanjutkan
        // ===========================================================
        // Route::prefix('pendaftaran')->group(function () { ... });

        // ===========================================================
        // KELOMPOK — kelompok, anggota, DPL, pamong
        // TODO: tim magang lanjutkan
        // ===========================================================
        // Route::prefix('kelompok')->group(function () { ... });

        // ===========================================================
        // KEGIATAN — program kerja, logbook, bimbingan, laporan, absensi
        // TODO: tim magang lanjutkan
        // ===========================================================
        // Route::prefix('kegiatan')->group(function () { ... });

        // ===========================================================
        // PENILAIAN — komponen, nilai mahasiswa, nilai akhir, sertifikat
        // TODO: tim magang lanjutkan
        // ===========================================================
        // Route::prefix('penilaian')->group(function () { ... });

        // ===========================================================
        // DOKUMEN — upload/download via MinIO
        // TODO: tim magang lanjutkan
        // ===========================================================
        // Route::prefix('dokumen')->group(function () { ... });

        // ===========================================================
        // DASHBOARD & MONITORING — statistik
        // TODO: tim magang lanjutkan
        // ===========================================================
        // Route::prefix('dashboard')->group(function () { ... });
    });
});
