# Quick Start Guide - MyUnila Testing VM1

## 🚀 Deploy in 5 Minutes

### Prerequisites
- Ubuntu 22.04 Server
- IP: 192.168.123.172
- Root/sudo access
- Internet connection

---

## Step 1: Initial Server Setup (One-time)

```bash
# SSH to server
ssh user@192.168.123.172

# Clone repository
sudo mkdir -p /opt
cd /opt
sudo git clone <your-repo-url> myunila
sudo chown -R $USER:$USER myunila

# Run server setup (installs Docker, configures firewall, etc.)
cd myunila/deployment/testing-vm1
sudo ./scripts/setup-server.sh

# IMPORTANT: Logout and login again for docker group to take effect
exit
```

---

## Step 2: Configure Environment

```bash
# SSH back to server
ssh user@192.168.123.172
cd /opt/myunila/deployment/testing-vm1

# Copy environment template
cp .env.example .env

# Edit .env file
nano .env

# MUST UPDATE these values:
# - DB_MSSQL_PASSWORD=your_actual_password
# - AUTH_APP_KEY (generate: openssl rand -base64 32 | tr -d '\n' && echo | base64)
# - DASHBOARD_APP_KEY (generate: openssl rand -base64 32 | tr -d '\n' && echo | base64)
# - JWT_SECRET (generate: openssl rand -base64 32)
# - KONG_PG_PASSWORD (change from default)
# - GRAFANA_ADMIN_PASSWORD (change from default)

# Save and exit (Ctrl+X, then Y, then Enter)
```

### Generate Required Keys

```bash
# Generate AUTH_APP_KEY
echo "base64:$(openssl rand -base64 32)"

# Generate DASHBOARD_APP_KEY
echo "base64:$(openssl rand -base64 32)"

# Generate JWT_SECRET
openssl rand -base64 32

# Copy these values to your .env file
```

---

## Step 3: Deploy All Services

```bash
cd /opt/myunila/deployment/testing-vm1

# Deploy everything
./scripts/deploy-all.sh
```

This will deploy:
1. ✅ Redis (Cache)
2. ✅ PostgreSQL (Kong Database)
3. ✅ Kong Gateway
4. ✅ Auth Service
5. ✅ Dashboard Service
6. ✅ Sister Service
7. ✅ Nginx
8. ✅ Frontend
9. ✅ Monitoring Stack (Prometheus, Grafana, Loki)

Deployment takes about 3-5 minutes.

---

## Step 4: Verify Deployment

```bash
# Check health of all services
./scripts/health-check.sh

# Check running containers
docker ps

# Check specific service logs
docker logs myunila-kong
docker logs myunila-sister-service
docker logs myunila-frontend
```

---

## 🎯 Access Your Application

### Main Application
- **Frontend**: http://192.168.123.172:3000
- **Kong Gateway**: http://192.168.123.172:9800

### Backend Services (Direct Access)
- **Auth Service**: http://192.168.123.172:8081
- **Dashboard Service**: http://192.168.123.172:8082
- **Sister Service**: http://192.168.123.172:8083/health

### Admin & Monitoring
- **Kong Admin API**: http://192.168.123.172:9801
- **Kong UI**: http://192.168.123.172:9803
- **Grafana**: http://192.168.123.172:3002
  - Username: `admin`
  - Password: (check your .env)
- **Prometheus**: http://192.168.123.172:9090

---

## 📊 Quick Commands

### View All Services Status
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### View Logs
```bash
# Real-time logs
docker logs -f myunila-sister-service

# Last 100 lines
docker logs --tail 100 myunila-kong
```

### Restart Service
```bash
cd /opt/myunila/deployment/testing-vm1/services/3-backend
docker compose -f docker-compose.sister.yml restart
```

### Stop All Services
```bash
cd /opt/myunila/deployment/testing-vm1
./scripts/stop-services.sh
```

### Start All Services
```bash
cd /opt/myunila/deployment/testing-vm1
./scripts/deploy-all.sh
```

### Update Service
```bash
cd /opt/myunila/deployment/testing-vm1
./scripts/update-service.sh sister
```

### Backup Data
```bash
cd /opt/myunila/deployment/testing-vm1
./scripts/backup.sh
```

---

## 🔧 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker logs myunila-[service-name]

# Check container status
docker ps -a | grep myunila

# Restart
cd services/[service-directory]
docker compose -f docker-compose.[service].yml restart
```

### Port Already in Use
```bash
# Find what's using the port
sudo lsof -i :9800

# Or
sudo netstat -tulpn | grep 9800
```

### Out of Disk Space
```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a --volumes

# Remove old images
docker image prune -a
```

### Can't Connect to Database
```bash
# Test SQL Server connection
telnet 192.168.123.119 1433

# Check from inside container
docker exec -it myunila-sister-service sh
# Then try: wget -O- 192.168.123.119:1433
```

---

## 📚 Next Steps

1. **Configure Kong Routes**
   - Access Kong Admin: http://192.168.123.172:9801
   - Setup service routes
   - Configure JWT authentication

2. **Setup Monitoring Dashboards**
   - Login to Grafana: http://192.168.123.172:3002
   - Import dashboards
   - Configure alerts

3. **Test API Endpoints**
   ```bash
   # Test Kong
   curl http://192.168.123.172:9800/

   # Test Sister Service
   curl http://192.168.123.172:8083/health

   # Test via Kong
   curl http://192.168.123.172:9800/sister-service/health
   ```

4. **Setup Backup Schedule**
   ```bash
   # Add to crontab for daily backup at 2 AM
   0 2 * * * /opt/myunila/deployment/testing-vm1/scripts/backup.sh
   ```

---

## 📖 Full Documentation

- [Complete README](README.md)
- [Deployment Summary](DEPLOYMENT_SUMMARY.md)
- [Service Management Guide](docs/SERVICE_MANAGEMENT.md)
- [Monitoring Guide](docs/MONITORING_GUIDE.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)

---

## 💡 Tips

1. **Always check logs first** when something goes wrong
2. **Use health-check.sh** regularly to monitor services
3. **Backup before updates** using backup.sh
4. **Monitor disk space** - Docker can fill up disk quickly
5. **Keep .env secure** - never commit it to git

---

## 🆘 Getting Help

If you're stuck:
1. Check the logs: `docker logs [container-name]`
2. Run health check: `./scripts/health-check.sh`
3. Check [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
4. Contact DevOps team

---

**Happy Deploying! 🚀**
