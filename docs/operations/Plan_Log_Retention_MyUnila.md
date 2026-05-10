# Plan Log Retention & Backup — MyUnila

**Tanggal:** 2026-05-07
**Status:** PLAN (belum diimplementasikan)
**Scope:** Postgres `log.*` schema (simbak, si-prestasi, si-kkn) + SQL Server `pdut` tx log

---

## 1. Konteks

Audit trail aplikasi disimpan di tabel `log.aktivitas_data` (auto-populated trigger) dan `log.jejak_audit` (manual) di setiap database Laravel service (PostgreSQL native VM5/VM8). Tanpa retention policy, tabel ini bisa tumbuh:

- Skenario sedang: ~150 MB / bulan
- Skenario besar (KKN/SIMBAK puncak): ~1.5 GB / bulan
- 1 tahun: 2-20 GB

Ditambah SQL Server `pdut` transaction log (`.ldf`) yang juga butuh manajemen tergantung recovery model.

---

## 2. Tahap Implementasi

### Phase 1 — Quick Wins (target: 1 hari kerja)

**1.1 Setup retention 90 hari + archive ke MinIO**

Komponen:
- Shell script `scripts/ops/prune-postgres-log.sh` — query size, COPY ke .csv.gz, DELETE, VACUUM
- Cron entry mingguan (Sabtu 02:00 WIB) di VM5 + VM8
- MinIO bucket prefix: `myunila-storage/archive/log/{service}/{yyyy-mm-dd}.csv.gz`
- Naming convention: `{service}_{schema}_{table}_{tanggal}.csv.gz`

DB yang di-cover:
- VM5: `simbak`, `si_prestasi`, `sikkn_myunila`
- VM8 (production nanti): same 3 DB

Pseudocode:
```bash
for db in simbak si_prestasi sikkn_myunila; do
  for table in log.aktivitas_data log.jejak_audit; do
    psql -d $db -c "COPY (SELECT * FROM $table WHERE created_at < NOW()-INTERVAL '90 days') TO STDOUT" \
      | gzip > /tmp/archive_${db}_${table//./_}_$(date +%Y%m%d).csv.gz
    mc cp /tmp/archive_*.csv.gz minio/myunila-storage/archive/log/$db/
    psql -d $db -c "DELETE FROM $table WHERE created_at < NOW()-INTERVAL '90 days'; VACUUM ANALYZE $table;"
  done
done
```

**1.2 SQL Server pdut tx log policy**

Steps:
1. Check current state:
   ```sql
   SELECT name, recovery_model_desc, log_reuse_wait_desc FROM sys.databases WHERE name='pdut';
   DBCC SQLPERF(LOGSPACE);
   ```
2. Decision tree:
   - Kalau **SIMPLE** dan size stabil → no action needed
   - Kalau **SIMPLE** tapi log bengkak → `DBCC SHRINKFILE` (one-shot)
   - Kalau **FULL** dan ada tx log backup job → no action
   - Kalau **FULL** tanpa backup job → switch ke SIMPLE (kecuali ada compliance need PITR)
3. Document keputusan di `docs/operations/sql-server-recovery-model.md`

**1.3 Monitoring size**

- Query weekly via cron: list top 10 largest tables di schema `log` per DB
- Alert via Telegram bot kalau total size > 5 GB
- Endpoint: kirim ke chat ID `1995650253` (admin)

### Phase 2 — Partitioning (target: 1-2 minggu, low-priority)

**2.1 Convert log.aktivitas_data → partitioned by month**

Done sekali untuk masing-masing DB. Setelah itu pruning = `DROP TABLE log.aktivitas_data_YYYY_MM` (instan, tanpa bloat seperti DELETE).

Steps:
```sql
-- 1. Rename existing
ALTER TABLE log.aktivitas_data RENAME TO aktivitas_data_old;

-- 2. Create partitioned parent
CREATE TABLE log.aktivitas_data (LIKE log.aktivitas_data_old INCLUDING ALL)
PARTITION BY RANGE (created_at);

-- 3. Backfill: create monthly partitions for last 6 months + future 6 months
DO $$
DECLARE m DATE;
BEGIN
  FOR m IN SELECT generate_series(date_trunc('month', NOW() - INTERVAL '6 months'),
                                   date_trunc('month', NOW() + INTERVAL '6 months'),
                                   '1 month'::interval)::date LOOP
    EXECUTE format('CREATE TABLE log.aktivitas_data_%s PARTITION OF log.aktivitas_data
                    FOR VALUES FROM (%L) TO (%L)',
      to_char(m, 'YYYY_MM'), m, m + INTERVAL '1 month');
  END LOOP;
END $$;

-- 4. Move data
INSERT INTO log.aktivitas_data SELECT * FROM log.aktivitas_data_old;
DROP TABLE log.aktivitas_data_old;
```

**2.2 Auto-create future partitions**

Cron monthly (28th of each month):
```sql
CREATE TABLE log.aktivitas_data_YYYY_MM PARTITION OF log.aktivitas_data
  FOR VALUES FROM ('YYYY-MM-01') TO ('YYYY-(MM+1)-01');
```

**2.3 Auto-drop old partitions**

Bagian dari prune script Phase 1.1 — gantikan COPY+DELETE dengan:
```sql
ALTER TABLE log.aktivitas_data DETACH PARTITION log.aktivitas_data_2025_01;
-- Backup detached partition ke MinIO sebagai dump-nya
DROP TABLE log.aktivitas_data_2025_01;
```

### Phase 3 — Centralized Logging (target: bulan depan, opsional)

Kalau service nambah banyak (>5 service Laravel), pertimbangkan centralized:

- Loki + Promtail (sudah ada di staging) untuk container log
- Khusus audit trail: stream `log.aktivitas_data` ke OpenSearch / Elasticsearch via Logstash
- Retention di Loki: 30 hari hot, archive ke S3
- Dashboard Grafana: pencarian audit trail cross-service

---

## 3. Estimasi Effort

| Phase | Item | Effort | Dependencies |
|---|---|---|---|
| 1.1 | Shell script + cron prune+archive | 4 jam | MinIO mc client di VM, akses MinIO bucket |
| 1.2 | SQL Server recovery model decision | 1 jam | Akses DBA SQL Server |
| 1.3 | Monitoring + Telegram alert | 2 jam | Telegram bot token (sudah ada) |
| 2.1 | Convert ke partitioned table | 4 jam per DB | Maintenance window 30 menit per DB |
| 2.2 | Auto-create monthly partition | 2 jam | Phase 2.1 done |
| 2.3 | Auto-drop old partition | 1 jam | Phase 2.1 + Phase 1.1 done |
| 3 | Centralized logging | 16+ jam | Bisa nanti, kalau service > 5 |

**Total Phase 1: ~7 jam (1 hari kerja).**
**Total Phase 1+2: ~20 jam (3 hari kerja).**

---

## 4. Decision Points (perlu konfirmasi sebelum implementasi)

1. **Retention period**: 90 hari (saran) atau lain? Pertimbangan: regulasi audit Unila biasanya 1-2 tahun, tapi data lama bisa di-archive (gak hapus).
2. **Archive destination**: MinIO `myunila-storage` bucket (saran) atau external (Google Drive Unila, dll)?
3. **SQL Server recovery model**: SIMPLE (saran, simpel) atau FULL+tx log backup (compliance)?
4. **Schedule prune**: Sabtu 02:00 WIB (saran, off-hour) atau lain?
5. **Alert threshold**: 5 GB total log per DB (saran) atau angka lain?
6. **Telegram alert**: kirim ke admin (mizarjul) saja atau ada tim ops lain?

---

## 5. Risk & Mitigation

| Risk | Severity | Mitigation |
|---|---|---|
| Prune accidentally hapus data masih dipakai | High | DELETE dgn WHERE pakai created_at, NEVER DROP TABLE tanpa rename dulu |
| Archive MinIO penuh | Medium | Lifecycle policy di MinIO bucket: archive > 1 tahun → delete OR move to glacier |
| Cron gak jalan diam-diam (silent failure) | Medium | Wrap script dgn alert kalau exit code != 0 |
| VACUUM lock tabel saat traffic tinggi | Low | Pakai VACUUM (non-FULL), schedule weekend off-hour |
| Tx log backup gagal → log full → DB read-only | High (FULL only) | Monitoring + alert SQL Server `log_reuse_wait_desc` setiap 5 menit |

---

## 6. Next Action

Setelah konfirmasi decision points di Section 4, mulai implementasi Phase 1.1 (~4 jam).

Implementasi tracking:
- [ ] Phase 1.1 — Prune + archive script
- [ ] Phase 1.2 — SQL Server recovery decision
- [ ] Phase 1.3 — Monitoring + alert
- [ ] Phase 2.1 — Partitioning (per DB)
- [ ] Phase 2.2 — Auto-create partition
- [ ] Phase 2.3 — Auto-drop partition

---

*Doc ini di-versioning di repo. Update saat implementasi atau decision berubah.*
