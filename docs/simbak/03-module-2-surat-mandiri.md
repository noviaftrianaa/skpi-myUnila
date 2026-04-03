# Module 2: Surat Mandiri (4 Layanan, Workflow Sederhana)

## Status: PENDING

## Scope

4 layanan surat mandiri: LOA, GANTI_KTM, GANTI_PKKMB, HERREGISTRASI

**Workflow:** Mahasiswa submit → Admin BAK verifikasi → Generate surat → Terbit

```
draft → diajukan → perlu_perbaikan/diverifikasi → terbit
```

## Backend Files

| # | File | Keterangan |
|---|------|-----------|
| 1 | `Repositories/Layanan/PengajuanRepository.php` | CRUD layanan.pengajuan + filter + pagination |
| 2 | `Repositories/Layanan/DataPemohonRepository.php` | Snapshot data mahasiswa |
| 3 | `Repositories/Layanan/DokumenPengajuanRepository.php` | File metadata |
| 4 | `Repositories/Layanan/RiwayatPengajuanRepository.php` | Status history |
| 5 | `Repositories/Layanan/DokumenHasilRepository.php` | Output dokumen |
| 6 | `Repositories/Reference/MahasiswaRefRepository.php` | READ pdut: peserta_didik, reg_pd |
| 7 | `Services/Layanan/PengajuanService.php` | Submit, upload dokumen, ajukan, get detail |
| 8 | `Services/Layanan/VerifikasiService.php` | Admin: verifikasi, minta perbaikan, terbitkan |
| 9 | `Http/Controllers/Api/Layanan/PengajuanController.php` | Mahasiswa endpoints |
| 10 | `Http/Controllers/Api/Layanan/VerifikasiController.php` | Admin endpoints |
| 11 | `Http/Controllers/Api/Layanan/DokumenController.php` | Upload/download |
| 12 | `Http/Requests/Layanan/CreatePengajuanRequest.php` | Validation |

## API Endpoints

```
# Mahasiswa
GET     /v1/layanan/my-pengajuan              — Daftar pengajuan saya
POST    /v1/layanan/pengajuan                  — Buat pengajuan baru (draft)
GET     /v1/layanan/pengajuan/{id}             — Detail pengajuan
POST    /v1/layanan/pengajuan/{id}/upload      — Upload dokumen persyaratan
POST    /v1/layanan/pengajuan/{id}/ajukan      — Submit pengajuan (draft → diajukan)
GET     /v1/layanan/dokumen/{id}/download      — Download dokumen
GET     /v1/layanan/jenis-layanan              — List layanan yang tersedia

# Admin BAK
GET     /v1/admin/pengajuan                    — Queue pengajuan masuk
GET     /v1/admin/pengajuan/{id}               — Detail untuk verifikasi
POST    /v1/admin/pengajuan/{id}/verifikasi    — Verifikasi (diajukan → diverifikasi)
POST    /v1/admin/pengajuan/{id}/perbaikan     — Minta perbaikan (diajukan → perlu_perbaikan)
POST    /v1/admin/pengajuan/{id}/terbitkan     — Terbitkan surat (diverifikasi → terbit)
```

## Frontend Files

| # | File | Keterangan |
|---|------|-----------|
| 13 | `app/dashboard/sim-bak/surat-mandiri/page.tsx` | 4 kartu layanan |
| 14 | `app/dashboard/sim-bak/surat-mandiri/[kode]/page.tsx` | Form pengajuan per tipe |
| 15 | `app/dashboard/sim-bak/surat-mandiri/components/PengajuanForm.tsx` | Multi-step form |
| 16 | `app/dashboard/sim-bak/surat-mandiri/components/DokumenUploader.tsx` | File upload drag-drop |
| 17 | `app/dashboard/sim-bak/riwayat/page.tsx` | Daftar pengajuan mahasiswa |
| 18 | `app/dashboard/sim-bak/riwayat/[id]/page.tsx` | Detail + timeline + download |
| 19 | `app/dashboard/sim-bak/admin/verifikasi/page.tsx` | Admin queue table |
| 20 | `app/dashboard/sim-bak/admin/verifikasi/[id]/page.tsx` | Admin verify detail |
| 21 | `lib/services/sim-bak/pengajuanService.ts` | API calls |

## Flow Detail

### Mahasiswa Flow
1. Pilih jenis surat di halaman Surat Mandiri
2. Isi form pengajuan → create draft
3. Upload dokumen persyaratan (sesuai ref.persyaratan_layanan)
4. Submit pengajuan (draft → diajukan)
5. Monitor status di halaman Riwayat
6. Jika perlu_perbaikan → upload ulang → submit ulang
7. Jika terbit → download surat hasil

### Admin BAK Flow
1. Lihat queue pengajuan masuk (status: diajukan)
2. Review detail + dokumen
3. Verifikasi dokumen (valid/tidak_valid per dokumen)
4. Jika semua valid → verifikasi pengajuan
5. Jika ada yang tidak valid → minta perbaikan + catatan
6. Generate surat → upload ke MinIO → terbitkan
