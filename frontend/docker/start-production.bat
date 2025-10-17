@echo off
cd /d "%~dp0"

echo ========================================
echo  My Unila Portal - Docker Production
echo ========================================
echo.

echo [1/4] Stopping any running containers...
docker-compose down

echo.
echo [2/4] Building production image...
docker-compose build frontend

echo.
echo [3/4] Starting production container...
docker-compose up -d frontend

echo.
echo [4/4] Checking container status...
timeout /t 3 >nul
docker-compose ps

echo.
echo ========================================
echo  Deployment Complete!
echo  Access: http://localhost:3000
echo ========================================
echo.
echo To view logs: cd docker ^&^& docker-compose logs -f frontend
echo To stop: cd docker ^&^& docker-compose down
echo.
pause
