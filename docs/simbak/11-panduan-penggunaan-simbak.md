# Panduan Penggunaan SIMBAK (Sistem Informasi Manajemen BAK)

Dokumen ini adalah panduan penggunaan aplikasi SIMBAK untuk seluruh pengguna berdasarkan perannya masing-masing.

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Peran Pengguna](#2-peran-pengguna)
3. [Panduan untuk Mahasiswa](#3-panduan-untuk-mahasiswa)
4. [Panduan untuk Admin Fakultas](#4-panduan-untuk-admin-fakultas)
5. [Panduan untuk Admin BAK](#5-panduan-untuk-admin-bak)
6. [Panduan untuk Pejabat (Approver)](#6-panduan-untuk-pejabat-approver)
7. [Alur Lengkap per Layanan](#7-alur-lengkap-per-layanan)
8. [Daftar Status Pengajuan](#8-daftar-status-pengajuan)

---

## 1. Pendahuluan

SIMBAK adalah sistem informasi layanan administrasi kemahasiswaan BAK (Biro Administrasi Kemahasiswaan) Universitas Lampung. Sistem ini mencakup:

- **Surat Mandiri** — Pengajuan surat keterangan (LoA, Pengganti KTM, Pengganti PKKMB, Herregistrasi)
- **Permohonan Akademik** — Pengajuan cuti akademik, undur diri, dan alih program/pindah studi
- **Evaluasi Studi (Batch)** — Penetapan habis masa mukim dan putus studi akademik
- **Monitoring Mahasiswa** — Data mahasiswa aktif, lulusan, dan kelulusan tepat waktu

Akses SIMBAK melalui menu **SI MBAK** di dashboard MyUnila.

---

## 2. Peran Pengguna

| Peran | Keterangan |
|-------|------------|
| **Mahasiswa** | Mengajukan permohonan surat dan permohonan akademik, mengunggah dokumen persyaratan, memantau status pengajuan |
| **Admin Fakultas** | Memverifikasi pengajuan mahasiswa di tingkat fakultas, memverifikasi kandidat batch evaluasi studi |
| **Admin BAK** | Memverifikasi pengajuan, menerbitkan surat/SK, mengelola batch evaluasi studi, monitoring data mahasiswa |
| **Pejabat** | Memberikan persetujuan akhir untuk permohonan akademik (Cuti, Undur Diri) |

---

## 3. Panduan untuk Mahasiswa

### 3.1. Dashboard

Setelah masuk ke SI MBAK, Anda akan melihat:

- **Profil Akademik** — Program studi, semester aktif, IPK
- **Ringkasan Pengajuan** — Total pengajuan, dalam proses, selesai, ditolak
- **Notifikasi** — Peringatan jika ada pengajuan yang perlu diperbaiki
- **Pengajuan Terakhir** — 5 pengajuan terbaru beserta statusnya

### 3.2. Mengajukan Surat Mandiri

Surat mandiri tersedia untuk 4 jenis layanan:

| Kode | Layanan | Estimasi Waktu |
|------|---------|----------------|
| SK-LOA | Surat Keterangan Diterima sebagai Mahasiswa Baru (LoA) | 3 hari kerja |
| SK-KTM | Surat Keterangan Pengganti KTM | 3 hari kerja |
| SK-PKKMB | Surat Keterangan Pengganti Sertifikat PKKMB | 3 hari kerja |
| SK-HERREG | Surat Keterangan Herregistrasi | 2 hari kerja |

**Langkah-langkah:**

1. Buka menu **Permohonan Surat**
2. Pilih jenis surat yang akan diajukan
3. **Langkah 1 — Data Pemohon**: Data diri Anda ditampilkan otomatis dari sistem (tidak dapat diubah). Periksa data tersebut, lalu klik **Lanjutkan**
4. **Langkah 2 — Unggah Dokumen**: Unggah semua dokumen persyaratan yang diminta. Format file: PDF atau gambar (JPG/PNG), maksimal 5 MB per file. Anda dapat melihat preview dokumen sebelum melanjutkan
5. **Langkah 3 — Review & Kirim**: Periksa kembali semua data dan dokumen. Anda bisa:
   - Klik **Simpan sebagai Draft** untuk melanjutkan nanti
   - Klik **Ajukan Permohonan** untuk langsung mengirim

**Dokumen persyaratan per jenis surat:**

- **SK-LOA**: Surat Permohonan Mahasiswa dan Wali, KTM Sementara, Slip UKT
- **SK-KTM**: KTM Sementara, Surat Keterangan Mahasiswa Aktif/Lulus PKKMB, Surat Kehilangan dari Kepolisian
- **SK-PKKMB**: Scan KTM Asli, Surat Keterangan Lulus PKKMB dari Fakultas, Surat Kehilangan dari Kepolisian
- **SK-HERREG**: Bukti Pembayaran UKT Semester Berjalan

> **Catatan:** Untuk SK-HERREG, pengajuan hanya bisa dilakukan jika status registrasi Anda "Aktif". Jika tidak memenuhi syarat, sistem akan menampilkan pesan pemblokiran.

### 3.3. Mengajukan Permohonan Akademik

Permohonan akademik tersedia untuk 3 jenis layanan:

| Kode | Layanan | Estimasi Waktu |
|------|---------|----------------|
| PM-CUTI | Cuti Akademik | 14 hari kerja |
| PM-UNDUR | Undur Diri | 14 hari kerja |
| PM-ALIH | Alih Program / Pindah Studi | 30 hari kerja |

**Langkah-langkah:**

1. Buka menu **Permohonan Akademik**
2. Pilih jenis permohonan
3. **Langkah 1 — Data & Alasan**:
   - Data diri ditampilkan otomatis
   - Isi **alasan permohonan** (wajib)
   - Untuk **Cuti Akademik**: pilih semester mulai cuti dan jumlah semester (1 atau 2)
   - Untuk **Alih Program**: pilih Fakultas Tujuan dan Program Studi Tujuan
   - Di bagian atas, ditampilkan alur proses yang akan dilalui
4. **Langkah 2 — Unggah Dokumen**: Unggah semua dokumen persyaratan
5. **Langkah 3 — Review & Kirim**: Periksa dan ajukan

**Dokumen persyaratan:**

- **PM-CUTI**: Surat Permohonan Mahasiswa dan Wali, Scan KTM, Slip UKT, Surat Pengantar Kaprodi
- **PM-UNDUR**: Surat Permohonan Mahasiswa dan Wali, Scan KTM, Slip UKT, Surat Pengantar Kaprodi
- **PM-ALIH**: Surat Permohonan, Surat Tidak Melanggar Tata Tertib, Surat Tidak Diputus Studi, Transkrip Akademik, Surat Berkelakuan Baik dari Fakultas, Bukti Bayar UKT

**Syarat akademik Alih Program (diperiksa otomatis):**

| Jenjang | IPK Minimal | SKS Lulus Minimal | Semester Maksimal |
|---------|-------------|-------------------|-------------------|
| S1 | 2.75 | 40 | 5 |
| D3 | 2.50 | 36 | 5 |
| S2/S3 | 3.00 | 12 | 3 |

> **Peringatan:** Pengunduran diri (PM-UNDUR) bersifat **permanen**. Anda tidak dapat mendaftar kembali di program studi yang sama.

### 3.4. Memantau Status Pengajuan

1. Buka menu **Riwayat Pengajuan**
2. Anda akan melihat tabel semua pengajuan Anda beserta status terkini
3. Gunakan filter untuk menyaring berdasarkan status atau jenis layanan
4. Klik baris pengajuan untuk melihat detail

**Di halaman detail, Anda dapat:**

- Melihat status terkini dan timeline proses
- Melihat dan mengunduh dokumen yang sudah diunggah
- Jika status **Perlu Perbaikan**: klik **Edit & Lanjutkan** untuk memperbaiki dan mengirim ulang
- Jika status **Terbit**: klik **Lihat** atau **Unduh** untuk mendapatkan surat/SK
- Jika masih **Draft**: klik **Edit & Lanjutkan** untuk melengkapi, atau **Hapus Draft** untuk membatalkan

### 3.5. Saat Diminta Perbaikan

Jika pengajuan dikembalikan dengan status "Perlu Perbaikan":

1. Anda akan melihat notifikasi di dashboard
2. Buka detail pengajuan melalui menu **Riwayat Pengajuan**
3. Baca catatan dari admin yang meminta perbaikan
4. Klik **Edit & Lanjutkan**
5. Perbaiki dokumen atau data yang diminta
6. Klik **Ajukan Kembali**

---

## 4. Panduan untuk Admin Fakultas

### 4.1. Dashboard

Dashboard admin menampilkan:

- **Ringkasan**: Total pengajuan, pengajuan baru, dalam proses, selesai, ditolak
- **Ketepatan Waktu Layanan**: Persentase pengajuan yang selesai dalam target waktu
- **Trend 6 Bulan**: Grafik pengajuan per kategori
- **Aktivitas Terbaru**: Log aksi terakhir

### 4.2. Memverifikasi Pengajuan Mahasiswa

Admin Fakultas bertugas memverifikasi pengajuan permohonan akademik (Cuti, Undur Diri, Alih Program) dari mahasiswa di fakultasnya.

**Langkah-langkah:**

1. Buka menu **Verifikasi**
2. Anda akan melihat daftar pengajuan yang menunggu verifikasi Anda
3. Klik **Verifikasi** pada pengajuan yang akan diproses
4. Di halaman detail verifikasi:
   - Periksa data pemohon
   - Periksa semua dokumen persyaratan (klik **Lihat** untuk preview)
   - Baca alasan permohonan
5. **Unggah Surat Pengantar Dekan** (wajib untuk permohonan akademik):
   - Di bagian "Surat Pengantar Dekan", klik **Pilih File**
   - Unggah file PDF surat pengantar dari Dekan
   - Surat ini wajib diunggah sebelum Anda dapat memverifikasi
6. Isi **catatan verifikasi** (opsional)
7. Pilih tindakan:
   - **Verifikasi** — Pengajuan lolos verifikasi dan lanjut ke tahap berikutnya (Admin BAK)
   - **Minta Perbaikan** — Kembalikan ke mahasiswa untuk melengkapi dokumen (isi catatan wajib)
   - **Tolak** — Tolak pengajuan secara permanen (isi alasan wajib)

### 4.3. Melihat Semua Pengajuan

1. Buka menu **Semua Pengajuan**
2. Anda hanya melihat pengajuan dari mahasiswa di fakultas Anda
3. Gunakan filter untuk mencari berdasarkan nama, NIM, nomor pengajuan, status, atau jenis layanan
4. Klik baris untuk melihat detail

### 4.4. Memverifikasi Kandidat Batch Evaluasi Studi

Saat Admin BAK membuat batch evaluasi (Habis Masa Mukim atau Putus Studi) dan mengirimkannya ke fakultas, Admin Fakultas diminta memverifikasi kandidat dari fakultasnya.

**Langkah-langkah:**

1. Buka menu **Verifikasi Evaluasi** — hanya batch dengan status "Verifikasi Fakultas" untuk fakultas Anda yang tampil
2. Klik batch untuk melihat detail. Jika ada **banner kuning** "Dikembalikan oleh Admin BAK untuk perbaikan", baca catatan alasan pengembalian
3. Untuk setiap kandidat mahasiswa, Anda dapat:
   - **Konfirmasi** (tombol hijau ✓) — Kandidat masuk ke penetapan final
   - **Keluarkan** (tombol merah ✗) — Kandidat dikeluarkan dari daftar. Pilih alasan:
     - HMM: Sudah mengajukan undur diri / Meninggal dunia / Lainnya
     - Putus Studi: Mahasiswa double degree / Jalur RPL / Diberi kesempatan lanjut studi / Sudah mengajukan undur diri / Meninggal dunia / Lainnya
     - Jika "Meninggal dunia" → wajib upload Surat Keterangan Meninggal Dunia (PDF)
     - Jika "Lainnya" → wajib isi keterangan
   - **Batalkan** (tombol kuning ↺) — Reset verifikasi kandidat kembali ke "masuk" (hanya jika belum finalisasi). Data verifikasi dan dokumen pendukung akan dihapus
4. Unggah **SK Dekan** (nomor SK, tanggal, file PDF)
5. Klik **Finalisasi Verifikasi Fakultas** untuk mengunci data — syarat: semua kandidat sudah diverifikasi dan SK Dekan sudah diupload

> **Catatan:** Setelah finalisasi, data kandidat terkunci. Namun Admin BAK masih dapat mengembalikan batch untuk perbaikan jika diperlukan.

---

## 5. Panduan untuk Admin BAK

### 5.1. Dashboard

Sama seperti Admin Fakultas, dengan akses penuh ke seluruh data pengajuan lintas fakultas.

### 5.2. Memverifikasi Pengajuan

Admin BAK memverifikasi pengajuan pada tahap setelah Admin Fakultas (untuk permohonan akademik) atau langsung setelah mahasiswa (untuk surat mandiri).

**Langkah-langkah:**

1. Buka menu **Verifikasi**
2. Klik **Verifikasi** pada pengajuan yang akan diproses
3. Di halaman detail:
   - Periksa data pemohon dan semua dokumen
   - Untuk permohonan akademik: pastikan Surat Pengantar Dekan sudah diunggah oleh Admin Fakultas
4. Pilih tindakan:
   - **Verifikasi/Proses** — Lanjutkan ke tahap berikutnya
   - **Minta Perbaikan** — Kembalikan ke mahasiswa
   - **Tolak** — Tolak secara permanen

### 5.3. Menerbitkan Surat/SK

Saat pengajuan sudah disetujui (atau diverifikasi untuk surat mandiri), Admin BAK menerbitkan dokumen hasil.

**Langkah-langkah:**

1. Buka pengajuan dengan status **Disetujui** (permohonan akademik) atau **Diverifikasi** (surat mandiri)
2. Klik tombol **Terbitkan**
3. Isi formulir penerbitan:
   - **Nomor Surat/SK** (wajib)
   - **Tanggal Surat** (wajib)
   - **Unggah File PDF** surat/SK yang sudah ditandatangani (wajib)
4. Klik **Terbitkan Dokumen**
5. Status pengajuan berubah menjadi **Terbit** dan mahasiswa dapat mengunduh suratnya

> **Untuk PM-ALIH:** Jika fakultas tujuan menolak, Anda dapat menerbitkan Surat Penolakan (bukan SK Rektor).

### 5.4. Mengelola Pengajuan Alih Program dari Luar Unila

Untuk mahasiswa pindahan dari universitas lain yang belum memiliki akun SSO Unila:

1. Buka menu **Permohonan Akademik** > **Alih Program**
2. Aktifkan toggle **Dari Luar Unila**
3. Isi data pemohon secara manual: nama, NIM/NPM asal, universitas asal, program studi asal, IPK, SKS
4. Pilih Fakultas dan Program Studi tujuan di Unila
5. Unggah dokumen persyaratan
6. Ajukan — tahap verifikasi Admin Fakultas Asal akan dilewati otomatis

### 5.5. Membuat Batch Evaluasi Studi

Admin BAK dapat membuat batch penetapan untuk dua jenis:

| Jenis | Kriteria Otomatis |
|-------|-------------------|
| **Habis Masa Mukim (HMM)** | D3 >= 13 semester, S1 >= 17 semester, S2 >= 9 semester, S3 >= 13 semester |
| **Putus Studi Akademik** | Semester IV: IPK < 2.00 atau SKS < 40; Semester VIII: IPK < 2.00 atau SKS < 80 |

**Langkah-langkah:**

1. Buka menu **Evaluasi Studi**
2. Klik **Buat Evaluasi Baru**
3. Isi formulir:
   - **Jenis Penetapan**: Habis Masa Mukim atau Putus Studi Akademik
   - **Semester Akademik**: Pilih semester evaluasi
   - **Fakultas** (wajib): Pilih fakultas — batch evaluasi per fakultas, akan diverifikasi admin fakultas terkait
   - **Nama Batch**: Judul evaluasi (contoh: "Penetapan HMM FMIPA Genap 2025/2026")
   - **Catatan** (opsional)
4. Klik **Preview Kandidat** untuk melihat data kandidat (otomatis exclude mahasiswa yang sudah dikonfirmasi di batch terbit sebelumnya)
5. Klik **Buat Evaluasi & Tarik Data** untuk membuat batch dan menarik semua kandidat

> **Validasi:** Sistem menolak pembuatan batch jika sudah ada batch aktif (belum terbit) untuk kombinasi jenis + semester + fakultas yang sama.

### 5.6. Mengelola Batch Evaluasi

Setelah batch dibuat, alur pengelolaan:

1. **Kirim ke Fakultas** (tombol biru "Kirim ke Fakultas"):
   - Status batch: `kandidat_ditarik` → `verifikasi_fakultas`
   - Admin Fakultas terkait dapat mulai memverifikasi kandidat

2. **Pantau Verifikasi Fakultas**:
   - Buka detail batch → lihat stats (dikonfirmasi / dikeluarkan / belum diproses)
   - Admin Fakultas memverifikasi tiap kandidat, upload SK Dekan, lalu finalisasi
   - Setelah finalisasi fakultas → status: `sk_dekan_terbit`

3. **Review Hasil (status SK Dekan Terbit)**:
   - Lihat hasil verifikasi dan SK Dekan yang diupload
   - **Kembalikan ke Fakultas** (tombol kuning) — jika ada yang perlu diperbaiki:
     - Wajib isi alasan (min 10 karakter)
     - Semua status kandidat direset ke "masuk"
     - Admin fakultas bisa verifikasi ulang
     - Banner catatan pengembalian tampil di halaman fakultas
   - **Finalkan & Terbitkan SK Rektor** (tombol hijau) — jika sudah benar:
     - Isi nomor SK Rektor, tanggal, dan unggah file PDF
     - Status batch berubah menjadi **Terbit**

**Tindakan tambahan di halaman detail batch:**

- **Tarik Ulang Data** (biru): Reset dan tarik ulang kandidat dari PDUT (hanya status draft/kandidat_ditarik). Kandidat dari batch terbit sebelumnya otomatis diexclude
- **Export CSV**: Unduh daftar kandidat dalam format CSV
- **Kirim Email/WhatsApp** per kandidat: Notifikasi individual
- **Hapus** (merah): Hapus batch (hanya status draft/kandidat_ditarik/verifikasi_fakultas, alasan wajib jika sudah verifikasi)

### 5.7. Monitoring Mahasiswa

Menu **Monitoring** menyediakan data mahasiswa dari database PDUT:

1. **Statistik**: Total mahasiswa aktif, total lulusan, persentase kelulusan tepat waktu, rata-rata masa studi
2. **Tab Mahasiswa Aktif**: Tabel data seluruh mahasiswa aktif dengan filter fakultas, prodi, jenjang, angkatan
3. **Tab Lulusan**: Tabel data lulusan dengan indikator tepat waktu dan filter tahun lulus
4. **Export CSV**: Unduh data ke file CSV
5. **Pengaturan KTW**: Kelola jalur pendaftaran yang dikecualikan dari perhitungan Kelulusan Tepat Waktu (KTW)

**Mengatur KTW Exclusion:**

1. Di tab Lulusan, klik **Pengaturan KTW**
2. Tambah jalur: pilih dari dropdown atau ketik manual, beri deskripsi
3. Aktifkan/nonaktifkan jalur yang sudah ada
4. Hapus jalur jika tidak diperlukan lagi

> **Catatan:** Jalur yang di-exclude (misal: Pindahan/Transfer, RPL) tidak dihitung dalam persentase KTW karena masa studi mereka tidak sebanding dengan jalur reguler.

### 5.8. Menu Master Data

Admin BAK dapat mengelola konfigurasi layanan:

- **Jenis Layanan**: Tambah/edit/nonaktifkan jenis layanan
- **Persyaratan**: Konfigurasi dokumen yang dibutuhkan per layanan
- **Tahapan Workflow**: Atur urutan dan aktor setiap tahapan proses
- **Template Dokumen**: Kelola template surat/SK

---

## 6. Panduan untuk Pejabat (Approver)

Pejabat (Dekan, Wakil Rektor, Rektor) bertugas memberikan persetujuan akhir untuk permohonan akademik.

### 6.1. Dashboard

Menampilkan ringkasan dan jumlah pengajuan yang menunggu persetujuan.

### 6.2. Menyetujui atau Menolak Permohonan

**Langkah-langkah:**

1. Buka menu **Persetujuan**
2. Anda akan melihat daftar permohonan yang menunggu persetujuan Anda
3. Klik pada permohonan untuk melihat detail
4. Di halaman detail:
   - Periksa **Workflow Stepper** — melihat tahapan yang sudah dilewati
   - Periksa **Approval Timeline** — riwayat keputusan sebelumnya
   - Periksa data pemohon dan alasan permohonan
   - Periksa dokumen persyaratan
5. Pilih tindakan:
   - **Setujui**: Isi catatan (opsional), klik **Konfirmasi Persetujuan**. Pengajuan akan lanjut ke tahap penerbitan dokumen oleh Admin BAK
   - **Tolak**: Isi alasan penolakan (wajib), klik **Konfirmasi Penolakan**. Pengajuan berakhir dan tidak dapat diproses kembali

> **Perhatian:** Keputusan persetujuan atau penolakan bersifat **final** dan tidak dapat dibatalkan.

---

## 7. Alur Lengkap per Layanan

### 7.1. Surat Mandiri (SK-LOA, SK-KTM, SK-PKKMB, SK-HERREG)

```
Mahasiswa                    Admin BAK                    Admin BAK
   │                            │                            │
   ├─ Isi data & unggah ──────>│                            │
   │  dokumen                   ├─ Periksa data & ─────────>│
   │  [DRAFT → DIAJUKAN]       │  dokumen                   ├─ Terbitkan surat
   │                            │  [DIAJUKAN → DIVERIFIKASI] │  [DIVERIFIKASI → TERBIT]
   │                            │                            │
   │<───────────────────────────┼────────────────────────────┤
   │  Unduh surat yang terbit                                │
```

**3 tahapan, 2 peran terlibat (Mahasiswa + Admin BAK)**

### 7.2. Cuti Akademik & Undur Diri (PM-CUTI, PM-UNDUR)

```
Mahasiswa        Admin Fakultas       Admin BAK          Pejabat          Admin BAK
   │                  │                  │                  │                │
   ├─ Ajukan ───────>│                  │                  │                │
   │                  ├─ Verifikasi ───>│                  │                │
   │                  │  + upload surat │                  │                │
   │                  │  pengantar dekan├─ Verifikasi ───>│                │
   │                  │                  │                  ├─ Setujui ────>│
   │                  │                  │                  │                ├─ Terbitkan
   │                  │                  │                  │                │
```

**5 tahapan, 4 peran terlibat**

Status: `draft → diajukan → diverifikasi → menunggu_persetujuan → disetujui → terbit`

### 7.3. Alih Program / Pindah Studi (PM-ALIH)

```
Mahasiswa/       Admin Fakultas       Admin Fakultas       Admin BAK         Admin BAK
Admin BAK           Asal                Tujuan               │                 │
   │                  │                    │                  │                 │
   ├─ Ajukan ───────>│                    │                  │                 │
   │                  ├─ Verifikasi ─────>│                  │                 │
   │                  │                    ├─ Proses ───────>│                 │
   │                  │                    │  penerimaan      ├─ Verifikasi ──>│
   │                  │                    │                  │  akhir          ├─ Terbitkan
   │                  │                    │                  │                 │  SK/Penolakan
```

**5 tahapan, 3 peran terlibat (Mahasiswa, Admin Fakultas, Admin BAK)**

> Untuk pemohon dari luar Unila: tahap Admin Fakultas Asal dilewati otomatis.

### 7.4. Batch Evaluasi Studi (BA-HMM, BA-PUTUS)

```
Admin BAK                    Admin Fakultas                    Admin BAK
   │                              │                              │
   ├─ Buat batch &               │                              │
   │  tarik kandidat             │                              │
   │  [draft → kandidat_ditarik] │                              │
   │                              │                              │
   ├─ Kirim ke Fakultas ────────>│                              │
   │  [→ verifikasi_fakultas]    │                              │
   │                              ├─ Verifikasi tiap kandidat   │
   │                              │  (konfirmasi/keluarkan/     │
   │                              │   batalkan)                  │
   │                              ├─ Upload SK Dekan             │
   │                              ├─ Finalisasi Verifikasi ────>│
   │                              │  [→ sk_dekan_terbit]         │
   │                              │                              ├─ Review:
   │                              │                              │  Kembalikan? ──> (kembali ke
   │                              │                              │                  verifikasi_fakultas)
   │                              │                              │  atau
   │                              │                              │  Finalkan & Terbitkan SK Rektor
   │                              │                              │  [→ terbit]
```

**2 peran terlibat (Admin BAK + Admin Fakultas)**

Status batch: `draft → kandidat_ditarik → verifikasi_fakultas → sk_dekan_terbit → terbit`

> Admin BAK dapat mengembalikan batch dari `sk_dekan_terbit` ke `verifikasi_fakultas` jika ada perbaikan yang diperlukan (dengan alasan wajib). Semua status kandidat direset.

---

## 8. Daftar Status Pengajuan

| Status | Label | Keterangan |
|--------|-------|------------|
| `draft` | Draft | Pengajuan disimpan tapi belum dikirim. Mahasiswa masih bisa mengedit atau menghapus |
| `diajukan` | Diajukan | Pengajuan sudah dikirim, menunggu verifikasi tahap pertama |
| `perlu_perbaikan` | Perlu Perbaikan | Dikembalikan ke mahasiswa untuk melengkapi/memperbaiki dokumen |
| `diverifikasi` | Diverifikasi | Lolos verifikasi satu tahap, lanjut ke tahap berikutnya |
| `menunggu_persetujuan` | Menunggu Persetujuan | Menunggu keputusan pejabat (Dekan/Wakil Rektor/Rektor) |
| `disetujui` | Disetujui | Disetujui pejabat, menunggu penerbitan dokumen oleh Admin BAK |
| `terbit` | Terbit | Surat/SK sudah diterbitkan dan dapat diunduh oleh mahasiswa |
| `ditolak` | Ditolak | Pengajuan ditolak secara permanen, tidak dapat diproses kembali |

**Urutan progres:**

```
draft(0%) → diajukan(20%) → diverifikasi(40%) → menunggu_persetujuan(60%) → disetujui(80%) → terbit(100%)
```

> Dari setiap tahap (kecuali draft dan terbit), pengajuan dapat **ditolak** (bersifat final) atau **diminta perbaikan** (dikembalikan ke mahasiswa).

---

*Dokumen ini dibuat pada 5 Mei 2026. Untuk pertanyaan atau bantuan teknis, hubungi Admin BAK atau UPT TIK Universitas Lampung.*
