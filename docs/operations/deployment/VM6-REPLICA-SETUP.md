# VM6 Replica Setup — Active-Active Load Balancing

## Architecture
```
Client → Kong (VM1) ──┬── VM3 (192.168.120.43) primary
                      └── VM6 (192.168.120.46) replica
                      
Kong: round-robin + active health checks
All Go services stateless → state di SQL Server 119 + Redis VM2
```

## Prerequisites
- SSH access ke VM6: `ssh myreplica@192.168.120.46`
- VM3 sudah running semua services
- Kong di VM1 accessible (admin port 9801)

---

## Step 1: Install Docker di VM6

```bash
# SSH ke VM6
ssh myreplica@192.168.120.46

# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker myreplica
# Logout & login ulang agar group docker aktif

# Verify
docker --version
docker compose version
```

## Step 2: Clone Repository

```bash
# Setup SSH key untuk Bitbucket (copy dari VM1)
mkdir -p ~/.ssh
# Copy key atau generate baru dan add ke Bitbucket

# Clone
git clone git@bitbucket.org:mahendraunila/my-unila.git /var/www/my-unila
```

## Step 3: Configure Environment

```bash
cd /var/www/my-unila/deployment/production/vm6-replica

# Copy dan edit .env
cp .env.example .env
nano .env

# WAJIB diisi (copy nilai dari VM3 .env):
# - Semua DB credentials (SISTER_DB_*, FEEDER_DB_*, dll)
# - Redis credentials
# - JWT_SECRET (HARUS sama dengan VM3!)
# - MINIO credentials
# - API keys (SISTER_API_*, FEEDER_API_*, SIMPEDAM_*, dll)
# 
# PERHATIKAN:
# - PROJECT_PG_HOST=192.168.120.43 (bukan localhost! ke VM3)
# - Container names otomatis pakai suffix -vm6
```

## Step 4: Build & Deploy

```bash
# Build semua services (pertama kali agak lama ~5-10 menit)
cd /var/www/my-unila/deployment/production/vm6-replica
docker compose --env-file .env up -d --build

# Monitor build
docker compose logs -f

# Verify semua running
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**Expected containers:**
| Container | Port | Health |
|-----------|------|--------|
| myunila-sister-vm6 | 8091 | healthy |
| myunila-feeder-vm6 | 8092 | healthy |
| myunila-myunila-vm6 | 8093 | healthy |
| myunila-api-vm6 | 8094 | healthy |
| myunila-project-vm6 | 8095 | healthy |
| myunila-keuangan-vm6 | 8096 | healthy |
| myunila-monitoring-vm6 | 8097 | healthy |

## Step 5: Verify Service Health

```bash
# Test semua endpoint
for port in 8091 8092 8093 8094 8095 8096 8097; do
  echo -n "Port $port: "
  curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health
  echo ""
done

# Expected: semua 200
```

## Step 6: Configure Kong Load Balancing (di VM1)

```bash
# SSH ke VM1 atau jalankan dari VM yang bisa akses Kong admin
cd /var/www/my-unila/deployment/production/kong-lb

# Run setup script
bash setup-upstreams.sh http://localhost:9801

# Verify upstreams
bash check-health.sh http://localhost:9801
```

### Apa yang script lakukan:
1. Buat **upstream** per service dengan health check config
2. Tambah **2 targets** per upstream: VM3 + VM6 (weight=100 each → 50:50)
3. Update/create **service** di Kong untuk pakai upstream
4. Health check: active (ping /health tiap 10s) + passive (auto-detect error)

## Step 7: Test Load Balancing

```bash
# Hit endpoint beberapa kali, cek distribusi
for i in $(seq 1 10); do
  curl -s http://localhost:9800/api-service/health
  echo ""
done

# Check Kong upstream health detail
curl -s http://localhost:9801/upstreams/api-service-upstream/health | python3 -m json.tool
```

## Step 8: Test Failover

```bash
# 1. Stop VM6
ssh myreplica@192.168.120.46 "cd /var/www/my-unila/deployment/production/vm6-replica && docker compose down"

# 2. Verify: semua traffic ke VM3
curl -s http://localhost:9801/upstreams/api-service-upstream/health | python3 -m json.tool
# VM6 targets should show UNHEALTHY, VM3 HEALTHY

# 3. Test endpoint masih bisa
curl -s http://localhost:9800/api-service/health
# Harus tetap 200

# 4. Start VM6 kembali
ssh myreplica@192.168.120.46 "cd /var/www/my-unila/deployment/production/vm6-replica && docker compose up -d"

# 5. Tunggu ~30 detik (3x health check interval)
sleep 30

# 6. Verify: kedua VM healthy lagi
curl -s http://localhost:9801/upstreams/api-service-upstream/health | python3 -m json.tool
```

---

## Maintenance

### Update Service (setelah code changes)
```bash
# Option 1: Git pull + rebuild di VM6
ssh myreplica@192.168.120.46
cd /var/www/my-unila
git pull origin master
cd deployment/production/vm6-replica
docker compose --env-file .env up -d --build <service-name>

# Option 2: Pakai sync script dari VM3
bash /var/www/my-unila/deployment/production/vm6-replica/scripts/sync-from-vm3.sh all
```

### Docker Cleanup
```bash
# Otomatis via cron (sudah di-setup Ansible): Minggu jam 3 pagi
# Manual:
docker system prune -f && docker builder prune -f
```

### Monitor
```bash
# Check semua container
docker ps --format "table {{.Names}}\t{{.Status}}"

# Check logs per service
docker logs myunila-api-vm6 --tail 50

# Check Kong health
bash /var/www/my-unila/deployment/production/kong-lb/check-health.sh
```

### Adjust Weight (prioritas traffic)
```bash
# Misal: VM3 dapat 70% traffic, VM6 30%
curl -X PATCH http://localhost:9801/upstreams/api-service-upstream/targets/<vm3-target-id> \
  --data "weight=70"
curl -X PATCH http://localhost:9801/upstreams/api-service-upstream/targets/<vm6-target-id> \
  --data "weight=30"
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| VM6 service can't connect to DB | Check firewall VM6→119 port 1433 |
| VM6 service can't connect to Redis | Check firewall VM6→42 port 6379 |
| Project service error on VM6 | Check PG_HOST=192.168.120.43 (bukan localhost) |
| Kong not routing to VM6 | Check health endpoint responds 200 |
| After deploy, VM6 not picked up | Wait 30s for health check interval |

## Files Reference
- Docker Compose: `deployment/production/vm6-replica/docker-compose.yml`
- Env: `deployment/production/vm6-replica/.env`
- Kong LB scripts: `deployment/production/kong-lb/`
- Sync script: `deployment/production/vm6-replica/scripts/sync-from-vm3.sh`
- Ansible playbook: `deployment/production/ansible/playbooks/06-deploy-vm6-replica.yml`
