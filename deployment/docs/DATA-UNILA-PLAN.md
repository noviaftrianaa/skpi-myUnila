# Data Unila — Raw Data Portal Plan

**Created:** 2026-03-17  
**Status:** Planning  
**App:** Data Unila (a_coming_soon=1 di portal)

---

## 🎯 Goal

Portal **"Data Unila"** — satu pintu akses raw data untuk seluruh civitas akademika Universitas Lampung. Data bisa dilihat, difilter, dan di-download untuk kebutuhan:

- **IKU (Indikator Kinerja Utama)**
- **Akreditasi** (BAN-PT, LAMSAMA, dll)
- **Pelaporan PDDIKTI**
- **Perencanaan & evaluasi internal**
- **Penelitian & analisis**

Data yang tampil **otomatis di-filter berdasarkan organisasi user yang login** (Prodi, Fakultas, atau Universitas).

---

## 📊 Data Inventory (dari DB pdut)

### Jumlah Data Aktual

| Kategori | Tabel | Total Records |
|---|---|---|
| **Mahasiswa** | pdrd.peserta_didik | 187,218 |
| **Registrasi Mhs** | pdrd.reg_pd | 192,541 |
| **KRS/Kuliah** | pdrd.kuliah_mhs | 1,112,631 |
| **Nilai Semester** | pdrd.nilai_smt_mhs | 4,246,992 |
| **Transkrip** | pdrd.nilai_transkrip | 169,513 |
| **Aktivitas Mhs** | pdrd.akt_mhs | 145,591 |
| **Bimbingan Mhs** | pdrd.bimbing_mhs | 144,649 |
| **Uji Mahasiswa** | pdrd.uji_mhs | 10,680 |
| **SDM/Dosen** | pdrd.sdm | 2,769 |
| **Registrasi Dosen** | pdrd.reg_ptk | 5,055 |
| **Jabatan Fungsional** | pdrd.rwy_fungsional | 3,967 |
| **Kepangkatan** | pdrd.rwy_kepangkatan | 5,674 |
| **Riwayat Pendidikan** | pdrd.rwy_pend_formal | 5,386 |
| **Sertifikasi** | pdrd.rwy_sertifikasi | 3,691 |
| **Tugas Tambahan** | pdrd.tugas_tambahan | 1,525 |
| **Diklat** | pdrd.diklat | 1,471 |
| **Penelitian & Pengabdian** | pdrd.litabmas | 14,124 |
| **Publikasi** | pdrd.publikasi | 38,038 |
| **Prestasi** | pdrd.prestasi | 751 |
| **Kelas Kuliah** | pdrd.kelas_kuliah | 183,657 |
| **Mata Kuliah** | pdrd.matkul | 33,993 |
| **Kurikulum** | pdrd.kurikulum_sp | 440 |
| **Program Studi** | pdrd.sms | 481 |
| **Akreditasi Prodi** | pdrd.akreditasi_prodi | 300 |
| **Akreditasi PT** | pdrd.akred_sp | 6 |
| **Kerjasama (MoU)** | kerjasama.mou | 1,010 |
| **Kerjasama Prodi** | kerjasama.sms_kerjasama | 1,232 |
| **SPP Mahasiswa** | keuangan.spp_mhs | 411,555 |
| **Daftar UKT** | keuangan.daftar_ukt | 8,378 |
| **Pegawai (SIKEP)** | sikep.pegawai | 4,395 |
| **Tracer Study** | tracer.hasil_tracer_study | 21,859 |
| **Unit Organisasi** | man_akses.unit_organisasi | 239 |

**Total: ~7 juta+ records** di seluruh tabel

---

## 📋 Modul & Menu yang Diusulkan

### 1. 📚 Data Mahasiswa
**Target user:** Kaprodi, Dekan, BAK, Rektorat

| Menu | Sumber | Deskripsi |
|---|---|---|
| Daftar Mahasiswa | pdrd.peserta_didik + reg_pd | Biodata + status aktif/lulus/cuti/DO |
| Registrasi per Semester | pdrd.reg_pd | Mahasiswa aktif per semester |
| Sebaran Status | pdrd.reg_pd | Chart aktif/lulus/DO per prodi/fakultas |
| Lulusan | pdrd.reg_pd (filter lulus) | Lulusan per tahun + lama studi + IPK |
| IPK & Prestasi Akademik | pdrd.nilai_smt_mhs | IPK rata-rata per prodi/angkatan |
| Aktivitas Mahasiswa | pdrd.akt_mhs | MBKM, magang, pertukaran pelajar |
| Bimbingan | pdrd.bimbing_mhs | Bimbingan tugas akhir/skripsi/tesis |
| KRS / Riwayat Kuliah | pdrd.kuliah_mhs | Mata kuliah yang diambil |
| Transkrip | pdrd.nilai_transkrip | Transkrip nilai lengkap |
| Uji Mahasiswa | pdrd.uji_mhs | Ujian sidang/komprehensif |

### 2. 👨‍🏫 Data Dosen & Tenaga Kependidikan
**Target user:** Kaprodi, Dekan, BKH, LP3M, Rektorat

| Menu | Sumber | Deskripsi |
|---|---|---|
| Daftar Dosen | pdrd.sdm + reg_ptk | Biodata + status aktif/tugas belajar |
| Jabatan Fungsional | pdrd.rwy_fungsional | Lektor, Guru Besar, dll |
| Jabatan Struktural | pdrd.rwy_struktural | Dekan, Kaprodi, Wakil Rektor |
| Kepangkatan | pdrd.rwy_kepangkatan | Golongan PNS/PPPK |
| Riwayat Pendidikan | pdrd.rwy_pend_formal | S1/S2/S3 dosen |
| Sertifikasi | pdrd.rwy_sertifikasi | Serdos, kompetensi |
| Diklat & Pelatihan | pdrd.diklat | Pelatihan yang diikuti |
| Tugas Tambahan | pdrd.tugas_tambahan | Tugas di luar mengajar |
| Riwayat Pekerjaan | pdrd.rwy_pekerjaan | Riwayat karir |
| Pegawai (SIKEP) | sikep.pegawai | Data dari SIKEP |

### 3. 🔬 Data Tridarma (Penelitian, Pengabdian, Publikasi)
**Target user:** LP3M, LPPM, Prodi, Dosen

| Menu | Sumber | Deskripsi |
|---|---|---|
| Penelitian | pdrd.litabmas (filter jenis) | Daftar penelitian + dana + luaran |
| Pengabdian | pdrd.litabmas (filter jenis) | Daftar pengabdian masyarakat |
| Publikasi | pdrd.publikasi | Jurnal, prosiding, buku |
| Prestasi | pdrd.prestasi | Penghargaan mahasiswa & dosen |
| Luaran Non-CA | pdrd.non_ca | HKI, paten, produk |

### 4. 📖 Data Akademik
**Target user:** BAA, Kaprodi, Dekan

| Menu | Sumber | Deskripsi |
|---|---|---|
| Program Studi | pdrd.sms | Daftar prodi + akreditasi |
| Akreditasi Prodi | pdrd.akreditasi_prodi | Histori akreditasi + peringkat |
| Akreditasi PT | pdrd.akred_sp | Akreditasi institusi |
| Kurikulum | pdrd.kurikulum_sp | Kurikulum aktif per prodi |
| Mata Kuliah | pdrd.matkul | Daftar mata kuliah + SKS |
| Kelas Kuliah | pdrd.kelas_kuliah | Kelas per semester |
| Dosen Pengajar | pdrd.akt_ajar_dosen | Aktivitas mengajar dosen |

### 5. 🤝 Data Kerjasama
**Target user:** BAKHP, Prodi, Fakultas

| Menu | Sumber | Deskripsi |
|---|---|---|
| MoU / Perjanjian | kerjasama.mou | Daftar kerjasama + status |
| Kerjasama per Prodi | kerjasama.sms_kerjasama | Kerjasama yang melibatkan prodi |

### 6. 💰 Data Keuangan
**Target user:** BAU, Rektorat

| Menu | Sumber | Deskripsi |
|---|---|---|
| UKT Mahasiswa | keuangan.daftar_ukt | Kelompok UKT per prodi/tahun |
| SPP / Tagihan | keuangan.spp_mhs | Status pembayaran mahasiswa |

### 7. 📊 Data PMB & Lulusan
**Target user:** BAA, Rektorat, Prodi

| Menu | Sumber | Deskripsi |
|---|---|---|
| Tracer Study | tracer.hasil_tracer_study | Hasil survey lulusan + masa tunggu kerja |
| Daya Tampung | pmb.daya_tampung | Kapasitas penerimaan per prodi |

### 8. 📈 Data IKU (Indikator Kinerja Utama)
**Target user:** LP3M, Rektorat, Dekan

| Menu | Sumber | Deskripsi |
|---|---|---|
| IKU 1 — Lulusan Langsung Bekerja | tracer + reg_pd | % lulusan dapat kerja ≤ 6 bulan |
| IKU 2 — MBKM | pdrd.akt_mhs (MBKM) | % mahasiswa ikut program MBKM |
| IKU 3 — Dosen Praktisi | pdrd.sdm + reg_ptk | Dosen dari industri/praktisi |
| IKU 5 — Kerjasama | kerjasama.mou | Jumlah kerjasama kelas dunia |
| IKU 7 — Kelas Kolaborasi | pdrd.kelas_kuliah | Kelas bersama prodi/PT lain |
| IKU 9 — Pendapatan | keuangan | PNBP non-UKT |

---

## 🏗️ Arsitektur Teknis

### Backend: Go Service (baru atau extend ws-service)

**Opsi A: Extend ws-service** — tambah modul `/v1/data/...`
**Opsi B: Service baru `data-service`** — isolasi dari ws-service

**Rekomendasi: Opsi A** — extend ws-service karena:
- Pakai DB yang sama (pdut)
- JWTAuth middleware sudah ada
- ws_authorization sudah setup
- Tidak perlu deploy service baru

```
/v1/data/mahasiswa                     — list + filter + export
/v1/data/mahasiswa/:id                 — detail
/v1/data/dosen                         — list + filter + export
/v1/data/dosen/:id                     — detail
/v1/data/litabmas                      — penelitian + pengabdian
/v1/data/publikasi                     — list + filter + export
/v1/data/akademik/prodi                — program studi
/v1/data/akademik/akreditasi           — akreditasi prodi + PT
/v1/data/akademik/matkul               — mata kuliah
/v1/data/kerjasama                     — MoU + kerjasama prodi
/v1/data/keuangan/ukt                  — UKT per prodi
/v1/data/keuangan/spp                  — tagihan mahasiswa
/v1/data/tracer                        — tracer study
/v1/data/export/:module                — Download CSV/Excel
```

### Filter Organisasi (Auto)

```go
// Middleware: inject org filter dari JWT active context
func OrgFilter() fiber.Handler {
    return func(c *fiber.Ctx) error {
        orgId := c.Locals("org_id")    // dari JWT
        orgLevel := c.Locals("org_level") // 0=univ, 1=fak, 2=jur, 3=prodi
        roleName := c.Locals("role_name")
        
        // Universal roles (Rektor, Admin) = no filter
        // Dekan = filter by fakultas
        // Kaprodi = filter by prodi
        // Dosen = filter by homebase prodi
        // Mahasiswa = filter by own data
        
        c.Locals("data_filter", buildOrgFilter(orgId, orgLevel, roleName))
        return c.Next()
    }
}
```

### Export

```go
// CSV/Excel export dengan streaming (untuk dataset besar)
func ExportCSV(c *fiber.Ctx) error {
    module := c.Params("module") // mahasiswa, dosen, dll
    c.Set("Content-Type", "text/csv")
    c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s_%s.csv", module, time.Now().Format("20060102")))
    // Stream rows langsung ke response
}
```

### Frontend: Next.js Pages

```
/dashboard/data-unila/
├── page.tsx                    — Dashboard overview (stats cards)
├── mahasiswa/
│   ├── page.tsx               — Daftar mahasiswa
│   ├── [id]/page.tsx          — Detail mahasiswa
│   └── lulusan/page.tsx       — Data lulusan
├── dosen/
│   ├── page.tsx               — Daftar dosen
│   └── [id]/page.tsx          — Detail dosen
├── tridarma/
│   ├── penelitian/page.tsx    — Penelitian
│   ├── pengabdian/page.tsx    — Pengabdian
│   ├── publikasi/page.tsx     — Publikasi
│   └── prestasi/page.tsx      — Prestasi
├── akademik/
│   ├── prodi/page.tsx         — Program studi
│   ├── akreditasi/page.tsx    — Akreditasi
│   ├── matkul/page.tsx        — Mata kuliah
│   └── kurikulum/page.tsx     — Kurikulum
├── kerjasama/page.tsx         — MoU & kerjasama
├── keuangan/
│   ├── ukt/page.tsx           — UKT
│   └── spp/page.tsx           — SPP
├── tracer/page.tsx            — Tracer study
└── iku/page.tsx               — Dashboard IKU
```

### RBAC Data Filter by Role

| Role | Level | Filter Data |
|---|---|---|
| Administrator / Rektor | Universitas | Semua data |
| Wakil Rektor | Universitas | Semua data |
| Dekan | Fakultas | Data prodi di fakultasnya |
| Kaprodi | Prodi | Data prodi saja |
| Dosen | Prodi | Data prodi homebase |
| Developer | Semua | Semua data |
| LP3M | Universitas | Semua data |
| Mahasiswa | Prodi | Data sendiri saja |

---

## 📋 Phase Plan

### Phase 1 — Foundation (2-3 hari)
1. Buat app "Data Unila" di DB (set a_coming_soon=0, a_live=1)
2. Setup seed menu (portal_menus/data-unila.json)
3. Setup frontend layout + sidebar
4. Implement org-based data filter middleware di ws-service
5. Buat base DataTable component dengan filter + export button

### Phase 2 — Data Mahasiswa (2-3 hari)
1. Backend: endpoints mahasiswa (list, detail, sebaran, lulusan)
2. Frontend: 4 halaman mahasiswa
3. Export CSV/Excel
4. Filter: prodi, fakultas, semester, status, angkatan

### Phase 3 — Data Dosen (1-2 hari)
1. Backend: endpoints dosen (list, detail, jabfung, kepangkatan)
2. Frontend: halaman dosen + detail profil
3. Filter: prodi, fakultas, jabfung, kepegawaian

### Phase 4 — Data Tridarma (1-2 hari)
1. Backend: endpoints litabmas, publikasi, prestasi
2. Frontend: 4 halaman tridarma
3. Filter: tahun, jenis, prodi/dosen

### Phase 5 — Data Akademik (1 hari)
1. Backend: endpoints prodi, akreditasi, matkul
2. Frontend: halaman akademik

### Phase 6 — Data Kerjasama & Keuangan (1 hari)
1. Backend: endpoints kerjasama, UKT, SPP
2. Frontend: halaman kerjasama + keuangan

### Phase 7 — Tracer & IKU Dashboard (1-2 hari)
1. Backend: endpoints tracer study
2. Frontend: tracer + IKU dashboard cards
3. Cross-reference data untuk IKU metrics

### Phase 8 — Polish & Testing (1-2 hari)
1. Responsive UI polish
2. Permission testing per role
3. Export testing (big data streaming)
4. Documentation

---

## ⏱️ Estimasi Total

| Phase | Task | Estimasi |
|-------|------|----------|
| 1 | Foundation | 2-3 hari |
| 2 | Data Mahasiswa | 2-3 hari |
| 3 | Data Dosen | 1-2 hari |
| 4 | Data Tridarma | 1-2 hari |
| 5 | Data Akademik | 1 hari |
| 6 | Kerjasama & Keuangan | 1 hari |
| 7 | Tracer & IKU | 1-2 hari |
| 8 | Polish & Testing | 1-2 hari |
| **Total** | | **~10-15 hari** |

---

## 🔑 Fitur Utama yang Harus Ada

1. **Filter fleksibel** — Tahun, semester, prodi, fakultas, status, angkatan, dll
2. **Auto-filter by org** — Data tampil sesuai role & organisasi user yang login
3. **Export** — Download CSV/Excel per modul
4. **Search** — Pencarian global di setiap tabel
5. **Pagination** — Server-side pagination (data jutaan records)
6. **Detail view** — Klik row → detail lengkap
7. **Statistik cards** — Summary angka di setiap halaman
8. **Responsive** — Mobile-friendly
9. **Dark mode** — Konsisten dengan portal MyUnila

---

## 📊 Kebutuhan Data per Stakeholder PTN

| Stakeholder | Kebutuhan Data | Modul |
|---|---|---|
| **BAN-PT / LAM** | Mahasiswa, dosen, kurikulum, akreditasi, kerjasama, tridarma, tracer | Semua |
| **PDDIKTI** | Mahasiswa, dosen, prodi, matkul, KRS, nilai | Mhs + Dosen + Akademik |
| **Kemenristekdikti** | IKU 1-9, tridarma, kerjasama | IKU + Tridarma + Kerjasama |
| **Auditor Internal** | Keuangan, mahasiswa aktif, dosen tetap | Keuangan + Mhs + Dosen |
| **SPMI** | Seluruh data quality assurance | Semua |
| **Pimpinan** | Ringkasan, trend, perbandingan | Dashboard IKU |
| **Prodi** | Data prodi sendiri, akreditasi, dosen, mahasiswa | Semua (filtered) |
| **Dosen** | Data mahasiswa bimbingan, penelitian, publikasi | Mhs + Tridarma |

---

*Implementasi mulai dari Phase 1 (Foundation) untuk memastikan arsitektur benar sebelum buat semua modul.*
