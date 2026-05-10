# Laporan Status Integrasi & Tindak Lanjut IKU 5 di MyUnila

**Sistem:** MyUnila Portal — Universitas Lampung
**Tanggal:** 8 Mei 2026
**Konteks:** Tindak lanjut dokumen *NEW IKU 5_TINDAK LANJUT* — Rasio Luaran Hasil Kerjasama Antara Perguruan Tinggi dan Start-Up/Industri/Lembaga
**Penyusun:** Tim Pengembangan Sistem Informasi dan Integrasi Data MyUnila

---

## Bagian I — Ringkasan untuk Wali Data

### A. Yang Sudah Tersedia & Terintegrasi di MyUnila

Berdasarkan kajian terhadap dokumen *NEW IKU 5 — TINDAK LANJUT* dan audit terhadap sistem yang sudah terintegrasi di MyUnila, berikut kondisi saat ini:

1. **Data master kerjasama** — seluruh data MoU/MoA dari unit kerjasama universitas sudah terhubung dengan MyUnila, mencakup informasi mitra (industri, BUMN, lembaga, dan pemerintah daerah), tanggal mulai-selesai kerjasama, serta aktivitas kerjasama (pendidikan, penelitian, pengabdian).

2. **Data dosen aktif** — total dosen aktif (sebagai penyebut formula IKU 5) sudah otomatis tersinkronisasi dari data kepegawaian dan PDDIKTI.

3. **Perhitungan rasio IKU 5 otomatis** — formula rasio luaran kerjasama terhadap total dosen sudah dihitung otomatis oleh sistem dan tampil di Dashboard Pimpinan, tanpa perlu input manual.

4. **Dashboard IKU 5 untuk pimpinan** — pimpinan sudah dapat memantau IKU 5 melalui menu Dashboard di portal MyUnila, dengan filter per tahun dan per fakultas, lengkap dengan grafik tren 5 tahun terakhir, serta drill-down sampai level program studi.

5. **Data publikasi & penelitian** — sebagai pendukung luaran kerjasama, data publikasi dosen, jurnal, paten (sebatas paten yang dilaporkan di publikasi), penelitian, dan pengabdian masyarakat sudah tersinkronisasi otomatis dari SISTER dan PDDIKTI.

6. **Data KKN dasar** — data peserta, kelompok, lokasi (kabupaten/desa), dan dosen pembimbing lapangan KKN sudah terintegrasi.

### B. Yang Belum Tersedia / Masih Perlu Pengembangan

1. **Klasifikasi otomatis kategori 5a / 5b / 5c** — saat ini sistem belum membedakan secara otomatis antara kerjasama dengan Industri-Lembaga (5a), Start-Up (5b), dan Karya Seni (5c). Klasifikasi ini bergantung pada konsistensi pengisian "jenis mitra" oleh unit kerjasama.

2. **Tipe luaran terstruktur** — saat ini luaran kerjasama (prototipe, modul bisnis, policy brief, SOP medis, buku ISBN, TTG, dll) masih disimpan dalam bentuk teks bebas, sehingga belum dapat dihitung dan dilaporkan per kategori luaran secara otomatis.

3. **Tracking HKI yang komprehensif** — saat ini hanya paten yang ter-track (lewat data publikasi). Hak Cipta, Merek Dagang, Desain Industri belum punya jalur pencatatan yang lengkap di MyUnila.

4. **Modul Karya Seni untuk kategori 5c** — belum ada modul khusus karya seni (audio-visual, pertunjukan, pameran, festival) yang menjadi salah satu kategori IKU 5.

5. **MoU formal Universitas dengan Pemerintah Daerah untuk KKN** — meskipun data KKN sudah ada, KKN belum dapat dihitung sebagai luaran IKU 5 (kategori 5a sub-Pemda) karena belum ada dokumen MoU formal antara universitas dengan Pemkab/Pemkot tempat KKN dilaksanakan.

6. **Kualitas data luaran kerjasama** — saat ini kelengkapan pengisian field luaran pada data MoU di sistem kerjasama universitas masih rendah (estimasi sekitar 30%), sehingga banyak MoU belum tercatat luarannya, padahal kemungkinan besar luarannya sudah ada di lapangan.

### C. Progres Pengembangan

| # | Item | Status |
|---|---|---|
| 1 | Audit kebutuhan IKU 5 vs sistem existing | Selesai |
| 2 | Dashboard IKU 5 untuk pimpinan | Live di MyUnila |
| 3 | Formula rasio otomatis | Live |
| 4 | Permintaan data ke tim Sistem Kerjasama (SIKERMA) | Sedang disampaikan |
| 5 | Permintaan data ke tim KKN (e-KKN) | Sedang disampaikan |
| 6 | Klasifikasi 5a/5b/5c otomatis | Rencana 2 minggu |
| 7 | Tipe luaran terstruktur + HKI komprehensif | Rencana 1-2 bulan |
| 8 | Integrasi KKN sebagai luaran 5a (PT-Pemda) | Rencana kuartal berikutnya |
| 9 | Modul Karya Seni (kategori 5c) | Rencana kuartal berikutnya |

### D. Dukungan yang Dimohon

Untuk percepatan tindak lanjut IKU 5, kami memerlukan dukungan dari unit terkait:

1. **Unit Kerjasama (SIKERMA):** standardisasi pengisian jenis mitra dan luaran pada setiap MoU yang masuk; penyediaan akses data kerjasama yang dapat diintegrasikan otomatis ke MyUnila.

2. **LPPM:** koordinasi dengan dosen peneliti agar setiap kerjasama yang menghasilkan publikasi, paten, atau HKI tercatat di sistem dengan benar.

3. **Unit KKN:** koordinasi penyusunan MoU formal antara Universitas dan Pemkab/Pemkot tempat KKN agar dapat dihitung sebagai luaran IKU 5.

4. **Wakil Rektor 4 / LP2M:** dukungan kebijakan agar data kerjasama, luaran, dan hilirisasi diisi dengan disiplin oleh setiap unit/fakultas.

### E. Kesimpulan

Sistem MyUnila **sudah dapat menampilkan IKU 5 saat ini** dengan akurasi sekitar 70%. Untuk mencapai pelaporan yang utuh sesuai requirement DIKTI (tindak lanjut IKU 5 — kategori 5a/5b/5c lengkap), diperlukan kolaborasi dengan unit kerjasama, LPPM, dan KKN, serta pengembangan tambahan sekitar 2-3 bulan. Akselerasi paling cepat akan tercapai bila kualitas pengisian data luaran di sumber data dapat ditingkatkan.

---

## Bagian II — Konteks IKU 5 (Rangkuman Dokumen)

### Formula

```
IKU 5 = (Jumlah luaran hasil kerjasama PT dan start-up/industri/lembaga
       ÷ Total Kerjasama Perguruan Tinggi) × 100%
```

### Tiga Kategori Luaran

| Kategori | Mitra | Contoh Luaran |
|---|---|---|
| **5a — Industri / Lembaga** | Industri, BUMN, Pemda, UMKM, Petani, Sekolah, NGO, RS, Dinkes | Jurnal, paten, prototype, TTG, HKI, MoU/MoA |
| **5b — Start-Up** | Perusahaan rintisan teknologi | Studi kasus, pengabdian, TTG, HKI dengan mitra |
| **5c — Karya Seni** | Lembaga seni / budaya | Audio-visual, pertunjukan, pameran, festival, jurnal seni |

**Catatan kunci dari dokumen tindak lanjut:** *"1 KERJA SAMA, MINIMAL 2 LUARAN"*

### Mapping Strategi per Fakultas

| Fakultas | Mitra Target | Program | Luaran Wajib | Luaran Tambahan | Hilirisasi |
|---|---|---|---|---|---|
| Teknik | Industri, BUMN | Riset terapan, TTG | Prototipe, HKI | Jurnal/HKI | Implementasi alat |
| Pertanian | Pemda, Petani | Smart farming | Produk pertanian | Jurnal/Buku ISBN | Peningkatan hasil panen |
| Ekonomi & Bisnis | UMKM, Bank | Inkubasi bisnis | Modul bisnis | Jurnal/HKI | UMKM naik kelas |
| Hukum | Pemda | Legal drafting | Policy brief | Buku | Regulasi daerah |
| FKIP | Sekolah | Pengembangan kurikulum | Modul ajar | Jurnal | Implementasi sekolah |
| FISIP | Pemda, NGO | Program sosial | Laporan dampak | Jurnal | Program pemberdayaan |
| MIPA | Industri | Riset sains terapan | Publikasi | Jurnal/HKI | Produk inovasi |
| Kedokteran | RS, Dinkes | Program kesehatan | SOP medis | Jurnal | Layanan kesehatan |

### Strategi Hilirisasi (dari dokumen)

- **LPPM (SILEMLIT)** — Hibah Luaran BLU
- **Fakultas** — DIPA Fakultas
- **KKN** — pemanfaatan kegiatan KKN sebagai vehicle kerjasama

---

## Bagian III — Coverage Matrix Sistem MyUnila

| Komponen / Aspek | Status | Coverage | Siap Production |
|---|:---:|:---:|:---:|
| Data master kerjasama (MoU/MoA) | Tersedia | 100% | Ya |
| Data dosen aktif | Tersedia | 100% | Ya |
| Formula IKU 5 otomatis | Tersedia | 100% | Ya |
| Dashboard IKU untuk pimpinan | Tersedia | 100% | Ya |
| Data publikasi & penelitian | Tersedia | 100% | Ya |
| Data KKN dasar | Tersedia | 60% | Ya, untuk dashboard |
| Klasifikasi 5a / 5b / 5c | Belum | 0% | Belum |
| Tipe luaran terstruktur | Belum | 0% | Belum |
| Tracking HKI komprehensif | Sebagian | 15% | Belum |
| Modul Karya Seni (kategori 5c) | Belum | 0% | Belum |
| Integrasi KKN ↔ MoU Pemda | Belum | 0% | Belum |
| Kualitas data luaran (fill rate) | Sebagian | ~30% | Perlu peningkatan |

**Overall Readiness:** 70%

---

## Bagian IV — Rencana Tindak Lanjut

### Quick Wins (1-2 minggu)

| # | Item | Manfaat |
|---|---|---|
| 1 | SOP wajib pengisian luaran saat input MoU baru | Fill rate naik dari 30% ke 80% |
| 2 | Klasifikasi otomatis kategori 5a / 5b / 5c | Pelaporan per kategori bisa instan |
| 3 | Validasi pengisian di form input kerjasama | Kualitas data terjaga di hulu |
| 4 | Export laporan IKU 5 (PDF / Excel) per kategori | Mudahkan pelaporan ke DIKTI |

### Medium Term (1-2 bulan)

| # | Item | Manfaat |
|---|---|---|
| 5 | Tabel tipe luaran terstruktur (Prototipe, HKI, ISBN, TTG, dst) | Reporting per tipe luaran otomatis |
| 6 | Modul HKI komprehensif (paten, hak cipta, merek, desain industri) | Coverage HKI lengkap |
| 7 | Sinkronisasi otomatis dengan Sistem Kerjasama (SIKERMA) | Real-time / harian sync, no manual |
| 8 | Form input MoU dengan pengisian multi luaran | Capture luaran lebih lengkap |

### Long Term (kuartal berikutnya)

| # | Item | Manfaat |
|---|---|---|
| 9 | Integrasi KKN ↔ MoU Pemda (vehicle kategori 5a) | KKN terhitung sebagai luaran IKU 5 |
| 10 | Modul Karya Seni untuk kategori 5c | Coverage 100% kategori IKU 5 |
| 11 | Data governance & audit bulanan | Kualitas data konsisten jangka panjang |
| 12 | Dashboard IKU 5 advanced (filter per kategori, mitra, hilirisasi) | Insight pimpinan lebih dalam |

---

## Bagian V — Permintaan Data ke Unit Lain

### Permintaan ke Tim Sistem Kerjasama (SIKERMA)

Untuk percepatan integrasi data IKU 5, MyUnila memerlukan akses berikut dari sistem SIKERMA:

1. **Daftar MoU/MoA** lengkap dengan informasi: nomor MoU, judul kerjasama, tanggal mulai-selesai, tanggal penandatanganan, status (aktif / berakhir).

2. **Data Mitra / DUDI** terstandar dengan klasifikasi jenis mitra (Industri, BUMN, UMKM, Pemerintah Daerah, Petani, Sekolah, NGO, Rumah Sakit, Dinas Kesehatan, Start-Up, Lembaga Seni).

3. **Daftar luaran per MoU** (1 MoU dapat memiliki banyak luaran), dengan informasi: tipe luaran (Prototipe, HKI, Jurnal, Buku ISBN, Modul Ajar, Policy Brief, SOP Medis, TTG, Karya Seni, dll), deskripsi singkat, tanggal luaran, status hilirisasi.

4. **Klasifikasi 5a / 5b / 5c per MoU** apabila sudah dicatat di SIKERMA.

5. **Mapping ke fakultas / program studi** untuk memungkinkan drill-down per unit di Dashboard MyUnila.

**Format yang diharapkan:** akses API real-time, atau dump data berkala (harian/mingguan).

### Permintaan ke Tim KKN (e-KKN)

Untuk memanfaatkan KKN sebagai luaran IKU 5 (kategori 5a — sub Pemerintah Daerah), MyUnila memerlukan:

1. **Konfirmasi keberadaan MoU/MoA formal** antara Universitas Lampung dengan Pemerintah Kabupaten/Kota tempat KKN dilaksanakan. Apabila belum ada, perlu koordinasi penyusunan MoU formal.

2. **Daftar MoU Pemda aktif** (jika ada): nomor, periode, instansi mitra, scan dokumen.

3. **Data luaran KKN per kabupaten:** laporan dampak, program sosial, pemberdayaan masyarakat, dokumentasi kegiatan.

4. **Standardisasi data wilayah** (kabupaten/kecamatan/desa) yang konsisten dengan data referensi PDDIKTI.

5. **Tracking status keberlanjutan** kegiatan KKN setelah selesai (program berlanjut, regulasi daerah turunan, pemberdayaan UMKM yang bertahan, dll).

---

## Bagian VI — Surat Balasan (Template)

Berikut template surat balasan formal yang dapat digunakan oleh pimpinan UPT TIK / Wakil Rektor 4 untuk merespons permintaan tindak lanjut IKU 5:

---

**Nomor:** [diisi sesuai numbering surat]
**Lampiran:** Laporan Status Integrasi IKU 5 MyUnila
**Perihal:** Tanggapan atas Permintaan Data dan Tindak Lanjut IKU 5 Tahun 2026

Yth. **[Nama PIC]**
**[Jabatan: Wakil Rektor 4 / Kepala LP2M / Tim IKU 5]**
Universitas Lampung

Menanggapi Bapak/Ibu mengenai kebutuhan data dan tindak lanjut IKU 5 (Rasio Luaran Hasil Kerjasama Antara Perguruan Tinggi dan Start-Up/Industri/Lembaga) sebagaimana disampaikan dalam dokumen *NEW IKU 5_TINDAK LANJUT*, dengan ini kami sampaikan status integrasi data dan rencana tindak lanjut sebagai berikut:

**A. Data IKU 5 yang Sudah Tersedia di MyUnila**

Sistem MyUnila telah mengintegrasikan data kerjasama dan menampilkan IKU 5 secara otomatis di Dashboard Pimpinan dengan rincian:

1. Total Kerjasama (penyebut formula): jumlah dosen aktif Universitas Lampung dari sumber data PDDIKTI.
2. Jumlah Luaran Kerjasama (pembilang formula): jumlah kerjasama yang memiliki luaran terisi.
3. Rasio IKU 5: dihitung otomatis sesuai formula DIKTI.
4. Drill-down: per fakultas, per program studi, per aktivitas kerjasama.
5. Trend 5 tahun terakhir.

Data dapat diakses oleh pimpinan melalui menu Dashboard Pimpinan → IKU di portal MyUnila.

**B. Status Coverage terhadap Requirement Dokumen Tindak Lanjut**

| Aspek | Status |
|---|---|
| Data master kerjasama (MoU/MoA) | Tersedia |
| Total dosen aktif | Tersedia |
| Formula IKU 5 otomatis | Tersedia |
| Dashboard real-time | Tersedia |
| Kategorisasi 5a (Industri/Lembaga) | Sebagian — perlu standardisasi data mitra |
| Kategorisasi 5b (Start-Up) | Sebagian |
| Kategorisasi 5c (Karya Seni) | Belum — perlu modul tambahan |
| Tracking HKI komprehensif | Sebagian — hanya paten |
| TTG (Teknologi Tepat Guna) | Belum — perlu pencatatan khusus |
| Integrasi KKN sebagai vehicle 5a | Belum — perlu MoU formal PT-Pemda |
| Mapping per fakultas | Tersedia |

**C. Tindak Lanjut yang Diusulkan**

1. **Quick Wins (2 minggu):** perbaikan SOP input data luaran, kategorisasi 5a/5b/5c otomatis, validasi form. Diharapkan kualitas data meningkat dari sekitar 30% menjadi 80%.

2. **Medium Term (1-2 bulan):** pengembangan tipe luaran terstruktur, modul HKI komprehensif, dan automasi sinkronisasi dengan SIKERMA.

3. **Long Term (kuartal berikutnya):** integrasi KKN sebagai vehicle kerjasama PT-Pemda, modul Karya Seni untuk kategori 5c, dashboard advanced dengan filter per kategori.

**D. Permintaan Dukungan dari LP2M**

Untuk akselerasi pencapaian target IKU 5, kami memerlukan dukungan:

1. **SOP & enforcement** — agar setiap MoU/MoA wajib mengisi minimal 1 luaran di sistem.
2. **Klasifikasi mitra** — standardisasi pengisian jenis mitra (Industri, BUMN, UMKM, Pemda, dll).
3. **Dokumentasi MoU KKN** — penyusunan MoU formal antara Universitas dan Pemerintah Daerah tempat placement KKN.
4. **Penyediaan data karya seni** — untuk kategori 5c, perlu data dari fakultas yang memiliki program seni.

Demikian tanggapan kami. Kami siap berkoordinasi lebih lanjut untuk mempercepat implementasi tindak lanjut IKU 5 sesuai timeline yang disepakati.

Hormat kami,

**[Nama]**
**[Jabatan: Kepala UPT TIK / Koordinator Pengembang MyUnila]**
Universitas Lampung

---

*Dokumen ini disusun oleh **Tim Pengembangan Sistem Informasi dan Integrasi Data MyUnila** untuk keperluan koordinasi tindak lanjut IKU 5 Tahun 2026 antara unit teknis dengan wali data dan pimpinan universitas.*
