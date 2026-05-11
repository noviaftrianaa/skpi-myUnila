# Plan: LMS myUnila (V-Class Reborn)

**Versi**: 1.0 — 2026-05-09
**Author**: UPT TIK Universitas Lampung
**Status**: Draft — Brainstorming (perlu validasi pimpinan & stakeholder)

---

## 1. Executive Summary

myUnila saat ini punya placeholder app **V-Class** (`a_coming_soon=true`) tanpa implementasi. UPT TIK perlu membangun LMS yang setara dengan **Moodle / Edlink** dengan fitur: sync mahasiswa-dosen-kelas, CBT/quiz, kumpul tugas, dll.

**Rekomendasi Akhir**: **Opsi C — Hybrid Moodle Engine + myUnila Wrapper** dengan konsep "Best of Both Worlds":
- **Moodle** sebagai engine LMS (course content, quiz/CBT, gradebook, assignment) — proven 20+ tahun
- **myUnila** sebagai portal terpadu, SSO, sync data, dashboard pimpinan, dan custom flow Indonesia
- UI wrapper di myUnila untuk experience yang seragam dengan portal lain

Estimasi: **MVP 4 bulan** dengan tim 3 dev (1 Moodle/PHP, 1 Next.js, 1 Go/integrator).

---

## 2. Status Quo

### 2.1 V-Class Sekarang
| Aspek | Status |
|---|---|
| Entry di portal | Ada (urutan 5, kategori Akademik, ikon building-library) |
| `a_coming_soon` | `true` (placeholder) |
| URL | `#` (tidak ada implementasi) |
| Default access | Mahasiswa + Dosen (hasil seed Phase 1) |

### 2.2 Skema Database Sudah Disiapkan
`pdrd.kelas_kuliah` punya kolom **`kode_vclass`** — artinya skema PDDikti sudah akomodir LMS code per kelas. Ini sinyal kuat bahwa LMS pernah direncanakan sebelumnya.

| Tabel relevan | Fungsi |
|---|---|
| `pdrd.kelas_kuliah` | Master kelas (id_kls, nm_kls, id_smt, id_mk, sks_mk, **kode_vclass**) |
| `pdrd.kuliah_mhs` | Mahasiswa terdaftar di kelas (per semester) |
| `pdrd.akt_ajar_dosen` | Dosen yg ngajar di kelas |
| `pdrd.matkul` | Master matakuliah |
| `pdrd.nilai_smt_mhs` | Nilai semester mahasiswa (target output dari LMS) |
| `pdrd.bimbing_dosen` | Bimbingan skripsi/TA |

### 2.3 Aplikasi Pendamping yang Sudah Ada
- **SI MBAK** — surat & administrasi mahasiswa
- **Presensi (SIRANDU)** — masih placeholder, akan jadi pelengkap LMS untuk attendance
- **SI KKN** — sudah berjalan (port 9004)
- **SIAKADU** — KRS, transkrip
- **Tracer Study** — IKU2 (sudah disetting Phase 1)

LMS akan **bersanding dan sinkron** dengan modul-modul ini, bukan menggantikan.

---

## 3. Referensi Industri (Benchmarking)

| Platform | Tipe | Fitur Unggulan | Cocok untuk Unila? |
|---|---|---|---|
| **Moodle** | Open-source, self-host | Course mgmt, quiz, gradebook, SCORM, mobile, plugin marketplace | ✅ Sangat cocok — full kontrol, gratis |
| **Edlink** | SaaS Indonesia | Mirror sosmed, CBT, attendance, mobile-first, simple UX | ✅ Cocok inspirasi UX |
| **Google Classroom** | SaaS Google | Simple, integrasi Google Workspace, gratis | ⚠️ Vendor lock-in, data ekstrak susah |
| **Canvas LMS** | Open + SaaS | Modern UI, SpeedGrader, analytic | ⚠️ Lebih kompleks dari Moodle |
| **MS Teams + LMS** | Microsoft 365 | Video conf bawaan, integrasi Office | ⚠️ Butuh lisensi M365 enterprise |
| **OpenEdX** | Open-source MOOC | Skala besar, course-as-MOOC, video player kuat | ⚠️ Heavy untuk kelas reguler |

---

## 4. Tiga Opsi Strategis

### 4.1 Opsi A — Adopsi Moodle Penuh
Deploy Moodle standalone, integrasikan via SSO + REST API.

**Pros**:
- Mature platform 20+ tahun, fitur paling lengkap (quiz engine, gradebook, rubric, peer review, SCORM, BBB integration)
- Komunitas global besar, banyak plugin gratis
- Sudah dipakai banyak PTN (UI, ITB, UNS, UB, Unand, dll)
- Mobile app official (Moodle Mobile)
- Open-source GPLv3 — gratis selamanya

**Cons**:
- UI tidak seragam dengan myUnila (theme bisa custom tapi tetap "Moodle look")
- Stack PHP + MariaDB/PostgreSQL — beda dari myUnila (Laravel/Next/Go)
- User experience bagi mahasiswa = 2 sistem (myUnila portal + Moodle UI)
- SSO bridging perlu plugin OIDC + custom mapping role
- Course auto-enrollment perlu cron job custom (sync dari `pdrd.kuliah_mhs`)

**Estimasi**: 2 bulan setup + 1 bulan integrasi SSO + sync = **3 bulan**

---

### 4.2 Opsi B — Custom Build dari Nol
Bangun LMS sendiri pakai stack myUnila (Next.js + Laravel/Go + SQL Server).

**Pros**:
- 100% terintegrasi, single codebase, design konsisten
- Fleksibel — bisa custom flow Unila (KKN-LMS, integrasi BAN-PT, simbak surat ujian, dll)
- Single sign-on natural (sudah pakai auth-service)
- Mahasiswa cuma kenal 1 portal: myUnila

**Cons**:
- Effort GEDE — feature-parity Moodle butuh 2-3 tahun + tim 5+ dev
- Reinvent the wheel: quiz engine, file storage, video player, gradebook, rubric, plagiarism
- Risiko teknis: edge cases pendidikan banyak (group assignment, peer review, anti-cheating CBT, time-zone, retake)
- Maintenance burden: kalau dev keluar, susah replacement (Moodle dev banyak di pasar)
- Tidak ada plugin marketplace; semua harus custom

**Estimasi**: MVP 8 bulan, feature-rich 24 bulan. **NOT recommended kecuali tim 5+ dev full-time.**

---

### 4.3 Opsi C — Hybrid: Moodle Engine + myUnila Wrapper ⭐ (RECOMMENDED)

**Konsep**: Pakai Moodle sebagai *headless* LMS engine (back-office heavy lifting), build wrapper UI di myUnila untuk experience yang seragam.

```
┌──────────────────────────────────────────┐
│  PORTAL myUnila (Next.js)                │
│  ┌────────────────────────────────────┐  │
│  │ Mahasiswa Dashboard:               │  │
│  │  - Daftar Kelas (sync dari pdrd)   │  │
│  │  - Tugas pending                   │  │
│  │  - Quiz aktif                      │  │
│  │  - Materi terbaru                  │  │
│  └────────────────────────────────────┘  │
│         ↕ REST API + SSO                 │
└──────────────────────────────────────────┘
         ↕                ↕
┌─────────────────┐  ┌────────────────────┐
│  MOODLE 4.x     │  │  myUnila Service   │
│  (Engine)       │  │  - sync-job        │
│  - Course       │  │  - auth-bridge     │
│  - Quiz         │  │  - stats-aggregate │
│  - Assignment   │  │  - notifikasi      │
│  - Gradebook    │  │                    │
└─────────────────┘  └────────────────────┘
         ↕                    ↕
┌──────────────────────────────────────────┐
│  pdut (SQL Server) — Single Source       │
│  pdrd.kelas_kuliah, kuliah_mhs,          │
│  akt_ajar_dosen, matkul, etc.            │
└──────────────────────────────────────────┘
```

**Pros**:
- Dapat semua fitur Moodle (quiz engine canggih, gradebook teruji, dll) **TANPA reinvent**
- UI portal seragam dengan myUnila (mahasiswa cuma kenal 1 brand)
- Maintenance ringan — Moodle handle the heavy stuff
- Bisa expose hanya fitur yang relevan (misal sembunyikan menu admin Moodle, tampilkan via myUnila)
- Kalau perlu fitur custom (mis. integrasi BAN-PT) → build di myUnila side, ambil data Moodle via REST
- Bisa migrate ke Opsi A (Moodle penuh) atau Opsi B (custom) future tanpa lock-in

**Cons**:
- Butuh 2 stack (PHP Moodle + Next.js + Laravel/Go) → operasional 2 lapangan
- Sync data Moodle ↔ pdut perlu engineering
- Kalau Moodle update mayor (4→5), perlu test ulang integrasi

**Estimasi**: **MVP 4 bulan, full-feature 8 bulan**.

---

## 5. Decision Matrix

| Kriteria | Bobot | Opsi A (Moodle) | Opsi B (Custom) | Opsi C (Hybrid) |
|---|:---:|:---:|:---:|:---:|
| Time to market | 25% | 8 | 3 | 9 |
| UX seragam myUnila | 20% | 5 | 10 | 9 |
| Fitur lengkap | 20% | 10 | 4 | 9 |
| Maintenance jangka panjang | 15% | 8 | 5 | 7 |
| Cost (lisensi + dev) | 10% | 9 | 4 | 8 |
| Ekosistem & komunitas | 5% | 10 | 3 | 9 |
| Risk teknis | 5% | 8 | 3 | 7 |
| **TOTAL SKOR** | 100% | **7.95** | **4.65** | **8.45** |

**Pilihan**: **Opsi C — Hybrid** (skor 8.45/10).

---

## 6. Stack & Arsitektur Detail (Opsi C)

### 6.1 Komponen Software
| Layer | Tech | Catatan |
|---|---|---|
| LMS Engine | **Moodle 4.5 LTS** | Long-term support sampai 2027 |
| Moodle DB | **PostgreSQL 16** | Pisah dari pdut (data student/dosen di pdut, data course di Moodle DB) |
| Moodle Hosting | Docker container di VM6 (baru, dedicated) | RAM 8GB+, disk 200GB+ |
| Wrapper UI | **Next.js 15** (extension myUnila) | Page baru `/dashboard/lms` |
| Sync Job | **Go service (lms-sync)** baru di port 9005 | Cron tiap 30 menit, sync user/course/enrollment |
| Auth Bridge | **OIDC (auth-service)** + plugin auth_oidc Moodle | SSO seamless |
| File Storage | NFS/S3-compatible (Minio) | Materi, video, tugas |
| Video Conf (Phase 2) | **BigBlueButton** atau Jitsi | Self-host, gratis |
| Mobile App (Phase 3) | **Moodle Mobile** rebranded | Custom theme |

### 6.2 Diagram Integrasi
```
[Mahasiswa Browser]
       ↓
  [myUnila Next.js]  ←── auth-service (JWT, SSO)
       ↓
  /dashboard/lms (wrapper UI)
       ↓ REST API call
  [Moodle Web Services]  ←── auth_oidc plugin
       ↓
  [Moodle DB Postgres]  ←── lms-sync (Go)
                              ↑ baca dari
                       [pdut SQL Server]
```

### 6.3 Mapping Data
| Moodle Object | Source di pdut | Sync Strategy |
|---|---|---|
| User (student) | `siakadu.peserta_didik` + `man_akses.pengguna` | Upsert harian + on-demand login |
| User (dosen) | `pdrd.sdm` + `man_akses.pengguna` | Upsert harian |
| Course | `pdrd.kelas_kuliah` (1 kelas = 1 course) | Auto-create per semester |
| Enrollment student | `pdrd.kuliah_mhs` | Sync 4x/hari |
| Enrollment dosen | `pdrd.akt_ajar_dosen` | Sync 4x/hari |
| Course category | `pdrd.sms` (prodi) → `ref.fakultas` | Static config |
| Grade → SIAKADU | Moodle gradebook → `pdrd.nilai_smt_mhs` | Akhir semester (manual trigger by dosen) |

### 6.4 Auth Flow (SSO)
1. Mahasiswa login ke myUnila → dapat JWT
2. Klik "LMS" di portal → redirect ke `/lms` (wrapper UI di myUnila)
3. Wrapper call Moodle API dgn token JWT (di-bridge ke OIDC)
4. Moodle plugin auth_oidc validasi token via auth-service `/oauth/userinfo`
5. Auto-create Moodle user kalau belum ada (mapping by username NIM/NIP)
6. Return session, mahasiswa langsung in.

---

## 7. Feature Roadmap

### 7.1 MVP — Core LMS (Bulan 1–4)
**Target**: 1 fakultas pilot (mis. Teknik atau Ekonomi), 1 semester ujicoba.

| Fitur | Owner | Status |
|---|---|---|
| Setup Moodle 4.5 di VM6 + Postgres | DevOps | T1 |
| Theme Moodle custom (warna myUnila) | Frontend | T1 |
| Plugin auth_oidc + bridge SSO | Backend | T1 |
| Service `lms-sync` Go: sync user, course, enrollment | Backend | T2 |
| Cron 4x/hari sync data | Backend | T2 |
| Wrapper UI `/dashboard/lms` di myUnila | Frontend | T2 |
| Dashboard mahasiswa (list kelas, tugas pending) | Frontend | T3 |
| Dashboard dosen (kelas yg diampu, ringkasan submisi) | Frontend | T3 |
| Module: **Materi Kuliah** (upload PDF/video/link) | Moodle native | T3 |
| Module: **Pengumpulan Tugas** (upload + deadline) | Moodle native | T3 |
| Module: **Pengumuman per kelas** | Moodle native | T3 |
| Module: **Diskusi Forum** | Moodle native | T3 |
| Manual: panduan dosen + mahasiswa | Tech writer | T4 |
| Pilot run 1 fakultas | Pilot team | T4 |

### 7.2 Phase 2 — CBT & Penilaian (Bulan 5–8)
| Fitur | Detail |
|---|---|
| **Quiz/CBT Engine** | Multiple choice, essay, true-false, matching, file upload |
| **Anti-cheat CBT** | Random soal, time limit, lockdown browser (LDB plugin), shuffle answers |
| **Gradebook** | Bobot otomatis (UTS/UAS/Tugas/Quiz), kustom rubric per matkul |
| **Sync nilai → SIAKADU** | Tombol "Push ke SIAKADU" di akhir semester (insert ke `pdrd.nilai_smt_mhs`) |
| **Plagiarism check** | Integrasi Turnitin atau alternatif (Plagscan, Compilatio) — opsional vendor |
| **Attendance per pertemuan** | Integrasi dengan SIRANDU (presensi-sirandu) — auto sync |
| **Dashboard Pimpinan LMS** | Statistik per fakultas/prodi, dosen aktif, kepatuhan, dll |
| **Export laporan akreditasi** | Data otomatis utk borang BAN-PT |

### 7.3 Phase 3 — Advanced (Bulan 9–12)
| Fitur | Detail |
|---|---|
| **Video Conference (BBB)** | Sinkron kelas online, recording auto-upload ke materi |
| **Mobile App** | Branded Moodle Mobile + push notif |
| **AI Assistant** | Q&A bot per kelas, ringkasan materi (Anthropic API atau lokal) |
| **Peer Review** | Mahasiswa nilai mahasiswa lain (rubric-based) |
| **Group Assignment** | Tugas berkelompok dengan kontribusi tracking |
| **Live Coding/Lab** | Integrasi dengan JupyterHub atau VSCode online |
| **Badge/Gamification** | Achievement system untuk engagement |
| **Certificate generator** | Sertifikat otomatis utk MOOC/MBKM |

### 7.4 Out-of-Scope (untuk dipikir nanti)
- Integrasi LMS eksternal (Coursera, edX) — perlu ekosistem MOOC
- Marketplace kursus untuk umum (LMS publik)
- Skala MOOC (ratusan ribu user concurrent) — butuh OpenEdX
- Live streaming kelas seperti Twitch (perlu CDN khusus)

---

## 8. Integrasi dengan Modul myUnila Existing

| Modul Existing | Integrasi LMS |
|---|---|
| **SIAKADU** | Sumber data kelas, mahasiswa, KRS. Target write nilai akhir. |
| **SI MBAK** | Surat ujian susulan, surat tugas dosen — link ke kelas LMS |
| **Presensi SIRANDU** | Sync kehadiran kelas (online + offline) |
| **SI Prestasi** | Mahasiswa juara olympiad → bonus point auto di LMS |
| **Tracer Study** | IKU2 alumni input pengalaman LMS waktu kuliah |
| **Manajemen Akses** | Peran "Dosen LMS Admin" custom per fakultas (peran fungsional) |
| **Akreditasi** | Export data partisipasi, kepatuhan dosen, rerata nilai utk borang BAN-PT |
| **Dashboard Pimpinan** | Card LMS: jumlah course aktif, tugas terkumpul, attendance rate |
| **Kandidat Akses (Phase 1)** | Saat mhs lulus → auto-revoke akses LMS via lifecycle |

---

## 9. Effort & Resource

### 9.1 Tim Inti (Minimal)
| Role | Tugas | Effort |
|---|---|---|
| **DevOps/Sysadmin** | Setup Moodle, Postgres, Minio, BBB | 0.5 FTE |
| **Backend (Go)** | Service `lms-sync`, REST bridge, cron | 1.0 FTE |
| **Backend (PHP/Moodle)** | Plugin auth_oidc, theme, custom module | 0.5 FTE |
| **Frontend (Next.js)** | Wrapper UI `/lms`, dashboard mhs/dosen | 1.0 FTE |
| **Tech Writer** | Manual, video tutorial, FAQ | 0.3 FTE |
| **PM/Lead** | Koordinasi, validasi user (dosen/mahasiswa) | 0.5 FTE |
| **QA/Tester** | Integration test, UAT | 0.5 FTE |

**Total**: ~4.3 FTE selama MVP (4 bulan)

### 9.2 Infrastruktur
| Item | Spek | Estimasi biaya |
|---|---|---|
| VM6 dedicated Moodle | 8 vCPU, 16GB RAM, 200GB SSD | Existing (jika tersedia) atau ~Rp 500k/bln cloud |
| Storage materi (NFS atau Minio) | 1 TB awal | Existing (atau ~Rp 300k/bln) |
| BBB (Phase 2) | 4 vCPU, 8GB RAM | Existing |
| Backup harian | Snapshot otomatis | Existing |

### 9.3 Budget Software (Opsional)
| Item | Tipe | Biaya |
|---|---|---|
| Moodle | Open source | **Gratis** |
| BigBlueButton | Open source | **Gratis** |
| Turnitin (plagiarism) | SaaS | ~USD 15-20/student/year (optional, Phase 2+) |
| Theme premium Moodle | SaaS | ~USD 200/year (optional, kalau mau langsung bagus) |
| Lockdown browser CBT | SaaS | ~USD 1-3/student/exam (optional) |

---

## 10. Risk & Mitigation

| Risk | Probabilitas | Impact | Mitigasi |
|---|:---:|:---:|---|
| Sync data lambat → mhs tidak kelihatan kelas | Med | High | Cron 4x/hari + on-demand sync saat user login pertama |
| Moodle update breaking change | Low | Med | Use LTS (4.5), test di staging dulu, lock plugin version |
| Tim PHP/Moodle resign | Med | High | Document semua plugin custom, train 2 orang minimal |
| Performance Moodle lambat saat UAS | High | High | Load test sebelum semester, autoscale, CDN materi |
| Mhs tidak punya internet di rumah | High | Med | Mode offline (download materi), mobile-first |
| Resistensi dosen senior pakai LMS | High | Med | Training intensif, dosen champion per fakultas, gamification |
| Data nilai bocor / mhs hack | Low | High | OIDC strict, audit log, rate limit, session timeout |
| Storage materi penuh | Med | Med | Quota per dosen + auto-clean materi >2 thn |
| Kompatibilitas mobile browser | Med | Med | PWA + responsive test, mobile app native Phase 3 |
| Sync nilai LMS→SIAKADU error | Med | High | Manual trigger by dosen + verifikasi sebelum push, audit log |

---

## 11. Roadmap Timeline

```
Bulan 1: Setup infra + Moodle install + auth-bridge
Bulan 2: lms-sync service + cron + theme custom
Bulan 3: Wrapper UI + dashboard mhs/dosen + 4 modul core
Bulan 4: Pilot 1 fakultas + manual + UAT  ──────► MVP LIVE

Bulan 5-6: CBT engine tuning + gradebook
Bulan 7-8: Sync nilai SIAKADU + attendance integration ─► PHASE 2 LIVE

Bulan 9-10: Video conf BBB + mobile app
Bulan 11-12: AI assistant + advanced features ─► PHASE 3 LIVE
```

---

## 12. Pertanyaan Buat Pimpinan & Stakeholder

Sebelum eksekusi, perlu validasi:

1. **Anggaran**: berapa budget setahun untuk LMS (server, license opsional, training)?
2. **Tim**: ada 4 FTE selama 4 bulan untuk MVP? Atau perlu rekrut/outsource?
3. **Pilot**: fakultas mana yang siap jadi pilot? (rekomendasi: yg paling adopt teknologi)
4. **Hosting**: VM baru di datacenter Unila atau cloud? Privacy data: harus on-prem.
5. **Lisensi opsional**: setuju budget Turnitin/Lockdown browser kalau ada Phase 2?
6. **Branding**: tetap nama "V-Class" atau rebrand jadi "LMS myUnila"?
7. **Mobile app**: prioritas Phase 3 atau pakai Moodle Mobile branded saja?
8. **Migrasi data lama**: kalau ada V-Class lama, butuh migrasi materi/user?
9. **Dosen yang sudah pakai Google Classroom / Edmodo personal**: ada plan migrasi?
10. **Akreditasi BAN-PT**: kapan submit dokumen LED yg butuh data LMS?

---

## 13. Quick Win — Apa yang Bisa Dimulai Minggu Depan

Tanpa nunggu approval penuh, beberapa hal bisa langsung dikerjakan:

- ✅ **Hari 1-3**: Provision VM6 dedicated + install Moodle 4.5 (1 dev DevOps)
- ✅ **Hari 4-7**: Plugin auth_oidc + test SSO ke 1 dummy user (1 dev backend)
- ✅ **Minggu 2**: Sketch ER diagram + write spec sync job (1 dev arch)
- ✅ **Minggu 2**: Mockup wrapper UI dashboard mhs + dosen (1 dev frontend)
- ✅ **Minggu 3**: Demo internal ke pimpinan dengan dummy data (full team)

Jika setelah demo OKE → langsung jalan MVP 4 bulan.

---

## 14. Kesimpulan

**LMS myUnila layak dibangun** mengingat:
- Sudah ada placeholder V-Class
- Skema pdut sudah punya `kode_vclass`
- Ekosistem myUnila siap (auth, organisasi, peran)
- Demand mahasiswa-dosen tinggi

**Rekomendasi**: **Hybrid Moodle + myUnila** (Opsi C), MVP 4 bulan, pilot 1 fakultas, expand semester berikutnya.

**Total estimasi**:
- MVP: 4 bulan, 4 FTE, ~Rp 250-300 juta (gaji tim + infra) — sebagian besar pakai resource existing
- Phase 2 + 3: tambahan 8 bulan, sama tim, biaya tambahan untuk integrasi vendor opsional (Turnitin, BBB scaling)

**Next Step**: pitch ke Wakil Rektor 1 (Bidang Akademik) + UPT TIK Direktur untuk approval.

---

**Dokumen ini brainstorming internal UPT TIK — perlu validasi & iterasi sebelum eksekusi.**
**File**: `/var/www/my-unila/docs/operations/Plan_LMS_myUnila.{md,pdf}`
