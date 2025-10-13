<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Create schema logger jika belum ada
        DB::connection('sqlsrv')->statement("
            IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'logger')
            BEGIN
                EXEC('CREATE SCHEMA logger')
            END
        ");

        // Create table sync_progress
        DB::connection('sqlsrv')->statement("
            IF NOT EXISTS (SELECT * FROM sys.tables t
                          JOIN sys.schemas s ON t.schema_id = s.schema_id
                          WHERE s.name = 'logger' AND t.name = 'sync_progress')
            BEGIN
                CREATE TABLE logger.sync_progress (
                    id_sync UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    job_id VARCHAR(255) NOT NULL,
                    sync_type VARCHAR(50) NOT NULL,
                    status VARCHAR(20) NOT NULL,
                    total_records INT NOT NULL DEFAULT 0,
                    processed_records INT NOT NULL DEFAULT 0,
                    success_count INT NOT NULL DEFAULT 0,
                    failed_count INT NOT NULL DEFAULT 0,
                    current_chunk INT NULL,
                    error_message TEXT NULL,
                    started_at DATETIME NOT NULL DEFAULT GETDATE(),
                    completed_at DATETIME NULL,
                    created_by VARCHAR(100) NULL,
                    INDEX idx_job_id (job_id),
                    INDEX idx_status (status),
                    INDEX idx_started_at (started_at)
                )
            END
        ");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::connection('sqlsrv')->statement("
            IF EXISTS (SELECT * FROM sys.tables t
                      JOIN sys.schemas s ON t.schema_id = s.schema_id
                      WHERE s.name = 'logger' AND t.name = 'sync_progress')
            BEGIN
                DROP TABLE logger.sync_progress
            END
        ");
    }
};
