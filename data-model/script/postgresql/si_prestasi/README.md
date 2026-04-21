# SI-Prestasi — Script SQL

Folder ini berisi semua skrip DDL dan seed untuk database **`si_prestasi`** (PostgreSQL 15+), salah satu database transaksi MyUnila yang digunakan oleh service `backend/si-prestasi-service/`.

SI-Prestasi adalah aplikasi pelaporan prestasi, sertifikasi, dan rekognisi mahasiswa Unila dengan integrasi ke API **SIMKATMAWA** (Kemdiktisaintek). Detail plan ada di [`../../../../docs/prestasi/`](../../../../docs/prestasi/).

## Daftar file

| File | Tujuan | Idempotent? |
|---|---|---|
| `si_prestasi_v1.0_fresh.sql` | Fresh install schema v1.0 (schemas + tables + indexes + comments) | ✅ pakai `CREATE * IF NOT EXISTS` |
| `si_prestasi_v1.0_seed.sql` | Seed referensi (level, kategori, peringkat, kelompok, bentuk, jenis_rekognisi, tipe_sync, setting.api_config) | ✅ pakai `ON CONFLICT DO NOTHING` |

Nanti kalau ada perubahan schema:
- `si_prestasi_v1.0_to_v1.1_alter.sql` — alter script
- `si_prestasi_v1.1_fresh.sql` — fresh install versi baru (kumulatif)

## Cara apply

### Fresh install (DB baru)

```bash
# 1. Bootstrap database + user (jalankan sebagai superuser postgres)
psql -U postgres -h <host> <<'SQL'
CREATE DATABASE si_prestasi;
CREATE USER myunila_prestasi WITH PASSWORD '<password>';
GRANT ALL PRIVILEGES ON DATABASE si_prestasi TO myunila_prestasi;
SQL

# 2. Apply DDL (sebagai user app atau superuser)
PGPASSWORD=<pass> psql -h <host> -U myunila_prestasi -d si_prestasi \
    -f si_prestasi_v1.0_fresh.sql

# 3. Apply seed referensi
PGPASSWORD=<pass> psql -h <host> -U myunila_prestasi -d si_prestasi \
    -f si_prestasi_v1.0_seed.sql
```

### Upgrade (dari v1.0 ke v1.1 — contoh)

```bash
PGPASSWORD=<pass> psql -h <host> -U myunila_prestasi -d si_prestasi \
    -f si_prestasi_v1.0_to_v1.1_alter.sql
```

## Konvensi schema

Mirror SIMBAK (`../simbak_v1.0_fresh.sql`) + mendukung referensi pdut:

- **Schemas:** `ref`, `prestasi`, `sync`, `setting`, `log` — tidak pakai `public`
- **PK:** `id_<tabel> UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **Nama:** `nm_<field>` VARCHAR
- **Tanggal:** `tgl_<field>` DATE / TIMESTAMP
- **Boolean:** `a_<field>` BOOLEAN (prefix `a_`)
- **Audit:** `id_creator UUID`, `id_updater UUID`, `created_at TIMESTAMP DEFAULT NOW()`, `updated_at TIMESTAMP DEFAULT NOW()`, `soft_delete BOOLEAN DEFAULT FALSE`
- **Index:** `idx_<tabel>_<kolom>`
- **Cross-DB pdut:** kolom suffix `_pdut` menyimpan ID / GUID dari SQL Server pdut tanpa FK fisik
  - `id_*_pdut UUID` untuk GUID pdut (uniqueidentifier)
  - `id_jenis_prestasi_pdut INT`, `id_tkt_prestasi_pdut INT`, `peringkat_pdut NUMERIC(1)` mirror tipe pdut
- **Comments:** `COMMENT ON TABLE` dan `COMMENT ON COLUMN` untuk setiap tabel

## Prasyarat

- PostgreSQL 15+ (gen_random_uuid() built-in, `JSONB`, `GENERATED ALWAYS`)
- Collation default `en_US.UTF-8` atau `id_ID.UTF-8`
- Tidak perlu extension tambahan (`uuid-ossp`, `pgcrypto` tidak wajib)

## Versioning policy

Setiap perubahan schema di produksi WAJIB:
1. Tulis di file baru (`*_alter.sql`), bukan edit file `*_fresh.sql` yang sudah ter-deploy
2. `*_fresh.sql` di-update untuk mencerminkan state final, dinaikkan minor version (`v1.0` → `v1.1`)
3. Alter script harus idempotent (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`)
4. Catat di changelog (di bawah) + commit message jelas

## Changelog

| Versi | Tanggal | Author | Ringkasan |
|---|---|---|---|
| v1.0 | 2026-04-19 | Dev team MyUnila | Fresh install — schemas ref/prestasi/sync/setting/log, 3 parent tables, polymorphic peserta, sync tracking, setting.api_config untuk kredensial eksternal |
| v1.0 | 2026-04-20 | Dev team MyUnila | Minor: tambah `id_reg_pd_pdut UUID` di `prestasi.peserta_mhs` (referensi registrasi semester PDDIKTI); + index partial untuk id_pd_pdut/id_reg_pd_pdut/id_sms_pdut; klarifikasi: TIDAK ada tabel master mahasiswa — pdut tetap source of truth, peserta_mhs hanya junction+cache |
| v1.0 | 2026-04-20 | Dev team MyUnila | Simplify: hapus `id_fakultas_pdut` + `nm_fakultas` dari `prestasi.peserta_mhs`. Fakultas derivable dari id_sms_pdut via hierarchy pdut.pdrd.sms (self-ref id_fak_unila / id_induk_sms, id_jns_sms=1). Parent tables (prestasi_mandiri/sertifikasi/rekognisi) tetap punya id_fakultas untuk RBAC ownership — konsep berbeda |
| v1.0 | 2026-04-20 | Dev team MyUnila | Simplify: hapus `id_pd_pdut` dari `prestasi.peserta_mhs`. id_pd derivable via pdrd.reg_pd.id_pd (FK NOT NULL). peserta_mhs final jadi 9 kolom: id_peserta_mhs, id_parent, parent_tipe, nim, nm_mahasiswa, id_reg_pd_pdut, id_sms_pdut, nm_prodi, created_at |
