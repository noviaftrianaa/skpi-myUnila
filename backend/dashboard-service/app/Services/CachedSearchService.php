<?php

namespace App\Services;

use App\Repositories\SearchRepository;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Cached Search Service with Redis
 * Implements caching strategy for search operations
 */
class CachedSearchService
{
    protected $searchRepository;

    // Cache TTL configurations (in seconds)
    const CACHE_TTL_SEARCH_RESULTS = 300;      // 5 minutes - search results
    const CACHE_TTL_SUGGESTIONS = 600;         // 10 minutes - autocomplete suggestions
    const CACHE_TTL_STATIC_DATA = 3600;        // 1 hour - prodi, jenjang (jarang berubah)

    // Cache key prefixes
    const CACHE_PREFIX_SEARCH = 'search';
    const CACHE_PREFIX_SUGGESTIONS = 'suggestions';

    public function __construct(SearchRepository $searchRepository)
    {
        $this->searchRepository = $searchRepository;
    }

    /**
     * Generate cache key for search
     */
    protected function getCacheKey(string $prefix, string $category, string $query, int $limit): string
    {
        // Normalize query: lowercase, trim
        $normalizedQuery = strtolower(trim($query));
        return sprintf('%s:%s:%s:%d', $prefix, $category, md5($normalizedQuery), $limit);
    }

    /**
     * Search mahasiswa with caching
     */
    public function searchMahasiswa(string $query, int $limit = 20): array
    {
        $cacheKey = $this->getCacheKey(self::CACHE_PREFIX_SEARCH, 'mahasiswa', $query, $limit);

        return Cache::remember($cacheKey, self::CACHE_TTL_SEARCH_RESULTS, function () use ($query, $limit) {
            Log::info('Cache MISS: Fetching mahasiswa from database', ['query' => $query, 'limit' => $limit]);
            return $this->searchRepository->searchMahasiswa($query, $limit);
        });
    }

    /**
     * Search dosen with caching
     */
    public function searchDosen(string $query, int $limit = 20): array
    {
        $cacheKey = $this->getCacheKey(self::CACHE_PREFIX_SEARCH, 'dosen', $query, $limit);

        return Cache::remember($cacheKey, self::CACHE_TTL_SEARCH_RESULTS, function () use ($query, $limit) {
            Log::info('Cache MISS: Fetching dosen from database', ['query' => $query, 'limit' => $limit]);
            return $this->searchRepository->searchDosen($query, $limit);
        });
    }

    /**
     * Search prodi with caching (longer TTL - data jarang berubah)
     */
    public function searchProdi(string $query, int $limit = 20): array
    {
        $cacheKey = $this->getCacheKey(self::CACHE_PREFIX_SEARCH, 'prodi', $query, $limit);

        return Cache::remember($cacheKey, self::CACHE_TTL_STATIC_DATA, function () use ($query, $limit) {
            Log::info('Cache MISS: Fetching prodi from database', ['query' => $query, 'limit' => $limit]);
            return $this->searchRepository->searchProdi($query, $limit);
        });
    }

    /**
     * Search penelitian with caching
     */
    public function searchPenelitian(string $query, int $limit = 20): array
    {
        $cacheKey = $this->getCacheKey(self::CACHE_PREFIX_SEARCH, 'penelitian', $query, $limit);

        return Cache::remember($cacheKey, self::CACHE_TTL_SEARCH_RESULTS, function () use ($query, $limit) {
            Log::info('Cache MISS: Fetching penelitian from database', ['query' => $query, 'limit' => $limit]);
            return $this->searchRepository->searchPenelitian($query, $limit);
        });
    }

    /**
     * Search publikasi with caching
     */
    public function searchPublikasi(string $query, int $limit = 20): array
    {
        $cacheKey = $this->getCacheKey(self::CACHE_PREFIX_SEARCH, 'publikasi', $query, $limit);

        return Cache::remember($cacheKey, self::CACHE_TTL_SEARCH_RESULTS, function () use ($query, $limit) {
            Log::info('Cache MISS: Fetching publikasi from database', ['query' => $query, 'limit' => $limit]);
            return $this->searchRepository->searchPublikasi($query, $limit);
        });
    }

    /**
     * Search pengabdian with caching
     */
    public function searchPengabdian(string $query, int $limit = 20): array
    {
        $cacheKey = $this->getCacheKey(self::CACHE_PREFIX_SEARCH, 'pengabdian', $query, $limit);

        return Cache::remember($cacheKey, self::CACHE_TTL_SEARCH_RESULTS, function () use ($query, $limit) {
            Log::info('Cache MISS: Fetching pengabdian from database', ['query' => $query, 'limit' => $limit]);
            return $this->searchRepository->searchPengabdian($query, $limit);
        });
    }

    /**
     * Search bidang ilmu with caching
     */
    public function searchBidangIlmu(string $query, int $limit = 20): array
    {
        $cacheKey = $this->getCacheKey(self::CACHE_PREFIX_SEARCH, 'bidang-ilmu', $query, $limit);

        return Cache::remember($cacheKey, self::CACHE_TTL_STATIC_DATA, function () use ($query, $limit) {
            Log::info('Cache MISS: Fetching bidang ilmu from database', ['query' => $query, 'limit' => $limit]);
            return $this->searchRepository->searchBidangIlmu($query, $limit);
        });
    }

    /**
     * Get suggestions with caching (untuk autocomplete)
     */
    public function getSuggestions(string $query, int $limit = 5): array
    {
        $cacheKey = $this->getCacheKey(self::CACHE_PREFIX_SUGGESTIONS, 'all', $query, $limit);

        return Cache::remember($cacheKey, self::CACHE_TTL_SUGGESTIONS, function () use ($query, $limit) {
            Log::info('Cache MISS: Fetching suggestions from database', ['query' => $query, 'limit' => $limit]);

            $results = [];
            $results['mahasiswa'] = $this->searchRepository->searchMahasiswa($query, $limit);
            $results['dosen'] = $this->searchRepository->searchDosen($query, $limit);
            $results['prodi'] = $this->searchRepository->searchProdi($query, $limit);

            return $results;
        });
    }

    /**
     * Global search with smart caching
     */
    public function globalSearch(string $query, ?string $category = null, array $filters = [], int $limit = 20): array
    {
        // Jika ada kategori spesifik, hanya search kategori itu
        if ($category) {
            return $this->searchSpecificCategory($category, $query, $limit);
        }

        // Global search - cache per kategori untuk reusability
        $results = [];

        $categories = ['mahasiswa', 'dosen', 'prodi', 'penelitian', 'publikasi', 'pengabdian', 'bidang-ilmu'];

        foreach ($categories as $cat) {
            $results[$cat] = $this->searchSpecificCategory($cat, $query, $limit);
        }

        return $results;
    }

    /**
     * Search specific category (internal helper)
     */
    protected function searchSpecificCategory(string $category, string $query, int $limit): array
    {
        switch ($category) {
            case 'mahasiswa':
                return $this->searchMahasiswa($query, $limit);
            case 'dosen':
                return $this->searchDosen($query, $limit);
            case 'prodi':
                return $this->searchProdi($query, $limit);
            case 'penelitian':
                return $this->searchPenelitian($query, $limit);
            case 'publikasi':
                return $this->searchPublikasi($query, $limit);
            case 'pengabdian':
                return $this->searchPengabdian($query, $limit);
            case 'bidang-ilmu':
                return $this->searchBidangIlmu($query, $limit);
            default:
                return [];
        }
    }

    /**
     * Clear cache for specific category
     * Call this when data changes (e.g., after data import/update)
     */
    public function clearCategoryCache(string $category): void
    {
        $pattern = sprintf('%s:%s:*', self::CACHE_PREFIX_SEARCH, $category);

        // Note: Untuk production, gunakan Redis SCAN command
        // Untuk development, bisa flush by tag jika pakai Redis tags
        Cache::tags([$category])->flush();

        Log::info('Cache cleared for category', ['category' => $category]);
    }

    /**
     * Clear all search cache
     */
    public function clearAllCache(): void
    {
        Cache::tags(['search', 'suggestions'])->flush();
        Log::info('All search cache cleared');
    }
}
