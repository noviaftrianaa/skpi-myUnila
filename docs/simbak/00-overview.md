# SIMBAK - Sistem Informasi Manajemen BAK

## Overview

SIMBAK adalah modul layanan administrasi kemahasiswaan BAK (Biro Administrasi Kemahasiswaan) Universitas Lampung yang terintegrasi dalam platform MyUnila.

## Arsitektur

- **Backend**: `backend/bak-service/` — Laravel 11, PHP 8.2
- **Frontend**: `frontend/src/app/dashboard/sim-bak/` — Next.js 15, React 19
- **Database**: PostgreSQL `simbak` (4 schema: ref, layanan, batch, log) + SQL Server `pdut` (read-only)
- **File Storage**: MinIO VM7 (192.168.120.47:9000), bucket `myunila-storage`
- **Schema SQL**: `data-model/script/postgresql/simbak_v1.0_fresh.sql`

## 10 Jenis Layanan

| Kode | Nama | Kategori |
|------|------|----------|
| LOA | Letter of Acceptance | surat_mandiri |
| GANTI_KTM | Pergantian KTM | surat_mandiri |
| GANTI_PKKMB | Pergantian Sertifikat PKKMB | surat_mandiri |
| HERREGISTRASI | Surat Keterangan Herregistrasi | surat_mandiri |
| CUTI | Cuti Akademik | permohonan_akademik |
| UNDUR_DIRI | Pengunduran Diri | permohonan_akademik |
| ALIH_PROGRAM | Alih Program Studi | permohonan_akademik |
| HABIS_MASA_MUKIM | Habis Masa Mukim | batch_administrasi |
| PUTUS_STUDI | Putus Studi | batch_administrasi |
| MONITORING | Monitoring Mahasiswa | monitoring |

## Workflow Status

```
draft → diajukan → perlu_perbaikan/diverifikasi → menunggu_persetujuan → disetujui/ditolak → terbit
```

## Urutan Implementasi

```
Module 0 (Foundation)     ← Setup & Scaffold
Module 1 (Master Data)    ← CRUD ref schema
Module 2 (Surat Mandiri)  ← Workflow sederhana, proof of concept
Module 3 (Permohonan)     ← Multi-approval chain
Module 4 (Batch)          ← Admin-initiated batch operations
Module 5 (Monitoring)     ← Dashboard & reporting
```

## Pattern Reference

| Pattern | Source |
|---------|--------|
| ApiResponse trait | `backend/auth-service/app/Traits/ApiResponse.php` |
| BaseRepository | `backend/dashboard-service/app/Repositories/BaseRepository.php` |
| JWT Middleware | `backend/auth-service/app/Http/Middleware/JwtAuthenticate.php` |
| Axios client | `frontend/src/lib/api/projectClient.ts` |
| Layout pattern | `frontend/src/shared/components/dashboard/DashboardLayoutWithDynamicMenu.tsx` |
| DB Schema | `data-model/script/postgresql/simbak_v1.0_fresh.sql` |
