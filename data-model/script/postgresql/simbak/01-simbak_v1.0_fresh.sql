-- =====================================================
-- Script: SIMBAK - Sistem Informasi Manajemen BAK
-- Database: PostgreSQL (dedicated DB: simbak)
-- Version: 1.0
-- Date: 2026-03-24
-- Author: Vibe Bot + Mizar
-- Description:
--   Modul layanan administrasi kemahasiswaan BAK
--   terintegrasi dalam ekosistem MyUnila.
--   DB terpisah menggunakan PostgreSQL untuk transaksi.
--
--   Schemas:
--     - ref      : Data referensi/master (jenis layanan, persyaratan, tahapan, template)
--     - layanan   : Transaksi pengajuan layanan mahasiswa
--     - batch     : Transaksi batch penetapan (HMM, putus studi)
--     - log       : Jejak audit, aktivitas, dan perubahan data
--
--   Tables:
--     ref.jenis_layanan            - Master jenis layanan BAK
--     ref.persyaratan_layanan      - Konfigurasi dokumen persyaratan per layanan
--     ref.tahapan_layanan          - Template tahapan workflow per layanan
--     ref.template_dokumen         - Template surat/SK untuk generate output
--     layanan.pengajuan            - Header pengajuan layanan mahasiswa
--     layanan.data_pemohon         - Snapshot data akademik pemohon saat pengajuan
--     layanan.dokumen_pengajuan    - Dokumen persyaratan yang diunggah
--     layanan.riwayat_pengajuan    - Riwayat perubahan status/tahapan proses
--     layanan.persetujuan_pengajuan - Keputusan approval per aktor
--     layanan.dokumen_hasil        - Dokumen hasil layanan (surat/SK)
--     batch.batch_penetapan        - Header proses batch (HMM/putus studi)
--     batch.kandidat_batch         - Daftar mahasiswa kandidat dalam batch
--     batch.verifikasi_batch       - Hasil verifikasi fakultas terhadap kandidat
--     log.jejak_audit              - Jejak audit aksi pengguna
--     log.aktivitas_data           - Log perubahan data (INSERT/UPDATE/DELETE)
--
--   Relasi:
--     ref.jenis_layanan 1──N ref.persyaratan_layanan
--     ref.jenis_layanan 1──N ref.tahapan_layanan
--     ref.jenis_layanan 1──N ref.template_dokumen
--     ref.jenis_layanan 1──N layanan.pengajuan
--     ref.jenis_layanan 1──N batch.batch_penetapan
--     layanan.pengajuan 1──1 layanan.data_pemohon
--     layanan.pengajuan 1──N layanan.dokumen_pengajuan
--     layanan.pengajuan 1──N layanan.riwayat_pengajuan
--     layanan.pengajuan 1──N layanan.persetujuan_pengajuan
--     layanan.pengajuan 1──N layanan.dokumen_hasil
--     batch.batch_penetapan 1──N batch.kandidat_batch
--     batch.kandidat_batch 1──1 batch.verifikasi_batch
--
--   Naming Convention:
--     - Schema: ref, layanan, batch, log
--     - PK: id_<tabel> UUID DEFAULT gen_random_uuid()
--     - FK: id_<referensi> UUID REFERENCES <schema>.<tabel>(id_<tabel>)
--     - Name: nm_<field>
--     - Date: tgl_<field>
--     - Boolean: a_<field> BOOLEAN DEFAULT FALSE/TRUE
--     - Audit: created_at, updated_at, soft_delete
--     - Index: idx_<tabel>_<kolom>
-- =====================================================

-- =====================================================
-- Step 0: Create Database, Extensions & Schemas
-- =====================================================
-- CREATE DATABASE simbak;
-- \c simbak

-- Hapus schema public (tidak dipakai, semua tabel di schema khusus)
DROP SCHEMA IF EXISTS public CASCADE;

-- Buat schema khusus
CREATE SCHEMA IF NOT EXISTS ref;        -- data master/referensi
CREATE SCHEMA IF NOT EXISTS layanan;    -- transaksi pengajuan layanan mahasiswa
CREATE SCHEMA IF NOT EXISTS batch;      -- transaksi batch penetapan (HMM, putus studi)
CREATE SCHEMA IF NOT EXISTS log;        -- jejak audit, aktivitas, dan perubahan data

-- gen_random_uuid() bawaan PostgreSQL 13+, tidak perlu extension uuid-ossp
-- Set search_path (semua tabel di schema khusus, bukan public)
SET search_path TO ref, layanan, batch, log;

-- =====================================================
-- NOTE: Dual Database Connection
-- =====================================================
-- Primary DB  : PostgreSQL (simbak) — tabel transaksi SIMBAK
-- Secondary DB: SQL Server (pdut) — READ ONLY untuk referensi:
--   - man_akses.pengguna       → data user, nama, username
--   - man_akses.peran          → data role
--   - man_akses.role_pengguna  → mapping user-role
--   - man_akses.organisasi     → unit organisasi / fakultas
--   - siakadu.peserta_didik    → data mahasiswa
--   - siakadu.reg_pd           → registrasi mahasiswa per semester
--   - siakadu.semester         → referensi semester akademik
--   - siakadu.sms              → satuan manajemen sumber daya (prodi)
--   - siakadu.nilai_smt_mhs   → nilai per semester (IPK, SKS)
--   - keuangan.spp_mhs        → data pembayaran UKT
--
-- Field id_pengguna, id_mahasiswa dll menyimpan UUID
-- yang merujuk ke tabel di SQL Server (pdut).
-- Backend resolve data via dual connection (bukan FK langsung).
-- =====================================================


-- =============================================================================
-- SCHEMA: ref
-- Berisi data master/referensi yang jarang berubah
-- =============================================================================

-- =====================================================
-- Step 1: CREATE TABLE ref.jenis_layanan
-- =====================================================
-- Master jenis layanan BAK.
-- Berisi 10 jenis layanan dalam 4 kategori:
--   - surat_mandiri      : LoA, Pengganti KTM, Pengganti PKKMB, Herregistrasi
--   - permohonan_akademik : Cuti Akademik, Undur Diri, Alih Program
--   - batch_administrasi  : Habis Masa Mukim, Putus Studi Akademik
--   - monitoring          : Monitoring Mahasiswa Aktif & Lulusan

CREATE TABLE IF NOT EXISTS ref.jenis_layanan (
    id_jenis_layanan    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_layanan        VARCHAR(30)     NOT NULL UNIQUE,
                                        -- LOA, GANTI_KTM, GANTI_PKKMB, HERREGISTRASI,
                                        -- CUTI, UNDUR_DIRI, ALIH_PROGRAM,
                                        -- HABIS_MASA_MUKIM, PUTUS_STUDI, MONITORING
    nm_layanan          VARCHAR(200)    NOT NULL,
                                        -- Nama lengkap layanan, misal:
                                        -- "Surat Keterangan Diterima sebagai Mahasiswa Baru / LoA"
    deskripsi           TEXT            NULL,
    kategori            VARCHAR(30)     NOT NULL,
                                        -- surat_mandiri, permohonan_akademik,
                                        -- batch_administrasi, monitoring
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,
                                        -- layanan aktif dan bisa diakses
    a_batch             BOOLEAN         NOT NULL DEFAULT FALSE,
                                        -- TRUE untuk layanan batch:
                                        -- habis_masa_mukim, putus_studi
    urutan              INT             NOT NULL DEFAULT 0,
                                        -- urutan tampil di menu/daftar layanan
    sla_hari            INT             NULL,
                                        -- target SLA penyelesaian dalam hari kerja
    id_creator          UUID            NULL,
                                        -- UUID pembuat record (ref ke man_akses.pengguna di pdut)
    id_updater          UUID            NULL,
                                        -- UUID pengubah terakhir (ref ke man_akses.pengguna di pdut)
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE ref.jenis_layanan IS 'Master jenis layanan BAK (10 jenis, 4 kategori)';
COMMENT ON COLUMN ref.jenis_layanan.kode_layanan IS 'Kode unik layanan: LOA, GANTI_KTM, CUTI, UNDUR_DIRI, ALIH_PROGRAM, dll';
COMMENT ON COLUMN ref.jenis_layanan.nm_layanan IS 'Nama lengkap layanan yang ditampilkan ke pengguna';
COMMENT ON COLUMN ref.jenis_layanan.kategori IS 'Kategori: surat_mandiri, permohonan_akademik, batch_administrasi, monitoring';
COMMENT ON COLUMN ref.jenis_layanan.a_batch IS 'TRUE jika layanan bersifat batch (inisiasi admin, bukan mahasiswa)';
COMMENT ON COLUMN ref.jenis_layanan.sla_hari IS 'Target SLA penyelesaian dalam hari kerja';

-- =====================================================
-- Step 2: CREATE TABLE ref.persyaratan_layanan
-- =====================================================
-- Konfigurasi dokumen persyaratan per jenis layanan.
-- Menentukan dokumen apa saja yang harus diunggah mahasiswa
-- atau admin untuk setiap jenis layanan.
-- Contoh: layanan CUTI membutuhkan SURAT_PERMOHONAN, KTM, SLIP_UKT

CREATE TABLE IF NOT EXISTS ref.persyaratan_layanan (
    id_persyaratan      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_jenis_layanan    UUID            NOT NULL REFERENCES ref.jenis_layanan(id_jenis_layanan)
                                        ON DELETE CASCADE,
    kode_dokumen        VARCHAR(50)     NOT NULL,
                                        -- SURAT_PERMOHONAN, KTM, SLIP_UKT,
                                        -- SURAT_KEHILANGAN, TRANSKRIP,
                                        -- SURAT_PENGANTAR_DEKAN, SURAT_TIDAK_MELANGGAR,
                                        -- SURAT_BERKELAKUAN_BAIK, SURAT_TIDAK_PUTUS_STUDI
    nm_dokumen          VARCHAR(200)    NOT NULL,
                                        -- Nama tampilan, misal: "Surat Permohonan Mahasiswa dan Wali"
    deskripsi           TEXT            NULL,
                                        -- Penjelasan tambahan atau instruksi unggah
    a_wajib             BOOLEAN         NOT NULL DEFAULT TRUE,
                                        -- TRUE jika dokumen wajib diunggah
    urutan              INT             NOT NULL DEFAULT 0,
                                        -- urutan tampil di form pengajuan
    tipe_file           VARCHAR(100)    NOT NULL DEFAULT 'application/pdf',
                                        -- MIME types yang diizinkan, comma-separated
                                        -- contoh: 'application/pdf,image/jpeg,image/png'
    max_size_mb         INT             NOT NULL DEFAULT 5,
                                        -- batas ukuran file maksimal dalam MB
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,
    UNIQUE (id_jenis_layanan, kode_dokumen)
);

COMMENT ON TABLE ref.persyaratan_layanan IS 'Konfigurasi dokumen persyaratan per jenis layanan';
COMMENT ON COLUMN ref.persyaratan_layanan.kode_dokumen IS 'Kode jenis dokumen: SURAT_PERMOHONAN, KTM, SLIP_UKT, dll';
COMMENT ON COLUMN ref.persyaratan_layanan.a_wajib IS 'TRUE jika dokumen wajib diunggah oleh pemohon';
COMMENT ON COLUMN ref.persyaratan_layanan.tipe_file IS 'MIME types yang diizinkan, comma-separated';
COMMENT ON COLUMN ref.persyaratan_layanan.max_size_mb IS 'Batas ukuran file maksimal dalam megabyte';

-- =====================================================
-- Step 3: CREATE TABLE ref.tahapan_layanan
-- =====================================================
-- Template tahapan workflow per jenis layanan.
-- Mendefinisikan urutan langkah proses dan role aktor
-- yang menangani setiap tahapan.
-- Contoh untuk CUTI:
--   1. Pengajuan Mahasiswa (mahasiswa) → draft → diajukan
--   2. Verifikasi Admin Fakultas (admin_fakultas) → diajukan → diverifikasi
--   3. Verifikasi Admin BAK (admin_bak) → diverifikasi → menunggu_persetujuan
--   4. Persetujuan Pejabat (approver_universitas) → menunggu_persetujuan → disetujui
--   5. Penerbitan Dokumen (admin_bak) → disetujui → terbit

CREATE TABLE IF NOT EXISTS ref.tahapan_layanan (
    id_tahapan          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_jenis_layanan    UUID            NOT NULL REFERENCES ref.jenis_layanan(id_jenis_layanan)
                                        ON DELETE CASCADE,
    urutan              INT             NOT NULL,
                                        -- urutan tahapan: 1, 2, 3, ...
    nm_tahapan          VARCHAR(200)    NOT NULL,
                                        -- nama tahapan, misal: "Verifikasi Admin Fakultas"
    kode_role           VARCHAR(50)     NOT NULL,
                                        -- role aktor yang menangani tahapan ini:
                                        -- mahasiswa, admin_fakultas_asal, admin_fakultas_tujuan,
                                        -- admin_bak, approver_fakultas, approver_universitas, system
    status_masuk        VARCHAR(30)     NOT NULL,
                                        -- status pengajuan yang memicu tahapan ini
                                        -- misal: 'diajukan'
    status_selesai      VARCHAR(30)     NOT NULL,
                                        -- status pengajuan setelah tahapan selesai
                                        -- misal: 'diverifikasi'
    a_opsional          BOOLEAN         NOT NULL DEFAULT FALSE,
                                        -- TRUE jika tahapan bisa dilewati
    deskripsi           TEXT            NULL,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,
    UNIQUE (id_jenis_layanan, urutan)
);

COMMENT ON TABLE ref.tahapan_layanan IS 'Template tahapan workflow per jenis layanan';
COMMENT ON COLUMN ref.tahapan_layanan.kode_role IS 'Role aktor: mahasiswa, admin_fakultas_asal, admin_bak, approver_universitas, dll';
COMMENT ON COLUMN ref.tahapan_layanan.status_masuk IS 'Status pengajuan yang memicu tahapan ini dimulai';
COMMENT ON COLUMN ref.tahapan_layanan.status_selesai IS 'Status pengajuan setelah tahapan ini diselesaikan';
COMMENT ON COLUMN ref.tahapan_layanan.a_opsional IS 'TRUE jika tahapan ini bisa dilewati pada kondisi tertentu';

-- =====================================================
-- Step 4: CREATE TABLE ref.template_dokumen
-- =====================================================
-- Template dokumen surat/SK per jenis layanan.
-- Digunakan untuk generate output dokumen (PDF).
-- Satu jenis layanan bisa punya beberapa versi template.

CREATE TABLE IF NOT EXISTS ref.template_dokumen (
    id_template         UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_jenis_layanan    UUID            NOT NULL REFERENCES ref.jenis_layanan(id_jenis_layanan)
                                        ON DELETE CASCADE,
    nm_template         VARCHAR(200)    NOT NULL,
                                        -- nama template, misal: "SK Cuti Akademik v2"
    versi               VARCHAR(20)     NOT NULL DEFAULT '1.0',
                                        -- versi template: 1.0, 2.0, dll
    path_file           VARCHAR(1000)   NOT NULL,
                                        -- path ke file template (PDF/DOCX) di storage
    tipe_file           VARCHAR(100)    NOT NULL DEFAULT 'application/pdf',
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,
                                        -- hanya template aktif yang dipakai untuk generate
    keterangan          TEXT            NULL,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE ref.template_dokumen IS 'Template dokumen surat/SK per jenis layanan';
COMMENT ON COLUMN ref.template_dokumen.versi IS 'Versi template: 1.0, 2.0, dll';
COMMENT ON COLUMN ref.template_dokumen.path_file IS 'Path ke file template di storage';
COMMENT ON COLUMN ref.template_dokumen.a_aktif IS 'Hanya template aktif yang dipakai untuk generate dokumen';


-- =============================================================================
-- SCHEMA: layanan
-- Berisi transaksi pengajuan layanan mahasiswa
-- =============================================================================

-- =====================================================
-- Step 5: CREATE TABLE layanan.pengajuan
-- =====================================================
-- Header pengajuan layanan per mahasiswa.
-- Setiap pengajuan memiliki satu jenis layanan dan satu pemohon.
-- Status workflow:
--   draft → diajukan → perlu_perbaikan / diverifikasi
--   → menunggu_persetujuan → disetujui / ditolak → terbit
--
-- Kolom khusus per layanan:
--   - Cuti: id_smt_mulai_cuti, jumlah_semester_cuti
--   - Alih Program: id_prodi_tujuan, id_fakultas_tujuan
--   - Undur Diri (batch SK): id_batch_penetapan

CREATE TABLE IF NOT EXISTS layanan.pengajuan (
    id_pengajuan        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_jenis_layanan    UUID            NOT NULL REFERENCES ref.jenis_layanan(id_jenis_layanan)
                                        ON DELETE RESTRICT,
    nomor_permohonan    VARCHAR(50)     NOT NULL UNIQUE,
                                        -- auto-generated: SIMBAK-LOA-2026-0001
                                        -- format: SIMBAK-{KODE_LAYANAN}-{TAHUN}-{URUT}
    id_pemohon          UUID            NOT NULL,
                                        -- UUID mahasiswa pemohon
                                        -- ref ke man_akses.pengguna di pdut
    status              VARCHAR(30)     NOT NULL DEFAULT 'draft',
                                        -- draft             : masih disimpan pemohon
                                        -- diajukan          : sudah masuk antrean verifikasi
                                        -- perlu_perbaikan   : dikembalikan untuk dilengkapi
                                        -- diverifikasi      : verifikasi administrasi selesai
                                        -- menunggu_persetujuan : menunggu keputusan pejabat
                                        -- disetujui         : disetujui, siap terbit
                                        -- ditolak           : pengajuan ditolak
                                        -- terbit            : dokumen hasil tersedia
    alasan              TEXT            NULL,
                                        -- alasan / keperluan permohonan
    catatan_pemohon     TEXT            NULL,
                                        -- catatan tambahan dari pemohon

    -- === Kolom khusus Cuti Akademik ===
    id_smt_mulai_cuti   VARCHAR(10)     NULL,
                                        -- semester mulai cuti
                                        -- ref ke siakadu.semester.id_smt di pdut
    jumlah_semester_cuti INT            NULL CHECK (jumlah_semester_cuti IN (1, 2)),
                                        -- durasi cuti: 1 atau 2 semester

    -- === Kolom khusus Alih Program / Pindah Studi ===
    id_prodi_tujuan     UUID            NULL,
                                        -- program studi tujuan
                                        -- ref ke siakadu.sms.id_sms di pdut
    id_fakultas_tujuan  UUID            NULL,
                                        -- fakultas tujuan
                                        -- ref ke man_akses.organisasi di pdut

    -- === Referensi batch SK (untuk undur diri batch) ===
    id_batch_penetapan  UUID            NULL,
                                        -- FK ditambahkan via ALTER TABLE
                                        -- setelah tabel batch.batch_penetapan dibuat

    tgl_diajukan        TIMESTAMP       NULL,
                                        -- waktu pengajuan dikirim
    tgl_selesai         TIMESTAMP       NULL,
                                        -- waktu proses selesai (terbit/ditolak)
    nomor_dokumen_hasil VARCHAR(100)    NULL,
                                        -- nomor surat/SK yang diterbitkan
    tgl_dokumen_hasil   DATE            NULL,
                                        -- tanggal surat/SK

    id_creator          UUID            NULL,
                                        -- UUID pembuat pengajuan (ref ke man_akses.pengguna di pdut)
    id_updater          UUID            NULL,
                                        -- UUID pengubah terakhir (ref ke man_akses.pengguna di pdut)
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE layanan.pengajuan IS 'Header pengajuan layanan BAK per mahasiswa';
COMMENT ON COLUMN layanan.pengajuan.nomor_permohonan IS 'Nomor pengajuan auto-generated: SIMBAK-KODE-TAHUN-URUT';
COMMENT ON COLUMN layanan.pengajuan.id_pemohon IS 'UUID mahasiswa pemohon (ref ke man_akses.pengguna di pdut)';
COMMENT ON COLUMN layanan.pengajuan.status IS 'Status workflow: draft, diajukan, perlu_perbaikan, diverifikasi, menunggu_persetujuan, disetujui, ditolak, terbit';
COMMENT ON COLUMN layanan.pengajuan.id_smt_mulai_cuti IS 'Semester mulai cuti (khusus layanan cuti akademik, ref ke siakadu.semester)';
COMMENT ON COLUMN layanan.pengajuan.jumlah_semester_cuti IS 'Durasi cuti: 1 atau 2 semester';
COMMENT ON COLUMN layanan.pengajuan.id_prodi_tujuan IS 'Program studi tujuan (khusus alih program, ref ke siakadu.sms)';
COMMENT ON COLUMN layanan.pengajuan.id_fakultas_tujuan IS 'Fakultas tujuan (khusus alih program, ref ke man_akses.organisasi)';
COMMENT ON COLUMN layanan.pengajuan.nomor_dokumen_hasil IS 'Nomor surat/SK yang diterbitkan';

-- =====================================================
-- Step 6: CREATE TABLE layanan.data_pemohon
-- =====================================================
-- Snapshot data akademik pemohon pada saat pengajuan.
-- Data diambil dari PDUT (read-only) lalu disimpan di sini
-- sebagai bukti proses yang tidak berubah walaupun
-- data asli di PDUT berubah di kemudian hari.
-- Satu pengajuan memiliki tepat satu snapshot data pemohon.

CREATE TABLE IF NOT EXISTS layanan.data_pemohon (
    id_data_pemohon     UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengajuan        UUID            NOT NULL REFERENCES layanan.pengajuan(id_pengajuan)
                                        ON DELETE CASCADE,

    -- === Identitas mahasiswa ===
    id_mahasiswa        UUID            NOT NULL,
                                        -- ref ke siakadu.peserta_didik / reg_pd di pdut
    nim                 VARCHAR(20)     NOT NULL,
    nm_mahasiswa        VARCHAR(200)    NOT NULL,
    tempat_lahir        VARCHAR(100)    NULL,
    tgl_lahir           DATE            NULL,
    jenis_kelamin       VARCHAR(1)      NULL,
                                        -- L = Laki-laki, P = Perempuan

    -- === Unit akademik ===
    id_fakultas         UUID            NULL,
                                        -- ref ke man_akses.organisasi di pdut
    nm_fakultas         VARCHAR(200)    NULL,
    id_prodi            UUID            NULL,
                                        -- ref ke siakadu.sms di pdut
    nm_prodi            VARCHAR(200)    NULL,
    id_jenj_didik       INT             NULL,
                                        -- ref ke siakadu.jenjang_pendidikan di pdut
    nm_jenjang          VARCHAR(50)     NULL,
                                        -- D3, S1, S2, S3
    angkatan            INT             NULL,
                                        -- tahun masuk, misal: 2022

    -- === Performa akademik ===
    semester_aktif      INT             NULL,
                                        -- nomor semester saat ini (misal: 6)
    id_smt              VARCHAR(10)     NULL,
                                        -- kode semester aktif
                                        -- ref ke siakadu.semester di pdut
    ipk                 DECIMAL(4,2)    NULL,
                                        -- IPK kumulatif saat pengajuan
    sks_lulus           INT             NULL,
                                        -- total SKS lulus saat pengajuan
    masa_studi_semester INT             NULL,
                                        -- total semester sejak pertama terdaftar

    -- === Status registrasi & pembayaran ===
    status_mahasiswa    VARCHAR(50)     NULL,
                                        -- aktif, cuti, non-aktif, lulus, keluar
    status_registrasi   VARCHAR(50)     NULL,
                                        -- terdaftar, belum_registrasi, cuti
    status_pembayaran   VARCHAR(50)     NULL,
                                        -- lunas, belum_lunas

    tgl_snapshot        TIMESTAMP       NOT NULL DEFAULT NOW(),
                                        -- waktu pengambilan snapshot dari PDUT
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,
    UNIQUE (id_pengajuan)
                                        -- satu snapshot per pengajuan
);

COMMENT ON TABLE layanan.data_pemohon IS 'Snapshot data akademik pemohon pada saat pengajuan (dari PDUT)';
COMMENT ON COLUMN layanan.data_pemohon.id_mahasiswa IS 'UUID mahasiswa dari PDUT (siakadu.peserta_didik/reg_pd)';
COMMENT ON COLUMN layanan.data_pemohon.ipk IS 'IPK kumulatif saat pengajuan';
COMMENT ON COLUMN layanan.data_pemohon.sks_lulus IS 'Total SKS lulus saat pengajuan';
COMMENT ON COLUMN layanan.data_pemohon.masa_studi_semester IS 'Total semester sejak pertama terdaftar';
COMMENT ON COLUMN layanan.data_pemohon.tgl_snapshot IS 'Waktu pengambilan snapshot data dari PDUT';

-- =====================================================
-- Step 7: CREATE TABLE layanan.dokumen_pengajuan
-- =====================================================
-- Dokumen persyaratan yang diunggah untuk pengajuan layanan.
-- Bisa diunggah oleh mahasiswa, admin fakultas, atau admin BAK
-- tergantung jenis dokumen dan tahapan proses.

CREATE TABLE IF NOT EXISTS layanan.dokumen_pengajuan (
    id_dokumen          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengajuan        UUID            NOT NULL REFERENCES layanan.pengajuan(id_pengajuan)
                                        ON DELETE CASCADE,
    id_persyaratan      UUID            NULL REFERENCES ref.persyaratan_layanan(id_persyaratan)
                                        ON DELETE SET NULL,
                                        -- referensi ke konfigurasi persyaratan
                                        -- NULL jika dokumen tambahan di luar persyaratan
    nm_dokumen          VARCHAR(200)    NOT NULL,
                                        -- nama dokumen tampilan
    nama_file_asli      VARCHAR(500)    NOT NULL,
                                        -- nama file asli saat diunggah
    path_file           VARCHAR(1000)   NOT NULL,
                                        -- path penyimpanan di MinIO (VM7: 192.168.120.47:9000)
                                        -- format: simbak/pengajuan/{id_pengajuan}/{kode_dokumen}/{filename}
                                        -- bucket: myunila-storage
    data_blob           BYTEA           NULL,
                                        -- opsional: simpan file langsung di DB (untuk file kecil < 1MB)
                                        -- jika NULL, file diambil dari MinIO via path_file
                                        -- jika terisi, path_file tetap wajib sebagai referensi
    tipe_file           VARCHAR(100)    NOT NULL,
                                        -- MIME type file, misal: application/pdf
    ukuran_byte         BIGINT          NOT NULL,
                                        -- ukuran file dalam byte
    id_pengunggah       UUID            NOT NULL,
                                        -- UUID pengunggah:
                                        -- bisa mahasiswa, admin fakultas, atau admin BAK
                                        -- ref ke man_akses.pengguna di pdut
    keterangan          TEXT            NULL,
    tgl_upload          TIMESTAMP       NOT NULL DEFAULT NOW(),
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE layanan.dokumen_pengajuan IS 'Dokumen persyaratan yang diunggah untuk pengajuan layanan';
COMMENT ON COLUMN layanan.dokumen_pengajuan.id_persyaratan IS 'Referensi ke konfigurasi persyaratan, NULL jika dokumen tambahan';
COMMENT ON COLUMN layanan.dokumen_pengajuan.path_file IS 'Path file di MinIO (bucket myunila-storage, VM7 192.168.120.47:9000)';
COMMENT ON COLUMN layanan.dokumen_pengajuan.data_blob IS 'Opsional: data file binary (BYTEA) untuk file kecil < 1MB, alternatif MinIO';
COMMENT ON COLUMN layanan.dokumen_pengajuan.id_pengunggah IS 'UUID pengunggah (ref ke man_akses.pengguna di pdut)';

-- =====================================================
-- Step 8: CREATE TABLE layanan.riwayat_pengajuan
-- =====================================================
-- Riwayat perubahan status dan tahapan proses pengajuan.
-- Setiap kali status pengajuan berubah, dicatat di sini
-- lengkap dengan siapa yang melakukan dan catatannya.
-- Berfungsi sebagai audit trail proses workflow.

CREATE TABLE IF NOT EXISTS layanan.riwayat_pengajuan (
    id_riwayat          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengajuan        UUID            NOT NULL REFERENCES layanan.pengajuan(id_pengajuan)
                                        ON DELETE CASCADE,
    id_tahapan          UUID            NULL REFERENCES ref.tahapan_layanan(id_tahapan)
                                        ON DELETE SET NULL,
                                        -- referensi ke template tahapan
    urutan              INT             NOT NULL,
                                        -- urutan step: 1, 2, 3, ...
    nm_tahapan          VARCHAR(200)    NOT NULL,
                                        -- nama tahapan yang dijalankan
    status_dari         VARCHAR(30)     NOT NULL,
                                        -- status sebelum transisi
    status_ke           VARCHAR(30)     NOT NULL,
                                        -- status setelah transisi
    id_aktor            UUID            NULL,
                                        -- UUID pelaku aksi
                                        -- ref ke man_akses.pengguna di pdut
    nm_aktor            VARCHAR(200)    NULL,
                                        -- nama aktor (disimpan untuk audit trail,
                                        -- agar tetap terbaca walau nama berubah di pdut)
    kode_role_aktor     VARCHAR(50)     NULL,
                                        -- role aktor saat melakukan aksi
    catatan             TEXT            NULL,
                                        -- catatan pemeriksa pada tahapan ini
    tgl_mulai           TIMESTAMP       NULL,
    tgl_selesai         TIMESTAMP       NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE layanan.riwayat_pengajuan IS 'Riwayat perubahan status dan tahapan proses pengajuan';
COMMENT ON COLUMN layanan.riwayat_pengajuan.status_dari IS 'Status pengajuan sebelum transisi';
COMMENT ON COLUMN layanan.riwayat_pengajuan.status_ke IS 'Status pengajuan setelah transisi';
COMMENT ON COLUMN layanan.riwayat_pengajuan.id_aktor IS 'UUID pelaku aksi (ref ke man_akses.pengguna di pdut)';
COMMENT ON COLUMN layanan.riwayat_pengajuan.nm_aktor IS 'Nama aktor (denormalized, disimpan permanen untuk audit trail)';
COMMENT ON COLUMN layanan.riwayat_pengajuan.catatan IS 'Catatan pemeriksa pada tahapan ini';

-- =====================================================
-- Step 9: CREATE TABLE layanan.persetujuan_pengajuan
-- =====================================================
-- Keputusan persetujuan/penolakan per aktor per pengajuan.
-- Terpisah dari riwayat_pengajuan karena satu tahapan
-- bisa membutuhkan beberapa persetujuan dari aktor berbeda
-- (misal: Alih Program butuh approval fakultas asal DAN tujuan).
--
-- Kolom khusus Alih Program:
--   - a_diterima_tujuan: keputusan fakultas tujuan
--   - hasil_wawancara: catatan wawancara/penilaian
--   - daftar_konversi_sks: JSON daftar mata kuliah yang diakui

CREATE TABLE IF NOT EXISTS layanan.persetujuan_pengajuan (
    id_persetujuan      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengajuan        UUID            NOT NULL REFERENCES layanan.pengajuan(id_pengajuan)
                                        ON DELETE CASCADE,
    id_riwayat          UUID            NULL REFERENCES layanan.riwayat_pengajuan(id_riwayat)
                                        ON DELETE SET NULL,
                                        -- link ke riwayat tahapan terkait
    id_approver         UUID            NOT NULL,
                                        -- UUID pemberi keputusan
                                        -- ref ke man_akses.pengguna di pdut
    nm_approver         VARCHAR(200)    NULL,
                                        -- nama pemberi keputusan (denormalized)
    kode_role_approver  VARCHAR(50)     NOT NULL,
                                        -- role pemberi keputusan:
                                        -- admin_fakultas, admin_bak,
                                        -- approver_fakultas, approver_universitas
    keputusan           VARCHAR(30)     NOT NULL,
                                        -- disetujui, ditolak, dikembalikan
    catatan             TEXT            NULL,
                                        -- catatan/alasan keputusan
    tgl_keputusan       TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- === Kolom khusus Alih Program ===
    a_diterima_tujuan   BOOLEAN         NULL,
                                        -- keputusan fakultas tujuan:
                                        -- TRUE = diterima, FALSE = ditolak
    hasil_wawancara     TEXT            NULL,
                                        -- catatan hasil wawancara/penilaian
    daftar_konversi_sks TEXT            NULL,
                                        -- JSON: daftar mata kuliah dan SKS yang diakui
                                        -- contoh: [{"kode_mk":"IF101","nm_mk":"Algoritma","sks":3}]

    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE layanan.persetujuan_pengajuan IS 'Keputusan persetujuan/penolakan per aktor per pengajuan';
COMMENT ON COLUMN layanan.persetujuan_pengajuan.keputusan IS 'Keputusan: disetujui, ditolak, dikembalikan';
COMMENT ON COLUMN layanan.persetujuan_pengajuan.a_diterima_tujuan IS 'Diterima oleh fakultas tujuan (khusus alih program)';
COMMENT ON COLUMN layanan.persetujuan_pengajuan.daftar_konversi_sks IS 'Daftar konversi SKS dalam format JSON (khusus alih program)';

-- =====================================================
-- Step 10: CREATE TABLE layanan.dokumen_hasil
-- =====================================================
-- Dokumen hasil layanan (surat keterangan, SK) per pengajuan.
-- Ini adalah output akhir dari proses layanan yang bisa
-- diunduh oleh mahasiswa.
-- Jenis output: surat_keterangan, sk_rektor, sk_dekan

CREATE TABLE IF NOT EXISTS layanan.dokumen_hasil (
    id_dokumen_hasil    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengajuan        UUID            NOT NULL REFERENCES layanan.pengajuan(id_pengajuan)
                                        ON DELETE CASCADE,
    id_template         UUID            NULL REFERENCES ref.template_dokumen(id_template)
                                        ON DELETE SET NULL,
                                        -- template yang dipakai untuk generate
    id_batch_penetapan  UUID            NULL,
                                        -- FK ditambahkan via ALTER TABLE
                                        -- untuk dokumen SK batch
    jenis_output        VARCHAR(50)     NOT NULL,
                                        -- surat_keterangan : surat keterangan biasa
                                        -- sk_rektor        : SK Rektor
                                        -- sk_dekan         : SK Dekan
    nomor_dokumen       VARCHAR(100)    NULL,
                                        -- nomor surat/SK
    tgl_dokumen         DATE            NULL,
                                        -- tanggal surat/SK
    nm_dokumen          VARCHAR(200)    NOT NULL,
                                        -- nama dokumen tampilan
    path_file           VARCHAR(1000)   NOT NULL,
                                        -- path file hasil di MinIO (VM7: 192.168.120.47:9000)
                                        -- format: simbak/hasil/{id_pengajuan}/{jenis_output}/{filename}
                                        -- bucket: myunila-storage
    data_blob           BYTEA           NULL,
                                        -- opsional: simpan file langsung di DB (untuk file kecil < 1MB)
                                        -- jika NULL, file diambil dari MinIO via path_file
    tipe_file           VARCHAR(100)    NOT NULL DEFAULT 'application/pdf',
    ukuran_byte         BIGINT          NULL,
    id_penerbit         UUID            NOT NULL,
                                        -- UUID admin yang generate/upload output
                                        -- ref ke man_akses.pengguna di pdut
    a_final             BOOLEAN         NOT NULL DEFAULT FALSE,
                                        -- TRUE jika sudah ditandatangani dan dipublikasikan
                                        -- FALSE jika masih draft
    keterangan          TEXT            NULL,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE layanan.dokumen_hasil IS 'Dokumen hasil layanan (surat keterangan, SK) per pengajuan';
COMMENT ON COLUMN layanan.dokumen_hasil.jenis_output IS 'Tipe output: surat_keterangan, sk_rektor, sk_dekan';
COMMENT ON COLUMN layanan.dokumen_hasil.a_final IS 'TRUE jika sudah ditandatangani dan dipublikasikan';
COMMENT ON COLUMN layanan.dokumen_hasil.id_penerbit IS 'UUID admin penerbit (ref ke man_akses.pengguna di pdut)';


-- =============================================================================
-- SCHEMA: batch
-- Berisi transaksi batch penetapan (habis masa mukim, putus studi)
-- =============================================================================

-- =====================================================
-- Step 11: CREATE TABLE batch.batch_penetapan
-- =====================================================
-- Header proses batch untuk:
-- 1. Penetapan Habis Masa Mukim (HMM)
--    Kriteria: D3 > 12 smt, S1 > 16 smt, S2 > 8 smt, S3 > 12 smt
-- 2. Penetapan Putus Studi Akademik
--    Kriteria: akhir smt IV (IPK < 2.00 atau SKS < 40),
--              akhir smt VIII (IPK < 2.00 atau SKS < 80)
--
-- Alur: Admin BAK tarik data → fakultas verifikasi →
--       SK Dekan terbit → SK Rektor terbit → selesai

CREATE TABLE IF NOT EXISTS batch.batch_penetapan (
    id_batch_penetapan  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_jenis_layanan    UUID            NOT NULL REFERENCES ref.jenis_layanan(id_jenis_layanan)
                                        ON DELETE RESTRICT,
    kode_batch          VARCHAR(50)     NOT NULL UNIQUE,
                                        -- auto-generated:
                                        -- BATCH-HMM-2026-01, BATCH-PS-2026-01
    nm_batch            VARCHAR(300)    NOT NULL,
                                        -- nama batch, misal:
                                        -- "Penetapan Habis Masa Mukim Semester Genap 2025/2026"
    jenis_batch         VARCHAR(30)     NOT NULL,
                                        -- habis_masa_mukim, putus_studi
    id_smt              VARCHAR(10)     NOT NULL,
                                        -- semester evaluasi
                                        -- ref ke siakadu.semester di pdut
    status              VARCHAR(30)     NOT NULL DEFAULT 'draft',
                                        -- draft              : batch baru dibuat
                                        -- kandidat_ditarik   : data kandidat sudah ditarik dari PDUT
                                        -- verifikasi_fakultas : sedang diverifikasi fakultas
                                        -- sk_dekan_terbit     : SK Dekan sudah diunggah
                                        -- sk_rektor_terbit    : SK Rektor sudah diunggah
                                        -- selesai            : proses batch selesai
    id_pembuat          UUID            NOT NULL,
                                        -- admin BAK yang menginisiasi
                                        -- ref ke man_akses.pengguna di pdut

    -- Snapshot kriteria seleksi dalam format JSON
    -- Disimpan agar dasar keputusan tetap bisa dilacak
    -- Contoh HMM: {"jenjang":"S1","batas_semester":16}
    -- Contoh PS:  {"checkpoint":"semester_iv","ipk_min":2.00,"sks_min":40}
    kriteria_snapshot   TEXT            NOT NULL,

    jumlah_kandidat     INT             NOT NULL DEFAULT 0,
                                        -- total kandidat yang ditarik
    jumlah_terverifikasi INT            NOT NULL DEFAULT 0,
                                        -- total kandidat yang dikonfirmasi fakultas
    jumlah_dikeluarkan  INT             NOT NULL DEFAULT 0,
                                        -- total kandidat yang dikeluarkan dari daftar

    -- === Referensi SK Dekan ===
    nomor_sk_dekan      VARCHAR(100)    NULL,
    tgl_sk_dekan        DATE            NULL,
    path_sk_dekan       VARCHAR(1000)   NULL,
                                        -- path file SK Dekan di storage

    -- === Referensi SK Rektor ===
    nomor_sk_rektor     VARCHAR(100)    NULL,
    tgl_sk_rektor       DATE            NULL,
    path_sk_rektor      VARCHAR(1000)   NULL,
                                        -- path file SK Rektor di storage

    tgl_tarik_data      TIMESTAMP       NULL,
                                        -- waktu penarikan data dari PDUT
    tgl_selesai         TIMESTAMP       NULL,
                                        -- waktu proses batch selesai
    catatan             TEXT            NULL,

    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE batch.batch_penetapan IS 'Header proses batch penetapan habis masa mukim atau putus studi akademik';
COMMENT ON COLUMN batch.batch_penetapan.jenis_batch IS 'Jenis batch: habis_masa_mukim, putus_studi';
COMMENT ON COLUMN batch.batch_penetapan.kriteria_snapshot IS 'Snapshot kriteria seleksi dalam format JSON (bukti dasar keputusan)';
COMMENT ON COLUMN batch.batch_penetapan.id_pembuat IS 'UUID admin BAK yang menginisiasi batch (ref ke man_akses.pengguna di pdut)';
COMMENT ON COLUMN batch.batch_penetapan.status IS 'Status batch: draft, kandidat_ditarik, verifikasi_fakultas, sk_dekan_terbit, sk_rektor_terbit, selesai';

-- =====================================================
-- Step 12: CREATE TABLE batch.kandidat_batch
-- =====================================================
-- Daftar mahasiswa kandidat dalam satu batch penetapan.
-- Data mahasiswa di-snapshot dari PDUT saat penarikan data
-- agar dasar keputusan tetap bisa dilacak.
-- Status kandidat:
--   masuk        : baru masuk daftar dari hasil tarik data
--   dikonfirmasi : dikonfirmasi fakultas, masuk penetapan final
--   dikeluarkan  : dikeluarkan dari daftar dengan alasan terdokumentasi

CREATE TABLE IF NOT EXISTS batch.kandidat_batch (
    id_kandidat         UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_batch_penetapan  UUID            NOT NULL REFERENCES batch.batch_penetapan(id_batch_penetapan)
                                        ON DELETE CASCADE,

    -- === Snapshot identitas mahasiswa (dari PDUT saat tarik data) ===
    id_mahasiswa        UUID            NOT NULL,
                                        -- ref ke siakadu.peserta_didik di pdut
    nim                 VARCHAR(20)     NOT NULL,
    nm_mahasiswa        VARCHAR(200)    NOT NULL,
    id_fakultas         UUID            NULL,
    nm_fakultas         VARCHAR(200)    NULL,
    id_prodi            UUID            NULL,
    nm_prodi            VARCHAR(200)    NULL,
    nm_jenjang          VARCHAR(50)     NULL,
                                        -- D3, S1, S2, S3
    angkatan            INT             NULL,

    -- === Snapshot data akademik ===
    semester_aktif      INT             NULL,
    ipk                 DECIMAL(4,2)    NULL,
    sks_lulus           INT             NULL,
    masa_studi_semester INT             NULL,
                                        -- total semester sejak pertama terdaftar
    status_mahasiswa    VARCHAR(50)     NULL,
    status_registrasi   VARCHAR(50)     NULL,
    status_pembayaran   VARCHAR(50)     NULL,

    -- === Status pemrosesan kandidat ===
    status_kandidat     VARCHAR(30)     NOT NULL DEFAULT 'masuk',
                                        -- masuk, dikonfirmasi, dikeluarkan
    alasan_exclusion    TEXT            NULL,
                                        -- alasan jika kandidat dikeluarkan dari daftar
    id_pengajuan        UUID            NULL,
                                        -- link ke pengajuan jika dibuat individual
                                        -- FK ditambahkan via ALTER TABLE

    tgl_snapshot        TIMESTAMP       NOT NULL DEFAULT NOW(),
                                        -- waktu pengambilan snapshot dari PDUT
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,
    UNIQUE (id_batch_penetapan, id_mahasiswa)
                                        -- satu mahasiswa hanya satu kali per batch
);

COMMENT ON TABLE batch.kandidat_batch IS 'Daftar mahasiswa kandidat dalam satu batch penetapan';
COMMENT ON COLUMN batch.kandidat_batch.status_kandidat IS 'Status kandidat: masuk (baru ditarik), dikonfirmasi (lolos verifikasi), dikeluarkan (di-exclude)';
COMMENT ON COLUMN batch.kandidat_batch.alasan_exclusion IS 'Alasan terdokumentasi jika kandidat dikeluarkan dari daftar';
COMMENT ON COLUMN batch.kandidat_batch.id_pengajuan IS 'Link ke layanan.pengajuan jika pengajuan individual dibuat (opsional)';

-- =====================================================
-- Step 13: CREATE TABLE batch.verifikasi_batch
-- =====================================================
-- Hasil verifikasi fakultas terhadap kandidat batch.
-- Setiap kandidat diverifikasi oleh admin fakultas:
-- dikonfirmasi (masuk penetapan final) atau
-- dikeluarkan (dikeluarkan dari daftar dengan alasan).
-- Satu kandidat hanya punya satu verifikasi.

CREATE TABLE IF NOT EXISTS batch.verifikasi_batch (
    id_verifikasi       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_batch_penetapan  UUID            NOT NULL REFERENCES batch.batch_penetapan(id_batch_penetapan)
                                        ON DELETE CASCADE,
    id_kandidat         UUID            NOT NULL REFERENCES batch.kandidat_batch(id_kandidat)
                                        ON DELETE CASCADE,
    id_verifikator      UUID            NOT NULL,
                                        -- admin fakultas yang memverifikasi
                                        -- ref ke man_akses.pengguna di pdut
    nm_verifikator      VARCHAR(200)    NULL,
                                        -- nama verifikator (denormalized)
    id_fakultas         UUID            NULL,
                                        -- konteks fakultas verifikator
    hasil               VARCHAR(30)     NOT NULL,
                                        -- dikonfirmasi : kandidat masuk penetapan final
                                        -- dikeluarkan  : kandidat dikeluarkan dari daftar
    catatan             TEXT            NULL,
                                        -- catatan atau alasan keputusan verifikasi
    tgl_verifikasi      TIMESTAMP       NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE (id_kandidat)
                                        -- satu verifikasi per kandidat
);

COMMENT ON TABLE batch.verifikasi_batch IS 'Hasil verifikasi fakultas terhadap kandidat batch';
COMMENT ON COLUMN batch.verifikasi_batch.hasil IS 'Hasil verifikasi: dikonfirmasi (masuk final), dikeluarkan (di-exclude)';
COMMENT ON COLUMN batch.verifikasi_batch.id_verifikator IS 'UUID admin fakultas yang memverifikasi (ref ke man_akses.pengguna di pdut)';


-- =============================================================================
-- SCHEMA: log
-- Berisi jejak audit, aktivitas pengguna, dan log perubahan data
-- =============================================================================

-- =====================================================
-- Step 14: CREATE TABLE log.jejak_audit
-- =====================================================
-- Jejak audit aksi pengguna di SIMBAK.
-- Mencatat setiap aksi bisnis yang dilakukan pengguna
-- (bukan perubahan data per-field, itu di log.aktivitas_data).

CREATE TABLE IF NOT EXISTS log.jejak_audit (
    id_audit            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengguna         UUID            NULL,
                                        -- UUID pelaku aksi
                                        -- NULL untuk aksi otomatis/system
                                        -- ref ke man_akses.pengguna di pdut
    nm_pengguna         VARCHAR(200)    NULL,
    ip_address          VARCHAR(45)     NULL,
                                        -- IPv4 atau IPv6
    user_agent          VARCHAR(500)    NULL,
    aksi                VARCHAR(50)     NOT NULL,
                                        -- pengajuan_dibuat, pengajuan_diajukan,
                                        -- status_berubah, dokumen_diunggah,
                                        -- persetujuan_diberikan, persetujuan_ditolak,
                                        -- batch_dibuat, batch_data_ditarik,
                                        -- batch_diverifikasi, output_digenerate,
                                        -- output_diterbitkan, template_diperbarui,
                                        -- login, logout
    nm_schema           VARCHAR(50)     NULL,
                                        -- schema tabel yang terpengaruh: ref, layanan, batch
    nm_tabel            VARCHAR(100)    NULL,
                                        -- nama tabel yang terpengaruh
    id_terkait          UUID            NULL,
                                        -- PK record yang terpengaruh
    detail              TEXT            NULL,
                                        -- JSON atau free-text detail aksi
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE log.jejak_audit IS 'Jejak audit aksi pengguna SIMBAK';
COMMENT ON COLUMN log.jejak_audit.aksi IS 'Jenis aksi: pengajuan_dibuat, status_berubah, persetujuan_diberikan, batch_dibuat, dll';
COMMENT ON COLUMN log.jejak_audit.nm_schema IS 'Schema tabel yang terpengaruh: ref, layanan, batch';
COMMENT ON COLUMN log.jejak_audit.nm_tabel IS 'Nama tabel yang terpengaruh oleh aksi';
COMMENT ON COLUMN log.jejak_audit.id_terkait IS 'Primary key record yang terpengaruh';
COMMENT ON COLUMN log.jejak_audit.detail IS 'Detail aksi dalam format JSON atau free-text';

-- =====================================================
-- Step 15: CREATE TABLE log.aktivitas_data
-- =====================================================
-- Log setiap perubahan data (INSERT, UPDATE, DELETE)
-- pada tabel-tabel transaksional dan referensi.
-- Diisi otomatis via trigger pada setiap tabel.
-- Menyimpan data lama (sebelum) dan data baru (sesudah)
-- dalam format JSON untuk keperluan audit detail.

CREATE TABLE IF NOT EXISTS log.aktivitas_data (
    id_aktivitas        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    nm_schema           VARCHAR(50)     NOT NULL,
                                        -- schema tabel: ref, layanan, batch
    nm_tabel            VARCHAR(100)    NOT NULL,
                                        -- nama tabel yang berubah
    id_record           UUID            NOT NULL,
                                        -- PK record yang berubah
    operasi             VARCHAR(10)     NOT NULL,
                                        -- INSERT, UPDATE, DELETE
    data_lama           TEXT            NULL,
                                        -- JSON: data sebelum perubahan
                                        -- NULL untuk INSERT
    data_baru           TEXT            NULL,
                                        -- JSON: data setelah perubahan
                                        -- NULL untuk DELETE
    kolom_berubah       TEXT            NULL,
                                        -- JSON array: daftar kolom yang berubah
                                        -- hanya diisi untuk UPDATE
                                        -- contoh: ["status","updated_at"]
    id_pengguna         UUID            NULL,
                                        -- UUID pelaku perubahan (dari session/context)
                                        -- ref ke man_akses.pengguna di pdut
    ip_address          VARCHAR(45)     NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE log.aktivitas_data IS 'Log setiap perubahan data (INSERT/UPDATE/DELETE) pada semua tabel';
COMMENT ON COLUMN log.aktivitas_data.operasi IS 'Jenis operasi: INSERT, UPDATE, DELETE';
COMMENT ON COLUMN log.aktivitas_data.data_lama IS 'JSON snapshot data sebelum perubahan (NULL untuk INSERT)';
COMMENT ON COLUMN log.aktivitas_data.data_baru IS 'JSON snapshot data setelah perubahan (NULL untuk DELETE)';
COMMENT ON COLUMN log.aktivitas_data.kolom_berubah IS 'JSON array kolom yang berubah (hanya untuk UPDATE)';
COMMENT ON COLUMN log.aktivitas_data.id_pengguna IS 'UUID pelaku perubahan, diambil dari session/context aplikasi';


-- =====================================================
-- Step 16: DEFERRED FOREIGN KEYS
-- =====================================================
-- FK yang merujuk tabel yang didefinisikan belakangan
-- (circular reference antar schema)

-- layanan.pengajuan.id_batch_penetapan -> batch.batch_penetapan
ALTER TABLE layanan.pengajuan
    ADD CONSTRAINT fk_pengajuan_batch_penetapan
    FOREIGN KEY (id_batch_penetapan) REFERENCES batch.batch_penetapan(id_batch_penetapan)
    ON DELETE SET NULL;

-- layanan.dokumen_hasil.id_batch_penetapan -> batch.batch_penetapan
ALTER TABLE layanan.dokumen_hasil
    ADD CONSTRAINT fk_dokumen_hasil_batch_penetapan
    FOREIGN KEY (id_batch_penetapan) REFERENCES batch.batch_penetapan(id_batch_penetapan)
    ON DELETE SET NULL;

-- batch.kandidat_batch.id_pengajuan -> layanan.pengajuan
ALTER TABLE batch.kandidat_batch
    ADD CONSTRAINT fk_kandidat_batch_pengajuan
    FOREIGN KEY (id_pengajuan) REFERENCES layanan.pengajuan(id_pengajuan)
    ON DELETE SET NULL;


-- =====================================================
-- Step 17: INDEXES
-- =====================================================

-- === ref.jenis_layanan ===
CREATE INDEX IF NOT EXISTS idx_jenis_layanan_kategori
    ON ref.jenis_layanan(kategori) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_jenis_layanan_kode
    ON ref.jenis_layanan(kode_layanan);

-- === ref.persyaratan_layanan ===
CREATE INDEX IF NOT EXISTS idx_persyaratan_layanan_jenis
    ON ref.persyaratan_layanan(id_jenis_layanan) WHERE soft_delete = FALSE;

-- === ref.tahapan_layanan ===
CREATE INDEX IF NOT EXISTS idx_tahapan_layanan_jenis
    ON ref.tahapan_layanan(id_jenis_layanan) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_tahapan_layanan_urutan
    ON ref.tahapan_layanan(id_jenis_layanan, urutan) WHERE soft_delete = FALSE;

-- === ref.template_dokumen ===
CREATE INDEX IF NOT EXISTS idx_template_dokumen_jenis
    ON ref.template_dokumen(id_jenis_layanan) WHERE soft_delete = FALSE AND a_aktif = TRUE;

-- === layanan.pengajuan ===
CREATE INDEX IF NOT EXISTS idx_pengajuan_jenis_layanan
    ON layanan.pengajuan(id_jenis_layanan) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_pengajuan_pemohon
    ON layanan.pengajuan(id_pemohon) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_pengajuan_status
    ON layanan.pengajuan(status) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_pengajuan_jenis_status
    ON layanan.pengajuan(id_jenis_layanan, status) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_pengajuan_tgl_diajukan
    ON layanan.pengajuan(tgl_diajukan DESC) WHERE soft_delete = FALSE AND tgl_diajukan IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pengajuan_nomor
    ON layanan.pengajuan(nomor_permohonan);

CREATE INDEX IF NOT EXISTS idx_pengajuan_batch
    ON layanan.pengajuan(id_batch_penetapan) WHERE id_batch_penetapan IS NOT NULL AND soft_delete = FALSE;

-- === layanan.data_pemohon ===
CREATE INDEX IF NOT EXISTS idx_data_pemohon_pengajuan
    ON layanan.data_pemohon(id_pengajuan) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_data_pemohon_mahasiswa
    ON layanan.data_pemohon(id_mahasiswa) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_data_pemohon_nim
    ON layanan.data_pemohon(nim) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_data_pemohon_fakultas
    ON layanan.data_pemohon(id_fakultas) WHERE soft_delete = FALSE;

-- === layanan.dokumen_pengajuan ===
CREATE INDEX IF NOT EXISTS idx_dokumen_pengajuan_pengajuan
    ON layanan.dokumen_pengajuan(id_pengajuan) WHERE soft_delete = FALSE;

-- === layanan.riwayat_pengajuan ===
CREATE INDEX IF NOT EXISTS idx_riwayat_pengajuan_pengajuan
    ON layanan.riwayat_pengajuan(id_pengajuan);

CREATE INDEX IF NOT EXISTS idx_riwayat_pengajuan_urutan
    ON layanan.riwayat_pengajuan(id_pengajuan, urutan);

CREATE INDEX IF NOT EXISTS idx_riwayat_pengajuan_aktor
    ON layanan.riwayat_pengajuan(id_aktor) WHERE id_aktor IS NOT NULL;

-- === layanan.persetujuan_pengajuan ===
CREATE INDEX IF NOT EXISTS idx_persetujuan_pengajuan_pengajuan
    ON layanan.persetujuan_pengajuan(id_pengajuan) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_persetujuan_pengajuan_approver
    ON layanan.persetujuan_pengajuan(id_approver) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_persetujuan_pengajuan_keputusan
    ON layanan.persetujuan_pengajuan(id_pengajuan, keputusan) WHERE soft_delete = FALSE;

-- === layanan.dokumen_hasil ===
CREATE INDEX IF NOT EXISTS idx_dokumen_hasil_pengajuan
    ON layanan.dokumen_hasil(id_pengajuan) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_dokumen_hasil_batch
    ON layanan.dokumen_hasil(id_batch_penetapan) WHERE id_batch_penetapan IS NOT NULL AND soft_delete = FALSE;

-- === batch.batch_penetapan ===
CREATE INDEX IF NOT EXISTS idx_batch_penetapan_jenis_layanan
    ON batch.batch_penetapan(id_jenis_layanan) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_batch_penetapan_jenis
    ON batch.batch_penetapan(jenis_batch) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_batch_penetapan_status
    ON batch.batch_penetapan(status) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_batch_penetapan_semester
    ON batch.batch_penetapan(id_smt) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_batch_penetapan_pembuat
    ON batch.batch_penetapan(id_pembuat) WHERE soft_delete = FALSE;

-- === batch.kandidat_batch ===
CREATE INDEX IF NOT EXISTS idx_kandidat_batch_batch
    ON batch.kandidat_batch(id_batch_penetapan) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_kandidat_batch_mahasiswa
    ON batch.kandidat_batch(id_mahasiswa) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_kandidat_batch_nim
    ON batch.kandidat_batch(nim) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_kandidat_batch_fakultas
    ON batch.kandidat_batch(id_fakultas) WHERE soft_delete = FALSE;

CREATE INDEX IF NOT EXISTS idx_kandidat_batch_status
    ON batch.kandidat_batch(id_batch_penetapan, status_kandidat) WHERE soft_delete = FALSE;

-- === batch.verifikasi_batch ===
CREATE INDEX IF NOT EXISTS idx_verifikasi_batch_batch
    ON batch.verifikasi_batch(id_batch_penetapan);

CREATE INDEX IF NOT EXISTS idx_verifikasi_batch_kandidat
    ON batch.verifikasi_batch(id_kandidat);

-- === log.jejak_audit ===
CREATE INDEX IF NOT EXISTS idx_jejak_audit_pengguna
    ON log.jejak_audit(id_pengguna, created_at DESC) WHERE id_pengguna IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_jejak_audit_aksi
    ON log.jejak_audit(aksi, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jejak_audit_terkait
    ON log.jejak_audit(nm_tabel, id_terkait) WHERE id_terkait IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_jejak_audit_created
    ON log.jejak_audit(created_at DESC);

-- === log.aktivitas_data ===
CREATE INDEX IF NOT EXISTS idx_aktivitas_data_tabel
    ON log.aktivitas_data(nm_schema, nm_tabel, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_aktivitas_data_record
    ON log.aktivitas_data(nm_tabel, id_record);

CREATE INDEX IF NOT EXISTS idx_aktivitas_data_pengguna
    ON log.aktivitas_data(id_pengguna, created_at DESC) WHERE id_pengguna IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_aktivitas_data_operasi
    ON log.aktivitas_data(operasi, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_aktivitas_data_created
    ON log.aktivitas_data(created_at DESC);


-- =====================================================
-- Step 18: TRIGGER auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger ke semua tabel yang punya kolom updated_at
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT unnest(ARRAY[
        'ref.jenis_layanan',
        'ref.persyaratan_layanan',
        'ref.tahapan_layanan',
        'ref.template_dokumen',
        'layanan.pengajuan',
        'layanan.data_pemohon',
        'layanan.dokumen_pengajuan',
        'layanan.persetujuan_pengajuan',
        'layanan.dokumen_hasil',
        'batch.batch_penetapan',
        'batch.kandidat_batch'
    ]) AS full_name
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS set_updated_at ON %s; CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();',
            r.full_name, r.full_name
        );
    END LOOP;
END;
$$;


-- =====================================================
-- Step 19: TRIGGER log aktivitas data (INSERT/UPDATE/DELETE)
-- =====================================================
-- Fungsi generic yang mencatat setiap perubahan data
-- ke log.aktivitas_data secara otomatis.
-- Diaktifkan pada semua tabel transaksional dan referensi.

CREATE OR REPLACE FUNCTION log.fn_catat_aktivitas_data()
RETURNS TRIGGER AS $$
DECLARE
    v_id_record     UUID;
    v_data_lama     TEXT := NULL;
    v_data_baru     TEXT := NULL;
    v_kolom_berubah TEXT := NULL;
    v_id_pengguna   UUID := NULL;
    v_ip_address    VARCHAR(45) := NULL;
BEGIN
    -- Ambil id_pengguna dan ip_address dari session context (diset oleh aplikasi)
    -- Aplikasi harus SET LOCAL simbak.id_pengguna = 'uuid' di awal transaksi
    BEGIN
        v_id_pengguna := current_setting('simbak.id_pengguna', true)::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_id_pengguna := NULL;
    END;
    BEGIN
        v_ip_address := current_setting('simbak.ip_address', true);
    EXCEPTION WHEN OTHERS THEN
        v_ip_address := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        -- Ambil PK secara dinamis dari nama kolom yang dikirim via TG_ARGV[0]
        EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_id_record USING NEW;
        v_data_baru := row_to_json(NEW)::TEXT;

        INSERT INTO log.aktivitas_data (nm_schema, nm_tabel, id_record, operasi, data_lama, data_baru, kolom_berubah, id_pengguna, ip_address)
        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, v_id_record, 'INSERT', NULL, v_data_baru, NULL, v_id_pengguna, v_ip_address);

        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_id_record USING NEW;
        v_data_lama := row_to_json(OLD)::TEXT;
        v_data_baru := row_to_json(NEW)::TEXT;

        -- Hitung kolom yang berubah
        SELECT json_agg(key)::TEXT INTO v_kolom_berubah
        FROM (
            SELECT key
            FROM json_each_text(row_to_json(OLD)) AS o(key, val)
            FULL JOIN json_each_text(row_to_json(NEW)) AS n(key, val)
                ON o.key = n.key
            WHERE o.val IS DISTINCT FROM n.val
                AND o.key NOT IN ('updated_at')
                -- skip updated_at karena selalu berubah via trigger
        ) changed;

        -- Hanya catat jika ada kolom selain updated_at yang berubah
        IF v_kolom_berubah IS NOT NULL AND v_kolom_berubah != '[]' THEN
            INSERT INTO log.aktivitas_data (nm_schema, nm_tabel, id_record, operasi, data_lama, data_baru, kolom_berubah, id_pengguna, ip_address)
            VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, v_id_record, 'UPDATE', v_data_lama, v_data_baru, v_kolom_berubah, v_id_pengguna, v_ip_address);
        END IF;

        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_id_record USING OLD;
        v_data_lama := row_to_json(OLD)::TEXT;

        INSERT INTO log.aktivitas_data (nm_schema, nm_tabel, id_record, operasi, data_lama, data_baru, kolom_berubah, id_pengguna, ip_address)
        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, v_id_record, 'DELETE', v_data_lama, NULL, NULL, v_id_pengguna, v_ip_address);

        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log.fn_catat_aktivitas_data() IS 'Trigger function: catat setiap INSERT/UPDATE/DELETE ke log.aktivitas_data';

-- Apply trigger aktivitas_data ke semua tabel transaksional dan referensi
-- Parameter TG_ARGV[0] = nama kolom PK
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT *
    FROM (VALUES
        -- (schema.tabel, nama_kolom_pk)
        ('ref.jenis_layanan',                'id_jenis_layanan'),
        ('ref.persyaratan_layanan',          'id_persyaratan'),
        ('ref.tahapan_layanan',              'id_tahapan'),
        ('ref.template_dokumen',             'id_template'),
        ('layanan.pengajuan',                'id_pengajuan'),
        ('layanan.data_pemohon',             'id_data_pemohon'),
        ('layanan.dokumen_pengajuan',        'id_dokumen'),
        ('layanan.riwayat_pengajuan',        'id_riwayat'),
        ('layanan.persetujuan_pengajuan',    'id_persetujuan'),
        ('layanan.dokumen_hasil',            'id_dokumen_hasil'),
        ('batch.batch_penetapan',            'id_batch_penetapan'),
        ('batch.kandidat_batch',             'id_kandidat'),
        ('batch.verifikasi_batch',           'id_verifikasi')
    ) AS t(full_name, pk_col)
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_aktivitas_data ON %s;
             CREATE TRIGGER trg_aktivitas_data
             AFTER INSERT OR UPDATE OR DELETE ON %s
             FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data(%L);',
            r.full_name, r.full_name, r.pk_col
        );
    END LOOP;
END;
$$;


-- =====================================================
-- DONE
-- =====================================================
-- Schema Summary:
--
--   ref (referensi/master):
--     ref.jenis_layanan
--     ref.persyaratan_layanan
--     ref.tahapan_layanan
--     ref.template_dokumen
--
--   layanan (transaksi pengajuan):
--     layanan.pengajuan ──┬── layanan.data_pemohon
--                         ├── layanan.dokumen_pengajuan
--                         ├── layanan.riwayat_pengajuan
--                         ├── layanan.persetujuan_pengajuan
--                         └── layanan.dokumen_hasil
--
--   batch (transaksi batch penetapan):
--     batch.batch_penetapan ──┬── batch.kandidat_batch
--                             │       └── batch.verifikasi_batch
--                             └── layanan.dokumen_hasil (shared SK)
--
--   log (audit & aktivitas):
--     log.jejak_audit      — aksi bisnis pengguna
--     log.aktivitas_data   — perubahan data per-record (auto via trigger)
--
-- Cross-schema FK:
--   layanan.pengajuan → ref.jenis_layanan
--   layanan.pengajuan → batch.batch_penetapan (deferred)
--   layanan.dokumen_pengajuan → ref.persyaratan_layanan
--   layanan.riwayat_pengajuan → ref.tahapan_layanan
--   layanan.dokumen_hasil → ref.template_dokumen
--   layanan.dokumen_hasil → batch.batch_penetapan (deferred)
--   batch.batch_penetapan → ref.jenis_layanan
--   batch.kandidat_batch → layanan.pengajuan (deferred)
--
-- Architecture:
--   ┌───────────────────────────┐          ┌──────────────────────┐
--   │   PostgreSQL               │          │   SQL Server         │
--   │   simbak                   │          │   pdut               │
--   ├───────────────────────────┤          ├──────────────────────┤
--   │ [ref]                      │  ref──▶  │ man_akses.pengguna   │
--   │   jenis_layanan            │          │ man_akses.peran       │
--   │   persyaratan_layanan      │          │ man_akses.organisasi  │
--   │   tahapan_layanan          │  ref──▶  │ siakadu.peserta_didik │
--   │   template_dokumen         │          │ siakadu.reg_pd        │
--   │ [layanan]                  │          │ siakadu.semester      │
--   │   pengajuan                │          │ siakadu.sms           │
--   │   data_pemohon             │          │ keuangan.spp_mhs      │
--   │   dokumen_pengajuan        │          └──────────────────────┘
--   │   riwayat_pengajuan        │          (READ ONLY reference)
--   │   persetujuan_pengajuan    │
--   │   dokumen_hasil            │
--   │ [batch]                    │
--   │   batch_penetapan          │
--   │   kandidat_batch           │
--   │   verifikasi_batch         │
--   │ [log]                      │
--   │   jejak_audit              │
--   │   aktivitas_data           │
--   └───────────────────────────┘
--   (Primary - READ/WRITE)
--
-- Statistik:
--   Total schema  : 4 (ref, layanan, batch, log)
--   Total tabel   : 15 (4 ref + 6 layanan + 3 batch + 2 log)
--   Total FK      : 16 (13 inline + 3 deferred ALTER TABLE)
--   Total index   : 42
--   Total trigger : 24 (11 updated_at + 13 aktivitas_data)
--
-- Kolom Audit:
--   id_creator    : UUID pembuat record (ref ke man_akses.pengguna di pdut)
--   id_updater    : UUID pengubah terakhir (ref ke man_akses.pengguna di pdut)
--   created_at    : timestamp pembuatan record
--   updated_at    : timestamp perubahan terakhir (auto via trigger)
--   soft_delete   : penanda hapus logis
--   Catatan: tabel log.* tidak pakai id_creator/id_updater,
--            sudah ada id_pengguna di masing-masing tabel log
--
-- File Storage (MinIO):
--   Endpoint  : 192.168.120.47:9000 (VM7)
--   Bucket    : myunila-storage
--   Path format:
--     simbak/pengajuan/{id_pengajuan}/{kode_dokumen}/{filename}  — dokumen syarat
--     simbak/hasil/{id_pengajuan}/{jenis_output}/{filename}      — dokumen output
--     simbak/batch/{id_batch}/{jenis_sk}/{filename}              — SK batch
--   Kolom: path_file (wajib, path MinIO), data_blob (opsional, BYTEA untuk file < 1MB)
--
-- Cara set session context untuk log aktivitas data (di Laravel):
--   DB::statement("SET LOCAL simbak.id_pengguna = '{$userId}'");
--   DB::statement("SET LOCAL simbak.ip_address = '{$ipAddress}'");
--   // ... lakukan operasi dalam transaksi yang sama
--
-- Next Steps:
--   1. Review schema dan tipe data
--   2. Setup bak-service Laravel dengan dual DB connection (simbak + pdut)
--   3. Buat frontend Next.js pages di frontend/src/app/dashboard/sim-bak
--   4. Provisioning PostgreSQL container di docker-compose
--   5. Konfigurasi MinIO bucket policy untuk path simbak/*
-- =====================================================
