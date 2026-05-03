-- ============================================================================
-- myunila.akreditasi_sync_log — audit trail tabel untuk sync akreditasi BAN-PT
-- ============================================================================
-- Setiap eksekusi sync (manual via integrator) menulis 1 row header + N rows
-- detail (ke akreditasi_sync_log_detail). Detail menyimpan per-prodi action
-- (insert/update/skip/error) supaya bisa dibuka di modal preview.
--
-- Skema 'myunila' dibuat khusus untuk integrator audit data (terpisah dari
-- pdrd source-of-truth). Run sekali via psql/sqlcmd.
-- ============================================================================

IF SCHEMA_ID('myunila') IS NULL EXEC('CREATE SCHEMA myunila');
GO

-- ============================================================================
-- HEADER: 1 row per eksekusi sync
-- ============================================================================
IF OBJECT_ID('myunila.akreditasi_sync_log', 'U') IS NULL
BEGIN
    CREATE TABLE myunila.akreditasi_sync_log (
        id_log              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        sumber              VARCHAR(20)      NOT NULL DEFAULT 'banpt',  -- banpt | pddikti | siakadu
        mode                VARCHAR(20)      NOT NULL,                  -- preview | apply
        triggered_by        UNIQUEIDENTIFIER NULL,                      -- id_pengguna (admin)
        triggered_username  NVARCHAR(100)    NULL,
        status              VARCHAR(20)      NOT NULL,                  -- running | success | failed
        started_at          DATETIME2(3)     NOT NULL DEFAULT SYSDATETIME(),
        finished_at         DATETIME2(3)     NULL,
        duration_ms         INT              NULL,
        total_fetched       INT              NULL,                      -- total record dari BAN-PT
        total_matched       INT              NULL,                      -- berhasil di-match ke pdrd.sms
        total_unmatched     INT              NULL,                      -- nm_prodi+jenjang tidak ketemu
        total_inserted      INT              NULL,
        total_updated       INT              NULL,
        total_unchanged     INT              NULL,
        error_message       NVARCHAR(MAX)    NULL,
        snapshot_json       NVARCHAR(MAX)    NULL,                      -- raw fetch (gzip-base64 jika besar)
        CONSTRAINT pk_akreditasi_sync_log PRIMARY KEY (id_log)
    );

    CREATE INDEX ix_akreditasi_sync_log_started_at ON myunila.akreditasi_sync_log (started_at DESC);
    CREATE INDEX ix_akreditasi_sync_log_sumber_mode ON myunila.akreditasi_sync_log (sumber, mode, started_at DESC);
END
GO

-- ============================================================================
-- DETAIL: 1 row per prodi-action (preview row atau actual change)
-- ============================================================================
IF OBJECT_ID('myunila.akreditasi_sync_log_detail', 'U') IS NULL
BEGIN
    CREATE TABLE myunila.akreditasi_sync_log_detail (
        id_detail               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        id_log                  UNIQUEIDENTIFIER NOT NULL,
        id_sms                  UNIQUEIDENTIFIER NULL,                  -- target prodi (NULL kalau unmatched)
        nm_prodi_external       NVARCHAR(255)    NULL,                  -- nama prodi dari BAN-PT
        jenjang_external        VARCHAR(20)      NULL,                  -- S1, D-III, dll dari BAN-PT
        nm_prodi_pdrd           NVARCHAR(255)    NULL,                  -- nama matched dari pdrd.sms
        jenjang_pdrd            VARCHAR(20)      NULL,                  -- jenjang matched
        action                  VARCHAR(20)      NOT NULL,              -- insert | update | unchanged | unmatched | skipped | error
        old_id_akred            NUMERIC(2,0)     NULL,                  -- nilai akreditasi lama (id ref.nilai_akred)
        new_id_akred            NUMERIC(2,0)     NULL,                  -- nilai akreditasi baru
        old_nm_akred            NVARCHAR(50)     NULL,                  -- contoh: "B"
        new_nm_akred            NVARCHAR(50)     NULL,                  -- contoh: "Unggul"
        old_sk                  VARCHAR(255)     NULL,
        new_sk                  VARCHAR(255)     NULL,
        old_tgl_sk              DATE             NULL,
        new_tgl_sk              DATE             NULL,
        old_tst_sk              DATE             NULL,                  -- expired date lama
        new_tst_sk              DATE             NULL,                  -- expired date baru
        id_lemb_akred           CHAR(5)          NULL,                  -- 00001=BAN PT
        notes                   NVARCHAR(500)    NULL,                  -- error message atau alasan skip
        CONSTRAINT pk_akreditasi_sync_log_detail PRIMARY KEY (id_detail),
        CONSTRAINT fk_akreditasi_sync_log_detail_log FOREIGN KEY (id_log)
            REFERENCES myunila.akreditasi_sync_log(id_log) ON DELETE CASCADE
    );

    CREATE INDEX ix_akreditasi_sync_log_detail_log ON myunila.akreditasi_sync_log_detail (id_log);
    CREATE INDEX ix_akreditasi_sync_log_detail_action ON myunila.akreditasi_sync_log_detail (id_log, action);
    CREATE INDEX ix_akreditasi_sync_log_detail_sms ON myunila.akreditasi_sync_log_detail (id_sms) WHERE id_sms IS NOT NULL;
END
GO
