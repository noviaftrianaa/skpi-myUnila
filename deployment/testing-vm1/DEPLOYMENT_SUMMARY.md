# MyUnila Deployment Summary - Testing VM1

## 📋 Overview

Deployment untuk testing environment di **1 VM Ubuntu 22.04** dengan Docker Compose terpisah per service untuk flexibility dan easy management.

**Server IP**: `192.168.123.172`

---

## 🏗️ Architecture

### Service Organization

```
deployment/testing-vm1/
├── services/
│   ├── 1-infrastructure/       # Redis, PostgreSQL
│   ├── 2-gateway/             # Kong Gateway
│   ├── 3-backend/             # Auth, Dashboard, Sister, Nginx
│   ├── 4-frontend/            # Next.js Frontend
│   └── 5-monitoring/          # Prometheus, Grafana, Loki
├── configs/                   # Configuration files
├── scripts/                   # Deployment scripts
└── docs/                      # Documentation
```

### Port Mapping

| Service | Port | URL |
|---------|------|-----|
| **Gateway** |
| Kong Proxy | 9800 | http://192.168.123.172:9800 |
| Kong Admin | 9801 | http://192.168.123.172:9801 |
| Kong UI | 9803 | http://192.168.123.172:9803 |
| **Backend** |
| Auth Service | 8081 | http://192.168.123.172:8081 |
| Dashboard Service | 8082 | http://192.168.123.172:8082 |
| Sister Service | 8083 | http://192.168.123.172:8083 |
| **Frontend** |
| Web Application | 3000 | http://192.168.123.172:3000 |
| **Monitoring** |
| Grafana | 3002 | http://192.168.123.172:3002 |
| Prometheus | 9090 | http://192.168.123.172:9090 |
| Loki | 3100 | http://192.168.123.172:3100 |
| **Infrastructure** |
| Redis | 6379 | Internal |
| PostgreSQL | 5432 | Internal |

---

## 🚀 Deployment Steps

### 1. Initial Server Setup (One-time)

```bash
# SSH to server
ssh user@192.168.123.172

# Clone repository
cd /opt
sudo git clone <repository-url> myunila
cd myunila/deployment/testing-vm1

# Run server setup
sudo ./scripts/setup-server.sh

# Logout and login again (for docker group)
exit
ssh user@192.168.123.172
```

### 2. Configure Environment

```bash
cd /opt/myunila/deployment/testing-vm1

# Copy and edit .env
cp .env.example .env
nano .env

# IMPORTANT: Update these values in .env:
# - VM_IP=192.168.123.172
# - DB_MSSQL_HOST, DB_MSSQL_USERNAME, DB_MSSQL_PASSWORD
# - AUTH_APP_KEY, DASHBOARD_APP_KEY (generate with: openssl rand -base64 32)
# - JWT_SECRET (generate with: openssl rand -base64 32)
# - KONG_PG_PASSWORD
# - GRAFANA_ADMIN_PASSWORD
```

### 3. Deploy All Services

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy everything
./scripts/deploy-all.sh
```

### 4. Verify Deployment

```bash
# Check health
./scripts/health-check.sh

# Check logs
docker logs myunila-kong
docker logs myunila-sister-service
docker logs myunila-frontend
```

---

## 🎮 Service Management

### Start All Services

```bash
cd /opt/myunila/deployment/testing-vm1
./scripts/deploy-all.sh
```

### Stop All Services

```bash
./scripts/stop-services.sh
```

### Start Individual Service

```bash
# Infrastructure
cd services/1-infrastructure
docker compose -f docker-compose.redis.yml up -d
docker compose -f docker-compose.postgres.yml up -d

# Gateway
cd services/2-gateway
docker compose -f docker-compose.kong.yml up -d

# Backend
cd services/3-backend
docker compose -f docker-compose.auth.yml up -d
docker compose -f docker-compose.dashboard.yml up -d
docker compose -f docker-compose.sister.yml up -d
docker compose -f docker-compose.nginx.yml up -d

# Frontend
cd services/4-frontend
docker compose -f docker-compose.frontend.yml up -d

# Monitoring
cd services/5-monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

### Stop Individual Service

```bash
cd services/[service-directory]
docker compose -f docker-compose.[service].yml down
```

### View Logs

```bash
# Real-time logs
docker logs -f myunila-sister-service

# Last 100 lines
docker logs --tail 100 myunila-kong

# With timestamps
docker logs -t myunila-auth-service
```

### Restart Service

```bash
cd services/3-backend
docker compose -f docker-compose.sister.yml restart
```

---

## 📊 Monitoring

### Grafana Dashboard

**URL**: http://192.168.123.172:3002
- **Username**: admin
- **Password**: (check .env GRAFANA_ADMIN_PASSWORD)

**Features**:
- Container metrics (CPU, Memory, Network)
- Service logs aggregation
- Custom dashboards
- Alerting

### Prometheus

**URL**: http://192.168.123.172:9090

**Metrics available**:
- Container metrics (cAdvisor)
- Host metrics (Node Exporter)
- Redis metrics (Redis Exporter)
- Application metrics

### Loki (Log Aggregation)

**URL**: http://192.168.123.172:3100

All container logs are automatically collected by Promtail and sent to Loki.
View logs in Grafana using Loki datasource.

---

## 🔧 Configuration Files

### Nginx Configuration

Location: `configs/nginx/`
- `nginx.conf` - Main Nginx config
- `conf.d/auth-service.conf` - Auth service routing
- `conf.d/dashboard-service.conf` - Dashboard routing

### Kong Configuration

Location: `configs/kong/`
- `kong.yml` - Declarative Kong config
- `ui/` - Kong UI dashboard files

### Monitoring Configuration

Location: `configs/monitoring/`
- `prometheus/prometheus.yml` - Prometheus scrape configs
- `grafana/provisioning/` - Grafana datasources & dashboards
- `loki/loki-config.yml` - Loki configuration
- `promtail/promtail-config.yml` - Log collection config

---

## 🔄 Update & Maintenance

### Update Service Image

```bash
# Pull latest image
cd services/3-backend
docker compose -f docker-compose.sister.yml pull

# Restart with new image
docker compose -f docker-compose.sister.yml up -d
```

### Rebuild Service

```bash
# Rebuild from source
cd services/3-backend
docker compose -f docker-compose.sister.yml build --no-cache

# Deploy
docker compose -f docker-compose.sister.yml up -d
```

### Backup Data

```bash
# Backup all volumes
docker run --rm \
  -v myunila-redis-data:/data \
  -v /opt/backups:/backup \
  alpine tar czf /backup/redis-$(date +%Y%m%d).tar.gz -C /data .

# Backup database
docker exec myunila-postgres-kong \
  pg_dump -U kong kong > /opt/backups/kong-$(date +%Y%m%d).sql
```

### Restore Data

```bash
# Restore volume
docker run --rm \
  -v myunila-redis-data:/data \
  -v /opt/backups:/backup \
  alpine tar xzf /backup/redis-20241108.tar.gz -C /data

# Restore database
docker exec -i myunila-postgres-kong \
  psql -U kong kong < /opt/backups/kong-20241108.sql
```

---

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker logs myunila-[service-name]

# Check container status
docker ps -a | grep myunila

# Restart service
cd services/[service-dir]
docker compose -f docker-compose.[service].yml restart
```

### Port Conflicts

```bash
# Check what's using the port
sudo lsof -i :[port]

# Or
sudo netstat -tulpn | grep :[port]
```

### Database Connection Failed

```bash
# Test SQL Server connection
telnet 192.168.123.119 1433

# Check from container
docker exec -it myunila-sister-service sh
# Inside container:
wget -O- 192.168.123.119:1433
```

### Kong Issues

```bash
# Check Kong admin API
curl http://192.168.123.172:9801/

# List services
curl http://192.168.123.172:9801/services

# List routes
curl http://192.168.123.172:9801/routes

# Check Kong logs
docker logs myunila-kong
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a --volumes

# Remove old images
docker image prune -a

# Remove stopped containers
docker container prune
```

---

## 📈 Performance Tuning

### Docker Resources

Edit `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "5"
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 65536,
      "Soft": 65536
    }
  }
}
```

### System Limits

```bash
# Increase file descriptors
sudo sysctl -w fs.file-max=100000

# Increase network buffers
sudo sysctl -w net.core.somaxconn=1024

# Make permanent
sudo nano /etc/sysctl.conf
```

---

## 🔒 Security Checklist

- [ ] Change all default passwords in `.env`
- [ ] Configure UFW firewall
- [ ] Enable fail2ban
- [ ] Use strong JWT secret
- [ ] Enable HTTPS (SSL certificates)
- [ ] Configure Kong rate limiting
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Backup encryption keys
- [ ] Use Docker secrets for sensitive data

---

## 📚 Additional Resources

- Main README: [README.md](README.md)
- Detailed Deployment: [docs/DEPLOYMENT_STEPS.md](docs/DEPLOYMENT_STEPS.md)
- Service Management: [docs/SERVICE_MANAGEMENT.md](docs/SERVICE_MANAGEMENT.md)
- Monitoring Guide: [docs/MONITORING_GUIDE.md](docs/MONITORING_GUIDE.md)
- Troubleshooting: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

## 📞 Support

For issues:
1. Check logs: `docker logs [container-name]`
2. Run health check: `./scripts/health-check.sh`
3. Check troubleshooting guide
4. Contact DevOps team

---

**Last Updated**: 2025-11-08
**Deployment Version**: 1.0.0
**Target Server**: 192.168.123.172 (Ubuntu 22.04)
