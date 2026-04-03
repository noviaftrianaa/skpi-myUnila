# WS Service — Dev/Live Mode Plan

**Created:** 2026-03-17  
**Status:** Planning

---

## 🎯 Goal

1. ws-service support dual mode: `dev` (pdut_staging) dan `live` (pdut)
2. WS Authorization cukup **satu kali setup** — berlaku di kedua mode
3. Dokumentasi Scalar UI update otomatis sesuai mode
4. Endpoint URL **tanpa prefix dev/live** — pakai `/v1/` saja (best practice REST API)

---

## 📊 Current State

| Item | Sekarang | Target |
|---|---|---|
| URL prefix | `/dev/v1/...` atau `/live/v1/...` | `/v1/...` (environment-agnostic) |
| DB switch | `APP_ENV` di docker-compose | Tetap `APP_ENV`, tapi URL tidak berubah |
| ws_endpoint paths | Mix `/dev/v1/...` dan legacy `/auth/...` | Uniform `/v1/...` |
| ws_authorization | Per-endpoint path | Per-endpoint path (path konsisten) |
| Scalar docs | Hardcode host di OpenAPI | Dynamic berdasarkan environment |

---

## 📋 Phase Plan

### Phase 1 — Hapus Prefix dev/live dari URL
**Estimasi: 30 menit**

**Go api-service (`cmd/api/main.go`):**

```go
// SEBELUM:
if config.Cfg.App.Env == "production" {
    endpointPrefix = "live"
} else {
    endpointPrefix = "dev"
}
apiV1 := app.Group(fmt.Sprintf("/%s/v1", endpointPrefix))

// SESUDAH:
apiV1 := app.Group("/v1")
// APP_ENV tetap dipakai untuk behavior internal (logging level, cache TTL, dll)
```

**Impact:**
- URL berubah: `/dev/v1/referensi/agama` → `/v1/referensi/agama`
- Kong route tetap sama (`/ws-service` strip_path)
- Frontend tidak perlu berubah (akses via Kong)
- ws_endpoint paths jadi konsisten

**Migration ws_endpoint data lama:**
```sql
-- Normalize path_url: hapus /dev/v1/ dan /live/v1/ prefix
UPDATE man_akses.ws_endpoint 
SET path_url = REPLACE(REPLACE(path_url, '/dev/v1/', '/v1/'), '/live/v1/', '/v1/')
WHERE path_url LIKE '/dev/v1/%' OR path_url LIKE '/live/v1/%';

-- Hapus duplicate setelah normalize
-- (misal /dev/v1/auth/login dan /live/v1/auth/login jadi satu /v1/auth/login)
```

### Phase 2 — Update OpenAPI Docs (Scalar UI)
**Estimasi: 30 menit**

**File: `backend/api-service/docs/openapi/openapi.yaml`**

```yaml
openapi: 3.0.3
info:
  title: myUnila Web Service API
  version: 1.0.0
  description: |
    API Web Service untuk platform myUnila - Universitas Lampung
    
    **Environment:**
    - Staging: `http://192.168.120.45:9800/ws-service`
    - Production: `https://my.unila.ac.id/ws-service`

servers:
  - url: /v1
    description: API v1 (relative — works in both dev & production)
```

**Scalar UI config update (`docs/handler.go`):**
- URL spec relatif → `/v1` — works di semua environment
- Tambah environment badge di header

### Phase 3 — Re-generate Endpoints + Cleanup DB
**Estimasi: 15 menit**

1. Deploy ws-service dengan URL `/v1/...`
2. Re-generate endpoints (paths sekarang `/v1/...`)
3. Cleanup data lama (`/dev/v1/...`, `/live/v1/...`, legacy paths)
4. ws_authorization otomatis ikut karena mapping by `id_ws_endpoint` (UUID)

```sql
-- Cleanup: soft-delete legacy endpoints yang bukan /v1/ prefix
UPDATE man_akses.ws_endpoint 
SET soft_delete = 1
WHERE id_aplikasi = '...' 
  AND path_url NOT LIKE '/v1/%'
  AND path_url NOT LIKE '/auth/%';  -- keep legacy auth if needed
```

### Phase 4 — DB Environment Config di ws-service
**Estimasi: 15 menit**

ws-service sudah support ini via env vars:
```env
# Staging (.env VM5)
APP_ENV=staging
DB_DATABASE=pdut_staging

# Production (.env VM3)
APP_ENV=production
DB_DATABASE=pdut
```

**Tidak perlu perubahan kode.** URL sama (`/v1/...`), DB beda per env.

### Phase 5 — Update Dokumentasi
**Estimasi: 30 menit**

1. Update `docs/openapi/openapi.yaml` — paths tanpa prefix
2. Update `docs/openapi/paths/*.yaml` — semua path `/v1/...`
3. Update `WS-AUTHORIZATION-PLAN.md`
4. Re-generate Scalar UI

### Phase 6 — Testing
**Estimasi: 30 menit**

| Test | Expected |
|---|---|
| `GET /v1/referensi/agama` via staging | ✅ Data dari pdut_staging |
| `GET /v1/referensi/agama` via production | ✅ Data dari pdut |
| ws_endpoint paths | Semua `/v1/...` |
| ws_authorization | Sama di staging & production |
| Scalar UI `/docs` | Paths `/v1/...`, server relative |
| Generate endpoint | Paths `/v1/...` |
| Old URLs `/dev/v1/...` | 404 (removed) |

---

## ⏱️ Estimasi Total

| Phase | Task | Estimasi |
|-------|------|----------|
| 1 | Hapus prefix dev/live | 30 menit |
| 2 | Update OpenAPI/Scalar | 30 menit |
| 3 | Re-generate + cleanup DB | 15 menit |
| 4 | DB env config (already done) | 15 menit |
| 5 | Update docs | 30 menit |
| 6 | Testing | 30 menit |
| **Total** | | **~2.5 jam** |

---

## 🔑 Key Decision: Satu Authorization, Dua Database

```
ws_endpoint (di pdut_staging DAN pdut):
  /v1/referensi/agama  ← SAMA path di kedua DB
  /v1/auth/login       ← SAMA path di kedua DB

ws_authorization (di pdut_staging DAN pdut):
  Developer → /v1/referensi/*  ← SAMA di kedua DB
  Developer → /v1/auth/*       ← SAMA di kedua DB
```

**Kenapa ini works:**
- Path URL sama (`/v1/...`) di staging dan production
- Authorization data di-sync via Log Shipping (119→190)
- pdut_staging punya data sendiri (weekly refresh dari pdut)
- Jadi **satu kali setup authorization = berlaku di mana-mana**

---

## ⚠️ Breaking Change

URL berubah:
- ❌ `/dev/v1/referensi/agama` → tidak jalan lagi
- ❌ `/live/v1/referensi/agama` → tidak jalan lagi  
- ✅ `/v1/referensi/agama` → URL baru

**Siapa yang perlu update:**
- Frontend: Tidak (akses via Kong, path stripped)
- apps_pdpt (legacy PHP): Mungkin — cek apakah hardcode path
- External consumer: Jika ada yang akses langsung

---

*Implementasi bisa dimulai kapan saja. Tidak perlu koordinasi dengan tim lain karena ws-service belum dipublish ke external.*
