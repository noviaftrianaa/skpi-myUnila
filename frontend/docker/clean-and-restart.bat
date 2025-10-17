@echo off
echo ========================================
echo Cleaning Next.js Cache
echo ========================================
echo.

echo [1/4] Stopping any running Next.js server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo [2/4] Removing .next cache folder...
if exist .next rmdir /s /q .next

echo [3/4] Removing node_modules cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo [4/4] Verifying .env.local...
findstr "NEXT_PUBLIC_API_URL" .env.local
echo.

echo ========================================
echo Cache cleared successfully!
echo ========================================
echo.
echo Now run: npm run dev
echo.
pause
