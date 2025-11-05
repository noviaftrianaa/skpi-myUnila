-- ALTER TABLE script to increase column sizes for pdrd.rwy_pend_formal
-- Reason: Data from Sister API exceeds current column size limits
-- Date: 2025-11-05

USE pdut_dev;
GO

-- Increase nm_sp_formal from varchar(100) to varchar(255)
ALTER TABLE pdrd.rwy_pend_formal
ALTER COLUMN nm_sp_formal varchar(255) NOT NULL;
GO

-- Increase fak from varchar(100) to varchar(255)
ALTER TABLE pdrd.rwy_pend_formal
ALTER COLUMN fak varchar(255) NULL;
GO

-- Increase nipd from varchar(24) to varchar(50)
ALTER TABLE pdrd.rwy_pend_formal
ALTER COLUMN nipd varchar(50) NOT NULL;
GO

-- Increase sk_setara from varchar(80) to varchar(255)
ALTER TABLE pdrd.rwy_pend_formal
ALTER COLUMN sk_setara varchar(255) NULL;
GO

-- Increase no_ijazah from varchar(80) to varchar(100)
ALTER TABLE pdrd.rwy_pend_formal
ALTER COLUMN no_ijazah varchar(100) NULL;
GO

-- Increase judul_tesis from varchar(500) to varchar(1000)
ALTER TABLE pdrd.rwy_pend_formal
ALTER COLUMN judul_tesis varchar(1000) NULL;
GO

PRINT 'Column sizes increased successfully for pdrd.rwy_pend_formal';
GO
