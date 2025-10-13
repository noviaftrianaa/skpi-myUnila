<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use ReflectionClass;
use ReflectionMethod;

class GenerateSwaggerAnnotationsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'swagger:generate-annotations
                            {--force : Overwrite existing annotations}
                            {--controller= : Generate for specific controller only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto-generate Swagger/OpenAPI annotations from routes';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('🚀 Starting auto-generation of Swagger annotations...');
        $this->newLine();

        $routes = Route::getRoutes();
        $generatedCount = 0;
        $skippedCount = 0;
        $controllerFilter = $this->option('controller');

        foreach ($routes as $route) {
            $action = $route->getAction();

            // Skip routes without controller
            if (!isset($action['controller'])) {
                continue;
            }

            // Parse controller and method
            [$controllerClass, $method] = explode('@', $action['controller']);

            // Filter by controller if specified
            if ($controllerFilter && !Str::contains($controllerClass, $controllerFilter)) {
                continue;
            }

            // Skip if controller doesn't exist
            if (!class_exists($controllerClass)) {
                continue;
            }

            try {
                $reflection = new ReflectionClass($controllerClass);
                $methodReflection = $reflection->getMethod($method);

                // Check if annotation already exists
                $docComment = $methodReflection->getDocComment();
                $hasAnnotation = $docComment && Str::contains($docComment, '@OA\\');

                if ($hasAnnotation && !$this->option('force')) {
                    $this->line("⏭️  Skipped: {$controllerClass}@{$method} (already has annotation)");
                    $skippedCount++;
                    continue;
                }

                // Generate annotation
                $annotation = $this->generateAnnotation($route, $method, $methodReflection);

                // Get controller file path
                $filePath = $reflection->getFileName();

                // Insert annotation
                if ($this->insertAnnotation($filePath, $method, $annotation, $hasAnnotation)) {
                    $this->info("✅ Generated: {$controllerClass}@{$method}");
                    $generatedCount++;
                } else {
                    $this->error("❌ Failed: {$controllerClass}@{$method}");
                }

            } catch (\Exception $e) {
                $this->error("Error processing {$controllerClass}@{$method}: {$e->getMessage()}");
            }
        }

        $this->newLine();
        $this->info("📊 Summary:");
        $this->info("   ✓ Generated: {$generatedCount} annotations");
        $this->info("   ⏭️  Skipped: {$skippedCount} annotations");
        $this->newLine();

        // Auto-generate Swagger docs
        $this->info('🔄 Regenerating Swagger documentation...');
        $this->call('l5-swagger:generate');

        return Command::SUCCESS;
    }

    /**
     * Generate Swagger annotation for a route.
     */
    private function generateAnnotation($route, $method, ReflectionMethod $methodReflection): string
    {
        $httpMethod = $route->methods()[0];
        $path = $route->uri();
        $middleware = $route->middleware();

        // Determine if route requires authentication
        $requiresAuth = in_array('auth:api', $middleware) || in_array('auth', $middleware);

        // Get method parameters for request body
        $parameters = $methodReflection->getParameters();
        $hasRequestBody = in_array($httpMethod, ['POST', 'PUT', 'PATCH']);

        // Generate annotation
        $annotation = "    /**\n";
        $annotation .= "     * @OA\\{$httpMethod}(\n";
        $annotation .= "     *     path=\"/api/v1/{$path}\",\n";
        $annotation .= "     *     summary=\"" . $this->generateSummary($method) . "\",\n";
        $annotation .= "     *     description=\"" . $this->generateDescription($method, $httpMethod) . "\",\n";
        $annotation .= "     *     operationId=\"{$method}\",\n";
        $annotation .= "     *     tags={\"" . $this->generateTag($path) . "\"},\n";

        if ($requiresAuth) {
            $annotation .= "     *     security={{\"bearerAuth\": {}}},\n";
        }

        // Add request body for POST/PUT/PATCH
        if ($hasRequestBody) {
            $annotation .= $this->generateRequestBody($method, $path);
        }

        // Add path parameters
        $pathParams = $this->extractPathParameters($path);
        if (!empty($pathParams)) {
            foreach ($pathParams as $param) {
                $annotation .= "     *     @OA\\Parameter(\n";
                $annotation .= "     *         name=\"{$param}\",\n";
                $annotation .= "     *         in=\"path\",\n";
                $annotation .= "     *         required=true,\n";
                $annotation .= "     *         @OA\\Schema(type=\"string\")\n";
                $annotation .= "     *     ),\n";
            }
        }

        // Add standard responses
        $annotation .= $this->generateResponses($method, $requiresAuth);

        $annotation .= "     * )\n";
        $annotation .= "     */";

        return $annotation;
    }

    /**
     * Generate human-readable summary from method name.
     */
    private function generateSummary(string $method): string
    {
        $summaries = [
            'login' => 'User login',
            'logout' => 'User logout',
            'register' => 'User registration',
            'refresh' => 'Refresh access token',
            'me' => 'Get current user information',
            'switchRole' => 'Switch user active role',
            'activeSessions' => 'Get active sessions',
            'logoutAllDevices' => 'Logout from all devices',
            'tokenInfo' => 'Get token information',
            'revokeToken' => 'Revoke access token',
        ];

        return $summaries[$method] ?? Str::title(Str::snake($method, ' '));
    }

    /**
     * Generate description from method name and HTTP method.
     */
    private function generateDescription(string $method, string $httpMethod): string
    {
        $descriptions = [
            'login' => 'Authenticate user and generate JWT access token with user details',
            'logout' => 'Logout current user session and invalidate token',
            'register' => 'Register a new user account',
            'refresh' => 'Refresh the JWT access token using refresh token',
            'me' => 'Get authenticated user profile information with roles',
            'switchRole' => 'Switch the active role for the authenticated user. Updates the last_active timestamp for the selected role.',
            'activeSessions' => 'Get list of active sessions for the authenticated user',
            'logoutAllDevices' => 'Logout user from all active devices and invalidate all tokens',
            'tokenInfo' => 'Get detailed information about the current JWT token',
            'revokeToken' => 'Revoke a specific access token',
        ];

        return $descriptions[$method] ?? "Perform {$httpMethod} operation for {$method}";
    }

    /**
     * Generate tag from path.
     */
    private function generateTag(string $path): string
    {
        $parts = explode('/', $path);
        $firstPart = $parts[0] ?? 'General';

        $tags = [
            'auth' => 'Authentication',
            'user' => 'User Management',
            'role' => 'Role Management',
            'token' => 'Token Management',
        ];

        return $tags[$firstPart] ?? Str::title($firstPart);
    }

    /**
     * Generate request body schema.
     */
    private function generateRequestBody(string $method, string $path): string
    {
        $requestBodies = [
            'login' => [
                'username' => ['type' => 'string', 'required' => true, 'example' => 'mizar.zulmi1073'],
                'password' => ['type' => 'string', 'required' => true, 'example' => 'password123'],
            ],
            'switchRole' => [
                'role_name' => ['type' => 'string', 'required' => true, 'example' => 'mahasiswa'],
            ],
            'refresh' => [
                'refresh_token' => ['type' => 'string', 'required' => true, 'example' => 'eyJ0eXAiOiJKV1QiLCJhbGc...'],
            ],
        ];

        if (!isset($requestBodies[$method])) {
            return "     *     @OA\\RequestBody(\n" .
                   "     *         required=true,\n" .
                   "     *         @OA\\JsonContent(type=\"object\")\n" .
                   "     *     ),\n";
        }

        $fields = $requestBodies[$method];
        $required = array_keys(array_filter($fields, fn($f) => $f['required'] ?? false));

        $body = "     *     @OA\\RequestBody(\n";
        $body .= "     *         required=true,\n";
        $body .= "     *         @OA\\JsonContent(\n";

        if (!empty($required)) {
            $body .= "     *             required={\"" . implode('", "', $required) . "\"},\n";
        }

        foreach ($fields as $name => $config) {
            $type = $config['type'] ?? 'string';
            $example = $config['example'] ?? '';
            $description = $config['description'] ?? '';

            $body .= "     *             @OA\\Property(property=\"{$name}\", type=\"{$type}\"";
            if ($example) {
                $body .= ", example=\"{$example}\"";
            }
            if ($description) {
                $body .= ", description=\"{$description}\"";
            }
            $body .= "),\n";
        }

        $body .= "     *         )\n";
        $body .= "     *     ),\n";

        return $body;
    }

    /**
     * Generate response schemas.
     */
    private function generateResponses(string $method, bool $requiresAuth): string
    {
        $responses = "     *     @OA\\Response(\n";
        $responses .= "     *         response=200,\n";
        $responses .= "     *         description=\"Successful operation\",\n";
        $responses .= "     *         @OA\\JsonContent(\n";
        $responses .= "     *             @OA\\Property(property=\"success\", type=\"boolean\", example=true),\n";
        $responses .= "     *             @OA\\Property(property=\"message\", type=\"string\", example=\"Operation successful\"),\n";
        $responses .= "     *             @OA\\Property(property=\"data\", type=\"object\")\n";
        $responses .= "     *         )\n";
        $responses .= "     *     ),\n";

        if ($requiresAuth) {
            $responses .= "     *     @OA\\Response(\n";
            $responses .= "     *         response=401,\n";
            $responses .= "     *         description=\"Unauthorized\",\n";
            $responses .= "     *         @OA\\JsonContent(\n";
            $responses .= "     *             @OA\\Property(property=\"success\", type=\"boolean\", example=false),\n";
            $responses .= "     *             @OA\\Property(property=\"message\", type=\"string\", example=\"Unauthorized\")\n";
            $responses .= "     *         )\n";
            $responses .= "     *     ),\n";
        }

        $responses .= "     *     @OA\\Response(\n";
        $responses .= "     *         response=500,\n";
        $responses .= "     *         description=\"Internal server error\",\n";
        $responses .= "     *         @OA\\JsonContent(\n";
        $responses .= "     *             @OA\\Property(property=\"success\", type=\"boolean\", example=false),\n";
        $responses .= "     *             @OA\\Property(property=\"message\", type=\"string\", example=\"An error occurred\")\n";
        $responses .= "     *         )\n";
        $responses .= "     *     )\n";

        return $responses;
    }

    /**
     * Extract path parameters from route URI.
     */
    private function extractPathParameters(string $path): array
    {
        preg_match_all('/{([^}]+)}/', $path, $matches);
        return $matches[1] ?? [];
    }

    /**
     * Insert annotation into controller file.
     */
    private function insertAnnotation(string $filePath, string $method, string $annotation, bool $hasExisting): bool
    {
        $content = file_get_contents($filePath);

        // Find the method definition
        $pattern = '/(\/\*\*.*?\*\/\s+)?public\s+function\s+' . preg_quote($method) . '\s*\(/s';

        if ($hasExisting && $this->option('force')) {
            // Replace existing annotation
            $content = preg_replace($pattern, $annotation . "\n    public function {$method}(", $content, 1);
        } else {
            // Insert new annotation
            $content = preg_replace($pattern, $annotation . "\n    public function {$method}(", $content, 1);
        }

        return file_put_contents($filePath, $content) !== false;
    }
}
