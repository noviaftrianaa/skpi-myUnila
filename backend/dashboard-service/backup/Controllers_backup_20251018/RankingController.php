<?php

namespace App\Http\Controllers;

use App\Services\RankingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *     name="University Rankings",
 *     description="World Class University Rankings for Universitas Lampung"
 * )
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
     * @OA\Get(
     *     path="/api/v1/rankings/latest",
     *     tags={"University Rankings"},
     *     summary="Get latest rankings",
     *     description="Retrieve latest rankings for all categories (GreenMetric, QS, THE, Webometrics)",
     *     @OA\Response(
     *         response=200,
     *         description="Latest rankings retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
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
     * @OA\Get(
     *     path="/api/v1/rankings/chart",
     *     tags={"University Rankings"},
     *     summary="Get chart data",
     *     description="Retrieve ranking data formatted for chart visualization",
     *     @OA\Parameter(
     *         name="start_year",
     *         in="query",
     *         description="Start year (default: current year - 3)",
     *         required=false,
     *         @OA\Schema(type="integer", example=2022)
     *     ),
     *     @OA\Parameter(
     *         name="end_year",
     *         in="query",
     *         description="End year (default: current year)",
     *         required=false,
     *         @OA\Schema(type="integer", example=2025)
     *     ),
     *     @OA\Parameter(
     *         name="category",
     *         in="query",
     *         description="Filter by category code",
     *         required=false,
     *         @OA\Schema(type="string", enum={"greenmetric", "qs", "the", "webometrics"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Chart data retrieved successfully"
     *     )
     * )
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
     * @OA\Get(
     *     path="/api/v1/rankings/{categoryCode}",
     *     tags={"University Rankings"},
     *     summary="Get ranking by category",
     *     description="Retrieve latest ranking for a specific category",
     *     @OA\Parameter(
     *         name="categoryCode",
     *         in="path",
     *         description="Category code (greenmetric, qs, the, or webometrics)",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Ranking retrieved successfully"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Ranking not found"
     *     )
     * )
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
     * @OA\Get(
     *     path="/api/v1/rankings/{categoryCode}/history",
     *     tags={"University Rankings"},
     *     summary="Get ranking history",
     *     description="Retrieve historical ranking data for a specific category",
     *     @OA\Parameter(
     *         name="categoryCode",
     *         in="path",
     *         description="Category code",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="History retrieved successfully"
     *     )
     * )
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
     * @OA\Get(
     *     path="/api/v1/rankings/categories",
     *     tags={"University Rankings"},
     *     summary="Get all categories",
     *     description="Retrieve list of all ranking categories",
     *     @OA\Response(
     *         response=200,
     *         description="Categories retrieved successfully"
     *     )
     * )
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
     * @OA\Get(
     *     path="/api/v1/rankings/statistics",
     *     tags={"University Rankings"},
     *     summary="Get ranking statistics",
     *     description="Retrieve statistical summary of rankings",
     *     @OA\Response(
     *         response=200,
     *         description="Statistics retrieved successfully"
     *     )
     * )
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
