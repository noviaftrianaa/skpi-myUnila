-- ============================================================================
-- SIAKADU Schema v2.0 — FRESH DEPLOY (SELF-CONTAINED, sekali jalan)
-- Database: SQL Server 2019
-- Target: fresh DB / schema siakadu kosong
-- Generated: 2026-04-21
--
-- Sejarah versi:
--   v1.0 (2026-03): 36 tabel — termasuk peserta_didik + reg_pd
--   v2.0 (2026-04): flat table siakadu.mahasiswa (130+ field) + keluarga_mhs
--                   menggantikan peserta_didik + reg_pd
--
-- Script ini mencakup SEMUA yang dibutuhkan — tidak perlu jalankan v1 lebih dulu:
--   - 34 tabel core (tanpa peserta_didik & reg_pd)
--   - tabel baru v2: mahasiswa, keluarga_mhs
--   - tabel bridging: mapping_unit, mapping_matkul, mapping_kurikulum, sync_log
--   - FK constraints yang relevan
--   - Indexes
--   - Seed data: jenjang_pendidikan, status_mahasiswa, semester
--
-- Cara pakai:
--   sqlcmd -S <server> -d <database> -i siakadu_schema_v2.0_fresh.sql
-- atau via SSMS — Execute.
--
-- Script idempotent (IF NOT EXISTS guards) — aman dijalankan ulang.
-- ============================================================================

SET NOCOUNT ON;
GO

PRINT '=== SIAKADU Schema v2.0 Fresh Deploy — START ==='
PRINT ''
PRINT 'CATATAN: Kalau schema siakadu sudah ada isinya dan mau reset total,'
PRINT '         jalankan dulu siakadu_drop_all.sql sebelum script ini.'
PRINT ''
GO

-- ============================================================================
-- STEP 0: Schema
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'siakadu')
    EXEC('CREATE SCHEMA siakadu');
GO

PRINT 'STEP 0: Schema siakadu ready'
GO

-- ============================================================================
-- SECTION 1: TABEL REFERENSI
-- ============================================================================
PRINT 'SECTION 1: Reference tables...'
GO

IF OBJECT_ID('siakadu.semester','U') IS NULL
CREATE TABLE siakadu.semester (
    id_smt              char(5)       NOT NULL,
    id_thn_ajaran       numeric(4,0)  NOT NULL,
    a_ref_pddikti       numeric(1,0)  NOT NULL DEFAULT 0,
    a_ref_unila         numeric(1,0)  NOT NULL DEFAULT 0,
    nm_smt              varchar(50)   NOT NULL,
    smt                 numeric(2,0)  NOT NULL,
    a_periode_aktif     numeric(1,0)  NULL DEFAULT 0,
    tgl_mulai           datetime      NOT NULL,
    tgl_selesai         datetime      NOT NULL,
    create_date         datetime      NOT NULL,
    last_update         datetime      NOT NULL,
    expired_date        datetime      NULL,
    last_sync           datetime      NOT NULL,
    CONSTRAINT pk_semester PRIMARY KEY (id_smt)
);
GO

IF OBJECT_ID('siakadu.jenjang_pendidikan','U') IS NULL
CREATE TABLE siakadu.jenjang_pendidikan (
    id_jenj_didik       numeric(2,0)  NOT NULL,
    a_ref_pddikti       numeric(1,0)  NOT NULL DEFAULT 0,
    a_ref_unila         numeric(1,0)  NOT NULL DEFAULT 0,
    nm_jenj_didik       varchar(50)   NOT NULL,
    u_jenj_lemb         numeric(1,0)  NOT NULL DEFAULT 0,
    u_jenj_org          numeric(1,0)  NOT NULL DEFAULT 0,
    create_date         datetime      NOT NULL,
    last_update         datetime      NOT NULL,
    expired_date        datetime      NULL,
    last_sync           datetime      NOT NULL,
    CONSTRAINT pk_jenjang_pendidikan PRIMARY KEY (id_jenj_didik)
);
GO

IF OBJECT_ID('siakadu.gelar_akademik','U') IS NULL
CREATE TABLE siakadu.gelar_akademik (
    id_gelar_akad       int           NOT NULL,
    a_ref_pddikti       numeric(1,0)  NOT NULL DEFAULT 0,
    a_ref_unila         numeric(1,0)  NOT NULL DEFAULT 0,
    singkat_gelar       varchar(30)   NOT NULL,
    nm_gelar_akad       varchar(80)   NOT NULL,
    posisi_gelar        numeric(1,0)  NOT NULL,
    create_date         datetime      NOT NULL,
    last_update         datetime      NOT NULL,
    expired_date        datetime      NULL,
    last_sync           datetime      NOT NULL,
    CONSTRAINT pk_gelar_akademik PRIMARY KEY (id_gelar_akad)
);
GO

IF OBJECT_ID('siakadu.jenis_evaluasi','U') IS NULL
CREATE TABLE siakadu.jenis_evaluasi (
    id_jns_eval         smallint      NOT NULL,
    a_ref_pddikti       numeric(1,0)  NOT NULL DEFAULT 0,
    a_ref_unila         numeric(1,0)  NOT NULL DEFAULT 0,
    nm_jns_eval         varchar(50)   NOT NULL,
    ket_jns_eval        varchar(100)  NULL,
    create_date         datetime      NOT NULL,
    last_update         datetime      NOT NULL,
    expired_date        datetime      NULL,
    last_sync           datetime      NOT NULL,
    CONSTRAINT pk_jenis_evaluasi PRIMARY KEY (id_jns_eval)
);
GO

IF OBJECT_ID('siakadu.basis_evaluasi','U') IS NULL
CREATE TABLE siakadu.basis_evaluasi (
    id_basis_evaluasi   numeric(2,0)  NOT NULL,
    a_ref_pddikti       numeric(1,0)  NOT NULL DEFAULT 0,
    a_ref_unila         numeric(1,0)  NOT NULL DEFAULT 0,
    nm_basis_evaluasi   varchar(50)   NOT NULL,
    create_date         datetime      NOT NULL,
    last_update         datetime      NOT NULL,
    expired_date        datetime      NULL,
    last_sync           datetime      NOT NULL,
    CONSTRAINT pk_basis_evaluasi PRIMARY KEY (id_basis_evaluasi)
);
GO

IF OBJECT_ID('siakadu.jenis_akt_mhs','U') IS NULL
CREATE TABLE siakadu.jenis_akt_mhs (
    id_jns_akt_mhs              numeric(2,0)  NOT NULL,
    a_ref_pddikti               numeric(1,0)  NOT NULL DEFAULT 0,
    a_ref_unila                 numeric(1,0)  NOT NULL DEFAULT 0,
    nm_jns_akt_mhs              varchar(50)   NOT NULL,
    ket_jns_akt_mhs             varchar(100)  NULL,
    a_kegiatan_kampus_merdeka   numeric(1,0)  NOT NULL DEFAULT 0,
    create_date                 datetime      NOT NULL,
    last_update                 datetime      NOT NULL,
    expired_date                datetime      NULL,
    last_sync                   datetime      NOT NULL,
    CONSTRAINT pk_jenis_akt_mhs PRIMARY KEY (id_jns_akt_mhs)
);
GO

IF OBJECT_ID('siakadu.status_mahasiswa','U') IS NULL
CREATE TABLE siakadu.status_mahasiswa (
    id_stat_mhs         char(1)       NOT NULL,
    a_ref_pddikti       numeric(1,0)  NOT NULL DEFAULT 0,
    a_ref_unila         numeric(1,0)  NOT NULL DEFAULT 0,
    nm_stat_mhs         varchar(30)   NOT NULL,
    ket_stat_mhs        varchar(100)  NULL,
    create_date         datetime      NOT NULL,
    last_update         datetime      NOT NULL,
    expired_date        datetime      NULL,
    last_sync           datetime      NOT NULL,
    CONSTRAINT pk_status_mahasiswa PRIMARY KEY (id_stat_mhs)
);
GO

IF OBJECT_ID('siakadu.jenis_sms','U') IS NULL
CREATE TABLE siakadu.jenis_sms (
    id_jns_sms          numeric(2,0)  NOT NULL,
    a_ref_pddikti       numeric(1,0)  NOT NULL DEFAULT 0,
    a_ref_unila         numeric(1,0)  NOT NULL DEFAULT 0,
    nm_jns_sms          varchar(50)   NOT NULL,
    create_date         datetime      NOT NULL,
    last_update         datetime      NOT NULL,
    expired_date        datetime      NULL,
    last_sync           datetime      NOT NULL,
    CONSTRAINT pk_jenis_sms PRIMARY KEY (id_jns_sms)
);
GO

IF OBJECT_ID('siakadu.bentuk_pendidikan','U') IS NULL
CREATE TABLE siakadu.bentuk_pendidikan (
    id_bp               smallint      NOT NULL,
    a_ref_pddikti       numeric(1,0)  NOT NULL DEFAULT 0,
    a_ref_unila         numeric(1,0)  NOT NULL DEFAULT 0,
    nm_bp               varchar(50)   NOT NULL,
    a_jenj_paud         numeric(1,0)  NOT NULL DEFAULT 0,
    a_jenj_tk           numeric(1,0)  NOT NULL DEFAULT 0,
    a_jenj_sd           numeric(1,0)  NOT NULL DEFAULT 0,
    a_jenj_smp          numeric(1,0)  NOT NULL DEFAULT 0,
    a_jenj_sma          numeric(1,0)  NOT NULL DEFAULT 0,
    a_jenj_tinggi       numeric(1,0)  NOT NULL DEFAULT 0,
    dir_bina            varchar(40)   NULL,
    a_aktif             numeric(1,0)  NOT NULL DEFAULT 1,
    create_date         datetime      NOT NULL,
    last_update         datetime      NOT NULL,
    expired_date        datetime      NULL,
    last_sync           datetime      NOT NULL,
    CONSTRAINT pk_bentuk_pendidikan PRIMARY KEY (id_bp)
);
GO

-- Referensi unit/prodi (pengganti external lookup)
IF OBJECT_ID('siakadu.ref_unit','U') IS NULL
CREATE TABLE siakadu.ref_unit (
    id_unit             varchar(20)   NOT NULL,
    nm_unit             nvarchar(200) NULL,
    jns_unit            varchar(20)   NULL,   -- P=Prodi, F=Fakultas
    id_induk            varchar(20)   NULL,
    is_aktif            varchar(5)    NULL,
    create_date         datetime      NOT NULL DEFAULT GETDATE(),
    last_update         datetime      NOT NULL DEFAULT GETDATE(),
    last_sync           datetime      NULL,
    CONSTRAINT pk_ref_unit PRIMARY KEY (id_unit)
);
GO

IF OBJECT_ID('siakadu.ref_agama','U') IS NULL
CREATE TABLE siakadu.ref_agama (
    id_agama            int           NOT NULL,
    nm_agama            nvarchar(50)  NOT NULL,
    CONSTRAINT pk_ref_agama PRIMARY KEY (id_agama)
);
GO

IF OBJECT_ID('siakadu.ref_jalur_daftar','U') IS NULL
CREATE TABLE siakadu.ref_jalur_daftar (
    id_jalur_daftar     int           NOT NULL,
    nm_jalur_daftar     nvarchar(100) NOT NULL,
    CONSTRAINT pk_ref_jalur_daftar PRIMARY KEY (id_jalur_daftar)
);
GO

IF OBJECT_ID('siakadu.ref_jenis_mk','U') IS NULL
CREATE TABLE siakadu.ref_jenis_mk (
    id_jenis_mk         varchar(5)    NOT NULL,
    nm_jenis_mk         varchar(50)   NOT NULL,
    last_update         datetime      NULL,
    CONSTRAINT pk_ref_jenis_mk PRIMARY KEY (id_jenis_mk)
);
GO

IF OBJECT_ID('siakadu.ref_tahun_ajaran','U') IS NULL
CREATE TABLE siakadu.ref_tahun_ajaran (
    id_thn_ajaran       numeric(4,0)  NOT NULL,
    nm_thn_ajaran       varchar(20)   NOT NULL,
    CONSTRAINT pk_ref_tahun_ajaran PRIMARY KEY (id_thn_ajaran)
);
GO

IF OBJECT_ID('siakadu.ref_status_mhs','U') IS NULL
CREATE TABLE siakadu.ref_status_mhs (
    id_status_mhs       varchar(10)   NOT NULL,
    nm_status_mhs       varchar(50)   NOT NULL,
    CONSTRAINT pk_ref_status_mhs PRIMARY KEY (id_status_mhs)
);
GO

-- ============================================================================
-- SECTION 2: ENTITAS UTAMA — SDM + PRODI + REG_PTK
-- CATATAN: peserta_didik + reg_pd DIHAPUS di v2 — digantikan siakadu.mahasiswa
-- ============================================================================
PRINT 'SECTION 2: Entitas utama (SDM, SMS, REG_PTK)...'
GO

IF OBJECT_ID('siakadu.sdm','U') IS NULL
CREATE TABLE siakadu.sdm (
    id_sdm                      uniqueidentifier NOT NULL,
    nm_sdm                      varchar(100)     NOT NULL,
    jk                          char(1)          NOT NULL,
    tmpt_lahir                  varchar(32)      NOT NULL,
    tgl_lahir                   date             NOT NULL,
    nik                         char(20)         NOT NULL,
    niy_nigk                    varchar(30)      NULL,
    nuptk                       char(16)         NULL,
    nidn                        char(10)         NULL,
    nsdmi                       char(12)         NULL,
    stat_kawin                  numeric(1,0)     NOT NULL,
    jln                         varchar(255)     NULL,
    rt                          numeric(3,0)     NULL,
    rw                          numeric(3,0)     NULL,
    nm_dsn                      varchar(60)      NULL,
    ds_kel                      varchar(60)      NULL,
    kode_pos                    char(5)          NULL,
    no_tel_rmh                  varchar(20)      NULL,
    no_hp                       varchar(20)      NULL,
    email                       varchar(60)      NULL,
    nip                         varchar(18)      NULL,
    tmt_pns                     date             NULL,
    nm_suami_istri              varchar(100)     NULL,
    nip_suami_istri             char(18)         NULL,
    sk_cpns                     varchar(80)      NULL,
    tgl_sk_cpns                 date             NULL,
    sk_angkat                   varchar(80)      NULL,
    tmt_sk_angkat               date             NULL,
    npwp                        char(15)         NULL,
    nm_wp                       varchar(100)     NULL,
    stat_data                   int              NULL,
    akta_ijin_ajar              char(1)          NULL,
    nira                        char(30)         NULL,
    jns_reg                     varchar(10)      NULL,
    kewarganegaraan             char(2)          NOT NULL,
    id_jns_sdm                  numeric(2,0)     NOT NULL,
    id_wil                      char(8)          NOT NULL,
    id_stat_aktif               numeric(2,0)     NOT NULL,
    id_agama                    smallint         NOT NULL,
    id_keahlian_lab             smallint         NULL,
    id_pekerjaan_suami_istri    int              NOT NULL,
    id_lemb_angkat              numeric(2,0)     NOT NULL,
    id_sumber_gaji              numeric(2,0)     NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_sdm PRIMARY KEY (id_sdm)
);
GO

IF OBJECT_ID('siakadu.sms','U') IS NULL
CREATE TABLE siakadu.sms (
    id_sms                      uniqueidentifier NOT NULL,
    id_fak_unila                uniqueidentifier NULL,
    id_lemb_non_sp              uniqueidentifier NULL,
    id_jur_unila                uniqueidentifier NULL,
    id_jur                      varchar(25)      NULL,
    id_jenj_didik               numeric(2,0)     NOT NULL,
    nm_lemb                     varchar(100)     NOT NULL,
    kd_kl                       char(3)          NULL,
    kd_satker                   varchar(20)      NULL,
    smt_mulai                   char(5)          NULL,
    a_selenggara_subst          numeric(1,0)     NOT NULL DEFAULT 0,
    stat_prodi_unila            char(1)          NULL,
    tgl_tutup                   datetime         NULL,
    kode_snpmb                  varchar(10)      NULL,
    kode_prodi                  varchar(10)      NULL,
    nm_prodi_english            varchar(100)     NULL,
    kpst_pd                     numeric(5,0)     NULL,
    sks_lulus                   numeric(3,0)     NULL,
    gelar_lulusan               varchar(10)      NULL,
    stat_prodi                  char(1)          NULL DEFAULT 'A',
    polesei_nilai               char(1)          NULL DEFAULT 'B',
    a_kependidikan              numeric(1,0)     NULL DEFAULT 0,
    jln                         varchar(255)     NULL,
    rt                          numeric(3,0)     NULL,
    rw                          numeric(3,0)     NULL,
    nm_dsn                      varchar(60)      NULL,
    ds_kel                      varchar(60)      NULL,
    kode_pos                    char(5)          NULL,
    lintang                     numeric(11,7)    NULL,
    bujur                       numeric(11,7)    NULL,
    no_tel                      varchar(20)      NULL,
    no_fax                      varchar(20)      NULL,
    email                       varchar(60)      NULL,
    website                     varchar(256)     NULL,
    singkatan                   varchar(50)      NULL,
    tgl_berdiri                 date             NULL,
    sk_selenggara               varchar(80)      NULL,
    tgl_sk_selenggara           date             NULL,
    tmt_sk_selenggara           date             NULL,
    tst_sk_selenggara           date             NULL,
    sistem_ajar                 numeric(1,0)     NULL,
    a_pjj                       numeric(1,0)     NULL DEFAULT 0,
    a_psdku                     numeric(1,0)     NULL DEFAULT 0,
    luas_lab                    numeric(5,0)     NULL,
    kapasitas_prak_satu_shift   numeric(4,0)     NULL,
    jml_mhs_pengguna            numeric(6,0)     NULL,
    jml_jam_penggunaan          numeric(5,0)     NULL,
    jml_prodi_pengguna          numeric(3,0)     NULL,
    jml_modul_prak_sendiri      numeric(4,0)     NULL,
    jml_modul_prak_lain         numeric(4,0)     NULL,
    fungsi_selain_prak          char(1)          NULL,
    penggunaan_lab              char(1)          NULL,
    a_pkl                       numeric(1,0)     NULL DEFAULT 0,
    id_sp                       uniqueidentifier NOT NULL,
    id_jns_sms                  numeric(2,0)     NOT NULL,
    id_fungsi_lab               char(1)          NOT NULL,
    id_kel_usaha                char(8)          NOT NULL,
    id_blob                     uniqueidentifier NULL,
    id_wil                      char(8)          NOT NULL,
    id_induk_sms                uniqueidentifier NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_sms PRIMARY KEY (id_sms)
);
GO

IF OBJECT_ID('siakadu.reg_ptk','U') IS NULL
CREATE TABLE siakadu.reg_ptk (
    id_reg_ptk                  uniqueidentifier NOT NULL,
    id_jns_keluar               char(1)          NULL,
    id_sdm                      uniqueidentifier NULL,
    id_sp                       uniqueidentifier NULL,
    id_stat_pegawai             smallint         NOT NULL,
    id_ikatan_kerja             char(1)          NOT NULL,
    id_sms                      uniqueidentifier NULL,
    no_srt_tgs                  varchar(80)      NULL,
    tgl_srt_tgs                 date             NOT NULL,
    tmt_srt_tgs                 date             NOT NULL,
    tgl_ptk_keluar              date             NULL,
    nidn                        char(10)         NULL,
    jns_reg                     varchar(10)      NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_reg_ptk PRIMARY KEY (id_reg_ptk)
);
GO

-- ============================================================================
-- SECTION 3: TABEL UTAMA v2 — siakadu.mahasiswa (FLAT)
-- Menggantikan peserta_didik + reg_pd dari v1
-- ============================================================================
PRINT 'SECTION 3: Tabel utama v2 — mahasiswa + keluarga_mhs...'
GO

IF OBJECT_ID('siakadu.mahasiswa','U') IS NULL
CREATE TABLE siakadu.mahasiswa (
    nim                         varchar(24)      NOT NULL,
    -- Core identity
    nama                        nvarchar(120)    NOT NULL,
    angkatan                    varchar(4)       NULL,
    gelar_depan                 varchar(30)      NULL,
    gelar_belakang              varchar(30)      NULL,
    jk                          char(1)          NULL,
    tmpt_lahir                  nvarchar(80)     NULL,
    tgl_lahir                   date             NULL,
    status_nikah                varchar(20)      NULL,
    -- Documents
    nik                         varchar(20)      NULL,
    nokk                        varchar(20)      NULL,
    nisn                        varchar(20)      NULL,
    nupn                        varchar(20)      NULL,
    no_kps                      varchar(40)      NULL,
    npsn                        varchar(20)      NULL,
    nomor_tes                   varchar(50)      NULL,
    no_skdo                     nvarchar(100)    NULL,
    pt_nim                      varchar(50)      NULL,
    -- Contact
    alamat                      nvarchar(500)    NULL,
    telepon                     varchar(20)      NULL,
    hp                          varchar(20)      NULL,
    hp2                         varchar(20)      NULL,
    email                       varchar(100)     NULL,
    email_kampus                varchar(100)     NULL,
    email_ortu                  varchar(100)     NULL,
    kode_pos                    varchar(10)      NULL,
    -- Address
    id_kota                     varchar(20)      NULL,
    nama_kota                   nvarchar(100)    NULL,
    id_kecamatan                varchar(20)      NULL,
    kecamatan                   nvarchar(100)    NULL,
    rt                          varchar(5)       NULL,
    rw                          varchar(5)       NULL,
    dusun                       nvarchar(60)     NULL,
    desa                        nvarchar(60)     NULL,
    -- Academic
    id_unit                     varchar(20)      NULL,
    nm_fakultas                 nvarchar(200)    NULL,
    nm_jurusan                  nvarchar(200)    NULL,
    nm_prodi                    nvarchar(200)    NULL,
    nm_bidang_studi             nvarchar(200)    NULL,
    id_kurikulum                varchar(20)      NULL,
    semester                    varchar(10)      NULL,
    ipk                         numeric(5,2)     NULL,
    sks_total                   int              NULL,
    sks_lulus                   int              NULL,
    id_periode                  varchar(10)      NULL,
    id_status_mhs               varchar(10)      NULL,
    status_mahasiswa            nvarchar(30)     NULL,
    id_sistem_kuliah            int              NULL,
    nm_sistem_kuliah            nvarchar(50)     NULL,
    id_periode_max              varchar(10)      NULL,
    periode_terakhir            varchar(50)      NULL,
    nama_kelas                  nvarchar(50)     NULL,
    -- Socio-economic
    id_agama                    int              NULL,
    nama_agama                  nvarchar(50)     NULL,
    nama_negara                 nvarchar(100)    NULL,
    jenis_tinggal               nvarchar(50)     NULL,
    nama_transport              nvarchar(50)     NULL,
    nama_pekerjaan              nvarchar(100)    NULL,
    nama_penghasilan            nvarchar(100)    NULL,
    id_suku                     int              NULL,
    nama_suku                   nvarchar(100)    NULL,
    gol_darah                   varchar(5)       NULL,
    berat_badan                 varchar(10)      NULL,
    tinggi_badan                varchar(10)      NULL,
    nama_hobi                   nvarchar(100)    NULL,
    nama_minat                  nvarchar(100)    NULL,
    -- Admission
    id_jalur_pendaftaran        int              NULL,
    jalur_pendaftaran           nvarchar(100)    NULL,
    id_jenis_pendaftaran        int              NULL,
    tgl_daftar                  varchar(20)      NULL,
    id_gelombang                int              NULL,
    gelombang                   nvarchar(100)    NULL,
    nilai_tpa                   numeric(7,2)     NULL,
    nilai_kesehatan             numeric(7,2)     NULL,
    nilai_psikotes              numeric(7,2)     NULL,
    nilai_wawancara             numeric(7,2)     NULL,
    is_beasiswa                 varchar(5)       NULL,
    -- Transfer
    is_transfer                 varchar(5)       NULL,
    jenis_transfer              int              NULL,
    id_periode_transfer         varchar(10)      NULL,
    tgl_transfer                varchar(20)      NULL,
    nim_lama                    varchar(24)      NULL,
    univ_asal                   nvarchar(200)    NULL,
    ipk_asal                    numeric(5,2)     NULL,
    sks_asal                    numeric(5,2)     NULL,
    id_pendidikan_asal          varchar(10)      NULL,
    tingkat_pendidikan_asal     nvarchar(50)     NULL,
    file_transkrip_asal         nvarchar(500)    NULL,
    file_surat_pindah           nvarchar(500)    NULL,
    id_unit_asal                varchar(20)      NULL,
    id_kurikulum_asal           varchar(20)      NULL,
    ipk_univ_asal               numeric(5,2)     NULL,
    prodi_asal                  nvarchar(200)    NULL,
    instansi                    nvarchar(200)    NULL,
    -- High school
    asal_smu                    nvarchar(200)    NULL,
    alamat_smu                  nvarchar(500)    NULL,
    id_kota_smu                 varchar(20)      NULL,
    telp_smu                    varchar(20)      NULL,
    no_ijazah_smu               varchar(50)      NULL,
    jurusan_sekolah             nvarchar(100)    NULL,
    nem                         numeric(7,2)     NULL,
    thn_lulus_sekolah           int              NULL,
    -- Finance
    kategori_ukt                nvarchar(50)     NULL,
    -- Integration
    edlink_student_id           int              NULL,
    -- UUID bridging ke pdrd / PDDIKTI
    id_pd                       uniqueidentifier NULL,
    id_reg_pd                   uniqueidentifier NULL,
    id_sms                      uniqueidentifier NULL,
    -- Ref FK
    id_stat_mhs                 char(1)          NULL,
    id_jenj_didik               numeric(2)       NULL,
    id_jns_keluar               char(1)          NULL,
    id_jns_daftar               numeric(2)       NULL,
    id_jalur_daftar             numeric          NULL,
    id_smt_masuk                char(5)          NULL,
    tgl_keluar                  date             NULL,
    ket_keluar                  nvarchar(200)    NULL,
    -- Audit
    create_date                 datetime         NOT NULL DEFAULT GETDATE(),
    last_update                 datetime         NOT NULL DEFAULT GETDATE(),
    last_sync                   datetime         NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    update_user                 varchar(50)      NULL,
    -- Constraints
    CONSTRAINT pk_mahasiswa PRIMARY KEY (nim),
    CONSTRAINT chk_mahasiswa_jk CHECK (jk IN ('L','P')),
    CONSTRAINT chk_mahasiswa_soft_delete CHECK (soft_delete IN (0,1))
);
GO

IF OBJECT_ID('siakadu.keluarga_mhs','U') IS NULL
CREATE TABLE siakadu.keluarga_mhs (
    nim                         varchar(24)      NOT NULL,
    status_keluarga             varchar(20)      NOT NULL,   -- Ayah/Ibu/Wali
    nama                        nvarchar(120)    NULL,
    status_ortu                 nvarchar(50)     NULL,
    kondisi_ortu                nvarchar(50)     NULL,
    pend_akhir                  nvarchar(50)     NULL,
    id_pekerjaan                int              NULL,
    pekerjaan                   nvarchar(100)    NULL,
    id_penghasilan              int              NULL,
    penghasilan                 nvarchar(100)    NULL,
    alamat                      nvarchar(500)    NULL,
    telepon                     varchar(20)      NULL,
    tgl_lahir                   varchar(20)      NULL,
    email                       varchar(100)     NULL,
    nik                         varchar(20)      NULL,
    instansi                    nvarchar(200)    NULL,
    create_date                 datetime         NOT NULL DEFAULT GETDATE(),
    last_update                 datetime         NOT NULL DEFAULT GETDATE(),
    last_sync                   datetime         NULL,
    update_user                 varchar(50)      NULL,
    CONSTRAINT pk_keluarga_mhs PRIMARY KEY (nim, status_keluarga),
    CONSTRAINT fk_keluarga_mhs_mahasiswa FOREIGN KEY (nim)
        REFERENCES siakadu.mahasiswa (nim) ON DELETE CASCADE ON UPDATE CASCADE
);
GO

-- ============================================================================
-- SECTION 4: AKADEMIK (matkul, kelas_kuliah, kurikulum, substansi)
-- ============================================================================
PRINT 'SECTION 4: Akademik...'
GO

IF OBJECT_ID('siakadu.matkul','U') IS NULL
CREATE TABLE siakadu.matkul (
    id_mk                       uniqueidentifier NOT NULL,
    id_kel_mk                   varchar(5)       NULL,
    id_sms                      uniqueidentifier NULL,
    id_jns_mk                   varchar(5)       NULL,
    id_jenj_didik               numeric(2,0)     NOT NULL,
    sks_mk                      numeric(5,2)     NULL,
    sks_tm                      numeric(5,2)     NULL,
    sks_prak                    numeric(5,2)     NULL,
    sks_prak_lap                numeric(5,2)     NULL,
    sks_sim                     numeric(5,2)     NULL,
    kode_mk                     varchar(20)      NOT NULL,
    nm_mk                       varchar(120)     NULL,
    jns_mk                      varchar(5)       NULL,
    kel_mk                      varchar(5)       NULL,
    metode_pelaksanaan_kuliah   varchar(50)      NULL,
    a_sap                       numeric(1,0)     NULL DEFAULT 0,
    a_silabus                   numeric(1,0)     NULL DEFAULT 0,
    a_bahan_ajar                numeric(1,0)     NULL DEFAULT 0,
    acara_prak                  numeric(1,0)     NULL,
    a_diktat                    numeric(1,0)     NULL DEFAULT 0,
    tgl_mulai_efektif           date             NULL,
    tgl_akhir_efektif           date             NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_matkul PRIMARY KEY (id_mk)
);
GO

IF OBJECT_ID('siakadu.kelas_kuliah','U') IS NULL
CREATE TABLE siakadu.kelas_kuliah (
    id_kls                      uniqueidentifier NOT NULL,
    id_smt                      char(5)          NOT NULL,
    id_sms                      uniqueidentifier NOT NULL,
    id_mk                       uniqueidentifier NOT NULL,
    sks_mk                      numeric(5,2)     NULL,
    sks_tm                      numeric(5,2)     NULL,
    sks_prak                    numeric(5,2)     NULL,
    sks_prak_lap                numeric(5,2)     NULL,
    sks_sim                     numeric(5,2)     NULL,
    nm_kls                      varchar(5)       NOT NULL,
    bahasan_case                varchar(200)     NULL,
    a_selenggara_pditt          numeric(1,0)     NOT NULL DEFAULT 0,
    a_pengguna_pditt            numeric(1,0)     NOT NULL DEFAULT 0,
    kuota_pditt                 numeric(4,0)     NOT NULL DEFAULT 0,
    kode_vclass                 varchar(120)     NULL,
    url_vclass                  varchar(256)     NULL,
    lingkup_kelas               numeric(1,0)     NULL,
    mode_kuliah                 char(1)          NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_kelas_kuliah PRIMARY KEY (id_kls)
);
GO

IF OBJECT_ID('siakadu.matkul_kurikulum','U') IS NULL
CREATE TABLE siakadu.matkul_kurikulum (
    id_kurikulum_sp             uniqueidentifier NOT NULL,
    id_mk                       uniqueidentifier NOT NULL,
    smt                         numeric(2,0)     NULL,
    sks_mk                      numeric(5,2)     NULL,
    sks_tm                      numeric(5,2)     NULL,
    sks_prak                    numeric(5,2)     NULL,
    sks_prak_lap                numeric(5,2)     NULL,
    sks_sim                     numeric(5,2)     NULL,
    a_wajib                     numeric(1,0)     NULL DEFAULT 0,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_matkul_kurikulum PRIMARY KEY (id_kurikulum_sp, id_mk)
);
GO

IF OBJECT_ID('siakadu.substansi_kuliah','U') IS NULL
CREATE TABLE siakadu.substansi_kuliah (
    id_subst                    uniqueidentifier NOT NULL,
    id_sms                      uniqueidentifier NULL,
    id_jns_subst                char(5)          NOT NULL,
    nm_subst                    varchar(50)      NOT NULL,
    sks_mk                      numeric(5,2)     NULL,
    sks_tm                      numeric(5,2)     NULL,
    sks_prak                    numeric(5,2)     NULL,
    sks_prak_lap                numeric(5,2)     NULL,
    sks_sim                     numeric(5,2)     NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_substansi_kuliah PRIMARY KEY (id_subst)
);
GO

-- ============================================================================
-- SECTION 5: PERKULIAHAN — kuliah_mhs (dengan kolom nim v2), akt_ajar_dosen, jadwal
-- ============================================================================
PRINT 'SECTION 5: Perkuliahan...'
GO

IF OBJECT_ID('siakadu.kuliah_mhs','U') IS NULL
CREATE TABLE siakadu.kuliah_mhs (
    id_reg_pd                   uniqueidentifier NOT NULL,
    id_smt                      char(5)          NOT NULL,
    nim                         varchar(24)      NULL,       -- v2: bridging ke siakadu.mahasiswa
    id_pembiayaan               numeric(2,0)     NULL,
    id_stat_mhs                 char(1)          NOT NULL,
    ips                         numeric(7,4)     NULL,
    sks_semester                numeric(5,2)     NULL,
    ipk                         numeric(5,2)     NULL,
    total_sks                   numeric(5,2)     NULL,
    biaya_smt                   numeric(16,2)    NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_kuliah_mhs PRIMARY KEY (id_reg_pd, id_smt)
);
GO

IF OBJECT_ID('siakadu.akt_ajar_dosen','U') IS NULL
CREATE TABLE siakadu.akt_ajar_dosen (
    id_ajar                     uniqueidentifier NOT NULL,
    id_reg_ptk                  uniqueidentifier NOT NULL,
    id_subst                    uniqueidentifier NULL,
    id_katgiat                  int              NOT NULL,
    katgiat_ajar_id_katgiat     int              NULL,
    id_jns_eval                 smallint         NOT NULL,
    id_kls                      uniqueidentifier NOT NULL,
    sks_subst_tot               numeric(5,2)     NOT NULL,
    sks_tm_subst                numeric(5,2)     NOT NULL,
    sks_prak_subst              numeric(5,2)     NOT NULL,
    sks_prak_lap_subst          numeric(5,2)     NOT NULL,
    sks_sim_subst               numeric(5,2)     NOT NULL,
    jml_tm_renc                 numeric(2,0)     NOT NULL,
    jml_tm_real                 numeric(2,0)     NULL,
    jml_mhs                     smallint         NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_akt_ajar_dosen PRIMARY KEY (id_ajar)
);
GO

IF OBJECT_ID('siakadu.jadwal_kelas','U') IS NULL
CREATE TABLE siakadu.jadwal_kelas (
    id_jdwl_kls                 uniqueidentifier NOT NULL,
    id_kls                      uniqueidentifier NOT NULL,
    id_smt                      char(5)          NOT NULL,
    pertemuan                   numeric(2,0)     NULL,
    tgl_jadwal                  datetime         NULL,
    waktu_mulai                 varchar(5)       NULL,
    waktu_selesai               varchar(5)       NULL,
    lokasi                      varchar(100)     NULL,
    status                      varchar(20)      NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_jadwal_kelas PRIMARY KEY (id_jdwl_kls)
);
GO

-- ============================================================================
-- SECTION 6: NILAI & EVALUASI
-- PK nilai_transkrip diganti (id_reg_pd, id_mk) — perbaikan dari v1
-- ============================================================================
PRINT 'SECTION 6: Nilai & evaluasi...'
GO

IF OBJECT_ID('siakadu.nilai_smt_mhs','U') IS NULL
CREATE TABLE siakadu.nilai_smt_mhs (
    id_reg_pd                   uniqueidentifier NOT NULL,
    id_kls                      uniqueidentifier NOT NULL,
    nilai_angka                 numeric(4,1)     NULL,
    nilai_huruf                 char(3)          NULL,
    nilai_indeks                numeric(4,2)     NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_nilai_smt_mhs PRIMARY KEY (id_reg_pd, id_kls)
);
GO

IF OBJECT_ID('siakadu.nilai_transkrip','U') IS NULL
CREATE TABLE siakadu.nilai_transkrip (
    id_reg_pd                   uniqueidentifier NOT NULL,
    id_mk                       uniqueidentifier NOT NULL,
    id_kls                      uniqueidentifier NULL,
    id_konversi_aktivitas       uniqueidentifier NULL,
    id_ekuivalensi              uniqueidentifier NULL,
    nilai_angka                 numeric(4,1)     NULL,
    nilai_huruf                 char(3)          NULL,
    nilai_indeks                numeric(4,2)     NULL,
    smt_ke                      numeric(2,0)     NOT NULL,
    sks_mk                      numeric(5,2)     NOT NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_nilai_transkrip PRIMARY KEY (id_reg_pd, id_mk)
);
GO

IF OBJECT_ID('siakadu.re_mk','U') IS NULL
CREATE TABLE siakadu.re_mk (
    id_re_mk                    uniqueidentifier NOT NULL,
    id_jns_eval                 smallint         NOT NULL,
    id_mk                       uniqueidentifier NOT NULL,
    no_urut                     int              NULL,
    komponen_evaluasi           char(3)          NULL,
    desk_indo                   varchar(1000)    NOT NULL,
    desk_ing                    varchar(1000)    NULL,
    bobot_evaluasi              numeric(7,4)     NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_re_mk PRIMARY KEY (id_re_mk)
);
GO

-- ============================================================================
-- SECTION 7: AKTIVITAS & PEMBIMBINGAN (akt_mhs, bimbing, uji)
-- ============================================================================
PRINT 'SECTION 7: Aktivitas & pembimbingan...'
GO

IF OBJECT_ID('siakadu.akt_mhs','U') IS NULL
CREATE TABLE siakadu.akt_mhs (
    id_akt_mhs                  uniqueidentifier NOT NULL,
    id_jns_akt_mhs              numeric(2,0)     NOT NULL,
    id_sms                      uniqueidentifier NOT NULL,
    id_smt                      char(5)          NOT NULL,
    judul_akt_mhs               varchar(500)     NOT NULL,
    lokasi_kegiatan             varchar(80)      NULL,
    sk_tugas                    varchar(80)      NULL,
    tgl_sk_tugas                date             NULL,
    ket_akt                     nvarchar(max)    NULL,
    a_komunal                   numeric(1,0)     NOT NULL DEFAULT 0,
    tgl_mulai                   datetime         NULL,
    tgl_selesai                 datetime         NULL,
    a_flagship                  numeric(1,0)     NULL DEFAULT 0,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_akt_mhs PRIMARY KEY (id_akt_mhs)
);
GO

IF OBJECT_ID('siakadu.anggota_akt_mhs','U') IS NULL
CREATE TABLE siakadu.anggota_akt_mhs (
    id_ang_akt_mhs              uniqueidentifier NOT NULL,
    id_akt_mhs                  uniqueidentifier NOT NULL,
    id_reg_pd                   uniqueidentifier NOT NULL,
    nm_pd                       varchar(120)     NOT NULL,
    nipd                        varchar(24)      NOT NULL,
    jns_peran_mhs               char(1)          NOT NULL DEFAULT '3',
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_anggota_akt_mhs PRIMARY KEY (id_ang_akt_mhs)
);
GO

IF OBJECT_ID('siakadu.bimbing_dosen','U') IS NULL
CREATE TABLE siakadu.bimbing_dosen (
    id_bimb_dosen               uniqueidentifier NOT NULL,
    id_katgiat                  int              NOT NULL,
    tgl_mulai                   date             NOT NULL,
    tgl_selesai                 date             NOT NULL,
    bid_ahli_pembimbing         varchar(50)      NULL,
    bid_ahli_bimbingan          varchar(50)      NULL,
    desk_kegiatan               nvarchar(max)    NULL,
    jns_bimbing                 char(1)          NOT NULL,
    sk_tugas                    varchar(80)      NOT NULL,
    tgl_sk_tugas                date             NOT NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_bimbing_dosen PRIMARY KEY (id_bimb_dosen)
);
GO

IF OBJECT_ID('siakadu.bimbing_mhs','U') IS NULL
CREATE TABLE siakadu.bimbing_mhs (
    id_bimb_mhs                 uniqueidentifier NOT NULL,
    id_katgiat                  int              NOT NULL,
    id_sdm                      uniqueidentifier NOT NULL,
    id_akt_mhs                  uniqueidentifier NOT NULL,
    urutan_promotor             numeric(1,0)     NOT NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_bimbing_mhs PRIMARY KEY (id_bimb_mhs)
);
GO

IF OBJECT_ID('siakadu.uji_mhs','U') IS NULL
CREATE TABLE siakadu.uji_mhs (
    id_uji_mhs                  uniqueidentifier NOT NULL,
    id_sdm                      uniqueidentifier NOT NULL,
    id_katgiat                  int              NOT NULL,
    id_akt_mhs                  uniqueidentifier NOT NULL,
    urutan_uji                  numeric(1,0)     NOT NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_uji_mhs PRIMARY KEY (id_uji_mhs)
);
GO

-- ============================================================================
-- SECTION 8: PRESENSI & KINERJA
-- ============================================================================
PRINT 'SECTION 8: Presensi & kinerja...'
GO

IF OBJECT_ID('siakadu.kehadiran_mhs','U') IS NULL
CREATE TABLE siakadu.kehadiran_mhs (
    id_reg_ptk                  uniqueidentifier NOT NULL,
    id_kls                      uniqueidentifier NOT NULL,
    id_hadir_mhs                uniqueidentifier NOT NULL,
    tgl_hadir                   datetime         NULL,
    waktu_presensi              datetime         NULL,
    stat_hadir                  char(1)          NOT NULL DEFAULT 'H',
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_kehadiran_mhs PRIMARY KEY (id_reg_ptk)
);
GO

IF OBJECT_ID('siakadu.kehadiran_sdm','U') IS NULL
CREATE TABLE siakadu.kehadiran_sdm (
    id_kehadiran_sdm            uniqueidentifier NOT NULL,
    id_sdm                      uniqueidentifier NOT NULL,
    tgl_hadir                   datetime         NOT NULL,
    waktu_presensi              datetime         NULL,
    lokasi_presensi             varchar(60)      NULL,
    waktu_pulang                datetime         NULL,
    lokasi_pulang               varchar(60)      NULL,
    rencana_hari_ini            nvarchar(max)    NULL,
    realisasi_hari_ini          nvarchar(max)    NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_kehadiran_sdm PRIMARY KEY (id_kehadiran_sdm)
);
GO

IF OBJECT_ID('siakadu.kinerja_dosen','U') IS NULL
CREATE TABLE siakadu.kinerja_dosen (
    id_reg_ptk                  uniqueidentifier NOT NULL,
    id_smt                      char(5)          NOT NULL,
    id_jabfung                  numeric(5,0)     NULL,
    stat_tugas                  char(1)          NULL,
    stat_belajar                char(1)          NULL,
    masa_laks_tgs_awal          datetime         NULL,
    masa_laks_tgs_akhir         datetime         NULL,
    sks_total                   numeric(7,4)     NOT NULL DEFAULT 0,
    sks_kinerja                 numeric(7,4)     NOT NULL DEFAULT 0,
    sks_lebih                   numeric(7,4)     NOT NULL DEFAULT 0,
    sks_kinerja_didik           numeric(7,4)     NOT NULL DEFAULT 0,
    sks_kinerja_ajar            numeric(7,4)     NULL,
    sks_kinerja_lit             numeric(7,4)     NOT NULL DEFAULT 0,
    sks_kinerja_pengmas         numeric(7,4)     NOT NULL DEFAULT 0,
    sks_kinerja_penunjang       numeric(7,4)     NOT NULL,
    sks_kinerja_tambahan        numeric(7,4)     NOT NULL DEFAULT 0,
    sks_lebih_didik             numeric(7,4)     NOT NULL DEFAULT 0,
    sks_lebih_ajar              numeric(7,4)     NULL,
    sks_lebih_lit               numeric(7,4)     NOT NULL DEFAULT 0,
    sks_lebih_pengmas           numeric(7,4)     NOT NULL DEFAULT 0,
    sks_lebih_tunjang           numeric(7,4)     NOT NULL,
    sks_lebih_tambahan          numeric(7,4)     NOT NULL,
    ewmp                        numeric(7,4)     NULL,
    simpulan_asesor             char(1)          NOT NULL,
    stat_kewajiban              numeric(1,0)     NULL,
    penilai_1                   varchar(200)     NULL,
    penilai_2                   varchar(200)     NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_kinerja_dosen PRIMARY KEY (id_reg_ptk, id_smt)
);
GO

-- ============================================================================
-- SECTION 9: KEUANGAN (spp_mhs dengan kolom nim v2, kelas_ukt, daftar_ukt)
-- ============================================================================
PRINT 'SECTION 9: Keuangan mahasiswa...'
GO

IF OBJECT_ID('siakadu.spp_mhs','U') IS NULL
CREATE TABLE siakadu.spp_mhs (
    id_spp_mhs                  uniqueidentifier NOT NULL,
    id_kelas_ukt                uniqueidentifier NULL,
    id_smt                      nvarchar(10)     NOT NULL,
    id_daftar_ukt               uniqueidentifier NULL,
    id_reg_pd                   uniqueidentifier NOT NULL,
    nim                         varchar(24)      NULL,       -- v2: bridging ke siakadu.mahasiswa
    tgl_bayar                   datetime         NOT NULL,
    nominal                     decimal(16,2)    NOT NULL,
    nm_smt                      nvarchar(50)     NULL,
    total_tagihan               decimal(16,2)    NULL DEFAULT 0,
    jumlah_spi                  decimal(16,2)    NULL DEFAULT 0,
    jumlah_denda                decimal(16,2)    NULL DEFAULT 0,
    jumlah_lainnya              decimal(16,2)    NULL DEFAULT 0,
    sisa_tagihan                decimal(16,2)    NULL DEFAULT 0,
    a_cicil                     int              NULL DEFAULT 0,
    cicilan_ke                  int              NULL DEFAULT 0,
    kode_pembayaran             nvarchar(50)     NULL,
    nomor_pin                   nvarchar(50)     NULL,
    kode_akses                  nvarchar(50)     NULL,
    bill_ref                    nvarchar(100)    NULL,
    flag_by                     nvarchar(50)     NULL,
    ket                         nvarchar(500)    NULL,
    create_date                 datetime         NOT NULL DEFAULT GETDATE(),
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL DEFAULT GETDATE(),
    id_updater                  uniqueidentifier NULL,
    soft_delete                 int              NOT NULL DEFAULT 0,
    last_sync                   datetime         NULL,
    CONSTRAINT pk_spp_mhs PRIMARY KEY (id_spp_mhs)
);
GO

IF OBJECT_ID('siakadu.kelas_ukt','U') IS NULL
CREATE TABLE siakadu.kelas_ukt (
    id_kelas_ukt                uniqueidentifier NOT NULL,
    nm_kelas_ukt                varchar(100)     NOT NULL,
    nominal_ukt                 numeric(16,2)    NOT NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_kelas_ukt PRIMARY KEY (id_kelas_ukt)
);
GO

IF OBJECT_ID('siakadu.daftar_ukt','U') IS NULL
CREATE TABLE siakadu.daftar_ukt (
    id_daftar_ukt               uniqueidentifier NOT NULL,
    id_prodi_simpedam           uniqueidentifier NOT NULL,
    nama_prodi                  varchar(255)     NOT NULL,
    tahun                       numeric(4,0)     NOT NULL,
    kode_fakultas               varchar(10)      NOT NULL,
    nama_fakultas               varchar(255)     NOT NULL,
    kode_kelas                  varchar(10)      NOT NULL,
    nama_kelas                  varchar(50)      NOT NULL,
    nominal                     numeric(16,2)    NOT NULL,
    kode_strata                 numeric(2,0)     NOT NULL,
    id_sms                      uniqueidentifier NULL,
    id_jenj_didik               numeric(2,0)     NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_daftar_ukt PRIMARY KEY (id_daftar_ukt)
);
GO

-- ============================================================================
-- SECTION 10: WISUDA (siakadu.periode_wisuda + siakadu.wisuda_mahasiswa)
-- ============================================================================
PRINT 'SECTION 10: Wisuda...'
GO

IF OBJECT_ID('siakadu.periode_wisuda','U') IS NULL
CREATE TABLE siakadu.periode_wisuda (
    id_periode_wisuda           varchar(10)      NOT NULL,
    nm_periode                  nvarchar(100)    NULL,
    tgl_wisuda                  datetime         NULL,
    id_thn_ajaran               numeric(4,0)     NULL,
    smt                         numeric(2,0)     NULL,
    tgl_mulai                   datetime         NULL,
    tgl_selesai                 datetime         NULL,
    keterangan                  nvarchar(500)    NULL,
    a_aktif                     numeric(1,0)     NOT NULL DEFAULT 1,
    create_date                 datetime         NOT NULL DEFAULT GETDATE(),
    last_update                 datetime         NOT NULL DEFAULT GETDATE(),
    last_sync                   datetime         NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    CONSTRAINT pk_periode_wisuda PRIMARY KEY (id_periode_wisuda)
);
GO

IF OBJECT_ID('siakadu.wisuda_mahasiswa','U') IS NULL
CREATE TABLE siakadu.wisuda_mahasiswa (
    id_yudisium                 int              NOT NULL,
    id_periode_wisuda           varchar(10)      NOT NULL,
    id_reg_pd                   uniqueidentifier NULL,
    nipd                        varchar(24)      NULL,
    nm_mahasiswa                nvarchar(120)    NULL,
    no_sk_yudisium              varchar(100)     NULL,
    tgl_sk_yudisium             datetime         NULL,
    no_ijasah                   varchar(100)     NULL,
    is_wisuda                   varchar(5)       NULL,
    is_hadir_wisuda             numeric(1,0)     NULL,
    is_valid_wisuda             numeric(1,0)     NULL,
    keterangan                  nvarchar(500)    NULL,
    ipk_lulusan                 numeric(5,2)     NULL,
    id_sms                      uniqueidentifier NULL,
    create_date                 datetime         NOT NULL,
    last_update                 datetime         NOT NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_wisuda_mahasiswa PRIMARY KEY (id_yudisium),
    CONSTRAINT fk_wisuda_mahasiswa_periode FOREIGN KEY (id_periode_wisuda)
        REFERENCES siakadu.periode_wisuda (id_periode_wisuda)
);
GO

-- ============================================================================
-- SECTION 11: LAIN-LAIN (nilai_tes)
-- ============================================================================
IF OBJECT_ID('siakadu.nilai_tes','U') IS NULL
CREATE TABLE siakadu.nilai_tes (
    id_nilai_tes                uniqueidentifier NOT NULL,
    id_sdm                      uniqueidentifier NOT NULL,
    id_jns_tes                  numeric(3,0)     NOT NULL,
    nm_nilai_tes                varchar(50)      NOT NULL,
    penyelenggara               varchar(100)     NOT NULL,
    thn                         numeric(4,0)     NOT NULL,
    skor                        numeric(6,2)     NOT NULL,
    tgl_tes                     date             NULL,
    a_valid                     numeric(1,0)     NULL DEFAULT 0,
    tgl_validasi                datetime         NULL,
    create_date                 datetime         NOT NULL,
    id_creator                  uniqueidentifier NOT NULL,
    last_update                 datetime         NOT NULL,
    id_updater                  uniqueidentifier NULL,
    soft_delete                 numeric(1,0)     NOT NULL DEFAULT 0,
    last_sync                   datetime         NOT NULL,
    CONSTRAINT pk_nilai_tes PRIMARY KEY (id_nilai_tes)
);
GO

-- ============================================================================
-- SECTION 12: MAPPING & LOGGING TABLES (bridging ke SIAKADU external)
-- ============================================================================
PRINT 'SECTION 12: Mapping & logging tables...'
GO

IF OBJECT_ID('siakadu.mapping_unit','U') IS NULL
CREATE TABLE siakadu.mapping_unit (
    kode_siakad                 varchar(20)      NOT NULL,
    id_sms                      uniqueidentifier NOT NULL,
    nm_unit                     nvarchar(200)    NULL,
    create_date                 datetime         NOT NULL DEFAULT GETDATE(),
    CONSTRAINT pk_mapping_unit PRIMARY KEY (kode_siakad)
);
GO

IF OBJECT_ID('siakadu.mapping_pegawai','U') IS NULL
CREATE TABLE siakadu.mapping_pegawai (
    nip                         varchar(18)      NOT NULL,
    id_sdm                      uniqueidentifier NOT NULL,
    nidn                        varchar(10)      NULL,
    create_date                 datetime         NOT NULL DEFAULT GETDATE(),
    CONSTRAINT pk_mapping_pegawai PRIMARY KEY (nip)
);
GO

IF OBJECT_ID('siakadu.mapping_matkul','U') IS NULL
CREATE TABLE siakadu.mapping_matkul (
    kode_mk_siakadu             varchar(20)      NOT NULL,
    id_unit_siakadu             varchar(20)      NOT NULL DEFAULT '',
    id_mk                       uniqueidentifier NOT NULL,
    a_sync_pddikti              numeric(1,0)     NOT NULL DEFAULT 0,
    create_date                 datetime         NOT NULL DEFAULT GETDATE(),
    CONSTRAINT pk_mapping_matkul PRIMARY KEY (kode_mk_siakadu, id_unit_siakadu)
);
GO

IF OBJECT_ID('siakadu.mapping_kurikulum','U') IS NULL
CREATE TABLE siakadu.mapping_kurikulum (
    kode_mk_siakadu             varchar(20)      NOT NULL,
    thn_kurikulum               int              NOT NULL,
    id_unit_siakadu             varchar(20)      NOT NULL DEFAULT '',
    id_kurikulum_sp             uniqueidentifier NOT NULL,
    id_mk                       uniqueidentifier NOT NULL,
    a_sync_pddikti              numeric(1,0)     NOT NULL DEFAULT 0,
    create_date                 datetime         NOT NULL DEFAULT GETDATE(),
    CONSTRAINT pk_mapping_kurikulum PRIMARY KEY (kode_mk_siakadu, thn_kurikulum)
);
GO

-- mapping_kelas, mapping_jadwal (reserved — dibuat saat diperlukan oleh service)
IF OBJECT_ID('siakadu.mapping_kelas','U') IS NULL
CREATE TABLE siakadu.mapping_kelas (
    id_kelas_siakadu            varchar(50)      NOT NULL,
    id_kls                      uniqueidentifier NOT NULL,
    create_date                 datetime         NOT NULL DEFAULT GETDATE(),
    CONSTRAINT pk_mapping_kelas PRIMARY KEY (id_kelas_siakadu)
);
GO

IF OBJECT_ID('siakadu.mapping_jadwal','U') IS NULL
CREATE TABLE siakadu.mapping_jadwal (
    id_jadwal_siakadu           varchar(50)      NOT NULL,
    id_jdwl_kls                 uniqueidentifier NOT NULL,
    create_date                 datetime         NOT NULL DEFAULT GETDATE(),
    CONSTRAINT pk_mapping_jadwal PRIMARY KEY (id_jadwal_siakadu)
);
GO

IF OBJECT_ID('siakadu.pimpinan_unit','U') IS NULL
CREATE TABLE siakadu.pimpinan_unit (
    id_pimpinan                 uniqueidentifier NOT NULL,
    id_unit                     varchar(20)      NOT NULL,
    id_sdm                      uniqueidentifier NULL,
    nip                         varchar(18)      NULL,
    nama                        nvarchar(120)    NULL,
    jabatan                     nvarchar(100)    NULL,
    tgl_mulai                   date             NULL,
    tgl_selesai                 date             NULL,
    create_date                 datetime         NOT NULL DEFAULT GETDATE(),
    last_update                 datetime         NOT NULL DEFAULT GETDATE(),
    last_sync                   datetime         NULL,
    CONSTRAINT pk_pimpinan_unit PRIMARY KEY (id_pimpinan)
);
GO

IF OBJECT_ID('siakadu.sync_log','U') IS NULL
CREATE TABLE siakadu.sync_log (
    id                          bigint IDENTITY(1,1) NOT NULL,
    endpoint_name               varchar(100)     NULL,
    endpoint_key                varchar(100)     NULL,
    sync_type                   varchar(50)      NULL,
    status                      varchar(20)      NULL,
    api_code                    varchar(50)      NULL,
    total_records               int              NULL,
    inserted_count              int              NULL,
    updated_count               int              NULL,
    failed_count                int              NULL,
    skipped_count               int              NULL,
    duration_ms                 int              NULL,
    error_message               nvarchar(500)    NULL,
    error_details               nvarchar(max)    NULL,
    synced_by                   varchar(50)      NULL,
    create_date                 datetime         NOT NULL DEFAULT GETDATE(),
    CONSTRAINT pk_sync_log PRIMARY KEY (id)
);
GO

-- ============================================================================
-- SECTION 13: FOREIGN KEYS (hanya yg relevan — tanpa reg_pd/peserta_didik)
-- ============================================================================
PRINT 'SECTION 13: Foreign key constraints...'
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_sms_jenjang_pendidikan')
    ALTER TABLE siakadu.sms ADD CONSTRAINT fk_sms_jenjang_pendidikan
        FOREIGN KEY (id_jenj_didik) REFERENCES siakadu.jenjang_pendidikan (id_jenj_didik);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_reg_ptk_sdm')
    ALTER TABLE siakadu.reg_ptk ADD CONSTRAINT fk_reg_ptk_sdm
        FOREIGN KEY (id_sdm) REFERENCES siakadu.sdm (id_sdm);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_reg_ptk_sms')
    ALTER TABLE siakadu.reg_ptk ADD CONSTRAINT fk_reg_ptk_sms
        FOREIGN KEY (id_sms) REFERENCES siakadu.sms (id_sms);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_matkul_jenjang_pendidikan')
    ALTER TABLE siakadu.matkul ADD CONSTRAINT fk_matkul_jenjang_pendidikan
        FOREIGN KEY (id_jenj_didik) REFERENCES siakadu.jenjang_pendidikan (id_jenj_didik);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_kelas_kuliah_semester')
    ALTER TABLE siakadu.kelas_kuliah ADD CONSTRAINT fk_kelas_kuliah_semester
        FOREIGN KEY (id_smt) REFERENCES siakadu.semester (id_smt);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_kelas_kuliah_matkul')
    ALTER TABLE siakadu.kelas_kuliah ADD CONSTRAINT fk_kelas_kuliah_matkul
        FOREIGN KEY (id_mk) REFERENCES siakadu.matkul (id_mk);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_akt_ajar_dosen_reg_ptk')
    ALTER TABLE siakadu.akt_ajar_dosen ADD CONSTRAINT fk_akt_ajar_dosen_reg_ptk
        FOREIGN KEY (id_reg_ptk) REFERENCES siakadu.reg_ptk (id_reg_ptk);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_akt_ajar_dosen_kelas_kuliah')
    ALTER TABLE siakadu.akt_ajar_dosen ADD CONSTRAINT fk_akt_ajar_dosen_kelas_kuliah
        FOREIGN KEY (id_kls) REFERENCES siakadu.kelas_kuliah (id_kls);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_jadwal_kelas_kelas_kuliah')
    ALTER TABLE siakadu.jadwal_kelas ADD CONSTRAINT fk_jadwal_kelas_kelas_kuliah
        FOREIGN KEY (id_kls) REFERENCES siakadu.kelas_kuliah (id_kls);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_jadwal_kelas_semester')
    ALTER TABLE siakadu.jadwal_kelas ADD CONSTRAINT fk_jadwal_kelas_semester
        FOREIGN KEY (id_smt) REFERENCES siakadu.semester (id_smt);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_akt_mhs_sms')
    ALTER TABLE siakadu.akt_mhs ADD CONSTRAINT fk_akt_mhs_sms
        FOREIGN KEY (id_sms) REFERENCES siakadu.sms (id_sms);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_akt_mhs_semester')
    ALTER TABLE siakadu.akt_mhs ADD CONSTRAINT fk_akt_mhs_semester
        FOREIGN KEY (id_smt) REFERENCES siakadu.semester (id_smt);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_anggota_akt_mhs_akt_mhs')
    ALTER TABLE siakadu.anggota_akt_mhs ADD CONSTRAINT fk_anggota_akt_mhs_akt_mhs
        FOREIGN KEY (id_akt_mhs) REFERENCES siakadu.akt_mhs (id_akt_mhs);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_bimbing_mhs_sdm')
    ALTER TABLE siakadu.bimbing_mhs ADD CONSTRAINT fk_bimbing_mhs_sdm
        FOREIGN KEY (id_sdm) REFERENCES siakadu.sdm (id_sdm);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_bimbing_mhs_akt_mhs')
    ALTER TABLE siakadu.bimbing_mhs ADD CONSTRAINT fk_bimbing_mhs_akt_mhs
        FOREIGN KEY (id_akt_mhs) REFERENCES siakadu.akt_mhs (id_akt_mhs);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_uji_mhs_sdm')
    ALTER TABLE siakadu.uji_mhs ADD CONSTRAINT fk_uji_mhs_sdm
        FOREIGN KEY (id_sdm) REFERENCES siakadu.sdm (id_sdm);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_uji_mhs_akt_mhs')
    ALTER TABLE siakadu.uji_mhs ADD CONSTRAINT fk_uji_mhs_akt_mhs
        FOREIGN KEY (id_akt_mhs) REFERENCES siakadu.akt_mhs (id_akt_mhs);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_kehadiran_mhs_kelas_kuliah')
    ALTER TABLE siakadu.kehadiran_mhs ADD CONSTRAINT fk_kehadiran_mhs_kelas_kuliah
        FOREIGN KEY (id_kls) REFERENCES siakadu.kelas_kuliah (id_kls);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_kehadiran_sdm_sdm')
    ALTER TABLE siakadu.kehadiran_sdm ADD CONSTRAINT fk_kehadiran_sdm_sdm
        FOREIGN KEY (id_sdm) REFERENCES siakadu.sdm (id_sdm);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_spp_mhs_semester')
    ALTER TABLE siakadu.spp_mhs ADD CONSTRAINT fk_spp_mhs_semester
        FOREIGN KEY (id_smt) REFERENCES siakadu.semester (id_smt);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_daftar_ukt_sms')
    ALTER TABLE siakadu.daftar_ukt ADD CONSTRAINT fk_daftar_ukt_sms
        FOREIGN KEY (id_sms) REFERENCES siakadu.sms (id_sms);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_daftar_ukt_jenjang_pendidikan')
    ALTER TABLE siakadu.daftar_ukt ADD CONSTRAINT fk_daftar_ukt_jenjang_pendidikan
        FOREIGN KEY (id_jenj_didik) REFERENCES siakadu.jenjang_pendidikan (id_jenj_didik);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='fk_nilai_tes_sdm')
    ALTER TABLE siakadu.nilai_tes ADD CONSTRAINT fk_nilai_tes_sdm
        FOREIGN KEY (id_sdm) REFERENCES siakadu.sdm (id_sdm);
GO

-- ============================================================================
-- SECTION 14: INDEXES (yang relevan, non-redundant dengan PK)
-- ============================================================================
PRINT 'SECTION 14: Indexes...'
GO

-- mahasiswa
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_mahasiswa_angkatan')
    CREATE INDEX idx_mahasiswa_angkatan      ON siakadu.mahasiswa (angkatan);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_mahasiswa_id_unit')
    CREATE INDEX idx_mahasiswa_id_unit       ON siakadu.mahasiswa (id_unit);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_mahasiswa_id_status_mhs')
    CREATE INDEX idx_mahasiswa_id_status_mhs ON siakadu.mahasiswa (id_status_mhs);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_mahasiswa_id_stat_mhs')
    CREATE INDEX idx_mahasiswa_id_stat_mhs   ON siakadu.mahasiswa (id_stat_mhs);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_mahasiswa_nama')
    CREATE INDEX idx_mahasiswa_nama          ON siakadu.mahasiswa (nama);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_mahasiswa_id_pd')
    CREATE INDEX idx_mahasiswa_id_pd         ON siakadu.mahasiswa (id_pd) WHERE id_pd IS NOT NULL;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_mahasiswa_id_reg_pd')
    CREATE INDEX idx_mahasiswa_id_reg_pd     ON siakadu.mahasiswa (id_reg_pd) WHERE id_reg_pd IS NOT NULL;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_mahasiswa_id_sms')
    CREATE INDEX idx_mahasiswa_id_sms        ON siakadu.mahasiswa (id_sms) WHERE id_sms IS NOT NULL;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_mahasiswa_nik')
    CREATE INDEX idx_mahasiswa_nik           ON siakadu.mahasiswa (nik) WHERE nik IS NOT NULL;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_mahasiswa_id_jns_keluar')
    CREATE INDEX idx_mahasiswa_id_jns_keluar ON siakadu.mahasiswa (id_jns_keluar);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_mahasiswa_soft_delete')
    CREATE INDEX idx_mahasiswa_soft_delete   ON siakadu.mahasiswa (soft_delete);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_mahasiswa_last_sync')
    CREATE INDEX idx_mahasiswa_last_sync     ON siakadu.mahasiswa (last_sync);

-- keluarga_mhs
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_keluarga_mhs_nim')
    CREATE INDEX idx_keluarga_mhs_nim ON siakadu.keluarga_mhs (nim);

-- kuliah_mhs.nim, spp_mhs.nim (v2 bridging)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_kuliah_mhs_nim')
    CREATE INDEX idx_kuliah_mhs_nim ON siakadu.kuliah_mhs (nim);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_spp_mhs_nim')
    CREATE INDEX idx_spp_mhs_nim    ON siakadu.spp_mhs (nim);

-- lain-lain
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_sms_id_jenj_didik')
    CREATE INDEX idx_sms_id_jenj_didik    ON siakadu.sms (id_jenj_didik);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_matkul_id_sms')
    CREATE INDEX idx_matkul_id_sms        ON siakadu.matkul (id_sms);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_kelas_kuliah_id_smt')
    CREATE INDEX idx_kelas_kuliah_id_smt  ON siakadu.kelas_kuliah (id_smt);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_kelas_kuliah_id_sms')
    CREATE INDEX idx_kelas_kuliah_id_sms  ON siakadu.kelas_kuliah (id_sms);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_kelas_kuliah_id_mk')
    CREATE INDEX idx_kelas_kuliah_id_mk   ON siakadu.kelas_kuliah (id_mk);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_spp_mhs_id_reg_pd')
    CREATE INDEX idx_spp_mhs_id_reg_pd    ON siakadu.spp_mhs (id_reg_pd);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_sync_log_endpoint')
    CREATE INDEX idx_sync_log_endpoint    ON siakadu.sync_log (endpoint_key);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_sync_log_create')
    CREATE INDEX idx_sync_log_create      ON siakadu.sync_log (create_date DESC);
GO

-- ============================================================================
-- SECTION 15: SEED DATA (reference)
-- ============================================================================
PRINT 'SECTION 15: Seed reference data...'
GO

-- 15a. status_mahasiswa
IF NOT EXISTS (SELECT 1 FROM siakadu.status_mahasiswa WHERE id_stat_mhs = 'A')
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
GO

-- 15b. jenjang_pendidikan (PDDIKTI standard)
IF NOT EXISTS (SELECT 1 FROM siakadu.jenjang_pendidikan WHERE id_jenj_didik = 30)
INSERT INTO siakadu.jenjang_pendidikan (id_jenj_didik, a_ref_pddikti, a_ref_unila, nm_jenj_didik, create_date, last_update, last_sync)
VALUES
    (20, 1, 1, 'D1',            GETDATE(), GETDATE(), GETDATE()),
    (21, 1, 1, 'D2',            GETDATE(), GETDATE(), GETDATE()),
    (22, 1, 1, 'D3',            GETDATE(), GETDATE(), GETDATE()),
    (23, 1, 1, 'D4',            GETDATE(), GETDATE(), GETDATE()),
    (25, 1, 1, 'Profesi',       GETDATE(), GETDATE(), GETDATE()),
    (30, 1, 1, 'S1',            GETDATE(), GETDATE(), GETDATE()),
    (32, 1, 1, 'Sp-1',          GETDATE(), GETDATE(), GETDATE()),
    (35, 1, 1, 'S2',            GETDATE(), GETDATE(), GETDATE()),
    (36, 1, 1, 'S2 Terapan',    GETDATE(), GETDATE(), GETDATE()),
    (37, 1, 1, 'Sp-2',          GETDATE(), GETDATE(), GETDATE()),
    (40, 1, 1, 'S3',            GETDATE(), GETDATE(), GETDATE()),
    (41, 1, 1, 'S3 Terapan',    GETDATE(), GETDATE(), GETDATE());
GO

-- 15c. semester (2000-2026, 3 variants: ganjil/genap/antara)
DECLARE @yr INT = 2000;
WHILE @yr <= 2026
BEGIN
    DECLARE @smt INT = 1;
    WHILE @smt <= 3
    BEGIN
        DECLARE @idSmt CHAR(5) = CAST(@yr AS VARCHAR(4)) + CAST(@smt AS VARCHAR(1));
        DECLARE @nmSmt VARCHAR(50) =
            CASE @smt
                WHEN 1 THEN 'Ganjil '
                WHEN 2 THEN 'Genap '
                ELSE 'Antara '
            END + CAST(@yr AS VARCHAR(4)) + '/' + CAST(@yr+1 AS VARCHAR(4));

        IF NOT EXISTS (SELECT 1 FROM siakadu.semester WHERE id_smt = @idSmt)
        INSERT INTO siakadu.semester (id_smt, id_thn_ajaran, a_ref_pddikti, a_ref_unila, nm_smt, smt, tgl_mulai, tgl_selesai, create_date, last_update, last_sync)
        VALUES (@idSmt, @yr, 1, 1, @nmSmt, @smt, GETDATE(), GETDATE(), GETDATE(), GETDATE(), GETDATE());

        SET @smt = @smt + 1;
    END;
    SET @yr = @yr + 1;
END;
GO

-- ============================================================================
-- SECTION 16: SUMMARY
-- ============================================================================
PRINT ''
PRINT '=== SIAKADU Schema v2.0 Fresh Deploy — COMPLETE ==='
PRINT ''

SELECT
    t.name AS table_name,
    p.rows AS row_count
FROM sys.tables t
JOIN sys.schemas s ON t.schema_id = s.schema_id
JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0, 1)
WHERE s.name = 'siakadu'
ORDER BY t.name;

PRINT ''
PRINT 'Tabel v2 utama:'
PRINT '  - siakadu.mahasiswa (flat, PK nim) — MENGGANTIKAN peserta_didik + reg_pd'
PRINT '  - siakadu.keluarga_mhs (PK nim + status_keluarga)'
PRINT '  - kuliah_mhs, spp_mhs sudah memiliki kolom nim untuk bridging'
PRINT '  - wisuda_mahasiswa + periode_wisuda untuk modul wisuda'
PRINT '  - mapping_unit, mapping_matkul, mapping_kurikulum, mapping_pegawai'
PRINT '  - sync_log untuk audit sync'
PRINT ''
PRINT 'Next steps:'
PRINT '  1. Deploy myunila-service backend'
PRINT '  2. Login ke frontend, klik Sinkronisasi Data di tiap modul siakadu'
PRINT '     urutan: akademik (matkul/kurikulum/kelas) → mahasiswa → nilai → wisuda'
PRINT '  3. Monitor /dashboard/integrator/monitoring untuk status sync'
GO
