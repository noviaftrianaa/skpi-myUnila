# PostgreSQL Setup di VM3 — Project Management

## Prerequisites
- SSH access ke VM3: `ssh mybackend2@192.168.120.43`
- Sudo access

## Step 1: Install PostgreSQL

```bash
# Update dan install
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Verify
sudo systemctl status postgresql
psql --version
```

## Step 2: Create Database & User

```bash
# Masuk sebagai postgres user
sudo -u postgres psql

# Jalankan di psql shell:
CREATE USER myunila_pm WITH PASSWORD '<PASSWORD_DISINI>';
CREATE DATABASE myunila_project OWNER myunila_pm;
\c myunila_project
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```

## Step 3: Allow Remote Connections (untuk VM6 Replica)

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf
# Ubah: listen_addresses = '*'

# Edit pg_hba.conf — tambah di akhir file
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Tambah baris:
# host  myunila_project  myunila_pm  192.168.120.0/24  md5
# host  myunila_project  myunila_pm  127.0.0.1/32      md5

# Restart
sudo systemctl restart postgresql
```

## Step 4: Import Schema

```bash
# Copy SQL file ke VM3 (dari VM1/VM5)
scp /var/www/my-unila/data-model/script/postgresql/project_management_v1.0_fresh.sql mybackend2@192.168.120.43:/tmp/

# SSH ke VM3 dan import
psql -U myunila_pm -d myunila_project -f /tmp/project_management_v1.0_fresh.sql
```

## Step 5: Verify

```bash
# Test koneksi
psql -U myunila_pm -d myunila_project -c "\dt"

# Harus tampil tabel:
# projects, tasks, task_comments, task_attachments, project_members,
# sprints, documents, document_categories, document_versions, activity_logs

# Test dari VM6 (remote)
psql -h 192.168.120.43 -U myunila_pm -d myunila_project -c "SELECT 1"
```

## Step 6: Deploy Project Service

```bash
# Update .env VM3 — tambah vars berikut:
# PROJECT_PG_DATABASE=myunila_project
# PROJECT_PG_USERNAME=myunila_pm
# PROJECT_PG_PASSWORD=<PASSWORD>

# Build dan start
cd /var/www/my-unila/deployment/production/vm3-backend2
docker compose -f services/project/docker-compose.yml --env-file .env up -d --build

# Verify
docker ps | grep project
curl -s http://localhost:8095/health
```

## Step 7: Register di Kong (VM1)

```bash
# SSH ke VM1 atau jalankan dari VM1
curl -i -X POST http://localhost:9801/services/ \
  --data "name=project-service" \
  --data "url=http://192.168.120.43:8095"

curl -i -X POST http://localhost:9801/services/project-service/routes \
  --data "name=project-service-route" \
  --data "paths[]=/project-service" \
  --data "strip_path=true"

# Verify
curl -s http://localhost:9800/project-service/health
```

## Notes
- PostgreSQL di-install NATIVE (bukan Docker) agar serverless
- Port default: 5432
- Data dir: `/var/lib/postgresql/*/main/`
- Log: `sudo journalctl -u postgresql`
- Backup: `pg_dump -U myunila_pm myunila_project > backup.sql`
