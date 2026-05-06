-- =====================================================
-- 07-alter-batch-add-fakultas.sql
-- Tanggal: 2026-05-06
-- Deskripsi: Tambah kolom id_fakultas dan nm_fakultas
--            pada batch_penetapan untuk mendukung
--            filtering per fakultas (admin_fakultas hanya
--            melihat batch milik fakultasnya)
-- =====================================================

ALTER TABLE batch.batch_penetapan
    ADD COLUMN IF NOT EXISTS id_fakultas UUID NULL,
    ADD COLUMN IF NOT EXISTS nm_fakultas VARCHAR(200) NULL;

COMMENT ON COLUMN batch.batch_penetapan.id_fakultas IS 'UUID fakultas dari pdrd.sms (id_fak_unila) — wajib diisi saat create';
COMMENT ON COLUMN batch.batch_penetapan.nm_fakultas IS 'Nama fakultas (snapshot dari pdrd.sms.nm_lemb saat batch dibuat)';

-- Index untuk filter batch berdasarkan fakultas
CREATE INDEX IF NOT EXISTS idx_batch_penetapan_fakultas
    ON batch.batch_penetapan (id_fakultas)
    WHERE soft_delete = false;
