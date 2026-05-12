# SIAKADU API → Schema siakadu — Field Mapping

## UUID Resolution Strategy

SIAKADU API return kode biasa (nim, nip, id_unit), tapi schema pdut/siakadu pakai UUID.
Strategi resolve:

### 1. Unit/Prodi: `id_unit` → `id_sms` (UUID)
```
SIAKADU: id_unit = "7055051" (kode unit siakad)
Lookup:  temp.map_prodi_siakad WHERE kode_siakad = '7055051'
Result:  id_sms = UUID
```
- Tabel mapping: `temp.map_prodi_siakad` (136 rows)
- Key: `kode_siakad` → `id_sms`
- ⚠️ Perlu dipindah ke `siakadu.mapping_unit` (bukan di temp)

### 2. Mahasiswa: `nim/nipd` → `id_reg_pd` + `id_pd` (UUID)
```
SIAKADU: nim = "2217031142"
Lookup:  pdrd.reg_pd WHERE nipd = '2217031142' AND soft_delete = 0
Result:  id_reg_pd = UUID, id_pd = UUID
```
- Lookup by `nipd` (NIM) di `reg_pd`
- Kalau belum ada → INSERT baru (generate UUID)
- `id_pd` didapat dari `peserta_didik` (lookup by NIK atau INSERT baru)

### 3. Dosen/Pegawai: `nip` → `id_sdm` + `id_reg_ptk` (UUID)
```
SIAKADU: nip = "197801022003121001"
Lookup:  pdrd.sdm WHERE nip = '197801022003121001' AND soft_delete = 0
Result:  id_sdm = UUID
```
- Lookup by `nip` di `sdm`
- `id_reg_ptk` dari `reg_ptk WHERE id_sdm = ? AND id_jns_keluar IS NULL`
- NIDN bisa jadi fallback: `sdm WHERE nidn = ?`

### 4. Mata Kuliah: `kode_mk` → `id_mk` (UUID)
```
SIAKADU: kode_mk = "MIA816109"
Lookup:  siakadu.matkul WHERE kode_mk = 'MIA816109'
Result:  id_mk = UUID
```
- Kalau belum ada → INSERT dari data kurikulum SIAKADU

### 5. Kelas: `id_kelas` (int SIAKADU) → `id_kls` (UUID)
```
SIAKADU: id_kelas = 12345 (integer, auto-increment)
Problem: pdut pakai UUID untuk id_kls
Strategy: Tabel mapping baru `siakadu.mapping_kelas`
```
- ⚠️ Perlu tabel mapping: `siakadu_id_kelas (int)` → `id_kls (UUID)`

### 6. Semester: `id_semester/id_periode` → `id_smt` (char 5)
```
SIAKADU: id_semester = "20241" (format: YYYYS, S=1 gasal/2 genap)
pdut:    id_smt = "20241" (sama format!)
```
- ✅ Format sama! Langsung map tanpa lookup

### 7. Kurikulum: `thn_kurikulum/id_kurikulum` → `id_kurikulum_sp` (UUID)
```
SIAKADU: id_kurikulum = 2016 (tahun integer)
Problem: pdut pakai UUID untuk id_kurikulum_sp
Strategy: Lookup by tahun + id_sms
```

---

## Endpoint → Table Mapping (Schema siakadu.*)

### `/mahasiswa/list` → `siakadu.peserta_didik` + `siakadu.reg_pd`

| SIAKADU Field | → | siakadu Column | Table | Resolve |
|---------------|---|---------------|-------|---------|
| nim | → | nipd | reg_pd | direct |
| nama | → | nm_pd | peserta_didik | direct |
| angkatan | → | id_semester_masuk | reg_pd | derive from angkatan |
| id_unit | → | id_sms | reg_pd | lookup map_prodi_siakad |
| ipk | → | ipk | reg_pd | direct |
| sks_total | → | (computed) | kuliah_mhs | skip, computed |
| nm_fakultas | → | (derived) | sms→fakultas | skip, derived |
| nm_prodi | → | (derived) | sms | skip, derived |

### `/mahasiswa/detail` → `siakadu.peserta_didik`

| SIAKADU Field | → | siakadu Column | Resolve |
|---------------|---|---------------|---------|
| nim | → | lookup reg_pd.nipd → id_pd | lookup |
| nama | → | nm_pd | direct |
| jk | → | jk | direct (L/P) |
| tmpt_lahir | → | tmpt_lahir | direct |
| tgl_lahir | → | tgl_lahir | direct |
| nik | → | nik | direct |
| alamat | → | jln | direct |
| email | → | email | direct |
| hp | → | no_hp | direct |
| id_agama | → | id_agama | direct (int) |
| id_kota | → | id_wil | mapping needed? |
| rt, rw | → | rt, rw | direct |
| kode_pos | → | kode_pos | direct |

### `/kelas/list` → `siakadu.kelas_kuliah`

| SIAKADU Field | → | siakadu Column | Resolve |
|---------------|---|---------------|---------|
| id_kelas | → | id_kls | ⚠️ mapping_kelas (int→UUID) |
| id_semester | → | id_smt | direct (format sama) |
| kode_mk | → | id_mk | lookup matkul.kode_mk |
| nm_kelas | → | nm_kls | direct |
| sks_mk | → | sks_mk | direct |
| id_unit | → | id_sms | lookup map_prodi_siakad |
| daya_tampung | → | kuota_pditt | map? |
| dosen[] | → | akt_ajar_dosen | separate upsert |

### `/krs/list` → `siakadu.kuliah_mhs` (+ nilai_smt_mhs)

| SIAKADU Field | → | siakadu Column | Resolve |
|---------------|---|---------------|---------|
| npm | → | id_reg_pd | lookup reg_pd.nipd |
| id_semester | → | id_smt | direct |
| kode_mk | → | (via kelas) | lookup |
| id_kelas | → | id_kls | mapping_kelas |
| status_krs | → | id_stat_mhs? | mapping |

### `/khs/list` → `siakadu.nilai_smt_mhs`

| SIAKADU Field | → | siakadu Column | Resolve |
|---------------|---|---------------|---------|
| npm | → | id_reg_pd | lookup reg_pd.nipd |
| id_kelas | → | id_kls | mapping_kelas |
| nilai_huruf | → | nilai_huruf | direct |
| nilai_angka | → | nilai_angka | direct |
| nilai_index | → | nilai_indeks | direct |

### `/transkrip/list` → `siakadu.nilai_transkrip`

| SIAKADU Field | → | siakadu Column | Resolve |
|---------------|---|---------------|---------|
| npm | → | id_reg_pd | lookup reg_pd.nipd |
| kode_mk | → | id_mk | lookup matkul.kode_mk |
| nilai_huruf | → | nilai_huruf | direct |
| nilai_index | → | nilai_indeks | direct |
| nilai_bobot | → | (sks × indeks) | skip/computed |
| smt_mk | → | smt_ke | direct |

### `/kuliah/list` → `siakadu.kuliah_mhs`

| SIAKADU Field | → | siakadu Column | Resolve |
|---------------|---|---------------|---------|
| npm | → | id_reg_pd | lookup reg_pd.nipd |
| id_semester | → | id_smt | direct |
| stat_kuliah | → | id_stat_mhs | mapping needed |
| ips | → | ips | direct |
| ipk | → | ipk | direct |
| sks_smt | → | sks_semester | direct |
| total_sks | → | total_sks | direct |

### `/kelas/jadwal_kuliah/list` → `siakadu.jadwal_kelas`

| SIAKADU Field | → | siakadu Column | Resolve |
|---------------|---|---------------|---------|
| id_jadwal | → | id_jdwl_kls | ⚠️ mapping (int→UUID) |
| id_kelas | → | id_kls | mapping_kelas |
| pertemuan_ke | → | pertemuan | direct |
| tgl_jadwal | → | tgl_jadwal | direct |
| waktu_mulai | → | waktu_mulai | direct |
| waktu_selesai | → | waktu_selesai | direct |
| id_ruang | → | lokasi | direct (or mapping) |

### `/pegawai/list` → `siakadu.sdm` + `siakadu.reg_ptk`

| SIAKADU Field | → | siakadu Column | Table | Resolve |
|---------------|---|---------------|-------|---------|
| nip | → | nip | sdm | direct (lookup key) |
| nidn | → | nidn | sdm | direct |
| nama_gelar | → | nm_sdm | sdm | direct |
| jabfung | → | (derived) | rwy_fungsional | skip |
| golongan | → | (derived) | rwy_kepangkatan | skip |
| id_unit_final | → | id_sms | reg_ptk | lookup map_prodi_siakad |
| status_pegawai | → | id_stat_aktif | sdm | mapping |
| a_keluar | → | id_jns_keluar | reg_ptk | mapping |

### `/presensi/list` → `siakadu.kehadiran_mhs`

| SIAKADU Field | → | siakadu Column | Resolve |
|---------------|---|---------------|---------|
| id_jadwal | → | (mapping) | mapping jadwal |
| id_kelas | → | id_kls | mapping_kelas |
| pertemuan_ke | → | (link to jadwal) | |
| total_hadir | → | (aggregate) | |

### `/keuangan/list` → `siakadu.spp_mhs`

| SIAKADU Field | → | siakadu Column | Resolve |
|---------------|---|---------------|---------|
| nim | → | id_reg_pd | lookup reg_pd.nipd |
| id_periode | → | id_smt | direct |
| nominal_tagihan | → | nominal | direct |
| nominal_bayar | → | nominal | direct |
| tgl_bayar | → | tgl_bayar | direct |
| status | → | flag_by | mapping |

---

## Mapping Tables yang PERLU DIBUAT

### 1. `siakadu.mapping_unit` (migrate dari temp.map_prodi_siakad)
```sql
CREATE TABLE siakadu.mapping_unit (
    kode_siakad    VARCHAR(20) NOT NULL,  -- id_unit SIAKADU (e.g. "7055051")
    id_sms         UNIQUEIDENTIFIER NOT NULL,  -- UUID di pdut
    nm_unit        VARCHAR(200),
    jenjang        VARCHAR(10),
    PRIMARY KEY (kode_siakad)
);
```

### 2. `siakadu.mapping_kelas` (baru)
```sql
CREATE TABLE siakadu.mapping_kelas (
    id_kelas_siakadu  INT NOT NULL,        -- id_kelas dari SIAKADU (integer)
    id_kls            UNIQUEIDENTIFIER NOT NULL,  -- UUID di siakadu.kelas_kuliah
    id_smt            CHAR(5),
    PRIMARY KEY (id_kelas_siakadu)
);
```

### 3. `siakadu.mapping_jadwal` (baru)
```sql
CREATE TABLE siakadu.mapping_jadwal (
    id_jadwal_siakadu  INT NOT NULL,
    id_jdwl_kls        UNIQUEIDENTIFIER NOT NULL,
    PRIMARY KEY (id_jadwal_siakadu)
);
```

### 4. `siakadu.mapping_pegawai` (baru — optional, nip bisa langsung lookup)
```sql
-- Mungkin tidak perlu karena NIP bisa langsung lookup ke sdm.nip
-- Tapi kalau SIAKADU pakai id_pegawai (int), perlu mapping:
CREATE TABLE siakadu.mapping_pegawai (
    id_pegawai_siakadu  INT NOT NULL,
    id_sdm              UNIQUEIDENTIFIER NOT NULL,
    nip                 VARCHAR(30),
    PRIMARY KEY (id_pegawai_siakadu)
);
```

---

## ⚠️ Konfirmasi yang Dibutuhkan

1. **id_kelas SIAKADU (int)** → pdut pakai UUID. Perlu tabel `mapping_kelas`?
2. **id_unit SIAKADU** = `kode_siakad` di `temp.map_prodi_siakad`? Atau beda?
3. **status_mahasiswa SIAKADU** (text: "Aktif", "Cuti") → pdut `id_stat_mhs` (char 1: "A", "C")? Mapping gimana?
4. **Wisuda** — mau bikin tabel baru `siakadu.wisuda_mahasiswa` + `siakadu.periode_wisuda`?
5. **Foto mahasiswa** dari SIAKADU → simpan dimana? MinIO?
6. **Dosen di kelas** — SIAKADU return `dosen[]` per kelas. Map ke `siakadu.akt_ajar_dosen`?
