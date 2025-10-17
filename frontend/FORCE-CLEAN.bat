@echo off
echo ========================================
echo FORCE CLEAN - Deep Cache Removal
echo ========================================
echo.

echo [1/8] Killing all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo [2/8] Removing .next folder...
if exist .next (
    rmdir /s /q .next
    echo   - .next removed
) else (
    echo   - .next not found
)

echo [3/8] Removing .swc folder...
if exist .swc (
    rmdir /s /q .swc
    echo   - .swc removed
) else (
    echo   - .swc not found
)

echo [4/8] Removing node_modules/.cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo   - node_modules/.cache removed
) else (
    echo   - node_modules/.cache not found
)

echo [5/8] Removing package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo   - package-lock.json removed
) else (
    echo   - package-lock.json not found
)

echo [6/8] Clearing npm cache...
call npm cache clean --force

echo [7/8] Reinstalling dependencies...
call npm install

echo [8/8] Verifying .env.local...
echo.
type .env.local | findstr "NEXT_PUBLIC_API_URL"
echo.

echo ========================================
echo Deep clean completed!
echo ========================================
echo.
echo You can now run: npm run dev
echo.
pause
