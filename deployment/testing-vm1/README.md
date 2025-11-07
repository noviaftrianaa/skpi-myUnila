# MyUnila Deployment - Testing VM1 (Ubuntu 22.04)

Dokumentasi deployment untuk testing di 1 VM Ubuntu 22.04 dengan Docker Compose terpisah per service.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Directory Structure](#directory-structure)
- [Deployment Steps](#deployment-steps)
- [Service Management](#service-management)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### Services Deployed on VM1

```
┌─────────────────────────────────────────────────────────────┐
│                      VM1 (Ubuntu 22.04)                      │
│                    IP: [VM_IP_ADDRESS]                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Kong API Gateway (Port 9800)                      │    │
│  │  - JWT Authentication                              │    │
│  │  - Rate Limiting                                   │    │
│  │  - Admin API: 9801                                 │    │
│  │  - UI Dashboard: 9803                              │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↓                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Microservices                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  Auth Service (Laravel 11)                   │  │    │
│  │  │  - Port: 8081 (via Nginx)                    │  │    │
│  │  │  - Authentication & Authorization            │  │    │
│  │  │  - JWT Token Management                      │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  Dashboard Service (Laravel 11)              │  │    │
│  │  │  - Port: 8082 (via Nginx)                    │  │    │
│  │  │  - Analytics & Statistics                    │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  Sister Service (Go + Fiber)                 │  │    │
│  │  │  - Port: 8083                                │  │    │
│  │  │  - SISTER API Integration                    │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  Frontend (Next.js 15)                       │  │    │
│  │  │  - Port: 3000                                │  │    │
│  │  │  - SSR React Application                     │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↓                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Infrastructure Services                            │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  Redis (Port 6379)                           │  │    │
│  │  │  - Cache & Queue                             │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  PostgreSQL (Port 5432)                      │  │    │
│  │  │  - Kong Database                             │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↓                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Monitoring Stack (Separate Docker Compose)         │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  Prometheus (Port 9090)                      │  │    │
│  │  │  - Metrics Collection                        │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  Grafana (Port 3002)                         │  │    │
│  │  │  - Visualization Dashboard                   │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  Loki (Port 3100)                            │  │    │
│  │  │  - Log Aggregation                           │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  Promtail                                    │  │    │
│  │  │  - Log Shipper                               │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  cAdvisor (Port 8090)                        │  │    │
│  │  │  - Container Metrics                         │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

External Dependencies:
- SQL Server (192.168.123.119:1433) - Main Database
```

### Port Mapping

| Service | Internal Port | External Port | Protocol |
|---------|--------------|---------------|----------|
| Kong Proxy | 8000 | 9800 | HTTP |
| Kong Admin API | 8001 | 9801 | HTTP |
| Kong UI | 80 | 9803 | HTTP |
| Auth Service | 80 | 8081 | HTTP (via Nginx) |
| Dashboard Service | 80 | 8082 | HTTP (via Nginx) |
| Sister Service | 8083 | 8083 | HTTP |
| Frontend | 3000 | 3000 | HTTP |
| Redis | 6379 | 6379 | TCP |
| PostgreSQL | 5432 | 5432 | TCP |
| Prometheus | 9090 | 9090 | HTTP |
| Grafana | 3000 | 3002 | HTTP |
| Loki | 3100 | 3100 | HTTP |
| cAdvisor | 8080 | 8090 | HTTP |

---

## 📦 Prerequisites

### System Requirements

- **OS**: Ubuntu 22.04 LTS
- **RAM**: Minimum 8GB (Recommended 16GB)
- **CPU**: Minimum 4 cores (Recommended 8 cores)
- **Disk**: Minimum 50GB free space (SSD recommended)
- **Network**: Static IP or reserved DHCP

### Software Requirements

```bash
# Docker Engine 24.0+
docker --version

# Docker Compose 2.20+
docker compose version

# Git
git --version

# Optional: Make
make --version
```

### External Database Access

Ensure VM can connect to:
- **SQL Server**: 192.168.123.119:1433
  - Database: `pdut_dev`
  - User: `mizarzulmi`

---

## 📁 Directory Structure

```
deployment/testing-vm1/
├── README.md                          # This file
├── .env.example                       # Environment template
├── .env                              # Environment variables (gitignored)
│
├── services/                         # Docker Compose per service
│   ├── 1-infrastructure/
│   │   ├── docker-compose.redis.yml
│   │   └── docker-compose.postgres.yml
│   ├── 2-gateway/
│   │   └── docker-compose.kong.yml
│   ├── 3-backend/
│   │   ├── docker-compose.auth.yml
│   │   ├── docker-compose.dashboard.yml
│   │   ├── docker-compose.sister.yml
│   │   └── docker-compose.nginx.yml
│   ├── 4-frontend/
│   │   └── docker-compose.frontend.yml
│   └── 5-monitoring/
│       └── docker-compose.monitoring.yml
│
├── configs/                          # Configuration files
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── conf.d/
│   │       ├── auth-service.conf
│   │       ├── dashboard-service.conf
│   │       └── frontend.conf
│   ├── kong/
│   │   ├── kong.yml                 # Kong declarative config
│   │   └── ui/                      # Kong UI files
│   ├── monitoring/
│   │   ├── prometheus/
│   │   │   └── prometheus.yml
│   │   ├── grafana/
│   │   │   ├── provisioning/
│   │   │   └── dashboards/
│   │   ├── loki/
│   │   │   └── loki-config.yml
│   │   └── promtail/
│   │       └── promtail-config.yml
│   └── ssl/                         # SSL certificates (optional)
│
├── scripts/                          # Deployment scripts
│   ├── setup-server.sh              # Initial server setup
│   ├── deploy-all.sh                # Deploy all services
│   ├── deploy-service.sh            # Deploy specific service
│   ├── start-services.sh            # Start services in order
│   ├── stop-services.sh             # Stop all services
│   ├── backup.sh                    # Backup data volumes
│   ├── restore.sh                   # Restore from backup
│   ├── update-service.sh            # Update specific service
│   └── health-check.sh              # Check all services health
│
└── docs/                            # Documentation
    ├── DEPLOYMENT_STEPS.md          # Step-by-step deployment
    ├── SERVICE_MANAGEMENT.md        # Service management guide
    ├── MONITORING_GUIDE.md          # Monitoring setup
    └── TROUBLESHOOTING.md           # Common issues & solutions
```

---

## 🚀 Deployment Steps

### Quick Start (Summary)

```bash
# 1. Clone repository
git clone <repository-url>
cd deployment/testing-vm1

# 2. Setup server (first time only)
./scripts/setup-server.sh

# 3. Configure environment
cp .env.example .env
nano .env

# 4. Deploy all services
./scripts/deploy-all.sh

# 5. Check health
./scripts/health-check.sh
```

### Detailed Steps

See [docs/DEPLOYMENT_STEPS.md](docs/DEPLOYMENT_STEPS.md) for complete guide.

---

## 🎮 Service Management

### Start Services (In Order)

```bash
# 1. Infrastructure (Redis, PostgreSQL)
cd services/1-infrastructure
docker compose -f docker-compose.redis.yml up -d
docker compose -f docker-compose.postgres.yml up -d

# 2. API Gateway (Kong)
cd ../2-gateway
docker compose -f docker-compose.kong.yml up -d

# 3. Backend Services
cd ../3-backend
docker compose -f docker-compose.auth.yml up -d
docker compose -f docker-compose.dashboard.yml up -d
docker compose -f docker-compose.sister.yml up -d
docker compose -f docker-compose.nginx.yml up -d

# 4. Frontend
cd ../4-frontend
docker compose -f docker-compose.frontend.yml up -d

# 5. Monitoring (Optional)
cd ../5-monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

### Stop Services

```bash
# Stop all services
./scripts/stop-services.sh

# Or manually per service (reverse order)
cd services/5-monitoring && docker compose -f docker-compose.monitoring.yml down
cd ../4-frontend && docker compose -f docker-compose.frontend.yml down
cd ../3-backend && docker compose -f docker-compose.nginx.yml down
cd ../3-backend && docker compose -f docker-compose.sister.yml down
cd ../3-backend && docker compose -f docker-compose.dashboard.yml down
cd ../3-backend && docker compose -f docker-compose.auth.yml down
cd ../2-gateway && docker compose -f docker-compose.kong.yml down
cd ../1-infrastructure && docker compose -f docker-compose.postgres.yml down
cd ../1-infrastructure && docker compose -f docker-compose.redis.yml down
```

### Update Service

```bash
# Update specific service
./scripts/update-service.sh sister-service

# Or manually
cd services/3-backend
docker compose -f docker-compose.sister.yml pull
docker compose -f docker-compose.sister.yml up -d
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose -f services/3-backend/docker-compose.sister.yml logs -f

# Last 100 lines
docker compose -f services/2-gateway/docker-compose.kong.yml logs --tail=100
```

---

## 📊 Monitoring

### Access URLs

- **Grafana**: http://[VM_IP]:3002
  - Username: `admin`
  - Password: `makinjaya`

- **Prometheus**: http://[VM_IP]:9090

- **Kong Admin**: http://[VM_IP]:9801

- **Kong UI**: http://[VM_IP]:9803

### Health Checks

```bash
# Check all services
./scripts/health-check.sh

# Check specific service
curl http://localhost:8083/health        # Sister Service
curl http://localhost:9800/health        # Kong Gateway
curl http://localhost:3000/api/health    # Frontend
```

---

## 🔧 Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   # Check logs
   docker compose logs [service-name]

   # Check container status
   docker ps -a
   ```

2. **Port already in use**
   ```bash
   # Find process using port
   sudo lsof -i :[port]

   # Kill process
   sudo kill -9 [PID]
   ```

3. **Database connection failed**
   ```bash
   # Test SQL Server connection from VM
   telnet 192.168.123.119 1433

   # Check container network
   docker network inspect myunila-network
   ```

4. **Kong not routing correctly**
   ```bash
   # Check Kong configuration
   curl http://localhost:9801/services
   curl http://localhost:9801/routes

   # Test direct service access
   curl http://localhost:8081/api/health    # Auth Service
   curl http://localhost:8082/api/health    # Dashboard Service
   curl http://localhost:8083/health        # Sister Service
   ```

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for more details.

---

## 📚 Additional Documentation

- [Deployment Steps](docs/DEPLOYMENT_STEPS.md) - Complete deployment guide
- [Service Management](docs/SERVICE_MANAGEMENT.md) - Managing services
- [Monitoring Guide](docs/MONITORING_GUIDE.md) - Setup monitoring stack
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues & fixes

---

## 📝 Notes

1. **Security**:
   - Change all default passwords in `.env`
   - Use SSL certificates in production
   - Configure firewall rules
   - Enable Kong rate limiting

2. **Backup**:
   - Regular backup of Docker volumes
   - Database backup strategy
   - Configuration backup

3. **Performance**:
   - Monitor resource usage via Grafana
   - Adjust container resources as needed
   - Consider horizontal scaling for high load

4. **Updates**:
   - Test updates in staging first
   - Use rolling updates for zero-downtime
   - Keep Docker images updated

---

## 📧 Support

For issues or questions:
- Check [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- Review service logs
- Contact DevOps team

---

**Last Updated**: 2025-11-08
**Version**: 1.0.0
