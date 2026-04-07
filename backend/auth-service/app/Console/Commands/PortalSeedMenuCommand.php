<?php

namespace App\Console\Commands;

use Database\Seeders\PortalMenuSeeder;
use Database\Seeders\PortalRbacSeeder;
use Illuminate\Console\Command;

/**
 * Artisan command to seed portal menus selectively per-app
 *
 * Usage:
 *   php artisan portal:seed-menu                    # interactive - pilih app
 *   php artisan portal:seed-menu --app=siakadu      # seed 1 app saja
 *   php artisan portal:seed-menu --all              # seed semua app
 *   php artisan portal:seed-menu --list             # list app yang tersedia
 *   php artisan portal:seed-menu --menu-only        # hanya menu, tanpa RBAC
 *   php artisan portal:seed-menu --rbac-only        # hanya RBAC, tanpa menu
 */
class PortalSeedMenuCommand extends Command
{
    protected $signature = 'portal:seed-menu
                            {--app= : Seed specific app by slug (e.g. siakadu, manajemen-akses)}
                            {--all : Seed all apps}
                            {--list : List available apps}
                            {--menu-only : Only seed menus (skip RBAC)}
                            {--rbac-only : Only seed RBAC (skip menus)}';

    protected $description = 'Seed portal menus and RBAC from per-app JSON files';

    public function handle(): int
    {
        // --list: show available apps
        if ($this->option('list')) {
            return $this->listApps();
        }

        $appSlug = $this->option('app');
        $seedAll = $this->option('all');
        $menuOnly = $this->option('menu-only');
        $rbacOnly = $this->option('rbac-only');

        // Neither --app nor --all: interactive mode
        if (!$appSlug && !$seedAll) {
            $appSlug = $this->interactiveSelect();
            if ($appSlug === null) {
                return self::SUCCESS;
            }
            if ($appSlug === '__all__') {
                $appSlug = null; // seed all
            }
        }

        $this->newLine();
        $this->info('╔══════════════════════════════════════════════════════════════╗');
        $this->info('║              PORTAL MENU SEEDER                             ║');
        $this->info('╚══════════════════════════════════════════════════════════════╝');
        $this->newLine();

        if ($appSlug) {
            $this->info("Target: {$appSlug}");
        } else {
            $this->info('Target: ALL apps');
        }
        $this->newLine();

        // Step 1: Seed Menus
        if (!$rbacOnly) {
            $this->info('Step 1: Seeding Menus...');
            $menuSeeder = $this->laravel->make(PortalMenuSeeder::class);
            $menuSeeder->setAppSlug($appSlug);
            $menuSeeder->setCommand($this);
            $menuSeeder->run();
            $this->newLine();
        }

        // Step 2: Seed RBAC
        if (!$menuOnly) {
            $this->info($rbacOnly ? 'Seeding RBAC...' : 'Step 2: Seeding RBAC...');
            $rbacSeeder = $this->laravel->make(PortalRbacSeeder::class);
            $rbacSeeder->setAppSlug($appSlug);
            $rbacSeeder->setCommand($this);
            $rbacSeeder->run();
            $this->newLine();
        }

        $this->info('╔══════════════════════════════════════════════════════════════╗');
        $this->info('║              SEEDING COMPLETED!                             ║');
        $this->info('╚══════════════════════════════════════════════════════════════╝');
        $this->newLine();

        return self::SUCCESS;
    }

    /**
     * List available apps from per-app JSON files
     */
    private function listApps(): int
    {
        $apps = PortalMenuSeeder::getAvailableApps();

        if (empty($apps)) {
            $this->warn('No per-app JSON files found in database/seeders/data/portal_menus/');
            return self::FAILURE;
        }

        $this->info('Available apps:');
        $this->newLine();

        $headers = ['#', 'App Slug', 'File', 'Menus'];
        $rows = [];

        foreach ($apps as $i => $app) {
            $rows[] = [$i + 1, $app['slug'], $app['file'], $app['menu_count']];
        }

        $this->table($headers, $rows);

        $this->newLine();
        $this->info('Usage:');
        $this->line('  php artisan portal:seed-menu --app=' . $apps[0]['slug']);
        $this->line('  php artisan portal:seed-menu --all');
        $this->line('  php artisan portal:seed-menu          # interactive');

        return self::SUCCESS;
    }

    /**
     * Interactive app selection
     */
    private function interactiveSelect(): ?string
    {
        $apps = PortalMenuSeeder::getAvailableApps();

        if (empty($apps)) {
            $this->warn('No per-app JSON files found!');
            return null;
        }

        $choices = [];
        foreach ($apps as $app) {
            $choices[] = "{$app['slug']} ({$app['menu_count']} menus)";
        }
        $choices[] = 'All apps';
        $choices[] = 'Cancel';

        $selected = $this->choice(
            'Pilih aplikasi yang ingin di-seed',
            $choices,
            count($choices) - 2 // default: All apps
        );

        if ($selected === 'Cancel') {
            $this->info('Cancelled.');
            return null;
        }

        if ($selected === 'All apps') {
            return '__all__';
        }

        // Extract slug from "slug (N menus)"
        return explode(' ', $selected)[0];
    }
}
