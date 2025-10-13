<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Make id_pengguna nullable in logger.log_login table
        DB::statement('
            ALTER TABLE [logger].[log_login]
            ALTER COLUMN [id_pengguna] uniqueidentifier NULL
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Make id_pengguna NOT NULL again
        DB::statement('
            ALTER TABLE [logger].[log_login]
            ALTER COLUMN [id_pengguna] uniqueidentifier NOT NULL
        ');
    }
};
