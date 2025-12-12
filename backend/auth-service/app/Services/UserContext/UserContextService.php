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
    // Cache keys
    private const CACHE_PREFIX = 'user_context:';
    private const CACHE_TTL = 300; // 5 minutes

    // Super roles with full access (Administrator, Developer)
    private const SUPER_ROLES = [1, 107];

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

            // Get app info
            $app = $this->repository->getAppInfo($appId, $appKey);
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

            return [
                'success' => true,
                'has_access' => true,
                'reason' => 'Akses diizinkan',
                'context' => $context,
                'app' => [
                    'id_aplikasi' => $app->id_aplikasi,
                    'nm_aplikasi' => $app->nm_aplikasi,
                    'app_key' => $app->app_key,
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
     * Check if role has menu access to app
     *
     * @param int $idPeran
     * @param string $idAplikasi
     * @return bool
     */
    private function checkMenuRoleAccess(int $idPeran, string $idAplikasi): bool
    {
        $count = $this->repository->countMenuRoleAccess($idPeran, $idAplikasi);

        // If no menu_role records, check if this is a global access role
        if ($count == 0) {
            return in_array($idPeran, self::SUPER_ROLES);
        }

        return $count > 0;
    }

    /**
     * Get portal apps for the current user context
     * Apps are filtered by:
     * - Active role's organization, OR
     * - App's organization is "Semua Unit", OR
     * - User's role org is "Semua Unit" (has global access)
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

            // Get all portal apps filtered by org access
            $apps = $this->repository->getPortalApps($userOrgId);

            // Group apps by category
            $categories = [];
            foreach ($apps as $app) {
                $categoryKey = $app->id_kategori;

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
     *
     * @return array
     */
    public function getPortalCategories(): array
    {
        try {
            $categories = $this->repository->getPortalCategories();

            return [
                'success' => true,
                'categories' => array_map(function ($cat) {
                    return [
                        'id_kategori' => $cat->id_kategori,
                        'nm_kategori' => $cat->nm_kategori,
                        'icon_kategori' => $cat->icon_kategori,
                        'icon_color' => $cat->icon_color,
                        'urutan' => $cat->urutan,
                    ];
                }, $categories),
            ];
        } catch (\Exception $e) {
            Log::error('UserContextService::getPortalCategories error', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
