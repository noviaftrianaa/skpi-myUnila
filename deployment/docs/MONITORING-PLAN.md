# MyUnila Monitoring Plan — Grafana + Prometheus Stack

**Status:** Draft  
**Target:** VM5 Staging (192.168.120.45) → Production (VM1–VM3)  
**Updated:** 2026-03-15  

---

## 📐 Arsitektur Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MONITORING STACK (VM5 / per-VM)                │
│                                                                      │
│   ┌──────────┐   scrape   ┌────────────┐   query   ┌─────────────┐ │
│   │Prometheus│ ◄──────── │  Exporters  │           │   Grafana   │ │
│   │ :9090    │            │(node/cadv..)│ ◄──────── │   :3001     │ │
│   └────┬─────┘            └────────────┘           └─────────────┘ │
│        │                                                             │
│        │ push logs         ┌──────────┐                             │
│   ┌────▼─────┐            │ Promtail │                             │
│   │   Loki   │ ◄───────── │ (agent)  │                             │
│   │  :3100   │            └──────────┘                             │
│   └──────────┘                                                      │
└─────────────────────────────────────────────────────────────────────┘

Exporters per-VM:
- node_exporter       → CPU, RAM, Disk, Network host metrics
- cAdvisor            → Docker container metrics
- nginx_exporter      → Request rate, latency, error rate (jika ada nginx)
- redis_exporter      → Redis ops/sec, memory, hit rate
- kong (built-in)     → Kong API metrics via /metrics endpoint
```

---

## 🗂️ Stack Components

| Component | Image | Port | Fungsi |
|---|---|---|---|
| **Prometheus** | prom/prometheus:v2.51 | 9090 | Scrape & store time-series metrics |
| **Grafana** | grafana/grafana:10.4 | 3001 | Dashboard & visualisasi |
| **Loki** | grafana/loki:2.9 | 3100 | Log aggregation |
| **Promtail** | grafana/promtail:2.9 | 9080 | Log shipper (Docker logs → Loki) |
| **node_exporter** | prom/node-exporter:v1.8 | 9100 | Host system metrics |
| **cAdvisor** | gcr.io/cadvisor/cadvisor:v0.49 | 8080 | Container metrics |
| **redis_exporter** | oliver006/redis_exporter:v1.61 | 9121 | Redis metrics |
| **nginx_exporter** | nginx/nginx-prometheus-exporter:1.1 | 9113 | Nginx stub_status |

---

## 🖥️ VM & Service Mapping

### VM5 Staging (192.168.120.45) — Target Awal
Full monitoring stack + semua exporters untuk services yang running di VM5.

| Service yang dimonitor | Exporter | Notes |
|---|---|---|
| Host OS | node_exporter :9100 | CPU, RAM, Disk, Net |
| Docker containers | cAdvisor :8080 | Per-container resource usage |
| Redis | redis_exporter :9121 | Cache hit/miss, memory |
| Nginx | nginx_exporter :9113 | Request stats via stub_status |
| Kong | Built-in /metrics | API traffic, latency, errors |
| All container logs | Promtail → Loki | Log shipping |

### VM1 — Frontend & Kong (192.168.120.41) [Production]
| Component | Port |
|---|---|
| node_exporter | 9100 |
| cAdvisor | 8080 (internal) |
| Kong metrics | 8001/metrics |
| Nginx exporter | 9113 |
| Promtail | 9080 |

### VM2 — Backend1 (192.168.120.42) [Production]
| Component | Port |
|---|---|
| node_exporter | 9100 |
| cAdvisor | 8080 (internal) |
| Redis exporter | 9121 |
| Meilisearch metrics | (via cAdvisor) |
| Promtail | 9080 |

### VM3 — Backend2 (192.168.120.43) [Production]
| Component | Port |
|---|---|
| node_exporter | 9100 |
| cAdvisor | 8080 (internal) |
| Promtail | 9080 |

---

## 🚀 Phase 1 — Deploy di VM5 Staging

### Step 1: Tambah nginx stub_status

Tambahkan di nginx config staging:
```nginx
# /etc/nginx/conf.d/stub_status.conf
server {
    listen 8090;
    server_name localhost;
    location /stub_status {
        stub_status;
        allow 172.20.0.0/16;   # docker network
        allow 192.168.120.0/23; # internal
        deny all;
    }
}
```

### Step 2: Tambah Kong Prometheus Plugin (jika belum)

```bash
# Enable prometheus plugin di Kong
curl -X POST http://localhost:9801/plugins \
  --data "name=prometheus"
```

### Step 3: Docker Compose Monitoring Stack

Buat file: `deployment/production/vm5-staging/services/monitoring/docker-compose.monitoring.yml`

```yaml
services:
  # ─── Prometheus ───────────────────────────────────────────
  prometheus:
    image: prom/prometheus:v2.51.2
    container_name: myunila-prometheus-staging
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
      - '--web.external-url=http://192.168.120.45:9090'
    volumes:
      - ./config/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./config/alerts:/etc/prometheus/alerts:ro
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - myunila-network
      - monitoring-network
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:9090/-/healthy"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ─── Grafana ──────────────────────────────────────────────
  grafana:
    image: grafana/grafana:10.4.2
    container_name: myunila-grafana-staging
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_USER: ${GRAFANA_ADMIN_USER:-admin}
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD:-changeme}
      GF_SERVER_ROOT_URL: http://192.168.120.45:3001
      GF_INSTALL_PLUGINS: grafana-piechart-panel,redis-datasource
      GF_FEATURE_TOGGLES_ENABLE: publicDashboards
      TZ: Asia/Jakarta
    volumes:
      - grafana_data:/var/lib/grafana
      - ./config/grafana/provisioning:/etc/grafana/provisioning:ro
      - ./config/grafana/dashboards:/var/lib/grafana/dashboards:ro
    ports:
      - "3001:3000"
    networks:
      - myunila-network
      - monitoring-network
    depends_on:
      - prometheus
      - loki
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ─── Loki ─────────────────────────────────────────────────
  loki:
    image: grafana/loki:2.9.8
    container_name: myunila-loki-staging
    restart: unless-stopped
    command: -config.file=/etc/loki/config.yml
    volumes:
      - ./config/loki/config.yml:/etc/loki/config.yml:ro
      - loki_data:/loki
    ports:
      - "3100:3100"
    networks:
      - myunila-network
      - monitoring-network
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3100/ready"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ─── Promtail ─────────────────────────────────────────────
  promtail:
    image: grafana/promtail:2.9.8
    container_name: myunila-promtail-staging
    restart: unless-stopped
    command: -config.file=/etc/promtail/config.yml
    volumes:
      - ./config/promtail/config.yml:/etc/promtail/config.yml:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /var/log:/var/log:ro
    networks:
      - monitoring-network
    depends_on:
      - loki

  # ─── Node Exporter ────────────────────────────────────────
  node-exporter:
    image: prom/node-exporter:v1.8.1
    container_name: myunila-node-exporter-staging
    restart: unless-stopped
    pid: host
    command:
      - '--path.rootfs=/host'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /:/host:ro,rslave
    ports:
      - "9100:9100"
    networks:
      - monitoring-network

  # ─── cAdvisor ─────────────────────────────────────────────
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.49.1
    container_name: myunila-cadvisor-staging
    restart: unless-stopped
    privileged: true
    devices:
      - /dev/kmsg
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    ports:
      - "18080:8080"   # cAdvisor pakai 18080 agar tidak bentrok
    networks:
      - monitoring-network

  # ─── Redis Exporter ───────────────────────────────────────
  redis-exporter:
    image: oliver006/redis_exporter:v1.61.0
    container_name: myunila-redis-exporter-staging
    restart: unless-stopped
    environment:
      REDIS_ADDR: redis://myunila-redis-staging:6379
    ports:
      - "9121:9121"
    networks:
      - myunila-network
      - monitoring-network

networks:
  myunila-network:
    external: true
    name: myunila-network
  monitoring-network:
    driver: bridge
    name: myunila-monitoring-network

volumes:
  prometheus_data:
  grafana_data:
  loki_data:
```

### Step 4: prometheus.yml untuk VM5

```yaml
# config/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    environment: 'staging'
    vm: 'vm5'

rule_files:
  - /etc/prometheus/alerts/*.yml

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['myunila-node-exporter-staging:9100']
        labels:
          vm: 'vm5-staging'
          hostname: 'mystagging'

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['myunila-cadvisor-staging:8080']
        labels:
          vm: 'vm5-staging'

  - job_name: 'redis'
    static_configs:
      - targets: ['myunila-redis-exporter-staging:9121']
        labels:
          service: 'redis'

  - job_name: 'kong'
    scrape_interval: 10s
    static_configs:
      - targets: ['myunila-kong-staging:8001']
        labels:
          service: 'kong-gateway'
    metrics_path: '/metrics'

  - job_name: 'nginx'
    static_configs:
      - targets: ['myunila-nginx-staging:8090']
        labels:
          service: 'nginx'
    metrics_path: '/stub_status'
```

---

## 📊 Phase 2 — Production Multi-VM (VM1, VM2, VM3)

Pada production, **Prometheus & Grafana hanya di 1 VM** (rekomendasi: VM2 atau VM dedicated), sementara exporter di-deploy ke **semua VM**.

### Topology Production

```
VM1 (Frontend+Kong)          VM2 (Backend1)          VM3 (Backend2)
├── node_exporter :9100       ├── node_exporter :9100   ├── node_exporter :9100
├── cAdvisor :18080           ├── cAdvisor :18080        ├── cAdvisor :18080
├── nginx_exporter :9113      ├── redis_exporter :9121   └── promtail
├── promtail                  └── promtail
└── (Kong /metrics via 8001)       │
                                    │
                                    ▼
                           ┌────────────────┐
                           │  Prometheus    │ :9090
                           │  Grafana       │ :3001
                           │  Loki          │ :3100
                           └────────────────┘
                            (VM2 atau VM dedicated)
```

### prometheus.yml Production (centralized)

```yaml
global:
  scrape_interval: 15s
  external_labels:
    environment: 'production'

scrape_configs:
  # VM1 - Frontend & Kong
  - job_name: 'node-vm1'
    static_configs:
      - targets: ['192.168.120.41:9100']
        labels: {vm: 'vm1', role: 'frontend-kong'}

  - job_name: 'cadvisor-vm1'
    static_configs:
      - targets: ['192.168.120.41:18080']
        labels: {vm: 'vm1'}

  - job_name: 'kong'
    static_configs:
      - targets: ['192.168.120.41:8001']
        labels: {service: 'kong'}
    metrics_path: '/metrics'

  - job_name: 'nginx-vm1'
    static_configs:
      - targets: ['192.168.120.41:9113']
        labels: {vm: 'vm1', service: 'nginx'}

  # VM2 - Backend1
  - job_name: 'node-vm2'
    static_configs:
      - targets: ['192.168.120.42:9100']
        labels: {vm: 'vm2', role: 'backend1'}

  - job_name: 'cadvisor-vm2'
    static_configs:
      - targets: ['192.168.120.42:18080']
        labels: {vm: 'vm2'}

  - job_name: 'redis'
    static_configs:
      - targets: ['192.168.120.42:9121']
        labels: {service: 'redis'}

  # VM3 - Backend2
  - job_name: 'node-vm3'
    static_configs:
      - targets: ['192.168.120.43:9100']
        labels: {vm: 'vm3', role: 'backend2'}

  - job_name: 'cadvisor-vm3'
    static_configs:
      - targets: ['192.168.120.43:18080']
        labels: {vm: 'vm3'}
```

---

## 🔔 Alert Rules

Buat file `config/alerts/myunila.yml`:

```yaml
groups:
  - name: myunila.infra
    rules:
      # Host down
      - alert: HostDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Host {{ $labels.instance }} down"

      # CPU tinggi
      - alert: HighCPU
        expr: 100 - (avg by(instance)(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CPU > 80% di {{ $labels.instance }}"

      # RAM hampir penuh
      - alert: HighMemory
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Memory > 85% di {{ $labels.instance }}"

      # Disk hampir penuh
      - alert: DiskAlmostFull
        expr: (node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Disk > 80% di {{ $labels.instance }}"

      # Container restart loop
      - alert: ContainerRestarting
        expr: rate(container_start_time_seconds[5m]) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Container {{ $labels.name }} restart terus"

      # Kong 5xx error rate tinggi
      - alert: KongHighErrorRate
        expr: rate(kong_http_requests_total{code=~"5.."}[5m]) / rate(kong_http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Kong 5xx error rate > 5%"

      # Redis memory tinggi
      - alert: RedisHighMemory
        expr: redis_memory_used_bytes / redis_memory_max_bytes * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis memory > 80%"
```

---

## 📋 Grafana Dashboards yang Dipakai

| Dashboard | Grafana ID | Fungsi |
|---|---|---|
| Node Exporter Full | 1860 | Host metrics (CPU, RAM, Disk, Net) |
| cAdvisor | 14282 | Docker container metrics |
| Kong Official | 7424 | API Gateway metrics |
| Redis | 763 | Redis performance |
| Loki Logs | Custom | Log viewer per service |
| MyUnila Overview | Custom (sudah ada) | Custom business metrics |

---

## 🔒 Security & Access

- Grafana: akses via internal network saja (`192.168.120.x/23`)
- Prometheus: **JANGAN expose ke public** — hanya internal
- Exporter ports (9100, 9121, 18080): internal only
- Kong :8001 (Admin API): internal only

Untuk akses eksternal (jika perlu): gunakan **SSH tunnel**:
```bash
ssh -L 3001:localhost:3001 user@192.168.120.45
```

---

## 📝 Deploy Checklist VM5 Staging

- [x] Tambah `stub_status` di nginx config staging (`configs/nginx/conf.d/stub_status.conf`)
- [x] Enable Kong Prometheus plugin via Admin API (via `POST /plugins`)
- [x] Buat folder struktur `services/monitoring/config/`
- [x] Buat `docker-compose.monitoring.yml`
- [x] Buat `config/prometheus.yml`
- [x] Buat `config/loki/config.yml`
- [x] Buat `config/promtail/config.yml`
- [x] Buat `config/grafana/provisioning/` (datasources + dashboards)
- [x] Set Grafana admin password di `.env` (tidak di-commit)
- [x] Deploy stack — semua 8 container running
- [x] Verifikasi Prometheus targets — **6/6 UP** ✅
- [x] Alert rules aktif (`config/alerts/myunila.yml`)
- [x] `.gitignore` updated (deployment/docs/ & .env tidak dipush)
- [x] Frontend monitoring page — URL diupdate ke env var (`NEXT_PUBLIC_GRAFANA_URL` dll)
- [x] Frontend di-rebuild & restart dengan env var monitoring yang benar
- [ ] Import dashboard dari Grafana.com (ID 1860, 14282, 7424, 763) — *manual via UI*
- [ ] Recreate nginx container agar port 8090 ter-expose ke host (sudah ada di compose, perlu recreate)

### Akses URL (VM5 Staging)
| Service | Via Kong | Direct |
|---|---|---|
| Grafana | http://192.168.120.45:9800/grafana/ | http://192.168.120.45:3001 |
| Prometheus | http://192.168.120.45:9800/prometheus/ | http://192.168.120.45:9090 |
| Loki | — (internal) | http://192.168.120.45:3100 |
| cAdvisor | — (internal) | http://192.168.120.45:18080 |

### DB Settings (monitoring.settings)
Config dinamis disimpan di `monitoring.settings` table dengan `key_group='monitoring'`:
- `grafana_url`, `prometheus_url`, `loki_url`, `cadvisor_url`
- `grafana_admin_user`, `retention_days`, `scrape_interval`, `environment`

### RBAC
- File: `auth-service/database/seeders/data/portal_menus/monitoring.json`
- Roles: Administrator, Developer (CRUD), Rektor, WR1-4, LP3M (view only)
- Run: `php artisan portal:seed-menu --app=monitoring`

### Kong Routes
- `/grafana` → `myunila-grafana-staging:3000` (strip_path=false)
- `/prometheus` → `myunila-prometheus-staging:9090` (strip_path=true)
- Tambah di `scripts/setup-kong-routes.sh` untuk re-deploy

### Deployed: 2026-03-15 — Verified: 6/6 Prometheus targets UP

---

## 📝 Deploy Checklist Production (per VM)

Untuk setiap VM (VM1, VM2, VM3):
- [ ] Deploy `node_exporter` sebagai systemd service atau docker
- [ ] Deploy `cAdvisor`
- [ ] Deploy exporter spesifik (redis_exporter di VM2, nginx_exporter di VM1)
- [ ] Deploy `promtail` (config arahkan ke Loki di VM monitoring)
- [ ] Buka port antar VM di firewall (9100, 18080, 9113, 9121)
- [ ] Update `prometheus.yml` di VM monitoring untuk scrape semua VM
- [ ] Verifikasi di Grafana semua VM terlihat

---

## 📁 Struktur Folder yang Dibuat

```
deployment/production/vm5-staging/services/monitoring/
├── docker-compose.monitoring.yml
├── .env.example
└── config/
    ├── prometheus.yml
    ├── alerts/
    │   └── myunila.yml
    ├── loki/
    │   └── config.yml
    ├── promtail/
    │   └── config.yml
    └── grafana/
        ├── provisioning/
        │   ├── datasources/
        │   │   └── datasources.yml
        │   └── dashboards/
        │       └── dashboards.yml
        └── dashboards/
            ├── node-exporter.json
            ├── cadvisor.json
            ├── kong.json
            └── myunila-overview.json
```

---

## ⚠️ Catatan Penting

1. **Port cAdvisor pakai 18080** (bukan 8080) agar tidak bentrok dengan layanan lain
2. **Grafana pakai port 3001** (bukan 3000) agar tidak bentrok dengan frontend
3. **Data retention Prometheus**: 30 hari (sesuaikan dengan kapasitas disk)
4. **Loki retention**: 31 hari (sesuai config existing)
5. **Jangan push file `.env`** — sudah ada di `.gitignore`
6. Kong prometheus plugin harus di-enable manual via Admin API

---

*Plan ini dibuat berdasarkan analisis kode sumber monitoring-service, docker-compose existing, dan arsitektur production MyUnila.*
