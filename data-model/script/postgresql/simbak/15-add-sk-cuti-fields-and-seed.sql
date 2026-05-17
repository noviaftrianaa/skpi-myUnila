-- ============================================================
-- ADD: SK Cuti untuk layanan SK-HERREG
-- Date: 2026-05-13
-- ============================================================
-- 1. Kolom nomor & tanggal SK Cuti di layanan.pengajuan
-- 2. Persyaratan dokumen DOC-SK-CUTI untuk SK-HERREG (upload PDF)

ALTER TABLE layanan.pengajuan
    ADD COLUMN IF NOT EXISTS nomor_sk_cuti VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS tgl_sk_cuti   DATE         NULL;

COMMENT ON COLUMN layanan.pengajuan.nomor_sk_cuti IS 'Nomor SK Cuti Akademik (untuk SK-HERREG dari mahasiswa yang habis cuti)';
COMMENT ON COLUMN layanan.pengajuan.tgl_sk_cuti   IS 'Tanggal SK Cuti Akademik';

-- Tambah persyaratan dokumen SK Cuti untuk SK-HERREG
INSERT INTO ref.persyaratan_layanan (id_jenis_layanan, kode_dokumen, nm_dokumen, a_wajib, urutan, tipe_file, max_size_mb)
SELECT id_jenis_layanan, 'DOC-SK-CUTI', 'SK Cuti Akademik', true, 2, 'application/pdf', 5
FROM ref.jenis_layanan
WHERE kode_layanan = 'SK-HERREG'
  AND NOT EXISTS (
    SELECT 1 FROM ref.persyaratan_layanan p
    WHERE p.id_jenis_layanan = ref.jenis_layanan.id_jenis_layanan
      AND p.kode_dokumen = 'DOC-SK-CUTI'
  );

GRANT ALL PRIVILEGES ON TABLE layanan.pengajuan TO myunila_bak;
GRANT ALL PRIVILEGES ON TABLE ref.persyaratan_layanan TO myunila_bak;
