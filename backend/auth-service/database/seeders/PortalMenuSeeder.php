<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Portal Menu Seeder (JSON-based) — Menu Only
 *
 * Seeds menu table for all portal apps from JSON configuration.
 * Role assignments (RBAC) are handled separately by PortalRbacSeeder.
 *
 * Configuration file: database/seeders/data/portal_menus.json
 *
 * To add new apps or menus, simply edit the JSON file - no PHP code changes needed!
 *
 * Usage:
 *   php artisan db:seed --class=PortalMenuSeeder
 */
class PortalMenuSeeder extends Seeder
{
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

        $this->command->info('Seeding Portal Menus from JSON configuration...');
        $this->command->info("Config file: {$this->configPath}");
        $this->command->info('');

        // Process each app in the config
        $apps = $this->config['apps'] ?? [];

        if (empty($apps)) {
            $this->command->warn('No apps found in configuration!');
            return;
        }

        $totalMenus = 0;

        foreach ($apps as $appConfig) {
            $result = $this->seedAppMenus($appConfig);
            $totalMenus += $result;
        }

        $this->command->info('');
        $this->command->info("=== Summary ===");
        $this->command->info("Total Apps: " . count($apps));
        $this->command->info("Total Menus: {$totalMenus}");
        $this->command->info('');
        $this->command->info('Portal Menu seeding completed!');
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

        // Clean up existing menus for all apps in JSON config (to avoid duplicates)
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
}
