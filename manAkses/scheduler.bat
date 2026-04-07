@echo off
REM ============================================
REM Laravel Scheduler Runner for Windows
REM ============================================
REM
REM This batch file runs Laravel's task scheduler
REM It should be executed every minute by Windows Task Scheduler
REM
REM Setup Instructions:
REM 1. Open Task Scheduler (taskschd.msc)
REM 2. Create a new task
REM 3. Set trigger: Every 1 minute
REM 4. Set action: Run this batch file
REM ============================================

REM Set PHP executable path (adjust if needed)
SET PHP_PATH=E:\laragon\bin\php\php-8.1.10-Win32-vs16-x64\php.exe

REM Set project directory
SET PROJECT_PATH=E:\laragon\www\my-unila\manAkses

REM Change to project directory
cd /d "%PROJECT_PATH%"

REM Run Laravel scheduler
"%PHP_PATH%" artisan schedule:run >> "%PROJECT_PATH%\storage\logs\scheduler-runner.log" 2>&1

REM Optional: Log the execution
echo [%date% %time%] Scheduler executed >> "%PROJECT_PATH%\storage\logs\scheduler-execution.log"

exit /b 0
