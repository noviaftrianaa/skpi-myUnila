# SI-Prestasi · User Manual

Panduan operasional pakai SI-Prestasi (Sistem Informasi Pelaporan Prestasi) untuk
sinkronisasi data prestasi/sertifikasi/rekognisi mahasiswa Universitas Lampung
ke SIMKATMAWA Kemdiktisaintek.

---

## 1. Akses & Role

URL: `/dashboard/si-prestasi`

**Role yang bisa akses:**

| Role | Akses |
|---|---|
| `admin_kemahasiswaan` | Full access (CRUD + transition + push SIMKATMAWA + sync log) |
| `developer` / `admin` | Full access (untuk debugging / supervisor) |
| `admin_fakultas` | CRUD per fakultas + ajukan ke review |
| `operator_fakultas` | Input draft + edit milik sendiri |

Akses dipasang di backend via JWT + role check di route. Frontend hide menu
yang tidak sesuai role lewat `roles` di `menuConfig.tsx`.

---

## 2. Tipe Data

SI-Prestasi mengelola 3 tipe pelaporan SIMKATMAWA:

### 2.1 Prestasi Mandiri
Kejuaraan/lomba yang diikuti mahasiswa. Wajib: level (KAB/PROV/NAS/INT),
kategori (RISNOV/SENBUD/OLAHRAGA/dll), peringkat (JUARA1-3, HARAPAN, APRESIASI),
kelompok (INDIVIDU/KELOMPOK), bentuk (DARING/LURING).

### 2.2 Sertifikasi
Sertifikasi profesi/keahlian yang didapat mahasiswa. Lebih sederhana:
hanya level + nama + penyelenggara + tanggal + dokumen pendukung.

### 2.3 Rekognisi
Rekognisi dosen/mahasiswa di tingkat Nasional/Internasional sebagai
pembicara/visiting/dewan editor. Tambahan field: `jenis_rekognisi`.

---

## 3. Workflow State Machine

```
draft  ──submit──▶  review  ──approve──▶  ready  ──kirim──▶  sending  ──ok──▶  sent
   ▲                  │                     │                  │              │
   └────reject────────┘                     └──submit ulang ───┴──error──▶  error
```

**Transisi:**

| Dari | Ke | Aksi | Siapa |
|---|---|---|---|
| `draft` | `review` | Submit ke admin | Pemilik draft |
| `review` | `draft` | Reject | Admin (kembalikan ke pengaju) |
| `review` | `ready` | Approve | `admin_kemahasiswaan` |
| `ready` | `sending` | **Klik "Kirim"** → SubmitToSimkatmawaJob | Admin |
| `sending` | `sent` | Otomatis kalau SIMKATMAWA balas 2xx | Sistem |
| `sending` | `error` | Otomatis kalau SIMKATMAWA balas 4xx/5xx | Sistem |
| `error` | `sending` | **Klik "Kirim"** ulang | Admin |
| `sent` | (final) | Tidak bisa diubah lagi (locked) | — |

---

## 4. Cara Pakai

### 4.1 Buat draft prestasi

1. Login portal myUnila → buka **SI Prestasi → Prestasi Mandiri**
2. Klik **+ Tambah Prestasi**
3. Isi form:
   - Tahun, Level, Kategori, Lomba, Cabang, Penyelenggara, Peringkat
   - Kelompok prestasi, Bentuk pelaksanaan, Tanggal sertifikat
   - URL pendukung (sertifikat, foto, undangan) — atau upload file
   - Tab **Mahasiswa** → klik "+ Tambah", autocomplete by NIM/nama
   - Tab **Dosen** (opsional) → autocomplete by NUPTK/nama, isi URL surat tugas
4. Klik **Simpan** → status = `draft`

### 4.2 Approve draft

Sebagai admin_kemahasiswaan:
1. Lihat list di status `review`
2. Buka detail, validasi data + dokumen
3. Klik tombol **Approve** (panah hijau) → status `ready`

### 4.3 Kirim ke SIMKATMAWA

1. Pastikan record status = `ready` atau `error` (kalau gagal sebelum)
2. Di action column, klik tombol **"Kirim"** (biru)
3. Konfirmasi dialog → klik OK
4. Toast success "Job submit di-dispatch"
5. Status berubah ke `sending` (tunggu beberapa detik)
6. Hasil:
   - **Sukses** → status `sent`, simkatmawa_id ter-record
   - **Gagal** → status `error`, lihat error message di Sync Log

### 4.4 Cek Sync Log

Menu **SI Prestasi → Sync Log**:

- Filter by tipe (PRESTASI/SERTIFIKASI/REKOGNISI)
- Filter "Hanya yang sukses"
- Klik **Detail** untuk lihat:
  - Request payload (apa yang dikirim ke SIMKATMAWA)
  - Response body (apa yang diterima dari SIMKATMAWA)
  - Error message (kalau gagal)
  - Retry count

---

## 5. Mode Dry-Run

Saat awal deployment, mode dry-run **AKTIF** — semua submit tidak benar-benar
push ke SIMKATMAWA, hanya simulasi (log payload + return success). Tujuan:
test akurasi data + workflow tanpa risiko data dummy masuk ke prod SIMKATMAWA.

**Cek mode aktif:**
- Menu Sync Log → klik tombol **"Ping SIMKATMAWA"**
- Toast tampilkan `dry_run mode aktif` jika dry-run ON
- Toast tampilkan `kode_pt: XXXXXX` jika real mode (login ke SIMKATMAWA berhasil)

**Mematikan dry-run:**
Edit row `setting.api_config WHERE kode='simkatmawa'`:
- Set `a_dry_run = FALSE`
- Pastikan `username` + `password` (encrypted) sudah di-set lewat menu
  **Master Data → API Configuration**

---

## 6. Troubleshoot

### "Akses ditolak"
Cek role di JWT — pastikan punya `admin_kemahasiswaan` atau `developer`.
Hubungi admin man-akses untuk grant role.

### "Status saat ini 'draft' — tidak bisa di-submit"
Hanya status `ready` atau `error` yang bisa kirim ke SIMKATMAWA.
Set ke ready dulu via workflow approval.

### Status stuck di `sending` lama
Cek queue worker container:
```
docker ps | grep si-prestasi
docker exec myunila-si-prestasi-staging ps aux | grep queue:work
```
Kalau worker mati, restart container.

### Error "Enum kosong di ref" saat submit
Master data referensi belum ter-populate `kode_simkatmawa`. Cek:
```sql
SELECT * FROM ref.level_prestasi WHERE kode_simkatmawa IS NULL;
SELECT * FROM ref.kategori_prestasi WHERE kode_simkatmawa IS NULL;
```
Update via menu Master Data.

### HTTP 401 saat login ke SIMKATMAWA
Kredensial salah / expired di `setting.api_config`. Update lewat menu API
Configuration. Token JWT SIMKATMAWA dicache di Redis (`simkatmawa:token`).

### HTTP 4xx (validation error dari SIMKATMAWA)
Job tidak retry karena ini error data. Cek error_message di Sync Log,
perbaiki data, klik Kirim ulang.

### HTTP 5xx / Network error
Job otomatis retry 3x dengan backoff 10s, 60s, 300s. Setelah 3x gagal,
status = `error`. Bisa kirim manual lagi setelah masalah teratasi.

---

## 7. Kontak & Dukungan

- Bug / pertanyaan teknis: **dev@unila.ac.id**
- SIMKATMAWA support: hubungi tim Kemahasiswaan UPA TIK
- Dokumentasi internal lengkap: `/var/www/my-unila/docs/prestasi/`

---

## 8. Riwayat Versi

| Versi | Tanggal | Catatan |
|---|---|---|
| 1.0 | 2026-04-26 | Phase 1 + Phase 2 W7-W8 release awal: CRUD prestasi/sertifikasi/rekognisi + workflow + push SIMKATMAWA dry-run |
