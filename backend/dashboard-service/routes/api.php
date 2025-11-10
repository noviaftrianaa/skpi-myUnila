<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UniversityProfileController;
use App\Http\Controllers\UserFavoriteController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\OpenApi\ProgramStudiController;
use App\Http\Controllers\OpenApi\UnilaStatisticsController;
use App\Http\Controllers\OpenApi\UnilaProfileController;
use App\Http\Controllers\OpenApi\MahasiswaSebaranController;
use App\Http\Controllers\OpenApi\DosenController;
use App\Http\Controllers\OpenApi\DosenProfileController;
use App\Http\Controllers\OpenApi\DosenSebaranController;
use App\Http\Controllers\OpenApi\MahasiswaProfileController;
use App\Http\Controllers\OpenApi\PublikasiController;
use App\Http\Controllers\OpenApi\PublikasiSebaranController;
use App\Http\Controllers\OpenApi\PenelitianController;
use App\Http\Controllers\OpenApi\PenelitianSebaranController;
use App\Http\Controllers\PenelitianDetailController;
use App\Http\Controllers\PengabdianDetailController;
use App\Http\Controllers\PublikasiDetailController;
use App\Http\Controllers\OpenApi\KelulusanController;
use App\Http\Controllers\OpenApi\CapaianLulusanController;
use App\Http\Controllers\OpenApi\BidangIlmuController;
use App\Http\Controllers\BidangIlmuDetailController;
use App\Http\Controllers\SurveyController;
use App\Http\Controllers\SearchController;

/*
|--------------------------------------------------------------------------
| API Routes - Dashboard Service
|--------------------------------------------------------------------------
|
| Public dashboard service routes
| Base URL: /api (configured in bootstrap/app.php)
|
*/

// Health check
Route::get('/health', function () {
    return response()->json([
        'service' => 'Dashboard Service',
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String(),
        'version' => '1.0.0'
    ]);
});

// API version 1
Route::prefix('v1')->group(function () {

    // ============================================
    // Public routes (no authentication required)
    // ============================================

    // University Profile
    Route::get('/university-profile', [UniversityProfileController::class, 'index']);
    Route::get('/university-profile/quick-facts', [UniversityProfileController::class, 'quickFacts']);
    Route::get('/university-profile/contact', [UniversityProfileController::class, 'contact']);

    // University Rankings - World Class University Rankings
    Route::prefix('rankings')->group(function () {
        Route::get('/latest', [RankingController::class, 'getLatestRankings']);
        Route::get('/chart', [RankingController::class, 'getChartData']);
        Route::get('/categories', [RankingController::class, 'getCategories']);
        Route::get('/statistics', [RankingController::class, 'getStatistics']);
        Route::get('/{categoryCode}', [RankingController::class, 'getRankingByCategory']);
        Route::get('/{categoryCode}/history', [RankingController::class, 'getRankingHistory']);
    });

    // Program Studi
    Route::prefix('program-studi')->group(function () {
        Route::get('/', [ProgramStudiController::class, 'index']);
        Route::get('/statistics', [ProgramStudiController::class, 'statistics']);
        Route::get('/periods', [ProgramStudiController::class, 'periods']);
        Route::get('/filter-options', [ProgramStudiController::class, 'filterOptions']);
        Route::get('/{id}', [ProgramStudiController::class, 'show']);
        Route::get('/{id}/dosen', [ProgramStudiController::class, 'dosen']);
        Route::get('/{id}/mahasiswa-trend', [ProgramStudiController::class, 'mahasiswaTrend']);
        Route::get('/{id}/kurikulum', [ProgramStudiController::class, 'kurikulum']);
        Route::get('/{id}/tracer-study', [ProgramStudiController::class, 'tracerStudy']);
        Route::get('/kurikulum/{id_kurikulum}/mata-kuliah', [ProgramStudiController::class, 'mataKuliahByKurikulum']);
    });

    // Universitas Lampung
    Route::prefix('unila')->group(function () {
        Route::get('/statistics', [UnilaStatisticsController::class, 'index']);
        Route::get('/profile', [UnilaProfileController::class, 'index']);
    });

    // Mahasiswa Sebaran
    Route::prefix('mahasiswa-sebaran')->group(function () {
        Route::get('/kabupaten', [MahasiswaSebaranController::class, 'getSebaranByKabupaten']);
        Route::get('/provinsi', [MahasiswaSebaranController::class, 'getSebaranByProvinsi']);
        Route::get('/fakultas', [MahasiswaSebaranController::class, 'getSebaranByFakultas']);
        Route::get('/fakultas/{id_fakultas}/prodi', [MahasiswaSebaranController::class, 'getSebaranByProdiInFakultas']);
        Route::get('/statistics', [MahasiswaSebaranController::class, 'getSebaranStatistics']);
    });

    // Mahasiswa Profile
    Route::prefix('mahasiswa')->group(function () {
        Route::get('/{id}', [MahasiswaProfileController::class, 'show']);
    });

    // Dosen
    Route::prefix('dosen')->group(function () {
        Route::get('/pendidikan', [DosenController::class, 'getDosenByJenjangPendidikan']);
        Route::get('/jabatan', [DosenController::class, 'getDosenByJabatanFungsional']);
        Route::get('/statistics', [DosenController::class, 'getStatistics']);
        // Bidang Ilmu - must be before /{id} to avoid conflict
        Route::get('/bidang-ilmu/{id_sdm}', [BidangIlmuController::class, 'getByIdSdm']);
        // Dosen Profile
        Route::get('/{id}', [DosenProfileController::class, 'show']);
    });

    // Dosen Sebaran
    Route::prefix('dosen-sebaran')->group(function () {
        Route::get('/fakultas', [DosenSebaranController::class, 'getSebaranByFakultas']);
        Route::get('/fakultas/{id_fakultas}/prodi', [DosenSebaranController::class, 'getSebaranByProdiInFakultas']);
    });

    // Publikasi
    Route::prefix('publikasi')->group(function () {
        Route::get('/statistics', [PublikasiController::class, 'getStatistics']);
        Route::get('/{id}', [PublikasiDetailController::class, 'show']);
    });

    // Publikasi Sebaran
    Route::prefix('publikasi-sebaran')->group(function () {
        Route::get('/fakultas', [PublikasiSebaranController::class, 'getSebaranByFakultas']);
        Route::get('/fakultas/{id_fakultas}/prodi', [PublikasiSebaranController::class, 'getSebaranByProdiInFakultas']);
    });

    // Penelitian
    Route::prefix('penelitian')->group(function () {
        Route::get('/statistics', [PenelitianController::class, 'getStatistics']);
        Route::get('/{id}', [PenelitianDetailController::class, 'show']);
    });

    // Penelitian Sebaran
    Route::prefix('penelitian-sebaran')->group(function () {
        Route::get('/fakultas', [PenelitianSebaranController::class, 'getSebaranByFakultas']);
        Route::get('/fakultas/{id_fakultas}/prodi', [PenelitianSebaranController::class, 'getSebaranByProdiInFakultas']);
    });

    // Pengabdian
    Route::prefix('pengabdian')->group(function () {
        Route::get('/{id}', [PengabdianDetailController::class, 'show']);
    });

    // Bidang Ilmu
    Route::prefix('bidang-ilmu')->group(function () {
        Route::get('/search', [BidangIlmuDetailController::class, 'search']);
        Route::get('/{id}', [BidangIlmuDetailController::class, 'show']);
    });

    // Kelulusan
    Route::prefix('kelulusan')->group(function () {
        Route::get('/statistics', [KelulusanController::class, 'getStatistics']);
    });

    // Capaian Lulusan (Tracer Study)
    Route::prefix('capaian-lulusan')->group(function () {
        Route::get('/statistics', [CapaianLulusanController::class, 'getStatistics']);
    });

    // Survey
    Route::prefix('survey')->group(function () {
        Route::get('/{slug}', [SurveyController::class, 'getSurvey']);
        Route::post('/{slug}/submit', [SurveyController::class, 'submitSurvey']);
        Route::get('/{slug}/statistics', [SurveyController::class, 'getStatistics']);
        Route::get('/{slug}/analytics/{questionCode}', [SurveyController::class, 'getQuestionAnalytics']);
    });

    // Global Search
    Route::prefix('search')->group(function () {
        // Global search across all categories
        Route::get('/', [SearchController::class, 'search']);

        // Search suggestions for autocomplete
        Route::get('/suggestions', [SearchController::class, 'suggestions']);

        // Category-specific search endpoints
        Route::get('/mahasiswa', [SearchController::class, 'searchMahasiswa']);
        Route::get('/dosen', [SearchController::class, 'searchDosen']);
        Route::get('/prodi', [SearchController::class, 'searchProdi']);
        Route::get('/penelitian', [SearchController::class, 'searchPenelitian']);
        Route::get('/publikasi', [SearchController::class, 'searchPublikasi']);
        Route::get('/pengabdian', [SearchController::class, 'searchPengabdian']);
        Route::get('/bidang-ilmu', [SearchController::class, 'searchBidangIlmu']);
    });

    // TODO: Add more public endpoints
    // Route::get('/news', [NewsController::class, 'index']);
    // Route::get('/announcements', [AnnouncementController::class, 'index']);
    // Route::get('/events', [EventController::class, 'index']);
    // Route::get('/galleries', [GalleryController::class, 'index']);

    // ============================================
    // Protected routes (requires JWT via Kong)
    // ============================================
    // Note: When accessed via Kong (http://localhost:9800/dashboard-service),
    // Kong will validate JWT token before forwarding request to this service.
    // The TrustKong middleware will extract user info from Kong-injected headers.

    Route::middleware(['trust-kong'])->group(function () {
        // User Profile
        Route::get('/my-profile', [UserFavoriteController::class, 'profile']);

        // User Favorites
        Route::get('/my-favorites', [UserFavoriteController::class, 'index']);
        Route::post('/my-favorites', [UserFavoriteController::class, 'store']);
    });
});
