# ============================================
# Setup Laravel Scheduler di Windows Task Scheduler
# ============================================
# Script ini akan membuat Windows Task Scheduler
# untuk menjalankan Laravel Scheduler setiap 1 menit
#
# CARA MENJALANKAN:
# 1. Buka PowerShell sebagai Administrator
# 2. cd C:\laragon\www\my-unila\manAkses
# 3. .\setup-scheduler-windows.ps1
# ============================================

# Require Administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Script ini harus dijalankan sebagai Administrator!"
    Write-Host "Klik kanan PowerShell dan pilih 'Run as Administrator'"
    Pause
    Exit
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Laravel Scheduler Setup untuk Windows" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$TaskName = "Laravel_SSO_Scheduler"
$TaskDescription = "Run Laravel SSO Sync Scheduler every minute"
$BatchFilePath = "C:\laragon\www\my-unila\manAkses\scheduler.bat"
$LogPath = "C:\laragon\www\my-unila\manAkses\storage\logs"

# Check if batch file exists
if (-not (Test-Path $BatchFilePath)) {
    Write-Host "Error: scheduler.bat tidak ditemukan!" -ForegroundColor Red
    Write-Host "Path: $BatchFilePath" -ForegroundColor Yellow
    Pause
    Exit
}

Write-Host "Batch file ditemukan: $BatchFilePath" -ForegroundColor Green
Write-Host ""

# Delete existing task if exists
$ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($ExistingTask) {
    Write-Host "Task '$TaskName' sudah ada. Menghapus task lama..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Task lama berhasil dihapus." -ForegroundColor Green
}

Write-Host ""
Write-Host "Membuat Windows Task Scheduler baru..." -ForegroundColor Cyan

# Create Action
$Action = New-ScheduledTaskAction -Execute $BatchFilePath -WorkingDirectory "C:\laragon\www\my-unila\manAkses"

# Create Trigger (every 1 minute)
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration ([TimeSpan]::MaxValue)

# Create Settings
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable:$false `
    -DontStopOnIdleEnd `
    -MultipleInstances IgnoreNew `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2)

# Create Principal (run as SYSTEM or current user)
$Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Register Task
try {
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Description $TaskDescription `
        -Action $Action `
        -Trigger $Trigger `
        -Settings $Settings `
        -Principal $Principal `
        -Force | Out-Null

    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "Task Scheduler berhasil dibuat!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Detail Task:" -ForegroundColor Cyan
    Write-Host "  Nama Task    : $TaskName" -ForegroundColor White
    Write-Host "  Deskripsi    : $TaskDescription" -ForegroundColor White
    Write-Host "  Batch File   : $BatchFilePath" -ForegroundColor White
    Write-Host "  Interval     : Setiap 1 menit" -ForegroundColor White
    Write-Host "  User         : SYSTEM" -ForegroundColor White
    Write-Host ""
    Write-Host "Scheduled Jobs:" -ForegroundColor Cyan
    Write-Host "  - Full Sync       : Setiap hari jam 01:00 WIB" -ForegroundColor White
    Write-Host "  - Daily Sync      : Setiap hari jam 06:00 WIB" -ForegroundColor White
    Write-Host "  - Weekly Sync     : Setiap Minggu jam 02:00 WIB" -ForegroundColor White
    Write-Host "  - Log Cleanup     : Setiap hari jam 03:00 WIB" -ForegroundColor White
    Write-Host "  - Cache Clear     : Setiap hari jam 03:30 WIB" -ForegroundColor White
    Write-Host ""
    Write-Host "Log Files:" -ForegroundColor Cyan
    Write-Host "  - Scheduler Runner   : $LogPath\scheduler-runner.log" -ForegroundColor White
    Write-Host "  - Scheduler Execution: $LogPath\scheduler-execution.log" -ForegroundColor White
    Write-Host "  - Full Sync          : $LogPath\sso-sync-scheduler.log" -ForegroundColor White
    Write-Host "  - Daily Sync         : $LogPath\sso-sync-incremental.log" -ForegroundColor White
    Write-Host "  - Weekly Sync        : $LogPath\sso-sync-weekly.log" -ForegroundColor White
    Write-Host ""
    Write-Host "Cara Melihat Task:" -ForegroundColor Yellow
    Write-Host "  1. Buka Task Scheduler: taskschd.msc" -ForegroundColor White
    Write-Host "  2. Cari task: $TaskName" -ForegroundColor White
    Write-Host "  3. Klik kanan > Run untuk test" -ForegroundColor White
    Write-Host ""
    Write-Host "Cara Monitoring:" -ForegroundColor Yellow
    Write-Host "  - Check logs: Get-Content '$LogPath\scheduler-runner.log' -Tail 50" -ForegroundColor White
    Write-Host "  - Check schedule: php artisan schedule:list" -ForegroundColor White
    Write-Host "  - Check status: php artisan sso:sync --status" -ForegroundColor White
    Write-Host ""

    # Test run scheduler
    Write-Host "Menjalankan test scheduler..." -ForegroundColor Yellow
    Start-ScheduledTask -TaskName $TaskName
    Start-Sleep -Seconds 2
    Write-Host "Test selesai! Cek log untuk memastikan scheduler berjalan." -ForegroundColor Green
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "Error saat membuat task:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Pause
    Exit
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Setup selesai! Task Scheduler sudah aktif." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Pause
