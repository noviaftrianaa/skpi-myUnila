# Stack Decision — LOCKED: Identik dengan SIMBAK

**Keputusan:** SI-Prestasi pakai stack **identik** dengan `backend/simbak-service/` (locked oleh user 2026-04-19).

Tidak ada komparasi Laravel vs Go — sudah diputuskan.

---

## Stack identik SIMBAK

| Layer | Versi / Nilai |
|---|---|
| Container base | `php:8.2-fpm-alpine` (bukan `php:8.3-fpm`) |
| Framework | Laravel 11.31+ |
| PHP extensions | pdo_pgsql, sqlsrv (ODBC 18), redis, gd, zip, mbstring, bcmath, opcache |
| Queue worker | **Supervisor** di container yang sama dengan PHP-FPM (bukan Horizon container terpisah) |
| Primary DB | PostgreSQL 15+, dedicated `si_prestasi` database (host bareng simbak atau sendiri) |
| Secondary DB | SQL Server `pdut` via `DB::connection('sqlsrv')` — env prefix `SQLSRV_*` |
| Cache / Session / Queue | Redis shared — `CACHE_PREFIX=prestasi_` |
| Auth | JWT validation only (HS256), shared `JWT_SECRET` dari auth-service |
| File storage | Switchable `FILESYSTEM_DISK`: `siprestasi` (volume `/data/siprestasi-storage`) atau `minio` |
| Additional packages | `league/flysystem-aws-s3-v3:^3.0`, `predis/predis:^2.2` |
| Timezone | `TZ=Asia/Jakarta` |

---

## File-file yang harus dicopy & diadaptasi dari SIMBAK

Sebagai starter, copy lalu rename:

| SIMBAK | SI-Prestasi |
|---|---|
| `backend/simbak-service/Dockerfile` | `backend/si-prestasi-service/Dockerfile` |
| `backend/simbak-service/docker/supervisord.conf` | `backend/si-prestasi-service/docker/supervisord.conf` |
| `backend/simbak-service/app/Repositories/PdutRepository.php` | `backend/si-prestasi-service/app/Repositories/PdutRepository.php` (adapt query) |
| `backend/simbak-service/app/Repositories/BaseRepository.php` | copy as-is |
| `backend/simbak-service/config/database.php` | copy as-is (sqlsrv connection config) |
| `deployment/production/vm5-staging/services/backend-php/docker-compose.simbak.yml` | `deployment/production/vm{N}-si-prestasi/services/si-prestasi/docker-compose.yml` |
| `data-model/script/postgresql/simbak_v1.0_fresh.sql` | template → `si_prestasi_v1.0_fresh.sql` |

---

## Perbedaan tipis yang WAJIB di SI-Prestasi

| Hal | SIMBAK | SI-Prestasi |
|---|---|---|
| `APP_NAME` | `SIMBAK Service` | `SI-Prestasi Service` |
| `DB_DATABASE` | `simbak` | `si_prestasi` |
| `CACHE_PREFIX` | `bak_` | `prestasi_` |
| Container name | `myunila-simbak-staging` | `myunila-si-prestasi-staging` |
| Storage volume | `simbak-storage` | `siprestasi-storage` |
| Schemas PostgreSQL | `ref, layanan, batch, log` | `ref, prestasi, sync, log` |
| Repository domain | `Layanan`, `Batch` | `Prestasi`, `Sertifikasi`, `Rekognisi`, `Sync` |
| Kong path | `/bak-service` | `/si-prestasi-service` |

Hindari membuat konvensi baru. Kalau ada yang tidak jelas, lihat kode SIMBAK dulu sebagai referensi otoritatif.

---

## Struktur folder service (skeleton)

```
backend/si-prestasi-service/
├── Dockerfile                          # copy simbak
├── composer.json                       # copy simbak, rename package
├── docker/
│   ├── supervisord.conf                # copy simbak (php-fpm + queue worker)
│   ├── nginx.conf                      # copy simbak
│   └── entrypoint.sh                   # copy simbak
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── PrestasiMandiriController.php
│   │   ├── SertifikasiController.php
│   │   ├── RekognisiController.php
│   │   ├── MasterDataController.php
│   │   ├── SyncLogController.php
│   │   └── LookupController.php
│   ├── Services/
│   │   ├── PrestasiService.php
│   │   ├── SimkatmawaClient.php
│   │   ├── SimkatmawaTokenManager.php
│   │   ├── SubmitToSimkatmawaService.php
│   │   ├── StoragePublicService.php
│   │   └── PdutLookupService.php
│   ├── Repositories/
│   │   ├── BaseRepository.php          # copy simbak
│   │   ├── PdutRepository.php          # copy simbak, extend for prestasi lookups
│   │   ├── PrestasiMandiriRepository.php
│   │   ├── SertifikasiRepository.php
│   │   ├── RekognisiRepository.php
│   │   └── SyncSubmissionRepository.php
│   ├── Jobs/
│   │   ├── SubmitToSimkatmawaJob.php
│   │   └── RefreshSimkatmawaTokenJob.php
│   ├── Models/ ...
│   └── Console/Commands/
│       ├── SimkatmawaPingCommand.php
│       └── ImportPdutPrestasiCommand.php  # (opsional backfill)
├── config/
│   ├── database.php                    # copy simbak (pgsql + sqlsrv)
│   ├── simkatmawa.php                  # base_url, encrypted creds, rate limit
│   └── ...
├── database/
│   ├── migrations/                     # sync dengan DDL fresh sql
│   └── seeders/
│       └── RefPrestasiSeeder.php
├── routes/
│   └── api.php
└── tests/
    └── Feature/
        └── ...
```

---

## Anti-pattern yang harus dihindari

1. Jangan pakai PHP 8.3 atau Debian base — SIMBAK di Alpine PHP 8.2.
2. Jangan pakai Laravel Horizon separate container — Supervisor in-container pattern SIMBAK cukup untuk volume SI-Prestasi.
3. Jangan taruh tabel di schema `public` — drop `public`, pakai named schemas.
4. Jangan ubah konvensi naming (PK, nm_, a_, idx_, created_at/updated_at/soft_delete).
5. Jangan buat authentication sendiri — reuse JWT dari auth-service.
6. Jangan hardcode SIMKATMAWA credentials di config commit — encrypted at rest.

---

## Pengecekan akhir sebelum deploy

- [ ] Dockerfile mulai dari `php:8.2-fpm-alpine`
- [ ] `docker-compose.yml` mirror pola `docker-compose.simbak.yml` (env var names, volumes, networks)
- [ ] PostgreSQL DDL mulai dengan `DROP SCHEMA public CASCADE`
- [ ] PK semua tabel `id_<tabel> UUID DEFAULT gen_random_uuid()`
- [ ] Field nama `nm_*`, boolean `a_*`, tanggal `tgl_*`, index `idx_*`
- [ ] `PdutRepository` ada di `app/Repositories/` dan pakai `DB::connection('sqlsrv')`
- [ ] `CACHE_PREFIX=prestasi_` (bukan default)
- [ ] JWT validation config (HS256 + shared secret)
