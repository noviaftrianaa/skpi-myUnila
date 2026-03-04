@echo off
REM Queue Worker untuk SSO Sync
REM Auto-restart jika crash

:loop
cd /d E:\laragon\www\my-unila\manAkses

echo [%date% %time%] Starting queue worker...
E:\laragon\bin\php\php-8.1.10-Win32-vs16-x64\php.exe artisan queue:work --queue=default --sleep=3 --tries=3 --max-time=3600 >> storage/logs/queue-worker.log 2>&1

echo [%date% %time%] Queue worker stopped. Restarting in 5 seconds...
timeout /t 5 /nobreak > nul

goto loop
