<?php

namespace App\Services\RadiusApi;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Radius User Service
 * Service untuk mengambil data user dari SSO Radius via API
 */
class RadiusUserService
{
    protected RadiusApiClient $client;

    public function __construct(RadiusApiClient $client)
    {
        $this->client = $client;
    }

    /**
     * Check if Radius API is available
     */
    public function isAvailable(): bool
    {
        return $this->client->isAvailable();
    }

    /**
     * Get paginated list of SSO users from Radius API
     *
     * @param int $page
     * @param int $limit
     * @param string|null $search
     * @return array|null
     */
    public function getUsers(int $page = 1, int $limit = 100, ?string $search = null): ?array
    {
        $params = [
            'page' => $page,
            'limit' => $limit,
        ];

        if ($search) {
            $params['search'] = $search;
        }

        $response = $this->client->get('/sso-radius/users', $params);

        if ($response && isset($response['data'])) {
            return $response['data'];
        }

        return null;
    }

    /**
     * Get all usernames from Radius API
     * Fetch semua halaman untuk mendapatkan list username lengkap
     * Di-cache untuk efisiensi (5 menit)
     *
     * @return array
     */
    public function getAllUsernames(): array
    {
        $cacheKey = 'radius_api_all_usernames';

        // Check cache first (cache for 5 minutes)
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        if (!$this->client->isAvailable()) {
            return [];
        }

        $usernames = [];
        $page = 1;
        $limit = 1000; // Fetch in larger batches

        try {
            do {
                $result = $this->getUsers($page, $limit);

                if (!$result || !isset($result['data'])) {
                    break;
                }

                foreach ($result['data'] as $user) {
                    if (!empty($user['username'])) {
                        $usernames[] = $user['username'];
                    }
                }

                $totalPages = $result['total_pages'] ?? 1;
                $page++;

            } while ($page <= $totalPages);

            // Cache the result for 5 minutes
            if (!empty($usernames)) {
                Cache::put($cacheKey, $usernames, now()->addMinutes(5));
            }

            return $usernames;

        } catch (\Exception $e) {
            Log::error('Failed to fetch all radius usernames', [
                'message' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Check if username exists in SSO Radius
     *
     * @param string $username
     * @return bool
     */
    public function usernameExists(string $username): bool
    {
        $usernames = $this->getAllUsernames();
        return in_array($username, $usernames, true);
    }

    /**
     * Get user detail from Radius API by username
     *
     * @param string $username
     * @return array|null
     */
    public function getUserByUsername(string $username): ?array
    {
        $response = $this->client->get('/sso-radius/users', [
            'search' => $username,
            'limit' => 1,
        ]);

        if ($response && isset($response['data']['data'])) {
            foreach ($response['data']['data'] as $user) {
                if ($user['username'] === $username) {
                    return $user;
                }
            }
        }

        return null;
    }

    /**
     * Get SSO statistics
     *
     * @return array
     */
    public function getStats(): array
    {
        $cacheKey = 'radius_api_stats';

        // Check cache first (cache for 5 minutes)
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        if (!$this->client->isAvailable()) {
            return [
                'total_sso' => 0,
                'available' => false,
            ];
        }

        // Get first page to get total count
        $result = $this->getUsers(1, 1);

        $stats = [
            'total_sso' => $result['total'] ?? 0,
            'available' => true,
        ];

        // Cache stats for 5 minutes
        Cache::put($cacheKey, $stats, now()->addMinutes(5));

        return $stats;
    }

    /**
     * Clear all caches
     */
    public function clearCache(): void
    {
        Cache::forget('radius_api_all_usernames');
        Cache::forget('radius_api_stats');
        $this->client->clearToken();
    }
}
