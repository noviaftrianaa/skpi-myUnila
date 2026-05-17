-- =====================================================
-- Script:  Blog Platform myUnila — Fresh Schema
-- Database: PostgreSQL (dedicated DB: blog_unila)
-- Version: 1.0
-- Date:    2026-05-13
-- Author:  Dev team MyUnila + Mizar
-- Description:
--   Platform blog terintegrasi MyUnila untuk seluruh civitas akademik:
--   mahasiswa, staf/tendik, dosen, alumni. Mendukung:
--     - Per-user blog dengan subdomain *.blog.unila.ac.id
--     - Aggregator publik di blog.unila.ac.id (Google-search-like)
--     - Multi-template theme (default: modern, minimalist)
--     - Editor TipTap (HTML+JSON)
--     - Komentar/reactions/follower (siap dari MVP, fitur diaktifkan phase 2)
--
--   Schemas:
--     - ref         : Master/referensi (tipe role, kategori, tag, template, kata terlarang)
--     - blog        : Core (blog per-user, post, post_tag, post_revision)
--     - media       : Media library (file uploads ke MinIO)
--     - interaction : Komentar, like, view, follower (P2 enabled, schema ready dari MVP)
--     - moderation  : Klaim subdomain, laporan post
--     - audit       : Jejak audit aksi pengguna
--
--   Tables:
--     ref.tipe_role             - Mhs/Staf/Dosen/Alumni + suffix subdomain
--     ref.kategori_post         - Master kategori artikel global (admin curated)
--     ref.tag                   - Tag bebas (auto-create dari post)
--     ref.template_theme        - Theme registry (modern/minimalist/...)
--     ref.kata_terlarang        - Reserved words validation subdomain
--     blog.blog                 - Per-user blog (1 user = 1 blog)
--     blog.post                 - Artikel
--     blog.post_tag             - Many-to-many post ⇄ tag
--     blog.post_revision        - Version history post
--     media.media               - Media library
--     interaction.komentar      - Komentar threaded (P2 active)
--     interaction.like_post     - Like/clap (P2 active)
--     interaction.view_post     - Tracking view granular (untuk trending)
--     interaction.follower      - Follow blog (P2 active)
--     moderation.klaim_subdomain - Request klaim + 4-layer validation history
--     moderation.laporan_post   - Report inappropriate content (P2)
--     audit.jejak_audit         - Log aksi pengguna
--
--   Naming Convention:
--     - Schema: ref, blog, media, interaction, moderation, audit
--     - PK: id_<tabel> UUID DEFAULT gen_random_uuid()
--     - FK internal: id_<referensi> UUID REFERENCES <schema>.<tabel>(id_<tabel>)
--     - FK cross-DB pdut: suffix _pdut (UUID, NO physical FK — cross-engine SQL Server)
--     - Name: nm_<field>
--     - Date: tgl_<field>
--     - Boolean: a_<field> BOOLEAN DEFAULT FALSE/TRUE
--     - JSONB: <purpose>_json
--     - Audit: id_creator, id_updater, created_at, updated_at, soft_delete
--     - Index: idx_<tabel>_<kolom>, partial untuk WHERE soft_delete IS NULL
--
--   Cross-DB Reference (read-only ke pdut SQL Server 192.168.123.119):
--     - pdut.man_akses.pengguna       - data user (nama, email, foto)
--     - pdut.man_akses.peran          - role mapping
--     - pdut.man_akses.unit_organisasi - fakultas (untuk badge & filter)
--     - pdut.siakadu.peserta_didik    - data mahasiswa (NIM, prodi, angkatan)
--     - pdut.pdrd.sms                 - prodi (untuk badge)
--     - pdut.ref.sdm                  - data dosen/staf (NIP, jabatan)
--
--   Field id_pengguna_pdut, id_*_pdut menyimpan UUID
--   yang merujuk ke tabel di SQL Server (pdut). Backend resolve via
--   dual connection (bukan FK fisik).
-- =====================================================

-- =====================================================
-- Step 0: Create Database, Extensions & Schemas
-- =====================================================
-- CREATE DATABASE blog_unila;  -- jalankan dari superuser
-- \c blog_unila

-- Hapus schema public (tidak dipakai, semua tabel di schema khusus)
DROP SCHEMA IF EXISTS public CASCADE;

-- Buat schema khusus
CREATE SCHEMA IF NOT EXISTS ref;            -- master/referensi
CREATE SCHEMA IF NOT EXISTS blog;           -- core: blog & post
CREATE SCHEMA IF NOT EXISTS media;          -- media library
CREATE SCHEMA IF NOT EXISTS interaction;    -- komentar, like, view, follower
CREATE SCHEMA IF NOT EXISTS moderation;     -- klaim subdomain, laporan
CREATE SCHEMA IF NOT EXISTS audit;          -- jejak audit

-- gen_random_uuid() bawaan PostgreSQL 13+, tidak perlu extension uuid-ossp
-- IMPORTANT: kita DROP schema public di atas, jadi search_path harus eksplisit
-- ke salah satu schema yang ada (ref di paling depan untuk default function creation).
SET search_path TO ref, blog, media, interaction, moderation, audit;
-- Default search_path untuk session DB ini (persist setelah connect):
ALTER DATABASE blog_unila SET search_path TO ref, blog, media, interaction, moderation, audit;


-- =====================================================
-- Step 0.5: Helper function — auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- SCHEMA: ref
-- Master/referensi yang jarang berubah. Seed terpisah di file 02.
-- =============================================================================

-- =====================================================
-- Step 1: CREATE TABLE ref.tipe_role
-- =====================================================
-- Tipe civitas: Mahasiswa / Staf / Dosen / Alumni.
-- Menentukan suffix subdomain (-mhs / -staf / -dosen / -alumni).

CREATE TABLE IF NOT EXISTS ref.tipe_role (
    id_tipe_role        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode                VARCHAR(16)     NOT NULL UNIQUE,
                                        -- MHS / STAF / DOSEN / ALUMNI
    suffix_subdomain    VARCHAR(16)     NOT NULL UNIQUE,
                                        -- -mhs / -staf / -dosen / -alumni
    nm_tipe             VARCHAR(60)     NOT NULL,
                                        -- "Mahasiswa", "Staf/Tendik", "Dosen", "Alumni"
    deskripsi           TEXT            NULL,
    urutan              INT             NOT NULL DEFAULT 0,
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         TIMESTAMP       NULL
);

CREATE TRIGGER trg_tipe_role_updated_at
    BEFORE UPDATE ON ref.tipe_role
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

COMMENT ON TABLE  ref.tipe_role IS 'Tipe civitas akademik untuk validasi & suffix subdomain blog';
COMMENT ON COLUMN ref.tipe_role.kode IS 'Kode internal: MHS / STAF / DOSEN / ALUMNI';
COMMENT ON COLUMN ref.tipe_role.suffix_subdomain IS 'Suffix yang di-append ke subdomain user (e.g. -mhs)';


-- =====================================================
-- Step 2: CREATE TABLE ref.kategori_post
-- =====================================================
-- Master kategori artikel global. Admin curated (~20 kategori).

CREATE TABLE IF NOT EXISTS ref.kategori_post (
    id_kategori_post    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                VARCHAR(60)     NOT NULL UNIQUE,
    nm_kategori         VARCHAR(120)    NOT NULL,
    deskripsi           TEXT            NULL,
    icon_name           VARCHAR(60)     NULL,
                                        -- react-icons name, contoh: 'FiCpu'
    warna               VARCHAR(7)      NULL,
                                        -- hex color: #3B82F6
    urutan              INT             NOT NULL DEFAULT 0,
    jumlah_post         INT             NOT NULL DEFAULT 0,
                                        -- Denormalized counter (update via trigger)
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         TIMESTAMP       NULL
);

CREATE TRIGGER trg_kategori_post_updated_at
    BEFORE UPDATE ON ref.kategori_post
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX idx_kategori_post_aktif ON ref.kategori_post(a_aktif, urutan)
    WHERE soft_delete IS NULL;

COMMENT ON TABLE  ref.kategori_post IS 'Master kategori artikel global (admin curated)';
COMMENT ON COLUMN ref.kategori_post.jumlah_post IS 'Cached count published posts (di-update via trigger di blog.post)';


-- =====================================================
-- Step 3: CREATE TABLE ref.tag
-- =====================================================
-- Tag bebas, auto-create dari penulis.

CREATE TABLE IF NOT EXISTS ref.tag (
    id_tag              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                VARCHAR(80)     NOT NULL UNIQUE,
    nm_tag              VARCHAR(80)     NOT NULL,
    deskripsi           TEXT            NULL,
                                        -- Opsional, dipakai di Tag Manager admin (curated tags)
    frekuensi           INT             NOT NULL DEFAULT 0,
                                        -- Cached count usage (untuk autocomplete & top tags)
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,
                                        -- Admin bisa nonaktifkan tag spam/inappropriate
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         TIMESTAMP       NULL
);

CREATE TRIGGER trg_tag_updated_at
    BEFORE UPDATE ON ref.tag
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX idx_tag_frekuensi ON ref.tag(frekuensi DESC) WHERE a_aktif = TRUE AND soft_delete IS NULL;
CREATE INDEX idx_tag_aktif ON ref.tag(a_aktif) WHERE soft_delete IS NULL;
CREATE INDEX idx_tag_slug_search ON ref.tag USING GIN (to_tsvector('simple', nm_tag));

COMMENT ON TABLE  ref.tag IS 'Tag bebas — auto-create dari user. Admin bisa kurasi via Tag Manager.';
COMMENT ON COLUMN ref.tag.frekuensi IS 'Cached count usage (di-update via trigger di blog.post_tag)';
COMMENT ON COLUMN ref.tag.a_aktif IS 'Admin toggle untuk hide tag dari autocomplete & tag cloud';


-- =====================================================
-- Step 4: CREATE TABLE ref.template_theme
-- =====================================================
-- Registry theme. MVP: modern (default), minimalist.

CREATE TABLE IF NOT EXISTS ref.template_theme (
    id_template_theme   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode                VARCHAR(40)     NOT NULL UNIQUE,
                                        -- 'modern' / 'minimalist' / 'magazine' / 'academic'
    nm_template         VARCHAR(120)    NOT NULL,
    deskripsi           TEXT            NULL,
    preview_url         TEXT            NULL,
                                        -- URL screenshot preview
    manifest_json       JSONB           NOT NULL DEFAULT '{}'::JSONB,
                                        -- Spec component & layout (warna default, font, dst)
    versi               VARCHAR(16)     NOT NULL DEFAULT '1.0.0',
    a_default           BOOLEAN         NOT NULL DEFAULT FALSE,
                                        -- Hanya 1 baris boleh TRUE (constraint via app)
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         TIMESTAMP       NULL
);

CREATE TRIGGER trg_template_theme_updated_at
    BEFORE UPDATE ON ref.template_theme
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE UNIQUE INDEX idx_template_theme_default ON ref.template_theme(a_default)
    WHERE a_default = TRUE AND soft_delete IS NULL;

COMMENT ON TABLE  ref.template_theme IS 'Registry theme template untuk per-user blog (default: modern)';


-- =====================================================
-- Step 5: CREATE TABLE ref.kata_terlarang
-- =====================================================
-- Reserved words untuk validasi subdomain (~200 list).

CREATE TABLE IF NOT EXISTS ref.kata_terlarang (
    id_kata_terlarang   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kata                VARCHAR(80)     NOT NULL UNIQUE,
                                        -- Lowercase. Banned subdomain claim.
    kategori            VARCHAR(20)     NOT NULL,
                                        -- 'system' / 'role' / 'brand' / 'offensive'
    keterangan          TEXT            NULL,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         TIMESTAMP       NULL,
    CONSTRAINT chk_kata_terlarang_kategori
        CHECK (kategori IN ('system','role','brand','offensive'))
);

CREATE TRIGGER trg_kata_terlarang_updated_at
    BEFORE UPDATE ON ref.kata_terlarang
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX idx_kata_terlarang_kategori ON ref.kata_terlarang(kategori)
    WHERE soft_delete IS NULL;

COMMENT ON TABLE ref.kata_terlarang IS 'Reserved words untuk validasi claim subdomain (~200 entries)';


-- =============================================================================
-- SCHEMA: blog
-- Core: blog per-user, post, post_tag, post_revision.
-- =============================================================================

-- =====================================================
-- Step 6: CREATE TABLE blog.blog
-- =====================================================
-- Per-user blog. 1 user = 1 blog. Subdomain UNIQUE global.

CREATE TABLE IF NOT EXISTS blog.blog (
    id_blog                 UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengguna_pdut        UUID            NOT NULL UNIQUE,
                                            -- Cross-DB FK ke pdut.man_akses.pengguna
    id_tipe_role            UUID            NOT NULL REFERENCES ref.tipe_role(id_tipe_role),
    subdomain               VARCHAR(60)     NOT NULL UNIQUE,
                                            -- e.g. '2117051070-mhs', 'rektor-staf'
    nm_blog                 VARCHAR(200)    NOT NULL,
                                            -- Display title
    nm_tampilan             VARCHAR(120)    NULL,
                                            -- Override nama author (kalau pseudonym)
    tagline                 VARCHAR(255)    NULL,
                                            -- Subtitle blog
    deskripsi               TEXT            NULL,
                                            -- Long description
    avatar_url              TEXT            NULL,
    cover_url               TEXT            NULL,
    bio                     TEXT            NULL,
                                            -- Author bio (max 500 char enforced di app)
    lokasi                  VARCHAR(120)    NULL,
    sosmed_json             JSONB           NOT NULL DEFAULT '{}'::JSONB,
                                            -- {twitter, instagram, linkedin, github, orcid, scholar, website}
    id_template_theme       UUID            NULL REFERENCES ref.template_theme(id_template_theme),
                                            -- NULL = pakai default
    theme_config_json       JSONB           NOT NULL DEFAULT '{}'::JSONB,
                                            -- Override warna, font, layout
    bahasa                  VARCHAR(10)     NOT NULL DEFAULT 'id',
                                            -- 'id' / 'en'
    timezone                VARCHAR(40)     NOT NULL DEFAULT 'Asia/Jakarta',
    a_aktif                 BOOLEAN         NOT NULL DEFAULT TRUE,
                                            -- Admin bisa suspend
    a_publik                BOOLEAN         NOT NULL DEFAULT TRUE,
                                            -- FALSE = login-only akses
    a_komentar_aktif        BOOLEAN         NOT NULL DEFAULT TRUE,
                                            -- Default allow comments per-blog
    a_terverifikasi         BOOLEAN         NOT NULL DEFAULT FALSE,
                                            -- Verified badge (admin set)
    tgl_klaim               TIMESTAMP       NULL,
                                            -- Kapan subdomain di-claim
    tgl_rename_terakhir     TIMESTAMP       NULL,
                                            -- Untuk cooldown 90 hari rename
    jumlah_post             INT             NOT NULL DEFAULT 0,
                                            -- Denormalized (trigger)
    jumlah_view             BIGINT          NOT NULL DEFAULT 0,
                                            -- Lifetime aggregate
    jumlah_follower         INT             NOT NULL DEFAULT 0,
                                            -- Denormalized (trigger P2)
    meta_seo_json           JSONB           NOT NULL DEFAULT '{}'::JSONB,
                                            -- {og_image, default_meta_desc, gsc_meta, twitter_handle}
    cv_json                 JSONB           NOT NULL DEFAULT '{}'::JSONB,
                                            -- Portfolio/CV data (LinkedIn-style):
                                            --   {pendidikan: [{jenjang, institusi, prodi, tahun_mulai, tahun_selesai, deskripsi}],
                                            --    pengalaman: [{posisi, organisasi, lokasi, tahun_mulai, tahun_selesai, deskripsi}],
                                            --    skills: [{nm_skill, level: 1-5, kategori}],
                                            --    sertifikasi: [{nm, issuer, tahun, url}],
                                            --    publikasi: [{judul, venue, tahun, url}],
                                            --    bahasa: [{nm, level: basic|intermediate|advanced|native}]}
                                            -- Author edit dari MyUnila dashboard. Data sensitif (alamat/telp/IPK/NIK)
                                            -- TIDAK pernah disimpan di sini — privacy by design.
    rating_avg              NUMERIC(3,2)    NOT NULL DEFAULT 0,
                                            -- Avg rating dari pembaca (1.00 - 5.00) — P2 fitur rating
    rating_count            INT             NOT NULL DEFAULT 0,
                                            -- Jumlah rating untuk avg calculation
    skor_seo                INT             NOT NULL DEFAULT 0,
                                            -- Composite ranking score di apex aggregator
                                            -- Formula: post*10 + view*0.1 + like*5 + follower*20 + rating_avg*100 + badge_bonus
                                            -- Recompute via cron daily
    id_creator              UUID            NULL,
    id_updater              UUID            NULL,
    created_at              TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete             TIMESTAMP       NULL
);

CREATE TRIGGER trg_blog_updated_at
    BEFORE UPDATE ON blog.blog
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX idx_blog_pengguna ON blog.blog(id_pengguna_pdut)
    WHERE soft_delete IS NULL;
CREATE INDEX idx_blog_tipe_role ON blog.blog(id_tipe_role)
    WHERE soft_delete IS NULL AND a_aktif = TRUE;
CREATE INDEX idx_blog_jumlah_view ON blog.blog(jumlah_view DESC)
    WHERE soft_delete IS NULL AND a_aktif = TRUE;
CREATE INDEX idx_blog_skor_seo ON blog.blog(skor_seo DESC)
    WHERE soft_delete IS NULL AND a_aktif = TRUE;
CREATE INDEX idx_blog_aktif ON blog.blog(a_aktif, a_publik)
    WHERE soft_delete IS NULL;

COMMENT ON TABLE  blog.blog IS 'Per-user blog (1 user = 1 blog). Subdomain UNIQUE global.';
COMMENT ON COLUMN blog.blog.id_pengguna_pdut IS 'Cross-DB UUID ke pdut.man_akses.pengguna (no physical FK)';
COMMENT ON COLUMN blog.blog.subdomain IS 'Subdomain global, format: <basename>-<suffix_role> (e.g. 2117051070-mhs)';
COMMENT ON COLUMN blog.blog.theme_config_json IS 'Override theme: {warna_primer, warna_sekunder, font_heading, layout, ...}';
COMMENT ON COLUMN blog.blog.tgl_rename_terakhir IS 'Timestamp rename terakhir untuk cooldown 90 hari';
COMMENT ON COLUMN blog.blog.cv_json IS 'Portfolio/CV LinkedIn-style: pendidikan, pengalaman, skills, sertifikasi, publikasi, bahasa. PRIVACY: data sensitif (alamat/telp/IPK/NIK) NEVER stored — by design.';
COMMENT ON COLUMN blog.blog.skor_seo IS 'Composite ranking score untuk apex aggregator (recompute daily via cron)';


-- =====================================================
-- Step 7: CREATE TABLE blog.post
-- =====================================================
-- Artikel (post). UNIQUE (id_blog, slug) per blog.

CREATE TABLE IF NOT EXISTS blog.post (
    id_post                 UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_blog                 UUID            NOT NULL REFERENCES blog.blog(id_blog),
    id_kategori_post        UUID            NULL REFERENCES ref.kategori_post(id_kategori_post),
    judul                   VARCHAR(255)    NOT NULL,
    slug                    VARCHAR(255)    NOT NULL,
                                            -- UNIQUE per blog (constraint partial di bawah)
    ringkasan               VARCHAR(500)    NULL,
                                            -- Excerpt (auto atau manual)
    konten_html             TEXT            NULL,
                                            -- TipTap output HTML untuk render
    konten_json             JSONB           NULL,
                                            -- TipTap JSON untuk re-edit
    konten_md               TEXT            NULL,
                                            -- Markdown export (opsional)
    cover_url               TEXT            NULL,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'draft',
                                            -- draft / review / published / scheduled / archived / trash
    visibilitas             VARCHAR(20)     NOT NULL DEFAULT 'public',
                                            -- public / unlisted / private / password
    password_hash           VARCHAR(255)    NULL,
                                            -- bcrypt jika visibilitas='password'
    tgl_terbit              TIMESTAMP       NULL,
                                            -- Diisi saat status→published
    tgl_jadwal              TIMESTAMP       NULL,
                                            -- Untuk scheduled
    a_pinned                BOOLEAN         NOT NULL DEFAULT FALSE,
                                            -- Pin di top blog
    a_unggulan              BOOLEAN         NOT NULL DEFAULT FALSE,
                                            -- Featured (admin set)
    a_komentar_aktif        BOOLEAN         NOT NULL DEFAULT TRUE,
                                            -- Override per-post (default ikut blog setting)
    jumlah_view             INT             NOT NULL DEFAULT 0,
    jumlah_like             INT             NOT NULL DEFAULT 0,
    jumlah_komentar         INT             NOT NULL DEFAULT 0,
    jumlah_share            INT             NOT NULL DEFAULT 0,
    waktu_baca_menit        INT             NOT NULL DEFAULT 0,
                                            -- Auto-calc (jumlah_kata / 150)
    jumlah_kata             INT             NOT NULL DEFAULT 0,
                                            -- Auto-calc word count
    meta_seo_json           JSONB           NOT NULL DEFAULT '{}'::JSONB,
                                            -- {og_title, og_image, meta_desc, canonical_url, no_index}
    bahasa                  VARCHAR(10)     NOT NULL DEFAULT 'id',
    id_creator              UUID            NULL,
    id_updater              UUID            NULL,
    created_at              TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete             TIMESTAMP       NULL,
    CONSTRAINT chk_post_status
        CHECK (status IN ('draft','review','published','scheduled','archived','trash')),
    CONSTRAINT chk_post_visibilitas
        CHECK (visibilitas IN ('public','unlisted','private','password'))
);

CREATE TRIGGER trg_post_updated_at
    BEFORE UPDATE ON blog.post
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- UNIQUE slug per blog (kecuali soft-deleted)
CREATE UNIQUE INDEX idx_post_blog_slug ON blog.post(id_blog, slug)
    WHERE soft_delete IS NULL;

CREATE INDEX idx_post_blog_status ON blog.post(id_blog, status)
    WHERE soft_delete IS NULL;
CREATE INDEX idx_post_kategori ON blog.post(id_kategori_post)
    WHERE status = 'published' AND soft_delete IS NULL;
CREATE INDEX idx_post_tgl_terbit ON blog.post(tgl_terbit DESC)
    WHERE status = 'published' AND soft_delete IS NULL;
CREATE INDEX idx_post_jumlah_view ON blog.post(jumlah_view DESC)
    WHERE status = 'published' AND soft_delete IS NULL;
CREATE INDEX idx_post_unggulan ON blog.post(tgl_terbit DESC)
    WHERE a_unggulan = TRUE AND status = 'published' AND soft_delete IS NULL;
CREATE INDEX idx_post_scheduled ON blog.post(tgl_jadwal)
    WHERE status = 'scheduled' AND soft_delete IS NULL;

-- Full-text search index (fallback kalau Meilisearch down)
CREATE INDEX idx_post_fts ON blog.post USING GIN (
    to_tsvector('simple', judul || ' ' || COALESCE(ringkasan, ''))
) WHERE status = 'published' AND soft_delete IS NULL;

COMMENT ON TABLE  blog.post IS 'Artikel (post). UNIQUE slug per blog.';
COMMENT ON COLUMN blog.post.konten_json IS 'TipTap JSON untuk re-edit di editor';
COMMENT ON COLUMN blog.post.konten_html IS 'TipTap output HTML untuk render publik (sanitized)';
COMMENT ON COLUMN blog.post.status IS 'draft / review / published / scheduled / archived / trash';
COMMENT ON COLUMN blog.post.visibilitas IS 'public / unlisted / private (login-only) / password';


-- =====================================================
-- Step 8: CREATE TABLE blog.post_tag
-- =====================================================
-- Many-to-many post ⇄ tag.

CREATE TABLE IF NOT EXISTS blog.post_tag (
    id_post_tag         UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_post             UUID            NOT NULL REFERENCES blog.post(id_post) ON DELETE CASCADE,
    id_tag              UUID            NOT NULL REFERENCES ref.tag(id_tag),
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_post_tag UNIQUE (id_post, id_tag)
);

CREATE INDEX idx_post_tag_tag ON blog.post_tag(id_tag);

COMMENT ON TABLE blog.post_tag IS 'Many-to-many post ⇄ tag';


-- =====================================================
-- Step 9: CREATE TABLE blog.post_revision
-- =====================================================
-- Version history post (untuk undo + audit).

CREATE TABLE IF NOT EXISTS blog.post_revision (
    id_post_revision    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_post             UUID            NOT NULL REFERENCES blog.post(id_post) ON DELETE CASCADE,
    nomor_revisi        INT             NOT NULL,
    judul_snapshot      VARCHAR(255)    NOT NULL,
    ringkasan_snapshot  VARCHAR(500)    NULL,
    konten_html_snapshot TEXT           NULL,
    konten_json_snapshot JSONB          NULL,
    catatan             VARCHAR(255)    NULL,
                                        -- 'auto_save' / 'manual_save' / 'publish' / 'schedule' / 'restore'
    id_creator          UUID            NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_post_revision UNIQUE (id_post, nomor_revisi)
);

CREATE INDEX idx_post_revision_post ON blog.post_revision(id_post, nomor_revisi DESC);

COMMENT ON TABLE blog.post_revision IS 'Version history post (retain last 50 per post via cron)';


-- =============================================================================
-- SCHEMA: media
-- Media library (file uploads ke MinIO bucket blog-media).
-- =============================================================================

-- =====================================================
-- Step 10: CREATE TABLE media.media
-- =====================================================

CREATE TABLE IF NOT EXISTS media.media (
    id_media            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_blog             UUID            NOT NULL REFERENCES blog.blog(id_blog),
    id_pengguna_pdut    UUID            NOT NULL,
                                        -- Uploader (cross-DB UUID)
    nama_file           VARCHAR(255)    NOT NULL,
    path_storage        VARCHAR(500)    NOT NULL,
                                        -- MinIO key: blog-media/{id_blog}/{filename}
    url_publik          VARCHAR(500)    NOT NULL,
                                        -- CDN URL untuk akses publik
    mime_type           VARCHAR(100)    NOT NULL,
    ukuran_bytes        BIGINT          NOT NULL,
    lebar_px            INT             NULL,
                                        -- Image only
    tinggi_px           INT             NULL,
                                        -- Image only
    durasi_detik        INT             NULL,
                                        -- Video/audio only
    varian_json         JSONB           NOT NULL DEFAULT '{}'::JSONB,
                                        -- {thumbnail: url, medium: url, large: url} untuk image
    alt_text            VARCHAR(255)    NULL,
                                        -- Accessibility
    caption             TEXT            NULL,
    jenis_media         VARCHAR(20)     NOT NULL,
                                        -- 'image' / 'video' / 'audio' / 'document' / 'other'
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         TIMESTAMP       NULL,
    CONSTRAINT chk_media_jenis
        CHECK (jenis_media IN ('image','video','audio','document','other'))
);

CREATE TRIGGER trg_media_updated_at
    BEFORE UPDATE ON media.media
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX idx_media_blog ON media.media(id_blog)
    WHERE soft_delete IS NULL;
CREATE INDEX idx_media_jenis ON media.media(jenis_media)
    WHERE soft_delete IS NULL;

COMMENT ON TABLE media.media IS 'Media library — file uploads ke MinIO bucket blog-media';


-- =============================================================================
-- SCHEMA: interaction
-- Komentar, like, view, follower. Schema siap dari MVP, fitur P2.
-- =============================================================================

-- =====================================================
-- Step 11: CREATE TABLE interaction.komentar
-- =====================================================

CREATE TABLE IF NOT EXISTS interaction.komentar (
    id_komentar             UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_post                 UUID            NOT NULL REFERENCES blog.post(id_post) ON DELETE CASCADE,
    id_komentar_parent      UUID            NULL REFERENCES interaction.komentar(id_komentar),
                                            -- Threaded reply
    id_pengguna_pdut        UUID            NULL,
                                            -- NULL = anonymous comment
    nm_komentator           VARCHAR(120)    NULL,
                                            -- Diisi kalau anonymous
    email_komentator        VARCHAR(120)    NULL,
                                            -- Diisi kalau anonymous (untuk gravatar / notif)
    isi                     TEXT            NOT NULL,
    status_moderasi         VARCHAR(20)     NOT NULL DEFAULT 'pending',
                                            -- 'pending' / 'approved' / 'spam' / 'rejected'
    ip_alamat               INET            NULL,
    user_agent              VARCHAR(255)    NULL,
    jumlah_like             INT             NOT NULL DEFAULT 0,
    a_pinned                BOOLEAN         NOT NULL DEFAULT FALSE,
    id_creator              UUID            NULL,
    id_updater              UUID            NULL,
    created_at              TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete             TIMESTAMP       NULL,
    CONSTRAINT chk_komentar_status
        CHECK (status_moderasi IN ('pending','approved','spam','rejected'))
);

CREATE TRIGGER trg_komentar_updated_at
    BEFORE UPDATE ON interaction.komentar
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX idx_komentar_post_status ON interaction.komentar(id_post, status_moderasi)
    WHERE soft_delete IS NULL;
CREATE INDEX idx_komentar_parent ON interaction.komentar(id_komentar_parent)
    WHERE id_komentar_parent IS NOT NULL AND soft_delete IS NULL;

COMMENT ON TABLE interaction.komentar IS 'Komentar threaded (P2 active, schema ready dari MVP)';


-- =====================================================
-- Step 12: CREATE TABLE interaction.like_post
-- =====================================================

CREATE TABLE IF NOT EXISTS interaction.like_post (
    id_like_post        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_post             UUID            NOT NULL REFERENCES blog.post(id_post) ON DELETE CASCADE,
    id_pengguna_pdut    UUID            NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_like_post UNIQUE (id_post, id_pengguna_pdut)
);

CREATE INDEX idx_like_post_post ON interaction.like_post(id_post);

COMMENT ON TABLE interaction.like_post IS 'Like/clap per post per user (P2)';


-- =====================================================
-- Step 12b: CREATE TABLE interaction.like_komentar
-- =====================================================
-- Engagement parity dengan like_post — reader bisa like comment.

CREATE TABLE IF NOT EXISTS interaction.like_komentar (
    id_like_komentar    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_komentar         UUID            NOT NULL REFERENCES interaction.komentar(id_komentar) ON DELETE CASCADE,
    id_pengguna_pdut    UUID            NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_like_komentar UNIQUE (id_komentar, id_pengguna_pdut)
);

CREATE INDEX idx_like_komentar_komentar ON interaction.like_komentar(id_komentar);

COMMENT ON TABLE interaction.like_komentar IS 'Like per komentar per user (P2)';


-- =====================================================
-- Step 13: CREATE TABLE interaction.view_post
-- =====================================================
-- Granular view tracking untuk trending. Privacy-aware (ip_hash).

CREATE TABLE IF NOT EXISTS interaction.view_post (
    id_view_post        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_post             UUID            NOT NULL REFERENCES blog.post(id_post) ON DELETE CASCADE,
    id_pengguna_pdut    UUID            NULL,
                                        -- NULL kalau guest
    ip_hash             VARCHAR(64)     NULL,
                                        -- sha256(ip + user_agent + salt) untuk dedup tanpa simpan PII
    referer             VARCHAR(500)    NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_view_post_post_created ON interaction.view_post(id_post, created_at DESC);
CREATE INDEX idx_view_post_dedup ON interaction.view_post(id_post, ip_hash, created_at)
    WHERE ip_hash IS NOT NULL;

COMMENT ON TABLE interaction.view_post IS 'View tracking granular untuk trending (retain 6 bulan via cron)';


-- =====================================================
-- Step 14: CREATE TABLE interaction.follower
-- =====================================================

CREATE TABLE IF NOT EXISTS interaction.follower (
    id_follower         UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_blog             UUID            NOT NULL REFERENCES blog.blog(id_blog),
                                        -- Yang di-follow
    id_pengguna_pdut    UUID            NOT NULL,
                                        -- Yang follow
    tgl_follow          TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_follower UNIQUE (id_blog, id_pengguna_pdut)
);

CREATE INDEX idx_follower_pengguna ON interaction.follower(id_pengguna_pdut);

COMMENT ON TABLE interaction.follower IS 'Follow blog (P2)';


-- =====================================================
-- Step 14b: CREATE TABLE interaction.bookmark_post
-- =====================================================
-- Reader bookmark post — reading list pribadi. Bukan reaksi publik.

CREATE TABLE IF NOT EXISTS interaction.bookmark_post (
    id_bookmark_post    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_post             UUID            NOT NULL REFERENCES blog.post(id_post) ON DELETE CASCADE,
    id_pengguna_pdut    UUID            NOT NULL,
    catatan             VARCHAR(280)    NULL,
                                        -- Optional private note user (kenapa simpan post ini)
    label               VARCHAR(40)     NULL,
                                        -- Optional user label untuk organize reading list
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bookmark_post UNIQUE (id_post, id_pengguna_pdut)
);

CREATE INDEX idx_bookmark_post_pengguna ON interaction.bookmark_post(id_pengguna_pdut, created_at DESC);
CREATE INDEX idx_bookmark_post_post ON interaction.bookmark_post(id_post);
CREATE INDEX idx_bookmark_post_label ON interaction.bookmark_post(id_pengguna_pdut, label) WHERE label IS NOT NULL;

COMMENT ON TABLE interaction.bookmark_post IS 'Reading list — bookmark post per user (P2)';


-- =====================================================
-- Step 14c: CREATE TABLE interaction.notifikasi
-- =====================================================
-- Notif feed: like/komentar/reply/follower. Emit lewat application-level
-- (bukan DB trigger) supaya bisa skip notif self-action & control payload.

CREATE TABLE IF NOT EXISTS interaction.notifikasi (
    id_notifikasi       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_penerima_pdut    UUID            NOT NULL,
    id_aktor_pdut       UUID            NULL,
                                        -- NULL kalau anonymous komentator
    aktor_nama          VARCHAR(120)    NULL,
                                        -- Denorm display name (anonymous → nm_komentator)
    tipe                VARCHAR(30)     NOT NULL,
                                        -- like_post | komentar_post | reply_komentar | follow_blog
    id_ref_post         UUID            NULL REFERENCES blog.post(id_post) ON DELETE CASCADE,
    id_ref_komentar     UUID            NULL,
    id_ref_blog         UUID            NULL REFERENCES blog.blog(id_blog) ON DELETE CASCADE,
    judul_ref           VARCHAR(200)    NULL,
                                        -- Denorm judul post / subdomain blog
    url_target          VARCHAR(500)    NULL,
                                        -- URL dashboard untuk click-through
    sudah_dibaca        BOOLEAN         NOT NULL DEFAULT FALSE,
    tgl_dibaca          TIMESTAMP       NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_penerima_unread
    ON interaction.notifikasi(id_penerima_pdut, sudah_dibaca, created_at DESC);
CREATE INDEX idx_notif_penerima_recent
    ON interaction.notifikasi(id_penerima_pdut, created_at DESC);

COMMENT ON TABLE interaction.notifikasi IS 'Notif feed per user (P2)';


-- =====================================================
-- Step 14d: CREATE TABLE interaction.notif_preference
-- =====================================================
-- Per-user opt-out per tipe notif. NotifService check sebelum INSERT.

CREATE TABLE IF NOT EXISTS interaction.notif_preference (
    id_pengguna_pdut    UUID            PRIMARY KEY,
    muted_tipes         TEXT[]          NOT NULL DEFAULT '{}',
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE interaction.notif_preference IS 'Per-user notif mute prefs';


-- =============================================================================
-- SCHEMA: moderation
-- Klaim subdomain, laporan post, riwayat moderasi.
-- =============================================================================

-- =====================================================
-- Step 15: CREATE TABLE moderation.klaim_subdomain
-- =====================================================
-- History request klaim + 4-layer validation hasil.

CREATE TABLE IF NOT EXISTS moderation.klaim_subdomain (
    id_klaim_subdomain      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengguna_pdut        UUID            NOT NULL,
    id_tipe_role            UUID            NOT NULL REFERENCES ref.tipe_role(id_tipe_role),
    subdomain_diminta       VARCHAR(60)     NOT NULL,
    alasan_subdomain        TEXT            NULL,
                                            -- Justification kalau borderline
    validasi_json           JSONB           NOT NULL DEFAULT '{}'::JSONB,
                                            -- Hasil 4 layer:
                                            -- {layer1_format: {pass, detail},
                                            --  layer2_reserved: {pass, matched_word?},
                                            --  layer3_unique: {pass, taken_by?, suggestions?},
                                            --  layer4_impersonation: {pass, score, matched_token?}}
    status                  VARCHAR(20)     NOT NULL DEFAULT 'pending',
                                            -- 'pending' / 'auto_approved' / 'manual_review' / 'approved' / 'rejected'
    catatan_moderator       TEXT            NULL,
    id_moderator_pdut       UUID            NULL,
    tgl_diputuskan          TIMESTAMP       NULL,
    id_creator              UUID            NULL,
    id_updater              UUID            NULL,
    created_at              TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete             TIMESTAMP       NULL,
    CONSTRAINT chk_klaim_status
        CHECK (status IN ('pending','auto_approved','manual_review','approved','rejected'))
);

CREATE TRIGGER trg_klaim_updated_at
    BEFORE UPDATE ON moderation.klaim_subdomain
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX idx_klaim_status ON moderation.klaim_subdomain(status, created_at DESC)
    WHERE status IN ('pending','manual_review') AND soft_delete IS NULL;
CREATE INDEX idx_klaim_pengguna ON moderation.klaim_subdomain(id_pengguna_pdut, created_at DESC);

COMMENT ON TABLE moderation.klaim_subdomain IS 'History klaim subdomain + 4-layer validation hasil';


-- =====================================================
-- Step 16: CREATE TABLE moderation.laporan_post
-- =====================================================

CREATE TABLE IF NOT EXISTS moderation.laporan_post (
    id_laporan_post     UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_post             UUID            NOT NULL REFERENCES blog.post(id_post),
    id_pelapor_pdut     UUID            NULL,
                                        -- NULL = anonymous report
    alasan              VARCHAR(60)     NOT NULL,
                                        -- 'spam' / 'plagiarism' / 'hate_speech' / 'misinfo' / 'copyright' / 'lainnya'
    detail              TEXT            NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'pending',
                                        -- 'pending' / 'reviewed' / 'actioned' / 'dismissed'
    tindakan            VARCHAR(60)     NULL,
                                        -- 'none' / 'hide_post' / 'suspend_blog' / 'warn_user' / 'ban_user'
    id_moderator_pdut   UUID            NULL,
    tgl_diputuskan      TIMESTAMP       NULL,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         TIMESTAMP       NULL,
    CONSTRAINT chk_laporan_status
        CHECK (status IN ('pending','reviewed','actioned','dismissed'))
);

CREATE TRIGGER trg_laporan_updated_at
    BEFORE UPDATE ON moderation.laporan_post
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX idx_laporan_status ON moderation.laporan_post(status, created_at DESC)
    WHERE status IN ('pending','reviewed') AND soft_delete IS NULL;
CREATE INDEX idx_laporan_post ON moderation.laporan_post(id_post)
    WHERE soft_delete IS NULL;

COMMENT ON TABLE moderation.laporan_post IS 'Laporan inappropriate content (P2)';


-- =============================================================================
-- SCHEMA: audit
-- Jejak audit aksi pengguna (independent log).
-- =============================================================================

-- =====================================================
-- Step 17: CREATE TABLE audit.jejak_audit
-- =====================================================

CREATE TABLE IF NOT EXISTS audit.jejak_audit (
    id_jejak_audit      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengguna_pdut    UUID            NULL,
    aksi                VARCHAR(60)     NOT NULL,
                                        -- create_post / publish_post / delete_post /
                                        -- claim_subdomain / approve_claim / suspend_blog / dst
    entitas             VARCHAR(60)     NOT NULL,
                                        -- post / blog / komentar / media / klaim / dst
    id_entitas          UUID            NULL,
    detail_json         JSONB           NOT NULL DEFAULT '{}'::JSONB,
    ip_alamat           INET            NULL,
    user_agent          VARCHAR(255)    NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_pengguna_created ON audit.jejak_audit(id_pengguna_pdut, created_at DESC);
CREATE INDEX idx_audit_entitas ON audit.jejak_audit(entitas, id_entitas);
CREATE INDEX idx_audit_aksi_created ON audit.jejak_audit(aksi, created_at DESC);

COMMENT ON TABLE audit.jejak_audit IS 'Log aksi pengguna (retain 1 tahun via cron, partition by month opsional)';


-- =============================================================================
-- TRIGGERS — Denormalized counter maintenance
-- =============================================================================

-- =====================================================
-- Trigger: blog.post → update blog.blog.jumlah_post
-- =====================================================

CREATE OR REPLACE FUNCTION fn_update_blog_jumlah_post()
RETURNS TRIGGER AS $$
DECLARE
    was_visible BOOLEAN := FALSE;  -- old row counted as published
    is_visible  BOOLEAN := FALSE;  -- new row counted as published
BEGIN
    -- "visible published" = status='published' AND soft_delete IS NULL
    IF TG_OP IN ('UPDATE','DELETE') THEN
        was_visible := (OLD.status = 'published' AND OLD.soft_delete IS NULL);
    END IF;
    IF TG_OP IN ('INSERT','UPDATE') THEN
        is_visible := (NEW.status = 'published' AND NEW.soft_delete IS NULL);
    END IF;

    -- Newly visible (INSERT published OR transition to visible-published)
    IF NOT was_visible AND is_visible THEN
        UPDATE blog.blog SET jumlah_post = jumlah_post + 1 WHERE id_blog = NEW.id_blog;
        IF NEW.id_kategori_post IS NOT NULL THEN
            UPDATE ref.kategori_post SET jumlah_post = jumlah_post + 1 WHERE id_kategori_post = NEW.id_kategori_post;
        END IF;
    END IF;

    -- No longer visible (transition away OR hard DELETE)
    IF was_visible AND NOT is_visible THEN
        UPDATE blog.blog SET jumlah_post = GREATEST(jumlah_post - 1, 0) WHERE id_blog = OLD.id_blog;
        IF OLD.id_kategori_post IS NOT NULL THEN
            UPDATE ref.kategori_post SET jumlah_post = GREATEST(jumlah_post - 1, 0) WHERE id_kategori_post = OLD.id_kategori_post;
        END IF;
    END IF;

    -- Category change while still visible-published (UPDATE only)
    IF TG_OP = 'UPDATE' AND was_visible AND is_visible
       AND OLD.id_kategori_post IS DISTINCT FROM NEW.id_kategori_post THEN
        IF OLD.id_kategori_post IS NOT NULL THEN
            UPDATE ref.kategori_post SET jumlah_post = GREATEST(jumlah_post - 1, 0) WHERE id_kategori_post = OLD.id_kategori_post;
        END IF;
        IF NEW.id_kategori_post IS NOT NULL THEN
            UPDATE ref.kategori_post SET jumlah_post = jumlah_post + 1 WHERE id_kategori_post = NEW.id_kategori_post;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_update_blog_count
    AFTER INSERT OR UPDATE OR DELETE ON blog.post
    FOR EACH ROW EXECUTE FUNCTION fn_update_blog_jumlah_post();


-- =====================================================
-- Trigger: interaction.like_post → update blog.post.jumlah_like
-- =====================================================

CREATE OR REPLACE FUNCTION fn_update_post_jumlah_like()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE blog.post SET jumlah_like = jumlah_like + 1 WHERE id_post = NEW.id_post;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE blog.post SET jumlah_like = GREATEST(jumlah_like - 1, 0) WHERE id_post = OLD.id_post;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_like_post_update_count
    AFTER INSERT OR DELETE ON interaction.like_post
    FOR EACH ROW EXECUTE FUNCTION fn_update_post_jumlah_like();


-- =====================================================
-- Trigger: interaction.komentar (status='approved') → update jumlah_komentar
-- =====================================================

CREATE OR REPLACE FUNCTION fn_update_post_jumlah_komentar()
RETURNS TRIGGER AS $$
BEGIN
    -- Hanya hitung komentar yang sudah approved DAN belum soft_delete
    IF TG_OP = 'INSERT' AND NEW.status_moderasi = 'approved' AND NEW.soft_delete IS NULL THEN
        UPDATE blog.post SET jumlah_komentar = jumlah_komentar + 1 WHERE id_post = NEW.id_post;
    ELSIF TG_OP = 'DELETE' AND OLD.status_moderasi = 'approved' AND OLD.soft_delete IS NULL THEN
        UPDATE blog.post SET jumlah_komentar = GREATEST(jumlah_komentar - 1, 0) WHERE id_post = OLD.id_post;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status_moderasi != 'approved' AND NEW.status_moderasi = 'approved' AND NEW.soft_delete IS NULL THEN
            UPDATE blog.post SET jumlah_komentar = jumlah_komentar + 1 WHERE id_post = NEW.id_post;
        ELSIF OLD.status_moderasi = 'approved' AND NEW.status_moderasi != 'approved' THEN
            UPDATE blog.post SET jumlah_komentar = GREATEST(jumlah_komentar - 1, 0) WHERE id_post = NEW.id_post;
        ELSIF OLD.soft_delete IS NULL AND NEW.soft_delete IS NOT NULL AND OLD.status_moderasi = 'approved' THEN
            UPDATE blog.post SET jumlah_komentar = GREATEST(jumlah_komentar - 1, 0) WHERE id_post = NEW.id_post;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_komentar_update_post_count
    AFTER INSERT OR UPDATE OR DELETE ON interaction.komentar
    FOR EACH ROW EXECUTE FUNCTION fn_update_post_jumlah_komentar();


-- =====================================================
-- Trigger: blog.post_tag → update ref.tag.frekuensi
-- =====================================================

CREATE OR REPLACE FUNCTION fn_update_tag_frekuensi()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE ref.tag SET frekuensi = frekuensi + 1 WHERE id_tag = NEW.id_tag;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE ref.tag SET frekuensi = GREATEST(frekuensi - 1, 0) WHERE id_tag = OLD.id_tag;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_tag_update_frekuensi
    AFTER INSERT OR DELETE ON blog.post_tag
    FOR EACH ROW EXECUTE FUNCTION fn_update_tag_frekuensi();


-- =====================================================
-- Trigger: interaction.follower → update blog.blog.jumlah_follower
-- =====================================================

CREATE OR REPLACE FUNCTION fn_update_blog_jumlah_follower()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE blog.blog SET jumlah_follower = jumlah_follower + 1 WHERE id_blog = NEW.id_blog;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE blog.blog SET jumlah_follower = GREATEST(jumlah_follower - 1, 0) WHERE id_blog = OLD.id_blog;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_follower_update_blog_count
    AFTER INSERT OR DELETE ON interaction.follower
    FOR EACH ROW EXECUTE FUNCTION fn_update_blog_jumlah_follower();


-- =====================================================
-- Post-launch additions (Sprint 11–12, Phases R–AY)
--
-- Migration scripts in /alter/ apply these incrementally to existing
-- deployments. New installs get them baked in via this fresh.sql.
-- =====================================================

SET search_path TO ref, blog, media, interaction, moderation, audit;

-- =====================================================
-- Sprint 11 Phase AA: bookmark labels
-- =====================================================

ALTER TABLE interaction.bookmark_post
    ADD COLUMN IF NOT EXISTS label VARCHAR(40);

CREATE INDEX IF NOT EXISTS idx_bookmark_post_label_set
    ON interaction.bookmark_post(id_pengguna_pdut, label)
    WHERE label IS NOT NULL;

-- =====================================================
-- Phase AM: blog.series (group posts ke ordered sequences)
-- =====================================================

CREATE TABLE IF NOT EXISTS blog.series (
    id_series       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_blog         UUID            NOT NULL REFERENCES blog.blog(id_blog),
    judul           VARCHAR(255)    NOT NULL,
    slug            VARCHAR(120)    NOT NULL,
    deskripsi       TEXT            NULL,
    cover_url       VARCHAR(500)    NULL,
    a_aktif         BOOLEAN         NOT NULL DEFAULT TRUE,
    jumlah_post     INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete     TIMESTAMP       NULL,
    CONSTRAINT uq_series_blog_slug UNIQUE (id_blog, slug)
);

CREATE INDEX IF NOT EXISTS idx_series_blog
    ON blog.series(id_blog)
    WHERE soft_delete IS NULL;

COMMENT ON TABLE blog.series IS 'Grouping posts ke sequence (Phase AM)';

CREATE TRIGGER trg_series_updated_at
    BEFORE UPDATE ON blog.series
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

ALTER TABLE blog.post
    ADD COLUMN IF NOT EXISTS id_series      UUID NULL REFERENCES blog.series(id_series) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS urutan_series  SMALLINT NULL;

CREATE INDEX IF NOT EXISTS idx_post_series
    ON blog.post(id_series, urutan_series)
    WHERE id_series IS NOT NULL AND soft_delete IS NULL;

-- Trigger keeps series.jumlah_post in sync on insert / series-change / soft-delete toggle.
CREATE OR REPLACE FUNCTION blog.fn_series_recount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.id_series IS NOT NULL THEN
            UPDATE blog.series SET jumlah_post = jumlah_post + 1 WHERE id_series = NEW.id_series;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.id_series IS NOT NULL THEN
            UPDATE blog.series SET jumlah_post = GREATEST(0, jumlah_post - 1) WHERE id_series = OLD.id_series;
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.id_series IS DISTINCT FROM NEW.id_series THEN
            IF OLD.id_series IS NOT NULL THEN
                UPDATE blog.series SET jumlah_post = GREATEST(0, jumlah_post - 1) WHERE id_series = OLD.id_series;
            END IF;
            IF NEW.id_series IS NOT NULL THEN
                UPDATE blog.series SET jumlah_post = jumlah_post + 1 WHERE id_series = NEW.id_series;
            END IF;
        END IF;
        IF OLD.soft_delete IS NULL AND NEW.soft_delete IS NOT NULL AND NEW.id_series IS NOT NULL THEN
            UPDATE blog.series SET jumlah_post = GREATEST(0, jumlah_post - 1) WHERE id_series = NEW.id_series;
        END IF;
        IF OLD.soft_delete IS NOT NULL AND NEW.soft_delete IS NULL AND NEW.id_series IS NOT NULL THEN
            UPDATE blog.series SET jumlah_post = jumlah_post + 1 WHERE id_series = NEW.id_series;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_post_series_recount ON blog.post;
CREATE TRIGGER trg_post_series_recount
    AFTER INSERT OR UPDATE OR DELETE ON blog.post
    FOR EACH ROW EXECUTE FUNCTION blog.fn_series_recount();

-- =====================================================
-- Phase AN: blog.post_co_author (multi-author per post)
-- Phase AU: + status workflow (pending/accepted/declined)
-- =====================================================

CREATE TABLE IF NOT EXISTS blog.post_co_author (
    id_post         UUID            NOT NULL REFERENCES blog.post(id_post) ON DELETE CASCADE,
    id_blog_co      UUID            NOT NULL REFERENCES blog.blog(id_blog),
    peran           VARCHAR(20)     NOT NULL DEFAULT 'co_author',
    urutan          SMALLINT        NOT NULL DEFAULT 1,
    catatan         TEXT            NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'pending',
    responded_at    TIMESTAMP       NULL,
    alasan_response TEXT            NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_post, id_blog_co),
    CONSTRAINT chk_pca_peran  CHECK (peran IN ('co_author','editor','reviewer','kontributor')),
    CONSTRAINT chk_pca_status CHECK (status IN ('pending','accepted','declined'))
);

CREATE INDEX IF NOT EXISTS idx_pca_blog_co        ON blog.post_co_author(id_blog_co);
CREATE INDEX IF NOT EXISTS idx_pca_status_pending ON blog.post_co_author(id_blog_co) WHERE status = 'pending';

COMMENT ON TABLE blog.post_co_author IS 'Multi-author per post join with accept/decline workflow (Phase AN/AU)';

-- =====================================================
-- Phase AO: moderation.banned_user
-- =====================================================

CREATE TABLE IF NOT EXISTS moderation.banned_user (
    id_ban              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengguna_pdut    UUID            NOT NULL,
    alasan              TEXT            NOT NULL,
    banned_at           TIMESTAMP       NOT NULL DEFAULT NOW(),
    banned_until        TIMESTAMP       NULL,
    id_banned_by        UUID            NOT NULL,
    catatan_internal    TEXT            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         TIMESTAMP       NULL
);

CREATE INDEX IF NOT EXISTS idx_banned_user_active
    ON moderation.banned_user(id_pengguna_pdut)
    WHERE soft_delete IS NULL;

CREATE INDEX IF NOT EXISTS idx_banned_user_created
    ON moderation.banned_user(created_at DESC)
    WHERE soft_delete IS NULL;

CREATE TRIGGER trg_banned_user_updated_at
    BEFORE UPDATE ON moderation.banned_user
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

COMMENT ON TABLE moderation.banned_user IS 'Engagement-blocked users (Phase AO)';

-- =====================================================
-- Phase AR: trending score
-- =====================================================

ALTER TABLE blog.post
    ADD COLUMN IF NOT EXISTS skor_trending     NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS skor_trending_at  TIMESTAMP      NULL;

CREATE INDEX IF NOT EXISTS idx_post_trending
    ON blog.post(skor_trending DESC, jumlah_view DESC)
    WHERE soft_delete IS NULL AND status = 'published';

-- =====================================================
-- Phase AV: interaction.reading_progress
-- =====================================================

CREATE TABLE IF NOT EXISTS interaction.reading_progress (
    id_pengguna_pdut  UUID         NOT NULL,
    id_post           UUID         NOT NULL REFERENCES blog.post(id_post) ON DELETE CASCADE,
    progress_pct      SMALLINT     NOT NULL DEFAULT 0,
    last_position_px  INT          NULL,
    completed_at      TIMESTAMP    NULL,
    last_seen_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_pengguna_pdut, id_post),
    CONSTRAINT chk_progress_pct CHECK (progress_pct BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_reading_progress_incomplete
    ON interaction.reading_progress(id_pengguna_pdut, last_seen_at DESC)
    WHERE completed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reading_progress_post
    ON interaction.reading_progress(id_post);

COMMENT ON TABLE interaction.reading_progress IS 'Per-user scroll position + Continue Reading widget (Phase AV)';

-- =====================================================
-- Phase AW: author-pin (a_unggulan_blog) + max-3 trigger
-- =====================================================

ALTER TABLE blog.post
    ADD COLUMN IF NOT EXISTS a_unggulan_blog BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_post_unggulan_blog
    ON blog.post(id_blog, tgl_terbit DESC)
    WHERE a_unggulan_blog = TRUE AND soft_delete IS NULL AND status = 'published';

CREATE OR REPLACE FUNCTION blog.fn_pin_cap_3()
RETURNS TRIGGER AS $$
DECLARE
    pinned_count INT;
BEGIN
    IF NEW.a_unggulan_blog = TRUE AND
       (TG_OP = 'INSERT' OR OLD.a_unggulan_blog = FALSE)
    THEN
        SELECT COUNT(*) INTO pinned_count
        FROM blog.post
        WHERE id_blog = NEW.id_blog
          AND a_unggulan_blog = TRUE
          AND soft_delete IS NULL
          AND id_post <> NEW.id_post;
        IF pinned_count >= 3 THEN
            RAISE EXCEPTION 'Max 3 posts dapat di-pin per blog. Unpin salah satu dulu.'
                USING ERRCODE = '23514';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_post_pin_cap ON blog.post;
CREATE TRIGGER trg_post_pin_cap
    BEFORE INSERT OR UPDATE OF a_unggulan_blog ON blog.post
    FOR EACH ROW EXECUTE FUNCTION blog.fn_pin_cap_3();

-- =====================================================
-- Phase AY: email notifications (dynamic SMTP config + outbox)
-- =====================================================

CREATE TABLE IF NOT EXISTS blog.mail_config (
    id_mail_config   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    label            VARCHAR(100)    NOT NULL,
    smtp_host        VARCHAR(200)    NOT NULL,
    smtp_port        INT             NOT NULL DEFAULT 587,
    smtp_username    VARCHAR(200)    NULL,
    smtp_password    TEXT            NULL,
    use_tls          BOOLEAN         NOT NULL DEFAULT TRUE,
    use_starttls     BOOLEAN         NOT NULL DEFAULT TRUE,
    from_address     VARCHAR(200)    NOT NULL,
    from_name        VARCHAR(120)    NOT NULL DEFAULT 'Blog Unila',
    public_url       VARCHAR(200)    NOT NULL DEFAULT 'https://blog.unila.ac.id',
    a_aktif          BOOLEAN         NOT NULL DEFAULT TRUE,
    catatan          TEXT            NULL,
    id_creator       UUID            NULL,
    id_updater       UUID            NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE blog.mail_config IS 'Admin-managed SMTP profiles (Phase AY)';

-- Singleton invariant: at most 1 active row.
CREATE UNIQUE INDEX IF NOT EXISTS uq_mail_config_active
    ON blog.mail_config((1)) WHERE a_aktif = TRUE;

CREATE TRIGGER trg_mail_config_updated_at
    BEFORE UPDATE ON blog.mail_config
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

ALTER TABLE blog.blog
    ADD COLUMN IF NOT EXISTS email_pengguna VARCHAR(200) NULL;

COMMENT ON COLUMN blog.blog.email_pengguna IS 'Captured opportunistically from JWT (Phase AY) — required for email notif delivery';

CREATE TABLE IF NOT EXISTS interaction.email_outbox (
    id_email          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    id_penerima_pdut  UUID         NOT NULL,
    id_notifikasi     UUID         NULL REFERENCES interaction.notifikasi(id_notifikasi) ON DELETE SET NULL,
    recipient_email   VARCHAR(200) NOT NULL,
    subject           VARCHAR(255) NOT NULL,
    body_html         TEXT         NOT NULL,
    body_text         TEXT         NULL,
    tipe              VARCHAR(40)  NOT NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'pending',
    attempts          INT          NOT NULL DEFAULT 0,
    next_attempt_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    sent_at           TIMESTAMP    NULL,
    last_error        TEXT         NULL,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_email_status CHECK (status IN ('pending','sending','sent','failed'))
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_due
    ON interaction.email_outbox(next_attempt_at)
    WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_email_outbox_status_created
    ON interaction.email_outbox(status, created_at DESC);

COMMENT ON TABLE interaction.email_outbox IS 'Outbound email queue with retry tracking (Phase AY)';


-- =====================================================
-- DONE — Schema blog_unila v1.0 + Sprint 11–12 additions ready
-- Next: jalankan 02-blog_unila_v1.0_seed.sql untuk seed data referensi.
-- =====================================================
