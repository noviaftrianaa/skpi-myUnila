<?php

namespace App\Services\UserContext;

use App\Repositories\UserContext\UserContextRepository;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * User Context Service
 *
 * Handles user role/unit context management for app access validation
 * - Get user's available roles and units
 * - Store/retrieve active context (selected role + unit)
 * - Check app access based on active context
 */
class UserContextService
{
    // Cache keys and prefixes
    private const CACHE_PREFIX = 'user_context:';
    private const CACHE_MENU_ROLE_PREFIX = 'menu_role:';
    private const CACHE_APP_INFO_PREFIX = 'app_info:';
    private const CACHE_PORTAL_APPS_PREFIX = 'portal_apps:';
    private const CACHE_CATEGORIES_KEY = 'portal_categories';

    // Cache TTL (Time To Live) in seconds
    private const CACHE_TTL = 300;              // 5 minutes for user context
    private const CACHE_MENU_ROLE_TTL = 600;    // 10 minutes for menu_role permissions
    private const CACHE_APP_INFO_TTL = 3600;    // 1 hour for app info (rarely changes)
    private const CACHE_PORTAL_APPS_TTL = 300;  // 5 minutes for portal apps
    private const CACHE_CATEGORIES_TTL = 3600;  // 1 hour for categories

    // Super roles with full access (Administrator, Developer)
    private const SUPER_ROLES = [1, 107];

    // "Semua Unit" organization ID - universal access
    private const SEMUA_UNIT_ORG_ID = '86942cdf-44f1-446e-8e9e-cb37bbbb16e6';

    protected UserContextRepository $repository;

    public function __construct(UserContextRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get user context - all available roles and units
     *
     * @param string $userId
     * @return array
     */
    public function getUserContext(string $userId): array
    {
        try {
            // Get user info
            $user = $this->repository->getUserInfo($userId);
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'User tidak ditemukan',
                ];
            }

            // Get all roles for this user
            $roles = $this->repository->getUserRoles($userId);

            // Transform roles to array format
            $rolesData = array_map(function ($role) {
                return [
                    'id_role_pengguna' => $role->id_role_pengguna,
                    'id_peran' => $role->id_peran,
                    'nm_peran' => $role->nm_peran,
                    'id_organisasi' => $role->id_organisasi,
                    'nm_organisasi' => $role->nm_organisasi,
                    'level_organisasi' => $role->level_organisasi,
                    'id_induk_organisasi' => $role->id_induk_organisasi,
                    'approval_peran' => (bool) $role->approval_peran,
                    'sk_penugasan' => $role->sk_penugasan,
                    'tgl_sk_penugasan' => $role->tgl_sk_penugasan,
                    'tgl_kadarluasa' => $role->tgl_kadarluasa,
                    'last_active' => $role->last_active,
                ];
            }, $roles);

            // Get active context from cache
            $activeContext = $this->getActiveContext($userId);

            return [
                'success' => true,
                'user' => [
                    'id_pengguna' => $user->id_pengguna,
                    'username' => $user->username,
                    'nm_pengguna' => $user->nm_pengguna,
                    'email' => $user->email,
                ],
                'roles' => $rolesData,
                'active_context' => $activeContext,
            ];
        } catch (\Exception $e) {
            Log::error('UserContextService::getUserContext error', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Select/switch user context (role + unit)
     *
     * @param string $userId
     * @param string $idRolePengguna
     * @return array
     */
    public function selectContext(string $userId, string $idRolePengguna): array
    {
        try {
            // Verify this role belongs to the user
            $role = $this->repository->verifyUserRole($userId, $idRolePengguna);
            if (!$role) {
                return [
                    'success' => false,
                    'message' => 'Role tidak valid atau tidak ditemukan',
                ];
            }

            // Check if role is approved
            if (!$role->approval_peran) {
                return [
                    'success' => false,
                    'message' => 'Role belum disetujui',
                ];
            }

            // Store context in cache
            $context = [
                'id_role_pengguna' => $role->id_role_pengguna,
                'id_peran' => $role->id_peran,
                'nm_peran' => $role->nm_peran,
                'id_organisasi' => $role->id_organisasi,
                'nm_organisasi' => $role->nm_organisasi,
                'level_organisasi' => $role->level_organisasi,
                'selected_at' => now()->toIso8601String(),
            ];

            $cacheKey = self::CACHE_PREFIX . $userId;
            Cache::put($cacheKey, $context, self::CACHE_TTL);

            // Update last_active in database
            $this->repository->updateLastActive($idRolePengguna);

            return [
                'success' => true,
                'message' => 'Context berhasil dipilih',
                'active_context' => $context,
            ];
        } catch (\Exception $e) {
            Log::error('UserContextService::selectContext error', [
                'user_id' => $userId,
                'id_role_pengguna' => $idRolePengguna,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Check if user has access to specific app based on active context
     *
     * Access is granted if:
     * 1. User has menu_role access for this app, AND
     * 2. Organization check passes:
     *    - App's org is NULL (accessible by all), OR
     *    - App's org is "Semua Unit" (accessible by all), OR
     *    - User's role org matches app's org, OR
     *    - User's role org is "Semua Unit" (has global access)
     *
     * @param string $userId
     * @param string|null $appId
     * @param string|null $appKey
     * @return array
     */
    public function checkAppAccess(string $userId, ?string $appId = null, ?string $appKey = null): array
    {
        try {
            // Get active context
            $context = $this->getActiveContext($userId);

            if (!$context) {
                return [
                    'success' => false,
                    'has_access' => false,
                    'reason' => 'Belum memilih role/unit. Silakan pilih terlebih dahulu.',
                    'requires_context_selection' => true,
                ];
            }

            // Get app info (with caching)
            $app = $this->getCachedAppInfo($appId, $appKey);
            if (!$app) {
                return [
                    'success' => false,
                    'has_access' => false,
                    'reason' => 'Aplikasi tidak ditemukan',
                ];
            }

            // Check menu_role for this role and app
            $hasMenuAccess = $this->checkMenuRoleAccess(
                (int) $context['id_peran'],
                $app->id_aplikasi
            );

            if (!$hasMenuAccess) {
                return [
                    'success' => true,
                    'has_access' => false,
                    'reason' => 'Role ' . $context['nm_peran'] . ' tidak memiliki akses ke aplikasi ' . $app->nm_aplikasi,
                    'context' => $context,
                ];
            }

            // Check organization access
            $hasOrgAccess = $this->checkOrganizationAccess(
                $context['id_organisasi'] ?? null,
                $app->id_organisasi ?? null
            );

            if (!$hasOrgAccess) {
                return [
                    'success' => true,
                    'has_access' => false,
                    'reason' => 'Unit organisasi ' . ($context['nm_organisasi'] ?? 'Anda') . ' tidak memiliki akses ke aplikasi ' . $app->nm_aplikasi,
                    'context' => $context,
                ];
            }

            return [
                'success' => true,
                'has_access' => true,
                'reason' => 'Akses diizinkan',
                'context' => $context,
                'app' => [
                    'id_aplikasi' => $app->id_aplikasi,
                    'nm_aplikasi' => $app->nm_aplikasi,
                    'app_key' => $app->app_slug,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('UserContextService::checkAppAccess error', [
                'user_id' => $userId,
                'app_id' => $appId,
                'app_key' => $appKey,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Check if user's organization has access to app's organization
     *
     * @param string|null $userOrgId User's active role organization ID
     * @param string|null $appOrgId App's organization ID
     * @return bool
     */
    private function checkOrganizationAccess(?string $userOrgId, ?string $appOrgId): bool
    {
        // If app has no org restriction, allow access
        if ($appOrgId === null) {
            return true;
        }

        // Normalize to lowercase for comparison
        $appOrgIdLower = strtolower($appOrgId);
        $semuaUnitLower = strtolower(self::SEMUA_UNIT_ORG_ID);

        // If app's org is "Semua Unit", allow access to everyone
        if ($appOrgIdLower === $semuaUnitLower) {
            return true;
        }

        // If user has no org (shouldn't happen), deny access
        if ($userOrgId === null) {
            return false;
        }

        $userOrgIdLower = strtolower($userOrgId);

        // If user's org is "Semua Unit", they have global access
        if ($userOrgIdLower === $semuaUnitLower) {
            return true;
        }

        // Finally, check if user's org matches app's org
        return $userOrgIdLower === $appOrgIdLower;
    }

    /**
     * Get active context from cache
     *
     * @param string $userId
     * @return array|null
     */
    public function getActiveContext(string $userId): ?array
    {
        $cacheKey = self::CACHE_PREFIX . $userId;
        return Cache::get($cacheKey);
    }

    /**
     * Clear user context (logout scenario)
     *
     * @param string $userId
     * @return bool
     */
    public function clearContext(string $userId): bool
    {
        $cacheKey = self::CACHE_PREFIX . $userId;
        return Cache::forget($cacheKey);
    }

    /**
     * Get app info with Redis caching
     *
     * @param string|null $appId
     * @param string|null $appKey
     * @return object|null
     */
    private function getCachedAppInfo(?string $appId, ?string $appKey): ?object
    {
        // Build cache key based on what's provided
        $cacheKey = self::CACHE_APP_INFO_PREFIX;
        if ($appId) {
            $cacheKey .= 'id:' . strtolower($appId);
        } elseif ($appKey) {
            $cacheKey .= 'key:' . strtolower($appKey);
        } else {
            return null;
        }

        // Try cache first
        $cachedApp = Cache::get($cacheKey);
        if ($cachedApp !== null) {
            Log::debug('App info from cache', ['cache_key' => $cacheKey]);
            return (object) $cachedApp;
        }

        // Query database
        $app = $this->repository->getAppInfo($appId, $appKey);
        if (!$app) {
            // Cache negative result for shorter time to prevent DB spam
            Cache::put($cacheKey, false, 60); // 1 minute for not found
            return null;
        }

        // Store in cache as array (objects don't serialize well)
        $appArray = [
            'id_aplikasi' => $app->id_aplikasi,
            'nm_aplikasi' => $app->nm_aplikasi,
            'app_slug' => $app->app_slug,
            'url' => $app->url,
            'port' => $app->port ?? null,
            'id_organisasi' => $app->id_organisasi,
            'nm_organisasi' => $app->nm_organisasi ?? null,
        ];
        Cache::put($cacheKey, $appArray, self::CACHE_APP_INFO_TTL);

        Log::debug('App info from database (cached)', ['cache_key' => $cacheKey]);

        return $app;
    }

    /**
     * Check if role has menu access to app (with Redis caching)
     *
     * @param int $idPeran
     * @param string $idAplikasi
     * @return bool
     */
    private function checkMenuRoleAccess(int $idPeran, string $idAplikasi): bool
    {
        // Super roles always have access
        if (in_array($idPeran, self::SUPER_ROLES)) {
            return true;
        }

        // Build cache key: menu_role:{id_peran}:{id_aplikasi}
        $cacheKey = self::CACHE_MENU_ROLE_PREFIX . $idPeran . ':' . strtolower($idAplikasi);

        // Try to get from cache first
        $cachedResult = Cache::get($cacheKey);
        if ($cachedResult !== null) {
            Log::debug('Menu role access from cache', [
                'id_peran' => $idPeran,
                'id_aplikasi' => $idAplikasi,
                'has_access' => $cachedResult,
            ]);
            return $cachedResult;
        }

        // Not in cache, query database
        $count = $this->repository->countMenuRoleAccess($idPeran, $idAplikasi);
        $hasAccess = $count > 0;

        // Store in cache
        Cache::put($cacheKey, $hasAccess, self::CACHE_MENU_ROLE_TTL);

        Log::debug('Menu role access from database (cached)', [
            'id_peran' => $idPeran,
            'id_aplikasi' => $idAplikasi,
            'has_access' => $hasAccess,
        ]);

        return $hasAccess;
    }

    /**
     * Get portal apps for the current user context (HYBRID approach)
     * Returns ALL apps with has_access flag indicating accessibility
     * Uses Redis caching for performance
     *
     * @param string $userId
     * @return array
     */
    public function getPortalApps(string $userId): array
    {
        try {
            // Get active context
            $context = $this->getActiveContext($userId);

            // Get user's organization ID from active context
            $userOrgId = $context['id_organisasi'] ?? null;

            // Build cache key based on org ID (apps list is org-specific)
            $cacheKey = self::CACHE_PORTAL_APPS_PREFIX . ($userOrgId ? strtolower($userOrgId) : 'all');

            // Try cache first
            $cachedApps = Cache::get($cacheKey);
            if ($cachedApps !== null) {
                Log::debug('Portal apps from cache', ['org_id' => $userOrgId]);
                $apps = array_map(fn($a) => (object) $a, $cachedApps);
            } else {
                // Get from database
                $apps = $this->repository->getPortalApps($userOrgId);

                // Cache the raw apps data
                $appsArray = array_map(fn($a) => (array) $a, $apps);
                Cache::put($cacheKey, $appsArray, self::CACHE_PORTAL_APPS_TTL);

                Log::debug('Portal apps from database (cached)', ['org_id' => $userOrgId]);
            }

            // Get all portal apps with has_access flag (from cache or db)
            // $apps is already set above

            // Group apps by category
            $categories = [];
            $accessibleCount = 0;
            foreach ($apps as $app) {
                $categoryKey = $app->id_kategori;
                $hasAccess = (bool) $app->has_access;

                if ($hasAccess) {
                    $accessibleCount++;
                }

                if (!isset($categories[$categoryKey])) {
                    $categories[$categoryKey] = [
                        'id_kategori' => $app->id_kategori,
                        'nm_kategori' => $app->nm_kategori,
                        'icon_kategori' => $app->icon_kategori,
                        'icon_color' => $app->kategori_icon_color,
                        'urutan' => $app->kategori_urutan,
                        'apps' => [],
                    ];
                }

                $categories[$categoryKey]['apps'][] = [
                    'id_aplikasi' => $app->id_aplikasi,
                    'nm_aplikasi' => $app->nm_aplikasi,
                    'ket_aplikasi' => $app->ket_aplikasi,
                    'url' => $app->url,
                    'icon_name' => $app->icon_name,
                    'icon_color' => $app->icon_color,
                    'app_slug' => $app->app_slug,
                    'urutan' => $app->app_urutan,
                    'id_organisasi' => $app->id_organisasi,
                    'nm_organisasi' => $app->nm_organisasi,
                    'a_maintenance' => (bool) $app->a_maintenance,
                    'a_coming_soon' => (bool) $app->a_coming_soon,
                    'a_terintegrasi' => (bool) $app->a_terintegrasi,
                    'a_live' => (bool) $app->a_live,
                    'has_access' => $hasAccess,
                ];
            }

            // Sort categories by urutan and reset keys
            usort($categories, fn($a, $b) => $a['urutan'] <=> $b['urutan']);
            $categories = array_values($categories);

            return [
                'success' => true,
                'context' => $context,
                'categories' => $categories,
                'total_apps' => count($apps),
                'accessible_apps' => $accessibleCount,
            ];
        } catch (\Exception $e) {
            Log::error('UserContextService::getPortalApps error', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get all portal categories (without app filtering)
     * Uses Redis caching for performance
     *
     * @return array
     */
    public function getPortalCategories(): array
    {
        try {
            // Try cache first
            $cachedCategories = Cache::get(self::CACHE_CATEGORIES_KEY);
            if ($cachedCategories !== null) {
                Log::debug('Portal categories from cache');
                return [
                    'success' => true,
                    'categories' => $cachedCategories,
                ];
            }

            // Get from database
            $categories = $this->repository->getPortalCategories();

            $categoriesData = array_map(function ($cat) {
                return [
                    'id_kategori' => $cat->id_kategori,
                    'nm_kategori' => $cat->nm_kategori,
                    'icon_kategori' => $cat->icon_kategori,
                    'icon_color' => $cat->icon_color,
                    'urutan' => $cat->urutan,
                ];
            }, $categories);

            // Store in cache
            Cache::put(self::CACHE_CATEGORIES_KEY, $categoriesData, self::CACHE_CATEGORIES_TTL);

            Log::debug('Portal categories from database (cached)');

            return [
                'success' => true,
                'categories' => $categoriesData,
            ];
        } catch (\Exception $e) {
            Log::error('UserContextService::getPortalCategories error', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Invalidate cache for specific role's menu access
     * Call this when menu_role is updated
     *
     * @param int $idPeran
     * @param string|null $idAplikasi If null, invalidates all apps for this role
     * @return void
     */
    public function invalidateMenuRoleCache(int $idPeran, ?string $idAplikasi = null): void
    {
        if ($idAplikasi) {
            $cacheKey = self::CACHE_MENU_ROLE_PREFIX . $idPeran . ':' . strtolower($idAplikasi);
            Cache::forget($cacheKey);
            Log::info('Invalidated menu role cache', ['id_peran' => $idPeran, 'id_aplikasi' => $idAplikasi]);
        } else {
            // Pattern-based invalidation (requires Redis SCAN)
            $pattern = self::CACHE_MENU_ROLE_PREFIX . $idPeran . ':*';
            $this->invalidateCacheByPattern($pattern);
            Log::info('Invalidated all menu role cache for role', ['id_peran' => $idPeran]);
        }
    }

    /**
     * Invalidate cache for app info
     * Call this when app is updated
     *
     * @param string|null $appId
     * @param string|null $appKey
     * @return void
     */
    public function invalidateAppInfoCache(?string $appId = null, ?string $appKey = null): void
    {
        if ($appId) {
            Cache::forget(self::CACHE_APP_INFO_PREFIX . 'id:' . strtolower($appId));
        }
        if ($appKey) {
            Cache::forget(self::CACHE_APP_INFO_PREFIX . 'key:' . strtolower($appKey));
        }
        Log::info('Invalidated app info cache', ['app_id' => $appId, 'app_key' => $appKey]);
    }

    /**
     * Invalidate portal apps cache
     * Call this when apps or categories are updated
     *
     * @param string|null $orgId If null, invalidates all org caches
     * @return void
     */
    public function invalidatePortalAppsCache(?string $orgId = null): void
    {
        if ($orgId) {
            Cache::forget(self::CACHE_PORTAL_APPS_PREFIX . strtolower($orgId));
        } else {
            // Invalidate all portal apps cache
            $this->invalidateCacheByPattern(self::CACHE_PORTAL_APPS_PREFIX . '*');
        }
        Log::info('Invalidated portal apps cache', ['org_id' => $orgId]);
    }

    /**
     * Invalidate portal categories cache
     * Call this when categories are updated
     *
     * @return void
     */
    public function invalidateCategoriesCache(): void
    {
        Cache::forget(self::CACHE_CATEGORIES_KEY);
        Log::info('Invalidated portal categories cache');
    }

    /**
     * Invalidate all permission-related caches
     * Useful for admin operations or migrations
     *
     * @return void
     */
    public function invalidateAllPermissionCache(): void
    {
        $this->invalidateCacheByPattern(self::CACHE_MENU_ROLE_PREFIX . '*');
        $this->invalidateCacheByPattern(self::CACHE_APP_INFO_PREFIX . '*');
        $this->invalidateCacheByPattern(self::CACHE_PORTAL_APPS_PREFIX . '*');
        Cache::forget(self::CACHE_CATEGORIES_KEY);
        Log::info('Invalidated all permission caches');
    }

    /**
     * Invalidate cache by pattern using Redis SCAN
     * This is more efficient than KEYS for production use
     *
     * @param string $pattern
     * @return void
     */
    private function invalidateCacheByPattern(string $pattern): void
    {
        try {
            $redis = Cache::getStore()->getRedis();
            $prefix = config('cache.prefix', '');
            $fullPattern = $prefix . $pattern;

            $cursor = 0;
            do {
                [$cursor, $keys] = $redis->scan($cursor, 'MATCH', $fullPattern, 'COUNT', 100);
                if (!empty($keys)) {
                    $redis->del(...$keys);
                }
            } while ($cursor != 0);
        } catch (\Exception $e) {
            Log::warning('Failed to invalidate cache by pattern', [
                'pattern' => $pattern,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
