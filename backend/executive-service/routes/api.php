<?php

use App\Http\Controllers\AkreditasiController;
use App\Http\Controllers\RasioController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\JabFungController;
use App\Http\Controllers\JenjangPendidikanController;
use App\Http\Controllers\IkatanKerjaController;
use App\Http\Controllers\JenisKelaminController;
use App\Http\Controllers\PangGolController;
use App\Http\Controllers\StatusKepegawaianController;

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
        Route::get('/fakultas/historical', [RasioController::class, 'getRasioFakultasHistorical']);
        Route::get('/prodi/historical', [RasioController::class, 'getRasioProdiHistorical']);
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
            Route::get('/fakultas/historical', [JabFungController::class, 'getJabfungFakultasHistorical']);
            Route::get('/fakultas/{idFakultas}', [JabFungController::class, 'getJabfungProdi']);
            Route::get('/prodi/historical', [JabFungController::class, 'getJabfungProdiHistorical']);

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
            Route::get('/fakultas/historical', [JenjangPendidikanController::class, 'getJenjangFakultasHistorical']);
            Route::get('/fakultas/{idFakultas}', [JenjangPendidikanController::class, 'getJenjangProdi']);
            Route::get('/fakultas/{fakultasId}/historical', [JenjangPendidikanController::class, 'getJenjangProdiHistorical']);

            // Detail data with pagination
            Route::get('/data', [JenjangPendidikanController::class, 'getDataDosen']);
        });

        Route::prefix('pangkat-golongan')->group(function () {
            // Master data routes
            Route::get('/master/tahun-ajaran', [PangGolController::class, 'getTahunAjaranList']);
            Route::get('/master/fakultas', [PangGolController::class, 'getFakultasList']);
            Route::get('/master/prodi', [PangGolController::class, 'getProdiList']);

            // Pangkat golongan data routes
            Route::get('/fakultas', [PangGolController::class, 'getPangkatGolonganFakultas']);
            Route::get('/fakultas/{idFakultas}', [PangGolController::class, 'getPangkatGolonganProdi']);

            // Detail data with pagination
            Route::get('/data', [PangGolController::class, 'getDataDosen']);
        });

        Route::prefix('ikatan-kerja')->group(function () {
            // Master data routes
            Route::get('/master/tahun-ajaran', [IkatanKerjaController::class, 'getTahunAjaranList']);
            Route::get('/master/fakultas', [IkatanKerjaController::class, 'getFakultasList']);
            Route::get('/master/prodi', [IkatanKerjaController::class, 'getProdiList']);

            // Ikatan kerja data routes
            Route::get('/fakultas', [IkatanKerjaController::class, 'getIkatanKerjaFakultas']);
            Route::get('/fakultas/historical', [IkatanKerjaController::class, 'getIkatanKerjaFakultasHistorical']);
            Route::get('/fakultas/{idFakultas}', [IkatanKerjaController::class, 'getIkatanKerjaProdi']);
            Route::get('/prodi/historical', [IkatanKerjaController::class, 'getIkatanKerjaProdiHistorical']);

            // Detail data with pagination
            Route::get('/data', [IkatanKerjaController::class, 'getDataDosen']);
        });

        Route::prefix('jenis-kelamin')->group(function () {
            // Master data routes
            Route::get('/master/tahun-ajaran', [JenisKelaminController::class, 'getTahunAjaranList']);
            Route::get('/master/fakultas', [JenisKelaminController::class, 'getFakultasList']);
            Route::get('/master/prodi', [JenisKelaminController::class, 'getProdiList']);

            // Jenis kelamin data routes
            Route::get('/fakultas', [JenisKelaminController::class, 'getJenisKelaminFakultas']);
            Route::get('/fakultas/historical', [JenisKelaminController::class, 'getJenisKelaminFakultasHistorical']);
            Route::get('/fakultas/{idFakultas}', [JenisKelaminController::class, 'getJenisKelaminProdi']);
            Route::get('/fakultas/{idFakultas}/historical', [JenisKelaminController::class, 'getJenisKelaminProdiHistorical']);

            // Detail data with pagination
            Route::get('/data', [JenisKelaminController::class, 'getDataDosen']);
        });

        Route::prefix('status-kepegawaian')->group(function () {
            // Master data routes
            Route::get('/master/tahun-ajaran', [StatusKepegawaianController::class, 'getTahunAjaranList']);
            Route::get('/master/fakultas', [StatusKepegawaianController::class, 'getFakultasList']);
            Route::get('/master/prodi', [StatusKepegawaianController::class, 'getProdiList']);

            // Status kepegawaian data routes
            Route::get('/fakultas', [StatusKepegawaianController::class, 'getStatusKepegawaianFakultas']);
            Route::get('/fakultas/historical', [StatusKepegawaianController::class, 'getStatusKepegawaianFakultasHistorical']);
            Route::get('/fakultas/{idFakultas}', [StatusKepegawaianController::class, 'getStatusKepegawaianProdi']);
            Route::get('/fakultas/{idFakultas}/historical', [StatusKepegawaianController::class, 'getStatusKepegawaianProdiHistorical']);

            // Detail data with pagination
            Route::get('/data', [StatusKepegawaianController::class, 'getDataDosen']);
        });
    });
});
