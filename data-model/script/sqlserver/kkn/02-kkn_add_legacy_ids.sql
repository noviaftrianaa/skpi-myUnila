-- ============================================================================
-- Script  : KKN — Add legacy MySQL IDs for sync mapping
-- Date    : 2026-05-06
-- Purpose : Add legacy_id columns to KKN tables to store original MySQL int IDs
--           This enables mapping between MySQL legacy (int PK) and
--           SQL Server (UUID PK) during data synchronization.
-- ============================================================================

-- periode_kkn: maps from MySQL kkn_periode.id_periode
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.periode_kkn') AND name = 'legacy_id')
    ALTER TABLE kkn.periode_kkn ADD legacy_id INT NULL
go
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_kkn_periode_legacy')
    CREATE UNIQUE INDEX idx_kkn_periode_legacy ON kkn.periode_kkn (legacy_id) WHERE legacy_id IS NOT NULL
go

-- lokasi_kkn: maps from MySQL lokasi_desa.id_desa (denormalized)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.lokasi_kkn') AND name = 'legacy_id_desa')
    ALTER TABLE kkn.lokasi_kkn ADD legacy_id_desa INT NULL
go
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.lokasi_kkn') AND name = 'legacy_id_kecamatan')
    ALTER TABLE kkn.lokasi_kkn ADD legacy_id_kecamatan INT NULL
go
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.lokasi_kkn') AND name = 'legacy_id_kabupaten')
    ALTER TABLE kkn.lokasi_kkn ADD legacy_id_kabupaten INT NULL
go
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_kkn_lokasi_legacy_desa')
    CREATE UNIQUE INDEX idx_kkn_lokasi_legacy_desa ON kkn.lokasi_kkn (legacy_id_desa) WHERE legacy_id_desa IS NOT NULL
go

-- registrasi_kkn: maps from MySQL mahasiswa_pendaftar.id_pendaftaran
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.registrasi_kkn') AND name = 'legacy_id')
    ALTER TABLE kkn.registrasi_kkn ADD legacy_id INT NULL
go
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.registrasi_kkn') AND name = 'npm')
    ALTER TABLE kkn.registrasi_kkn ADD npm NVARCHAR(20) NULL
go
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_kkn_registrasi_legacy')
    CREATE UNIQUE INDEX idx_kkn_registrasi_legacy ON kkn.registrasi_kkn (legacy_id) WHERE legacy_id IS NOT NULL
go
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_kkn_registrasi_npm')
    CREATE INDEX idx_kkn_registrasi_npm ON kkn.registrasi_kkn (npm) WHERE npm IS NOT NULL
go

-- data_pemohon: maps from MySQL mahasiswa_biodata.id_bio_mahasiswa
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.data_pemohon') AND name = 'legacy_id')
    ALTER TABLE kkn.data_pemohon ADD legacy_id INT NULL
go
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_kkn_pemohon_legacy')
    CREATE UNIQUE INDEX idx_kkn_pemohon_legacy ON kkn.data_pemohon (legacy_id) WHERE legacy_id IS NOT NULL
go

-- kelompok_kkn: auto-generated from penempatan_mahasiswa.kelompok + id_desa
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.kelompok_kkn') AND name = 'legacy_kelompok_no')
    ALTER TABLE kkn.kelompok_kkn ADD legacy_kelompok_no INT NULL
go
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.kelompok_kkn') AND name = 'legacy_id_desa')
    ALTER TABLE kkn.kelompok_kkn ADD legacy_id_desa INT NULL
go

-- anggota_kelompok: maps from MySQL penempatan_mahasiswa.id_penempatan
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.anggota_kelompok') AND name = 'legacy_id')
    ALTER TABLE kkn.anggota_kelompok ADD legacy_id INT NULL
go
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.anggota_kelompok') AND name = 'npm')
    ALTER TABLE kkn.anggota_kelompok ADD npm NVARCHAR(20) NULL
go
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_kkn_anggota_legacy')
    CREATE UNIQUE INDEX idx_kkn_anggota_legacy ON kkn.anggota_kelompok (legacy_id) WHERE legacy_id IS NOT NULL
go
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_kkn_anggota_npm')
    CREATE INDEX idx_kkn_anggota_npm ON kkn.anggota_kelompok (npm) WHERE npm IS NOT NULL
go

-- dpl_kelompok: maps from MySQL biodata_dpl/penempatan_dpl + biodata_kdpl/penempatan_kdpl
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.dpl_kelompok') AND name = 'legacy_id_biodata')
    ALTER TABLE kkn.dpl_kelompok ADD legacy_id_biodata INT NULL
go
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.dpl_kelompok') AND name = 'legacy_id_penempatan')
    ALTER TABLE kkn.dpl_kelompok ADD legacy_id_penempatan INT NULL
go
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.dpl_kelompok') AND name = 'nip')
    ALTER TABLE kkn.dpl_kelompok ADD nip NVARCHAR(20) NULL
go

-- nilai_mahasiswa: maps from MySQL nilai_dpl/nilai_kdpl
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.nilai_mahasiswa') AND name = 'legacy_id')
    ALTER TABLE kkn.nilai_mahasiswa ADD legacy_id INT NULL
go
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.nilai_mahasiswa') AND name = 'legacy_source')
    ALTER TABLE kkn.nilai_mahasiswa ADD legacy_source NVARCHAR(20) NULL
go

-- nilai_akhir: computed from nilai_dpl + nilai_kdpl
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.nilai_akhir') AND name = 'legacy_id_mahasiswa')
    ALTER TABLE kkn.nilai_akhir ADD legacy_id_mahasiswa INT NULL
go

-- laporan_kelompok: maps from MySQL mahasiswa_laporan_p.id_laporan
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.laporan_kelompok') AND name = 'legacy_id')
    ALTER TABLE kkn.laporan_kelompok ADD legacy_id INT NULL
go

-- program_kerja: maps from MySQL mahasiswa_laporan_rk.id_laporan_rk
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.program_kerja') AND name = 'legacy_id')
    ALTER TABLE kkn.program_kerja ADD legacy_id INT NULL
go

-- komponen_penilaian: seed from ref_nilai + persentase_nilai
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('kkn.komponen_penilaian') AND name = 'legacy_id')
    ALTER TABLE kkn.komponen_penilaian ADD legacy_id INT NULL
go

print '============================================'
print '>> KKN legacy_id columns added successfully.'
print '============================================'
go
