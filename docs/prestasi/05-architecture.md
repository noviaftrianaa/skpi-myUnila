# Arsitektur SI-Prestasi

High-level diagram + komponen.

---

## Component map

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (mahasiswa / operator fakultas / admin kemahasiswaan)  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                 ┌─────────▼─────────┐
                 │   Kong Gateway    │  VM1:9800
                 │  /si-prestasi-*   │
                 └────────┬──────────┘
                          │
     ┌────────────────────┼─────────────────────┐
     │                    │                     │
┌────▼────────┐   ┌───────▼──────────┐   ┌──────▼──────┐
│  Next.js    │   │  si-prestasi-    │   │ auth-service │
│  frontend   │   │  service (API)   │   │ (SSO JWT)    │
│ sim-prestasi│   │  Laravel/Go      │   │              │
└─────────────┘   └──────┬─────┬─────┘   └──────────────┘
                         │     │
             ┌───────────┘     └──────────┐
             │                            │
       ┌─────▼──────┐              ┌──────▼────────┐
       │ PostgreSQL │              │ SQL Server    │
       │ si_prestasi│              │ pdut (R/O)    │
       │ (VM-target)│              │ (master data) │
       └─────┬──────┘              └───────────────┘
             │
       ┌─────▼──────┐
       │  Redis     │  (token cache SIMKATMAWA, queue, rate-limit)
       └─────┬──────┘
             │
       ┌─────▼──────────────┐       ┌─────────────────────────┐
       │ Queue worker       │ HTTPS │ SIMKATMAWA              │
       │ (push prestasi)    ├──────►│ simkatmawa.kemdiktisain │
       │ - Laravel Horizon  │       │ tek.go.id               │
       │   atau Go goroutine│       └─────────────────────────┘
       └────────────────────┘
             │
       ┌─────▼──────┐
       │ MinIO /    │  (storage dokumen: sertifikat, foto, surat tugas)
       │ nginx-static│  → URL publik dikirim ke SIMKATMAWA
       └────────────┘
```

---

## Komponen — detail

### 1. Frontend `sim-prestasi/`

Route: `frontend/src/app/dashboard/sim-prestasi/`

Halaman utama:
- `/` — dashboard ringkasan (count per status, per fakultas, per tahun)
- `/prestasi-mandiri` — list + filter + tombol buat baru
- `/prestasi-mandiri/new` — form create (wizard 3 step: info → peserta mhs → dosen + dokumen)
- `/prestasi-mandiri/[id]` — detail + history submit
- `/sertifikasi` + `/sertifikasi/new` + `/sertifikasi/[id]`
- `/rekognisi` + `/rekognisi/new` + `/rekognisi/[id]`
- `/master-data` — admin kemahasiswaan kelola referensi (enum, mapping, kode_pt)
- `/sync-log` — ops monitoring submission history

Teknologi: Next.js 15 + TanStack Query + Zustand (konsisten dengan sisanya). Client `simPrestasiClient` di `frontend/src/lib/services/sim-prestasi/`.

Integrasi:
- Search mahasiswa (dropdown by NIM) → call backend `/api/mahasiswa/search?q=`
- Search dosen (NUPTK/NIDN) → call backend `/api/dosen/search?q=`
- Upload dokumen (multipart) → backend simpan ke MinIO/volume, return URL publik

### 2. Backend `si-prestasi-service`

Stack decision di §07 (rekomendasi: Laravel).

Struktur Laravel:
```
backend/si-prestasi-service/
  app/
    Http/Controllers/Api/
      PrestasiMandiriController.php
      SertifikasiController.php
      RekognisiController.php
      MasterDataController.php
      SyncLogController.php
      LookupController.php            # mahasiswa / dosen search
    Services/
      SimkatmawaClient.php            # HTTP client ke SIMKATMAWA
      SimkatmawaTokenManager.php      # login + cache + refresh
      SimkatmawaSubmitService.php     # transform internal → payload + call API
      StoragePublicService.php        # upload dokumen + return public URL
      PdutLookupService.php           # query SQL Server pdut
    Repositories/
      PrestasiMandiriRepository.php
      SertifikasiRepository.php
      RekognisiRepository.php
      PdutRepository.php              # cross-DB read
      SyncSubmissionRepository.php
    Jobs/
      SubmitToSimkatmawaJob.php
      RefreshSimkatmawaTokenJob.php
    Models/ ...
  config/simkatmawa.php
  database/migrations/ ...
```

### 3. Database PostgreSQL `si_prestasi`

Schema sudah di §04. Satu instance bisa shared dengan SIMBAK di host PostgreSQL yang sama, database terpisah.

### 4. Redis

Pakai Redis container existing (`myunila-redis-*`). Prefix key:
- `simkatmawa:token` (TTL = JWT exp - 60s buffer)
- `simkatmawa:ratelimit:...` (sliding window counter)
- `queues:si-prestasi:*` (Laravel Horizon queue keys)

### 5. Queue worker

Opsi Laravel: Horizon supervisor di container terpisah (`si-prestasi-worker`).
Opsi Go: pakai asynq atau river-queue.

Job flow `SubmitToSimkatmawaJob`:
1. Ambil record by id + parent_tipe
2. Validasi status_workflow = 'ready'
3. Transform payload (enum mapping + peserta arrays)
4. Get token (SimkatmawaTokenManager — blokir kalau belum ada, login kalau expired)
5. POST ke endpoint sesuai tipe
6. Simpan `sync.submission` row
7. Update parent `status_workflow` ke 'sent' / 'error'
8. Kalau error transient (5xx, timeout): schedule retry dengan exponential backoff (max 3x, interval 30s/2m/10m)
9. Emit log.activity

### 6. Storage publik

Dokumen yang dikirim ke SIMKATMAWA harus URL-accessible dari luar. Opsi:

**A. MinIO dengan public bucket**
- Plus: sudah terencana di stack, S3-compatible, presigned URL
- Minus: kalau public bucket, semua bisa akses — perlu obfuscated key (UUID) + short-lived presigned link TIDAK bisa karena SIMKATMAWA simpan URL permanent-like

**B. Nginx static via volume**
- Path structure: `/var/www/si-prestasi/public/sertifikat/{uuid}.pdf`
- Nginx serve di domain publik Unila (e.g., `https://prestasi.unila.ac.id/files/...`)
- Plus: simpel, cepat
- Minus: file ada di filesystem VM, backup terpisah

**C. CDN (Cloudflare R2 / AWS S3) dengan public-read**
- Plus: durable, tidak bebani VM
- Minus: biaya + kompleksitas

**Rekomendasi:** Nginx static di VM produksi SI-Prestasi dengan subdomain publik. Gampang, cocok volume rendah (< 10k file/tahun).

**Penting:** karena URL jadi public, JANGAN upload file yang mengandung data pribadi sensitif (e.g., KTP) — hanya sertifikat, foto lomba, undangan, surat tugas.

### 7. Auth & RBAC

Reuse `auth-service` existing (SSO). Role baru:

| Role | Hak akses |
|---|---|
| `mahasiswa` | Lihat prestasinya sendiri; submit draft (butuh verifikasi ops?) — opsional |
| `operator_fakultas` | CRUD prestasi untuk fakultasnya saja |
| `admin_kemahasiswaan` | CRUD semua prestasi, approve → kirim ke SIMKATMAWA, kelola master data |
| `viewer_pimpinan` | Read-only dashboard analitik |

Backend enforce RBAC via middleware `can:submit-prestasi`, `can:manage-master` dsb.

---

## Observability

- **Logs:** Promtail → Loki (sudah ada stack monitoring VM5; replicate ke target VM). Log SIMKATMAWA request/response dengan `redact:token`.
- **Metrics:** Prometheus scrape ke `/metrics` backend. Counter: `simkatmawa_submissions_total{tipe,status}`, histogram `simkatmawa_submit_duration_seconds`.
- **Alerting:** Alert kalau `simkatmawa_submissions_total{status="error"}` > threshold dalam 10 menit → Telegram (pakai bot yang ada).

---

## Integration touchpoints

| Layer | Perubahan |
|---|---|
| Kong | Route baru `/si-prestasi-service` → upstream container |
| Frontend env | `NEXT_PUBLIC_SI_PRESTASI_API_URL` |
| Auth | Tambah role/permission di auth-service |
| Storage | Tambah nginx server block / MinIO bucket |
| DB | PostgreSQL new database `si_prestasi` |
| Monitoring | Scrape target baru, dashboard Grafana (opsional) |
