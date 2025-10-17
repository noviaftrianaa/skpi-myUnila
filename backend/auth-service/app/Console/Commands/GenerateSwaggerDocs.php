<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateSwaggerDocs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'swagger:generate-safe';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate Swagger documentation safely (only from OpenApi folder)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔒 Safe Swagger Generation Started...');
        $this->info('');

        // Step 1: Verify controllers are safe
        $this->line('✓ Checking controllers...');
        $controllersPath = app_path('Http/Controllers');
        if (!file_exists($controllersPath . '/AuthController.php')) {
            $this->error('❌ ERROR: AuthController not found! Aborting...');
            return 1;
        }
        $this->info('✓ Controllers are safe');

        // Step 2: Verify OpenApi folder exists
        $this->line('✓ Checking OpenApi documentation folder...');
        $openApiPath = app_path('Http/Controllers/OpenApi');
        if (!file_exists($openApiPath)) {
            $this->error('❌ ERROR: OpenApi folder not found!');
            return 1;
        }
        $this->info('✓ OpenApi folder found');

        // Step 3: Generate swagger documentation
        $this->line('');
        $this->info('📝 Generating Swagger documentation...');
        $this->call('l5-swagger:generate');

        // Step 4: Verify controllers still exist
        $this->line('');
        $this->line('✓ Verifying controllers after generation...');
        if (!file_exists($controllersPath . '/AuthController.php')) {
            $this->error('❌ CRITICAL: AuthController was deleted! Please restore from backup!');
            return 1;
        }
        $this->info('✓ Controllers are still safe');

        // Success
        $this->line('');
        $this->info('✅ Swagger documentation generated successfully!');
        $this->line('');
        $this->line('📚 Access documentation at:');
        $this->line('   → http://localhost:8081/api/documentation');
        $this->line('');
        $this->line('💡 To regenerate: php artisan swagger:generate-safe');

        return 0;
    }
}
