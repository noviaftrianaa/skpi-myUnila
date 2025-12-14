<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Portal Menu Seeder
 *
 * Seeds menu and menu_role tables for portal applications
 * This creates a "Portal Access" menu for each app and assigns it to appropriate roles
 *
 * Usage:
 *   php artisan db:seed --class=PortalMenuSeeder
 *
 * Note: Run PortalAplikasiSeeder first!
 */
class PortalMenuSeeder extends Seeder
{
    // Role IDs from database (man_akses.peran)
    // Updated based on actual database values
    private const ROLE_ADMINISTRATOR = 1;
    private const ROLE_DEVELOPER = 107;
    private const ROLE_MAHASISWA = 39;        // Was 2, actual is 39
    private const ROLE_DOSEN = 46;            // Was 3, actual is 46
    private const ROLE_TENDIK = 111;
    private const ROLE_REKTOR = 38;
    private const ROLE_WAKIL_REKTOR_1 = 37;   // Was 33, actual is 37
    private const ROLE_WAKIL_REKTOR_2 = 36;   // Was 34, actual is 36
    private const ROLE_WAKIL_REKTOR_3 = 35;
    private const ROLE_WAKIL_REKTOR_4 = 34;   // Was 36, actual is 34
    private const ROLE_DEKAN = 43;            // Was 40, actual is 43
    private const ROLE_KAPRODI = 42;          // Was 5, actual is 42
    private const ROLE_ADMIN_PRODI = 6;
    private const ROLE_ADMIN_FAKULTAS = 106;
    private const ROLE_LP3M = 33;
    private const ROLE_HELPDESK = 32;

    // Common role groups
    private const ROLES_ALL = [
        self::ROLE_ADMINISTRATOR,
        self::ROLE_DEVELOPER,
        self::ROLE_MAHASISWA,
        self::ROLE_DOSEN,
        self::ROLE_TENDIK,
    ];

    private const ROLES_PIMPINAN = [
        self::ROLE_ADMINISTRATOR,
        self::ROLE_DEVELOPER,
        self::ROLE_REKTOR,
        self::ROLE_WAKIL_REKTOR_1,
        self::ROLE_WAKIL_REKTOR_2,
        self::ROLE_WAKIL_REKTOR_3,
        self::ROLE_WAKIL_REKTOR_4,
        self::ROLE_LP3M,
    ];

    private const ROLES_AKADEMIK = [
        self::ROLE_ADMINISTRATOR,
        self::ROLE_DEVELOPER,
        self::ROLE_MAHASISWA,
        self::ROLE_DOSEN,
        self::ROLE_KAPRODI,
        self::ROLE_ADMIN_PRODI,
        self::ROLE_ADMIN_FAKULTAS,
        self::ROLE_DEKAN,
    ];

    private const ROLES_DEVELOPER_ONLY = [
        self::ROLE_ADMINISTRATOR,
        self::ROLE_DEVELOPER,
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding Portal Menu data...');

        // Get all portal apps
        $apps = DB::select("
            SELECT id_aplikasi, nm_aplikasi, app_slug
            FROM man_akses.aplikasi
            WHERE a_tampil_portal = 1
            ORDER BY nm_aplikasi
        ");

        if (empty($apps)) {
            $this->command->warn('No portal apps found. Run PortalAplikasiSeeder first!');
            return;
        }

        $menuCreated = 0;
        $menuRoleCreated = 0;

        foreach ($apps as $app) {
            // Create portal access menu for this app
            $menuId = $this->createMenuForApp($app);

            if ($menuId) {
                $menuCreated++;

                // Assign roles to this menu based on app type
                $roles = $this->getRolesForApp($app->app_slug);
                $assigned = $this->assignRolesToMenu($menuId, $roles);
                $menuRoleCreated += $assigned;
            }
        }

        $this->command->info("Menu created: {$menuCreated}, Menu-Role assignments: {$menuRoleCreated}");
        $this->command->info('Portal Menu seeding completed!');
    }

    /**
     * Create a menu entry for an app (Portal Access)
     */
    private function createMenuForApp(object $app): ?string
    {
        $menuName = "Portal: {$app->nm_aplikasi}";

        // Check if menu already exists
        $existing = DB::selectOne("
            SELECT id_menu FROM man_akses.menu
            WHERE id_aplikasi = ? AND nm_menu = ?
        ", [$app->id_aplikasi, $menuName]);

        if ($existing) {
            $this->command->line("  - Menu '{$menuName}' already exists");
            return $existing->id_menu;
        }

        // Create new menu
        $menuId = Str::uuid()->toString();

        DB::insert("
            INSERT INTO man_akses.menu
            (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, tgl_create, last_update, last_sync)
            VALUES (?, ?, ?, 1, 1, 1, 'portal', 0, ?, GETDATE(), GETDATE(), GETDATE())
        ", [$menuId, $menuName, 'portal-access', $app->id_aplikasi]);

        $this->command->line("  + Menu '{$menuName}' created");

        return $menuId;
    }

    /**
     * Get roles that should have access to an app
     */
    private function getRolesForApp(string $appSlug): array
    {
        return match ($appSlug) {
            // Developer/Admin only tools
            'api-gateway', 'monitoring', 'manajemen-akses' => self::ROLES_DEVELOPER_ONLY,

            // Pimpinan dashboard
            'dashboard-pimpinan', 'iku-dashboard' => self::ROLES_PIMPINAN,

            // Data dan Pelaporan (restricted)
            'feeder-integrator', 'sister-integrator', 'myunila-integrator', 'data-unila' => self::ROLES_PIMPINAN,

            // Akademik apps (students, lecturers, academic staff)
            'siakadu', 'e-kkn', 'berdampak-mbkm', 'v-class', 'wali', 'sikebas', 'presensi-sirandu', 'spmi' => self::ROLES_AKADEMIK,

            // Kepegawaian
            'sikep' => [
                self::ROLE_ADMINISTRATOR,
                self::ROLE_DEVELOPER,
                self::ROLE_DOSEN,
                self::ROLE_TENDIK,
            ],

            // Riset (Dosen focused)
            'si-penelitian', 'si-pengabdian', 'si-publikasi', 'sikerma' => [
                self::ROLE_ADMINISTRATOR,
                self::ROLE_DEVELOPER,
                self::ROLE_DOSEN,
                self::ROLE_KAPRODI,
                self::ROLE_DEKAN,
            ],

            // Kemahasiswaan
            'si-prestasi', 'beasiswa', 'ormawa', 'minat-bakat' => [
                self::ROLE_ADMINISTRATOR,
                self::ROLE_DEVELOPER,
                self::ROLE_MAHASISWA,
            ],

            // Alumni
            'tracer-study', 'service-layanan' => self::ROLES_ALL,

            // Public layanan
            'helpdesk-tik', 'blog-unila' => self::ROLES_ALL,

            // Default: all common roles
            default => self::ROLES_ALL,
        };
    }

    /**
     * Assign roles to a menu
     */
    private function assignRolesToMenu(string $menuId, array $roleIds): int
    {
        $assigned = 0;

        foreach ($roleIds as $roleId) {
            // Check if assignment already exists
            $existing = DB::selectOne("
                SELECT 1 FROM man_akses.menu_role
                WHERE id_menu = ? AND id_peran = ?
            ", [$menuId, $roleId]);

            if ($existing) {
                continue;
            }

            // Create menu_role assignment
            DB::insert("
                INSERT INTO man_akses.menu_role
                (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, a_boleh_sanggah, approval_menu, tgl_create, last_update, soft_delete, last_sync, id_updater)
                VALUES (?, ?, 'full', 1, 1, 0, 0, 0, 1, GETDATE(), GETDATE(), 0, GETDATE(), ?)
            ", [$roleId, $menuId, '00000000-0000-0000-0000-000000000000']);

            $assigned++;
        }

        return $assigned;
    }
}
