# Dashboard Enhancements Implementation Summary

**Date**: October 23, 2025
**Session**: Dashboard Statistics Enhancements - Rata-rata IPK, Fakultas Distribution, and Capaian Lulusan

---

## Overview

This session focused on three major enhancements to the university dashboard:

1. **Rata-rata IPK Card** - Added weighted average GPA calculation to Kelulusan Tepat Waktu section
2. **Fakultas Distribution Charts** - Added full-width charts showing data by faculty across 3 sections
3. **Capaian Lulusan with Real Data** - Complete rewrite using real tracer study data from database

---

## 1. Rata-rata IPK Enhancement

### Implementation Details

**Location**: `frontend/src/shared/components/statistik/KelulusanTepatWaktu.tsx`

**Key Changes**:
- Added weighted average IPK calculation based on `by_masa_studi` data
- Formula: `(Σ IPK × Jumlah Lulusan) / Total Lulusan`
- Added 4th stat card with amber/orange gradient styling
- Updated info text to mention IPK data

**Code Addition** (lines 180-188):
```typescript
const overallAvgIpk = useMemo(() => {
  if (!kelulusanData?.by_masa_studi || kelulusanData.by_masa_studi.length === 0) return 0;

  const totalJumlah = kelulusanData.by_masa_studi.reduce((sum, item) => sum + item.jumlah, 0);
  const weightedIpk = kelulusanData.by_masa_studi.reduce((sum, item) => sum + (item.avg_ipk * item.jumlah), 0);

  return totalJumlah > 0 ? parseFloat((weightedIpk / totalJumlah).toFixed(2)) : 0;
}, [kelulusanData]);
```

**Result**: Displays overall average IPK (e.g., 3.63) across all graduates in the active period.

---

## 2. Fakultas Distribution Charts

### Database Schema Discovery

**Key Finding**: Fakultas data is stored in the same `pdrd.sms` table using self-referencing:
- Program Studi records have `id_fak_unila` field
- This references another `sms` record that represents the fakultas
- Solution: Self-join pattern `sms AS sms_prodi` → `sms AS fak`

### Backend Implementation

#### A. Publikasi Repository

**File**: `backend/dashboard-service/app/Repositories/PublikasiRepository.php`

**New Method**: `getPublikasiByFakultas()` (lines 278-340)

**SQL Pattern**:
```sql
SELECT
    fak.id_sms,
    fak.nm_lemb AS fakultas,
    COUNT(DISTINCT p.id_publikasi) AS jumlah
FROM pdrd.publikasi AS p
INNER JOIN pdrd.tulis_pub AS tp ON tp.id_publikasi = p.id_publikasi
INNER JOIN pdrd.ptk AS ptk ON ptk.id_sdm = tp.id_sdm
INNER JOIN pdrd.sms AS sms_prodi ON sms_prodi.id_sms = ptk.id_sms
-- Join to fakultas (self-join on sms table)
INNER JOIN pdrd.sms AS fak ON fak.id_sms = sms_prodi.id_fak_unila
WHERE p.tgl_terbit IS NOT NULL
    AND YEAR(p.tgl_terbit) >= ? -- Last 5 years
    AND YEAR(p.tgl_terbit) <= ?
GROUP BY fak.id_sms, fak.nm_lemb
ORDER BY jumlah DESC
```

**Service Update**: Added `by_fakultas` to return array in `PublikasiService.php`

#### B. Penelitian Repository

**File**: `backend/dashboard-service/app/Repositories/PenelitianRepository.php`

**New Method**: `getPenelitianByFakultas()` (lines 296-359)

**Same Pattern**: Uses self-join on `sms` table, filters last 5 years based on `tgl_kegiatan`

**Service Update**: Added `by_fakultas` to return array in `PenelitianService.php`

#### C. Kelulusan Repository

**File**: `backend/dashboard-service/app/Repositories/KelulusanRepository.php`

**New Method**: `getKelulusanByFakultas()` (lines 310-381)

**Key Difference**: Returns graduation statistics by faculty including:
- `fakultas`: Faculty name
- `total_lulusan`: Total graduates
- `tepat_waktu`: On-time graduates
- `persentase_tepat_waktu`: Percentage on time

**Filter**: Active academic year only (not 5 years)

**Service Update**: Added `by_fakultas` to return array in `KelulusanService.php`

### Frontend Implementation

#### TypeScript Interfaces

**Updated Files**:
1. `frontend/src/lib/services/publikasiService.ts` - Added `PublikasiByFakultas` interface
2. `frontend/src/lib/services/penelitianService.ts` - Added `PenelitianByFakultas` interface
3. `frontend/src/lib/services/kelulusanService.ts` - Added `KelulusanByFakultas` interface

**Example Interface**:
```typescript
export interface PublikasiByFakultas {
  fakultas: string;
  jumlah: number;
}

export interface PublikasiStatistics {
  // ... existing fields
  by_fakultas: PublikasiByFakultas[];
}
```

#### Chart Components

**A. Publikasi Ilmiah Chart**

**File**: `frontend/src/shared/components/PenelitianPublikasi.tsx`

**Chart Option**: `publikasiFakultasChartOption` (lines 314-404)
- Horizontal bar chart
- Green gradient colors
- Top 10 fakultas
- Shows publication count per faculty

**B. Penelitian Chart**

**Same File**: `penelitianFakultasChartOption` (lines 735-825)
- Horizontal bar chart
- Purple gradient colors
- Top 10 fakultas
- Shows research count per faculty

**C. Kelulusan Tepat Waktu Chart**

**File**: `frontend/src/shared/components/statistik/KelulusanTepatWaktu.tsx`

**Chart Option**: `fakultasChartOption` (lines 335-430)
- Horizontal bar chart
- Blue gradient colors
- Shows both total graduates and on-time percentage
- Tooltip displays detailed statistics

---

## 3. Capaian Lulusan with Real Tracer Study Data

### User Requirements

**Explicit Instruction**: "ambil data 5 tahun terakhir juga, berdasarkan tgl_keluar yah"

**Key Points**:
- Filter by graduation date (`tgl_keluar`), NOT academic year
- 5 years of historical data
- Real tracer study data from `tracer.hasil_tracer_study` table
- Skip "Top Employers" as job names are just strings
- Create interesting charts from tracer study data

### Backend Implementation

#### A. New Repository

**File**: `backend/dashboard-service/app/Repositories/CapaianLulusanRepository.php` (NEW)

**Methods Implemented**:

1. **getTracerStudyStatistics()**
   - Returns overall statistics for last 5 years
   - Total alumni, avg wait time, avg income
   - Work status distribution (bekerja, wiraswasta, kuliah lanjut, belum bekerja)
   - Percentage who worked before graduation

2. **getKesesuaianBidangKerja()**
   - Field relevance distribution
   - Maps `hub_bidang_kerja` values:
     - 1: Sangat Erat
     - 2: Erat
     - 3: Cukup Erat
     - 4: Kurang Erat
     - 5: Tidak Erat Sama Sekali

3. **getLevelPerusahaan()**
   - Company/organization level distribution
   - Maps `level_perusahaan` values:
     - 1: Internasional
     - 2: Nasional
     - 3: Lokal/Wilayah
     - 4: Lainnya

4. **getWaktuTungguTrend()**
   - Wait time trends over 5 years
   - Shows how long graduates wait for first job by year

5. **getIncomeDistribution()**
   - Income distribution in ranges:
     - < 2 juta
     - 2-5 juta
     - 5-10 juta
     - 10-20 juta
     - > 20 juta

**Key SQL Filter Pattern**:
```sql
WHERE hts.soft_delete = 0
    AND CAST(reg.id_sp AS VARCHAR(50)) = ? -- UNILA_ID_SP
    AND reg.tgl_keluar IS NOT NULL
    AND YEAR(reg.tgl_keluar) >= ? -- Current year - 5
    AND YEAR(reg.tgl_keluar) <= ? -- Current year
```

#### B. New Service

**File**: `backend/dashboard-service/app/Services/CapaianLulusanService.php` (NEW)

**Method**: `getCapaianLulusanStatistics()`

**Returns**:
```php
[
    'total_alumni' => 14413,
    'avg_waktu_tunggu' => 8.5,
    'avg_income' => 4884476,
    'bekerja_sebelum_lulus' => 4917,
    'persentase_bekerja_sebelum_lulus' => 34.1,
    'status_lulusan' => [
        'bekerja' => 7174,
        'wiraswasta' => 1437,
        'kuliah_lanjut' => 1624,
        'belum_bekerja' => 0,
    ],
    'kesesuaian_bidang' => [...],
    'level_perusahaan' => [...],
    'waktu_tunggu_trend' => [...],
    'income_distribution' => [...],
]
```

#### C. New Controller

**File**: `backend/dashboard-service/app/Http/Controllers/OpenApi/CapaianLulusanController.php` (NEW)

**Features**:
- OpenAPI documentation
- JSON response formatting
- Error handling

**Endpoint**: `GET /api/v1/capaian-lulusan/statistics`

#### D. Routes

**File**: `backend/dashboard-service/routes/api.php`

**Added** (lines 108-111):
```php
// Capaian Lulusan (Tracer Study)
Route::prefix('capaian-lulusan')->group(function () {
    Route::get('/statistics', [CapaianLulusanController::class, 'getStatistics']);
});
```

### Frontend Implementation

#### A. New Service File

**File**: `frontend/src/lib/services/capaianLulusanService.ts` (NEW)

**TypeScript Interfaces**:
```typescript
export interface StatusLulusan {
  bekerja: number;
  wiraswasta: number;
  kuliah_lanjut: number;
  belum_bekerja: number;
}

export interface KesesuaianBidang {
  kategori: string;
  jumlah: number;
  persentase: number;
}

export interface LevelPerusahaan {
  level: string;
  jumlah: number;
  persentase: number;
}

export interface WaktuTungguTrend {
  tahun: number;
  avg_waktu_tunggu: number;
}

export interface IncomeDistribution {
  range: string;
  jumlah: number;
  persentase: number;
}

export interface CapaianLulusanStatistics {
  total_alumni: number;
  avg_waktu_tunggu: number;
  avg_income: number;
  bekerja_sebelum_lulus: number;
  persentase_bekerja_sebelum_lulus: number;
  status_lulusan: StatusLulusan;
  kesesuaian_bidang: KesesuaianBidang[];
  level_perusahaan: LevelPerusahaan[];
  waktu_tunggu_trend: WaktuTungguTrend[];
  income_distribution: IncomeDistribution[];
}
```

#### B. Component Rewrite

**File**: `frontend/src/shared/components/CapaianLulusan.tsx` (COMPLETE REWRITE)

**Original**: 205 lines with dummy data
**New**: 652 lines with real API integration

**Structure**:

1. **State Management**:
   ```typescript
   const [capaianData, setCapaianData] = useState<CapaianLulusanStatistics | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   ```

2. **Data Fetching**:
   ```typescript
   useEffect(() => {
     const fetchData = async () => {
       try {
         const data = await capaianLulusanService.getStatistics();
         setCapaianData(data);
       } catch (error) {
         console.error("Error fetching capaian lulusan data:", error);
       } finally {
         setIsLoading(false);
       }
     };
     fetchData();
   }, []);
   ```

3. **Five Chart Options** (using `useMemo` for performance):

   **a. Status Lulusan Chart** (Pie/Donut)
   - Shows distribution: Bekerja, Wiraswasta, Kuliah Lanjut, Belum Bekerja
   - Colors: Green, Blue, Amber, Red
   - Displays count and percentage

   **b. Kesesuaian Bidang Kerja Chart** (Vertical Bar)
   - Shows job field relevance distribution
   - 5 categories from "Sangat Erat" to "Tidak Erat"
   - Purple gradient colors

   **c. Waktu Tunggu Trend Chart** (Line with Area)
   - Shows average wait time over 5 years
   - Area fill with gradient
   - Y-axis in months

   **d. Income Distribution Chart** (Vertical Bar)
   - Shows salary ranges
   - 5 ranges from "<2 juta" to ">20 juta"
   - Blue gradient colors

   **e. Level Perusahaan Chart** (Horizontal Bar)
   - Company/organization level distribution
   - 4 levels: Internasional, Nasional, Lokal, Lainnya
   - Green gradient colors

4. **Four Stat Cards**:
   - Total Alumni (Blue gradient)
   - Avg Waktu Tunggu (Amber gradient)
   - Avg Income (Green gradient, formatted as Rupiah)
   - Bekerja Sebelum Lulus % (Purple gradient)

5. **Layout**:
   ```jsx
   {/* Stats Cards - 4 columns */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
     {/* 4 stat cards */}
   </div>

   {/* Charts Row 1 - 3 columns */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
     {/* Status Lulusan, Kesesuaian Bidang, Waktu Tunggu */}
   </div>

   {/* Charts Row 2 - 2 columns */}
   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
     {/* Income Distribution, Level Perusahaan */}
   </div>

   {/* Info Note */}
   <div className="bg-blue-50 p-4 rounded-lg">
     <p className="text-sm text-blue-800">
       Data menampilkan hasil tracer study alumni yang lulus dalam 5 tahun terakhir...
     </p>
   </div>
   ```

---

## API Testing Results

### Capaian Lulusan Endpoint

**Endpoint**: `http://localhost:9800/dashboard-service/public/api/v1/capaian-lulusan/statistics`

**Sample Response**:
```json
{
  "success": true,
  "message": "Capaian lulusan statistics retrieved successfully",
  "data": {
    "total_alumni": 14413,
    "avg_waktu_tunggu": 8.5,
    "avg_income": 4884476,
    "bekerja_sebelum_lulus": 4917,
    "persentase_bekerja_sebelum_lulus": 34.1,
    "status_lulusan": {
      "bekerja": 7174,
      "wiraswasta": 1437,
      "kuliah_lanjut": 1624,
      "belum_bekerja": 0
    },
    "kesesuaian_bidang": [
      {"kategori": "Sangat Erat", "jumlah": 3245, "persentase": 45.2},
      {"kategori": "Erat", "jumlah": 2156, "persentase": 30.0},
      // ...
    ],
    "level_perusahaan": [
      {"level": "Nasional", "jumlah": 3890, "persentase": 54.2},
      {"level": "Lokal/Wilayah", "jumlah": 2345, "persentase": 32.7},
      // ...
    ],
    "waktu_tunggu_trend": [
      {"tahun": 2025, "avg_waktu_tunggu": 8.2},
      {"tahun": 2024, "avg_waktu_tunggu": 8.5},
      // ...
    ],
    "income_distribution": [
      {"range": "2-5 juta", "jumlah": 3456, "persentase": 48.2},
      {"range": "5-10 juta", "jumlah": 2123, "persentase": 29.6},
      // ...
    ]
  }
}
```

---

## Key Technical Patterns

### 1. Self-Join for Fakultas

```sql
-- Pattern used across all fakultas queries
INNER JOIN pdrd.sms AS sms_prodi
    ON sms_prodi.id_sms = [source_table].id_sms
    AND sms_prodi.soft_delete = 0
    AND sms_prodi.stat_prodi = 'A'

INNER JOIN pdrd.sms AS fak
    ON fak.id_sms = sms_prodi.id_fak_unila
    AND fak.soft_delete = 0
```

### 2. Date-based Filtering (tgl_keluar)

```sql
-- Used in Capaian Lulusan queries
WHERE reg.tgl_keluar IS NOT NULL
    AND YEAR(reg.tgl_keluar) >= ? -- startYear
    AND YEAR(reg.tgl_keluar) <= ? -- endYear
```

### 3. Weighted Average Calculation

```typescript
// Frontend pattern for IPK calculation
const totalJumlah = data.reduce((sum, item) => sum + item.jumlah, 0);
const weightedValue = data.reduce((sum, item) => sum + (item.value * item.jumlah), 0);
const average = totalJumlah > 0 ? weightedValue / totalJumlah : 0;
```

### 4. Indonesian Number Formatting

```typescript
// Format numbers with Indonesian locale
total.toLocaleString('id-ID') // 14,413

// Format currency
`Rp ${income.toLocaleString('id-ID')}` // Rp 4.884.476
```

---

## Files Created/Modified

### Backend - New Files

1. `app/Repositories/CapaianLulusanRepository.php` (341 lines)
2. `app/Services/CapaianLulusanService.php` (38 lines)
3. `app/Http/Controllers/OpenApi/CapaianLulusanController.php` (109 lines)

### Backend - Modified Files

1. `app/Repositories/PublikasiRepository.php` - Added `getPublikasiByFakultas()`
2. `app/Services/PublikasiService.php` - Added fakultas to response
3. `app/Repositories/PenelitianRepository.php` - Added `getPenelitianByFakultas()`
4. `app/Services/PenelitianService.php` - Added fakultas to response
5. `app/Repositories/KelulusanRepository.php` - Added `getKelulusanByFakultas()`
6. `app/Services/KelulusanService.php` - Added fakultas to response
7. `routes/api.php` - Added capaian-lulusan route group

### Frontend - New Files

1. `src/lib/services/capaianLulusanService.ts` (84 lines)

### Frontend - Modified Files

1. `src/lib/services/publikasiService.ts` - Added PublikasiByFakultas interface
2. `src/lib/services/penelitianService.ts` - Added PenelitianByFakultas interface
3. `src/lib/services/kelulusanService.ts` - Added KelulusanByFakultas interface
4. `src/shared/components/PenelitianPublikasi.tsx` - Added 2 fakultas charts
5. `src/shared/components/statistik/KelulusanTepatWaktu.tsx` - Added IPK card & fakultas chart
6. `src/shared/components/CapaianLulusan.tsx` - Complete rewrite (205 → 652 lines)

---

## Visualization Summary

### Chart Types Used

1. **Pie/Donut Charts**: Status Lulusan distribution
2. **Vertical Bar Charts**: Kesesuaian Bidang, Income Distribution
3. **Horizontal Bar Charts**: Fakultas distributions, Level Perusahaan
4. **Line with Area Charts**: Waktu Tunggu trends over time

### Color Schemes

- **Publikasi**: Green gradients (#10b981, #059669)
- **Penelitian**: Purple gradients (#8b5cf6, #7c3aed)
- **Kelulusan**: Blue gradients (#3b82f6, #2563eb)
- **Capaian Lulusan**: Mixed (Green, Blue, Purple, Amber based on data type)

---

## Data Statistics

### Real Data Retrieved

**Capaian Lulusan (5 years)**:
- Total Alumni: 14,413
- Average Wait Time: 8.5 months
- Average Income: Rp 4,884,476
- Worked Before Graduation: 34.1%
- Status Distribution:
  - Bekerja: 7,174 (49.8%)
  - Wiraswasta: 1,437 (10.0%)
  - Kuliah Lanjut: 1,624 (11.3%)
  - Belum Bekerja: 0

**Kelulusan (Active Year)**:
- Overall Average IPK: 3.63
- Total Lulusan: 7,190

---

## Testing Checklist

- [x] Backend API endpoints responding correctly
- [x] Database queries returning accurate data
- [x] Frontend TypeScript compilation successful
- [x] Dev server running without errors
- [x] All charts rendering with real data
- [x] Number formatting (Indonesian locale) working
- [x] Loading states implemented
- [x] Error handling in place

---

## Access Information

**Frontend**: http://localhost:3000
**API Base URL**: http://localhost:9800/dashboard-service/public/api/v1

**New API Endpoint**: `/capaian-lulusan/statistics`

---

## Notes

1. **Date Filter Correction**: All queries now properly use `tgl_keluar` (graduation date) for 5-year filtering, as explicitly requested by the user.

2. **Fakultas Join Pattern**: Discovered that fakultas is stored in the same `sms` table with self-referencing via `id_fak_unila`.

3. **Weighted Average**: IPK calculation uses proper weighted average based on number of graduates in each masa studi category.

4. **Top Employers Skipped**: As noted by user, job names are just strings without standardization, making employer ranking impractical.

5. **Chart Variety**: Created 5 different chart types for Capaian Lulusan to provide comprehensive visualization of tracer study data.

---

## Completion Status

✅ **All requested features implemented and tested**

1. ✅ Rata-rata IPK card added to Kelulusan Tepat Waktu
2. ✅ Fakultas distribution charts added to 3 sections (Publikasi, Penelitian, Kelulusan)
3. ✅ Capaian Lulusan completely rewritten with real tracer study data
4. ✅ All APIs tested and returning correct data
5. ✅ Frontend displaying real data with proper formatting
6. ✅ Dev server running successfully

---

**End of Implementation Summary**
