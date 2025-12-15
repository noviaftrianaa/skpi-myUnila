<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Portal Menu Seeder (JSON-based)
 *
 * Seeds menu and menu_role tables for all portal apps from JSON configuration.
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
        $totalRoles = 0;

        foreach ($apps as $appConfig) {
            $result = $this->seedAppMenus($appConfig);
            $totalMenus += $result['menus'];
            $totalRoles += $result['roles'];
        }

        $this->command->info('');
        $this->command->info("=== Summary ===");
        $this->command->info("Total Apps: " . count($apps));
        $this->command->info("Total Menus: {$totalMenus}");
        $this->command->info("Total Role Assignments: {$totalRoles}");
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
     * Seed menus for a single app
     */
    private function seedAppMenus(array $appConfig): array
    {
        $appSlug = $appConfig['app_slug'] ?? null;
        $roles = $appConfig['roles'] ?? [];
        $menus = $appConfig['menus'] ?? [];

        if (!$appSlug) {
            $this->command->warn("  Skipping app with no app_slug");
            return ['menus' => 0, 'roles' => 0];
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
            return ['menus' => 0, 'roles' => 0];
        }

        $appId = $app->id_aplikasi;
        $now = now()->format('Y-m-d H:i:s');
        $menuCount = 0;
        $roleCount = 0;

        // Process each menu (level 0)
        foreach ($menus as $menu) {
            $menuId = $this->createOrUpdateMenu($menu, $appId, null, $now, 0);
            $menuCount++;
            $roleCount += $this->assignRolesToMenu($menuId, $roles, $now);

            // Process children (level 1)
            if (!empty($menu['children'])) {
                foreach ($menu['children'] as $child) {
                    $childId = $this->createOrUpdateMenu($child, $appId, $menuId, $now, 1);
                    $menuCount++;
                    $roleCount += $this->assignRolesToMenu($childId, $roles, $now);

                    // Process grandchildren (level 2) if any
                    if (!empty($child['children'])) {
                        foreach ($child['children'] as $grandchild) {
                            $grandchildId = $this->createOrUpdateMenu($grandchild, $appId, $childId, $now, 2);
                            $menuCount++;
                            $roleCount += $this->assignRolesToMenu($grandchildId, $roles, $now);
                        }
                    }
                }
            }
        }

        $this->command->info("  Menus: {$menuCount}, Role assignments: {$roleCount}");

        return ['menus' => $menuCount, 'roles' => $roleCount];
    }

    /**
     * Create or update a menu record
     */
    private function createOrUpdateMenu(array $menu, string $appId, ?string $parentId, string $now, int $level): string
    {
        $nmFile = $menu['nm_file'] ?? '#';
        $nmMenu = $menu['nm_menu'] ?? 'Untitled';
        $icon = $menu['icon'] ?? 'heroicons:document';
        $urutan = $menu['urutan'] ?? 99;

        // Check if menu exists
        $existing = DB::selectOne(
            "SELECT CONVERT(VARCHAR(36), id_menu) as id_menu FROM man_akses.menu WHERE nm_file = ? AND id_aplikasi = ?",
            [$nmFile, $appId]
        );

        if ($existing) {
            // Update existing menu
            DB::update(
                "UPDATE man_akses.menu SET
                    nm_menu = ?,
                    icon = ?,
                    level_menu = ?,
                    urutan_menu = ?,
                    id_group_menu = ?,
                    a_aktif = 1,
                    a_tampil = 1,
                    last_update = ?,
                    last_sync = ?,
                    expired_date = NULL
                WHERE id_menu = ?",
                [$nmMenu, $icon, $level, $urutan, $parentId, $now, $now, $existing->id_menu]
            );
            $this->command->line("  ~ Updated: {$nmMenu}");
            return $existing->id_menu;
        }

        // Insert new menu
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
     * Assign roles to a menu
     */
    private function assignRolesToMenu(string $menuId, array $roles, string $now): int
    {
        $count = 0;

        foreach ($roles as $roleId) {
            // Check if assignment exists
            $existing = DB::selectOne(
                "SELECT 1 FROM man_akses.menu_role WHERE id_menu = ? AND id_peran = ?",
                [$menuId, $roleId]
            );

            // Only Administrator and Developer can perform CRUD operations
            $canCrud = in_array($roleId, self::CRUD_ROLES) ? 1 : 0;

            if ($existing) {
                // Update existing assignment
                DB::update(
                    "UPDATE man_akses.menu_role SET
                        akses_menu = 'full',
                        a_boleh_show = 1,
                        a_boleh_insert = ?,
                        a_boleh_update = ?,
                        a_boleh_delete = ?,
                        a_boleh_sanggah = 0,
                        approval_menu = 1,
                        soft_delete = 0,
                        last_update = ?,
                        last_sync = ?,
                        id_updater = ?
                    WHERE id_menu = ? AND id_peran = ?",
                    [$canCrud, $canCrud, $canCrud, $now, $now, self::UPDATER_ID, $menuId, $roleId]
                );
            } else {
                // Insert new assignment
                DB::insert(
                    "INSERT INTO man_akses.menu_role
                        (id_peran, id_menu, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete,
                         a_boleh_sanggah, approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater)
                    VALUES (?, ?, 'full', 1, ?, ?, ?, 0, 1, ?, ?, 0, ?, ?)",
                    [$roleId, $menuId, $canCrud, $canCrud, $canCrud, $now, $now, $now, self::UPDATER_ID]
                );
            }
            $count++;
        }

        return $count;
    }
}
