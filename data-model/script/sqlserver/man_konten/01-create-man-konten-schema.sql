-- ============================================================================
-- Schema migration — man_konten (Manajemen Konten Service)
-- ============================================================================
-- Tujuan:
--   Buat schema baru `man_konten` untuk service Manajemen Konten myUnila
--   yang menampung pengumuman, berita, notifikasi, kategori, dan target
--   audience untuk portal myUnila.
--
-- Tabel:
--   1. man_konten.kategori          — taxonomy referensi pengumuman/berita
--   2. man_konten.pengumuman        — pengumuman (short-form)
--   3. man_konten.berita            — berita/artikel (long-form)
--   4. man_konten.notifikasi        — notifikasi broadcast
--   5. man_konten.notif_recipient   — per-user inbox (read/dismiss state)
--   6. man_konten.target_audience   — polymorphic targeting helper
--
-- Konvensi (mengikuti pdut existing — kerjasama.mou, pdrd.sms):
--   - PK uniqueidentifier NEWID()
--   - varchar (bukan nvarchar) — kecuali isi rich-text pakai NVARCHAR(MAX)
--   - Audit cols: id_creator, create_date, id_updater, last_update,
--                 soft_delete numeric(1,0) DEFAULT 0, last_sync DATETIME
--   - snake_case lowercase
--
-- Idempotent: pakai IF NOT EXISTS check.
-- Run: SSMS connect ke pdut / pdut_staging.
-- ============================================================================

USE pdut_staging;  -- Ubah ke `pdut` untuk produksi
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET NUMERIC_ROUNDABORT OFF;
GO

-- ============================================================================
-- 0. CREATE SCHEMA man_konten (kalau belum ada)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'man_konten')
BEGIN
    EXEC('CREATE SCHEMA man_konten AUTHORIZATION dbo');
    PRINT 'Created schema man_konten';
END
GO

-- ============================================================================
-- 1. man_konten.kategori — taxonomy referensi
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='kategori' AND schema_id=SCHEMA_ID('man_konten'))
BEGIN
    CREATE TABLE man_konten.kategori (
        id_kategori     UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        kode            VARCHAR(20)      NOT NULL,
        nama            VARCHAR(100)     NOT NULL,
        icon_name       VARCHAR(50)      NULL,
        color           VARCHAR(20)      NULL,
        jenis           VARCHAR(20)      NOT NULL,    -- 'pengumuman' | 'berita' | 'both'
        urutan          INT              NOT NULL DEFAULT 0,
        is_active       BIT              NOT NULL DEFAULT 1,
        id_creator      UNIQUEIDENTIFIER NULL,
        create_date     DATETIME         NOT NULL DEFAULT GETDATE(),
        id_updater      UNIQUEIDENTIFIER NULL,
        last_update     DATETIME         NOT NULL DEFAULT GETDATE(),
        soft_delete     NUMERIC(1,0)     NOT NULL DEFAULT 0,
        last_sync       DATETIME         NULL
    );
    CREATE UNIQUE INDEX UX_kategori_kode ON man_konten.kategori(kode) WHERE soft_delete = 0;
    CREATE INDEX IX_kategori_jenis ON man_konten.kategori(jenis, is_active) WHERE soft_delete = 0;
    PRINT 'Created table man_konten.kategori';
END
GO

-- ============================================================================
-- 2. man_konten.pengumuman — UNIFIED konten table (pengumuman/berita/artikel)
-- ============================================================================
-- Ditingkatkan dari single-purpose ke flexible: 1 tabel, 3 tipe konten.
-- Field `tipe` membedakan: 'pengumuman' (short-form), 'berita' (medium), 'artikel' (long-form).
-- Admin UI bisa filter per tipe; public-facing dapat fetch sesuai konteks.
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='pengumuman' AND schema_id=SCHEMA_ID('man_konten'))
BEGIN
    CREATE TABLE man_konten.pengumuman (
        id_pengumuman   UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        tipe            VARCHAR(20)      NOT NULL DEFAULT 'pengumuman',  -- pengumuman|berita|artikel
        judul           VARCHAR(255)     NOT NULL,
        slug            VARCHAR(255)     NULL,                            -- URL-friendly (untuk berita/artikel)
        ringkasan       VARCHAR(500)     NULL,
        isi             NVARCHAR(MAX)    NULL,                            -- rich text (Tiptap HTML/JSON)
        id_kategori     UNIQUEIDENTIFIER NULL,
        banner_url      VARCHAR(500)     NULL,
        author          VARCHAR(255)     NULL,                            -- nama penulis (untuk berita/artikel)
        tags            VARCHAR(500)     NULL,                            -- comma-separated
        is_pinned       BIT              NOT NULL DEFAULT 0,
        is_featured     BIT              NOT NULL DEFAULT 0,
        tgl_terbit      DATETIME         NOT NULL DEFAULT GETDATE(),
        tgl_expiry      DATETIME         NULL,
        status          VARCHAR(20)      NOT NULL DEFAULT 'draft',        -- draft|published|archived
        target_role     VARCHAR(20)      NOT NULL DEFAULT 'all',          -- all|mahasiswa|dosen|tendik|custom
        view_count      INT              NOT NULL DEFAULT 0,
        allow_comment   BIT              NOT NULL DEFAULT 0,              -- toggle comment (Phase 2 fitur)
        allow_like      BIT              NOT NULL DEFAULT 0,              -- toggle like (Phase 2 fitur)
        id_creator      UNIQUEIDENTIFIER NULL,
        create_date     DATETIME         NOT NULL DEFAULT GETDATE(),
        id_updater      UNIQUEIDENTIFIER NULL,
        last_update     DATETIME         NOT NULL DEFAULT GETDATE(),
        soft_delete     NUMERIC(1,0)     NOT NULL DEFAULT 0,
        last_sync       DATETIME         NULL,
        CONSTRAINT FK_pengumuman_kategori FOREIGN KEY (id_kategori)
            REFERENCES man_konten.kategori(id_kategori)
    );
    CREATE INDEX IX_pengumuman_tipe_status ON man_konten.pengumuman(tipe, status, tgl_terbit DESC) WHERE soft_delete = 0;
    CREATE INDEX IX_pengumuman_kategori ON man_konten.pengumuman(id_kategori) WHERE soft_delete = 0;
    CREATE INDEX IX_pengumuman_featured ON man_konten.pengumuman(is_featured, is_pinned) WHERE soft_delete = 0 AND status = 'published';
    CREATE INDEX IX_pengumuman_slug ON man_konten.pengumuman(slug) WHERE slug IS NOT NULL AND soft_delete = 0;
    PRINT 'Created table man_konten.pengumuman (unified konten with tipe field)';
END
GO

-- ============================================================================
-- 3. (REMOVED) man_konten.berita — di-merge ke man_konten.pengumuman dengan
--                                  field `tipe`. 1 tabel untuk pengumuman/berita/artikel.
-- ============================================================================

-- ============================================================================
-- 4. man_konten.notifikasi — broadcast notification (1 row per broadcast)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='notifikasi' AND schema_id=SCHEMA_ID('man_konten'))
BEGIN
    CREATE TABLE man_konten.notifikasi (
        id_notif        UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        tipe            VARCHAR(30)      NOT NULL,    -- 'pengumuman'|'berita'|'system'|'reminder'|'alert'
        judul           VARCHAR(255)     NOT NULL,
        pesan           VARCHAR(1000)    NOT NULL,
        target_url      VARCHAR(500)     NULL,
        icon_name       VARCHAR(50)      NULL,
        severity        VARCHAR(20)      NOT NULL DEFAULT 'info',  -- info|success|warning|error
        target_role     VARCHAR(20)      NOT NULL DEFAULT 'all',
        target_unit_ids VARCHAR(MAX)     NULL,                     -- JSON array
        target_user_ids VARCHAR(MAX)     NULL,                     -- JSON array (direct messaging)
        expiry_at       DATETIME         NULL,
        id_creator      UNIQUEIDENTIFIER NULL,
        create_date     DATETIME         NOT NULL DEFAULT GETDATE(),
        id_updater      UNIQUEIDENTIFIER NULL,
        last_update     DATETIME         NOT NULL DEFAULT GETDATE(),
        soft_delete     NUMERIC(1,0)     NOT NULL DEFAULT 0,
        last_sync       DATETIME         NULL
    );
    CREATE INDEX IX_notif_tipe_create ON man_konten.notifikasi(tipe, create_date DESC) WHERE soft_delete = 0;
    PRINT 'Created table man_konten.notifikasi';
END
GO

-- ============================================================================
-- 5. man_konten.notif_recipient — per-user state (read/dismiss)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='notif_recipient' AND schema_id=SCHEMA_ID('man_konten'))
BEGIN
    CREATE TABLE man_konten.notif_recipient (
        id_recipient    UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        id_notif        UNIQUEIDENTIFIER NOT NULL,
        id_pengguna     UNIQUEIDENTIFIER NOT NULL,
        is_read         BIT              NOT NULL DEFAULT 0,
        read_at         DATETIME         NULL,
        is_dismissed    BIT              NOT NULL DEFAULT 0,
        dismissed_at    DATETIME         NULL,
        delivered_at    DATETIME         NOT NULL DEFAULT GETDATE(),
        soft_delete     NUMERIC(1,0)     NOT NULL DEFAULT 0,
        CONSTRAINT FK_recipient_notif FOREIGN KEY (id_notif)
            REFERENCES man_konten.notifikasi(id_notif),
        CONSTRAINT UX_recipient_notif_pengguna UNIQUE (id_notif, id_pengguna)
    );
    CREATE INDEX IX_recipient_pengguna_unread ON man_konten.notif_recipient(id_pengguna, is_read)
        WHERE soft_delete = 0 AND is_dismissed = 0;
    CREATE INDEX IX_recipient_pengguna_delivered ON man_konten.notif_recipient(id_pengguna, delivered_at DESC)
        WHERE soft_delete = 0;
    PRINT 'Created table man_konten.notif_recipient';
END
GO

-- ============================================================================
-- 6. man_konten.target_audience — polymorphic targeting (pengumuman/berita/notif)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='target_audience' AND schema_id=SCHEMA_ID('man_konten'))
BEGIN
    CREATE TABLE man_konten.target_audience (
        id_audience     UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        konten_type     VARCHAR(20)      NOT NULL,    -- 'pengumuman'|'berita'|'notifikasi'
        konten_id       UNIQUEIDENTIFIER NOT NULL,    -- polymorphic FK
        target_type     VARCHAR(20)      NOT NULL,    -- 'role'|'unit'|'user'|'kategori_user'
        target_value    VARCHAR(100)     NOT NULL,
        create_date     DATETIME         NOT NULL DEFAULT GETDATE(),
        soft_delete     NUMERIC(1,0)     NOT NULL DEFAULT 0
    );
    CREATE INDEX IX_audience_konten ON man_konten.target_audience(konten_type, konten_id) WHERE soft_delete = 0;
    CREATE INDEX IX_audience_target ON man_konten.target_audience(target_type, target_value) WHERE soft_delete = 0;
    PRINT 'Created table man_konten.target_audience';
END
GO

-- ============================================================================
-- 7. SEED kategori default
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM man_konten.kategori WHERE kode='akademik')
BEGIN
    INSERT INTO man_konten.kategori (kode, nama, icon_name, color, jenis, urutan, is_active) VALUES
        ('akademik',     'Akademik',          'heroicons:academic-cap',  'blue',    'both', 1, 1),
        ('kemahasiswaan','Kemahasiswaan',     'heroicons:users',         'purple',  'both', 2, 1),
        ('beasiswa',     'Beasiswa',          'heroicons:gift',          'green',   'both', 3, 1),
        ('penelitian',   'Penelitian',        'heroicons:beaker',        'amber',   'both', 4, 1),
        ('pengabdian',   'Pengabdian',        'heroicons:hand-raised',   'rose',    'both', 5, 1),
        ('sistem',       'Sistem & Aplikasi', 'heroicons:cog-6-tooth',   'slate',   'both', 6, 1),
        ('humas',        'Humas & Acara',     'heroicons:megaphone',     'sky',     'both', 7, 1),
        ('umum',         'Umum',              'heroicons:newspaper',     'gray',    'both', 8, 1);
    PRINT 'Seeded 8 kategori default';
END
ELSE
BEGIN
    PRINT 'Kategori sudah ada, skip seed';
END
GO

-- ============================================================================
-- Verifikasi
-- ============================================================================
SELECT
    (SELECT COUNT(*) FROM sys.schemas WHERE name='man_konten') AS schema_exists,
    (SELECT COUNT(*) FROM sys.tables WHERE schema_id=SCHEMA_ID('man_konten')) AS tables_count,
    (SELECT COUNT(*) FROM man_konten.kategori WHERE soft_delete=0) AS kategori_count;

PRINT 'Migration man_konten complete. Expected: schema_exists=1, tables_count=5, kategori_count=8';
PRINT 'Tables: kategori, pengumuman (UNIFIED tipe=pengumuman/berita/artikel), notifikasi, notif_recipient, target_audience';
