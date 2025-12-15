<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * SISTER Integrator Menu Seeder
 *
 * Seeds menu and menu_role tables for SISTER Integrator app
 * Based on: frontend/src/app/dashboard/sister-integrator/config/menuConfig.tsx
 *
 * Usage:
 *   php artisan db:seed --class=SisterIntegratorMenuSeeder
 */
class SisterIntegratorMenuSeeder extends Seeder
{
    // Role IDs that have access to SISTER Integrator
    private const ROLES = [
        1,   // Administrator
        107, // Developer
        33,  // LP3M UNILA
        38,  // Rektor
        37,  // Wakil Rektor 1
        36,  // Wakil Rektor 2
        35,  // Wakil Rektor 3
        34,  // Wakil Rektor 4
    ];

    // Default updater ID
    private const UPDATER_ID = '00000000-0000-0000-0000-000000000000';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding SISTER Integrator Menu...');

        // Step 1: Get SISTER Integrator app ID
        $app = DB::selectOne(
            "SELECT CONVERT(VARCHAR(36), id_aplikasi) as id_aplikasi FROM man_akses.aplikasi WHERE app_slug = ?",
            ['sister-integrator']
        );

        if (!$app) {
            $this->command->error('SISTER Integrator app not found! Run PortalAplikasiSeeder first.');
            return;
        }

        $appId = $app->id_aplikasi;
        $this->command->line("  Found SISTER Integrator app: {$appId}");

        // Step 2: Define menu structure based on frontend menuConfig.tsx
        $menus = $this->getMenuStructure($appId);

        // Step 3: Seed menus and menu_role
        $this->seedMenus($menus, $appId);

        $this->command->info('SISTER Integrator Menu seeding completed!');
    }

    /**
     * Get menu structure based on frontend config
     */
    private function getMenuStructure(string $appId): array
    {
        return [
            // Level 0 - Main menus (no parent)
            [
                'nm_menu' => 'Dashboard',
                'nm_file' => '/dashboard/sister-integrator',
                'icon' => 'mdi:view-dashboard',
                'level_menu' => 0,
                'urutan_menu' => 1,
                'parent_key' => null,
                'children' => [],
            ],
            [
                'nm_menu' => 'Referensi',
                'nm_file' => '/dashboard/sister-integrator/referensi',
                'icon' => 'heroicons:book-open',
                'level_menu' => 0,
                'urutan_menu' => 2,
                'parent_key' => null,
                'children' => [],
            ],
            [
                'nm_menu' => 'Data PDRD',
                'nm_file' => '#',  // Parent menu, no direct link
                'icon' => 'heroicons:database',
                'level_menu' => 0,
                'urutan_menu' => 3,
                'parent_key' => null,
                'children' => [
                    [
                        'nm_menu' => 'Dosen',
                        'nm_file' => '/dashboard/sister-integrator/pdrd/dosen',
                        'icon' => 'heroicons:users',
                        'urutan_menu' => 1,
                    ],
                    [
                        'nm_menu' => 'Penugasan PTK',
                        'nm_file' => '/dashboard/sister-integrator/pdrd/penugasan',
                        'icon' => 'heroicons:clipboard-document-list',
                        'urutan_menu' => 2,
                    ],
                    [
                        'nm_menu' => 'Penelitian',
                        'nm_file' => '/dashboard/sister-integrator/pdrd/penelitian',
                        'icon' => 'heroicons:document-magnifying-glass',
                        'urutan_menu' => 3,
                    ],
                    [
                        'nm_menu' => 'Pengabdian',
                        'nm_file' => '/dashboard/sister-integrator/pdrd/pengabdian',
                        'icon' => 'heroicons:user-group',
                        'urutan_menu' => 4,
                    ],
                    [
                        'nm_menu' => 'Publikasi',
                        'nm_file' => '/dashboard/sister-integrator/pdrd/publikasi',
                        'icon' => 'heroicons:newspaper',
                        'urutan_menu' => 5,
                    ],
                    [
                        'nm_menu' => 'Pendidikan Formal',
                        'nm_file' => '/dashboard/sister-integrator/pdrd/pendidikan-formal',
                        'icon' => 'heroicons:academic-cap',
                        'urutan_menu' => 6,
                    ],
                    [
                        'nm_menu' => 'Riwayat Pekerjaan',
                        'nm_file' => '/dashboard/sister-integrator/pdrd/riwayat-pekerjaan',
                        'icon' => 'heroicons:briefcase',
                        'urutan_menu' => 7,
                    ],
                    [
                        'nm_menu' => 'Jabatan Fungsional',
                        'nm_file' => '/dashboard/sister-integrator/pdrd/jabatan-fungsional',
                        'icon' => 'heroicons:identification',
                        'urutan_menu' => 8,
                    ],
                    [
                        'nm_menu' => 'Jabatan Struktural',
                        'nm_file' => '/dashboard/sister-integrator/pdrd/jabatan-struktural',
                        'icon' => 'heroicons:building-office',
                        'urutan_menu' => 9,
                    ],
                    [
                        'nm_menu' => 'Tugas Tambahan',
                        'nm_file' => '/dashboard/sister-integrator/pdrd/tugas-tambahan',
                        'icon' => 'heroicons:plus-circle',
                        'urutan_menu' => 10,
                    ],
                    [
                        'nm_menu' => 'Sertifikasi Dosen',
                        'nm_file' => '/dashboard/sister-integrator/pdrd/sertifikasi-dosen',
                        'icon' => 'heroicons:document-check',
                        'urutan_menu' => 11,
                    ],
                    [
                        'nm_menu' => 'Bidang Ilmu',
                        'nm_file' => '/dashboard/sister-integrator/pdrd/bidang-ilmu',
                        'icon' => 'heroicons:light-bulb',
                        'urutan_menu' => 12,
                    ],
                ],
            ],
            [
                'nm_menu' => 'Monitoring',
                'nm_file' => '/dashboard/sister-integrator/monitoring',
                'icon' => 'heroicons:chart-bar',
                'level_menu' => 0,
                'urutan_menu' => 4,
                'parent_key' => null,
                'children' => [],
            ],
            [
                'nm_menu' => 'Sync Logs',
                'nm_file' => '/dashboard/sister-integrator/logs',
                'icon' => 'heroicons:document-text',
                'level_menu' => 0,
                'urutan_menu' => 5,
                'parent_key' => null,
                'children' => [],
            ],
            [
                'nm_menu' => 'API Configuration',
                'nm_file' => '/dashboard/sister-integrator/settings',
                'icon' => 'heroicons:cog-6-tooth',
                'level_menu' => 0,
                'urutan_menu' => 6,
                'parent_key' => null,
                'children' => [],
            ],
        ];
    }

    /**
     * Seed menus and their role assignments
     */
    private function seedMenus(array $menus, string $appId): void
    {
        $now = now()->format('Y-m-d H:i:s');
        $menuCount = 0;
        $roleCount = 0;

        foreach ($menus as $menu) {
            // Create or update parent menu
            $menuId = $this->createOrUpdateMenu($menu, $appId, null, $now);
            $menuCount++;

            // Assign roles to parent menu
            $roleCount += $this->assignRolesToMenu($menuId, $now);

            // Process children
            if (!empty($menu['children'])) {
                foreach ($menu['children'] as $child) {
                    $childId = $this->createOrUpdateMenu($child, $appId, $menuId, $now, 1);
                    $menuCount++;
                    $roleCount += $this->assignRolesToMenu($childId, $now);
                }
            }
        }

        $this->command->info("  Menus: {$menuCount} processed, Role assignments: {$roleCount}");
    }

    /**
     * Create or update a menu record
     */
    private function createOrUpdateMenu(array $menu, string $appId, ?string $parentId, string $now, int $level = 0): string
    {
        // Check if menu exists by nm_file and id_aplikasi
        $existing = DB::selectOne(
            "SELECT CONVERT(VARCHAR(36), id_menu) as id_menu FROM man_akses.menu
             WHERE nm_file = ? AND id_aplikasi = ?",
            [$menu['nm_file'], $appId]
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
                [
                    $menu['nm_menu'],
                    $menu['icon'],
                    $menu['level_menu'] ?? $level,
                    $menu['urutan_menu'],
                    $parentId,
                    $now,
                    $now,
                    $existing->id_menu
                ]
            );
            $this->command->line("  ~ Updated menu: {$menu['nm_menu']}");
            return $existing->id_menu;
        }

        // Insert new menu
        $menuId = Str::uuid()->toString();
        DB::insert(
            "INSERT INTO man_akses.menu
            (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu,
             a_aktif, a_tampil, tgl_create, last_update, last_sync, expired_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?, NULL)",
            [
                $menuId,
                $menu['nm_menu'],
                $menu['nm_file'],
                $menu['icon'],
                $menu['level_menu'] ?? $level,
                $menu['urutan_menu'],
                $appId,
                $parentId,
                $now,
                $now,
                $now
            ]
        );
        $this->command->line("  + Created menu: {$menu['nm_menu']}");
        return $menuId;
    }

    /**
     * Assign roles to a menu
     */
    private function assignRolesToMenu(string $menuId, string $now): int
    {
        $count = 0;

        foreach (self::ROLES as $roleId) {
            // Check if assignment exists
            $existing = DB::selectOne(
                "SELECT 1 FROM man_akses.menu_role WHERE id_menu = ? AND id_peran = ?",
                [$menuId, $roleId]
            );

            if ($existing) {
                // Update: restore if soft deleted, update permissions
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
                    [
                        // Only Developer and Administrator can insert/update/delete
                        in_array($roleId, [1, 107]) ? 1 : 0,
                        in_array($roleId, [1, 107]) ? 1 : 0,
                        in_array($roleId, [1, 107]) ? 1 : 0,
                        $now,
                        $now,
                        self::UPDATER_ID,
                        $menuId,
                        $roleId
                    ]
                );
            } else {
                // Insert new assignment
                DB::insert(
                    "INSERT INTO man_akses.menu_role
                    (id_peran, id_menu, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete,
                     a_boleh_sanggah, approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater)
                    VALUES (?, ?, 'full', 1, ?, ?, ?, 0, 1, ?, ?, 0, ?, ?)",
                    [
                        $roleId,
                        $menuId,
                        in_array($roleId, [1, 107]) ? 1 : 0,
                        in_array($roleId, [1, 107]) ? 1 : 0,
                        in_array($roleId, [1, 107]) ? 1 : 0,
                        $now,
                        $now,
                        $now,
                        self::UPDATER_ID
                    ]
                );
            }
            $count++;
        }

        return $count;
    }
}
