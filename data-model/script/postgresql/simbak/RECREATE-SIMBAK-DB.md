# SIMBAK Database — Recreate / Upgrade Guide

**Updated:** 2026-05-18
**Target environment:** VM8 (`192.168.120.48`), PostgreSQL 16, container `myunila-simbak-postgres`

## File inventory

| File | Tipe | Catatan |
|------|------|---------|
| `01-simbak_v1.0_fresh.sql` | Fresh schema v1.0 | Versi awal April 2026 |
| `06-simbak_v1.1_fresh.sql` | Fresh schema v1.1 | Versi Mei 5 (v1.0 + alter 03-06) |
| `20-simbak_v1.2_fresh.sql` | **Fresh schema v1.2 LATEST** | **Versi 2026-05-13 — gabungan v1.1 + semua alter 07-19** |
| `02-simbak-seed-staging.sql` | Seed data ref/master | 10 jenis layanan, persyaratan, tahapan, kategori cuti/undur, dll |
| `03-fix-trigger.sql` | One-off fix | Already merged ke v1.1+ |
| `04-update-pm-alih-tahapan.sql` | One-off update | Already merged ke v1.1+ |
| `05-alter-ktw-exclude.sql` | One-off alter | Already merged ke v1.1+ |
| `07-alter-add-smt-akhir-cuti.sql` | Alter (additive) | + layanan.pengajuan.id_smt_akhir_cuti |
| `07-alter-batch-add-fakultas.sql` | Alter (additive) | + batch.batch_penetapan.id_fakultas/nm_fakultas + index |
| `08-alter-add-kategori-cuti.sql` | Alter + seed | ref.kategori_cuti (4 seed) + FK ke pengajuan |
| `09-alter-dokumen-add-nomor-tgl.sql` | Alter (additive) | + dokumen_pengajuan.nomor_dokumen, tgl_dokumen |
| `10-alter-data-pemohon-eksternal.sql` | Alter (additive) | + data_pemohon.nm_jenjang_asal, nm_prodi_asal, email_pemohon, no_hp_pemohon |
| `11-update-pm-alih-tahapan-pejabat.sql` | Update data | Restruktur tahapan PM-ALIH 6 tahap |
| `12-add-kategori-undur.sql` | Alter + seed | ref.kategori_undur (2 seed) + FK + nm_pt_tujuan |
| `13-add-ketentuan-layanan.sql` | Alter + table | + ref.ketentuan_layanan (kriteria akademik dinamis) |
| `14-add-surat-pengganti-fields.sql` | Alter (additive) | + nomor_surat_polisi, tgl_surat_polisi, nomor_surat_ket_aktif, tgl_surat_ket_aktif |
| `15-add-sk-cuti-fields-and-seed.sql` | Alter + seed | + nomor_sk_cuti, tgl_sk_cuti (SK-HERREG) |
| `16-add-pejabat-tahapan-surat-mandiri.sql` | Update tahapan | SK-* dari 3 tahap jadi 4 tahap (+ Kabag) |
| `17-unify-pejabat-to-kabag.sql` | Unifikasi role | Konsolidasi peran ke 'kabag' |
| `18-add-pengaturan-pejabat.sql` | Alter + seed | Pengaturan pejabat per tahapan |
| `19-add-template-surat-body-html.sql` | Alter (additive) | + template_surat.body_html (HTML template editor) |

## Opsi A: FRESH RECREATE (DESTRUCTIVE — semua data transaksi hilang)

⚠️ **Hanya untuk staging / fresh install / DB belum punya data transaksi penting.**

```bash
# 1. SSH ke VM8
ssh mybak@192.168.120.48
cd /var/www/my-unila

# 2. Pull latest
git pull origin master

# 3. Pastikan service simbak DOWN dulu (supaya tidak ada session aktif ke DB)
cd deployment/production/vm8-simbak
docker compose -f services/simbak/docker-compose.yml --env-file .env stop simbak-service simbak-nginx

# 4. Drop + recreate DB (HATI-HATI — data hilang!)
docker exec -it myunila-simbak-postgres psql -U myunila_bak -d postgres -c "DROP DATABASE IF EXISTS simbak;"
docker exec -it myunila-simbak-postgres psql -U myunila_bak -d postgres -c "CREATE DATABASE simbak;"

# 5. Apply fresh schema v1.2
docker exec -i myunila-simbak-postgres psql -U myunila_bak -d simbak \
    < /var/www/my-unila/data-model/script/postgresql/simbak/20-simbak_v1.2_fresh.sql

# 6. Apply seed staging (master ref data: jenis_layanan, persyaratan, tahapan, dll)
docker exec -i myunila-simbak-postgres psql -U myunila_bak -d simbak \
    < /var/www/my-unila/data-model/script/postgresql/simbak/02-simbak-seed-staging.sql

# 7. Bring service back up
docker compose -f services/simbak/docker-compose.yml --env-file .env up -d simbak-service simbak-nginx

# 8. Health check
sleep 5
curl http://localhost:9002/api/health
```

## Opsi B: INCREMENTAL ALTER (SAFE — pertahankan data transaksi)

✅ **Untuk production yang sudah punya data pengajuan mahasiswa.**

Asumsi: production saat ini sudah pada v1.1 (atau di antara 07-19). Apply alter yang belum.

```bash
# 1. SSH + pull
ssh mybak@192.168.120.48
cd /var/www/my-unila
git pull origin master

# 2. Backup dulu (CRITICAL)
docker exec myunila-simbak-postgres pg_dump -U myunila_bak -d simbak \
    -F c -f /tmp/simbak_backup_$(date +%Y%m%d_%H%M%S).dump
docker cp myunila-simbak-postgres:/tmp/simbak_backup_*.dump ./backups/

# 3. Apply alter 07-19 berurutan (semua punya IF NOT EXISTS / idempotent)
SCRIPT_DIR=/var/www/my-unila/data-model/script/postgresql/simbak
for f in 07-alter-add-smt-akhir-cuti.sql \
         07-alter-batch-add-fakultas.sql \
         08-alter-add-kategori-cuti.sql \
         09-alter-dokumen-add-nomor-tgl.sql \
         10-alter-data-pemohon-eksternal.sql \
         11-update-pm-alih-tahapan-pejabat.sql \
         12-add-kategori-undur.sql \
         13-add-ketentuan-layanan.sql \
         14-add-surat-pengganti-fields.sql \
         15-add-sk-cuti-fields-and-seed.sql \
         16-add-pejabat-tahapan-surat-mandiri.sql \
         17-unify-pejabat-to-kabag.sql \
         18-add-pengaturan-pejabat.sql \
         19-add-template-surat-body-html.sql; do
    echo "▶ Applying $f"
    docker exec -i myunila-simbak-postgres psql -U myunila_bak -d simbak < "$SCRIPT_DIR/$f" || {
        echo "❌ Failed at $f — stopping. Inspect error + check rollback dari backup."
        exit 1
    }
done

# 4. Restart service (clear opcache + ensure schema cache fresh)
cd deployment/production/vm8-simbak
docker compose -f services/simbak/docker-compose.yml --env-file .env restart simbak-service

# 5. Verify
curl http://localhost:9002/api/health
```

## Rollback (kalau perlu)

```bash
# Restore dari backup dump (Opsi B)
docker exec -i myunila-simbak-postgres pg_restore -U myunila_bak -d simbak -c \
    < /var/www/my-unila/backups/simbak_backup_<timestamp>.dump
```

## Default credentials (development/staging)

- DB user: `myunila_bak`
- DB name: `simbak`
- DB host (intra-container): `myunila-simbak-postgres`
- DB port: `5432`

Production password di `vm8-simbak/.env` → `PG_PASSWORD`.
