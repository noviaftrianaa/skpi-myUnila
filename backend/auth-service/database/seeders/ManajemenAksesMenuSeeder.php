<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Manajemen Akses Menu Seeder
 *
 * Seeds menu for the Manajemen Akses application
 * Menu structure mirrors frontend menuConfig.tsx
 *
 * Usage:
 *   php artisan db:seed --class=ManajemenAksesMenuSeeder
 */
class ManajemenAksesMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding Manajemen Akses Menu data...');

        // Get Manajemen Akses aplikasi ID
        $aplikasi = DB::selectOne(
            "SELECT id_aplikasi FROM man_akses.aplikasi WHERE app_slug = ?",
            ['manajemen-akses']
        );

        if (!$aplikasi) {
            $this->command->error('  ! Aplikasi "Manajemen Akses" tidak ditemukan. Jalankan PortalAplikasiSeeder terlebih dahulu.');
            return;
        }

        $idAplikasi = $aplikasi->id_aplikasi;
        $this->command->line("  Found aplikasi: {$idAplikasi}");

        $menus = $this->getMenuData();
        $created = 0;
        $skipped = 0;

        foreach ($menus as $menu) {
            $result = $this->createMenu($idAplikasi, $menu, null);
            $created += $result['created'];
            $skipped += $result['skipped'];
        }

        $this->command->info("  Menu seeding completed: {$created} created, {$skipped} skipped");
    }

    /**
     * Create menu and its children recursively
     */
    private function createMenu(string $idAplikasi, array $menu, ?string $parentId): array
    {
        $created = 0;
        $skipped = 0;

        // Check if menu already exists by nm_file (path)
        $existing = DB::selectOne(
            "SELECT id_menu FROM man_akses.menu WHERE id_aplikasi = ? AND nm_file = ? AND expired_date IS NULL",
            [$idAplikasi, $menu['nm_file']]
        );

        if ($existing) {
            $this->command->line("  - Skipped '{$menu['nm_menu']}' (already exists)");
            $menuId = $existing->id_menu;
            $skipped++;
        } else {
            $menuId = strtoupper(Str::uuid()->toString());
            $now = now()->format('Y-m-d H:i:s');

            DB::insert(
                "INSERT INTO man_akses.menu
                (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $menuId,
                    $menu['nm_menu'],
                    $menu['nm_file'],
                    $menu['urutan_menu'] ?? 1,
                    $menu['a_aktif'] ?? 1,
                    $menu['a_tampil'] ?? 1,
                    $menu['icon'] ?? null,
                    $menu['level_menu'] ?? 0,
                    $idAplikasi,
                    $parentId,
                    $now,
                    $now,
                    $now,
                ]
            );
            $this->command->line("  + Created '{$menu['nm_menu']}'");
            $created++;
        }

        // Process children
        if (!empty($menu['children'])) {
            foreach ($menu['children'] as $child) {
                $child['level_menu'] = ($menu['level_menu'] ?? 0) + 1;
                $result = $this->createMenu($idAplikasi, $child, $menuId);
                $created += $result['created'];
                $skipped += $result['skipped'];
            }
        }

        return ['created' => $created, 'skipped' => $skipped];
    }

    /**
     * Get menu data structure
     * Mirrors frontend menuConfig.tsx
     */
    private function getMenuData(): array
    {
        return [
            [
                'nm_menu' => 'Dashboard',
                'nm_file' => '/dashboard/manajemen-akses',
                'icon' => 'heroicons:chart-bar-square',
                'urutan_menu' => 1,
                'level_menu' => 0,
                'a_aktif' => 1,
                'a_tampil' => 1,
            ],
            [
                'nm_menu' => 'Manajemen',
                'nm_file' => '/dashboard/manajemen-akses/manajemen',
                'icon' => 'heroicons:squares-2x2',
                'urutan_menu' => 2,
                'level_menu' => 0,
                'a_aktif' => 1,
                'a_tampil' => 1,
                'children' => [
                    [
                        'nm_menu' => 'Daftar Pengguna',
                        'nm_file' => '/dashboard/manajemen-akses/manajemen/pengguna',
                        'icon' => 'heroicons:users',
                        'urutan_menu' => 1,
                        'a_aktif' => 1,
                        'a_tampil' => 1,
                    ],
                    [
                        'nm_menu' => 'Daftar Aplikasi',
                        'nm_file' => '/dashboard/manajemen-akses/manajemen/aplikasi',
                        'icon' => 'heroicons:squares-2x2',
                        'urutan_menu' => 2,
                        'a_aktif' => 1,
                        'a_tampil' => 1,
                    ],
                    [
                        'nm_menu' => 'Role Base Access',
                        'nm_file' => '/dashboard/manajemen-akses/manajemen/rbac',
                        'icon' => 'heroicons:shield-check',
                        'urutan_menu' => 3,
                        'a_aktif' => 1,
                        'a_tampil' => 1,
                    ],
                    [
                        'nm_menu' => 'Menu Aplikasi',
                        'nm_file' => '/dashboard/manajemen-akses/manajemen/menu',
                        'icon' => 'heroicons:list-bullet',
                        'urutan_menu' => 4,
                        'a_aktif' => 1,
                        'a_tampil' => 1,
                    ],
                    [
                        'nm_menu' => 'Kategori Aplikasi',
                        'nm_file' => '/dashboard/manajemen-akses/manajemen/kategori-aplikasi',
                        'icon' => 'heroicons:tag',
                        'urutan_menu' => 5,
                        'a_aktif' => 1,
                        'a_tampil' => 1,
                    ],
                    [
                        'nm_menu' => 'Daftar Unit',
                        'nm_file' => '/dashboard/manajemen-akses/manajemen/unit',
                        'icon' => 'heroicons:building-office',
                        'urutan_menu' => 6,
                        'a_aktif' => 1,
                        'a_tampil' => 1,
                    ],
                    [
                        'nm_menu' => 'Peran',
                        'nm_file' => '/dashboard/manajemen-akses/manajemen/peran',
                        'icon' => 'heroicons:identification',
                        'urutan_menu' => 7,
                        'a_aktif' => 1,
                        'a_tampil' => 1,
                    ],
                    [
                        'nm_menu' => 'WS Endpoint',
                        'nm_file' => '/dashboard/manajemen-akses/manajemen/ws-endpoint',
                        'icon' => 'heroicons:server',
                        'urutan_menu' => 8,
                        'a_aktif' => 1,
                        'a_tampil' => 1,
                    ],
                ],
            ],
            [
                'nm_menu' => 'Logger',
                'nm_file' => '/dashboard/manajemen-akses/logger',
                'icon' => 'heroicons:document-text',
                'urutan_menu' => 3,
                'level_menu' => 0,
                'a_aktif' => 1,
                'a_tampil' => 1,
                'children' => [
                    [
                        'nm_menu' => 'Log Login',
                        'nm_file' => '/dashboard/manajemen-akses/logger/log-login',
                        'icon' => 'heroicons:arrow-right-on-rectangle',
                        'urutan_menu' => 1,
                        'a_aktif' => 1,
                        'a_tampil' => 1,
                    ],
                    [
                        'nm_menu' => 'Log JWT',
                        'nm_file' => '/dashboard/manajemen-akses/logger/log-jwt',
                        'icon' => 'heroicons:key',
                        'urutan_menu' => 2,
                        'a_aktif' => 1,
                        'a_tampil' => 1,
                    ],
                    [
                        'nm_menu' => 'Log Akses',
                        'nm_file' => '/dashboard/manajemen-akses/logger/log-akses',
                        'icon' => 'heroicons:clock',
                        'urutan_menu' => 3,
                        'a_aktif' => 1,
                        'a_tampil' => 1,
                    ],
                ],
            ],
        ];
    }
}
