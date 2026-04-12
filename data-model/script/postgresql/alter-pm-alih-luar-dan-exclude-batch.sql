-- =====================================================
-- ALTER Script: PM-ALIH Luar Unila + Alasan Exclude Batch
-- Date: 2026-04-12
-- Description:
--   1. Tambah flag a_dari_luar dan nm_pt_asal di layanan.pengajuan
--   2. Ubah id_pemohon, id_mahasiswa, nim menjadi nullable
--   3. Tambah nm_pt_asal dan akreditasi_prodi_asal di layanan.data_pemohon
--   4. Tambah path_dokumen_exclude di batch.verifikasi_batch
-- =====================================================

-- =====================================================
-- 1. layanan.pengajuan — flag + data PT asal
-- =====================================================

-- Flag penanda pengajuan dari luar Unila
ALTER TABLE layanan.pengajuan
  ADD COLUMN IF NOT EXISTS a_dari_luar BOOLEAN NOT NULL DEFAULT FALSE;

-- Nama PT asal (untuk kasus luar Unila)
ALTER TABLE layanan.pengajuan
  ADD COLUMN IF NOT EXISTS nm_pt_asal VARCHAR(200) NULL;

-- id_pemohon nullable (pemohon luar tidak ada di man_akses.pengguna)
ALTER TABLE layanan.pengajuan
  ALTER COLUMN id_pemohon DROP NOT NULL;

COMMENT ON COLUMN layanan.pengajuan.a_dari_luar
  IS 'TRUE jika pengajuan alih program dari luar Unila (pemohon tidak punya SSO)';
COMMENT ON COLUMN layanan.pengajuan.nm_pt_asal
  IS 'Nama perguruan tinggi asal (khusus alih program dari luar Unila)';


-- =====================================================
-- 2. layanan.data_pemohon — data manual untuk pemohon luar
-- =====================================================

-- id_mahasiswa nullable (pemohon luar belum terdaftar di PDUT)
ALTER TABLE layanan.data_pemohon
  ALTER COLUMN id_mahasiswa DROP NOT NULL;

-- nim nullable (NIM asal dari PT luar, format berbeda)
ALTER TABLE layanan.data_pemohon
  ALTER COLUMN nim DROP NOT NULL;

-- Nama PT asal
ALTER TABLE layanan.data_pemohon
  ADD COLUMN IF NOT EXISTS nm_pt_asal VARCHAR(200) NULL;

-- Akreditasi prodi asal
ALTER TABLE layanan.data_pemohon
  ADD COLUMN IF NOT EXISTS akreditasi_prodi_asal VARCHAR(50) NULL;

COMMENT ON COLUMN layanan.data_pemohon.nm_pt_asal
  IS 'Nama PT asal pemohon (khusus alih program dari luar Unila)';
COMMENT ON COLUMN layanan.data_pemohon.akreditasi_prodi_asal
  IS 'Akreditasi prodi asal: A, B, Unggul, Baik Sekali, Baik, dll';


-- =====================================================
-- 3. batch.verifikasi_batch — dokumen pendukung exclude
-- =====================================================

ALTER TABLE batch.verifikasi_batch
  ADD COLUMN IF NOT EXISTS path_dokumen_exclude VARCHAR(1000) NULL;

COMMENT ON COLUMN batch.verifikasi_batch.path_dokumen_exclude
  IS 'Path file dokumen pendukung exclude (misal: surat keterangan meninggal dunia dari RS/Aparat Desa)';
