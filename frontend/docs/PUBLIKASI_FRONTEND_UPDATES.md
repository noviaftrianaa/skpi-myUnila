# Publikasi Frontend Updates - Add 2 New Charts

## 1. Update TypeScript Service

### File: `src/lib/services/publikasiService.ts`

Add new interfaces after `PublikasiByYear`:

```typescript
export interface PublikasiByKategoriCapaian {
  kategori: string;
  jumlah: number;
}

export interface PublikasiByPeran {
  peran: string;
  jumlah: number;
}
```

Update `PublikasiStatistics` interface:

```typescript
export interface PublikasiStatistics {
  total: number;
  by_jenis: PublikasiByJenis[];
  by_year: PublikasiByYear[];
  by_kategori_capaian: PublikasiByKategoriCapaian[];  // NEW
  by_peran: PublikasiByPeran[];                        // NEW
}
```

## 2. Update PenelitianPublikasi Component

### File: `src/shared/components/PenelitianPublikasi.tsx`

Add these chart configurations in the Publikasi section (after the existing charts):

```typescript
// Chart 3: Publikasi by Kategori Capaian Luaran (Pie Chart)
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

// Chart 4: Publikasi by Peran (Bar Chart)
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
      label: {
        show: true,
        position: 'top',
        formatter: '{c}',
      },
    },
  ],
};
```

Update the Publikasi section JSX to use a 2x2 grid layout:

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
            <p className="text-sm mt-2 opacity-90">5 tahun terakhir</p>
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

    {!publikasiData && (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Memuat data publikasi...</p>
      </div>
    )}
  </div>
</section>
```

## Expected Chart Data

### Chart 3: Kategori Capaian Luaran (Pie Chart)
- **Publikasi**: 9,334 (82.6%)
- **HKI**: 672 (5.9%)
- **Pembicara**: 498 (4.4%)
- **Buku**: 375 (3.3%)
- **Jenis Luaran Lainnya**: 361 (3.2%)
- **Produk Teknologi Tepat Guna**: 64 (0.6%)

### Chart 4: Publikasi per Peran (Bar Chart)
- **Penulis**: 13,517 (94.0%)
- **Penemu**: 405 (2.8%)
- **Editor**: 401 (2.8%)
- **Penerjemah**: 50 (0.4%)

## Implementation Checklist

- [ ] Update `publikasiService.ts` with new TypeScript interfaces
- [ ] Add `kategoriCapaianOption` chart configuration
- [ ] Add `peranOption` chart configuration
- [ ] Update JSX to use 2x2 grid layout
- [ ] Test API endpoint returns new data fields
- [ ] Verify charts render correctly with real data
- [ ] Check responsive layout on mobile devices
- [ ] Verify tooltips and labels display correctly
- [ ] Test loading states

## Testing

```bash
# Test API endpoint
curl -s "http://localhost:9800/dashboard-service/public/api/v1/publikasi/statistics" | python -c "import json, sys; d=json.load(sys.stdin); print('Kategori Capaian:', len(d['data']['by_kategori_capaian'])); print('Peran:', len(d['data']['by_peran']))"
```

Expected output:
```
Kategori Capaian: 6
Peran: 4
```

## Visual Layout

```
+------------------------------------------+
|         Total Publikasi                  |
|           11,304                         |
|       5 tahun terakhir                   |
+------------------------------------------+

+------------------+  +------------------+
|   By Jenis       |  |   By Year        |
|   (Pie Chart)    |  |   (Line Chart)   |
+------------------+  +------------------+

+------------------+  +------------------+
| Kategori Capaian |  |  By Peran        |
|   (Pie Chart)    |  |  (Bar Chart)     |
+------------------+  +------------------+
```

## Color Scheme

Publikasi section uses **blue-indigo** theme:
- Primary: `#3b82f6` (blue-500)
- Secondary: `#1d4ed8` (blue-700)
- Accent: `#8b5cf6` (violet-500)
- Additional colors for pie chart segments

## Notes

- Both new charts use year filtering (last 5 years by default)
- `kategoriCapaianOption` shows ALL publikasi regardless of dosen affiliation
- `peranOption` shows ONLY publikasi from active Unila dosen (uses reg_ptk subquery)
- Charts are responsive and adapt to mobile screens
- Loading state shows spinner while data is being fetched
