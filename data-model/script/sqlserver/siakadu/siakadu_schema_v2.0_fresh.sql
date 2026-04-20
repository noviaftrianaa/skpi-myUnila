-- ============================================================================
-- SIAKADU Schema v2.0 — FRESH DEPLOY (sekali jalan, clean)
-- Target: SQL Server 2019 — database kosong atau siakadu schema kosong
-- Generated: 2026-04-20
--
-- Script ini akan:
--   1. Menjalankan v1.0 fresh (36 tabel dasar)
--   2. Drop tabel v1 yang sudah digantikan (peserta_didik, reg_pd) + FK-nya
--   3. Build tabel v2 (siakadu.mahasiswa flat + siakadu.keluarga_mhs)
--   4. Tambah kolom nim ke kuliah_mhs + spp_mhs
--   5. Seed reference data (jenjang, semester, status_mahasiswa)
--
-- Hasil akhir: schema siakadu clean v2.0, siap untuk sync via myunila-service.
--
-- CARA PAKAI:
--   1. Buat database kosong atau pastikan schema siakadu kosong:
--      CREATE SCHEMA siakadu;
--   2. Run file ini sekali:
--      sqlcmd -S <server> -d <database> -i siakadu_schema_v2.0_fresh.sql
--   3. Atau via SSMS — Execute.
--
-- CATATAN:
--   - Jangan jalankan di DB yang sudah ada data siakadu v1 — pakai script
--     siakadu_migrate_v1_to_v2.sql untuk migrasi data.
--   - Script ini IDEMPOTENT — aman dijalankan ulang (IF NOT EXISTS guards).
-- ============================================================================

SET NOCOUNT ON;
GO

PRINT '=== SIAKADU Schema v2.0 Fresh Deploy — Start ==='
GO

-- ============================================================================
-- STEP 1: Pastikan schema siakadu ada
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'siakadu')
BEGIN
    EXEC('CREATE SCHEMA siakadu');
    PRINT 'STEP 1: Schema siakadu created';
END
ELSE
    PRINT 'STEP 1: Schema siakadu already exists';
GO

-- ============================================================================
-- STEP 2: Run v1.0 schema (36 tabel) — hanya jika belum ada
-- Detect dari keberadaan tabel kunci: sms
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id=s.schema_id
               WHERE s.name='siakadu' AND t.name='sms')
BEGIN
    PRINT 'STEP 2: Running v1.0 base schema — ~36 tables...'
    PRINT '        (Jalankan manual: :r siakadu_schema_v1.0_fresh.sql)'
    PRINT '        atau include sebelum script ini.'
    RAISERROR('Base schema v1.0 belum di-deploy. Jalankan siakadu_schema_v1.0_fresh.sql dulu.', 16, 1)
    RETURN;
END
ELSE
    PRINT 'STEP 2: Base tables detected — lanjut ke v2 upgrade'
GO

-- ============================================================================
-- STEP 3: Drop FK + tabel v1 yang digantikan oleh v2
-- peserta_didik + reg_pd → digantikan oleh siakadu.mahasiswa (flat table)
-- ============================================================================
PRINT 'STEP 3: Drop v1 tables (peserta_didik + reg_pd) yang digantikan v2...'

-- 3a. Drop FK yang refer ke reg_pd / peserta_didik
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_anggota_akt_mhs_reg_pd')
    ALTER TABLE siakadu.anggota_akt_mhs DROP CONSTRAINT fk_anggota_akt_mhs_reg_pd;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_spp_mhs_reg_pd')
    ALTER TABLE siakadu.spp_mhs DROP CONSTRAINT fk_spp_mhs_reg_pd;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_kuliah_mhs_reg_pd')
    ALTER TABLE siakadu.kuliah_mhs DROP CONSTRAINT fk_kuliah_mhs_reg_pd;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_nilai_smt_mhs_reg_pd')
    ALTER TABLE siakadu.nilai_smt_mhs DROP CONSTRAINT fk_nilai_smt_mhs_reg_pd;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_nilai_transkrip_reg_pd')
    ALTER TABLE siakadu.nilai_transkrip DROP CONSTRAINT fk_nilai_transkrip_reg_pd;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_bimbing_mhs_reg_pd')
    ALTER TABLE siakadu.bimbing_mhs DROP CONSTRAINT fk_bimbing_mhs_reg_pd;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_uji_mhs_reg_pd')
    ALTER TABLE siakadu.uji_mhs DROP CONSTRAINT fk_uji_mhs_reg_pd;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_reg_pd_peserta_didik')
    ALTER TABLE siakadu.reg_pd DROP CONSTRAINT fk_reg_pd_peserta_didik;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_reg_pd_sms')
    ALTER TABLE siakadu.reg_pd DROP CONSTRAINT fk_reg_pd_sms;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_reg_pd_semester')
    ALTER TABLE siakadu.reg_pd DROP CONSTRAINT fk_reg_pd_semester;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_peserta_didik_status_mahasiswa')
    ALTER TABLE siakadu.peserta_didik DROP CONSTRAINT fk_peserta_didik_status_mahasiswa;

-- 3b. Drop tables
IF OBJECT_ID('siakadu.reg_pd', 'U') IS NOT NULL
BEGIN
    DROP TABLE siakadu.reg_pd;
    PRINT '  Dropped: siakadu.reg_pd';
END
IF OBJECT_ID('siakadu.peserta_didik', 'U') IS NOT NULL
BEGIN
    DROP TABLE siakadu.peserta_didik;
    PRINT '  Dropped: siakadu.peserta_didik';
END
GO

-- ============================================================================
-- STEP 4: Create siakadu.mahasiswa (flat table v2)
-- ============================================================================
IF OBJECT_ID('siakadu.mahasiswa', 'U') IS NOT NULL
BEGIN
    PRINT 'STEP 4: siakadu.mahasiswa already exists — skip'
END
ELSE
BEGIN
    PRINT 'STEP 4: Create siakadu.mahasiswa (flat table, PK nim)...'

    CREATE TABLE siakadu.mahasiswa (
        nim                         varchar(24)          NOT NULL,
        -- Core identity
        nama                        nvarchar(120)        NOT NULL,
        angkatan                    varchar(4)           NULL,
        gelar_depan                 varchar(30)          NULL,
        gelar_belakang              varchar(30)          NULL,
        jk                          char(1)              NULL,
        tmpt_lahir                  nvarchar(80)         NULL,
        tgl_lahir                   date                 NULL,
        status_nikah                varchar(20)          NULL,
        -- Documents
        nik                         varchar(20)          NULL,
        nokk                        varchar(20)          NULL,
        nisn                        varchar(20)          NULL,
        nupn                        varchar(20)          NULL,
        no_kps                      varchar(40)          NULL,
        npsn                        varchar(20)          NULL,
        nomor_tes                   varchar(50)          NULL,
        no_skdo                     nvarchar(100)        NULL,
        pt_nim                      varchar(50)          NULL,
        -- Contact
        alamat                      nvarchar(500)        NULL,
        telepon                     varchar(20)          NULL,
        hp                          varchar(20)          NULL,
        hp2                         varchar(20)          NULL,
        email                       varchar(100)         NULL,
        email_kampus                varchar(100)         NULL,
        email_ortu                  varchar(100)         NULL,
        kode_pos                    varchar(10)          NULL,
        -- Address detail
        id_kota                     varchar(20)          NULL,
        nama_kota                   nvarchar(100)        NULL,
        id_kecamatan                varchar(20)          NULL,
        kecamatan                   nvarchar(100)        NULL,
        rt                          varchar(5)           NULL,
        rw                          varchar(5)           NULL,
        dusun                       nvarchar(60)         NULL,
        desa                        nvarchar(60)         NULL,
        -- Academic
        id_unit                     varchar(20)          NULL,
        nm_fakultas                 nvarchar(200)        NULL,
        nm_jurusan                  nvarchar(200)        NULL,
        nm_prodi                    nvarchar(200)        NULL,
        nm_bidang_studi             nvarchar(200)        NULL,
        id_kurikulum                varchar(20)          NULL,
        semester                    varchar(10)          NULL,
        ipk                         numeric(5,2)         NULL,
        sks_total                   int                  NULL,
        sks_lulus                   int                  NULL,
        id_periode                  varchar(10)          NULL,
        id_status_mhs               varchar(10)          NULL,
        status_mahasiswa            nvarchar(30)         NULL,
        id_sistem_kuliah            int                  NULL,
        nm_sistem_kuliah            nvarchar(50)         NULL,
        id_periode_max              varchar(10)          NULL,
        periode_terakhir            varchar(50)          NULL,
        nama_kelas                  nvarchar(50)         NULL,
        -- Socio-economic
        id_agama                    int                  NULL,
        nama_agama                  nvarchar(50)         NULL,
        nama_negara                 nvarchar(100)        NULL,
        jenis_tinggal               nvarchar(50)         NULL,
        nama_transport              nvarchar(50)         NULL,
        nama_pekerjaan              nvarchar(100)        NULL,
        nama_penghasilan            nvarchar(100)        NULL,
        id_suku                     int                  NULL,
        nama_suku                   nvarchar(100)        NULL,
        gol_darah                   varchar(5)           NULL,
        berat_badan                 varchar(10)          NULL,
        tinggi_badan                varchar(10)          NULL,
        nama_hobi                   nvarchar(100)        NULL,
        nama_minat                  nvarchar(100)        NULL,
        -- Admission
        id_jalur_pendaftaran        int                  NULL,
        jalur_pendaftaran           nvarchar(100)        NULL,
        id_jenis_pendaftaran        int                  NULL,
        tgl_daftar                  varchar(20)          NULL,
        id_gelombang                int                  NULL,
        gelombang                   nvarchar(100)        NULL,
        nilai_tpa                   numeric(7,2)         NULL,
        nilai_kesehatan             numeric(7,2)         NULL,
        nilai_psikotes              numeric(7,2)         NULL,
        nilai_wawancara             numeric(7,2)         NULL,
        is_beasiswa                 varchar(5)           NULL,
        -- Transfer
        is_transfer                 varchar(5)           NULL,
        jenis_transfer              int                  NULL,
        id_periode_transfer         varchar(10)          NULL,
        tgl_transfer                varchar(20)          NULL,
        nim_lama                    varchar(24)          NULL,
        univ_asal                   nvarchar(200)        NULL,
        ipk_asal                    numeric(5,2)         NULL,
        sks_asal                    numeric(5,2)         NULL,
        id_pendidikan_asal          varchar(10)          NULL,
        tingkat_pendidikan_asal     nvarchar(50)         NULL,
        file_transkrip_asal         nvarchar(500)        NULL,
        file_surat_pindah           nvarchar(500)        NULL,
        id_unit_asal                varchar(20)          NULL,
        id_kurikulum_asal           varchar(20)          NULL,
        ipk_univ_asal               numeric(5,2)         NULL,
        prodi_asal                  nvarchar(200)        NULL,
        instansi                    nvarchar(200)        NULL,
        -- High school
        asal_smu                    nvarchar(200)        NULL,
        alamat_smu                  nvarchar(500)        NULL,
        id_kota_smu                 varchar(20)          NULL,
        telp_smu                    varchar(20)          NULL,
        no_ijazah_smu               varchar(50)          NULL,
        jurusan_sekolah             nvarchar(100)        NULL,
        nem                         numeric(7,2)         NULL,
        thn_lulus_sekolah           int                  NULL,
        -- Finance
        kategori_ukt                nvarchar(50)         NULL,
        -- Integration
        edlink_student_id           int                  NULL,
        -- UUID mapping (bridging ke pdrd / PDDIKTI)
        id_pd                       uniqueidentifier     NULL,
        id_reg_pd                   uniqueidentifier     NULL,
        id_sms                      uniqueidentifier     NULL,
        -- Ref FK
        id_stat_mhs                 char(1)              NULL,
        id_jenj_didik               numeric(2)           NULL,
        id_jns_keluar               char(1)              NULL,
        id_jns_daftar               numeric(2)           NULL,
        id_jalur_daftar             numeric              NULL,
        id_smt_masuk                char(5)              NULL,
        tgl_keluar                  date                 NULL,
        ket_keluar                  nvarchar(200)        NULL,
        -- Audit
        create_date                 datetime             NOT NULL DEFAULT GETDATE(),
        last_update                 datetime             NOT NULL DEFAULT GETDATE(),
        last_sync                   datetime             NULL,
        soft_delete                 numeric(1,0)         NOT NULL DEFAULT 0,
        update_user                 varchar(50)          NULL,
        -- Constraints
        CONSTRAINT pk_mahasiswa PRIMARY KEY (nim),
        CONSTRAINT chk_mahasiswa_jk CHECK (jk IN ('L', 'P')),
        CONSTRAINT chk_mahasiswa_soft_delete CHECK (soft_delete IN (0, 1))
    );

    -- Indexes
    CREATE INDEX idx_mahasiswa_angkatan        ON siakadu.mahasiswa (angkatan);
    CREATE INDEX idx_mahasiswa_id_unit         ON siakadu.mahasiswa (id_unit);
    CREATE INDEX idx_mahasiswa_id_status_mhs   ON siakadu.mahasiswa (id_status_mhs);
    CREATE INDEX idx_mahasiswa_id_stat_mhs     ON siakadu.mahasiswa (id_stat_mhs);
    CREATE INDEX idx_mahasiswa_nama            ON siakadu.mahasiswa (nama);
    CREATE INDEX idx_mahasiswa_id_pd           ON siakadu.mahasiswa (id_pd)     WHERE id_pd     IS NOT NULL;
    CREATE INDEX idx_mahasiswa_id_reg_pd       ON siakadu.mahasiswa (id_reg_pd) WHERE id_reg_pd IS NOT NULL;
    CREATE INDEX idx_mahasiswa_id_sms          ON siakadu.mahasiswa (id_sms)    WHERE id_sms    IS NOT NULL;
    CREATE INDEX idx_mahasiswa_nik             ON siakadu.mahasiswa (nik)       WHERE nik       IS NOT NULL;
    CREATE INDEX idx_mahasiswa_id_jns_keluar   ON siakadu.mahasiswa (id_jns_keluar);
    CREATE INDEX idx_mahasiswa_soft_delete     ON siakadu.mahasiswa (soft_delete);
    CREATE INDEX idx_mahasiswa_last_sync       ON siakadu.mahasiswa (last_sync);

    PRINT '  siakadu.mahasiswa created with 12 indexes';
END
GO

-- ============================================================================
-- STEP 5: Create siakadu.keluarga_mhs
-- ============================================================================
IF OBJECT_ID('siakadu.keluarga_mhs', 'U') IS NOT NULL
BEGIN
    PRINT 'STEP 5: siakadu.keluarga_mhs already exists — skip'
END
ELSE
BEGIN
    PRINT 'STEP 5: Create siakadu.keluarga_mhs...'

    CREATE TABLE siakadu.keluarga_mhs (
        nim                         varchar(24)          NOT NULL,
        status_keluarga             varchar(20)          NOT NULL,  -- Ayah / Ibu / Wali
        nama                        nvarchar(120)        NULL,
        status_ortu                 nvarchar(50)         NULL,
        kondisi_ortu                nvarchar(50)         NULL,
        pend_akhir                  nvarchar(50)         NULL,
        id_pekerjaan                int                  NULL,
        pekerjaan                   nvarchar(100)        NULL,
        id_penghasilan              int                  NULL,
        penghasilan                 nvarchar(100)        NULL,
        alamat                      nvarchar(500)        NULL,
        telepon                     varchar(20)          NULL,
        tgl_lahir                   varchar(20)          NULL,
        email                       varchar(100)         NULL,
        nik                         varchar(20)          NULL,
        instansi                    nvarchar(200)        NULL,
        create_date                 datetime             NOT NULL DEFAULT GETDATE(),
        last_update                 datetime             NOT NULL DEFAULT GETDATE(),
        last_sync                   datetime             NULL,
        update_user                 varchar(50)          NULL,
        CONSTRAINT pk_keluarga_mhs PRIMARY KEY (nim, status_keluarga),
        CONSTRAINT fk_keluarga_mhs_mahasiswa FOREIGN KEY (nim)
            REFERENCES siakadu.mahasiswa (nim) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX idx_keluarga_mhs_nim ON siakadu.keluarga_mhs (nim);
    PRINT '  siakadu.keluarga_mhs created';
END
GO

-- ============================================================================
-- STEP 6: Tambah kolom nim ke kuliah_mhs + spp_mhs (untuk bridging)
-- ============================================================================
PRINT 'STEP 6: Add kolom nim ke kuliah_mhs + spp_mhs...'

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_SCHEMA='siakadu' AND TABLE_NAME='kuliah_mhs' AND COLUMN_NAME='nim')
BEGIN
    ALTER TABLE siakadu.kuliah_mhs ADD nim varchar(24) NULL;
    PRINT '  kuliah_mhs.nim added';
END

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_SCHEMA='siakadu' AND TABLE_NAME='spp_mhs' AND COLUMN_NAME='nim')
BEGIN
    ALTER TABLE siakadu.spp_mhs ADD nim varchar(24) NULL;
    PRINT '  spp_mhs.nim added';
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_kuliah_mhs_nim'
               AND object_id=OBJECT_ID('siakadu.kuliah_mhs'))
    CREATE INDEX idx_kuliah_mhs_nim ON siakadu.kuliah_mhs (nim);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_spp_mhs_nim'
               AND object_id=OBJECT_ID('siakadu.spp_mhs'))
    CREATE INDEX idx_spp_mhs_nim ON siakadu.spp_mhs (nim);
GO

-- ============================================================================
-- STEP 7: Seed reference data (status_mahasiswa, jenjang_pendidikan, semester)
-- ============================================================================
PRINT 'STEP 7: Seed reference data...'

-- 7a. status_mahasiswa (A/C/D/K/L/N/G/M/W)
IF NOT EXISTS (SELECT 1 FROM siakadu.status_mahasiswa WHERE id_stat_mhs = 'A')
BEGIN
    INSERT INTO siakadu.status_mahasiswa (id_stat_mhs, a_ref_pddikti, a_ref_unila, nm_stat_mhs, create_date, last_update, last_sync)
    VALUES
        ('A', 1, 1, 'Aktif',         GETDATE(), GETDATE(), GETDATE()),
        ('C', 1, 1, 'Cuti',          GETDATE(), GETDATE(), GETDATE()),
        ('D', 1, 1, 'Drop Out',      GETDATE(), GETDATE(), GETDATE()),
        ('K', 1, 1, 'Keluar',        GETDATE(), GETDATE(), GETDATE()),
        ('L', 1, 1, 'Lulus',         GETDATE(), GETDATE(), GETDATE()),
        ('N', 1, 1, 'Non-Aktif',     GETDATE(), GETDATE(), GETDATE()),
        ('G', 1, 1, 'Double Degree', GETDATE(), GETDATE(), GETDATE()),
        ('M', 1, 1, 'Mutasi',        GETDATE(), GETDATE(), GETDATE()),
        ('W', 1, 1, 'Wafat',         GETDATE(), GETDATE(), GETDATE());
    PRINT '  status_mahasiswa seeded (9 rows)';
END

-- 7b. mapping_matkul + mapping_kurikulum + mapping_unit (empty tables untuk sync)
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='mapping_matkul' AND schema_id=SCHEMA_ID('siakadu'))
BEGIN
    CREATE TABLE siakadu.mapping_matkul (
        kode_mk_siakadu varchar(20) NOT NULL,
        id_unit_siakadu varchar(20) NOT NULL DEFAULT '',
        id_mk uniqueidentifier NOT NULL,
        a_sync_pddikti numeric(1,0) NOT NULL DEFAULT 0,
        create_date datetime NOT NULL DEFAULT GETDATE(),
        CONSTRAINT pk_mapping_matkul PRIMARY KEY (kode_mk_siakadu, id_unit_siakadu)
    );
    PRINT '  mapping_matkul created';
END

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='mapping_kurikulum' AND schema_id=SCHEMA_ID('siakadu'))
BEGIN
    CREATE TABLE siakadu.mapping_kurikulum (
        kode_mk_siakadu varchar(20) NOT NULL,
        thn_kurikulum int NOT NULL,
        id_unit_siakadu varchar(20) NOT NULL DEFAULT '',
        id_kurikulum_sp uniqueidentifier NOT NULL,
        id_mk uniqueidentifier NOT NULL,
        a_sync_pddikti numeric(1,0) NOT NULL DEFAULT 0,
        create_date datetime NOT NULL DEFAULT GETDATE(),
        CONSTRAINT pk_mapping_kurikulum PRIMARY KEY (kode_mk_siakadu, thn_kurikulum)
    );
    PRINT '  mapping_kurikulum created';
END

-- mapping_unit biasanya sudah ada dari v1.0 — add defensively
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='mapping_unit' AND schema_id=SCHEMA_ID('siakadu'))
BEGIN
    CREATE TABLE siakadu.mapping_unit (
        kode_siakad varchar(20) NOT NULL,
        id_sms uniqueidentifier NOT NULL,
        nm_unit nvarchar(200) NULL,
        create_date datetime NOT NULL DEFAULT GETDATE(),
        CONSTRAINT pk_mapping_unit PRIMARY KEY (kode_siakad)
    );
    PRINT '  mapping_unit created';
END

-- 7c. sync_log (tabel logging untuk endpoint stats)
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='sync_log' AND schema_id=SCHEMA_ID('siakadu'))
BEGIN
    CREATE TABLE siakadu.sync_log (
        id              bigint IDENTITY(1,1) NOT NULL,
        endpoint_name   varchar(100) NULL,
        endpoint_key    varchar(100) NULL,
        sync_type       varchar(50)  NULL,
        status          varchar(20)  NULL,
        api_code        varchar(50)  NULL,
        total_records   int          NULL,
        inserted_count  int          NULL,
        updated_count   int          NULL,
        failed_count    int          NULL,
        skipped_count   int          NULL,
        duration_ms     int          NULL,
        error_message   nvarchar(500) NULL,
        error_details   nvarchar(max) NULL,
        synced_by       varchar(50)  NULL,
        create_date     datetime     NOT NULL DEFAULT GETDATE(),
        CONSTRAINT pk_sync_log PRIMARY KEY (id)
    );
    CREATE INDEX idx_sync_log_endpoint ON siakadu.sync_log (endpoint_key);
    CREATE INDEX idx_sync_log_create ON siakadu.sync_log (create_date DESC);
    PRINT '  sync_log created';
END
GO

-- ============================================================================
-- STEP 8: Drop blocking FK constraints yang bikin sync gagal kalau ref kosong
-- ============================================================================
PRINT 'STEP 8: Drop blocking FK (optional, aman untuk fresh sync)...'

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_kelas_kuliah_sms')
    ALTER TABLE siakadu.kelas_kuliah DROP CONSTRAINT fk_kelas_kuliah_sms;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_matkul_sms')
    ALTER TABLE siakadu.matkul DROP CONSTRAINT fk_matkul_sms;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_kuliah_mhs_status_mahasiswa')
    ALTER TABLE siakadu.kuliah_mhs DROP CONSTRAINT fk_kuliah_mhs_status_mahasiswa;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_nilai_transkrip_matkul')
    ALTER TABLE siakadu.nilai_transkrip DROP CONSTRAINT fk_nilai_transkrip_matkul;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_nilai_transkrip_kelas_kuliah')
    ALTER TABLE siakadu.nilai_transkrip DROP CONSTRAINT fk_nilai_transkrip_kelas_kuliah;
GO

-- ============================================================================
-- STEP 9: Summary
-- ============================================================================
PRINT ''
PRINT '=== SIAKADU Schema v2.0 Fresh Deploy — Complete ==='
PRINT ''
PRINT 'Tables created:'

SELECT
    t.name AS table_name,
    p.rows AS row_count
FROM sys.tables t
JOIN sys.schemas s ON t.schema_id = s.schema_id
JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0, 1)
WHERE s.name = 'siakadu'
ORDER BY t.name;

PRINT ''
PRINT 'Next steps:'
PRINT '  1. Deploy myunila-service backend (akan auto EnsureReferenceData)'
PRINT '  2. Login ke frontend, klik Sinkronisasi Data di tiap modul siakadu'
PRINT '     berurutan: akademik → mahasiswa → nilai → wisuda'
PRINT '  3. Monitor /dashboard/integrator/monitoring untuk status sync'
GO
