# Module 4: Batch Administrasi (2 Layanan, Admin-Initiated)

## Status: IMPLEMENTED

Terakhir diperbarui: 6 Mei 2026

## Scope

2 layanan batch: HABIS_MASA_MUKIM, PUTUS_STUDI

**Workflow:** Admin BAK buat batch (wajib pilih fakultas) → tarik kandidat PDUT → kirim ke fakultas → admin fakultas verifikasi + upload SK Dekan → finalisasi → admin BAK review → terbitkan SK Rektor

```
draft → kandidat_ditarik → verifikasi_fakultas → sk_dekan_terbit → terbit
```

### Role-Based View

| Role | Menu | Akses |
|------|------|-------|
| Admin BAK | Evaluasi Studi (`/batch`) | CRUD batch, kirim ke fakultas, finalkan SK Rektor, kembalikan ke fakultas |
| Admin Fakultas | Verifikasi Evaluasi (`/batch/verifikasi`) | Verifikasi kandidat, upload SK Dekan, finalisasi verifikasi |

### Transisi Status

| Dari | Ke | Aktor | Aksi |
|------|----|-------|------|
| `draft` | `kandidat_ditarik` | Sistem | Otomatis saat batch dibuat + kandidat ditarik |
| `kandidat_ditarik` | `verifikasi_fakultas` | Admin BAK | Tombol "Kirim ke Fakultas" |
| `verifikasi_fakultas` | `sk_dekan_terbit` | Admin Fakultas | Tombol "Finalisasi Verifikasi Fakultas" |
| `sk_dekan_terbit` | `verifikasi_fakultas` | Admin BAK | Tombol "Kembalikan ke Fakultas" (reset kandidat + alasan wajib) |
| `sk_dekan_terbit` | `terbit` | Admin BAK | Tombol "Finalkan & Terbitkan SK Rektor" |

## Backend Files

| # | File | Keterangan |
|---|------|-----------|
| 1 | `Repositories/Batch/BatchRepository.php` | CRUD batch + kandidat + verifikasi, soft delete cascade |
| 2 | `Repositories/PdutRepository.php` | Query kandidat HMM/PS dari SQL Server `siakadu.mahasiswa` |
| 3 | `Http/Controllers/Api/Batch/BatchController.php` | All batch endpoints |
| 4 | `Services/MinioService.php` | Upload/delete SK Dekan, SK Rektor, dokumen exclude |

## API Endpoints

```
GET     /v1/batch                              — List batch (filter: jenis, status, fakultas, my_fakultas)
GET     /v1/batch/preview-candidates           — Preview kandidat sebelum create (exclude dari batch terbit)
POST    /v1/batch                              — Buat batch baru (validasi duplikasi aktif)
GET     /v1/batch/{id}                         — Detail batch + stats
GET     /v1/batch/{id}/kandidat                — List kandidat (filter: status, fakultas)
GET     /v1/batch/{id}/export-kandidat         — Export CSV kandidat
POST    /v1/batch/{id}/pull-candidates         — Tarik ulang kandidat dari PDUT
POST    /v1/batch/{id}/send-to-fakultas        — Kirim ke fakultas (kandidat_ditarik → verifikasi_fakultas)
POST    /v1/batch/{id}/return-to-fakultas      — Kembalikan ke fakultas (sk_dekan_terbit → verifikasi_fakultas)
POST    /v1/batch/{id}/upload-sk-dekan         — Upload SK Dekan (PDF)
GET     /v1/batch/{id}/sk-dekan/download       — Download/preview SK Dekan
DELETE  /v1/batch/{id}/sk-dekan                — Hapus SK Dekan
POST    /v1/batch/{id}/finalize-verifikasi     — Finalisasi verifikasi fakultas
POST    /v1/batch/{id}/finalize                — Finalkan + upload SK Rektor
POST    /v1/batch/kandidat/{id}/verifikasi     — Verifikasi kandidat (konfirmasi/keluarkan)
POST    /v1/batch/kandidat/{id}/reset          — Reset status kandidat ke "masuk" (batalkan verifikasi)
POST    /v1/batch/kandidat/{id}/send-email     — Kirim email notifikasi ke kandidat
GET     /v1/batch/kandidat/{id}/wa-link        — Generate link WhatsApp kandidat
DELETE  /v1/batch/{id}                         — Hapus batch (soft delete cascade)
```

## Frontend Files

| # | File | Keterangan |
|---|------|-----------|
| 1 | `app/dashboard/sim-bak/batch/page.tsx` | Batch list (admin BAK) — role-based buttons |
| 2 | `app/dashboard/sim-bak/batch/create/page.tsx` | Create: jenis, semester, fakultas (wajib), preview kandidat |
| 3 | `app/dashboard/sim-bak/batch/[id]/page.tsx` | Detail: timeline, stats, tabel kandidat, semua aksi |
| 4 | `app/dashboard/sim-bak/batch/verifikasi/page.tsx` | Batch list (admin fakultas) — auto-filter my_fakultas |
| 5 | `app/dashboard/sim-bak/config/menuConfig.tsx` | Menu terpisah per role |
| 6 | `lib/services/sim-bak/simBakService.ts` | API calls |

## Validasi & Business Rules

### Duplikasi Batch
- **Hard block**: Tidak bisa buat batch baru jika sudah ada batch aktif (status != `terbit`) untuk kombinasi `jenis_batch + id_smt + id_fakultas` yang sama
- Pesan error menyebutkan kode batch yang sudah ada

### Exclude Kandidat dari Batch Terbit
- Saat membuat batch baru atau tarik ulang, kandidat yang sudah `dikonfirmasi` di batch `terbit` sebelumnya (periode + jenis + fakultas sama) otomatis diexclude
- Berlaku di: `previewCandidates()`, `store()`, `pullCandidates()`

### Faculty Scoping
- Fakultas wajib dipilih saat buat batch (UUID dari `pdrd.sms`)
- Admin fakultas hanya melihat batch milik fakultasnya (`my_fakultas=1` → filter via `role_pengguna.id_organisasi`)
- Query kandidat filter by `sms.id_fak_unila` (bukan `nm_fakultas`)

### Role Detection (Frontend)
- Cek `includes("fakultas")` **sebelum** `includes("administrator")` untuk menghindari konflik role seperti "Admin Fakultas MIPA"

## Kriteria Kandidat (query siakadu.mahasiswa)

### HABIS_MASA_MUKIM
- D3: >= 13 semester, S1: >= 17 semester, S2: >= 9 semester, S3: >= 13 semester
- Status: aktif (bukan lulus/keluar)
- Filter by fakultas via `sms.id_fak_unila`

### PUTUS_STUDI
- Semester IV: IPK < 2.00 atau SKS < 40
- Semester VIII: IPK < 2.00 atau SKS < 80
- Status: aktif
- Filter by fakultas via `sms.id_fak_unila`

## Flow Detail

1. Admin BAK buat batch baru (pilih jenis, semester, fakultas **wajib**) — sistem cek duplikasi
2. Sistem tarik kandidat dari PDUT (exclude yang sudah di batch terbit sebelumnya)
3. Status: `draft` → `kandidat_ditarik`
4. Admin BAK klik "Kirim ke Fakultas" → status: `verifikasi_fakultas`
5. Admin Fakultas verifikasi tiap kandidat (konfirmasi / keluarkan + alasan + dokumen)
6. Admin Fakultas bisa batalkan verifikasi (reset ke "masuk") selama belum finalisasi
7. Admin Fakultas upload SK Dekan + finalisasi → status: `sk_dekan_terbit`
8. Admin BAK review: bisa "Kembalikan ke Fakultas" (reset semua + alasan) atau "Finalkan & Terbitkan SK Rektor"
9. Jika dikembalikan → status kembali ke `verifikasi_fakultas`, banner catatan tampil
10. Jika diterbitkan → upload SK Rektor → status: `terbit`

## Database ALTER Scripts

- `data-model/script/postgresql/simbak/07-alter-batch-add-fakultas.sql` — tambah `id_fakultas UUID` dan `nm_fakultas VARCHAR(200)` ke `batch.batch_penetapan`
