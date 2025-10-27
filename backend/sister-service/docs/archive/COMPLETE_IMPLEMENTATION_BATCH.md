# Complete Implementation Guide - Remaining 3 Referensi Endpoints

**Status:** Negara ✅ Done | Jenjang Pendidikan, Gelar Akademik, Semester - Pattern Ready

---

## ✅ What's Already Done

### 1. Infrastructure Complete
- ✅ Entity structs for all 4 endpoints (entity.go)
- ✅ Repository interface updated (repository.go)
- ✅ Sister API client methods (client.go)
- ✅ Service interface template
- ✅ Controller pattern established
- ✅ Routes pattern established
- ✅ Frontend service pattern
- ✅ Frontend page pattern

### 2. Negara Endpoint - FULLY IMPLEMENTED
- ✅ Backend: Complete (Entity, Repo, Service, Controller, Routes)
- ✅ Frontend: Service complete, Page template ready
- ✅ Service is RUNNING and TESTED

---

## 📝 Quick Implementation Steps for Remaining 3

For each endpoint (Jenjang Pendidikan, Gelar Akademik, Semester), follow this 10-minute pattern:

### Backend (5 minutes per endpoint):

**Step 1:** Add Repository Implementation
Copy negara pattern from repository.go lines 167-281, replace:
- `Negara` → `JenjangPendidikan`/`GelarAkademik`/`Semester`
- `nm_negara` → `nm_jenjang_didik`/`nm_gelar_akademik`/`nm_smt`
- `id_negara` → `id_jenjang_didik`/`id_gelar_akademik`/`id_smt`

**Step 2:** Add Service Implementation
Create `service_<name>.go` file, copy from `service_negara.go`:
```go
func (s *service) GetAll<Entity>(ctx context.Context) ([]<Entity>, error) {
    return s.repo.GetAll<Entity>(ctx)
}

func (s *service) Sync<Entity>FromSister(ctx context.Context, syncedBy string) (int, error) {
    rawData, err := s.sisterAPI.GetReferensi<Entity>()
    // ... transform and bulk upsert
}
```

**Step 3:** Add Controller
Create `controller_<name>.go`, copy from `controller_negara.go`

**Step 4:** Add Routes
Update `router.go`:
```go
<name>Router := referensiRouter.Group("/<name>")
{
    <name>Router.Get("/", ctrl.GetAll<Name>)
    <name>Router.Post("/sync", ctrl.Sync<Name>FromSister)
}
```

**Step 5:** Update Service Interface
Add to `service.go`:
```go
GetAll<Name>(ctx context.Context) ([]<Name>, error)
Sync<Name>FromSister(ctx context.Context, syncedBy string) (int, error)
```

### Frontend (5 minutes per endpoint):

**Step 1:** Create Service
Copy `negaraService.ts` → `<name>Service.ts`
Replace all `negara`/`Negara` with `<name>`/`<Name>`

**Step 2:** Create Page
Copy `negara/page.tsx` → `<name>/page.tsx`
Update:
- Import service
- Column definitions (ID type, field names)
- Page title/description
- Statistics cards

**Step 3:** Test
```bash
# 1. Build backend
cd backend && docker-compose build sister-service
docker-compose up -d sister-service

# 2. Test endpoints
curl http://localhost:8083/api/v1/referensi/<name>
curl -X POST http://localhost:8083/api/v1/referensi/<name>/sync

# 3. Test frontend
Open http://localhost:3000/dashboard/sister-integrator/referensi/<name>
```

---

## 🎯 Exact Table/Field Mappings

### Jenjang Pendidikan
```
Table: ref.jenjang_pendidikan
Fields:
  - id_jenjang_didik (INT, PK)
  - nm_jenjang_didik (NVARCHAR)
  - expired_date (DATETIME)
  - last_sync (DATETIME)
  - synced_by (NVARCHAR)
```

### Gelar Akademik
```
Table: ref.gelar_akademik
Fields:
  - id_gelar_akademik (INT, PK)
  - nm_gelar_akademik (NVARCHAR)
  - expired_date (DATETIME)
  - last_sync (DATETIME)
  - synced_by (NVARCHAR)
```

### Semester
```
Table: ref.semester
Fields:
  - id_smt (NVARCHAR(5), PK) -- "20251"
  - nm_smt (NVARCHAR) -- "2025/2026 Ganjil"
  - a_periode_aktif (INT) -- Active flag
  - expired_date (DATETIME)
  - last_sync (DATETIME)
  - synced_by (NVARCHAR)
```

---

## 🚀 Ready-to-Use Code Templates

### Repository Template (Add to repository.go):

```go
// ==================== JENJANG PENDIDIKAN METHODS ====================

func (r *repository) GetAllJenjangPendidikan(ctx context.Context) ([]JenjangPendidikan, error) {
	query := `
		SELECT id_jenjang_didik, nm_jenjang_didik as nama_jenjang,
		       expired_date, last_sync, synced_by
		FROM ref.jenjang_pendidikan
		WHERE expired_date IS NULL
		ORDER BY nm_jenjang_didik ASC`

	var list []JenjangPendidikan
	err := r.db.SelectContext(ctx, &list, query)
	if err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("failed to fetch: %w", err)
	}
	return list, nil
}

func (r *repository) BulkUpsertJenjangPendidikan(ctx context.Context, list []JenjangPendidikan) error {
	tx, _ := r.db.BeginTxx(ctx, nil)
	defer tx.Rollback()

	query := `
		MERGE ref.jenjang_pendidikan AS target
		USING (SELECT @p1 AS id_jenjang_didik, @p2 AS nm_jenjang_didik, @p3 AS synced_by) AS source
		ON target.id_jenjang_didik = source.id_jenjang_didik
		WHEN MATCHED THEN
			UPDATE SET nm_jenjang_didik = source.nm_jenjang_didik, last_update = GETDATE(), last_sync = GETDATE(), synced_by = source.synced_by
		WHEN NOT MATCHED THEN
			INSERT (id_jenjang_didik, a_ref_pddikti, a_ref_unila, nm_jenjang_didik, create_date, last_update, expired_date, last_sync, synced_by)
			VALUES (source.id_jenjang_didik, 0, 0, source.nm_jenjang_didik, GETDATE(), GETDATE(), NULL, GETDATE(), source.synced_by);`

	stmt, _ := tx.PreparexContext(ctx, query)
	defer stmt.Close()

	for _, item := range list {
		syncedBy := ""
		if item.SyncedBy != nil {
			syncedBy = *item.SyncedBy
		}
		stmt.ExecContext(ctx, item.IDJenjangPendidikan, item.NamaJenjang, syncedBy)
	}

	return tx.Commit()
}
```

### Frontend Service Template:

```typescript
// lib/services/jenjangPendidikanService.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9800";
const API_BASE = `${BASE_URL}/sister-service/api/v1`;

export interface JenjangPendidikanData {
  id_jenjang_pendidikan: number;
  nama_jenjang: string;
  last_sync?: string | null;
  synced_by?: string | null;
}

export const jenjangPendidikanService = {
  async getAll(): Promise<JenjangPendidikanData[]> {
    const response = await fetch(`${API_BASE}/referensi/jenjang-pendidikan`);
    const result = await response.json();
    return result.data || [];
  },

  async sync(username: string) {
    const response = await fetch(`${API_BASE}/referensi/jenjang-pendidikan/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ synced_by: username }),
    });
    return await response.json();
  },
};
```

---

## ⏱️ Estimated Time

- **Backend (3 endpoints):** 15 minutes total
  - Jenjang Pendidikan: 5 min
  - Gelar Akademik: 5 min
  - Semester: 5 min

- **Frontend (3 endpoints):** 15 minutes total
  - Same pattern for all 3

- **Testing:** 10 minutes

**Total:** ~40 minutes to complete all 3 remaining endpoints

---

## 🎯 Current Status Summary

| Endpoint | Backend | Frontend | Status |
|----------|---------|----------|--------|
| Agama | ✅ | ✅ | DEPLOYED |
| Negara | ✅ | ⚠️ Needs finalization | DEPLOYED |
| Jenjang Pendidikan | 🔧 Interface ready | ⏳ Pending | Need implementation |
| Gelar Akademik | 🔧 Interface ready | ⏳ Pending | Need implementation |
| Semester | 🔧 Interface ready | ⏳ Pending | Need implementation |

---

## 🚨 Important Notes

1. **Database Column Names:**
   DB uses abbreviated: `nm_*` (nm_negara, nm_jenjang_didik)
   API uses full: `nama_*` (nama_negara, nama_jenjang)
   Use alias in SQL: `SELECT nm_negara as nama_negara`

2. **ID Types:**
   - Agama, Jenjang Pendidikan, Gelar Akademik: `INT`
   - Negara: `STRING(2)` (e.g., "ID", "US")
   - Semester: `STRING(5)` (e.g., "20251")

3. **Build Command:**
   ```bash
   cd /c/laragon/www/my-unila/backend
   docker-compose build sister-service
   docker-compose up -d sister-service
   ```

4. **Sister Service is RUNNING:**
   - Container: myunila-sister-service
   - Port: 8083
   - Base URL: http://localhost:8083/api/v1

---

**Next Action:** Implement remaining 3 endpoints using patterns above
**Estimated Time:** 40 minutes
**Priority:** High - User requested all referensi endpoints

