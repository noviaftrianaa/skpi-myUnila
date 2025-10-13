<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class GenerateSwaggerCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'swagger:generate-auto
                            {--force : Force regenerate even if file exists}
                            {--format=json : Output format (json or yaml)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto-generate Swagger documentation from PHP annotations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting Swagger documentation generation...');
        $this->newLine();

        // Step 1: Scan annotations
        $this->info('📁 Scanning annotation files...');
        $annotationPaths = config('l5-swagger.documentations.default.paths.annotations', []);

        foreach ($annotationPaths as $path) {
            if (file_exists($path)) {
                $this->line("   ✓ Found: {$path}");
            } else {
                $this->warn("   ⚠ Missing: {$path}");
            }
        }
        $this->newLine();

        // Step 2: Generate documentation
        $this->info('⚙️ Generating OpenAPI specification...');

        try {
            // Call L5-Swagger generation command
            Artisan::call('l5-swagger:generate', [
                '--all' => true,
            ]);

            $this->info('   ✓ OpenAPI spec generated successfully!');
        } catch (\Exception $e) {
            $this->error('   ✗ Generation failed: ' . $e->getMessage());
            return 1;
        }

        $this->newLine();

        // Step 3: Check output files
        $this->info('📄 Checking output files...');
        $docsPath = storage_path('api-docs');

        if (!file_exists($docsPath)) {
            $this->error("   ✗ Documentation directory not found: {$docsPath}");
            return 1;
        }

        $jsonFile = $docsPath . '/api-docs.json';
        $yamlFile = $docsPath . '/api-docs.yaml';

        if (file_exists($jsonFile)) {
            $fileSize = filesize($jsonFile);
            $this->line("   ✓ JSON: {$jsonFile} (" . $this->formatBytes($fileSize) . ")");

            // Validate JSON
            $content = file_get_contents($jsonFile);
            $json = json_decode($content);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->line("   ✓ JSON validation passed");
                if (isset($json->paths)) {
                    $pathCount = count((array)$json->paths);
                    $this->line("   ✓ Found {$pathCount} API endpoints");
                }
            } else {
                $this->error("   ✗ JSON validation failed: " . json_last_error_msg());
                return 1;
            }
        } else {
            $this->error("   ✗ JSON file not found: {$jsonFile}");
            return 1;
        }

        if (file_exists($yamlFile)) {
            $fileSize = filesize($yamlFile);
            $this->line("   ✓ YAML: {$yamlFile} (" . $this->formatBytes($fileSize) . ")");
        }

        $this->newLine();

        // Step 4: Display access URLs
        $this->info('🌐 Access Points:');
        $baseUrl = config('app.url', 'http://localhost:8081');
        $docsRoute = config('l5-swagger.documentations.default.routes.api', 'api/documentation');
        $docsUrl = rtrim($baseUrl, '/') . '/' . ltrim($docsRoute, '/');

        $this->line("   📚 Swagger UI:  {$docsUrl}");
        $this->line("   📄 JSON Spec:   {$docsUrl}/api-docs.json");

        $this->newLine();
        $this->info('✅ Swagger documentation generated successfully!');

        if ($this->option('format') === 'yaml' && !file_exists($yamlFile)) {
            $this->warn('⚠️  YAML format requested but not generated. Check L5_SWAGGER_GENERATE_YAML_COPY in config.');
        }

        return 0;
    }

    /**
     * Format bytes to human readable size
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
