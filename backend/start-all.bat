@echo off
setlocal enabledelayedexpansion

REM ========================================
REM Start All Backend Services - MyUnila
REM Windows Batch Script
REM ========================================

echo ========================================
echo   MyUnila Backend - Start All Services
echo ========================================
echo.

REM Check if docker is running
echo [INFO] Checking Docker...
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo [OK] Docker is running
echo.

REM Start main services
echo ========================================
echo === Starting Main Services ===
echo ========================================
echo [INFO] Starting Auth Service, Public Service, Nginx, Redis...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start main services
    pause
    exit /b 1
)
echo [OK] Main services started
echo.

REM Wait for services to initialize
echo [INFO] Waiting for main services to initialize...
timeout /t 5 /nobreak >nul

REM Start Kong
echo ========================================
echo === Starting Kong API Gateway ===
echo ========================================
echo [INFO] Starting Kong Gateway, PostgreSQL, Kong UI...
docker-compose -f docker-compose-kong.yml up -d
if errorlevel 1 (
    echo [ERROR] Failed to start Kong services
    pause
    exit /b 1
)
echo [OK] Kong services started
echo.

REM Wait for Kong to initialize
echo [INFO] Waiting for Kong to initialize (this may take 30-60 seconds)...
timeout /t 15 /nobreak >nul

REM Wait for Auth Service
echo [INFO] Waiting for Auth Service to be ready...
set /a attempts=0
:wait_auth
curl -s http://localhost:8081/api/v1/health >nul 2>&1
if errorlevel 1 (
    set /a attempts+=1
    if !attempts! GEQ 30 (
        echo [WARNING] Auth Service might not be ready yet (timeout)
        goto skip_auth
    )
    timeout /t 2 /nobreak >nul
    goto wait_auth
)
echo [OK] Auth Service is ready!
:skip_auth
echo.

REM Wait for Kong Admin API
echo [INFO] Waiting for Kong Admin API to be ready...
set /a attempts=0
:wait_kong
curl -s http://localhost:9801 >nul 2>&1
if errorlevel 1 (
    set /a attempts+=1
    if !attempts! GEQ 30 (
        echo [WARNING] Kong Admin API might not be ready yet (timeout)
        goto skip_kong
    )
    timeout /t 2 /nobreak >nul
    goto wait_kong
)
echo [OK] Kong Admin API is ready!
:skip_kong
echo.

REM Configure Kong Routes
echo ========================================
echo === Configuring Kong Routes ===
echo ========================================

REM Check if auth-service already exists
curl -s http://localhost:9801/services/auth-service >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Service 'auth-service' already configured
) else (
    echo [INFO] Adding auth-service to Kong...
    curl -s -X POST http://localhost:9801/services --data name=auth-service --data url=http://nginx:80 >nul 2>&1
    echo [OK] Auth service added

    curl -s -X POST http://localhost:9801/services/auth-service/routes --data "name=auth-route" --data "paths[]=/auth-service" --data strip_path=true >nul 2>&1
    echo [OK] Auth route added
)

REM Check if public-service already exists
curl -s http://localhost:9801/services/public-service >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Service 'public-service' already configured
) else (
    echo [INFO] Adding public-service to Kong...
    curl -s -X POST http://localhost:9801/services --data name=public-service --data url=http://nginx:81 >nul 2>&1
    echo [OK] Public service added

    curl -s -X POST http://localhost:9801/services/public-service/routes --data "name=public-route" --data "paths[]=/public-service" --data strip_path=true >nul 2>&1
    echo [OK] Public route added
)
echo.

REM Test endpoints
echo ========================================
echo === Testing Endpoints ===
echo ========================================

echo [INFO] Testing Auth Service (Direct - Port 8081)...
curl -s http://localhost:8081/api/v1/health | findstr "success" >nul 2>&1
if not errorlevel 1 (
    echo [OK] Auth Service is working
) else (
    echo [WARNING] Auth Service might not be ready
)

echo [INFO] Testing Public Service (Direct - Port 8082)...
curl -s http://localhost:8082/api/v1/health | findstr "healthy" >nul 2>&1
if not errorlevel 1 (
    echo [OK] Public Service is working
) else (
    echo [WARNING] Public Service might not be ready
)

echo [INFO] Testing Kong Admin API (Port 9801)...
curl -s http://localhost:9801 | findstr "version" >nul 2>&1
if not errorlevel 1 (
    echo [OK] Kong Admin API is working
) else (
    echo [WARNING] Kong might not be ready yet
)

echo [INFO] Testing Auth Service via Kong (Port 9800)...
curl -s http://localhost:9800/auth-service/api/v1/health | findstr "success" >nul 2>&1
if not errorlevel 1 (
    echo [OK] Auth Service via Kong is working
) else (
    echo [WARNING] Kong route might not be configured yet
)
echo.

REM Show services status
echo ========================================
echo === Services Status ===
echo ========================================
echo.
echo Main Services:
docker-compose ps
echo.
echo Kong Services:
docker-compose -f docker-compose-kong.yml ps
echo.

REM Show URLs
echo ========================================
echo === Service URLs ===
echo ========================================
echo.
echo Main Services:
echo   - Auth Service:           http://localhost:8081
echo   - Public Service:         http://localhost:8082
echo   - Redis:                  localhost:6379
echo.
echo Kong API Gateway:
echo   - Kong Proxy:             http://localhost:9800
echo   - Kong Admin API:         http://localhost:9801
echo   - Kong UI:                http://localhost:9803
echo.
echo Auth Service Endpoints:
echo   - Login:                  http://localhost:8081/api/v1/auth/login
echo   - Login (via Kong):       http://localhost:9800/auth-service/api/v1/auth/login
echo   - Health Check:           http://localhost:8081/api/v1/health
echo.
echo Public Service Endpoints:
echo   - University Profile:     http://localhost:8082/api/v1/university-profile
echo   - Quick Facts:            http://localhost:8082/api/v1/university-profile/quick-facts
echo   - Via Kong:               http://localhost:9800/public-service/api/v1/university-profile
echo.
echo ========================================
echo [OK] All services started successfully!
echo ========================================
echo.
echo Next steps:
echo   1. Open Kong UI: http://localhost:9803
echo   2. Test login: curl -X POST http://localhost:8081/api/v1/auth/login -H "Content-Type: application/json" -d "{\"username\":\"mizar.zulmi1073\",\"password\":\"makinjaya\"}"
echo   3. View logs: docker-compose logs -f
echo.
echo To stop all services: stop-all.bat
echo.
pause
