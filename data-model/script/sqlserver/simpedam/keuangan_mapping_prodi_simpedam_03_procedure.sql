/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     21/01/2026 09:00:00                          */
/* Description:    Stored Procedure untuk auto-mapping prodi    */
/*==============================================================*/

/*==============================================================*/
/* Procedure: sp_upsert_mapping_prodi_simpedam                  */
/* Fungsi: Insert atau update mapping untuk 1 prodi SIMPEDAM    */
/* Dipanggil oleh keuangan-service saat sync data               */
/*==============================================================*/
CREATE OR ALTER PROCEDURE keuangan.sp_upsert_mapping_prodi_simpedam
    @id_prodi_simpedam  uniqueidentifier,
    @nama_prodi_simpedam varchar(255),
    @kode_strata        numeric(2),
    @id_creator         uniqueidentifier = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_sms uniqueidentifier = NULL;
    DECLARE @nama_prodi_myunila varchar(255) = NULL;
    DECLARE @id_jenj_didik numeric(2);
    DECLARE @now datetime = GETDATE();

    -- Default creator jika NULL
    IF @id_creator IS NULL
        SET @id_creator = '00000000-0000-0000-0000-000000000000';

    -- Mapping kode_strata ke id_jenj_didik
    SET @id_jenj_didik = CASE
        WHEN @kode_strata = 3 THEN 22  -- D3
        WHEN @kode_strata IN (4, 7) THEN 30  -- S1
        ELSE NULL
    END;

    -- Skip jika kode_strata tidak valid
    IF @id_jenj_didik IS NULL
    BEGIN
        RAISERROR('Invalid kode_strata: %d. Must be 3, 4, or 7.', 16, 1, @kode_strata);
        RETURN;
    END

    -- Cek apakah sudah ada di mapping table
    IF EXISTS (
        SELECT 1 FROM keuangan.mapping_prodi_simpedam
        WHERE id_prodi_simpedam = @id_prodi_simpedam
        AND kode_strata = @kode_strata
    )
    BEGIN
        -- Update last_sync saja
        UPDATE keuangan.mapping_prodi_simpedam
        SET last_sync = @now,
            last_update = @now,
            id_updater = @id_creator
        WHERE id_prodi_simpedam = @id_prodi_simpedam
        AND kode_strata = @kode_strata;

        RETURN;
    END

    -- Coba auto-match berdasarkan nama (exact match)
    SELECT TOP 1
        @id_sms = id_sms,
        @nama_prodi_myunila = nm_lemb
    FROM pdrd.sms
    WHERE stat_prodi = 'A'
        AND id_sp = 'e2b705a7-173e-464a-9fac-509128709515'  -- UNILA
        AND id_jenj_didik = @id_jenj_didik
        AND UPPER(TRIM(nm_lemb)) = UPPER(TRIM(@nama_prodi_simpedam));

    -- Jika exact match tidak ditemukan, coba dengan nama yang dibersihkan
    IF @id_sms IS NULL
    BEGIN
        DECLARE @nama_clean varchar(255);

        -- Untuk D3, hapus prefix "D3 " atau "D3"
        IF @kode_strata = 3
            SET @nama_clean = REPLACE(REPLACE(@nama_prodi_simpedam, 'D3 ', ''), 'D3', '');
        -- Untuk NON-REG/PARALEL, hapus suffix
        ELSE IF @kode_strata = 7
        BEGIN
            SET @nama_clean = @nama_prodi_simpedam;
            SET @nama_clean = REPLACE(@nama_clean, ' (NON REG)', '');
            SET @nama_clean = REPLACE(@nama_clean, ' (NON REGULER)', '');
            SET @nama_clean = REPLACE(@nama_clean, ' (PARALEL)', '');
        END
        ELSE
            SET @nama_clean = @nama_prodi_simpedam;

        SET @nama_clean = TRIM(@nama_clean);

        -- Coba match dengan nama yang dibersihkan
        SELECT TOP 1
            @id_sms = id_sms,
            @nama_prodi_myunila = nm_lemb
        FROM pdrd.sms
        WHERE stat_prodi = 'A'
            AND id_sp = 'e2b705a7-173e-464a-9fac-509128709515'
            AND id_jenj_didik = @id_jenj_didik
            AND (
                UPPER(TRIM(nm_lemb)) = UPPER(@nama_clean)
                OR UPPER(nm_lemb) LIKE '%' + UPPER(@nama_clean) + '%'
            );
    END

    -- Insert ke mapping table (dengan atau tanpa id_sms)
    INSERT INTO keuangan.mapping_prodi_simpedam
        (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms,
         nama_prodi_myunila, is_active, create_date, id_creator,
         last_update, soft_delete, last_sync)
    VALUES
        (@id_prodi_simpedam, @nama_prodi_simpedam, @kode_strata,
         ISNULL(@id_sms, '00000000-0000-0000-0000-000000000000'),  -- Placeholder jika unmapped
         @nama_prodi_myunila,
         CASE WHEN @id_sms IS NOT NULL THEN 1 ELSE 0 END,  -- inactive jika unmapped
         @now, @id_creator, @now, 0, @now);

    -- Return status
    IF @id_sms IS NOT NULL
        SELECT 'MAPPED' as status, @id_sms as id_sms, @nama_prodi_myunila as nama_prodi_myunila;
    ELSE
        SELECT 'UNMAPPED' as status, NULL as id_sms, NULL as nama_prodi_myunila;
END
go

/*==============================================================*/
/* Procedure: sp_sync_mapping_from_temp_daftar_ukt              */
/* Fungsi: Bulk sync mapping dari tabel temp_daftar_ukt         */
/* Dipanggil setelah sync DaftarUKT dari SIMPEDAM               */
/*==============================================================*/
CREATE OR ALTER PROCEDURE keuangan.sp_sync_mapping_from_temp_daftar_ukt
    @id_creator uniqueidentifier = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @total int = 0;
    DECLARE @mapped int = 0;
    DECLARE @unmapped int = 0;

    DECLARE @id_prodi_simpedam uniqueidentifier;
    DECLARE @nama_prodi varchar(255);
    DECLARE @kode_strata numeric(2);

    -- Default creator
    IF @id_creator IS NULL
        SET @id_creator = '00000000-0000-0000-0000-000000000000';

    -- Cursor untuk iterate setiap prodi unik
    DECLARE prodi_cursor CURSOR FOR
        SELECT DISTINCT id_prodi, nama_prodi, kode_strata
        FROM keuangan.temp_daftar_ukt
        WHERE id_prodi IS NOT NULL;

    OPEN prodi_cursor;

    FETCH NEXT FROM prodi_cursor INTO @id_prodi_simpedam, @nama_prodi, @kode_strata;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @total = @total + 1;

        -- Panggil procedure upsert
        EXEC keuangan.sp_upsert_mapping_prodi_simpedam
            @id_prodi_simpedam,
            @nama_prodi,
            @kode_strata,
            @id_creator;

        FETCH NEXT FROM prodi_cursor INTO @id_prodi_simpedam, @nama_prodi, @kode_strata;
    END

    CLOSE prodi_cursor;
    DEALLOCATE prodi_cursor;

    -- Hitung hasil
    SELECT @mapped = COUNT(*) FROM keuangan.mapping_prodi_simpedam WHERE is_active = 1;
    SELECT @unmapped = COUNT(*) FROM keuangan.mapping_prodi_simpedam WHERE is_active = 0;

    -- Return summary
    SELECT
        @total as total_processed,
        @mapped as mapped,
        @unmapped as unmapped,
        GETDATE() as sync_at;
END
go

/*==============================================================*/
/* Procedure: sp_manual_map_prodi_simpedam                      */
/* Fungsi: Manual mapping untuk prodi yang unmapped             */
/*==============================================================*/
CREATE OR ALTER PROCEDURE keuangan.sp_manual_map_prodi_simpedam
    @id_prodi_simpedam  uniqueidentifier,
    @kode_strata        numeric(2),
    @id_sms             uniqueidentifier,
    @id_updater         uniqueidentifier = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @nama_prodi_myunila varchar(255);
    DECLARE @now datetime = GETDATE();

    IF @id_updater IS NULL
        SET @id_updater = '00000000-0000-0000-0000-000000000000';

    -- Validasi id_sms exists
    SELECT @nama_prodi_myunila = nm_lemb
    FROM pdrd.sms
    WHERE id_sms = @id_sms;

    IF @nama_prodi_myunila IS NULL
    BEGIN
        RAISERROR('id_sms not found in pdrd.sms', 16, 1);
        RETURN;
    END

    -- Update mapping
    UPDATE keuangan.mapping_prodi_simpedam
    SET id_sms = @id_sms,
        nama_prodi_myunila = @nama_prodi_myunila,
        is_active = 1,
        last_update = @now,
        id_updater = @id_updater
    WHERE id_prodi_simpedam = @id_prodi_simpedam
    AND kode_strata = @kode_strata;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Mapping not found for id_prodi_simpedam and kode_strata', 16, 1);
        RETURN;
    END

    SELECT 'SUCCESS' as status, @id_sms as id_sms, @nama_prodi_myunila as nama_prodi_myunila;
END
go

/*==============================================================*/
/* View: v_mapping_prodi_simpedam_unmapped                      */
/* Untuk melihat prodi yang belum ter-mapping                   */
/*==============================================================*/
CREATE OR ALTER VIEW keuangan.v_mapping_prodi_simpedam_unmapped
AS
SELECT
    m.id_mapping,
    m.id_prodi_simpedam,
    m.nama_prodi_simpedam,
    m.kode_strata,
    CASE m.kode_strata
        WHEN 3 THEN 'D3'
        WHEN 4 THEN 'S1 REGULER'
        WHEN 7 THEN 'S1 NON-REG/PARALEL'
    END as jenjang,
    m.create_date
FROM keuangan.mapping_prodi_simpedam m
WHERE m.is_active = 0
  AND m.soft_delete = 0;
go

/*==============================================================*/
/* View: v_mapping_prodi_simpedam_full                          */
/* View lengkap dengan join ke pdrd.sms                         */
/*==============================================================*/
CREATE OR ALTER VIEW keuangan.v_mapping_prodi_simpedam_full
AS
SELECT
    m.id_mapping,
    m.id_prodi_simpedam,
    m.nama_prodi_simpedam,
    m.kode_strata,
    CASE m.kode_strata
        WHEN 3 THEN 'D3'
        WHEN 4 THEN 'S1 REGULER'
        WHEN 7 THEN 'S1 NON-REG/PARALEL'
    END as jenjang_simpedam,
    m.id_sms,
    s.nm_lemb as nama_prodi_myunila,
    s.id_jenj_didik,
    j.nm_jenj_didik as jenjang_myunila,
    m.is_active,
    m.create_date,
    m.last_sync
FROM keuangan.mapping_prodi_simpedam m
LEFT JOIN pdrd.sms s ON m.id_sms = s.id_sms
LEFT JOIN ref.jenjang_pendidikan j ON s.id_jenj_didik = j.id_jenj_didik
WHERE m.soft_delete = 0;
go

/*==============================================================*/
/* Function: fn_get_id_sms_from_simpedam                        */
/* Untuk lookup id_sms berdasarkan id_prodi SIMPEDAM            */
/*==============================================================*/
CREATE OR ALTER FUNCTION keuangan.fn_get_id_sms_from_simpedam
(
    @id_prodi_simpedam uniqueidentifier,
    @kode_strata numeric(2)
)
RETURNS uniqueidentifier
AS
BEGIN
    DECLARE @id_sms uniqueidentifier;

    SELECT @id_sms = id_sms
    FROM keuangan.mapping_prodi_simpedam
    WHERE id_prodi_simpedam = @id_prodi_simpedam
      AND kode_strata = @kode_strata
      AND is_active = 1
      AND soft_delete = 0;

    RETURN @id_sms;
END
go
