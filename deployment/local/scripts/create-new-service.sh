#!/bin/bash

###############################################################################
# MyUnila - Create New Service Script
# Script untuk membuat backend service baru (Laravel atau Go)
# dengan pattern yang sama seperti service yang sudah ada
###############################################################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Detect if running in Git Bash on Windows
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    BACKEND_DIR="/c/laragon/www/my-unila/backend"
else
    BACKEND_DIR="$(cd "$(dirname "$0")/../../../backend" && pwd)"
fi

# Function to show header
show_header() {
    clear
    echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                        ║${NC}"
    echo -e "${CYAN}║        ${BLUE}MyUnila - Create New Service${CYAN}               ║${NC}"
    echo -e "${CYAN}║                                                        ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Function to show menu
show_menu() {
    show_header
    echo -e "${YELLOW}Pilih tipe service yang akan dibuat:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} Laravel Service (PHP 8.2 + Laravel 11)"
    echo -e "  ${GREEN}2)${NC} Go Service (Go 1.22+ + Fiber v2)"
    echo ""
    echo -e "  ${RED}0)${NC} Exit"
    echo ""
    echo -n "Pilihan [0-2]: "
}

# Function to validate service name
validate_service_name() {
    local name=$1

    # Check if name is empty
    if [ -z "$name" ]; then
        echo -e "${RED}✗ Service name tidak boleh kosong!${NC}"
        return 1
    fi

    # Check if name contains only lowercase, numbers, and hyphens
    if ! [[ "$name" =~ ^[a-z0-9-]+$ ]]; then
        echo -e "${RED}✗ Service name hanya boleh mengandung huruf kecil, angka, dan tanda hubung (-)${NC}"
        return 1
    fi

    # Check if service directory already exists
    if [ -d "$BACKEND_DIR/$name-service" ]; then
        echo -e "${RED}✗ Service '$name-service' sudah ada!${NC}"
        return 1
    fi

    return 0
}

# Function to validate port
validate_port() {
    local port=$1

    # Check if port is a number
    if ! [[ "$port" =~ ^[0-9]+$ ]]; then
        echo -e "${RED}✗ Port harus berupa angka!${NC}"
        return 1
    fi

    # Check if port is in valid range
    if [ "$port" -lt 1024 ] || [ "$port" -gt 65535 ]; then
        echo -e "${RED}✗ Port harus antara 1024-65535!${NC}"
        return 1
    fi

    # Check if port is already used
    if netstat -an 2>/dev/null | grep -q ":$port "; then
        echo -e "${YELLOW}⚠ Port $port mungkin sudah digunakan!${NC}"
    fi

    return 0
}

# Function to create Laravel service
create_laravel_service() {
    local service_name=$1
    local port=$2
    local service_dir="$BACKEND_DIR/${service_name}-service"

    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}Creating Laravel Service: ${GREEN}${service_name}-service${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
    echo ""

    # Step 1: Create Laravel project
    echo -e "${BLUE}[1/8]${NC} Creating Laravel project..."
    cd "$BACKEND_DIR"
    composer create-project laravel/laravel "${service_name}-service" --prefer-dist --no-interaction 2>&1 | grep -E "Created project|Installing|Package manifest" || true

    if [ ! -d "$service_dir" ]; then
        echo -e "${RED}✗ Failed to create Laravel project!${NC}"
        return 1
    fi

    cd "$service_dir"
    echo -e "${GREEN}✓ Laravel project created${NC}"
    echo ""

    # Step 2: Install dependencies
    echo -e "${BLUE}[2/8]${NC} Installing dependencies..."
    composer require firebase/php-jwt:^6.10 --no-interaction 2>&1 | tail -n 3
    composer require predis/predis:^2.2 --no-interaction 2>&1 | tail -n 3
    composer require darkaonline/l5-swagger --no-interaction 2>&1 | tail -n 3
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""

    # Step 3: Create folder structure
    echo -e "${BLUE}[3/8]${NC} Creating folder structure..."
    mkdir -p app/Http/Controllers/Api
    mkdir -p app/Http/Middleware
    mkdir -p app/Repositories
    mkdir -p app/Services
    mkdir -p docker
    mkdir -p database/sqlserver
    echo -e "${GREEN}✓ Folder structure created${NC}"
    echo ""

    # Step 4: Create .env.example
    echo -e "${BLUE}[4/8]${NC} Creating .env.example..."
    cat > .env.example << 'ENVEOF'
# ===========================================
# Service Configuration
# ===========================================

APP_NAME="Service Name"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=Asia/Jakarta
APP_URL=http://localhost:PORT
APP_APLIKASI_ID=

APP_LOCALE=en
APP_FALLBACK_LOCALE=en

# ===========================================
# Database Configuration (SQL Server)
# ===========================================
DB_CONNECTION=sqlsrv
DB_HOST=
DB_PORT=1433
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
DB_TRUST_SERVER_CERTIFICATE=true

# ===========================================
# Redis Configuration (Managed by Docker)
# REDIS_HOST will be overridden by docker-compose
# ===========================================
REDIS_CLIENT=phpredis
REDIS_HOST=redis
REDIS_PASSWORD=
REDIS_PORT=6379

# Cache & Session (Managed by docker-compose)
CACHE_STORE=redis
CACHE_PREFIX=SERVICE_PREFIX_
SESSION_DRIVER=redis
SESSION_LIFETIME=120
QUEUE_CONNECTION=redis

# ===========================================
# JWT Configuration
# ===========================================
JWT_SECRET=
JWT_ACCESS_TOKEN_TTL=15
JWT_REFRESH_TOKEN_TTL=10080
JWT_ALGO=HS256

# ===========================================
# Logging
# ===========================================
LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=debug

# ===========================================
# Development Helpers
# ===========================================
AUTO_MIGRATE=false
WAIT_FOR_DB=true

# Cookie settings for development (use secure=true in production)
SESSION_SECURE_COOKIE=false
ENVEOF

    # Replace placeholders
    sed -i "s/Service Name/${service_name^} Service/g" .env.example
    sed -i "s/PORT/${port}/g" .env.example
    sed -i "s/SERVICE_PREFIX/${service_name}/g" .env.example

    echo -e "${GREEN}✓ .env.example created${NC}"
    echo ""

    # Step 5: Create HealthController
    echo -e "${BLUE}[5/8]${NC} Creating HealthController..."
    cat > app/Http/Controllers/Api/HealthController.php << 'PHPEOF'
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    /**
     * Health check endpoint
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function check()
    {
        $status = 'healthy';
        $checks = [
            'database' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
        ];

        // If any check fails, set status to unhealthy
        foreach ($checks as $check) {
            if ($check['status'] !== 'ok') {
                $status = 'unhealthy';
                break;
            }
        }

        return response()->json([
            'service' => config('app.name'),
            'status' => $status,
            'timestamp' => now()->toIso8601String(),
            'version' => '1.0.0',
            'checks' => $checks,
        ], $status === 'healthy' ? 200 : 503);
    }

    /**
     * Check database connection
     */
    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            return ['status' => 'ok', 'message' => 'Database connected'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()];
        }
    }

    /**
     * Check Redis connection
     */
    private function checkRedis(): array
    {
        try {
            $redis = app('redis')->connection();
            $redis->ping();
            return ['status' => 'ok', 'message' => 'Redis connected'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Redis connection failed: ' . $e->getMessage()];
        }
    }
}
PHPEOF
    echo -e "${GREEN}✓ HealthController created${NC}"
    echo ""

    # Step 6: Update routes/api.php
    echo -e "${BLUE}[6/8]${NC} Creating API routes..."
    cat > routes/api.php << 'PHPEOF'
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check endpoint (public)
Route::get('/health', [HealthController::class, 'check']);

// API version 1
Route::prefix('v1')->group(function () {

    // Public routes (no authentication required)
    Route::prefix('public')->group(function () {
        // Add your public routes here
    });

    // Protected routes (JWT authentication required)
    // Route::middleware(['jwt.auth'])->group(function () {
    //     // Add your protected routes here
    // });
});
PHPEOF
    echo -e "${GREEN}✓ API routes created${NC}"
    echo ""

    # Step 7: Create Dockerfile
    echo -e "${BLUE}[7/8]${NC} Creating Dockerfile..."
    cat > Dockerfile << 'DOCKERFILE'
# ========================================
# Service Dockerfile - Alpine Version
# With Supervisor for PHP-FPM + Queue Worker
# ========================================
FROM php:8.2-fpm-alpine

# Set working directory
WORKDIR /var/www

# Install ALL dependencies first (including build tools and ODBC)
RUN apk add --no-cache \
    git \
    curl \
    bash \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    # Supervisor for running multiple processes
    supervisor \
    # SQL Server ODBC dependencies - MUST be installed first
    unixodbc \
    unixodbc-dev \
    # Build tools - keep for extension compilation
    $PHPIZE_DEPS \
    autoconf \
    g++ \
    make

# Install basic PHP extensions (no SQL Server yet)
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Microsoft SQL Server ODBC Driver 18 for Alpine
RUN curl -O https://download.microsoft.com/download/3/5/5/355d7943-a338-41a7-858d-53b259ea33f5/msodbcsql18_18.3.2.1-1_amd64.apk \
    && curl -O https://download.microsoft.com/download/3/5/5/355d7943-a338-41a7-858d-53b259ea33f5/mssql-tools18_18.3.1.1-1_amd64.apk \
    && apk add --allow-untrusted msodbcsql18_18.3.2.1-1_amd64.apk \
    && apk add --allow-untrusted mssql-tools18_18.3.1.1-1_amd64.apk \
    && rm -f *.apk

# Install Redis extension via PECL (more reliable than manual compile)
RUN pecl channel-update pecl.php.net \
    && pecl install redis-5.3.7 \
    && docker-php-ext-enable redis

# Install SQL Server PHP drivers via PECL
# IMPORTANT: unixODBC must be installed BEFORE this step
RUN pecl install sqlsrv-5.12.0 pdo_sqlsrv-5.12.0 \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv

# Clean up (but keep runtime dependencies)
RUN apk del $PHPIZE_DEPS autoconf g++ make \
    && rm -rf /tmp/pear /tmp/* /var/cache/apk/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configure Composer for better network reliability
RUN composer config -g process-timeout 600 \
    && composer config -g repos.packagist composer https://packagist.org

# Copy application files
COPY . /var/www

# Install dependencies with increased timeout and retry
RUN COMPOSER_PROCESS_TIMEOUT=600 composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --prefer-dist \
    --no-scripts \
    || (sleep 5 && COMPOSER_PROCESS_TIMEOUT=600 composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts) \
    && composer run-script post-autoload-dump --no-interaction || true

# Create necessary directories
RUN mkdir -p /var/www/storage/framework/{sessions,views,cache} \
    && mkdir -p /var/www/storage/logs \
    && mkdir -p /var/www/bootstrap/cache

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

# PHP configuration - Optimized for production
RUN { \
    echo 'memory_limit = 1024M'; \
    echo 'max_execution_time = 300'; \
    echo 'max_input_time = 300'; \
    echo 'post_max_size = 100M'; \
    echo 'upload_max_filesize = 100M'; \
    echo 'default_socket_timeout = 180'; \
    echo 'opcache.enable = 1'; \
    echo 'opcache.memory_consumption = 512'; \
    echo 'opcache.interned_strings_buffer = 32'; \
    echo 'opcache.max_accelerated_files = 20000'; \
    echo 'opcache.revalidate_freq = 2'; \
    echo 'opcache.fast_shutdown = 1'; \
    echo 'opcache.validate_timestamps = 0'; \
    echo 'realpath_cache_size = 8192K'; \
    echo 'realpath_cache_ttl = 7200'; \
} > /usr/local/etc/php/conf.d/custom.ini

# PHP-FPM configuration - Optimized for production
RUN echo "pm = dynamic" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.max_children = 150" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.start_servers = 30" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.min_spare_servers = 20" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.max_spare_servers = 50" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.max_requests = 1000" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.process_idle_timeout = 30s" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "request_terminate_timeout = 300" >> /usr/local/etc/php-fpm.d/www.conf

# Copy supervisor configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create supervisor log directory
RUN mkdir -p /var/log/supervisor

# Expose port 9000 for PHP-FPM
EXPOSE 9000

# Start Supervisor (manages both PHP-FPM and Queue Worker)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
DOCKERFILE
    echo -e "${GREEN}✓ Dockerfile created${NC}"
    echo ""

    # Step 8: Create supervisord.conf
    echo -e "${BLUE}[8/8]${NC} Creating supervisord.conf..."
    cat > docker/supervisord.conf << 'SUPERVISOREOF'
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid
loglevel=info

[program:php-fpm]
command=/usr/local/sbin/php-fpm -F
autostart=true
autorestart=true
priority=1
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:queue-worker]
process_name=%(program_name)s_%(process_num)02d
command=/usr/local/bin/php /var/www/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600 --memory=256
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
priority=10
redirect_stderr=true
stdout_logfile=/var/www/storage/logs/queue-worker.log
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=3
stopwaitsecs=3600
SUPERVISOREOF
    echo -e "${GREEN}✓ supervisord.conf created${NC}"
    echo ""

    # Create .env from .env.example
    cp .env.example .env

    echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ Laravel service '${service_name}-service' created successfully!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "  1. Edit ${CYAN}.env${NC} file and configure database connection"
    echo -e "  2. Generate application key: ${CYAN}php artisan key:generate${NC}"
    echo -e "  3. Add service to ${CYAN}docker-compose.yml${NC}"
    echo -e "  4. Build and run: ${CYAN}docker-compose up -d${NC}"
    echo ""
    echo -e "${YELLOW}Location:${NC} ${CYAN}$service_dir${NC}"
    echo ""
}

# Function to create Go service
create_go_service() {
    local service_name=$1
    local port=$2
    local service_dir="$BACKEND_DIR/${service_name}-service"

    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}Creating Go Service: ${GREEN}${service_name}-service${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
    echo ""

    # Step 1: Create directory structure
    echo -e "${BLUE}[1/8]${NC} Creating directory structure..."
    mkdir -p "$service_dir"
    cd "$service_dir"

    mkdir -p cmd/api
    mkdir -p apps/example
    mkdir -p internal/config
    mkdir -p internal/middleware
    mkdir -p external/database
    mkdir -p pkg/response
    mkdir -p database/migrations
    mkdir -p docs

    echo -e "${GREEN}✓ Directory structure created${NC}"
    echo ""

    # Step 2: Initialize Go module
    echo -e "${BLUE}[2/8]${NC} Initializing Go module..."
    go mod init "github.com/myunila/${service_name}-service" 2>&1 | grep -v "go: creating new go.mod"
    echo -e "${GREEN}✓ Go module initialized${NC}"
    echo ""

    # Step 3: Install dependencies
    echo -e "${BLUE}[3/8]${NC} Installing dependencies (this may take a while)..."
    go get github.com/gofiber/fiber/v2 2>&1 | tail -n 1
    go get github.com/jmoiron/sqlx 2>&1 | tail -n 1
    go get github.com/microsoft/go-mssqldb 2>&1 | tail -n 1
    go get github.com/golang-jwt/jwt/v5 2>&1 | tail -n 1
    go get github.com/go-redis/redis/v8 2>&1 | tail -n 1
    go get github.com/google/uuid 2>&1 | tail -n 1
    go get github.com/joho/godotenv 2>&1 | tail -n 1
    go get github.com/robfig/cron/v3 2>&1 | tail -n 1
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""

    # Step 4: Create .env.example
    echo -e "${BLUE}[4/8]${NC} Creating .env.example..."
    cat > .env.example << ENVEOF
# Application
APP_NAME=${service_name^} Service
APP_PORT=:${port}
APP_ENV=development

# SQL Server Database
DB_DRIVER=sqlserver
DB_HOST=
DB_PORT=1433
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
DB_TRUST_SERVER_CERTIFICATE=true

# Connection Pool
DB_MAX_OPEN_CONNS=25
DB_MAX_IDLE_CONNS=5
DB_CONN_MAX_LIFETIME=5m

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=
JWT_ALGO=HS256

# Logging
LOG_LEVEL=info
ENVEOF
    echo -e "${GREEN}✓ .env.example created${NC}"
    echo ""

    # Step 5: Create config package
    echo -e "${BLUE}[5/8]${NC} Creating config package..."
    cat > internal/config/config.go << 'GOEOF'
package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	App      AppConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
}

type AppConfig struct {
	Name string
	Port string
	Env  string
}

type DatabaseConfig struct {
	Driver          string
	Host            string
	Port            string
	User            string
	Password        string
	Name            string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type JWTConfig struct {
	Secret string
	Algo   string
}

var Cfg Config

func LoadConfig() error {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	Cfg = Config{
		App: AppConfig{
			Name: getEnv("APP_NAME", "Service"),
			Port: getEnv("APP_PORT", ":8080"),
			Env:  getEnv("APP_ENV", "development"),
		},
		Database: DatabaseConfig{
			Driver:          getEnv("DB_DRIVER", "sqlserver"),
			Host:            getEnv("DB_HOST", "localhost"),
			Port:            getEnv("DB_PORT", "1433"),
			User:            getEnv("DB_USERNAME", "sa"),
			Password:        getEnv("DB_PASSWORD", ""),
			Name:            getEnv("DB_DATABASE", "myunila"),
			MaxOpenConns:    25,
			MaxIdleConns:    5,
			ConnMaxLifetime: getEnv("DB_CONN_MAX_LIFETIME", "5m"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       0,
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", ""),
			Algo:   getEnv("JWT_ALGO", "HS256"),
		},
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
GOEOF
    echo -e "${GREEN}✓ Config package created${NC}"
    echo ""

    # Step 6: Create database connection
    echo -e "${BLUE}[6/8]${NC} Creating database connection..."
    cat > external/database/sqlserver.go << 'GOEOF'
package database

import (
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/microsoft/go-mssqldb"
)

type DatabaseConfig struct {
	Driver          string
	Host            string
	Port            string
	User            string
	Password        string
	Name            string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime string
}

func ConnectSQLServer(cfg DatabaseConfig) (*sqlx.DB, error) {
	// Build connection string
	connString := fmt.Sprintf(
		"sqlserver://%s:%s@%s:%s?database=%s&connection+timeout=30&TrustServerCertificate=true",
		cfg.User,
		cfg.Password,
		cfg.Host,
		cfg.Port,
		cfg.Name,
	)

	// Open connection
	db, err := sqlx.Connect(cfg.Driver, connString)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(cfg.MaxOpenConns)
	db.SetMaxIdleConns(cfg.MaxIdleConns)

	if duration, err := time.ParseDuration(cfg.ConnMaxLifetime); err == nil {
		db.SetConnMaxLifetime(duration)
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}
GOEOF
    echo -e "${GREEN}✓ Database connection created${NC}"
    echo ""

    # Step 7: Create main.go
    echo -e "${BLUE}[7/8]${NC} Creating main.go..."
    SERVICE_NAME_UPPER="${service_name^}"
    cat > cmd/api/main.go << GOEOF
package main

import (
	"log"

	"github.com/myunila/${service_name}-service/external/database"
	"github.com/myunila/${service_name}-service/internal/config"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

// @title ${SERVICE_NAME_UPPER} Service API
// @version 1.0
// @description API for ${SERVICE_NAME_UPPER} Service
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@unila.ac.id

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:${port}
// @BasePath /
// @schemes http https

func main() {
	// Load configuration
	if err := config.LoadConfig(); err != nil {
		log.Fatal("Failed to load config:", err)
	}

	log.Println("🚀 Starting ${SERVICE_NAME_UPPER} Service...")
	log.Printf("📝 App Name: %s", config.Cfg.App.Name)
	log.Printf("🌍 Environment: %s", config.Cfg.App.Env)

	// Connect to database
	db, err := database.ConnectSQLServer(database.DatabaseConfig{
		Driver:          config.Cfg.Database.Driver,
		Host:            config.Cfg.Database.Host,
		Port:            config.Cfg.Database.Port,
		User:            config.Cfg.Database.User,
		Password:        config.Cfg.Database.Password,
		Name:            config.Cfg.Database.Name,
		MaxOpenConns:    config.Cfg.Database.MaxOpenConns,
		MaxIdleConns:    config.Cfg.Database.MaxIdleConns,
		ConnMaxLifetime: config.Cfg.Database.ConnMaxLifetime,
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()
	log.Println("✅ Database connected successfully")

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      config.Cfg.App.Name,
		ServerHeader: "${SERVICE_NAME_UPPER} Service",
		ErrorHandler: customErrorHandler,
	})

	// Middlewares
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[\\${time}] \\${status} - \\${latency} \\${method} \\${path}\\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://localhost:3001, http://localhost:9800",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With",
		AllowCredentials: true,
		ExposeHeaders:    "Content-Length",
		MaxAge:           12 * 3600,
	}))

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": config.Cfg.App.Name,
			"version": "1.0.0",
		})
	})

	// Welcome endpoint
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"service": config.Cfg.App.Name,
			"version": "1.0.0",
			"message": "${SERVICE_NAME_UPPER} Service API",
			"endpoints": fiber.Map{
				"health": "/health",
				"api":    "/api/v1",
			},
		})
	})

	// API routes
	api := app.Group("/api/v1")
	api.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "${SERVICE_NAME_UPPER} Service API v1",
		})
	})

	// Start server
	log.Printf("🚀 Server starting on port %s", config.Cfg.App.Port)
	if err := app.Listen(config.Cfg.App.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// customErrorHandler handles Fiber errors
func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}

	return c.Status(code).JSON(fiber.Map{
		"success": false,
		"message": err.Error(),
	})
}
GOEOF
    echo -e "${GREEN}✓ main.go created${NC}"
    echo ""

    # Step 8: Create Dockerfile
    echo -e "${BLUE}[8/8]${NC} Creating Dockerfile..."
    cat > Dockerfile << DOCKERFILE
# Stage 1: Build the application
FROM golang:1.22.6-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk update && apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/api/main.go

# Stage 2: Runtime container
FROM alpine:latest

WORKDIR /app

# Install ca-certificates for HTTPS and wget for healthcheck
RUN apk --no-cache add ca-certificates tzdata wget

# Copy binary from builder
COPY --from=builder /app/server .
COPY --from=builder /app/.env.example .env.example
COPY --from=builder /app/docs ./docs

# Expose port
EXPOSE ${port}

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost:${port}/health || exit 1

# Run the application
CMD ["./server"]
DOCKERFILE
    echo -e "${GREEN}✓ Dockerfile created${NC}"
    echo ""

    # Create .env from .env.example
    cp .env.example .env

    # Run go mod tidy
    go mod tidy 2>&1 | tail -n 3

    echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ Go service '${service_name}-service' created successfully!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "  1. Edit ${CYAN}.env${NC} file and configure database connection"
    echo -e "  2. Add service to ${CYAN}docker-compose.yml${NC}"
    echo -e "  3. Build and run: ${CYAN}docker-compose up -d${NC}"
    echo ""
    echo -e "${YELLOW}Location:${NC} ${CYAN}$service_dir${NC}"
    echo ""
}

# Main script
main() {
    while true; do
        show_menu
        read choice

        case $choice in
            1)
                # Laravel Service
                echo ""
                echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
                echo -e "${BLUE}Laravel Service Configuration${NC}"
                echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
                echo ""

                # Get service name
                while true; do
                    echo -n "Service name (lowercase, tanpa '-service', e.g., 'dashboard', 'integration'): "
                    read service_name

                    # Remove -service suffix if user accidentally added it
                    service_name="${service_name%-service}"

                    if validate_service_name "$service_name"; then
                        break
                    fi
                    echo ""
                done

                # Get port
                echo ""
                echo -e "${YELLOW}Available ports: 8085, 8087, 8088, 8089, etc.${NC}"
                while true; do
                    echo -n "Port number (e.g., 8085): "
                    read port

                    if validate_port "$port"; then
                        break
                    fi
                    echo ""
                done

                # Confirm
                echo ""
                echo -e "${YELLOW}Summary:${NC}"
                echo -e "  Service: ${GREEN}${service_name}-service${NC}"
                echo -e "  Type: ${GREEN}Laravel (PHP 8.2 + Laravel 11)${NC}"
                echo -e "  Port: ${GREEN}${port}${NC}"
                echo ""
                echo -n "Create service? (y/n): "
                read confirm

                if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                    create_laravel_service "$service_name" "$port"
                else
                    echo -e "${YELLOW}Cancelled.${NC}"
                fi

                read -p "Press Enter to continue..."
                ;;

            2)
                # Go Service
                echo ""
                echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
                echo -e "${BLUE}Go Service Configuration${NC}"
                echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
                echo ""

                # Get service name
                while true; do
                    echo -n "Service name (lowercase, tanpa '-service', e.g., 'dashboard', 'integration'): "
                    read service_name

                    # Remove -service suffix if user accidentally added it
                    service_name="${service_name%-service}"

                    if validate_service_name "$service_name"; then
                        break
                    fi
                    echo ""
                done

                # Get port
                echo ""
                echo -e "${YELLOW}Available ports: 8085, 8087, 8088, 8089, etc.${NC}"
                while true; do
                    echo -n "Port number (e.g., 8085): "
                    read port

                    if validate_port "$port"; then
                        break
                    fi
                    echo ""
                done

                # Confirm
                echo ""
                echo -e "${YELLOW}Summary:${NC}"
                echo -e "  Service: ${GREEN}${service_name}-service${NC}"
                echo -e "  Type: ${GREEN}Go (Go 1.22+ + Fiber v2)${NC}"
                echo -e "  Port: ${GREEN}${port}${NC}"
                echo ""
                echo -n "Create service? (y/n): "
                read confirm

                if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                    create_go_service "$service_name" "$port"
                else
                    echo -e "${YELLOW}Cancelled.${NC}"
                fi

                read -p "Press Enter to continue..."
                ;;

            0)
                echo ""
                echo -e "${GREEN}Goodbye!${NC}"
                echo ""
                exit 0
                ;;

            *)
                echo ""
                echo -e "${RED}Invalid choice!${NC}"
                sleep 2
                ;;
        esac
    done
}

# Run main function
main
