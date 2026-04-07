# Module 4: Batch Administrasi (2 Layanan, Admin-Initiated)

## Status: PENDING

## Scope

2 layanan batch: HABIS_MASA_MUKIM, PUTUS_STUDI

**Workflow:** Admin BAK tarik data pdut → Fakultas verifikasi → SK Dekan → SK Rektor → Selesai

```
draft → verifikasi_fakultas → finalisasi → terbit
```

## Backend Files

| # | File | Keterangan |
|---|------|-----------|
| 1 | `Repositories/Batch/BatchPenetapanRepository.php` | CRUD batch.batch_penetapan |
| 2 | `Repositories/Batch/KandidatBatchRepository.php` | Bulk insert + filter |
| 3 | `Repositories/Batch/VerifikasiBatchRepository.php` | Faculty verification records |
| 4 | `Repositories/Reference/AkademikRefRepository.php` | READ pdut: query HMM/putus studi candidates |
| 5 | `Services/Batch/BatchService.php` | Create batch, pull data, finalize, generate SK |
| 6 | `Http/Controllers/Api/Batch/BatchController.php` | All batch endpoints |

## API Endpoints

```
POST    /v1/batch                              — Buat batch baru
GET     /v1/batch                              — List batch
GET     /v1/batch/{id}                         — Detail batch + stats
GET     /v1/batch/{id}/kandidat                — List kandidat (filterable)
POST    /v1/batch/kandidat/{id}/verifikasi     — Verifikasi kandidat (fakultas)
POST    /v1/batch/{id}/finalize                — Finalisasi batch → generate SK
```

## Frontend Files

| # | File | Keterangan |
|---|------|-----------|
| 7 | `app/dashboard/sim-bak/batch/page.tsx` | Batch list |
| 8 | `app/dashboard/sim-bak/batch/create/page.tsx` | Create: pilih tipe, periode, preview |
| 9 | `app/dashboard/sim-bak/batch/[id]/page.tsx` | Detail: stats per fakultas, progress |
| 10 | `app/dashboard/sim-bak/batch/[id]/verifikasi/page.tsx` | Faculty verification view |
| 11 | `app/dashboard/sim-bak/batch/components/BatchSummaryCard.tsx` | Stats card |
| 12 | `lib/services/sim-bak/batchService.ts` | API calls |

## Kriteria Kandidat (query pdut)

### HABIS_MASA_MUKIM
- Mahasiswa yang melebihi batas masa studi (14 semester untuk S1)
- Data dari pdut: reg_pd.mulai_smt, peserta_didik.id_pd
- Filter: status aktif, belum lulus, semester > batas

### PUTUS_STUDI
- Mahasiswa yang tidak registrasi 2 semester berturut-turut
- Data dari pdut: kuliah_mhs, reg_pd
- Filter: status aktif, tidak ada KRS 2 semester terakhir

## Flow Detail

1. Admin BAK buat batch baru (pilih jenis: HMM/Putus Studi, periode)
2. Sistem tarik data kandidat dari pdut berdasarkan kriteria
3. Preview kandidat → admin bisa exclude manual
4. Kirim ke fakultas untuk verifikasi
5. Admin fakultas verifikasi per kandidat (valid/tidak_valid/dikecualikan)
6. Admin BAK review hasil verifikasi fakultas
7. Finalisasi → generate SK → upload ke MinIO
8. Terbitkan batch
