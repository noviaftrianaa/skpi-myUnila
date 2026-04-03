# Module 3: Permohonan Akademik (3 Layanan, Multi-Approval)

## Status: PENDING

## Scope

3 layanan permohonan akademik: CUTI, UNDUR_DIRI, ALIH_PROGRAM

**Workflow:** Mahasiswa → Admin Fakultas → Admin BAK → Approver Fakultas → Approver Universitas → Terbit

```
draft → diajukan → diverifikasi → menunggu_persetujuan → disetujui/ditolak → terbit
```

## Prerequisites
- Module 2 (Surat Mandiri) harus selesai dulu — extends pengajuan base

## Backend Files (extends Module 2)

| # | File | Keterangan |
|---|------|-----------|
| 1 | `Repositories/Layanan/PersetujuanRepository.php` | CRUD layanan.persetujuan_pengajuan |
| 2 | `Services/Layanan/PersetujuanService.php` | Approval chain: approve, reject, queue |
| 3 | `Services/Layanan/PermohonanAkademikService.php` | Validasi khusus per tipe |
| 4 | `Http/Controllers/Api/Layanan/PersetujuanController.php` | Approver endpoints |

## Validasi Bisnis per Tipe

### CUTI (Cuti Akademik)
- Maksimal 2 semester cuti
- Tidak boleh cuti di semester 1
- Harus sudah bayar UKT semester berjalan

### UNDUR_DIRI (Pengunduran Diri)
- Harus ada persetujuan orang tua/wali
- Tidak ada tanggungan keuangan
- Surat pernyataan bermaterai

### ALIH_PROGRAM (Alih Program Studi)
- IPK minimal 2.75
- SKS minimal 40
- Prodi tujuan harus aktif dan ada kuota
- Konversi SKS harus diverifikasi

## API Endpoints

```
# Approval Chain
GET     /v1/approval/queue                     — Queue persetujuan saya
GET     /v1/approval/{id}                      — Detail pengajuan + approval chain
POST    /v1/approval/{id}/approve              — Setujui
POST    /v1/approval/{id}/reject               — Tolak
```

## Frontend Files

| # | File | Keterangan |
|---|------|-----------|
| 5 | `app/dashboard/sim-bak/permohonan/page.tsx` | 3 kartu layanan |
| 6 | `app/dashboard/sim-bak/permohonan/[kode]/page.tsx` | Form + field khusus per tipe |
| 7 | `app/dashboard/sim-bak/permohonan/components/AlihProgramForm.tsx` | Form khusus: prodi tujuan |
| 8 | `app/dashboard/sim-bak/admin/persetujuan/page.tsx` | Approval queue |
| 9 | `app/dashboard/sim-bak/admin/persetujuan/[id]/page.tsx` | Detail + approval chain |
| 10 | `app/dashboard/sim-bak/components/ApprovalTimeline.tsx` | Visual approval stepper |

## Approval Chain

Setiap permohonan akademik memiliki beberapa tahap persetujuan (disimpan di `layanan.persetujuan_pengajuan`):

| Urutan | Role | Keterangan |
|--------|------|-----------|
| 1 | admin_fakultas | Verifikasi kelengkapan di tingkat fakultas |
| 2 | admin_bak | Verifikasi kelengkapan di tingkat universitas |
| 3 | dekan | Persetujuan Dekan (via pejabat fakultas) |
| 4 | wakil_rektor | Persetujuan Wakil Rektor Bidang Akademik |

Status pengajuan berubah ke `disetujui` hanya jika SEMUA approver menyetujui.
Jika salah satu `ditolak`, pengajuan langsung `ditolak`.
