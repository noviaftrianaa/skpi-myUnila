# Implementasi Chart Tambahan - Penelitian & Publikasi

## Chart Baru yang Ditambahkan:

### PENELITIAN (2 Chart):
1. **Dana Penelitian per Tahun** - Stacked bar showing dana_dikti, dana_pt, dana_institusi_lain
2. **Penelitian per Kelompok Bidang** - Pie chart showing top 10 kelompok bidang

### PUBLIKASI (2 Chart):
3. **Publikasi per Peran** - Pie chart showing Penulis (A), Editor (B), Penerjemah (C), Penemu (D)
4. **Publikasi per Jenis Penulis** - Info card (karena 100% dosen)

---

## 1. Update PenelitianRepository.php

### Tambahkan Method Baru:

```php
/**
 * Get penelitian funding by year
 * Showing dana_dikti, dana_pt, dana_institusi_lain per year
 *
 * @param int|null $yearStart
 * @param int|null $yearEnd
 * @return array
 */
public function getPenelitianFundingByYear(?int $yearStart = null, ?int $yearEnd = null): array
{
    $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

    $currentYear = (int) date('Y');
    $yearStart = $yearStart ?? ($currentYear - 5);
    $yearEnd = $yearEnd ?? $currentYear;

    $sql = "
        SELECT
            l.id_thn_kegiatan AS tahun,
            SUM(ISNULL(l.dana_dikti, 0)) as dana_dikti,
            SUM(ISNULL(l.dana_pt, 0)) as dana_pt,
            SUM(ISNULL(l.dana_institusi_lain, 0)) as dana_institusi_lain,
            SUM(ISNULL(l.dana_dikti, 0) + ISNULL(l.dana_pt, 0) + ISNULL(l.dana_institusi_lain, 0)) as total_dana
        FROM pdrd.litabmas AS l
        INNER JOIN pdrd.sdm_anggota_litabmas AS sal
            ON sal.id_litabmas = l.id_litabmas
            AND sal.soft_delete = 0
            AND sal.peran_litabmas IN ('K', 'A') -- Ketua atau Anggota
        INNER JOIN pdrd.sdm AS sdm
            ON sdm.id_sdm = sal.id_sdm
            AND sdm.soft_delete = 0
            AND sdm.id_jns_sdm = '12'
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
        WHERE l.soft_delete = 0
            AND l.jns_litabmas = 'L'
            AND l.id_thn_kegiatan IS NOT NULL
            AND l.id_thn_kegiatan >= ?
            AND l.id_thn_kegiatan <= ?
        GROUP BY l.id_thn_kegiatan
        ORDER BY tahun DESC
    ";

    $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $yearStart, $yearEnd]);

    return array_map(function($item) {
        return [
            'tahun' => (int) $item->tahun,
            'dana_dikti' => (float) $item->dana_dikti,
            'dana_pt' => (float) $item->dana_pt,
            'dana_institusi_lain' => (float) $item->dana_institusi_lain,
            'total_dana' => (float) $item->total_dana,
        ];
    }, $result);
}

/**
 * Get penelitian by kelompok bidang (Top 10)
 *
 * @param int|null $yearStart
 * @param int|null $yearEnd
 * @return array
 */
public function getPenelitianByKelompokBidang(?int $yearStart = null, ?int $yearEnd = null): array
{
    $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

    $currentYear = (int) date('Y');
    $yearStart = $yearStart ?? ($currentYear - 5);
    $yearEnd = $yearEnd ?? $currentYear;

    $sql = "
        SELECT TOP 10
            COALESCE(kb.nm_kel_bidang, 'Tidak Tercatat') AS kelompok_bidang,
            COUNT(DISTINCT l.id_litabmas) AS jumlah
        FROM pdrd.litabmas AS l
        INNER JOIN pdrd.sdm_anggota_litabmas AS sal
            ON sal.id_litabmas = l.id_litabmas
            AND sal.soft_delete = 0
            AND sal.peran_litabmas IN ('K', 'A')
        INNER JOIN pdrd.sdm AS sdm
            ON sdm.id_sdm = sal.id_sdm
            AND sdm.soft_delete = 0
            AND sdm.id_jns_sdm = '12'
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
        LEFT JOIN ref.kelompok_bidang AS kb
            ON kb.id_kel_bidang = l.id_kel_bidang
        WHERE l.soft_delete = 0
            AND l.jns_litabmas = 'L'
            AND l.id_thn_kegiatan IS NOT NULL
            AND l.id_thn_kegiatan >= ?
            AND l.id_thn_kegiatan <= ?
        GROUP BY kb.nm_kel_bidang
        ORDER BY jumlah DESC
    ";

    $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $yearStart, $yearEnd]);

    return array_map(function($item) {
        return [
            'kelompok_bidang' => $item->kelompok_bidang,
            'jumlah' => (int) $item->jumlah,
        ];
    }, $result);
}
```

---

## 2. Update PublikasiRepository.php

### Tambahkan Method Baru:

```php
/**
 * Get publikasi by peran tulis
 * A = Penulis, B = Editor, C = Penerjemah, D = Penemu/Inventor
 *
 * @param int|null $yearStart
 * @param int|null $yearEnd
 * @return array
 */
public function getPublikasiByPeran(?int $yearStart = null, ?int $yearEnd = null): array
{
    $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

    $currentYear = (int) date('Y');
    $yearStart = $yearStart ?? ($currentYear - 5);
    $yearEnd = $yearEnd ?? $currentYear;

    $sql = "
        SELECT
            CASE tp.peran_tulis
                WHEN 'A' THEN 'Penulis'
                WHEN 'B' THEN 'Editor'
                WHEN 'C' THEN 'Penerjemah'
                WHEN 'D' THEN 'Penemu/Inventor'
                ELSE 'Lainnya'
            END AS peran,
            COUNT(DISTINCT p.id_publikasi) AS jumlah
        FROM pdrd.publikasi AS p
        INNER JOIN pdrd.tulis_pub AS tp
            ON tp.id_publikasi = p.id_publikasi
            AND tp.soft_delete = 0
        INNER JOIN pdrd.sdm AS sdm
            ON sdm.id_sdm = tp.id_sdm
            AND sdm.soft_delete = 0
            AND sdm.id_jns_sdm = '12'
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
        WHERE p.soft_delete = 0
            AND p.tgl_terbit IS NOT NULL
            AND YEAR(p.tgl_terbit) >= ?
            AND YEAR(p.tgl_terbit) <= ?
        GROUP BY tp.peran_tulis
        ORDER BY jumlah DESC
    ";

    $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $yearStart, $yearEnd]);

    return array_map(function($item) {
        return [
            'peran' => $item->peran,
            'jumlah' => (int) $item->jumlah,
        ];
    }, $result);
}

/**
 * Get publikasi summary statistics
 * Including total by jns_penulis (mostly dosen = 1)
 *
 * @param int|null $yearStart
 * @param int|null $yearEnd
 * @return array
 */
public function getPublikasiSummary(?int $yearStart = null, ?int $yearEnd = null): array
{
    $unilaIdSp = strtoupper(env('UNILA_ID_SP', 'E2B705A7-173E-464A-9FAC-509128709515'));

    $currentYear = (int) date('Y');
    $yearStart = $yearStart ?? ($currentYear - 5);
    $yearEnd = $yearEnd ?? $currentYear;

    $sql = "
        SELECT
            COUNT(DISTINCT p.id_publikasi) AS total_publikasi,
            COUNT(DISTINCT CASE WHEN tp.peran_tulis = 'A' THEN p.id_publikasi END) AS total_penulis,
            COUNT(DISTINCT CASE WHEN tp.peran_tulis = 'K' THEN p.id_publikasi END) AS total_ketua,
            COUNT(DISTINCT tp.id_sdm) AS total_penulis_unik,
            AVG(penulis_count.jumlah_penulis) AS avg_penulis_per_publikasi
        FROM pdrd.publikasi AS p
        INNER JOIN pdrd.tulis_pub AS tp
            ON tp.id_publikasi = p.id_publikasi
            AND tp.soft_delete = 0
        INNER JOIN pdrd.sdm AS sdm
            ON sdm.id_sdm = tp.id_sdm
            AND sdm.soft_delete = 0
            AND sdm.id_jns_sdm = '12'
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
        LEFT JOIN (
            SELECT id_publikasi, COUNT(*) as jumlah_penulis
            FROM pdrd.tulis_pub
            WHERE soft_delete = 0
            GROUP BY id_publikasi
        ) AS penulis_count ON penulis_count.id_publikasi = p.id_publikasi
        WHERE p.soft_delete = 0
            AND p.tgl_terbit IS NOT NULL
            AND YEAR(p.tgl_terbit) >= ?
            AND YEAR(p.tgl_terbit) <= ?
    ";

    $result = DB::connection('sqlsrv')->select($sql, [$unilaIdSp, $yearStart, $yearEnd]);

    if (empty($result)) {
        return [
            'total_publikasi' => 0,
            'total_penulis' => 0,
            'total_ketua' => 0,
            'total_penulis_unik' => 0,
            'avg_penulis_per_publikasi' => 0,
        ];
    }

    return [
        'total_publikasi' => (int) $result[0]->total_publikasi,
        'total_penulis' => (int) $result[0]->total_penulis,
        'total_ketua' => (int) $result[0]->total_ketua,
        'total_penulis_unik' => (int) $result[0]->total_penulis_unik,
        'avg_penulis_per_publikasi' => round((float) $result[0]->avg_penulis_per_publikasi, 1),
    ];
}
```

---

## 3. Update Service Layer

### PenelitianService.php:
```php
public function getPenelitianStatistics(?int $yearStart = null, ?int $yearEnd = null): array
{
    $byKategori = $this->penelitianRepository->getPenelitianByKategori($yearStart, $yearEnd);
    $byYear = $this->penelitianRepository->getPenelitianByYear($yearStart, $yearEnd);
    $total = $this->penelitianRepository->getTotalPenelitian($yearStart, $yearEnd);

    // NEW CHARTS
    $funding = $this->penelitianRepository->getPenelitianFundingByYear($yearStart, $yearEnd);
    $byBidang = $this->penelitianRepository->getPenelitianByKelompokBidang($yearStart, $yearEnd);

    return [
        'total' => $total,
        'by_kategori' => $byKategori,
        'by_year' => $byYear,
        'funding_by_year' => $funding,
        'by_kelompok_bidang' => $byBidang,
    ];
}
```

### PublikasiService.php:
```php
public function getPublikasiStatistics(?int $yearStart = null, ?int $yearEnd = null): array
{
    $byJenis = $this->publikasiRepository->getPublikasiByJenis($yearStart, $yearEnd);
    $byYear = $this->publikasiRepository->getPublikasiByYear($yearStart, $yearEnd);
    $total = $this->publikasiRepository->getTotalPublikasi($yearStart, $yearEnd);

    // NEW CHARTS
    $byPeran = $this->publikasiRepository->getPublikasiByPeran($yearStart, $yearEnd);
    $summary = $this->publikasiRepository->getPublikasiSummary($yearStart, $yearEnd);

    return [
        'total' => $total,
        'by_jenis' => $byJenis,
        'by_year' => $byYear,
        'by_peran' => $byPeran,
        'summary' => $summary,
    ];
}
```

---

## 4. Frontend Charts (PenelitianPublikasi.tsx)

### Chart Config untuk Dana Penelitian (Stacked Bar):
```typescript
const penelitianFundingChartOption = useMemo(() => {
    if (!penelitianData || !penelitianData.funding_by_year) return {};

    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params: any) => {
                let result = `<div style="font-weight: 600;">${params[0].name}</div>`;
                params.forEach((param: any) => {
                    const value = (param.value / 1000000000).toFixed(2); // Convert to Milyar
                    result += `<div style="color: ${param.color}">${param.seriesName}: Rp ${value} M</div>`;
                });
                return result;
            },
        },
        legend: {
            data: ['Dana Dikti', 'Dana PT', 'Dana Institusi Lain'],
            bottom: '0%',
        },
        grid: { left: '3%', right: '4%', bottom: '12%', top: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            data: penelitianData.funding_by_year.map(item => item.tahun.toString()),
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (value: number) => `${(value / 1000000000).toFixed(1)}M`,
            },
        },
        series: [
            {
                name: 'Dana Dikti',
                type: 'bar',
                stack: 'total',
                data: penelitianData.funding_by_year.map(item => item.dana_dikti),
                itemStyle: { color: '#3b82f6' },
            },
            {
                name: 'Dana PT',
                type: 'bar',
                stack: 'total',
                data: penelitianData.funding_by_year.map(item => item.dana_pt),
                itemStyle: { color: '#8b5cf6' },
            },
            {
                name: 'Dana Institusi Lain',
                type: 'bar',
                stack: 'total',
                data: penelitianData.funding_by_year.map(item => item.dana_institusi_lain),
                itemStyle: { color: '#10b981' },
            },
        ],
    };
}, [penelitianData]);
```

### Chart Config untuk Kelompok Bidang (Pie):
```typescript
const penelitianBidangChartOption = useMemo(() => {
    if (!penelitianData || !penelitianData.by_kelompok_bidang) return {};

    return {
        tooltip: { trigger: 'item', formatter: '{b}: {c} penelitian ({d}%)' },
        legend: { bottom: '0%', left: 'center', type: 'scroll' },
        series: [{
            name: 'Kelompok Bidang',
            type: 'pie',
            radius: ['40%', '70%'],
            data: penelitianData.by_kelompok_bidang.map((item, index) => ({
                value: item.jumlah,
                name: item.kelompok_bidang,
                itemStyle: {
                    color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
                            '#06b6d4', '#ec4899', '#6366f1', '#84cc16', '#f97316'][index % 10],
                },
            })),
        }],
    };
}, [penelitianData]);
```

---

## 5. API Response Examples

### Penelitian:
```json
{
  "success": true,
  "data": {
    "total": 4965,
    "by_kategori": [...],
    "by_year": [...],
    "funding_by_year": [
      {
        "tahun": 2023,
        "dana_dikti": 6183142521.32,
        "dana_pt": 262328904130.50,
        "dana_institusi_lain": 8746849602.00,
        "total_dana": 277258896253.82
      }
    ],
    "by_kelompok_bidang": [
      { "kelompok_bidang": "Ilmu Hukum", "jumlah": 306 },
      { "kelompok_bidang": "Kimia", "jumlah": 126 }
    ]
  }
}
```

### Publikasi:
```json
{
  "success": true,
  "data": {
    "total": 20607,
    "by_jenis": [...],
    "by_year": [...],
    "by_peran": [
      { "peran": "Penulis", "jumlah": 19850 },
      { "peran": "Penemu/Inventor", "jumlah": 450 },
      { "peran": "Editor", "jumlah": 250 },
      { "peran": "Penerjemah", "jumlah": 57 }
    ],
    "summary": {
      "total_publikasi": 20607,
      "total_penulis_unik": 1523,
      "avg_penulis_per_publikasi": 2.3
    }
  }
}
```

---

## Testing Commands:

```bash
# Test penelitian with new charts
curl -s "http://localhost:9800/dashboard-service/public/api/v1/penelitian/statistics" | python -c "import json, sys; d=json.load(sys.stdin); print(f\"Funding data: {len(d['data'].get('funding_by_year', []))} years\"); print(f\"Bidang data: {len(d['data'].get('by_kelompok_bidang', []))} categories\")"

# Test publikasi with new charts
curl -s "http://localhost:9800/dashboard-service/public/api/v1/publikasi/statistics" | python -c "import json, sys; d=json.load(sys.stdin); print(f\"Peran data: {len(d['data'].get('by_peran', []))} roles\"); print(json.dumps(d['data'].get('summary', {}), indent=2))"
```
