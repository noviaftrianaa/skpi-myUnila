# Analisis Kesesuaian Alur Layanan vs Implementasi

Tanggal analisis: 6 April 2026

Dokumen ini membandingkan alur layanan yang didokumentasikan di `02-alur-layanan-simba-revisi.md` dengan implementasi aktual di backend (`backend/simbak-service/`) dan frontend (`frontend/src/app/dashboard/sim-bak/`), serta schema database (`data-model/script/postgresql/simbak_v1.0_fresh.sql`).

## Legenda

| Simbol | Arti |
|--------|------|
| OK | Sesuai dengan dokumen alur |
| PARTIAL | Sebagian terimplementasi |
| MISSING | Belum diimplementasi |

---

## 1. Status Standar (Pasal 1.1)

| Status | Backend | Frontend | Kesesuaian |
|--------|---------|----------|------------|
| Draft | `store()` → status `draft` | Form multi-step, simpan draf | OK |
| Diajukan | `ajukan()` → status `diajukan` | Tombol Submit | OK |
| Perlu Perbaikan | `mintaPerbaikan()` → status `perlu_perbaikan`, catatan wajib | Tombol "Minta Perbaikan" | OK |
| Diverifikasi | `verifikasi()` → status `diverifikasi` (surat_mandiri) | Tombol "Verifikasi" | OK |
| Menunggu Persetujuan | `verifikasi()` → status `menunggu_persetujuan` (permohonan_akademik) | Otomatis setelah verifikasi | OK |
| Disetujui | `approve()` → status `disetujui` | Tombol "Setujui" | OK |
| Ditolak | `reject()` → status `ditolak`, catatan wajib | Tombol "Tolak" | OK |
| Terbit | `terbitkan()` → status `terbit` | Tombol "Terbitkan" + download | OK |

Catatan: Backend membedakan alur `surat_mandiri` (langsung `diverifikasi`) dan `permohonan_akademik` (masuk `menunggu_persetujuan`) dengan benar.

---

## 2. Pola Umum Proses Digital (Pasal 1.2)

| Langkah | Backend | Frontend | Kesesuaian |
|---------|---------|----------|------------|
| 1. Pemohon isi formulir + unggah dokumen | `POST /pengajuan` + `POST /upload` | Form multi-step + drag-drop upload | OK |
| 2. Sistem validasi otomatis data akademik/keuangan | Tidak ada query ke PDUT saat pengajuan | Data mahasiswa tampil "-" | MISSING |
| 3. Petugas verifikasi kelengkapan dokumen | `GET /admin/pengajuan`, halaman verifikasi | List dokumen + tombol aksi | OK |
| 4. Kekurangan → dikembalikan ke pemohon | `mintaPerbaikan()` + catatan wajib | Tombol "Minta Perbaikan" | OK |
| 5. Lengkap → proses ke persetujuan | `verifikasi()` conditional per kategori | Otomatis | OK |
| 6. Dokumen hasil diterbitkan dan diarsipkan | `terbitkan()` + `dokumen_hasil` tabel | Tombol "Terbitkan" | PARTIAL — tidak ada upload file SK |
| 7. Notifikasi + unduh dokumen | `GET /dokumen-hasil/{id}/download` | Tombol download di riwayat | PARTIAL — notifikasi belum ada |

---

## 3. Analisis Per Jenis Layanan

### 3.1 Surat Keterangan Diterima sebagai Mahasiswa Baru / LoA

| # | Alur Docs | Backend | Frontend | Kesesuaian |
|---|-----------|---------|----------|------------|
| 1 | Pemohon isi formulir + unggah KTM sementara, slip UKT, surat permohonan | `POST /pengajuan` + `POST /upload` | Form multi-step, upload per persyaratan | OK |
| 2 | Status `Diajukan` | `ajukan()` → `diajukan` | Tombol Submit | OK |
| 3 | Admin BAK periksa kelengkapan dokumen | `GET /admin/pengajuan` | Halaman verifikasi dengan list dokumen | OK |
| 4 | Tidak lengkap → `Perlu Perbaikan` | `mintaPerbaikan()` + catatan | Tombol + textarea catatan | OK |
| 5 | Lengkap → Admin buat draf surat | `verifikasi()` → `diverifikasi` | Tombol "Verifikasi" | OK |
| 6 | Surat ditandatangani diunggah ke sistem | `terbitkan()` + `nomor_dokumen_hasil` | Tombol "Terbitkan" | PARTIAL — tidak ada upload file SK fisik |
| 7 | Status `Terbit` + notifikasi | Status → `terbit` | Status chip berubah | PARTIAL — notifikasi belum ada |
| 8 | Pemohon unduh surat dari portal | `GET /dokumen-hasil/{id}/download` | Tombol download di halaman riwayat | OK |

### 3.2 Alih Program / Pindah Studi Mahasiswa

| # | Alur Docs | Backend | Frontend | Kesesuaian |
|---|-----------|---------|----------|------------|
| 1 | Mahasiswa pilih prodi tujuan | Field `id_prodi_tujuan`, `id_fakultas_tujuan` ada di DB dan controller | Tidak ada field prodi tujuan di form | MISSING |
| 2 | Sistem ambil data IPK, SKS dari sistem akademik | Schema `data_pemohon` punya field IPK/SKS | Data menampilkan "-" placeholder | MISSING |
| 3 | Validasi syarat (IPK >= 2.75, SKS >= 40, maks semester 5) | Tidak ada validasi di backend | Tidak ada | MISSING |
| 4 | Admin Fakultas Asal verifikasi + unggah surat pengantar dekan | Single `verifikasi()` endpoint | Satu halaman admin tanpa bedakan fakultas | PARTIAL |
| 5 | Admin Fakultas Tujuan terima/tolak + hasil wawancara | Field `a_diterima_tujuan`, `hasil_wawancara` ada di DB | Tidak ada UI | MISSING |
| 6 | Admin Fakultas Tujuan unggah konversi SKS | Field `daftar_konversi_sks` ada di DB | Tidak ada UI | MISSING |
| 7 | Admin BAK verifikasi akhir | `verifikasi()` ada | Tombol verifikasi ada | PARTIAL |
| 8 | Admin BAK buat draf SK Rektor | `terbitkan()` ada | Tombol terbitkan ada | PARTIAL |
| 9 | SK ditandatangani diunggah | Field `nomor_dokumen_hasil` ada | Tidak ada upload SK | MISSING |
| 10 | Multi-level approval (Fakultas Asal → Fakultas Tujuan → BAK → Rektor) | Hanya 1 level approval dengan role `pejabat` | Hanya approve/reject sederhana | MISSING |

### 3.3 Surat Keterangan Pengganti KTM

| # | Alur Docs | Kesesuaian |
|---|-----------|------------|
| 1 | Mahasiswa isi alasan + unggah KTM sementara, surat aktif/PKKMB, surat polisi | OK — persyaratan dari `ref.persyaratan_layanan` |
| 2 | Status `Diajukan` | OK |
| 3 | Admin BAK verifikasi | OK |
| 4 | Dikembalikan jika tidak lengkap | OK |
| 5 | Admin buat draf surat | OK |
| 6 | Surat diunggah → `Terbit` | PARTIAL — tidak ada upload file SK |
| 7 | Mahasiswa unduh | OK |

### 3.4 Surat Keterangan Pengganti Sertifikat PKKMB

| # | Alur Docs | Kesesuaian |
|---|-----------|------------|
| 1 | Mahasiswa isi alasan + unggah scan KTM, surat PKKMB, surat polisi | OK — persyaratan dari `ref.persyaratan_layanan` |
| 2 | Status `Diajukan` | OK |
| 3 | Admin BAK verifikasi status PKKMB | PARTIAL — tidak ada validasi otomatis status PKKMB |
| 4 | Dikembalikan jika ada kekurangan | OK |
| 5 | Admin buat draf surat | OK |
| 6 | Surat diunggah → `Terbit` | PARTIAL — tidak ada upload file SK |
| 7 | Mahasiswa unduh | OK |

### 3.5 Surat Keterangan Herregistrasi Mahasiswa

| # | Alur Docs | Backend | Frontend | Kesesuaian |
|---|-----------|---------|----------|------------|
| 1 | Mahasiswa ajukan permohonan | `POST /pengajuan` | Form pengajuan | OK |
| 2 | Sistem ambil status registrasi dari sistem akademik | Tidak ada query PDUT | Data "-" | MISSING |
| 3 | Jika sudah herregistrasi → proses | Tidak ada validasi otomatis | Tidak ada | MISSING |
| 4 | Jika cuti/tidak herregistrasi → tolak otomatis | Tidak ada auto-reject | Tidak ada | MISSING |
| 5 | Admin BAK verifikasi | `verifikasi()` ada | Halaman verifikasi ada | OK |
| 6 | Admin buat draf surat | `terbitkan()` ada | Tombol terbitkan ada | OK |
| 7 | Surat diunggah → `Terbit` | Status → `terbit` | Status berubah | PARTIAL |
| 8 | Mahasiswa unduh | Download endpoint ada | Tombol download ada | OK |

### 3.6 Surat Keterangan Cuti Akademik Mahasiswa

| # | Alur Docs | Backend | Frontend | Kesesuaian |
|---|-----------|---------|----------|------------|
| 1 | Mahasiswa pilih semester mulai cuti + jumlah semester | `id_smt_mulai_cuti` + `jumlah_semester_cuti` di DB | Dropdown jumlah semester (1/2) | PARTIAL — field semester mulai tidak ada di form |
| 2 | Mahasiswa unggah surat permohonan, KTM, slip UKT, surat pengantar | `POST /upload` | Upload form | OK |
| 3 | Status `Diajukan` | `ajukan()` → `diajukan` | Tombol Submit | OK |
| 4 | Admin Fakultas verifikasi kelengkapan | `verifikasi()` → `menunggu_persetujuan` | Halaman verifikasi | PARTIAL — tidak bedakan admin fakultas vs admin BAK |
| 5 | Admin Fakultas unggah surat pengantar dekan | Tidak ada endpoint terpisah | Tidak ada UI | MISSING |
| 6 | Admin BAK verifikasi akhir | Sama endpoint | Sama halaman | PARTIAL |
| 7 | Admin BAK buat draf surat cuti | `terbitkan()` | Tombol terbitkan | OK |
| 8 | Surat diunggah → `Terbit` | Status → `terbit` | Status berubah | PARTIAL — tidak ada upload file |
| 9 | Mahasiswa unduh | Download endpoint | Tombol download | OK |

### 3.7 Undur Diri Mahasiswa

| # | Alur Docs | Backend | Frontend | Kesesuaian |
|---|-----------|---------|----------|------------|
| 1 | Mahasiswa isi alasan + unggah dokumen | `POST /pengajuan` + `POST /upload` | Form pengajuan | OK |
| 2 | Status `Diajukan` | `ajukan()` | Tombol Submit | OK |
| 3 | Admin Fakultas verifikasi | `verifikasi()` → `menunggu_persetujuan` | Halaman verifikasi | PARTIAL — tidak bedakan admin fakultas |
| 4 | Admin Fakultas unggah surat pengantar dekan | Tidak ada endpoint terpisah | Tidak ada UI | MISSING |
| 5 | Admin BAK verifikasi akhir | Sama endpoint | Sama halaman | PARTIAL |
| 6 | Admin BAK buat SK Rektor (bisa batch) | `terbitkan()` ada, tapi tidak ada link ke batch | Tidak ada mekanisme batch SK | MISSING |
| 7 | SK ditandatangani → `Terbit` | Status → `terbit` | Status berubah | PARTIAL |
| 8 | Mahasiswa unduh | Download endpoint | Tombol download | OK |

### 3.8 Penetapan Habis Masa Mukim (Batch)

| # | Alur Docs | Backend | Frontend | Kesesuaian |
|---|-----------|---------|----------|------------|
| 1 | Admin BAK tarik data mahasiswa dari sistem akademik per fakultas | `BatchController::store()` buat batch | Form create batch (tipe + semester) | MISSING — tidak query PDUT untuk generate kandidat |
| - | Kriteria: D3 >= 13 sem, S1 >= 17 sem, S2 >= 9 sem, S3 >= 13 sem | Tidak ada di `BatchRepository` | Tidak ada | MISSING |
| 2 | Sistem bentuk daftar kandidat + snapshot | Tabel `batch.kandidat_batch` ada + field snapshot | Tabel kandidat di batch detail | PARTIAL — snapshot field ada tapi tidak di-populate dari PDUT |
| 3 | Daftar dikirim ke Admin Fakultas untuk verifikasi | `verifikasiKandidat()` per kandidat | Tombol verify/exclude per baris | OK |
| 4 | Admin Fakultas konfirmasi atau beri catatan | Status `terverifikasi` atau `dikeluarkan` | Tombol check/X per kandidat | PARTIAL — tidak ada field catatan per kandidat |
| 5 | Admin Fakultas buat + unggah SK Dekan | Field `nomor_sk_dekan`, `path_sk_dekan` di DB | Tidak ada upload SK Dekan di UI | MISSING |
| 6 | Admin BAK susun SK Rektor | Field `nomor_sk_rektor`, `path_sk_rektor` di DB | Tidak ada upload SK Rektor di UI | MISSING |
| 7 | SK Rektor diunggah → selesai | `finalize()` set status `terbit` + nomor SK | Tombol "Finalkan & Terbitkan SK" (tanpa upload) | PARTIAL |
| 8 | Notifikasi otomatis ke mahasiswa | Tidak ada | Tidak ada | MISSING |

### 3.9 Penetapan Putus Studi Akademik (Batch)

| # | Alur Docs | Backend | Frontend | Kesesuaian |
|---|-----------|---------|----------|------------|
| 1 | Admin BAK tarik data berdasarkan kriteria putus studi | Tidak ada query PDUT | Form create batch | MISSING |
| - | Kriteria Sem IV: IPK < 2.00 atau SKS < 40 | Tidak ada di repository | Tidak ada | MISSING |
| - | Kriteria Sem VIII: IPK < 2.00 atau SKS < 80 | Tidak ada di repository | Tidak ada | MISSING |
| 2 | Sistem tampilkan semester, SKS lulus, IPK di tabel kandidat | Field ada di `kandidat_batch` | Tabel tampilkan IPK, semester, SKS | PARTIAL — data ada di tabel tapi tidak di-populate otomatis |
| 3 | Daftar dikirim ke Admin Fakultas | `verifikasiKandidat()` | Tombol verify/exclude | OK |
| 4 | Admin Fakultas keluarkan mahasiswa tertentu + alasan | Status `dikeluarkan` | Tombol X per kandidat | PARTIAL — tidak ada field alasan |
| 5 | Admin Fakultas buat + unggah SK Dekan | Field ada di DB | Tidak ada UI | MISSING |
| 6 | Admin BAK susun SK Rektor | Field ada di DB | Tidak ada UI | MISSING |
| 7 | SK Rektor diunggah → selesai | `finalize()` | Tombol finalize (tanpa upload) | PARTIAL |
| 8 | Notifikasi + peringatan UKT | Tidak ada | Tidak ada | MISSING |

### 3.10 Monitoring Data Mahasiswa Aktif dan Lulusan

| # | Alur Docs | Backend | Frontend | Kesesuaian |
|---|-----------|---------|----------|------------|
| 1 | Admin BAK buka dashboard monitoring | `GET /monitoring/mahasiswa-aktif` | Tab "Mahasiswa Aktif" | OK |
| 2 | Sistem tampilkan data aktif, lulusan, indikator tepat waktu | `GET /monitoring/lulusan` | Tab "Lulusan" | PARTIAL — lulusan menampilkan "sedang dikembangkan" |
| - | Kriteria tepat waktu: D3 <= 3th, S1 <= 4th, S2 <= 2th, S3 <= 3th | Tidak ada perhitungan di backend | Tidak ada | MISSING |
| 3 | Exclusion studi lanjut / RPL | Tidak ada | Tidak ada | MISSING |
| 4 | Filter prodi, tahun, semester | Parameter filter di API | Hanya filter fakultas (text input) | PARTIAL |
| 5 | Export data hasil monitoring | `GET /monitoring/export` | Tombol "Export CSV" (placeholder) | PARTIAL — endpoint ada, tombol ada, tapi belum fungsional |

---

## 4. Ringkasan Gap Berdasarkan Prioritas

### Prioritas Tinggi (Blocking — alur tidak bisa berjalan sesuai SOP)

| # | Gap | Detail | File Terkait |
|---|-----|--------|-------------|
| 1 | Multi-level approval chain | Hanya ada 1 level approval dengan role `pejabat`. Docs memerlukan: Admin Fakultas → Admin BAK → Dekan → Wakil Rektor. Perlu implementasi urutan tahapan approval berdasarkan `ref.tahapan_layanan` | `PersetujuanController.php`, `persetujuan/[id]/page.tsx` |
| 2 | Tarik kandidat batch dari PDUT | `BatchController::store()` hanya membuat header batch tanpa query kandidat dari SQL Server. Perlu implementasi query ke PDUT berdasarkan kriteria per jenis batch | `BatchController.php`, `BatchRepository.php` |
| 3 | Kriteria seleksi batch HMM | Belum ada logic: D3 >= 13 semester, S1 >= 17 semester, S2 >= 9 semester, S3 >= 13 semester | `BatchRepository.php` |
| 4 | Kriteria seleksi batch Putus Studi | Belum ada logic: Semester IV (IPK < 2.00 atau SKS < 40), Semester VIII (IPK < 2.00 atau SKS < 80) | `BatchRepository.php` |
| 5 | Integrasi data akademik PDUT ke data_pemohon | `createDataPemohon()` hanya simpan field minimal dari controller. Tidak ada enrichment dari PDUT (IPK, SKS, status registrasi, status pembayaran) | `PengajuanRepository.php`, `PengajuanController.php` |

### Prioritas Sedang (Fungsional tapi tidak lengkap)

| # | Gap | Detail | File Terkait |
|---|-----|--------|-------------|
| 6 | Field Alih Program di frontend | Form permohonan tidak punya field prodi tujuan, padahal backend sudah support `id_prodi_tujuan` dan `id_fakultas_tujuan` | `permohonan/[kode]/page.tsx` |
| 7 | UI wawancara + konversi SKS (Alih Program) | DB punya field `a_diterima_tujuan`, `hasil_wawancara`, `daftar_konversi_sks` tapi tidak ada UI | `persetujuan/[id]/page.tsx` |
| 8 | Upload file SK pada terbitkan dan finalize | Admin hanya bisa input nomor dokumen, tidak bisa unggah file SK yang sudah ditandatangani | `VerifikasiController.php`, `batch/[id]/page.tsx` |
| 9 | Upload SK Dekan pada batch | Field `nomor_sk_dekan`, `path_sk_dekan` ada di DB tapi tidak ada UI dan endpoint untuk upload | `BatchController.php`, `batch/[id]/page.tsx` |
| 10 | Catatan/alasan per kandidat batch | `verifikasiKandidat()` tidak menerima catatan alasan exclusion, padahal field `alasan_exclusion` ada di DB | `BatchController.php`, `batch/[id]/page.tsx` |
| 11 | Validasi otomatis herregistrasi | Sistem seharusnya auto-reject jika mahasiswa berstatus cuti atau tidak herregistrasi | `PengajuanController.php` |
| 12 | Semester mulai cuti di form frontend | Backend support `id_smt_mulai_cuti` tapi form hanya punya dropdown jumlah semester | `permohonan/[kode]/page.tsx` |

### Prioritas Rendah (Nice-to-have, tidak blocking)

| # | Gap | Detail | File Terkait |
|---|-----|--------|-------------|
| 13 | Notifikasi ke mahasiswa | Tidak ada notifikasi saat status berubah (email/portal) | Seluruh controller |
| 14 | Export monitoring fungsional | Tombol export ada tapi masih placeholder "segera tersedia" | `monitoring/page.tsx` |
| 15 | Filter monitoring lengkap | Hanya filter fakultas (text). Belum ada filter tahun, prodi, semester | `monitoring/page.tsx` |
| 16 | Indikator kelulusan tepat waktu | Belum ada perhitungan D3 <= 3th, S1 <= 4th, S2 <= 2th, S3 <= 3th | `MonitoringController.php`, `monitoring/page.tsx` |
| 17 | Tab lulusan fungsional | Menampilkan "Fitur monitoring lulusan sedang dikembangkan" | `monitoring/page.tsx` |
| 18 | Exclusion studi lanjut/RPL di monitoring | Tidak ada mekanisme tandai/keluarkan mahasiswa dari perhitungan | `MonitoringController.php` |
| 19 | Preview dokumen di halaman verifikasi | Admin bisa lihat nama file tapi tidak bisa preview isi dokumen | `admin/verifikasi/[id]/page.tsx` |
| 20 | Bulk verify kandidat batch | Verifikasi hanya per kandidat, tidak ada aksi massal | `batch/[id]/page.tsx` |

---

## 5. Kesimpulan

### Apa yang sudah sesuai

- **Alur surat mandiri** (LoA, KTM, PKKMB) sudah 80-90% sesuai docs. Workflow `draft → diajukan → perlu_perbaikan/diverifikasi → terbit` berjalan dengan benar.
- **Status standar** 8 status yang didefinisikan di docs sudah terimplementasi semua.
- **Pembedaan kategori** antara `surat_mandiri` (simple) dan `permohonan_akademik` (multi-approval) sudah ada di backend.
- **Struktur database** 15 tabel di 4 schema sudah lengkap dan field-field untuk fitur yang belum diimplementasi sudah disiapkan.
- **Master data CRUD** lengkap dan fungsional.
- **Riwayat/timeline** status pengajuan sudah tampil dengan baik.

### Apa yang belum sesuai

- **Alur multi-approval** (Cuti, Undur Diri, Alih Program) belum berjalan sesuai docs karena hanya ada 1 level approval.
- **Alur batch** (HMM, Putus Studi) belum bisa generate kandidat otomatis dari data akademik — kandidat harus diinput manual.
- **Integrasi PDUT** untuk validasi dan enrichment data akademik belum ada.
- **Alih Program** adalah layanan paling kompleks dan paling banyak gap-nya (prodi tujuan, wawancara, konversi SKS, multi-fakultas).

### Catatan

Database schema sudah menyediakan field untuk hampir semua fitur yang didokumentasikan (termasuk `a_diterima_tujuan`, `hasil_wawancara`, `daftar_konversi_sks`, `alasan_exclusion`, `nomor_sk_dekan`, dll). Gap utama ada di **controller/service layer** yang belum memanfaatkan field tersebut dan **frontend** yang belum menyediakan UI untuk mengisi field tersebut.
