-- ============================================================================
-- RECREATE TABLE keuangan.spp_mhs
-- Tambah kolom dari response SIMPEDAM GetListTagihan + reorder kolom
-- ============================================================================
-- Kolom baru (posisi sebelum audit fields):
--   id_daftar_ukt   : FK ke keuangan.daftar_ukt (mungkin belum ada)
--   nm_smt          : Nama semester (dari fk_nama_semester, e.g. "10")
--   total_tagihan   : Total tagihan keseluruhan
--   jumlah_spi      : Jumlah SPI (Sumbangan Pengembangan Institusi)
--   jumlah_denda    : Jumlah denda keterlambatan
--   jumlah_lainnya  : Jumlah biaya lainnya
--   sisa_tagihan    : Sisa tagihan yang belum dibayar
--   a_cicil         : Flag cicilan (0=tidak, 1=ya) — dari flag_cicil
--   cicilan_ke      : Cicilan ke-berapa (0 jika bukan cicilan)
--
-- Kolom existing yang sudah meng-cover:
--   nominal         : = nominal_ukt_spp (sudah ada)
--
-- FK: id_daftar_ukt -> keuangan.daftar_ukt(id_daftar_ukt)
--
-- Safe: handles case where id_daftar_ukt column does NOT yet exist
-- ============================================================================

BEGIN TRANSACTION;
BEGIN TRY
    PRINT 'Starting keuangan.spp_mhs table recreation...';
    PRINT '';

    -- ========================================
    -- 1. Drop existing constraints & indexes (if any)
    -- ========================================
    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_spp_mhs_daftar_ukt')
    BEGIN
        ALTER TABLE keuangan.spp_mhs DROP CONSTRAINT FK_spp_mhs_daftar_ukt;
        PRINT '- Dropped FK: FK_spp_mhs_daftar_ukt';
    END

    IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('keuangan.spp_mhs') AND name = 'IX_spp_mhs_id_daftar_ukt')
    BEGIN
        DROP INDEX IX_spp_mhs_id_daftar_ukt ON keuangan.spp_mhs;
        PRINT '- Dropped index: IX_spp_mhs_id_daftar_ukt';
    END

    IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('keuangan.spp_mhs') AND name = 'IX_spp_mhs_id_smt')
    BEGIN
        DROP INDEX IX_spp_mhs_id_smt ON keuangan.spp_mhs;
        PRINT '- Dropped index: IX_spp_mhs_id_smt';
    END

    IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('keuangan.spp_mhs') AND name = 'IX_spp_mhs_id_reg_pd')
    BEGIN
        DROP INDEX IX_spp_mhs_id_reg_pd ON keuangan.spp_mhs;
        PRINT '- Dropped index: IX_spp_mhs_id_reg_pd';
    END

    -- ========================================
    -- 2. Drop temp table if exists from failed previous run
    -- ========================================
    IF OBJECT_ID('keuangan.spp_mhs_new', 'U') IS NOT NULL
    BEGIN
        DROP TABLE keuangan.spp_mhs_new;
        PRINT '- Dropped leftover spp_mhs_new from previous run';
    END

    -- ========================================
    -- 3. Check which optional columns exist in old table
    -- ========================================
    DECLARE @hasDaftarUkt BIT = 0;
    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('keuangan.spp_mhs') AND name = 'id_daftar_ukt'
    )
        SET @hasDaftarUkt = 1;

    PRINT 'id_daftar_ukt exists in old table: ' + CASE @hasDaftarUkt WHEN 1 THEN 'YES' ELSE 'NO (will be added)' END;

    -- ========================================
    -- 4. Create new table with correct column order
    -- ========================================
    CREATE TABLE keuangan.spp_mhs_new (
        -- Primary Key
        id_spp_mhs          UNIQUEIDENTIFIER    NOT NULL,

        -- Foreign Keys & References
        id_kelas_ukt        UNIQUEIDENTIFIER    NULL,
        id_smt              NVARCHAR(10)        NOT NULL,
        id_daftar_ukt       UNIQUEIDENTIFIER    NULL,
        id_reg_pd           UNIQUEIDENTIFIER    NOT NULL,

        -- Payment Base
        tgl_bayar           DATETIME            NOT NULL,
        nominal             DECIMAL(18,2)       NOT NULL,           -- = nominal_ukt_spp

        -- Tagihan Detail (dari GetListTagihan)
        nm_smt              NVARCHAR(50)        NULL,               -- fk_nama_semester
        total_tagihan       DECIMAL(18,2)       NULL DEFAULT 0,     -- total_tagihan
        jumlah_spi          DECIMAL(18,2)       NULL DEFAULT 0,     -- jumlah_spi
        jumlah_denda        DECIMAL(18,2)       NULL DEFAULT 0,     -- jumlah_denda
        jumlah_lainnya      DECIMAL(18,2)       NULL DEFAULT 0,     -- jumlah_lainnya
        sisa_tagihan        DECIMAL(18,2)       NULL DEFAULT 0,     -- sisa_tagihan
        a_cicil             INT                 NULL DEFAULT 0,     -- flag_cicil
        cicilan_ke          INT                 NULL DEFAULT 0,     -- cicilan_ke

        -- Reference & Status
        kode_pembayaran     NVARCHAR(50)        NULL,
        nomor_pin           NVARCHAR(50)        NULL,
        kode_akses          NVARCHAR(50)        NULL,
        bill_ref            NVARCHAR(100)       NULL,
        flag_by             NVARCHAR(50)        NULL,
        ket                 NVARCHAR(500)       NULL,

        -- Audit
        create_date         DATETIME            NOT NULL DEFAULT GETDATE(),
        id_creator          UNIQUEIDENTIFIER    NOT NULL,
        last_update         DATETIME            NOT NULL DEFAULT GETDATE(),
        id_updater          UNIQUEIDENTIFIER    NULL,
        soft_delete         INT                 NOT NULL DEFAULT 0,
        last_sync           DATETIME            NULL,

        CONSTRAINT PK_spp_mhs_new PRIMARY KEY (id_spp_mhs)
    );
    PRINT '+ New table created with correct column order';

    -- ========================================
    -- 5. Copy data — fully dynamic SQL
    --    Build column list based on what exists
    -- ========================================
    DECLARE @insertCols NVARCHAR(MAX);
    DECLARE @selectCols NVARCHAR(MAX);
    DECLARE @sql NVARCHAR(MAX);
    DECLARE @rowCount INT;

    -- Base columns (always exist)
    SET @insertCols = 'id_spp_mhs, id_kelas_ukt, id_smt, ';
    SET @selectCols = 'id_spp_mhs, id_kelas_ukt, id_smt, ';

    -- id_daftar_ukt: copy if exists, else NULL
    IF @hasDaftarUkt = 1
    BEGIN
        SET @insertCols = @insertCols + 'id_daftar_ukt, ';
        SET @selectCols = @selectCols + 'id_daftar_ukt, ';
    END

    -- Remaining columns (always exist)
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

    -- ========================================
    -- 6. Drop old table & rename new
    -- ========================================
    DROP TABLE keuangan.spp_mhs;
    PRINT '- Old table dropped';

    EXEC sp_rename 'keuangan.spp_mhs_new', 'spp_mhs';
    EXEC sp_rename 'keuangan.PK_spp_mhs_new', 'PK_spp_mhs', 'OBJECT';
    PRINT '+ Table renamed to keuangan.spp_mhs';

    -- ========================================
    -- 7. Recreate indexes (via EXEC to avoid compile-time column validation)
    -- ========================================
    EXEC(N'CREATE NONCLUSTERED INDEX IX_spp_mhs_id_daftar_ukt
           ON keuangan.spp_mhs (id_daftar_ukt)
           WHERE id_daftar_ukt IS NOT NULL');
    PRINT '+ Index IX_spp_mhs_id_daftar_ukt created';

    EXEC(N'CREATE NONCLUSTERED INDEX IX_spp_mhs_id_smt
           ON keuangan.spp_mhs (id_smt)');
    PRINT '+ Index IX_spp_mhs_id_smt created';

    EXEC(N'CREATE NONCLUSTERED INDEX IX_spp_mhs_id_reg_pd
           ON keuangan.spp_mhs (id_reg_pd)');
    PRINT '+ Index IX_spp_mhs_id_reg_pd created';

    -- ========================================
    -- 8. Recreate FK constraints (via EXEC to avoid compile-time validation)
    -- ========================================
    IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('keuangan.daftar_ukt'))
    BEGIN
        EXEC(N'ALTER TABLE keuangan.spp_mhs
               ADD CONSTRAINT FK_spp_mhs_daftar_ukt
               FOREIGN KEY (id_daftar_ukt) REFERENCES keuangan.daftar_ukt(id_daftar_ukt)');
        PRINT '+ FK FK_spp_mhs_daftar_ukt created';
    END
    ELSE
    BEGIN
        PRINT '~ Skipped FK: keuangan.daftar_ukt table does not exist yet';
    END

    COMMIT TRANSACTION;
    PRINT '';
    PRINT '=============================================';
    PRINT ' keuangan.spp_mhs recreated successfully!';
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

-- ============================================
-- Verify: column order
-- ============================================
SELECT
    c.column_id     AS [#],
    c.name          AS [Column],
    t.name          AS [Type],
    CASE
        WHEN t.name IN ('nvarchar','varchar') THEN CAST(c.max_length/2 AS VARCHAR)
        WHEN t.name = 'decimal' THEN CAST(c.precision AS VARCHAR) + ',' + CAST(c.scale AS VARCHAR)
        ELSE ''
    END             AS [Size],
    CASE c.is_nullable WHEN 1 THEN 'NULL' ELSE 'NOT NULL' END AS [Nullable],
    dc.definition   AS [Default]
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
WHERE c.object_id = OBJECT_ID('keuangan.spp_mhs')
ORDER BY c.column_id;
GO
