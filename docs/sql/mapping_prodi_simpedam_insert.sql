-- =============================================================================
-- MAPPING PRODI SIMPEDAM → MYUNILA
-- =============================================================================
-- Generated: 2026-01-20
-- Total Records: 111
-- Coverage: 100%
--
-- Kriteria Mapping:
-- 1. stat_prodi = 'A' (aktif)
-- 2. id_sp = 'e2b705a7-173e-464a-9fac-509128709515' (Universitas Lampung)
-- 3. id_jenj_didik sesuai kode_strata:
--    - kode_strata 3 (D3) → id_jenj_didik 22
--    - kode_strata 4 (S1 Reguler) → id_jenj_didik 30
--    - kode_strata 7 (S1 Non-Reg/Paralel) → id_jenj_didik 30
-- =============================================================================

-- Create table if not exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'keuangan' AND TABLE_NAME = 'mapping_prodi_simpedam')
BEGIN
    CREATE TABLE keuangan.mapping_prodi_simpedam (
        id INT IDENTITY(1,1) PRIMARY KEY,
        id_prodi_simpedam UNIQUEIDENTIFIER NOT NULL,
        nama_prodi_simpedam VARCHAR(255) NOT NULL,
        kode_strata INT NOT NULL,
        id_sms UNIQUEIDENTIFIER NOT NULL,
        nama_prodi_myunila VARCHAR(255),
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT UQ_prodi_simpedam_strata UNIQUE(id_prodi_simpedam, kode_strata)
    );

    CREATE INDEX IX_mapping_prodi_id_sms ON keuangan.mapping_prodi_simpedam(id_sms);
    CREATE INDEX IX_mapping_prodi_strata ON keuangan.mapping_prodi_simpedam(kode_strata);
END
GO

-- Clear existing data (if re-running)
TRUNCATE TABLE keuangan.mapping_prodi_simpedam;
GO

-- Insert all mappings
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF3A9C-FB49-11E8-A361-00FF1CF018B6', 'ADM NEGARA', 4, 'B2F4C86F-D98A-4906-8A0F-8C7CFB510581', 'Ilmu Administrasi Negara');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF1253-FB49-11E8-A351-00FF1CF018B6', 'AGRIBISNIS', 4, '3E6CC468-DB99-4135-B09F-5E05F527AE51', 'Agribisnis');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEC472-FB49-11E8-A33F-00FF1CF018B6', 'AGRONOMI', 4, '99FB2FA7-E23C-4F4A-959C-9F9714AF3B7C', 'Agronomi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF02451-FB49-11E8-A3A6-00FF1CF018B6', 'AGRONOMI (NON REG)', 7, '99FB2FA7-E23C-4F4A-959C-9F9714AF3B7C', 'Agronomi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEEBE1-FB49-11E8-A346-00FF1CF018B6', 'AGROTEKNOLOGI', 4, 'F306D6BC-3C46-477D-8175-3C6F7D466DD9', 'Agroteknologi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF1256-FB49-11E8-A354-00FF1CF018B6', 'AKUNTANSI', 4, '054222A3-57E4-4480-8F54-E29AFAB57CF1', 'Akuntansi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF04A05-FB49-11E8-A3B3-00FF1CF018B6', 'AKUNTANSI (PARALEL)', 7, '054222A3-57E4-4480-8F54-E29AFAB57CF1', 'Akuntansi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEEBE0-FB49-11E8-A345-00FF1CF018B6', 'ARSITEKTUR', 4, '9F5DBDB5-5079-42DE-A6E4-4F389BA1CC1B', 'Arsitektur');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEC471-FB49-11E8-A33E-00FF1CF018B6', 'BIMBINGAN DAN KONSELING', 4, '41D87BBD-95F4-4F6C-B2EC-8317B9184DB2', 'Bimbingan Dan Konseling');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF097ED-FB49-11E8-A3C7-00FF1CF018B6', 'BIMBINGAN DAN KONSELING (PARALEL)', 7, '41D87BBD-95F4-4F6C-B2EC-8317B9184DB2', 'Bimbingan Dan Konseling');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF124F-FB49-11E8-A34D-00FF1CF018B6', 'BIOLOGI', 4, '05D5723C-409F-4084-9B89-E3D39852E442', 'Biologi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF04A01-FB49-11E8-A3AF-00FF1CF018B6', 'BIOLOGI (NON REGULER)', 7, '05D5723C-409F-4084-9B89-E3D39852E442', 'Biologi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('362A9F34-31A4-11EA-80F4-38AFD7ACBFF0', 'BIOLOGI TERAPAN', 4, '379B9417-9392-44BE-B9D9-9204CC715672', 'Biologi Terapan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF883E-FB49-11E8-A373-00FF1CF018B6', 'BUDIDAYA PERAIRAN/ PERIKANAN', 4, '461EC736-97F7-481E-885A-C85AED924FCD', 'Budidaya Perairan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEE7686-FB49-11E8-A32B-00FF1CF018B6', 'D3 ADMINISTRASI PERKANTORAN', 3, '04834C0F-81F4-460A-9C85-F5FFFE0E00DC', 'Program Studi D3 Administrasi Perkantoran');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEE7683-FB49-11E8-A328-00FF1CF018B6', 'D3 AKUNTANSI', 3, 'D5F1AF6D-268A-413C-AFFF-9FF4DC86B696', 'Akuntansi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEE9D7C-FB49-11E8-A330-00FF1CF018B6', 'D3 HUBUNGAN MASYARAKAT', 3, '10B8A7E3-DBBC-474D-B93A-9CF413ED10A6', 'Program Studi D3 Hubungan Masyarakat');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEE9D7E-FB49-11E8-A332-00FF1CF018B6', 'D3 KEUANGAN DAN PERBANKAN', 3, '9DEF8D9A-4B33-4726-87D6-4DF95BA4AEDD', 'Keuangan Dan Perbankan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEE7682-FB49-11E8-A327-00FF1CF018B6', 'D3 MANAJEMEN INFORMATIKA', 3, '34BB110B-3D47-4170-BBE0-F4A1527B33CC', 'Manajemen Informatika');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEE9D7B-FB49-11E8-A32F-00FF1CF018B6', 'D3 PEMASARAN', 3, '2A21A4A9-AC92-4741-987C-D2B5528CD0E5', 'Manajemen Pemasaran');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEC46C-FB49-11E8-A339-00FF1CF018B6', 'D3 PERKEBUNAN', 3, '5BFB6B75-CBAD-4711-A082-CFBEA8E1B5DD', 'Perkebunan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEE7681-FB49-11E8-A326-00FF1CF018B6', 'D3 PERPAJAKAN', 3, 'CBA5F1F3-B58A-4549-85EF-0ADE97C6A872', 'Perpajakan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEE9D80-FB49-11E8-A334-00FF1CF018B6', 'D3 PERPUSTAKAAN', 3, 'CCFCE6D4-8EA1-43AE-BD58-DEB2E1E43052', 'Program Studi D3 Perpustakaan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEE7685-FB49-11E8-A32A-00FF1CF018B6', 'D3 SURVEY DAN PEMETAAN', 3, '6832394B-91C9-41DD-AFF3-77276AD76C94', 'Teknik Survey dan Pemetaan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEC46A-FB49-11E8-A337-00FF1CF018B6', 'D3 TEKNIK MESIN', 3, '426C4F5C-BABD-454F-8373-758408B34F56', 'Teknik Mesin');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEE9D7F-FB49-11E8-A333-00FF1CF018B6', 'D3 TEKNIK SIPIL', 3, '9573340A-0254-4CD9-B4AC-DD6E174BEAE9', 'Teknik Sipil');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEEBE3-FB49-11E8-A348-00FF1CF018B6', 'EKONOMI PEMBANGUNAN', 4, '0CFCD228-53D4-41A4-A4FA-87C91A83DD95', 'Ekonomi Pembangunan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF049FC-FB49-11E8-A3AA-00FF1CF018B6', 'EKONOMI PEMBANGUNAN (PARALEL)', 7, '0CFCD228-53D4-41A4-A4FA-87C91A83DD95', 'Ekonomi Pembangunan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF3A9D-FB49-11E8-A362-00FF1CF018B6', 'FISIKA', 4, 'C9CFE065-9D4D-4FDC-AAA1-B6C4C4A55748', 'Fisika');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF07387-FB49-11E8-A3BE-00FF1CF018B6', 'FISIKA (NON REGULER)', 7, 'C9CFE065-9D4D-4FDC-AAA1-B6C4C4A55748', 'Fisika');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF6046-FB49-11E8-A364-00FF1CF018B6', 'GEOFISIKA', 4, '6F794916-FF71-443E-AF12-28F15E160569', 'Teknik Geofisika');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEEBDF-FB49-11E8-A344-00FF1CF018B6', 'HORTIKULTURA', 4, 'F306D6BC-3C46-477D-8175-3C6F7D466DD9', 'Agroteknologi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF883C-FB49-11E8-A371-00FF1CF018B6', 'HUBUNGAN INTERNASIONAL', 4, '5798E93D-92CD-47CE-9626-9B9D0CA492F8', 'Hubungan Internasional');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF097F0-FB49-11E8-A3CA-00FF1CF018B6', 'HUBUNGAN INTERNASIONAL (NON REGULER)', 7, '5798E93D-92CD-47CE-9626-9B9D0CA492F8', 'Hubungan Internasional');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF604D-FB49-11E8-A36B-00FF1CF018B6', 'ILMU ADMINISTRASI BISNIS', 4, 'CA57DCC7-BF3C-453F-BC93-F0239F622B0B', 'Ilmu Administrasi Bisnis');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF097EB-FB49-11E8-A3C5-00FF1CF018B6', 'ILMU ADMINISTRASI BISNIS (NON REGULER)', 7, 'CA57DCC7-BF3C-453F-BC93-F0239F622B0B', 'Ilmu Administrasi Bisnis');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF07386-FB49-11E8-A3BD-00FF1CF018B6', 'ILMU ADMINISTRASI NEGARA (NON REGULER)', 7, 'B2F4C86F-D98A-4906-8A0F-8C7CFB510581', 'Ilmu Administrasi Negara');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF3A9A-FB49-11E8-A35F-00FF1CF018B6', 'ILMU HAMA DAN PENY. TUMBUHAN', 4, '29C69D21-E202-40E4-AD28-544C77D68EF7', 'Proteksi Tanaman');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEC470-FB49-11E8-A33D-00FF1CF018B6', 'ILMU HUKUM', 4, 'D8A320AF-5A2E-40FA-82A8-394D8FC12BA4', 'Program Studi S1 Ilmu Hukum');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF02450-FB49-11E8-A3A5-00FF1CF018B6', 'ILMU HUKUM (PARALEL)', 7, 'D8A320AF-5A2E-40FA-82A8-394D8FC12BA4', 'Program Studi S1 Ilmu Hukum');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF8843-FB49-11E8-A378-00FF1CF018B6', 'ILMU KELAUTAN', 4, '8BAA1260-526B-4627-91AC-CC37825DBD1C', 'Ilmu Kelautan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF3A96-FB49-11E8-A35B-00FF1CF018B6', 'ILMU KOMPUTER', 4, '54BBD27B-2376-4CAE-9951-76EF54BD2CA2', 'Ilmu Komputer');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF097EC-FB49-11E8-A3C6-00FF1CF018B6', 'ILMU KOMPUTER (NON REGULER)', 7, '54BBD27B-2376-4CAE-9951-76EF54BD2CA2', 'Ilmu Komputer');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF3937-FB49-11E8-A358-00FF1CF018B6', 'ILMU KOMUNIKASI', 4, '5887767C-AE82-4822-A162-AF7801DC2713', 'Ilmu Komunikasi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF070F9-FB49-11E8-A3B6-00FF1CF018B6', 'ILMU KOMUNIKASI (NON REG)', 7, '5887767C-AE82-4822-A162-AF7801DC2713', 'Ilmu Komunikasi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF124E-FB49-11E8-A34C-00FF1CF018B6', 'ILMU PEMERINTAHAN', 4, '55B56F75-3510-42E9-A88F-08590B697E2A', 'Ilmu Pemerintahan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF04A00-FB49-11E8-A3AE-00FF1CF018B6', 'ILMU PEMERINTAHAN (NON REG)', 7, '55B56F75-3510-42E9-A88F-08590B697E2A', 'Ilmu Pemerintahan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF1258-FB49-11E8-A356-00FF1CF018B6', 'ILMU TANAH', 4, 'BE8DFA61-D864-47AC-A8DA-8C02042220D9', 'Ilmu Tanah');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF883D-FB49-11E8-A372-00FF1CF018B6', 'KEHUTANAN', 4, '6C0F8943-A9E9-4EDF-92A4-11B9A71104DF', 'Kehutanan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEEB66-FB49-11E8-A342-00FF1CF018B6', 'KIMIA', 4, 'C07C0A36-092D-4E26-8C26-A1A8156AB5BD', 'Kimia');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF02454-FB49-11E8-A3A9-00FF1CF018B6', 'KIMIA (NON REGULER)', 7, 'C07C0A36-092D-4E26-8C26-A1A8156AB5BD', 'Kimia');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEC46F-FB49-11E8-A33C-00FF1CF018B6', 'MANAJEMEN', 4, 'BFFE8C02-A6B8-4626-B7F2-C0A7326037CC', 'Manajemen');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF0244F-FB49-11E8-A3A4-00FF1CF018B6', 'MANAJEMEN (PARALEL)', 7, 'BFFE8C02-A6B8-4626-B7F2-C0A7326037CC', 'Manajemen');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF3A94-FB49-11E8-A359-00FF1CF018B6', 'MATEMATIKA', 4, '283675BC-E00E-48FD-B272-C11128C42986', 'Matematika');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF070FA-FB49-11E8-A3B7-00FF1CF018B6', 'MATEMATIKA (NON REGULER)', 7, '283675BC-E00E-48FD-B272-C11128C42986', 'Matematika');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF8845-FB49-11E8-A37A-00FF1CF018B6', 'NUTRISI DAN TEK.PAKAN TERNAK', 4, '488345C9-A39F-4B5F-ACAD-84026F229157', 'Nutrisi dan Teknologi Pakan Ternak');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF3A99-FB49-11E8-A35E-00FF1CF018B6', 'PEND.BHS & SAS IND & DAERAH', 4, 'C8F29749-5A97-455E-8434-535D827907DE', 'Pendidikan Bahasa Dan Sastra Indonesia');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF07384-FB49-11E8-A3BB-00FF1CF018B6', 'PEND.BHS & SAS. IND & DAERAH (PARALEL)', 7, 'C8F29749-5A97-455E-8434-535D827907DE', 'Pendidikan Bahasa Dan Sastra Indonesia');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF3A9E-FB49-11E8-A363-00FF1CF018B6', 'PEND.BHS INGGRIS', 4, '9A454279-B3F5-4748-B5DA-5BE30FF15EA7', 'Pendidikan Bahasa Inggris');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF07388-FB49-11E8-A3BF-00FF1CF018B6', 'PEND.BHS INGGRIS (PARALEL)', 7, '9A454279-B3F5-4748-B5DA-5BE30FF15EA7', 'Pendidikan Bahasa Inggris');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF1254-FB49-11E8-A352-00FF1CF018B6', 'PEND.BIOLOGI', 4, 'D0426799-5C5A-418F-848D-D948F9AD7D9C', 'Pendidikan Biologi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF1257-FB49-11E8-A355-00FF1CF018B6', 'PEND.EKONOMI', 4, 'EE639798-FA5A-4E58-8BB1-33D25B921160', 'Pendidikan Ekonomi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF04A06-FB49-11E8-A3B4-00FF1CF018B6', 'PEND.EKONOMI (PARALEL)', 7, 'EE639798-FA5A-4E58-8BB1-33D25B921160', 'Pendidikan Ekonomi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF1250-FB49-11E8-A34E-00FF1CF018B6', 'PEND.FISIKA', 4, 'E23390FC-99FF-4F10-A0EF-B38A0B9442CC', 'Pendidikan Fisika');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF04A02-FB49-11E8-A3B0-00FF1CF018B6', 'PEND.FISIKA (PARALEL)', 7, 'E23390FC-99FF-4F10-A0EF-B38A0B9442CC', 'Pendidikan Fisika');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF3A98-FB49-11E8-A35D-00FF1CF018B6', 'PEND.GEOGRAFI', 4, 'CDB12842-5CD3-41BB-AC48-463F50DD0A48', 'Pendidikan Geografi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF07383-FB49-11E8-A3BA-00FF1CF018B6', 'PEND.GEOGRAFI (PARALEL)', 7, 'CDB12842-5CD3-41BB-AC48-463F50DD0A48', 'Pendidikan Geografi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF1252-FB49-11E8-A350-00FF1CF018B6', 'PEND.KIMIA', 4, 'A040E17A-C17F-4BB3-80C9-1C246FA4375D', 'Pendidikan Kimia');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEEBE4-FB49-11E8-A349-00FF1CF018B6', 'PEND.MATEMATIKA', 4, '277FAA48-2163-40B4-A90B-84266307C2E3', 'Pendidikan Matematika');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF049FD-FB49-11E8-A3AB-00FF1CF018B6', 'PEND.MATEMATIKA (PARALEL)', 7, '277FAA48-2163-40B4-A90B-84266307C2E3', 'Pendidikan Matematika');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF3A97-FB49-11E8-A35C-00FF1CF018B6', 'PEND.SEJARAH', 4, 'EF30847E-9552-4265-95A7-A6B286FE1B39', 'Pendidikan Sejarah');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF07382-FB49-11E8-A3B9-00FF1CF018B6', 'PEND.SEJARAH (PARALEL)', 7, 'EF30847E-9552-4265-95A7-A6B286FE1B39', 'Pendidikan Sejarah');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF604F-FB49-11E8-A36D-00FF1CF018B6', 'PENDIDIKAN ANAK USIA DINI', 4, '1A8C4017-EC1F-4B66-9E2E-158474265357', 'Pendidikan Guru Pendidikan Anak Usia Dini');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF6048-FB49-11E8-A366-00FF1CF018B6', 'PENDIDIKAN BAHASA PERANCIS', 4, 'F2688B8A-BB40-40B2-BD1F-658CB55DBD9F', 'Pendidikan Bahasa Perancis');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('1F796E52-A62C-11EB-9DAC-7CD30A6DD1C8', 'PENDIDIKAN BHS LAMPUNG', 4, '2CF401C5-F81D-4957-9798-4E79676F9E19', 'Pendidikan Bahasa Lampung');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEEBDE-FB49-11E8-A343-00FF1CF018B6', 'PENDIDIKAN DOKTER', 4, 'EDD11DC8-72ED-4B06-B993-2551D1D4406A', 'Program Studi S1 Kedokteran');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF604A-FB49-11E8-A368-00FF1CF018B6', 'PENDIDIKAN JASMANI', 4, '5528C6E6-0214-4094-9C0A-1E5718F25AAE', 'Pendidikan Jasmani');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF6049-FB49-11E8-A367-00FF1CF018B6', 'PENDIDIKAN MUSIK', 4, 'CA2146E8-2ED0-4D0C-8DD4-4ED21315AFFB', 'Pendidikan Musik');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF6047-FB49-11E8-A365-00FF1CF018B6', 'PENDIDIKAN TARI', 4, '1F89F7DB-7A1A-45EB-BD28-E4F9C223F76F', 'Pendidikan Tari');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF1255-FB49-11E8-A353-00FF1CF018B6', 'PENDIDIKAN TEKNOLOGI INFORMASI', 4, '8984A0CF-8449-439C-B591-E379A89F925C', 'Pendidikan Teknologi Informasi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF0738B-FB49-11E8-A3C2-00FF1CF018B6', 'PENJASKESREK (PARALEL)', 7, '5528C6E6-0214-4094-9C0A-1E5718F25AAE', 'Pendidikan Jasmani');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF1251-FB49-11E8-A34F-00FF1CF018B6', 'PENYULUHAN & KOM.  PERTANIAN', 4, '352B1461-CC9B-4AFB-A531-86ED58937C83', 'Penyuluhan Pertanian');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF8842-FB49-11E8-A377-00FF1CF018B6', 'PENYULUHAN PERTANIAN', 4, '352B1461-CC9B-4AFB-A531-86ED58937C83', 'Penyuluhan Pertanian');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF883F-FB49-11E8-A374-00FF1CF018B6', 'PETERNAKAN', 4, '3CED4DB8-3E68-468D-B862-7DD4C96449F0', 'Peternakan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF604E-FB49-11E8-A36C-00FF1CF018B6', 'PGSD', 4, '95D78C8A-DDC0-4FAA-8982-039360A73056', 'Pendidikan Guru Sekolah Dasar');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF097EE-FB49-11E8-A3C8-00FF1CF018B6', 'PGSD (PARALEL)', 7, '95D78C8A-DDC0-4FAA-8982-039360A73056', 'Pendidikan Guru Sekolah Dasar');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF3A95-FB49-11E8-A35A-00FF1CF018B6', 'PPKN', 4, '41BFF740-5FA3-4F18-8A3B-3292F234B356', 'Pendidikan Pancasila Dan Kewarganegaraan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF070FB-FB49-11E8-A3B8-00FF1CF018B6', 'PPKN (PARALEL)', 7, '41BFF740-5FA3-4F18-8A3B-3292F234B356', 'Pendidikan Pancasila Dan Kewarganegaraan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF6050-FB49-11E8-A36E-00FF1CF018B6', 'PRODUKSI TERNAK', 4, '3CED4DB8-3E68-468D-B862-7DD4C96449F0', 'Peternakan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF8840-FB49-11E8-A375-00FF1CF018B6', 'PROTEKSI TANAMAN', 4, '29C69D21-E202-40E4-AD28-544C77D68EF7', 'Proteksi Tanaman');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('540DDB3A-3324-11E9-B9C3-00FF1CF018B6', 'S1 FARMASI', 4, '5149DBA6-349D-4D4E-9D2A-18745392701B', 'Program Studi S1 Farmasi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEEBE5-FB49-11E8-A34A-00FF1CF018B6', 'SOSEK/AGROBISNIS', 4, '3E6CC468-DB99-4135-B09F-5E05F527AE51', 'Agribisnis');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEC474-FB49-11E8-A341-00FF1CF018B6', 'SOSIOLOGI', 4, '1BAC1562-F0FD-4366-A351-30B1828524A4', 'Sosiologi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF02453-FB49-11E8-A3A8-00FF1CF018B6', 'SOSIOLOGI (NON REG)', 7, '1BAC1562-F0FD-4366-A351-30B1828524A4', 'Sosiologi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF8841-FB49-11E8-A376-00FF1CF018B6', 'SUMBERDAYA AKUATIK', 4, 'F5AEEA8A-431D-4B4E-B1D6-5F0ED1580F22', 'Sumberdaya Akuatik');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF3936-FB49-11E8-A357-00FF1CF018B6', 'TEKNIK ELEKTRO', 4, 'C4B67B31-FD42-4670-BCF0-541FF1C20FF7', 'Teknik Elektro');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF070F8-FB49-11E8-A3B5-00FF1CF018B6', 'TEKNIK ELEKTRO (NON REG)', 7, 'C4B67B31-FD42-4670-BCF0-541FF1C20FF7', 'Teknik Elektro');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEEBE2-FB49-11E8-A347-00FF1CF018B6', 'TEKNIK GEODESI', 4, 'B7C6D212-FB4E-46B0-99FB-A551B29802E7', 'Teknik Geodesi');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF604C-FB49-11E8-A36A-00FF1CF018B6', 'TEKNIK GEOFISIKA', 4, '6F794916-FF71-443E-AF12-28F15E160569', 'Teknik Geofisika');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF097EA-FB49-11E8-A3C4-00FF1CF018B6', 'TEKNIK GEOFISIKA (NON REGULER)', 7, '6F794916-FF71-443E-AF12-28F15E160569', 'Teknik Geofisika');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF8738-FB49-11E8-A36F-00FF1CF018B6', 'TEKNIK INFORMATIKA', 4, 'FC4FC29A-85CA-47B3-8E61-3A9E9E129A88', 'Teknik Informatika');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF3A9B-FB49-11E8-A360-00FF1CF018B6', 'TEKNIK KIMIA', 4, '151CB181-57BD-4686-8E9F-D9BBF83FEFD8', 'Teknik Kimia');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF07385-FB49-11E8-A3BC-00FF1CF018B6', 'TEKNIK KIMIA (NON REGULER)', 7, '151CB181-57BD-4686-8E9F-D9BBF83FEFD8', 'Teknik Kimia');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('C6CD4BAA-E9D0-11EB-BC6B-7CD30A6DD1C8', 'TEKNIK LINGKUNGAN', 4, 'E01B3F97-75BC-4EC1-9FC5-CC874EAB60B1', 'Teknik Lingkungan');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEEBE6-FB49-11E8-A34B-00FF1CF018B6', 'TEKNIK MESIN', 4, '1F0B8DCC-929E-434C-A14D-191468111154', 'Teknik Mesin');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF049FF-FB49-11E8-A3AD-00FF1CF018B6', 'TEKNIK MESIN (NON REGULER)', 7, '1F0B8DCC-929E-434C-A14D-191468111154', 'Teknik Mesin');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF8739-FB49-11E8-A370-00FF1CF018B6', 'TEKNIK PERTANIAN', 4, '03182C14-3A21-44A9-AEDE-28908FC7A488', 'Teknik Pertanian');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEEC473-FB49-11E8-A340-00FF1CF018B6', 'TEKNIK SIPIL', 4, 'AD7F4BD4-6347-4CA1-A285-2BDB4A4D61F4', 'Teknik Sipil');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EF02452-FB49-11E8-A3A7-00FF1CF018B6', 'TEKNIK SIPIL (NON REG)', 7, 'AD7F4BD4-6347-4CA1-A285-2BDB4A4D61F4', 'Teknik Sipil');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF604B-FB49-11E8-A369-00FF1CF018B6', 'TEKNOLOGI HASIL PERTANIAN', 4, 'D2FFBF81-2BFF-4A82-84E8-30B6F16F2E54', 'Teknologi Hasil Pertanian');
INSERT INTO keuangan.mapping_prodi_simpedam (id_prodi_simpedam, nama_prodi_simpedam, kode_strata, id_sms, nama_prodi_myunila) VALUES ('4EEF8844-FB49-11E8-A379-00FF1CF018B6', 'TEKNOLOGI INDUSTRI PERTANIAN', 4, 'B78DF3D5-6007-4BEC-AD89-906BB1295761', 'Teknologi Industri Pertanian');
GO

-- Verify
SELECT
    'Total Records' as metric,
    COUNT(*) as value
FROM keuangan.mapping_prodi_simpedam
UNION ALL
SELECT
    'Unique id_sms',
    COUNT(DISTINCT id_sms)
FROM keuangan.mapping_prodi_simpedam
UNION ALL
SELECT
    'D3 Programs (strata=3)',
    COUNT(*)
FROM keuangan.mapping_prodi_simpedam
WHERE kode_strata = 3
UNION ALL
SELECT
    'S1 Reguler (strata=4)',
    COUNT(*)
FROM keuangan.mapping_prodi_simpedam
WHERE kode_strata = 4
UNION ALL
SELECT
    'S1 Non-Reg (strata=7)',
    COUNT(*)
FROM keuangan.mapping_prodi_simpedam
WHERE kode_strata = 7;
GO
