-- ============================================================
-- SIAKADU Schema Deploy — ALTER Script
-- Database: SQL Server 2019 (pdut)
-- 
-- PURPOSE:
-- Deploy schema siakadu.* ke SQL Server production/staging.
-- Script ini IDEMPOTENT — bisa dijalankan berulang kali.
--
-- PREREQUISITE:
-- 1. Jalankan siakadu_schema_v1.0_fresh.sql terlebih dahulu
-- 2. Pastikan schema 'siakadu' sudah ada
--
-- POST-DEPLOY:
-- 1. Migrate data dari pdrd.* → siakadu.* (lihat section MIGRATE di bawah)
-- 2. Update backend endpoint dari pdrd.* → siakadu.*
-- 3. Update frontend menu (unhide pegawai + wisuda)
-- 4. Test semua 9 halaman integrator
--
-- Author: MyUnila Development Team
-- Date: 2026-03-27
-- ============================================================

USE pdut;
GO

-- ============================================================
-- STEP 1: Create schema if not exists
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'siakadu')
BEGIN
    EXEC('CREATE SCHEMA siakadu');
    PRINT 'Created schema: siakadu';
END
GO

-- ============================================================
-- STEP 2: Deploy tables from siakadu_schema_v1.0_fresh.sql
-- Run that script first, then come back here for migration.
-- ============================================================
-- Verify tables exist:
SELECT TABLE_NAME, 
       (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS c WHERE c.TABLE_SCHEMA = t.TABLE_SCHEMA AND c.TABLE_NAME = t.TABLE_NAME) AS column_count
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_SCHEMA = 'siakadu'
ORDER BY TABLE_NAME;
GO

-- ============================================================
-- STEP 3: MIGRATE DATA from pdrd.* → siakadu.*
-- ============================================================
-- NOTE: Run these AFTER schema is deployed and verified.
-- Each INSERT uses IF NOT EXISTS to be idempotent.

-- 3a. Referensi — semester
PRINT '--- Migrating semester ---';
INSERT INTO siakadu.semester (id_smt, nm_smt, smt, id_thn_ajaran, tgl_mulai, tgl_selesai, a_periode_aktif, create_date, last_update, soft_delete, last_sync)
SELECT id_smt, nm_smt, smt, id_thn_ajaran, tgl_mulai, tgl_selesai, a_periode_aktif, create_date, last_update, soft_delete, last_sync
FROM pdrd.semester s
WHERE NOT EXISTS (SELECT 1 FROM siakadu.semester WHERE id_smt = s.id_smt);
GO

-- 3b. SDM (Dosen/Tendik)
PRINT '--- Migrating sdm ---';
INSERT INTO siakadu.sdm (id_sdm, nm_sdm, jk, tmpt_lahir, tgl_lahir, nik, niy_nigk, nuptk, nidn, nsdmi, nip, email, no_hp, id_jns_sdm, id_stat_aktif, id_agama, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
SELECT id_sdm, nm_sdm, jk, tmpt_lahir, tgl_lahir, nik, niy_nigk, nuptk, nidn, nsdmi, nip, email, no_hp, id_jns_sdm, id_stat_aktif, id_agama, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
FROM pdrd.sdm s
WHERE NOT EXISTS (SELECT 1 FROM siakadu.sdm WHERE id_sdm = s.id_sdm);
GO

-- 3c. Peserta Didik (Mahasiswa)
PRINT '--- Migrating peserta_didik ---';
INSERT INTO siakadu.peserta_didik (id_pd, nipd, nm_pd, jk, tmpt_lahir, tgl_lahir, nik, jln, rt, rw, nm_dsn, ds_kel, kode_pos, id_agama, id_wil, no_hp, email, kewarganegaraan, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
SELECT id_pd, nipd, nm_pd, jk, tmpt_lahir, tgl_lahir, nik, jln, rt, rw, nm_dsn, ds_kel, kode_pos, id_agama, id_wil, no_hp, email, kewarganegaraan, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
FROM pdrd.peserta_didik s
WHERE NOT EXISTS (SELECT 1 FROM siakadu.peserta_didik WHERE id_pd = s.id_pd);
GO

-- 3d. SMS (Program Studi)
PRINT '--- Migrating sms ---';
INSERT INTO siakadu.sms (id_sms, nm_lemb, id_sp, id_jenj_didik, id_jns_sms, id_induk_sms, id_bentuk_pend, kode_prodi, create_date, last_update, soft_delete, last_sync)
SELECT id_sms, nm_lemb, id_sp, id_jenj_didik, id_jns_sms, id_induk_sms, id_bentuk_pend, kode_prodi, create_date, last_update, soft_delete, last_sync
FROM pdrd.sms s
WHERE NOT EXISTS (SELECT 1 FROM siakadu.sms WHERE id_sms = s.id_sms);
GO

-- 3e. Reg PTK (Registrasi Dosen)
PRINT '--- Migrating reg_ptk ---';
INSERT INTO siakadu.reg_ptk (id_reg_ptk, id_sdm, id_sms, id_jns_keluar, create_date, last_update, soft_delete, last_sync)
SELECT id_reg_ptk, id_sdm, id_sms, id_jns_keluar, create_date, last_update, soft_delete, last_sync
FROM pdrd.reg_ptk s
WHERE NOT EXISTS (SELECT 1 FROM siakadu.reg_ptk WHERE id_reg_ptk = s.id_reg_ptk);
GO

-- 3f. Reg PD (Registrasi Mahasiswa)
PRINT '--- Migrating reg_pd ---';
INSERT INTO siakadu.reg_pd (id_reg_pd, id_pd, id_sms, nipd, id_smt, mulai_smt, id_jns_daftar, id_jalur_daftar, tgl_masuk_sp, id_jns_keluar, tgl_keluar, id_pt_asal, id_prodi_asal, sks_diakui, ipk, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
SELECT id_reg_pd, id_pd, id_sms, nipd, id_smt, mulai_smt, id_jns_daftar, id_jalur_daftar, tgl_masuk_sp, id_jns_keluar, tgl_keluar, id_pt_asal, id_prodi_asal, sks_diakui, ipk, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
FROM pdrd.reg_pd s
WHERE NOT EXISTS (SELECT 1 FROM siakadu.reg_pd WHERE id_reg_pd = s.id_reg_pd);
GO

-- 3g. Mata Kuliah
PRINT '--- Migrating matkul ---';
INSERT INTO siakadu.matkul (id_mk, kode_mk, nm_mk, sks_mk, id_jns_mk, id_kel_mk, sks_tm, sks_prak, sks_prak_lap, sks_sim, create_date, last_update, soft_delete, last_sync)
SELECT id_mk, kode_mk, nm_mk, sks_mk, id_jns_mk, id_kel_mk, sks_tm, sks_prak, sks_prak_lap, sks_sim, create_date, last_update, soft_delete, last_sync
FROM pdrd.matkul s
WHERE NOT EXISTS (SELECT 1 FROM siakadu.matkul WHERE id_mk = s.id_mk);
GO

-- 3h. Kelas Kuliah
PRINT '--- Migrating kelas_kuliah ---';
INSERT INTO siakadu.kelas_kuliah (id_kls, id_sms, id_smt, id_mk, nm_kls, sks_mk, create_date, last_update, soft_delete, last_sync)
SELECT id_kls, id_sms, id_smt, id_mk, nm_kls, sks_mk, create_date, last_update, soft_delete, last_sync
FROM pdrd.kelas_kuliah s
WHERE NOT EXISTS (SELECT 1 FROM siakadu.kelas_kuliah WHERE id_kls = s.id_kls);
GO

-- 3i. Nilai Semester
PRINT '--- Migrating nilai_smt_mhs ---';
INSERT INTO siakadu.nilai_smt_mhs (id_nilai_smt, id_reg_pd, id_smt, ips, ipk, sks_smt, sks_total, create_date, last_update, soft_delete, last_sync)
SELECT id_nilai_smt, id_reg_pd, id_smt, ips, ipk, sks_smt, sks_total, create_date, last_update, soft_delete, last_sync
FROM pdrd.nilai_smt_mhs s
WHERE NOT EXISTS (SELECT 1 FROM siakadu.nilai_smt_mhs WHERE id_nilai_smt = s.id_nilai_smt);
GO

-- 3j. Nilai Transkrip
PRINT '--- Migrating nilai_transkrip ---';
INSERT INTO siakadu.nilai_transkrip (id_nilai_transkrip, id_reg_pd, id_mk, id_kls, sks_mk, nilai_huruf, nilai_angka, nilai_indeks, smt_ke, create_date, last_update, soft_delete, last_sync)
SELECT id_nilai_transkrip, id_reg_pd, id_mk, id_kls, sks_mk, nilai_huruf, nilai_angka, nilai_indeks, smt_ke, create_date, last_update, soft_delete, last_sync
FROM pdrd.nilai_transkrip s
WHERE NOT EXISTS (SELECT 1 FROM siakadu.nilai_transkrip WHERE id_nilai_transkrip = s.id_nilai_transkrip);
GO

-- ============================================================
-- STEP 4: Verify migration counts
-- ============================================================
PRINT '=== MIGRATION VERIFICATION ===';
SELECT 'siakadu.semester' AS tabel, COUNT(*) AS rows FROM siakadu.semester UNION ALL
SELECT 'siakadu.sdm', COUNT(*) FROM siakadu.sdm UNION ALL
SELECT 'siakadu.peserta_didik', COUNT(*) FROM siakadu.peserta_didik UNION ALL
SELECT 'siakadu.sms', COUNT(*) FROM siakadu.sms UNION ALL
SELECT 'siakadu.reg_ptk', COUNT(*) FROM siakadu.reg_ptk UNION ALL
SELECT 'siakadu.reg_pd', COUNT(*) FROM siakadu.reg_pd UNION ALL
SELECT 'siakadu.matkul', COUNT(*) FROM siakadu.matkul UNION ALL
SELECT 'siakadu.kelas_kuliah', COUNT(*) FROM siakadu.kelas_kuliah UNION ALL
SELECT 'siakadu.nilai_smt_mhs', COUNT(*) FROM siakadu.nilai_smt_mhs UNION ALL
SELECT 'siakadu.nilai_transkrip', COUNT(*) FROM siakadu.nilai_transkrip
ORDER BY tabel;
GO

PRINT '=== DEPLOY COMPLETE ===';
PRINT 'Next steps:';
PRINT '1. Update backend repositories: pdrd.* → siakadu.*';
PRINT '2. Uncomment pegawai + wisuda di menuConfig.tsx';
PRINT '3. Rebuild frontend';
PRINT '4. Test all 9 integrator pages';
GO
