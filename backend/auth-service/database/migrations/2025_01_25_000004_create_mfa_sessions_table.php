<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mfa_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('temp_token')->unique()->comment('Temporary token before MFA verification');
            $table->string('ip_address', 45);
            $table->text('user_agent');
            $table->integer('attempts')->default(0);
            $table->timestamp('expires_at');
            $table->boolean('verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'verified']);
            $table->index('temp_token');
            $table->index('expires_at');
        });

        Schema::create('mfa_backup_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('code_hash')->unique();
            $table->boolean('used')->default(false);
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'used']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mfa_backup_codes');
        Schema::dropIfExists('mfa_sessions');
    }
};
