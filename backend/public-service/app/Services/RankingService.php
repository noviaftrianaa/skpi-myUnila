<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Ranking Service
 *
 * Business logic for World University Rankings
 * Categories: GreenMetric, QS World, Times Higher Ed., Webometrics
 */
class RankingService
{
    /**
     * Cache duration in seconds (6 hours)
     */
    const CACHE_DURATION = 21600;

    /**
     * Get latest rankings for all categories
     *
     * @return array
     */
    public function getLatestRankings(): array
    {
        return Cache::remember('rankings:latest', self::CACHE_DURATION, function () {
            $rankings = DB::select("
                SELECT
                    category_code,
                    category_name,
                    category_full_name,
                    icon,
                    color,
                    year,
                    period,
                    world_rank,
                    world_rank_numeric,
                    national_rank,
                    regional_rank,
                    overall_score,
                    rank_change,
                    trend,
                    source_url,
                    updated_at
                FROM ranking.vw_latest_rankings
                ORDER BY year DESC, category_code
            ");

            return array_map(function ($ranking) {
                return [
                    'category' => [
                        'code' => $ranking->category_code,
                        'name' => $ranking->category_name,
                        'full_name' => $ranking->category_full_name,
                        'icon' => $ranking->icon,
                        'color' => $ranking->color,
                    ],
                    'year' => $ranking->year,
                    'period' => $ranking->period,
                    'ranks' => [
                        'world' => $ranking->world_rank,
                        'world_numeric' => $ranking->world_rank_numeric,
                        'national' => $ranking->national_rank,
                        'regional' => $ranking->regional_rank,
                    ],
                    'score' => $ranking->overall_score ? (float) $ranking->overall_score : null,
                    'change' => $ranking->rank_change !== null ? (int) $ranking->rank_change : null,
                    'trend' => $ranking->trend,
                    'source_url' => $ranking->source_url,
                    'last_updated' => $ranking->updated_at,
                ];
            }, $rankings);
        });
    }

    /**
     * Get chart data for visualization
     *
     * @param int $startYear
     * @param int $endYear
     * @param string|null $categoryCode
     * @return array
     */
    public function getChartData(int $startYear, int $endYear, ?string $categoryCode = null): array
    {
        $cacheKey = "rankings:chart:{$startYear}:{$endYear}:" . ($categoryCode ?? 'all');

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($startYear, $endYear, $categoryCode) {
            $results = DB::select("
                EXEC ranking.sp_get_rankings_chart ?, ?, ?
            ", [$startYear, $endYear, $categoryCode]);

            // Group by category
            $chartData = [];
            foreach ($results as $row) {
                $code = $row->category_code;

                if (!isset($chartData[$code])) {
                    $chartData[$code] = [
                        'category' => [
                            'code' => $row->category_code,
                            'name' => $row->category_name,
                            'icon' => $row->icon,
                            'color' => $row->color,
                        ],
                        'data' => [],
                    ];
                }

                $chartData[$code]['data'][] = [
                    'year' => $row->year,
                    'period' => $row->period,
                    'world_rank' => $row->world_rank,
                    'world_rank_numeric' => $row->world_rank_numeric ? (int) $row->world_rank_numeric : null,
                    'national_rank' => $row->national_rank ? (int) $row->national_rank : null,
                    'score' => $row->overall_score ? (float) $row->overall_score : null,
                    'change' => $row->rank_change !== null ? (int) $row->rank_change : null,
                    'trend' => $row->trend,
                ];
            }

            return [
                'start_year' => $startYear,
                'end_year' => $endYear,
                'categories' => array_values($chartData),
            ];
        });
    }

    /**
     * Get ranking by specific category
     *
     * @param string $categoryCode
     * @return array|null
     */
    public function getRankingByCategory(string $categoryCode): ?array
    {
        $cacheKey = "rankings:category:{$categoryCode}";

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($categoryCode) {
            $ranking = DB::selectOne("
                SELECT
                    category_code,
                    category_name,
                    category_full_name,
                    icon,
                    color,
                    year,
                    period,
                    world_rank,
                    world_rank_numeric,
                    national_rank,
                    regional_rank,
                    overall_score,
                    rank_change,
                    trend,
                    source_url,
                    updated_at
                FROM ranking.vw_latest_rankings
                WHERE category_code = ?
            ", [$categoryCode]);

            if (!$ranking) {
                return null;
            }

            return [
                'category' => [
                    'code' => $ranking->category_code,
                    'name' => $ranking->category_name,
                    'full_name' => $ranking->category_full_name,
                    'icon' => $ranking->icon,
                    'color' => $ranking->color,
                ],
                'year' => $ranking->year,
                'period' => $ranking->period,
                'ranks' => [
                    'world' => $ranking->world_rank,
                    'world_numeric' => $ranking->world_rank_numeric,
                    'national' => $ranking->national_rank,
                    'regional' => $ranking->regional_rank,
                ],
                'score' => $ranking->overall_score ? (float) $ranking->overall_score : null,
                'change' => $ranking->rank_change !== null ? (int) $ranking->rank_change : null,
                'trend' => $ranking->trend,
                'source_url' => $ranking->source_url,
                'last_updated' => $ranking->updated_at,
            ];
        });
    }

    /**
     * Get ranking history for a category
     *
     * @param string $categoryCode
     * @return array
     */
    public function getRankingHistory(string $categoryCode): array
    {
        $cacheKey = "rankings:history:{$categoryCode}";

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($categoryCode) {
            $history = DB::select("
                SELECT
                    r.year,
                    r.period,
                    r.world_rank,
                    r.world_rank_numeric,
                    r.national_rank,
                    r.overall_score,
                    r.rank_change,
                    r.trend,
                    r.updated_at
                FROM ranking.university_rankings r
                INNER JOIN ranking.categories c ON r.category_id = c.id
                WHERE c.code = ? AND c.is_active = 1
                ORDER BY r.year DESC, r.period DESC
            ", [$categoryCode]);

            return array_map(function ($item) {
                return [
                    'year' => $item->year,
                    'period' => $item->period,
                    'world_rank' => $item->world_rank,
                    'world_rank_numeric' => $item->world_rank_numeric ? (int) $item->world_rank_numeric : null,
                    'national_rank' => $item->national_rank ? (int) $item->national_rank : null,
                    'score' => $item->overall_score ? (float) $item->overall_score : null,
                    'change' => $item->rank_change !== null ? (int) $item->rank_change : null,
                    'trend' => $item->trend,
                    'updated_at' => $item->updated_at,
                ];
            }, $history);
        });
    }

    /**
     * Get all categories
     *
     * @return array
     */
    public function getCategories(): array
    {
        return Cache::remember('rankings:categories', self::CACHE_DURATION, function () {
            $categories = DB::select("
                SELECT
                    code,
                    name,
                    full_name,
                    website,
                    description,
                    icon,
                    color,
                    display_order
                FROM ranking.categories
                WHERE is_active = 1
                ORDER BY display_order
            ");

            return array_map(function ($cat) {
                return [
                    'code' => $cat->code,
                    'name' => $cat->name,
                    'full_name' => $cat->full_name,
                    'website' => $cat->website,
                    'description' => $cat->description,
                    'icon' => $cat->icon,
                    'color' => $cat->color,
                ];
            }, $categories);
        });
    }

    /**
     * Get ranking statistics
     *
     * @return array
     */
    public function getStatistics(): array
    {
        return Cache::remember('rankings:statistics', self::CACHE_DURATION, function () {
            $stats = DB::selectOne("
                SELECT
                    COUNT(DISTINCT category_id) as total_categories,
                    COUNT(*) as total_records,
                    MIN(year) as first_year,
                    MAX(year) as latest_year,
                    AVG(CAST(world_rank_numeric AS FLOAT)) as avg_world_rank,
                    AVG(CAST(national_rank AS FLOAT)) as avg_national_rank
                FROM ranking.university_rankings
            ");

            // Get best ranks
            $bestRanks = DB::select("
                SELECT
                    c.name as category_name,
                    MIN(r.world_rank_numeric) as best_world_rank,
                    MIN(r.national_rank) as best_national_rank
                FROM ranking.university_rankings r
                INNER JOIN ranking.categories c ON r.category_id = c.id
                WHERE r.world_rank_numeric IS NOT NULL
                GROUP BY c.name
            ");

            return [
                'overview' => [
                    'total_categories' => $stats->total_categories,
                    'total_records' => $stats->total_records,
                    'year_range' => [
                        'start' => $stats->first_year,
                        'end' => $stats->latest_year,
                    ],
                    'average_ranks' => [
                        'world' => round($stats->avg_world_rank ?? 0, 0),
                        'national' => round($stats->avg_national_rank ?? 0, 0),
                    ],
                ],
                'best_performances' => array_map(function ($best) {
                    return [
                        'category' => $best->category_name,
                        'best_world_rank' => $best->best_world_rank,
                        'best_national_rank' => $best->best_national_rank,
                    ];
                }, $bestRanks),
            ];
        });
    }

    /**
     * Clear all ranking caches
     *
     * @return void
     */
    public function clearCache(): void
    {
        Cache::forget('rankings:latest');
        Cache::forget('rankings:categories');
        Cache::forget('rankings:statistics');

        // Clear chart and history caches with pattern
        $categories = ['greenmetric', 'qs', 'the', 'webometrics'];
        foreach ($categories as $cat) {
            Cache::forget("rankings:category:{$cat}");
            Cache::forget("rankings:history:{$cat}");
        }

        Log::info('Ranking cache cleared');
    }
}
