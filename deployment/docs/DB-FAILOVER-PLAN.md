# DB Failover Plan — MyUnila

**Created:** 2026-03-16  
**Status:** Ready (Log Shipping aktif)

---

## Arsitektur Sekarang

```
┌──────────────────┐    Log Shipping    ┌──────────────────┐
│  SERVER 119      │  ──── 5 min ────▶  │  SERVER 190      │
│  PRIMARY (ONLINE)│                    │  REPLICA (STANDBY)│
│  pdut            │                    │  pdut (Restoring) │
└────────┬─────────┘                    └────────┬─────────┘
         │                                       │
    DB_HOST=192.168.123.119                 DB_HOST=192.168.123.190
         │                                  (belum aktif)
         ▼
┌─────────────────────────────────────────────────────┐
│  VM1 (Kong+Frontend)                                │
│  VM2 (Auth+Dashboard+Public)                        │
│  VM3 (Sister+Feeder+MyUnila+API+Keuangan+Monitoring)│
│  VM5 (Staging — pakai pdut_staging)                 │
└─────────────────────────────────────────────────────┘
```

---

## Skenario 1: Failover (119 DOWN → pindah ke 190)

### Step 1 — Aktifkan DB di 190

Jalankan di **SSMS server 190**:

```sql
-- Buat pdut bisa read+write
RESTORE DATABASE pdut WITH RECOVERY;
GO

-- Verifikasi
SELECT name, state_desc FROM sys.databases WHERE name = 'pdut';
-- Harus: ONLINE
```

⚠️ **Setelah ini, Log Shipping berhenti.** 190 jadi independent.

### Step 2 — Update Connection String (Opsi A: Manual per VM)

```bash
# VM1 (myfrontend) — jika ada service yang konek DB
ssh myfrontend@192.168.120.41
sed -i 's/DB_HOST=192.168.123.119/DB_HOST=192.168.123.190/g' /var/www/my-unila/.env
# restart services yang perlu

# VM2 (mybackend1)
ssh mybackend1@192.168.120.42
sed -i 's/DB_HOST=192.168.123.119/DB_HOST=192.168.123.190/g' /var/www/my-unila/.env
# restart: auth, dashboard, public

# VM3 (mybackend2)
ssh mybackend2@192.168.120.43
sed -i 's/DB_HOST=192.168.123.119/DB_HOST=192.168.123.190/g' /var/www/my-unila/.env
# restart: sister, feeder, myunila, api, keuangan, monitoring
```

### Step 2 — Update Connection String (Opsi B: Ansible — Recommended)

```bash
# Dari VM1 (ansible control node)
cd /var/www/my-unila/deployment/production/ansible
ansible-playbook playbooks/db-failover.yml --extra-vars "db_host=192.168.123.190"
```

### Step 3 — Restart Semua Services

```bash
# Opsi A: Manual per VM
# VM2
ssh mybackend1@192.168.120.42
cd /var/www/my-unila && docker compose restart

# VM3
ssh mybackend2@192.168.120.43
cd /var/www/my-unila && docker compose restart

# Opsi B: Ansible
ansible-playbook playbooks/quick-restart.yml
```

### Step 4 — Verifikasi

```bash
# Cek health semua services
curl http://192.168.120.42:8081/health  # auth
curl http://192.168.120.43:8083/health  # sister
curl http://192.168.120.43:8085/health  # ws-service
# dll
```

---

## Skenario 2: Failback (119 kembali online → pindah balik)

### Step 1 — Sync data dari 190 ke 119

```sql
-- Di 190: Full backup pdut (yang sudah ada data baru)
BACKUP DATABASE pdut 
TO DISK = 'C:\SQLBackupLocal\pdut_failback.bak'
WITH FORMAT, INIT, COMPRESSION;
```

Copy ke 119:
```cmd
-- Di 119
copy \\192.168.123.190\SQLBackupLocal\pdut_failback.bak C:\SQLBackupShare\
```

```sql
-- Di 119: Restore (REPLACE existing)
USE master;
ALTER DATABASE pdut SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
RESTORE DATABASE pdut 
FROM DISK = 'C:\SQLBackupShare\pdut_failback.bak'
WITH REPLACE, RECOVERY;
ALTER DATABASE pdut SET MULTI_USER;
ALTER DATABASE pdut SET RECOVERY FULL;
```

### Step 2 — Re-setup Log Shipping 119 → 190

```sql
-- Di 119: Fresh full backup
BACKUP DATABASE pdut 
TO DISK = 'C:\SQLBackupShare\pdut_initial.bak'
WITH FORMAT, INIT, COMPRESSION;

-- Di 190: Drop pdut, restore WITH NORECOVERY
USE master;
ALTER DATABASE pdut SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE pdut;
RESTORE DATABASE pdut
FROM DISK = 'C:\SQLBackupLocal\pdut_initial.bak'
WITH NORECOVERY,
     MOVE 'pdut' TO 'C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\DATA\pdut.mdf',
     MOVE 'pdut_log' TO 'C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\DATA\pdut_log.ldf';
```

Log Shipping jobs sudah ada — akan otomatis jalan lagi.

### Step 3 — Update Connection String balik ke 119

```bash
ansible-playbook playbooks/db-failover.yml --extra-vars "db_host=192.168.123.119"
ansible-playbook playbooks/quick-restart.yml
```

---

## Skenario 3: Switch DB Name (pdut ↔ pdut_staging)

### Kapan dipakai?
- VM5 staging mau pakai production DB untuk testing
- Atau sebaliknya

### Cara:
```bash
# VM5 saja
ssh mystagging@192.168.120.45
sed -i 's/DB_DATABASE=pdut_staging/DB_DATABASE=pdut/g' /var/www/my-unila/.env
# Restart semua services di VM5
```

---

## Ansible Playbook: db-failover.yml

```yaml
---
# ansible-playbook playbooks/db-failover.yml --extra-vars "db_host=192.168.123.190"
- name: DB Failover - Switch database host
  hosts: backend
  become: yes
  vars:
    env_file: /var/www/my-unila/.env
    db_host: "{{ db_host }}"

  tasks:
    - name: Update DB_HOST in .env
      replace:
        path: "{{ env_file }}"
        regexp: 'DB_HOST=192\.168\.123\.\d+'
        replace: "DB_HOST={{ db_host }}"
      notify: restart services

    - name: Update DB_MSSQL_HOST in .env (Go services)
      replace:
        path: "{{ env_file }}"
        regexp: 'DB_MSSQL_HOST=192\.168\.123\.\d+'
        replace: "DB_MSSQL_HOST={{ db_host }}"
      notify: restart services

    # Service-specific DB_HOST vars
    - name: Update service-specific DB_HOST vars
      replace:
        path: "{{ env_file }}"
        regexp: '(AUTH_DB_HOST|API_DB_HOST|SISTER_DB_HOST|FEEDER_DB_HOST|MYUNILA_DB_HOST|KEUANGAN_DB_HOST|MONITORING_DB_HOST|DASHBOARD_DB_HOST)=192\.168\.123\.\d+'
        replace: '\1={{ db_host }}'
      notify: restart services

  handlers:
    - name: restart services
      shell: |
        cd /var/www/my-unila
        docker compose down
        docker compose up -d
      args:
        chdir: /var/www/my-unila
```

---

## Fase Berikutnya: DNS Alias (Opsional)

### Setup /etc/hosts di setiap VM

```bash
# Tambahkan di /etc/hosts semua VM (1,2,3,5)
192.168.123.119  db-primary.myunila.local
192.168.123.190  db-replica.myunila.local
```

### Update .env semua service

```env
DB_HOST=db-primary.myunila.local
```

### Failover = update /etc/hosts saja

```bash
# Ansible: swap DNS
ansible all -m lineinfile -a "path=/etc/hosts regexp='db-primary.myunila.local' line='192.168.123.190  db-primary.myunila.local'"
# Restart services atau tunggu connection pool reconnect
```

**Keuntungan:** Tidak perlu ubah .env, tidak perlu rebuild, cukup update hosts file.

---

## Checklist Failover

| # | Aksi | Waktu | Siapa |
|---|------|-------|-------|
| 1 | Deteksi 119 down (alert Telegram) | 0 min | Alertmanager |
| 2 | RESTORE pdut WITH RECOVERY di 190 | 1 min | DBA |
| 3 | Update DB_HOST di semua VM | 2 min | DBA/Ansible |
| 4 | Restart services | 3 min | DBA/Ansible |
| 5 | Verifikasi health endpoints | 5 min | DBA |
| **Total RTO** | | **~5 menit** | |

---

## Estimasi Dampak

| Metrik | Nilai |
|--------|-------|
| **RPO** (max data loss) | ~5 menit (interval Log Shipping) |
| **RTO** (downtime) | ~5 menit (manual) |
| **Frekuensi sync** | Setiap 5 menit |
| **Storage overhead** | ~500 MB - 1 GB (.trn files, 72 jam retention) |

---

*Plan ini perlu di-test (dry run) minimal 1x sebelum rely untuk production failover.*
