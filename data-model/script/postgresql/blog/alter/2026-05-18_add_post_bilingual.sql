-- Migration: blog.post bilingual support (Sprint 13 Phase BD)
-- Pair-link approach: dua post terpisah (versi ID + versi EN) di-link via
-- id_pair_post. Setiap post tetap punya slug, isi, komentar sendiri.
--
-- Alasan pair-link vs embed:
--   - Embed (judul_en, konten_en di tabel post): rusak untuk SEO (1 URL = 2
--     bahasa), bloat row, awkward kalau salah satu bahasa di-update doang
--   - Pair-link (2 row terpisah): SEO clean (1 URL/bahasa), independen tapi
--     navigable via hreflang + language toggle UI
--
-- Constraint:
--   - bahasa ENUM CHECK ('id','en') — extensible kalau nanti perlu tambah
--   - id_pair_post nullable (post tunggal-bahasa tetap OK)
--   - Self-referential FK ke blog.post → kalau di-delete, pasangan otomatis
--     ke-null (ON DELETE SET NULL)
--   - Soft constraint: pair pasti beda bahasa (di-enforce di handler, bukan
--     DB, supaya migration data lama lebih fleksibel)

SET search_path TO ref, blog, media, interaction, moderation, audit;

-- Note: kolom 'bahasa' sudah ada di blog.post (VARCHAR(10), default 'id')
-- sejak versi awal — hanya tambah id_pair_post di sini.
ALTER TABLE blog.post
    ADD COLUMN IF NOT EXISTS id_pair_post UUID NULL
        REFERENCES blog.post(id_post) ON DELETE SET NULL;

-- Drop old check kalau pernah dibuat di re-run, lalu add fresh check.
ALTER TABLE blog.post DROP CONSTRAINT IF EXISTS chk_post_bahasa;
ALTER TABLE blog.post ADD CONSTRAINT chk_post_bahasa CHECK (bahasa IN ('id','en'));

-- Hot path: fetch pair when rendering language toggle. Partial index on rows
-- yang sudah punya pasangan supaya kecil.
CREATE INDEX IF NOT EXISTS idx_post_pair
    ON blog.post(id_pair_post)
    WHERE id_pair_post IS NOT NULL AND soft_delete IS NULL;

-- Public list filter: by bahasa (most apex queries default to 'id').
CREATE INDEX IF NOT EXISTS idx_post_bahasa_status
    ON blog.post(bahasa, status)
    WHERE soft_delete IS NULL;

COMMENT ON COLUMN blog.post.bahasa IS 'Bahasa konten (Phase BD): id|en. Default id.';
COMMENT ON COLUMN blog.post.id_pair_post IS 'Link ke versi bahasa lain (Phase BD). NULL = single-language.';
