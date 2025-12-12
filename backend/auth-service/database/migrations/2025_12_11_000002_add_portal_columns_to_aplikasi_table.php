<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Migration: Add portal columns to aplikasi table
 *
 * Adds:
 * - icon_name: Icon component name (e.g., 'FiBook', 'BsGlobe')
 * - icon_color: Tailwind CSS class (e.g., 'bg-blue-500')
 * - id_kategori: FK to kategori_aplikasi
 * - app_slug: URL-friendly identifier
 * - urutan: Sort order within category
 * - a_tampil_portal: Show in portal (1=yes, 0=no)
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
        // Add icon_name column
        if (!$this->columnExists('icon_name')) {
            DB::statement("ALTER TABLE man_akses.aplikasi ADD icon_name VARCHAR(100) NULL");
        }

        // Add icon_color column
        if (!$this->columnExists('icon_color')) {
            DB::statement("ALTER TABLE man_akses.aplikasi ADD icon_color VARCHAR(50) NULL");
        }

        // Add id_kategori column
        if (!$this->columnExists('id_kategori')) {
            DB::statement("ALTER TABLE man_akses.aplikasi ADD id_kategori UNIQUEIDENTIFIER NULL");
        }

        // Add app_slug column
        if (!$this->columnExists('app_slug')) {
            DB::statement("ALTER TABLE man_akses.aplikasi ADD app_slug VARCHAR(100) NULL");
        }

        // Add urutan column
        if (!$this->columnExists('urutan')) {
            DB::statement("ALTER TABLE man_akses.aplikasi ADD urutan INT DEFAULT 0");
        }

        // Add a_tampil_portal column
        if (!$this->columnExists('a_tampil_portal')) {
            DB::statement("ALTER TABLE man_akses.aplikasi ADD a_tampil_portal BIT DEFAULT 1");
        }

        // Create indexes for better performance
        $this->createIndexIfNotExists('IX_aplikasi_kategori', 'id_kategori');
        $this->createIndexIfNotExists('IX_aplikasi_tampil_portal', 'a_tampil_portal');
        $this->createIndexIfNotExists('IX_aplikasi_app_slug', 'app_slug');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes first
        $this->dropIndexIfExists('IX_aplikasi_kategori');
        $this->dropIndexIfExists('IX_aplikasi_tampil_portal');
        $this->dropIndexIfExists('IX_aplikasi_app_slug');

        // Drop columns
        if ($this->columnExists('icon_name')) {
            DB::statement("ALTER TABLE man_akses.aplikasi DROP COLUMN icon_name");
        }

        if ($this->columnExists('icon_color')) {
            DB::statement("ALTER TABLE man_akses.aplikasi DROP COLUMN icon_color");
        }

        if ($this->columnExists('id_kategori')) {
            DB::statement("ALTER TABLE man_akses.aplikasi DROP COLUMN id_kategori");
        }

        if ($this->columnExists('app_slug')) {
            DB::statement("ALTER TABLE man_akses.aplikasi DROP COLUMN app_slug");
        }

        if ($this->columnExists('urutan')) {
            DB::statement("ALTER TABLE man_akses.aplikasi DROP COLUMN urutan");
        }

        if ($this->columnExists('a_tampil_portal')) {
            DB::statement("ALTER TABLE man_akses.aplikasi DROP COLUMN a_tampil_portal");
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
