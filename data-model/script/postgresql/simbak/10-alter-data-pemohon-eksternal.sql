-- ============================================================
-- ALTER: tambah kolom untuk PM-ALIH dari luar Unila (eksternal)
-- Date: 2026-05-12
-- ============================================================
-- Kolom baru untuk mendukung pendaftaran PM-ALIH oleh admin BAK/fakultas
-- atas nama calon mahasiswa eksternal (tidak punya SSO Unila).

ALTER TABLE layanan.data_pemohon
    ADD COLUMN IF NOT EXISTS nm_jenjang_asal VARCHAR(50)  NULL,
    ADD COLUMN IF NOT EXISTS nm_prodi_asal   VARCHAR(200) NULL,
    ADD COLUMN IF NOT EXISTS email_pemohon   VARCHAR(150) NULL,
    ADD COLUMN IF NOT EXISTS no_hp_pemohon   VARCHAR(30)  NULL;

COMMENT ON COLUMN layanan.data_pemohon.nm_jenjang_asal IS 'Jenjang asal pemohon eksternal (D3/S1), untuk validasi hierarki alih program';
COMMENT ON COLUMN layanan.data_pemohon.nm_prodi_asal   IS 'Nama prodi asal pemohon eksternal di PT lama';
COMMENT ON COLUMN layanan.data_pemohon.email_pemohon   IS 'Email kontak pemohon eksternal (untuk notifikasi, karena tidak punya akun SSO)';
COMMENT ON COLUMN layanan.data_pemohon.no_hp_pemohon   IS 'Nomor HP/WhatsApp pemohon eksternal (untuk notifikasi)';
