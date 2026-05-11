-- Tambah kolom semester akhir cuti pada tabel pengajuan
-- Dihitung otomatis dari id_smt_mulai_cuti + jumlah_semester_cuti
ALTER TABLE layanan.pengajuan ADD COLUMN IF NOT EXISTS id_smt_akhir_cuti VARCHAR(10) NULL;
