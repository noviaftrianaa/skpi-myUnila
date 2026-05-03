-- ============================================================================
-- myunila.akreditasi_prodi_alias — alias BAN-PT name → pdrd.sms.id_sms
-- ============================================================================
-- Saat admin pakai "Map Manual" di Mapping Unit page untuk BAN-PT prodi yang
-- gagal auto-match, alias-nya disimpan di sini. Sync berikutnya akan baca tabel
-- ini sebagai bridge supaya BAN-PT name bisa direlay ke id_sms yang benar.
--
-- Composite PK (nm_prodi_banpt + jenjang_banpt) — 1 BAN-PT prodi ke 1 id_sms.
-- ============================================================================

IF SCHEMA_ID('myunila') IS NULL EXEC('CREATE SCHEMA myunila');
GO

IF OBJECT_ID('myunila.akreditasi_prodi_alias', 'U') IS NULL
BEGIN
    CREATE TABLE myunila.akreditasi_prodi_alias (
        nm_prodi_banpt   NVARCHAR(255)    NOT NULL,
        jenjang_banpt    VARCHAR(20)      NOT NULL,
        id_sms           UNIQUEIDENTIFIER NOT NULL,
        created_at       DATETIME2(3)     NOT NULL DEFAULT SYSDATETIME(),
        updated_at       DATETIME2(3)     NOT NULL DEFAULT SYSDATETIME(),
        created_by       UNIQUEIDENTIFIER NULL,
        notes            NVARCHAR(500)    NULL,
        CONSTRAINT pk_akreditasi_prodi_alias PRIMARY KEY (nm_prodi_banpt, jenjang_banpt)
    );
    CREATE INDEX ix_akr_alias_id_sms ON myunila.akreditasi_prodi_alias (id_sms);
END
GO
