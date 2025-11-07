# MyUnila Deployment Documentation Index

## 📁 Deployment Environments

### Testing VM1 (Single Server - Ubuntu 22.04)
**Location**: `deployment/testing-vm1/`
**Server IP**: 192.168.123.172
**Purpose**: Testing environment dengan semua services di 1 VM

**Quick Links**:
- [Quick Start Guide](testing-vm1/QUICK_START.md) - Deploy dalam 5 menit
- [Deployment Summary](testing-vm1/DEPLOYMENT_SUMMARY.md) - Overview lengkap
- [Main README](testing-vm1/README.md) - Dokumentasi utama

**Architecture**: Semua services run dengan Docker Compose terpisah per service:
- Infrastructure (Redis, PostgreSQL)
- API Gateway (Kong)
- Backend Services (Auth, Dashboard, Sister, Nginx)
- Frontend (Next.js)
- Monitoring (Prometheus, Grafana, Loki)

---

## 🚀 Quick Deployment Commands

### Testing VM1
```bash
# SSH to server
ssh user@192.168.123.172

# Initial setup (one-time)
cd /opt/myunila/deployment/testing-vm1
sudo ./scripts/setup-server.sh

# Deploy all services
./scripts/deploy-all.sh

# Check health
./scripts/health-check.sh
```

---

## 📊 Service Ports

| Environment | Kong Proxy | Frontend | Grafana | Auth | Dashboard | Sister |
|------------|-----------|----------|---------|------|-----------|--------|
| Testing VM1 | 9800 | 3000 | 3002 | 8081 | 8082 | 8083 |

---

## 📂 Directory Structure

```
deployment/
├── DEPLOYMENT_INDEX.md           # This file
│
└── testing-vm1/                  # Testing VM1 deployment
    ├── README.md                 # Main documentation
    ├── QUICK_START.md            # 5-minute setup guide
    ├── DEPLOYMENT_SUMMARY.md     # Complete deployment overview
    ├── .env.example              # Environment template
    ├── .gitignore                # Git ignore rules
    │
    ├── services/                 # Docker Compose per service
    │   ├── 1-infrastructure/     # Redis, PostgreSQL
    │   ├── 2-gateway/            # Kong Gateway
    │   ├── 3-backend/            # Auth, Dashboard, Sister, Nginx
    │   ├── 4-frontend/           # Next.js Frontend
    │   └── 5-monitoring/         # Prometheus, Grafana, Loki
    │
    ├── configs/                  # Configuration files
    │   ├── nginx/                # Nginx configs
    │   ├── kong/                 # Kong configs
    │   └── monitoring/           # Monitoring configs
    │
    ├── scripts/                  # Deployment scripts
    │   ├── setup-server.sh       # Initial server setup
    │   ├── deploy-all.sh         # Deploy all services
    │   ├── stop-services.sh      # Stop all services
    │   ├── health-check.sh       # Health check all services
    │   ├── update-service.sh     # Update specific service
    │   └── backup.sh             # Backup data
    │
    └── docs/                     # Additional documentation
        ├── DEPLOYMENT_STEPS.md   # Step-by-step guide
        ├── SERVICE_MANAGEMENT.md # Service management
        ├── MONITORING_GUIDE.md   # Monitoring setup
        └── TROUBLESHOOTING.md    # Common issues
```

---

## 🎯 Deployment Strategy

### Testing VM1
- **Purpose**: Testing dan development
- **Architecture**: Single VM dengan Docker Compose per service
- **Scalability**: Easy to update individual services
- **Monitoring**: Full monitoring stack included
- **Backup**: Automated backup scripts

### Production (Coming Soon)
- Multiple VMs dengan load balancing
- High availability setup
- Automated deployment dengan CI/CD
- Advanced monitoring dan alerting

---

## 📖 Documentation

### For Developers
- [Development Setup](../backend/README.md)
- [Frontend Development](../frontend/README.md)
- [API Documentation](../backend/docs/)

### For DevOps
- [Testing VM1 Deployment](testing-vm1/README.md)
- [Service Management](testing-vm1/docs/SERVICE_MANAGEMENT.md)
- [Monitoring Guide](testing-vm1/docs/MONITORING_GUIDE.md)
- [Backup & Restore](testing-vm1/docs/BACKUP_RESTORE.md)

### For System Administrators
- [Server Setup](testing-vm1/scripts/setup-server.sh)
- [Security Checklist](testing-vm1/docs/SECURITY.md)
- [Performance Tuning](testing-vm1/docs/PERFORMANCE.md)

---

## 🔄 Deployment Workflow

### Initial Deployment
1. Server preparation (`setup-server.sh`)
2. Environment configuration (`.env`)
3. Deploy infrastructure (Redis, PostgreSQL)
4. Deploy gateway (Kong)
5. Deploy backend services
6. Deploy frontend
7. Deploy monitoring
8. Verify health (`health-check.sh`)

### Updates
1. Pull latest code
2. Build new images
3. Update specific service (`update-service.sh`)
4. Verify health
5. Rollback if needed

### Maintenance
1. Regular backups (`backup.sh`)
2. Log rotation
3. Security updates
4. Performance monitoring
5. Disk space management

---

## 🛠️ Common Operations

### Deploy New Environment
```bash
# Clone repository
git clone <repo-url> /opt/myunila

# Navigate to deployment
cd /opt/myunila/deployment/testing-vm1

# Setup server (one-time)
sudo ./scripts/setup-server.sh

# Configure environment
cp .env.example .env
nano .env

# Deploy
./scripts/deploy-all.sh
```

### Update Service
```bash
cd /opt/myunila/deployment/testing-vm1
./scripts/update-service.sh [service-name]
```

### Backup & Restore
```bash
# Backup
./scripts/backup.sh

# Restore (when implemented)
./scripts/restore.sh [backup-date]
```

### Monitor Services
```bash
# Health check
./scripts/health-check.sh

# View logs
docker logs -f myunila-[service-name]

# Check resources
docker stats
```

---

## 📞 Support & Resources

### Quick Help
- Check logs: `docker logs [container-name]`
- Run health check: `./scripts/health-check.sh`
- Check disk space: `df -h`
- Check Docker resources: `docker stats`

### Documentation
- Main README: [README.md](../README.md)
- Backend README: [backend/README.md](../backend/README.md)
- Frontend README: [frontend/README.md](../frontend/README.md)

### Monitoring
- Grafana: http://[VM_IP]:3002
- Prometheus: http://[VM_IP]:9090
- Kong Admin: http://[VM_IP]:9801

---

## 🔒 Security Notes

- Never commit `.env` files to git
- Change all default passwords
- Keep secrets in environment variables
- Use strong JWT secrets
- Enable firewall (UFW)
- Regular security updates
- Monitor access logs

---

## 📝 Change Log

### 2025-11-08 - v1.0.0
- ✅ Initial deployment structure for Testing VM1
- ✅ Docker Compose per service
- ✅ Automated deployment scripts
- ✅ Health check scripts
- ✅ Backup scripts
- ✅ Complete documentation
- ✅ Monitoring stack integration

---

## 🎯 Roadmap

### Phase 1: Testing Environment (Current)
- [x] Single VM deployment
- [x] Docker Compose setup
- [x] Basic monitoring
- [x] Backup scripts
- [ ] Automated testing
- [ ] CI/CD pipeline

### Phase 2: Staging Environment
- [ ] Multi-VM setup
- [ ] Load balancing
- [ ] Advanced monitoring
- [ ] Automated deployments

### Phase 3: Production Environment
- [ ] High availability
- [ ] Auto-scaling
- [ ] Advanced security
- [ ] Disaster recovery

---

**Last Updated**: 2025-11-08
**Current Version**: 1.0.0
**Maintainer**: DevOps Team
