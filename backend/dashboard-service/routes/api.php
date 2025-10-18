<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UniversityProfileController;
use App\Http\Controllers\UserFavoriteController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\ProgramStudiController;

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
