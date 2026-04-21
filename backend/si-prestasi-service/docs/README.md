# SI-Prestasi Service

Backend Laravel 11 untuk pelaporan prestasi mahasiswa Unila + integrasi API **SIMKATMAWA** (Kemdiktisaintek).

Stack dan konvensi **identik SIMBAK** (`../simbak-service/`) — PHP 8.2-fpm-alpine, Supervisor (PHP-FPM + queue worker), PostgreSQL primary + SQL Server pdut read-only, Redis shared, JWT validation dari auth-service.

## Status

**Phase 1 batch 2** — service skeleton selesai:
- ✅ Copy + rename dari simbak-service
- ✅ Dockerfile + supervisord + config
- ✅ PdutRepository (lookup mahasiswa/dosen/fakultas)
- ✅ ApiConfigService (read setting.api_config + encrypt/decrypt)
- ✅ SimkatmawaClient skeleton (ping, submit, dry_run support)
- ✅ LookupController + routes /api/health + /api/lookup/*
- ✅ docker-compose.si-prestasi.yml di vm5-staging

**Belum dikerjakan (batch 3+):**
- CRUD prestasi_mandiri / sertifikasi / rekognisi
- Master data + setting.api_config admin UI endpoints
- SubmitToSimkatmawaJob (queue) + state machine
- Upload file + nginx static
- Frontend `sim-prestasi/admin/`

## Struktur

```
backend/si-prestasi-service/
├── Dockerfile                          # PHP 8.2 Alpine + ODBC 18 + supervisor
├── composer.json                       # myunila/si-prestasi-service
├── docker/
│   └── supervisord.conf                # php-fpm + queue worker
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── HealthController.php    # GET /api/health
│   │   │   └── LookupController.php    # GET /api/lookup/{mahasiswa,dosen,fakultas}
│   │   └── Middleware/                 # CORS, ForceJson, JwtAuthenticate, CheckCrudPermission
│   ├── Repositories/
│   │   ├── BaseRepository.php          # pgsql + sqlsrv helpers + transaction
│   │   └── PdutRepository.php          # lookup mahasiswa/dosen via pdut SQL Server
│   ├── Services/
│   │   ├── ApiConfigService.php        # baca/tulis setting.api_config (Crypt)
│   │   ├── SimkatmawaClient.php        # skeleton: login, submit, dry_run
│   │   ├── AuditService.php            # audit helper
│   │   └── MinioService.php            # MinIO wrapper (opsional)
│   └── Traits/ApiResponse.php          # standard response format
├── config/
│   ├── database.php                    # pgsql (si_prestasi) + sqlsrv (pdut)
│   ├── jwt.php                         # HS256 shared secret
│   ├── simkatmawa.php                  # config_kode, dry_run, queue name
│   └── ...
└── routes/api.php                      # /health + /lookup/* (JWT protected)
```

## Endpoint (Phase 1 batch 2)

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| GET | /api/health | public | health check (pg + sqlsrv) |
| GET | /api/lookup/mahasiswa?nim=... | JWT | Lookup mahasiswa by NIM (exact) |
| GET | /api/lookup/mahasiswa/search?q=... | JWT | Autocomplete (partial NIM atau nama) |
| GET | /api/lookup/dosen?identifier=... | JWT | Lookup dosen by NUPTK atau NIDN |
| GET | /api/lookup/dosen/search?q=... | JWT | Autocomplete dosen |
| GET | /api/lookup/fakultas | JWT | List fakultas Unila (dari pdrd.sms id_jns_sms=1) |

## Cara pakai kredensial SIMKATMAWA

Kredensial SIMKATMAWA (email+password) **tidak** ditaruh di `.env`. Disimpan di tabel `setting.api_config` (encrypted via Laravel `Crypt::encryptString` pakai `APP_KEY`).

Flow:
1. Apply DDL + seed SQL dulu (seed `setting.api_config` kode=`simkatmawa` dengan `a_dry_run=true`)
2. Ops login ke admin UI SI-Prestasi → Master Data → API Config
3. Input email/password → backend encrypt + simpan
4. Toggle `a_dry_run=false` saat siap kirim ke DIKTI

`SimkatmawaClient::ping()` bisa dipakai ops untuk test connection tanpa submit.

## Kaitan ke database

Service connect ke:
- PostgreSQL `si_prestasi` (primary, read/write) — schema DDL di `data-model/script/postgresql/si_prestasi/`
- SQL Server pdut (secondary, read-only) — via `DB::connection('sqlsrv')` pakai env `SQLSRV_*`
- Redis (cache + queue) — shared

## Next (batch 3)

Lihat `docs/prestasi/14-feature-vision.md` dan `docs/prestasi/08-workflow-dan-state.md` di root repo untuk spec lengkap.
