-- Add a_universal column to man_akses.peran
-- Roles with a_universal = 1 bypass the per-app organisasi filter (a_filter_organisasi)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'man_akses' AND TABLE_NAME = 'peran' AND COLUMN_NAME = 'a_universal'
)
BEGIN
    ALTER TABLE man_akses.peran ADD a_universal BIT NOT NULL DEFAULT 0;
END
GO
