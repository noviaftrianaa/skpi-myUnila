-- =============================================================================
-- ALTER sikep.pegawai — tambah kolom UUID stabil untuk naming foto/dokumen.
--
-- Konteks: foto tendik saat ini di-naming photos/tendik/{NIP}.jpg. NIP bisa
-- berubah (pegawai dengan SK baru) atau kosong (honorer). Kolom UUID ini
-- menyediakan identifier stabil yang independen dari NIP.
--
-- Setelah migrasi: ubah backend (MePhotoController + tools upload) untuk
-- naming photos/tendik/{uuid_pegawai}.jpg.
-- =============================================================================

USE pdut;
GO

-- 1. Tambah kolom uuid_pegawai (NOT NULL dengan default NEWID supaya baris
--    existing otomatis terisi UUID pada saat ALTER).
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('sikep.pegawai') AND name = 'uuid_pegawai'
)
BEGIN
    ALTER TABLE sikep.pegawai
    ADD uuid_pegawai UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID();
END
GO

-- 2. Unique index pada uuid_pegawai untuk lookup by UUID.
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('sikep.pegawai') AND name = 'idx_pegawai_uuid'
)
BEGIN
    CREATE UNIQUE INDEX idx_pegawai_uuid ON sikep.pegawai(uuid_pegawai);
END
GO

-- 3. (Sanity check) tampilkan 5 baris pertama untuk verifikasi UUID terisi.
SELECT TOP 5 id_pegawai, nm_pegawai, nip, uuid_pegawai
FROM sikep.pegawai
ORDER BY id_pegawai;
GO

-- =============================================================================
-- ROLLBACK (kalau perlu undo)
-- =============================================================================
-- DROP INDEX idx_pegawai_uuid ON sikep.pegawai;
-- ALTER TABLE sikep.pegawai DROP COLUMN uuid_pegawai;
-- =============================================================================
