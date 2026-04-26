-- =====================================================
-- ALTER Script: KTW (Kelulusan Tepat Waktu) Exclusion
-- Date: 2026-04-25
-- Description:
--   Tabel untuk simpan daftar jalur pendaftaran yang
--   di-exclude dari perhitungan KTW di monitoring.
--   Contoh: Pindahan/Transfer, RPL, Mahasiswa Asing — masa studi
--   mereka tidak fair dibandingkan jalur reguler.
-- =====================================================

CREATE TABLE IF NOT EXISTS ref.ktw_exclude_jalur (
    id_exclude          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    jalur_pendaftaran   VARCHAR(200)    NOT NULL UNIQUE,
                                        -- nama jalur exact match dengan siakadu.mahasiswa.jalur_pendaftaran
    deskripsi           TEXT            NULL,
                                        -- alasan exclude (untuk reference)
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.ktw_exclude_jalur IS 'Daftar jalur pendaftaran yang di-exclude dari perhitungan Kelulusan Tepat Waktu (KTW)';
COMMENT ON COLUMN ref.ktw_exclude_jalur.jalur_pendaftaran IS 'Match exact ke siakadu.mahasiswa.jalur_pendaftaran';

-- Seed default exclusions
INSERT INTO ref.ktw_exclude_jalur (jalur_pendaftaran, deskripsi) VALUES
    ('Pindahan/Transfer', 'Mahasiswa transfer dari PT lain, masa studi awal tidak dihitung di Unila'),
    ('Mahasiswa Asing', 'Mahasiswa internasional, kurikulum dan masa studi mungkin berbeda'),
    ('Permata Sakti/Pertukaran Mahasiswa', 'Program pertukaran, tidak mengambil seluruh kurikulum di Unila'),
    ('RPL (Rekognisi Pembelajaran Lampau)', 'Mahasiswa RPL dengan pengakuan SKS, masa studi lebih pendek dari reguler'),
    ('Studi Lanjut (D3 ke S1)', 'Mahasiswa transfer D3 ke S1, masa studi tidak fair dibanding S1 reguler')
ON CONFLICT (jalur_pendaftaran) DO NOTHING;

-- Grant ke user simbak
GRANT ALL PRIVILEGES ON ref.ktw_exclude_jalur TO myunila_bak;
