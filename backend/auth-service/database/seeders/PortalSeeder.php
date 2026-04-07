<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Portal Master Seeder
 *
 * Runs all portal-related seeders in correct order:
 * 1. PortalAplikasiSeeder - Creates kategori_aplikasi and aplikasi
 * 2. PortalMenuSeeder - Creates menu records (no RBAC)
 * 3. PortalRbacSeeder - Creates menu_role assignments (RBAC)
 *
 * Usage:
 *   php artisan db:seed --class=PortalSeeder
 */
class PortalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('╔══════════════════════════════════════════════════════════════╗');
        $this->command->info('║              PORTAL DATABASE SEEDER                          ║');
        $this->command->info('╚══════════════════════════════════════════════════════════════╝');
        $this->command->info('');

        // Step 1: Seed Kategori & Aplikasi
        $this->command->info('Step 1/3: Seeding Kategori & Aplikasi...');
        $this->call(PortalAplikasiSeeder::class);
        $this->command->info('');

        // Step 2: Seed Menu (menu only, no RBAC)
        $this->command->info('Step 2/3: Seeding Menu...');
        $this->call(PortalMenuSeeder::class);
        $this->command->info('');

        // Step 3: Seed RBAC (menu_role assignments)
        $this->command->info('Step 3/3: Seeding RBAC (Menu Role Assignments)...');
        $this->call(PortalRbacSeeder::class);
        $this->command->info('');

        $this->command->info('╔══════════════════════════════════════════════════════════════╗');
        $this->command->info('║              SEEDING COMPLETED SUCCESSFULLY!                 ║');
        $this->command->info('╚══════════════════════════════════════════════════════════════╝');
        $this->command->info('');
        $this->command->info('Next steps:');
        $this->command->info('  1. Test API: GET /api/v1/user-context');
        $this->command->info('  2. Check apps access for your user');
        $this->command->info('');
    }
}
