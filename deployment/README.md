# MyUnila Production Deployment Package

Complete production deployment package untuk sistem MyUnila dengan arsitektur microservices.

## 📋 Ringkasan Deployment

| Server | Role | Spesifikasi | Services |
|--------|------|-------------|----------|
| **VM Ubuntu 1** | Frontend + Gateway | 8 core, 16GB RAM | Frontend (Next.js), Kong Gateway, Nginx |
| **VM Ubuntu 2** | Backend Services | 8 core, 16GB RAM | Auth, Dashboard, Sister, Redis |
| **Windows Server 1** | Monitoring | 16GB RAM, Xeon 5218R | Prometheus, Grafana |
| **Windows Server 2** | Database | 16GB RAM, Xeon 5218R | SQL Server 2022 |

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://bitbucket.org/mahendraunila/my-unila.git
cd my-unila/deployment
```

### 2. Deploy VM Ubuntu 1 (Frontend + Gateway)
```bash
cd vm-ubuntu-1
cp .env.example .env
# Edit .env dengan konfigurasi Anda
nano .env

# Deploy menggunakan automation script
cd ../scripts
chmod +x deploy-vm1.sh
./deploy-vm1.sh
```

### 3. Deploy VM Ubuntu 2 (Backend Services)
```bash
cd vm-ubuntu-2
cp .env.example .env
# Edit .env dengan konfigurasi Anda
nano .env

# Deploy menggunakan automation script
cd ../scripts
chmod +x deploy-vm2.sh
./deploy-vm2.sh
```

### 4. Setup Windows Server 1 (Monitoring)
```powershell
# Run as Administrator
cd windows-server-1
.\setup-monitoring.ps1
```

### 5. Configure Kong Gateway
```bash
cd scripts
chmod +x configure-kong.sh
./configure-kong.sh
```

### 6. Health Check
```bash
cd scripts
chmod +x health-check.sh
./health-check.sh
```

## 📁 Struktur Folder

```
deployment/
├── README.md                          # File ini (master guide)
├── DEPLOYMENT_SUMMARY.md              # Step-by-step deployment (5 phases)
├── COMPLETE_FILE_LIST.md              # Inventory semua file
│
├── docs/
│   └── ARCHITECTURE.md                # Arsitektur sistem & diagrams
│
├── scripts/                           # Automation scripts
│   ├── README.md                      # Dokumentasi scripts
│   ├── deploy-vm1.sh                  # Deploy VM Ubuntu 1
│   ├── deploy-vm2.sh                  # Deploy VM Ubuntu 2
│   ├── configure-kong.sh              # Konfigurasi Kong Gateway
│   ├── health-check.sh                # Health check semua services
│   └── backup-all.sh                  # Backup automation
│
├── vm-ubuntu-1/                       # Frontend + Gateway
│   ├── docker-compose.yml             # Orchestration
│   ├── .env.example                   # Environment template
│   └── nginx/
│       ├── nginx.conf                 # Main config
│       └── conf.d/
│           └── frontend.conf          # SSL + proxy config
│
├── vm-ubuntu-2/                       # Backend Services
│   ├── docker-compose.yml             # Orchestration
│   ├── .env.example                   # Environment template
│   └── nginx/
│       ├── nginx.conf                 # Main config
│       └── conf.d/
│           └── backend-services.conf  # PHP-FPM + proxy
│
└── windows-server-1/                  # Monitoring
    ├── README.md                      # Setup guide
    └── setup-monitoring.ps1           # Automated installer
```

## 📖 Dokumentasi Lengkap

### 1. [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
**Step-by-step deployment guide dengan 5 phases:**
- Phase 1: Persiapan (4 hours)
- Phase 2: VM Ubuntu 1 (6 hours)
- Phase 3: VM Ubuntu 2 (4-5 hours)
- Phase 4: Windows Server 1 (3 hours)
- Phase 5: Integration & Testing (4 hours)

**Total waktu deployment**: ~20-22 hours (3-4 hari kerja)

### 2. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
**Dokumentasi arsitektur lengkap:**
- Infrastructure diagrams (ASCII)
- Data flow architecture
- Current services (Auth, Dashboard, Sister)
- Future services (8+ services planned)
- Capacity planning (200-5000+ users)
- Security architecture (4 layers)
- Scalability roadmap

### 3. [scripts/README.md](scripts/README.md)
**Automation scripts documentation:**
- Deploy scripts untuk VM1 & VM2
- Kong configuration automation
- Health check monitoring
- Backup & restore procedures
- Usage examples & troubleshooting

### 4. [COMPLETE_FILE_LIST.md](COMPLETE_FILE_LIST.md)
**Inventory lengkap semua file:**
- 24 production-ready files
- ~10,030 lines of configuration & documentation
- File descriptions & usage references

## 🔧 Prerequisites

### VM Ubuntu 1 & 2
- Ubuntu 20.04 LTS atau 22.04 LTS
- Docker 20.10+
- Docker Compose v2.0+
- 8 core CPU, 16GB RAM, 100GB storage
- Akses sudo
- Domain name (untuk SSL certificates)

### Windows Server 1
- Windows Server 2022
- PowerShell 5.1+
- Internet access
- 16GB RAM minimum

### Tools
```bash
# Install di Ubuntu
sudo apt update
sudo apt install -y curl jq netcat git

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose-plugin
```

## 🔐 Security Checklist

### Pre-Deployment
- [ ] Generate strong passwords (min 32 characters)
- [ ] Setup SSH key authentication
- [ ] Disable root SSH login
- [ ] Configure firewall (ufw)
- [ ] Obtain SSL certificates (Let's Encrypt)
- [ ] Setup VPN/private network

### Post-Deployment
- [ ] Change default passwords
- [ ] Enable automatic security updates
- [ ] Configure backup automation
- [ ] Setup monitoring alerts
- [ ] Review firewall rules
- [ ] Enable audit logging

## 🌐 Network Configuration

### Firewall Rules (ufw)

**VM Ubuntu 1 (Public-facing)**:
```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

**VM Ubuntu 2 (Private)**:
```bash
sudo ufw allow from 192.168.1.10  # VM Ubuntu 1
sudo ufw allow 22/tcp              # SSH
sudo ufw enable
```

**Windows Server 1 (Management)**:
```powershell
# Prometheus
New-NetFirewallRule -DisplayName "Prometheus" -Direction Inbound -LocalPort 9090 -Protocol TCP -Action Allow

# Grafana
New-NetFirewallRule -DisplayName "Grafana" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Port Mapping

| Server | Port | Service | Access |
|--------|------|---------|--------|
| VM Ubuntu 1 | 80 | HTTP | Public |
| VM Ubuntu 1 | 443 | HTTPS | Public |
| VM Ubuntu 1 | 9800 | Kong Proxy | Internal |
| VM Ubuntu 1 | 8001 | Kong Admin | Internal |
| VM Ubuntu 2 | 8081 | Auth Service | Internal |
| VM Ubuntu 2 | 8082 | Dashboard | Internal |
| VM Ubuntu 2 | 8083 | Sister Service | Internal |
| VM Ubuntu 2 | 6379 | Redis | Internal |
| Windows 1 | 9090 | Prometheus | Internal |
| Windows 1 | 3000 | Grafana | Internal |
| Windows 2 | 1433 | SQL Server | Internal |

## 📊 Monitoring

### Prometheus Targets
- **VM Ubuntu 1**: Node Exporter (9100), Nginx Exporter (9113)
- **VM Ubuntu 2**: Node Exporter (9100), Redis Exporter (9121), Nginx Exporter (9113)

### Grafana Dashboards
1. **Node Exporter Full** (ID: 1860)
2. **Docker Container & Host Metrics** (ID: 193)
3. **Redis Dashboard** (ID: 11692)
4. **Nginx Dashboard** (ID: 12708)

### Access
- Prometheus: http://192.168.1.12:9090
- Grafana: http://192.168.1.12:3000 (admin/admin)

## 💾 Backup & Recovery

### Automated Backup
```bash
# Setup daily backup (2 AM)
crontab -e
# Add:
0 2 * * * /opt/myunila/deployment/scripts/backup-all.sh >> /var/log/myunila-backup.log 2>&1
```

### Manual Backup
```bash
cd /opt/myunila/deployment/scripts
export DB_PASSWORD="your_password"
sudo ./backup-all.sh
```

### Backup Locations
- Docker volumes: All service volumes
- Configurations: Nginx, SSL certificates
- Database: SQL Server backup
- Redis: dump.rdb
- Logs: Container logs

### Retention
- Daily backups: 30 days
- Monthly backups: 12 months

## 🔄 Update & Maintenance

### Update Services
```bash
# VM Ubuntu 1
cd /opt/myunila/deployment/scripts
./deploy-vm1.sh

# VM Ubuntu 2
cd /opt/myunila/deployment/scripts
./deploy-vm2.sh
```

### Update SSL Certificates
```bash
# VM Ubuntu 1
sudo certbot renew
sudo docker-compose restart nginx
```

### Maintenance Schedule
- **Daily**: Check health status, review logs
- **Weekly**: Review metrics, check disk space
- **Monthly**: Update Docker images, renew SSL if needed
- **Quarterly**: Security audit, performance review

## 🐛 Troubleshooting

### Health Check Failed
```bash
# Run comprehensive health check
cd /opt/myunila/deployment/scripts
./health-check.sh

# Check specific service logs
cd /opt/myunila/deployment/vm-ubuntu-1
docker-compose logs -f [service-name]
```

### Service Won't Start
```bash
# Check Docker logs
docker-compose logs -f [service-name]

# Restart service
docker-compose restart [service-name]

# Rebuild if needed
docker-compose up -d --force-recreate [service-name]
```

### Database Connection Failed
```bash
# Test connection from VM Ubuntu 2
nc -zv 192.168.1.13 1433

# Check firewall
sudo ufw status
```

### Kong Routes Not Working
```bash
# Reconfigure Kong
cd /opt/myunila/deployment/scripts
./configure-kong.sh

# Check Kong status
curl http://localhost:8001/status
```

### Out of Disk Space
```bash
# Clean Docker
docker system prune -af --volumes

# Check disk usage
df -h
du -sh /var/lib/docker/*
```

## 📞 Support

### Documentation
- Main Guide: [README.md](README.md)
- Deployment Steps: [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Scripts: [scripts/README.md](scripts/README.md)

### Commands Reference
```bash
# Health check
./scripts/health-check.sh

# Backup
./scripts/backup-all.sh

# Configure Kong
./scripts/configure-kong.sh

# Deploy VM1
./scripts/deploy-vm1.sh

# Deploy VM2
./scripts/deploy-vm2.sh
```

## 📈 Capacity & Scalability

### Current Capacity
- Users: 200-400 concurrent users
- Services: 3 (Auth, Dashboard, Sister)
- RAM Usage: ~4GB / 32GB available (12%)

### Future Capacity
- Target: 5,000+ concurrent users
- Planned Services: 20+ microservices
- Scaling Options:
  - Vertical: Increase VM resources
  - Horizontal: Add load balancer + multiple instances

### Services Roadmap
1. **Phase 1 (Q4 2025)**: Auth, Dashboard, Sister ✅
2. **Phase 2 (Q1 2026)**: Akademik, Keuangan
3. **Phase 3 (Q2 2026)**: PMB, PDDIKTI
4. **Phase 4 (Q3-Q4 2026)**: SDM, Perpustakaan, Notification, Analytics

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Read [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
- [ ] Review [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [ ] Verify server access (SSH, RDP)
- [ ] Generate all secrets
- [ ] Obtain SSL certificates
- [ ] Configure DNS records

### Deployment
- [ ] Deploy VM Ubuntu 2 (Backend first)
- [ ] Deploy VM Ubuntu 1 (Frontend + Gateway)
- [ ] Setup Windows Server 1 (Monitoring)
- [ ] Configure Kong Gateway
- [ ] Run health check

### Post-Deployment
- [ ] Verify all services running
- [ ] Test end-to-end flows
- [ ] Setup monitoring dashboards
- [ ] Configure backup automation
- [ ] Setup alert rules
- [ ] Document credentials (secure storage)
- [ ] Update team wiki

## 🎯 Success Criteria

- [ ] All services show "healthy" status
- [ ] Frontend accessible via HTTPS
- [ ] API Gateway routing correctly
- [ ] Database connections working
- [ ] Monitoring collecting metrics
- [ ] Backups running daily
- [ ] SSL certificates valid
- [ ] No critical security warnings

## 📝 License & Credits

**Project**: MyUnila - University Information System
**Architecture**: Microservices
**Generated with**: Claude Code

---

**Last Updated**: 2025-01-29
**Version**: 1.0.0
**Status**: Production Ready ✅
