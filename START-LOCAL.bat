@echo off
echo ==================================================
echo   Starting MyUnila Frontend ^& SKPI React Servers
echo ==================================================
echo.

:: 1. Start Main Frontend Next.js Server
echo [1/2] Starting Next.js Dev Server (Port 3000)...
start "Next.js Portal Server" cmd /k "cd /d D:\myunila_frontend && npm run dev"

:: 2. Start SKPI Vite React Server
echo [2/2] Starting SKPI Vite Dev Server (Port 5173)...
start "SKPI Vite Server" cmd /k "cd /d D:\myunila_frontend\src\app\dashboard\skpi && npm run dev"

echo.
echo ==================================================
echo   Servers launched!
echo   - Next.js Portal: http://localhost:3000/dashboard/skpi/dashboard
echo   - Vite React Direct: http://localhost:5173/dashboard/skpi/dashboard
echo ==================================================
echo.
pause
