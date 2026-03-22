# RBAC + Organisasi — Access Control Plan

**Updated:** 2026-03-15  
**Status:** Draft — brainstorming & analisis

---

## 📐 Kondisi Sekarang

### Schema Existing

```
man_akses.pengguna          → User account
man_akses.peran             → Role definition (Administrator, Developer, Dosen, Mahasiswa, dll)
man_akses.role_pengguna     → User ↔ Role ↔ Organisasi (N:M:M)
man_akses.unit_organisasi   → Organisasi (Unila, Fakultas, Jurusan, UPT, dll)
man_akses.aplikasi          → App (id_organisasi = owner/admin grouping)
man_akses.menu_role         → Role ↔ Menu permission (RBAC)
```

### Relasi Sekarang

```
User → role_pengguna → (id_peran + id_organisasi)
                        ↓
                        Menu_role → (id_peran + id_menu)
                        ↓
                        Aplikasi → (id_organisasi = owner, TIDAK dipakai untuk access control)
```

### Masalah Sekarang

1. **`checkAppAccess` HANYA cek `menu_role`** — tidak cek organisasi sama sekali
   - Komentar di kode: "Organization filter is NOT used for app access"
   - Developer di UPT TIK bisa akses monitoring ✅ tapi Developer di Fakultas lain juga bisa ❌

2. **`id_organisasi` di `aplikasi`** hanya untuk grouping administratif, bukan access control

3. **Peran universal** (Mahasiswa, Dosen, Tendik) → harusnya bisa akses apps umum terlepas organisasi

4. **Data filtering** belum ada — semua role lihat data yang sama

---

## 🎯 Goal

1. **App access by role + organisasi**: Developer di UPT TIK → bisa akses Monitoring. Developer di Fakultas lain → tidak bisa
2. **Universal roles tetap bebas**: Mahasiswa/Dosen/Tendik → akses apps yang ditentukan tanpa filter organisasi  
3. **Data filtering by active context**: Role aktif menentukan data apa yang ditampilkan (per unit/fakultas)

---

## 💡 Solusi yang Direkomendasikan

### Approach: Organisasi-based App Access (Opt-in)

Tambah **flag + tabel mapping** untuk kontrol akses apps berdasarkan organisasi, tanpa breaking existing RBAC.

### Perubahan Database

#### 1. Tambah kolom di `man_akses.aplikasi`

```sql
ALTER TABLE man_akses.aplikasi ADD a_filter_organisasi BIT DEFAULT 0;
-- 0 = semua organisasi bisa akses (behavior lama)
-- 1 = hanya organisasi yang di-whitelist yang bisa akses
```

#### 2. Buat tabel baru: `man_akses.aplikasi_organisasi`

```sql
CREATE TABLE man_akses.aplikasi_organisasi (
    id_app_org          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    id_aplikasi         UNIQUEIDENTIFIER NOT NULL,
    id_organisasi       UNIQUEIDENTIFIER NOT NULL,
    a_include_children  BIT DEFAULT 1,     -- include sub-organisasi
    tgl_create          DATETIME DEFAULT GETDATE(),
    last_update         DATETIME DEFAULT GETDATE(),
    soft_delete         NUMERIC DEFAULT 0,
    FOREIGN KEY (id_aplikasi) REFERENCES man_akses.aplikasi(id_aplikasi),
    FOREIGN KEY (id_organisasi) REFERENCES man_akses.unit_organisasi(id_organisasi),
    UNIQUE (id_aplikasi, id_organisasi)
);
```

#### 3. Tambah kolom di `man_akses.peran` (opsional)

```sql
ALTER TABLE man_akses.peran ADD a_universal BIT DEFAULT 0;
-- 1 = role ini bypass organisasi filter (Mahasiswa, Dosen, Tendik)
-- 0 = role ini harus match organisasi
```

### Peran Universal vs Restricted

| Peran | a_universal | Keterangan |
|---|---|---|
| Mahasiswa (39) | 1 | Akses apps umum, data filter by homebase prodi |
| Dosen (46) | 1 | Akses apps umum, data filter by homebase prodi |
| Tendik (111) | 1 | Akses apps umum, data filter by unit kerja |
| Administrator (1) | 1 | Super — bypass semua |
| Developer (107) | **0** | Harus match organisasi apps |
| Kaprodi (42) | 0 | Hanya akses apps prodinya |
| Dekan (43) | 0 | Hanya akses apps fakultasnya |
| LP3M (33) | 1 | Akses apps universitas |
| Rektor (38) | 1 | Akses semua |
| Wakil Rektor (34-37) | 1 | Akses semua |

---

## 🔧 Perubahan Logic: `checkAppAccess`

### Flow Baru

```
1. Get active context (role + organisasi user)
2. Get app info
3. Check menu_role (existing — tetap sama)
4. ❌ Jika tidak ada menu_role → tolak

5. NEW: Cek a_filter_organisasi di aplikasi
   5a. Jika a_filter_organisasi = 0 → ✅ lolos (behavior lama)
   5b. Jika a_filter_organisasi = 1:
       - Cek a_universal di peran user
         - Jika a_universal = 1 → ✅ lolos
         - Jika a_universal = 0:
           - Cek apakah id_organisasi user ada di aplikasi_organisasi
           - Jika a_include_children = 1, cek juga sub-organisasi
           - Jika match → ✅ lolos
           - Jika tidak match → ❌ tolak
```

### Pseudocode

```php
function checkAppAccess($userId, $appId) {
    $context = getActiveContext($userId);
    $app = getAppInfo($appId);
    
    // Step 1: Check RBAC (existing)
    if (!checkMenuRoleAccess($context->id_peran, $app->id_aplikasi)) {
        return ['has_access' => false, 'reason' => 'Role tidak punya akses menu'];
    }
    
    // Step 2: Check organisasi filter (NEW)
    if ($app->a_filter_organisasi) {
        $role = getRole($context->id_peran);
        
        // Universal roles bypass org filter
        if ($role->a_universal) {
            return ['has_access' => true];
        }
        
        // Check org whitelist
        if (!isOrgWhitelisted($app->id_aplikasi, $context->id_organisasi)) {
            return [
                'has_access' => false,
                'reason' => 'Organisasi Anda tidak memiliki akses ke aplikasi ini'
            ];
        }
    }
    
    return ['has_access' => true];
}
```

---

## 📊 Data Filtering by Active Context

### Konsep

User yang login punya active context: `{id_peran, id_organisasi}`. Data yang ditampilkan di-filter berdasarkan organisasi aktif.

### Contoh Use Case

| User | Active Context | Akses Data |
|---|---|---|
| Developer di UPT TIK | Developer + UPT TIK | Semua data (Developer) |
| Kaprodi Ilmu Komputer | Kaprodi + Prodi Ilkom | Data prodi Ilkom saja |
| Dekan FMIPA | Dekan + Fakultas MIPA | Data semua prodi di FMIPA |
| Mahasiswa | Mahasiswa + Prodi X | Data diri sendiri |
| Dosen | Dosen + Prodi X | Data prodi X + mahasiswa bimbingan |

### Implementasi

Di API service, tambahkan middleware yang inject `X-Org-Id` dan `X-Role-Id` dari JWT/context, lalu di query:

```sql
-- Kaprodi: filter by prodi
WHERE id_sms = @user_org_id

-- Dekan: filter by fakultas (semua prodi di bawahnya)
WHERE id_sms IN (SELECT id_sms FROM pdrd.sms WHERE id_fak_unila = @user_org_id)

-- Administrator/Universal: no filter
-- (tanpa WHERE tambahan)
```

### Hierarchy Organisasi

```
Universitas Lampung (level 0)
├── Fakultas MIPA (level 1)
│   ├── Jurusan Fisika (level 2)
│   │   ├── Prodi S1 Fisika (level 3)
│   │   └── Prodi S2 Fisika (level 3)
│   └── Jurusan Kimia (level 2)
├── Fakultas Teknik (level 1)
├── UPT TIK (level 1)
└── ...
```

Kalau `a_include_children = 1`, user di Fakultas MIPA bisa akses data semua prodi di bawahnya.

---

## 📋 Urutan Implementasi

### Phase 1 — Database & Backend (Paling Penting)

1. ALTER tabel `aplikasi` tambah `a_filter_organisasi`
2. ALTER tabel `peran` tambah `a_universal`
3. CREATE tabel `aplikasi_organisasi`
4. Seed data:
   - Set `a_universal = 1` untuk: Administrator, Mahasiswa, Dosen, Tendik, Rektor, WR1-4, LP3M
   - Set `a_filter_organisasi = 1` untuk apps yang perlu restrict (Monitoring, Integrator, dll)
   - INSERT whitelist organisasi ke `aplikasi_organisasi`
5. Update `checkAppAccess` di auth service

### Phase 2 — Frontend

6. Portal apps page: tampilkan info "Anda tidak memiliki akses" jika org tidak match
7. Settings page: manage `aplikasi_organisasi` whitelist (admin)

### Phase 3 — Data Filtering

8. Tambah middleware `X-Org-Id` di Kong/auth
9. Backend services: filter query berdasarkan org context
10. Frontend: tampilkan info organisasi aktif

---

## ⚠️ Catatan Penting

1. **Backward compatible** — `a_filter_organisasi = 0` (default) = behavior lama, tidak ada yang break
2. **Homebase mahasiswa/dosen** → ambil dari `pdrd.reg_pd` (mahasiswa) atau `pdrd.reg_ptk` (dosen), bukan dari `role_pengguna.id_organisasi` — karena homebase bisa berubah
3. **Multi-role** — user bisa punya beberapa role di organisasi berbeda. Yang aktif ditentukan oleh `selectContext`
4. **Caching** — clear cache `user_context:*` saat update whitelist organisasi
5. **Gradual rollout** — mulai dari 1-2 apps (Monitoring, Integrator), baru expand ke apps lain

---

## 🔍 Data Existing yang Relevan

### Organisasi Saat Ini di Aplikasi

| id_organisasi | Nama | Dipakai oleh |
|---|---|---|
| E2B705A7... | Universitas Lampung | Dashboard Pimpinan, SIKEP, SISTER, dll |
| C4453E71... | UPT TIK | Monitoring, Integrator, API Gateway |
| 86942CDF... | Semua Unit | SIAKADU, Beasiswa, E-KKN, dll |

### Contoh Skenario

**Monitoring (a_filter_organisasi = 1):**
- `aplikasi_organisasi`: UPT TIK
- Developer di UPT TIK → ✅
- Developer di Fakultas Teknik → ❌
- Administrator (a_universal) → ✅

**SIAKADU (a_filter_organisasi = 0):**
- Semua role yang punya menu_role → ✅ (behavior lama)

---

*Plan ini perlu review dan diskusi sebelum implementasi.*
*Terutama: daftar apps mana yang perlu a_filter_organisasi = 1 dan whitelist organisasinya.*

---

## 🔍 Analisis Lengkap RBAC Flow (Existing)

### Alur Akses Apps Sekarang

```
1. User login → dapat JWT token
2. User pilih role (selectContext) → cache di Redis: {id_peran, id_organisasi, nm_peran, nm_organisasi}
3. Frontend cek akses app → GET /user-context/check-access?app_key=xxx
4. Backend checkAppAccess:
   a. Get active context dari Redis cache
   b. Get app info (cached)
   c. Check menu_role: role punya menu di app? → RBAC satu-satunya filter
   d. Get CRUD permissions: MAX(a_boleh_show/insert/update/delete) dari semua menu
   e. Return {has_access, permissions, context}
5. Frontend withAuth hook:
   a. Terima permissions → {can_show, can_insert, can_update, can_delete}
   b. Render UI sesuai permission (hide button CRUD jika tidak punya)
```

### Masalah CRUD Sekarang

| Issue | Detail |
|---|---|
| Super roles hardcoded | `config('auth.super_roles', [1, 107])` → Admin + Developer full CRUD |
| Permission per-app, bukan per-menu | `getAppPermissions` aggregasi MAX semua menu → jika 1 menu punya insert, semua menu dianggap bisa insert |
| Frontend tidak selalu cek | Beberapa page tidak passing `appKey` ke `useRequireAuth` → full permissions default |
| Organisasi tidak dicek | `checkAppAccess` TIDAK filter by organisasi role_pengguna |

### Tabel Relasi Lengkap

```
pengguna (user)
  └── role_pengguna (N:M)
       ├── id_peran → peran (role definition)
       └── id_organisasi → unit_organisasi (unit kerja)
  
peran
  └── menu_role (N:M) → CRUD permissions per menu
       └── id_menu → menu → id_aplikasi → aplikasi

aplikasi
  ├── id_organisasi → unit_organisasi (owner/admin group)
  ├── id_kategori → kategori_aplikasi
  └── menu (1:N) → menu_role (N:M with peran)

unit_organisasi (hierarchy)
  ├── id_induk_organisasi → self (parent)
  ├── level_organisasi
  └── id_jns_lemb (jenis lembaga)

table_aplikasi → akses_table_aplikasi → per-app table CRUD (belum dipakai)
kelompok_tabel_aplikasi → endpoint grouping (belum dipakai)
pj_aplikasi → penanggung jawab aplikasi (PIC)
ws_authorization/ws_endpoint → WS API access control (legacy)
```

### Config Super Roles

```php
// config/auth.php
'super_roles' => [1, 107]  // Administrator, Developer
```

Super roles → full CRUD di semua apps, bypass semua check.

### Caching Strategy

| Key Pattern | TTL | Data |
|---|---|---|
| `user_context:{userId}` | 8 hours | Active role context |
| `app_info:id:{appId}` | 24 hours | App metadata |
| `menu_role:{idPeran}:{idAplikasi}` | 60 min | Has menu access? |
| `permissions:{idPeran}:{idAplikasi}` | 60 min | CRUD permissions |
| `menus:{userId}:{appId}` | 60 min | Menu tree |

---

## 🔧 TODO: Fix CRUD Permissions

### Issue 1: Per-app vs Per-menu Permissions

Sekarang `getAppPermissions` ambil MAX dari semua menu di app. Jadi kalau role punya `a_boleh_insert=1` di menu "Dashboard" tapi `a_boleh_insert=0` di menu "Daftar UKT", hasilnya `can_insert=true` untuk semua menu.

**Rekomendasi:** Tambah parameter `menu_path` ke check-access agar permission di-check per menu, bukan per app.

### Issue 2: Frontend Tidak Selalu Kirim appKey

Beberapa page call `useRequireAuth()` tanpa parameter → full permissions. Perlu audit semua page.

### Issue 3: CRUD Buttons Tidak Konsisten

Frontend perlu cek `permissions.can_insert` sebelum tampilkan tombol "Tambah", `can_delete` untuk "Hapus", dll.

---

## 🌐 API Service Endpoint Access Control

### Kondisi Sekarang

**api-service** (Go/Fiber) sudah punya:
- `middleware.JWTAuth()` → validasi JWT token
- `middleware.KongAuth()` → baca JWT dari Kong header
- `middleware.RequireRole("Developer")` → cek active context role di Redis
- `middleware.RateLimiterMiddleware()` → rate limit per IP (token bucket)
- **283 endpoints terdaftar** di `man_akses.ws_endpoint`
- **2604 authorization rules** di `man_akses.ws_authorization`

### Masalah

1. `ws_authorization` mapping: `id_pengguna → id_ws_endpoint` (per-user, bukan per-role!)
   - Ini berarti setiap user harus di-assign satu per satu ke endpoint
   - Tidak scalable — harusnya per-role

2. Middleware `RequireRole` ada tapi **tidak dipakai di semua endpoint**:
   - `/referensi/*` → hanya `JWTAuth()`, tidak ada role check
   - `/pdrd/*` → hanya `JWTAuth()`, tidak ada role check
   - `/diklat/*` → hanya `JWTAuth()`, tidak ada role check
   - Artinya: siapapun yang punya valid JWT bisa akses semua data

3. Endpoint daftar di DB (ws_endpoint) tapi **tidak di-enforce** di runtime
   - ws_authorization ada 2604 rules tapi middleware tidak query tabel ini

### Daftar Endpoint api-service

| Group | Endpoints | Auth | Role Check |
|---|---|---|---|
| `/auth/login` | 1 | None | None |
| `/auth/check-token` | 1 | None | None |
| `/referensi/*` | 72 endpoints | JWT ✅ | ❌ Tidak ada |
| `/pdrd/*` | 3 endpoints | JWT ✅ | ❌ Tidak ada |
| `/diklat/*` | 5 endpoints (CRUD) | JWT ✅ | ❌ Tidak ada |

Total: ~81 endpoints, semua hanya JWT auth tanpa role/permission check.

### Rekomendasi

#### Opsi A — Middleware Per-Role (Simple, Cepat)

Tambah `RequireRole` di setiap route group:

```go
// Referensi — read-only untuk semua authenticated user
ref := router.Group("/referensi", middleware.JWTAuth())

// PDRD — hanya role tertentu
pdrd := router.Group("/pdrd", middleware.JWTAuth(), middleware.RequireRole("Administrator", "Developer", "Dosen", "Kaprodi"))

// Diklat — CRUD restricted
diklat := router.Group("/diklat", middleware.JWTAuth())
diklat.Get("/list", handler.GetDiklat)                    // semua authenticated
diklat.Post("/tambah", middleware.RequireRole("Administrator", "Developer"), handler.CreateDiklat)
diklat.Put("/ubah/:id", middleware.RequireRole("Administrator", "Developer"), handler.UpdateDiklat)
diklat.Delete("/hapus/:id", middleware.RequireRole("Administrator"), handler.DeleteDiklat)
```

#### Opsi B — ws_endpoint + ws_authorization Enforcement (Proper, Lebih Lama)

Buat middleware baru yang query `ws_endpoint` + `ws_authorization`:

```go
// Middleware yang cek endpoint access dari DB
func EndpointAuth() fiber.Handler {
    return func(c *fiber.Ctx) error {
        userID := c.Locals("user_id")
        method := c.Method()
        path := c.Path()
        
        // Query ws_endpoint + ws_authorization
        hasAccess := checkEndpointAccess(userID, method, path)
        if !hasAccess {
            return response.Forbidden(c, "Anda tidak memiliki akses ke endpoint ini")
        }
        return c.Next()
    }
}
```

Tapi ini butuh refactor `ws_authorization` dari per-user ke per-role.

#### Opsi C — Hybrid (Rekomendasi) ⭐

1. **Short term:** Tambah `RequireRole` ke endpoint sensitif (CRUD diklat, pdrd)
2. **Medium term:** Refactor `ws_authorization` jadi per-role (tambah `id_peran` kolom)
3. **Long term:** Buat endpoint management UI di Manajemen Akses portal

### ALTER Table untuk ws_authorization (per-role)

```sql
-- Tambah id_peran ke ws_authorization agar bisa assign per-role
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'ws_authorization' AND COLUMN_NAME = 'id_peran')
BEGIN
    ALTER TABLE man_akses.ws_authorization ADD id_peran INT NULL;
    PRINT 'Column id_peran added to ws_authorization';
END
GO

-- Index
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ws_auth_peran' AND object_id = OBJECT_ID('man_akses.ws_authorization'))
BEGIN
    CREATE INDEX IX_ws_auth_peran ON man_akses.ws_authorization(id_peran, id_ws_endpoint) WHERE soft_delete = 0;
    PRINT 'Index IX_ws_auth_peran created';
END
GO
```

---

## 📋 Summary Semua Perubahan yang Dibutuhkan

### Database (SQL scripts untuk SSMS)

| Script | Tabel | Perubahan |
|---|---|---|
| rbac_organisasi_access.sql ✅ | aplikasi | ADD a_filter_organisasi |
| rbac_organisasi_access.sql ✅ | peran | ADD a_universal |
| rbac_organisasi_access.sql ✅ | aplikasi_organisasi | CREATE TABLE (baru) |
| ws_api_authorization.sql (TODO) | ws_authorization | ADD id_peran |

### Backend Auth Service (PHP/Laravel)

| File | Perubahan |
|---|---|
| UserContextService.php | Update checkAppAccess — tambah org filter |
| UserContextRepository.php | Query baru: cek aplikasi_organisasi |

### Backend API Service (Go/Fiber)

| File | Perubahan |
|---|---|
| pdrd/router.go | Tambah RequireRole middleware |
| diklat/router.go | Tambah RequireRole per-endpoint (read vs write) |
| referensi/router.go | Tetap — read-only untuk semua authenticated |

### Frontend

| Area | Perubahan |
|---|---|
| Portal apps | Tampilkan error jika org tidak match |
| Manajemen Akses | UI manage aplikasi_organisasi whitelist |
| Manajemen Akses | UI manage ws_endpoint per-role |
| withAuth hook | Pass permissions ke komponen untuk hide CRUD buttons |
