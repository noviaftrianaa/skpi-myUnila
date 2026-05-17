<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Portal Master Seeder
 *
 * Runs portal seeders dalam order yang benar:
 * 1. PortalAplikasiSeeder - Aplikasi + kategori (idempotent)
 * 2. PortalMenuSeeder     - Menu records (idempotent)
 *
 * CATATAN: RBAC (menu_role) TIDAK lagi via seeder — pakai SQL script
 * versioned di `database/sql/rbac/` agar lebih kontrol & reviewable.
 * Alasan: seeder lama (PortalRbacSeeder) sempat menghapus existing
 * assignments bila JSON config tidak sinkron, menyebabkan loss-of-access.
 *
 * Usage:
 *   php artisan db:seed --class=PortalSeeder
 *   # Untuk RBAC, jalankan SQL: ./database/sql/rbac/YYYYMMDD_*.sql
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

        // Step 2: Seed Menu (menu only, no RBAC)
        $this->command->info('Step 2/2: Seeding Menu...');
        $this->call(PortalMenuSeeder::class);
        $this->command->info('');

        $this->command->info('╔══════════════════════════════════════════════════════════════╗');
        $this->command->info('║              SEEDING COMPLETED SUCCESSFULLY!                 ║');
        $this->command->info('╚══════════════════════════════════════════════════════════════╝');
        $this->command->info('');
        $this->command->info('Next steps:');
        $this->command->info('  1. Untuk RBAC (menu_role assignments), pakai SQL script');
        $this->command->info('     di database/sql/rbac/  — versioned per perubahan');
        $this->command->info('  2. Test API: GET /api/v1/user-context');
        $this->command->info('');
    }
}
