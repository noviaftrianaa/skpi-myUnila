# ws-service — Endpoint Coverage Checklist

Inventarisasi semua table `pdut` yang bisa jadi endpoint di ws-service (`backend/api-service/`).
Diurutkan per schema, dengan status coverage saat ini.

**Legend:**
- ✅ = endpoint sudah live
- 🔶 = partial (beberapa kolom/tabel terkait sudah, belum lengkap)
- ⬜ = belum ada endpoint — calon kerjaan selanjutnya
- ❌ = tidak relevan untuk API eksternal (internal use / metadata)

---

## 💬 Singkatan & Naming

**Apa itu PDRD?**
`PDRD` adalah singkatan dari **Pangkalan Data Pendidikan Tinggi** (konvensi PDDIKTI
Feeder) — schema `pdut.pdrd.*` berisi data induk: peserta didik, SDM, aktivitas,
riwayat, publikasi, penelitian, dll.

**Usul naming group endpoint:**

| Saat ini | Isi | Usul rename |
|---|---|---|
| `/v1/pdrd/*` | campuran (mahasiswa, sdm, publikasi) | **split per domain** ↓ |

Split lebih scalable:

```
/v1/mahasiswa/*   — dari pdrd.peserta_didik + reg_pd + kuliah_mhs + siakadu.*
/v1/sdm/*         — dari pdrd.sdm + reg_ptk + rwy_*  (SISTER)
/v1/pegawai/*     — dari sikep.*                     (SIKEP)
/v1/akademik/*    — matkul, jadwal, kurikulum, kelas_kuliah, nilai_*
/v1/publikasi/*   — pdrd.publikasi + tulis_pub
/v1/litabmas/*    — pdrd.litabmas + mitra + anggota
/v1/prestasi/*    — pdrd.prestasi + siakadu varian
/v1/dokumen/*     — schema dok.*
/v1/referensi/*   — ref.* (sudah ada)
```

Alternatif minimal: keep `/v1/pdrd/*` untuk backward compat + **tambah group baru** `/v1/akademik/*`, `/v1/sdm/*`, `/v1/pegawai/*` yang copy endpoint terkait — biar URL lebih intuitif tanpa breaking change.

---

## 📋 Schema `pdrd` — 72 tables

### Mahasiswa / Peserta Didik

| Table | Status | Endpoint | Keterangan |
|---|---|---|---|
| `pdrd.peserta_didik` | ✅ | `/pdrd/list_mahasiswa`, `/pdrd/detail_biodata_mahasiswa` | |
| `pdrd.reg_pd` | ✅ | `/pdrd/riwayat_pendidikan_mahasiswa` | |
| `pdrd.kuliah_mhs` | ✅ | `/pdrd/status_kuliah_mahasiswa` | |
| `pdrd.nilai_smt_mhs` | ⬜ | — | Nilai per semester per mahasiswa |
| `pdrd.nilai_transkrip` | ⬜ | — | Transkrip akhir |
| `pdrd.nilai_tes` | ⬜ | — | Nilai tes masuk |
| `pdrd.akt_mhs` | ⬜ | — | Aktivitas mahasiswa (KP/KKN/Magang) |
| `pdrd.anggota_akt_mhs` | ⬜ | — | Anggota aktivitas |
| `pdrd.bimbing_mhs` | ⬜ | — | Pembimbingan skripsi/tesis |
| `pdrd.uji_mhs` | ⬜ | — | Pengujian tugas akhir |
| `pdrd.tugas_belajar` | ⬜ | — | Tugas belajar mhs |
| `pdrd.laporan_studi` | ⬜ | — | Laporan studi |
| `pdrd.anak` | ⬜ | — | Data anak (keluarga sdm) |

### SDM (Dosen + Tendik) — source: SISTER

| Table | Status | Endpoint |
|---|---|---|
| `pdrd.sdm` | ✅ | `/pdrd/list_sdm`, `/pdrd/detail_sdm` |
| `pdrd.reg_ptk` | ✅ | `/pdrd/penugasan_sdm` |
| `pdrd.keaktifan_ptk` | ⬜ | — (bisa digabung ke penugasan) |
| `pdrd.rwy_pend_formal` | ✅ | `/pdrd/riwayat_sdm?type=pend_formal` |
| `pdrd.rwy_fungsional` | ✅ | `/pdrd/riwayat_sdm?type=fungsional` |
| `pdrd.rwy_kepangkatan` | ✅ | `/pdrd/riwayat_sdm?type=kepangkatan` |
| `pdrd.tugas_tambahan` | ✅ | `/pdrd/riwayat_sdm?type=tugas_tambahan` |
| `pdrd.rwy_sertifikasi` | ✅ | `/pdrd/riwayat_sdm?type=sertifikasi` |
| `pdrd.rwy_pekerjaan` | ⬜ | — Riwayat pekerjaan sebelum UNILA |
| `pdrd.rwy_struktural` | ⬜ | — Riwayat jabatan struktural |
| `pdrd.rwy_didik_nonformal` | ⬜ | — Diklat/workshop non-formal |
| `pdrd.diklat` | ⬜ | — Data diklat yg diikuti sdm |
| `pdrd.kinerja_dosen` | ⬜ | — BKD per semester |
| `pdrd.inpassing` | ⬜ | — Penyetaraan pangkat |
| `pdrd.detasering` | ⬜ | — Penugasan keluar |
| `pdrd.visiting_scientist` | ⬜ | — Visiting scholar |
| `pdrd.tunjangan` | ⬜ | — Tunjangan dosen |
| `pdrd.tugas_belajar` | ⬜ | — Tubel dosen |
| `pdrd.kesejahteraan` | ⬜ | — Data kesejahteraan |
| `pdrd.anggota_orgprof` | ⬜ | — Organisasi profesi |

### Aktivitas Akademik

| Table | Status | Endpoint |
|---|---|---|
| `pdrd.akt_ajar_dosen` | ⬜ | — Aktivitas mengajar (BKD) |
| `pdrd.matkul` | ⬜ | — Mata kuliah master |
| `pdrd.matkul_kurikulum` | ⬜ | — MK per kurikulum |
| `pdrd.kurikulum_sp` | ⬜ | — Kurikulum prodi |
| `pdrd.kelas_kuliah` | ⬜ | — Kelas kuliah per semester |
| `pdrd.jadwal_kelas` | ⬜ | — Jadwal kelas |
| `pdrd.rencana_ajar` | ⬜ | — RPS |
| `pdrd.substansi_kuliah` | ⬜ | — Substansi perkuliahan |
| `pdrd.re_mk` | ⬜ | — Evaluasi MK |
| `pdrd.bimbing_dosen` | ⬜ | — Dosen pembimbing (pivot) |

### Publikasi & Litabmas

| Table | Status | Endpoint |
|---|---|---|
| `pdrd.publikasi` | ✅ | `/pdrd/publikasi` |
| `pdrd.tulis_pub` | ⬜ | — Author detail publikasi |
| `pdrd.litabmas` | ✅ | `/pdrd/litabmas` |
| `pdrd.mitra_litabmas` | ⬜ | — Mitra penelitian/pengabdian |
| `pdrd.pd_anggota_litabmas` | ⬜ | — Mahasiswa anggota litabmas |
| `pdrd.sdm_anggota_litabmas` | ⬜ | — Dosen anggota litabmas |
| `pdrd.non_ca_anggota_litabmas` | ⬜ | — Non-civitas anggota |
| `pdrd.non_ca` | ⬜ | — Non-civitas |
| `pdrd.lembaga_iptek` | ⬜ | — Lembaga penelitian |
| `pdrd.lembaga_non_sp` | ⬜ | — Lembaga di luar sp |
| `pdrd.buku_ajar` | ⬜ | — Buku ajar |
| `pdrd.tulis_buku_ajar` | ⬜ | — Author buku ajar |
| `pdrd.pembicara` | ⬜ | — Narasumber seminar |
| `pdrd.pengelola_jurnal` | ⬜ | — Editor/reviewer jurnal |
| `pdrd.penghargaan` | ⬜ | — Penghargaan sdm |
| `pdrd.prestasi` | ⬜ | — Prestasi mahasiswa |
| `pdrd.anggota_panitia` | ⬜ | — Anggota kepanitiaan |
| `pdrd.kepanitiaan` | ⬜ | — Kepanitiaan |

### Master Prodi & PT

| Table | Status | Endpoint |
|---|---|---|
| `pdrd.sms` | ⬜ | — Program studi (master prodi) |
| `pdrd.satuan_pendidikan` | ⬜ | — Unit SP (fakultas/sekolah) |
| `pdrd.profil_prodi` | ⬜ | — Profil prodi per tahun |
| `pdrd.profil_pt` | ⬜ | — Profil PT per tahun |
| `pdrd.akred_sp` | ⬜ | — Akreditasi SP |
| `pdrd.akreditasi_prodi` | ⬜ | — Akreditasi prodi |

### Mapping

| Table | Status | Endpoint |
|---|---|---|
| `pdrd.map_abmas_tse` | ⬜ | — Map pengabdian → TSE |
| `pdrd.map_litabmas_bidang` | ⬜ | — Map litabmas → bidang |
| `pdrd.map_publikasi_bidang` | ⬜ | — Map publikasi → bidang |
| `pdrd.map_sdm_bidang` | ⬜ | — Map sdm → bidang kompetensi |
| `pdrd.smi` | ⬜ | — Standar mutu internal |
| `pdrd.dudi` | ⬜ | — Dunia Usaha Dunia Industri |

---

## 📋 Schema `siakadu` — 52 tables (SIAKADU UNILA)

Banyak overlap dengan `pdrd.*` (copy sync). Endpoint `siakadu/*` tidak perlu
kalau data sudah di `pdrd.*`. Yang **unik di siakadu**:

| Table | Status | Keterangan |
|---|---|---|
| `siakadu.daftar_ukt` | ⬜ | Master UKT — keuangan mahasiswa |
| `siakadu.spp_mhs` | ⬜ | Pembayaran SPP per mhs |
| `siakadu.kelas_ukt` | ⬜ | Kelas UKT (tier biaya) |
| `siakadu.keluarga_mhs` | ⬜ | Data keluarga detail mhs |
| `siakadu.kinerja_dosen` | ⬜ | Kinerja dosen versi siakadu |
| `siakadu.kehadiran_mhs` | ⬜ | Kehadiran mhs di kuliah |
| `siakadu.kehadiran_sdm` | ⬜ | Kehadiran dosen mengajar |
| `siakadu.nilai_smt_mhs` | ⬜ | Nilai per smt (sinkron pdrd) |
| `siakadu.periode_wisuda` | ⬜ | Master periode wisuda |
| `siakadu.wisuda_mahasiswa` | ⬜ | Peserta wisuda per periode |
| `siakadu.pimpinan_unit` | ⬜ | Pejabat unit |
| `siakadu.ref_tahun_ajaran` | ⬜ | TA UNILA (beda dgn ref.tahun_ajaran PDDIKTI) |
| `siakadu.mapping_*` (6 tbl) | ⬜ | Mapping ke pdrd |
| `siakadu.ref_*` (5 tbl) | ❌ | Referensi lokal — gunakan `ref.*` PDDIKTI saja |

---

## 📋 Schema `sikep` — 7 tables (Sistem Kepegawaian)

| Table | Status | Endpoint |
|---|---|---|
| `sikep.pegawai` | ✅ | `/pdrd/list_pegawai`, `/pdrd/detail_pegawai` |
| `sikep.pendidikan` | 🔶 | (dipakai sebagai FK, belum ada listing endpoint) |
| `sikep.jabfung` | 🔶 | (dipakai sebagai FK) |
| `sikep.jabstruk` | 🔶 | (dipakai sebagai FK) |
| `sikep.golongan_pns` | 🔶 | (dipakai sebagai FK) |
| `sikep.golongan_pppk` | ⬜ | — PPPK golongan |
| `sikep.unit_orga` | 🔶 | (FK, bisa expose sebagai /pegawai/unit_orga) |

---

## 📋 Schema `dok` — 26 tables (Dokumen)

Semua `dok.*` untuk metadata file. Cocok expose sebagai endpoint internal
`dokumen/*` untuk download URL atau list.

| Table | Status |
|---|---|
| `dok.dokumen` | ⬜ |
| `dok.foto_peserta_didik` | ⬜ |
| `dok.large_object` | ❌ (binary blob storage, jangan expose langsung) |
| `dok.dok_sdm` | ⬜ |
| `dok.dok_rwy_didik` | ⬜ |
| `dok.dok_rwy_kepangkatan` | ⬜ |
| `dok.dok_rwy_pekerjaan` | ⬜ |
| `dok.dok_rwy_sertifikasi` | ⬜ |
| `dok.dok_litabmas` | ⬜ |
| `dok.dok_pub` | ⬜ |
| `dok.dok_bhn_ajar` | ⬜ |
| `dok.dok_diklat` | ⬜ |
| `dok.dok_detasering` | ⬜ |
| `dok.dok_akt_mhs` | ⬜ |
| `dok.dok_panitia`, `dok_penghargaan`, dll (10+) | ⬜ |

---

## 📋 Schema `ref` — 92 tables (Referensi PDDIKTI)

Semua **sudah ter-expose** via module `referensi` di ws-service (`/v1/referensi/*`).
60+ endpoint live. Tidak perlu ditambah lagi.

---

## 📋 Schema `man_akses` — 22 tables (Manajemen Akses)

❌ Internal-only — tidak untuk API publik. Tabel seperti `access_token`, `refresh_token`,
`ws_authorization` bersifat security credential / session state. Yang bisa
dijadikan endpoint informasi (dengan permission ketat):

| Table | Catatan |
|---|---|
| `man_akses.aplikasi` | Sudah ada di auth-service `/apps` |
| `man_akses.menu` | Sudah ada di auth-service `/menus` |
| `man_akses.pengguna` | Sudah ada di auth-service `/users` (admin) |
| `man_akses.unit_organisasi` | ⬜ Bisa expose sebagai referensi struktur org |

---

## 🎯 Ringkasan Status

| Domain | Tabel | Sudah Expose | Belum | Prioritas |
|---|---|---|---|---|
| Mahasiswa core | 3 | 3 ✅ | 0 | — |
| Mahasiswa aktivitas | 10 | 0 | 10 | **Tinggi** (nilai_smt_mhs, nilai_transkrip, akt_mhs, bimbing_mhs) |
| SDM biodata + riwayat | 12 | 8 ✅ | 4 | Sedang (rwy_pekerjaan, rwy_struktural, diklat, kinerja_dosen) |
| Aktivitas akademik (matkul/kelas) | 10 | 0 | 10 | **Tinggi** (matkul, kelas_kuliah, jadwal_kelas, rencana_ajar) |
| Publikasi & Litabmas | 16 | 2 ✅ | 14 | Sedang (tulis_pub, mitra_litabmas, lembaga_iptek) |
| Prodi & PT profil | 6 | 0 | 6 | Sedang (akreditasi_prodi, profil_prodi, sms) |
| Keuangan mhs (siakadu) | 3 | 0 | 3 | Rendah (UKT/SPP — ada di keuangan-service) |
| Sikep | 7 | 1 ✅ | 6 | Rendah (FK sudah join) |
| Dok | 26 | 0 | 26 | Rendah (butuh strategi dokumen terpisah) |

---

## 🚀 Usulan Next Batch (yang paling berdampak)

Kalau mau ikuti urutan dampak paling besar:

**Batch 1 — Akademik core** (user biasanya butuh ini pertama):
- `/akademik/matkul` (master MK)
- `/akademik/kelas_kuliah` (kelas per semester)
- `/akademik/jadwal_kelas`
- `/akademik/kurikulum`

**Batch 2 — Nilai Mahasiswa**:
- `/mahasiswa/nilai_smt` (nilai_smt_mhs)
- `/mahasiswa/transkrip` (nilai_transkrip)
- `/mahasiswa/kehadiran`

**Batch 3 — Aktivitas Mahasiswa**:
- `/mahasiswa/aktivitas` (akt_mhs + anggota)
- `/mahasiswa/bimbingan` (bimbing_mhs)
- `/mahasiswa/uji` (uji_mhs — sidang)

**Batch 4 — SDM tambahan**:
- `/sdm/kinerja` (BKD)
- `/sdm/rwy_pekerjaan`, `/sdm/rwy_struktural`
- `/sdm/diklat`

**Batch 5 — Profil institusi**:
- `/institusi/prodi` (pdrd.sms + profil_prodi + akreditasi)
- `/institusi/fakultas` (satuan_pendidikan)
- `/institusi/unit_orga` (dari sikep)

---

**Silakan centang** batch/tabel mana yang mau di-implementasi duluan. Setiap tabel
kira-kira 1-2 jam untuk full CRUD (list+detail dgn join ref) + OpenAPI doc.
