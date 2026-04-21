# Audit Existing — Data, Schema, Kode

Ringkasan apa yang sudah ada di MyUnila terkait prestasi, untuk memastikan SI-Prestasi **tidak duplikasi** dan **tidak merusak** yang existing.

---

## 1. Database `pdut` (SQL Server staging 192.168.123.119)

Diaudit 2026-04-19 via `php -r DB::connection("sqlsrv")` di `myunila-auth-staging`.

### `pdrd.prestasi` — 751 rows (domain: PDDIKTI Feeder)

```
id_prestasi          uniqueidentifier  PK
id_jenis_prestasi    int               FK → ref.jenis_prestasi
id_akt_mhs           uniqueidentifier  NULL   FK → aktivitas_mhs (opsional)
nm_prestasi          varchar(160)      NOT NULL
thn_prestasi         numeric(4)        NOT NULL
penyelenggara        varchar(100)      NULL
peringkat            numeric(1)        NULL    1..9 (kode internal)
id_sp                uniqueidentifier  NOT NULL FK → satuan_pendidikan
id_pd                uniqueidentifier  NOT NULL FK → peserta_didik (single-student!)
id_tkt_prestasi      int               NOT NULL FK → ref.tingkat_prestasi
create_date, id_creator, last_update, id_updater, soft_delete, last_sync
```

**Karakteristik:**
- Single student (`id_pd`) — tidak bisa multi-mahasiswa
- Tidak ada: kategori, cabang, bentuk, kelompok, URL dokumen, tgl_sertifikat, keterangan
- Dipakai oleh `backend/feeder-service/apps/prestasi/` untuk sync PDDIKTI Feeder

**Keputusan:** jangan dimodifikasi. Feeder PDDIKTI punya kontrak sendiri.

### `ref.jenis_prestasi` — 4 rows

| id | nama |
|----|------|
| 1 | Sains |
| 2 | Seni |
| 3 | Olahraga |
| 9 | Lain-lain |

Referensi dari PDDIKTI. Tidak kompatibel dengan kategori SIMKATMAWA (RISNOV/RISNOVSSH/SENBUD/OLAHRAGA/MINAT).

### `ref.tingkat_prestasi` — 8 rows

| id | nama |
|----|------|
| 1 | Sekolah |
| 2 | Kecamatan |
| 3 | Kab/kota |
| 4 | Propinsi |
| 5 | Nasional |
| 6 | Internasional |
| 7 | Regional |
| 9 | Lainnya |

Overlap sebagian dengan SIMKATMAWA level (KAB=3, PROV=4, NAS=5, INT=6). Tapi SIMKATMAWA tidak kenal Sekolah/Kecamatan/Regional/Lainnya.

### Table sertifikasi yang ada — BUKAN untuk mahasiswa

- `pdrd.rwy_sertifikasi` — riwayat sertifikasi (kemungkinan dosen/pegawai, bukan mahasiswa)
- `dok.dok_rwy_sertifikasi` — dokumen pendukung riwayat sertifikasi
- `ref.lembaga_sertifikasi` — referensi lembaga

**Keputusan:** tidak dipakai untuk SI-Prestasi (domain berbeda).

---

## 2. Kode existing — frontend

| Path | Fungsi sekarang | Hubungan ke SI-Prestasi |
|---|---|---|
| `frontend/src/app/dashboard/data-unila/tridarma/prestasi/page.tsx` | Statistik prestasi di halaman Data Unila (read-only) | Konsumer data, bisa diperkaya dengan data SI-Prestasi nanti |
| `frontend/src/app/dashboard/pimpinan/prestasi/page.tsx` | Dashboard pimpinan — grafik prestasi per prodi | Sama, konsumer baca |
| `frontend/src/app/dashboard/feeder-integrator/pdrd/prestasi/page.tsx` | UI operator feeder PDDIKTI — sinkron `pdrd.prestasi` dari feeder | **Tidak diubah**, domain feeder |
| `frontend/src/app/dashboard/feeder-integrator/pdrd/prestasi-mahasiswa/page.tsx` | Sama, detail per mahasiswa | **Tidak diubah** |
| `frontend/src/shared/components/feeder-integrator/FeederPrestasiTable.tsx` | Komponen tabel feeder | **Tidak diubah** |

**Implikasi:** semua existing frontend prestasi membaca `pdrd.prestasi` (SQL Server). SI-Prestasi akan hidup di `frontend/src/app/dashboard/sim-prestasi/` dengan data source terpisah (PostgreSQL `si_prestasi`).

Di Phase 4 (analitik), kita bisa *union* dua data source di dashboard pimpinan, tapi itu bukan scope awal.

---

## 3. Kode existing — backend

### `backend/feeder-service/apps/prestasi/` (Go)

Module sinkron PDDIKTI Feeder:
- `entity.go` — struct `Prestasi` yang map ke `pdrd.prestasi`
- `sync_service.go` — pull dari feeder DIKTI → insert ke SQL Server
- `controller.go` / `router.go` — endpoint untuk operator

**Keputusan:** biarkan. Tidak ada overlap dengan SIMKATMAWA (feeder ≠ SIMKATMAWA, beda sumber beda owner).

### `backend/dashboard-service` (Laravel)

- `app/Repositories/DataUnila/TridarmaDataRepository.php` — query `pdrd.prestasi` untuk dashboard
- `app/Services/DataUnila/TridarmaDataService.php` — bussines logic dashboard

**Implikasi:** bisa extend di Phase 4 untuk gabung data SI-Prestasi.

---

## 4. Environment & infrastruktur

- PostgreSQL tersedia di VM5 staging (sudah dipakai SIMBAK: `myunila-simbak-staging` connect ke `pg-simbak-staging`). Pola reuse bisa diadopsi.
- Redis tersedia (`myunila-redis-staging`) — untuk cache token SIMKATMAWA, rate limit.
- MinIO / object storage — SIMBAK terakhir switch ke local volume (commit `3b8c01301`). SI-Prestasi perlu publik-accessible URL untuk `url_sertifikat` dll — **ini arsitektur decision** (§09).

---

## 5. Penemuan penting

1. Tidak ada data mahasiswa prestasi existing yang punya format SIMKATMAWA-compatible. Artinya **migrasi `pdrd.prestasi` → `si_prestasi` tidak masuk akal** (field-nya tidak kompatibel). Mulai dari kosong, atau lakukan backfill terbatas pakai field yang cocok (nm_prestasi→lomba, thn_prestasi→tahun, dst) jika user mau.
2. Tidak ada tabel referensi dosen pembimbing untuk prestasi. Perlu dibuat atau direfer ke `ref.sdm` (table dosen di pdut) pakai NUPTK/NIDN.
3. `kode_pt` Unila di SIMKATMAWA — belum terdokumentasi di repo. Perlu dari tim kemahasiswaan.
