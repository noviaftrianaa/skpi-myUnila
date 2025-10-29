# Windows Server 1 - Monitoring Stack Deployment Guide

**Server Role:** Centralized Monitoring & Observability
**IP Address:** 192.168.1.12
**Services:** Prometheus, Grafana
**Last Updated:** 2025-10-29
**Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start (Automated)](#quick-start-automated)
4. [Manual Installation](#manual-installation)
5. [Configuration](#configuration)
6. [Dashboard Setup](#dashboard-setup)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance](#maintenance)
10. [Security Considerations](#security-considerations)

---

## Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  WINDOWS SERVER 1 (192.168.1.12)                            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Prometheus (Port 9090)                               │ │
│  │  - Scrapes metrics from VM Ubuntu 1 & 2              │ │
│  │  - Stores time-series data (30 days retention)       │ │
│  │  - Provides query interface (PromQL)                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                         ↓                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Grafana (Port 3002)                                  │ │
│  │  - Visualizes metrics from Prometheus                │ │
│  │  - Pre-configured dashboards                         │ │
│  │  - Alerting & notifications                          │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                         ↑
                         │ Scrapes metrics from:
                         │
        ┌────────────────┴────────────────┐
        │                                  │
        ↓                                  ↓
┌──────────────────┐            ┌──────────────────┐
│  VM Ubuntu 1     │            │  VM Ubuntu 2     │
│  192.168.1.10    │            │  192.168.1.11    │
│                  │            │                  │
│  • Node Exporter │            │  • Node Exporter │
│    (9100)        │            │    (9100)        │
│  • cAdvisor      │            │  • cAdvisor      │
│    (8090)        │            │    (8090)        │
│  • Nginx         │            │  • Redis         │
│    (9113)        │            │    (9121)        │
│                  │            │  • Nginx         │
│                  │            │    (9113)        │
└──────────────────┘            └──────────────────┘
```

### What Gets Monitored

#### VM Ubuntu 1 (Frontend & Gateway)
- **Host Metrics** (node-exporter:9100): CPU, memory, disk, network
- **Container Metrics** (cadvisor:8090): Docker containers performance
- **Nginx Metrics** (nginx-exporter:9113): HTTP requests, connections
- **Kong Gateway** (admin:9801): API gateway performance

#### VM Ubuntu 2 (Backend Services)
- **Host Metrics** (node-exporter:9100): CPU, memory, disk, network
- **Container Metrics** (cadvisor:8090): Docker containers performance
- **Redis Metrics** (redis-exporter:9121): Cache performance, memory usage
- **Nginx Metrics** (nginx-exporter:9113): Backend proxy performance

### Key Features

- **Real-time Monitoring**: Live metrics from all servers
- **Historical Data**: 30 days metric retention
- **Pre-built Dashboards**: Import community dashboards instantly
- **Alerting**: Configure alerts for critical conditions
- **Native Windows Services**: Runs as background services via NSSM
- **No Docker Required**: Runs directly on Windows

---

## Prerequisites

### System Requirements

- **Operating System**: Windows Server 2019/2022 or Windows 10/11
- **RAM**: Minimum 2GB (4GB recommended)
- **CPU**: 2 cores minimum (4 cores recommended)
- **Disk Space**: 20GB free (for metrics storage)
- **Network**: Access to 192.168.1.10 and 192.168.1.11

### Required Software

1. **PowerShell 5.1+** (pre-installed on modern Windows)
2. **Administrator Access** (required for service installation)
3. **Network Connectivity** to monitored servers

### Firewall Requirements

**Outbound (from Windows Server 1):**
- Port 9100 to 192.168.1.10 (VM Ubuntu 1 - Node Exporter)
- Port 8090 to 192.168.1.10 (VM Ubuntu 1 - cAdvisor)
- Port 9113 to 192.168.1.10 (VM Ubuntu 1 - Nginx Exporter)
- Port 9100 to 192.168.1.11 (VM Ubuntu 2 - Node Exporter)
- Port 8090 to 192.168.1.11 (VM Ubuntu 2 - cAdvisor)
- Port 9121 to 192.168.1.11 (VM Ubuntu 2 - Redis Exporter)
- Port 9113 to 192.168.1.11 (VM Ubuntu 2 - Nginx Exporter)

**Inbound (to Windows Server 1):**
- Port 9090 (Prometheus UI - optional, for remote access)
- Port 3002 (Grafana UI - recommended for dashboard access)

---

## Quick Start (Automated)

### Option A: Automated Setup Script (RECOMMENDED)

This is the fastest and easiest method.

**Step 1: Download Files**

Copy the deployment files to Windows Server 1:
```powershell
# Create monitoring directory
New-Item -ItemType Directory -Path "C:\monitoring" -Force

# Copy files from deployment package
# Files needed:
# - setup-monitoring.ps1
# - prometheus.yml (auto-generated by script)
```

**Step 2: Run Setup Script**

```powershell
# Open PowerShell as Administrator
# Right-click PowerShell → Run as Administrator

# Navigate to monitoring directory
cd C:\monitoring

# Set execution policy (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Run the automated setup script
.\setup-monitoring.ps1
```

**Step 3: Follow Prompts**

The script will:
1. ✅ Check for administrator privileges
2. ✅ Install Chocolatey (package manager)
3. ✅ Install NSSM (service manager)
4. ✅ Download Prometheus 2.48.0
5. ✅ Download Grafana 10.2.3
6. ✅ Extract and configure both applications
7. ✅ Generate Prometheus configuration
8. ✅ Install as Windows Services
9. ✅ Configure firewall rules
10. ✅ Start services

**Step 4: Verify Installation**

```powershell
# Check services are running
Get-Service Prometheus
Get-Service Grafana

# Both should show Status: Running

# Open in browser
Start-Process "http://localhost:9090"    # Prometheus
Start-Process "http://localhost:3002"    # Grafana
```

**Total Time: ~15-20 minutes** (depending on download speed)

---

## Manual Installation

If the automated script fails or you prefer manual control, follow these steps.

### Step 1: Install Chocolatey (Package Manager)

```powershell
# Open PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force

# Install Chocolatey
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Verify installation
choco --version
```

### Step 2: Install NSSM (Service Manager)

```powershell
# Install NSSM via Chocolatey
choco install nssm -y

# Verify installation
nssm version
```

### Step 3: Download and Install Prometheus

```powershell
# Navigate to monitoring directory
cd C:\monitoring

# Download Prometheus 2.48.0
$prometheusVersion = "2.48.0"
$prometheusUrl = "https://github.com/prometheus/prometheus/releases/download/v$prometheusVersion/prometheus-$prometheusVersion.windows-amd64.zip"
Invoke-WebRequest -Uri $prometheusUrl -OutFile "prometheus.zip"

# Extract
Expand-Archive -Path "prometheus.zip" -DestinationPath "." -Force

# Rename directory
Rename-Item "prometheus-$prometheusVersion.windows-amd64" "prometheus"

# Verify
Test-Path "C:\monitoring\prometheus\prometheus.exe"  # Should return True
```

### Step 4: Configure Prometheus

Create `C:\monitoring\prometheus\prometheus.yml`:

```yaml
# Global configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'myunila-production'
    environment: 'production'

# Scrape configurations
scrape_configs:
  # ========================================
  # VM Ubuntu 1 - Frontend & Gateway
  # ========================================

  # Node Exporter (host metrics)
  - job_name: 'vm-ubuntu-1-node'
    static_configs:
      - targets: ['192.168.1.10:9100']
        labels:
          server: 'vm-ubuntu-1'
          role: 'frontend'

  # cAdvisor (container metrics)
  - job_name: 'vm-ubuntu-1-cadvisor'
    static_configs:
      - targets: ['192.168.1.10:8090']
        labels:
          server: 'vm-ubuntu-1'
          role: 'frontend'

  # Nginx Exporter
  - job_name: 'vm-ubuntu-1-nginx'
    static_configs:
      - targets: ['192.168.1.10:9113']
        labels:
          server: 'vm-ubuntu-1'
          role: 'frontend'

  # ========================================
  # VM Ubuntu 2 - Backend Services
  # ========================================

  # Node Exporter (host metrics)
  - job_name: 'vm-ubuntu-2-node'
    static_configs:
      - targets: ['192.168.1.11:9100']
        labels:
          server: 'vm-ubuntu-2'
          role: 'backend'

  # cAdvisor (container metrics)
  - job_name: 'vm-ubuntu-2-cadvisor'
    static_configs:
      - targets: ['192.168.1.11:8090']
        labels:
          server: 'vm-ubuntu-2'
          role: 'backend'

  # Redis Exporter
  - job_name: 'vm-ubuntu-2-redis'
    static_configs:
      - targets: ['192.168.1.11:9121']
        labels:
          server: 'vm-ubuntu-2'
          service: 'redis'

  # Nginx Exporter
  - job_name: 'vm-ubuntu-2-nginx'
    static_configs:
      - targets: ['192.168.1.11:9113']
        labels:
          server: 'vm-ubuntu-2'
          role: 'backend'
```

### Step 5: Install Prometheus as Service

```powershell
# Install Prometheus service with NSSM
nssm install Prometheus "C:\monitoring\prometheus\prometheus.exe"

# Set working directory
nssm set Prometheus AppDirectory "C:\monitoring\prometheus"

# Set parameters
nssm set Prometheus AppParameters "--config.file=C:\monitoring\prometheus\prometheus.yml --storage.tsdb.path=C:\monitoring\prometheus\data --storage.tsdb.retention.time=30d --web.listen-address=:9090"

# Set service to auto-start
nssm set Prometheus Start SERVICE_AUTO_START

# Set display name
nssm set Prometheus DisplayName "Prometheus Monitoring"

# Set description
nssm set Prometheus Description "Prometheus time-series database for monitoring MyUnila infrastructure"

# Start service
nssm start Prometheus

# Verify service is running
Get-Service Prometheus
```

### Step 6: Download and Install Grafana

```powershell
cd C:\monitoring

# Download Grafana 10.2.3
$grafanaVersion = "10.2.3"
$grafanaUrl = "https://dl.grafana.com/enterprise/release/grafana-enterprise-$grafanaVersion.windows-amd64.zip"
Invoke-WebRequest -Uri $grafanaUrl -OutFile "grafana.zip"

# Extract
Expand-Archive -Path "grafana.zip" -DestinationPath "." -Force

# Rename directory
Rename-Item "grafana-$grafanaVersion" "grafana"

# Verify
Test-Path "C:\monitoring\grafana\bin\grafana-server.exe"  # Should return True
```

### Step 7: Configure Grafana

Edit `C:\monitoring\grafana\conf\defaults.ini` or create `C:\monitoring\grafana\conf\custom.ini`:

```ini
[server]
http_port = 3002
domain = localhost
root_url = http://localhost:3002/

[database]
type = sqlite3
path = grafana.db

[security]
admin_user = admin
admin_password = admin
# Change this after first login!

[auth.anonymous]
enabled = false
```

### Step 8: Install Grafana as Service

```powershell
# Install Grafana service with NSSM
nssm install Grafana "C:\monitoring\grafana\bin\grafana-server.exe"

# Set working directory
nssm set Grafana AppDirectory "C:\monitoring\grafana\bin"

# Set service to auto-start
nssm set Grafana Start SERVICE_AUTO_START

# Set display name
nssm set Grafana DisplayName "Grafana Dashboards"

# Set description
nssm set Grafana Description "Grafana visualization platform for MyUnila monitoring"

# Start service
nssm start Grafana

# Verify service is running
Get-Service Grafana
```

### Step 9: Configure Firewall

```powershell
# Allow Prometheus (port 9090)
New-NetFirewallRule -DisplayName "Prometheus" `
  -Direction Inbound -LocalPort 9090 -Protocol TCP -Action Allow `
  -Description "Allow access to Prometheus UI"

# Allow Grafana (port 3002)
New-NetFirewallRule -DisplayName "Grafana" `
  -Direction Inbound -LocalPort 3002 -Protocol TCP -Action Allow `
  -Description "Allow access to Grafana dashboards"

# Verify rules
Get-NetFirewallRule -DisplayName "Prometheus"
Get-NetFirewallRule -DisplayName "Grafana"
```

---

## Configuration

### Accessing Services

**Prometheus:**
- Local: `http://localhost:9090`
- Remote: `http://192.168.1.12:9090`
- Default credentials: None (open access)

**Grafana:**
- Local: `http://localhost:3002`
- Remote: `http://192.168.1.12:3002`
- Default credentials:
  - Username: `admin`
  - Password: `admin` (change on first login!)

### Initial Grafana Setup

**Step 1: Login**
1. Open browser: `http://localhost:3002`
2. Login with `admin` / `admin`
3. **IMPORTANT**: Change password when prompted

**Step 2: Add Prometheus Data Source**
1. Click **Configuration** (gear icon) → **Data Sources**
2. Click **Add data source**
3. Select **Prometheus**
4. Configure:
   - Name: `Prometheus`
   - URL: `http://localhost:9090`
   - Access: `Server (default)`
5. Click **Save & Test**
6. Should see: ✅ **Data source is working**

---

## Dashboard Setup

### Recommended Dashboards

Import these pre-built dashboards from Grafana.com:

#### 1. Node Exporter Full (ID: 1860)
**Purpose:** Comprehensive host metrics (CPU, memory, disk, network)

**Import Steps:**
1. Go to: **Dashboards** → **Import**
2. Enter Dashboard ID: `1860`
3. Click **Load**
4. Select **Prometheus** as data source
5. Click **Import**

**What you'll see:**
- CPU usage per core
- Memory usage (used/free/cached)
- Disk I/O and space
- Network traffic
- System load averages

---

#### 2. Docker Container & Host Metrics (ID: 193)
**Purpose:** Container-level metrics from cAdvisor

**Import Steps:**
1. **Dashboards** → **Import** → ID: `193`
2. Select **Prometheus** data source
3. **Import**

**What you'll see:**
- Container CPU usage
- Container memory usage
- Container network I/O
- Container filesystem usage
- Running containers count

---

#### 3. Redis Dashboard (ID: 11692)
**Purpose:** Redis cache performance and health

**Import Steps:**
1. **Dashboards** → **Import** → ID: `11692`
2. Select **Prometheus** data source
3. **Import**

**What you'll see:**
- Commands per second
- Connected clients
- Memory usage
- Hit/miss ratio
- Key evictions

---

#### 4. Nginx Dashboard (ID: 12708)
**Purpose:** Nginx web server metrics

**Import Steps:**
1. **Dashboards** → **Import** → ID: `12708`
2. Select **Prometheus** data source
3. **Import**

**What you'll see:**
- Requests per second
- Active connections
- Request duration
- HTTP status codes
- Bandwidth usage

---

### Creating Custom Dashboards

**Example: API Response Time Dashboard**

```promql
# Query examples for custom panels:

# Average API response time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Request rate per service
sum(rate(http_requests_total[5m])) by (service)

# Error rate (5xx responses)
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)

# Memory usage percentage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100
```

---

## Verification

### Check Prometheus Targets

1. Open: `http://localhost:9090/targets`
2. Verify all targets show **UP** status:

```
✅ vm-ubuntu-1-node (192.168.1.10:9100) - UP
✅ vm-ubuntu-1-cadvisor (192.168.1.10:8090) - UP
✅ vm-ubuntu-1-nginx (192.168.1.10:9113) - UP
✅ vm-ubuntu-2-node (192.168.1.11:9100) - UP
✅ vm-ubuntu-2-cadvisor (192.168.1.11:8090) - UP
✅ vm-ubuntu-2-redis (192.168.1.11:9121) - UP
✅ vm-ubuntu-2-nginx (192.168.1.11:9113) - UP
```

### Check Grafana Dashboards

1. Open: `http://localhost:3002`
2. Go to **Dashboards** → **Browse**
3. Open each imported dashboard
4. Verify data is flowing (not "No Data")
5. Adjust time range if needed (top-right: Last 15 minutes)

### Test Queries

In Prometheus UI (`http://localhost:9090`), test these queries:

```promql
# CPU usage
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Redis connected clients
redis_connected_clients

# HTTP requests per second
sum(rate(nginx_http_requests_total[1m]))
```

### Check Windows Services

```powershell
# Check service status
Get-Service Prometheus, Grafana

# Should show:
# Status   Name               DisplayName
# ------   ----               -----------
# Running  Prometheus         Prometheus Monitoring
# Running  Grafana            Grafana Dashboards

# View service details
Get-Service Prometheus | Select-Object *
Get-Service Grafana | Select-Object *
```

---

## Troubleshooting

### Issue: Service Won't Start

**Symptoms:**
```powershell
Get-Service Prometheus
# Status: Stopped
```

**Solutions:**

1. **Check if port is in use:**
   ```powershell
   netstat -ano | findstr :9090
   # If something is using port 9090, kill it or change Prometheus port
   ```

2. **Check service configuration:**
   ```powershell
   nssm status Prometheus
   nssm get Prometheus AppDirectory
   nssm get Prometheus AppParameters
   ```

3. **View service logs:**
   ```powershell
   # Check Windows Event Viewer
   Get-EventLog -LogName Application -Source Prometheus -Newest 10

   # Or check Prometheus logs
   cat C:\monitoring\prometheus\data\*.log
   ```

4. **Restart service:**
   ```powershell
   nssm restart Prometheus
   ```

---

### Issue: Target is DOWN in Prometheus

**Symptoms:**
- Target shows RED with "Connection refused" or "Timeout"

**Solutions:**

1. **Test connectivity:**
   ```powershell
   # Test ping
   ping 192.168.1.10
   ping 192.168.1.11

   # Test port connectivity
   Test-NetConnection -ComputerName 192.168.1.10 -Port 9100
   Test-NetConnection -ComputerName 192.168.1.11 -Port 9100
   ```

2. **Check firewall on Ubuntu VMs:**
   ```bash
   # SSH to Ubuntu VM
   ssh user@192.168.1.10

   # Check UFW status
   sudo ufw status

   # Ensure exporters are running
   docker ps | grep exporter
   ```

3. **Verify exporter is responding:**
   ```powershell
   # From Windows Server, use curl (if available)
   curl http://192.168.1.10:9100/metrics
   curl http://192.168.1.11:9100/metrics
   ```

4. **Check prometheus.yml configuration:**
   ```powershell
   # Verify IP addresses are correct
   cat C:\monitoring\prometheus\prometheus.yml

   # Test Prometheus config
   C:\monitoring\prometheus\promtool.exe check config C:\monitoring\prometheus\prometheus.yml
   ```

---

### Issue: No Data in Grafana Dashboards

**Symptoms:**
- Dashboards show "No Data" or empty graphs

**Solutions:**

1. **Check Prometheus data source:**
   - Go to: Configuration → Data Sources → Prometheus
   - Click **Test** button
   - Should see green checkmark with "Data source is working"

2. **Check time range:**
   - Top-right corner of dashboard
   - Try selecting "Last 5 minutes" or "Last 15 minutes"
   - Some dashboards default to long time ranges with no data

3. **Verify metrics exist in Prometheus:**
   - Open: `http://localhost:9090`
   - Go to **Graph** tab
   - Try query: `up`
   - Should see list of all targets

4. **Check dashboard variables:**
   - Some dashboards use variables (top of dashboard)
   - Ensure correct instance/host is selected
   - Try selecting "All" to see all data

---

### Issue: Can't Access Grafana Remotely

**Symptoms:**
- Can access locally but not from other machines

**Solutions:**

1. **Check firewall rule:**
   ```powershell
   Get-NetFirewallRule -DisplayName "Grafana"
   # Should show Enabled: True

   # If not, create rule:
   New-NetFirewallRule -DisplayName "Grafana" `
     -Direction Inbound -LocalPort 3002 -Protocol TCP -Action Allow
   ```

2. **Check Grafana is binding to all interfaces:**
   ```ini
   # In C:\monitoring\grafana\conf\custom.ini
   [server]
   http_addr = 0.0.0.0
   http_port = 3002
   ```

3. **Restart Grafana:**
   ```powershell
   nssm restart Grafana
   ```

---

### Issue: High Disk Usage

**Symptoms:**
- C:\monitoring folder growing too large

**Solutions:**

1. **Check Prometheus data size:**
   ```powershell
   # Check size
   Get-ChildItem C:\monitoring\prometheus\data -Recurse | Measure-Object -Property Length -Sum

   # Size in GB
   (Get-ChildItem C:\monitoring\prometheus\data -Recurse | Measure-Object -Property Length -Sum).Sum / 1GB
   ```

2. **Adjust retention period:**
   ```powershell
   # Edit retention time (default is 30 days)
   nssm set Prometheus AppParameters "--config.file=C:\monitoring\prometheus\prometheus.yml --storage.tsdb.path=C:\monitoring\prometheus\data --storage.tsdb.retention.time=15d"

   # Restart Prometheus
   nssm restart Prometheus
   ```

3. **Manually clean old data:**
   ```powershell
   # Stop Prometheus
   nssm stop Prometheus

   # Delete old data (CAUTION: This deletes historical data!)
   Remove-Item C:\monitoring\prometheus\data\* -Recurse -Force

   # Start Prometheus
   nssm start Prometheus
   ```

---

## Maintenance

### Regular Tasks

**Daily:**
- Check Grafana dashboards for anomalies
- Review alerts (if configured)

**Weekly:**
```powershell
# Check service health
Get-Service Prometheus, Grafana

# Check disk space
Get-PSDrive C | Select-Object Used, Free

# Check logs for errors
Get-EventLog -LogName Application -Source Prometheus, Grafana -EntryType Error -Newest 50
```

**Monthly:**
```powershell
# Update Prometheus (if new version available)
# 1. Stop service
nssm stop Prometheus

# 2. Backup data
Copy-Item C:\monitoring\prometheus\data C:\monitoring\prometheus\data.backup -Recurse

# 3. Download new version and replace executable
# 4. Start service
nssm start Prometheus

# Update Grafana (similar process)
nssm stop Grafana
# Download new version, replace files
nssm start Grafana
```

**Quarterly:**
- Review and optimize dashboard queries
- Clean up unused dashboards
- Review alert rules and thresholds
- Security audit (check Grafana users, permissions)

---

### Backup Procedures

**What to Backup:**
1. Prometheus configuration: `C:\monitoring\prometheus\prometheus.yml`
2. Prometheus data (optional): `C:\monitoring\prometheus\data\`
3. Grafana configuration: `C:\monitoring\grafana\conf\custom.ini`
4. Grafana database: `C:\monitoring\grafana\data\grafana.db`
5. Grafana dashboards: Export as JSON

**Backup Script:**
```powershell
# Create backup directory
$backupDir = "C:\backups\monitoring_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force

# Backup Prometheus config
Copy-Item C:\monitoring\prometheus\prometheus.yml $backupDir\

# Backup Grafana config and database
Copy-Item C:\monitoring\grafana\conf\custom.ini $backupDir\ -ErrorAction SilentlyContinue
Copy-Item C:\monitoring\grafana\data\grafana.db $backupDir\

# Compress
Compress-Archive -Path $backupDir -DestinationPath "$backupDir.zip"

Write-Host "Backup created: $backupDir.zip"
```

---

## Security Considerations

### 1. Change Default Passwords

```powershell
# Grafana: Change admin password on first login (web UI)
# Or edit via CLI:
C:\monitoring\grafana\bin\grafana-cli.exe admin reset-admin-password <newpassword>
```

### 2. Enable HTTPS (Production)

For production, configure HTTPS for Grafana:

```ini
# C:\monitoring\grafana\conf\custom.ini
[server]
protocol = https
cert_file = C:\certs\server.crt
cert_key = C:\certs\server.key
```

### 3. Restrict Access

```powershell
# Limit Grafana access to specific IPs
New-NetFirewallRule -DisplayName "Grafana" `
  -Direction Inbound -LocalPort 3002 -Protocol TCP -Action Allow `
  -RemoteAddress 192.168.1.0/24

# Or use Grafana's built-in authentication
```

### 4. Regular Updates

```powershell
# Check for updates monthly
# Prometheus: https://github.com/prometheus/prometheus/releases
# Grafana: https://grafana.com/grafana/download
```

### 5. Audit Logs

```powershell
# Enable Grafana audit logging
# C:\monitoring\grafana\conf\custom.ini
[log]
mode = console file
level = info

[log.file]
log_rotate = true
max_lines = 1000000
max_size_shift = 28
daily_rotate = true
max_days = 7
```

---

## Additional Resources

### Documentation
- **Prometheus**: https://prometheus.io/docs/
- **Grafana**: https://grafana.com/docs/
- **NSSM**: https://nssm.cc/usage

### Community Dashboards
- **Grafana Dashboards**: https://grafana.com/grafana/dashboards/

### Support
- **Main Deployment Guide**: `/deployment/README.md`
- **Architecture**: `/deployment/docs/ARCHITECTURE.md`
- **VM Ubuntu 1**: `/deployment/vm-ubuntu-1/README.md`
- **VM Ubuntu 2**: `/deployment/vm-ubuntu-2/README.md`

---

## Appendix: Service Management Commands

```powershell
# ========================================
# Service Control
# ========================================

# Start services
nssm start Prometheus
nssm start Grafana

# Stop services
nssm stop Prometheus
nssm stop Grafana

# Restart services
nssm restart Prometheus
nssm restart Grafana

# Check service status
nssm status Prometheus
nssm status Grafana

# Or use Windows commands:
Get-Service Prometheus
Get-Service Grafana
Start-Service Prometheus
Stop-Service Prometheus
Restart-Service Prometheus

# ========================================
# Service Configuration
# ========================================

# View service settings
nssm dump Prometheus
nssm dump Grafana

# Edit service (opens GUI)
nssm edit Prometheus
nssm edit Grafana

# Remove service (CAUTION!)
nssm stop Prometheus
nssm remove Prometheus confirm

# ========================================
# Logs and Debugging
# ========================================

# View Windows Event Logs
Get-EventLog -LogName Application -Source Prometheus -Newest 20
Get-EventLog -LogName Application -Source Grafana -Newest 20

# Check if ports are listening
netstat -ano | findstr :9090  # Prometheus
netstat -ano | findstr :3002  # Grafana

# Test service manually (for debugging)
cd C:\monitoring\prometheus
.\prometheus.exe --config.file=prometheus.yml

cd C:\monitoring\grafana\bin
.\grafana-server.exe
```

---

**End of Guide**

**Version:** 1.0
**Last Updated:** 2025-10-29
**Maintainer:** DevOps Team
**Status:** Production Ready

For questions or issues, refer to the main deployment documentation or contact the DevOps team.
