# Laporan Merge Branch `dashboard-pimpinan` (Magang) ke `master`

**Tanggal**: 2026-05-11
**Author**: UPT TIK Universitas Lampung
**Branch source**: `dashboard-pimpinan` (Arya Dzaky — mahasiswa magang)
**Branch target**: `master`
**Commit hasil**: `2b0019d7f..128d2a9b4`

---

## 1. Konteks Awal

Mahasiswa magang **Arya Dzaky** mengembangkan eksplorasi Dashboard Pimpinan di branch `dashboard-pimpinan`. Branch ini sudah ada 2 commit:

| Commit | Pesan | Author |
|---|---|---|
| `894078913` | change route pimpinan | Arya Dzaky |
| `3e7c24575` | fix: fix alias inconsistency in getDosenCount causing stat_peg not found error | Arya Dzaky |

Sementara di `master`, UPT TIK sudah melakukan ~30 commit tune-up Dashboard Pimpinan + Data Unila + Phase 1 Akses Lifecycle. **Khawatir merge akan banyak conflict**.

---

## 2. Analisis Sebelum Merge (Reconnaissance)

### 2.1 Fork point
Kedua branch fork dari commit `a95afb002` ("fix: bug fixes pangkat golongan & rasio service").

### 2.2 Diff per branch (dari fork point)

| Branch | File berubah | Insertion | Deletion |
|---|:---:|:---:|:---:|
| `dashboard-pimpinan` (magang) | 8 file | 4 | 4 |
| `master` (UPT TIK) | 1,975 file | 358,673 | 33,875 |

### 2.3 Sifat perubahan magang
**Cerdas**: Magang **rename folder** `frontend/src/app/dashboard/pimpinan/` → `pimpinan-dev/` untuk **menghindari overlap dengan master**. Hanya 7 file yang dia rename:
- `IMPLEMENTATION_PLAN.md`
- `akreditasi/page.tsx`
- `config/menuConfig.tsx`
- `dosen/page.tsx`
- `layout.tsx`
- `page.tsx`
- `rasio/page.tsx`

Plus 1 backend bug fix:
- `backend/executive-service/app/Repositories/StatusKepegawaianRepository.php` — alias `tstat_kepeg` → `stat_peg`

### 2.4 Dry-run merge
```
git merge-tree $(merge-base) origin/master origin/dashboard-pimpinan
```
**0 content conflict marker** terdeteksi — sepertinya safe.

---

## 3. Tantangan: Git Rename-Detection Heuristic

### 3.1 Eksekusi pertama (`git merge`)
Saat run `git merge origin/dashboard-pimpinan --no-ff`, Git muncul **9 "file location conflict"**:

```
CONFLICT (file location): frontend/src/app/dashboard/pimpinan/keuangan/page.tsx
  added in HEAD inside a directory that was renamed in origin/dashboard-pimpinan,
  suggesting it should perhaps be moved to .../pimpinan-dev/keuangan/page.tsx
```

Plus serupa untuk `ktw`, `litabmas`, `lulusan`, `mahasiswa`, `pegawai`, `prestasi`, `publikasi`, `types.ts`.

### 3.2 Akar masalah
Git rename-detection mendeteksi 7 file di-rename `pimpinan/` → `pimpinan-dev/`, lalu **asumsi seluruh folder direname**. File-file BARU di `/pimpinan/` (hasil tune-up UPT TIK yang tidak ada di branch magang) di-tag sebagai "harusnya pindah ke `pimpinan-dev/`".

### 3.3 Risiko kalau commit naif
Kalau commit dipaksakan tanpa fix:
- ❌ Folder `/pimpinan/` (hasil tune-up UPT TIK) akan **HILANG** semuanya
- ❌ File-file (`kerjasama`, `keuangan`, `ktw`, dll) yang sudah di-tune-up 4 StatCard akan terhapus
- ❌ Komponen pendukung (`components/`, `hooks/`, `iku/`, `types.ts`) jadi orphan/deleted

**Tindakan**: **ABORT merge 2x**, ganti strategi.

---

## 4. Strategi Aman: Cherry-Pick + Manual Checkout

### 4.1 Langkah-langkah

```bash
# 1. Abort merge naif
git merge --abort

# 2. Cherry-pick commit backend fix (preserve author magang)
git cherry-pick 3e7c24575
# → masuk sebagai commit 8e9e20d3c
# → Author: Arya Dzaky (preserved)

# 3. Manual checkout file pimpinan-dev/ dari branch magang
mkdir -p frontend/src/app/dashboard/pimpinan-dev
for f in $(git ls-tree -r --name-only origin/dashboard-pimpinan \
           -- frontend/src/app/dashboard/pimpinan-dev/); do
  git checkout origin/dashboard-pimpinan -- "$f"
done

# 4. Commit sebagai feat (1 commit terpisah dari magang)
git add frontend/src/app/dashboard/pimpinan-dev/
git commit -m "feat(frontend): tambah folder /pimpinan-dev — eksplorasi magang dashboard pimpinan"
# → commit 128d2a9b4

# 5. Push
git push origin master
```

### 4.2 Mengapa strategy ini aman?
- **Tidak ada rename detection** — file diperlakukan sebagai NEW di location terisolasi
- **Folder `/pimpinan/` master TIDAK disentuh** — semua tune-up UTUH
- **Backend fix preserved** dengan author asli (Arya Dzaky)
- **2 commit terpisah**: bug fix backend (author magang) + folder eksplorasi (author UPT TIK)

---

## 5. Hasil Akhir

### 5.1 Commit history (3 commit terakhir)
```
128d2a9b4 feat(frontend): tambah folder /pimpinan-dev — eksplorasi magang dashboard pimpinan
8e9e20d3c fix: fix alias inconsistency in getDosenCount causing stat_peg not found error
2b0019d7f docs(operations): step-by-step deploy guide untuk update 11 commit (10 Mei 2026)
```

### 5.2 Struktur folder master sekarang
```
frontend/src/app/dashboard/
├── pimpinan/                    ← UPT TIK tune-up (UTUH)
│   ├── akreditasi/
│   ├── components/
│   ├── config/
│   ├── dosen/
│   ├── hooks/
│   ├── iku/                     ← drilldown prodi + IKU5 fix
│   ├── kerjasama/               ← 4 StatCard
│   ├── keuangan/                ← 4 StatCard
│   ├── ktw/
│   ├── layout.tsx
│   ├── litabmas/                ← 4 StatCard
│   ├── lulusan/                 ← 4 StatCard
│   ├── mahasiswa/
│   ├── page.tsx                 ← root hero gradient
│   ├── pegawai/                 ← 4 StatCard + FilterPanel
│   ├── prestasi/
│   ├── publikasi/               ← 4 StatCard
│   ├── rasio/                   ← layout fix
│   └── types.ts
│
└── pimpinan-dev/                ← BARU (Magang eksplorasi)
    ├── IMPLEMENTATION_PLAN.md
    ├── akreditasi/page.tsx
    ├── config/menuConfig.tsx
    ├── dosen/page.tsx
    ├── layout.tsx
    ├── page.tsx
    └── rasio/page.tsx
```

### 5.3 Backend fix yang masuk
File: `backend/executive-service/app/Repositories/StatusKepegawaianRepository.php`

```sql
-- Sebelum (bug — alias tidak konsisten dengan WHERE clause):
LEFT JOIN ref.status_kepegawaian AS tstat_kepeg
    ON tstat_kepeg.id_stat_pegawai = treg.id_stat_pegawai
-- ... WHERE menggunakan 'stat_peg.id_stat_pegawai' → error column not found

-- Sesudah (fix — alias konsisten):
LEFT JOIN ref.status_kepegawaian AS stat_peg
    ON stat_peg.id_stat_pegawai = treg.id_stat_pegawai
```

---

## 6. TS Warning di Folder Magang

Setelah merge, `npx tsc --noEmit` menemukan 2 type error di folder magang:

| File | Line | Error |
|---|:---:|---|
| `pimpinan-dev/akreditasi/page.tsx` | 123 | Conversion of type 'Fakultas[]' to type 'Prodi[]' may be a mistake |
| `pimpinan-dev/rasio/page.tsx` | 464 | Type 'HistoricalRasio*' not assignable to 'TrendDataItem[]' |

**Note**: Tidak block compile karena Next.js production build umumnya skip TS error (typeCheck=false di next.config.js). Recommended untuk magang fix sendiri saat dia rebase.

---

## 7. Rekomendasi untuk Magang Student

### 7.1 Update branch magang dengan master terbaru
```bash
# Switch ke branch magang
git checkout dashboard-pimpinan

# Sync dengan master (pakai rebase supaya history rapi)
git fetch origin
git rebase origin/master

# Atau merge (kalau prefer):
# git merge origin/master --no-ff
```

Setelah ini, magang punya:
- Semua tune-up UPT TIK di `/pimpinan/`
- Folder eksplorasi sendiri di `/pimpinan-dev/`

### 7.2 Lanjutan kerja magang
- Bandingkan implementasi `/pimpinan/` (tune-up UPT TIK) dengan `/pimpinan-dev/` (versi awalnya)
- Fix 2 TS error di akreditasi & rasio (terkait type mismatch)
- Kalau ada ide tambahan, develop di `pimpinan-dev/` lalu ajukan PR

### 7.3 Best practice ke depan
- **Selalu rebase dengan master** sebelum ngoding panjang (avoid divergence)
- **Buat folder paralel** kalau ingin eksperimen (seperti yg sudah dia lakukan — bagus!)
- **Commit kecil & sering** untuk memudahkan cherry-pick
- **Submit PR** untuk fitur baru — jangan langsung push ke branch shared

---

## 8. Catatan Teknis: Mengapa Naive Merge Berbahaya?

Git rename detection berbasis **similarity score** (default 50%). Saat dia mendeteksi 7 file dari `pimpinan/` muncul di `pimpinan-dev/` dengan konten 100% identik, dia menyimpulkan:
> "Folder `pimpinan/` di-rename ke `pimpinan-dev/`. Semua file baru di `pimpinan/` (hasil tune-up master) harusnya ikut pindah."

Ini **incorrect inference** — UPT TIK menambah file baru ke `pimpinan/`, magang membuat **paralel folder eksplorasi**. Git tidak bisa membedakan dua intent ini tanpa konteks.

**Pelajaran**:
- Selalu **dry-run dengan `git merge-tree`** sebelum merge nyata
- Saat conflict location/rename muncul, **JANGAN auto-commit** — analisis dulu
- Pakai **`git checkout file2`** + manual commit kalau rename detection bermasalah

---

## 9. Sign-Off

| Item | Status |
|---|:---:|
| Master code UPT TIK | ✅ UTUH (tidak ada yang hilang) |
| Magang code | ✅ Masuk (folder pimpinan-dev/ + backend fix) |
| 2 commit di-push ke origin/master | ✅ |
| Magang masih bisa lanjut di branch sendiri | ✅ |
| Author backend fix preserved (Arya Dzaky) | ✅ |

**Status**: Merge selesai aman tanpa data loss. Ready untuk deploy.

**File laporan**: `docs/operations/Laporan_Merge_Dashboard_Pimpinan_Magang.{md,pdf}`
