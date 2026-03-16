# MyUnila Production Monitoring Plan — VM4 Dedicated

**Status:** Draft  
**Tanggal:** 2026-03-15  
**Target:** VM4 Monitoring (192.168.120.44) — sudah ada di inventory Ansible

---

## 🏗️ Arsitektur Production

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MYUNILA PRODUCTION NETWORK                          │
│                          192.168.120.0/23                                   │
│                                                                             │
│  VM1 (192.168.120.41)     VM2 (192.168.120.42)     VM3 (192.168.120.43)   │
│  Frontend + Kong          Backend 1 (PHP)           Backend 2 (Go)         │
│  ├── myunila-frontend     ├── auth-service          ├── sister-service      │
│  ├── myunila-kong         ├── dashboard-service     ├── feeder-service      │
│  └── kong-postgres        ├── public-service        ├── myunila-service     │
│                           ├── nginx-vm2             ├── api-service         │
│                           ├── redis-vm2             ├── keuangan-service    │
│                           └── meilisearch           └── monitoring-service  │
│                                                                             │
│  Exporters di setiap VM:                                                    │
│  ├── node_exporter :9100 (host metrics)                                     │
│  ├── cAdvisor :18080 (container metrics)                                    │
│  └── promtail (log shipping → VM4 Loki)                                     │
│                                                                             │
│  VM4 (192.168.120.44) — DEDICATED MONITORING                               │
│  ├── Prometheus :9090 (metrics collection)                                  │
│  ├── Grafana :3001 (dashboard)                                              │
│  ├── Loki :3100 (log aggregation)                                           │
│  └── Alertmanager :9093 (alert routing → Telegram)                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ VM Specs (Semua sama)
- **CPU:** 8 cores
- **RAM:** 16GB  
- **OS:** Ubuntu 22.04
- **Network:** myunila-prod-network (bridge)

---

## 🪟 Windows Server sebagai VM Monitoring — Analisis

### ✅ Bisa & Memungkinkan

Docker berjalan di Windows Server dengan Docker Desktop atau Docker CE (WSL2/Hyper-V). Semua image yang dipakai (Prometheus, Grafana, Loki, Promtail) tersedia untuk `linux/amd64` dan bisa jalan via WSL2 di Windows.

**Persyaratan Windows Server:**
- Windows Server 2019 / 2022
- Minimal 8GB RAM (rekomendasi 16GB)
- Minimal 4 CPU
- WSL2 enabled (untuk Docker)
- Storage 200GB+ (untuk data Prometheus + Loki 30-31 hari)

### ⚠️ Pertimbangan

| Aspek | Ubuntu VM | Windows Server |
|---|---|---|
| Docker performance | Native, optimal | Via WSL2, slight overhead |
| Network integration | Langsung ke docker network | Bridge ke internal network |
| Setup complexity | Simple | Perlu setup WSL2 + Docker Desktop |
| Maintenance | apt update | Windows Update + Docker update |
| Cost | Sudah ada VM | Lisensi Windows (atau existing) |
| Promtail log path | `/var/log`, `/var/run/docker.sock` | Path berbeda di WSL2 |
| Resource overhead | ~512MB OS overhead | ~2-4GB OS overhead |

### 📌 Rekomendasi

**Jika Windows Server sudah ada dan tidak terpakai → bisa digunakan**, dengan catatan:
- Gunakan WSL2 backend untuk Docker
- Pastikan network bisa reach `192.168.120.41-43` (VM1-VM3)
- IP Windows Server tetap harus di subnet `192.168.120.x` atau punya route ke sana
- Prometheus/Grafana/Loki jalan di container Linux via WSL2 — no issue

**Jika ada pilihan → Ubuntu VM (VM4 yang sudah ada di inventory) lebih disarankan** untuk simplicity dan performance.

---

## 📋 Phase 2A — Setup VM4 / Windows Server Monitoring

### Komponen yang Deploy di VM4/WinServer

```yaml
services:
  prometheus:     prom/prometheus:v2.51.2     :9090
  grafana:        grafana/grafana:10.4.2       :3001
  loki:           grafana/loki:2.9.8           :3100
  promtail:       grafana/promtail:2.9.8       :9080  # log dari VM4 sendiri
  alertmanager:   prom/alertmanager:v0.27       :9093  # NEW - alert routing
```

### File yang dibuat

```
deployment/production/vm4-monitoring/
├── services/
│   └── monitoring/
│       ├── docker-compose.monitoring.yml
│       ├── .env.example
│       └── config/
│           ├── prometheus.yml          # scrape semua VM
│           ├── alerts/
│           │   └── myunila.yml
│           ├── alertmanager/
│           │   └── config.yml          # Telegram bot alert
│           ├── loki/
│           │   └── config.yml
│           ├── promtail/
│           │   └── config.yml          # log dari VM4 sendiri
│           └── grafana/
│               ├── provisioning/
│               │   ├── datasources/
│               │   └── dashboards/
│               └── dashboards/
│                   ├── vm1-overview.json
│                   ├── vm2-overview.json
│                   ├── vm3-overview.json
│                   └── myunila-overview.json
└── scripts/
    └── setup.sh
```

---

## 📋 Phase 2B — Deploy Exporter di VM1, VM2, VM3

Exporter ringan di-deploy ke setiap VM production. **Tidak butuh rebuild** — langsung docker run atau compose.

### Per-VM Exporter Compose

```
deployment/production/vm1-frontend-kong/services/monitoring/docker-compose.exporters.yml
deployment/production/vm2-backend1/services/monitoring/docker-compose.exporters.yml
deployment/production/vm3-backend2/services/monitoring/docker-compose.exporters.yml
```

### Services per VM

| Exporter | VM1 | VM2 | VM3 |
|---|---|---|---|
| node_exporter :9100 | ✅ | ✅ | ✅ |
| cAdvisor :18080 | ✅ | ✅ | ✅ |
| nginx_exporter :9113 | ✅ (Kong metrics) | ✅ | - |
| redis_exporter :9121 | - | ✅ | - |
| promtail | ✅ | ✅ | ✅ |

### Prometheus scrape config (di VM4)

```yaml
scrape_configs:
  # VM1 — Frontend + Kong
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
      - targets: ['192.168.120.41:8001']  # Kong Admin API
        labels: {service: 'kong'}
    metrics_path: '/metrics'

  # VM2 — Backend PHP
  - job_name: 'node-vm2'
    static_configs:
      - targets: ['192.168.120.42:9100']
        labels: {vm: 'vm2', role: 'backend-php'}

  - job_name: 'cadvisor-vm2'
    static_configs:
      - targets: ['192.168.120.42:18080']
        labels: {vm: 'vm2'}

  - job_name: 'redis'
    static_configs:
      - targets: ['192.168.120.42:9121']
        labels: {service: 'redis', vm: 'vm2'}

  # VM3 — Backend Go
  - job_name: 'node-vm3'
    static_configs:
      - targets: ['192.168.120.43:9100']
        labels: {vm: 'vm3', role: 'backend-go'}

  - job_name: 'cadvisor-vm3'
    static_configs:
      - targets: ['192.168.120.43:18080']
        labels: {vm: 'vm3'}
```

---

## 📋 Phase 2C — Alertmanager ke Telegram

```yaml
# alertmanager/config.yml
global:
  resolve_timeout: 5m

route:
  receiver: 'telegram'
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  routes:
    - matchers: [severity="critical"]
      receiver: telegram
      repeat_interval: 1h

receivers:
  - name: telegram
    telegram_configs:
      - bot_token: '<BOT_TOKEN>'
        chat_id: <CHAT_ID>
        message: |
          🚨 *{{ .Status | toUpper }}* — {{ .GroupLabels.alertname }}
          VM: {{ .CommonLabels.vm }}
          {{ range .Alerts }}
          • {{ .Annotations.summary }}
          {{ end }}
```

---

## 📋 Phase 2D — Update Frontend Monitoring Page

Update `NEXT_PUBLIC_GRAFANA_URL` di VM1 production env untuk arahkan ke VM4:
```
NEXT_PUBLIC_GRAFANA_URL=http://192.168.120.44:3001
NEXT_PUBLIC_PROMETHEUS_URL=http://192.168.120.44:9090
```

---

## 🔥 Firewall Rules yang Dibutuhkan

### VM4 → VM1/VM2/VM3 (Prometheus scrape)
```
VM1 :9100, :18080, :8001 → allow from 192.168.120.44
VM2 :9100, :18080, :9121 → allow from 192.168.120.44
VM3 :9100, :18080         → allow from 192.168.120.44
```

### VM1/VM2/VM3 → VM4 (Promtail push logs)
```
VM4 :3100 (Loki) → allow from 192.168.120.41-43
```

### Admin/Developer → VM4
```
VM4 :3001 (Grafana)     → allow from 10.10.110.0/24
VM4 :9090 (Prometheus)  → allow from 10.10.110.0/24
VM4 :9093 (Alertmanager)→ allow from 10.10.110.0/24
```

---

## 📐 Storage Requirement VM4

| Data | Estimasi/hari | 30 hari |
|---|---|---|
| Prometheus metrics (3 VM) | ~500MB | ~15GB |
| Loki logs (3 VM, ~20 services) | ~2GB | ~60GB |
| **Total** | ~2.5GB | **~75GB** |

**Rekomendasi disk VM4: minimum 150GB** (75GB data + buffer 2x)

---

## ✅ Urutan Implementasi

1. **Phase 2A** — Setup VM4/WinServer: install Docker, deploy monitoring stack
2. **Phase 2B** — Deploy exporters di VM1, VM2, VM3
3. **Phase 2C** — Setup Alertmanager + Telegram bot
4. **Phase 2D** — Update env frontend production
5. **Verifikasi** — semua target up di Prometheus, dashboard muncul di Grafana

---

## 📌 Catatan Windows Server

Jika pakai Windows Server:
1. Enable WSL2: `wsl --install`
2. Install Docker Desktop dengan WSL2 backend
3. Set IP static di subnet `192.168.120.x` atau pastikan routing ke VM1-VM3 ada
4. Mount path untuk Promtail berbeda — perlu adjustment config
5. Port forwarding di Windows Firewall perlu dikonfigurasi (berbeda dengan iptables)
6. Pastikan Windows Defender tidak block Docker network traffic

---

*Plan ini belum diimplementasi. Tunggu konfirmasi VM4/WinServer siap sebelum mulai.*
