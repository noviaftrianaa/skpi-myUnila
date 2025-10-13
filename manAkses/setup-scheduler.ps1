# Setup Laravel Scheduler di Windows Task Scheduler
# Run as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Laravel Scheduler - SSO Sync" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$taskName = "Laravel-Scheduler-ManAkses"
$scriptPath = "C:\laragon\www\my-unila\manAkses\scheduler.bat"
$workingDir = "C:\laragon\www\my-unila\manAkses"

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if task exists
$taskExists = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($taskExists) {
    Write-Host "Task already exists. Removing old task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "✓ Old task removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Creating new scheduled task..." -ForegroundColor Cyan

# Create trigger (every minute)
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration ([TimeSpan]::MaxValue)

# Create action
$action = New-ScheduledTaskAction -Execute $scriptPath -WorkingDirectory $workingDir

# Create settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable:$false `
    -ExecutionTimeLimit (New-TimeSpan -Hours 3)

# Register task
try {
    Register-ScheduledTask `
        -TaskName $taskName `
        -Trigger $trigger `
        -Action $action `
        -Settings $settings `
        -Description "Laravel Scheduler untuk SSO Sync - Run setiap menit" `
        -RunLevel Highest `
        -ErrorAction Stop

    Write-Host ""
    Write-Host "✓ Task created successfully!" -ForegroundColor Green
    Write-Host ""

    # Start task immediately untuk testing
    Write-Host "Starting task for testing..." -ForegroundColor Cyan
    Start-ScheduledTask -TaskName $taskName

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Setup completed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Task Information:" -ForegroundColor Cyan
    Write-Host "  Name: $taskName" -ForegroundColor White
    Write-Host "  Schedule: Every 1 minute" -ForegroundColor White
    Write-Host "  Script: $scriptPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Monitor logs:" -ForegroundColor Cyan
    Write-Host "  - storage\logs\scheduler.log" -ForegroundColor White
    Write-Host "  - storage\logs\queue-worker.log" -ForegroundColor White
    Write-Host ""
    Write-Host "Check status:" -ForegroundColor Cyan
    Write-Host "  php artisan sso:sync --status" -ForegroundColor White
    Write-Host ""
    Write-Host "Verify task:" -ForegroundColor Cyan
    Write-Host "  schtasks /Query /TN `"$taskName`"" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "✗ Failed to create task!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Read-Host "Press Enter to exit"
