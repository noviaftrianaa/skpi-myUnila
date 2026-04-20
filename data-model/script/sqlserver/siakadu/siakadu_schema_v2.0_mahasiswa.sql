-- ============================================================================
-- SIAKADU Schema v2.0 — Modul Mahasiswa (Clean Fresh)
-- Target: SQL Server pdut_staging
-- Source of Truth: api-siakadu MahasiswaDetail entity (131 fields)
--
-- Desain:
--   1. NIM sebagai natural PK (bukan UUID)
--   2. Flat table: semua data mahasiswa di 1 tabel
--   3. UUID mapping kolom (id_pd, id_reg_pd, id_sms) untuk bridging ke pdrd
--   4. Referensi FK compatible dengan ref.* dan pdrd.* schema
--   5. Clean fresh — bisa di-deploy standalone tanpa v1.0
-- ============================================================================

-- ============================================================================
-- 1. TABEL UTAMA: siakadu.mahasiswa
-- ============================================================================
IF OBJECT_ID('siakadu.mahasiswa', 'U') IS NOT NULL
    DROP TABLE siakadu.mahasiswa;
GO

CREATE TABLE siakadu.mahasiswa (
    -- PRIMARY KEY
    nim                         varchar(24)          NOT NULL,

    -- ======================================================================
    -- CORE IDENTITY
    -- ======================================================================
    nama                        nvarchar(120)        NOT NULL,
    angkatan                    varchar(4)           NULL,
    gelar_depan                 varchar(30)          NULL,
    gelar_belakang              varchar(30)          NULL,
    jk                          char(1)              NULL,          -- L/P
    tmpt_lahir                  nvarchar(80)         NULL,
    tgl_lahir                   date                 NULL,
    status_nikah                varchar(20)          NULL,

    -- ======================================================================
    -- DOCUMENTS
    -- ======================================================================
    nik                         varchar(20)          NULL,
    nokk                        varchar(20)          NULL,
    nisn                        varchar(20)          NULL,
    nupn                        varchar(20)          NULL,
    no_kps                      varchar(40)          NULL,
    npsn                        varchar(20)          NULL,
    nomor_tes                   varchar(50)          NULL,
    no_skdo                     nvarchar(100)        NULL,
    pt_nim                      varchar(50)          NULL,

    -- ======================================================================
    -- CONTACT
    -- ======================================================================
    alamat                      nvarchar(500)        NULL,
    telepon                     varchar(20)          NULL,
    hp                          varchar(20)          NULL,
    hp2                         varchar(20)          NULL,
    email                       varchar(100)         NULL,
    email_kampus                varchar(100)         NULL,
    email_ortu                  varchar(100)         NULL,
    kode_pos                    varchar(10)          NULL,

    -- ======================================================================
    -- ADDRESS DETAIL
    -- ======================================================================
    id_kota                     varchar(20)          NULL,
    nama_kota                   nvarchar(100)        NULL,
    id_kecamatan                varchar(20)          NULL,
    kecamatan                   nvarchar(100)        NULL,
    rt                          varchar(5)           NULL,
    rw                          varchar(5)           NULL,
    dusun                       nvarchar(60)         NULL,
    desa                        nvarchar(60)         NULL,

    -- ======================================================================
    -- ACADEMIC
    -- ======================================================================
    id_unit                     varchar(20)          NULL,          -- kode unit siakadu
    nm_fakultas                 nvarchar(200)        NULL,          -- denormalized
    nm_jurusan                  nvarchar(200)        NULL,          -- denormalized
    nm_prodi                    nvarchar(200)        NULL,          -- denormalized
    nm_bidang_studi             nvarchar(200)        NULL,
    id_kurikulum                varchar(20)          NULL,
    semester                    varchar(10)          NULL,
    ipk                         numeric(5,2)         NULL,
    sks_total                   int                  NULL,
    sks_lulus                   int                  NULL,
    id_periode                  varchar(10)          NULL,
    id_status_mhs               varchar(10)          NULL,          -- maps to status_mahasiswa
    status_mahasiswa            nvarchar(30)         NULL,          -- denormalized name
    id_sistem_kuliah            int                  NULL,
    nm_sistem_kuliah            nvarchar(50)         NULL,
    id_periode_max              varchar(10)          NULL,
    periode_terakhir            varchar(50)          NULL,
    nama_kelas                  nvarchar(50)         NULL,

    -- ======================================================================
    -- SOCIO-ECONOMIC
    -- ======================================================================
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

    -- ======================================================================
    -- ADMISSION
    -- ======================================================================
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

    -- ======================================================================
    -- TRANSFER
    -- ======================================================================
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

    -- ======================================================================
    -- HIGH SCHOOL
    -- ======================================================================
    asal_smu                    nvarchar(200)        NULL,
    alamat_smu                  nvarchar(500)        NULL,
    id_kota_smu                 varchar(20)          NULL,
    telp_smu                    varchar(20)          NULL,
    no_ijazah_smu               varchar(50)          NULL,
    jurusan_sekolah             nvarchar(100)        NULL,
    nem                         numeric(7,2)         NULL,
    thn_lulus_sekolah            int                  NULL,

    -- ======================================================================
    -- FINANCE
    -- ======================================================================
    kategori_ukt                nvarchar(50)         NULL,

    -- ======================================================================
    -- INTEGRATION
    -- ======================================================================
    edlink_student_id           int                  NULL,

    -- ======================================================================
    -- UUID MAPPING (bridging ke pdrd / PDDIKTI)
    -- ======================================================================
    id_pd                       uniqueidentifier     NULL,          -- maps to pdrd.peserta_didik.id_pd
    id_reg_pd                   uniqueidentifier     NULL,          -- maps to pdrd.reg_pd.id_reg_pd
    id_sms                      uniqueidentifier     NULL,          -- maps to pdrd.sms.id_sms (resolved via mapping_unit)

    -- Referensi FK compatible dengan pdrd/ref:
    id_stat_mhs                 char(1)              NULL,          -- FK ref.status_mahasiswa / siakadu.status_mahasiswa
    id_jenj_didik               numeric(2)           NULL,          -- FK ref.jenjang_pendidikan (via pdrd.sms)
    id_jns_keluar               char(1)              NULL,          -- FK ref.jenis_keluar
    id_jns_daftar               numeric(2)           NULL,          -- FK ref.jenis_pendaftaran
    id_jalur_daftar             numeric              NULL,          -- FK ref.jalur_daftar
    id_smt_masuk                char(5)              NULL,          -- FK ref.semester (semester masuk)
    tgl_keluar                  date                 NULL,
    ket_keluar                  nvarchar(200)        NULL,

    -- ======================================================================
    -- AUDIT
    -- ======================================================================
    create_date                 datetime             NOT NULL DEFAULT GETDATE(),
    last_update                 datetime             NOT NULL DEFAULT GETDATE(),
    last_sync                   datetime             NULL,
    soft_delete                 numeric(1,0)         NOT NULL DEFAULT 0,
    update_user                 varchar(50)          NULL,

    -- ======================================================================
    -- CONSTRAINTS
    -- ======================================================================
    CONSTRAINT pk_mahasiswa PRIMARY KEY (nim),
    CONSTRAINT chk_mahasiswa_jk CHECK (jk IN ('L', 'P')),
    CONSTRAINT chk_mahasiswa_soft_delete CHECK (soft_delete IN (0, 1))
);
GO

-- Indexes
CREATE INDEX idx_mahasiswa_angkatan ON siakadu.mahasiswa (angkatan);
CREATE INDEX idx_mahasiswa_id_unit ON siakadu.mahasiswa (id_unit);
CREATE INDEX idx_mahasiswa_id_status_mhs ON siakadu.mahasiswa (id_status_mhs);
CREATE INDEX idx_mahasiswa_id_stat_mhs ON siakadu.mahasiswa (id_stat_mhs);
CREATE INDEX idx_mahasiswa_nama ON siakadu.mahasiswa (nama);
CREATE INDEX idx_mahasiswa_id_pd ON siakadu.mahasiswa (id_pd) WHERE id_pd IS NOT NULL;
CREATE INDEX idx_mahasiswa_id_reg_pd ON siakadu.mahasiswa (id_reg_pd) WHERE id_reg_pd IS NOT NULL;
CREATE INDEX idx_mahasiswa_id_sms ON siakadu.mahasiswa (id_sms) WHERE id_sms IS NOT NULL;
CREATE INDEX idx_mahasiswa_nik ON siakadu.mahasiswa (nik) WHERE nik IS NOT NULL;
CREATE INDEX idx_mahasiswa_id_jns_keluar ON siakadu.mahasiswa (id_jns_keluar);
CREATE INDEX idx_mahasiswa_soft_delete ON siakadu.mahasiswa (soft_delete);
CREATE INDEX idx_mahasiswa_last_sync ON siakadu.mahasiswa (last_sync);
GO


-- ============================================================================
-- 2. TABEL: siakadu.keluarga_mhs
-- ============================================================================
IF OBJECT_ID('siakadu.keluarga_mhs', 'U') IS NOT NULL
    DROP TABLE siakadu.keluarga_mhs;
GO

CREATE TABLE siakadu.keluarga_mhs (
    nim                         varchar(24)          NOT NULL,
    status_keluarga             varchar(20)          NOT NULL,      -- 'Ayah', 'Ibu', 'Wali'
    nama                        nvarchar(120)        NULL,
    status_ortu                 nvarchar(50)         NULL,          -- Kandung/Tiri
    kondisi_ortu                nvarchar(50)         NULL,          -- Masih/Meninggal
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

    -- AUDIT
    create_date                 datetime             NOT NULL DEFAULT GETDATE(),
    last_update                 datetime             NOT NULL DEFAULT GETDATE(),
    last_sync                   datetime             NULL,
    update_user                 varchar(50)          NULL,

    CONSTRAINT pk_keluarga_mhs PRIMARY KEY (nim, status_keluarga),
    CONSTRAINT fk_keluarga_mhs_mahasiswa FOREIGN KEY (nim) REFERENCES siakadu.mahasiswa (nim)
        ON DELETE CASCADE ON UPDATE CASCADE
);
GO

CREATE INDEX idx_keluarga_mhs_nim ON siakadu.keluarga_mhs (nim);
GO


-- ============================================================================
-- 3. BACKWARD-COMPAT VIEWS (sementara, untuk transisi)
-- ============================================================================

-- View peserta_didik shape (untuk code yang masih query peserta_didik)
IF OBJECT_ID('siakadu.v_peserta_didik', 'V') IS NOT NULL
    DROP VIEW siakadu.v_peserta_didik;
GO

CREATE VIEW siakadu.v_peserta_didik AS
SELECT
    ISNULL(id_pd, NEWID())       AS id_pd,
    nama                         AS nm_pd,
    jk,
    nisn,
    nik,
    tmpt_lahir,
    tgl_lahir,
    alamat                       AS jln,
    kode_pos,
    telepon                      AS tlpn_rumah,
    hp                           AS tlpn_hp,
    email,
    id_agama,
    id_stat_mhs,
    nim,
    create_date,
    last_update,
    soft_delete,
    last_sync
FROM siakadu.mahasiswa;
GO

-- View reg_pd shape (untuk code yang masih query reg_pd)
IF OBJECT_ID('siakadu.v_reg_pd', 'V') IS NOT NULL
    DROP VIEW siakadu.v_reg_pd;
GO

CREATE VIEW siakadu.v_reg_pd AS
SELECT
    ISNULL(id_reg_pd, NEWID())   AS id_reg_pd,
    id_pd,
    nim                          AS nipd,
    id_jns_daftar,
    id_jalur_daftar,
    id_sms,
    id_smt_masuk                 AS id_semester_masuk,
    angkatan,
    ipk,
    sks_total,
    sks_lulus,
    semester,
    id_status_mhs                AS id_status_mahasiswa,
    id_jns_keluar,
    tgl_keluar,
    ket_keluar,
    id_unit,
    nim,
    create_date,
    last_update,
    soft_delete,
    last_sync
FROM siakadu.mahasiswa;
GO


-- ============================================================================
-- 4. PRINT SUMMARY
-- ============================================================================
PRINT '=== Siakadu Schema v2.0 — Mahasiswa Module ==='
PRINT 'Tables created:'
PRINT '  - siakadu.mahasiswa (PK: nim)'
PRINT '  - siakadu.keluarga_mhs (PK: nim + status_keluarga)'
PRINT 'Views created:'
PRINT '  - siakadu.v_peserta_didik (backward-compat)'
PRINT '  - siakadu.v_reg_pd (backward-compat)'
PRINT ''
PRINT 'UUID mapping columns: id_pd, id_reg_pd, id_sms'
PRINT 'Ref FK columns: id_stat_mhs, id_jenj_didik, id_jns_keluar, id_jns_daftar, id_jalur_daftar, id_smt_masuk'
PRINT ''
PRINT 'Deploy complete.'
GO
