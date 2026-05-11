-- ============================================================
-- 08: Tambah ref.kategori_cuti + kolom kategori_cuti di pengajuan
-- ============================================================

-- 1. Tabel referensi kategori cuti
CREATE TABLE IF NOT EXISTS ref.kategori_cuti (
    id_kategori_cuti  VARCHAR(30)  PRIMARY KEY,
    nm_kategori       VARCHAR(100) NOT NULL,
    deskripsi         TEXT         NULL,
    a_aktif           BOOLEAN      DEFAULT TRUE,
    urutan            INT          DEFAULT 1,
    created_at        TIMESTAMP    DEFAULT NOW(),
    updated_at        TIMESTAMP    DEFAULT NOW()
);

-- 2. Seed data awal
INSERT INTO ref.kategori_cuti (id_kategori_cuti, nm_kategori, deskripsi, urutan) VALUES
    ('terencana',  'Cuti Terencana',                       'Cuti akademik yang diajukan sebelum semester dimulai', 1),
    ('kecelakaan', 'Cuti Tidak Terencana — Kecelakaan',    'Cuti karena kecelakaan yang menghalangi kegiatan akademik', 2),
    ('sakit',      'Cuti Tidak Terencana — Sakit',         'Cuti karena sakit berkepanjangan yang memerlukan perawatan', 3),
    ('melahirkan', 'Cuti Tidak Terencana — Melahirkan',    'Cuti karena proses persalinan/melahirkan', 4)
ON CONFLICT (id_kategori_cuti) DO NOTHING;

-- 3. Tambah kolom kategori_cuti di tabel pengajuan
ALTER TABLE layanan.pengajuan
    ADD COLUMN IF NOT EXISTS kategori_cuti VARCHAR(30) NULL;

-- 4. FK ke ref.kategori_cuti
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_pengajuan_kategori_cuti'
    ) THEN
        ALTER TABLE layanan.pengajuan
            ADD CONSTRAINT fk_pengajuan_kategori_cuti
            FOREIGN KEY (kategori_cuti) REFERENCES ref.kategori_cuti(id_kategori_cuti);
    END IF;
END $$;

COMMENT ON COLUMN layanan.pengajuan.kategori_cuti IS 'Kategori cuti: terencana (default), kecelakaan, sakit, melahirkan';
