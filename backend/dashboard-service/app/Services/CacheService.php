<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CacheService
{
    /**
     * TTL constants (in minutes)
     */
    const TTL_REFERENCE  = 1440; // 24 hours
    const TTL_STATS      = 30;   // 30 minutes (dikurangi dari 60 — data lebih segar untuk pimpinan)
    const TTL_IKU        = 1440; // 24 hours — IKU tahunan, jarang berubah; di-warm via scheduler tiap jam
    const TTL_KEUANGAN   = 30;   // 30 minutes

    /**
     * Remember a value in cache, computing it if not present.
     * Gracefully degrades: if cache is unavailable, computes directly.
     */
    public function remember(string $key, int $ttlMinutes, \Closure $callback): mixed
    {
        try {
            return Cache::remember($key, $ttlMinutes * 60, $callback);
        } catch (\Exception $e) {
            Log::warning('Cache unavailable, computing directly: ' . $e->getMessage());
            return $callback();
        }
    }

    /**
     * Build a standardized cache key
     */
    public function buildKey(string $page, string $section, array $filters = []): string
    {
        $filterPart = !empty($filters) ? ':' . md5(json_encode($filters)) : '';
        return "dashboard:{$page}:{$section}{$filterPart}";
    }

    /**
     * Forget a specific cache key
     */
    public function forget(string $key): bool
    {
        try {
            return Cache::forget($key);
        } catch (\Exception $e) {
            Log::warning('Cache forget failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Flush all dashboard cache keys
     */
    public function flushDashboard(): void
    {
        try {
            $redis = Cache::getRedis();
            $prefix = config('database.redis.options.prefix', '');
            $keys = $redis->keys($prefix . 'dashboard:*');

            if (!empty($keys)) {
                foreach ($keys as $key) {
                    $redis->del($key);
                }
            }
        } catch (\Exception $e) {
            Log::warning('Cache flush failed: ' . $e->getMessage());
        }
    }
}
