@echo off
REM Setup Windows Scheduled Task untuk Laravel Scheduler
REM Run as Administrator

echo ========================================
echo Setup Laravel Scheduler - SSO Sync
echo ========================================
echo.

REM Hapus task lama jika ada
echo Removing old task (if exists)...
schtasks /Delete /TN "Laravel-Scheduler-ManAkses" /F 2>nul

echo.
echo Creating new scheduled task...
echo.

REM Buat task baru - Run setiap 1 menit
schtasks /Create ^
    /TN "Laravel-Scheduler-ManAkses" ^
    /TR "C:\laragon\www\my-unila\manAkses\scheduler.bat" ^
    /SC MINUTE ^
    /MO 1 ^
    /RU SYSTEM ^
    /RL HIGHEST ^
    /F

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Task created successfully!
    echo.
    echo Starting task...
    schtasks /Run /TN "Laravel-Scheduler-ManAkses"

    echo.
    echo ========================================
    echo Setup completed successfully!
    echo ========================================
    echo.
    echo Task Name: Laravel-Scheduler-ManAkses
    echo Schedule: Every 1 minute
    echo Script: scheduler.bat
    echo.
    echo Monitor logs:
    echo   - storage\logs\scheduler.log
    echo   - storage\logs\queue-worker.log
    echo.
    echo Check status:
    echo   php artisan sso:sync --status
    echo.
) else (
    echo.
    echo ✗ Failed to create task!
    echo Please run this script as Administrator.
    echo.
)

pause
