# Update Query Requirements - Publikasi & Penelitian

## Requirements:
1. **reg_ptk Filter**: Hanya ambil 1 reg_ptk terbaru per dosen berdasarkan `tgl_srt_tgs DESC`
2. **Year Filter**: Tambahkan parameter fleksibel untuk filter tahun (yearStart, yearEnd)
3. **Publikasi**: Filter berdasarkan `publikasi.tgl_terbit` 5 tahun terakhir (default)
4. **Penelitian**: Filter berdasarkan `litabmas.id_thn_kegiatan` 5 tahun terakhir (default)

## 1. Update PublikasiRepository.php

### Perubahan Join reg_ptk:
```php
-- OLD:
INNER JOIN pdrd.reg_ptk AS ptk
    ON ptk.id_sdm = sdm.id_sdm
    AND ptk.soft_delete = 0
    AND ptk.id_jns_keluar IS NULL
    AND CAST(ptk.id_sp AS VARCHAR(50)) = ?

-- NEW (ambil terbaru per dosen):
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

### Method Signature Update:
```php
// OLD:
public function getPublikasiByJenis(): array
public function getTotalPublikasi(): int
public function getPublikasiByYear(): array

// NEW (dengan parameter tahun):
public function getPublikasiByJenis(?int $yearStart = null, ?int $yearEnd = null): array
public function getTotalPublikasi(?int $yearStart = null, ?int $yearEnd = null): int
public function getPublikasiByYear(?int $yearStart = null, ?int $yearEnd = null): array
```

### Tambahkan di awal method:
```php
// Set default years if not provided
$currentYear = (int) date('Y');
$yearStart = $yearStart ?? ($currentYear - 5);
$yearEnd = $yearEnd ?? $currentYear;
```

### Update WHERE clause:
```php
WHERE p.soft_delete = 0
    AND p.tgl_terbit IS NOT NULL
    AND YEAR(p.tgl_terbit) >= ?  -- yearStart
    AND YEAR(p.tgl_terbit) <= ?  -- yearEnd
```

### Update select parameters:
```php
// OLD:
$result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp]);

// NEW:
$result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $yearStart, $yearEnd]);
```

---

## 2. Update PenelitianRepository.php

### Perubahan Join reg_ptk:
Same as PublikasiRepository (gunakan subquery dengan ROW_NUMBER)

### Method Signature Update:
```php
// OLD:
public function getPenelitianByKategori(): array
public function getTotalPenelitian(): int
public function getPenelitianByYear(): array

// NEW:
public function getPenelitianByKategori(?int $yearStart = null, ?int $yearEnd = null): array
public function getTotalPenelitian(?int $yearStart = null, ?int $yearEnd = null): int
public function getPenelitianByYear(?int $yearStart = null, ?int $yearEnd = null): array
```

### Update WHERE clause:
```php
WHERE l.soft_delete = 0
    AND l.jns_litabmas = 'L'
    AND l.id_thn_kegiatan IS NOT NULL
    AND l.id_thn_kegiatan >= ?  -- yearStart
    AND l.id_thn_kegiatan <= ?  -- yearEnd
```

---

## 3. Update Service Layer

### PublikasiService.php:
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
        'year_start' => $yearStart ?? ((int) date('Y') - 5),
        'year_end' => $yearEnd ?? (int) date('Y'),
    ];
}
```

### PenelitianService.php:
```php
public function getPenelitianStatistics(?int $yearStart = null, ?int $yearEnd = null): array
{
    $byKategori = $this->penelitianRepository->getPenelitianByKategori($yearStart, $yearEnd);
    $byYear = $this->penelitianRepository->getPenelitianByYear($yearStart, $yearEnd);
    $total = $this->penelitianRepository->getTotalPenelitian($yearStart, $yearEnd);

    return [
        'total' => $total,
        'by_kategori' => $byKategori,
        'by_year' => $byYear,
        'year_start' => $yearStart ?? ((int) date('Y') - 5),
        'year_end' => $yearEnd ?? (int) date('Y'),
    ];
}
```

---

## 4. Update Controller Layer

### PublikasiController.php:
```php
use Illuminate\Http\Request;

public function getStatistics(Request $request): JsonResponse
{
    try {
        $yearStart = $request->query('year_start') ? (int) $request->query('year_start') : null;
        $yearEnd = $request->query('year_end') ? (int) $request->query('year_end') : null;

        $data = $this->publikasiService->getPublikasiStatistics($yearStart, $yearEnd);

        return response()->json([
            'success' => true,
            'message' => 'Data statistik publikasi berhasil diambil',
            'data' => $data,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Gagal mengambil data statistik publikasi',
            'error' => $e->getMessage(),
        ], 500);
    }
}
```

### PenelitianController.php:
```php
use Illuminate\Http\Request;

public function getStatistics(Request $request): JsonResponse
{
    try {
        $yearStart = $request->query('year_start') ? (int) $request->query('year_start') : null;
        $yearEnd = $request->query('year_end') ? (int) $request->query('year_end') : null;

        $data = $this->penelitianService->getPenelitianStatistics($yearStart, $yearEnd);

        return response()->json([
            'success' => true,
            'message' => 'Data statistik penelitian berhasil diambil',
            'data' => $data,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Gagal mengambil data statistik penelitian',
            'error' => $e->getMessage(),
        ], 500);
    }
}
```

---

## 5. API Usage Examples

### Default (5 years):
```bash
GET /api/v1/publikasi/statistics
GET /api/v1/penelitian/statistics
```

### Custom year range:
```bash
GET /api/v1/publikasi/statistics?year_start=2020&year_end=2024
GET /api/v1/penelitian/statistics?year_start=2020&year_end=2024
```

### Response will include:
```json
{
  "success": true,
  "data": {
    "total": 1234,
    "by_jenis": [...],
    "by_year": [...],
    "year_start": 2020,
    "year_end": 2024
  }
}
```

---

## 6. Other Repositories to Update (DosenRepository, etc.)

Semua repository yang menggunakan `pdrd.reg_ptk` harus diupdate dengan subquery yang sama:

### Files to check:
- ✅ PublikasiRepository.php
- ✅ PenelitianRepository.php
- ⚠️ DosenRepository.php
- ⚠️ UnilaStatisticsRepository.php
- ⚠️ ProgramStudiRepository.php
- ⚠️ MahasiswaSebaranRepository.php (jika ada join ke reg_ptk)

### Pattern to replace in ALL repositories:
```php
// Find this pattern:
INNER JOIN pdrd.reg_ptk AS ptk
    ON ptk.id_sdm = sdm.id_sdm
    AND ptk.soft_delete = 0
    AND ptk.id_jns_keluar IS NULL
    AND CAST(ptk.id_sp AS VARCHAR(50)) = ?

// Replace with:
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

## Testing Checklist:

- [ ] Test publikasi statistics dengan default (5 tahun)
- [ ] Test publikasi statistics dengan custom year range
- [ ] Test penelitian statistics dengan default (5 tahun)
- [ ] Test penelitian statistics dengan custom year range
- [ ] Verify reg_ptk hanya 1 per dosen (tidak ada duplikasi)
- [ ] Verify data publikasi sesuai tgl_terbit
- [ ] Verify data penelitian sesuai id_thn_kegiatan
- [ ] Update frontend untuk support year filter (optional)
- [ ] Update all other repositories yang pakai reg_ptk

---

## SQL untuk Verifikasi:

### Check reg_ptk duplicates:
```sql
SELECT id_sdm, COUNT(*) as count
FROM (
    SELECT id_sdm, ROW_NUMBER() OVER (PARTITION BY id_sdm ORDER BY tgl_srt_tgs DESC) AS rn
    FROM pdrd.reg_ptk
    WHERE soft_delete = 0 AND id_jns_keluar IS NULL
) sub
WHERE rn = 1
GROUP BY id_sdm
HAVING COUNT(*) > 1
-- Should return 0 rows
```

### Check publikasi year range:
```sql
SELECT
    YEAR(tgl_terbit) as tahun,
    COUNT(*) as jumlah
FROM pdrd.publikasi
WHERE soft_delete = 0
    AND tgl_terbit IS NOT NULL
    AND YEAR(tgl_terbit) >= 2020
    AND YEAR(tgl_terbit) <= 2024
GROUP BY YEAR(tgl_terbit)
ORDER BY tahun DESC
```
