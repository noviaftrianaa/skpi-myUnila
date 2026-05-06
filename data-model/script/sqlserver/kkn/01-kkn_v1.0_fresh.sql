-- ============================================================================
-- Script  : SI KKN — Sistem Informasi Kuliah Kerja Nyata
-- Database: SQL Server (schema kkn.* dalam database pdut)
-- Version : 1.0
-- Date    : 2026-05-05
-- Source   : Konversi dari PostgreSQL si-kkn-schema.sql + CDM PDUT-Master-Update-2026
--
-- Deskripsi:
--   Modul manajemen KKN Universitas Lampung meliputi pendaftaran,
--   pembentukan kelompok, kegiatan lapangan, penilaian, dokumen,
--   dan audit trail.
--
--   Arsitektur: Semua tabel di-prefix schema "kkn" dalam database pdut.
--   Data referensi mahasiswa/dosen diambil dari schema pdrd, ref, man_akses
--   (read-only, tidak ada FK cross-schema).
--
--   Tables (25 total):
--     kkn.periode_kkn            - Periode pelaksanaan KKN
--     kkn.lokasi_kkn             - Lokasi penempatan (desa/dusun)
--     kkn.wilayah_kkn            - Wilayah/zona pengelompokan
--     kkn.jenis_dokumen          - Jenis dokumen KKN
--     kkn.komponen_penilaian     - Komponen & bobot penilaian
--     kkn.kriteria_pendaftaran   - Syarat pendaftaran KKN
--     kkn.registrasi_kkn         - Registrasi pendaftaran mahasiswa
--     kkn.data_pemohon           - Snapshot data mahasiswa saat daftar
--     kkn.verifikasi_syarat      - Hasil verifikasi syarat pendaftaran
--     kkn.kelompok_kkn           - Kelompok KKN
--     kkn.anggota_kelompok       - Anggota kelompok KKN
--     kkn.dpl_kelompok           - Dosen Pembimbing Lapangan
--     kkn.pamong_desa            - Pamong desa pendamping
--     kkn.program_kerja          - Program kerja kelompok
--     kkn.logbook_harian         - Logbook harian anggota
--     kkn.laporan_kelompok       - Laporan kelompok
--     kkn.absensi                - Absensi harian anggota
--     kkn.catatan_bimbingan      - Catatan bimbingan DPL
--     kkn.nilai_mahasiswa        - Nilai per komponen penilaian
--     kkn.nilai_akhir            - Nilai akhir / rekapitulasi
--     kkn.penilaian_pamong       - Penilaian dari pamong desa
--     kkn.dokumen_kkn            - Dokumen KKN
--     kkn.sertifikat             - Sertifikat kelulusan KKN
--     kkn.jejak_audit            - Audit trail aktivitas
--     kkn.aktivitas_data         - Log perubahan data
--
--   Naming Convention (seformat dengan monitoring, simbak, man_akses):
--     - PK       : id_<tabel> UNIQUEIDENTIFIER DEFAULT NEWID()
--     - FK       : id_<referensi> UNIQUEIDENTIFIER
--     - Name     : nm_<field>
--     - Date     : tgl_<field>
--     - Boolean  : a_<field> NUMERIC(1) DEFAULT 0 CHECK (val IN (0,1))
--     - Audit    : id_creator, id_updater, create_date, last_update, soft_delete
--     - Index    : idx_kkn_<tabel>_<kolom>
-- ============================================================================

-- DROP semua tabel (urut terbalik karena FK)
IF OBJECT_ID('kkn.aktivitas_data',       'U') IS NOT NULL DROP TABLE kkn.aktivitas_data
IF OBJECT_ID('kkn.jejak_audit',          'U') IS NOT NULL DROP TABLE kkn.jejak_audit
IF OBJECT_ID('kkn.sertifikat',           'U') IS NOT NULL DROP TABLE kkn.sertifikat
IF OBJECT_ID('kkn.dokumen_kkn',          'U') IS NOT NULL DROP TABLE kkn.dokumen_kkn
IF OBJECT_ID('kkn.penilaian_pamong',     'U') IS NOT NULL DROP TABLE kkn.penilaian_pamong
IF OBJECT_ID('kkn.nilai_akhir',          'U') IS NOT NULL DROP TABLE kkn.nilai_akhir
IF OBJECT_ID('kkn.nilai_mahasiswa',      'U') IS NOT NULL DROP TABLE kkn.nilai_mahasiswa
IF OBJECT_ID('kkn.catatan_bimbingan',    'U') IS NOT NULL DROP TABLE kkn.catatan_bimbingan
IF OBJECT_ID('kkn.absensi',             'U') IS NOT NULL DROP TABLE kkn.absensi
IF OBJECT_ID('kkn.laporan_kelompok',     'U') IS NOT NULL DROP TABLE kkn.laporan_kelompok
IF OBJECT_ID('kkn.logbook_harian',       'U') IS NOT NULL DROP TABLE kkn.logbook_harian
IF OBJECT_ID('kkn.program_kerja',        'U') IS NOT NULL DROP TABLE kkn.program_kerja
IF OBJECT_ID('kkn.pamong_desa',          'U') IS NOT NULL DROP TABLE kkn.pamong_desa
IF OBJECT_ID('kkn.dpl_kelompok',         'U') IS NOT NULL DROP TABLE kkn.dpl_kelompok
IF OBJECT_ID('kkn.anggota_kelompok',     'U') IS NOT NULL DROP TABLE kkn.anggota_kelompok
IF OBJECT_ID('kkn.kelompok_kkn',         'U') IS NOT NULL DROP TABLE kkn.kelompok_kkn
IF OBJECT_ID('kkn.verifikasi_syarat',    'U') IS NOT NULL DROP TABLE kkn.verifikasi_syarat
IF OBJECT_ID('kkn.data_pemohon',         'U') IS NOT NULL DROP TABLE kkn.data_pemohon
IF OBJECT_ID('kkn.registrasi_kkn',       'U') IS NOT NULL DROP TABLE kkn.registrasi_kkn
IF OBJECT_ID('kkn.kriteria_pendaftaran', 'U') IS NOT NULL DROP TABLE kkn.kriteria_pendaftaran
IF OBJECT_ID('kkn.komponen_penilaian',   'U') IS NOT NULL DROP TABLE kkn.komponen_penilaian
IF OBJECT_ID('kkn.jenis_dokumen',        'U') IS NOT NULL DROP TABLE kkn.jenis_dokumen
IF OBJECT_ID('kkn.wilayah_kkn',          'U') IS NOT NULL DROP TABLE kkn.wilayah_kkn
IF OBJECT_ID('kkn.lokasi_kkn',           'U') IS NOT NULL DROP TABLE kkn.lokasi_kkn
IF OBJECT_ID('kkn.periode_kkn',          'U') IS NOT NULL DROP TABLE kkn.periode_kkn
go

-- 1. SCHEMA
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'kkn')
BEGIN EXEC('CREATE SCHEMA kkn') PRINT '>> Schema kkn created.' END
ELSE PRINT '>> Schema kkn already exists.'
go

-- ============================================================================
-- REFERENSI / MASTER (6 tabel)
-- ============================================================================

-- 2. kkn.periode_kkn
create table kkn.periode_kkn (
    id_periode_kkn      uniqueidentifier    not null default newid(),
    kode_periode        nvarchar(30)        not null,
    nm_periode          nvarchar(200)       not null,
    id_smt              nvarchar(10)        null,
    tahun_akademik      nvarchar(9)         null,
    gelombang           int                 not null default 1,
    tgl_daftar_mulai    date                null,
    tgl_daftar_selesai  date                null,
    tgl_pembekalan_mulai    date            null,
    tgl_pembekalan_selesai  date            null,
    tgl_pelaksanaan_mulai   date            null,
    tgl_pelaksanaan_selesai date            null,
    durasi_hari         int                 not null default 40,
    kuota_total         int                 null,
    deskripsi           nvarchar(max)       null,
    a_aktif             numeric(1)          not null default 1
        constraint ckc_a_aktif_periode check (a_aktif in (0,1)),
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_periode check (soft_delete in (0,1)),
    constraint pk_kkn_periode_kkn primary key (id_periode_kkn),
    constraint uq_kkn_periode_kode unique (kode_periode)
)
go
create index idx_kkn_periode_aktif on kkn.periode_kkn (a_aktif) where soft_delete = 0
go
create index idx_kkn_periode_smt on kkn.periode_kkn (id_smt) where soft_delete = 0
go
print '>> kkn.periode_kkn created.'
go

-- 3. kkn.lokasi_kkn
create table kkn.lokasi_kkn (
    id_lokasi           uniqueidentifier    not null default newid(),
    kode_lokasi         nvarchar(20)        not null,
    nm_provinsi         nvarchar(100)       null,
    nm_kabupaten        nvarchar(100)       null,
    nm_kecamatan        nvarchar(200)       null,
    nm_desa             nvarchar(200)       null,
    nm_dusun            nvarchar(60)        null,
    kode_pos            nvarchar(5)         null,
    latitude            decimal(10,7)       null,
    longitude           decimal(10,7)       null,
    alamat_lengkap      nvarchar(max)       null,
    nm_kepala_desa      nvarchar(200)       null,
    no_telp_desa        nvarchar(20)        null,
    a_aktif             numeric(1)          not null default 1
        constraint ckc_a_aktif_lokasi check (a_aktif in (0,1)),
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_lokasi check (soft_delete in (0,1)),
    constraint pk_kkn_lokasi_kkn primary key (id_lokasi),
    constraint uq_kkn_lokasi_kode unique (kode_lokasi)
)
go
create index idx_kkn_lokasi_aktif on kkn.lokasi_kkn (a_aktif) where soft_delete = 0
go
create index idx_kkn_lokasi_kabupaten on kkn.lokasi_kkn (nm_kabupaten) where soft_delete = 0
go
print '>> kkn.lokasi_kkn created.'
go

-- 4. kkn.wilayah_kkn
create table kkn.wilayah_kkn (
    id_wilayah          uniqueidentifier    not null default newid(),
    kode_wilayah        nvarchar(20)        not null,
    nm_wilayah          nvarchar(200)       not null,
    deskripsi           nvarchar(max)       null,
    a_aktif             numeric(1)          not null default 1
        constraint ckc_a_aktif_wilayah check (a_aktif in (0,1)),
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_wilayah check (soft_delete in (0,1)),
    constraint pk_kkn_wilayah_kkn primary key (id_wilayah),
    constraint uq_kkn_wilayah_kode unique (kode_wilayah)
)
go
create index idx_kkn_wilayah_aktif on kkn.wilayah_kkn (a_aktif) where soft_delete = 0
go
print '>> kkn.wilayah_kkn created.'
go

-- 5. kkn.jenis_dokumen
create table kkn.jenis_dokumen (
    id_jenis_dokumen    uniqueidentifier    not null default newid(),
    kode_dokumen        nvarchar(30)        not null,
    nm_dokumen          nvarchar(200)       not null,
    deskripsi           nvarchar(max)       null,
    tipe_file           nvarchar(100)       not null default 'application/pdf',
    max_size_mb         int                 not null default 10,
    a_wajib             numeric(1)          not null default 0
        constraint ckc_a_wajib_jns_dok check (a_wajib in (0,1)),
    urutan              int                 not null default 0,
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_jns_dok check (soft_delete in (0,1)),
    constraint pk_kkn_jenis_dokumen primary key (id_jenis_dokumen),
    constraint uq_kkn_jenis_dokumen_kode unique (kode_dokumen)
)
go
print '>> kkn.jenis_dokumen created.'
go

-- 6. kkn.komponen_penilaian
create table kkn.komponen_penilaian (
    id_komponen         uniqueidentifier    not null default newid(),
    kode_komponen       nvarchar(30)        not null,
    nm_komponen         nvarchar(200)       not null,
    deskripsi           nvarchar(max)       null,
    bobot               decimal(5,2)        not null,
    penilai             nvarchar(30)        not null,
    urutan              int                 not null default 0,
    a_aktif             numeric(1)          not null default 1
        constraint ckc_a_aktif_komponen check (a_aktif in (0,1)),
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_komponen check (soft_delete in (0,1)),
    constraint pk_kkn_komponen_penilaian primary key (id_komponen),
    constraint uq_kkn_komponen_kode unique (kode_komponen),
    constraint ckc_komponen_bobot check (bobot >= 0 and bobot <= 100),
    constraint ckc_komponen_penilai check (penilai in ('dpl', 'pamong', 'admin'))
)
go
create index idx_kkn_komponen_aktif on kkn.komponen_penilaian (a_aktif, urutan) where soft_delete = 0
go
print '>> kkn.komponen_penilaian created.'
go

-- 7. kkn.kriteria_pendaftaran
create table kkn.kriteria_pendaftaran (
    id_kriteria         uniqueidentifier    not null default newid(),
    kode_kriteria       nvarchar(30)        not null,
    nm_kriteria         nvarchar(200)       not null,
    deskripsi           nvarchar(max)       null,
    nilai_min           decimal(10,2)       null,
    a_aktif             numeric(1)          not null default 1
        constraint ckc_a_aktif_kriteria check (a_aktif in (0,1)),
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_kriteria check (soft_delete in (0,1)),
    constraint pk_kkn_kriteria_pendaftaran primary key (id_kriteria),
    constraint uq_kkn_kriteria_kode unique (kode_kriteria)
)
go
create index idx_kkn_kriteria_aktif on kkn.kriteria_pendaftaran (a_aktif) where soft_delete = 0
go
print '>> kkn.kriteria_pendaftaran created.'
go

-- ============================================================================
-- PENDAFTARAN (3 tabel)
-- ============================================================================

-- 8. kkn.registrasi_kkn
create table kkn.registrasi_kkn (
    id_registrasi       uniqueidentifier    not null default newid(),
    id_periode_kkn      uniqueidentifier    not null,
    id_pemohon          uniqueidentifier    not null,
    nomor_registrasi    nvarchar(50)        not null,
    status              nvarchar(30)        not null default 'draft',
    pilihan_wilayah_1   uniqueidentifier    null,
    pilihan_wilayah_2   uniqueidentifier    null,
    alasan              nvarchar(max)       null,
    catatan_admin       nvarchar(max)       null,
    tgl_diajukan        datetime            null,
    tgl_diproses        datetime            null,
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_registrasi check (soft_delete in (0,1)),
    constraint pk_kkn_registrasi_kkn primary key (id_registrasi),
    constraint uq_kkn_registrasi_nomor unique (nomor_registrasi),
    constraint fk_kkn_registrasi_periode foreign key (id_periode_kkn)
        references kkn.periode_kkn (id_periode_kkn),
    constraint fk_kkn_registrasi_wil1 foreign key (pilihan_wilayah_1)
        references kkn.wilayah_kkn (id_wilayah),
    constraint fk_kkn_registrasi_wil2 foreign key (pilihan_wilayah_2)
        references kkn.wilayah_kkn (id_wilayah),
    constraint ckc_registrasi_status check (
        status in ('draft', 'diajukan', 'diterima', 'ditolak', 'mengundurkan_diri')
    )
)
go
create index idx_kkn_registrasi_periode on kkn.registrasi_kkn (id_periode_kkn) where soft_delete = 0
go
create index idx_kkn_registrasi_pemohon on kkn.registrasi_kkn (id_pemohon) where soft_delete = 0
go
create index idx_kkn_registrasi_status on kkn.registrasi_kkn (status) where soft_delete = 0
go
print '>> kkn.registrasi_kkn created.'
go

-- 9. kkn.data_pemohon
create table kkn.data_pemohon (
    id_data_pemohon     uniqueidentifier    not null default newid(),
    id_registrasi       uniqueidentifier    not null,
    id_mahasiswa        uniqueidentifier    not null,
    nim                 nvarchar(20)        null,
    nm_mahasiswa        nvarchar(200)       null,
    tempat_lahir        nvarchar(200)       null,
    tgl_lahir           date                null,
    jenis_kelamin       nvarchar(1)         null,
    id_fakultas         uniqueidentifier    null,
    nm_fakultas         nvarchar(200)       null,
    id_prodi            uniqueidentifier    null,
    nm_prodi            nvarchar(200)       null,
    nm_jenjang          nvarchar(50)        null,
    angkatan            int                 null,
    semester_aktif      int                 null,
    id_smt              nvarchar(10)        null,
    ipk                 decimal(4,2)        null,
    sks_lulus           int                 null,
    status_mahasiswa    nvarchar(50)        null,
    status_pembayaran   nvarchar(50)        null,
    no_hp               nvarchar(20)        null,
    email               nvarchar(200)       null,
    tgl_snapshot        datetime            not null default getdate(),
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_pemohon check (soft_delete in (0,1)),
    constraint pk_kkn_data_pemohon primary key (id_data_pemohon),
    constraint uq_kkn_pemohon_registrasi unique (id_registrasi),
    constraint fk_kkn_pemohon_registrasi foreign key (id_registrasi)
        references kkn.registrasi_kkn (id_registrasi)
)
go
create index idx_kkn_pemohon_mahasiswa on kkn.data_pemohon (id_mahasiswa) where soft_delete = 0
go
create index idx_kkn_pemohon_nim on kkn.data_pemohon (nim) where soft_delete = 0
go
create index idx_kkn_pemohon_prodi on kkn.data_pemohon (id_prodi) where soft_delete = 0
go
create index idx_kkn_pemohon_fakultas on kkn.data_pemohon (id_fakultas) where soft_delete = 0
go
print '>> kkn.data_pemohon created.'
go

-- 10. kkn.verifikasi_syarat
create table kkn.verifikasi_syarat (
    id_verifikasi       uniqueidentifier    not null default newid(),
    id_registrasi       uniqueidentifier    not null,
    id_kriteria         uniqueidentifier    not null,
    a_terpenuhi         numeric(1)          not null
        constraint ckc_a_terpenuhi_verif check (a_terpenuhi in (0,1)),
    nilai_aktual        decimal(10,2)       null,
    nilai_min           decimal(10,2)       null,
    catatan             nvarchar(max)       null,
    tgl_verifikasi      datetime            not null default getdate(),
    create_date         datetime            not null default getdate(),
    constraint pk_kkn_verifikasi_syarat primary key (id_verifikasi),
    constraint fk_kkn_verif_registrasi foreign key (id_registrasi)
        references kkn.registrasi_kkn (id_registrasi),
    constraint fk_kkn_verif_kriteria foreign key (id_kriteria)
        references kkn.kriteria_pendaftaran (id_kriteria)
)
go
create index idx_kkn_verif_registrasi on kkn.verifikasi_syarat (id_registrasi)
go
create index idx_kkn_verif_kriteria on kkn.verifikasi_syarat (id_kriteria)
go
create index idx_kkn_verif_terpenuhi on kkn.verifikasi_syarat (a_terpenuhi)
go
print '>> kkn.verifikasi_syarat created.'
go

-- ============================================================================
-- KELOMPOK (4 tabel)
-- ============================================================================

-- 11. kkn.kelompok_kkn
create table kkn.kelompok_kkn (
    id_kelompok         uniqueidentifier    not null default newid(),
    id_periode_kkn      uniqueidentifier    not null,
    id_lokasi           uniqueidentifier    null,
    id_wilayah          uniqueidentifier    null,
    kode_kelompok       nvarchar(20)        not null,
    nm_kelompok         nvarchar(200)       null,
    kuota               int                 not null default 10,
    jumlah_anggota      int                 not null default 0,
    status              nvarchar(30)        not null default 'dibentuk',
    catatan             nvarchar(max)       null,
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_klp check (soft_delete in (0,1)),
    constraint pk_kkn_kelompok_kkn primary key (id_kelompok),
    constraint uq_kkn_kelompok_kode unique (kode_kelompok),
    constraint fk_kkn_kelompok_periode foreign key (id_periode_kkn)
        references kkn.periode_kkn (id_periode_kkn),
    constraint fk_kkn_kelompok_lokasi foreign key (id_lokasi)
        references kkn.lokasi_kkn (id_lokasi),
    constraint fk_kkn_kelompok_wilayah foreign key (id_wilayah)
        references kkn.wilayah_kkn (id_wilayah),
    constraint ckc_kelompok_status check (
        status in ('dibentuk', 'aktif', 'selesai', 'dibatalkan')
    )
)
go
create index idx_kkn_kelompok_periode on kkn.kelompok_kkn (id_periode_kkn) where soft_delete = 0
go
create index idx_kkn_kelompok_lokasi on kkn.kelompok_kkn (id_lokasi) where soft_delete = 0
go
create index idx_kkn_kelompok_status on kkn.kelompok_kkn (status) where soft_delete = 0
go
print '>> kkn.kelompok_kkn created.'
go

-- 12. kkn.anggota_kelompok
create table kkn.anggota_kelompok (
    id_anggota          uniqueidentifier    not null default newid(),
    id_kelompok         uniqueidentifier    not null,
    id_registrasi       uniqueidentifier    not null,
    id_mahasiswa        uniqueidentifier    not null,
    peran               nvarchar(20)        not null default 'anggota',
    tgl_bergabung       datetime            not null default getdate(),
    tgl_keluar          datetime            null,
    status              nvarchar(20)        not null default 'aktif',
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_anggota check (soft_delete in (0,1)),
    constraint pk_kkn_anggota_kelompok primary key (id_anggota),
    constraint uq_kkn_anggota_mhs unique (id_kelompok, id_mahasiswa),
    constraint fk_kkn_anggota_kelompok foreign key (id_kelompok)
        references kkn.kelompok_kkn (id_kelompok),
    constraint fk_kkn_anggota_registrasi foreign key (id_registrasi)
        references kkn.registrasi_kkn (id_registrasi),
    constraint ckc_anggota_peran check (
        peran in ('ketua', 'sekretaris', 'bendahara', 'anggota')
    ),
    constraint ckc_anggota_status check (
        status in ('aktif', 'keluar', 'pindah')
    )
)
go
create index idx_kkn_anggota_kelompok on kkn.anggota_kelompok (id_kelompok) where soft_delete = 0
go
create index idx_kkn_anggota_registrasi on kkn.anggota_kelompok (id_registrasi) where soft_delete = 0
go
create index idx_kkn_anggota_mahasiswa on kkn.anggota_kelompok (id_mahasiswa) where soft_delete = 0
go
create index idx_kkn_anggota_status on kkn.anggota_kelompok (status) where soft_delete = 0
go
print '>> kkn.anggota_kelompok created.'
go

-- 13. kkn.dpl_kelompok
create table kkn.dpl_kelompok (
    id_dpl              uniqueidentifier    not null default newid(),
    id_kelompok         uniqueidentifier    not null,
    id_dosen            uniqueidentifier    not null,
    nm_dosen            nvarchar(200)       null,
    nidn                nvarchar(20)        null,
    peran               nvarchar(20)        not null default 'pembimbing',
    no_hp               nvarchar(20)        null,
    a_aktif             numeric(1)          not null default 1
        constraint ckc_a_aktif_dpl check (a_aktif in (0,1)),
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_dpl check (soft_delete in (0,1)),
    constraint pk_kkn_dpl_kelompok primary key (id_dpl),
    constraint uq_kkn_dpl_kelompok_dosen unique (id_kelompok, id_dosen),
    constraint fk_kkn_dpl_kelompok foreign key (id_kelompok)
        references kkn.kelompok_kkn (id_kelompok),
    constraint ckc_dpl_peran check (
        peran in ('pembimbing', 'pendamping')
    )
)
go
create index idx_kkn_dpl_kelompok on kkn.dpl_kelompok (id_kelompok) where soft_delete = 0
go
create index idx_kkn_dpl_dosen on kkn.dpl_kelompok (id_dosen) where soft_delete = 0
go
print '>> kkn.dpl_kelompok created.'
go

-- 14. kkn.pamong_desa
create table kkn.pamong_desa (
    id_pamong           uniqueidentifier    not null default newid(),
    id_kelompok         uniqueidentifier    not null,
    nm_pamong           nvarchar(200)       not null,
    jabatan             nvarchar(100)       null,
    no_hp               nvarchar(20)        null,
    alamat              nvarchar(max)       null,
    a_aktif             numeric(1)          not null default 1
        constraint ckc_a_aktif_pamong check (a_aktif in (0,1)),
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_pamong check (soft_delete in (0,1)),
    constraint pk_kkn_pamong_desa primary key (id_pamong),
    constraint fk_kkn_pamong_kelompok foreign key (id_kelompok)
        references kkn.kelompok_kkn (id_kelompok)
)
go
create index idx_kkn_pamong_kelompok on kkn.pamong_desa (id_kelompok) where soft_delete = 0
go
print '>> kkn.pamong_desa created.'
go

-- ============================================================================
-- KEGIATAN (5 tabel)
-- ============================================================================

-- 15. kkn.program_kerja
create table kkn.program_kerja (
    id_proker           uniqueidentifier    not null default newid(),
    id_kelompok         uniqueidentifier    not null,
    judul               nvarchar(300)       not null,
    deskripsi           nvarchar(max)       null,
    bidang              nvarchar(50)        null,
    tgl_mulai           date                null,
    tgl_selesai         date                null,
    status              nvarchar(20)        not null default 'rencana',
    sasaran             nvarchar(max)       null,
    target              nvarchar(max)       null,
    realisasi           nvarchar(max)       null,
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_proker check (soft_delete in (0,1)),
    constraint pk_kkn_program_kerja primary key (id_proker),
    constraint fk_kkn_proker_kelompok foreign key (id_kelompok)
        references kkn.kelompok_kkn (id_kelompok),
    constraint ckc_proker_bidang check (
        bidang is null or bidang in ('pendidikan', 'kesehatan', 'ekonomi', 'infrastruktur', 'sosial_budaya', 'lingkungan')
    ),
    constraint ckc_proker_status check (
        status in ('rencana', 'berjalan', 'selesai', 'batal')
    )
)
go
create index idx_kkn_proker_kelompok on kkn.program_kerja (id_kelompok) where soft_delete = 0
go
create index idx_kkn_proker_status on kkn.program_kerja (status) where soft_delete = 0
go
print '>> kkn.program_kerja created.'
go

-- 16. kkn.logbook_harian
create table kkn.logbook_harian (
    id_logbook          uniqueidentifier    not null default newid(),
    id_anggota          uniqueidentifier    not null,
    tgl_kegiatan        date                not null,
    jam_mulai           nvarchar(8)         null,
    jam_selesai         nvarchar(8)         null,
    uraian_kegiatan     nvarchar(max)       not null,
    hasil               nvarchar(max)       null,
    kendala             nvarchar(max)       null,
    path_foto           nvarchar(1000)      null,
    status              nvarchar(20)        not null default 'draft',
    catatan_dpl         nvarchar(max)       null,
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_logbook check (soft_delete in (0,1)),
    constraint pk_kkn_logbook_harian primary key (id_logbook),
    constraint fk_kkn_logbook_anggota foreign key (id_anggota)
        references kkn.anggota_kelompok (id_anggota),
    constraint ckc_logbook_status check (
        status in ('draft', 'diajukan', 'disetujui_dpl')
    )
)
go
create index idx_kkn_logbook_anggota on kkn.logbook_harian (id_anggota) where soft_delete = 0
go
create index idx_kkn_logbook_tanggal on kkn.logbook_harian (tgl_kegiatan) where soft_delete = 0
go
create index idx_kkn_logbook_status on kkn.logbook_harian (status) where soft_delete = 0
go
print '>> kkn.logbook_harian created.'
go

-- 17. kkn.laporan_kelompok
create table kkn.laporan_kelompok (
    id_laporan          uniqueidentifier    not null default newid(),
    id_kelompok         uniqueidentifier    not null,
    jenis_laporan       nvarchar(30)        null,
    judul               nvarchar(300)       null,
    deskripsi           nvarchar(max)       null,
    path_file           nvarchar(1000)      not null,
    status              nvarchar(20)        not null default 'draft',
    catatan_reviewer    nvarchar(max)       null,
    id_reviewer         uniqueidentifier    null,
    tgl_submit          datetime            null,
    tgl_review          datetime            null,
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_laporan check (soft_delete in (0,1)),
    constraint pk_kkn_laporan_kelompok primary key (id_laporan),
    constraint fk_kkn_laporan_kelompok foreign key (id_kelompok)
        references kkn.kelompok_kkn (id_kelompok),
    constraint ckc_laporan_jenis check (
        jenis_laporan is null or jenis_laporan in ('proposal', 'laporan_mingguan', 'laporan_akhir')
    ),
    constraint ckc_laporan_status check (
        status in ('draft', 'diajukan', 'direvisi', 'disetujui')
    )
)
go
create index idx_kkn_laporan_kelompok on kkn.laporan_kelompok (id_kelompok) where soft_delete = 0
go
create index idx_kkn_laporan_status on kkn.laporan_kelompok (status) where soft_delete = 0
go
print '>> kkn.laporan_kelompok created.'
go

-- 18. kkn.absensi
create table kkn.absensi (
    id_absensi          uniqueidentifier    not null default newid(),
    id_anggota          uniqueidentifier    not null,
    tgl_absensi         date                not null,
    status_hadir        nvarchar(20)        not null default 'hadir',
    keterangan          nvarchar(max)       null,
    path_bukti          nvarchar(1000)      null,
    jam_datang          nvarchar(8)         null,
    jam_pulang          nvarchar(8)         null,
    create_date         datetime            not null default getdate(),
    constraint pk_kkn_absensi primary key (id_absensi),
    constraint uq_kkn_absensi_anggota_tgl unique (id_anggota, tgl_absensi),
    constraint fk_kkn_absensi_anggota foreign key (id_anggota)
        references kkn.anggota_kelompok (id_anggota),
    constraint ckc_absensi_status check (
        status_hadir in ('hadir', 'izin', 'sakit', 'alpha')
    )
)
go
create index idx_kkn_absensi_anggota on kkn.absensi (id_anggota)
go
create index idx_kkn_absensi_tanggal on kkn.absensi (tgl_absensi)
go
print '>> kkn.absensi created.'
go

-- 19. kkn.catatan_bimbingan
create table kkn.catatan_bimbingan (
    id_catatan          uniqueidentifier    not null default newid(),
    id_kelompok         uniqueidentifier    not null,
    id_dpl              uniqueidentifier    not null,
    tgl_bimbingan       date                not null,
    jenis               nvarchar(20)        null,
    materi              nvarchar(max)       not null,
    catatan             nvarchar(max)       null,
    rekomendasi         nvarchar(max)       null,
    path_dokumentasi    nvarchar(1000)      null,
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_bimbing check (soft_delete in (0,1)),
    constraint pk_kkn_catatan_bimbingan primary key (id_catatan),
    constraint fk_kkn_bimbingan_kelompok foreign key (id_kelompok)
        references kkn.kelompok_kkn (id_kelompok),
    constraint fk_kkn_bimbingan_dpl foreign key (id_dpl)
        references kkn.dpl_kelompok (id_dpl),
    constraint ckc_bimbingan_jenis check (
        jenis is null or jenis in ('kunjungan', 'online', 'telepon')
    )
)
go
create index idx_kkn_bimbingan_kelompok on kkn.catatan_bimbingan (id_kelompok) where soft_delete = 0
go
create index idx_kkn_bimbingan_dpl on kkn.catatan_bimbingan (id_dpl) where soft_delete = 0
go
create index idx_kkn_bimbingan_tanggal on kkn.catatan_bimbingan (tgl_bimbingan) where soft_delete = 0
go
print '>> kkn.catatan_bimbingan created.'
go

-- ============================================================================
-- PENILAIAN (3 tabel)
-- ============================================================================

-- 20. kkn.nilai_mahasiswa
create table kkn.nilai_mahasiswa (
    id_nilai            uniqueidentifier    not null default newid(),
    id_anggota          uniqueidentifier    not null,
    id_komponen         uniqueidentifier    not null,
    nilai               decimal(5,2)        not null,
    catatan             nvarchar(max)       null,
    id_penilai          uniqueidentifier    not null,
    tgl_penilaian       datetime            not null default getdate(),
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_nilai check (soft_delete in (0,1)),
    constraint pk_kkn_nilai_mahasiswa primary key (id_nilai),
    constraint uq_kkn_nilai_anggota_komp unique (id_anggota, id_komponen),
    constraint fk_kkn_nilai_anggota foreign key (id_anggota)
        references kkn.anggota_kelompok (id_anggota),
    constraint fk_kkn_nilai_komponen foreign key (id_komponen)
        references kkn.komponen_penilaian (id_komponen),
    constraint ckc_nilai_range check (nilai >= 0 and nilai <= 100)
)
go
create index idx_kkn_nilai_anggota on kkn.nilai_mahasiswa (id_anggota) where soft_delete = 0
go
create index idx_kkn_nilai_komponen on kkn.nilai_mahasiswa (id_komponen) where soft_delete = 0
go
create index idx_kkn_nilai_penilai on kkn.nilai_mahasiswa (id_penilai) where soft_delete = 0
go
print '>> kkn.nilai_mahasiswa created.'
go

-- 21. kkn.nilai_akhir
create table kkn.nilai_akhir (
    id_nilai_akhir      uniqueidentifier    not null default newid(),
    id_anggota          uniqueidentifier    not null,
    nilai_angka         decimal(5,2)        null,
    nilai_huruf         nvarchar(2)         null,
    bobot_mutu          decimal(3,2)        null,
    a_lulus             numeric(1)          not null default 0
        constraint ckc_a_lulus_na check (a_lulus in (0,1)),
    catatan             nvarchar(max)       null,
    id_penilai          uniqueidentifier    null,
    tgl_finalisasi      datetime            null,
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_na check (soft_delete in (0,1)),
    constraint pk_kkn_nilai_akhir primary key (id_nilai_akhir),
    constraint uq_kkn_nilai_akhir_anggota unique (id_anggota),
    constraint fk_kkn_nilai_akhir_anggota foreign key (id_anggota)
        references kkn.anggota_kelompok (id_anggota),
    constraint ckc_nilai_huruf check (
        nilai_huruf is null or nilai_huruf in ('A', 'AB', 'B', 'BC', 'C', 'D', 'E')
    )
)
go
create index idx_kkn_nilai_akhir_lulus on kkn.nilai_akhir (a_lulus) where soft_delete = 0
go
create index idx_kkn_nilai_akhir_huruf on kkn.nilai_akhir (nilai_huruf) where soft_delete = 0
go
print '>> kkn.nilai_akhir created.'
go

-- 22. kkn.penilaian_pamong
create table kkn.penilaian_pamong (
    id_penilaian_pamong uniqueidentifier    not null default newid(),
    id_anggota          uniqueidentifier    not null,
    id_pamong           uniqueidentifier    not null,
    nilai_kehadiran     int                 null,
    nilai_partisipasi   int                 null,
    nilai_sikap         int                 null,
    nilai_kontribusi    int                 null,
    catatan             nvarchar(max)       null,
    tgl_penilaian       datetime            not null default getdate(),
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_pp check (soft_delete in (0,1)),
    constraint pk_kkn_penilaian_pamong primary key (id_penilaian_pamong),
    constraint uq_kkn_penilaian_pamong unique (id_anggota, id_pamong),
    constraint fk_kkn_pp_anggota foreign key (id_anggota)
        references kkn.anggota_kelompok (id_anggota),
    constraint fk_kkn_pp_pamong foreign key (id_pamong)
        references kkn.pamong_desa (id_pamong),
    constraint ckc_pp_kehadiran check (nilai_kehadiran is null or (nilai_kehadiran >= 1 and nilai_kehadiran <= 5)),
    constraint ckc_pp_partisipasi check (nilai_partisipasi is null or (nilai_partisipasi >= 1 and nilai_partisipasi <= 5)),
    constraint ckc_pp_sikap check (nilai_sikap is null or (nilai_sikap >= 1 and nilai_sikap <= 5)),
    constraint ckc_pp_kontribusi check (nilai_kontribusi is null or (nilai_kontribusi >= 1 and nilai_kontribusi <= 5))
)
go
create index idx_kkn_pp_anggota on kkn.penilaian_pamong (id_anggota) where soft_delete = 0
go
create index idx_kkn_pp_pamong on kkn.penilaian_pamong (id_pamong) where soft_delete = 0
go
print '>> kkn.penilaian_pamong created.'
go

-- ============================================================================
-- DOKUMEN & SERTIFIKAT (2 tabel)
-- ============================================================================

-- 23. kkn.dokumen_kkn
create table kkn.dokumen_kkn (
    id_dokumen          uniqueidentifier    not null default newid(),
    id_jenis_dokumen    uniqueidentifier    not null,
    id_kelompok         uniqueidentifier    null,
    id_anggota          uniqueidentifier    null,
    nm_dokumen          nvarchar(200)       null,
    nama_file_asli      nvarchar(500)       null,
    path_file           nvarchar(1000)      not null,
    tipe_file           nvarchar(100)       null,
    ukuran_byte         bigint              null,
    id_pengunggah       uniqueidentifier    not null,
    keterangan          nvarchar(max)       null,
    tgl_upload          datetime            not null default getdate(),
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_dok check (soft_delete in (0,1)),
    constraint pk_kkn_dokumen_kkn primary key (id_dokumen),
    constraint fk_kkn_dokumen_jenis foreign key (id_jenis_dokumen)
        references kkn.jenis_dokumen (id_jenis_dokumen),
    constraint fk_kkn_dokumen_kelompok foreign key (id_kelompok)
        references kkn.kelompok_kkn (id_kelompok),
    constraint fk_kkn_dokumen_anggota foreign key (id_anggota)
        references kkn.anggota_kelompok (id_anggota)
)
go
create index idx_kkn_dokumen_jenis on kkn.dokumen_kkn (id_jenis_dokumen) where soft_delete = 0
go
create index idx_kkn_dokumen_kelompok on kkn.dokumen_kkn (id_kelompok) where soft_delete = 0
go
create index idx_kkn_dokumen_anggota on kkn.dokumen_kkn (id_anggota) where soft_delete = 0
go
create index idx_kkn_dokumen_pengunggah on kkn.dokumen_kkn (id_pengunggah) where soft_delete = 0
go
print '>> kkn.dokumen_kkn created.'
go

-- 24. kkn.sertifikat
create table kkn.sertifikat (
    id_sertifikat       uniqueidentifier    not null default newid(),
    id_anggota          uniqueidentifier    not null,
    id_periode_kkn      uniqueidentifier    not null,
    nomor_sertifikat    nvarchar(100)       not null,
    tgl_terbit          date                null,
    path_file           nvarchar(1000)      not null,
    a_final             numeric(1)          not null default 0
        constraint ckc_a_final_sert check (a_final in (0,1)),
    id_penerbit         uniqueidentifier    not null,
    id_creator          uniqueidentifier    null,
    id_updater          uniqueidentifier    null,
    create_date         datetime            not null default getdate(),
    last_update         datetime            not null default getdate(),
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_sert check (soft_delete in (0,1)),
    constraint pk_kkn_sertifikat primary key (id_sertifikat),
    constraint uq_kkn_sertifikat_anggota unique (id_anggota),
    constraint uq_kkn_sertifikat_nomor unique (nomor_sertifikat),
    constraint fk_kkn_sertifikat_anggota foreign key (id_anggota)
        references kkn.anggota_kelompok (id_anggota),
    constraint fk_kkn_sertifikat_periode foreign key (id_periode_kkn)
        references kkn.periode_kkn (id_periode_kkn)
)
go
create index idx_kkn_sertifikat_periode on kkn.sertifikat (id_periode_kkn) where soft_delete = 0
go
create index idx_kkn_sertifikat_final on kkn.sertifikat (a_final) where soft_delete = 0
go
print '>> kkn.sertifikat created.'
go

-- ============================================================================
-- LOG / AUDIT (2 tabel)
-- ============================================================================

-- 25. kkn.jejak_audit
create table kkn.jejak_audit (
    id_jejak            uniqueidentifier    not null default newid(),
    id_pengguna         uniqueidentifier    null,
    nm_pengguna         nvarchar(200)       null,
    aksi                nvarchar(50)        not null,
    modul               nvarchar(100)       null,
    deskripsi           nvarchar(max)       null,
    ip_address          nvarchar(50)        null,
    user_agent          nvarchar(max)       null,
    data_sebelum        nvarchar(max)       null,
    data_sesudah        nvarchar(max)       null,
    create_date         datetime            not null default getdate(),
    constraint pk_kkn_jejak_audit primary key (id_jejak)
)
go
create index idx_kkn_jejak_pengguna on kkn.jejak_audit (id_pengguna)
go
create index idx_kkn_jejak_aksi on kkn.jejak_audit (aksi)
go
create index idx_kkn_jejak_modul on kkn.jejak_audit (modul)
go
create index idx_kkn_jejak_created on kkn.jejak_audit (create_date)
go
print '>> kkn.jejak_audit created.'
go

-- 26. kkn.aktivitas_data
create table kkn.aktivitas_data (
    id_aktivitas        uniqueidentifier    not null default newid(),
    nama_tabel          nvarchar(200)       not null,
    id_data             uniqueidentifier    null,
    aksi                nvarchar(10)        not null,
    data_lama           nvarchar(max)       null,
    data_baru           nvarchar(max)       null,
    id_pengguna         uniqueidentifier    null,
    ip_address          nvarchar(50)        null,
    create_date         datetime            not null default getdate(),
    constraint pk_kkn_aktivitas_data primary key (id_aktivitas)
)
go
create index idx_kkn_aktivitas_tabel on kkn.aktivitas_data (nama_tabel)
go
create index idx_kkn_aktivitas_aksi on kkn.aktivitas_data (aksi)
go
create index idx_kkn_aktivitas_pengguna on kkn.aktivitas_data (id_pengguna)
go
create index idx_kkn_aktivitas_created on kkn.aktivitas_data (create_date)
go
create index idx_kkn_aktivitas_id_data on kkn.aktivitas_data (id_data)
go
print '>> kkn.aktivitas_data created.'
go

print '============================================'
print '>> KKN schema v1.0 — 25 tables created.'
print '============================================'
go
