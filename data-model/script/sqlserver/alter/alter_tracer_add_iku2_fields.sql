-- ============================================================================
-- ALTER TABLE tracer — Tambah field untuk sync dari Tracer Study Unila
-- Tanggal: 7 Mei 2026
--
-- Referensi: plan-migrasi-sync-myunila-gateway.md (3 Mei 2026)
-- Source: bitbucket.org/mahendraunila/tracer-study-unila
--
-- Data existing: 21.859 rows di hasil_tracer_study,
--                0 rows di hasil_tracer_atasan, 241 di umr_wilayah
-- ============================================================================

USE pdut_staging;
GO

-- ============================================================================
-- 1. HASIL_TRACER_STUDY — 5 kolom baru (IKU 2)
-- ============================================================================

-- BLOCKER IKU 2: jenis wirausaha (founder vs freelancer, bobot IKU berbeda)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'tracer' AND TABLE_NAME = 'hasil_tracer_study'
    AND COLUMN_NAME = 'jenis_wirausaha'
)
BEGIN
    ALTER TABLE tracer.hasil_tracer_study
        ADD jenis_wirausaha VARCHAR(20) NULL;
END
GO

-- Info pekerjaan terakhir (untuk status_lulusan = 0/belum bekerja)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'tracer' AND TABLE_NAME = 'hasil_tracer_study'
    AND COLUMN_NAME = 'c_kerja_terakhir'
)
BEGIN
    ALTER TABLE tracer.hasil_tracer_study
        ADD c_kerja_terakhir VARCHAR(255) NULL;
END
GO

-- Kota tempat kerja (lebih spesifik dari id_wil yang level kabupaten)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'tracer' AND TABLE_NAME = 'hasil_tracer_study'
    AND COLUMN_NAME = 'id_wil_kota'
)
BEGIN
    ALTER TABLE tracer.hasil_tracer_study
        ADD id_wil_kota CHAR(8) NULL;
END
GO

-- Kode respons perusahaan
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'tracer' AND TABLE_NAME = 'hasil_tracer_study'
    AND COLUMN_NAME = 'respon_perusahaan'
)
BEGIN
    ALTER TABLE tracer.hasil_tracer_study
        ADD respon_perusahaan CHAR(10) NULL;
END
GO

-- Kode wawancara
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'tracer' AND TABLE_NAME = 'hasil_tracer_study'
    AND COLUMN_NAME = 'wawancara'
)
BEGIN
    ALTER TABLE tracer.hasil_tracer_study
        ADD wawancara CHAR(10) NULL;
END
GO

-- ============================================================================
-- 2. HASIL_TRACER_ATASAN — 4 kolom baru (DUDI survey data)
--
-- Mapping field dari tracer system:
--   tracer.bidang_tempat_kerja → myunila.bidang_tempat_bekerja (sudah ada, nama beda)
--   tracer.kepuasan_terhadap_alumni → BARU (JSON matrix)
--   tracer.kompetensi_perusahaan → BARU (JSON matrix)
--   tracer.alamat_tmpt_kerja → BARU
--   tracer.metode_pembelajaran → BARU (JSON)
-- ============================================================================

-- Data kepuasan atasan terhadap alumni (JSON matrix scoring)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'tracer' AND TABLE_NAME = 'hasil_tracer_atasan'
    AND COLUMN_NAME = 'kepuasan_terhadap_alumni'
)
BEGIN
    ALTER TABLE tracer.hasil_tracer_atasan
        ADD kepuasan_terhadap_alumni NVARCHAR(MAX) NULL;
END
GO

-- Kompetensi yang dibutuhkan perusahaan (JSON matrix scoring)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'tracer' AND TABLE_NAME = 'hasil_tracer_atasan'
    AND COLUMN_NAME = 'kompetensi_perusahaan'
)
BEGIN
    ALTER TABLE tracer.hasil_tracer_atasan
        ADD kompetensi_perusahaan NVARCHAR(MAX) NULL;
END
GO

-- Alamat tempat kerja atasan
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'tracer' AND TABLE_NAME = 'hasil_tracer_atasan'
    AND COLUMN_NAME = 'alamat_tmpt_kerja'
)
BEGIN
    ALTER TABLE tracer.hasil_tracer_atasan
        ADD alamat_tmpt_kerja VARCHAR(500) NULL;
END
GO

-- Metode pembelajaran yang direkomendasikan atasan (JSON)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'tracer' AND TABLE_NAME = 'hasil_tracer_atasan'
    AND COLUMN_NAME = 'metode_pembelajaran'
)
BEGIN
    ALTER TABLE tracer.hasil_tracer_atasan
        ADD metode_pembelajaran NVARCHAR(MAX) NULL;
END
GO

-- ============================================================================
-- 3. Fix data status_lulusan: mapping 0 -> 4 (Belum Bekerja)
--
-- Sistem tracer lama: 0=Belum Bekerja, 1=Bekerja, 2=Wirausaha, 3=Lanjut Studi
-- API myunila enum:   1=Bekerja, 2=Wirausaha, 3=Lanjut, 4=Belum Bekerja, 5=?
--
-- 6.307 rows dengan status_lulusan=0 perlu di-remap ke 4
-- UNCOMMENT setelah dikonfirmasi mapping benar
-- ============================================================================

-- UPDATE tracer.hasil_tracer_study
--     SET status_lulusan = 4,
--         last_update = GETDATE()
--     WHERE status_lulusan = 0 AND soft_delete = 0;
-- GO

-- ============================================================================
-- 4. Verifikasi
-- ============================================================================

PRINT '=== hasil_tracer_study — kolom baru ===';
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH AS max_len, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'tracer' AND TABLE_NAME = 'hasil_tracer_study'
    AND COLUMN_NAME IN ('jenis_wirausaha','c_kerja_terakhir','id_wil_kota','respon_perusahaan','wawancara')
ORDER BY COLUMN_NAME;

PRINT '=== hasil_tracer_atasan — kolom baru ===';
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH AS max_len, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'tracer' AND TABLE_NAME = 'hasil_tracer_atasan'
    AND COLUMN_NAME IN ('kepuasan_terhadap_alumni','kompetensi_perusahaan','alamat_tmpt_kerja','metode_pembelajaran')
ORDER BY COLUMN_NAME;
GO
