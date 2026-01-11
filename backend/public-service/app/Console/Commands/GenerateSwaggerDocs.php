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

        // Check critical controllers exist
        $criticalControllers = [
            'OpenApiInfo.php',
            'RankingAnnotations.php',
            'ProgramStudiController.php',
            'UnilaStatisticsController.php',
            'UnilaProfileController.php',
        ];

        foreach ($criticalControllers as $controller) {
            $controllerFile = $controllersPath . '/OpenApi/' . $controller;
            if (!file_exists($controllerFile)) {
                $this->warn("⚠️  Warning: {$controller} not found at expected location");
            }
        }
        $this->info('✓ Controllers check completed');

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

        $controllersExist = true;
        foreach ($criticalControllers as $controller) {
            $controllerFile = $controllersPath . '/OpenApi/' . $controller;
            if (file_exists($controllerFile)) {
                $this->line("  ✓ {$controller} exists");
            } else {
                $this->error("  ❌ {$controller} was deleted!");
                $controllersExist = false;
            }
        }

        if (!$controllersExist) {
            $this->error('❌ CRITICAL: Some controllers were deleted! Please restore from backup!');
            return 1;
        }

        $this->info('✓ All controllers are still safe');

        // Success
        $this->line('');
        $this->info('✅ Swagger documentation generated successfully!');
        $this->line('');
        $this->line('📚 Access documentation at:');
        $this->line('   → http://localhost:8082/api/documentation');
        $this->line('   → http://localhost:9800/public-service/api/documentation (via Kong Gateway)');
        $this->line('');
        $this->line('💡 To regenerate: php artisan swagger:generate-safe');

        return 0;
    }
}
