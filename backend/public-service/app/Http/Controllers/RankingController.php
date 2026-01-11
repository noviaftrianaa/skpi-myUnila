<?php

namespace App\Http\Controllers;

use App\Services\RankingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

/**
 * Ranking Controller
 *
 * Handle World University Rankings endpoints
 * OpenAPI annotations are in App\Http\Controllers\OpenApi\RankingAnnotations
 */
class RankingController extends Controller
{
    protected $rankingService;

    public function __construct(RankingService $rankingService)
    {
        $this->rankingService = $rankingService;
    }

    /**
     * Get latest rankings for all categories
     *
     * @return JsonResponse
     */
    public function getLatestRankings(): JsonResponse
    {
        try {
            $rankings = $this->rankingService->getLatestRankings();

            return response()->json([
                'success' => true,
                'message' => 'Latest rankings retrieved successfully',
                'data' => [
                    'rankings' => $rankings,
                    'university' => 'Universitas Lampung',
                    'last_updated' => now()->toDateTimeString(),
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve latest rankings',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get ranking chart data for visualization
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getChartData(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'start_year' => 'nullable|integer|min:2020|max:2030',
                'end_year' => 'nullable|integer|min:2020|max:2030',
                'category' => 'nullable|string|in:greenmetric,qs,the,webometrics',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 400);
            }

            $startYear = $request->input('start_year', now()->year - 3);
            $endYear = $request->input('end_year', now()->year);
            $category = $request->input('category');

            $chartData = $this->rankingService->getChartData($startYear, $endYear, $category);

            return response()->json([
                'success' => true,
                'message' => 'Chart data retrieved successfully',
                'data' => $chartData,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve chart data',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get rankings by category
     *
     * @param string $categoryCode
     * @return JsonResponse
     */
    public function getRankingByCategory(string $categoryCode): JsonResponse
    {
        try {
            $validator = Validator::make(['category' => $categoryCode], [
                'category' => 'required|string|in:greenmetric,qs,the,webometrics',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid category code',
                    'errors' => $validator->errors(),
                ], 400);
            }

            $ranking = $this->rankingService->getRankingByCategory($categoryCode);

            if (!$ranking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ranking not found for this category',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Ranking retrieved successfully',
                'data' => $ranking,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve ranking',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get ranking history
     *
     * @param string $categoryCode
     * @return JsonResponse
     */
    public function getRankingHistory(string $categoryCode): JsonResponse
    {
        try {
            $validator = Validator::make(['category' => $categoryCode], [
                'category' => 'required|string|in:greenmetric,qs,the,webometrics',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid category code',
                    'errors' => $validator->errors(),
                ], 400);
            }

            $history = $this->rankingService->getRankingHistory($categoryCode);

            return response()->json([
                'success' => true,
                'message' => 'Ranking history retrieved successfully',
                'data' => [
                    'category' => $categoryCode,
                    'history' => $history,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve ranking history',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get all categories
     *
     * @return JsonResponse
     */
    public function getCategories(): JsonResponse
    {
        try {
            $categories = $this->rankingService->getCategories();

            return response()->json([
                'success' => true,
                'message' => 'Categories retrieved successfully',
                'data' => [
                    'categories' => $categories,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve categories',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get statistics
     *
     * @return JsonResponse
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $statistics = $this->rankingService->getStatistics();

            return response()->json([
                'success' => true,
                'message' => 'Statistics retrieved successfully',
                'data' => $statistics,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
