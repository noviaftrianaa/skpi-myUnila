# Panduan Deploy Update myUnila — 11 Commit (10 Mei 2026)

**Range commit**: `ad257736f..4775508cd`
**Target lingkungan**: VM5 Staging → VM1/VM2 Production (sequential)
**Estimasi total waktu**: ~45 menit per VM (rebuild + DDL + smoke test)

---

## 1. Ringkasan Update

| # | Commit | Modul | Dampak |
|---|---|---|---|
| 1 | `5810978ff` | DDL Phase 1 Akses Lifecycle | DDL pdut |
| 2 | `ac2208dcf` | auth-service Phase 1 | Container auth |
| 3 | `d9cf4b66b` | Frontend manakses Phase 1 | Container frontend |
| 4 | `c54bfbdb8` | RBAC Matrix dedupe | Container frontend |
| 5 | `196dba7a1` | dashboard-service Data Unila + KKN | Container dashboard |
| 6 | `5672c5bb5` | Frontend Data Unila + KKN | Container frontend |
| 7 | `4cb861769` | Konsistensi data Pimpinan vs Data Unila | Container dashboard |
| 8 | `c54259a28` | Dashboard Pimpinan tune-up | Container frontend |
| 9 | `6c820f125` | IKU drilldown + IKU 5 fix | Container dashboard + frontend |
| 10 | `09ed45ed8` | Mahasiswa public profile + foto privacy | Container public + frontend |
| 11 | `4775508cd` | Docs PDF | (no rebuild) |

**Container yang harus rebuild**: `auth`, `dashboard`, `public`, `frontend` (4 layanan)
**DDL yang harus apply**: 5 file di pdut/pdut_staging

---

## 2. Step 1 — Pull Latest Code

Lakukan di setiap VM yang punya repo:

```bash
cd /var/www/my-unila

# Cek status local (kalau ada perubahan, stash dulu)
git status

# Kalau ada uncommitted changes:
#   git stash push -m "before-pull-2026-05-10"

# Pull
git pull origin master

# Verifikasi sampai commit terbaru:
git log --oneline -1
# Output expected: 4775508cd docs: planning + testing guide + laporan IKU5
```

**Verifikasi 11 commit baru ter-pull:**

```bash
git log --oneline ad257736f..HEAD | wc -l
# Output: 11
```

---

## 3. Step 2 — Apply DDL ke pdut_staging (atau pdut production)

**LOKASI FILE**: `data-model/script/sqlserver/man_akses/`
**EKSEKUSI**: Via SSMS atau `sqlcmd` — koneksi ke `192.168.123.119,1433`

### 3.1 Urutan eksekusi DDL (WAJIB ber-urutan, idempotent semua):

```bash
cd data-model/script/sqlserver/man_akses
ls -1 alter_peran_add_a_peran_identitas.sql \
      create_aplikasi_default_role.sql \
      seed_aplikasi_default_role.sql \
      alter_role_pengguna_add_tgl_kadaluarsa.sql \
      insert_menu_kandidat_akses.sql
```

| # | File | Fungsi |
|---|---|---|
| 1 | `alter_peran_add_a_peran_identitas.sql` | Tambah kolom `a_peran_identitas` di `man_akses.peran` + flag = 1 utk peran 39/46/111 (Mhs/Dosen/Tendik) |
| 2 | `create_aplikasi_default_role.sql` | Buat tabel `man_akses.aplikasi_default_role` + index + FK |
| 3 | `seed_aplikasi_default_role.sql` | Seed 35+ row default mapping (idempotent — skip kalau sudah ada) |
| 4 | `alter_role_pengguna_add_tgl_kadaluarsa.sql` | Tambah kolom `tgl_kadaluarsa` di `man_akses.role_pengguna` + index |
| 5 | `insert_menu_kandidat_akses.sql` | Register menu sidebar "Kandidat Review Akses" + "Bulk Import Akses" |

### 3.2 Eksekusi via SSMS (UI):

1. Connect ke server: `192.168.123.119`
2. Buka file SQL satu per satu, **F5 (Execute)**
3. Setelah tiap file: cek output panel — pastikan PRINT message "✓" muncul
4. Kalau "skip" muncul → idempotent OK, lanjut

### 3.3 Eksekusi via sqlcmd CLI:

```bash
SQLDB=pdut_staging   # atau pdut untuk production
SQLPW='Makinjaya!2myunila'
SQLUSER='mizarzulmi'
SQLHOST='192.168.123.119'

for sql in alter_peran_add_a_peran_identitas \
           create_aplikasi_default_role \
           seed_aplikasi_default_role \
           alter_role_pengguna_add_tgl_kadaluarsa \
           insert_menu_kandidat_akses; do
  echo ">>> Apply $sql.sql..."
  sqlcmd -S "$SQLHOST,1433" -U "$SQLUSER" -P "$SQLPW" -d "$SQLDB" -C \
         -i "data-model/script/sqlserver/man_akses/$sql.sql"
  echo
done
```

### 3.4 Verifikasi DDL berhasil:

```sql
-- 1. Cek kolom a_peran_identitas
SELECT id_peran, nm_peran, a_peran_identitas
FROM man_akses.peran
WHERE id_peran IN (39, 46, 111);
-- Expected: 3 row dengan a_peran_identitas = 1

-- 2. Cek tabel aplikasi_default_role
SELECT COUNT(*) AS total, COUNT(DISTINCT id_aplikasi) AS unique_apps
FROM man_akses.aplikasi_default_role;
-- Expected: total >= 30, unique_apps >= 15

-- 3. Cek kolom tgl_kadaluarsa
SELECT TOP 1 tgl_kadaluarsa FROM man_akses.role_pengguna;
-- Expected: SQL berhasil, kolom ada (NULL OK)

-- 4. Cek menu sidebar baru
SELECT nm_menu, nm_file FROM man_akses.menu
WHERE nm_file IN (
  '/dashboard/manajemen-akses/manajemen/kandidat-akses',
  '/dashboard/manajemen-akses/manajemen/import-akses'
);
-- Expected: 2 row
```

---

## 4. Step 3 — Rebuild Container

### 4.1 Di VM5 (staging):

```bash
cd /var/www/my-unila/deployment/production/vm5-staging

# Rebuild satu-per-satu (sequential — supaya bisa monitor error per service)
./scripts/rebuild-service.sh auth
./scripts/rebuild-service.sh dashboard
./scripts/rebuild-service.sh public
./scripts/rebuild-service.sh frontend

# Atau parallel kalau yakin:
# ./scripts/rebuild-service.sh auth dashboard public frontend
```

### 4.2 Di VM1 (production frontend+auth+gateway):

```bash
cd /var/www/my-unila/deployment/production/vm1-frontend-kong
./scripts/rebuild-service.sh frontend
./scripts/rebuild-service.sh kong   # kalau Kong route berubah (tidak di update ini)
```

### 4.3 Di VM2 (production backend services):

```bash
cd /var/www/my-unila/deployment/production/vm2-backend
./scripts/rebuild-service.sh auth
./scripts/rebuild-service.sh dashboard
./scripts/rebuild-service.sh public
```

### 4.4 Verifikasi semua container healthy:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}" | grep staging
# Semua "(healthy)" — wait sampai 30-60 detik kalau masih starting
```

---

## 5. Step 4 — Clear Redis Cache

Penting karena dashboard pimpinan & data unila punya cache 30-60 menit:

```bash
docker exec myunila-redis-staging redis-cli --scan --pattern "*beranda*" \
  | xargs -r -L 100 docker exec -i myunila-redis-staging redis-cli DEL

docker exec myunila-redis-staging redis-cli --scan --pattern "*data-unila*" \
  | xargs -r -L 100 docker exec -i myunila-redis-staging redis-cli DEL

docker exec myunila-redis-staging redis-cli --scan --pattern "*iku*" \
  | xargs -r -L 100 docker exec -i myunila-redis-staging redis-cli DEL
```

---

## 6. Step 5 — Smoke Test (Otomatis)

```bash
# HTTP probe semua endpoint baru (semua harus 200 atau 401)
ROUTES=(
  "frontend:3000:/dashboard/manajemen-akses/manajemen/kandidat-akses"
  "frontend:3000:/dashboard/manajemen-akses/manajemen/import-akses"
  "frontend:3000:/dashboard/data-unila/kkn"
  "frontend:3000:/dashboard/data-unila/akademik/prodi"
  "frontend:3000:/dashboard/pimpinan/iku"
  "frontend:3000:/dashboard/pimpinan/rasio"
  "frontend:3000:/mahasiswa/test-public-id"
)

for route in "${ROUTES[@]}"; do
  IFS=':' read -r container port path <<< "$route"
  code=$(docker exec "myunila-${container}-staging" \
    wget -O /dev/null -S "http://0.0.0.0:${port}${path}" 2>&1 \
    | grep "HTTP/" | awk '{print $2}' | head -1)
  printf "  %-60s → HTTP %s\n" "$path" "$code"
done
# Expected: semua HTTP 200
```

---

## 7. Step 6 — Manual UAT (Urutan Testing)

### 7.1 Test Phase 1 Akses Lifecycle (~40 menit)

Ikuti panduan terpisah: `docs/operations/Step_Testing_Phase1_Akses_Lifecycle.pdf`

Quick checklist:
- [ ] Login Developer → Sidebar Manajemen Akses ada 2 menu baru (Kandidat Review Akses, Bulk Import Akses)
- [ ] Edit Aplikasi (mis. SIAKADU) → tab "Akses Default" muncul, 3 kartu Mhs/Dosen/Tendik
- [ ] Daftar Aplikasi → kebab menu → "Akses Pengguna" → page read-only tampil
- [ ] Kandidat Review → klik "Alumni Lulus" → ada ±48k row, sample AMANDA PUTRA / APRILIA / MALIKHA
- [ ] Klik 2-3 baris → klik "Cabut Role" → modal alasan → Cabut → toast sukses
- [ ] Klik "Tanpa Tgl Kadaluarsa" → bulk select → "Set Tgl Kadaluarsa" → modal pre-fill +1 tahun → Simpan
- [ ] Bulk Import → pilih SIMBAK → Download Template → CSV ter-download dengan daftar peran valid

### 7.2 Test Konsistensi Data Pimpinan ↔ Data Unila (~10 menit)

Buka 2 tab paralel:
- Tab A: `/dashboard/pimpinan` (root)
- Tab B: `/dashboard/data-unila`

Cek angka match:
- [ ] Mahasiswa Total (192,839)
- [ ] Mahasiswa Aktif (37,804)
- [ ] Total SDM (1,755 = Dosen 1,683 + Tendik 72)
- [ ] Prodi Aktif (199)
- [ ] Prodi Unggul (59)
- [ ] MoU Aktif (987) + Mitra Unik (167)

### 7.3 Test Dashboard Pimpinan tune-up (~15 menit)

Login → buka tiap halaman:

- [ ] `/pimpinan` (root) — hero gradient + 4 StatCard + chart
- [ ] `/pimpinan/iku` — 4 StatCard (Total/Tercapai/Belum/Achievement) + 11 IKU card
  - Klik IKU 1 → Modal detail tab "Drilldown" → list 9 fakultas
  - Klik fakultas Kedokteran → expand 4 prodi (Kedokteran/Farmasi/dll)
- [ ] `/pimpinan/rasio` — sidebar muncul (sebelumnya tidak), header style konsisten
- [ ] `/pimpinan/publikasi` — 4 StatCard (sebelumnya 1)
- [ ] `/pimpinan/keuangan` — 4 StatCard (sebelumnya 2)
- [ ] `/pimpinan/litabmas` — 4 StatCard
- [ ] `/pimpinan/pegawai` — 4 StatCard + FilterPanel (semester)

### 7.4 Test IKU 5 sudah punya angka real (~3 menit)

- [ ] Buka `/pimpinan/iku` (default tahun 2025)
- [ ] IKU 5 = ±45.1% (sebelumnya 0%)
- [ ] Klik card IKU 5 → tab Drilldown → 8 fakultas dengan persentase berbeda
- [ ] Top: Ekonomi & Bisnis 178%, ISIPOL 147%

### 7.5 Test Mahasiswa Public Profile + Foto Privacy (~5 menit)

**Logout dulu (atau Incognito):**
- [ ] Buka `/mahasiswa/{enc-id-mahasiswa}` → page langsung tampil (TIDAK redirect ke login)
- [ ] Foto = placeholder gradient biru transparan + caption "🔒 Foto privat — Login untuk melihat"
- [ ] Data NIM/Nama/Prodi/Status/IPK semester tampil normal

**Login → Refresh page mahasiswa yang sama:**
- [ ] Foto real ter-load dari MinIO (bukan placeholder)

**Test dosen (logged out):**
- [ ] Buka `/dosen/{enc-id}` → foto + data full tampil (academic public profile)

### 7.6 Test Data Unila tune-up (~10 menit)

- [ ] `/data-unila/akademik/prodi` — 4 StatCard (Total/Unggul/S1/Pascasarjana) + Filter Fakultas + Export Excel
- [ ] `/data-unila/akademik/akreditasi` — 4 StatCard (Total/Unggul/Akan Expire/Expired) — perhatikan **22 expired** (perlu re-akreditasi)
- [ ] `/data-unila/akademik/matkul` — 4 StatCard
- [ ] `/data-unila/tridarma/prestasi` — 4 StatCard + Filter Tahun
- [ ] `/data-unila/kkn` — page baru, 4 StatCard (47k mhs / 6k kelompok / 4k desa / 18 periode), Filter Periode + Kabupaten
- [ ] Sidebar — menu "Data KKN" muncul antara Akademik & Kerjasama

---

## 8. Rollback Plan (kalau ada masalah)

### 8.1 Code rollback:
```bash
git revert ad257736f..HEAD  # revert semua 11 commit
git push origin master
# Re-rebuild container affected
```

### 8.2 DDL rollback (urutan terbalik):

```sql
-- 1. Drop menu sidebar baru
DELETE FROM man_akses.menu_role
WHERE id_menu IN (
  SELECT id_menu FROM man_akses.menu
  WHERE nm_file LIKE '%/kandidat-akses' OR nm_file LIKE '%/import-akses'
);
DELETE FROM man_akses.menu
WHERE nm_file LIKE '%/kandidat-akses' OR nm_file LIKE '%/import-akses';

-- 2. Drop kolom tgl_kadaluarsa (kalau perlu — biasanya cukup biarkan, NULL aman)
DROP INDEX IF EXISTS idx_role_pengguna_kadaluarsa ON man_akses.role_pengguna;
ALTER TABLE man_akses.role_pengguna DROP COLUMN tgl_kadaluarsa;

-- 3. Drop tabel aplikasi_default_role
DROP TABLE IF EXISTS man_akses.aplikasi_default_role;

-- 4. Drop kolom a_peran_identitas
ALTER TABLE man_akses.peran DROP COLUMN a_peran_identitas;
```

---

## 9. Estimasi Waktu (per VM)

| Step | Waktu |
|---|---|
| 1. Pull code | 1 menit |
| 2. Apply 5 DDL | 3-5 menit |
| 3. Rebuild 4 container | 15-20 menit |
| 4. Clear Redis cache | 1 menit |
| 5. Smoke test HTTP | 1 menit |
| 6. Manual UAT (Step 7.1-7.6) | 40-50 menit |
| **TOTAL** | **~60-75 menit** |

---

## 10. Reporting Issue

Jika ada bug saat testing, format:

```
[BUG #X]
Step: [contoh: 7.3 - klik IKU 1 fakultas]
Browser: Chrome 130
Expected: list prodi expand
Actual: tidak respond / 500 error
Console: F12 → Console tab — copy error
Network: F12 → Network — request gagal copy URL + response
```

Kirim ke:
- Telegram chat
- Atau https://helpdesktik.unila.ac.id

---

## 11. Sign-Off Checklist

Setelah semua step selesai:

- [ ] **VM5 Staging**: 11 commit terpasang, 5 DDL apply, 4 container healthy
- [ ] **VM1 Production**: deployed (kalau staging signed)
- [ ] **VM2 Production**: deployed (kalau staging signed)
- [ ] Smoke test all green
- [ ] UAT 6 scenario PASS
- [ ] Tidak ada regression di modul lain (SIMBAK, SIRANDU, IKU lain)

**Tester**: ______________________
**Tanggal**: ______________________
**Tanda tangan**: ______________________

---

**Versi dokumen**: 1.0 — 2026-05-10
**Disusun**: UPT TIK Universitas Lampung
**File**: `docs/operations/Step_Deploy_Update_2026-05-10.{md,pdf}`
