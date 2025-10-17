@echo off

REM ========================================
REM Stop All Backend Services - MyUnila
REM Windows Batch Script
REM ========================================

echo ========================================
echo   MyUnila Backend - Stop All Services
echo ========================================
echo.

echo [INFO] Stopping Kong services...
docker-compose -f docker-compose-kong.yml down
if errorlevel 1 (
    echo [ERROR] Failed to stop Kong services
) else (
    echo [OK] Kong services stopped
)
echo.

echo [INFO] Stopping main services...
docker-compose down
if errorlevel 1 (
    echo [ERROR] Failed to stop main services
) else (
    echo [OK] Main services stopped
)
echo.

echo ========================================
echo [OK] All services stopped successfully!
echo ========================================
echo.
pause
