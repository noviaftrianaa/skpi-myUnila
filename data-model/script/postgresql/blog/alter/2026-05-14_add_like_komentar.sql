-- Migration: interaction.like_komentar (Sprint 11 Phase P)
-- Engagement parity dengan like_post — reader bisa like comment.
-- Apply: psql -U postgres -d blog_unila -f 2026-05-14_add_like_komentar.sql

SET search_path TO ref, blog, media, interaction, moderation, audit;

CREATE TABLE IF NOT EXISTS interaction.like_komentar (
    id_like_komentar    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_komentar         UUID            NOT NULL REFERENCES interaction.komentar(id_komentar) ON DELETE CASCADE,
    id_pengguna_pdut    UUID            NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_like_komentar UNIQUE (id_komentar, id_pengguna_pdut)
);

CREATE INDEX IF NOT EXISTS idx_like_komentar_komentar
    ON interaction.like_komentar(id_komentar);

COMMENT ON TABLE interaction.like_komentar IS 'Like per komentar per user (P2 engagement parity)';

-- Trigger: increment/decrement komentar.jumlah_like otomatis on INSERT/DELETE.
CREATE OR REPLACE FUNCTION interaction.fn_update_komentar_jumlah_like()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE interaction.komentar
        SET jumlah_like = jumlah_like + 1
        WHERE id_komentar = NEW.id_komentar;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE interaction.komentar
        SET jumlah_like = GREATEST(jumlah_like - 1, 0)
        WHERE id_komentar = OLD.id_komentar;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_like_komentar_update_count ON interaction.like_komentar;
CREATE TRIGGER trg_like_komentar_update_count
    AFTER INSERT OR DELETE ON interaction.like_komentar
    FOR EACH ROW EXECUTE FUNCTION interaction.fn_update_komentar_jumlah_like();
