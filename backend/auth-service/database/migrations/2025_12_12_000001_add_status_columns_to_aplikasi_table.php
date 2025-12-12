<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Migration: Add status columns to aplikasi table
 *
 * Adds:
 * - a_maintenance: App is under maintenance (1=yes, 0=no)
 * - a_coming_soon: App is coming soon / not yet available (1=yes, 0=no)
 * - a_terintegrasi: App is integrated with portal SSO (1=yes, 0=no)
 *
 * Usage:
 *   php artisan migrate
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add a_maintenance column
        if (!$this->columnExists('a_maintenance')) {
            DB::statement("ALTER TABLE man_akses.aplikasi ADD a_maintenance BIT DEFAULT 0");
        }

        // Add a_coming_soon column
        if (!$this->columnExists('a_coming_soon')) {
            DB::statement("ALTER TABLE man_akses.aplikasi ADD a_coming_soon BIT DEFAULT 0");
        }

        // Add a_terintegrasi column (integrated with portal SSO)
        if (!$this->columnExists('a_terintegrasi')) {
            DB::statement("ALTER TABLE man_akses.aplikasi ADD a_terintegrasi BIT DEFAULT 0");
        }

        // Create indexes for better filtering performance
        $this->createIndexIfNotExists('IX_aplikasi_maintenance', 'a_maintenance');
        $this->createIndexIfNotExists('IX_aplikasi_coming_soon', 'a_coming_soon');
        $this->createIndexIfNotExists('IX_aplikasi_terintegrasi', 'a_terintegrasi');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes first
        $this->dropIndexIfExists('IX_aplikasi_maintenance');
        $this->dropIndexIfExists('IX_aplikasi_coming_soon');
        $this->dropIndexIfExists('IX_aplikasi_terintegrasi');

        // Drop columns
        if ($this->columnExists('a_maintenance')) {
            DB::statement("ALTER TABLE man_akses.aplikasi DROP COLUMN a_maintenance");
        }

        if ($this->columnExists('a_coming_soon')) {
            DB::statement("ALTER TABLE man_akses.aplikasi DROP COLUMN a_coming_soon");
        }

        if ($this->columnExists('a_terintegrasi')) {
            DB::statement("ALTER TABLE man_akses.aplikasi DROP COLUMN a_terintegrasi");
        }
    }

    /**
     * Check if column exists in aplikasi table
     */
    private function columnExists(string $column): bool
    {
        $result = DB::selectOne("
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'man_akses'
            AND TABLE_NAME = 'aplikasi'
            AND COLUMN_NAME = ?
        ", [$column]);

        return $result !== null;
    }

    /**
     * Create index if not exists
     */
    private function createIndexIfNotExists(string $indexName, string $column): void
    {
        $result = DB::selectOne("
            SELECT 1 FROM sys.indexes
            WHERE name = ? AND object_id = OBJECT_ID('man_akses.aplikasi')
        ", [$indexName]);

        if (!$result) {
            DB::statement("CREATE INDEX {$indexName} ON man_akses.aplikasi({$column})");
        }
    }

    /**
     * Drop index if exists
     */
    private function dropIndexIfExists(string $indexName): void
    {
        $result = DB::selectOne("
            SELECT 1 FROM sys.indexes
            WHERE name = ? AND object_id = OBJECT_ID('man_akses.aplikasi')
        ", [$indexName]);

        if ($result) {
            DB::statement("DROP INDEX {$indexName} ON man_akses.aplikasi");
        }
    }
};
