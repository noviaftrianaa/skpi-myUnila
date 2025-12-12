# User Context API - Summary

## Overview

Fitur User Context digunakan untuk mengelola pemilihan role dan unit organisasi user sebelum mengakses aplikasi. Ini memungkinkan satu user memiliki beberapa role di berbagai unit dan memilih context yang aktif saat masuk ke aplikasi.

## Files Created/Modified

### New Files

| File | Description |
|------|-------------|
| `app/Repositories/UserContext/UserContextRepository.php` | Repository dengan native SQL queries |
| `app/Services/UserContext/UserContextService.php` | Business logic + Redis cache |
| `app/Http/Controllers/Api/UserContextController.php` | HTTP Controller |

### Modified Files

| File | Changes |
|------|---------|
| `routes/api.php` | Added user-context routes under jwt.auth middleware |

## API Endpoints

Base URL: `/api/v1/user-context`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user's available roles and units |
| POST | `/select` | Select active context (role + unit) |
| GET | `/active` | Get current active context from cache |
| GET | `/check-access` | Check if user can access specific app |
| DELETE | `/clear` | Clear user context (logout) |

## API Responses

### 1. GET `/api/v1/user-context` - Get User Context

```json
{
    "success": true,
    "message": "User context berhasil diambil",
    "data": {
        "user": {
            "id_pengguna": "26004417-6E92-463C-BF35-F741817121DC",
            "username": "mizar.zulmi",
            "nm_pengguna": "Mizar Zulmi Ramadahan, S.Kom",
            "email": "mizar.zulmi@staff.unila.ac.id"
        },
        "roles": [
            {
                "id_role_pengguna": "83777AF4-BAD1-44B6-ADDD-904B6F322CE1",
                "id_peran": "107",
                "nm_peran": "Developer",
                "id_organisasi": "86942CDF-44F1-446E-8E9E-CB37BBBB16E6",
                "nm_organisasi": "Semua Unit",
                "level_organisasi": "0",
                "id_induk_organisasi": null,
                "approval_peran": true,
                "sk_penugasan": null,
                "tgl_sk_penugasan": null,
                "tgl_kadarluasa": null,
                "last_active": "2025-12-11 21:07:24.377"
            }
        ],
        "active_context": null
    }
}
```

### 2. POST `/api/v1/user-context/select` - Select Context

**Request:**
```json
{
    "id_role_pengguna": "83777AF4-BAD1-44B6-ADDD-904B6F322CE1"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Context berhasil dipilih",
    "data": {
        "active_context": {
            "id_role_pengguna": "83777AF4-BAD1-44B6-ADDD-904B6F322CE1",
            "id_peran": "107",
            "nm_peran": "Developer",
            "id_organisasi": "86942CDF-44F1-446E-8E9E-CB37BBBB16E6",
            "nm_organisasi": "Semua Unit",
            "level_organisasi": "0",
            "selected_at": "2025-12-11T21:35:45+07:00"
        }
    }
}
```

### 3. GET `/api/v1/user-context/active` - Get Active Context

```json
{
    "success": true,
    "message": "Active context ditemukan",
    "data": {
        "active_context": {
            "id_role_pengguna": "83777AF4-BAD1-44B6-ADDD-904B6F322CE1",
            "id_peran": "107",
            "nm_peran": "Developer",
            "id_organisasi": "86942CDF-44F1-446E-8E9E-CB37BBBB16E6",
            "nm_organisasi": "Semua Unit",
            "level_organisasi": "0",
            "selected_at": "2025-12-11T21:35:45+07:00"
        },
        "has_context": true
    }
}
```

### 4. GET `/api/v1/user-context/check-access?app_id=xxx` - Check App Access

```json
{
    "success": true,
    "message": "Akses diizinkan",
    "data": {
        "has_access": true,
        "requires_context_selection": false,
        "context": {
            "id_role_pengguna": "83777AF4-BAD1-44B6-ADDD-904B6F322CE1",
            "nm_peran": "Developer",
            "nm_organisasi": "Semua Unit"
        },
        "app": {
            "id_aplikasi": "948DF317-78F7-4B92-A53F-0A56215E07DE",
            "nm_aplikasi": "MY UNILA",
            "app_key": "=sAwtFoPpp/2i4Qc6JqaNy5rb27Gf772YAYGvYHk9TmV:46esab"
        }
    }
}
```

### 5. DELETE `/api/v1/user-context/clear` - Clear Context

```json
{
    "success": true,
    "message": "Context berhasil dihapus",
    "data": null
}
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE RELATIONSHIPS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   man_akses.pengguna ──┐                                                    │
│   (User)               │                                                    │
│                        ▼                                                    │
│              man_akses.role_pengguna ──┬── man_akses.peran                  │
│              (User's Role Assignment)  │   (Role Definition)                │
│                        │               │                                    │
│                        │               ▼                                    │
│                        │     man_akses.menu_role ── man_akses.menu          │
│                        │     (Role's Menu Access)   (Menu → App)            │
│                        │                                   │                │
│                        ▼                                   ▼                │
│              man_akses.unit_organisasi         man_akses.aplikasi           │
│              (Organization Unit)               (Application)                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Tables

| Table | Purpose |
|-------|---------|
| `pengguna` | User data (synced from SSO/LDAP) |
| `role_pengguna` | **Assigns role + unit to user** |
| `peran` | Role definitions (Developer, Mahasiswa, Dosen, etc.) |
| `unit_organisasi` | Organization units (Fakultas, Prodi, etc.) |
| `menu_role` | Maps role to menu access |
| `menu` | Menu items linked to applications |
| `aplikasi` | Application definitions |

## How Access Control Works

```
User Login
    │
    ▼
GET /user-context ─────────────────────────────────────────┐
    │                                                      │
    ▼                                                      │
┌─────────────────────────────────────┐                    │
│ Response: List of user's roles      │                    │
│ - Developer @ Semua Unit            │                    │
│ - Admin Prodi @ Ilmu Komputer       │                    │
│ - Mahasiswa @ Prodi Teknik Sipil    │                    │
└─────────────────────────────────────┘                    │
    │                                                      │
    ▼                                                      │
User clicks on an App (e.g., SIAKAD)                       │
    │                                                      │
    ▼                                                      │
┌─────────────────────────────────────┐                    │
│ Filter roles that have access to    │                    │
│ SIAKAD (via menu_role → menu)       │                    │
└─────────────────────────────────────┘                    │
    │                                                      │
    ├── Only 1 role? ───► Auto-select & redirect           │
    │                                                      │
    └── Multiple roles? ──► Show modal to choose           │
                                │                          │
                                ▼                          │
                    POST /user-context/select              │
                    { "id_role_pengguna": "xxx" }          │
                                │                          │
                                ▼                          │
                    Context saved to Redis (5 min TTL)     │
                                │                          │
                                ▼                          │
                    Redirect to Application                │
                                │                          │
                                ▼                          │
                    App calls GET /check-access ───────────┘
                    to verify user's permission
```

## Caching Strategy

- **Cache Key**: `user_context:{user_id}`
- **TTL**: 300 seconds (5 minutes)
- **Storage**: Redis
- **Purpose**: Store active context to avoid repeated DB queries

## Super Roles

These roles have full access to all applications:
- `id_peran = 1` (Administrator)
- `id_peran = 107` (Developer)

## Prerequisites for Frontend Implementation

Before implementing frontend, ensure:

1. **Menu Role Setup**: Each role must have menu entries in `menu_role` table
2. **Application Registration**: Apps must be registered in `aplikasi` table
3. **Menu Registration**: Menus must be linked to applications in `menu` table

### Query to Check Role's App Access

```sql
SELECT DISTINCT
    a.id_aplikasi,
    a.nm_aplikasi,
    p.id_peran,
    p.nm_peran
FROM man_akses.role_pengguna rp
INNER JOIN man_akses.peran p ON p.id_peran = rp.id_peran
INNER JOIN man_akses.menu_role mr ON mr.id_peran = p.id_peran
INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
INNER JOIN man_akses.aplikasi a ON a.id_aplikasi = m.id_aplikasi
WHERE rp.id_pengguna = 'user-uuid-here'
  AND rp.soft_delete = 0
  AND rp.approval_peran = 1
ORDER BY a.nm_aplikasi;
```

## Next Steps

1. **Create Menu Management API** (if not exists) to manage `menu` and `menu_role`
2. **Add endpoint** `GET /user-context/apps` to get list of accessible apps with roles
3. **Implement Frontend** portal with role selection modal
4. **Integrate** with existing applications to validate context on entry

## Architecture Pattern

Follows existing auth-service pattern:
- **Repository**: Native SQL queries (no Eloquent)
- **Service**: Business logic + caching
- **Controller**: HTTP request/response handling

---

*Generated: 2025-12-11*
