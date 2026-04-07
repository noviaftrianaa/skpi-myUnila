# WS Authorization & Endpoint Management Plan

**Created:** 2026-03-16  
**Status:** Planning

---

## 🎯 Goal

1. **WS Endpoint**: Auto-generate endpoints dari Go router, kelola manual CRUD + bulk toggle
2. **WS Authorization**: CRUD per-role (bukan per-user), assign endpoint by group/bulk checkbox

---

## 📊 Current State

### Data
- `ws_endpoint`: 281 records, 24 groups (referensi 89, mata_kuliah 32, sarpras 32, dll)
- `ws_authorization`: 2604 records — mapping **per-user** (id_pengguna → id_ws_endpoint)
- Kolom `id_peran` sudah ada di ws_authorization tapi **belum dipakai**

### Code
- Backend auth-service: EndpointController sudah ada (CRUD basic)
- Frontend: EndpointTable sudah ada (view + basic CRUD)
- Go api-service: 96 route registrations di router.go files
- **Belum ada**: WS Authorization controller, frontend CRUD, generate endpoint feature

---

## 📋 Phase Plan

### Phase 1 — Backend Auth Service: WS Authorization API
**Estimasi: 1-2 jam**

Buat `WsAuthorizationController.php`:

```
GET    /manakses/ws-authorization                    — List (filter by id_peran, id_aplikasi)
GET    /manakses/ws-authorization/by-role/{id_peran} — Get semua endpoint yang di-assign ke role
POST   /manakses/ws-authorization/bulk-assign        — Bulk assign endpoints ke role
DELETE /manakses/ws-authorization/bulk-revoke         — Bulk revoke endpoints dari role
```

Request body `bulk-assign`:
```json
{
  "id_peran": 107,
  "id_aplikasi": "uuid-app",
  "endpoint_ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

Request body `bulk-revoke`:
```json
{
  "id_peran": 107,
  "endpoint_ids": ["uuid-1", "uuid-2"]
}
```

### Phase 2 — Backend Auth Service: Generate Endpoint API
**Estimasi: 1 jam**

Tambah di `EndpointController.php`:

```
POST /manakses/ws-endpoint/generate — Terima JSON array endpoints, upsert ke DB
```

Request body:
```json
{
  "id_aplikasi": "uuid-ws-service",
  "endpoints": [
    {"nm_group": "auth", "nm_method": "POST", "path_url": "/dev/v1/auth/login", "nm_endpoint": "Login"},
    {"nm_group": "referensi", "nm_method": "GET", "path_url": "/dev/v1/referensi/agama", "nm_endpoint": "Get Agama"},
    ...
  ]
}
```

Logic:
- Match by `path_url + nm_method` → jika ada: update `nm_group`, `nm_endpoint`, `last_sync`
- Jika belum ada: insert baru
- Jangan hapus yang tidak ada di list (mungkin endpoint lama yang masih relevan)
- Return: `{inserted: N, updated: N, unchanged: N}`

### Phase 3 — Go API-Service: Endpoint Self-Report
**Estimasi: 1 jam**

Tambah endpoint di Go api-service:

```
GET /system/routes — Return semua registered routes
```

```go
// Di main.go, setelah semua RegisterRoutes
app.Get("/system/routes", func(c *fiber.Ctx) error {
    routes := app.GetRoutes()
    var result []map[string]string
    for _, r := range routes {
        if r.Path == "/" || strings.HasPrefix(r.Path, "/system") {
            continue
        }
        result = append(result, map[string]string{
            "method": r.Method,
            "path":   r.Path,
            "name":   r.Name,
        })
    }
    return c.JSON(fiber.Map{"routes": result, "total": len(result)})
})
```

Frontend memanggil ini → mapping ke format generate → POST ke auth-service.

### Phase 4 — Frontend: WS Endpoint Enhancement
**Estimasi: 2 jam**

Update `EndpointTable.tsx`:
- ✅ Tombol **"Generate Endpoints"** — call Go `/system/routes` → preview → confirm → POST ke auth `/ws-endpoint/generate`
- ✅ Filter by group, method, active status
- ✅ Bulk select + toggle active/inactive
- ✅ CRUD modal (sudah ada, polish)

### Phase 5 — Frontend: WS Authorization Page
**Estimasi: 3-4 jam**

Buat halaman baru: `/dashboard/manajemen-akses/manajemen/ws-authorization`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  WS Authorization                                    │
│  Kelola hak akses endpoint per role                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [Pilih Role ▼]  [Pilih Aplikasi ▼]  [🔍 Search]   │
│                                                      │
│  ┌── Group: auth ──────────────────────────┐        │
│  │ ☑ Select All                            │        │
│  │ ☑ POST  /dev/v1/auth/login              │        │
│  │ ☑ POST  /dev/v1/auth/check-token        │        │
│  └─────────────────────────────────────────┘        │
│                                                      │
│  ┌── Group: referensi ─────────────────────┐        │
│  │ ☐ Select All (3/89 selected)            │        │
│  │ ☑ GET  /dev/v1/referensi/agama          │        │
│  │ ☑ GET  /dev/v1/referensi/semester       │        │
│  │ ☑ GET  /dev/v1/referensi/wilayah        │        │
│  │ ☐ GET  /dev/v1/referensi/negara         │        │
│  │ ☐ ...                                   │        │
│  └─────────────────────────────────────────┘        │
│                                                      │
│  ┌── Group: pdrd ──────────────────────────┐        │
│  │ ☐ Select All                            │        │
│  │ ☐ GET  /dev/v1/pdrd/list_mahasiswa      │        │
│  │ ☐ GET  /dev/v1/pdrd/detail_biodata      │        │
│  └─────────────────────────────────────────┘        │
│                                                      │
│  [💾 Simpan Perubahan]  [↩️ Reset]                  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Fitur:**
- Dropdown pilih Role (dari peran list)
- Dropdown pilih Aplikasi (filter endpoint by id_aplikasi)
- Endpoint grouped by `nm_group` — collapsible
- **Checkbox per endpoint** + **Select All per group**
- **Bulk assign/revoke** — compare current vs checked, diff → assign baru / revoke yang di-uncheck
- Search endpoint by name/path
- Badge counter: "3/89 selected" per group
- Save button → POST bulk-assign + DELETE bulk-revoke

### Phase 6 — Seed Menu & Testing
**Estimasi: 30 menit**

1. Update `manajemen-akses.json` — tambah menu "WS Authorization"
2. Seed ke DB
3. Testing:
   - Generate endpoint dari api-service
   - Assign endpoint ke role Developer
   - Verify role lain tidak bisa akses

---

## ⏱️ Estimasi Total

| Phase | Task | Estimasi |
|-------|------|----------|
| 1 | Backend WS Authorization API | 1-2 jam |
| 2 | Backend Generate Endpoint API | 1 jam |
| 3 | Go API-Service /system/routes | 1 jam |
| 4 | Frontend WS Endpoint Enhancement | 2 jam |
| 5 | Frontend WS Authorization Page | 3-4 jam |
| 6 | Seed Menu & Testing | 30 menit |
| **Total** | | **~9-10 jam** |

---

## 🔒 Security Notes

- WS Authorization akan shift dari **per-user** ke **per-role** (kolom `id_peran`)
- Data lama (per-user) tetap ada, tidak dihapus
- Middleware enforcement di Go api-service: **Phase berikutnya** (setelah UI selesai)
- Super roles (Administrator, Developer) tetap bypass semua check

---

## 📝 DB Changes Required

Tidak ada ALTER table — schema sudah support:
- `ws_endpoint.id_aplikasi` ✅
- `ws_authorization.id_peran` ✅ (sudah ada dari migration sebelumnya)

Yang perlu: pastikan `id_peran` di ws_authorization di-index:
```sql
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ws_auth_peran_endpoint')
CREATE INDEX IX_ws_auth_peran_endpoint 
ON man_akses.ws_authorization(id_peran, id_ws_endpoint) 
WHERE soft_delete = 0;
```
