# Publikasi Charts Update - Kategori Capaian & Peran

**Date**: 2025-10-23
**Purpose**: Update publikasi charts to show only 2 charts: Kategori Capaian Luaran and Publikasi per Peran

## Overview

Based on user request: "publikasi munculkan ini saja 2 chart : kategori_capaian_luaran : 1. chart berdasarkan id_kat_capaian disitu ada HKI dll sepertinya dipisah chartnya dan Publikasi per Peran saja"

### Data Distribution

**Kategori Capaian Luaran** (Total: 11,304 publikasi):
- Publikasi: 9,334 (82.6%)
- HKI: 672 (5.9%)
- Pembicara: 498 (4.4%)
- Buku: 375 (3.3%)
- Jenis Luaran Lainnya: 361 (3.2%)
- Produk Teknologi Tepat Guna: 64 (0.6%)

**Publikasi per Peran** (Total: 14,373 publikasi):
- Penulis: 13,517 (94.0%)
- Penemu: 405 (2.8%)
- Editor: 401 (2.8%)
- Penerjemah: 50 (0.4%)

## 1. Backend Repository Updates

### File: `app/Repositories/PublikasiRepository.php`

Add two new methods:

```php
/**
 * Get publikasi statistics by kategori capaian luaran
 *
 * @param int|null $startYear Start year for filtering (default: current year - 5)
 * @param int|null $endYear End year for filtering (default: current year)
 * @return array Array of kategori capaian with counts
 */
public function getPublikasiByKategoriCapaian(?int $startYear = null, ?int $endYear = null): array
{
    $currentYear = (int) date('Y');
    $startYear = $startYear ?? ($currentYear - 5);
    $endYear = $endYear ?? $currentYear;

    $sql = "
        SELECT
            kc.id_kat_capaian,
            COALESCE(kc.nm_kat_capaian, 'Lainnya') AS kategori,
            COUNT(DISTINCT p.id_publikasi) AS jumlah
        FROM pdrd.publikasi AS p
        LEFT JOIN ref.kategori_capaian_luaran AS kc
            ON kc.id_kat_capaian = p.id_kat_capaian
        WHERE p.soft_delete = 0
            AND p.tgl_terbit IS NOT NULL
            AND YEAR(p.tgl_terbit) >= ?
            AND YEAR(p.tgl_terbit) <= ?
        GROUP BY kc.id_kat_capaian, kc.nm_kat_capaian
        ORDER BY jumlah DESC
    ";

    $result = DB::connection('sqlsrv')->select($sql, [$startYear, $endYear]);

    return array_map(function ($item) {
        return [
            'kategori' => $item->kategori,
            'jumlah' => (int) $item->jumlah,
        ];
    }, $result);
}

/**
 * Get publikasi statistics by peran (role of author)
 * Only includes publikasi from active Unila dosen
 *
 * @param int|null $startYear Start year for filtering (default: current year - 5)
 * @param int|null $endYear End year for filtering (default: current year)
 * @return array Array of peran with counts
 */
public function getPublikasiByPeran(?int $startYear = null, ?int $endYear = null): array
{
    $currentYear = (int) date('Y');
    $startYear = $startYear ?? ($currentYear - 5);
    $endYear = $endYear ?? $currentYear;

    $sql = "
        SELECT
            CASE tp.peran_tulis
                WHEN 'A' THEN 'Penulis'
                WHEN 'B' THEN 'Editor'
                WHEN 'C' THEN 'Penerjemah'
                WHEN 'D' THEN 'Penemu'
                ELSE 'Lainnya'
            END as peran,
            COUNT(DISTINCT p.id_publikasi) AS jumlah
        FROM pdrd.publikasi AS p
        INNER JOIN pdrd.tulis_pub AS tp
            ON tp.id_publikasi = p.id_publikasi
            AND tp.soft_delete = 0
        INNER JOIN pdrd.sdm AS sdm
            ON sdm.id_sdm = tp.id_sdm
        -- Get only latest reg_ptk per dosen (avoid duplicates)
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
        ) AS ptk
            ON ptk.id_sdm = sdm.id_sdm
            AND ptk.rn = 1
        INNER JOIN ref.satuan_pendidikan AS sp
            ON sp.id_sp = ptk.id_sp
        INNER JOIN pdrd.sms AS sms
            ON sms.id_sms = ptk.id_sms
        INNER JOIN ref.prodi AS prodi
            ON prodi.id_prodi = sms.id_prodi
        INNER JOIN ref.jenjang_pendidikan AS jp
            ON jp.id_jenj_didik = prodi.id_jenj_didik
        WHERE p.soft_delete = 0
            AND sdm.id_jns_sdm = '12' -- Dosen only
            AND sp.nm_lemb = 'Universitas Lampung'
            AND sms.stat_prodi = 'A' -- Active program
            AND (jp.nm_jenj_didik LIKE 'D%' OR jp.nm_jenj_didik LIKE 'S%')
            AND p.tgl_terbit IS NOT NULL
            AND YEAR(p.tgl_terbit) >= ?
            AND YEAR(p.tgl_terbit) <= ?
        GROUP BY tp.peran_tulis
        ORDER BY jumlah DESC
    ";

    $result = DB::connection('sqlsrv')->select($sql, [$startYear, $endYear]);

    return array_map(function ($item) {
        return [
            'peran' => $item->peran,
            'jumlah' => (int) $item->jumlah,
        ];
    }, $result);
}
```

## 2. Service Layer Updates

### File: `app/Services/PublikasiService.php`

Update the `getPublikasiStatistics()` method:

```php
/**
 * Get publikasi statistics
 *
 * @param int|null $startYear Start year for filtering
 * @param int|null $endYear End year for filtering
 * @return array Publikasi statistics data
 */
public function getPublikasiStatistics(?int $startYear = null, ?int $endYear = null): array
{
    $byJenis = $this->publikasiRepository->getPublikasiByJenis($startYear, $endYear);
    $byYear = $this->publikasiRepository->getPublikasiByYear($startYear, $endYear);
    $byKategoriCapaian = $this->publikasiRepository->getPublikasiByKategoriCapaian($startYear, $endYear);
    $byPeran = $this->publikasiRepository->getPublikasiByPeran($startYear, $endYear);
    $total = $this->publikasiRepository->getTotalPublikasi($startYear, $endYear);

    return [
        'total' => $total,
        'by_jenis' => $byJenis,
        'by_year' => $byYear,
        'by_kategori_capaian' => $byKategoriCapaian,
        'by_peran' => $byPeran,
    ];
}
```

## 3. Controller Updates

### File: `app/Http/Controllers/OpenApi/PublikasiController.php`

Update the OpenAPI schema to include new fields:

```php
#[OA\Schema(
    schema: 'PublikasiStatistics',
    properties: [
        new OA\Property(property: 'total', type: 'integer', example: 11304),
        new OA\Property(
            property: 'by_jenis',
            type: 'array',
            items: new OA\Items(
                properties: [
                    new OA\Property(property: 'jenis', type: 'string', example: 'Jurnal'),
                    new OA\Property(property: 'jumlah', type: 'integer', example: 8500),
                ]
            )
        ),
        new OA\Property(
            property: 'by_year',
            type: 'array',
            items: new OA\Items(
                properties: [
                    new OA\Property(property: 'tahun', type: 'integer', example: 2024),
                    new OA\Property(property: 'jumlah', type: 'integer', example: 2100),
                ]
            )
        ),
        new OA\Property(
            property: 'by_kategori_capaian',
            type: 'array',
            items: new OA\Items(
                properties: [
                    new OA\Property(property: 'kategori', type: 'string', example: 'Publikasi'),
                    new OA\Property(property: 'jumlah', type: 'integer', example: 9334),
                ]
            )
        ),
        new OA\Property(
            property: 'by_peran',
            type: 'array',
            items: new OA\Items(
                properties: [
                    new OA\Property(property: 'peran', type: 'string', example: 'Penulis'),
                    new OA\Property(property: 'jumlah', type: 'integer', example: 13517),
                ]
            )
        ),
    ]
)]
```

## 4. Frontend Service Updates

### File: `frontend/src/lib/services/publikasiService.ts`

Update TypeScript interfaces:

```typescript
export interface PublikasiByKategoriCapaian {
  kategori: string;
  jumlah: number;
}

export interface PublikasiByPeran {
  peran: string;
  jumlah: number;
}

export interface PublikasiStatistics {
  total: number;
  by_jenis: PublikasiByJenis[];
  by_year: PublikasiByYear[];
  by_kategori_capaian: PublikasiByKategoriCapaian[];
  by_peran: PublikasiByPeran[];
}
```

## 5. Frontend Component Updates

### File: `frontend/src/shared/components/PenelitianPublikasi.tsx`

Add two new chart configurations in the Publikasi section:

```typescript
// Chart 3: Publikasi by Kategori Capaian Luaran
const kategoriCapaianOption = {
  title: {
    text: 'Kategori Capaian Luaran',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 600,
    },
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    data: publikasiData.by_kategori_capaian.map((item) => item.kategori),
  },
  series: [
    {
      name: 'Kategori',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      data: publikasiData.by_kategori_capaian.map((item) => ({
        name: item.kategori,
        value: item.jumlah,
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      label: {
        formatter: '{b}\n{c} ({d}%)',
      },
    },
  ],
  color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'],
};

// Chart 4: Publikasi by Peran
const peranOption = {
  title: {
    text: 'Publikasi per Peran',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 600,
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: publikasiData.by_peran.map((item) => item.peran),
    axisLabel: {
      rotate: 45,
      interval: 0,
    },
  },
  yAxis: {
    type: 'value',
    name: 'Jumlah',
  },
  series: [
    {
      name: 'Jumlah',
      type: 'bar',
      data: publikasiData.by_peran.map((item) => item.jumlah),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#3b82f6' },
          { offset: 1, color: '#1d4ed8' },
        ]),
      },
      barMaxWidth: 60,
    },
  ],
};
```

Add the chart rendering in the Publikasi section grid:

```tsx
{/* Publikasi Section */}
<section className="py-16 bg-white">
  <div className="container mx-auto px-4">
    {/* Header */}
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Publikasi</h2>
      <p className="text-gray-600">Data publikasi dosen Universitas Lampung</p>
    </div>

    {publikasiData && (
      <>
        {/* Summary Card */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Publikasi</h3>
            <p className="text-4xl font-bold">{publikasiData.total.toLocaleString()}</p>
          </div>
        </div>

        {/* Charts Grid - 2x2 layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: By Jenis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <ReactECharts option={jenisOption} style={{ height: '350px' }} />
          </div>

          {/* Chart 2: By Year */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <ReactECharts option={yearOption} style={{ height: '350px' }} />
          </div>

          {/* Chart 3: By Kategori Capaian */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <ReactECharts option={kategoriCapaianOption} style={{ height: '350px' }} />
          </div>

          {/* Chart 4: By Peran */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <ReactECharts option={peranOption} style={{ height: '350px' }} />
          </div>
        </div>
      </>
    )}
  </div>
</section>
```

## 6. Testing Checklist

### Backend Testing

```bash
# Test API endpoint
curl -s "http://localhost:9800/dashboard-service/public/api/v1/publikasi/statistics" | python -c "import json, sys; d=json.load(sys.stdin); print('Success:', d['success']); print('Total:', d['data']['total']); print('Kategori Capaian:', len(d['data']['by_kategori_capaian'])); print('Peran:', len(d['data']['by_peran']))"
```

Expected output:
- Success: True
- Total: ~11,304
- Kategori Capaian: 6 categories
- Peran: 4 roles

### Database Verification

```php
// Via tinker
php artisan tinker --execute="
\$data = app(App\Services\PublikasiService::class)->getPublikasiStatistics();
echo 'Total: ' . \$data['total'] . PHP_EOL;
echo 'Kategori Capaian: ' . count(\$data['by_kategori_capaian']) . PHP_EOL;
echo 'Peran: ' . count(\$data['by_peran']) . PHP_EOL;
print_r(\$data['by_kategori_capaian']);
print_r(\$data['by_peran']);
"
```

## 7. Summary

**Changes Made**:
1. Added 2 new repository methods for kategori capaian and peran
2. Updated service to include new data fields
3. Updated OpenAPI schema documentation
4. Updated frontend TypeScript interfaces
5. Added 2 new chart configurations (pie chart for kategori, bar chart for peran)

**Data Points**:
- Kategori Capaian Luaran: 6 categories (Publikasi, HKI, Pembicara, Buku, dll)
- Publikasi per Peran: 4 roles (Penulis, Penemu, Editor, Penerjemah)

**Key Features**:
- Year filtering support (default: last 5 years)
- Uses reg_ptk subquery pattern for peran chart (avoid duplicates)
- Only counts active Unila dosen for peran chart
- Distinct count to avoid duplication

**Next Steps**:
1. Apply changes to PublikasiRepository.php
2. Update PublikasiService.php
3. Update OpenAPI schema in PublikasiController.php
4. Update frontend service and component
5. Test endpoints and charts
