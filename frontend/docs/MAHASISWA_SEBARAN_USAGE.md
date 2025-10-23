# Mahasiswa Sebaran Component - Usage Guide

Komponen untuk menampilkan sebaran mahasiswa berdasarkan wilayah asal.

## Import

```typescript
import { SebaranMahasiswa } from "@/shared/components";
```

## Usage

### Basic Usage

```tsx
import { SebaranMahasiswa } from "@/shared/components";

export default function StatistikPage() {
  return (
    <div>
      <SebaranMahasiswa />
    </div>
  );
}
```

## API Service

### Import Service

```typescript
import {
  getSebaranStatistics,
  getSebaranByKabupaten,
  getSebaranByProvinsi,
} from "@/lib/services/mahasiswaSebaranService";
```

### Fetch Data

```typescript
// Get combined statistics (recommended)
const data = await getSebaranStatistics();

// Get kabupaten only
const kabupatenData = await getSebaranByKabupaten();

// Get provinsi only
const provinsiData = await getSebaranByProvinsi();
```

### Response Types

```typescript
interface SebaranKabupaten {
  id_kabupaten: string;
  nama_kabupaten: string;
  jumlah_mahasiswa: number;
  persentase: number;
}

interface SebaranProvinsi {
  id_provinsi: string;
  nama_provinsi: string;
  jumlah_mahasiswa: number;
  persentase: number;
}

interface SebaranStatisticsResponse {
  success: boolean;
  message: string;
  data: {
    provinsi: {
      data: SebaranProvinsi[];
      total_mahasiswa: number;
      jumlah_provinsi: number;
    };
    kabupaten: {
      data: SebaranKabupaten[];
      total_mahasiswa: number;
      jumlah_kabupaten: number;
    };
    statistics: {
      mahasiswa_lokal_persen: number;
      mahasiswa_luar_daerah_persen: number;
      total_provinsi: number;
      total_kabupaten: number;
    };
  };
}
```

## Component Features

### 1. Data Visualization
- **Bar Chart:** Menampilkan top 10 kabupaten/kota dengan gradient warna
- **Detail List:** Menampilkan detail sebaran dengan progress bar
- **Quick Stats:** 4 kartu statistik (mahasiswa lokal, luar daerah, provinsi, kabupaten)

### 2. Loading State
- Menampilkan loading spinner saat fetch data
- Smooth animation dengan Framer Motion

### 3. Error Handling
- Fallback ke sample data jika API error
- Console error untuk debugging

### 4. Responsive Design
- Mobile-first approach
- Grid layout yang responsive
- Touch-friendly untuk mobile

## Customization

### Custom API URL

Edit file `src/lib/services/mahasiswaSebaranService.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/public/api/v1';
```

Set environment variable:

```bash
NEXT_PUBLIC_DASHBOARD_API_URL=https://api.unila.ac.id/dashboard-service/public/api/v1
```

### Styling

Component menggunakan Tailwind CSS. Untuk custom styling, edit file `src/shared/components/SebaranMahasiswa.tsx`.

### Chart Configuration

Edit `chartOption` di component untuk mengubah warna, label, atau tipe chart.

## Example Usage in Custom Component

```tsx
"use client";

import { useState, useEffect } from "react";
import { getSebaranStatistics } from "@/lib/services/mahasiswaSebaranService";

export default function CustomSebaranDisplay() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSebaranStatistics();
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Total Mahasiswa: {data?.kabupaten.total_mahasiswa}</h2>
      <ul>
        {data?.kabupaten.data.slice(0, 5).map((item, index) => (
          <li key={index}>
            {item.nama_kabupaten}: {item.jumlah_mahasiswa} ({item.persentase}%)
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Performance

- **Caching:** API menggunakan cache 1 jam di backend
- **Dynamic Import:** ECharts dimuat secara dinamis untuk mengurangi bundle size
- **Memoization:** Chart options menggunakan `useMemo` untuk optimasi re-render

## Dependencies

- `framer-motion`: Untuk animasi
- `echarts-for-react`: Untuk chart visualisasi
- `axios`: Untuk HTTP requests
- `next/dynamic`: Untuk dynamic import

## Troubleshooting

### Data tidak muncul

1. Cek koneksi ke API: `http://localhost:9800/dashboard-service/public/api/v1/mahasiswa-sebaran/statistics`
2. Cek browser console untuk error
3. Pastikan environment variable sudah di-set dengan benar

### Chart tidak render

1. Pastikan `echarts-for-react` sudah terinstall
2. Cek browser console untuk error ECharts
3. Pastikan data format sesuai dengan tipe chart

### Loading terus-menerus

1. Cek API response di Network tab browser
2. Pastikan API endpoint dapat diakses
3. Cek CORS settings jika API di domain berbeda
