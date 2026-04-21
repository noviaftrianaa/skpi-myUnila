# 🚀 Deploy Production — SIAKADU v2.0 Release

**Release date:** 20–21 April 2026
**Scope:** Refactor besar module SIAKADU — flat table mahasiswa v2, module wisuda baru, filter/sort server-side, UI konsisten.

## 📋 Commits yang akan di-deploy

```
8202315d2 fix(data-model): siakadu.spp_mhs.id_smt tipe char(5) match semester — fix FK error
0600fbcd4 refactor(data-model): pisahkan drop script — siakadu_drop_all.sql dedicated
c786742bb feat(data-model): siakadu_schema_v2.0_fresh.sql — self-contained
16a0fc282 feat(data-model): script siakadu_schema_v2.0_fresh.sql — deploy sekali jalan
dd3e43fdf docs(deploy): panduan deploy production SIAKADU v2.0
3157ec698 chore(deployment): aktifkan nginx dashboard.conf & public.conf
4b835f633 fix(auth+simbak): defensive token validation + simbak v2 query
7d567d0cc fix(frontend): hapus 'return (' duplikat di monitoring modal
020311d28 feat(frontend): siakadu pages — filter bar, server-side sorting, stats hidup
ca1b56515 feat(myunila-service): module siakadu wisuda baru
8791a55d7 feat(myunila-service): siakadu nilai v2.0 — mahasiswa bridge
2e850ab61 feat(myunila-service): siakadu akademik — filter/sort/stats, nm_prodi konsisten
b3be46bbf feat(myunila-service): siakadu mahasiswa v2.0 — single-table upsert
08a9b77b8 feat(data-model): siakadu schema v2.0 — flat table mahasiswa + migrasi
```

## 🏗️ Arsitektur VM (siapa di mana?)

| VM | IP | User | Services yang impact |
|----|----|----|---------------------|
| **VM1** | 192.168.120.41 | myfrontend | Frontend, Kong gateway, nginx |
| **VM2** | 192.168.120.42 | mybackend1 | auth-service, public-service, dashboard-service |
| **VM3** | 192.168.120.43 | mybackend2 | **myunila-service** (main!), sister-service, feeder-service |
| **VM6** | 192.168.120.46 | mybackend2 | Replica VM3 (active-active mirror) |
| **VM8** | 192.168.120.48 | mysimbak | simbak-service |
| **SQL Server** | 192.168.123.119 | sa / mizarzulmi | DB `pdut` |

---

## 🎯 STEP-BY-STEP DEPLOY

### ⚠️ STEP 0 — BACKUP DATABASE

Di **SQL Server 119** (via SSMS atau sqlcmd dari server Windows):

```sql
BACKUP DATABASE pdut
TO DISK = 'D:\Backup\pdut_pre-siakadu-v2_2026-04-21.bak'
WITH COMPRESSION, STATS = 10;
```

**JANGAN lanjut tanpa backup.** Siakadu v2 akan DROP `reg_pd` + `peserta_didik` — kalau ada salah, backup ini penyelamat.

---

### 📥 STEP 1 — Pull Latest Code di Semua VM

```bash
# VM1 (frontend+kong)
ssh myfrontend@192.168.120.41
cd /var/www/my-unila && git pull origin master
git log --oneline -3   # pastikan HEAD = 8202315d2
exit

# VM2 (auth+public+dashboard)
ssh mybackend1@192.168.120.42
cd /var/www/my-unila && git pull origin master
exit

# VM3 (myunila+sister+feeder) ← PALING PENTING
ssh mybackend2@192.168.120.43
cd /var/www/my-unila && git pull origin master
exit

# VM6 (replica VM3)
ssh mybackend2@192.168.120.46
cd /var/www/my-unila && git pull origin master
exit

# VM8 (simbak)
ssh mysimbak@192.168.120.48
cd /var/www/my-unila && git pull origin master
exit
```

---

### 🗄️ STEP 2 — Deploy Schema SIAKADU v2.0 di SQL Server 119

Lokasi script: `data-model/script/sqlserver/siakadu/`

#### Opsi A: DB Production yang sudah punya data v1 (migrasi data)

```bash
# Dari mesin yang bisa akses SQL Server 119:
cd /var/www/my-unila/data-model/script/sqlserver/siakadu

# 2a. Buat tabel v2 (mahasiswa + keluarga_mhs + views)
sqlcmd -S 192.168.123.119 -U mizarzulmi -P '<password>' -d pdut \
       -i siakadu_schema_v2.0_mahasiswa.sql

# 2b. Migrate data dari v1 ke v2
sqlcmd -S 192.168.123.119 -U mizarzulmi -P '<password>' -d pdut \
       -i siakadu_migrate_v1_to_v2.sql

# 2c. Backfill status_mahasiswa & id_jns_keluar dari pdrd.reg_pd
sqlcmd -S 192.168.123.119 -U mizarzulmi -P '<password>' -d pdut -Q "
UPDATE m SET
    m.id_jns_keluar = rp.id_jns_keluar,
    m.tgl_keluar = rp.tgl_keluar,
    m.ket_keluar = rp.ket
FROM siakadu.mahasiswa m
INNER JOIN pdrd.reg_pd rp ON rp.id_reg_pd = m.id_reg_pd AND rp.soft_delete = 0
WHERE m.id_jns_keluar IS NULL AND rp.id_jns_keluar IS NOT NULL;

UPDATE m SET m.id_stat_mhs = pd.id_stat_mhs
FROM siakadu.mahasiswa m
INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = m.id_pd AND pd.soft_delete = 0
WHERE m.id_stat_mhs IS NULL AND pd.id_stat_mhs IS NOT NULL;

UPDATE siakadu.mahasiswa SET status_mahasiswa =
    CASE
        WHEN id_jns_keluar = '1' THEN 'Lulus'
        WHEN id_jns_keluar = '2' THEN 'Mutasi'
        WHEN id_jns_keluar = '3' THEN 'Drop Out'
        WHEN id_jns_keluar = '4' THEN 'Keluar'
        WHEN id_jns_keluar = '5' THEN 'Wafat'
        WHEN id_jns_keluar = '6' THEN 'Hilang'
        WHEN id_jns_keluar = '7' THEN 'Mengundurkan Diri'
        WHEN id_jns_keluar IS NOT NULL THEN 'Non-Aktif'
        WHEN id_stat_mhs = 'A' THEN 'Aktif'
        WHEN id_stat_mhs = 'C' THEN 'Cuti'
        WHEN id_stat_mhs = 'N' THEN 'Non-Aktif'
        ELSE 'Aktif'
    END
WHERE soft_delete = 0 AND status_mahasiswa IS NULL;
"

# 2d. Verify migrasi sukses
sqlcmd -S 192.168.123.119 -U mizarzulmi -P '<password>' -d pdut -Q "
SELECT 'siakadu.mahasiswa' AS tabel, COUNT(*) AS total,
       SUM(CASE WHEN soft_delete=0 THEN 1 ELSE 0 END) AS aktif_count
FROM siakadu.mahasiswa;
SELECT status_mahasiswa, COUNT(*) AS jml FROM siakadu.mahasiswa
WHERE soft_delete=0 GROUP BY status_mahasiswa ORDER BY jml DESC;
"
```

#### Opsi B: DB Fresh / Reset Total (HANYA di staging — tidak disarankan prod)

```bash
cd /var/www/my-unila/data-model/script/sqlserver/siakadu

# 2a. Drop semua siakadu lama
sqlcmd -S 192.168.123.119 -U mizarzulmi -P '<password>' -d <db_staging> \
       -i siakadu_drop_all.sql

# 2b. Fresh deploy (sekali jalan, self-contained)
sqlcmd -S 192.168.123.119 -U mizarzulmi -P '<password>' -d <db_staging> \
       -i siakadu_schema_v2.0_fresh.sql
```

> **Verifikasi**: setelah deploy, pastikan tabel `siakadu.mahasiswa`, `siakadu.keluarga_mhs`, `siakadu.periode_wisuda`, `siakadu.wisuda_mahasiswa` ada + kolom `nim` di `kuliah_mhs` & `spp_mhs`.

---

### 🔧 STEP 3 — Rebuild Backend Services

#### 3a. VM3 — myunila-service (PALING PENTING — inti perubahan)

```bash
ssh mybackend2@192.168.120.43
cd /var/www/my-unila/deployment/production/vm3-backend2

# Rebuild pakai script yang ada
./scripts/rebuild-service.sh myunila

# Wait sampai healthy (~2-3 menit)
docker logs -f myunila-service-prod 2>&1 | head -30
# Ctrl+C kalau sudah lihat: "🚀 Starting MyUnila Service..."

# Verify healthy
docker ps --filter "name=myunila-service" --format "{{.Names}} {{.Status}}"
# Harus: Up X minutes (healthy)
exit
```

#### 3b. VM6 — replica myunila-service

```bash
ssh mybackend2@192.168.120.46
cd /var/www/my-unila/deployment/production/vm6-replica
./scripts/rebuild-service.sh myunila
exit
```

#### 3c. VM2 — auth-service (defensive token fix)

```bash
ssh mybackend1@192.168.120.42
cd /var/www/my-unila/deployment/production/vm2-backend1
./scripts/rebuild-service.sh auth
exit
```

#### 3d. VM8 — simbak-service (query ke siakadu.mahasiswa v2)

```bash
ssh mysimbak@192.168.120.48
cd /var/www/my-unila/deployment/production/vm8-simbak
./scripts/rebuild-service.sh simbak
exit
```

---

### 🧪 STEP 4 — Validasi Backend API

Dari VM1 atau mesin lokal yang bisa akses Kong:

```bash
# Base URL Kong gateway
KONG=http://192.168.120.41:9800

# 1. Mahasiswa stats
curl -s $KONG/myunila-service/api/v1/siakadu/mahasiswa/stats
# Expected: {"data":{"total_mahasiswa":...,"total_aktif":...}}

# 2. Mahasiswa list + filter
curl -s "$KONG/myunila-service/api/v1/siakadu/mahasiswa?page=1&limit=3"
# Expected: data[] dengan nim, nama, nm_prodi, status_mahasiswa

# 3. Mahasiswa filters
curl -s $KONG/myunila-service/api/v1/siakadu/mahasiswa/filters | head -100

# 4. Wisuda (module baru)
curl -s $KONG/myunila-service/api/v1/siakadu/wisuda/stats
curl -s $KONG/myunila-service/api/v1/siakadu/wisuda/filters

# 5. Kurikulum / Matakuliah / Kelas
curl -s "$KONG/myunila-service/api/v1/siakadu/akademik/kurikulum/filters" | head -80
curl -s "$KONG/myunila-service/api/v1/siakadu/akademik/matakuliah/stats"
curl -s "$KONG/myunila-service/api/v1/siakadu/akademik/kelas/filters" | head -80

# 6. Nilai (KHS, Transkrip, Kuliah)
curl -s "$KONG/myunila-service/api/v1/siakadu/nilai/khs/stats"
curl -s "$KONG/myunila-service/api/v1/siakadu/nilai/kuliah/filters" | head -80
curl -s "$KONG/myunila-service/api/v1/siakadu/nilai/transkrip/stats"
```

**Semua harus return `"success":true`**. Kalau ada `"failed to count"` / `"Invalid object name"` → schema belum deploy lengkap, balik ke STEP 2.

---

### 🎨 STEP 5 — Rebuild Frontend (VM1)

```bash
ssh myfrontend@192.168.120.41
cd /var/www/my-unila/deployment/production/vm1-frontend-kong

# Rebuild pakai quick-rebuild atau deploy script
./scripts/quick-rebuild-frontend.sh
# Atau: ./scripts/deploy.sh

# Monitor build (takes 8-15 menit karena Next.js build production)
docker logs -f myunila-frontend-prod | grep -iE "compiled|error|warning" | head -30

exit
```

**Catatan:** Build akan gagal kalau syntax error. Commit 7d567d0cc sudah fix 2 duplicate `return (` di monitoring modal — harusnya sukses.

---

### 🌐 STEP 6 — Validasi UI

Akses `https://my.unila.ac.id/dashboard/integrator/siakadu/*`:

| URL | Cek |
|-----|-----|
| `/mahasiswa` | Stats 4 kartu terisi angka; filter prodi/angkatan/status; sort klik header kolom |
| `/status-kuliah` | Filter semester/prodi/angkatan; format semester "2024/2025 Ganjil" |
| `/kurikulum` | Kolom Jenis + Prodi terisi; filter dropdown; stats non-zero |
| `/mata-kuliah` | Kolom Jenis + Prodi terisi; filter dropdown |
| `/kelas` | Kolom Prodi terisi; filter semester/prodi |
| `/krs-khs` | Kedua tab (KRS + KHS) punya filter lengkap |
| `/transkrip` | Data tampil (NIM mungkin kosong untuk data lama — expected) |
| `/wisuda` | Tombol "Sinkronisasi Data"; filter Periode/Prodi/Angkatan |
| `/pegawai` | Tombol sync; filter Jenis Tenaga/Fakultas/Status |

---

### 🔄 STEP 7 — Sync Data SIAKADU (via UI)

Urut berikut — dependency: akademik referensi → mahasiswa → nilai → wisuda.

1. **Akademik** (klik "Sinkronisasi Data" di masing-masing halaman):
   - `/siakadu/mata-kuliah` → sync (~5 menit)
   - `/siakadu/kurikulum` → sync (~10 menit)
   - `/siakadu/kelas` → sync (~5 menit)

2. **Mahasiswa** (paling berat — ~1 jam):
   - `/siakadu/mahasiswa` → "Sinkronisasi Data" (ini sync-full: list + detail enrichment)

3. **Nilai**:
   - `/siakadu/krs-khs` (tab KHS) → sync
   - `/siakadu/transkrip` → sync
   - `/siakadu/status-kuliah` → sync

4. **Wisuda**:
   - `/siakadu/wisuda` → sync periode + peserta (~15 menit)

> Rate limit 429 otomatis di-retry backend. Kalau sync gagal tengah jalan, klik ulang — operasinya idempotent.

---

## 🚨 ROLLBACK (jika ada masalah kritis)

### Restore DB

```sql
USE master;
ALTER DATABASE pdut SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
RESTORE DATABASE pdut FROM DISK = 'D:\Backup\pdut_pre-siakadu-v2_2026-04-21.bak'
    WITH REPLACE, STATS = 10;
ALTER DATABASE pdut SET MULTI_USER;
```

### Revert code

```bash
# Cari commit sebelum siakadu v2 deploy
git log --oneline | grep "perf(deploy): tune-up"
# Output: 467958637

# Checkout ke commit itu dan rebuild
ssh mybackend2@192.168.120.43
cd /var/www/my-unila
git checkout 467958637
./deployment/production/vm3-backend2/scripts/rebuild-service.sh myunila
# Ulang untuk VM6, VM2, VM8, VM1 yang sudah di-deploy
```

---

## ✅ Pre-Deploy Checklist

- [ ] Backup DB `pdut` di SQL Server 119 selesai
- [ ] Window maintenance diumumkan (~30 menit)
- [ ] Semua VM bisa git pull (SSH key ok, network ok)
- [ ] Tim SIMBAK di-notif (dependency ke siakadu.mahasiswa)
- [ ] Rollback plan siap
- [ ] Monitoring dashboard ready: `https://my.unila.ac.id/dashboard/integrator/monitoring`

## ✅ Post-Deploy Checklist

- [ ] STEP 4 validasi API semua return success
- [ ] STEP 6 validasi UI semua halaman siakadu normal
- [ ] Test login + token (auth-service defensive fix works)
- [ ] Test SI MBAK load data mahasiswa (simbak query v2)
- [ ] Sync siakadu pertama sukses (minimal 1 modul)
- [ ] Monitoring dashboard tidak ada error flood

---

## 📞 Troubleshooting Cepat

| Gejala | Kemungkinan Cause | Fix |
|--------|-------------------|-----|
| Backend return "siakadu.reg_pd table not found" | v1 table belum di-drop atau kode lama | Verify STEP 2 sukses; pastikan build myunila-service dari commit terbaru |
| Backend return "siakadu.mahasiswa table not found" | Schema v2 belum di-deploy | Jalankan STEP 2a (mahasiswa schema) |
| Frontend error "Expression expected" di build | Syntax error | Pastikan commit `7d567d0cc` ter-pull |
| Filter prodi kosong | mapping_unit belum ter-populate | Sync mahasiswa dulu (akan auto-populate mapping) |
| Nilai/transkrip NIM kosong | Data lama orphaned UUIDs | Re-sync transkrip setelah mahasiswa sync selesai |
| Sync 429 banyak | Rate limit API siakadu | Normal, sudah auto-retry. Tunggu saja. |

---

**Good luck dengan deploy! 🚀**

Kalau stuck di step mana pun, sebut nomor stepnya, saya bantu debug.
