-- =====================================================
-- SIAKADU Schema — ALTER: Add sync-specific columns
-- Run AFTER fresh schema or on existing DB
-- Safe to run multiple times (IF NOT EXISTS checks)
-- =====================================================

-- =====================================================
-- 1. reg_pd — sync columns from SIAKADU API
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.reg_pd') AND name = 'angkatan')
    ALTER TABLE siakadu.reg_pd ADD angkatan varchar(4) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.reg_pd') AND name = 'sks_total')
    ALTER TABLE siakadu.reg_pd ADD sks_total int NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.reg_pd') AND name = 'sks_lulus')
    ALTER TABLE siakadu.reg_pd ADD sks_lulus int NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.reg_pd') AND name = 'semester')
    ALTER TABLE siakadu.reg_pd ADD semester varchar(10) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.reg_pd') AND name = 'id_status_mahasiswa')
    ALTER TABLE siakadu.reg_pd ADD id_status_mahasiswa varchar(10) NULL;
GO

PRINT '✅ reg_pd sync columns added';
GO

-- =====================================================
-- 1b. mapping_matkul — kode_mk → id_mk UUID
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = 'siakadu' AND t.name = 'mapping_matkul')
CREATE TABLE siakadu.mapping_matkul (
   kode_mk_siakadu          varchar(20)          not null,
   id_unit_siakadu          varchar(20)          not null default '',
   id_mk                    uniqueidentifier     not null,
   create_date              datetime             not null default getdate(),
   constraint pk_mapping_matkul primary key (kode_mk_siakadu, id_unit_siakadu)
);
GO

-- =====================================================
-- 1c. mapping_kurikulum — kode_mk+thn → id_kurikulum_sp UUID
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = 'siakadu' AND t.name = 'mapping_kurikulum')
CREATE TABLE siakadu.mapping_kurikulum (
   kode_mk_siakadu          varchar(20)          not null,
   thn_kurikulum            int                  not null,
   id_unit_siakadu          varchar(20)          not null default '',
   id_kurikulum_sp          uniqueidentifier     not null,
   id_mk                    uniqueidentifier     not null,
   create_date              datetime             not null default getdate(),
   constraint pk_mapping_kurikulum primary key (kode_mk_siakadu, thn_kurikulum)
);
GO

PRINT '✅ mapping tables created';
GO

-- =====================================================
-- 2. status_mahasiswa — seed reference data (PDDIKTI)
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM siakadu.status_mahasiswa WHERE id_stat_mhs = 'A')
    INSERT INTO siakadu.status_mahasiswa (id_stat_mhs, a_ref_pddikti, a_ref_unila, nm_stat_mhs, create_date, last_update, last_sync)
    VALUES ('A', 1, 1, 'Aktif', GETDATE(), GETDATE(), GETDATE());
GO
IF NOT EXISTS (SELECT 1 FROM siakadu.status_mahasiswa WHERE id_stat_mhs = 'C')
    INSERT INTO siakadu.status_mahasiswa (id_stat_mhs, a_ref_pddikti, a_ref_unila, nm_stat_mhs, create_date, last_update, last_sync)
    VALUES ('C', 1, 1, 'Cuti', GETDATE(), GETDATE(), GETDATE());
GO
IF NOT EXISTS (SELECT 1 FROM siakadu.status_mahasiswa WHERE id_stat_mhs = 'D')
    INSERT INTO siakadu.status_mahasiswa (id_stat_mhs, a_ref_pddikti, a_ref_unila, nm_stat_mhs, create_date, last_update, last_sync)
    VALUES ('D', 1, 1, 'Drop Out', GETDATE(), GETDATE(), GETDATE());
GO
IF NOT EXISTS (SELECT 1 FROM siakadu.status_mahasiswa WHERE id_stat_mhs = 'K')
    INSERT INTO siakadu.status_mahasiswa (id_stat_mhs, a_ref_pddikti, a_ref_unila, nm_stat_mhs, create_date, last_update, last_sync)
    VALUES ('K', 1, 1, 'Keluar', GETDATE(), GETDATE(), GETDATE());
GO
IF NOT EXISTS (SELECT 1 FROM siakadu.status_mahasiswa WHERE id_stat_mhs = 'L')
    INSERT INTO siakadu.status_mahasiswa (id_stat_mhs, a_ref_pddikti, a_ref_unila, nm_stat_mhs, create_date, last_update, last_sync)
    VALUES ('L', 1, 1, 'Lulus', GETDATE(), GETDATE(), GETDATE());
GO
IF NOT EXISTS (SELECT 1 FROM siakadu.status_mahasiswa WHERE id_stat_mhs = 'N')
    INSERT INTO siakadu.status_mahasiswa (id_stat_mhs, a_ref_pddikti, a_ref_unila, nm_stat_mhs, create_date, last_update, last_sync)
    VALUES ('N', 1, 1, 'Non-Aktif', GETDATE(), GETDATE(), GETDATE());
GO
IF NOT EXISTS (SELECT 1 FROM siakadu.status_mahasiswa WHERE id_stat_mhs = 'G')
    INSERT INTO siakadu.status_mahasiswa (id_stat_mhs, a_ref_pddikti, a_ref_unila, nm_stat_mhs, create_date, last_update, last_sync)
    VALUES ('G', 1, 1, 'Double Degree', GETDATE(), GETDATE(), GETDATE());
GO
IF NOT EXISTS (SELECT 1 FROM siakadu.status_mahasiswa WHERE id_stat_mhs = 'M')
    INSERT INTO siakadu.status_mahasiswa (id_stat_mhs, a_ref_pddikti, a_ref_unila, nm_stat_mhs, create_date, last_update, last_sync)
    VALUES ('M', 1, 1, 'Mutasi', GETDATE(), GETDATE(), GETDATE());
GO
IF NOT EXISTS (SELECT 1 FROM siakadu.status_mahasiswa WHERE id_stat_mhs = 'W')
    INSERT INTO siakadu.status_mahasiswa (id_stat_mhs, a_ref_pddikti, a_ref_unila, nm_stat_mhs, create_date, last_update, last_sync)
    VALUES ('W', 1, 1, 'Wafat', GETDATE(), GETDATE(), GETDATE());
GO

PRINT '✅ status_mahasiswa reference data seeded';
GO

-- =====================================================
-- 3. jenjang_pendidikan — seed PDDIKTI standard
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM siakadu.jenjang_pendidikan WHERE id_jenj_didik = 8)
INSERT INTO siakadu.jenjang_pendidikan (id_jenj_didik, nm_jenj_didik, create_date, last_update, last_sync)
VALUES (8, 'S1', GETDATE(), GETDATE(), GETDATE());
GO
IF NOT EXISTS (SELECT 1 FROM siakadu.jenjang_pendidikan WHERE id_jenj_didik = 6)
INSERT INTO siakadu.jenjang_pendidikan (id_jenj_didik, nm_jenj_didik, create_date, last_update, last_sync)
VALUES (6, 'D3', GETDATE(), GETDATE(), GETDATE());
GO
IF NOT EXISTS (SELECT 1 FROM siakadu.jenjang_pendidikan WHERE id_jenj_didik = 7)
INSERT INTO siakadu.jenjang_pendidikan (id_jenj_didik, nm_jenj_didik, create_date, last_update, last_sync)
VALUES (7, 'D4', GETDATE(), GETDATE(), GETDATE());
GO
IF NOT EXISTS (SELECT 1 FROM siakadu.jenjang_pendidikan WHERE id_jenj_didik = 10)
INSERT INTO siakadu.jenjang_pendidikan (id_jenj_didik, nm_jenj_didik, create_date, last_update, last_sync)
VALUES (10, 'S2', GETDATE(), GETDATE(), GETDATE());
GO
IF NOT EXISTS (SELECT 1 FROM siakadu.jenjang_pendidikan WHERE id_jenj_didik = 12)
INSERT INTO siakadu.jenjang_pendidikan (id_jenj_didik, nm_jenj_didik, create_date, last_update, last_sync)
VALUES (12, 'S3', GETDATE(), GETDATE(), GETDATE());
GO
IF NOT EXISTS (SELECT 1 FROM siakadu.jenjang_pendidikan WHERE id_jenj_didik = 9)
INSERT INTO siakadu.jenjang_pendidikan (id_jenj_didik, nm_jenj_didik, create_date, last_update, last_sync)
VALUES (9, 'Profesi', GETDATE(), GETDATE(), GETDATE());
GO
PRINT '✅ jenjang_pendidikan seeded';
GO

-- =====================================================
-- 4. semester — seed 2000-2026 (ganjil+genap)
-- =====================================================
DECLARE @yr int = 2000;
WHILE @yr <= 2025
BEGIN
    DECLARE @s1 char(5) = CAST(@yr AS varchar(4)) + '1';
    DECLARE @s2 char(5) = CAST(@yr AS varchar(4)) + '2';
    IF NOT EXISTS (SELECT 1 FROM siakadu.semester WHERE id_smt = @s1)
        INSERT INTO siakadu.semester (id_smt, nm_smt, id_thn_ajaran, smt, tgl_mulai, tgl_selesai, create_date, last_update, last_sync)
        VALUES (@s1, 'Ganjil ' + CAST(@yr AS varchar) + '/' + CAST(@yr+1 AS varchar), @yr, 1, GETDATE(), GETDATE(), GETDATE(), GETDATE(), GETDATE());
    IF NOT EXISTS (SELECT 1 FROM siakadu.semester WHERE id_smt = @s2)
        INSERT INTO siakadu.semester (id_smt, nm_smt, id_thn_ajaran, smt, tgl_mulai, tgl_selesai, create_date, last_update, last_sync)
        VALUES (@s2, 'Genap ' + CAST(@yr AS varchar) + '/' + CAST(@yr+1 AS varchar), @yr, 2, GETDATE(), GETDATE(), GETDATE(), GETDATE(), GETDATE());
    SET @yr = @yr + 1;
END
GO
PRINT '✅ semester 2000-2025 seeded';
GO

-- =====================================================
-- 5. mapping tables — matkul & kurikulum
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = 'siakadu' AND t.name = 'mapping_matkul')
CREATE TABLE siakadu.mapping_matkul (
   kode_mk_siakadu varchar(20) NOT NULL,
   id_unit_siakadu varchar(20) NOT NULL DEFAULT '',
   id_mk uniqueidentifier NOT NULL,
   create_date datetime NOT NULL DEFAULT GETDATE(),
   CONSTRAINT pk_mapping_matkul PRIMARY KEY (kode_mk_siakadu, id_unit_siakadu)
);
GO
IF NOT EXISTS (SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = 'siakadu' AND t.name = 'mapping_kurikulum')
CREATE TABLE siakadu.mapping_kurikulum (
   kode_mk_siakadu varchar(20) NOT NULL,
   thn_kurikulum int NOT NULL,
   id_unit_siakadu varchar(20) NOT NULL DEFAULT '',
   id_kurikulum_sp uniqueidentifier NOT NULL,
   id_mk uniqueidentifier NOT NULL,
   create_date datetime NOT NULL DEFAULT GETDATE(),
   CONSTRAINT pk_mapping_kurikulum PRIMARY KEY (kode_mk_siakadu, thn_kurikulum)
);
GO
PRINT '✅ mapping_matkul + mapping_kurikulum created';
GO

-- =====================================================
-- 6. Column type fixes
-- =====================================================
-- matkul.id_jns_mk: char(1) → varchar(5) (API returns 2-char codes like 'KN','MG')
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.matkul') AND name = 'id_jns_mk' AND max_length = 1)
    ALTER TABLE siakadu.matkul ALTER COLUMN id_jns_mk varchar(5) NULL;
GO
-- matkul.jns_mk: char(1) → varchar(5)
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.matkul') AND name = 'jns_mk' AND max_length = 1)
    ALTER TABLE siakadu.matkul ALTER COLUMN jns_mk varchar(5) NULL;
GO
-- matkul.kel_mk: char(1) → varchar(5)
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.matkul') AND name = 'kel_mk' AND max_length = 1)
    ALTER TABLE siakadu.matkul ALTER COLUMN kel_mk varchar(5) NULL;
GO
-- matkul.id_kel_mk: char(1) → varchar(5)
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.matkul') AND name = 'id_kel_mk' AND max_length = 1)
    ALTER TABLE siakadu.matkul ALTER COLUMN id_kel_mk varchar(5) NULL;
GO
PRINT '✅ Column type fixes applied';
GO

-- =====================================================
-- 7. Drop FKs yang block sync (id_sms optional saat sync)
-- =====================================================
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_kelas_kuliah_sms')
    ALTER TABLE siakadu.kelas_kuliah DROP CONSTRAINT fk_kelas_kuliah_sms;
GO
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_matkul_sms')
    ALTER TABLE siakadu.matkul DROP CONSTRAINT fk_matkul_sms;
GO
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_reg_pd_sms')
    ALTER TABLE siakadu.reg_pd DROP CONSTRAINT fk_reg_pd_sms;
GO
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_reg_pd_semester')
    ALTER TABLE siakadu.reg_pd DROP CONSTRAINT fk_reg_pd_semester;
GO
PRINT '✅ Optional FKs dropped (id_sms, semester refs that block sync)';
GO

-- =====================================================
-- 8. Add PDDIKTI sync tracking to mapping tables
-- UUID generated locally → a_sync_pddikti=0
-- UUID from PDDIKTI Feeder → a_sync_pddikti=1
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.mapping_matkul') AND name = 'a_sync_pddikti')
    ALTER TABLE siakadu.mapping_matkul ADD a_sync_pddikti numeric(1,0) NOT NULL DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.mapping_kurikulum') AND name = 'a_sync_pddikti')
    ALTER TABLE siakadu.mapping_kurikulum ADD a_sync_pddikti numeric(1,0) NOT NULL DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.mapping_kelas') AND name = 'a_sync_pddikti')
    ALTER TABLE siakadu.mapping_kelas ADD a_sync_pddikti numeric(1,0) NOT NULL DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.mapping_jadwal') AND name = 'a_sync_pddikti')
    ALTER TABLE siakadu.mapping_jadwal ADD a_sync_pddikti numeric(1,0) NOT NULL DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('siakadu.mapping_unit') AND name = 'a_sync_pddikti')
    ALTER TABLE siakadu.mapping_unit ADD a_sync_pddikti numeric(1,0) NOT NULL DEFAULT 0;
GO
PRINT '✅ a_sync_pddikti tracking columns added';
GO

-- =====================================================
-- Summary of changes:
-- =====================================================
-- reg_pd: +5 columns (angkatan, sks_total, sks_lulus, semester, id_status_mahasiswa)
-- status_mahasiswa: +9 reference rows (A, C, D, K, L, N, G, M, W)
-- peserta_didik: column renames in Go code (alamat_jalan→jln, handphone→tlpn_hp, id_kota→id_wil)
-- kelas_kuliah: Go code maps to actual schema (id_kls, id_smt, nm_kls)
-- matkul: Go code maps to actual schema (id_mk UUID PK, nm_mk, kode_mk)
-- matkul_kurikulum: Go code maps to actual schema (id_kurikulum_sp, id_mk composite PK)
-- jadwal_kelas: Go code maps to actual schema (id_jdwl_kls, id_kls, id_smt)
-- =====================================================
