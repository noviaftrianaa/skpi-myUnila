-- ============================================================
-- ADD: kategori pengunduran diri (PM-UNDUR)
-- Date: 2026-05-12
-- ============================================================
-- 1. Tabel ref.kategori_undur (mirror dari ref.kategori_cuti)
-- 2. Kolom kategori_undur + nm_pt_tujuan di layanan.pengajuan
-- 3. Seed 2 kategori awal

CREATE TABLE IF NOT EXISTS ref.kategori_undur (
    id_kategori_undur VARCHAR(30)  PRIMARY KEY,
    nm_kategori       VARCHAR(100) NOT NULL,
    deskripsi         TEXT         NULL,
    a_aktif           BOOLEAN      DEFAULT true,
    urutan            INTEGER      DEFAULT 1,
    created_at        TIMESTAMP    DEFAULT NOW(),
    updated_at        TIMESTAMP    DEFAULT NOW()
);

COMMENT ON TABLE ref.kategori_undur IS 'Kategori pengunduran diri: undur_diri (permanen) atau pindah_pt (pindah ke universitas lain)';

ALTER TABLE layanan.pengajuan
    ADD COLUMN IF NOT EXISTS kategori_undur VARCHAR(30)  NULL,
    ADD COLUMN IF NOT EXISTS nm_pt_tujuan   VARCHAR(200) NULL;

COMMENT ON COLUMN layanan.pengajuan.kategori_undur IS 'FK ke ref.kategori_undur, untuk PM-UNDUR saja';
COMMENT ON COLUMN layanan.pengajuan.nm_pt_tujuan   IS 'Nama PT tujuan pindah (untuk kategori pindah_pt)';

-- Constraint FK (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_pengajuan_kategori_undur'
    ) THEN
        ALTER TABLE layanan.pengajuan
            ADD CONSTRAINT fk_pengajuan_kategori_undur
            FOREIGN KEY (kategori_undur) REFERENCES ref.kategori_undur(id_kategori_undur);
    END IF;
END $$;

-- Seed
INSERT INTO ref.kategori_undur (id_kategori_undur, nm_kategori, deskripsi, urutan)
VALUES
    ('undur_diri', 'Pengunduran Diri', 'Mahasiswa berhenti dari Unila secara permanen', 1),
    ('pindah_pt',  'Pindah ke Universitas Lain', 'Mahasiswa pindah/transfer ke perguruan tinggi lain', 2)
ON CONFLICT (id_kategori_undur) DO NOTHING;
