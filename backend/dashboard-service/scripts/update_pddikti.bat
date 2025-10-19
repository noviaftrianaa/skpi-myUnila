@echo off
REM Automated PDDikti Akreditasi Update Script for Windows
REM Usage: scripts\update_pddikti.bat

setlocal enabledelayedexpansion

echo ============================================================
echo 🚀 PDDikti Akreditasi Automated Update
echo ============================================================
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0
set PROJECT_DIR=%SCRIPT_DIR%..

REM Step 1: Check Python
echo 📋 Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found!
    echo Please install Python 3.7+
    exit /b 1
)
echo ✓ Python found
echo.

REM Step 2: Check dependencies
echo 📦 Checking Python dependencies...
python -c "import pddiktipy" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  pddiktipy not installed
    echo Installing dependencies...
    pip install -r "%SCRIPT_DIR%requirements.txt"
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        exit /b 1
    )
)
echo ✓ Dependencies OK
echo.

REM Step 3: Fetch data
echo 🌐 Fetching data from PDDikti API...
cd /d "%PROJECT_DIR%"
python "%SCRIPT_DIR%fetch_pddikti_data.py"
if errorlevel 1 (
    echo ❌ Failed to fetch PDDikti data!
    exit /b 1
)
echo ✓ Data fetched successfully
echo.

REM Step 4: Verify JSON files
echo 🔍 Verifying JSON files...
if not exist "%PROJECT_DIR%\database\data\pddikti_unila_akreditasi.json" (
    echo ❌ University data file not found!
    exit /b 1
)
if not exist "%PROJECT_DIR%\database\data\pddikti_prodi_akreditasi.json" (
    echo ❌ Study programs data file not found!
    exit /b 1
)
echo ✓ JSON files verified
echo.

REM Step 5: Run Laravel Seeder
echo 💾 Running Laravel Seeder...

REM Check if Docker is available
docker ps | findstr myunila-dashboard-service >nul 2>&1
if errorlevel 1 (
    REM Direct PHP
    echo Using direct PHP...
    php artisan db:seed --class=PDDiktiAkreditasiSeeder
) else (
    REM Using Docker
    echo Using Docker container...
    docker exec myunila-dashboard-service php artisan db:seed --class=PDDiktiAkreditasiSeeder
)

if errorlevel 1 (
    echo ❌ Seeder failed!
    exit /b 1
)
echo ✓ Seeder completed successfully
echo.

REM Step 6: Clear cache
echo 🧹 Clearing cache...
docker ps | findstr myunila-dashboard-service >nul 2>&1
if errorlevel 1 (
    php artisan cache:clear
) else (
    docker exec myunila-dashboard-service php artisan cache:clear
)
echo ✓ Cache cleared
echo.

REM Final summary
echo ============================================================
echo ✅ PDDikti Akreditasi Update Completed Successfully!
echo ============================================================
echo.
echo Next steps:
echo 1. Verify data in database
echo 2. Check frontend displays updated accreditation
echo 3. Review logs if any warnings were shown
echo.
echo Last update: %date% %time%
echo.

endlocal
