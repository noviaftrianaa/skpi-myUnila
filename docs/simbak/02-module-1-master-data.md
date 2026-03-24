# Module 1: Master Data (ref schema)

## Status: PENDING

## Scope

CRUD untuk 4 tabel di schema `ref`:
- `ref.jenis_layanan` — 10 jenis layanan
- `ref.persyaratan_layanan` — persyaratan dokumen per layanan
- `ref.tahapan_layanan` — tahapan workflow per layanan
- `ref.template_dokumen` — template output (surat/SK)

## Backend Files

| # | File | Keterangan |
|---|------|-----------|
| 1 | `Repositories/MasterData/JenisLayananRepository.php` | CRUD ref.jenis_layanan |
| 2 | `Repositories/MasterData/PersyaratanRepository.php` | CRUD ref.persyaratan_layanan |
| 3 | `Repositories/MasterData/TahapanRepository.php` | CRUD ref.tahapan_layanan |
| 4 | `Repositories/MasterData/TemplateDokumenRepository.php` | CRUD ref.template_dokumen |
| 5 | `Services/MasterData/JenisLayananService.php` | Business logic + cache |
| 6 | `Services/MasterData/PersyaratanService.php` | Business logic |
| 7 | `Services/MasterData/TahapanService.php` | Business logic |
| 8 | `Services/MasterData/TemplateDokumenService.php` | + MinIO upload template |
| 9 | `Http/Controllers/Api/MasterData/JenisLayananController.php` | CRUD endpoints |
| 10 | `Http/Controllers/Api/MasterData/PersyaratanController.php` | CRUD endpoints |
| 11 | `Http/Controllers/Api/MasterData/TahapanController.php` | CRUD endpoints |
| 12 | `Http/Controllers/Api/MasterData/TemplateDokumenController.php` | CRUD + file upload |
| 13 | `Http/Requests/MasterData/JenisLayananRequest.php` | Validation |
| 14 | `database/seeders/MasterDataSeeder.php` | Seed 10 jenis layanan + persyaratan + tahapan |

## API Endpoints

```
GET/POST        /v1/master-data/jenis-layanan
GET/PUT/DELETE  /v1/master-data/jenis-layanan/{id}
GET             /v1/master-data/jenis-layanan/{id}/persyaratan
POST            /v1/master-data/jenis-layanan/{id}/persyaratan
PUT/DELETE      /v1/master-data/persyaratan/{id}
GET             /v1/master-data/jenis-layanan/{id}/tahapan
POST            /v1/master-data/jenis-layanan/{id}/tahapan
PUT/DELETE      /v1/master-data/tahapan/{id}
GET/POST        /v1/master-data/template-dokumen
GET/PUT/DELETE  /v1/master-data/template-dokumen/{id}
POST            /v1/master-data/template-dokumen/{id}/upload
```

## Frontend Files

| # | File | Keterangan |
|---|------|-----------|
| 15 | `app/dashboard/sim-bak/master-data/page.tsx` | Tabs: Jenis Layanan, Persyaratan, Tahapan, Template |
| 16 | `app/dashboard/sim-bak/master-data/components/JenisLayananTable.tsx` | HeroUI Table + CRUD modal |
| 17 | `app/dashboard/sim-bak/master-data/components/PersyaratanManager.tsx` | Per-layanan persyaratan editor |
| 18 | `lib/services/sim-bak/masterDataService.ts` | API calls |

## Seeder Data (10 Jenis Layanan)

```sql
-- surat_mandiri (4)
INSERT INTO ref.jenis_layanan (kode_layanan, nm_layanan, kategori, urutan) VALUES
('LOA', 'Letter of Acceptance', 'surat_mandiri', 1),
('GANTI_KTM', 'Pergantian KTM', 'surat_mandiri', 2),
('GANTI_PKKMB', 'Pergantian Sertifikat PKKMB', 'surat_mandiri', 3),
('HERREGISTRASI', 'Surat Keterangan Herregistrasi', 'surat_mandiri', 4);

-- permohonan_akademik (3)
INSERT INTO ref.jenis_layanan (kode_layanan, nm_layanan, kategori, urutan) VALUES
('CUTI', 'Cuti Akademik', 'permohonan_akademik', 5),
('UNDUR_DIRI', 'Pengunduran Diri', 'permohonan_akademik', 6),
('ALIH_PROGRAM', 'Alih Program Studi', 'permohonan_akademik', 7);

-- batch_administrasi (2)
INSERT INTO ref.jenis_layanan (kode_layanan, nm_layanan, kategori, urutan) VALUES
('HABIS_MASA_MUKIM', 'Habis Masa Mukim', 'batch_administrasi', 8),
('PUTUS_STUDI', 'Putus Studi', 'batch_administrasi', 9);

-- monitoring (1)
INSERT INTO ref.jenis_layanan (kode_layanan, nm_layanan, kategori, urutan) VALUES
('MONITORING', 'Monitoring Mahasiswa', 'monitoring', 10);
```
