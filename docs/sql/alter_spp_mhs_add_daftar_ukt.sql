-- =====================================================
-- ALTER SCRIPT: spp_mhs - Recreate table with correct column order
-- id_daftar_ukt will be placed after id_smt
-- Safe: handles case where id_daftar_ukt does NOT yet exist
-- =====================================================

BEGIN TRANSACTION;
BEGIN TRY
    PRINT 'Starting table recreation...';
    PRINT '';

    -- Drop FK first if exists
    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_spp_mhs_daftar_ukt')
    BEGIN
        ALTER TABLE keuangan.spp_mhs DROP CONSTRAINT FK_spp_mhs_daftar_ukt;
        PRINT '- FK_spp_mhs_daftar_ukt dropped';
    END

    -- Drop index if exists
    IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('keuangan.spp_mhs') AND name = 'IX_spp_mhs_id_daftar_ukt')
    BEGIN
        DROP INDEX IX_spp_mhs_id_daftar_ukt ON keuangan.spp_mhs;
        PRINT '- IX_spp_mhs_id_daftar_ukt dropped';
    END

    -- Drop temp table if exists from failed previous run
    IF OBJECT_ID('keuangan.spp_mhs_new', 'U') IS NOT NULL
    BEGIN
        DROP TABLE keuangan.spp_mhs_new;
        PRINT '- Dropped leftover spp_mhs_new from previous run';
    END

    -- Check if id_daftar_ukt exists in old table
    DECLARE @hasDaftarUkt BIT = 0;
    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('keuangan.spp_mhs') AND name = 'id_daftar_ukt'
    )
        SET @hasDaftarUkt = 1;

    PRINT 'id_daftar_ukt exists in old table: ' + CASE @hasDaftarUkt WHEN 1 THEN 'YES' ELSE 'NO (will be added)' END;

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
    PRINT '+ New table created with correct column order';

    -- Copy data using dynamic SQL (handles missing id_daftar_ukt)
    DECLARE @insertCols NVARCHAR(MAX);
    DECLARE @selectCols NVARCHAR(MAX);
    DECLARE @sql NVARCHAR(MAX);
    DECLARE @rowCount INT;

    SET @insertCols = 'id_spp_mhs, id_kelas_ukt, id_smt, ';
    SET @selectCols = 'id_spp_mhs, id_kelas_ukt, id_smt, ';

    IF @hasDaftarUkt = 1
    BEGIN
        SET @insertCols = @insertCols + 'id_daftar_ukt, ';
        SET @selectCols = @selectCols + 'id_daftar_ukt, ';
    END

    SET @insertCols = @insertCols + 'id_reg_pd, tgl_bayar, nominal, '
        + 'kode_pembayaran, nomor_pin, kode_akses, bill_ref, flag_by, ket, '
        + 'create_date, id_creator, last_update, id_updater, soft_delete, last_sync';
    SET @selectCols = @selectCols + 'id_reg_pd, tgl_bayar, nominal, '
        + 'kode_pembayaran, nomor_pin, kode_akses, bill_ref, flag_by, ket, '
        + 'create_date, id_creator, last_update, id_updater, soft_delete, last_sync';

    SET @sql = N'INSERT INTO keuangan.spp_mhs_new (' + @insertCols + N') '
             + N'SELECT ' + @selectCols + N' FROM keuangan.spp_mhs; '
             + N'SET @rc = @@ROWCOUNT;';

    EXEC sp_executesql @sql, N'@rc INT OUTPUT', @rc = @rowCount OUTPUT;
    PRINT '+ Copied ' + CAST(ISNULL(@rowCount, 0) AS VARCHAR(10)) + ' rows to new table';

    -- Drop old table
    DROP TABLE keuangan.spp_mhs;
    PRINT '- Old table dropped';

    -- Rename new table
    EXEC sp_rename 'keuangan.spp_mhs_new', 'spp_mhs';
    EXEC sp_rename 'keuangan.PK_spp_mhs_new', 'PK_spp_mhs', 'OBJECT';
    PRINT '+ Table renamed to spp_mhs';

    -- Recreate index (via EXEC to avoid compile-time column validation)
    EXEC(N'CREATE NONCLUSTERED INDEX IX_spp_mhs_id_daftar_ukt
           ON keuangan.spp_mhs (id_daftar_ukt)
           WHERE id_daftar_ukt IS NOT NULL');
    PRINT '+ Index IX_spp_mhs_id_daftar_ukt recreated';

    -- Recreate FK only if daftar_ukt table exists (via EXEC)
    IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('keuangan.daftar_ukt'))
    BEGIN
        EXEC(N'ALTER TABLE keuangan.spp_mhs
               ADD CONSTRAINT FK_spp_mhs_daftar_ukt
               FOREIGN KEY (id_daftar_ukt) REFERENCES keuangan.daftar_ukt(id_daftar_ukt)');
        PRINT '+ FK_spp_mhs_daftar_ukt recreated';
    END
    ELSE
    BEGIN
        PRINT '~ Skipped FK: keuangan.daftar_ukt table does not exist yet';
    END

    COMMIT TRANSACTION;
    PRINT '';
    PRINT '=============================================';
    PRINT ' spp_mhs recreated successfully!';
    PRINT ' Rows migrated: ' + CAST(ISNULL(@rowCount, 0) AS VARCHAR(10));
    PRINT '=============================================';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    PRINT '';
    PRINT 'ERROR: ' + ERROR_MESSAGE();
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
