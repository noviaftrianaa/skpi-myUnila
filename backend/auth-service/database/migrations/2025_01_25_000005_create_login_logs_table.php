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
        Schema::create('login_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('email')->index();
            $table->enum('status', ['success', 'failed', 'blocked', 'mfa_required'])->index();
            $table->string('failure_reason')->nullable();
            $table->string('ip_address', 45);
            $table->text('user_agent');
            $table->string('device_type')->nullable();
            $table->string('browser')->nullable();
            $table->string('platform')->nullable();
            $table->string('location')->nullable()->comment('Country/City from IP');
            $table->boolean('mfa_verified')->default(false);
            $table->timestamp('created_at');

            // Indexes
            $table->index(['user_id', 'status', 'created_at']);
            $table->index(['email', 'status']);
            $table->index('created_at');
        });

        Schema::create('token_blacklist', function (Blueprint $table) {
            $table->id();
            $table->string('token_id')->unique()->comment('JWT jti claim');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('blacklisted_at');
            $table->timestamp('expires_at');
            $table->string('reason')->nullable();

            $table->index('token_id');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('token_blacklist');
        Schema::dropIfExists('login_logs');
    }
};
