-- =====================================================
-- DDL: man_akses.aplikasi_organisasi
-- Whitelist organisasi yang boleh mengakses aplikasi tertentu
-- Hanya berlaku jika man_akses.aplikasi.a_filter_organisasi = 1
-- =====================================================

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'aplikasi_organisasi'
)
BEGIN
    CREATE TABLE man_akses.aplikasi_organisasi (
        id_aplikasi_organisasi UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        id_aplikasi            UNIQUEIDENTIFIER NOT NULL,
        id_organisasi          UNIQUEIDENTIFIER NOT NULL,
        a_include_children     BIT              NOT NULL DEFAULT 0,
        a_aktif                BIT              NOT NULL DEFAULT 1,
        soft_delete            BIT              NOT NULL DEFAULT 0,
        tgl_create             DATETIME         NOT NULL DEFAULT GETDATE(),
        last_update            DATETIME         NULL,
        last_sync              DATETIME         NULL,
        id_creator             UNIQUEIDENTIFIER NULL,
        id_updater             UNIQUEIDENTIFIER NULL,

        CONSTRAINT PK_aplikasi_organisasi PRIMARY KEY (id_aplikasi_organisasi),

        CONSTRAINT FK_app_org_aplikasi FOREIGN KEY (id_aplikasi)
            REFERENCES man_akses.aplikasi (id_aplikasi),

        CONSTRAINT FK_app_org_organisasi FOREIGN KEY (id_organisasi)
            REFERENCES man_akses.unit_organisasi (id_organisasi)
    );

    CREATE INDEX IX_app_org_aplikasi ON man_akses.aplikasi_organisasi (id_aplikasi);
    CREATE INDEX IX_app_org_organisasi ON man_akses.aplikasi_organisasi (id_organisasi);
    CREATE UNIQUE INDEX UQ_app_org_unique ON man_akses.aplikasi_organisasi (id_aplikasi, id_organisasi)
        WHERE soft_delete = 0;

    PRINT 'Created: man_akses.aplikasi_organisasi';
END
ELSE
BEGIN
    PRINT 'Skipped: man_akses.aplikasi_organisasi already exists';
END
GO
