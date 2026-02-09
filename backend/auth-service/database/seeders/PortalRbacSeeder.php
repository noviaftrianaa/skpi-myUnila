<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Portal RBAC Seeder (JSON-based)
 *
 * Seeds menu_role table for all portal apps from JSON configuration.
 * Menus must already exist (run PortalMenuSeeder first).
 *
 * Supports per-menu role overrides: if a menu has a "roles" field in JSON,
 * it overrides the app-level roles. Children inherit parent's roles if not specified.
 *
 * Configuration file: database/seeders/data/portal_menus.json
 *
 * Usage:
 *   php artisan db:seed --class=PortalRbacSeeder
 */
class PortalRbacSeeder extends Seeder
{
    // Role IDs that can perform CRUD operations (insert, update, delete)
    private const CRUD_ROLES = [1, 107]; // Administrator, Developer

    // Default updater ID
    private const UPDATER_ID = '00000000-0000-0000-0000-000000000000';

    // JSON config path
    private string $configPath;

    // Loaded config
    private array $config = [];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->configPath = database_path('seeders/data/portal_menus.json');

        // Load JSON configuration
        if (!$this->loadConfig()) {
            return;
        }

        $this->command->info('Seeding Portal RBAC (menu_role) from JSON configuration...');
        $this->command->info("Config file: {$this->configPath}");
        $this->command->info('');

        // Process each app in the config
        $apps = $this->config['apps'] ?? [];

        if (empty($apps)) {
            $this->command->warn('No apps found in configuration!');
            return;
        }

        $totalRoles = 0;

        foreach ($apps as $appConfig) {
            $result = $this->seedAppRbac($appConfig);
            $totalRoles += $result;
        }

        $this->command->info('');
        $this->command->info("=== Summary ===");
        $this->command->info("Total Apps: " . count($apps));
        $this->command->info("Total Role Assignments: {$totalRoles}");
        $this->command->info('');
        $this->command->info('Portal RBAC seeding completed!');
    }

    /**
     * Load JSON configuration
     */
    private function loadConfig(): bool
    {
        if (!file_exists($this->configPath)) {
            $this->command->error("Configuration file not found: {$this->configPath}");
            $this->command->line("Please create the file with proper menu structure.");
            return false;
        }

        $json = file_get_contents($this->configPath);
        $this->config = json_decode($json, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error("Invalid JSON in configuration file: " . json_last_error_msg());
            return false;
        }

        return true;
    }

    /**
     * Seed RBAC for a single app
     */
    private function seedAppRbac(array $appConfig): int
    {
        $appSlug = $appConfig['app_slug'] ?? null;
        $appRoles = $appConfig['roles'] ?? [];
        $menus = $appConfig['menus'] ?? [];

        if (!$appSlug) {
            $this->command->warn("  Skipping app with no app_slug");
            return 0;
        }

        $this->command->info("=== {$appSlug} ===");

        // Find app in database
        $app = DB::selectOne(
            "SELECT CONVERT(VARCHAR(36), id_aplikasi) as id_aplikasi, nm_aplikasi FROM man_akses.aplikasi WHERE app_slug = ?",
            [$appSlug]
        );

        if (!$app) {
            $this->command->warn("  App '{$appSlug}' not found in database! Skipping...");
            return 0;
        }

        $appId = $app->id_aplikasi;
        $now = now()->format('Y-m-d H:i:s');
        $roleCount = 0;

        // Clean up existing role assignments for this app's menus
        $deleted = DB::delete(
            "DELETE FROM man_akses.menu_role WHERE id_menu IN (SELECT id_menu FROM man_akses.menu WHERE id_aplikasi = ?)",
            [$appId]
        );

        if ($deleted > 0) {
            $this->command->line("  ~ Cleaned up {$deleted} existing role assignments");
        }

        // Process each menu (level 0)
        foreach ($menus as $menu) {
            $roles = $this->resolveMenuRoles($menu, $appRoles);
            $menuId = $this->findMenuByFile($menu['nm_file'] ?? '#', $appId);

            if ($menuId) {
                $roleCount += $this->assignRolesToMenu($menuId, $roles, $now, $menu['nm_menu'] ?? '');
            }

            // Process children (level 1)
            if (!empty($menu['children'])) {
                foreach ($menu['children'] as $child) {
                    // Children inherit parent's per-menu roles if they don't have their own
                    $childRoles = $this->resolveMenuRoles($child, $roles);
                    $childId = $this->findMenuByFile($child['nm_file'] ?? '#', $appId);

                    if ($childId) {
                        $roleCount += $this->assignRolesToMenu($childId, $childRoles, $now, $child['nm_menu'] ?? '');
                    }

                    // Process grandchildren (level 2)
                    if (!empty($child['children'])) {
                        foreach ($child['children'] as $grandchild) {
                            $gcRoles = $this->resolveMenuRoles($grandchild, $childRoles);
                            $gcId = $this->findMenuByFile($grandchild['nm_file'] ?? '#', $appId);

                            if ($gcId) {
                                $roleCount += $this->assignRolesToMenu($gcId, $gcRoles, $now, $grandchild['nm_menu'] ?? '');
                            }
                        }
                    }
                }
            }
        }

        $this->command->info("  Role assignments: {$roleCount}");

        return $roleCount;
    }

    /**
     * Resolve roles for a menu item.
     * If menu has its own "roles" field, use that. Otherwise inherit from parent/app roles.
     */
    private function resolveMenuRoles(array $menu, array $inheritedRoles): array
    {
        return $menu['roles'] ?? $inheritedRoles;
    }

    /**
     * Find a menu by nm_file and app ID
     */
    private function findMenuByFile(string $nmFile, string $appId): ?string
    {
        $result = DB::selectOne(
            "SELECT CONVERT(VARCHAR(36), id_menu) as id_menu FROM man_akses.menu WHERE nm_file = ? AND id_aplikasi = ?",
            [$nmFile, $appId]
        );

        return $result?->id_menu;
    }

    /**
     * Assign roles to a menu
     */
    private function assignRolesToMenu(string $menuId, array $roles, string $now, string $menuName): int
    {
        $count = 0;

        foreach ($roles as $roleId) {
            // Only Administrator and Developer can perform CRUD operations
            $canCrud = in_array($roleId, self::CRUD_ROLES) ? 1 : 0;

            DB::insert(
                "INSERT INTO man_akses.menu_role
                    (id_peran, id_menu, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete,
                     a_boleh_sanggah, approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater)
                VALUES (?, ?, 'full', 1, ?, ?, ?, 0, 1, ?, ?, 0, ?, ?)",
                [$roleId, $menuId, $canCrud, $canCrud, $canCrud, $now, $now, $now, self::UPDATER_ID]
            );
            $count++;
        }

        if ($count > 0) {
            $this->command->line("  + {$menuName}: {$count} roles assigned");
        }

        return $count;
    }
}
