# Production Monitoring — Step-by-Step Implementation Plan

**Target:** VM4 (192.168.120.44) atau Windows Server  
**Status:** Ready to implement — tinggal VM siap  
**Updated:** 2026-03-15

---

## 📐 Overview Arsitektur Final

```
VM1 (192.168.120.41)          VM2 (192.168.120.42)          VM3 (192.168.120.43)
┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
│ node-exporter   │           │ node-exporter   │           │ node-exporter   │
│ cadvisor        │           │ cadvisor        │           │ cadvisor        │
│ nginx-exporter  │           │ redis-exporter  │           │ promtail        │
│ promtail        │           │ promtail        │           └────────┬────────┘
│ Kong :8001/metr │           └────────┬────────┘                    │
└────────┬────────┘                    │                              │
         │                             │                              │
         └──────────────┬──────────────┘                              │
                        ▼                                             │
              VM4 (192.168.120.44)  ◄────────────────────────────────┘
              ┌──────────────────────────────────────────┐
              │ Prometheus :9090  (scrape semua VM)       │
              │ Grafana    :3001  (dashboard)             │
              │ Loki       :3100  (log aggregation)       │
              │ Alertmanager :9093 (alert → Telegram)     │
              └──────────────────────────────────────────┘
```

---

## 🖥️ Pilihan VM Monitoring

### Opsi A — Ubuntu VM4 (192.168.120.44) ⭐ Rekomendasi
- Sudah ada di inventory Ansible
- Ansible playbook `05-deploy-vm4-monitoring.yml` sudah ada (tinggal lengkapi)
- Direct integration ke `myunila-prod-network`

### Opsi B — Windows Server
- Perlu WSL2 + Docker Desktop
- IP harus di subnet `192.168.120.x` atau ada routing
- Ada overhead RAM ~2-4GB untuk OS
- Langkah setup berbeda (lihat Section Windows Server di bawah)

---

## 🗂️ Struktur Folder yang Dibuat

```
deployment/production/vm4-monitoring/          ← Folder baru (rename dari vm4-loadbalancer)
├── services/
│   ├── monitoring/
│   │   ├── docker-compose.monitoring.yml      ← Core stack
│   │   ├── .env.example
│   │   └── config/
│   │       ├── prometheus.yml                 ← Scrape semua VM
│   │       ├── alerts/
│   │       │   └── myunila.yml               ← Alert rules
│   │       ├── alertmanager/
│   │       │   └── config.yml               ← Telegram alerts
│   │       ├── loki/
│   │       │   └── config.yml
│   │       ├── promtail/
│   │       │   └── config.yml
│   │       └── grafana/
│   │           ├── provisioning/
│   │           │   ├── datasources/
│   │           │   │   └── datasources.yml
│   │           │   └── dashboards/
│   │           │       └── dashboards.yml
│   │           └── dashboards/               ← Dashboard JSON files
│   ├── exporters/                            ← Exporter untuk VM4 sendiri
│   │   └── docker-compose.exporters.yml
│
├── vm1-exporters/                            ← Deploy ke VM1
│   └── docker-compose.exporters.yml
├── vm2-exporters/                            ← Deploy ke VM2
│   └── docker-compose.exporters.yml
└── vm3-exporters/                            ← Deploy ke VM3
    └── docker-compose.exporters.yml
```

---

## 📋 PHASE 2A — Siapkan VM4 / Windows Server

### Jika Ubuntu VM4 (192.168.120.44)

**Step 1 — Akses & basic setup**
```bash
ssh mybalancer@192.168.120.44

# Update & install Docker
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verifikasi
docker --version
docker compose version
```

**Step 2 — Clone repo**
```bash
mkdir -p /var/www/my-unila
cd /var/www/my-unila
git clone https://bitbucket.org/mahendraunila/my-unila.git .
```

**Step 3 — Setup network & direktori**
```bash
docker network create myunila-prod-network

mkdir -p /var/www/my-unila/deployment/production/vm4-monitoring/data/{grafana,prometheus,loki}
chown -R $USER:$USER /var/www/my-unila/deployment/production/vm4-monitoring/data/
```

**Step 4 — Buat .env**
```bash
cp deployment/production/vm4-monitoring/services/monitoring/.env.example \
   deployment/production/vm4-monitoring/services/monitoring/.env

# Edit password Grafana
nano deployment/production/vm4-monitoring/services/monitoring/.env
```

---

### Jika Windows Server

**Step 1 — Enable WSL2**
```powershell
# Di PowerShell (Administrator)
wsl --install
wsl --set-default-version 2
# Restart Windows
```

**Step 2 — Install Docker Desktop**
- Download Docker Desktop for Windows
- Enable WSL2 backend di Settings
- Enable "Use the WSL2 based engine"

**Step 3 — Konfigurasi network**
```powershell
# Set IP static di subnet yang bisa reach VM1-VM3
# Pastikan Windows Firewall allow port 3001, 9090, 3100, 9093, 9100, 18080
New-NetFirewallRule -DisplayName "Grafana" -Direction Inbound -Port 3001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Prometheus" -Direction Inbound -Port 9090 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Loki" -Direction Inbound -Port 3100 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Alertmanager" -Direction Inbound -Port 9093 -Protocol TCP -Action Allow
```

**Step 4 — Di WSL2 terminal**
```bash
# Sama seperti Ubuntu — clone repo, buat .env, dst
mkdir -p /var/www/my-unila && cd /var/www/my-unila
git clone https://bitbucket.org/mahendraunila/my-unila.git .
```

---

## 📋 PHASE 2B — Deploy Core Monitoring Stack (VM4)

**Step 1 — Deploy stack**
```bash
cd /var/www/my-unila/deployment/production/vm4-monitoring/services/monitoring

docker compose -f docker-compose.monitoring.yml up -d

# Cek status
docker ps | grep myunila
```

**Step 2 — Verifikasi**
```bash
# Prometheus
curl -s http://localhost:9090/-/healthy

# Grafana
curl -s http://localhost:3001/api/health

# Loki
curl -s http://localhost:3100/ready

# Alertmanager
curl -s http://localhost:9093/-/healthy
```

**Step 3 — Buka port firewall VM4**
```bash
# Ubuntu
ufw allow from 192.168.120.0/23 to any port 9090   # Prometheus — internal only
ufw allow from 192.168.120.0/23 to any port 3100   # Loki — internal only
ufw allow from 10.10.110.0/24 to any port 3001     # Grafana — VPN admin
ufw allow from 10.10.110.0/24 to any port 9090     # Prometheus — VPN admin
ufw allow from 10.10.110.0/24 to any port 9093     # Alertmanager — VPN admin

# Untuk menerima metrics dari VM1-3 (node_exporter, cadvisor push ke VM4 via promtail)
ufw allow from 192.168.120.41 to any port 3100
ufw allow from 192.168.120.42 to any port 3100
ufw allow from 192.168.120.43 to any port 3100
```

---

## 📋 PHASE 2C — Deploy Exporters di VM1, VM2, VM3

### VM1 (192.168.120.41)

**Step 1 — SSH ke VM1**
```bash
ssh myfrontend@192.168.120.41
cd /var/www/my-unila
git pull origin master
```

**Step 2 — Deploy exporters**
```bash
cd deployment/production/vm1-frontend-kong/services/exporters
docker compose -f docker-compose.exporters.yml up -d
```

**Step 3 — Buka port untuk Prometheus scrape dari VM4**
```bash
ufw allow from 192.168.120.44 to any port 9100   # node_exporter
ufw allow from 192.168.120.44 to any port 18080  # cadvisor
ufw allow from 192.168.120.44 to any port 9113   # nginx_exporter
# Kong admin metrics sudah expose di :8001 — pastikan allow dari VM4
ufw allow from 192.168.120.44 to any port 8001
```

### VM2 (192.168.120.42)

```bash
ssh mybackend1@192.168.120.42
cd /var/www/my-unila && git pull

cd deployment/production/vm2-backend1/services/exporters
docker compose -f docker-compose.exporters.yml up -d

ufw allow from 192.168.120.44 to any port 9100   # node_exporter
ufw allow from 192.168.120.44 to any port 18080  # cadvisor
ufw allow from 192.168.120.44 to any port 9121   # redis_exporter
```

### VM3 (192.168.120.43)

```bash
ssh mybackend2@192.168.120.43
cd /var/www/my-unila && git pull

cd deployment/production/vm3-backend2/services/exporters
docker compose -f docker-compose.exporters.yml up -d

ufw allow from 192.168.120.44 to any port 9100   # node_exporter
ufw allow from 192.168.120.44 to any port 18080  # cadvisor
```

---

## 📋 PHASE 2D — Setup Alertmanager Telegram

**Step 1 — Buat Telegram Bot**
1. Chat `@BotFather` di Telegram
2. `/newbot` → beri nama → dapat `BOT_TOKEN`
3. Chat bot tersebut, lalu get Chat ID:
   ```
   https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
   ```

**Step 2 — Update alertmanager config**
```bash
# Edit file config
nano deployment/production/vm4-monitoring/services/monitoring/config/alertmanager/config.yml

# Isi:
# bot_token: '<BOT_TOKEN>'
# chat_id: <YOUR_CHAT_ID>
```

**Step 3 — Restart alertmanager**
```bash
docker restart myunila-alertmanager-prod
```

**Step 4 — Test alert**
```bash
# Kirim test alert manual
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[{"labels":{"alertname":"TestAlert","severity":"critical"},"annotations":{"summary":"Test dari VM4"}}]'
```

---

## 📋 PHASE 2E — Import Grafana Dashboards

**Via UI Grafana (http://192.168.120.44:3001):**

1. Login dengan credentials dari `.env`
2. Menu → Dashboards → Import
3. Import by Grafana.com ID:

| Dashboard | ID | Fungsi |
|---|---|---|
| Node Exporter Full | **1860** | CPU, RAM, Disk, Network per VM |
| Docker & System | **893** | Docker container overview |
| cAdvisor | **14282** | Per-container metrics |
| Kong Official | **7424** | API Gateway traffic |
| Redis | **763** | Redis performance |
| Loki Logs | **13639** | Log explorer |

4. Set datasource ke **Prometheus** / **Loki** sesuai dashboard
5. Set variable `instance` / `job` sesuai label yang sudah dikonfigurasi

---

## 📋 PHASE 2F — Update Frontend Production

Update env VM1 untuk arahkan monitoring URL ke VM4:

```bash
# Di VM1
nano /var/www/my-unila/deployment/production/vm1-frontend-kong/.env

# Tambah/update:
NEXT_PUBLIC_GRAFANA_URL=http://192.168.120.44:3001
NEXT_PUBLIC_PROMETHEUS_URL=http://192.168.120.44:9090
NEXT_PUBLIC_LOKI_URL=http://192.168.120.44:3100
NEXT_PUBLIC_CADVISOR_URL=http://192.168.120.44:18080

# Rebuild frontend
cd deployment/production/vm1-frontend-kong/services/frontend
docker compose -f docker-compose.yml --env-file ../../.env build --no-cache
docker compose -f docker-compose.yml --env-file ../../.env up -d
```

---

## ✅ Checklist Verifikasi Akhir

```
VM4 Core Stack:
[ ] Prometheus healthy & accessible
[ ] Grafana healthy & login berhasil
[ ] Loki healthy
[ ] Alertmanager healthy

Prometheus Targets (harus semua UP):
[ ] node-vm1 (192.168.120.41:9100)
[ ] node-vm2 (192.168.120.42:9100)
[ ] node-vm3 (192.168.120.43:9100)
[ ] cadvisor-vm1 (192.168.120.41:18080)
[ ] cadvisor-vm2 (192.168.120.42:18080)
[ ] cadvisor-vm3 (192.168.120.43:18080)
[ ] kong (192.168.120.41:8001/metrics)
[ ] redis (192.168.120.42:9121)
[ ] nginx-vm1 (192.168.120.41:9113)

Loki:
[ ] Log dari VM1 masuk (promtail → loki)
[ ] Log dari VM2 masuk
[ ] Log dari VM3 masuk

Grafana:
[ ] Dashboard Node Exporter — semua VM terlihat
[ ] Dashboard cAdvisor — semua container terlihat
[ ] Dashboard Kong — API metrics
[ ] Dashboard Redis

Alertmanager:
[ ] Test alert terkirim ke Telegram

Frontend:
[ ] Portal monitoring page arah ke VM4
[ ] Link Grafana buka http://192.168.120.44:3001
```

---

## ⏱️ Estimasi Waktu

| Phase | Estimasi |
|---|---|
| 2A — Setup VM/WinServer | 30-60 menit |
| 2B — Deploy core stack VM4 | 15-30 menit |
| 2C — Deploy exporters VM1-3 | 30-45 menit |
| 2D — Alertmanager Telegram | 15 menit |
| 2E — Import dashboards | 15-30 menit |
| 2F — Update frontend prod | 15-20 menit |
| **Total** | **~2-3 jam** |

---

## 🔑 Yang Perlu Disiapkan Sebelum Mulai

1. **VM4 / Windows Server** — IP di subnet `192.168.120.x`, SSH/RDP access
2. **Telegram Bot Token** — dari @BotFather
3. **Telegram Chat ID** — untuk terima alert
4. **SSH access ke VM1, VM2, VM3** — untuk deploy exporters
5. **Grafana admin password** — tentukan sebelum deploy

---

*Semua config file (docker-compose, prometheus.yml, dll) akan dibuat saat implementasi dimulai,  
berdasarkan config VM5 staging yang sudah terbukti jalan.*
