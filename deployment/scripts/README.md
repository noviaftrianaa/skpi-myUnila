# Deployment Scripts

Koleksi script automation untuk deployment dan maintenance MyUnila Production.

## 📋 Daftar Script

### 1. `deploy-vm1.sh` - Deploy VM Ubuntu 1
**Fungsi**: Automated deployment untuk Frontend + Kong Gateway + Nginx

**Usage**:
```bash
# Set environment variables
export REPO_URL="https://bitbucket.org/your-org/my-unila.git"
export BRANCH="master"

# Run deployment
sudo ./deploy-vm1.sh
```

**Proses**:
1. Check prerequisites (Docker, Docker Compose)
2. Pull/clone repository
3. Verify .env configuration
4. Stop existing containers
5. Pull base images
6. Build frontend image
7. Start services (database → kong → frontend → nginx)
8. Verify deployment
9. Show logs

**Output**:
- Frontend: http://localhost:3000
- Kong Proxy: http://localhost:9800
- Kong Admin: http://localhost:8001
- Nginx: http://localhost:80

---

### 2. `deploy-vm2.sh` - Deploy VM Ubuntu 2
**Fungsi**: Automated deployment untuk Backend Services + Redis

**Usage**:
```bash
# Set environment variables
export REPO_URL="https://bitbucket.org/your-org/my-unila.git"
export BRANCH="master"

# Run deployment
sudo ./deploy-vm2.sh
```

**Proses**:
1. Check prerequisites
2. Pull/clone repository
3. Verify .env configuration
4. Test database connection
5. Stop existing containers
6. Pull base images
7. Build all backend services
8. Run database migrations
9. Start services (Redis → Auth/Dashboard/Sister → Exporters → Nginx)
10. Verify deployment
11. Show logs

**Output**:
- Auth Service: http://localhost:8081
- Dashboard Service: http://localhost:8082
- Sister Service: http://localhost:8083
- Monitoring: http://localhost:9100, 9121, 9113

---

### 3. `configure-kong.sh` - Configure Kong Routes
**Fungsi**: Automate Kong service dan route registration

**Usage**:
```bash
# Default (localhost)
./configure-kong.sh

# Custom Kong Admin URL and VM2 IP
export KONG_ADMIN_URL="http://192.168.1.10:8001"
export VM_UBUNTU_2_IP="192.168.1.11"
./configure-kong.sh
```

**Konfigurasi yang dibuat**:
- **Auth Service**: `/api/auth` → VM2:8081
- **Dashboard Service**: `/api/dashboard` → VM2:8082
- **Sister Service**: `/api/sister` → VM2:8083

**Plugins**:
- Rate Limiting (50-100 req/s per service)
- CORS (Allow credentials, common methods)

**Verify**:
```bash
curl http://localhost:8001/routes | jq
```

---

### 4. `health-check.sh` - Comprehensive Health Check
**Fungsi**: Check health semua services, databases, dan infrastructure

**Usage**:
```bash
# Default (localhost)
./health-check.sh

# Custom IPs
export VM_UBUNTU_1_IP="192.168.1.10"
export VM_UBUNTU_2_IP="192.168.1.11"
export DB_HOST="192.168.1.13"
export MONITORING_HOST="192.168.1.12"
./health-check.sh
```

**Checks**:
- ✅ Docker containers status
- ✅ HTTP endpoints (Frontend, Kong, Services)
- ✅ Database connectivity
- ✅ Monitoring exporters
- ✅ Kong routes configuration
- ✅ System resources (disk, memory)

**Exit Codes**:
- `0` = All checks passed
- `1` = Some checks failed

**Integration**:
```bash
# Run in cron for monitoring
*/5 * * * * /opt/myunila/deployment/scripts/health-check.sh >> /var/log/myunila-health.log 2>&1
```

---

### 5. `backup-all.sh` - Comprehensive Backup
**Fungsi**: Backup semua volumes, configs, database, dan logs

**Usage**:
```bash
# Set credentials
export DB_PASSWORD="your_strong_password"
export BACKUP_ROOT="/backup"
export RETENTION_DAYS=30

# Run backup
sudo ./backup-all.sh
```

**Backup Includes**:
- Docker volumes (Kong, Redis, Frontend, Services)
- Configuration files (Nginx, SSL certificates)
- SQL Server database (via sqlcmd)
- Redis dump.rdb
- Container logs

**Output**:
```
/backup/myunila-backup-20250129_143000.tar.gz
```

**Retention**: Automatically deletes backups older than `RETENTION_DAYS`

**Cron Schedule**:
```bash
# Daily backup at 2 AM
0 2 * * * /opt/myunila/deployment/scripts/backup-all.sh >> /var/log/myunila-backup.log 2>&1
```

**Restore Example**:
```bash
# Extract backup
cd /backup
tar xzf myunila-backup-20250129_143000.tar.gz

# Restore volume
docker run --rm \
  -v kong_postgres_data:/target \
  -v /backup/20250129_143000/volumes:/source \
  alpine \
  sh -c "cd /target && tar xzf /source/kong_postgres_data.tar.gz"
```

---

## 🔧 Prerequisites

### Semua Script
- Bash 4.0+
- Docker 20.10+
- Docker Compose v2.0+
- curl
- jq (untuk Kong configuration)

### Backup Script
- tar, gzip
- sqlcmd (untuk SQL Server backup)
- scp (untuk remote backup copy)

### Health Check Script
- nc (netcat) untuk port checking

### Install Prerequisites (Ubuntu)
```bash
# Update system
sudo apt update

# Install required packages
sudo apt install -y \
  curl \
  jq \
  netcat \
  tar \
  gzip

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose-plugin
```

---

## 📝 Environment Variables

### Deploy Scripts (deploy-vm1.sh, deploy-vm2.sh)
```bash
export REPO_URL="https://bitbucket.org/your-org/my-unila.git"
export BRANCH="master"
```

### Kong Configuration (configure-kong.sh)
```bash
export KONG_ADMIN_URL="http://192.168.1.10:8001"
export VM_UBUNTU_2_IP="192.168.1.11"
```

### Health Check (health-check.sh)
```bash
export VM_UBUNTU_1_IP="192.168.1.10"
export VM_UBUNTU_2_IP="192.168.1.11"
export DB_HOST="192.168.1.13"
export MONITORING_HOST="192.168.1.12"
export FRONTEND_URL="http://localhost:3000"
export KONG_ADMIN_URL="http://localhost:8001"
export KONG_PROXY_URL="http://localhost:9800"
```

### Backup (backup-all.sh)
```bash
export BACKUP_ROOT="/backup"
export RETENTION_DAYS=30
export DB_HOST="192.168.1.13"
export DB_PORT="1433"
export DB_NAME="pdut_dev"
export DB_USER="sa"
export DB_PASSWORD="your_password"
```

---

## 🚀 Quick Start

### First Time Deployment

#### 1. Clone repository di setiap VM
```bash
# VM Ubuntu 1
cd /opt
sudo git clone https://bitbucket.org/your-org/my-unila.git myunila
cd myunila/deployment/scripts
sudo chmod +x *.sh
```

#### 2. Deploy VM Ubuntu 2 (Backend) terlebih dahulu
```bash
# VM Ubuntu 2
cd /opt/myunila/deployment/scripts
./deploy-vm2.sh
```

#### 3. Deploy VM Ubuntu 1 (Frontend + Gateway)
```bash
# VM Ubuntu 1
cd /opt/myunila/deployment/scripts
./deploy-vm1.sh
```

#### 4. Configure Kong Gateway
```bash
# VM Ubuntu 1
export VM_UBUNTU_2_IP="192.168.1.11"
./configure-kong.sh
```

#### 5. Run Health Check
```bash
# Any VM
export VM_UBUNTU_1_IP="192.168.1.10"
export VM_UBUNTU_2_IP="192.168.1.11"
export DB_HOST="192.168.1.13"
./health-check.sh
```

---

## 🔄 Update/Redeploy

### Update VM Ubuntu 1
```bash
cd /opt/myunila/deployment/scripts
./deploy-vm1.sh
```

### Update VM Ubuntu 2
```bash
cd /opt/myunila/deployment/scripts
./deploy-vm2.sh
```

### Reconfigure Kong (setelah update services)
```bash
./configure-kong.sh
```

---

## 🛡️ Maintenance Tasks

### Daily Backup
```bash
# Setup cron
crontab -e

# Add line:
0 2 * * * /opt/myunila/deployment/scripts/backup-all.sh >> /var/log/myunila-backup.log 2>&1
```

### Health Monitoring
```bash
# Setup cron
crontab -e

# Add line (check every 5 minutes):
*/5 * * * * /opt/myunila/deployment/scripts/health-check.sh >> /var/log/myunila-health.log 2>&1
```

### Log Rotation
```bash
# Create logrotate config
sudo nano /etc/logrotate.d/myunila

# Add:
/var/log/myunila-*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 root root
}
```

---

## 🐛 Troubleshooting

### Script Permission Denied
```bash
sudo chmod +x /opt/myunila/deployment/scripts/*.sh
```

### Docker Permission Denied
```bash
sudo usermod -aG docker $USER
# Logout and login again
```

### Kong Migrations Failed
```bash
# Manually bootstrap Kong
cd /opt/myunila/deployment/vm-ubuntu-1
docker-compose run --rm kong kong migrations bootstrap
```

### Service Health Check Failed
```bash
# Check logs
docker-compose logs -f [service-name]

# Restart service
docker-compose restart [service-name]
```

### Database Connection Failed
```bash
# Test connection
nc -zv 192.168.1.13 1433

# Check firewall
sudo ufw status
sudo ufw allow from 192.168.1.0/24 to any port 1433
```

---

## 📊 Monitoring Integration

### Prometheus Alerts
```yaml
# Example alert rules
groups:
  - name: myunila
    rules:
      - alert: ServiceDown
        expr: up{job="myunila"} == 0
        for: 5m
        annotations:
          summary: "Service {{ $labels.instance }} is down"
```

### Health Check Integration
```bash
# Run health check and send to monitoring
./health-check.sh && curl -X POST https://monitoring.myunila.ac.id/webhook \
  -H "Content-Type: application/json" \
  -d '{"status": "ok", "timestamp": "'$(date -Iseconds)'"}'
```

---

## 📚 Additional Resources

- [Main Deployment Guide](../DEPLOYMENT_SUMMARY.md)
- [Architecture Documentation](../docs/ARCHITECTURE.md)
- [VM Ubuntu 1 Setup](../vm-ubuntu-1/README.md)
- [VM Ubuntu 2 Setup](../vm-ubuntu-2/README.md)
- [Windows Server Monitoring](../windows-server-1/README.md)

---

## 🤝 Support

Jika mengalami masalah:
1. Cek logs: `docker-compose logs -f`
2. Run health check: `./health-check.sh`
3. Hubungi tim DevOps

---

**Last Updated**: 2025-01-29
