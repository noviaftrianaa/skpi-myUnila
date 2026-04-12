# Rencana Perbaikan SIMBAK — Tahapan Implementasi

Tanggal: 7 April 2026
Berdasarkan: `07-analisis-kesesuaian-alur-vs-implementasi.md`

Dokumen ini berisi tahapan perbaikan SIMBAK agar implementasi sesuai dengan alur layanan yang didokumentasikan di `analisa-awal/02-alur-layanan-simba-revisi.md`. Setiap tahap dapat dieksekusi secara independen dan berurutan.

---

## Ringkasan Tahapan & Progress

| Tahap | Nama | Fokus | Status |
|-------|------|-------|--------|
| 1 | Integrasi Data PDUT | Enrichment data_pemohon dari SQL Server (SIAKADU) | [~] 6/9 kode selesai, perlu test |
| 2 | Multi-Level Approval | Approval chain berdasarkan tahapan_layanan | [~] 15/18 kode selesai, perlu test |
| 3 | Perbaikan Surat Mandiri | Upload SK, validasi herregistrasi | [~] 10/12 kode selesai, perlu test |
| 4 | Perbaikan Permohonan Akademik | Field alih program, semester cuti, validasi syarat | [~] 12/14 kode selesai, perlu test |
| 5 | Perbaikan Batch Administrasi | Tarik kandidat PDUT, kriteria HMM/PS, upload SK | [~] 15/19 kode selesai, perlu test |
| 6 | Perbaikan Monitoring & Dashboard | Lulusan, filter, export, indikator tepat waktu | [~] 13/16 kode selesai, perlu test |
| 7 | Polish UI & UX | Modern UI, responsive, loading states, empty states | [x] 22/22 selesai |

---

## Tahap 1: Integrasi Data PDUT (Enrichment Data Pemohon)

### Masalah
- `PengajuanController::store()` hanya menyimpan field minimal ke `data_pemohon` (nim, nama)
- Data IPK, SKS, semester, status registrasi, status pembayaran semua kosong
- Frontend menampilkan "-" untuk semua data akademik mahasiswa

### Tujuan
Saat mahasiswa membuat pengajuan, sistem otomatis mengambil snapshot data akademik lengkap dari PDUT (SQL Server) dan menyimpannya ke `layanan.data_pemohon`.

### Query PDUT yang Dibutuhkan
```sql
-- Dari SIAKADU schema di SQL Server (pdut)
SELECT
    pd.id_pd,
    rp.nipd AS nim,
    pd.nm_pd AS nm_mahasiswa,
    pd.tmpt_lahir AS tempat_lahir,
    pd.tgl_lahir,
    pd.jk AS jenis_kelamin,
    sms.id_fak_unila AS id_fakultas,
    -- nm_fakultas perlu join ke tabel fakultas/unit
    sms.id_sms AS id_prodi,
    sms.nm_lemb AS nm_prodi,
    jp.id_jenj_didik,
    jp.nm_jenj_didik AS nm_jenjang,
    YEAR(rp.tgl_masuk_sp) AS angkatan,
    km.smt AS semester_aktif,      -- dari kuliah_mhs semester terakhir
    rp.ipk,
    rp.sks_lulus,
    -- masa_studi_semester dihitung dari semester masuk
    sm.id_stat_mhs AS status_mahasiswa,
    km.id_stat_mhs AS status_registrasi
    -- status_pembayaran dari spp_mhs
FROM siakadu.reg_pd rp
JOIN siakadu.peserta_didik pd ON pd.id_pd = rp.id_pd
JOIN siakadu.sms sms ON sms.id_sms = rp.id_sms
JOIN siakadu.jenjang_pendidikan jp ON jp.id_jenj_didik = sms.id_jenj_didik
LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
LEFT JOIN siakadu.kuliah_mhs km ON km.id_reg_pd = rp.id_reg_pd
    AND km.id_smt = (SELECT MAX(id_smt) FROM siakadu.kuliah_mhs WHERE id_reg_pd = rp.id_reg_pd)
WHERE rp.nipd = :nim
```

### File yang Diubah

**Backend:**
1. **`app/Repositories/PdutRepository.php`** (BARU)
   - Method `getStudentByNim(string $nim): ?array` — query PDUT via koneksi `sqlsrv`
   - Method `getStudentPaymentStatus(string $idRegPd, string $idSmt): ?array` — cek status UKT
   - Method `getFakultasName(string $idFakUnila): ?string` — lookup nama fakultas

2. **`app/Http/Controllers/Api/Layanan/PengajuanController.php`**
   - Ubah `store()`: setelah create pengajuan, panggil `PdutRepository::getStudentByNim()` untuk enrich `data_pemohon` dengan data lengkap
   - Tambah endpoint `GET /layanan/my-profile` untuk preview data akademik sebelum submit

3. **`app/Repositories/PengajuanRepository.php`**
   - Ubah `createDataPemohon()`: pastikan semua 22 field di-populate dari hasil query PDUT

**Frontend:**
- Tidak ada perubahan struktur, tapi data akan otomatis muncul karena backend sudah mengirim data lengkap

### Checklist Tahap 1

- [x] 1.1 Buat `app/Repositories/PdutRepository.php` dengan method `getStudentByNim()`
- [x] 1.2 Tambah method `getStudentPaymentStatus()` di `PdutRepository`
- [x] 1.3 Tambah method `getFakultasName()` di `PdutRepository`
- [x] 1.4 Ubah `PengajuanController::store()` — panggil `PdutRepository` untuk enrich data_pemohon
- [x] 1.5 Tambah endpoint `GET /layanan/my-profile` untuk preview data akademik
- [x] 1.6 Ubah `PengajuanRepository::createDataPemohon()` — populate semua 22 field
- [ ] 1.7 Test: buat pengajuan → cek data_pemohon terisi lengkap di database
- [ ] 1.8 Test: frontend menampilkan data akademik real (bukan "-")
- [ ] 1.9 Test: jika PDUT down, pengajuan tetap bisa dibuat dengan data minimal + warning

---

## Tahap 2: Multi-Level Approval Chain

### Masalah
- `PersetujuanController` hanya punya 1 level approval dengan role hardcoded `pejabat`
- Docs dan seed data mendefinisikan multi-tahapan:
  - **PM-CUTI/PM-UNDUR**: mahasiswa → admin_fakultas → admin_bak → pejabat → admin_bak (terbit)
  - **PM-ALIH**: mahasiswa → admin_fakultas (asal) → admin_fakultas (tujuan) → admin_bak → pejabat → admin_bak (terbit)
- Backend tidak membaca `ref.tahapan_layanan` untuk menentukan tahapan selanjutnya

### Tujuan
Approval mengikuti urutan tahapan dari `ref.tahapan_layanan`. Setiap aktor hanya bisa memproses pengajuan yang berada di tahapan miliknya.

### Desain

```
Pengajuan masuk → Cek tahapan saat ini (berdasarkan status + kode_role)
                → Validasi aktor = kode_role tahapan saat ini
                → Proses (verifikasi/approve/reject)
                → Update status ke status_selesai tahapan tersebut
                → Catat riwayat
```

### File yang Diubah

**Backend:**
1. **`app/Services/WorkflowService.php`** (BARU)
   - `getCurrentTahapan(pengajuan): tahapan` — cari tahapan aktif berdasarkan status pengajuan
   - `getNextTahapan(pengajuan): ?tahapan` — tahapan selanjutnya berdasarkan urutan
   - `canActorProcess(pengajuan, user): bool` — validasi kode_role user vs tahapan
   - `advanceToNextStage(pengajuan, actor, catatan): void` — transisi status + catat riwayat

2. **`app/Http/Controllers/Api/Layanan/VerifikasiController.php`**
   - Refactor `verifikasi()`: gunakan `WorkflowService` untuk menentukan status tujuan dari `tahapan_layanan`, bukan hardcode per kategori
   - `mintaPerbaikan()`: tetap, tapi validasi bahwa aktor punya hak di tahapan saat ini
   - `terbitkan()`: hanya bisa dipanggil di tahapan terakhir

3. **`app/Http/Controllers/Api/Layanan/PersetujuanController.php`**
   - Refactor `approve()`: gunakan `WorkflowService`, set status dari `tahapan_layanan.status_selesai`
   - Refactor `reject()`: tetap ke `ditolak`, tapi catat di tahapan mana ditolak
   - Refactor `queue()`: filter berdasarkan `kode_role` user, hanya tampilkan pengajuan yang ada di tahapan user

4. **`app/Repositories/PengajuanRepository.php`**
   - Tambah method `getByStatusAndRole(status, kodeRole, filters): paginated` — untuk queue per role

**Frontend:**
5. **`frontend/src/app/dashboard/sim-bak/admin/verifikasi/[id]/page.tsx`**
   - Tampilkan info tahapan saat ini (nama tahapan, urutan ke-X dari Y)
   - Tampilkan siapa aktor selanjutnya setelah verifikasi
   - Tombol aksi muncul hanya jika user punya role yang sesuai dengan tahapan

6. **`frontend/src/app/dashboard/sim-bak/admin/persetujuan/[id]/page.tsx`**
   - Tampilkan approval chain visual (stepper horizontal): tahapan 1 → 2 → 3 → ... dengan highlight tahapan aktif
   - Tampilkan history persetujuan sebelumnya (siapa yang sudah approve/reject di tahapan sebelumnya)
   - Tampilkan info "Anda adalah approver tahap X dari Y"

### Checklist Tahap 2

- [x] 2.1 Buat `app/Services/WorkflowService.php` dengan method `getCurrentTahapan()`
- [x] 2.2 Tambah method `getNextTahapan()` di WorkflowService
- [x] 2.3 Tambah method `canActorProcess()` dan `findTahapanForActor()` di WorkflowService
- [x] 2.4 Tambah method `getProgress()` di WorkflowService (untuk stepper UI)
- [x] 2.5 Refactor `VerifikasiController::verifikasi()` — gunakan WorkflowService
- [x] 2.6 Refactor `VerifikasiController::mintaPerbaikan()` — validasi role aktor
- [x] 2.7 Refactor `VerifikasiController::terbitkan()` — hanya di tahapan terakhir
- [x] 2.8 Refactor `PersetujuanController::approve()` — gunakan WorkflowService
- [x] 2.9 Refactor `PersetujuanController::reject()` — catat tahapan penolakan
- [x] 2.10 Refactor `PersetujuanController::queue()` — filter berdasarkan kode_role user
- [x] 2.11 Tambah `PengajuanRepository::getApprovalQueueByRole()` (JOIN tahapan_layanan)
- [x] 2.12 Frontend: tambah `getWorkflowProgress()` dan `getMyProfile()` di simBakService
- [x] 2.13 Frontend: buat `WorkflowStepper` component (horizontal desktop, vertical mobile)
- [x] 2.14 Frontend verifikasi/[id]: tampilkan WorkflowStepper + info tahapan
- [x] 2.15 Frontend persetujuan/[id]: tampilkan WorkflowStepper + riwayat persetujuan
- [ ] 2.16 Test: PM-CUTI melewati 5 tahapan sesuai seed data
- [ ] 2.17 Test: PM-ALIH melewati 6 tahapan sesuai seed data
- [ ] 2.18 Test: queue hanya tampilkan pengajuan sesuai role user

---

## Tahap 3: Perbaikan Modul Surat Mandiri

### Masalah
1. Tidak ada upload file SK yang sudah ditandatangani pada `terbitkan()`
2. Tidak ada validasi otomatis status herregistrasi (SK-HERREG)
3. Tidak ada validasi status PKKMB (SK-PKKMB)

### File yang Diubah

**Backend:**
1. **`app/Http/Controllers/Api/Layanan/VerifikasiController.php`**
   - `terbitkan()`: tambah parameter `file` (upload PDF SK yang sudah ditandatangani)
   - File disimpan ke `layanan.dokumen_hasil` via MinIO/local storage
   - Field `a_final = true`, `path_file` diisi

2. **`app/Http/Controllers/Api/Layanan/PengajuanController.php`**
   - `store()` untuk SK-HERREG: validasi `status_registrasi` dari PDUT, auto-reject jika `cuti` atau `non_aktif`
   - `store()` untuk SK-PKKMB: validasi status PKKMB dari data PDUT (jika tersedia)

**Frontend:**
3. **`frontend/src/app/dashboard/sim-bak/admin/verifikasi/[id]/page.tsx`**
   - Tambah area upload file PDF pada saat "Terbitkan" (drag-drop atau file picker)
   - Input nomor surat + tanggal surat
   - Preview file yang akan diterbitkan

4. **`frontend/src/app/dashboard/sim-bak/surat-mandiri/[kode]/page.tsx`**
   - Step 1 (Data Pemohon): tampilkan data akademik dari API (bukan "-")
   - Untuk SK-HERREG: tampilkan badge status herregistrasi (hijau = aktif, merah = tidak aktif) + pesan error jika tidak memenuhi syarat
   - Perbaiki UI form: gunakan card-based layout, spacing konsisten, label yang jelas

### Checklist Tahap 3

- [x] 3.1 `VerifikasiController::terbitkan()` — tambah parameter upload file PDF SK
- [x] 3.2 Simpan file SK ke `layanan.dokumen_hasil` via MinIO/local storage
- [x] 3.3 `PengajuanController::store()` SK-HERREG — validasi status registrasi dari PDUT
- [x] 3.4 Auto-reject SK-HERREG jika status bukan "aktif" (cuti/non_aktif)
- [x] 3.5 `PengajuanController::store()` SK-PKKMB — validasi status PKKMB (log warning, belum blocking)
- [x] 3.6 Frontend verifikasi: modal form terbitkan (upload PDF + nomor surat + tanggal surat)
- [x] 3.7 Frontend simBakService: `terbitkanPengajuan()` support multipart/form-data
- [x] 3.8 Frontend surat-mandiri form: ambil data dari `getMyProfile()` API
- [x] 3.9 Frontend SK-HERREG: badge status herregistrasi (hijau=aktif, merah=non-aktif) + warning
- [x] 3.10 Frontend surat-mandiri form: grid 3 kolom, tampilkan jenjang/angkatan/sks_lulus/status
- [ ] 3.11 Test: admin upload SK PDF → mahasiswa bisa download dari riwayat
- [ ] 3.12 Test: SK-HERREG dengan status cuti → otomatis ditolak

---

## Tahap 4: Perbaikan Modul Permohonan Akademik

### Masalah
1. Form PM-ALIH tidak punya field prodi tujuan
2. Tidak ada validasi syarat akademik (IPK, SKS, semester)
3. Tidak ada UI wawancara + konversi SKS untuk Alih Program
4. Field semester mulai cuti tidak ada di form PM-CUTI

### File yang Diubah

**Backend:**
1. **`app/Http/Controllers/Api/Layanan/PengajuanController.php`**
   - `store()` untuk PM-CUTI: validasi `jumlah_semester_cuti` (1-2), semester minimal bukan semester 1
   - `store()` untuk PM-ALIH: wajib `id_prodi_tujuan` + `id_fakultas_tujuan`, validasi syarat akademik dari PDUT:
     - S1→S1: IPK >= 2.75, SKS >= 40, semester <= 5
     - S1→D3: IPK >= 2.00, SKS >= 30, semester <= 5
     - D3→D3: IPK >= 2.50, SKS >= 36, semester <= 5
     - S2/S3: IPK >= 3.00, SKS >= 12, semester <= 3
   - Tambah endpoint `GET /layanan/referensi/prodi` — list prodi dari PDUT untuk dropdown

2. **`app/Http/Controllers/Api/Layanan/PersetujuanController.php`**
   - Tambah endpoint `POST /approval/{id}/terima-tujuan` — khusus admin fakultas tujuan (Alih Program)
     - Input: `a_diterima_tujuan`, `hasil_wawancara`, `daftar_konversi_sks` (JSON array)
   - Data disimpan ke `layanan.persetujuan_pengajuan`

**Frontend:**
3. **`frontend/src/app/dashboard/sim-bak/permohonan/[kode]/page.tsx`**
   - PM-CUTI: tambah dropdown semester mulai cuti (dari API referensi semester)
   - PM-ALIH: tambah dropdown fakultas tujuan + prodi tujuan (cascading: pilih fakultas → load prodi)
   - PM-ALIH: tampilkan card syarat akademik (IPK min, SKS min, semester maks) dengan indikator terpenuhi/tidak (badge hijau/merah)
   - PM-UNDUR: tampilkan confirmation dialog yang menjelaskan konsekuensi pengunduran diri
   - Perbaiki UI: gunakan modern stepper untuk multi-step form, card layout untuk setiap section

4. **`frontend/src/app/dashboard/sim-bak/admin/persetujuan/[id]/page.tsx`**
   - Untuk PM-ALIH: tampilkan panel khusus "Keputusan Fakultas Tujuan"
     - Radio: Diterima / Ditolak
     - Textarea: Hasil Wawancara
     - Tabel editable: Daftar Konversi SKS (mata kuliah asal → mata kuliah tujuan → SKS diakui)
   - Tampilkan ringkasan syarat akademik yang sudah divalidasi sistem

### Checklist Tahap 4

- [x] 4.1 `PengajuanController::store()` PM-CUTI — validasi jumlah_semester_cuti + bukan semester 1
- [x] 4.2 `PengajuanController::store()` PM-ALIH — wajibkan id_prodi_tujuan + id_fakultas_tujuan
- [x] 4.3 PM-ALIH: validasi syarat akademik per jenjang (S1: IPK>=2.75/SKS>=40, D3: IPK>=2.50/SKS>=36, S2/S3: IPK>=3.00/SKS>=12)
- [x] 4.4 Tambah endpoint `GET /layanan/referensi/fakultas`, `/prodi`, `/semester` dari PDUT
- [x] 4.5 Tambah endpoint `POST /approval/{id}/terima-tujuan` — keputusan fakultas tujuan (diterima/ditolak)
- [x] 4.6 Simpan `a_diterima_tujuan`, `hasil_wawancara`, `daftar_konversi_sks` ke persetujuan_pengajuan
- [x] 4.7 Frontend PM-CUTI: dropdown semester mulai cuti (dari API referensi) + jumlah semester
- [x] 4.8 Frontend PM-ALIH: dropdown fakultas + prodi tujuan (cascading load)
- [x] 4.9 Frontend PM-ALIH: card syarat akademik (checklist hijau/merah per syarat, block submit jika gagal)
- [x] 4.10 Frontend PM-UNDUR: warning card konsekuensi pengunduran diri
- [x] 4.11 Frontend simBakService: `getRefFakultas()`, `getRefProdi()`, `getRefSemester()`, `terimaTujuanAlihProgram()`
- [x] 4.12 Frontend permohonan: data pemohon dari API, grid 4 kolom, field per layanan
- [ ] 4.13 Test: PM-ALIH dengan IPK < syarat → ditolak backend + frontend block
- [ ] 4.14 Test: PM-ALIH → admin fakultas tujuan input konversi SKS → tersimpan

---

## Tahap 5: Perbaikan Modul Batch Administrasi

### Masalah
1. `BatchController::store()` tidak menarik kandidat dari PDUT
2. Tidak ada kriteria seleksi HMM (batas semester per jenjang)
3. Tidak ada kriteria seleksi Putus Studi (IPK/SKS per checkpoint semester)
4. Tidak ada catatan/alasan per kandidat yang dikeluarkan
5. Tidak ada upload SK Dekan dan SK Rektor
6. Tidak ada notifikasi ke mahasiswa

### Query PDUT untuk Kandidat

**HMM (Habis Masa Mukim):**
```sql
SELECT rp.*, pd.nm_pd, sms.nm_lemb, jp.nm_jenj_didik,
       -- hitung masa studi dari semester masuk
       DATEDIFF(MONTH, rp.tgl_masuk_sp, GETDATE()) / 6 AS masa_studi_semester
FROM siakadu.reg_pd rp
JOIN siakadu.peserta_didik pd ON pd.id_pd = rp.id_pd
JOIN siakadu.sms sms ON sms.id_sms = rp.id_sms
JOIN siakadu.jenjang_pendidikan jp ON jp.id_jenj_didik = sms.id_jenj_didik
WHERE pd.id_stat_mhs IN (select id yang aktif)
  AND (
    (jp.nm_jenj_didik = 'D3' AND masa_studi >= 13) OR
    (jp.nm_jenj_didik = 'S1' AND masa_studi >= 17) OR
    (jp.nm_jenj_didik = 'S2' AND masa_studi >= 9) OR
    (jp.nm_jenj_didik = 'S3' AND masa_studi >= 13)
  )
```

**Putus Studi:**
```sql
-- Mahasiswa S1/D4 di akhir semester IV dengan IPK < 2.00 atau SKS < 40
-- Mahasiswa S1/D4 di akhir semester VIII dengan IPK < 2.00 atau SKS < 80
SELECT rp.*, pd.nm_pd, km.ipk, km.total_sks, km.smt
FROM siakadu.reg_pd rp
JOIN siakadu.peserta_didik pd ON pd.id_pd = rp.id_pd
JOIN siakadu.kuliah_mhs km ON km.id_reg_pd = rp.id_reg_pd AND km.id_smt = :id_smt
WHERE pd.id_stat_mhs IN (select id yang aktif)
  AND (
    (km.smt = 4 AND (km.ipk < 2.00 OR km.total_sks < 40)) OR
    (km.smt = 8 AND (km.ipk < 2.00 OR km.total_sks < 80))
  )
```

### File yang Diubah

**Backend:**
1. **`app/Repositories/PdutRepository.php`** (extend dari Tahap 1)
   - Tambah `getKandidatHMM(idSmt): array` — query kandidat habis masa mukim
   - Tambah `getKandidatPutusStudi(idSmt): array` — query kandidat putus studi
   - Tambah `getFakultasList(): array` — list fakultas untuk filter

2. **`app/Http/Controllers/Api/Batch/BatchController.php`**
   - Refactor `store()`: setelah buat batch header, otomatis tarik kandidat dari PDUT berdasarkan `jenis_batch` dan `id_smt`, simpan ke `batch.kandidat_batch` dengan snapshot data akademik
   - Tambah endpoint `POST /batch/{id}/pull-candidates` — re-pull kandidat (jika data PDUT berubah)
   - Refactor `verifikasiKandidat()`: tambah parameter `catatan` (alasan exclusion) → simpan ke `alasan_exclusion`
   - Tambah endpoint `POST /batch/{id}/upload-sk-dekan` — upload file SK Dekan (PDF)
   - Refactor `finalize()`: tambah upload file SK Rektor (PDF), simpan ke `dokumen_hasil`

3. **`app/Repositories/BatchRepository.php`**
   - Tambah `insertKandidatBulk(idBatch, candidates[]): int` — bulk insert dari hasil query PDUT
   - Tambah `updateKandidatCatatan(idKandidat, catatan): void`
   - Tambah `getKandidatByFakultas(idBatch, idFakultas): array` — untuk verifikasi per fakultas

**Frontend:**
4. **`frontend/src/app/dashboard/sim-bak/batch/create/page.tsx`**
   - Setelah pilih tipe batch + semester → tampilkan preview jumlah kandidat yang akan ditarik ("Ditemukan X mahasiswa yang memenuhi kriteria")
   - Tampilkan tabel preview kandidat sebelum konfirmasi pembuatan batch
   - Tampilkan kriteria seleksi yang digunakan (misal "S1: >= 17 semester aktif")
   - Semester dropdown dari API referensi, bukan hardcode

5. **`frontend/src/app/dashboard/sim-bak/batch/[id]/page.tsx`**
   - Tambah textarea catatan per kandidat saat exclude (modal konfirmasi: "Alasan mengeluarkan mahasiswa ini dari batch?")
   - Tambah tombol bulk action: "Verifikasi Semua", "Export Daftar Kandidat (CSV)"
   - Tambah section upload SK Dekan (card dengan drag-drop + input nomor SK + tanggal)
   - Tambah section upload SK Rektor pada saat finalize (modal dengan form upload + nomor SK + tanggal)
   - Tampilkan statistik per fakultas (jumlah kandidat, terverifikasi, dikeluarkan)

### Checklist Tahap 5

- [x] 5.1 `PdutRepository::getKandidatHMM(idSmt)` — query kandidat berdasarkan batas semester per jenjang
- [x] 5.2 `PdutRepository::getKandidatPutusStudi(idSmt)` — query berdasarkan IPK/SKS di semester IV dan VIII
- [x] 5.3 `PdutRepository::getFakultasList()` — sudah dari Tahap 4
- [x] 5.4 Refactor `BatchController::store()` — otomatis tarik kandidat dari PDUT + simpan kriteria snapshot
- [x] 5.5 Tambah endpoint `POST /batch/{id}/pull-candidates` — re-pull kandidat
- [x] 5.6 Refactor `BatchController::verifikasiKandidat()` — support catatan + hasil dikonfirmasi/dikeluarkan
- [x] 5.7 Tambah endpoint `POST /batch/{id}/upload-sk-dekan` — upload file SK Dekan PDF
- [x] 5.8 Refactor `BatchController::finalize()` — support upload file SK Rektor PDF (multipart)
- [x] 5.9 `BatchRepository::createKandidat()` — insert per kandidat (sudah ada, dipakai dalam loop)
- [x] 5.10 `BatchRepository::updateKandidatStatus()` — sudah support alasan_exclusion
- [x] 5.11 `BatchRepository::getKandidatList()` — tambah search filter (nim, nama, prodi, fakultas)
- [x] 5.12 Tambah endpoint `GET /batch/preview-candidates` — preview sebelum create
- [x] 5.13 Frontend simBakService: `previewBatchCandidates()`, `pullBatchCandidates()`, `uploadSkDekan()`, `finalizeBatchWithSK()`
- [x] 5.14 Frontend batch/create: preview kandidat (tabel + jumlah) + semester dari API + tombol preview
- [x] 5.15 Frontend batch/[id]: modal catatan exclude + upload SK Dekan + finalize modal dengan SK Rektor
- [ ] 5.16 Test: batch HMM → kandidat S1 semester >= 17 muncul otomatis
- [ ] 5.17 Test: batch Putus Studi → kandidat semester IV IPK < 2.00 muncul
- [ ] 5.18 Test: exclude kandidat dengan alasan → tersimpan di database
- [ ] 5.19 Test: upload SK Dekan + SK Rektor → file bisa didownload

---

## Tahap 6: Perbaikan Modul Monitoring & Dashboard

### Masalah
1. Tab Lulusan menampilkan "sedang dikembangkan"
2. Filter hanya fakultas (text), belum ada filter tahun, prodi, semester
3. Export CSV placeholder
4. Tidak ada indikator kelulusan tepat waktu
5. Tidak ada exclusion studi lanjut/RPL

### File yang Diubah

**Backend:**
1. **`app/Http/Controllers/Api/Dashboard/MonitoringController.php`**
   - Refactor `lulusan()`: query data lulusan dari PDUT (reg_pd dengan status lulus), termasuk perhitungan tepat waktu
   - Tambah parameter filter: `tahun`, `id_prodi`, `id_fakultas`, `jenjang`
   - Refactor `export()`: generate CSV/Excel dari data yang difilter, return sebagai download response
   - Tambah `GET /monitoring/stats` — ringkasan statistik: total aktif, total lulus, % tepat waktu, rata-rata masa studi

2. **`app/Repositories/PdutRepository.php`** (extend)
   - Tambah `getLulusan(filters): paginated` — query lulusan dari PDUT dengan filter
   - Tambah `getMahasiswaAktif(filters): paginated` — query mahasiswa aktif dari PDUT dengan filter lengkap
   - Tambah `getMonitoringStats(): array` — aggregate statistics
   - Kriteria tepat waktu: D3 <= 6 semester, S1 <= 8 semester, S2 <= 4 semester, S3 <= 6 semester

**Frontend:**
3. **`frontend/src/app/dashboard/sim-bak/monitoring/page.tsx`**
   - Tab Mahasiswa Aktif:
     - Filter bar horizontal: dropdown Fakultas, dropdown Prodi (cascading), dropdown Jenjang, input Tahun Angkatan
     - Stat cards di atas tabel: Total Mahasiswa Aktif, Per Jenjang (D3/S1/S2/S3)
     - DataTable dengan kolom: NIM, Nama, Prodi, Fakultas, Jenjang, Angkatan, Semester, IPK, Status
     - Tombol Export CSV fungsional
   - Tab Lulusan:
     - Filter bar: Fakultas, Prodi, Jenjang, Tahun Lulus
     - Stat cards: Total Lulusan, Tepat Waktu (%), Rata-rata Masa Studi
     - DataTable: NIM, Nama, Prodi, Fakultas, Jenjang, Angkatan, Tahun Lulus, Masa Studi, Badge Tepat Waktu (hijau/merah)
     - Tombol Export CSV fungsional
   - UI: modern card layout, filter dalam satu baris horizontal, responsive

### Checklist Tahap 6

- [x] 6.1 `PdutRepository::getLulusanPaginated(filters)` — query lulusan + perhitungan tepat waktu per jenjang
- [x] 6.2 `PdutRepository::getMahasiswaAktifPaginated(filters)` — query aktif + filter fakultas/prodi/jenjang/angkatan/search
- [x] 6.3 `PdutRepository::getMonitoringStats()` — total aktif, total lulus, % tepat waktu, rata-rata masa studi
- [x] 6.4 Refactor `MonitoringController::lulusan()` — data real + filter lengkap
- [x] 6.5 Refactor `MonitoringController::export()` — streamed CSV download dengan BOM UTF-8
- [x] 6.6 Tambah endpoint `GET /monitoring/stats` + route
- [x] 6.7 Frontend: filter bar horizontal (Cari, Fakultas, Prodi cascading, Jenjang, Angkatan/Tahun Lulus)
- [x] 6.8 Frontend: stat cards (Mahasiswa Aktif, Total Lulusan, Tepat Waktu %, Rata-rata Studi)
- [x] 6.9 Frontend tab Aktif: DataTable (NIM, Nama, Prodi, Fakultas, Jenjang, Angkatan, Semester, IPK)
- [x] 6.10 Frontend tab Lulusan: implementasi penuh (bukan "sedang dikembangkan")
- [x] 6.11 Frontend tab Lulusan: DataTable + badge Tepat Waktu hijau/merah
- [x] 6.12 Frontend: Export CSV fungsional (window.open ke /monitoring/export)
- [x] 6.13 Frontend simBakService: `getMonitoringStats()`
- [ ] 6.14 Test: tab Lulusan menampilkan data real dari PDUT
- [ ] 6.15 Test: filter fakultas + prodi menghasilkan data yang benar
- [ ] 6.16 Test: export CSV mengunduh file yang valid

---

## Tahap 7: Polish UI & UX (Best Practice 2026)

### Tujuan
Merapikan seluruh halaman SIMBAK agar konsisten, modern, responsive, dan mengikuti best practice UI/UX saat ini.

### Prinsip Desain
- **Layout**: Full-width content area, card-based sections, consistent spacing (gap-6)
- **Typography**: Heading hierarchy yang jelas (text-2xl bold → text-lg semibold → text-sm medium)
- **Colors**: Status badges dengan warna konsisten (hijau=sukses, biru=proses, kuning=warning, merah=error, abu=draft)
- **Loading**: Skeleton loading untuk tabel dan cards, bukan spinner
- **Empty State**: Ilustrasi + pesan + CTA button untuk state kosong
- **Responsive**: Mobile-first, tabel scrollable horizontal di mobile, filter collapsible
- **Feedback**: Toast notification untuk aksi sukses/gagal, confirmation dialog untuk aksi destruktif
- **Accessibility**: Label yang jelas, keyboard navigation, focus indicators

### File yang Diubah

**Frontend (semua halaman sim-bak):**

1. **`layout.tsx`** — Sidebar navigation modern: icon + label, active state highlight, collapse di mobile

2. **`page.tsx`** (Dashboard)
   - Stat cards dengan icon, trend indicator (naik/turun vs bulan lalu)
   - SLA gauge chart (ECharts)
   - Trend chart 6 bulan (line chart)
   - Recent activity sebagai timeline vertical, bukan tabel

3. **`surat-mandiri/page.tsx`**
   - Service cards (grid 2x2): icon layanan, nama, deskripsi singkat, badge SLA, tombol "Ajukan"
   - Hover effect, modern card shadow

4. **`surat-mandiri/[kode]/page.tsx`**
   - Horizontal stepper (step 1-2-3) dengan status icon
   - Card layout per section
   - Upload area: dashed border, icon upload, progress bar
   - Review step: summary card dengan semua data + dokumen

5. **`permohonan/page.tsx`** — Sama pattern dengan surat-mandiri

6. **`permohonan/[kode]/page.tsx`**
   - Conditional fields yang muncul smooth (animated)
   - Syarat akademik card (khusus PM-ALIH): checklist hijau/merah
   - Cascading dropdown fakultas → prodi (loading state saat fetch)

7. **`riwayat/page.tsx`**
   - Tabel dengan status badge berwarna
   - Filter: dropdown status, search by nomor permohonan
   - Sort by tanggal terbaru

8. **`riwayat/[id]/page.tsx`**
   - Timeline vertical modern: dot + garis + card per event
   - Card detail pemohon di sidebar (sticky)
   - Download section jika status terbit

9. **`admin/verifikasi/page.tsx`** + **`[id]/page.tsx`**
   - Queue tabel dengan badge status, sort by tanggal masuk (terlama dulu)
   - Detail: split layout (dokumen kiri, info kanan)
   - Document viewer: preview PDF dalam iframe/embed
   - Action buttons di bottom bar (sticky)

10. **`admin/persetujuan/page.tsx`** + **`[id]/page.tsx`**
    - Approval chain stepper horizontal di atas
    - Card per tahapan yang sudah selesai (siapa, kapan, keputusan)
    - Active tahapan: highlight dengan border primary

11. **`batch/page.tsx`** + **`create/page.tsx`** + **`[id]/page.tsx`**
    - List batch: card per batch dengan progress bar (kandidat terverifikasi / total)
    - Create: wizard 3 step (pilih tipe → konfirmasi semester → preview kandidat)
    - Detail: tab layout (Kandidat, SK Dekan, SK Rektor), stat cards, bulk actions

12. **`monitoring/page.tsx`**
    - Tab modern (underline style)
    - Filter bar satu baris, collapsible di mobile
    - Stat cards responsif
    - DataTable dengan virtual scrolling untuk dataset besar

13. **`master-data/page.tsx`**
    - Tab 4 entity, tabel CRUD dengan inline action buttons
    - Modal form: modern input styling, validation inline

### Checklist Tahap 7

- [x] 7.1 `layout.tsx` — sudah baik (useRequireAppAccess, loading gradient, access denied)
- [x] 7.2 `page.tsx` (Dashboard) — sudah baik (gradient stat cards, SLA gauge SVG, trend chart, activity timeline)
- [x] 7.3 `surat-mandiri/page.tsx` — skeleton loading cards, gradient service cards, hover animation, SLA badge
- [x] 7.4 `surat-mandiri/[kode]/page.tsx` — stepper, data akademik dari API, badge herregistrasi, 3-col grid (Tahap 3)
- [x] 7.5 `permohonan/page.tsx` — sama pattern dengan surat-mandiri (sudah bagus)
- [x] 7.6 `permohonan/[kode]/page.tsx` — syarat akademik card, cascading dropdown, warning undur diri (Tahap 4)
- [x] 7.7 `riwayat/page.tsx` — StatusBadge shared component, skeleton table loading, EmptyState + CTA
- [x] 7.8 `riwayat/[id]/page.tsx` — sudah baik (timeline vertical, sticky sidebar, download section)
- [x] 7.9 `admin/verifikasi/page.tsx` — sudah baik (queue tabel, sort terlama)
- [x] 7.10 `admin/verifikasi/[id]/page.tsx` — WorkflowStepper, modal terbitkan + upload SK (Tahap 2+3)
- [x] 7.11 `admin/persetujuan/page.tsx` — sudah baik (queue tabel)
- [x] 7.12 `admin/persetujuan/[id]/page.tsx` — WorkflowStepper + ApprovalTimeline (Tahap 2)
- [x] 7.13 `batch/page.tsx` — sudah baik (card list)
- [x] 7.14 `batch/create/page.tsx` — preview kandidat tabel, semester API, kriteria display (Tahap 5)
- [x] 7.15 `batch/[id]/page.tsx` — exclude modal + alasan, upload SK Dekan, finalize + SK Rektor (Tahap 5)
- [x] 7.16 `monitoring/page.tsx` — stat cards, tab underline, filter cascading, export CSV, badge tepat waktu (Tahap 6)
- [x] 7.17 `master-data/page.tsx` — sudah baik (tab CRUD, modal form)
- [x] 7.18 Buat `SkeletonCard.tsx` — SkeletonCard, SkeletonStatCards, SkeletonTable
- [x] 7.19 Buat `EmptyState.tsx` — variant (default, search, document, users) + CTA button
- [x] 7.20 Semua halaman responsive (grid responsive, mobile stepper vertical, filter collapsible)
- [x] 7.21 Toast notification sudah ada di semua halaman (react-hot-toast)
- [x] 7.22 Buat `ConfirmDialog.tsx` — modal konfirmasi untuk aksi kritis + `StatusBadge.tsx`

---

## Urutan Eksekusi yang Disarankan

```
Tahap 1 (Integrasi PDUT)          ← Fondasi, dibutuhkan oleh semua tahap
    ↓
Tahap 2 (Multi-Level Approval)    ← Dibutuhkan oleh Tahap 3 & 4
    ↓
Tahap 3 (Surat Mandiri)           ← Bisa paralel dengan Tahap 4
Tahap 4 (Permohonan Akademik)     ← Bisa paralel dengan Tahap 3
    ↓
Tahap 5 (Batch Administrasi)      ← Butuh Tahap 1 (query PDUT)
    ↓
Tahap 6 (Monitoring)              ← Butuh Tahap 1 (query PDUT)
    ↓
Tahap 7 (Polish UI)               ← Terakhir, setelah semua logic selesai
```

---

## Catatan Teknis

### Koneksi Database
- **PostgreSQL** (primary): `DB_HOST=postgres` (container) → database `simbak`, schema: `ref`, `layanan`, `batch`, `log`
- **SQL Server** (read-only): `SQLSRV_HOST=192.168.123.119` → database `pdut_staging`, schema: `siakadu`
- Semua query ke PDUT melalui `PdutRepository` dengan koneksi `sqlsrv`
- Tidak boleh ada cross-database JOIN — data di-merge di service layer

### File Storage
- Upload dokumen via MinIO atau local disk (`FILESYSTEM_DISK=simbak`)
- Path convention: `simbak/pengajuan/{id}/`, `simbak/hasil/`, `simbak/batch/{id}/`

### Testing
- Setiap tahap harus ditest manual melalui frontend
- Cek health endpoint: `curl http://localhost:9002/api/health`
- Cek log: `docker logs myunila-simbak-service --tail 50`
