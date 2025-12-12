<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Portal Master Seeder
 *
 * Runs all portal-related seeders in correct order:
 * 1. PortalAplikasiSeeder - Creates kategori_aplikasi and aplikasi
 * 2. PortalMenuSeeder - Creates menu and menu_role assignments
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
        $this->command->info('Step 1/2: Seeding Kategori & Aplikasi...');
        $this->call(PortalAplikasiSeeder::class);
        $this->command->info('');

        // Step 2: Seed Menu & Menu Role
        $this->command->info('Step 2/2: Seeding Menu & Menu Role...');
        $this->call(PortalMenuSeeder::class);
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
