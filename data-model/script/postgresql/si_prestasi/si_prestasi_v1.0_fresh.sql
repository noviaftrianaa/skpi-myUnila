-- =====================================================
-- Script:  SI-Prestasi - Sistem Informasi Pelaporan Prestasi Mahasiswa
-- Database: PostgreSQL (dedicated DB: si_prestasi)
-- Version: 1.0
-- Date:    2026-04-19
-- Author:  Dev team MyUnila
-- Description:
--   Modul pelaporan prestasi, sertifikasi, dan rekognisi mahasiswa
--   terintegrasi dengan SIMKATMAWA Kemdiktisaintek + portal MyUnila.
--   DB terpisah menggunakan PostgreSQL untuk transaksi.
--
--   Schemas:
--     - ref       : Data referensi/master (level, kategori, peringkat, bentuk, jenis rekognisi)
--     - prestasi  : Transaksi prestasi mandiri, sertifikasi, rekognisi + peserta mhs/dosen
--     - sync      : Tracking pengiriman ke SIMKATMAWA (request/response, retry)
--     - setting   : Runtime config multi-API eksternal (SIMKATMAWA, PDDIKTI, dst)
--     - log       : Jejak audit aksi pengguna
--
--   Tables:
--     ref.level_prestasi         - Master level KAB/PROV/NAS/INT + mapping pdut
--     ref.kategori_prestasi      - Master kategori RISNOV/SENBUD/OLAHRAGA/MINAT/RISNOVSSH
--     ref.peringkat              - Master peringkat JUARA1..PESERTA + mapping pdut
--     ref.kelompok_prestasi      - INDIVIDU / KELOMPOK
--     ref.bentuk_pelaksanaan     - DARING / LURING
--     ref.jenis_rekognisi        - SERKOM / JURIOR / ... / PKD (14 jenis)
--     ref.tipe_sync              - PRESTASI / SERTIFIKASI / REKOGNISI + path API
--     prestasi.prestasi_mandiri  - Header prestasi kejuaraan
--     prestasi.sertifikasi       - Header sertifikasi
--     prestasi.rekognisi         - Header rekognisi
--     prestasi.peserta_mhs       - Child multi-mahasiswa (polymorphic)
--     prestasi.peserta_dosen     - Child multi-dosen pembimbing (polymorphic)
--     sync.submission            - Append-only history push ke SIMKATMAWA
--     sync.token_cache           - Cache JWT SIMKATMAWA (alternatif Redis)
--     setting.api_config         - Konfigurasi API eksternal (encrypted creds)
--     setting.api_config_log     - Audit trail perubahan api_config
--     log.jejak_audit            - Log aksi pengguna (CREATE/UPDATE/SUBMIT/...)
--
--   Naming Convention:
--     - Schema: ref, prestasi, sync, setting, log
--     - PK: id_<tabel> UUID DEFAULT gen_random_uuid()
--     - FK internal: id_<referensi> UUID REFERENCES <schema>.<tabel>(id_<tabel>)
--     - FK cross-DB pdut: suffix _pdut (tanpa FK fisik — cross-engine)
--       * id_*_pdut UUID untuk GUID pdut (uniqueidentifier SQL Server)
--       * id_jenis_prestasi_pdut INT, id_tkt_prestasi_pdut INT, peringkat_pdut NUMERIC(1)
--     - Name: nm_<field>
--     - Date: tgl_<field>
--     - Boolean: a_<field> BOOLEAN DEFAULT FALSE/TRUE
--     - Audit: id_creator, id_updater, created_at, updated_at, soft_delete
--     - Index: idx_<tabel>_<kolom>
--
--   Cross-DB (read-only referensi dari SQL Server pdut):
--     - pdut.siakadu.peserta_didik  - data mahasiswa (lookup by NIM)
--     - pdut.siakadu.reg_pd         - registrasi per semester
--     - pdut.pdrd.sms               - prodi
--     - pdut.man_akses.unit_organisasi - fakultas
--     - pdut.ref.sdm                - data SDM (dosen, lookup NUPTK/NIDN)
--     - pdut.ref.jenis_prestasi     - referensi jenis prestasi legacy (mapping)
--     - pdut.ref.tingkat_prestasi   - referensi tingkat prestasi legacy (mapping)
--     - pdut.pdrd.prestasi          - prestasi feeder PDDIKTI legacy (traceback)
-- =====================================================

-- =====================================================
-- Step 0: Create Database, Extensions & Schemas
-- =====================================================
-- CREATE DATABASE si_prestasi;  -- jalankan dari superuser
-- \c si_prestasi

-- Hapus schema public (tidak dipakai, semua tabel di schema khusus)
DROP SCHEMA IF EXISTS public CASCADE;

-- Buat schema khusus
CREATE SCHEMA IF NOT EXISTS ref;        -- data master/referensi
CREATE SCHEMA IF NOT EXISTS prestasi;   -- transaksi prestasi/sertifikasi/rekognisi
CREATE SCHEMA IF NOT EXISTS sync;       -- tracking push ke SIMKATMAWA
CREATE SCHEMA IF NOT EXISTS setting;    -- runtime config multi-API
CREATE SCHEMA IF NOT EXISTS log;        -- jejak audit, aktivitas, dan perubahan data

-- gen_random_uuid() bawaan PostgreSQL 13+, tidak perlu extension uuid-ossp
SET search_path TO ref, prestasi, sync, setting, log;


-- =============================================================================
-- SCHEMA: ref
-- Berisi data master/referensi yang jarang berubah (enum SIMKATMAWA).
-- Setiap tabel mendukung mapping ke pdut.ref.* via kolom *_pdut (opsional).
-- =============================================================================

-- =====================================================
-- Step 1: CREATE TABLE ref.level_prestasi
-- =====================================================
-- Master level prestasi sesuai enum SIMKATMAWA: KAB/PROV/NAS/INT.
-- Mapping ke pdut.ref.tingkat_prestasi via id_tkt_prestasi_pdut.

CREATE TABLE IF NOT EXISTS ref.level_prestasi (
    id_level_prestasi   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_simkatmawa     VARCHAR(8)      NOT NULL UNIQUE,
                                        -- KAB / PROV / NAS / INT
    nm_level            VARCHAR(60)     NOT NULL,
                                        -- Kabupaten/Kota, Provinsi, Nasional, Internasional
    id_tkt_prestasi_pdut INT            NULL,
                                        -- Mapping ke pdut.ref.tingkat_prestasi.id_tkt_prestasi
                                        -- (3=Kab/kota, 4=Propinsi, 5=Nasional, 6=Internasional)
    urutan              INT             NOT NULL DEFAULT 0,
                                        -- urutan tampil di dropdown UI
    a_active            BOOLEAN         NOT NULL DEFAULT TRUE,
    a_ref_simkatmawa    BOOLEAN         NOT NULL DEFAULT TRUE,
                                        -- TRUE jika level valid dikirim ke SIMKATMAWA
    a_ref_pddikti       BOOLEAN         NOT NULL DEFAULT FALSE,
                                        -- TRUE jika level dipakai di feeder PDDIKTI (opsional)
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.level_prestasi IS 'Master level prestasi SIMKATMAWA (KAB/PROV/NAS/INT) + mapping ke pdut.ref.tingkat_prestasi';
COMMENT ON COLUMN ref.level_prestasi.kode_simkatmawa IS 'Kode yang dikirim ke SIMKATMAWA (field "level"): KAB/PROV/NAS/INT';
COMMENT ON COLUMN ref.level_prestasi.id_tkt_prestasi_pdut IS 'Mapping ke pdut.ref.tingkat_prestasi.id_tkt_prestasi (NULL jika tidak ada di pdut)';
COMMENT ON COLUMN ref.level_prestasi.a_ref_simkatmawa IS 'TRUE jika kode valid dikirim ke API SIMKATMAWA';


-- =====================================================
-- Step 2: CREATE TABLE ref.kategori_prestasi
-- =====================================================
-- Master kategori prestasi mandiri sesuai enum SIMKATMAWA:
-- RISNOV/RISNOVSSH/SENBUD/OLAHRAGA/MINAT.
-- Mapping ke pdut.ref.jenis_prestasi via id_jenis_prestasi_pdut.

CREATE TABLE IF NOT EXISTS ref.kategori_prestasi (
    id_kategori_prestasi UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_simkatmawa     VARCHAR(16)     NOT NULL UNIQUE,
                                        -- RISNOV, RISNOVSSH, SENBUD, OLAHRAGA, MINAT
    nm_kategori         VARCHAR(100)    NOT NULL,
                                        -- "Riset dan Inovasi STEM", dst
    id_jenis_prestasi_pdut INT          NULL,
                                        -- Mapping ke pdut.ref.jenis_prestasi.id_jenis_prestasi
                                        -- (1=Sains, 2=Seni, 3=Olahraga, 9=Lain-lain)
                                        -- Best-effort (pdut hanya 4 kategori vs SIMKATMAWA 5)
    urutan              INT             NOT NULL DEFAULT 0,
    a_active            BOOLEAN         NOT NULL DEFAULT TRUE,
    a_ref_simkatmawa    BOOLEAN         NOT NULL DEFAULT TRUE,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.kategori_prestasi IS 'Master kategori prestasi mandiri SIMKATMAWA (5 kategori) + best-effort mapping ke pdut jenis_prestasi';
COMMENT ON COLUMN ref.kategori_prestasi.kode_simkatmawa IS 'Kode yang dikirim ke SIMKATMAWA (field "kategori")';
COMMENT ON COLUMN ref.kategori_prestasi.id_jenis_prestasi_pdut IS 'Mapping ke pdut.ref.jenis_prestasi.id_jenis_prestasi — kolisi mungkin karena pdut lebih kasar';


-- =====================================================
-- Step 3: CREATE TABLE ref.peringkat
-- =====================================================
-- Master peringkat prestasi SIMKATMAWA (8 nilai).
-- Mapping ke numeric(1) pdut.pdrd.prestasi.peringkat.

CREATE TABLE IF NOT EXISTS ref.peringkat (
    id_peringkat        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_simkatmawa     VARCHAR(16)     NOT NULL UNIQUE,
                                        -- JUARA1, JUARA2, JUARA3,
                                        -- HARAPAN1, HARAPAN2, HARAPAN3,
                                        -- APRESIASI, PESERTA
    nm_peringkat        VARCHAR(60)     NOT NULL,
    peringkat_pdut      NUMERIC(1)      NULL,
                                        -- Mapping ke pdut.pdrd.prestasi.peringkat
                                        -- (asumsi: 1-6 juara/harapan, 7=apresiasi, 8=peserta)
                                        -- Nilai final perlu dikonfirmasi via distribusi data pdut.
    urutan              INT             NOT NULL DEFAULT 0,
    nilai_bobot         NUMERIC(4,2)    NULL,
                                        -- Bobot internal untuk skoring (opsional)
    a_active            BOOLEAN         NOT NULL DEFAULT TRUE,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.peringkat IS 'Master peringkat prestasi SIMKATMAWA (8 nilai) + mapping ke pdut peringkat numeric(1)';
COMMENT ON COLUMN ref.peringkat.kode_simkatmawa IS 'Kode yang dikirim ke SIMKATMAWA (field "peringkat")';
COMMENT ON COLUMN ref.peringkat.peringkat_pdut IS 'Nilai numeric(1) yang dipakai di pdut.pdrd.prestasi.peringkat';


-- =====================================================
-- Step 4: CREATE TABLE ref.kelompok_prestasi
-- =====================================================
-- INDIVIDU / KELOMPOK

CREATE TABLE IF NOT EXISTS ref.kelompok_prestasi (
    id_kelompok_prestasi UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_simkatmawa     VARCHAR(16)     NOT NULL UNIQUE,
                                        -- INDIVIDU / KELOMPOK
    nm_kelompok         VARCHAR(40)     NOT NULL,
    urutan              INT             NOT NULL DEFAULT 0,
    a_active            BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.kelompok_prestasi IS 'Master kelompok prestasi SIMKATMAWA: INDIVIDU / KELOMPOK';


-- =====================================================
-- Step 5: CREATE TABLE ref.bentuk_pelaksanaan
-- =====================================================
-- DARING / LURING

CREATE TABLE IF NOT EXISTS ref.bentuk_pelaksanaan (
    id_bentuk_pelaksanaan UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_simkatmawa     VARCHAR(8)      NOT NULL UNIQUE,
                                        -- DARING / LURING
    nm_bentuk           VARCHAR(40)     NOT NULL,
    urutan              INT             NOT NULL DEFAULT 0,
    a_active            BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.bentuk_pelaksanaan IS 'Master bentuk pelaksanaan SIMKATMAWA: DARING / LURING';


-- =====================================================
-- Step 6: CREATE TABLE ref.jenis_rekognisi
-- =====================================================
-- 14 jenis rekognisi per enum SIMKATMAWA.

CREATE TABLE IF NOT EXISTS ref.jenis_rekognisi (
    id_jenis_rekognisi  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_simkatmawa     VARCHAR(16)     NOT NULL UNIQUE,
                                        -- SERKOM, JURIOR, JURINOR, KEYCONF, KEYWORK,
                                        -- PAMERAN, KARYA, BUKU, PATEN, PUB, DUTA,
                                        -- PTG, PSB, PKD
    nm_jenis            VARCHAR(120)    NOT NULL,
    urutan              INT             NOT NULL DEFAULT 0,
    a_active            BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.jenis_rekognisi IS 'Master jenis rekognisi SIMKATMAWA (14 jenis: SERKOM/JURIOR/JURINOR/KEYCONF/KEYWORK/PAMERAN/KARYA/BUKU/PATEN/PUB/DUTA/PTG/PSB/PKD)';


-- =====================================================
-- Step 7: CREATE TABLE ref.tipe_sync
-- =====================================================
-- Enum jenis laporan yang dikirim ke SIMKATMAWA.

CREATE TABLE IF NOT EXISTS ref.tipe_sync (
    id_tipe_sync        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode                VARCHAR(16)     NOT NULL UNIQUE,
                                        -- PRESTASI, SERTIFIKASI, REKOGNISI
    nm_tipe             VARCHAR(40)     NOT NULL,
    path_api            VARCHAR(60)     NOT NULL,
                                        -- /api/prestasi-mandiri, /api/sertifikasi, /api/rekognisi
    a_active            BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.tipe_sync IS 'Enum tipe laporan SIMKATMAWA + path endpoint API';


-- =============================================================================
-- SCHEMA: prestasi
-- Core transaksi 3 tipe (prestasi mandiri, sertifikasi, rekognisi)
-- + child polymorphic untuk mahasiswa & dosen peserta.
-- =============================================================================

-- =====================================================
-- Step 8: CREATE TABLE prestasi.prestasi_mandiri
-- =====================================================
-- Header prestasi kejuaraan. Field lengkap sesuai payload
-- SIMKATMAWA /api/prestasi-mandiri.

CREATE TABLE IF NOT EXISTS prestasi.prestasi_mandiri (
    id_prestasi_mandiri UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_pt             VARCHAR(10)     NULL,
                                        -- Cached dari response SIMKATMAWA (kode_pt Unila)
    thn_prestasi        SMALLINT        NOT NULL,
                                        -- Tahun pelaksanaan (biasanya = YEAR(tgl_sertifikat))
    id_level_prestasi   UUID            NOT NULL REFERENCES ref.level_prestasi(id_level_prestasi),
    id_kategori_prestasi UUID           NOT NULL REFERENCES ref.kategori_prestasi(id_kategori_prestasi),
    nm_lomba            VARCHAR(255)    NOT NULL,
                                        -- SIMKATMAWA field "lomba"
    nm_cabang           VARCHAR(200)    NULL,
                                        -- SIMKATMAWA field "cabang"
    nm_penyelenggara    VARCHAR(255)    NOT NULL,
                                        -- SIMKATMAWA field "penyelenggara"
    id_peringkat        UUID            NOT NULL REFERENCES ref.peringkat(id_peringkat),
    jumlah_unit_peserta INT             NOT NULL DEFAULT 0,
                                        -- Jumlah PT (NAS) atau negara (INT) yang ikut
    id_kelompok_prestasi UUID           NOT NULL REFERENCES ref.kelompok_prestasi(id_kelompok_prestasi),
    id_bentuk_pelaksanaan UUID          NOT NULL REFERENCES ref.bentuk_pelaksanaan(id_bentuk_pelaksanaan),
    url_peserta         TEXT            NULL,
    url_sertifikat      TEXT            NULL,
    tgl_sertifikat      DATE            NOT NULL,
    url_foto_upp        TEXT            NULL,
    url_dokumen_undangan TEXT           NULL,
    keterangan          TEXT            NULL,
    status_workflow     VARCHAR(16)     NOT NULL DEFAULT 'draft',
                                        -- draft / review / ready / sending / sent / error / archived
    id_fakultas         VARCHAR(8)      NULL,
                                        -- Ownership fakultas; mapping ke
                                        -- pdut.man_akses.unit_organisasi.kd_unit
    id_prestasi_pdut    UUID            NULL,
                                        -- Traceback ke pdut.pdrd.prestasi.id_prestasi
                                        -- (hanya diisi jika record hasil backfill dari feeder legacy)
    id_pengaju          UUID            NULL,
                                        -- Pemohon pengajuan (mahasiswa di Phase 2);
                                        -- NULL jika admin input manual atas nama
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,
    CHECK (status_workflow IN ('draft','review','ready','sending','sent','error','archived'))
);

CREATE INDEX IF NOT EXISTS idx_prestasi_mandiri_tahun_level
    ON prestasi.prestasi_mandiri (thn_prestasi, id_level_prestasi, id_kategori_prestasi)
    WHERE soft_delete = FALSE;
CREATE INDEX IF NOT EXISTS idx_prestasi_mandiri_status
    ON prestasi.prestasi_mandiri (status_workflow)
    WHERE soft_delete = FALSE;
CREATE INDEX IF NOT EXISTS idx_prestasi_mandiri_fakultas
    ON prestasi.prestasi_mandiri (id_fakultas)
    WHERE soft_delete = FALSE;
CREATE INDEX IF NOT EXISTS idx_prestasi_mandiri_pdut
    ON prestasi.prestasi_mandiri (id_prestasi_pdut)
    WHERE id_prestasi_pdut IS NOT NULL;

COMMENT ON TABLE prestasi.prestasi_mandiri IS 'Header prestasi kejuaraan mahasiswa (SIMKATMAWA /api/prestasi-mandiri)';
COMMENT ON COLUMN prestasi.prestasi_mandiri.kode_pt IS 'Kode PT Unila di SIMKATMAWA — cached dari response login';
COMMENT ON COLUMN prestasi.prestasi_mandiri.status_workflow IS 'State machine: draft/review/ready/sending/sent/error/archived';
COMMENT ON COLUMN prestasi.prestasi_mandiri.id_fakultas IS 'Fakultas ownership — mapping ke pdut.man_akses.unit_organisasi.kd_unit';
COMMENT ON COLUMN prestasi.prestasi_mandiri.id_prestasi_pdut IS 'Traceback ke pdut.pdrd.prestasi.id_prestasi (hanya jika backfill dari feeder)';
COMMENT ON COLUMN prestasi.prestasi_mandiri.id_pengaju IS 'Pemohon (mahasiswa di Phase 2+); NULL jika admin input manual';


-- =====================================================
-- Step 9: CREATE TABLE prestasi.sertifikasi
-- =====================================================
-- Header sertifikasi. Tanpa kategori/peringkat/cabang/kelompok/bentuk
-- (sesuai payload SIMKATMAWA /api/sertifikasi).

CREATE TABLE IF NOT EXISTS prestasi.sertifikasi (
    id_sertifikasi      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_pt             VARCHAR(10)     NULL,
    thn_prestasi        SMALLINT        NOT NULL,
    id_level_prestasi   UUID            NOT NULL REFERENCES ref.level_prestasi(id_level_prestasi),
    nm_sertifikasi      VARCHAR(255)    NOT NULL,
                                        -- SIMKATMAWA field "nama"
    nm_penyelenggara    VARCHAR(255)    NOT NULL,
    url_peserta         TEXT            NULL,
    url_sertifikat      TEXT            NULL,
    tgl_sertifikat      DATE            NOT NULL,
    url_foto_upp        TEXT            NULL,
    url_dokumen_undangan TEXT           NULL,
    keterangan          TEXT            NULL,
    status_workflow     VARCHAR(16)     NOT NULL DEFAULT 'draft',
    id_fakultas         VARCHAR(8)      NULL,
    id_pengaju          UUID            NULL,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,
    CHECK (status_workflow IN ('draft','review','ready','sending','sent','error','archived'))
);

CREATE INDEX IF NOT EXISTS idx_sertifikasi_tahun_level
    ON prestasi.sertifikasi (thn_prestasi, id_level_prestasi)
    WHERE soft_delete = FALSE;
CREATE INDEX IF NOT EXISTS idx_sertifikasi_status
    ON prestasi.sertifikasi (status_workflow)
    WHERE soft_delete = FALSE;
CREATE INDEX IF NOT EXISTS idx_sertifikasi_fakultas
    ON prestasi.sertifikasi (id_fakultas)
    WHERE soft_delete = FALSE;

COMMENT ON TABLE prestasi.sertifikasi IS 'Header sertifikasi mahasiswa (SIMKATMAWA /api/sertifikasi)';
COMMENT ON COLUMN prestasi.sertifikasi.nm_sertifikasi IS 'SIMKATMAWA field "nama" — nama sertifikasi (bukan "lomba")';


-- =====================================================
-- Step 10: CREATE TABLE prestasi.rekognisi
-- =====================================================
-- Header rekognisi. Seperti sertifikasi + id_jenis_rekognisi
-- (SIMKATMAWA field "jenis": SERKOM/JURIOR/.../PKD).

CREATE TABLE IF NOT EXISTS prestasi.rekognisi (
    id_rekognisi        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_pt             VARCHAR(10)     NULL,
    thn_prestasi        SMALLINT        NOT NULL,
    id_level_prestasi   UUID            NOT NULL REFERENCES ref.level_prestasi(id_level_prestasi),
    id_jenis_rekognisi  UUID            NOT NULL REFERENCES ref.jenis_rekognisi(id_jenis_rekognisi),
    nm_rekognisi        VARCHAR(255)    NOT NULL,
                                        -- SIMKATMAWA field "nama"
    nm_penyelenggara    VARCHAR(255)    NOT NULL,
    url_peserta         TEXT            NULL,
    url_sertifikat      TEXT            NULL,
    tgl_sertifikat      DATE            NOT NULL,
    url_foto_upp        TEXT            NULL,
    url_dokumen_undangan TEXT           NULL,
    keterangan          TEXT            NULL,
    status_workflow     VARCHAR(16)     NOT NULL DEFAULT 'draft',
    id_fakultas         VARCHAR(8)      NULL,
    id_pengaju          UUID            NULL,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,
    CHECK (status_workflow IN ('draft','review','ready','sending','sent','error','archived'))
);

CREATE INDEX IF NOT EXISTS idx_rekognisi_tahun_level
    ON prestasi.rekognisi (thn_prestasi, id_level_prestasi)
    WHERE soft_delete = FALSE;
CREATE INDEX IF NOT EXISTS idx_rekognisi_status
    ON prestasi.rekognisi (status_workflow)
    WHERE soft_delete = FALSE;
CREATE INDEX IF NOT EXISTS idx_rekognisi_jenis
    ON prestasi.rekognisi (id_jenis_rekognisi);
CREATE INDEX IF NOT EXISTS idx_rekognisi_fakultas
    ON prestasi.rekognisi (id_fakultas)
    WHERE soft_delete = FALSE;

COMMENT ON TABLE prestasi.rekognisi IS 'Header rekognisi mahasiswa (SIMKATMAWA /api/rekognisi)';


-- =====================================================
-- Step 11: CREATE TABLE prestasi.peserta_mhs
-- =====================================================
-- Child polymorphic — daftar mahasiswa yang terlibat.
-- Satu row = 1 mahasiswa di 1 prestasi/sertifikasi/rekognisi.

-- Design note:
--   TIDAK dibuat tabel "mahasiswa" terpisah di si_prestasi — master tetap di pdut.
--   peserta_mhs berfungsi sebagai junction + cache minimal (NIM + nama + prodi)
--   supaya list prestasi bisa dirender tanpa join cross-DB tiap row.
--
--   HIERARKI pdut yang dimanfaatkan (tidak perlu duplikasi lokal):
--     pdrd.reg_pd (id_reg_pd, id_pd, id_sms, id_smt) = registrasi per-semester
--       └── id_pd → pdrd.peserta_didik / siakadu.mahasiswa (data mhs + NIM)
--       └── id_sms → pdrd.sms (prodi, id_jns_sms=3)
--             └── id_fak_unila / id_induk_sms → pdrd.sms (fakultas, id_jns_sms=1)
--
--   Jadi hanya butuh id_reg_pd_pdut (atau NIM fallback) + id_sms_pdut di peserta_mhs.
--   id_pd TIDAK disimpan karena derivable via reg_pd.id_pd atau lookup NIM.
--   FAKULTAS TIDAK disimpan karena derivable via hierarchy pdrd.sms.
--
--   Catatan: staging pdut hanya ~36% prodi yang punya id_fak_unila populated.
--   Lookup service backend: id_fak_unila direct dulu, fallback traverse id_induk_sms.
--   Cache hasil lookup per-id_sms di Redis kalau perlu (TTL panjang — data jarang berubah).
--
--   Key referensi minimal ke pdut:
--     - NIM              (primary search key, selalu diisi user/form)
--     - id_reg_pd_pdut   → pdut.pdrd.reg_pd.id_reg_pd (registrasi semester PDDIKTI)
--     - id_sms_pdut      → pdut.pdrd.sms.id_sms (prodi; derive fakultas via join)

CREATE TABLE IF NOT EXISTS prestasi.peserta_mhs (
    id_peserta_mhs      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_parent           UUID            NOT NULL,
                                        -- FK ke prestasi_mandiri/sertifikasi/rekognisi
                                        -- tergantung parent_tipe
    parent_tipe         VARCHAR(16)     NOT NULL,
                                        -- PRESTASI / SERTIFIKASI / REKOGNISI
    nim                 VARCHAR(20)     NOT NULL,
                                        -- SIMKATMAWA field "mahasiswa[].nim"
                                        -- Primary lookup key; selalu cocok ke
                                        -- pdut.siakadu.mahasiswa.nim atau
                                        -- pdut.pdrd.peserta_didik (via id_pd FK)
    nm_mahasiswa        VARCHAR(200)    NOT NULL,
                                        -- SIMKATMAWA field "mahasiswa[].nama"; cache dari pdut
    id_reg_pd_pdut      UUID            NULL,
                                        -- Mapping ke pdut.pdrd.reg_pd.id_reg_pd
                                        -- (uniqueidentifier PDDIKTI per registrasi semester)
                                        -- Diisi dengan registrasi aktif saat prestasi didapat.
                                        -- Format PDDIKTI standar untuk pelaporan feeder.
                                        -- id_pd derivable via reg_pd.id_pd — tidak perlu di-cache.
    id_sms_pdut         UUID            NULL,
                                        -- Mapping ke pdut.pdrd.sms.id_sms (prodi, id_jns_sms=3)
                                        -- Fakultas derivable via JOIN self-ref pdrd.sms
                                        -- (id_fak_unila / id_induk_sms yang id_jns_sms=1).
    nm_prodi            VARCHAR(200)    NULL,
                                        -- Cache dari pdrd.sms.nm_lemb (prodi)
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    CHECK (parent_tipe IN ('PRESTASI','SERTIFIKASI','REKOGNISI')),
    UNIQUE (id_parent, parent_tipe, nim)
);

CREATE INDEX IF NOT EXISTS idx_peserta_mhs_nim
    ON prestasi.peserta_mhs (nim);
CREATE INDEX IF NOT EXISTS idx_peserta_mhs_id_reg_pd
    ON prestasi.peserta_mhs (id_reg_pd_pdut)
    WHERE id_reg_pd_pdut IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_peserta_mhs_id_sms
    ON prestasi.peserta_mhs (id_sms_pdut)
    WHERE id_sms_pdut IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_peserta_mhs_parent
    ON prestasi.peserta_mhs (id_parent, parent_tipe);

COMMENT ON TABLE prestasi.peserta_mhs IS 'Child polymorphic: mahasiswa peserta prestasi/sertifikasi/rekognisi (multi-student support). Bukan tabel master mahasiswa — master tetap di pdut. id_pd derivable dari reg_pd.id_pd, fakultas dari sms hierarchy — tidak disimpan lokal.';
COMMENT ON COLUMN prestasi.peserta_mhs.parent_tipe IS 'Discriminator: PRESTASI / SERTIFIKASI / REKOGNISI';
COMMENT ON COLUMN prestasi.peserta_mhs.nim IS 'NIM mahasiswa — primary lookup key ke pdut (siakadu.mahasiswa.nim atau via pdrd.peserta_didik)';
COMMENT ON COLUMN prestasi.peserta_mhs.id_reg_pd_pdut IS 'Mapping ke pdut.pdrd.reg_pd.id_reg_pd — registrasi semester saat prestasi didapat; UUID PDDIKTI standard. id_pd bisa diambil via JOIN reg_pd.id_pd.';
COMMENT ON COLUMN prestasi.peserta_mhs.id_sms_pdut IS 'Mapping ke pdut.pdrd.sms.id_sms — prodi (id_jns_sms=3). Fakultas derivable via JOIN self-ref pdrd.sms (id_fak_unila / id_induk_sms yang id_jns_sms=1).';


-- =====================================================
-- Step 12: CREATE TABLE prestasi.peserta_dosen
-- =====================================================
-- Child polymorphic — daftar dosen pembimbing/pendamping.

CREATE TABLE IF NOT EXISTS prestasi.peserta_dosen (
    id_peserta_dosen    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_parent           UUID            NOT NULL,
    parent_tipe         VARCHAR(16)     NOT NULL,
                                        -- PRESTASI / SERTIFIKASI / REKOGNISI
    nuptk               VARCHAR(20)     NULL,
                                        -- Dikirim ke SIMKATMAWA field "dosen[].nuptk"
                                        -- Banyak dosen Unila pakai NIDN, jadi ini bisa NULL
    nidn                VARCHAR(20)     NULL,
                                        -- Fallback untuk dosen non-NUPTK
    id_sdm_pdut         UUID            NULL,
                                        -- Mapping ke pdut.ref.sdm.id_sdm
    nm_dosen            VARCHAR(200)    NOT NULL,
                                        -- SIMKATMAWA field "dosen[].nama"
    url_surat_tugas     TEXT            NOT NULL,
                                        -- SIMKATMAWA field "dosen[].url_surat_tugas"
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    CHECK (parent_tipe IN ('PRESTASI','SERTIFIKASI','REKOGNISI')),
    CHECK (nuptk IS NOT NULL OR nidn IS NOT NULL)
);

-- Unique index pakai expression (UNIQUE CONSTRAINT inline tidak support expression di Postgres)
CREATE UNIQUE INDEX IF NOT EXISTS idx_peserta_dosen_parent_identifier_unique
    ON prestasi.peserta_dosen (id_parent, parent_tipe, COALESCE(nuptk, nidn));
CREATE INDEX IF NOT EXISTS idx_peserta_dosen_parent
    ON prestasi.peserta_dosen (id_parent, parent_tipe);
CREATE INDEX IF NOT EXISTS idx_peserta_dosen_identifier
    ON prestasi.peserta_dosen ((COALESCE(nuptk, nidn)));

COMMENT ON TABLE prestasi.peserta_dosen IS 'Child polymorphic: dosen pembimbing/pendamping (multi-dosen support)';
COMMENT ON COLUMN prestasi.peserta_dosen.nuptk IS 'SIMKATMAWA prefer nuptk; NULL jika dosen hanya punya NIDN';
COMMENT ON COLUMN prestasi.peserta_dosen.nidn IS 'Fallback kalau nuptk NULL; logika kirim ke API pakai COALESCE(nuptk,nidn)';


-- =============================================================================
-- SCHEMA: sync
-- Tracking pengiriman data ke SIMKATMAWA (append-only) + token cache.
-- =============================================================================

-- =====================================================
-- Step 13: CREATE TABLE sync.submission
-- =====================================================
-- Append-only: 1 row per attempt push ke SIMKATMAWA.
-- Jangan UPDATE-in-place; setiap retry = row baru.

CREATE TABLE IF NOT EXISTS sync.submission (
    id_submission       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_parent           UUID            NOT NULL,
                                        -- FK ke prestasi_mandiri/sertifikasi/rekognisi
    parent_tipe         VARCHAR(16)     NOT NULL,
                                        -- PRESTASI / SERTIFIKASI / REKOGNISI
    id_tipe_sync        UUID            NOT NULL REFERENCES ref.tipe_sync(id_tipe_sync),
    request_payload     JSONB           NOT NULL,
                                        -- Snapshot persis yang dikirim ke SIMKATMAWA
    request_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    http_status         INT             NULL,
    response_body       JSONB           NULL,
                                        -- Full response dari SIMKATMAWA
    simkatmawa_id       BIGINT          NULL,
                                        -- data.id dari response kalau sukses
    simkatmawa_kode_pt  VARCHAR(10)     NULL,
    simkatmawa_tahun    VARCHAR(4)      NULL,
    error_message       TEXT            NULL,
    retry_count         INT             NOT NULL DEFAULT 0,
    a_success           BOOLEAN         GENERATED ALWAYS AS (http_status BETWEEN 200 AND 299) STORED,
    id_actor            UUID            NULL,
                                        -- User yang trigger submit (untuk audit)
    CHECK (parent_tipe IN ('PRESTASI','SERTIFIKASI','REKOGNISI'))
);

CREATE INDEX IF NOT EXISTS idx_submission_parent
    ON sync.submission (id_parent, parent_tipe);
CREATE INDEX IF NOT EXISTS idx_submission_success_time
    ON sync.submission (a_success, request_at DESC);
CREATE INDEX IF NOT EXISTS idx_submission_simkatmawa_id
    ON sync.submission (simkatmawa_id)
    WHERE simkatmawa_id IS NOT NULL;

COMMENT ON TABLE sync.submission IS 'Append-only history push ke SIMKATMAWA — setiap attempt = row baru';
COMMENT ON COLUMN sync.submission.request_payload IS 'JSON body yang dikirim ke SIMKATMAWA';
COMMENT ON COLUMN sync.submission.response_body IS 'JSON full response dari SIMKATMAWA';
COMMENT ON COLUMN sync.submission.a_success IS 'Generated: TRUE jika http_status 2xx';


-- =====================================================
-- Step 14: CREATE TABLE sync.token_cache
-- =====================================================
-- Cache JWT SIMKATMAWA (singleton, baris dengan id=1).
-- Alternatif Redis (rekomendasi), table ini jadi fallback.

CREATE TABLE IF NOT EXISTS sync.token_cache (
    id_token_cache      SMALLINT        PRIMARY KEY CHECK (id_token_cache = 1),
    token_encrypted     TEXT            NOT NULL,
                                        -- Laravel Crypt::encryptString(token)
    expires_at          TIMESTAMP       NOT NULL,
                                        -- Dari JWT exp claim
    kode_pt             VARCHAR(10)     NULL,
                                        -- Dari response login SIMKATMAWA
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE sync.token_cache IS 'Cache JWT SIMKATMAWA (singleton). Prefer Redis kalau tersedia.';


-- =============================================================================
-- SCHEMA: setting
-- Runtime config multi-API eksternal (SIMKATMAWA, PDDIKTI, mitra lain).
-- Kredensial disimpan terenkripsi (Laravel Crypt::encryptString).
-- =============================================================================

-- =====================================================
-- Step 15: CREATE TABLE setting.api_config
-- =====================================================
-- Konfigurasi runtime untuk integrasi API eksternal.
-- Support bearer/api_key/basic/oauth2/none.
-- Kredensial encrypted at rest pakai APP_KEY Laravel.

CREATE TABLE IF NOT EXISTS setting.api_config (
    id_api_config       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode                VARCHAR(40)     NOT NULL UNIQUE,
                                        -- Identifier unik: simkatmawa, pddikti, mitra-x
    nm_api              VARCHAR(150)    NOT NULL,
                                        -- Nama human-friendly
    base_url            TEXT            NOT NULL,
                                        -- Base URL API eksternal
    auth_type           VARCHAR(16)     NOT NULL,
                                        -- bearer / api_key / basic / oauth2 / none
    auth_login_path     VARCHAR(200)    NULL,
                                        -- Path untuk fetch token (bearer): /api/login
    auth_username_encrypted TEXT        NULL,
                                        -- Laravel Crypt::encryptString(username/email)
    auth_password_encrypted TEXT        NULL,
                                        -- Laravel Crypt::encryptString(password)
    auth_api_key_encrypted TEXT         NULL,
                                        -- Laravel Crypt::encryptString(api_key) untuk auth_type=api_key
    auth_extra          JSONB           NULL,
                                        -- Field flex: oauth client_id/secret, header custom,
                                        -- refresh_token_path, scope, dsb
    kode_pt             VARCHAR(10)     NULL,
                                        -- PT identifier di API tersebut (SIMKATMAWA: kode_pt Unila)
    rate_limit_per_min  INT             NOT NULL DEFAULT 60,
                                        -- Batas request/menit dari kita ke API target
    timeout_seconds     INT             NOT NULL DEFAULT 30,
                                        -- HTTP client timeout
    retry_policy        JSONB           NULL,
                                        -- {max_attempts:3, backoff_ms:[0,30000,120000]}
    a_active            BOOLEAN         NOT NULL DEFAULT TRUE,
                                        -- Enable/disable integrasi tanpa hapus row
    a_dry_run           BOOLEAN         NOT NULL DEFAULT FALSE,
                                        -- TRUE = worker log payload tapi tidak benar-benar kirim
    deskripsi           TEXT            NULL,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    CHECK (auth_type IN ('bearer','api_key','basic','oauth2','none'))
);

CREATE INDEX IF NOT EXISTS idx_api_config_active
    ON setting.api_config (a_active)
    WHERE a_active = TRUE;

COMMENT ON TABLE setting.api_config IS 'Konfigurasi runtime API eksternal (SIMKATMAWA, PDDIKTI, mitra). Kredensial encrypted at rest.';
COMMENT ON COLUMN setting.api_config.auth_type IS 'bearer / api_key / basic / oauth2 / none';
COMMENT ON COLUMN setting.api_config.auth_password_encrypted IS 'Laravel Crypt::encryptString(password) — decrypt via APP_KEY';
COMMENT ON COLUMN setting.api_config.a_dry_run IS 'TRUE = worker hanya log payload, tidak benar-benar call API (untuk testing/staging)';


-- =====================================================
-- Step 16: CREATE TABLE setting.api_config_log
-- =====================================================
-- Audit trail perubahan config (tanpa log nilai kredensial).

CREATE TABLE IF NOT EXISTS setting.api_config_log (
    id_api_config_log   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_api_config       UUID            NOT NULL REFERENCES setting.api_config(id_api_config)
                                        ON DELETE CASCADE,
    action              VARCHAR(30)     NOT NULL,
                                        -- CREATE / UPDATE / ROTATE_PASSWORD / ROTATE_API_KEY /
                                        -- TEST / TOGGLE_ACTIVE / TOGGLE_DRY_RUN / DELETE
    field_changed       VARCHAR(60)     NULL,
                                        -- Nama kolom (bukan nilai — jangan log password plaintext)
    id_actor            UUID            NOT NULL,
    nm_actor            VARCHAR(200)    NOT NULL,
    ip_address          VARCHAR(45)     NULL,
    user_agent          TEXT            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_config_log_config
    ON setting.api_config_log (id_api_config, created_at DESC);

COMMENT ON TABLE setting.api_config_log IS 'Audit trail perubahan setting.api_config (rotate password, toggle dry_run, dsb)';
COMMENT ON COLUMN setting.api_config_log.field_changed IS 'Nama field yang berubah saja — JANGAN log nilai kredensial';


-- =============================================================================
-- SCHEMA: log
-- Jejak audit aksi pengguna (CREATE/UPDATE/SUBMIT/...).
-- =============================================================================

-- =====================================================
-- Step 17: CREATE TABLE log.jejak_audit
-- =====================================================
-- Satu row per mutasi. Dipakai untuk audit + investigasi.

CREATE TABLE IF NOT EXISTS log.jejak_audit (
    id_jejak_audit      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_actor            UUID            NOT NULL,
    nm_actor            VARCHAR(200)    NOT NULL,
                                        -- Cache dari pdut man_akses.pengguna
    action              VARCHAR(40)     NOT NULL,
                                        -- CREATE / UPDATE / SUBMIT / RETRY / ARCHIVE /
                                        -- LOGIN_SIMKATMAWA / CONFIG_UPDATE / dll
    target_tipe         VARCHAR(20)     NULL,
                                        -- PRESTASI / SERTIFIKASI / REKOGNISI / REF /
                                        -- API_CONFIG / CREDENTIAL
    id_target           UUID            NULL,
    detail              JSONB           NULL,
                                        -- Diff sebelum/sesudah, alasan, dsb
    ip_address          VARCHAR(45)     NULL,
    user_agent          TEXT            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jejak_audit_actor
    ON log.jejak_audit (id_actor, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jejak_audit_target
    ON log.jejak_audit (target_tipe, id_target, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jejak_audit_action
    ON log.jejak_audit (action, created_at DESC);

COMMENT ON TABLE log.jejak_audit IS 'Audit trail aksi pengguna (mutasi data, submit SIMKATMAWA, konfigurasi, dll)';
COMMENT ON COLUMN log.jejak_audit.detail IS 'JSON diff/context — sensitive values HARUS di-redact sebelum disimpan';


-- =====================================================
-- END OF SCHEMA v1.0
-- =====================================================
-- Setelah apply file ini, jalankan si_prestasi_v1.0_seed.sql
-- untuk populate referensi.
-- =====================================================
