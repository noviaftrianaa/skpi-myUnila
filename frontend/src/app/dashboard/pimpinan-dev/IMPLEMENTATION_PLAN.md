# Implementation Plan: Role-Based Filtering untuk Dashboard Pimpinan

## Context

Dashboard pimpinan saat ini menampilkan **semua data** tanpa mempertimbangkan role user. Rektor, Dekan, dan Kaprodi melihat tampilan yang sama (semua fakultas dan prodi).

**Tujuan:** Implementasikan filtering otomatis berdasarkan role user:
- **Rektor (level 1)**: Melihat semua fakultas dan prodi (tidak ada filter)
- **Dekan (level 2)**: Otomatis melihat fakultasnya dan semua prodi di dalamnya
- **Kaprodi (level 3)**: Otomatis melihat prodinya saja

---

## User Context Structure

Informasi user context yang tersedia:

```typescript
activeContext: {
  id_organisasi: string;        // ID organisasi user saat ini
  nm_organisasi: string;        // Nama organisasi
  level_organisasi: number;     // 1=University, 2=Faculty, 3=Study Program
  id_induk_organisasi: string;  // ID parent organisasi (untuk level 2/3)
}
```

**Organization Levels:**
- `level_organisasi = 1`: University level (Rektor)
- `level_organisasi = 2`: Faculty level (Dekan)
- `level_organisasi = 3`: Study Program level (Kaprodi)

---

## Implementation Overview

**Pendekatan: Frontend-First dengan Backend Support**

1. **Backend** - Tambahkan optional filter parameters ke API endpoints
2. **Frontend** - Gunakan `activeContext` untuk auto-filter dan auto-selection
3. **UI** - Hide/disable dropdowns sesuai role user

**Keuntungan:**
- Backend service Rasio & Dosen SUDAH memiliki filtering capabilities
- Hanya perlu tambahkan filtering ke Akreditasi service
- Backward compatible - Rektor tetap bisa lihat semua data

---

## Backend Changes

### 1. Akreditasi Service

**File:** `backend/executive-service/app/Services/AkreditasiService.php`

Update method `getDataAkreditasiFakultas()` untuk menerima filter parameters:

```php
public function getDataAkreditasiFakultas($idOrganisasi = null, $levelOrganisasi = null)
{
    $data_fakultas = $this->akreditasiRepository->getDataAkreditasiFakultas();

    // Filter berdasarkan level organisasi
    if ($levelOrganisasi == 2 && $idOrganisasi) {
        // Dekan: filter ke fakultasnya saja
        $data_fakultas = $data_fakultas->filter(function ($item) use ($idOrganisasi) {
            return $item->id == $idOrganisasi;
        });
    } else if ($levelOrganisasi == 3 && $idOrganisasi) {
        // Kaprodi: filter ke fakultas induknya
        $data_fakultas = $data_fakultas->filter(function ($item) use ($idOrganisasi) {
            return $item->id == $idOrganisasi;
        });
    }

    return $data_fakultas;
}
```

### 2. Akreditasi Controller

**File:** `backend/executive-service/app/Http/Controllers/AkreditasiController.php`

Update method `getDataAkreditasiFakultas()` untuk accept query parameters:

```php
public function getDataAkreditasiFakultas(Request $request)
{
    try {
        $idOrganisasi = $request->query('id_organisasi');
        $levelOrganisasi = $request->query('level_organisasi');

        $data = $this->akreditasiService->getDataAkreditasiFakultas(
            $idOrganisasi,
            $levelOrganisasi
        );

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
}
```

### 3. Rasio Service

**File:** `backend/executive-service/app/Services/RasioService.php`

Update method `getRasioFakultas()` untuk menerima `fakultas_id` parameter.

### 4. Rasio Controller

**File:** `backend/executive-service/app/Http/Controllers/RasioController.php`

Update method `getRasioFakultas()` untuk accept `fakultas_id` query parameter.

---

## Frontend Changes

### 1. Akreditasi Service Types

**File:** `frontend/src/lib/services/executive/akreditasiService.ts`

```typescript
export interface GetFakultasParams {
  search?: string;
  page?: number;
  per_page?: number;
  id_organisasi?: string;      // Add
  level_organisasi?: number;   // Add
}
```

### 2. Akreditasi Page

**File:** `frontend/src/app/dashboard/pimpinan/akreditasi/page.tsx`

**Import userContext:**
```typescript
import { useUserContext } from "@/contexts/UserContextContext";
```

**Add hook:**
```typescript
const { activeContext } = useUserContext();
```

**Update query dengan filter parameters:**
```typescript
const { data: fakultasData = [] } = useQuery({
  queryKey: ["akreditasi", "fakultas", activeContext?.id_organisasi, activeContext?.level_organisasi],
  queryFn: () => executiveAkreditasiService.getAllFakultas({
    id_organisasi: activeContext?.id_organisasi,
    level_organisasi: activeContext?.level_organisasi,
  }),
});
```

**Auto-select untuk Dekan/Kaprodi:**
```typescript
useEffect(() => {
  if (!activeContext || !fakultasData.length) return;

  if (activeContext.level_organisasi === 2 && fakultasData.length === 1) {
    setSelectedFakultas(fakultasData[0]); // Dekan
  } else if (activeContext.level_organisasi === 3 && fakultasData.length === 1) {
    setSelectedFakultas(fakultasData[0]); // Kaprodi
  }
}, [activeContext, fakultasData]);
```

**Hide back button untuk Dekan/Kaprodi:**
```typescript
{selectedFakultas && activeContext?.level_organisasi === 1 && (
  <Button onPress={handleBack} ...>
    Kembali ke Daftar Fakultas
  </Button>
)}
```

**Hide stats untuk Dekan/Kaprodi:**
```typescript
{!selectedFakultas && activeContext?.level_organisasi === 1 && (
  <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
    {/* Stats cards */}
  </div>
)}
```

### 3. Dosen Page

**File:** `frontend/src/app/dashboard/pimpinan/dosen/page.tsx`

**Import dan hook (sama seperti Akreditasi page):**
```typescript
import { useUserContext } from "@/contexts/UserContextContext";

const { activeContext } = useUserContext();
```

**Auto-select logic:**
```typescript
useEffect(() => {
  if (!activeContext || !fakultasList.length) return;

  if (activeContext.level_organisasi === 2) {
    setSelectedFakultas(activeContext.id_organisasi);
  } else if (activeContext.level_organisasi === 3) {
    setSelectedFakultas(activeContext.id_induk_organisasi);
    setTimeout(() => {
      setSelectedProdi(activeContext.id_organisasi);
    }, 100);
  }
}, [activeContext, fakultasList]);
```

**Hide dropdowns untuk Dekan/Kaprodi:**
```typescript
{activeContext?.level_organisasi !== 2 && activeContext?.level_organisasi !== 3 && (
  <Select placeholder="Pilih fakultas" ... />
)}

{activeContext?.level_organisasi !== 3 && (
  <Select placeholder="Pilih prodi" ... />
)}
```

### 4. useDosenData Hook

**File:** `frontend/src/shared/components/pimpinan/dosen/useDosenData.ts`

**Update interface dan hook signature untuk accept `userContext`:**
```typescript
export interface UseDosenDataParams {
  selectedTipeData: string;
  selectedTahunAjaran: string;
  selectedFakultas: string;
  selectedProdi: string;
  userContext?: {
    id_organisasi: string;
    level_organisasi: number;
    id_induk_organisasi: string;
  } | null;
}

export const useDosenData = ({
  selectedTipeData,
  selectedTahunAjaran,
  selectedFakultas,
  selectedProdi,
  userContext,
}: UseDosenDataParams) => {
  // ... pass userContext ke semua service calls
}
```

### 5. Rasio Page

**File:** `frontend/src/app/dashboard/pimpinan/rasio/page.tsx`

Implementasi sama seperti Dosen page:
- Import `useUserContext`
- Add `activeContext` hook
- Auto-select fakultas/prodi
- Hide dropdowns sesuai role
- Pass filter ke service calls

### 6. Rasio Service Types

**File:** `frontend/src/lib/services/executive/rasioService.ts`

```typescript
export interface GetFakultasParams {
  tahun_ajaran?: string;
  fakultas_id?: string;  // Add
}
```

---

## User Experience per Role

### Rektor (Level 1)
- ✅ Full access ke semua dropdowns
- ✅ Bisa navigate freely antar fakultas dan prodi
- ✅ Back button visible saat drill-down
- ✅ Stats cards shown at top level
- **Tidak ada perubahan dari behavior sekarang**

### Dekan (Level 2)
- 🔒 Fakultas dropdown: HIDDEN/DISABLED (auto-selected)
- ✅ Prodi dropdown: ENABLED (bisa browse semua prodi di fakultasnya)
- ❌ Back button: HIDDEN
- ✅ Stats cards: SHOWN (untuk fakultasnya)
- ℹ️ Otomatis filter ke fakultasnya

### Kaprodi (Level 3)
- 🔒 Fakultas dropdown: HIDDEN/DISABLED (auto-selected)
- 🔒 Prodi dropdown: HIDDEN/DISABLED (auto-selected)
- ❌ Back button: HIDDEN
- ✅ Stats cards: SHOWN (untuk prodinya)
- ℹ️ Otomatis filter ke prodinya

---

## Testing Checklist

### Test sebagai Rektor
- [ ] Buka `/dashboard/pimpinan/akreditasi` - lihat semua fakultas
- [ ] Buka `/dashboard/pimpinan/dosen` - bisa pilih semua fakultas & prodi
- [ ] Buka `/dashboard/pimpinan/rasio` - bisa pilih semua fakultas & prodi
- [ ] Stats cards muncul untuk semua data
- [ ] Bisa drill-down dan kembali

### Test sebagai Dekan
- [ ] Buka `/dashboard/pimpinan/akreditasi` - otomatis filter ke fakultasnya
- [ ] Buka `/dashboard/pimpinan/dosen` - fakultas dropdown disabled
- [ ] Buka `/dashboard/pimpinan/rasio` - otomatis pilih fakultasnya
- [ ] Hanya bisa lihat prodi di dalam fakultasnya
- [ ] Back button tidak muncul
- [ ] Data sesuai dengan scope fakultas

### Test sebagai Kaprodi
- [ ] Buka `/dashboard/pimpinan/akreditasi` - otomatis ke prodi view
- [ ] Buka `/dashboard/pimpinan/dosen` - kedua dropdown disabled
- [ ] Buka `/dashboard/pimpinan/rasio` - otomatis pilih prodinya
- [ ] Data menampilkan hanya prodinya
- [ ] Tidak bisa ganti fakultas/prodi
- [ ] Back button tidak muncul

### Test Role Switching
- [ ] Switch dari Rektor ke Dekan - data update otomatis
- [ ] Switch dari Dekan ke Kaprodi - filter update
- [ ] Tidak perlu refresh halaman
- [ ] Query parameters terkirim dengan benar

---

## Files Summary

### Backend Files (4 files)
1. `backend/executive-service/app/Services/AkreditasiService.php`
2. `backend/executive-service/app/Http/Controllers/AkreditasiController.php`
3. `backend/executive-service/app/Services/RasioService.php`
4. `backend/executive-service/app/Http/Controllers/RasioController.php`

### Frontend Files (8 files)
1. `frontend/src/lib/services/executive/akreditasiService.ts`
2. `frontend/src/app/dashboard/pimpinan/akreditasi/page.tsx`
3. `frontend/src/app/dashboard/pimpinan/dosen/page.tsx`
4. `frontend/src/shared/components/pimpinan/dosen/useDosenData.ts`
5. `frontend/src/app/dashboard/pimpinan/rasio/page.tsx`
6. `frontend/src/lib/services/executive/rasioService.ts`
7. `frontend/src/shared/components/pimpinan/rasio/RasioDataModal.tsx` ✅ (done - pagination fix)
8. `frontend/src/shared/components/pimpinan/dosen/DosenDataModal.tsx` ✅ (done - pagination fix)

---

## Next Steps

Setelah plan ini disetujui, implementasi akan dilakukan dengan urutan:

1. **Phase 1:** Backend changes (Akreditasi & Rasio services)
2. **Phase 2:** Frontend service layer updates
3. **Phase 3:** Page-level implementations (Akreditasi → Dosen → Rasio)
4. **Phase 4:** Testing dan refinement
5. **Phase 5:** Documentation handoff

**Estimated Timeline:** 2-3 hari untuk complete implementation

---

## Notes

- **Backward Compatible:** Semua changes backward compatible. Rektor tetap bisa melihat semua data tanpa perubahan behavior.
- **Performance:** Filter parameters bersifat optional. Query parameters ditambahkan ke React Query keys untuk proper cache invalidation.
- **Security:** Backend filtering memastikan data security. Frontend filtering hanya untuk UX improvement.
- **Extensibility:** Pattern ini bisa diaplikasikan ke halaman dashboard lainnya di masa depan.
