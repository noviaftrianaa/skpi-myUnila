# Deploy Production — SIAKADU v2.0 (20 April 2026)

Paket update: modul SIAKADU refactor besar + modul baru wisuda, filter/sort server-side, UI konsisten. Target: **VM5 staging (pdut_staging)** kemudian **VM1 production (pdut)** setelah validasi.

---

## Ringkasan Perubahan

| Layer | Modul | Perubahan |
|-------|-------|-----------|
| DB | `siakadu.mahasiswa` | **Tabel baru** (flat, PK nim, 130+ field) — menggantikan `reg_pd` + `peserta_didik` |
| DB | `siakadu.keluarga_mhs` | **Tabel baru** |
| DB | `siakadu.kuliah_mhs`, `siakadu.spp_mhs` | **Alter** — tambah kolom `nim` |
| DB | `siakadu.reg_pd`, `siakadu.peserta_didik` | **Dihapus** setelah migrasi data |
| Backend | `myunila-service/apps/siakadu/mahasiswa` | Rewrite — single-table upsert, detail enrichment, sync-full, filter/sort |
| Backend | `myunila-service/apps/siakadu/akademik` | Filter/sort + endpoint `/stats` & `/filters` untuk kurikulum/matakuliah/kelas |
| Backend | `myunila-service/apps/siakadu/nilai` | Ganti JOIN `reg_pd`/`peserta_didik` ke `mahasiswa` + kuliah_mhs bridge |
| Backend | `myunila-service/apps/siakadu/wisuda` | **Module baru** — sync periode & peserta wisuda dari API siakadu |
| Frontend | `dashboard/integrator/siakadu/*` | Filter bar, server-side sort, stats live, UI konsisten pure Tailwind |
| Frontend | `dashboard/monitoring/{keywords,sites}` | Fix syntax duplikat `return (` yang blokir next.js build |
| Services lain | `auth-service` | Defensive try/catch di `TokenService::validateToken` |
| Services lain | `simbak-service` | `PdutRepository` pakai query `siakadu.mahasiswa` v2 |

---

## STEP 1 — Backup DB

Sebelum alter, **backup database production**:

```sql
-- Via SSMS atau sqlcmd di server 119:
BACKUP DATABASE pdut
TO DISK = 'D:\Backup\pdut_pre-v2-siakadu_2026-04-20.bak'
WITH COMPRESSION, STATS = 10;
```

---

## STEP 2 — Deploy DB Schema (SQL Server 119)

Jalankan **urutan berikut** via SSMS di database `pdut` (production) **atau** `pdut_staging` (dry run dulu).

### 2a. Buat tabel baru `siakadu.mahasiswa` + `siakadu.keluarga_mhs`

File: `data-model/script/sqlserver/siakadu/siakadu_schema_v2.0_mahasiswa.sql`

**Yang dilakukan:**
- DROP & CREATE `siakadu.mahasiswa` (PK nim, 130 kolom)
- DROP & CREATE `siakadu.keluarga_mhs` (PK nim+status_keluarga, FK cascade ke mahasiswa)
- Create 12 index untuk query performance
- Create backward-compat view: `v_peserta_didik`, `v_reg_pd` (opsional, boleh di-drop nanti)

> **Catatan:** Script ini `DROP TABLE IF EXISTS` untuk `mahasiswa` dan `keluarga_mhs`. Di production yang belum pernah ada tabel ini = aman. Jika sudah ada (dari deploy sebelumnya), data akan **hilang** — pastikan hanya dijalankan sekali.

### 2b. Migrasi data dari v1 (peserta_didik + reg_pd → mahasiswa)

File: `data-model/script/sqlserver/siakadu/siakadu_migrate_v1_to_v2.sql`

**Yang dilakukan:**
- INSERT ke `siakadu.mahasiswa` dari JOIN `siakadu.peserta_didik` + `siakadu.reg_pd` (lewatkan yg `soft_delete=1`)
- INSERT data keluarga (Ayah/Ibu/Wali) ke `siakadu.keluarga_mhs`
- ALTER TABLE `siakadu.kuliah_mhs` ADD COLUMN `nim` + populate dari mapping
- ALTER TABLE `siakadu.spp_mhs` ADD COLUMN `nim` + populate
- Populate `id_jenj_didik` dari `pdrd.sms`
- Populate denormalized `nm_prodi`, `nm_fakultas`, `status_mahasiswa`, `nama_agama`

Output terakhir: laporan jumlah row di tiap tabel.

### 2c. Backfill status_mahasiswa & id_jns_keluar dari `pdrd.reg_pd`

> **Tidak ada file SQL terpisah — jalankan via sqlcmd atau SSMS:**

```sql
-- 1. Backfill id_jns_keluar dari pdrd.reg_pd
UPDATE m SET
    m.id_jns_keluar = rp.id_jns_keluar,
    m.tgl_keluar = rp.tgl_keluar,
    m.ket_keluar = rp.ket
FROM siakadu.mahasiswa m
INNER JOIN pdrd.reg_pd rp ON rp.id_reg_pd = m.id_reg_pd AND rp.soft_delete = 0
WHERE m.id_jns_keluar IS NULL AND rp.id_jns_keluar IS NOT NULL;

-- 2. Backfill id_stat_mhs dari pdrd.peserta_didik
UPDATE m SET m.id_stat_mhs = pd.id_stat_mhs
FROM siakadu.mahasiswa m
INNER JOIN pdrd.peserta_didik pd ON pd.id_pd = m.id_pd AND pd.soft_delete = 0
WHERE m.id_stat_mhs IS NULL AND pd.id_stat_mhs IS NOT NULL;

-- 3. Populate status_mahasiswa
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
```

### 2d. (Opsional) Backfill `mapping_unit` untuk prodi yang belum termapping

Jika ada mahasiswa dengan `id_sms IS NULL` padahal `id_unit` terisi, insert mapping via lookup NIM di `pdrd.reg_pd`:

```sql
-- Insert mapping untuk id_unit yang belum ada di mapping_unit
WITH ranked AS (
    SELECT
        m.id_unit,
        CAST(rp.id_sms AS VARCHAR(36)) AS id_sms,
        ROW_NUMBER() OVER (PARTITION BY m.id_unit ORDER BY COUNT(*) DESC) AS rn,
        MAX(ISNULL(ru.nm_unit, 'Unknown')) AS nm_unit
    FROM siakadu.mahasiswa m
    INNER JOIN pdrd.reg_pd rp ON rp.nipd = m.nim AND rp.soft_delete = 0 AND rp.id_sms IS NOT NULL
    LEFT JOIN siakadu.ref_unit ru ON ru.id_unit = m.id_unit
    WHERE m.id_sms IS NULL AND m.id_unit IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM siakadu.mapping_unit mu WHERE mu.kode_siakad = m.id_unit)
    GROUP BY m.id_unit, CAST(rp.id_sms AS VARCHAR(36))
)
INSERT INTO siakadu.mapping_unit (kode_siakad, id_sms, nm_unit)
SELECT id_unit, CONVERT(uniqueidentifier, id_sms), nm_unit
FROM ranked WHERE rn = 1;

-- Backfill id_sms + id_jenj_didik di mahasiswa
UPDATE m SET m.id_sms = mu.id_sms
FROM siakadu.mahasiswa m INNER JOIN siakadu.mapping_unit mu ON mu.kode_siakad = m.id_unit
WHERE m.id_sms IS NULL;

UPDATE m SET m.id_jenj_didik = sms.id_jenj_didik
FROM siakadu.mahasiswa m INNER JOIN pdrd.sms sms ON sms.id_sms = m.id_sms
WHERE m.id_jenj_didik IS NULL AND m.id_sms IS NOT NULL;
```

### 2e. Drop tabel v1 (`reg_pd` + `peserta_didik`) — **OPSIONAL, setelah validasi**

> **JANGAN drop di production sampai staging + aplikasi terbukti jalan.**

```sql
-- Drop FK dulu
ALTER TABLE siakadu.anggota_akt_mhs DROP CONSTRAINT fk_anggota_akt_mhs_reg_pd;
ALTER TABLE siakadu.spp_mhs DROP CONSTRAINT fk_spp_mhs_reg_pd;
ALTER TABLE siakadu.reg_pd DROP CONSTRAINT fk_reg_pd_peserta_didik;
ALTER TABLE siakadu.peserta_didik DROP CONSTRAINT fk_peserta_didik_status_mahasiswa;

-- Drop views backward-compat (sudah tidak dipakai)
DROP VIEW IF EXISTS siakadu.v_peserta_didik;
DROP VIEW IF EXISTS siakadu.v_reg_pd;

-- Drop tabel
DROP TABLE siakadu.reg_pd;
DROP TABLE siakadu.peserta_didik;
```

---

## STEP 3 — Deploy Backend (myunila-service)

Di VM1 production:

```bash
cd /var/www/my-unila
git pull origin master

cd deployment/production/vm1-production
./scripts/rebuild-service.sh myunila
# Tunggu sampai container healthy
docker logs -f myunila-service-prod | head -50
```

**Validasi endpoint baru** (via Kong):

```bash
curl -s https://my.unila.ac.id/myunila-service/api/v1/siakadu/mahasiswa/stats
curl -s https://my.unila.ac.id/myunila-service/api/v1/siakadu/mahasiswa/filters | head -100
curl -s https://my.unila.ac.id/myunila-service/api/v1/siakadu/wisuda/stats
curl -s "https://my.unila.ac.id/myunila-service/api/v1/siakadu/akademik/kurikulum/filters" | head -100
```

---

## STEP 4 — Deploy auth-service & simbak-service

```bash
cd /var/www/my-unila/deployment/production/vm1-production
./scripts/rebuild-service.sh auth
./scripts/rebuild-service.sh simbak
```

**Validasi:**
- Login via portal my.unila.ac.id → token dikeluarkan normal
- SI MBAK pemohon → load data mahasiswa via NIM → harus tampil (query ke `siakadu.mahasiswa`)

---

## STEP 5 — Deploy Frontend (Next.js)

```bash
cd /var/www/my-unila/deployment/production/vm1-production
./scripts/rebuild-service.sh frontend
```

Monitor log build — kadang membutuhkan 8-15 menit. Build akan gagal kalau ada syntax error (commit 7 sudah fix 2 duplikat `return (` di monitoring modal).

**Validasi UI** di `https://my.unila.ac.id/dashboard/integrator/siakadu/*`:
- mahasiswa, status-kuliah, kurikulum, mata-kuliah, kelas, krs-khs, transkrip, wisuda, pegawai
- Filter bar tampil, server-side sort berfungsi, stats card terisi angka (bukan 0)

---

## STEP 6 — Sync Data SIAKADU (via UI)

Setelah semua service up, **sync berurutan** (dari halaman masing-masing, tombol "Sinkronisasi Data"):

1. **Akademik** (dependencies lain butuh referensi prodi/mata-kuliah):
   - `/siakadu/mata-kuliah` → sync
   - `/siakadu/kurikulum` → sync
   - `/siakadu/kelas` → sync
2. **Mahasiswa**:
   - `/siakadu/mahasiswa` → klik "Sinkronisasi Data" (list + detail enrichment 2-pass, butuh ~1 jam untuk 111rb mahasiswa)
3. **Nilai**:
   - `/siakadu/krs-khs` (tab KHS) → sync
   - `/siakadu/transkrip` → sync
   - `/siakadu/status-kuliah` → sync
4. **Wisuda**:
   - `/siakadu/wisuda` → klik "Sinkronisasi Data" (periode + peserta per periode, rate-limit 300ms)
5. **Pegawai (SIKEP)** — sudah otomatis terupdate dari batch sync SIKEP harian

> Rate limit 429 akan otomatis di-retry oleh backend (backoff 2s/4s/8s). Jika banyak error di log, bisa re-run sync — sifatnya idempotent (upsert).

---

## STEP 7 — Rollback (jika perlu)

Restore backup DB:

```sql
USE master;
ALTER DATABASE pdut SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
RESTORE DATABASE pdut FROM DISK = 'D:\Backup\pdut_pre-v2-siakadu_2026-04-20.bak'
    WITH REPLACE, STATS = 10;
ALTER DATABASE pdut SET MULTI_USER;
```

Checkout backend ke commit sebelum deploy:

```bash
cd /var/www/my-unila
git log --oneline | head -15   # cari hash sebelum 08a9b77b8
git checkout <hash>
# rebuild myunila + auth + simbak + frontend
```

---

## Catatan Penting

1. **DB staging (pdut_staging)** sudah lewat step 2a–2e di development — jadi production tinggal jalankan urutan yang sama.
2. **VM5 staging** perlu update env `SQLSRV_DATABASE=pdut_staging` di backend env (sudah di-commit).
3. Backend `myunila-service` sekarang butuh tabel `siakadu.mahasiswa` ada — kalau tabel belum dibuat, request list/sync akan gagal dengan error "siakadu.mahasiswa table not found".
4. File `siakadu_drop_all.sql` di folder yang sama bisa dipakai untuk reset schema kalau mau deploy ulang dari nol (hati-hati — drop semua tabel siakadu).
5. Backward-compat view `v_peserta_didik` dan `v_reg_pd` ada di schema v2 — kalau ada service lama yang masih query `siakadu.peserta_didik` / `siakadu.reg_pd`, temporary bisa di-redirect ke view dengan rename (tidak direkomendasikan untuk jangka panjang).

---

## Checklist Pre-Deploy

- [ ] Backup `pdut` di server 119
- [ ] Coordinate dengan tim SIMBAK (dependency ke `siakadu.mahasiswa`)
- [ ] Window maintenance diumumkan (~30 menit downtime untuk DB alter + rebuild)
- [ ] Monitor dashboard di `https://my.unila.ac.id/dashboard/integrator/monitoring` siap
- [ ] Rollback plan siap
