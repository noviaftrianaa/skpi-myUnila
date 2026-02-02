-- =====================================================
-- ALTER SCRIPT: spp_mhs - Recreate table with correct column order
-- id_daftar_ukt will be placed after id_smt
-- =====================================================

BEGIN TRANSACTION;
BEGIN TRY
    PRINT 'Starting table recreation...';

    -- Drop FK first if exists
    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_spp_mhs_daftar_ukt')
    BEGIN
        ALTER TABLE keuangan.spp_mhs DROP CONSTRAINT FK_spp_mhs_daftar_ukt;
        PRINT 'FK_spp_mhs_daftar_ukt dropped';
    END

    -- Drop index if exists
    IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('keuangan.spp_mhs') AND name = 'IX_spp_mhs_id_daftar_ukt')
    BEGIN
        DROP INDEX IX_spp_mhs_id_daftar_ukt ON keuangan.spp_mhs;
        PRINT 'IX_spp_mhs_id_daftar_ukt dropped';
    END

    -- Create new table with correct column order
    CREATE TABLE keuangan.spp_mhs_new (
        id_spp_mhs UNIQUEIDENTIFIER NOT NULL,
        id_kelas_ukt UNIQUEIDENTIFIER NULL,
        id_smt NVARCHAR(10) NOT NULL,
        id_daftar_ukt UNIQUEIDENTIFIER NULL,  -- After id_smt
        id_reg_pd UNIQUEIDENTIFIER NOT NULL,
        tgl_bayar DATETIME NOT NULL,
        nominal DECIMAL(18,2) NOT NULL,
        kode_pembayaran NVARCHAR(50) NULL,
        nomor_pin NVARCHAR(50) NULL,
        kode_akses NVARCHAR(50) NULL,
        bill_ref NVARCHAR(100) NULL,
        flag_by NVARCHAR(50) NULL,
        ket NVARCHAR(500) NULL,
        create_date DATETIME NOT NULL DEFAULT GETDATE(),
        id_creator UNIQUEIDENTIFIER NOT NULL,
        last_update DATETIME NOT NULL DEFAULT GETDATE(),
        id_updater UNIQUEIDENTIFIER NULL,
        soft_delete INT NOT NULL DEFAULT 0,
        last_sync DATETIME NULL,
        CONSTRAINT PK_spp_mhs_new PRIMARY KEY (id_spp_mhs)
    );
    PRINT 'New table created with correct column order';

    -- Copy data from old table
    INSERT INTO keuangan.spp_mhs_new (
        id_spp_mhs, id_kelas_ukt, id_smt, id_daftar_ukt, id_reg_pd,
        tgl_bayar, nominal, kode_pembayaran, nomor_pin, kode_akses,
        bill_ref, flag_by, ket, create_date, id_creator,
        last_update, id_updater, soft_delete, last_sync
    )
    SELECT
        id_spp_mhs, id_kelas_ukt, id_smt, id_daftar_ukt, id_reg_pd,
        tgl_bayar, nominal, kode_pembayaran, nomor_pin, kode_akses,
        bill_ref, flag_by, ket, create_date, id_creator,
        last_update, id_updater, soft_delete, last_sync
    FROM keuangan.spp_mhs;

    DECLARE @rowCount INT = @@ROWCOUNT;
    PRINT 'Copied ' + CAST(@rowCount AS VARCHAR(10)) + ' rows to new table';

    -- Drop old table
    DROP TABLE keuangan.spp_mhs;
    PRINT 'Old table dropped';

    -- Rename new table
    EXEC sp_rename 'keuangan.spp_mhs_new', 'spp_mhs';
    EXEC sp_rename 'keuangan.PK_spp_mhs_new', 'PK_spp_mhs', 'OBJECT';
    PRINT 'Table renamed to spp_mhs';

    -- Recreate index
    CREATE NONCLUSTERED INDEX IX_spp_mhs_id_daftar_ukt
    ON keuangan.spp_mhs (id_daftar_ukt)
    WHERE id_daftar_ukt IS NOT NULL;
    PRINT 'Index IX_spp_mhs_id_daftar_ukt recreated';

    -- Recreate FK
    ALTER TABLE keuangan.spp_mhs
    ADD CONSTRAINT FK_spp_mhs_daftar_ukt
    FOREIGN KEY (id_daftar_ukt) REFERENCES keuangan.daftar_ukt(id_daftar_ukt);
    PRINT 'FK_spp_mhs_daftar_ukt recreated';

    COMMIT TRANSACTION;
    PRINT '✅ Table recreated successfully with correct column order!';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '❌ Error: ' + ERROR_MESSAGE();
    THROW;
END CATCH
GO

-- Verify column order
SELECT
    c.column_id as [Order],
    c.name as [Column],
    t.name as [Type],
    c.is_nullable as [Nullable]
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('keuangan.spp_mhs')
ORDER BY c.column_id;
