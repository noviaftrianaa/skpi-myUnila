<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Migration: Create kategori_aplikasi table
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
        // Check if table exists
        $tableExists = DB::selectOne("
            SELECT 1 FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'kategori_aplikasi'
        ");

        if (!$tableExists) {
            DB::statement("
                CREATE TABLE man_akses.kategori_aplikasi (
                    id_kategori UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    nm_kategori VARCHAR(100) NOT NULL,
                    icon_kategori VARCHAR(100) NULL,
                    icon_color VARCHAR(50) NULL,
                    urutan INT DEFAULT 0,
                    a_aktif BIT DEFAULT 1,
                    tgl_create DATETIME DEFAULT GETDATE(),
                    last_update DATETIME DEFAULT GETDATE(),
                    soft_delete BIT DEFAULT 0
                )
            ");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP TABLE IF EXISTS man_akses.kategori_aplikasi");
    }
};
