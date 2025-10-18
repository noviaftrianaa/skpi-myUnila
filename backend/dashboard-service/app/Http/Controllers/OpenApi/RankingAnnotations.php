<?php

namespace App\Http\Controllers\OpenApi;

/**
 * OpenAPI Annotations for Ranking Controller
 *
 * IMPORTANT: This file contains ONLY OpenAPI annotations.
 * The actual controller logic is in App\Http\Controllers\RankingController
 */
class RankingAnnotations
{
    /**
     * @OA\Get(
     *     path="/rankings/latest",
     *     summary="Get latest rankings for all categories",
     *     description="Retrieve the most recent ranking data for all 4 categories: GreenMetric, QS World, Times Higher Ed., and Webometrics",
     *     operationId="getLatestRankings",
     *     tags={"Rankings"},
     *     @OA\Response(
     *         response=200,
     *         description="Latest rankings retrieved successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Latest rankings retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="rankings",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(
     *                             property="category",
     *                             type="object",
     *                             @OA\Property(property="code", type="string", example="greenmetric"),
     *                             @OA\Property(property="name", type="string", example="GreenMetric"),
     *                             @OA\Property(property="full_name", type="string", example="UI GreenMetric World University Rankings"),
     *                             @OA\Property(property="icon", type="string", example="🌱"),
     *                             @OA\Property(property="color", type="string", example="emerald")
     *                         ),
     *                         @OA\Property(property="year", type="string", example="2024"),
     *                         @OA\Property(property="period", type="string", example="Annual"),
     *                         @OA\Property(
     *                             property="ranks",
     *                             type="object",
     *                             @OA\Property(property="world", type="string", example="215"),
     *                             @OA\Property(property="world_numeric", type="integer", example=215),
     *                             @OA\Property(property="national", type="integer", example=13),
     *                             @OA\Property(property="regional", type="integer", example=null, nullable=true)
     *                         ),
     *                         @OA\Property(property="score", type="number", format="float", example=null, nullable=true),
     *                         @OA\Property(property="change", type="integer", example=-13),
     *                         @OA\Property(property="trend", type="string", enum={"up", "down", "stable", "new"}, example="up"),
     *                         @OA\Property(property="source_url", type="string", example="https://greenmetric.ui.ac.id/"),
     *                         @OA\Property(property="last_updated", type="string", format="date-time")
     *                     )
     *                 ),
     *                 @OA\Property(property="university", type="string", example="Universitas Lampung"),
     *                 @OA\Property(property="last_updated", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     */
    public function getLatestRankings() {}

    /**
     * @OA\Get(
     *     path="/rankings/chart",
     *     summary="Get chart data for visualization",
     *     description="Retrieve ranking data for chart visualization with optional year range and category filter",
     *     operationId="getChartData",
     *     tags={"Rankings"},
     *     @OA\Parameter(
     *         name="start_year",
     *         in="query",
     *         description="Start year (default: 5 years ago)",
     *         required=false,
     *         @OA\Schema(type="integer", example=2020)
     *     ),
     *     @OA\Parameter(
     *         name="end_year",
     *         in="query",
     *         description="End year (default: current year)",
     *         required=false,
     *         @OA\Schema(type="integer", example=2025)
     *     ),
     *     @OA\Parameter(
     *         name="category_code",
     *         in="query",
     *         description="Filter by category code",
     *         required=false,
     *         @OA\Schema(type="string", enum={"greenmetric", "qs", "the", "webometrics"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Chart data retrieved successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Chart data retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="start_year", type="integer", example=2020),
     *                 @OA\Property(property="end_year", type="integer", example=2025),
     *                 @OA\Property(
     *                     property="categories",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(property="category", type="object"),
     *                         @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *                     )
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function getChartData() {}

    /**
     * @OA\Get(
     *     path="/rankings/{categoryCode}",
     *     summary="Get ranking by category",
     *     description="Retrieve latest ranking for a specific category",
     *     operationId="getRankingByCategory",
     *     tags={"Rankings"},
     *     @OA\Parameter(
     *         name="categoryCode",
     *         in="path",
     *         description="Category code",
     *         required=true,
     *         @OA\Schema(type="string", enum={"greenmetric", "qs", "the", "webometrics"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Ranking retrieved successfully"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Category not found"
     *     )
     * )
     */
    public function getRankingByCategory() {}

    /**
     * @OA\Get(
     *     path="/rankings/{categoryCode}/history",
     *     summary="Get ranking history",
     *     description="Retrieve historical ranking data for a specific category",
     *     operationId="getRankingHistory",
     *     tags={"Rankings"},
     *     @OA\Parameter(
     *         name="categoryCode",
     *         in="path",
     *         description="Category code",
     *         required=true,
     *         @OA\Schema(type="string", enum={"greenmetric", "qs", "the", "webometrics"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Ranking history retrieved successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="category", type="string", example="greenmetric"),
     *                 @OA\Property(
     *                     property="history",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(property="year", type="string", example="2024"),
     *                         @OA\Property(property="period", type="string", example="Annual"),
     *                         @OA\Property(property="world_rank", type="string", example="215"),
     *                         @OA\Property(property="world_rank_numeric", type="integer", example=215),
     *                         @OA\Property(property="national_rank", type="integer", example=13),
     *                         @OA\Property(property="score", type="number", format="float", nullable=true),
     *                         @OA\Property(property="change", type="integer", example=-13),
     *                         @OA\Property(property="trend", type="string", example="up"),
     *                         @OA\Property(property="updated_at", type="string", format="date-time")
     *                     )
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function getRankingHistory() {}

    /**
     * @OA\Get(
     *     path="/rankings/categories",
     *     summary="Get all ranking categories",
     *     description="Retrieve all active ranking categories (GreenMetric, QS, THE, Webometrics)",
     *     operationId="getCategories",
     *     tags={"Rankings"},
     *     @OA\Response(
     *         response=200,
     *         description="Categories retrieved successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Categories retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="categories",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(property="code", type="string", example="greenmetric"),
     *                         @OA\Property(property="name", type="string", example="GreenMetric"),
     *                         @OA\Property(property="full_name", type="string", example="UI GreenMetric World University Rankings"),
     *                         @OA\Property(property="website", type="string", example="https://greenmetric.ui.ac.id/"),
     *                         @OA\Property(property="description", type="string"),
     *                         @OA\Property(property="icon", type="string", example="🌱"),
     *                         @OA\Property(property="color", type="string", example="emerald")
     *                     )
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function getCategories() {}

    /**
     * @OA\Get(
     *     path="/rankings/statistics",
     *     summary="Get ranking statistics",
     *     description="Retrieve statistical summary of all rankings including overview and best performances",
     *     operationId="getStatistics",
     *     tags={"Rankings"},
     *     @OA\Response(
     *         response=200,
     *         description="Statistics retrieved successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Statistics retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="overview",
     *                     type="object",
     *                     @OA\Property(property="total_categories", type="string", example="4"),
     *                     @OA\Property(property="total_records", type="string", example="20"),
     *                     @OA\Property(
     *                         property="year_range",
     *                         type="object",
     *                         @OA\Property(property="start", type="string", example="2020"),
     *                         @OA\Property(property="end", type="string", example="2025")
     *                     ),
     *                     @OA\Property(
     *                         property="average_ranks",
     *                         type="object",
     *                         @OA\Property(property="world", type="integer", example=1200),
     *                         @OA\Property(property="national", type="integer", example=15)
     *                     )
     *                 ),
     *                 @OA\Property(
     *                     property="best_performances",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(property="category", type="string", example="GreenMetric"),
     *                         @OA\Property(property="best_world_rank", type="string", example="215"),
     *                         @OA\Property(property="best_national_rank", type="integer", example=13)
     *                     )
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function getStatistics() {}
}
