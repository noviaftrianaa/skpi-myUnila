# Alur Layanan SIMBA - Versi Revisi

Tanggal revisi: 15 Maret 2026

Dokumen ini merapikan penulisan alur layanan dari dokumen sumber agar:

- istilahnya konsisten,
- peran setiap aktor lebih jelas,
- alur mudah diterjemahkan ke workflow digital,
- kebutuhan validasi sistem dapat dipetakan sejak awal.

## 1. Prinsip umum alur layanan

### 1.1 Status standar yang disarankan

Semua layanan sebaiknya memakai status umum berikut:

| Status | Makna |
| --- | --- |
| Draft | Pengajuan masih disimpan oleh pemohon dan belum dikirim |
| Diajukan | Pengajuan sudah masuk ke antrean verifikasi |
| Perlu Perbaikan | Pengajuan dikembalikan untuk dilengkapi atau diperbaiki |
| Diverifikasi | Tahap verifikasi administrasi selesai |
| Menunggu Persetujuan | Pengajuan menunggu keputusan pejabat terkait |
| Disetujui | Pengajuan disetujui untuk diterbitkan |
| Ditolak | Pengajuan ditolak |
| Terbit | Dokumen hasil sudah tersedia untuk diunduh |

### 1.2 Pola umum proses digital

1. Pemohon mengisi formulir dan mengunggah dokumen.
2. Sistem melakukan validasi otomatis terhadap data akademik atau keuangan yang tersedia.
3. Petugas memverifikasi kelengkapan dan kebenaran dokumen.
4. Jika ada kekurangan, pengajuan dikembalikan ke pemohon.
5. Jika lengkap, pengajuan diproses ke tahapan persetujuan.
6. Dokumen hasil diterbitkan dan diarsipkan.
7. Pemohon menerima notifikasi dan dapat mengunduh dokumen hasil.

## 2. Alur layanan per jenis

### 2.1 Surat Keterangan Diterima sebagai Mahasiswa Baru / LoA

#### Aktor

- Mahasiswa baru atau calon mahasiswa baru yang sudah memiliki akses sesuai kebijakan
- Admin BAK

#### Data dan dokumen yang diinput

- alasan atau keperluan permohonan
- KTM sementara
- slip UKT
- surat permohonan yang ditandatangani mahasiswa dan wali

#### Alur layanan

1. Pemohon mengisi formulir permohonan dan mengunggah dokumen persyaratan.
2. Sistem menyimpan pengajuan dan menandainya sebagai `Diajukan`.
3. Admin BAK memeriksa kelengkapan dan kesesuaian dokumen.
4. Jika dokumen tidak lengkap, pengajuan dikembalikan dengan status `Perlu Perbaikan`.
5. Jika dokumen lengkap, Admin BAK membuat draf surat keterangan.
6. Surat keterangan yang telah ditandatangani diunggah kembali ke sistem.
7. Sistem mengubah status menjadi `Terbit` dan mengirim notifikasi ke pemohon.
8. Pemohon mengunduh surat keterangan dari portal.

#### Output

- Surat Keterangan Diterima sebagai Mahasiswa Baru / LoA dalam format PDF

#### Catatan

- Skema akun untuk pemohon layanan ini harus dipastikan lebih dulu karena tidak semua calon mahasiswa berada pada konteks akun yang sama dengan mahasiswa aktif.

### 2.2 Alih Program / Pindah Studi Mahasiswa

#### Aktor

- Mahasiswa
- Admin Fakultas Asal
- Admin Fakultas Tujuan
- Admin BAK
- Approver universitas sesuai tata naskah yang berlaku

#### Syarat akademik utama

| Jalur | Ketentuan |
| --- | --- |
| Sarjana ke Sarjana | IPK >= 2,75 dalam Unila, IPK >= 3,00 luar Unila, SKS minimal 40, maksimal semester 5 |
| Sarjana ke Diploma III | IPK >= 2,00 dalam Unila, IPK >= 2,00 luar Unila, SKS minimal 30, maksimal semester 5 |
| Diploma III ke Diploma III | IPK >= 2,50 dalam Unila, IPK >= 3,00 luar Unila, SKS minimal 36, maksimal semester 5 |
| Magister ke Magister / Doktor ke Doktor | IPK >= 3,00 dalam Unila, IPK >= 3,25 luar Unila, SKS minimal 12, maksimal semester 3 |

#### Dokumen persyaratan

- surat permohonan mahasiswa dan wali
- surat keterangan tidak sedang melanggar tata tertib dari pimpinan fakultas atau universitas bagi mahasiswa aktif
- surat keterangan tidak diputus studi
- transkrip akademik
- surat keterangan berkelakuan baik dari pimpinan fakultas
- bukti pembayaran UKT terakhir

#### Alur layanan

1. Mahasiswa memilih layanan alih program atau pindah studi.
2. Sistem mengambil data semester aktif, IPK, dan data akademik dasar dari sistem akademik.
3. Mahasiswa memilih program studi tujuan, mengisi alasan permohonan, dan mengunggah dokumen persyaratan.
4. Admin Fakultas Asal memverifikasi dokumen pengajuan.
5. Jika lengkap, Admin Fakultas Asal mengunggah surat pengantar dari Dekan atau Wakil Dekan I kepada Rektor atau Wakil Rektor I.
6. Admin Fakultas Tujuan menerima disposisi untuk melakukan proses penerimaan atau penolakan.
7. Admin Fakultas Tujuan mengunggah hasil keputusan diterima atau ditolak, termasuk hasil wawancara atau penilaian jika ada.
8. Admin Fakultas Tujuan mengunggah daftar mata kuliah dan jumlah SKS yang diakui atau dikonversi bila pengajuan diterima.
9. Admin BAK melakukan verifikasi akhir terhadap seluruh dokumen dan hasil proses lintas fakultas.
10. Admin BAK membuat draf Surat Keputusan Rektor tentang Alih Program / Pindah Studi.
11. Surat keputusan yang telah ditandatangani diunggah ke sistem.
12. Sistem mengubah status menjadi `Terbit` dan mahasiswa dapat mengunduh dokumen hasil.

#### Output

- Surat Keputusan Rektor tentang Alih Program / Pindah Studi

#### Catatan

- Kasus perpindahan dari luar Unila sebaiknya dipisahkan dari alur ini jika aturan bisnis, konversi akademik, dan otoritas penerimaannya belum ditetapkan secara final.

### 2.3 Surat Keterangan Pengganti Kartu Tanda Mahasiswa

#### Aktor

- Mahasiswa
- Admin BAK

#### Dokumen persyaratan

- alasan permohonan
- KTM sementara
- surat keterangan mahasiswa aktif atau lulus PKKMB dari fakultas
- surat keterangan kehilangan KTM dari kepolisian

#### Alur layanan

1. Mahasiswa mengisi alasan permohonan dan mengunggah seluruh dokumen persyaratan.
2. Sistem menyimpan pengajuan dan menandainya sebagai `Diajukan`.
3. Admin BAK memverifikasi kelengkapan dan kebenaran dokumen.
4. Jika dokumen tidak lengkap, pengajuan dikembalikan untuk diperbaiki.
5. Jika dokumen lengkap, Admin BAK membuat draf surat keterangan pengganti KTM.
6. Surat yang telah ditandatangani diunggah ke sistem.
7. Sistem mengubah status menjadi `Terbit`.
8. Mahasiswa mengunduh surat keterangan dari portal.

#### Output

- Surat Keterangan Pengganti KTM

### 2.4 Surat Keterangan Pengganti Sertifikat PKKMB

#### Aktor

- Mahasiswa
- Admin BAK

#### Dokumen persyaratan

- alasan permohonan
- scan KTM asli
- surat keterangan lulus PKKMB dari fakultas
- surat keterangan kehilangan dari kepolisian

#### Alur layanan

1. Mahasiswa mengisi alasan permohonan dan mengunggah dokumen persyaratan.
2. Sistem menyimpan pengajuan sebagai `Diajukan`.
3. Admin BAK memverifikasi kelengkapan dokumen dan status PKKMB pemohon.
4. Jika ada kekurangan, pengajuan dikembalikan untuk diperbaiki.
5. Jika lengkap, Admin BAK membuat draf surat keterangan pengganti sertifikat PKKMB.
6. Surat yang telah ditandatangani diunggah ke sistem.
7. Sistem mengubah status menjadi `Terbit`.
8. Mahasiswa mengunduh surat keterangan dari portal.

#### Output

- Surat Keterangan Pengganti Sertifikat PKKMB

### 2.5 Surat Keterangan Herregistrasi Mahasiswa

#### Aktor

- Mahasiswa
- Admin BAK

#### Data yang diperlukan

- semester berjalan
- status herregistrasi mahasiswa pada semester berjalan

#### Alur layanan

1. Mahasiswa mengajukan permohonan surat keterangan herregistrasi.
2. Sistem mengambil data semester berjalan dan status registrasi mahasiswa dari sistem akademik.
3. Jika mahasiswa berstatus sudah herregistrasi pada semester berjalan, pengajuan dapat diproses.
4. Jika status semester berjalan adalah cuti atau tidak herregistrasi, sistem menolak pengajuan atau mengarahkan mahasiswa ke layanan yang sesuai.
5. Admin BAK memverifikasi hasil validasi sistem dan, jika diperlukan, dokumen pendukung tambahan.
6. Admin BAK membuat draf surat keterangan herregistrasi.
7. Surat yang telah ditandatangani diunggah ke sistem.
8. Sistem mengubah status menjadi `Terbit`.
9. Mahasiswa mengunduh surat keterangan herregistrasi.

#### Output

- Surat Keterangan Herregistrasi

#### Catatan

- Dokumen sumber tidak menjelaskan secara rinci persyaratan unggahan untuk layanan ini. Daftar dokumen final perlu dipastikan saat penyusunan spesifikasi rinci.

### 2.6 Surat Keterangan Cuti Akademik Mahasiswa

#### Aktor

- Mahasiswa
- Admin Fakultas
- Admin BAK
- Approver universitas sesuai tata naskah yang berlaku

#### Data dan dokumen yang diinput

- periode semester mulai cuti
- jumlah semester cuti, satu atau dua semester
- alasan cuti akademik
- surat permohonan mahasiswa dan wali
- KTM asli
- slip UKT atau bukti bayar UKT semester terakhir
- surat pengantar kepala jurusan atau program studi

#### Alur layanan

1. Mahasiswa memilih semester mulai cuti, jumlah semester cuti, dan alasan permohonan.
2. Mahasiswa mengunggah dokumen persyaratan.
3. Sistem menyimpan pengajuan sebagai `Diajukan`.
4. Admin Fakultas memverifikasi kelengkapan dokumen dan kesesuaian usulan.
5. Jika lengkap, Admin Fakultas mengunggah surat pengantar dari Dekan atau Wakil Dekan I kepada Rektor atau Wakil Rektor I.
6. Admin BAK melakukan verifikasi akhir.
7. Admin BAK membuat draf Surat Keterangan Cuti Akademik Mahasiswa.
8. Surat yang telah ditandatangani diunggah ke sistem.
9. Sistem mengubah status menjadi `Terbit`.
10. Mahasiswa mengunduh surat keterangan cuti akademik.

#### Output

- Surat Keterangan Cuti Akademik Mahasiswa

### 2.7 Undur Diri Mahasiswa

#### Aktor

- Mahasiswa
- Admin Fakultas
- Admin BAK
- Approver universitas sesuai tata naskah yang berlaku

#### Data dan dokumen yang diinput

- alasan undur diri
- surat permohonan mahasiswa dan wali
- KTM asli
- slip UKT atau bukti bayar UKT
- surat pengantar kepala jurusan atau program studi

#### Alur layanan

1. Mahasiswa mengisi alasan undur diri dan mengunggah dokumen persyaratan.
2. Sistem menyimpan pengajuan sebagai `Diajukan`.
3. Admin Fakultas memverifikasi dokumen pengajuan.
4. Jika lengkap, Admin Fakultas mengunggah surat pengantar dari Dekan atau Wakil Dekan I kepada Rektor atau Wakil Rektor I.
5. Admin BAK melakukan verifikasi akhir.
6. Admin BAK menyusun Surat Keputusan Rektor tentang Pengunduran Diri.
7. Satu SK dapat memuat lebih dari satu mahasiswa dalam satu batch keputusan.
8. SK yang telah ditandatangani diunggah ke sistem.
9. Sistem mengubah status menjadi `Terbit`.
10. Mahasiswa mengunduh SK Pengunduran Diri.

#### Output

- Surat Keputusan Rektor tentang Pengunduran Diri

### 2.8 Penetapan Habis Masa Mukim

#### Aktor

- Admin BAK
- Admin Fakultas

#### Dasar aturan yang disebutkan di dokumen sumber

Pertor Nomor 12 Tahun 2025 tentang PA Pasal 24.

#### Kriteria awal yang digunakan

| Jenjang | Batas masa studi | Tindak lanjut ketika melewati batas |
| --- | --- | --- |
| D3 | 6 tahun / 12 semester | pada semester 13 disarankan undur diri atau diputus studi |
| S1 | 8 tahun / 16 semester | pada semester 17 disarankan undur diri atau diputus studi |
| S2 | 4 tahun / 8 semester | pada semester 9 disarankan undur diri atau diputus studi |
| S3 | 6 tahun / 12 semester | pada semester 13 disarankan undur diri atau diputus studi |

#### Alur layanan

1. Admin BAK menarik data mahasiswa dari sistem akademik per fakultas sesuai kriteria habis masa mukim.
2. Sistem membentuk daftar kandidat dan menyimpan snapshot dasar penetapan.
3. Daftar kandidat dikirim ke Admin Fakultas untuk diverifikasi.
4. Admin Fakultas dapat memeriksa, mengonfirmasi, atau memberi catatan terhadap kandidat yang masuk daftar.
5. Admin Fakultas membuat dan mengunggah SK Dekan tentang Penetapan Habis Masa Mukim.
6. Admin BAK menyusun SK Rektor tentang Penetapan Habis Masa Mukim berdasarkan hasil verifikasi fakultas.
7. SK Rektor yang telah ditandatangani diunggah ke sistem.
8. Sistem mengirim notifikasi otomatis ke email atau kanal notifikasi mahasiswa.

#### Output

- SK Dekan tentang Penetapan Habis Masa Mukim
- SK Rektor tentang Penetapan Habis Masa Mukim

### 2.9 Penetapan Putus Studi Akademik

#### Aktor

- Admin BAK
- Admin Fakultas

#### Dasar aturan yang disebutkan di dokumen sumber

Pertor Nomor 12 Tahun 2025 tentang PA Pasal 48.

#### Kriteria awal yang digunakan

Mahasiswa program sarjana atau sarjana terapan pada akhir semester IV dan VIII yang:

- memiliki IPK sementara kurang dari 2,00; atau
- tidak mencapai SKS lulus minimum yang dipersyaratkan.

Dokumen sumber menyebutkan:

- akhir semester IV: IPK sementara kurang dari 2,00 atau SKS lulus kurang dari 40
- akhir semester VIII: IPK sementara kurang dari 2,00 atau SKS lulus kurang dari 80

#### Alur layanan

1. Admin BAK menarik data mahasiswa dari sistem akademik berdasarkan kriteria putus studi.
2. Sistem menampilkan jumlah semester, SKS lulus, dan IPK pada tabel kandidat putus studi.
3. Daftar kandidat dikirim ke Admin Fakultas untuk diverifikasi.
4. Admin Fakultas dapat memilih atau mengeluarkan mahasiswa tertentu dari daftar kandidat dengan alasan yang terdokumentasi.
5. Admin Fakultas membuat dan mengunggah SK Dekan tentang Penetapan Putus Studi Akademik.
6. Admin BAK menyusun SK Rektor tentang Penetapan Putus Studi Akademik berdasarkan hasil verifikasi fakultas.
7. SK Rektor yang telah ditandatangani diunggah ke sistem.
8. Sistem mengirim notifikasi otomatis kepada mahasiswa, termasuk informasi agar tidak melakukan pembayaran UKT jika sudah masuk penetapan final sesuai keputusan yang berlaku.

#### Output

- SK Dekan tentang Penetapan Putus Studi Akademik
- SK Rektor tentang Penetapan Putus Studi Akademik

### 2.10 Monitoring Data Mahasiswa Aktif dan Lulusan

#### Aktor

- Admin BAK

#### Fungsi utama

- memantau data mahasiswa aktif dan lulusan
- memfilter data berdasarkan program studi, tahun, atau semester
- mengekspor data untuk kebutuhan pelaporan
- menandai atau mengeluarkan mahasiswa studi lanjut atau jalur RPL dari perhitungan tertentu

#### Kriteria yang disebutkan di dokumen sumber

Kelulusan tepat waktu dihitung sebagai berikut:

| Jenjang | Batas lulus tepat waktu |
| --- | --- |
| D3 | <= 3 tahun |
| S1 | <= 4 tahun |
| S2 | <= 2 tahun |
| S3 | <= 3 tahun |

Catatan:

- Perhitungan memakai tanggal ujian atau kompre sesuai dokumen sumber.
- Mahasiswa yang lulus dalam masa studi tersebut dikategorikan lulus tepat waktu.

#### Alur layanan

1. Admin BAK membuka dashboard monitoring.
2. Sistem menampilkan data mahasiswa aktif, data lulusan, indikator kelulusan tepat waktu, dan filter yang tersedia.
3. Admin BAK dapat memberi exclusion terhadap mahasiswa studi lanjut atau mahasiswa jalur RPL agar analisis lebih akurat.
4. Admin BAK melakukan filter berdasarkan program studi, tahun, dan semester.
5. Admin BAK mengekspor data hasil monitoring sesuai kebutuhan laporan.

#### Output

- dashboard monitoring operasional
- data hasil filter dan ekspor

## 3. Catatan penyempurnaan dari dokumen sumber

Beberapa poin yang perlu diperhatikan saat alur ini diterjemahkan ke spesifikasi sistem:

1. Layanan herregistrasi masih memerlukan penegasan daftar dokumen pendukung.
2. Layanan alih program dari luar Unila belum sebaiknya disatukan dengan alur internal jika dasar kebijakannya belum final.
3. Setiap layanan perlu dipastikan siapa aktor operasional dan siapa penandatangan resmi dokumennya.
4. Untuk layanan batch, sistem harus menyimpan snapshot data penetapan agar dasar keputusan tetap bisa dilacak walaupun data sumber berubah di kemudian hari.
5. Untuk layanan yang menghasilkan SK batch, sistem harus mendukung satu dokumen output untuk banyak mahasiswa.

## 4. Kesimpulan

Alur layanan SIMBA yang direvisi ini sudah lebih siap dijadikan dasar perancangan workflow digital di MYUNILA karena peran, input, validasi, tahapan proses, dan output layanan sudah dipisahkan dengan lebih jelas daripada dokumen sumber.
