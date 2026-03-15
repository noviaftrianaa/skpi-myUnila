# Analisis Pengembangan Aplikasi SIMBA sebagai Modul MYUNILA

Tanggal revisi: 15 Maret 2026

## 1. Ringkasan hasil telaah dokumen awal

Berdasarkan telaah terhadap dokumen analisis awal dan dokumen alur layanan, terdapat beberapa hal yang perlu diperbaiki sebelum pengembangan dimulai:

1. Posisi aplikasi masih ditulis seolah berdiri sendiri sebagai `simba.unila.ac.id`, padahal implementasi yang diminta adalah sebagai modul dalam Project MYUNILA.
2. Ruang lingkup pada dokumen analisis belum konsisten dengan dokumen alur layanan. Beberapa layanan sudah muncul di alur, tetapi belum masuk jelas ke analisis ruang lingkup.
3. Bagian kebutuhan per layanan, risiko utama, dan tahapan implementasi masih sangat umum. Ini belum cukup untuk menjadi dasar backlog pengembangan.
4. Dokumen alur layanan masih berupa poin-poin operasional mentah, sehingga perlu distandardisasi menjadi alur digital yang jelas, dapat diaudit, dan siap diterjemahkan ke workflow sistem.
5. Terdapat isu kebijakan yang belum final, terutama untuk kasus alih program atau pindah studi dari luar Unila dan mekanisme penomoran atau tanda tangan dokumen.

Kesimpulan: dokumen awal cukup sebagai bahan identifikasi kebutuhan, tetapi belum cukup sebagai dasar spesifikasi implementasi. Revisi harus mengubah SIMBA dari aplikasi mandiri menjadi modul layanan BAK di dalam ekosistem MYUNILA.

## 2. Posisi SIMBA dalam arsitektur MYUNILA

SIMBA pada tahap ini diperlakukan sebagai modul layanan akademik atau administrasi mahasiswa milik BAK yang terintegrasi penuh dengan MYUNILA.

### Penempatan teknis

- Backend layanan ditempatkan di `backend/bak-service`
- Frontend modul ditempatkan di `frontend/src/app/sim-bak`
- Frontend diakses sebagai route MYUNILA, dengan asumsi basis route `/sim-bak`
- Backend dipublikasikan melalui pola microservice MYUNILA dan diakses melalui API Gateway/Kong

### Implikasi arsitektur

- Autentikasi tidak dibuat terpisah; modul harus memakai SSO atau JWT MYUNILA yang sudah ada.
- Role dan konteks unit tidak dikelola lokal; modul harus mengikuti mekanisme role MYUNILA.
- Data akademik dan keuangan tidak menjadi sumber data lokal SIMBA; modul hanya mengonsumsi data dari system of record.
- Dokumen hasil layanan harus dapat dilacak, diarsipkan, dan ditautkan ke akun pengguna MYUNILA.

### Catatan penting

Nama folder backend yang disiapkan adalah `bak-service`. Penamaan ini lebih konsisten dengan pola service MYUNILA yang saat ini umumnya menggunakan bentuk singular seperti `auth-service` dan `public-service`, sehingga lebih aman untuk dipakai sebagai dasar endpoint, dokumentasi, dan deployment.

## 3. Tujuan sistem

Tujuan pengembangan SIMBA dalam MYUNILA adalah:

1. Menyediakan layanan administrasi mahasiswa BAK secara digital, terstruktur, dan dapat ditelusuri.
2. Mengurangi proses manual berbasis disposisi dan arsip fisik menjadi workflow pengajuan, verifikasi, persetujuan, terbit dokumen, dan arsip digital.
3. Mengintegrasikan validasi data akademik, registrasi, dan pembayaran agar keputusan layanan tidak bergantung penuh pada pemeriksaan manual.
4. Menyediakan histori proses, audit trail, dan pelaporan untuk kebutuhan operasional BAK.
5. Menyatukan akses layanan mahasiswa melalui akun MYUNILA tanpa membuat portal terpisah.

## 4. Ruang lingkup layanan

### 4.1 Layanan yang masuk ruang lingkup

| Kelompok | Layanan | Catatan |
| --- | --- | --- |
| Layanan surat mandiri | Surat Keterangan Diterima sebagai Mahasiswa Baru / LoA | Ditujukan untuk mahasiswa baru atau calon mahasiswa yang sudah memiliki akses sesuai kebijakan |
| Layanan surat mandiri | Surat Keterangan Pengganti KTM | Perlu unggah dokumen kehilangan dan verifikasi status mahasiswa |
| Layanan surat mandiri | Surat Keterangan Pengganti Sertifikat PKKMB | Perlu validasi status kelulusan PKKMB |
| Layanan surat mandiri | Surat Keterangan Herregistrasi | Perlu validasi status registrasi semester berjalan |
| Layanan permohonan akademik | Cuti Akademik | Workflow mahasiswa ke fakultas lalu ke BAK dan pejabat penandatangan |
| Layanan permohonan akademik | Undur Diri | Dapat menghasilkan SK batch |
| Layanan permohonan akademik | Alih Program / Pindah Program Studi | Paling kompleks karena melibatkan fakultas asal dan tujuan |
| Layanan batch administrasi | Penetapan Habis Masa Mukim | Berbasis data tarik dari sistem akademik |
| Layanan batch administrasi | Penetapan Putus Studi Akademik | Berbasis evaluasi akademik dan verifikasi fakultas |
| Monitoring | Monitoring mahasiswa aktif dan lulusan | Dashboard, filter, ekspor, dan exclusion tertentu |

### 4.2 Di luar ruang lingkup tahap awal

- Perubahan kebijakan akademik dan perubahan dasar hukum.
- Penggantian sistem akademik, keuangan, atau persuratan yang menjadi sumber data.
- Digitalisasi arsip lama dalam skala massal.
- Pengelolaan proses pindahan mahasiswa dari luar Unila apabila aturan bisnis dan integrasinya belum ditetapkan.
- Tanda tangan elektronik tersertifikasi bila infrastruktur dan otoritas penandatangan belum siap.

## 5. Aktor dan kewenangan

| Aktor | Peran utama di sistem |
| --- | --- |
| Mahasiswa | Mengajukan layanan, mengunggah dokumen, memantau status, mengunduh dokumen hasil |
| Mahasiswa baru / calon mahasiswa baru | Mengakses layanan tertentu seperti LoA, sesuai skema akun yang berlaku di MYUNILA |
| Admin Fakultas Asal | Memverifikasi kelengkapan, mengunggah surat pengantar, memproses disposisi dari unit asal |
| Admin Fakultas Tujuan | Memproses layanan yang melibatkan penerimaan di unit tujuan, termasuk hasil wawancara atau konversi SKS |
| Operator/Admin BAK | Verifikasi akhir, pembuatan draf dokumen, penetapan batch, publikasi dokumen |
| Approver Fakultas | Pihak yang memberi persetujuan atau surat pengantar atas nama fakultas |
| Approver Universitas | WR, Rektor, Karo, atau Kabag sesuai jenis layanan dan tata naskah yang berlaku |
| Admin Persuratan / HTL | Opsional, jika penomoran dokumen dipisah dari modul SIMBA |
| Admin Sistem | Pengelolaan konfigurasi layanan, role, template, keamanan, dan integrasi |

Catatan: di implementasi digital, sistem sebaiknya membedakan antara aktor operasional dan pejabat penandatangan. Orang yang menginput atau memverifikasi belum tentu orang yang menandatangani dokumen.

## 6. Kebutuhan fungsional inti platform

Kebutuhan inti yang berlaku untuk semua layanan:

1. Login menggunakan autentikasi MYUNILA.
2. Otorisasi berbasis role, unit, dan jenis layanan.
3. Pengajuan layanan online dengan formulir dinamis per jenis layanan.
4. Unggah dokumen persyaratan dengan validasi ukuran, tipe file, dan metadata.
5. Validasi otomatis dari sistem sumber, misalnya status mahasiswa, semester, SKS, IPK, masa studi, dan status pembayaran.
6. Workflow berjenjang dengan status yang konsisten: draft, diajukan, verifikasi, perbaikan, disetujui, ditolak, dan terbit.
7. Catatan pemeriksa pada setiap tahapan proses.
8. Pembuatan draf surat atau SK dari template.
9. Arsip dokumen hasil dalam format PDF.
10. Notifikasi status ke pengguna dan unit terkait.
11. Audit trail lengkap untuk pengajuan, perubahan status, dan dokumen.
12. Dashboard operasional untuk antrean layanan, SLA, dan monitoring batch.

## 7. Kebutuhan fungsional per kelompok layanan

### 7.1 Layanan surat mandiri

Karakteristik:

- Pengajuan dilakukan langsung oleh mahasiswa.
- Validasi utama berupa pengecekan identitas, status mahasiswa, dan kelengkapan dokumen.
- Output berupa surat keterangan yang dapat diunduh.

Jenis layanan:

- Surat Keterangan Diterima sebagai Mahasiswa Baru / LoA
- Surat Keterangan Pengganti KTM
- Surat Keterangan Pengganti Sertifikat PKKMB
- Surat Keterangan Herregistrasi

### 7.2 Layanan permohonan akademik

Karakteristik:

- Ada alur persetujuan berjenjang.
- Melibatkan fakultas dan BAK.
- Output dapat berupa surat keterangan atau SK rektor.

Jenis layanan:

- Cuti Akademik
- Undur Diri
- Alih Program / Pindah Studi

### 7.3 Layanan batch administrasi

Karakteristik:

- Inisiasi berasal dari admin BAK berdasarkan data tarik dari sistem akademik.
- Perlu mekanisme verifikasi fakultas atas kandidat yang diusulkan.
- Output umumnya berupa SK batch dan notifikasi ke mahasiswa.

Jenis layanan:

- Penetapan Habis Masa Mukim
- Penetapan Putus Studi Akademik

### 7.4 Monitoring data mahasiswa aktif dan lulusan

Karakteristik:

- Berfungsi sebagai dashboard analitik operasional.
- Memerlukan filter, rekap, ekspor, dan exclusion tertentu.
- Tidak selalu menghasilkan dokumen, tetapi menjadi basis pemantauan dan pengambilan keputusan.

## 8. Kebutuhan data awal

### 8.1 Data master

- Fakultas, program studi, jenjang, angkatan
- Jenis layanan
- Template dokumen
- Tahapan workflow dan SLA
- Matriks approver per layanan dan unit
- Referensi semester akademik

### 8.2 Data transaksi

- Nomor permohonan
- Identitas pemohon
- Snapshot status akademik saat pengajuan
- Snapshot status registrasi dan pembayaran
- Dokumen persyaratan
- Riwayat verifikasi dan persetujuan
- Catatan per tahapan
- Dokumen hasil, nomor dokumen, tanggal terbit

### 8.3 Data batch

- Daftar kandidat hasil tarik data
- Dasar seleksi atau rule snapshot
- Hasil verifikasi fakultas
- Status inclusion atau exclusion kandidat
- Dokumen SK fakultas dan SK rektor

## 9. Entitas domain yang disarankan

Untuk memudahkan desain backend `bak-service`, minimal dibutuhkan entitas berikut:

| Entitas | Fungsi |
| --- | --- |
| `service_types` | Daftar jenis layanan |
| `service_requests` | Header pengajuan per layanan |
| `service_request_applicants` | Snapshot data pemohon saat pengajuan |
| `service_request_documents` | Dokumen persyaratan yang diunggah |
| `service_request_steps` | Riwayat alur proses dan status |
| `service_request_approvals` | Persetujuan dan keputusan per aktor |
| `service_request_outputs` | Surat atau SK hasil layanan |
| `service_templates` | Template dokumen |
| `service_batch_jobs` | Header proses batch habis masa mukim atau putus studi |
| `service_batch_candidates` | Daftar mahasiswa kandidat dalam satu batch |
| `service_batch_verifications` | Hasil verifikasi fakultas terhadap kandidat batch |
| `audit_logs` | Jejak audit sistem dan aktivitas pengguna |

Prinsip utama: data akademik dan keuangan sebaiknya tidak diduplikasi sebagai master tetap di SIMBA. Yang disimpan adalah snapshot yang relevan untuk bukti proses.

## 10. Integrasi sistem yang dibutuhkan

| Integrasi | Kebutuhan data | Catatan implementasi |
| --- | --- | --- |
| `auth-service` atau mekanisme SSO MYUNILA | autentikasi, token, identitas pengguna | wajib sejak awal |
| layer role atau akses MYUNILA | role, unit, jabatan, konteks pengguna | wajib sejak awal |
| sistem akademik atau SIAKADU | status mahasiswa, semester, IPK, SKS, masa studi, lulusan | wajib sejak awal |
| `keuangan-service` atau sumber UKT | status pembayaran UKT | penting untuk cuti, undur diri, dan layanan yang membutuhkan bukti bayar |
| database referensi `pdut` | data referensi akademik dan data sumber yang dibutuhkan untuk validasi | dipakai sebagai koneksi baca atau read-only, bukan untuk transaksi SIMBAK |
| persuratan atau penomoran | nomor surat atau nomor SK | bisa ditunda bila nomor masih dikelola internal |
| layanan notifikasi | email dan notifikasi portal | disarankan sejak MVP |
| penyimpanan dokumen | file upload dan PDF output | wajib sejak awal |

## 11. Spesifikasi teknis yang disarankan

Spesifikasi teknis inti untuk modul ini sebaiknya ditetapkan eksplisit di dokumen analisis agar menjadi acuan yang sama bagi backend, frontend, devops, dan integrasi.

### 11.1 Backend

- Framework utama: `Laravel 12`
- Bahasa: `PHP 8.2` atau versi yang kompatibel dengan Laravel 12
- Bentuk layanan: microservice MYUNILA dengan nama service `bak-service`
- Gaya API: REST API untuk kebutuhan frontend dan integrasi internal
- Dokumentasi API: OpenAPI atau Swagger
- Pola akses data: `dual database connection`

Catatan:

- Service Laravel yang sudah ada di backend MYUNILA saat ini mayoritas masih berada pada Laravel 11.
- Untuk modul baru, penggunaan Laravel 12 tetap layak, tetapi perlu dikendalikan agar standar deployment, logging, auth middleware, dan struktur project tetap selaras dengan service lain.
- Koneksi default backend sebaiknya diarahkan ke database transaksional SIMBAK, sedangkan koneksi referensi dipanggil secara eksplisit pada repository atau service yang membutuhkan data PDUT.

### 11.2 Frontend

- Framework UI: `React`
- Lokasi implementasi: `frontend/src/app/sim-bak`
- Pola integrasi: mengikuti monorepo frontend MYUNILA yang saat ini berbasis `Next.js` dan `React`

Catatan:

- Secara teknis, modul `sim-bak` akan hidup di ekosistem frontend MYUNILA yang sekarang menggunakan Next.js App Router.
- Karena itu, penulisan spesifikasi yang paling aman adalah frontend menggunakan React pada stack frontend MYUNILA, bukan aplikasi React terpisah di luar monorepo.

### 11.3 Database

- Database utama: `PostgreSQL`
- Database referensi tambahan: `PDUT`

Alasan:

- PostgreSQL cocok untuk kebutuhan transaksi, relasi data workflow, audit trail, dan pelaporan.
- Stack Laravel yang sudah ada di MYUNILA juga telah memiliki dukungan driver `pgsql` pada konfigurasi database, sehingga tidak bertentangan dengan pola codebase saat ini.
- Pemisahan database referensi dan database transaksional membuat domain data SIMBAK lebih bersih dan aman.

### 11.3.1 Rekomendasi dual connection

Model koneksi database yang disarankan adalah sebagai berikut:

| Nama koneksi | Fungsi | Rekomendasi penggunaan |
| --- | --- | --- |
| `pdut` | sumber data referensi dan data akademik | read-only, dipakai untuk lookup, validasi, dan pengambilan snapshot |
| `simbak` | database transaksi aplikasi SIMBAK | default connection, dipakai untuk create, update, delete, workflow, audit trail, dan output dokumen |

Prinsip implementasi:

1. Jangan menyimpan transaksi SIMBAK ke database PDUT.
2. Jangan membuat foreign key lintas database.
3. Jangan bergantung pada join lintas koneksi di level database; penggabungan data dilakukan di service layer aplikasi.
4. Data penting dari PDUT yang menjadi dasar keputusan layanan harus disimpan sebagai snapshot di database SIMBAK saat proses berjalan.

Contoh data yang dibaca dari `pdut`:

- identitas mahasiswa
- fakultas, program studi, jenjang, semester aktif
- IPK, SKS, masa studi
- status akademik dan status registrasi yang diperlukan untuk validasi layanan

Contoh data yang disimpan di `simbak`:

- pengajuan layanan
- tahapan workflow dan approval
- dokumen persyaratan
- hasil verifikasi dan catatan proses
- SK atau surat hasil layanan
- batch habis masa mukim, batch putus studi, audit trail, dan notifikasi

### 11.4 Container dan runtime

- Deployment lokal dan server sebaiknya mengikuti pola container `Docker`
- Service `bak-service` sebaiknya ditambahkan ke `backend/docker-compose.yml`
- Reverse proxy atau routing internal mengikuti pola backend MYUNILA yang sudah berjalan

Alasan:

- Backend modul lain pada folder `backend` juga dijalankan melalui container.
- Dengan pendekatan ini, konsistensi environment, dependency, dan proses deployment akan lebih terjaga.

### 11.5 Redis

`Redis` sangat layak ditambahkan sebagai komponen pendukung modul ini.

Peran Redis yang disarankan:

- cache untuk data referensi dan hasil query yang sering dipakai
- queue backend untuk proses asynchronous seperti notifikasi, generate dokumen, dan pekerjaan batch
- session store atau token helper bila diperlukan oleh pola auth yang digunakan
- distributed lock untuk mencegah duplikasi proses batch atau generate dokumen

Catatan:

- Infrastruktur backend MYUNILA saat ini sudah memakai Redis pada `docker-compose` dan beberapa service Laravel maupun Go juga sudah memanfaatkannya.
- Karena itu, Redis bukan tambahan asing, tetapi komponen yang memang sudah sesuai dengan pola infrastruktur yang ada.

## 12. Rekomendasi arsitektur implementasi

### 12.1 Backend

Karena pola backend MYUNILA saat ini didominasi service Laravel untuk layanan administrasi web, `bak-service` sebaiknya mengikuti pola tersebut agar:

- konsisten dengan service lain,
- mudah menggunakan pola auth dan middleware yang sudah ada,
- mudah menambahkan OpenAPI, queue, dan storage,
- mudah dipasang di `docker-compose` backend yang sudah ada,
- tetap kompatibel dengan keputusan teknologi baru yaitu Laravel 12 dan PostgreSQL.

Ruang lingkup backend minimal:

- API pengajuan layanan
- API daftar antrean kerja
- API workflow dan approval
- API generate dokumen
- API dashboard monitoring
- job batch untuk habis masa mukim dan putus studi

### 12.2 Frontend

Frontend di `frontend/src/app/sim-bak` sebaiknya dibangun sebagai modul App Router MYUNILA dengan pembagian berikut:

- halaman ringkasan layanan
- halaman daftar pengajuan mahasiswa
- halaman pengajuan per layanan
- halaman detail tracking
- halaman kerja admin atau operator
- halaman monitoring

Jika nantinya area admin menjadi kompleks, komponen shared dashboard MYUNILA dapat dipakai ulang tanpa mengubah keputusan bahwa basis route modul tetap di `/sim-bak`.

### 12.3 Infrastruktur data dan queue

Untuk implementasi awal, arsitektur data dan proses backend disarankan sebagai berikut:

- `PostgreSQL` sebagai database utama transaksi `simbak`
- koneksi `pdut` sebagai database referensi akademik
- `Redis` sebagai cache, queue, dan lock manager
- file storage untuk unggahan persyaratan dan hasil PDF
- scheduler atau queue worker untuk proses batch dan notifikasi

Catatan:

- `simbak` sebaiknya menjadi koneksi default Laravel.
- `pdut` dipanggil eksplisit pada repository atau service referensi.
- proses validasi layanan sebaiknya membaca dari `pdut`, lalu menyimpan snapshot yang relevan ke `simbak`.

### 12.4 Struktur route awal yang disarankan

Contoh struktur awal frontend:

```text
/sim-bak
/sim-bak/pengajuan
/sim-bak/pengajuan/[jenis-layanan]
/sim-bak/permohonan/[nomor]
/sim-bak/admin
/sim-bak/admin/verifikasi
/sim-bak/admin/batch
/sim-bak/monitoring
```

Contoh kelompok API backend:

```text
/api/v1/service-types
/api/v1/requests
/api/v1/requests/{id}
/api/v1/requests/{id}/submit
/api/v1/requests/{id}/approve
/api/v1/requests/{id}/return
/api/v1/batches/habis-masa-mukim
/api/v1/batches/putus-studi
/api/v1/monitoring
```

## 13. Risiko utama dan mitigasi

| Risiko | Dampak | Mitigasi awal |
| --- | --- | --- |
| Aturan bisnis belum final untuk beberapa layanan | backlog berubah saat coding | finalisasi SOP dan keputusan bisnis sebelum sprint implementasi |
| Alih program dari luar Unila belum jelas | flow bisa salah desain | pisahkan sebagai scope lanjutan sampai dasar aturan dan integrasi siap |
| Role dan jalur persetujuan berbeda antar unit | workflow sulit distandardisasi | sediakan workflow yang berbasis konfigurasi, bukan hardcode |
| Ketergantungan ke sistem akademik dan keuangan | validasi otomatis gagal jika API belum siap | tetapkan kontrak integrasi dan fallback manual yang terkontrol |
| Penomoran dan tanda tangan dokumen belum diputuskan | output dokumen tidak bisa diproduksi final | tetapkan opsi sementara: draft internal lalu unggah hasil final |
| Perbedaan versi framework dengan service Laravel lama | ada potensi perbedaan paket, pipeline, dan standar bootstrap | siapkan template `bak-service` Laravel 12 yang tetap mengikuti pola deployment dan observability backend MYUNILA |
| PostgreSQL belum masuk ke runtime backend aktif | deployment tertunda jika provisioning database belum disiapkan | tetapkan sejak awal kebutuhan instance, kredensial, backup, dan env untuk PostgreSQL |
| Akses ke PDUT tidak stabil atau tidak terkontrol | validasi layanan gagal atau data referensi tidak konsisten | gunakan koneksi `pdut` khusus, batasi sebagai read-only, dan simpan snapshot validasi ke `simbak` |
| Logika bisnis terlalu bergantung pada query lintas database | backend sulit dirawat dan rawan error | pisahkan repository referensi `pdut` dan repository transaksi `simbak`, lalu gabungkan data di service layer |
| Dokumen unggahan sensitif | risiko keamanan dan kebocoran data | validasi file, pembatasan akses, audit log, dan storage policy |
| Proses batch menghasilkan banyak kandidat | beban operasional tinggi | sediakan filter, exclusion, dan persetujuan batch |

## 14. Tahapan implementasi yang disarankan

### Tahap 1 - fondasi platform

Prioritas:

- autentikasi dan otorisasi terintegrasi MYUNILA
- master jenis layanan
- workflow engine sederhana
- upload dokumen
- template PDF
- audit trail
- provisioning Docker, PostgreSQL, dan Redis

### Tahap 2 - MVP layanan mahasiswa

Prioritas:

- Surat Keterangan Herregistrasi
- Cuti Akademik
- Undur Diri
- Surat Keterangan Diterima sebagai Mahasiswa Baru / LoA

Alasan:

- layanan ini paling jelas alurnya,
- memberi manfaat cepat ke mahasiswa,
- membangun fondasi proses end-to-end yang bisa dipakai ulang.

### Tahap 3 - layanan menengah dan lintas unit

Prioritas:

- Surat Keterangan Pengganti KTM
- Surat Keterangan Pengganti Sertifikat PKKMB
- Alih Program / Pindah Studi

Alasan:

- Alih Program paling kompleks karena melibatkan fakultas asal dan tujuan.
- Layanan pengganti dokumen tetap penting, tetapi tidak sekompleks layanan batch.

### Tahap 4 - layanan batch dan monitoring

Prioritas:

- Penetapan Habis Masa Mukim
- Penetapan Putus Studi Akademik
- Dashboard monitoring mahasiswa aktif dan lulusan

Alasan:

- memerlukan integrasi data dan verifikasi batch,
- membutuhkan kesiapan operator BAK dan fakultas,
- cocok dibangun setelah fondasi workflow dan dokumen stabil.

## 15. Keputusan yang perlu ditetapkan sebelum coding

1. Nama service final yang akan dipublikasikan di gateway.
2. Skema akses LoA: memakai akun mahasiswa baru, akun PMB, atau akun MYUNILA terbatas.
3. Mekanisme penomoran dokumen: internal modul atau integrasi persuratan.
4. Mekanisme tanda tangan: manual upload hasil final atau tanda tangan elektronik.
5. Aturan final layanan alih program dari luar Unila.
6. Data sumber resmi untuk status mahasiswa aktif, cuti, lulusan, IPK, SKS, dan UKT.
7. Apakah exclusion batch pada habis masa mukim dan putus studi disimpan permanen sebagai keputusan resmi atau hanya catatan verifikasi batch.
8. Template dasar `bak-service` akan mengikuti skeleton Laravel 12 seperti apa agar selaras dengan container backend lain.
9. Skema database PostgreSQL, backup, dan migrasi lintas environment.
10. Penggunaan Redis: cache saja atau sekaligus queue, lock, dan scheduler support.
11. Nama koneksi final untuk dual database di Laravel, misalnya `pdut` dan `simbak`.
12. Ruang lingkup data PDUT mana saja yang diizinkan dibaca oleh `bak-service`.
13. Mekanisme snapshot data referensi dari `pdut` ke `simbak` pada saat pengajuan, verifikasi, dan penetapan batch.

## 16. Kesimpulan revisi

SIMBA sebaiknya tidak dikembangkan sebagai aplikasi terpisah, tetapi sebagai modul layanan BAK dalam MYUNILA dengan backend `bak-service` dan frontend `sim-bak`. Revisi analisa ini menempatkan kebutuhan layanan, aktor, data, workflow, integrasi, dan tahapan implementasi dalam kerangka yang lebih sesuai dengan arsitektur project saat ini serta lebih siap diterjemahkan menjadi backlog teknis.
