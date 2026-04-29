-- ============================================================================
-- Schema migration — siakadu: extend ref_unit + pimpinan_unit
-- ============================================================================
-- Tujuan:
--   1. Tambah field di siakadu.ref_unit supaya match payload SIAKADU API
--      (nm_uniten, sk_akreditasi, sks_lulus_min, gelar, desk_gelar,
--       ipk_lulus_min, keterangan, visi, alamat, telepon, id_sms nullable)
--   2. Tambah `peran` di siakadu.pimpinan_unit supaya bisa simpan role
--      (Ketua/Wakil 1/Sekretaris dll). Kolom existing `jabatan` tetap untuk
--      job title detail.
-- Idempotent (IF NOT EXISTS).
-- ============================================================================

USE pdut_staging;  -- Ubah ke `pdut` untuk produksi
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- ============================================================================
-- 1. ALTER siakadu.ref_unit
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name='nm_uniten' AND Object_ID=Object_ID('siakadu.ref_unit'))
    ALTER TABLE siakadu.ref_unit ADD nm_uniten NVARCHAR(200) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name='sk_akreditasi' AND Object_ID=Object_ID('siakadu.ref_unit'))
    ALTER TABLE siakadu.ref_unit ADD sk_akreditasi VARCHAR(100) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name='sks_lulus_min' AND Object_ID=Object_ID('siakadu.ref_unit'))
    ALTER TABLE siakadu.ref_unit ADD sks_lulus_min INT NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name='gelar' AND Object_ID=Object_ID('siakadu.ref_unit'))
    ALTER TABLE siakadu.ref_unit ADD gelar VARCHAR(20) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name='desk_gelar' AND Object_ID=Object_ID('siakadu.ref_unit'))
    ALTER TABLE siakadu.ref_unit ADD desk_gelar VARCHAR(50) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name='ipk_lulus_min' AND Object_ID=Object_ID('siakadu.ref_unit'))
    ALTER TABLE siakadu.ref_unit ADD ipk_lulus_min DECIMAL(3,2) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name='keterangan' AND Object_ID=Object_ID('siakadu.ref_unit'))
    ALTER TABLE siakadu.ref_unit ADD keterangan NVARCHAR(MAX) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name='visi' AND Object_ID=Object_ID('siakadu.ref_unit'))
    ALTER TABLE siakadu.ref_unit ADD visi NVARCHAR(MAX) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name='alamat' AND Object_ID=Object_ID('siakadu.ref_unit'))
    ALTER TABLE siakadu.ref_unit ADD alamat NVARCHAR(500) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name='telepon' AND Object_ID=Object_ID('siakadu.ref_unit'))
    ALTER TABLE siakadu.ref_unit ADD telepon VARCHAR(50) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name='id_sms' AND Object_ID=Object_ID('siakadu.ref_unit'))
    ALTER TABLE siakadu.ref_unit ADD id_sms UNIQUEIDENTIFIER NULL;
GO

-- Widen akreditasi from VARCHAR(10) → VARCHAR(50) supaya muat 'Status Tidak Diketahui'
IF EXISTS (
    SELECT 1 FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID('siakadu.ref_unit') AND c.name='akreditasi'
      AND t.name='varchar' AND c.max_length < 50
)
    ALTER TABLE siakadu.ref_unit ALTER COLUMN akreditasi VARCHAR(50) NULL;
GO
PRINT 'ALTER siakadu.ref_unit done';

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_ref_unit_jns_aktif' AND object_id=OBJECT_ID('siakadu.ref_unit'))
    EXEC('CREATE INDEX IX_ref_unit_jns_aktif ON siakadu.ref_unit(jns_unit, is_aktif) WHERE is_aktif IN (''1'',''Y'')');
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_ref_unit_id_sms' AND object_id=OBJECT_ID('siakadu.ref_unit'))
    EXEC('CREATE INDEX IX_ref_unit_id_sms ON siakadu.ref_unit(id_sms) WHERE id_sms IS NOT NULL');
GO

-- ============================================================================
-- 2. ALTER siakadu.pimpinan_unit — tambah peran (Ketua/Wakil/Sekretaris)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name='peran' AND Object_ID=Object_ID('siakadu.pimpinan_unit'))
    ALTER TABLE siakadu.pimpinan_unit ADD peran VARCHAR(30) NULL;
GO
PRINT 'ALTER siakadu.pimpinan_unit ADD peran done';

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_pimpinan_unit_id_unit_nip' AND object_id=OBJECT_ID('siakadu.pimpinan_unit'))
    EXEC('CREATE INDEX IX_pimpinan_unit_id_unit_nip ON siakadu.pimpinan_unit(id_unit, nip)');
GO

-- ============================================================================
-- Verifikasi
-- ============================================================================
SELECT
    (SELECT COUNT(*) FROM sys.columns WHERE Object_ID=Object_ID('siakadu.ref_unit')
     AND Name IN ('nm_uniten','sk_akreditasi','sks_lulus_min','gelar','desk_gelar',
                  'ipk_lulus_min','keterangan','visi','alamat','telepon','id_sms')) AS ref_unit_new_cols,
    (SELECT COUNT(*) FROM sys.columns WHERE Object_ID=Object_ID('siakadu.pimpinan_unit')
     AND Name='peran') AS pimpinan_peran_col;

PRINT 'Migration complete. Expected: ref_unit_new_cols=11, pimpinan_peran_col=1';
