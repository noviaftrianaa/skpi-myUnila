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
        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('token_id')->unique()->comment('JWT jti claim');
            $table->text('token_hash')->comment('Hashed refresh token');
            $table->string('device_name')->nullable();
            $table->string('device_type')->nullable(); // web, mobile, tablet
            $table->string('ip_address', 45);
            $table->text('user_agent');
            $table->timestamp('expires_at');
            $table->timestamp('last_used_at')->nullable();
            $table->boolean('is_revoked')->default(false);
            $table->timestamp('revoked_at')->nullable();
            $table->string('revoked_reason')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'is_revoked']);
            $table->index('token_id');
            $table->index('expires_at');
        });

        Schema::create('refresh_token_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('old_token_id');
            $table->string('new_token_id');
            $table->string('ip_address', 45);
            $table->timestamp('rotated_at');

            $table->index(['user_id', 'rotated_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refresh_token_history');
        Schema::dropIfExists('refresh_tokens');
    }
};
