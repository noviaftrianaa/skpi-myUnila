# VM4 — Setup Database Alert

**Tujuan:** Alert Telegram otomatis kalau DB server 119 kemungkinan down  
**Waktu:** ~5 menit  
**Prerequisite:** Monitoring stack VM4 sudah jalan (Prometheus + Alertmanager + Telegram bot)

---

## Step 1 — Copy alert file ke VM4

Dari laptop/VM yang punya akses:

```bash
# Dari repo my-unila (sudah ada di master)
scp deployment/production/vm4-monitoring/services/monitoring/config/alerts/database.yml \
    mybalancer@192.168.120.44:/home/mybalancer/
```

Lalu di **VM4**:

```bash
# Pindahkan ke folder alerts Prometheus
sudo cp /home/mybalancer/database.yml /path/to/monitoring/config/alerts/database.yml

# Atau kalau pakai docker volume mount:
sudo cp /home/mybalancer/database.yml \
    /var/www/my-unila/deployment/production/vm4-monitoring/services/monitoring/config/alerts/database.yml
```

## Step 2 — Reload Prometheus

```bash
# Opsi A: Hot reload (tanpa restart)
curl -X POST http://localhost:9090/-/reload

# Opsi B: Restart container
docker restart myunila-prometheus-production
```

## Step 3 — Verifikasi

```bash
# Cek alert rules loaded
curl -s http://localhost:9090/api/v1/rules | python3 -c "
import sys, json
d = json.load(sys.stdin)
for g in d.get('data',{}).get('groups',[]):
    print(g['name'], '-', len(g['rules']), 'rules')
"
```

Harus muncul: `myunila.database - 2 rules`

## Alert yang Ditambahkan

| Alert | Trigger | Severity | Aksi |
|-------|---------|----------|------|
| **DatabaseServerDown** | >50% backend services down serentak (1 menit) | 🔴 critical | Failover ke 190 |
| **DatabaseConnectionIssue** | Container restart >2x dalam 10 menit | ⚠️ warning | Cek koneksi DB |

## Contoh Alert Telegram

```
🚨 FIRING — DatabaseServerDown
• 🔴 DATABASE SERVER KEMUNGKINAN DOWN!
  Lebih dari 50% backend services gagal health check.
  
  TINDAKAN:
  1. SSMS 190: RESTORE DATABASE pdut WITH RECOVERY
  2. Ansible: ansible-playbook db-failover.yml --extra-vars "db_host=192.168.123.190"
```

---

*File alert: `deployment/production/vm4-monitoring/services/monitoring/config/alerts/database.yml`*  
*Sudah ada di repo master.*
