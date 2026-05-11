-- 09: Tambah nomor_dokumen dan tgl_dokumen ke dokumen_pengajuan
-- Digunakan untuk menyimpan nomor dan tanggal surat (misal: Surat Pengantar Dekan)

ALTER TABLE layanan.dokumen_pengajuan
  ADD COLUMN IF NOT EXISTS nomor_dokumen VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS tgl_dokumen DATE NULL;

COMMENT ON COLUMN layanan.dokumen_pengajuan.nomor_dokumen IS 'Nomor surat/dokumen (misal: nomor Surat Pengantar Dekan)';
COMMENT ON COLUMN layanan.dokumen_pengajuan.tgl_dokumen IS 'Tanggal surat/dokumen';
