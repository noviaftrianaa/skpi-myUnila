-- ============================================================================
-- DROP EMPTY TABLES — schema siakadu
-- Tanggal: 7 Mei 2026
--
-- 36 tabel kosong (0 row) di-drop untuk membersihkan schema siakadu.
-- 16 tabel berisi data TIDAK disentuh.
--
-- Tabel yang TETAP (berisi data):
--   mahasiswa (150.464), nilai_transkrip (1.019.773), kelas_kuliah (169.451),
--   kuliah_mhs (70.573), mapping_kurikulum (44.416), mapping_matkul (42.360),
--   matkul (7.761), keluarga_mhs (958), nilai_smt_mhs (916), ref_unit (269),
--   pimpinan_unit (257), mapping_unit (152), semester (81),
--   matkul_kurikulum (32), jenjang_pendidikan (28), status_mahasiswa (9)
-- ============================================================================

USE pdut_staging;
GO

BEGIN TRANSACTION;
GO

-- ============================================================================
-- STEP 1: Drop FK constraints dari tabel kosong
-- (20 constraint, semua dari tabel yang akan di-drop)
-- ============================================================================

-- Child tables referencing akt_mhs
ALTER TABLE siakadu.anggota_akt_mhs DROP CONSTRAINT fk_anggota_akt_mhs_akt_mhs;
ALTER TABLE siakadu.bimbing_mhs      DROP CONSTRAINT fk_bimbing_mhs_akt_mhs;
ALTER TABLE siakadu.uji_mhs          DROP CONSTRAINT fk_uji_mhs_akt_mhs;

-- Child tables referencing sdm
ALTER TABLE siakadu.bimbing_mhs      DROP CONSTRAINT fk_bimbing_mhs_sdm;
ALTER TABLE siakadu.kehadiran_sdm    DROP CONSTRAINT fk_kehadiran_sdm_sdm;
ALTER TABLE siakadu.nilai_tes        DROP CONSTRAINT fk_nilai_tes_sdm;
ALTER TABLE siakadu.reg_ptk          DROP CONSTRAINT fk_reg_ptk_sdm;
ALTER TABLE siakadu.uji_mhs          DROP CONSTRAINT fk_uji_mhs_sdm;

-- Child tables referencing sms
ALTER TABLE siakadu.akt_mhs          DROP CONSTRAINT fk_akt_mhs_sms;
ALTER TABLE siakadu.reg_ptk          DROP CONSTRAINT fk_reg_ptk_sms;

-- Child tables referencing populated tables (semester, jenjang_pendidikan, kelas_kuliah)
ALTER TABLE siakadu.akt_mhs          DROP CONSTRAINT fk_akt_mhs_semester;
ALTER TABLE siakadu.jadwal_kelas     DROP CONSTRAINT fk_jadwal_kelas_semester;
ALTER TABLE siakadu.jadwal_kelas     DROP CONSTRAINT fk_jadwal_kelas_kelas_kuliah;
ALTER TABLE siakadu.spp_mhs          DROP CONSTRAINT fk_spp_mhs_semester;
ALTER TABLE siakadu.sms              DROP CONSTRAINT fk_sms_jenjang_pendidikan;
ALTER TABLE siakadu.daftar_ukt       DROP CONSTRAINT fk_daftar_ukt_jenjang_pendidikan;
ALTER TABLE siakadu.kehadiran_mhs    DROP CONSTRAINT fk_kehadiran_mhs_kelas_kuliah;

-- akt_ajar_dosen references
ALTER TABLE siakadu.akt_ajar_dosen   DROP CONSTRAINT fk_akt_ajar_dosen_reg_ptk;
ALTER TABLE siakadu.akt_ajar_dosen   DROP CONSTRAINT fk_akt_ajar_dosen_kelas_kuliah;

-- wisuda_mahasiswa references
ALTER TABLE siakadu.wisuda_mahasiswa  DROP CONSTRAINT fk_wisuda_mahasiswa_periode;
GO

-- ============================================================================
-- STEP 2: Drop 36 tabel kosong
-- ============================================================================

-- Grup 1: Aktivitas mahasiswa (akt_mhs dan turunannya)
DROP TABLE siakadu.anggota_akt_mhs;
DROP TABLE siakadu.bimbing_mhs;
DROP TABLE siakadu.uji_mhs;
DROP TABLE siakadu.akt_mhs;
DROP TABLE siakadu.jenis_akt_mhs;

-- Grup 2: SDM / dosen
DROP TABLE siakadu.akt_ajar_dosen;
DROP TABLE siakadu.kehadiran_sdm;
DROP TABLE siakadu.kinerja_dosen;
DROP TABLE siakadu.nilai_tes;
DROP TABLE siakadu.bimbing_dosen;
DROP TABLE siakadu.reg_ptk;
DROP TABLE siakadu.sdm;
DROP TABLE siakadu.gelar_akademik;

-- Grup 3: Keuangan / UKT
DROP TABLE siakadu.spp_mhs;
DROP TABLE siakadu.daftar_ukt;
DROP TABLE siakadu.kelas_ukt;

-- Grup 4: Jadwal & kehadiran
DROP TABLE siakadu.jadwal_kelas;
DROP TABLE siakadu.kehadiran_mhs;
DROP TABLE siakadu.substansi_kuliah;

-- Grup 5: Wisuda
DROP TABLE siakadu.wisuda_mahasiswa;
DROP TABLE siakadu.periode_wisuda;

-- Grup 6: Prodi & referensi
DROP TABLE siakadu.sms;
DROP TABLE siakadu.jenis_sms;
DROP TABLE siakadu.bentuk_pendidikan;
DROP TABLE siakadu.basis_evaluasi;
DROP TABLE siakadu.jenis_evaluasi;
DROP TABLE siakadu.re_mk;

-- Grup 7: Referensi umum
DROP TABLE siakadu.ref_agama;
DROP TABLE siakadu.ref_jalur_daftar;
DROP TABLE siakadu.ref_jenis_mk;
DROP TABLE siakadu.ref_status_mhs;
DROP TABLE siakadu.ref_tahun_ajaran;

-- Grup 8: Mapping (kosong)
DROP TABLE siakadu.mapping_jadwal;
DROP TABLE siakadu.mapping_kelas;
DROP TABLE siakadu.mapping_pegawai;

-- Grup 9: Log
DROP TABLE siakadu.sync_log;
GO

COMMIT;
GO

-- ============================================================================
-- Verifikasi: harus tersisa 16 tabel
-- ============================================================================
SELECT TABLE_NAME,
       (SELECT COUNT(*) FROM siakadu.mahasiswa WHERE TABLE_NAME = 'mahasiswa') AS sample_check
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'siakadu' AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO
