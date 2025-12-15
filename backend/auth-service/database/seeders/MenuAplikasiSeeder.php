<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Menu Aplikasi Seeder
 *
 * Seeds menu and menu_role tables for integrated applications
 * This creates the menu structure and assigns permissions to roles
 *
 * Usage:
 *   php artisan db:seed --class=MenuAplikasiSeeder
 *
 * To seed specific app only:
 *   php artisan db:seed --class=MenuAplikasiSeeder -- --app=manajemen-akses
 */
class MenuAplikasiSeeder extends Seeder
{
    // Role IDs for permission assignment
    private const ROLE_ADMINISTRATOR = 1;
    private const ROLE_DEVELOPER = 107;

    // Roles that get full access to all menus
    private const SUPER_ROLES = [self::ROLE_ADMINISTRATOR, self::ROLE_DEVELOPER];

    // System user ID for id_updater (use a known system user or create one)
    private const SYSTEM_UPDATER_ID = '00000000-0000-0000-0000-000000000000';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding Menu Aplikasi data...');

        // Get all application menu definitions
        $appsMenus = $this->getAppsMenuDefinitions();

        foreach ($appsMenus as $appSlug => $appData) {
            $this->command->info("Processing: {$appData['name']} ({$appSlug})");

            // Find application by app_slug
            $app = DB::selectOne(
                "SELECT id_aplikasi, nm_aplikasi FROM man_akses.aplikasi WHERE app_slug = ?",
                [$appSlug]
            );

            if (!$app) {
                $this->command->warn("  ! Application not found: {$appSlug}");
                continue;
            }

            // Seed menus for this application
            $this->seedMenusForApp($app->id_aplikasi, $appData['menus']);

            // Seed menu_role for this application
            $this->seedMenuRolesForApp($app->id_aplikasi, $appData['roles'] ?? self::SUPER_ROLES);

            $this->command->line("  ✓ Completed: {$app->nm_aplikasi}");
        }

        $this->command->info('Menu Aplikasi seeding completed!');
    }

    /**
     * Seed menus for an application
     */
    private function seedMenusForApp(string $appId, array $menus, ?string $parentId = null): void
    {
        foreach ($menus as $menu) {
            // Check if menu already exists by nm_file (URL)
            $existing = DB::selectOne(
                "SELECT id_menu FROM man_akses.menu WHERE id_aplikasi = ? AND nm_file = ? AND expired_date IS NULL",
                [$appId, $menu['url']]
            );

            if ($existing) {
                $menuId = $existing->id_menu;
                // Update existing menu
                DB::update(
                    "UPDATE man_akses.menu SET
                        nm_menu = ?,
                        urutan_menu = ?,
                        icon = ?,
                        level_menu = ?,
                        id_group_menu = ?,
                        a_aktif = 1,
                        a_tampil = 1,
                        last_update = GETDATE(),
                        last_sync = GETDATE()
                    WHERE id_menu = ?",
                    [
                        $menu['name'],
                        $menu['order'],
                        $menu['icon'] ?? null,
                        $parentId ? 1 : 0,
                        $parentId,
                        $menuId
                    ]
                );
                $this->command->line("    ~ Updated menu: {$menu['name']}");
            } else {
                // Create new menu
                $menuId = Str::uuid()->toString();
                DB::insert(
                    "INSERT INTO man_akses.menu
                    (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
                    VALUES (?, ?, ?, ?, 1, 1, ?, ?, ?, ?, GETDATE(), GETDATE(), GETDATE())",
                    [
                        $menuId,
                        $menu['name'],
                        $menu['url'],
                        $menu['order'],
                        $menu['icon'] ?? null,
                        $parentId ? 1 : 0,
                        $appId,
                        $parentId
                    ]
                );
                $this->command->line("    + Created menu: {$menu['name']}");
            }

            // Process children recursively
            if (!empty($menu['children'])) {
                $this->seedMenusForApp($appId, $menu['children'], $menuId);
            }
        }
    }

    /**
     * Seed menu_role for an application
     */
    private function seedMenuRolesForApp(string $appId, array $roleIds): void
    {
        // Get all menus for this app
        $menus = DB::select(
            "SELECT id_menu FROM man_akses.menu WHERE id_aplikasi = ? AND expired_date IS NULL",
            [$appId]
        );

        $created = 0;
        $updated = 0;

        foreach ($menus as $menu) {
            foreach ($roleIds as $roleId) {
                // Check if menu_role already exists
                $existing = DB::selectOne(
                    "SELECT id_peran FROM man_akses.menu_role WHERE id_menu = ? AND id_peran = ?",
                    [$menu->id_menu, $roleId]
                );

                if ($existing) {
                    // Update existing
                    DB::update(
                        "UPDATE man_akses.menu_role SET
                            akses_menu = 1,
                            a_boleh_insert = 1,
                            a_boleh_show = 1,
                            a_boleh_delete = 1,
                            a_boleh_update = 1,
                            a_boleh_sanggah = 1,
                            approval_menu = 1,
                            soft_delete = 0,
                            last_update = GETDATE(),
                            last_sync = GETDATE(),
                            id_updater = ?
                        WHERE id_menu = ? AND id_peran = ?",
                        [self::SYSTEM_UPDATER_ID, $menu->id_menu, $roleId]
                    );
                    $updated++;
                } else {
                    // Create new
                    DB::insert(
                        "INSERT INTO man_akses.menu_role
                        (id_menu, id_peran, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, a_boleh_sanggah, approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater)
                        VALUES (?, ?, 1, 1, 1, 1, 1, 1, 1, GETDATE(), GETDATE(), 0, GETDATE(), ?)",
                        [$menu->id_menu, $roleId, self::SYSTEM_UPDATER_ID]
                    );
                    $created++;
                }
            }
        }

        $this->command->line("    Menu roles: {$created} created, {$updated} updated for " . count($roleIds) . " roles");
    }

    /**
     * Get menu definitions for all applications
     *
     * Structure:
     * [
     *   'app-slug' => [
     *     'name' => 'Application Name',
     *     'roles' => [1, 107],  // Role IDs that get access (optional, defaults to SUPER_ROLES)
     *     'menus' => [
     *       [
     *         'name' => 'Menu Name',
     *         'url' => '/path/to/menu',
     *         'icon' => 'heroicons:icon-name',
     *         'order' => 1,
     *         'children' => [...]  // Optional nested menus
     *       ]
     *     ]
     *   ]
     * ]
     */
    private function getAppsMenuDefinitions(): array
    {
        return [
            // ============================================
            // MANAJEMEN AKSES
            // ============================================
            'manajemen-akses' => [
                'name' => 'Manajemen Akses myUnila',
                'roles' => [self::ROLE_ADMINISTRATOR, self::ROLE_DEVELOPER],
                'menus' => [
                    [
                        'name' => 'Dashboard',
                        'url' => '/dashboard/manajemen-akses',
                        'icon' => 'heroicons:home',
                        'order' => 1,
                    ],
                    [
                        'name' => 'Pengguna',
                        'url' => '#pengguna',
                        'icon' => 'heroicons:users',
                        'order' => 2,
                        'children' => [
                            [
                                'name' => 'Daftar Pengguna',
                                'url' => '/dashboard/manajemen-akses/pengguna',
                                'icon' => 'heroicons:user-group',
                                'order' => 1,
                            ],
                            [
                                'name' => 'Peran Pengguna',
                                'url' => '/dashboard/manajemen-akses/peran',
                                'icon' => 'heroicons:identification',
                                'order' => 2,
                            ],
                        ],
                    ],
                    [
                        'name' => 'Manajemen',
                        'url' => '#manajemen',
                        'icon' => 'heroicons:cog-6-tooth',
                        'order' => 3,
                        'children' => [
                            [
                                'name' => 'Aplikasi',
                                'url' => '/dashboard/manajemen-akses/manajemen/aplikasi',
                                'icon' => 'heroicons:squares-2x2',
                                'order' => 1,
                            ],
                            [
                                'name' => 'Kategori Aplikasi',
                                'url' => '/dashboard/manajemen-akses/manajemen/kategori-aplikasi',
                                'icon' => 'heroicons:folder',
                                'order' => 2,
                            ],
                            [
                                'name' => 'Menu',
                                'url' => '/dashboard/manajemen-akses/manajemen/menu',
                                'icon' => 'heroicons:bars-3',
                                'order' => 3,
                            ],
                            [
                                'name' => 'Menu Role',
                                'url' => '/dashboard/manajemen-akses/manajemen/menu-role',
                                'icon' => 'heroicons:shield-check',
                                'order' => 4,
                            ],
                            [
                                'name' => 'Unit Organisasi',
                                'url' => '/dashboard/manajemen-akses/manajemen/unit-organisasi',
                                'icon' => 'heroicons:building-office',
                                'order' => 5,
                            ],
                        ],
                    ],
                ],
            ],

            // ============================================
            // FEEDER INTEGRATOR
            // ============================================
            'feeder-integrator' => [
                'name' => 'Feeder Integrator',
                'roles' => [self::ROLE_ADMINISTRATOR, self::ROLE_DEVELOPER],
                'menus' => [
                    [
                        'name' => 'Dashboard',
                        'url' => '/dashboard/feeder-integrator',
                        'icon' => 'heroicons:home',
                        'order' => 1,
                    ],
                    [
                        'name' => 'Mahasiswa',
                        'url' => '#mahasiswa',
                        'icon' => 'heroicons:academic-cap',
                        'order' => 2,
                        'children' => [
                            [
                                'name' => 'Daftar Mahasiswa',
                                'url' => '/dashboard/feeder-integrator/mahasiswa',
                                'icon' => 'heroicons:users',
                                'order' => 1,
                            ],
                            [
                                'name' => 'Mahasiswa PT',
                                'url' => '/dashboard/feeder-integrator/mahasiswa/pt',
                                'icon' => 'heroicons:building-library',
                                'order' => 2,
                            ],
                        ],
                    ],
                    [
                        'name' => 'Dosen',
                        'url' => '#dosen',
                        'icon' => 'heroicons:user-circle',
                        'order' => 3,
                        'children' => [
                            [
                                'name' => 'Daftar Dosen',
                                'url' => '/dashboard/feeder-integrator/dosen',
                                'icon' => 'heroicons:users',
                                'order' => 1,
                            ],
                        ],
                    ],
                    [
                        'name' => 'Referensi',
                        'url' => '#referensi',
                        'icon' => 'heroicons:book-open',
                        'order' => 4,
                        'children' => [
                            [
                                'name' => 'Program Studi',
                                'url' => '/dashboard/feeder-integrator/referensi/prodi',
                                'icon' => 'heroicons:academic-cap',
                                'order' => 1,
                            ],
                            [
                                'name' => 'Jenjang Pendidikan',
                                'url' => '/dashboard/feeder-integrator/referensi/jenjang',
                                'icon' => 'heroicons:chart-bar',
                                'order' => 2,
                            ],
                        ],
                    ],
                    [
                        'name' => 'Sync',
                        'url' => '#sync',
                        'icon' => 'heroicons:arrow-path',
                        'order' => 5,
                        'children' => [
                            [
                                'name' => 'Sync Mahasiswa',
                                'url' => '/dashboard/feeder-integrator/sync/mahasiswa',
                                'icon' => 'heroicons:arrow-down-tray',
                                'order' => 1,
                            ],
                            [
                                'name' => 'Sync Dosen',
                                'url' => '/dashboard/feeder-integrator/sync/dosen',
                                'icon' => 'heroicons:arrow-down-tray',
                                'order' => 2,
                            ],
                        ],
                    ],
                ],
            ],

            // ============================================
            // SISTER INTEGRATOR
            // ============================================
            'sister-integrator' => [
                'name' => 'SISTER Integrator',
                'roles' => [self::ROLE_ADMINISTRATOR, self::ROLE_DEVELOPER],
                'menus' => [
                    [
                        'name' => 'Dashboard',
                        'url' => '/dashboard/sister-integrator',
                        'icon' => 'heroicons:home',
                        'order' => 1,
                    ],
                    [
                        'name' => 'Referensi',
                        'url' => '/dashboard/sister-integrator/referensi',
                        'icon' => 'heroicons:book-open',
                        'order' => 2,
                        'children' => [
                            [
                                'name' => 'Jenjang Pendidikan',
                                'url' => '/dashboard/sister-integrator/referensi/jenjang-pendidikan',
                                'icon' => 'heroicons:chart-bar',
                                'order' => 1,
                            ],
                            [
                                'name' => 'Bidang Studi',
                                'url' => '/dashboard/sister-integrator/referensi/bidang-studi',
                                'icon' => 'heroicons:light-bulb',
                                'order' => 2,
                            ],
                        ],
                    ],
                    [
                        'name' => 'Data PDRD',
                        'url' => '#pdrd',
                        'icon' => 'heroicons:database',
                        'order' => 3,
                        'children' => [
                            [
                                'name' => 'Profil Dosen',
                                'url' => '/dashboard/sister-integrator/pdrd/profil',
                                'icon' => 'heroicons:user',
                                'order' => 1,
                            ],
                            [
                                'name' => 'Riwayat Pendidikan',
                                'url' => '/dashboard/sister-integrator/pdrd/riwayat-pendidikan',
                                'icon' => 'heroicons:academic-cap',
                                'order' => 2,
                            ],
                            [
                                'name' => 'Riwayat Pekerjaan',
                                'url' => '/dashboard/sister-integrator/pdrd/riwayat-pekerjaan',
                                'icon' => 'heroicons:briefcase',
                                'order' => 3,
                            ],
                        ],
                    ],
                    [
                        'name' => 'Sync',
                        'url' => '#sync',
                        'icon' => 'heroicons:arrow-path',
                        'order' => 4,
                        'children' => [
                            [
                                'name' => 'Sync PDRD',
                                'url' => '/dashboard/sister-integrator/sync/pdrd',
                                'icon' => 'heroicons:arrow-down-tray',
                                'order' => 1,
                            ],
                        ],
                    ],
                ],
            ],

            // ============================================
            // MYUNILA INTEGRATOR
            // ============================================
            'myunila-integrator' => [
                'name' => 'myUnila Integrator',
                'roles' => [self::ROLE_ADMINISTRATOR, self::ROLE_DEVELOPER],
                'menus' => [
                    [
                        'name' => 'Dashboard',
                        'url' => '/dashboard/integrator',
                        'icon' => 'heroicons:home',
                        'order' => 1,
                    ],
                    [
                        'name' => 'Data Mahasiswa',
                        'url' => '#mahasiswa',
                        'icon' => 'heroicons:academic-cap',
                        'order' => 2,
                        'children' => [
                            [
                                'name' => 'Daftar Mahasiswa',
                                'url' => '/dashboard/integrator/mahasiswa',
                                'icon' => 'heroicons:users',
                                'order' => 1,
                            ],
                        ],
                    ],
                    [
                        'name' => 'Data Dosen',
                        'url' => '#dosen',
                        'icon' => 'heroicons:user-circle',
                        'order' => 3,
                        'children' => [
                            [
                                'name' => 'Daftar Dosen',
                                'url' => '/dashboard/integrator/dosen',
                                'icon' => 'heroicons:users',
                                'order' => 1,
                            ],
                        ],
                    ],
                    [
                        'name' => 'Data Pegawai',
                        'url' => '#pegawai',
                        'icon' => 'heroicons:identification',
                        'order' => 4,
                        'children' => [
                            [
                                'name' => 'Daftar Pegawai',
                                'url' => '/dashboard/integrator/pegawai',
                                'icon' => 'heroicons:users',
                                'order' => 1,
                            ],
                        ],
                    ],
                ],
            ],

            // ============================================
            // API GATEWAY (Kong Admin)
            // ============================================
            'api-gateway' => [
                'name' => 'API Gateway',
                'roles' => [self::ROLE_DEVELOPER],
                'menus' => [
                    [
                        'name' => 'Dashboard',
                        'url' => '/portal/kong-admin',
                        'icon' => 'heroicons:home',
                        'order' => 1,
                    ],
                    [
                        'name' => 'Services',
                        'url' => '/portal/kong-admin/services',
                        'icon' => 'heroicons:cube',
                        'order' => 2,
                    ],
                    [
                        'name' => 'Routes',
                        'url' => '/portal/kong-admin/routes',
                        'icon' => 'heroicons:arrow-path',
                        'order' => 3,
                    ],
                    [
                        'name' => 'Plugins',
                        'url' => '/portal/kong-admin/plugins',
                        'icon' => 'heroicons:puzzle-piece',
                        'order' => 4,
                    ],
                    [
                        'name' => 'Consumers',
                        'url' => '/portal/kong-admin/consumers',
                        'icon' => 'heroicons:users',
                        'order' => 5,
                    ],
                ],
            ],

            // ============================================
            // MONITORING (Grafana, etc)
            // ============================================
            'monitoring' => [
                'name' => 'Monitoring & Observability',
                'roles' => [self::ROLE_DEVELOPER],
                'menus' => [
                    [
                        'name' => 'Dashboard',
                        'url' => '/portal/monitoring',
                        'icon' => 'heroicons:chart-bar',
                        'order' => 1,
                    ],
                    [
                        'name' => 'Metrics',
                        'url' => '/portal/monitoring/metrics',
                        'icon' => 'heroicons:chart-pie',
                        'order' => 2,
                    ],
                    [
                        'name' => 'Logs',
                        'url' => '/portal/monitoring/logs',
                        'icon' => 'heroicons:document-text',
                        'order' => 3,
                    ],
                    [
                        'name' => 'Traces',
                        'url' => '/portal/monitoring/traces',
                        'icon' => 'heroicons:map',
                        'order' => 4,
                    ],
                ],
            ],
        ];
    }
}
