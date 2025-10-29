# ============================================================================
# MYUNILA MONITORING STACK - AUTOMATED SETUP SCRIPT
# ============================================================================
# Purpose: Automated installation of Prometheus + Grafana on Windows Server
# Version: 1.0
# Last Updated: 2025-10-29
# Requirements: Windows Server 2019/2022 or Windows 10/11
# Run as: Administrator
# ============================================================================

# Script Configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"  # Speed up downloads

# Color functions for better output
function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n========================================" -ForegroundColor Magenta
    Write-Host " $Message" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
}

# ============================================================================
# CONFIGURATION VARIABLES
# ============================================================================

Write-Host "`n"
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "║     MYUNILA MONITORING STACK - AUTOMATED SETUP                 ║" -ForegroundColor Cyan
Write-Host "║     Prometheus + Grafana Installation                         ║" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# Base directory
$baseDir = "C:\monitoring"

# Application versions
$prometheusVersion = "2.48.0"
$grafanaVersion = "10.2.3"

# Download URLs
$prometheusUrl = "https://github.com/prometheus/prometheus/releases/download/v$prometheusVersion/prometheus-$prometheusVersion.windows-amd64.zip"
$grafanaUrl = "https://dl.grafana.com/enterprise/release/grafana-enterprise-$grafanaVersion.windows-amd64.zip"

# Installation paths
$prometheusDir = Join-Path $baseDir "prometheus"
$grafanaDir = Join-Path $baseDir "grafana"

# Monitored servers (CHANGE THESE TO YOUR ACTUAL IPs)
$vmUbuntu1IP = "192.168.1.10"
$vmUbuntu2IP = "192.168.1.11"

Write-Info "Configuration:"
Write-Info "  Base Directory: $baseDir"
Write-Info "  Prometheus Version: $prometheusVersion"
Write-Info "  Grafana Version: $grafanaVersion"
Write-Info "  VM Ubuntu 1 (Frontend): $vmUbuntu1IP"
Write-Info "  VM Ubuntu 2 (Backend): $vmUbuntu2IP"
Write-Host "`n"

# ============================================================================
# STEP 0: PRE-FLIGHT CHECKS
# ============================================================================

Write-Step "Step 0: Pre-flight Checks"

# Check if running as Administrator
Write-Info "Checking administrator privileges..."
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Error "This script must be run as Administrator!"
    Write-Info "Right-click PowerShell and select 'Run as Administrator'"
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Success "Running with administrator privileges"

# Check PowerShell version
Write-Info "Checking PowerShell version..."
$psVersion = $PSVersionTable.PSVersion
Write-Info "PowerShell Version: $($psVersion.ToString())"
if ($psVersion.Major -lt 5) {
    Write-Error "PowerShell 5.0 or higher is required!"
    exit 1
}
Write-Success "PowerShell version is compatible"

# Check internet connectivity
Write-Info "Checking internet connectivity..."
try {
    $null = Test-Connection -ComputerName "8.8.8.8" -Count 1 -Quiet
    Write-Success "Internet connection is available"
} catch {
    Write-Warning "Cannot verify internet connectivity"
    Write-Info "Continuing anyway..."
}

# Check disk space (need at least 5GB free)
Write-Info "Checking disk space..."
$drive = Get-PSDrive C
$freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
Write-Info "Free space on C: drive: $freeSpaceGB GB"
if ($freeSpaceGB -lt 5) {
    Write-Warning "Low disk space! At least 5GB recommended."
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}
Write-Success "Sufficient disk space available"

# ============================================================================
# STEP 1: CREATE DIRECTORY STRUCTURE
# ============================================================================

Write-Step "Step 1: Creating Directory Structure"

Write-Info "Creating base directory: $baseDir"
if (-not (Test-Path $baseDir)) {
    New-Item -ItemType Directory -Path $baseDir -Force | Out-Null
    Write-Success "Created directory: $baseDir"
} else {
    Write-Info "Directory already exists: $baseDir"
}

# Create subdirectories for data and logs
$prometheusDataDir = Join-Path $prometheusDir "data"
$grafanaDataDir = Join-Path $grafanaDir "data"
$grafanaLogsDir = Join-Path $grafanaDir "logs"

Write-Success "Directory structure ready"

# ============================================================================
# STEP 2: INSTALL CHOCOLATEY
# ============================================================================

Write-Step "Step 2: Installing Chocolatey Package Manager"

Write-Info "Checking if Chocolatey is already installed..."
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if ($chocoInstalled) {
    Write-Info "Chocolatey is already installed"
    choco --version
} else {
    Write-Info "Installing Chocolatey..."
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

        Write-Success "Chocolatey installed successfully"
        choco --version
    } catch {
        Write-Error "Failed to install Chocolatey: $_"
        exit 1
    }
}

# ============================================================================
# STEP 3: INSTALL NSSM (SERVICE MANAGER)
# ============================================================================

Write-Step "Step 3: Installing NSSM (Non-Sucking Service Manager)"

Write-Info "Checking if NSSM is already installed..."
$nssmInstalled = Get-Command nssm -ErrorAction SilentlyContinue

if ($nssmInstalled) {
    Write-Info "NSSM is already installed"
    nssm version
} else {
    Write-Info "Installing NSSM via Chocolatey..."
    try {
        choco install nssm -y --no-progress

        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

        Write-Success "NSSM installed successfully"
        nssm version
    } catch {
        Write-Error "Failed to install NSSM: $_"
        exit 1
    }
}

# ============================================================================
# STEP 4: DOWNLOAD AND INSTALL PROMETHEUS
# ============================================================================

Write-Step "Step 4: Downloading and Installing Prometheus"

$prometheusZip = Join-Path $baseDir "prometheus.zip"
$prometheusExtractDir = Join-Path $baseDir "prometheus-$prometheusVersion.windows-amd64"

# Check if already exists
if (Test-Path $prometheusDir) {
    Write-Warning "Prometheus directory already exists: $prometheusDir"
    $overwrite = Read-Host "Overwrite existing installation? (y/n)"
    if ($overwrite -eq "y") {
        Write-Info "Stopping Prometheus service if running..."
        try {
            nssm stop Prometheus | Out-Null
            Start-Sleep -Seconds 2
        } catch {
            # Service may not exist yet
        }
        Write-Info "Removing old installation..."
        Remove-Item $prometheusDir -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        Write-Info "Skipping Prometheus installation"
        goto :SkipPrometheus
    }
}

Write-Info "Downloading Prometheus $prometheusVersion..."
Write-Info "URL: $prometheusUrl"
try {
    Invoke-WebRequest -Uri $prometheusUrl -OutFile $prometheusZip -UseBasicParsing
    Write-Success "Downloaded: $prometheusZip"
} catch {
    Write-Error "Failed to download Prometheus: $_"
    exit 1
}

Write-Info "Extracting Prometheus..."
try {
    Expand-Archive -Path $prometheusZip -DestinationPath $baseDir -Force
    Write-Success "Extracted to: $baseDir"
} catch {
    Write-Error "Failed to extract Prometheus: $_"
    exit 1
}

Write-Info "Renaming directory..."
if (Test-Path $prometheusExtractDir) {
    Rename-Item -Path $prometheusExtractDir -NewName "prometheus" -Force
    Write-Success "Renamed to: $prometheusDir"
} else {
    Write-Error "Extracted directory not found: $prometheusExtractDir"
    exit 1
}

Write-Info "Cleaning up zip file..."
Remove-Item $prometheusZip -Force
Write-Success "Cleanup complete"

# Verify Prometheus executable
$prometheusExe = Join-Path $prometheusDir "prometheus.exe"
if (Test-Path $prometheusExe) {
    Write-Success "Prometheus executable found: $prometheusExe"
} else {
    Write-Error "Prometheus executable not found!"
    exit 1
}

:SkipPrometheus

# ============================================================================
# STEP 5: CONFIGURE PROMETHEUS
# ============================================================================

Write-Step "Step 5: Configuring Prometheus"

$prometheusConfig = Join-Path $prometheusDir "prometheus.yml"

Write-Info "Generating Prometheus configuration..."
$configContent = @"
# Prometheus Configuration for MyUnila Production
# Auto-generated by setup-monitoring.ps1
# Last Updated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'myunila-production'
    environment: 'production'

scrape_configs:
  # ========================================
  # VM Ubuntu 1 - Frontend & Gateway
  # ========================================

  - job_name: 'vm-ubuntu-1-node'
    static_configs:
      - targets: ['$vmUbuntu1IP:9100']
        labels:
          server: 'vm-ubuntu-1'
          role: 'frontend'
          description: 'Host metrics (CPU, memory, disk, network)'

  - job_name: 'vm-ubuntu-1-cadvisor'
    static_configs:
      - targets: ['$vmUbuntu1IP:8090']
        labels:
          server: 'vm-ubuntu-1'
          role: 'frontend'
          description: 'Docker container metrics'

  - job_name: 'vm-ubuntu-1-nginx'
    static_configs:
      - targets: ['$vmUbuntu1IP:9113']
        labels:
          server: 'vm-ubuntu-1'
          role: 'frontend'
          service: 'nginx'
          description: 'Nginx proxy metrics'

  # ========================================
  # VM Ubuntu 2 - Backend Services
  # ========================================

  - job_name: 'vm-ubuntu-2-node'
    static_configs:
      - targets: ['$vmUbuntu2IP:9100']
        labels:
          server: 'vm-ubuntu-2'
          role: 'backend'
          description: 'Host metrics (CPU, memory, disk, network)'

  - job_name: 'vm-ubuntu-2-cadvisor'
    static_configs:
      - targets: ['$vmUbuntu2IP:8090']
        labels:
          server: 'vm-ubuntu-2'
          role: 'backend'
          description: 'Docker container metrics'

  - job_name: 'vm-ubuntu-2-redis'
    static_configs:
      - targets: ['$vmUbuntu2IP:9121']
        labels:
          server: 'vm-ubuntu-2'
          role: 'backend'
          service: 'redis'
          description: 'Redis cache metrics'

  - job_name: 'vm-ubuntu-2-nginx'
    static_configs:
      - targets: ['$vmUbuntu2IP:9113']
        labels:
          server: 'vm-ubuntu-2'
          role: 'backend'
          service: 'nginx'
          description: 'Nginx backend proxy metrics'
"@

try {
    $configContent | Out-File -FilePath $prometheusConfig -Encoding UTF8 -Force
    Write-Success "Prometheus configuration created: $prometheusConfig"
} catch {
    Write-Error "Failed to create Prometheus configuration: $_"
    exit 1
}

# Validate configuration
Write-Info "Validating Prometheus configuration..."
$promtool = Join-Path $prometheusDir "promtool.exe"
if (Test-Path $promtool) {
    try {
        & $promtool check config $prometheusConfig
        Write-Success "Prometheus configuration is valid"
    } catch {
        Write-Warning "Configuration validation failed, but continuing..."
    }
} else {
    Write-Warning "promtool not found, skipping validation"
}

# ============================================================================
# STEP 6: INSTALL PROMETHEUS AS WINDOWS SERVICE
# ============================================================================

Write-Step "Step 6: Installing Prometheus as Windows Service"

# Check if service already exists
$prometheusService = Get-Service -Name "Prometheus" -ErrorAction SilentlyContinue

if ($prometheusService) {
    Write-Warning "Prometheus service already exists"
    Write-Info "Stopping existing service..."
    try {
        nssm stop Prometheus
        Start-Sleep -Seconds 2
    } catch {
        Write-Warning "Could not stop service: $_"
    }

    Write-Info "Removing existing service..."
    try {
        nssm remove Prometheus confirm
        Start-Sleep -Seconds 2
        Write-Success "Removed existing Prometheus service"
    } catch {
        Write-Error "Failed to remove existing service: $_"
    }
}

Write-Info "Installing Prometheus service..."
try {
    # Create data directory
    if (-not (Test-Path $prometheusDataDir)) {
        New-Item -ItemType Directory -Path $prometheusDataDir -Force | Out-Null
    }

    # Install service
    nssm install Prometheus "$prometheusExe"
    nssm set Prometheus AppDirectory "$prometheusDir"
    nssm set Prometheus AppParameters "--config.file=$prometheusConfig --storage.tsdb.path=$prometheusDataDir --storage.tsdb.retention.time=30d --web.listen-address=:9090"
    nssm set Prometheus DisplayName "Prometheus Monitoring"
    nssm set Prometheus Description "Prometheus time-series database for monitoring MyUnila infrastructure"
    nssm set Prometheus Start SERVICE_AUTO_START
    nssm set Prometheus AppStdout "$prometheusDir\prometheus.log"
    nssm set Prometheus AppStderr "$prometheusDir\prometheus-error.log"
    nssm set Prometheus AppRotateFiles 1
    nssm set Prometheus AppRotateBytes 10485760  # 10MB

    Write-Success "Prometheus service installed"
} catch {
    Write-Error "Failed to install Prometheus service: $_"
    exit 1
}

Write-Info "Starting Prometheus service..."
try {
    nssm start Prometheus
    Start-Sleep -Seconds 5

    $status = nssm status Prometheus
    if ($status -match "SERVICE_RUNNING") {
        Write-Success "Prometheus service is running"
    } else {
        Write-Warning "Prometheus service status: $status"
    }
} catch {
    Write-Error "Failed to start Prometheus service: $_"
}

# ============================================================================
# STEP 7: DOWNLOAD AND INSTALL GRAFANA
# ============================================================================

Write-Step "Step 7: Downloading and Installing Grafana"

$grafanaZip = Join-Path $baseDir "grafana.zip"
$grafanaExtractDir = Join-Path $baseDir "grafana-$grafanaVersion"

# Check if already exists
if (Test-Path $grafanaDir) {
    Write-Warning "Grafana directory already exists: $grafanaDir"
    $overwrite = Read-Host "Overwrite existing installation? (y/n)"
    if ($overwrite -eq "y") {
        Write-Info "Stopping Grafana service if running..."
        try {
            nssm stop Grafana | Out-Null
            Start-Sleep -Seconds 2
        } catch {
            # Service may not exist yet
        }
        Write-Info "Removing old installation..."
        Remove-Item $grafanaDir -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        Write-Info "Skipping Grafana installation"
        goto :SkipGrafana
    }
}

Write-Info "Downloading Grafana $grafanaVersion..."
Write-Info "URL: $grafanaUrl"
try {
    Invoke-WebRequest -Uri $grafanaUrl -OutFile $grafanaZip -UseBasicParsing
    Write-Success "Downloaded: $grafanaZip"
} catch {
    Write-Error "Failed to download Grafana: $_"
    exit 1
}

Write-Info "Extracting Grafana..."
try {
    Expand-Archive -Path $grafanaZip -DestinationPath $baseDir -Force
    Write-Success "Extracted to: $baseDir"
} catch {
    Write-Error "Failed to extract Grafana: $_"
    exit 1
}

Write-Info "Renaming directory..."
if (Test-Path $grafanaExtractDir) {
    Rename-Item -Path $grafanaExtractDir -NewName "grafana" -Force
    Write-Success "Renamed to: $grafanaDir"
} else {
    Write-Error "Extracted directory not found: $grafanaExtractDir"
    exit 1
}

Write-Info "Cleaning up zip file..."
Remove-Item $grafanaZip -Force
Write-Success "Cleanup complete"

# Verify Grafana executable
$grafanaExe = Join-Path $grafanaDir "bin\grafana-server.exe"
if (Test-Path $grafanaExe) {
    Write-Success "Grafana executable found: $grafanaExe"
} else {
    Write-Error "Grafana executable not found!"
    exit 1
}

:SkipGrafana

# ============================================================================
# STEP 8: CONFIGURE GRAFANA
# ============================================================================

Write-Step "Step 8: Configuring Grafana"

# Create custom configuration
$grafanaConfDir = Join-Path $grafanaDir "conf"
$grafanaCustomConfig = Join-Path $grafanaConfDir "custom.ini"

Write-Info "Generating Grafana configuration..."
$grafanaConfigContent = @"
# Grafana Configuration for MyUnila Production
# Auto-generated by setup-monitoring.ps1
# Last Updated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

[server]
protocol = http
http_addr = 0.0.0.0
http_port = 3002
domain = localhost
root_url = http://localhost:3002/

[database]
type = sqlite3
path = grafana.db

[security]
admin_user = admin
admin_password = admin
# IMPORTANT: Change this password after first login!

[users]
allow_sign_up = false
allow_org_create = false
auto_assign_org = true
auto_assign_org_role = Viewer

[auth.anonymous]
enabled = false

[log]
mode = console file
level = info

[log.console]
level = info

[log.file]
level = info
log_rotate = true
max_lines = 1000000
max_size_shift = 28
daily_rotate = true
max_days = 7

[alerting]
enabled = true
execute_alerts = true

[unified_alerting]
enabled = true
"@

try {
    $grafanaConfigContent | Out-File -FilePath $grafanaCustomConfig -Encoding UTF8 -Force
    Write-Success "Grafana configuration created: $grafanaCustomConfig"
} catch {
    Write-Error "Failed to create Grafana configuration: $_"
    exit 1
}

# Create data and logs directories
if (-not (Test-Path $grafanaDataDir)) {
    New-Item -ItemType Directory -Path $grafanaDataDir -Force | Out-Null
}
if (-not (Test-Path $grafanaLogsDir)) {
    New-Item -ItemType Directory -Path $grafanaLogsDir -Force | Out-Null
}

# ============================================================================
# STEP 9: INSTALL GRAFANA AS WINDOWS SERVICE
# ============================================================================

Write-Step "Step 9: Installing Grafana as Windows Service"

# Check if service already exists
$grafanaService = Get-Service -Name "Grafana" -ErrorAction SilentlyContinue

if ($grafanaService) {
    Write-Warning "Grafana service already exists"
    Write-Info "Stopping existing service..."
    try {
        nssm stop Grafana
        Start-Sleep -Seconds 2
    } catch {
        Write-Warning "Could not stop service: $_"
    }

    Write-Info "Removing existing service..."
    try {
        nssm remove Grafana confirm
        Start-Sleep -Seconds 2
        Write-Success "Removed existing Grafana service"
    } catch {
        Write-Error "Failed to remove existing service: $_"
    }
}

Write-Info "Installing Grafana service..."
try {
    $grafanaBinDir = Join-Path $grafanaDir "bin"

    # Install service
    nssm install Grafana "$grafanaExe"
    nssm set Grafana AppDirectory "$grafanaBinDir"
    nssm set Grafana DisplayName "Grafana Dashboards"
    nssm set Grafana Description "Grafana visualization platform for MyUnila monitoring dashboards"
    nssm set Grafana Start SERVICE_AUTO_START
    nssm set Grafana AppStdout "$grafanaLogsDir\grafana.log"
    nssm set Grafana AppStderr "$grafanaLogsDir\grafana-error.log"
    nssm set Grafana AppRotateFiles 1
    nssm set Grafana AppRotateBytes 10485760  # 10MB

    Write-Success "Grafana service installed"
} catch {
    Write-Error "Failed to install Grafana service: $_"
    exit 1
}

Write-Info "Starting Grafana service..."
try {
    nssm start Grafana
    Start-Sleep -Seconds 5

    $status = nssm status Grafana
    if ($status -match "SERVICE_RUNNING") {
        Write-Success "Grafana service is running"
    } else {
        Write-Warning "Grafana service status: $status"
    }
} catch {
    Write-Error "Failed to start Grafana service: $_"
}

# ============================================================================
# STEP 10: CONFIGURE FIREWALL RULES
# ============================================================================

Write-Step "Step 10: Configuring Windows Firewall"

Write-Info "Creating firewall rule for Prometheus (port 9090)..."
try {
    $existingRule = Get-NetFirewallRule -DisplayName "Prometheus" -ErrorAction SilentlyContinue
    if ($existingRule) {
        Write-Info "Removing existing Prometheus firewall rule..."
        Remove-NetFirewallRule -DisplayName "Prometheus"
    }

    New-NetFirewallRule -DisplayName "Prometheus" `
      -Direction Inbound -LocalPort 9090 -Protocol TCP -Action Allow `
      -Description "Allow access to Prometheus monitoring UI" | Out-Null
    Write-Success "Prometheus firewall rule created"
} catch {
    Write-Warning "Failed to create Prometheus firewall rule: $_"
}

Write-Info "Creating firewall rule for Grafana (port 3002)..."
try {
    $existingRule = Get-NetFirewallRule -DisplayName "Grafana" -ErrorAction SilentlyContinue
    if ($existingRule) {
        Write-Info "Removing existing Grafana firewall rule..."
        Remove-NetFirewallRule -DisplayName "Grafana"
    }

    New-NetFirewallRule -DisplayName "Grafana" `
      -Direction Inbound -LocalPort 3002 -Protocol TCP -Action Allow `
      -Description "Allow access to Grafana dashboard UI" | Out-Null
    Write-Success "Grafana firewall rule created"
} catch {
    Write-Warning "Failed to create Grafana firewall rule: $_"
}

# ============================================================================
# STEP 11: VERIFY INSTALLATION
# ============================================================================

Write-Step "Step 11: Verifying Installation"

Write-Info "Checking Windows Services..."
$services = Get-Service -Name "Prometheus", "Grafana"
foreach ($service in $services) {
    $statusColor = if ($service.Status -eq "Running") { "Green" } else { "Red" }
    Write-Host "  $($service.DisplayName): " -NoNewline
    Write-Host "$($service.Status)" -ForegroundColor $statusColor
}

Write-Info "Checking if ports are listening..."
Start-Sleep -Seconds 3

$ports = @(
    @{Port=9090; Service="Prometheus"},
    @{Port=3002; Service="Grafana"}
)

foreach ($portInfo in $ports) {
    $port = $portInfo.Port
    $serviceName = $portInfo.Service
    $listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listening) {
        Write-Success "$serviceName is listening on port $port"
    } else {
        Write-Warning "$serviceName is NOT listening on port $port"
    }
}

Write-Info "Testing Prometheus endpoint..."
Start-Sleep -Seconds 2
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9090/-/healthy" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "Prometheus is responding (HTTP $($response.StatusCode))"
    } else {
        Write-Warning "Prometheus returned HTTP $($response.StatusCode)"
    }
} catch {
    Write-Warning "Could not connect to Prometheus: $_"
}

Write-Info "Testing Grafana endpoint..."
Start-Sleep -Seconds 2
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "Grafana is responding (HTTP $($response.StatusCode))"
    } else {
        Write-Warning "Grafana returned HTTP $($response.StatusCode)"
    }
} catch {
    Write-Warning "Could not connect to Grafana: $_"
}

# ============================================================================
# STEP 12: FINAL SUMMARY
# ============================================================================

Write-Step "Installation Complete!"

Write-Host "`n"
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║              MONITORING STACK INSTALLED SUCCESSFULLY           ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host "`n"

Write-Host "SERVICES INSTALLED:" -ForegroundColor Cyan
Write-Host "  - Prometheus $prometheusVersion" -ForegroundColor White
Write-Host "  - Grafana $grafanaVersion" -ForegroundColor White
Write-Host "`n"

Write-Host "ACCESS URLS:" -ForegroundColor Cyan
Write-Host "  Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "              http://192.168.1.12:9090 (remote)" -ForegroundColor White
Write-Host "`n"
Write-Host "  Grafana:    http://localhost:3002" -ForegroundColor White
Write-Host "              http://192.168.1.12:3002 (remote)" -ForegroundColor White
Write-Host "`n"

Write-Host "GRAFANA LOGIN CREDENTIALS:" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin" -ForegroundColor White
Write-Host "  " -ForegroundColor White
Write-Host "  ⚠️  IMPORTANT: Change password after first login!" -ForegroundColor Yellow
Write-Host "`n"

Write-Host "INSTALLATION DIRECTORY:" -ForegroundColor Cyan
Write-Host "  $baseDir" -ForegroundColor White
Write-Host "`n"

Write-Host "MONITORED SERVERS:" -ForegroundColor Cyan
Write-Host "  - VM Ubuntu 1 (Frontend): $vmUbuntu1IP" -ForegroundColor White
Write-Host "  - VM Ubuntu 2 (Backend):  $vmUbuntu2IP" -ForegroundColor White
Write-Host "`n"

Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. Open Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "     - Go to Status → Targets" -ForegroundColor White
Write-Host "     - Verify all targets are UP" -ForegroundColor White
Write-Host "`n"
Write-Host "  2. Open Grafana: http://localhost:3002" -ForegroundColor White
Write-Host "     - Login with admin/admin" -ForegroundColor White
Write-Host "     - Change password" -ForegroundColor White
Write-Host "     - Add Prometheus data source (http://localhost:9090)" -ForegroundColor White
Write-Host "     - Import dashboards (see README.md)" -ForegroundColor White
Write-Host "`n"

Write-Host "USEFUL COMMANDS:" -ForegroundColor Cyan
Write-Host "  Check services:    Get-Service Prometheus, Grafana" -ForegroundColor White
Write-Host "  Restart services:  nssm restart Prometheus" -ForegroundColor White
Write-Host "                     nssm restart Grafana" -ForegroundColor White
Write-Host "  View logs:         Get-Content $prometheusDir\prometheus.log -Tail 50" -ForegroundColor White
Write-Host "                     Get-Content $grafanaLogsDir\grafana.log -Tail 50" -ForegroundColor White
Write-Host "`n"

Write-Host "DOCUMENTATION:" -ForegroundColor Cyan
Write-Host "  Full guide: $baseDir\README.md" -ForegroundColor White
Write-Host "`n"

# Ask if user wants to open browsers
$openBrowsers = Read-Host "Open Prometheus and Grafana in browser now? (y/n)"
if ($openBrowsers -eq "y") {
    Write-Info "Opening Prometheus..."
    Start-Process "http://localhost:9090"
    Start-Sleep -Seconds 2

    Write-Info "Opening Grafana..."
    Start-Process "http://localhost:3002"
}

Write-Host "`n"
Write-Success "Setup script completed successfully!"
Write-Host "`n"

# End of script
