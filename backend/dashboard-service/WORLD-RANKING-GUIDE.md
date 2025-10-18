# World University Rankings - Implementation Guide

## Overview
Sistem peringkat universitas dunia untuk Universitas Lampung yang menampilkan data dari 4 sumber ranking internasional.

## Kategori Ranking

### 1. QS World University Rankings
- **Kode**: `qs`
- **Nama Lengkap**: QS World University Rankings
- **URL**: https://www.topuniversities.com/universities/university-lampung
- **Periode**: Annual (Tahunan)
- **Icon**: 🏆
- **Color**: Blue

### 2. Times Higher Education (THE)
- **Kode**: `the`
- **Nama Lengkap**: Times Higher Education World University Rankings
- **URL**: https://www.timeshighereducation.com/world-university-rankings/university-lampung
- **Periode**: Annual (Tahunan)
- **Icon**: 📚
- **Color**: Purple

### 3. UI GreenMetric
- **Kode**: `greenmetric`
- **Nama Lengkap**: UI GreenMetric World University Rankings
- **URL**: https://greenmetric.ui.ac.id/rankings/overall-rankings-2024
- **Periode**: Annual (Tahunan)
- **Icon**: 🌱
- **Color**: Emerald

### 4. Webometrics
- **Kode**: `webometrics`
- **Nama Lengkap**: Ranking Web of Universities
- **URL**: https://webometrics.info/en/Asia/Indonesia
- **Periode**: Semester (January & July)
- **Icon**: 🌐
- **Color**: Orange

## Database Schema

### Schema: `ranking`

#### Table: `ranking_categories`
```sql
- id (INT, PK)
- code (VARCHAR(50), UNIQUE)
- name (VARCHAR(100))
- full_name (VARCHAR(255))
- icon (VARCHAR(10))
- color (VARCHAR(50))
- created_at (DATETIME)
- updated_at (DATETIME)
```

#### Table: `university_rankings`
```sql
- id (INT, PK)
- category_id (INT, FK -> ranking_categories.id)
- year (VARCHAR(4))
- period (VARCHAR(50))
- world_rank (VARCHAR(20))
- world_rank_numeric (INT, nullable)
- national_rank (INT, nullable)
- regional_rank (INT, nullable)
- overall_score (FLOAT, nullable)
- rank_change (INT, nullable) -- Negative = improvement, Positive = decline
- trend (VARCHAR(20)) -- 'up', 'down', 'stable'
- source_url (VARCHAR(500))
- notes (TEXT, nullable)
- created_at (DATETIME)
- updated_at (DATETIME)
```

## API Endpoints

Base URL: `http://localhost:9800/dashboard-service/public/api/v1`

### 1. Get Latest Rankings
```
GET /rankings/latest
```
**Response:**
```json
{
  "success": true,
  "message": "Latest rankings retrieved successfully",
  "data": {
    "rankings": [
      {
        "category": {
          "code": "qs",
          "name": "QS World",
          "full_name": "QS World University Rankings",
          "icon": "🏆",
          "color": "blue"
        },
        "year": "2025",
        "period": "Annual",
        "ranks": {
          "world": "1401+",
          "world_rank_numeric": 1401,
          "national": null,
          "regional": null
        },
        "score": null,
        "change": null,
        "trend": "stable",
        "source_url": "https://...",
        "last_updated": "2025-10-18 21:20:49"
      }
    ],
    "university": "Universitas Lampung",
    "last_updated": "2025-10-18 21:29:09"
  }
}
```

### 2. Get Chart Data
```
GET /rankings/chart?start_year=2023&end_year=2025
```

### 3. Get Categories
```
GET /rankings/categories
```

### 4. Get Statistics
```
GET /rankings/statistics
```

### 5. Get Ranking by Category
```
GET /rankings/{categoryCode}
```

### 6. Get Ranking History
```
GET /rankings/{categoryCode}/history
```

## Data Management

### Update Data via CSV Seeder

1. **Edit CSV File**: `database/data/rankings.csv`
   - Gunakan Excel atau Google Sheets
   - Format: CSV dengan delimiter koma
   - Lihat `rankings.csv.example` untuk template

2. **Kolom CSV**:
   ```
   category_code,year,period,world_rank,world_rank_numeric,national_rank,
   regional_rank,overall_score,rank_change,trend,source_url,notes
   ```

3. **Jalankan Seeder**:
   ```bash
   docker exec myunila-dashboard-service php artisan db:seed --class=RankingSeeder
   ```

4. **Clear Cache**:
   ```bash
   docker exec myunila-dashboard-service php artisan cache:clear
   ```

### Field Descriptions

- **category_code**: Kode kategori (qs, the, greenmetric, webometrics)
- **year**: Tahun ranking (YYYY)
- **period**: Periode (Annual, January, July, dll)
- **world_rank**: Ranking dunia (bisa berisi text seperti "1401+", "TBD")
- **world_rank_numeric**: Ranking dunia dalam angka (untuk sorting/chart)
- **national_rank**: Ranking nasional (Indonesia)
- **regional_rank**: Ranking regional (Asia/Southeast Asia)
- **overall_score**: Skor keseluruhan (0-100)
- **rank_change**: Perubahan ranking (negatif = naik, positif = turun)
- **trend**: Tren (up, down, stable)
- **source_url**: URL sumber data
- **notes**: Catatan tambahan

### Contoh Data
```csv
webometrics,2025,January,1588,1588,17,,,−10,down,https://webometrics.info/en/Asia/Indonesia,Improved 10 positions
```

## Frontend Integration

### Component: `WorldClassRanking.tsx`

**Location**: `frontend/src/shared/components/statistik/WorldClassRanking.tsx`

**Features**:
- Card display untuk setiap kategori ranking
- Badge perubahan ranking (↑/↓ dengan angka)
- Line chart untuk tren historis
- Responsive grid layout
- Framer Motion animations

### Service: `dashboard.service.ts`

**Location**: `frontend/src/lib/services/dashboard.service.ts`

**Methods**:
```typescript
- getLatestRankings()
- getChartData(startYear, endYear)
- getCategories()
- getStatistics()
- getRankingHistory(categoryCode)
```

### Environment Variables

**File**: `frontend/.env.local`
```env
NEXT_PUBLIC_DASHBOARD_API_URL=http://localhost:9800/dashboard-service/public/api/v1
```

## Kong Gateway Configuration

### Public Route (No JWT Authentication)
```bash
# Route: /dashboard-service/public
# Service: dashboard-service (http://dashboard-service:8000)
# Strip Path: true
# Plugins: CORS (origins: localhost:3000, localhost:3001)
```

## Type Casting (Important!)

### Backend (RankingService.php)
Semua field numerik **HARUS** di-cast ke tipe yang benar:

```php
'score' => $ranking->overall_score ? (float) $ranking->overall_score : null,
'change' => $ranking->rank_change !== null ? (int) $ranking->rank_change : null,
'world_rank_numeric' => $ranking->world_rank_numeric ? (int) $ranking->world_rank_numeric : null,
```

**Alasan**: SQL Server PDO mengembalikan INT/FLOAT sebagai string. Tanpa casting eksplisit, JSON akan mengirim `"change": "−10"` (string) bukan `"change": −10` (integer), yang menyebabkan kondisional di frontend (`change !== 0`) tidak bekerja.

## Cache Strategy

- **Duration**: 6 hours (21600 seconds)
- **Key**: `rankings_{method}_{params}`
- **Clear**: `php artisan cache:clear`

## Troubleshooting

### Badge perubahan tidak muncul
- ✅ Pastikan `rank_change` di database adalah angka, bukan NULL
- ✅ Cek RankingService.php sudah melakukan type casting `(int)`
- ✅ Clear cache setelah update service
- ✅ Periksa response API apakah `change` bertipe integer

### CORS Error
- ✅ Pastikan Kong route `/dashboard-service/public` memiliki CORS plugin
- ✅ Origins: `http://localhost:3000`, `http://localhost:3001`

### Chart tidak muncul
- ✅ Periksa `useMemo` dependency array ada `[rankingData]`
- ✅ Pastikan data chart ada di response API

### Data tidak update setelah edit CSV
- ✅ Jalankan seeder: `php artisan db:seed --class=RankingSeeder`
- ✅ Clear cache: `php artisan cache:clear`
- ✅ Refresh browser (Ctrl+F5)

## Best Practices

1. **Update Data**:
   - Edit `rankings.csv` menggunakan Excel
   - Jalankan seeder untuk upsert data
   - Clear cache agar data baru langsung tampil

2. **Validation**:
   - Pastikan `category_code` sesuai dengan data di `ranking_categories`
   - `year` harus 4 digit (YYYY)
   - `rank_change` negatif = peningkatan ranking

3. **Performance**:
   - Cache duration 6 jam untuk mengurangi query database
   - Clear cache hanya saat update data

4. **Type Safety**:
   - Selalu cast numeric fields di Service layer
   - Gunakan TypeScript interfaces di frontend

## Data Sources

1. **QS World**: https://www.topuniversities.com/universities/university-lampung
2. **THE**: https://www.timeshighereducation.com/world-university-rankings/university-lampung
3. **GreenMetric**: https://greenmetric.ui.ac.id/rankings/overall-rankings-2024
4. **Webometrics**: https://webometrics.info/en/Asia/Indonesia

## Maintenance

### Regular Updates
- QS & THE: Update setiap tahun (biasanya Q3)
- GreenMetric: Update setiap tahun (biasanya Q4)
- Webometrics: Update dua kali setahun (January & July)

### Steps
1. Cek sumber data untuk update terbaru
2. Edit `rankings.csv` dengan data baru
3. Jalankan seeder
4. Clear cache
5. Verifikasi di frontend
