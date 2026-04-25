# Module 5: Monitoring & Dashboard

## Status: DONE (Update 25 April 2026)

**Update terkini:**
- ✅ Pivot ke `siakadu.mahasiswa` (single denormalized table) — lihat `09-catatan-teknis-development.md` #16
- ✅ KTW Exclusion (tabel `ref.ktw_exclude_jalur`) + UI Pengaturan KTW — lihat #17
- ✅ Export CSV dengan auth token + kolom Jalur Pendaftaran + Status KTW

## Scope

Dashboard statistik dan monitoring mahasiswa untuk pimpinan dan admin BAK.

## Prerequisites
- Module 2-4 harus selesai dulu (butuh data transaksional)

## Backend Files

| # | File | Keterangan |
|---|------|-----------|
| 1 | `Repositories/Dashboard/DashboardRepository.php` | Aggregate queries: stats, SLA, trends |
| 2 | `Repositories/Dashboard/MonitoringRepository.php` | READ pdut: mahasiswa aktif, lulusan |
| 3 | `Services/Dashboard/DashboardService.php` | Overview, SLA compliance, activity log |
| 4 | `Services/Dashboard/MonitoringService.php` | Filter + export data |
| 5 | `Http/Controllers/Api/Dashboard/DashboardController.php` | Stats endpoints |
| 6 | `Http/Controllers/Api/Dashboard/MonitoringController.php` | Monitoring endpoints |

## API Endpoints

```
GET     /v1/dashboard/overview                 — Total stats (pengajuan, proses, selesai)
GET     /v1/dashboard/sla                      — SLA compliance per layanan
GET     /v1/dashboard/activity-log             — Recent activities
GET     /v1/dashboard/trends                   — Monthly trends (6 bulan)
GET     /v1/monitoring/mahasiswa-aktif          — List mahasiswa aktif (from pdut)
GET     /v1/monitoring/lulusan                  — List lulusan (from pdut)
GET     /v1/monitoring/export                   — Export data (CSV/Excel)
```

## Frontend Files

| # | File | Keterangan |
|---|------|-----------|
| 7 | Update `app/dashboard/sim-bak/page.tsx` | Full dashboard: stat cards, trend chart, recent table |
| 8 | `app/dashboard/sim-bak/monitoring/page.tsx` | Tabs: Mahasiswa Aktif, Lulusan |
| 9 | `app/dashboard/sim-bak/monitoring/components/MahasiswaTable.tsx` | Filterable table + export |
| 10 | `app/dashboard/sim-bak/components/DashboardCharts.tsx` | ECharts trend + distribution |
| 11 | `lib/services/sim-bak/dashboardService.ts` | API calls |

## Dashboard Metrics

### Overview Cards
- Total Pengajuan (bulan ini)
- Pengajuan Dalam Proses
- Pengajuan Selesai (bulan ini)
- Rata-rata Waktu Penyelesaian

### SLA Compliance
- Target: 5 hari kerja untuk surat mandiri, 14 hari untuk permohonan akademik
- Persentase pengajuan selesai dalam SLA
- Breakdown per jenis layanan

### Trend Chart (ECharts)
- Line chart: pengajuan per bulan (6 bulan terakhir)
- Bar chart: distribusi per jenis layanan
- Pie chart: distribusi per status

### Activity Log
- 20 aktivitas terbaru dari log.jejak_audit
- Filter by aksi, pengguna, tanggal
