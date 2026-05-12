# RBAC Enforcement Plan — Fine-grained Permission Control

## Overview
Implementasi CRUD permission enforcement di semua service MyUnila.
Saat ini RBAC hanya di-enforce di level **akses menu** (boleh/tidak buka halaman).
Plan ini menambahkan enforcement **per action** (Show/Insert/Update/Delete) per menu per role.

## Architecture

```
JWT Token (identity only):
  { user_id, id_peran, nm_peran, exp }

Redis Cache (permissions):
  user_permissions:{id_pengguna} → {
    "id_peran": 43,
    "apps": {
      "<app_id>": {
        "<menu_path>": { "show":1, "insert":0, "update":0, "delete":0 }
      }
    },
    "cached_at": "2026-03-18T22:00:00",
    "ttl": 1800
  }

Flow:
  User Login → Auth sets JWT (identity)
  User Select Context → Auth caches permissions to Redis
  API Request → Kong (JWT check) → Service Middleware (Redis permission check) → Handler
```

## Kenapa Redis, Bukan JWT?

| Aspek | JWT | Redis |
|-------|-----|-------|
| Token size | Besar (5-10KB) jika banyak permission | Fix ~200 bytes JWT |
| Realtime update | Harus relogin | Langsung efek |
| Kong header limit | Bisa kena reject | Tidak ngaruh |
| Lookup speed | 0ms (di token) | <1ms (Redis) |
| Memory (10K users) | N/A | ~5MB |
| **Winner** | ❌ | ✅ |

## Capacity Planning

| Metric | Value |
|--------|-------|
| Redis key per user | ~500 bytes |
| 1.000 concurrent users | 500 KB |
| 10.000 concurrent users | 5 MB |
| TTL per key | 30 menit (auto-expire) |
| Redis ops per request | 1 GET (~0.1ms) |
| Max Redis throughput | 100.000+ ops/sec |

**Verdict: Sangat ringan.** Redis single instance handle ratusan ribu user concurrent.

---

## Phase 1: Auth Service — Cache Permissions ke Redis (Backend)

### File: `auth-service/app/Services/UserContext/UserContextService.php`

**Saat user set context (pilih role):**
1. Query `menu_role` + `menu` untuk role yang dipilih
2. Build permission map: `{ app_id → { menu_path → { show, insert, update, delete } } }`
3. Simpan ke Redis: `user_permissions:{id_pengguna}`
4. TTL: 1800 detik (30 menit)

**Saat admin ubah RBAC (MenuRole CRUD):**
1. Invalidate semua `user_permissions:*` yang punya `id_peran` terkait
2. Atau: invalidate per user yang online (dari `user_context:*` keys)

### SQL Query untuk Build Permission Map
```sql
SELECT 
    CONVERT(VARCHAR(36), m.id_aplikasi) AS app_id,
    m.nm_file AS menu_path,
    ISNULL(mr.a_boleh_show, 0) AS can_show,
    ISNULL(mr.a_boleh_insert, 0) AS can_insert,
    ISNULL(mr.a_boleh_update, 0) AS can_update,
    ISNULL(mr.a_boleh_delete, 0) AS can_delete,
    ISNULL(mr.approval_menu, 0) AS needs_approval
FROM man_akses.menu_role mr
INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
WHERE mr.id_peran = ?
  AND ISNULL(mr.soft_delete, 0) = 0
  AND m.a_aktif = 1
```

### Redis Key Format
```
Key:   user_permissions:{id_pengguna}
TTL:   1800 seconds
Value: JSON {
  "id_peran": 43,
  "nm_peran": "Dekan",
  "cached_at": "2026-03-18T22:00:00+07:00",
  "apps": {
    "1892552D-2C7B-4C63-8127-751712FFC7B4": {
      "/dashboard/pimpinan": { "show": 1, "insert": 0, "update": 0, "delete": 0 },
      "/dashboard/pimpinan/mahasiswa": { "show": 1, "insert": 0, "update": 0, "delete": 0 },
      "/dashboard/pimpinan/iku": { "show": 1, "insert": 0, "update": 0, "delete": 0 }
    },
    "432F1D35-9913-4AF1-922A-01C6A0FC3940": {
      "/dashboard/project-management": { "show": 1, "insert": 1, "update": 1, "delete": 1 },
      "/dashboard/project-management/board": { "show": 1, "insert": 1, "update": 1, "delete": 0 }
    }
  }
}
```

### Invalidation Strategy
```
Event: Admin ubah menu_role (save RBAC)
Action: 
  1. Get all online users with that role: SCAN user_context:*
  2. For each: DEL user_permissions:{id_pengguna}
  3. Next request → auto re-cache (lazy load)
```

---

## Phase 2: Service Middleware — Enforce Permissions

### 2A. Go Services (api-service, project-service, dll)

**File: `shared/middleware/rbac_permission.go`** (shared across Go services)

```go
// Pseudo-code
func RBACPermission(redisClient *redis.Client) gin.HandlerFunc {
    return func(c *gin.Context) {
        userId := c.GetString("user_id")  // dari JWT/KongAuth
        
        // 1. Get permissions from Redis
        permsJSON := redisClient.Get("user_permissions:" + userId)
        if permsJSON == "" {
            c.Next() // No permissions cached = allow (fallback, atau 403)
            return
        }
        
        // 2. Match request path → menu
        var perms PermissionCache
        json.Unmarshal(permsJSON, &perms)
        
        // 3. Find matching app + menu
        menuPerms := findMatchingMenu(perms, c.Request.URL.Path)
        if menuPerms == nil {
            c.Next() // Menu not in RBAC = allow (permissive)
            return
        }
        
        // 4. Check method → permission
        switch c.Request.Method {
        case "GET":
            if !menuPerms.Show { abort403(c); return }
        case "POST":
            if !menuPerms.Insert { abort403(c); return }
        case "PUT", "PATCH":
            if !menuPerms.Update { abort403(c); return }
        case "DELETE":
            if !menuPerms.Delete { abort403(c); return }
        }
        
        // 5. Pass permissions to handler (for conditional logic)
        c.Set("permissions", menuPerms)
        c.Next()
    }
}
```

### 2B. PHP Services (auth-service, dashboard-service, public-service)

**File: `app/Http/Middleware/CheckCrudPermission.php`** (sudah ada, perlu extend)

```php
// Pseudo-code
public function handle($request, Closure $next) {
    $userId = auth()->id() ?? $request->user()?->id;
    
    // 1. Get from Redis
    $perms = Redis::get("user_permissions:{$userId}");
    if (!$perms) return $next($request); // Lazy: allow if no cache
    
    $perms = json_decode($perms, true);
    
    // 2. Match route → menu → permission
    $menuPerms = $this->findMatchingMenu($perms, $request->path());
    if (!$menuPerms) return $next($request);
    
    // 3. Check method
    $method = $request->method();
    if ($method === 'GET' && !$menuPerms['show']) abort(403);
    if ($method === 'POST' && !$menuPerms['insert']) abort(403);
    if (in_array($method, ['PUT','PATCH']) && !$menuPerms['update']) abort(403);
    if ($method === 'DELETE' && !$menuPerms['delete']) abort(403);
    
    // 4. Pass to request for conditional logic
    $request->merge(['_permissions' => $menuPerms]);
    return $next($request);
}
```

### Path Matching Strategy
```
API path:    /api/v1/dashboard/pimpinan/mahasiswa/export
Menu path:   /dashboard/pimpinan/mahasiswa

Matching: strip /api/v1 prefix, find longest matching menu path
Fallback: if no match, check parent path (/dashboard/pimpinan)
Default:  if still no match → ALLOW (permissive mode, log warning)
```

---

## Phase 3: Frontend — Conditional UI Rendering

### 3A. UserContext API Extension

**Current response:**
```json
{ "nm_peran": "Dekan", "id_peran": 43, ... }
```

**Extended response:**
```json
{
  "nm_peran": "Dekan",
  "id_peran": 43,
  "permissions": {
    "/dashboard/pimpinan": { "show": 1, "insert": 0, "update": 0, "delete": 0 },
    "/dashboard/pimpinan/mahasiswa": { "show": 1, "insert": 0, "update": 0, "delete": 0 }
  }
}
```

### 3B. Permission Hook

**File: `frontend/src/lib/hooks/usePermission.ts`**

```tsx
export function usePermission(menuPath: string) {
  const { activeContext } = useUserContext();
  const perms = activeContext?.permissions?.[menuPath];
  
  return {
    canShow: perms?.show ?? true,
    canInsert: perms?.insert ?? false,
    canUpdate: perms?.update ?? false,
    canDelete: perms?.delete ?? false,
    isReadOnly: perms ? (perms.show && !perms.insert && !perms.update && !perms.delete) : false,
  };
}
```

### 3C. Usage in Components

```tsx
function MahasiswaPage() {
  const { canInsert, canDelete, isReadOnly } = usePermission("/dashboard/pimpinan/mahasiswa");
  
  return (
    <div>
      <DataTable ... />
      {canInsert && <Button>Export Excel</Button>}
      {canDelete && <Button color="danger">Hapus</Button>}
      {isReadOnly && <Chip color="warning">Read Only</Chip>}
    </div>
  );
}
```

---

## Phase 4: RBAC UI Revamp — Matrix Editor

### Current Problem
- `MenuRoleTable` = tabel tradisional, assign 1-per-1 per role per menu
- Tidak efisien untuk manage banyak role × banyak menu

### New Design: Permission Matrix

```
┌─────────────────────────────────────────────────────┐
│ RBAC Portal Internal                                │
│ [Pilih Aplikasi ▼] Dashboard Pimpinan               │
│                                                     │
│ Quick Actions:                                      │
│ [Read Only All] [Full Access All] [Reset]           │
│                                                     │
│ ┌──────────────┬────────┬────────┬────────┬────────┐│
│ │ Menu         │ Lihat  │ Tambah │ Edit   │ Hapus  ││
│ ├──────────────┼────────┼────────┼────────┼────────┤│
│ │              │        │        │        │        ││
│ │ Role: Dekan                                      ││
│ │ ☑ Beranda    │  ✅    │  ❌    │  ❌    │  ❌    ││
│ │ ☑ Mahasiswa  │  ✅    │  ❌    │  ❌    │  ❌    ││
│ │ ☑ Dosen      │  ✅    │  ❌    │  ❌    │  ❌    ││
│ │ ☑ IKU        │  ✅    │  ❌    │  ❌    │  ❌    ││
│ │                                                  ││
│ │ Role: Developer                                  ││
│ │ ☑ Beranda    │  ✅    │  ✅    │  ✅    │  ✅    ││
│ │ ☑ Mahasiswa  │  ✅    │  ✅    │  ✅    │  ✅    ││
│ │                                                  ││
│ └──────────────┴────────┴────────┴────────┴────────┘│
│                                                     │
│ [💾 Simpan Perubahan]                [Batal]        │
│                                                     │
│ Templates: [Read Only] [Viewer] [Editor] [Admin]    │
│ Apply template to: [Pilih Role ▼] [Apply]           │
└─────────────────────────────────────────────────────┘
```

### Features
1. **Pilih Aplikasi** → load semua menu + semua role yang punya akses
2. **Matrix grid** → checkbox per cell (Show/Insert/Update/Delete)
3. **Templates** → Read Only, Viewer, Editor, Full Access — 1 klik apply
4. **Bulk toggle** → select all per kolom (semua Show), per row (semua permission untuk 1 menu)
5. **Diff indicator** → highlight cells yang berubah sebelum save
6. **Floating save** → sticky button, show jumlah perubahan
7. **Responsive** → card view di mobile (expandable per role → menu list)
8. **Search/filter** → filter menu by name, filter role

### API Endpoints (Auth Service)

```
GET    /api/v1/manakses/rbac/matrix?app_id=xxx
       → Returns: { roles: [...], menus: [...], assignments: { role_id → { menu_id → perms } } }

POST   /api/v1/manakses/rbac/matrix/bulk
       → Body: { app_id, changes: [{ id_peran, id_menu, show, insert, update, delete }] }
       → Bulk upsert, invalidate Redis cache

POST   /api/v1/manakses/rbac/matrix/template
       → Body: { app_id, id_peran, template: "read_only"|"editor"|"full_access" }
       → Apply template to all menus for a role
```

---

## Phase 5: Export/Download Permission (Optional)

### Problem
`a_boleh_insert` untuk export agak ambigu. Options:

**Option A: Pakai `a_boleh_insert` sebagai "Export"**
- Pro: ga perlu ubah schema
- Con: semantik kurang jelas

**Option B: Tambah kolom `a_boleh_export`**
```sql
ALTER TABLE man_akses.menu_role ADD a_boleh_export NUMERIC(1,0) DEFAULT 0;
```
- Pro: jelas, terpisah
- Con: perlu alter table

**Recommendation: Option A dulu** — pakai `a_boleh_insert` sebagai "Create/Export". Kalau nanti perlu granularity lebih, baru Option B.

---

## Implementation Order

| Phase | Effort | Impact | Priority |
|-------|--------|--------|----------|
| Phase 4: RBAC UI Matrix | 3-4 jam | High (UX) | 🔴 P1 |
| Phase 1: Auth cache permissions | 1-2 jam | High (foundation) | 🔴 P1 |
| Phase 3: Frontend permission hook | 2-3 jam | High (visible) | 🟡 P2 |
| Phase 2: Service middleware | 2-3 jam | Medium (security) | 🟡 P2 |
| Phase 5: Export permission | 30 min | Low | 🟢 P3 |

**Recommended order: Phase 1 → Phase 4 → Phase 3 → Phase 2 → Phase 5**
Alasan: Cache dulu (foundation), lalu UI biar admin bisa manage, lalu frontend biar user lihat efeknya, terakhir enforcement di backend.

**Total estimasi: 1-2 malam kerja**

---

## Rollback Plan
- Phase 1: Hapus Redis key pattern `user_permissions:*`
- Phase 2: Disable middleware (config flag `RBAC_ENFORCEMENT=false`)
- Phase 3: Remove `usePermission` hook, buttons show by default
- Phase 4: Revert ke MenuRoleTable lama

## Notes
- Super roles (Administrator=1, Developer=107) → **bypass semua check** (full access)
- Permissive mode default: jika menu tidak terdaftar di RBAC → allow
- Redis DB: gunakan DB yang sama dengan auth cache (DB 1 di staging)
- Frontend permission hook harus **memoized** (useMemo) agar tidak re-render berlebihan
