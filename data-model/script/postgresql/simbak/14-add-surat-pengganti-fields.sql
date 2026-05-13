-- ============================================================
-- ADD: kolom nomor surat pendukung untuk SK-PKKMB & SK-KTM
-- Date: 2026-05-13
-- ============================================================
-- Untuk layanan pengganti dokumen hilang (PKKMB sertifikat, KTM):
--   - Nomor & tanggal Surat Kehilangan dari Kepolisian
--   - Nomor & tanggal Surat Keterangan Mahasiswa Aktif dari Fakultas

ALTER TABLE layanan.pengajuan
    ADD COLUMN IF NOT EXISTS nomor_surat_polisi    VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS tgl_surat_polisi      DATE         NULL,
    ADD COLUMN IF NOT EXISTS nomor_surat_ket_aktif VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS tgl_surat_ket_aktif   DATE         NULL;

COMMENT ON COLUMN layanan.pengajuan.nomor_surat_polisi    IS 'Nomor Surat Kehilangan dari Kepolisian (untuk SK-PKKMB, SK-KTM)';
COMMENT ON COLUMN layanan.pengajuan.tgl_surat_polisi      IS 'Tanggal Surat Kehilangan dari Kepolisian';
COMMENT ON COLUMN layanan.pengajuan.nomor_surat_ket_aktif IS 'Nomor Surat Keterangan Mahasiswa Aktif dari Fakultas';
COMMENT ON COLUMN layanan.pengajuan.tgl_surat_ket_aktif   IS 'Tanggal Surat Keterangan Mahasiswa Aktif';

GRANT ALL PRIVILEGES ON TABLE layanan.pengajuan TO myunila_bak;
