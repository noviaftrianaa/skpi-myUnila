-- =====================================================
-- Script: SIMBAK - Sistem Informasi Manajemen BAK
-- Database: PostgreSQL (dedicated DB: simbak)
-- Version: 1.2
-- Date: 2026-05-13
-- Author: Vibe Bot + Mizar
-- Description:
--   Modul layanan administrasi kemahasiswaan BAK
--   terintegrasi dalam ekosistem MyUnila.
--   DB terpisah menggunakan PostgreSQL untuk transaksi.
--
--   Versi ini = v1.1 + semua ALTER yang sudah diterapkan
--   (file 07–19) + infrastruktur notifikasi.
--   Cocok untuk fresh install (skip menjalankan ALTER terpisah).
--
--   CHANGELOG dari v1.1 (per 2026-05-13):
--     [07a] + layanan.pengajuan.id_smt_akhir_cuti
--     [07b] + batch.batch_penetapan.id_fakultas, nm_fakultas + index
--     [08]  + ref.kategori_cuti (4 seed) + layanan.pengajuan.kategori_cuti (FK)
--     [09]  + layanan.dokumen_pengajuan.nomor_dokumen, tgl_dokumen
--     [10]  + layanan.data_pemohon.nm_jenjang_asal, nm_prodi_asal,
--             email_pemohon, no_hp_pemohon (dukung PM-ALIH eksternal)
--     [11]  Tahapan PM-ALIH direstruktur 6 tahap (data tahapan di seed)
--     [12]  + ref.kategori_undur (2 seed) + layanan.pengajuan.kategori_undur (FK)
--             + layanan.pengajuan.nm_pt_tujuan
--     [13]  + ref.ketentuan_layanan (kriteria akademik dinamis)
--     [14]  + layanan.pengajuan.nomor_surat_polisi, tgl_surat_polisi,
--             nomor_surat_ket_aktif, tgl_surat_ket_aktif (SK-PKKMB, SK-KTM)
--     [15]  + layanan.pengajuan.nomor_sk_cuti, tgl_sk_cuti (SK-HERREG)
--     [16]  Tahapan SK-* direstruktur 4 tahap dengan Persetujuan Kabag (data di seed)
--     [17]  Unify role 'pejabat' -> 'kabag' (data di seed)
--     [18]  + Infrastruktur notifikasi: ref.pengaturan_notifikasi,
--             ref.template_notifikasi, ref.smtp_config, log.notifikasi
--             (seed default: SMTP keys, 5 template, pejabat penandatangan)
--     [19]  + ref.template_dokumen.body_html, body_default, tipe_template
--             (mendukung CKEditor editable template surat)
--
--   Schemas:
--     - ref      : Data referensi/master (jenis layanan, persyaratan, tahapan, template,
--                  ktw_exclude_jalur, kategori_cuti, kategori_undur, ketentuan_layanan,
--                  pengaturan_notifikasi, template_notifikasi, smtp_config)
--     - layanan  : Transaksi pengajuan layanan mahasiswa
--     - batch    : Transaksi batch penetapan (HMM, putus studi)
--     - log      : Jejak audit, aktivitas, perubahan data, notifikasi
--
--   Tables (22 total):
--     ref.jenis_layanan            - Master jenis layanan BAK
--     ref.persyaratan_layanan      - Konfigurasi dokumen persyaratan per layanan
--     ref.tahapan_layanan          - Template tahapan workflow per layanan
--     ref.template_dokumen         - Template surat/SK (pdf_upload atau html_editable)
--     ref.ktw_exclude_jalur        - Jalur pendaftaran yang di-exclude dari KTW
--     ref.kategori_cuti            - [v1.2] Kategori cuti akademik
--     ref.kategori_undur           - [v1.2] Kategori pengunduran diri
--     ref.ketentuan_layanan        - [v1.2] Ketentuan/kriteria akademik dinamis
--     ref.pengaturan_notifikasi    - [v1.2] Setting SMTP/WA + pejabat penandatangan
--     ref.template_notifikasi      - [v1.2] Template email/WA per event
--     ref.smtp_config              - [v1.2] Konfigurasi SMTP multi-config
--     layanan.pengajuan            - Header pengajuan layanan mahasiswa
--     layanan.data_pemohon         - Snapshot data akademik pemohon
--     layanan.dokumen_pengajuan    - Dokumen persyaratan yang diunggah
--     layanan.riwayat_pengajuan    - Riwayat perubahan status/tahapan
--     layanan.persetujuan_pengajuan - Keputusan approval per aktor
--     layanan.dokumen_hasil        - Dokumen hasil layanan (surat/SK)
--     batch.batch_penetapan        - Header proses batch (HMM/putus studi)
--     batch.kandidat_batch         - Daftar mahasiswa kandidat dalam batch
--     batch.verifikasi_batch       - Hasil verifikasi fakultas terhadap kandidat
--     log.jejak_audit              - Jejak audit aksi pengguna
--     log.aktivitas_data           - Log perubahan data (INSERT/UPDATE/DELETE)
--     log.notifikasi               - [v1.2] Log pengiriman notifikasi email/WA
--
--   Naming Convention:
--     - Schema: ref, layanan, batch, log
--     - PK: id_<tabel> UUID DEFAULT gen_random_uuid()  (ref kategori pakai VARCHAR slug)
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
CREATE SCHEMA IF NOT EXISTS log;        -- jejak audit, aktivitas, perubahan data, notifikasi

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
--   - man_akses.unit_organisasi → unit organisasi / fakultas
--   - siakadu.peserta_didik    → data mahasiswa
--   - siakadu.reg_pd           → registrasi mahasiswa per semester
--   - ref.semester             → referensi semester akademik
--   - pdrd.sms                 → satuan manajemen sumber daya (prodi)
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
                                        -- SK-LOA, SK-KTM, SK-PKKMB, SK-HERREG,
                                        -- PM-CUTI, PM-UNDUR, PM-ALIH,
                                        -- BA-HMM, BA-PUTUS, MN-MONITOR
    nm_layanan          VARCHAR(200)    NOT NULL,
    deskripsi           TEXT            NULL,
    kategori            VARCHAR(30)     NOT NULL,
                                        -- surat_mandiri, permohonan_akademik,
                                        -- batch_administrasi, monitoring
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,
    a_batch             BOOLEAN         NOT NULL DEFAULT FALSE,
    urutan              INT             NOT NULL DEFAULT 0,
    sla_hari            INT             NULL,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE ref.jenis_layanan IS 'Master jenis layanan BAK (10 jenis, 4 kategori)';
COMMENT ON COLUMN ref.jenis_layanan.kode_layanan IS 'Kode unik layanan: SK-LOA, SK-KTM, PM-CUTI, PM-ALIH, BA-HMM, dll';
COMMENT ON COLUMN ref.jenis_layanan.nm_layanan IS 'Nama lengkap layanan yang ditampilkan ke pengguna';
COMMENT ON COLUMN ref.jenis_layanan.kategori IS 'Kategori: surat_mandiri, permohonan_akademik, batch_administrasi, monitoring';
COMMENT ON COLUMN ref.jenis_layanan.a_batch IS 'TRUE jika layanan bersifat batch (inisiasi admin, bukan mahasiswa)';
COMMENT ON COLUMN ref.jenis_layanan.sla_hari IS 'Target SLA penyelesaian dalam hari kerja';

-- =====================================================
-- Step 2: CREATE TABLE ref.persyaratan_layanan
-- =====================================================
CREATE TABLE IF NOT EXISTS ref.persyaratan_layanan (
    id_persyaratan      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_jenis_layanan    UUID            NOT NULL REFERENCES ref.jenis_layanan(id_jenis_layanan)
                                        ON DELETE CASCADE,
    kode_dokumen        VARCHAR(50)     NOT NULL,
    nm_dokumen          VARCHAR(200)    NOT NULL,
    deskripsi           TEXT            NULL,
    a_wajib             BOOLEAN         NOT NULL DEFAULT TRUE,
    urutan              INT             NOT NULL DEFAULT 0,
    tipe_file           VARCHAR(100)    NOT NULL DEFAULT 'application/pdf',
    max_size_mb         INT             NOT NULL DEFAULT 5,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,
    UNIQUE (id_jenis_layanan, kode_dokumen)
);

COMMENT ON TABLE ref.persyaratan_layanan IS 'Konfigurasi dokumen persyaratan per jenis layanan';
COMMENT ON COLUMN ref.persyaratan_layanan.kode_dokumen IS 'Kode jenis dokumen: SURAT_PERMOHONAN, KTM, SLIP_UKT, DOC-SK-CUTI, dll';
COMMENT ON COLUMN ref.persyaratan_layanan.a_wajib IS 'TRUE jika dokumen wajib diunggah oleh pemohon';
COMMENT ON COLUMN ref.persyaratan_layanan.tipe_file IS 'MIME types yang diizinkan, comma-separated';
COMMENT ON COLUMN ref.persyaratan_layanan.max_size_mb IS 'Batas ukuran file maksimal dalam megabyte';

-- =====================================================
-- Step 3: CREATE TABLE ref.tahapan_layanan
-- =====================================================
-- Template tahapan workflow per jenis layanan.
-- Contoh PM-CUTI (6 tahap):
--   1. Pengajuan Mahasiswa
--   2. Verifikasi Admin Fakultas
--   3. Verifikasi Admin BAK
--   4. Persetujuan Pimpinan (kabag)
--   5. Penerbitan SK
-- Contoh SK-* (4 tahap, [v1.2] dengan Persetujuan Kabag):
--   1. Pengajuan Mahasiswa
--   2. Verifikasi Admin BAK
--   3. Persetujuan Pimpinan (kabag)
--   4. Penerbitan Surat
-- Contoh PM-ALIH (6 tahap, [v1.2]):
--   1. Pengajuan Mahasiswa
--   2. Verifikasi Fakultas Asal
--   3. Verifikasi & Penerimaan Fakultas Tujuan
--   4. Verifikasi Admin BAK
--   5. Persetujuan Pimpinan (kabag)
--   6. Penerbitan SK Rektor / Surat Penolakan

CREATE TABLE IF NOT EXISTS ref.tahapan_layanan (
    id_tahapan          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_jenis_layanan    UUID            NOT NULL REFERENCES ref.jenis_layanan(id_jenis_layanan)
                                        ON DELETE CASCADE,
    urutan              INT             NOT NULL,
    nm_tahapan          VARCHAR(200)    NOT NULL,
    kode_role           VARCHAR(50)     NOT NULL,
                                        -- mahasiswa, admin_fakultas_asal, admin_fakultas_tujuan,
                                        -- admin_bak, kabag (persetujuan pimpinan), system
    status_masuk        VARCHAR(30)     NOT NULL,
    status_selesai      VARCHAR(30)     NOT NULL,
    a_opsional          BOOLEAN         NOT NULL DEFAULT FALSE,
    deskripsi           TEXT            NULL,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,
    UNIQUE (id_jenis_layanan, urutan)
);

COMMENT ON TABLE ref.tahapan_layanan IS 'Template tahapan workflow per jenis layanan';
COMMENT ON COLUMN ref.tahapan_layanan.kode_role IS 'Role aktor: mahasiswa, admin_fakultas_asal, admin_bak, kabag, dll';
COMMENT ON COLUMN ref.tahapan_layanan.status_masuk IS 'Status pengajuan yang memicu tahapan ini dimulai';
COMMENT ON COLUMN ref.tahapan_layanan.status_selesai IS 'Status pengajuan setelah tahapan ini diselesaikan';
COMMENT ON COLUMN ref.tahapan_layanan.a_opsional IS 'TRUE jika tahapan ini bisa dilewati pada kondisi tertentu';

-- =====================================================
-- Step 4: CREATE TABLE ref.template_dokumen
-- =====================================================
-- Template dokumen surat/SK per jenis layanan.
-- [v1.2] Dua tipe template:
--   - pdf_upload    : Admin upload file PDF/DOCX (default)
--   - html_editable : Admin edit body via CKEditor, layout dari Blade
--   - blanko_mahasiswa : Template blanko (Word/PDF) untuk diunduh & diisi mahasiswa,
--                        lalu diupload kembali sebagai dokumen persyaratan

CREATE TABLE IF NOT EXISTS ref.template_dokumen (
    id_template         UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_jenis_layanan    UUID            NOT NULL REFERENCES ref.jenis_layanan(id_jenis_layanan)
                                        ON DELETE CASCADE,
    nm_template         VARCHAR(200)    NOT NULL,
    versi               VARCHAR(20)     NOT NULL DEFAULT '1.0',
    path_file           VARCHAR(1000)   NOT NULL,
                                        -- path ke file template (PDF/DOCX) di storage
                                        -- kosong untuk tipe_template = 'html_editable'
    tipe_file           VARCHAR(100)    NOT NULL DEFAULT 'application/pdf',
    tipe_template       VARCHAR(30)     NOT NULL DEFAULT 'pdf_upload',
                                        -- [v1.2] pdf_upload | html_editable | blanko_mahasiswa
    body_html           TEXT            NULL,
                                        -- [v1.2] HTML body editable (untuk tipe html_editable)
    body_default        TEXT            NULL,
                                        -- [v1.2] Backup default body untuk Reset ke Default
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,
    keterangan          TEXT            NULL,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE ref.template_dokumen IS 'Template dokumen surat/SK per jenis layanan';
COMMENT ON COLUMN ref.template_dokumen.versi IS 'Versi template: 1.0, 2.0, dll';
COMMENT ON COLUMN ref.template_dokumen.path_file IS 'Path file template di storage (kosong untuk html_editable)';
COMMENT ON COLUMN ref.template_dokumen.tipe_template IS 'pdf_upload | html_editable | blanko_mahasiswa';
COMMENT ON COLUMN ref.template_dokumen.body_html IS 'HTML body editable oleh admin BAK (untuk tipe html_editable)';
COMMENT ON COLUMN ref.template_dokumen.body_default IS 'Backup default body HTML untuk fitur Reset ke Default';
COMMENT ON COLUMN ref.template_dokumen.a_aktif IS 'Hanya template aktif yang dipakai untuk generate dokumen';

-- =====================================================
-- Step 4b: CREATE TABLE ref.ktw_exclude_jalur  [v1.1]
-- =====================================================
-- Daftar jalur pendaftaran yang di-exclude dari perhitungan
-- Kelulusan Tepat Waktu (KTW) di monitoring.

CREATE TABLE IF NOT EXISTS ref.ktw_exclude_jalur (
    id_exclude          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    jalur_pendaftaran   VARCHAR(200)    NOT NULL UNIQUE,
    deskripsi           TEXT            NULL,
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.ktw_exclude_jalur IS 'Daftar jalur pendaftaran yang di-exclude dari perhitungan Kelulusan Tepat Waktu (KTW)';
COMMENT ON COLUMN ref.ktw_exclude_jalur.jalur_pendaftaran IS 'Match exact ke siakadu.mahasiswa.jalur_pendaftaran';

INSERT INTO ref.ktw_exclude_jalur (jalur_pendaftaran, deskripsi) VALUES
    ('Pindahan/Transfer', 'Mahasiswa transfer dari PT lain, masa studi awal tidak dihitung di Unila'),
    ('Mahasiswa Asing', 'Mahasiswa internasional, kurikulum dan masa studi mungkin berbeda'),
    ('Permata Sakti/Pertukaran Mahasiswa', 'Program pertukaran, tidak mengambil seluruh kurikulum di Unila'),
    ('RPL (Rekognisi Pembelajaran Lampau)', 'Mahasiswa RPL dengan pengakuan SKS, masa studi lebih pendek dari reguler'),
    ('Studi Lanjut (D3 ke S1)', 'Mahasiswa transfer D3 ke S1, masa studi tidak fair dibanding S1 reguler')
ON CONFLICT (jalur_pendaftaran) DO NOTHING;

-- =====================================================
-- Step 4c: CREATE TABLE ref.kategori_cuti  [v1.2]
-- =====================================================
-- Kategori cuti akademik (terencana atau tidak terencana).
-- Direferensikan oleh layanan.pengajuan.kategori_cuti untuk PM-CUTI.

CREATE TABLE IF NOT EXISTS ref.kategori_cuti (
    id_kategori_cuti    VARCHAR(30)     PRIMARY KEY,
                                        -- slug pendek: terencana, kecelakaan, sakit, melahirkan
    nm_kategori         VARCHAR(100)    NOT NULL,
    deskripsi           TEXT            NULL,
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,
    urutan              INT             NOT NULL DEFAULT 1,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.kategori_cuti IS 'Kategori cuti akademik (terencana, kecelakaan, sakit, melahirkan)';

INSERT INTO ref.kategori_cuti (id_kategori_cuti, nm_kategori, deskripsi, urutan) VALUES
    ('terencana',  'Cuti Terencana',                       'Cuti akademik yang diajukan sebelum semester dimulai', 1),
    ('kecelakaan', 'Cuti Tidak Terencana — Kecelakaan',    'Cuti karena kecelakaan yang menghalangi kegiatan akademik', 2),
    ('sakit',      'Cuti Tidak Terencana — Sakit',         'Cuti karena sakit berkepanjangan yang memerlukan perawatan', 3),
    ('melahirkan', 'Cuti Tidak Terencana — Melahirkan',    'Cuti karena proses persalinan/melahirkan', 4)
ON CONFLICT (id_kategori_cuti) DO NOTHING;

-- =====================================================
-- Step 4d: CREATE TABLE ref.kategori_undur  [v1.2]
-- =====================================================
-- Kategori pengunduran diri: undur permanen atau pindah ke PT lain.
-- Direferensikan oleh layanan.pengajuan.kategori_undur untuk PM-UNDUR.

CREATE TABLE IF NOT EXISTS ref.kategori_undur (
    id_kategori_undur   VARCHAR(30)     PRIMARY KEY,
                                        -- slug: undur_diri, pindah_pt
    nm_kategori         VARCHAR(100)    NOT NULL,
    deskripsi           TEXT            NULL,
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,
    urutan              INT             NOT NULL DEFAULT 1,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.kategori_undur IS 'Kategori pengunduran diri: undur_diri (permanen) atau pindah_pt (pindah ke universitas lain)';

INSERT INTO ref.kategori_undur (id_kategori_undur, nm_kategori, deskripsi, urutan) VALUES
    ('undur_diri', 'Pengunduran Diri',          'Mahasiswa berhenti dari Unila secara permanen', 1),
    ('pindah_pt',  'Pindah ke Universitas Lain', 'Mahasiswa pindah/transfer ke perguruan tinggi lain', 2)
ON CONFLICT (id_kategori_undur) DO NOTHING;

-- =====================================================
-- Step 4e: CREATE TABLE ref.ketentuan_layanan  [v1.2]
-- =====================================================
-- Ketentuan/kriteria akademik dinamis per jenis layanan:
--   - Evaluasi Studi (BA-HMM, BA-PUTUS): kriteria tarik kandidat
--   - Permohonan Akademik (PM-ALIH): syarat akademik pemohon
-- Sebelumnya hardcoded di PdutRepository & PengajuanController.
-- Seed kriteria default ditarik dari script seed terpisah karena
-- bergantung pada data jenis_layanan.

CREATE TABLE IF NOT EXISTS ref.ketentuan_layanan (
    id_ketentuan        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_jenis_layanan    UUID            NOT NULL REFERENCES ref.jenis_layanan(id_jenis_layanan),
    nm_jenjang          VARCHAR(50)     NULL,
                                        -- D3, S1, S2, S3 atau NULL = semua jenjang
    kondisi_semester    INT             NULL,
                                        -- gate semester (mis. 4 atau 8 untuk Putus Studi)
    kode_ketentuan      VARCHAR(50)     NOT NULL,
                                        -- masa_studi_min, ipk_min, sks_min, semester_max
    nm_ketentuan        VARCHAR(200)    NOT NULL,
    operator            VARCHAR(10)     NOT NULL,
                                        -- <, >, <=, >=, =, !=
    nilai               NUMERIC(10, 2)  NOT NULL,
    pesan_gagal         TEXT            NULL,
    deskripsi           TEXT            NULL,
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,
    urutan              INT             NOT NULL DEFAULT 1,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.ketentuan_layanan IS 'Ketentuan/kriteria akademik dinamis per jenis layanan (HMM, Putus Studi, PM-ALIH)';
COMMENT ON COLUMN ref.ketentuan_layanan.nm_jenjang IS 'Filter jenjang (D3/S1/S2/S3) atau NULL = semua';
COMMENT ON COLUMN ref.ketentuan_layanan.kondisi_semester IS 'Gate semester (mis. 4 atau 8 untuk Putus Studi)';
COMMENT ON COLUMN ref.ketentuan_layanan.kode_ketentuan IS 'masa_studi_min, ipk_min, sks_min, semester_max, dll';
COMMENT ON COLUMN ref.ketentuan_layanan.operator IS '<, >, <=, >=, =, !=';

CREATE INDEX IF NOT EXISTS idx_ketentuan_jenis
    ON ref.ketentuan_layanan(id_jenis_layanan, a_aktif);

-- =====================================================
-- Step 4f: CREATE TABLE ref.pengaturan_notifikasi  [v1.2]
-- =====================================================
-- Konfigurasi key-value untuk SMTP, WhatsApp, dan setting umum
-- (termasuk identitas pejabat penandatangan surat).

CREATE TABLE IF NOT EXISTS ref.pengaturan_notifikasi (
    id_pengaturan       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode                VARCHAR(50)     NOT NULL UNIQUE,
                                        -- smtp_host, smtp_port, smtp_username, smtp_password,
                                        -- pejabat_nama, pejabat_nip, pejabat_jabatan, tempat_terbit,
                                        -- notifikasi_aktif
    nilai               TEXT            NULL,
    deskripsi           VARCHAR(200)    NULL,
    grup                VARCHAR(30)     NOT NULL DEFAULT 'smtp',
                                        -- smtp, whatsapp, umum, pejabat
    a_rahasia           BOOLEAN         NOT NULL DEFAULT FALSE,
                                        -- TRUE untuk password/api_key (masked di UI)
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.pengaturan_notifikasi IS 'Konfigurasi SMTP, WhatsApp, dan setting umum (termasuk pejabat penandatangan surat)';
COMMENT ON COLUMN ref.pengaturan_notifikasi.grup IS 'smtp, whatsapp, umum, pejabat';
COMMENT ON COLUMN ref.pengaturan_notifikasi.a_rahasia IS 'TRUE untuk password/api_key (masked di UI)';

-- Seed default pengaturan SMTP + pejabat penandatangan
INSERT INTO ref.pengaturan_notifikasi (kode, nilai, deskripsi, grup, a_rahasia) VALUES
    ('notifikasi_aktif',  'false',                                            'Aktifkan/nonaktifkan pengiriman notifikasi', 'umum',    false),
    ('smtp_host',         '',                                                 'SMTP server hostname',                       'smtp',    false),
    ('smtp_port',         '587',                                              'SMTP server port',                           'smtp',    false),
    ('smtp_username',     '',                                                 'SMTP username / email',                      'smtp',    false),
    ('smtp_password',     '',                                                 'SMTP password',                              'smtp',    true),
    ('smtp_encryption',   'tls',                                              'Enkripsi: tls / ssl / none',                 'smtp',    false),
    ('smtp_from_address', '',                                                 'Alamat email pengirim',                      'smtp',    false),
    ('smtp_from_name',    'SIMBAK Universitas Lampung',                       'Nama pengirim email',                        'smtp',    false),
    ('pejabat_nama',      'Hero Satrian Arief, S.E., M.H.',                   'Nama lengkap pejabat penandatangan surat',   'pejabat', false),
    ('pejabat_nip',       '196802251987031001',                               'NIP pejabat penandatangan',                  'pejabat', false),
    ('pejabat_jabatan',   'Kepala Biro Akademik dan Kemahasiswaan',           'Jabatan pejabat penandatangan',              'pejabat', false),
    ('tempat_terbit',     'Bandar Lampung',                                   'Kota tempat surat diterbitkan',              'pejabat', false)
ON CONFLICT (kode) DO NOTHING;

-- =====================================================
-- Step 4g: CREATE TABLE ref.template_notifikasi  [v1.2]
-- =====================================================
-- Template pesan email/WhatsApp per event (status_perlu_perbaikan,
-- status_ditolak, status_terbit, batch_putus_studi_warning, batch_hmm_warning).
-- Support placeholder {{nama}}, {{npm}}, {{layanan}}, {{nomor}}, {{catatan}}, dll.

CREATE TABLE IF NOT EXISTS ref.template_notifikasi (
    id_template         UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_event          VARCHAR(50)     NOT NULL UNIQUE,
                                        -- status_perlu_perbaikan, status_ditolak, status_terbit,
                                        -- batch_putus_studi_warning, batch_hmm_warning
    nm_template         VARCHAR(200)    NOT NULL,
    deskripsi           TEXT            NULL,
    channel             VARCHAR(20)     NOT NULL DEFAULT 'email',
                                        -- email, whatsapp, semua
    subject_email       VARCHAR(300)    NULL,
    body_email          TEXT            NULL,
    body_whatsapp       TEXT            NULL,
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.template_notifikasi IS 'Template pesan notifikasi per event (email dan WhatsApp)';
COMMENT ON COLUMN ref.template_notifikasi.kode_event IS 'Kode event trigger: status_perlu_perbaikan, batch_putus_studi_warning, dll';

-- Seed default template (5 event)
INSERT INTO ref.template_notifikasi (kode_event, nm_template, deskripsi, channel, subject_email, body_email, body_whatsapp) VALUES
    ('status_perlu_perbaikan',
     'Pengajuan Perlu Diperbaiki',
     'Dikirim saat pengajuan dikembalikan ke mahasiswa untuk perbaikan',
     'email',
     '[SIMBAK] Pengajuan Anda Perlu Diperbaiki',
     '<p>Yth. <strong>{{nama}}</strong> (NPM: {{npm}})</p><p>Pengajuan layanan <strong>{{layanan}}</strong> dengan nomor <strong>{{nomor}}</strong> perlu diperbaiki.</p><p><strong>Catatan:</strong> {{catatan}}</p><p>Silakan login ke portal SIMBAK untuk memperbaiki pengajuan Anda.</p><br><p>Hormat kami,<br>Biro Akademik dan Kemahasiswaan<br>Universitas Lampung</p>',
     '[SIMBAK] Pengajuan {{layanan}} ({{nomor}}) perlu diperbaiki. Catatan: {{catatan}}. Silakan cek portal SIMBAK.'),

    ('status_ditolak',
     'Pengajuan Ditolak',
     'Dikirim saat pengajuan ditolak',
     'email',
     '[SIMBAK] Pengajuan Anda Ditolak',
     '<p>Yth. <strong>{{nama}}</strong> (NPM: {{npm}})</p><p>Dengan ini kami sampaikan bahwa pengajuan layanan <strong>{{layanan}}</strong> dengan nomor <strong>{{nomor}}</strong> telah <strong>ditolak</strong>.</p><p><strong>Alasan:</strong> {{catatan}}</p><p>Jika ada pertanyaan, silakan hubungi Biro Akademik dan Kemahasiswaan.</p><br><p>Hormat kami,<br>Biro Akademik dan Kemahasiswaan<br>Universitas Lampung</p>',
     '[SIMBAK] Pengajuan {{layanan}} ({{nomor}}) ditolak. Alasan: {{catatan}}. Hubungi BAK untuk info lebih lanjut.'),

    ('status_terbit',
     'Surat/SK Telah Terbit',
     'Dikirim saat surat/SK selesai diterbitkan',
     'email',
     '[SIMBAK] Surat/SK Anda Telah Terbit',
     '<p>Yth. <strong>{{nama}}</strong> (NPM: {{npm}})</p><p>Surat/SK untuk layanan <strong>{{layanan}}</strong> dengan nomor permohonan <strong>{{nomor}}</strong> telah diterbitkan.</p><p>Silakan login ke portal SIMBAK untuk mengunduh dokumen Anda.</p><br><p>Hormat kami,<br>Biro Akademik dan Kemahasiswaan<br>Universitas Lampung</p>',
     '[SIMBAK] Surat/SK {{layanan}} ({{nomor}}) telah terbit. Silakan download di portal SIMBAK.'),

    ('batch_putus_studi_warning',
     'Peringatan Evaluasi Akademik (Putus Studi)',
     'Dikirim ke kandidat putus studi saat batch dibuat — peringatan jangan bayar UKT',
     'semua',
     '[PENTING] Evaluasi Akademik Semester {{semester}} — Universitas Lampung',
     '<p>Yth. <strong>{{nama}}</strong> (NPM: {{npm}})<br>Program Studi {{prodi}}, {{fakultas}}</p><p>Anda masuk dalam daftar evaluasi akademik semester <strong>{{semester}}</strong> berdasarkan kriteria evaluasi yang berlaku (Pertor No. 12 Tahun 2025 tentang PA Pasal 48).</p><p style="color:red;font-weight:bold;">MOHON TIDAK MELAKUKAN PEMBAYARAN UKT sampai ada keputusan resmi.</p><p>Silakan hubungi Biro Akademik dan Kemahasiswaan (BAK) untuk informasi lebih lanjut atau klarifikasi.</p><br><p>Hormat kami,<br>Biro Akademik dan Kemahasiswaan<br>Universitas Lampung</p>',
     '[PENTING] Evaluasi Akademik — Universitas Lampung. Yth. {{nama}} ({{npm}}). Anda masuk daftar evaluasi akademik semester {{semester}}. MOHON TIDAK BAYAR UKT sampai ada keputusan resmi. Hubungi BAK untuk info lebih lanjut.'),

    ('batch_hmm_warning',
     'Peringatan Evaluasi Masa Studi (Habis Masa Mukim)',
     'Dikirim ke kandidat HMM saat batch dibuat',
     'semua',
     '[PENTING] Evaluasi Masa Studi — Universitas Lampung',
     '<p>Yth. <strong>{{nama}}</strong> (NPM: {{npm}})<br>Program Studi {{prodi}}, {{fakultas}}</p><p>Anda masuk dalam daftar evaluasi masa studi berdasarkan Pertor No. 12 Tahun 2025 tentang PA Pasal 24.</p><p>Data akademik Anda:<br>- Jenjang: {{jenjang}}<br>- Angkatan: {{angkatan}}<br>- Semester saat ini: {{semester}}<br>- Batas masa studi: {{batas_semester}} semester</p><p>Silakan hubungi Biro Akademik dan Kemahasiswaan (BAK) atau fakultas Anda untuk informasi lebih lanjut.</p><br><p>Hormat kami,<br>Biro Akademik dan Kemahasiswaan<br>Universitas Lampung</p>',
     '[PENTING] Evaluasi Masa Studi — Universitas Lampung. Yth. {{nama}} ({{npm}}). Jenjang: {{jenjang}} | Semester: {{semester}}. Anda masuk daftar evaluasi masa studi (batas: {{batas_semester}} smt). Hubungi BAK atau fakultas untuk info lebih lanjut.')
ON CONFLICT (kode_event) DO NOTHING;

-- =====================================================
-- Step 4h: CREATE TABLE ref.smtp_config  [v1.2]
-- =====================================================
-- Konfigurasi SMTP multi-config (mirip SI Registrasi):
-- support multi SMTP, limit harian/bulanan, prioritas.

CREATE TABLE IF NOT EXISTS ref.smtp_config (
    id_smtp             UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    nm_config           VARCHAR(200)    NOT NULL,
    smtp_host           VARCHAR(200)    NOT NULL,
    smtp_port           INT             NOT NULL DEFAULT 587,
    smtp_encryption     VARCHAR(10)     NOT NULL DEFAULT 'tls',
    smtp_username       VARCHAR(200)    NOT NULL,
    smtp_password       VARCHAR(500)    NOT NULL,
    from_name           VARCHAR(200)    NOT NULL,
    from_address        VARCHAR(200)    NOT NULL,
    reply_to            VARCHAR(200)    NULL,
    limit_harian        INT             NOT NULL DEFAULT 2000,
    limit_bulanan       INT             NOT NULL DEFAULT 10000,
    terkirim_hari       INT             NOT NULL DEFAULT 0,
    terkirim_bulan      INT             NOT NULL DEFAULT 0,
    tgl_reset_hari      DATE            NOT NULL DEFAULT CURRENT_DATE,
    tgl_reset_bulan     DATE            NOT NULL DEFAULT CURRENT_DATE,
    prioritas           INT             NOT NULL DEFAULT 1,
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,
    a_default           BOOLEAN         NOT NULL DEFAULT FALSE,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.smtp_config IS 'Konfigurasi SMTP multi-config untuk pengiriman email (mirip SI Registrasi)';


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
--   draft → diajukan → perlu_perbaikan / diverifikasi → diperiksa_fakultas
--   → menunggu_persetujuan → disetujui / ditolak → terbit
--
-- Kolom khusus per layanan:
--   - Cuti       : id_smt_mulai_cuti, id_smt_akhir_cuti, jumlah_semester_cuti, kategori_cuti
--   - Undur      : kategori_undur, nm_pt_tujuan
--   - Alih       : id_prodi_tujuan, id_fakultas_tujuan
--   - Undur batch: id_batch_penetapan
--   - SK-PKKMB / SK-KTM : nomor_surat_polisi, tgl_surat_polisi,
--                         nomor_surat_ket_aktif, tgl_surat_ket_aktif
--   - SK-HERREG  : nomor_sk_cuti, tgl_sk_cuti

CREATE TABLE IF NOT EXISTS layanan.pengajuan (
    id_pengajuan        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_jenis_layanan    UUID            NOT NULL REFERENCES ref.jenis_layanan(id_jenis_layanan)
                                        ON DELETE RESTRICT,
    nomor_permohonan    VARCHAR(50)     NOT NULL UNIQUE,
                                        -- format: SIMBAK-{KODE_LAYANAN}-{TAHUN}-{URUT}
    id_pemohon          UUID            NOT NULL,
                                        -- UUID mahasiswa pemohon (ref ke man_akses.pengguna di pdut)
    status              VARCHAR(30)     NOT NULL DEFAULT 'draft',
                                        -- draft, diajukan, perlu_perbaikan, diverifikasi,
                                        -- diperiksa_fakultas, menunggu_persetujuan,
                                        -- disetujui, ditolak, terbit
    alasan              TEXT            NULL,
                                        -- alasan / keperluan permohonan
    catatan_pemohon     TEXT            NULL,
                                        -- catatan tambahan dari pemohon

    -- === Kolom khusus Cuti Akademik ===
    id_smt_mulai_cuti       VARCHAR(10) NULL,
                                        -- ref ke ref.semester.id_smt di pdut
    id_smt_akhir_cuti       VARCHAR(10) NULL,
                                        -- [v1.2] semester akhir cuti = mulai + (durasi-1)
    jumlah_semester_cuti    INT         NULL CHECK (jumlah_semester_cuti IN (1, 2)),
    kategori_cuti           VARCHAR(30) NULL REFERENCES ref.kategori_cuti(id_kategori_cuti),
                                        -- [v1.2] terencana, kecelakaan, sakit, melahirkan

    -- === Kolom khusus Pengunduran Diri ===
    kategori_undur          VARCHAR(30) NULL REFERENCES ref.kategori_undur(id_kategori_undur),
                                        -- [v1.2] undur_diri, pindah_pt
    nm_pt_tujuan            VARCHAR(200) NULL,
                                        -- [v1.2] nama PT tujuan (untuk pindah_pt)

    -- === Kolom khusus Alih Program / Pindah Studi ===
    id_prodi_tujuan         UUID        NULL,
                                        -- ref ke pdrd.sms di pdut
    id_fakultas_tujuan      UUID        NULL,
                                        -- ref ke man_akses.unit_organisasi di pdut

    -- === Referensi batch SK (untuk undur diri batch) ===
    id_batch_penetapan      UUID        NULL,
                                        -- FK ditambahkan via ALTER TABLE
                                        -- setelah tabel batch.batch_penetapan dibuat

    -- === Kolom khusus SK-PKKMB / SK-KTM (surat pengganti dokumen hilang) ===
    nomor_surat_polisi      VARCHAR(100) NULL,
                                        -- [v1.2] nomor Surat Kehilangan dari Kepolisian
    tgl_surat_polisi        DATE         NULL,
                                        -- [v1.2] tanggal Surat Kehilangan
    nomor_surat_ket_aktif   VARCHAR(100) NULL,
                                        -- [v1.2] nomor Surat Keterangan Mahasiswa Aktif dari Fakultas
    tgl_surat_ket_aktif     DATE         NULL,
                                        -- [v1.2] tanggal Surat Keterangan Mahasiswa Aktif

    -- === Kolom khusus SK-HERREG ===
    nomor_sk_cuti           VARCHAR(100) NULL,
                                        -- [v1.2] nomor SK Cuti Akademik (untuk herregistrasi setelah cuti)
    tgl_sk_cuti             DATE         NULL,
                                        -- [v1.2] tanggal SK Cuti Akademik

    tgl_diajukan            TIMESTAMP   NULL,
                                        -- waktu pengajuan dikirim
    tgl_selesai             TIMESTAMP   NULL,
                                        -- waktu proses selesai (terbit/ditolak)
    nomor_dokumen_hasil     VARCHAR(100) NULL,
                                        -- nomor surat/SK yang diterbitkan
    tgl_dokumen_hasil       DATE        NULL,
                                        -- tanggal surat/SK

    id_creator              UUID        NULL,
    id_updater              UUID        NULL,
    created_at              TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP   NOT NULL DEFAULT NOW(),
    soft_delete             BOOLEAN     NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE layanan.pengajuan IS 'Header pengajuan layanan BAK per mahasiswa';
COMMENT ON COLUMN layanan.pengajuan.nomor_permohonan IS 'Nomor pengajuan auto-generated: SIMBAK-KODE-TAHUN-URUT';
COMMENT ON COLUMN layanan.pengajuan.id_pemohon IS 'UUID mahasiswa pemohon (ref ke man_akses.pengguna di pdut)';
COMMENT ON COLUMN layanan.pengajuan.status IS 'Status workflow: draft, diajukan, perlu_perbaikan, diverifikasi, diperiksa_fakultas, menunggu_persetujuan, disetujui, ditolak, terbit';
COMMENT ON COLUMN layanan.pengajuan.id_smt_mulai_cuti IS 'Semester mulai cuti (khusus PM-CUTI, ref ke ref.semester di pdut)';
COMMENT ON COLUMN layanan.pengajuan.id_smt_akhir_cuti IS 'Semester akhir cuti = mulai + (jumlah_semester_cuti - 1)';
COMMENT ON COLUMN layanan.pengajuan.jumlah_semester_cuti IS 'Durasi cuti: 1 atau 2 semester';
COMMENT ON COLUMN layanan.pengajuan.kategori_cuti IS 'Kategori cuti: terencana, kecelakaan, sakit, melahirkan';
COMMENT ON COLUMN layanan.pengajuan.kategori_undur IS 'FK ke ref.kategori_undur, untuk PM-UNDUR saja';
COMMENT ON COLUMN layanan.pengajuan.nm_pt_tujuan IS 'Nama PT tujuan pindah (untuk kategori pindah_pt)';
COMMENT ON COLUMN layanan.pengajuan.id_prodi_tujuan IS 'Program studi tujuan (khusus PM-ALIH, ref ke pdrd.sms)';
COMMENT ON COLUMN layanan.pengajuan.id_fakultas_tujuan IS 'Fakultas tujuan (khusus PM-ALIH, ref ke man_akses.unit_organisasi)';
COMMENT ON COLUMN layanan.pengajuan.nomor_surat_polisi IS 'Nomor Surat Kehilangan dari Kepolisian (untuk SK-PKKMB, SK-KTM)';
COMMENT ON COLUMN layanan.pengajuan.nomor_surat_ket_aktif IS 'Nomor Surat Keterangan Mahasiswa Aktif dari Fakultas';
COMMENT ON COLUMN layanan.pengajuan.nomor_sk_cuti IS 'Nomor SK Cuti Akademik (untuk SK-HERREG dari mahasiswa yang habis cuti)';
COMMENT ON COLUMN layanan.pengajuan.nomor_dokumen_hasil IS 'Nomor surat/SK yang diterbitkan';

-- =====================================================
-- Step 6: CREATE TABLE layanan.data_pemohon
-- =====================================================
-- Snapshot data akademik pemohon pada saat pengajuan.
-- Diambil dari PDUT (read-only), disimpan permanen sebagai bukti
-- yang tidak berubah walau data asli di PDUT berubah kemudian.
-- [v1.2] Mendukung pemohon eksternal (PM-ALIH dari PT lain) via
--        kolom nm_jenjang_asal, nm_prodi_asal, email_pemohon, no_hp_pemohon.

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
    id_fakultas         VARCHAR(50)     NULL,
                                        -- ref ke man_akses.unit_organisasi di pdut
    nm_fakultas         VARCHAR(200)    NULL,
    id_prodi            VARCHAR(50)     NULL,
                                        -- ref ke pdrd.sms di pdut
    nm_prodi            VARCHAR(200)    NULL,
    id_jenj_didik       INT             NULL,
                                        -- ref ke ref.jenjang_pendidikan di pdut
    nm_jenjang          VARCHAR(50)     NULL,
                                        -- D3, S1, S2, S3
    angkatan            INT             NULL,

    -- === Performa akademik ===
    semester_aktif      INT             NULL,
    id_smt              VARCHAR(10)     NULL,
                                        -- ref ke ref.semester di pdut
    ipk                 DECIMAL(4,2)    NULL,
    sks_lulus           INT             NULL,
    masa_studi_semester INT             NULL,

    -- === Status registrasi & pembayaran ===
    status_mahasiswa    VARCHAR(50)     NULL,
    status_registrasi   VARCHAR(50)     NULL,
    status_pembayaran   VARCHAR(50)     NULL,

    -- === [v1.2] Field khusus pemohon eksternal (PM-ALIH dari PT lain) ===
    nm_jenjang_asal     VARCHAR(50)     NULL,
                                        -- jenjang di PT asal (D3/S1)
    nm_prodi_asal       VARCHAR(200)    NULL,
                                        -- nama prodi di PT asal
    email_pemohon       VARCHAR(150)    NULL,
                                        -- email kontak (untuk notifikasi, pemohon tanpa SSO)
    no_hp_pemohon       VARCHAR(30)     NULL,
                                        -- nomor HP/WA

    tgl_snapshot        TIMESTAMP       NOT NULL DEFAULT NOW(),
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,
    UNIQUE (id_pengajuan)
);

COMMENT ON TABLE layanan.data_pemohon IS 'Snapshot data akademik pemohon pada saat pengajuan (dari PDUT)';
COMMENT ON COLUMN layanan.data_pemohon.id_mahasiswa IS 'UUID mahasiswa dari PDUT (siakadu.peserta_didik/reg_pd)';
COMMENT ON COLUMN layanan.data_pemohon.ipk IS 'IPK kumulatif saat pengajuan';
COMMENT ON COLUMN layanan.data_pemohon.sks_lulus IS 'Total SKS lulus saat pengajuan';
COMMENT ON COLUMN layanan.data_pemohon.masa_studi_semester IS 'Total semester sejak pertama terdaftar';
COMMENT ON COLUMN layanan.data_pemohon.nm_jenjang_asal IS 'Jenjang asal pemohon eksternal (D3/S1), untuk validasi hierarki alih program';
COMMENT ON COLUMN layanan.data_pemohon.nm_prodi_asal IS 'Nama prodi asal pemohon eksternal di PT lama';
COMMENT ON COLUMN layanan.data_pemohon.email_pemohon IS 'Email kontak pemohon eksternal (untuk notifikasi, karena tidak punya akun SSO)';
COMMENT ON COLUMN layanan.data_pemohon.no_hp_pemohon IS 'Nomor HP/WhatsApp pemohon eksternal (untuk notifikasi)';
COMMENT ON COLUMN layanan.data_pemohon.tgl_snapshot IS 'Waktu pengambilan snapshot data dari PDUT';

-- =====================================================
-- Step 7: CREATE TABLE layanan.dokumen_pengajuan
-- =====================================================
-- Dokumen persyaratan yang diunggah untuk pengajuan layanan.
-- [v1.2] + nomor_dokumen, tgl_dokumen untuk dokumen ber-nomor
-- (mis. Surat Pengantar Dekan).

CREATE TABLE IF NOT EXISTS layanan.dokumen_pengajuan (
    id_dokumen          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengajuan        UUID            NOT NULL REFERENCES layanan.pengajuan(id_pengajuan)
                                        ON DELETE CASCADE,
    id_persyaratan      UUID            NULL REFERENCES ref.persyaratan_layanan(id_persyaratan)
                                        ON DELETE SET NULL,
    nm_dokumen          VARCHAR(200)    NOT NULL,
    nama_file_asli      VARCHAR(500)    NOT NULL,
    path_file           VARCHAR(1000)   NOT NULL,
                                        -- format: simbak/pengajuan/{id_pengajuan}/{kode_dokumen}/{filename}
    data_blob           BYTEA           NULL,
                                        -- opsional: file binary (untuk file < 1MB)
    tipe_file           VARCHAR(100)    NOT NULL,
    ukuran_byte         BIGINT          NOT NULL,
    id_pengunggah       UUID            NOT NULL,
                                        -- ref ke man_akses.pengguna di pdut
    keterangan          TEXT            NULL,
    nomor_dokumen       VARCHAR(100)    NULL,
                                        -- [v1.2] nomor surat/dokumen (mis. Surat Pengantar Dekan)
    tgl_dokumen         DATE            NULL,
                                        -- [v1.2] tanggal surat/dokumen
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
COMMENT ON COLUMN layanan.dokumen_pengajuan.data_blob IS 'Opsional: data file binary (BYTEA) untuk file < 1MB, alternatif MinIO';
COMMENT ON COLUMN layanan.dokumen_pengajuan.id_pengunggah IS 'UUID pengunggah (ref ke man_akses.pengguna di pdut)';
COMMENT ON COLUMN layanan.dokumen_pengajuan.nomor_dokumen IS 'Nomor surat/dokumen (misal: nomor Surat Pengantar Dekan)';
COMMENT ON COLUMN layanan.dokumen_pengajuan.tgl_dokumen IS 'Tanggal surat/dokumen';

-- =====================================================
-- Step 8: CREATE TABLE layanan.riwayat_pengajuan
-- =====================================================
CREATE TABLE IF NOT EXISTS layanan.riwayat_pengajuan (
    id_riwayat          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengajuan        UUID            NOT NULL REFERENCES layanan.pengajuan(id_pengajuan)
                                        ON DELETE CASCADE,
    id_tahapan          UUID            NULL REFERENCES ref.tahapan_layanan(id_tahapan)
                                        ON DELETE SET NULL,
    urutan              INT             NOT NULL,
    nm_tahapan          VARCHAR(200)    NOT NULL,
    status_dari         VARCHAR(30)     NOT NULL,
    status_ke           VARCHAR(30)     NOT NULL,
    id_aktor            UUID            NULL,
                                        -- ref ke man_akses.pengguna di pdut
    nm_aktor            VARCHAR(200)    NULL,
                                        -- denormalized untuk audit trail permanen
    kode_role_aktor     VARCHAR(50)     NULL,
                                        -- mahasiswa, admin_fakultas, admin_bak, kabag, ...
    catatan             TEXT            NULL,
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
CREATE TABLE IF NOT EXISTS layanan.persetujuan_pengajuan (
    id_persetujuan      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengajuan        UUID            NOT NULL REFERENCES layanan.pengajuan(id_pengajuan)
                                        ON DELETE CASCADE,
    id_riwayat          UUID            NULL REFERENCES layanan.riwayat_pengajuan(id_riwayat)
                                        ON DELETE SET NULL,
    id_approver         UUID            NOT NULL,
                                        -- ref ke man_akses.pengguna di pdut
    nm_approver         VARCHAR(200)    NULL,
    kode_role_approver  VARCHAR(50)     NOT NULL,
                                        -- admin_fakultas, admin_bak, kabag (persetujuan pimpinan)
    keputusan           VARCHAR(30)     NOT NULL,
                                        -- disetujui, ditolak, dikembalikan
    catatan             TEXT            NULL,
    tgl_keputusan       TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- === Kolom khusus Alih Program ===
    a_diterima_tujuan   BOOLEAN         NULL,
    hasil_wawancara     TEXT            NULL,
    daftar_konversi_sks TEXT            NULL,
                                        -- JSON: daftar mata kuliah & SKS yang diakui

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
CREATE TABLE IF NOT EXISTS layanan.dokumen_hasil (
    id_dokumen_hasil    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengajuan        UUID            NOT NULL REFERENCES layanan.pengajuan(id_pengajuan)
                                        ON DELETE CASCADE,
    id_template         UUID            NULL REFERENCES ref.template_dokumen(id_template)
                                        ON DELETE SET NULL,
    id_batch_penetapan  UUID            NULL,
                                        -- FK ditambahkan via ALTER TABLE
    jenis_output        VARCHAR(50)     NOT NULL,
                                        -- surat_keterangan, sk_rektor, sk_dekan
    nomor_dokumen       VARCHAR(100)    NULL,
    tgl_dokumen         DATE            NULL,
    nm_dokumen          VARCHAR(200)    NOT NULL,
    path_file           VARCHAR(1000)   NOT NULL,
                                        -- format: simbak/hasil/{id_pengajuan}/{jenis_output}/{filename}
    data_blob           BYTEA           NULL,
    tipe_file           VARCHAR(100)    NOT NULL DEFAULT 'application/pdf',
    ukuran_byte         BIGINT          NULL,
    id_penerbit         UUID            NOT NULL,
                                        -- ref ke man_akses.pengguna di pdut
    a_final             BOOLEAN         NOT NULL DEFAULT FALSE,
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
-- 2. Penetapan Putus Studi Akademik
-- [v1.2] + id_fakultas, nm_fakultas untuk filtering per fakultas
--        (admin_fakultas hanya melihat batch milik fakultasnya).

CREATE TABLE IF NOT EXISTS batch.batch_penetapan (
    id_batch_penetapan  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_jenis_layanan    UUID            NOT NULL REFERENCES ref.jenis_layanan(id_jenis_layanan)
                                        ON DELETE RESTRICT,
    kode_batch          VARCHAR(50)     NOT NULL UNIQUE,
                                        -- BATCH-HMM-2026-01, BATCH-PS-2026-01
    nm_batch            VARCHAR(300)    NOT NULL,
    jenis_batch         VARCHAR(30)     NOT NULL,
                                        -- habis_masa_mukim, putus_studi
    id_smt              VARCHAR(10)     NOT NULL,
                                        -- ref ke ref.semester di pdut

    -- === [v1.2] Fakultas filter ===
    id_fakultas         UUID            NULL,
                                        -- UUID fakultas dari pdrd.sms (id_fak_unila)
    nm_fakultas         VARCHAR(200)    NULL,
                                        -- snapshot dari pdrd.sms.nm_lemb

    status              VARCHAR(30)     NOT NULL DEFAULT 'draft',
                                        -- draft, kandidat_ditarik, verifikasi_fakultas,
                                        -- sk_dekan_terbit, sk_rektor_terbit, selesai
    id_pembuat          UUID            NOT NULL,
                                        -- ref ke man_akses.pengguna di pdut

    -- Snapshot kriteria seleksi dalam format JSON
    kriteria_snapshot   TEXT            NOT NULL,

    jumlah_kandidat        INT          NOT NULL DEFAULT 0,
    jumlah_terverifikasi   INT          NOT NULL DEFAULT 0,
    jumlah_dikeluarkan     INT          NOT NULL DEFAULT 0,

    -- === Referensi SK Dekan ===
    nomor_sk_dekan      VARCHAR(100)    NULL,
    tgl_sk_dekan        DATE            NULL,
    path_sk_dekan       VARCHAR(1000)   NULL,

    -- === Referensi SK Rektor ===
    nomor_sk_rektor     VARCHAR(100)    NULL,
    tgl_sk_rektor       DATE            NULL,
    path_sk_rektor      VARCHAR(1000)   NULL,

    tgl_tarik_data      TIMESTAMP       NULL,
    tgl_selesai         TIMESTAMP       NULL,
    catatan             TEXT            NULL,

    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE batch.batch_penetapan IS 'Header proses batch penetapan habis masa mukim atau putus studi akademik';
COMMENT ON COLUMN batch.batch_penetapan.jenis_batch IS 'Jenis batch: habis_masa_mukim, putus_studi';
COMMENT ON COLUMN batch.batch_penetapan.id_fakultas IS 'UUID fakultas dari pdrd.sms (id_fak_unila) — wajib diisi saat create';
COMMENT ON COLUMN batch.batch_penetapan.nm_fakultas IS 'Nama fakultas (snapshot dari pdrd.sms.nm_lemb saat batch dibuat)';
COMMENT ON COLUMN batch.batch_penetapan.kriteria_snapshot IS 'Snapshot kriteria seleksi dalam format JSON (bukti dasar keputusan)';
COMMENT ON COLUMN batch.batch_penetapan.id_pembuat IS 'UUID admin BAK yang menginisiasi batch (ref ke man_akses.pengguna di pdut)';
COMMENT ON COLUMN batch.batch_penetapan.status IS 'Status batch: draft, kandidat_ditarik, verifikasi_fakultas, sk_dekan_terbit, sk_rektor_terbit, selesai';

-- =====================================================
-- Step 12: CREATE TABLE batch.kandidat_batch
-- =====================================================
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
    angkatan            INT             NULL,

    -- === Snapshot data akademik ===
    semester_aktif      INT             NULL,
    ipk                 DECIMAL(4,2)    NULL,
    sks_lulus           INT             NULL,
    masa_studi_semester INT             NULL,
    status_mahasiswa    VARCHAR(50)     NULL,
    status_registrasi   VARCHAR(50)     NULL,
    status_pembayaran   VARCHAR(50)     NULL,

    -- === Status pemrosesan kandidat ===
    status_kandidat     VARCHAR(30)     NOT NULL DEFAULT 'masuk',
                                        -- masuk, dikonfirmasi, dikeluarkan
    alasan_exclusion    TEXT            NULL,
    id_pengajuan        UUID            NULL,
                                        -- FK ditambahkan via ALTER TABLE

    tgl_snapshot        TIMESTAMP       NOT NULL DEFAULT NOW(),
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,
    UNIQUE (id_batch_penetapan, id_mahasiswa)
);

COMMENT ON TABLE batch.kandidat_batch IS 'Daftar mahasiswa kandidat dalam satu batch penetapan';
COMMENT ON COLUMN batch.kandidat_batch.status_kandidat IS 'Status kandidat: masuk (baru ditarik), dikonfirmasi (lolos verifikasi), dikeluarkan (di-exclude)';
COMMENT ON COLUMN batch.kandidat_batch.alasan_exclusion IS 'Alasan terdokumentasi jika kandidat dikeluarkan dari daftar';
COMMENT ON COLUMN batch.kandidat_batch.id_pengajuan IS 'Link ke layanan.pengajuan jika pengajuan individual dibuat (opsional)';

-- =====================================================
-- Step 13: CREATE TABLE batch.verifikasi_batch
-- =====================================================
CREATE TABLE IF NOT EXISTS batch.verifikasi_batch (
    id_verifikasi       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_batch_penetapan  UUID            NOT NULL REFERENCES batch.batch_penetapan(id_batch_penetapan)
                                        ON DELETE CASCADE,
    id_kandidat         UUID            NOT NULL REFERENCES batch.kandidat_batch(id_kandidat)
                                        ON DELETE CASCADE,
    id_verifikator      UUID            NOT NULL,
                                        -- ref ke man_akses.pengguna di pdut
    nm_verifikator      VARCHAR(200)    NULL,
    id_fakultas         UUID            NULL,
    hasil               VARCHAR(30)     NOT NULL,
                                        -- dikonfirmasi, dikeluarkan
    catatan             TEXT            NULL,
    tgl_verifikasi      TIMESTAMP       NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE (id_kandidat)
);

COMMENT ON TABLE batch.verifikasi_batch IS 'Hasil verifikasi fakultas terhadap kandidat batch';
COMMENT ON COLUMN batch.verifikasi_batch.hasil IS 'Hasil verifikasi: dikonfirmasi (masuk final), dikeluarkan (di-exclude)';
COMMENT ON COLUMN batch.verifikasi_batch.id_verifikator IS 'UUID admin fakultas yang memverifikasi (ref ke man_akses.pengguna di pdut)';


-- =============================================================================
-- SCHEMA: log
-- Berisi jejak audit, aktivitas pengguna, log perubahan data, dan notifikasi
-- =============================================================================

-- =====================================================
-- Step 14: CREATE TABLE log.jejak_audit
-- =====================================================
CREATE TABLE IF NOT EXISTS log.jejak_audit (
    id_audit            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengguna         UUID            NULL,
                                        -- ref ke man_akses.pengguna di pdut (NULL = system)
    nm_pengguna         VARCHAR(200)    NULL,
    ip_address          VARCHAR(45)     NULL,
    user_agent          VARCHAR(500)    NULL,
    aksi                VARCHAR(50)     NOT NULL,
                                        -- pengajuan_dibuat, status_berubah, persetujuan_diberikan,
                                        -- batch_dibuat, batch_data_ditarik, batch_diverifikasi,
                                        -- output_digenerate, output_diterbitkan, template_diperbarui,
                                        -- login, logout
    nm_schema           VARCHAR(50)     NULL,
                                        -- ref, layanan, batch
    nm_tabel            VARCHAR(100)    NULL,
    id_terkait          UUID            NULL,
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
CREATE TABLE IF NOT EXISTS log.aktivitas_data (
    id_aktivitas        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    nm_schema           VARCHAR(50)     NOT NULL,
    nm_tabel            VARCHAR(100)    NOT NULL,
    id_record           UUID            NOT NULL,
    operasi             VARCHAR(10)     NOT NULL,
                                        -- INSERT, UPDATE, DELETE
    data_lama           TEXT            NULL,
    data_baru           TEXT            NULL,
    kolom_berubah       TEXT            NULL,
                                        -- JSON array kolom yang berubah (hanya UPDATE)
    id_pengguna         UUID            NULL,
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
-- Step 16: CREATE TABLE log.notifikasi  [v1.2]
-- =====================================================
-- Log pengiriman notifikasi email dan WhatsApp per event.

CREATE TABLE IF NOT EXISTS log.notifikasi (
    id_notifikasi       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_event          VARCHAR(50)     NOT NULL,
                                        -- event yang memicu notifikasi
    channel             VARCHAR(20)     NOT NULL,
                                        -- email, whatsapp
    penerima            VARCHAR(200)    NOT NULL,
                                        -- email address atau nomor WA
    nm_penerima         VARCHAR(200)    NULL,
    subject             VARCHAR(300)    NULL,
    body                TEXT            NULL,
                                        -- body yang sudah di-render (placeholder sudah diganti)
    status              VARCHAR(20)     NOT NULL DEFAULT 'pending',
                                        -- pending, sent, failed
    error_message       TEXT            NULL,
    id_pengajuan        UUID            NULL,
    id_batch            UUID            NULL,
    id_kandidat         UUID            NULL,
    retry_count         INT             NOT NULL DEFAULT 0,
    sent_at             TIMESTAMP       NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE log.notifikasi IS 'Log pengiriman notifikasi email dan WhatsApp';


-- =====================================================
-- Step 17: DEFERRED FOREIGN KEYS
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
-- Step 18: INDEXES
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

CREATE INDEX IF NOT EXISTS idx_batch_penetapan_fakultas
    ON batch.batch_penetapan(id_fakultas) WHERE soft_delete = FALSE;  -- [v1.2]

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

-- === log.notifikasi  [v1.2] ===
CREATE INDEX IF NOT EXISTS idx_notifikasi_kode_event
    ON log.notifikasi(kode_event);

CREATE INDEX IF NOT EXISTS idx_notifikasi_status
    ON log.notifikasi(status);

CREATE INDEX IF NOT EXISTS idx_notifikasi_created_at
    ON log.notifikasi(created_at DESC);


-- =====================================================
-- Step 19: TRIGGER auto-update updated_at
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
        'ref.ktw_exclude_jalur',          -- [v1.1]
        'ref.kategori_cuti',              -- [v1.2]
        'ref.kategori_undur',             -- [v1.2]
        'ref.ketentuan_layanan',          -- [v1.2]
        'ref.pengaturan_notifikasi',      -- [v1.2]
        'ref.template_notifikasi',        -- [v1.2]
        'ref.smtp_config',                -- [v1.2]
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
-- Step 20: TRIGGER log aktivitas data (INSERT/UPDATE/DELETE)
-- =====================================================
-- Fungsi generic yang mencatat setiap perubahan data
-- ke log.aktivitas_data secara otomatis.
-- Diaktifkan pada semua tabel transaksional dan referensi
-- yang punya PK UUID.
--
-- Catatan: ref.kategori_cuti dan ref.kategori_undur PK-nya
-- VARCHAR (slug), tidak kompatibel dengan trigger ini (yang
-- mengharapkan UUID). Tabel tersebut di-skip.

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
    -- Ambil id_pengguna dan ip_address dari session context
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
        EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_id_record USING NEW;
        v_data_baru := row_to_json(NEW)::TEXT;

        INSERT INTO log.aktivitas_data (nm_schema, nm_tabel, id_record, operasi, data_lama, data_baru, kolom_berubah, id_pengguna, ip_address)
        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, v_id_record, 'INSERT', NULL, v_data_baru, NULL, v_id_pengguna, v_ip_address);

        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_id_record USING NEW;
        v_data_lama := row_to_json(OLD)::TEXT;
        v_data_baru := row_to_json(NEW)::TEXT;

        -- Hitung kolom yang berubah (skip updated_at)
        SELECT json_agg(key)::TEXT INTO v_kolom_berubah
        FROM (
            SELECT key
            FROM json_each_text(row_to_json(OLD)) AS o(key, val)
            FULL JOIN json_each_text(row_to_json(NEW)) AS n(key, val)
                ON o.key = n.key
            WHERE o.val IS DISTINCT FROM n.val
                AND o.key NOT IN ('updated_at')
        ) changed;

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

COMMENT ON FUNCTION log.fn_catat_aktivitas_data() IS 'Trigger function: catat setiap INSERT/UPDATE/DELETE ke log.aktivitas_data (hanya tabel dengan PK UUID)';

-- Apply trigger aktivitas_data ke semua tabel transaksional dan referensi
-- Parameter TG_ARGV[0] = nama kolom PK (harus UUID)
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
        ('ref.ktw_exclude_jalur',            'id_exclude'),     -- [v1.1]
        ('ref.ketentuan_layanan',            'id_ketentuan'),   -- [v1.2]
        ('ref.pengaturan_notifikasi',        'id_pengaturan'),  -- [v1.2]
        ('ref.template_notifikasi',          'id_template'),    -- [v1.2]
        ('ref.smtp_config',                  'id_smtp'),        -- [v1.2]
        ('layanan.pengajuan',                'id_pengajuan'),
        ('layanan.data_pemohon',             'id_data_pemohon'),
        ('layanan.dokumen_pengajuan',        'id_dokumen'),
        ('layanan.riwayat_pengajuan',        'id_riwayat'),
        ('layanan.persetujuan_pengajuan',    'id_persetujuan'),
        ('layanan.dokumen_hasil',            'id_dokumen_hasil'),
        ('batch.batch_penetapan',            'id_batch_penetapan'),
        ('batch.kandidat_batch',             'id_kandidat'),
        ('batch.verifikasi_batch',           'id_verifikasi')
        -- Catatan: ref.kategori_cuti & ref.kategori_undur di-skip (PK VARCHAR)
        --          log.notifikasi di-skip (tabel log tidak self-log)
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
-- Step 21: GRANT PRIVILEGES untuk role aplikasi
-- =====================================================
-- Role myunila_bak digunakan oleh service backend simbak-service.
-- Jika role belum ada, buat dulu (atau abaikan blok DO ini).

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'myunila_bak') THEN
        RAISE NOTICE 'Role myunila_bak belum ada, lewati GRANT';
    ELSE
        -- Grant schema usage
        EXECUTE 'GRANT USAGE ON SCHEMA ref, layanan, batch, log TO myunila_bak';
        -- Grant on all existing tables
        EXECUTE 'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ref      TO myunila_bak';
        EXECUTE 'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA layanan  TO myunila_bak';
        EXECUTE 'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA batch    TO myunila_bak';
        EXECUTE 'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA log      TO myunila_bak';
        EXECUTE 'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ref      TO myunila_bak';
        EXECUTE 'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA layanan  TO myunila_bak';
        EXECUTE 'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA batch    TO myunila_bak';
        EXECUTE 'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA log      TO myunila_bak';
        -- Default privileges untuk objek yang dibuat berikutnya
        EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA ref     GRANT ALL ON TABLES TO myunila_bak';
        EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA layanan GRANT ALL ON TABLES TO myunila_bak';
        EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA batch   GRANT ALL ON TABLES TO myunila_bak';
        EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA log     GRANT ALL ON TABLES TO myunila_bak';
        RAISE NOTICE 'GRANT privileges untuk myunila_bak selesai';
    END IF;
END $$;


-- =====================================================
-- DONE
-- =====================================================
-- Schema Summary:
--
--   ref (referensi/master):
--     ref.jenis_layanan
--     ref.persyaratan_layanan
--     ref.tahapan_layanan
--     ref.template_dokumen          [v1.2: + body_html, body_default, tipe_template]
--     ref.ktw_exclude_jalur         [v1.1]
--     ref.kategori_cuti             [v1.2 NEW]
--     ref.kategori_undur            [v1.2 NEW]
--     ref.ketentuan_layanan         [v1.2 NEW]
--     ref.pengaturan_notifikasi     [v1.2 NEW] — SMTP/WA + pejabat penandatangan
--     ref.template_notifikasi       [v1.2 NEW] — template email/WA per event
--     ref.smtp_config               [v1.2 NEW] — multi SMTP config
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
--     log.notifikasi       [v1.2 NEW] — log pengiriman notifikasi
--
-- Cross-schema FK:
--   layanan.pengajuan → ref.jenis_layanan
--   layanan.pengajuan → ref.kategori_cuti          [v1.2]
--   layanan.pengajuan → ref.kategori_undur         [v1.2]
--   layanan.pengajuan → batch.batch_penetapan (deferred)
--   layanan.dokumen_pengajuan → ref.persyaratan_layanan
--   layanan.riwayat_pengajuan → ref.tahapan_layanan
--   layanan.dokumen_hasil → ref.template_dokumen
--   layanan.dokumen_hasil → batch.batch_penetapan (deferred)
--   batch.batch_penetapan → ref.jenis_layanan
--   batch.kandidat_batch → layanan.pengajuan (deferred)
--   ref.ketentuan_layanan → ref.jenis_layanan      [v1.2]
--
-- Statistik:
--   Total schema  : 4 (ref, layanan, batch, log)
--   Total tabel   : 22 (11 ref + 6 layanan + 3 batch + 3 log)
--   Total FK      : 21 (18 inline + 3 deferred ALTER TABLE)
--   Total index   : ~50 (termasuk idx_batch_penetapan_fakultas v1.2 + 3 idx log.notifikasi)
--   Total trigger : 35 (17 updated_at + 18 aktivitas_data)
--
-- Kolom Audit:
--   id_creator    : UUID pembuat record (ref ke man_akses.pengguna di pdut)
--   id_updater    : UUID pengubah terakhir
--   created_at    : timestamp pembuatan record
--   updated_at    : timestamp perubahan terakhir (auto via trigger)
--   soft_delete   : penanda hapus logis
--   Catatan: tabel log.* tidak pakai id_creator/id_updater,
--            kategori_cuti/kategori_undur juga tidak punya soft_delete
--
-- File Storage (MinIO):
--   Endpoint  : 192.168.120.47:9000 (VM7)
--   Bucket    : myunila-storage
--   Path format:
--     simbak/pengajuan/{id_pengajuan}/{kode_dokumen}/{filename}  — dokumen syarat
--     simbak/hasil/{id_pengajuan}/{jenis_output}/{filename}      — dokumen output
--     simbak/batch/{id_batch}/{jenis_sk}/{filename}              — SK batch
--     simbak/template/{kode_layanan}/{filename}                  — template blanko mahasiswa
--   Kolom: path_file (wajib), data_blob (opsional BYTEA untuk < 1MB)
--
-- Cara set session context untuk log aktivitas data (di Laravel):
--   DB::statement("SET LOCAL simbak.id_pengguna = '{$userId}'");
--   DB::statement("SET LOCAL simbak.ip_address = '{$ipAddress}'");
--   // ... operasi dalam transaksi yang sama
--
-- Next Steps setelah fresh install:
--   1. Jalankan 02-simbak-seed-staging.sql untuk seed jenis_layanan,
--      persyaratan_layanan, tahapan_layanan (sudah include v1.2 tahapan
--      6-tahap PM-ALIH + 4-tahap SK-* dengan role 'kabag')
--   2. Jalankan seed ref.ketentuan_layanan (file 13) untuk BA-HMM, BA-PUTUS, PM-ALIH
--   3. Jalankan seed template_dokumen html_editable (file 19) untuk
--      SK-KTM, SK-PKKMB, SK-HERREG, SK-LOA
--   4. Update setting pejabat di ref.pengaturan_notifikasi jika perlu
--   5. Konfigurasi SMTP di ref.smtp_config jika pengiriman email aktif
-- =====================================================
