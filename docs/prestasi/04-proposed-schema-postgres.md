# Proposed Schema — PostgreSQL `si_prestasi`

**Engine:** PostgreSQL 15+ (sama seperti SIMBAK)
**Database:** `si_prestasi` (database baru, di host PostgreSQL yang sama dengan `simbak`)
**Schemas:** `ref` (master), `prestasi` (core), `sync` (tracking SIMKATMAWA), `setting` (runtime config multi-API), `log` (audit)

**Konvensi naming — IKUT SIMBAK persis:**
- Schema: `ref` / domain (`prestasi`) / `sync` / `log`, **tidak pakai schema `public`** (drop).
- PK: `id_<tabel>` UUID default `gen_random_uuid()`
- Nama: `nm_<field>`
- Tanggal: `tgl_<field>`
- Boolean: `a_<field>` BOOLEAN
- Audit: `created_at`, `updated_at`, `soft_delete` BOOLEAN default FALSE
- Index: `idx_<tabel>_<kolom>`
- FK ke internal: `id_<referensi>` UUID REFERENCES `<schema>.<tabel>`
- **FK ke pdut SQL Server (cross-DB)**: simpan int/uniqueidentifier asli sebagai kolom biasa, TIDAK REFERENCES (beda DB). Contoh: `id_jenis_prestasi_pdut INT` mengacu nilai di `pdut.ref.jenis_prestasi.id_jenis_prestasi`.

DDL final ditulis sebagai **raw SQL files** di folder dedikasi `data-model/script/postgresql/si_prestasi/` (mirror pola folder `data-model/script/sqlserver/siakadu/` dsb). **TIDAK pakai Laravel migrations** — Laravel `database/migrations/` dibiarkan kosong kecuali untuk tabel built-in queue (`jobs`, `failed_jobs`). Domain schema diapply via `psql -f`.

File-file di folder `si_prestasi/`:
```
data-model/script/postgresql/si_prestasi/
├── README.md                          # dokumentasi folder + apply order
├── si_prestasi_v1.0_fresh.sql         # DDL lengkap (schemas + tables + indexes + comments)
├── si_prestasi_v1.0_seed.sql          # seed referensi (level, kategori, peringkat, dll)
└── (nanti kalau ada perubahan)
    ├── si_prestasi_v1.0_to_v1.1_alter.sql
    └── si_prestasi_v1.1_fresh.sql
```

Draft di bawah adalah struktur logis + kolom — ditulis ulang ke SQL concrete di file `v1.0_fresh.sql`.

---

## 1. `ref.*` — tabel referensi

Setiap tabel ref dipegang double: **kode SIMKATMAWA** (untuk payload API) dan **kode pdut** (untuk kompat existing). Kolom `a_ref_pddikti` & `a_ref_simkatmawa` flag sumber autoritatif, mirip pola `a_ref_pddikti`/`a_ref_unila` di `pdut.ref.*`.

### `ref.level_prestasi`

Simpan mapping level SIMKATMAWA ↔ pdut `ref.tingkat_prestasi`.

| col | type | note |
|---|---|---|
| id_level_prestasi | UUID PK default gen_random_uuid() | |
| kode_simkatmawa | VARCHAR(8) UNIQUE NOT NULL | KAB / PROV / NAS / INT |
| nm_level | VARCHAR(60) NOT NULL | Nama lengkap |
| id_tkt_prestasi_pdut | INT NULL | Mapping ke `pdut.ref.tingkat_prestasi.id_tkt_prestasi` (3=Kab/kota, 4=Propinsi, 5=Nasional, 6=Internasional) |
| urutan | SMALLINT NOT NULL | UI sort |
| a_active | BOOLEAN DEFAULT TRUE | |
| a_ref_simkatmawa | BOOLEAN DEFAULT TRUE | |
| a_ref_pddikti | BOOLEAN DEFAULT FALSE | true kalau dipakai di feeder PDDIKTI |
| created_at | TIMESTAMPTZ DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ DEFAULT NOW() | |

Seed:
| kode_simkatmawa | nm_level | id_tkt_prestasi_pdut |
|---|---|---|
| KAB | Kabupaten/Kota | 3 |
| PROV | Provinsi | 4 |
| NAS | Nasional | 5 |
| INT | Internasional | 6 |

### `ref.kategori_prestasi`

| col | type | note |
|---|---|---|
| id_kategori_prestasi | UUID PK | |
| kode_simkatmawa | VARCHAR(16) UNIQUE NOT NULL | RISNOV / RISNOVSSH / SENBUD / OLAHRAGA / MINAT |
| nm_kategori | VARCHAR(100) NOT NULL | |
| id_jenis_prestasi_pdut | INT NULL | Best-effort mapping ke `pdut.ref.jenis_prestasi` (contoh: OLAHRAGA→3, SENBUD→2 "Seni", RISNOV/RISNOVSSH/MINAT→NULL atau 1 "Sains" kalau kaitan) |
| a_active | BOOLEAN DEFAULT TRUE | |
| a_ref_simkatmawa | BOOLEAN DEFAULT TRUE | |
| created_at, updated_at | | |

**Catatan:** kategori SIMKATMAWA lebih granular daripada `pdut.ref.jenis_prestasi`. Mapping 1-arah (simkatmawa→pdut) dan bersifat hint bukan konstraint.

### `ref.peringkat`

| col | type | note |
|---|---|---|
| id_peringkat | UUID PK | |
| kode_simkatmawa | VARCHAR(16) UNIQUE NOT NULL | JUARA1..HARAPAN3 / APRESIASI / PESERTA |
| nm_peringkat | VARCHAR(60) NOT NULL | |
| peringkat_pdut | NUMERIC(1) NULL | mapping ke `pdut.pdrd.prestasi.peringkat` (1-6 juara/harapan, 7=apresiasi, 8=peserta — perlu konfirmasi ke legacy data sebelum lock) |
| urutan | SMALLINT NOT NULL | untuk ranking UI |
| nilai_bobot | NUMERIC(4,2) NULL | opsional — skoring internal |
| a_active | BOOLEAN DEFAULT TRUE | |
| created_at, updated_at | | |

### `ref.kelompok_prestasi`

| col | type | note |
|---|---|---|
| id_kelompok_prestasi | UUID PK | |
| kode_simkatmawa | VARCHAR(16) UNIQUE NOT NULL | INDIVIDU / KELOMPOK |
| nm_kelompok | VARCHAR(40) NOT NULL | |
| a_active | BOOLEAN DEFAULT TRUE | |
| created_at, updated_at | | |

### `ref.bentuk_pelaksanaan`

| col | type | note |
|---|---|---|
| id_bentuk_pelaksanaan | UUID PK | |
| kode_simkatmawa | VARCHAR(8) UNIQUE NOT NULL | DARING / LURING |
| nm_bentuk | VARCHAR(40) NOT NULL | |
| a_active | BOOLEAN DEFAULT TRUE | |
| created_at, updated_at | | |

### `ref.jenis_rekognisi`

| col | type | note |
|---|---|---|
| id_jenis_rekognisi | UUID PK | |
| kode_simkatmawa | VARCHAR(16) UNIQUE NOT NULL | SERKOM / JURIOR / JURINOR / KEYCONF / KEYWORK / PAMERAN / KARYA / BUKU / PATEN / PUB / DUTA / PTG / PSB / PKD |
| nm_jenis | VARCHAR(120) NOT NULL | |
| a_active | BOOLEAN DEFAULT TRUE | |
| created_at, updated_at | | |

### `ref.tipe_sync`

Enum jenis laporan yang dikirim ke SIMKATMAWA.

| col | type | note |
|---|---|---|
| id_tipe_sync | UUID PK | |
| kode | VARCHAR(16) UNIQUE NOT NULL | PRESTASI / SERTIFIKASI / REKOGNISI |
| nm_tipe | VARCHAR(40) NOT NULL | |
| path_api | VARCHAR(60) NOT NULL | `/api/prestasi-mandiri`, `/api/sertifikasi`, `/api/rekognisi` |
| a_active | BOOLEAN DEFAULT TRUE | |

---

## 2. `prestasi.*` — core data

### `prestasi.prestasi_mandiri`

| col | type | note |
|---|---|---|
| id_prestasi_mandiri | UUID PK default gen_random_uuid() | |
| kode_pt | VARCHAR(10) NULL | di-cache dari login SIMKATMAWA |
| thn_prestasi | SMALLINT NOT NULL | tahun pelaksanaan (= year dari tgl_sertifikat) |
| id_level_prestasi | UUID NOT NULL REFERENCES ref.level_prestasi | |
| id_kategori_prestasi | UUID NOT NULL REFERENCES ref.kategori_prestasi | |
| nm_lomba | VARCHAR(255) NOT NULL | |
| nm_cabang | VARCHAR(200) NULL | |
| nm_penyelenggara | VARCHAR(255) NOT NULL | |
| id_peringkat | UUID NOT NULL REFERENCES ref.peringkat | |
| jumlah_unit_peserta | INT NOT NULL DEFAULT 0 | |
| id_kelompok_prestasi | UUID NOT NULL REFERENCES ref.kelompok_prestasi | |
| id_bentuk_pelaksanaan | UUID NOT NULL REFERENCES ref.bentuk_pelaksanaan | |
| url_peserta | TEXT NULL | |
| url_sertifikat | TEXT NULL | |
| tgl_sertifikat | DATE NOT NULL | |
| url_foto_upp | TEXT NULL | |
| url_dokumen_undangan | TEXT NULL | |
| keterangan | TEXT NULL | |
| status_workflow | VARCHAR(16) NOT NULL DEFAULT 'draft' | draft/review/ready/sending/sent/error/archived |
| id_fakultas | VARCHAR(8) NULL | mapping ke `pdut.man_akses.unit_organisasi` — ownership fakultas |
| id_prestasi_pdut | UNIQUEIDENTIFIER NULL | optional — kalau data di-migrate dari pdut.pdrd.prestasi, simpan GUID aslinya untuk traceability |
| id_creator | UUID NOT NULL | user SSO (auth-service) |
| id_updater | UUID NULL | |
| created_at | TIMESTAMPTZ DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ DEFAULT NOW() | |
| soft_delete | BOOLEAN DEFAULT FALSE | |

Index:
- `idx_prestasi_mandiri_tahun_level` on `(thn_prestasi, id_level_prestasi, id_kategori_prestasi)`
- `idx_prestasi_mandiri_status` on `(status_workflow)` where soft_delete = false
- `idx_prestasi_mandiri_fakultas` on `(id_fakultas)`
- `idx_prestasi_mandiri_pdut` on `(id_prestasi_pdut)` where id_prestasi_pdut IS NOT NULL

### `prestasi.sertifikasi`

Sama seperti `prestasi_mandiri` tapi **tanpa**: `id_kategori_prestasi`, `id_peringkat`, `nm_cabang`, `id_kelompok_prestasi`, `id_bentuk_pelaksanaan`, `jumlah_unit_peserta`. Kolom utama: `nm_sertifikasi` (pengganti `nm_lomba`).

| col | note |
|---|---|
| id_sertifikasi | UUID PK |
| kode_pt, thn_prestasi, id_level_prestasi, nm_sertifikasi, nm_penyelenggara, url_*, tgl_sertifikat, keterangan, status_workflow, id_fakultas, id_creator/id_updater, audit | — |

### `prestasi.rekognisi`

Seperti `sertifikasi` + `id_jenis_rekognisi UUID NOT NULL REFERENCES ref.jenis_rekognisi`. Kolom utama: `nm_rekognisi`.

### `prestasi.peserta_mhs` — child multi-mahasiswa

Polymorphic ke 3 parent (prestasi_mandiri / sertifikasi / rekognisi) via `parent_tipe` string + `id_parent`.

| col | type | note |
|---|---|---|
| id_peserta_mhs | UUID PK | |
| id_parent | UUID NOT NULL | |
| parent_tipe | VARCHAR(16) NOT NULL | PRESTASI / SERTIFIKASI / REKOGNISI |
| nim | VARCHAR(20) NOT NULL | |
| nm_mahasiswa | VARCHAR(200) NOT NULL | cache |
| id_pd_pdut | UNIQUEIDENTIFIER NULL | mapping ke `pdut.siakadu.peserta_didik.id_pd` — diisi saat lookup berhasil |
| id_sms_pdut | UNIQUEIDENTIFIER NULL | mapping ke `pdut.pdrd.sms.id_sms` (prodi) |
| nm_prodi | VARCHAR(200) NULL | cache |
| id_fakultas_pdut | VARCHAR(8) NULL | cache dari `pdut.man_akses.unit_organisasi` |
| created_at | TIMESTAMPTZ DEFAULT NOW() | |

Constraints:
- UNIQUE `(id_parent, parent_tipe, nim)` — cegah double di record yang sama
- INDEX `idx_peserta_mhs_nim` on `(nim)` untuk lookup "prestasi mahasiswa X"
- INDEX `idx_peserta_mhs_parent` on `(id_parent, parent_tipe)`

### `prestasi.peserta_dosen` — child multi-dosen

| col | type | note |
|---|---|---|
| id_peserta_dosen | UUID PK | |
| id_parent | UUID NOT NULL | |
| parent_tipe | VARCHAR(16) NOT NULL | |
| nuptk | VARCHAR(20) NULL | kirim ini ke SIMKATMAWA `dosen[].nuptk` |
| nidn | VARCHAR(20) NULL | fallback — banyak dosen Unila cuma punya NIDN |
| id_sdm_pdut | UNIQUEIDENTIFIER NULL | mapping ke `pdut.ref.sdm.id_sdm` |
| nm_dosen | VARCHAR(200) NOT NULL | |
| url_surat_tugas | TEXT NOT NULL | |
| created_at | TIMESTAMPTZ DEFAULT NOW() | |

Constraints:
- CHECK `(nuptk IS NOT NULL OR nidn IS NOT NULL)`
- UNIQUE `(id_parent, parent_tipe, COALESCE(nuptk, nidn))`

---

## 3. `sync.*` — tracking push ke SIMKATMAWA

### `sync.submission`

Append-only — 1 row per attempt push. Jangan UPDATE-in-place.

| col | type | note |
|---|---|---|
| id_submission | UUID PK | |
| id_parent | UUID NOT NULL | FK polymorphic |
| parent_tipe | VARCHAR(16) NOT NULL | |
| id_tipe_sync | UUID NOT NULL REFERENCES ref.tipe_sync | |
| request_payload | JSONB NOT NULL | snapshot payload dikirim |
| request_at | TIMESTAMPTZ DEFAULT NOW() | |
| http_status | INT NULL | |
| response_body | JSONB NULL | |
| simkatmawa_id | BIGINT NULL | `data.id` kalau sukses |
| simkatmawa_kode_pt | VARCHAR(10) NULL | |
| simkatmawa_tahun | VARCHAR(4) NULL | |
| error_message | TEXT NULL | |
| retry_count | INT DEFAULT 0 | |
| a_success | BOOLEAN GENERATED ALWAYS AS (http_status BETWEEN 200 AND 299) STORED | |
| id_actor | UUID NULL | user yang trigger submit |

Index:
- `idx_submission_parent` on `(id_parent, parent_tipe)`
- `idx_submission_success_time` on `(a_success, request_at DESC)`
- `idx_submission_simkatmawa_id` on `(simkatmawa_id)` where simkatmawa_id IS NOT NULL

### `sync.token_cache`

Singleton — cache JWT SIMKATMAWA. Alternatif Redis (lebih direkomendasikan supaya tidak write-contention di Postgres).

| col | type | note |
|---|---|---|
| id_token_cache | SMALLINT PK CHECK (id_token_cache=1) | singleton |
| token_encrypted | TEXT NOT NULL | Laravel `Crypt::encryptString()` |
| expires_at | TIMESTAMPTZ NOT NULL | dari JWT `exp` claim |
| kode_pt | VARCHAR(10) NULL | dari respon `/api/login` |
| updated_at | TIMESTAMPTZ | |

---

## 3b. `setting.*` — konfigurasi runtime multi-API

**Tujuan:** SI-Prestasi bisa integrasi ke banyak API eksternal (SIMKATMAWA sekarang, bisa mitra/vendor lain nanti). Daripada hardcode di `.env` atau bikin tabel khusus per integrasi, pakai satu tabel generik `setting.api_config` yang flexible untuk bearer / api_key / basic / oauth2. Pola mirip SIMBAK `ref.pengaturan_notifikasi` dengan `a_rahasia` flag, tapi lebih kaya untuk kebutuhan multi-auth.

### `setting.api_config`

| col | type | note |
|---|---|---|
| id_api_config | UUID PK default gen_random_uuid() | |
| kode | VARCHAR(40) UNIQUE NOT NULL | Identifier singkat (`simkatmawa`, `pddikti`, `mitra-x`) |
| nm_api | VARCHAR(150) NOT NULL | Nama human-friendly |
| base_url | TEXT NOT NULL | Base URL API, contoh: `https://simkatmawa.kemdiktisaintek.go.id` |
| auth_type | VARCHAR(16) NOT NULL | `bearer` / `api_key` / `basic` / `oauth2` / `none` |
| auth_login_path | VARCHAR(200) NULL | Path untuk login (kalau perlu fetch token), contoh: `/api/login` |
| auth_username_encrypted | TEXT NULL | Encrypted at rest (Laravel Crypt) |
| auth_password_encrypted | TEXT NULL | Encrypted at rest |
| auth_api_key_encrypted | TEXT NULL | Encrypted at rest |
| auth_extra | JSONB NULL | Flex untuk field tambahan (oauth client_id/secret, header custom, refresh_token_path, dsb) |
| kode_pt | VARCHAR(10) NULL | PT identifier di API tersebut (untuk SIMKATMAWA: kode_pt Unila) |
| rate_limit_per_min | INT NOT NULL DEFAULT 60 | Batas request/menit dari kita ke API |
| timeout_seconds | INT NOT NULL DEFAULT 30 | HTTP client timeout |
| retry_policy | JSONB NULL | `{max_attempts:3, backoff_ms:[0,30000,120000]}` |
| a_active | BOOLEAN NOT NULL DEFAULT TRUE | Enable/disable integrasi tanpa hapus config |
| a_dry_run | BOOLEAN NOT NULL DEFAULT FALSE | Kalau true, worker cuma log payload tanpa benar-benar kirim |
| deskripsi | TEXT NULL | Catatan ops |
| id_creator | UUID NULL | |
| id_updater | UUID NULL | |
| created_at | TIMESTAMPTZ DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ DEFAULT NOW() | |

Index:
- `idx_api_config_kode` on `(kode)` (sudah via UNIQUE)
- `idx_api_config_active` on `(a_active)` partial

### Seed awal

```sql
INSERT INTO setting.api_config
  (kode, nm_api, base_url, auth_type, auth_login_path, rate_limit_per_min, timeout_seconds, a_active, a_dry_run, deskripsi)
VALUES
  ('simkatmawa',
   'SIMKATMAWA Kemdiktisaintek',
   'https://simkatmawa.kemdiktisaintek.go.id',
   'bearer',
   '/api/login',
   30,
   30,
   true,
   true,           -- STAGING: dry_run default on
   'API pelaporan prestasi/sertifikasi/rekognisi mahasiswa ke Kemdiktisaintek. Auth: login email+password → JWT bearer. Cuma POST, tidak ada GET (probe 2026-04-19).')
ON CONFLICT (kode) DO NOTHING;
```

Email + password aktual **tidak di-seed** — ops isi lewat UI Master Data Admin setelah deploy, nilai di-encrypt on write oleh Laravel `Crypt::encryptString()`.

### `setting.api_config_log`

Audit trail perubahan config (penting karena kredensial sensitive):

| col | type | note |
|---|---|---|
| id_api_config_log | UUID PK | |
| id_api_config | UUID NOT NULL REFERENCES setting.api_config | |
| action | VARCHAR(20) NOT NULL | CREATE / UPDATE / ROTATE_PASSWORD / ROTATE_API_KEY / TEST / TOGGLE_ACTIVE / TOGGLE_DRY_RUN |
| field_changed | VARCHAR(60) NULL | nama kolom yang berubah (tanpa nilai — jangan log password) |
| id_actor | UUID NOT NULL | |
| nm_actor | VARCHAR(200) NOT NULL | |
| ip_address | VARCHAR(45) NULL | |
| created_at | TIMESTAMPTZ DEFAULT NOW() | |

### Pattern pemakaian di kode

```php
// app/Services/ApiConfigService.php
public function get(string $kode): ApiConfigDTO
{
    $row = DB::connection('pgsql')
        ->table('setting.api_config')
        ->where('kode', $kode)
        ->where('a_active', true)
        ->first();

    if (!$row) {
        throw new ApiConfigNotFoundException($kode);
    }

    return new ApiConfigDTO(
        base_url: $row->base_url,
        auth_type: $row->auth_type,
        username: $row->auth_username_encrypted ? Crypt::decryptString($row->auth_username_encrypted) : null,
        password: $row->auth_password_encrypted ? Crypt::decryptString($row->auth_password_encrypted) : null,
        api_key:  $row->auth_api_key_encrypted ? Crypt::decryptString($row->auth_api_key_encrypted) : null,
        extra:    $row->auth_extra ? json_decode($row->auth_extra, true) : [],
        kode_pt:  $row->kode_pt,
        rate_limit: $row->rate_limit_per_min,
        timeout: $row->timeout_seconds,
        retry: json_decode($row->retry_policy ?? '{}', true),
        dry_run: (bool)$row->a_dry_run,
    );
}
```

`SimkatmawaClient` mengambil config via `ApiConfigService::get('simkatmawa')` — tidak read `.env` langsung. Kalau suatu saat Unila integrasi ke API lain (misal `pddikti-neo`), cukup insert row baru di `setting.api_config`, tidak perlu ubah kode/container/env.

### Keuntungan pola ini

- 🔐 **Kredensial terenkripsi di DB** (bukan plain di `.env` / `docker-compose`)
- 🔄 **Rotate password/api_key tanpa redeploy** — ops update via UI → service baca fresh tiap request (atau cache 30 detik)
- 🧪 **Toggle dry-run per-API** (bisa test SIMKATMAWA di dry-run sementara API lain live)
- 📜 **Audit trail** perubahan via `setting.api_config_log`
- 🧩 **Scalable** — integrasi baru = 1 row insert, bukan kolom baru + migration

---

## 4. `log.*` — audit trail

### `log.jejak_audit`

Mirip `simbak.log.jejak_audit`. Satu row per mutasi.

| col | type | note |
|---|---|---|
| id_jejak_audit | UUID PK | |
| id_actor | UUID NOT NULL | user SSO |
| nm_actor | VARCHAR(200) NOT NULL | cached |
| action | VARCHAR(40) NOT NULL | CREATE / UPDATE / SUBMIT / RETRY / ARCHIVE / LOGIN_SIMKATMAWA / etc. |
| target_tipe | VARCHAR(16) NULL | PRESTASI / SERTIFIKASI / REKOGNISI / REF / CREDENTIAL |
| id_target | UUID NULL | |
| detail | JSONB NULL | diff sebelum/sesudah |
| ip_address | VARCHAR(45) NULL | |
| user_agent | TEXT NULL | |
| created_at | TIMESTAMPTZ DEFAULT NOW() | |

### `log.aktivitas_data`

(Opsional Phase 1, wajib kalau audit external) — log INSERT/UPDATE/DELETE per tabel pakai trigger mirip SIMBAK `log.aktivitas_data`.

---

## 5. Cross-DB references (pdut SQL Server, read-only)

Di-query via `DB::connection('sqlsrv')` di `PdutRepository` pattern SIMBAK. **Tidak ada FK fisik** (beda DB). Konvensi: kolom suffix `_pdut` menandakan referensi cross-DB.

| Butuh | Source pdut | Contoh query |
|---|---|---|
| Mahasiswa by NIM | `siakadu.peserta_didik` + `siakadu.reg_pd` + `pdrd.sms` + `man_akses.unit_organisasi` | `JOIN` chain sama seperti di SIMBAK (filter `reg_pd.id_jns_keluar IS NULL` untuk mahasiswa aktif, tapi untuk prestasi historis boleh ambil semua) |
| Fakultas | `man_akses.unit_organisasi` | filter `kode_unit LIKE 'FK%'` |
| Prodi by id_sms | `pdrd.sms` | — |
| Dosen by NUPTK/NIDN | `ref.sdm` | cek `jns_sdm` = dosen |
| Jenjang mahasiswa | `ref.jenjang_pendidikan` | per konvensi CLAUDE.md, jangan pakai `siakadu.jenjang_pendidikan` |

Konvensi PDUT per CLAUDE.md (harus dipatuhi):
```
Prodi:    pdrd.sms                  (BUKAN siakadu.sms)
Jenjang:  ref.jenjang_pendidikan    (BUKAN siakadu.jenjang_pendidikan)
Fakultas: man_akses.unit_organisasi (BUKAN siakadu.ref_unit)
Angkatan: siakadu.reg_pd.angkatan   (BUKAN YEAR(tgl_masuk_sp))
Status:   peserta_didik.id_stat_mhs → siakadu.status_mahasiswa
```

---

## 6. Compatibility dengan `pdut.pdrd.prestasi` (751 rows existing)

Field-by-field kesetaraan — supaya kalau user memutuskan **backfill** data lama ke SI-Prestasi, mapping-nya jelas:

| pdut.pdrd.prestasi | prestasi.prestasi_mandiri | Catatan |
|---|---|---|
| id_prestasi (uuid) | id_prestasi_pdut (UNIQUEIDENTIFIER) | di-copy untuk traceback |
| id_jenis_prestasi (int) | id_kategori_prestasi (via ref.kategori_prestasi.id_jenis_prestasi_pdut) | best-effort — lookup kategori yang `id_jenis_prestasi_pdut` match |
| id_tkt_prestasi (int) | id_level_prestasi (via ref.level_prestasi.id_tkt_prestasi_pdut) | straight mapping (3→KAB, 4→PROV, 5→NAS, 6→INT). 1,2,7,9 (Sekolah/Kecamatan/Regional/Lainnya) → **skip**, tidak valid di SIMKATMAWA |
| nm_prestasi (160) | nm_lomba (255) | capacity naik, kompatibel |
| thn_prestasi (numeric 4) | thn_prestasi (SMALLINT) | langsung |
| penyelenggara (100) | nm_penyelenggara (255) | kompatibel |
| peringkat (numeric 1) | id_peringkat (via ref.peringkat.peringkat_pdut) | perlu konfirmasi mapping numeric → kode SIMKATMAWA |
| id_pd (uuid, single) | prestasi.peserta_mhs row tunggal | insert 1 row di child |
| id_akt_mhs | — | drop, tidak relevan |
| id_sp | — | Unila saja, di SI-Prestasi implicit lewat kode_pt |
| create_date, id_creator, last_update, id_updater, soft_delete, last_sync | created_at, id_creator, updated_at, id_updater, soft_delete | rename straight |

Field yang hilang & HARUS diisi manual kalau backfill:
- `nm_cabang` — default NULL / "-"
- `jumlah_unit_peserta` — default 1
- `id_kelompok_prestasi` — default INDIVIDU (atau derived dari jumlah mahasiswa di feeder)
- `id_bentuk_pelaksanaan` — default LURING
- `url_peserta`, `url_sertifikat`, `url_foto_upp`, `url_dokumen_undangan` — tidak ada, NULL
- `tgl_sertifikat` — tidak ada tanggal presisi di feeder, pakai `DATE(thn_prestasi || '-12-31')` sebagai placeholder atau minta ops isi manual

**Keputusan backfill:** belum diputuskan. Default Plan: **tidak backfill otomatis**, user operator input manual prestasi terbaru di SI-Prestasi. Data lama di `pdut.pdrd.prestasi` tetap di sana untuk kebutuhan PDDIKTI feeder. Kalau user mau backfill sebagai seed awal, lihat §7 (proses backfill).

---

## 7. Proses backfill opsional (kalau user setuju)

1. Seed referensi dulu (level_prestasi, kategori_prestasi, peringkat dengan mapping pdut)
2. Buat Artisan command `php artisan siprestasi:import-pdut --dry-run`
3. Command:
   - `SELECT * FROM pdut.pdrd.prestasi WHERE soft_delete=0 AND id_tkt_prestasi IN (3,4,5,6)`
   - Lookup mahasiswa via id_pd
   - Map jenis_prestasi → kategori_prestasi (default ke "MINAT" kalau tidak match)
   - Map peringkat numeric → kode SIMKATMAWA
   - Insert ke `prestasi.prestasi_mandiri` + `prestasi.peserta_mhs` dalam transaction
   - Set `status_workflow='draft'` (tidak auto-submit)
   - Set `id_prestasi_pdut` untuk trace
4. Ops review hasil, edit field placeholder (cabang, tanggal, url) sebelum ubah status ke `ready`

Filter pdut:
- SKIP `id_tkt_prestasi IN (1,2,7,9)` (tidak valid SIMKATMAWA)
- SKIP row tanpa `id_pd` valid
- SKIP row yang sudah `soft_delete=1`

---

## 8. Ringkasan pilihan desain

| # | Keputusan | Rekomendasi | Alternatif |
|---|---|---|---|
| 8.1 | Database | PostgreSQL `si_prestasi` di host simbak | Schema `simkatmawa` di DB simbak (menghemat container, tapi beda domain) |
| 8.2 | Child peserta | Polymorphic (`parent_tipe`) | 3 pasang tabel terpisah (eksplisit tapi duplikasi) |
| 8.3 | Sync tracking | Append-only `sync.submission` | Update-in-place + separate attempt log |
| 8.4 | Reference seed | Double code (SIMKATMAWA + pdut) | SIMKATMAWA only (putus kompat pdut) |
| 8.5 | Backfill pdrd.prestasi | NO default (manual import) | Auto-import 751 rows (butuh sign-off) |
| 8.6 | Token cache | Redis | `sync.token_cache` table |
| 8.7 | Soft delete vs archive | Keep both (`soft_delete` + `status_workflow=archived`) | Hanya soft_delete |
| 8.8 | Enum master data | Read-only di UI (seed di migration) | Admin bisa edit (risiko payload invalid) |

---

## 9. Konvensi tipe data (ikut SIMBAK + standar myunila pdut)

| Tipe logis | PostgreSQL | Alasan / mirror pdut |
|---|---|---|
| PK UUID | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` | SIMBAK pattern |
| FK internal UUID | `UUID NOT NULL REFERENCES schema.table(id_col)` | — |
| FK cross-DB ke pdut (GUID) | `UUID` (simpan nilai guid SQL Server) | SQL Server `uniqueidentifier` = 128-bit GUID, kompatibel ditaruh di UUID Postgres |
| FK cross-DB ke pdut (int) | `INT` | mirror `pdut.ref.*.id_*` |
| Nama pendek | `VARCHAR(N)` | lihat pdut — nm_prestasi=160, penyelenggara=100, nm_pd=255 |
| Kode/enum string | `VARCHAR(8..30)` | — |
| Teks panjang / URL | `TEXT` | URL SIMKATMAWA bisa >255 char |
| Tahun | `SMALLINT` atau `NUMERIC(4)` | pdut pakai `numeric(4)`; kita boleh SMALLINT (-32768..32767, cukup) |
| Peringkat numeric | `NUMERIC(1)` | mirror `pdut.pdrd.prestasi.peringkat` |
| Bool | `BOOLEAN NOT NULL DEFAULT TRUE/FALSE` | prefix kolom `a_` |
| Tanggal saja | `DATE` | tgl_sertifikat SIMKATMAWA |
| Timestamp | `TIMESTAMP NOT NULL DEFAULT NOW()` | SIMBAK pakai `TIMESTAMP`, bukan `TIMESTAMPTZ` |
| JSON | `JSONB` | untuk payload SIMKATMAWA, retry_policy, diff audit |

**Referensi pdut yang ditiru:** panjang VARCHAR untuk `nm_*` ikut pdut (biasanya 100, 160, 200, 255). Jangan pakai `VARCHAR(MAX)` atau `TEXT` kalau pdut kolom pendek.

---

## 10. TIDAK pakai Laravel migrations

Domain schema di-owned oleh `data-model/`, bukan Laravel. `backend/si-prestasi-service/database/migrations/` dibiarkan minim (cuma migration Laravel built-in untuk queue/cache/sessions kalau perlu, karena pakai Redis biasanya tidak perlu).

Deploy script apply SQL via psql:
```bash
PGPASSWORD=$SI_PRESTASI_PG_PASSWORD psql \
  -h $SI_PRESTASI_PG_HOST -U $SI_PRESTASI_PG_USERNAME -d si_prestasi \
  -f /var/www/my-unila/data-model/script/postgresql/si_prestasi/si_prestasi_v1.0_fresh.sql

PGPASSWORD=$SI_PRESTASI_PG_PASSWORD psql \
  -h $SI_PRESTASI_PG_HOST -U $SI_PRESTASI_PG_USERNAME -d si_prestasi \
  -f /var/www/my-unila/data-model/script/postgresql/si_prestasi/si_prestasi_v1.0_seed.sql
```

Versi upgrade pakai file `alter`:
```bash
psql ... -f si_prestasi_v1.0_to_v1.1_alter.sql
```

Seeder Laravel `RefPrestasiSeeder.php` TIDAK dibuat — seed data semua via SQL seed file.
