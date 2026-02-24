<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Portal Menu Seeder (JSON-based) — Menu Only
 *
 * Seeds menu table for portal apps from JSON configuration.
 * Supports both per-app files (portal_menus/{app_slug}.json)
 * and the legacy single file (portal_menus.json).
 *
 * Role assignments (RBAC) are handled separately by PortalRbacSeeder.
 *
 * Usage:
 *   php artisan db:seed --class=PortalMenuSeeder              # all apps
 *   Called programmatically with $appSlug to seed a single app
 */
class PortalMenuSeeder extends Seeder
{
    // Per-app JSON directory
    private string $perAppDir;

    // Legacy single JSON file
    private string $legacyConfigPath;

    // Optional: filter by app slug
    private ?string $appSlug = null;

    /**
     * Set app slug filter (called from artisan command)
     */
    public function setAppSlug(?string $appSlug): self
    {
        $this->appSlug = $appSlug;
        return $this;
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->perAppDir = database_path('seeders/data/portal_menus');
        $this->legacyConfigPath = database_path('seeders/data/portal_menus.json');

        $appConfigs = $this->loadAppConfigs();

        if (empty($appConfigs)) {
            $this->command->warn('No app configurations found!');
            return;
        }

        $this->command->info('Seeding Portal Menus from JSON configuration...');
        $this->command->info('');

        $totalMenus = 0;

        foreach ($appConfigs as $appConfig) {
            $result = $this->seedAppMenus($appConfig);
            $totalMenus += $result;
        }

        $this->command->info('');
        $this->command->info("=== Summary ===");
        $this->command->info("Total Apps: " . count($appConfigs));
        $this->command->info("Total Menus: {$totalMenus}");
        $this->command->info('');
        $this->command->info('Portal Menu seeding completed!');
    }

    /**
     * Load app configurations.
     * Priority: per-app files > legacy single file
     */
    private function loadAppConfigs(): array
    {
        // If filtering by specific app slug
        if ($this->appSlug) {
            return $this->loadSingleApp($this->appSlug);
        }

        // Try per-app directory first
        if (is_dir($this->perAppDir)) {
            $configs = $this->loadAllPerAppFiles();
            if (!empty($configs)) {
                $this->command->info("Source: per-app files from {$this->perAppDir}");
                return $configs;
            }
        }

        // Fallback to legacy single file
        return $this->loadLegacyConfig();
    }

    /**
     * Load a single app config by slug
     */
    private function loadSingleApp(string $appSlug): array
    {
        // Try per-app file first
        $perAppFile = $this->perAppDir . '/' . $appSlug . '.json';
        if (file_exists($perAppFile)) {
            $config = $this->loadJsonFile($perAppFile);
            if ($config) {
                $this->command->info("Source: {$perAppFile}");
                return [$config];
            }
        }

        // Fallback: search in legacy config
        if (file_exists($this->legacyConfigPath)) {
            $legacy = $this->loadJsonFile($this->legacyConfigPath);
            if ($legacy) {
                foreach ($legacy['apps'] ?? [] as $app) {
                    if (($app['app_slug'] ?? '') === $appSlug) {
                        $this->command->info("Source: {$this->legacyConfigPath} (app: {$appSlug})");
                        return [$app];
                    }
                }
            }
        }

        $this->command->error("App '{$appSlug}' not found in any configuration file!");
        return [];
    }

    /**
     * Load all per-app JSON files from portal_menus/ directory
     */
    private function loadAllPerAppFiles(): array
    {
        $configs = [];
        $files = glob($this->perAppDir . '/*.json');

        foreach ($files as $file) {
            $basename = basename($file);
            // Skip _config.json (reference only)
            if (str_starts_with($basename, '_')) {
                continue;
            }

            $config = $this->loadJsonFile($file);
            if ($config && isset($config['app_slug'])) {
                $configs[] = $config;
            }
        }

        return $configs;
    }

    /**
     * Load legacy single JSON file
     */
    private function loadLegacyConfig(): array
    {
        if (!file_exists($this->legacyConfigPath)) {
            $this->command->error("No configuration files found!");
            $this->command->line("  Expected: {$this->perAppDir}/*.json");
            $this->command->line("  Or: {$this->legacyConfigPath}");
            return [];
        }

        $config = $this->loadJsonFile($this->legacyConfigPath);
        if (!$config) {
            return [];
        }

        $this->command->info("Source: {$this->legacyConfigPath} (legacy)");
        return $config['apps'] ?? [];
    }

    /**
     * Load and parse a JSON file
     */
    private function loadJsonFile(string $path): ?array
    {
        $json = file_get_contents($path);
        $data = json_decode($json, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error("Invalid JSON in {$path}: " . json_last_error_msg());
            return null;
        }

        return $data;
    }

    /**
     * Seed menus for a single app (menu only, no RBAC)
     */
    private function seedAppMenus(array $appConfig): int
    {
        $appSlug = $appConfig['app_slug'] ?? null;
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
            $this->command->line("  (Run PortalAplikasiSeeder first to create the app)");
            return 0;
        }

        $appId = $app->id_aplikasi;
        $now = now()->format('Y-m-d H:i:s');
        $menuCount = 0;

        // Clean up existing menus for this app (to avoid duplicates)
        $existingMenuIds = DB::select(
            "SELECT id_menu FROM man_akses.menu WHERE id_aplikasi = ?",
            [$appId]
        );

        if (!empty($existingMenuIds)) {
            $menuIds = array_map(fn($m) => $m->id_menu, $existingMenuIds);

            // Delete role assignments first (FK constraint)
            DB::delete(
                "DELETE FROM man_akses.menu_role WHERE id_menu IN (SELECT id_menu FROM man_akses.menu WHERE id_aplikasi = ?)",
                [$appId]
            );

            // Delete all menus
            DB::delete("DELETE FROM man_akses.menu WHERE id_aplikasi = ?", [$appId]);

            $this->command->line("  ~ Cleaned up " . count($menuIds) . " existing menus");
        }

        // Process each menu (level 0)
        foreach ($menus as $menu) {
            $menuId = $this->createMenu($menu, $appId, null, $now, 0);
            $menuCount++;

            // Process children (level 1)
            if (!empty($menu['children'])) {
                foreach ($menu['children'] as $child) {
                    $childId = $this->createMenu($child, $appId, $menuId, $now, 1);
                    $menuCount++;

                    // Process grandchildren (level 2) if any
                    if (!empty($child['children'])) {
                        foreach ($child['children'] as $grandchild) {
                            $this->createMenu($grandchild, $appId, $childId, $now, 2);
                            $menuCount++;
                        }
                    }
                }
            }
        }

        $this->command->info("  Menus created: {$menuCount}");

        return $menuCount;
    }

    /**
     * Create a menu record (always INSERT since we clean up first)
     */
    private function createMenu(array $menu, string $appId, ?string $parentId, string $now, int $level): string
    {
        $nmFile = $menu['nm_file'] ?? '#';
        $nmMenu = $menu['nm_menu'] ?? 'Untitled';
        $icon = $menu['icon'] ?? null;
        $urutan = $menu['urutan'] ?? 99;

        $menuId = Str::uuid()->toString();
        DB::insert(
            "INSERT INTO man_akses.menu
                (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu,
                 a_aktif, a_tampil, tgl_create, last_update, last_sync, expired_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?, NULL)",
            [$menuId, $nmMenu, $nmFile, $icon, $level, $urutan, $appId, $parentId, $now, $now, $now]
        );
        $this->command->line("  + Created: {$nmMenu}");
        return $menuId;
    }

    /**
     * Get list of available app slugs from per-app files
     */
    public static function getAvailableApps(): array
    {
        $dir = database_path('seeders/data/portal_menus');
        $apps = [];

        if (!is_dir($dir)) {
            return $apps;
        }

        $files = glob($dir . '/*.json');
        foreach ($files as $file) {
            $basename = basename($file);
            if (str_starts_with($basename, '_')) {
                continue;
            }

            $json = file_get_contents($file);
            $data = json_decode($json, true);
            if ($data && isset($data['app_slug'])) {
                $apps[] = [
                    'slug' => $data['app_slug'],
                    'file' => $basename,
                    'menu_count' => self::countMenusRecursive($data['menus'] ?? []),
                ];
            }
        }

        return $apps;
    }

    /**
     * Count menus recursively (including children)
     */
    private static function countMenusRecursive(array $menus): int
    {
        $count = count($menus);
        foreach ($menus as $menu) {
            if (!empty($menu['children'])) {
                $count += self::countMenusRecursive($menu['children']);
            }
        }
        return $count;
    }
}
