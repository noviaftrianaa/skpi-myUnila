# SQL Pattern untuk Update reg_ptk di Semua Repository

## Pattern Lama (SALAH - bisa duplicate):
```sql
INNER JOIN pdrd.reg_ptk AS ptk
    ON ptk.id_sdm = sdm.id_sdm
    AND ptk.soft_delete = 0
    AND ptk.id_jns_keluar IS NULL
    AND CAST(ptk.id_sp AS VARCHAR(50)) = ?
```

## Pattern Baru (BENAR - hanya 1 per dosen):
```sql
-- Join ke reg_ptk terbaru untuk filter dosen aktif di Unila (hanya 1 per dosen)
INNER JOIN (
    SELECT
        id_sdm,
        id_sms,
        id_sp,
        tgl_srt_tgs,
        ROW_NUMBER() OVER (PARTITION BY id_sdm ORDER BY tgl_srt_tgs DESC) AS rn
    FROM pdrd.reg_ptk
    WHERE soft_delete = 0
        AND id_jns_keluar IS NULL
        AND CAST(id_sp AS VARCHAR(50)) = ?
) AS ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.rn = 1
```

---

## Files yang Perlu Diupdate:

### 1. DosenRepository.php
**Methods yang perlu update:**
- ✅ `getDosenByJenjangPendidikan()` - line 29-33
- ✅ `getDosenByJabatanFungsional()` - line 89-93
- ✅ `getTotalDosen()` - line 144 (FROM reg_ptk, join ke sdm)
- ✅ `getTotalGuruBesar()` - line 178 (FROM reg_ptk, join ke sdm)
- ✅ `getTotalDosenDoktor()` - line 224-228

**Note khusus untuk getTotalDosen() dan getTotalGuruBesar():**
Query dimulai FROM reg_ptk, perlu diubah jadi FROM subquery atau FROM sdm dengan subquery reg_ptk

**getTotalDosen() - Pattern Baru:**
```sql
SELECT COUNT(DISTINCT sdm.id_sdm) AS total
FROM pdrd.sdm AS sdm
-- Join ke reg_ptk terbaru (hanya 1 per dosen)
INNER JOIN (
    SELECT
        id_sdm,
        id_sms,
        id_sp,
        tgl_srt_tgs,
        ROW_NUMBER() OVER (PARTITION BY id_sdm ORDER BY tgl_srt_tgs DESC) AS rn
    FROM pdrd.reg_ptk
    WHERE soft_delete = 0
        AND id_jns_keluar IS NULL
        AND CAST(id_sp AS VARCHAR(50)) = ?
) AS ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.rn = 1
INNER JOIN pdrd.sms AS sms
    ON sms.id_sms = ptk.id_sms
    AND sms.soft_delete = 0
    AND sms.stat_prodi = 'A'
INNER JOIN ref.jenjang_pendidikan AS didik
    ON didik.id_jenj_didik = sms.id_jenj_didik
    AND didik.expired_date IS NULL
    AND (didik.nm_jenj_didik LIKE 'D%' OR didik.nm_jenj_didik LIKE 'S%')
WHERE sdm.soft_delete = 0
    AND sdm.id_jns_sdm = '12'
```

---

### 2. PublikasiRepository.php
**Methods yang perlu update:**
- ✅ `getPublikasiByJenis()` - Tambah subquery reg_ptk + year filter
- ✅ `getTotalPublikasi()` - Tambah subquery reg_ptk + year filter
- ✅ `getPublikasiByYear()` - Tambah subquery reg_ptk + year filter

**Tambahan untuk Publikasi:**
1. Tambah parameter `?int $yearStart = null, ?int $yearEnd = null` di method signature
2. Set default years:
   ```php
   $currentYear = (int) date('Y');
   $yearStart = $yearStart ?? ($currentYear - 5);
   $yearEnd = $yearEnd ?? $currentYear;
   ```
3. Update WHERE clause:
   ```sql
   WHERE p.soft_delete = 0
       AND p.tgl_terbit IS NOT NULL
       AND YEAR(p.tgl_terbit) >= ?
       AND YEAR(p.tgl_terbit) <= ?
   ```
4. Update select parameters:
   ```php
   $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $yearStart, $yearEnd]);
   ```

---

### 3. PenelitianRepository.php
**Methods yang perlu update:**
- ✅ `getPenelitianByKategori()` - Tambah subquery reg_ptk + year filter
- ✅ `getTotalPenelitian()` - Tambah subquery reg_ptk + year filter
- ✅ `getPenelitianByYear()` - Tambah subquery reg_ptk + year filter

**Tambahan untuk Penelitian:**
Same as Publikasi, tapi field tahun berbeda:
```sql
WHERE l.soft_delete = 0
    AND l.jns_litabmas = 'L'
    AND l.id_thn_kegiatan IS NOT NULL
    AND l.id_thn_kegiatan >= ?  -- yearStart (integer, bukan YEAR())
    AND l.id_thn_kegiatan <= ?  -- yearEnd
```

---

### 4. PublikasiService.php
Update method signature dan pass parameters:
```php
public function getPublikasiStatistics(?int $yearStart = null, ?int $yearEnd = null): array
{
    $byJenis = $this->publikasiRepository->getPublikasiByJenis($yearStart, $yearEnd);
    $byYear = $this->publikasiRepository->getPublikasiByYear($yearStart, $yearEnd);
    $total = $this->publikasiRepository->getTotalPublikasi($yearStart, $yearEnd);

    return [
        'total' => $total,
        'by_jenis' => $byJenis,
        'by_year' => $byYear,
    ];
}
```

---

### 5. PenelitianService.php
Same pattern as PublikasiService

---

### 6. Controllers (Optional - untuk support query params)
Jika ingin support query params `?year_start=2020&year_end=2024`:

**PublikasiController.php:**
```php
use Illuminate\Http\Request;

public function getStatistics(Request $request): JsonResponse
{
    try {
        $yearStart = $request->query('year_start') ? (int) $request->query('year_start') : null;
        $yearEnd = $request->query('year_end') ? (int) $request->query('year_end') : null;

        $data = $this->publikasiService->getPublikasiStatistics($yearStart, $yearEnd);
        //...
    }
}
```

---

## Testing SQL Queries

### Test reg_ptk uniqueness per dosen:
```sql
-- Should return 0 duplicates
SELECT id_sdm, COUNT(*) as cnt
FROM (
    SELECT
        id_sdm,
        ROW_NUMBER() OVER (PARTITION BY id_sdm ORDER BY tgl_srt_tgs DESC) AS rn
    FROM pdrd.reg_ptk
    WHERE soft_delete = 0
        AND id_jns_keluar IS NULL
        AND CAST(id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
) sub
WHERE rn = 1
GROUP BY id_sdm
HAVING COUNT(*) > 1;
```

### Compare old vs new query results:
```sql
-- OLD (without subquery) - might have duplicates
SELECT COUNT(DISTINCT sdm.id_sdm) as total_dosen_old
FROM pdrd.sdm AS sdm
INNER JOIN pdrd.reg_ptk AS ptk
    ON ptk.id_sdm = sdm.id_sdm
    AND ptk.soft_delete = 0
    AND ptk.id_jns_keluar IS NULL
    AND CAST(ptk.id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
WHERE sdm.soft_delete = 0
    AND sdm.id_jns_sdm = '12';

-- NEW (with subquery) - guaranteed 1 per dosen
SELECT COUNT(DISTINCT sdm.id_sdm) as total_dosen_new
FROM pdrd.sdm AS sdm
INNER JOIN (
    SELECT
        id_sdm,
        id_sms,
        id_sp,
        tgl_srt_tgs,
        ROW_NUMBER() OVER (PARTITION BY id_sdm ORDER BY tgl_srt_tgs DESC) AS rn
    FROM pdrd.reg_ptk
    WHERE soft_delete = 0
        AND id_jns_keluar IS NULL
        AND CAST(id_sp AS VARCHAR(50)) = 'E2B705A7-173E-464A-9FAC-509128709515'
) AS ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.rn = 1
WHERE sdm.soft_delete = 0
    AND sdm.id_jns_sdm = '12';
```

### Test publikasi year filter:
```sql
SELECT
    YEAR(tgl_terbit) as tahun,
    COUNT(DISTINCT id_publikasi) as jumlah
FROM pdrd.publikasi
WHERE soft_delete = 0
    AND tgl_terbit IS NOT NULL
    AND YEAR(tgl_terbit) >= 2020
    AND YEAR(tgl_terbit) <= 2024
GROUP BY YEAR(tgl_terbit)
ORDER BY tahun DESC;
```

---

## Priority Order:

1. **HIGH**: PublikasiRepository + PenelitianRepository (user-facing, butuh year filter)
2. **MEDIUM**: DosenRepository (user-facing, tapi less critical)
3. **LOW**: Other repositories yang belum dipakai frontend

---

## Summary of Changes:

| File | Lines to Change | Complexity | Impact |
|------|----------------|------------|---------|
| PublikasiRepository.php | ~90 lines | High | User-facing |
| PenelitianRepository.php | ~90 lines | High | User-facing |
| DosenRepository.php | ~150 lines | Medium | User-facing |
| PublikasiService.php | ~10 lines | Low | Pass-through |
| PenelitianService.php | ~10 lines | Low | Pass-through |
| PublikasiController.php | ~5 lines | Low | Optional |
| PenelitianController.php | ~5 lines | Low | Optional |

**Total estimated: ~360 lines of code changes**
