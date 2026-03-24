-- ============================================================
-- SIAKADU Schema — Sistem Informasi Akademik Universitas Lampung
-- Database: SQL Server 2019
-- Version: 1.0
-- Generated: 2026-03-21
-- Source: CDM PDUT-Master-Update-2026 + Live DB production columns
-- Author: MyUnila Development Team
--
-- Total: 36 tabel
-- Sections:
--   1. Referensi (semester, jenjang, gelar, evaluasi, dll)
--   2. Entitas Utama (sdm, peserta_didik, sms/prodi, reg_ptk, reg_pd)
--   3. Akademik (matkul, kelas_kuliah, kurikulum, substansi)
--   4. Perkuliahan (kuliah_mhs, akt_ajar_dosen, jadwal_kelas)
--   5. Nilai (nilai_smt_mhs, nilai_transkrip, re_mk)
--   6. Aktivitas (akt_mhs, bimbing, uji)
--   7. Presensi & Kinerja (kehadiran_mhs, kehadiran_sdm, kinerja_dosen)
--   8. Keuangan (spp_mhs, kelas_ukt, daftar_ukt)
--   9. Lain-lain (nilai_tes)
--
-- Naming Convention:
--   - Schema: siakadu
--   - PK: pk_<table_name>
--   - FK: fk_<table>_<ref_table>
--   - IDX: idx_<table>_<column(s)>
--   - Boolean: numeric(1,0) with CHECK (col IN (0,1))
--   - UUID: uniqueidentifier
--   - Audit: create_date, id_creator, last_update, id_updater, soft_delete, last_sync
-- ============================================================

/*==============================================================*/
/* Schema: siakadu                                              */
/*==============================================================*/
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'siakadu')
BEGIN
    EXEC('CREATE SCHEMA siakadu')
END
GO

-- ============================================================
-- SECTION 1: TABEL REFERENSI
-- ============================================================

/*==============================================================*/
/* Table: semester                                          */
/* Description: Referensi semester/periode akademik          */
/*==============================================================*/
create table siakadu.semester (
   id_smt                              char(5)                   not null,
   id_thn_ajaran                       numeric(4,0)              not null,
   a_ref_pddikti                       numeric(1,0)              not null default ((0)),
   a_ref_unila                         numeric(1,0)              not null default ((0)),
   nm_smt                              varchar(50)               not null,
   smt                                 numeric(2,0)              not null,
   a_periode_aktif                     numeric(1,0)              null default ((0)),
   tgl_mulai                           datetime                  not null,
   tgl_selesai                         datetime                  not null,
   create_date                         datetime                  not null,
   last_update                         datetime                  not null,
   expired_date                        datetime                  null,
   last_sync                           datetime                  not null,
   constraint pk_semester primary key (id_smt)
)
go

/*==============================================================*/
/* Table: jenjang_pendidikan                                */
/* Description: Referensi jenjang pendidikan (D3, S1, S2, S3)*/
/*==============================================================*/
create table siakadu.jenjang_pendidikan (
   id_jenj_didik                       numeric(2,0)              not null,
   a_ref_pddikti                       numeric(1,0)              not null default ((0)),
   a_ref_unila                         numeric(1,0)              not null default ((0)),
   nm_jenj_didik                       varchar(50)               not null,
   u_jenj_lemb                         numeric(1,0)              not null default ((0)),
   u_jenj_org                          numeric(1,0)              not null default ((0)),
   create_date                         datetime                  not null,
   last_update                         datetime                  not null,
   expired_date                        datetime                  null,
   last_sync                           datetime                  not null,
   constraint pk_jenjang_pendidikan primary key (id_jenj_didik)
)
go

/*==============================================================*/
/* Table: gelar_akademik                                    */
/* Description: Referensi gelar akademik                     */
/*==============================================================*/
create table siakadu.gelar_akademik (
   id_gelar_akad                       int                       not null,
   a_ref_pddikti                       numeric(1,0)              not null default ((0)),
   a_ref_unila                         numeric(1,0)              not null default ((0)),
   singkat_gelar                       varchar(30)               not null,
   nm_gelar_akad                       varchar(80)               not null,
   posisi_gelar                        numeric(1,0)              not null,
   create_date                         datetime                  not null,
   last_update                         datetime                  not null,
   expired_date                        datetime                  null,
   last_sync                           datetime                  not null,
   constraint pk_gelar_akademik primary key (id_gelar_akad)
)
go

/*==============================================================*/
/* Table: jenis_evaluasi                                    */
/* Description: Referensi jenis evaluasi/penilaian           */
/*==============================================================*/
create table siakadu.jenis_evaluasi (
   id_jns_eval                         smallint                  not null,
   a_ref_pddikti                       numeric(1,0)              not null default ((0)),
   a_ref_unila                         numeric(1,0)              not null default ((0)),
   nm_jns_eval                         varchar(50)               not null,
   ket_jns_eval                        varchar(100)              null,
   create_date                         datetime                  not null,
   last_update                         datetime                  not null,
   expired_date                        datetime                  null,
   last_sync                           datetime                  not null,
   constraint pk_jenis_evaluasi primary key (id_jns_eval)
)
go

/*==============================================================*/
/* Table: basis_evaluasi                                    */
/* Description: Referensi basis evaluasi                     */
/*==============================================================*/
create table siakadu.basis_evaluasi (
   id_basis_evaluasi                   numeric(2,0)              not null,
   a_ref_pddikti                       numeric(1,0)              not null default ((0)),
   a_ref_unila                         numeric(1,0)              not null default ((0)),
   nm_basis_evaluasi                   varchar(50)               not null,
   create_date                         datetime                  not null,
   last_update                         datetime                  not null,
   expired_date                        datetime                  null,
   last_sync                           datetime                  not null,
   constraint pk_basis_evaluasi primary key (id_basis_evaluasi)
)
go

/*==============================================================*/
/* Table: jenis_akt_mhs                                     */
/* Description: Referensi jenis aktivitas mahasiswa          */
/*==============================================================*/
create table siakadu.jenis_akt_mhs (
   id_jns_akt_mhs                      numeric(2,0)              not null,
   a_ref_pddikti                       numeric(1,0)              not null default ((0)),
   a_ref_unila                         numeric(1,0)              not null default ((0)),
   nm_jns_akt_mhs                      varchar(50)               not null,
   ket_jns_akt_mhs                     varchar(100)              null,
   a_kegiatan_kampus_merdeka           numeric(1,0)              not null default ((0)),
   create_date                         datetime                  not null,
   last_update                         datetime                  not null,
   expired_date                        datetime                  null,
   last_sync                           datetime                  not null,
   constraint pk_jenis_akt_mhs primary key (id_jns_akt_mhs)
)
go

/*==============================================================*/
/* Table: status_mahasiswa                                  */
/* Description: Referensi status mahasiswa (aktif, cuti, DO, lulus)*/
/*==============================================================*/
create table siakadu.status_mahasiswa (
   id_stat_mhs                         char(1)                   not null,
   a_ref_pddikti                       numeric(1,0)              not null default ((0)),
   a_ref_unila                         numeric(1,0)              not null default ((0)),
   nm_stat_mhs                         varchar(30)               not null,
   ket_stat_mhs                        varchar(100)              null,
   create_date                         datetime                  not null,
   last_update                         datetime                  not null,
   expired_date                        datetime                  null,
   last_sync                           datetime                  not null,
   constraint pk_status_mahasiswa primary key (id_stat_mhs)
)
go

/*==============================================================*/
/* Table: jenis_sms                                         */
/* Description: Referensi jenis satuan manajemen sumber daya */
/*==============================================================*/
create table siakadu.jenis_sms (
   id_jns_sms                          numeric(2,0)              not null,
   a_ref_pddikti                       numeric(1,0)              not null default ((0)),
   a_ref_unila                         numeric(1,0)              not null default ((0)),
   nm_jns_sms                          varchar(50)               not null,
   create_date                         datetime                  not null,
   last_update                         datetime                  not null,
   expired_date                        datetime                  null,
   last_sync                           datetime                  not null,
   constraint pk_jenis_sms primary key (id_jns_sms)
)
go

/*==============================================================*/
/* Table: bentuk_pendidikan                                 */
/* Description: Referensi bentuk pendidikan                  */
/*==============================================================*/
create table siakadu.bentuk_pendidikan (
   id_bp                               smallint                  not null,
   a_ref_pddikti                       numeric(1,0)              not null default ((0)),
   a_ref_unila                         numeric(1,0)              not null default ((0)),
   nm_bp                               varchar(50)               not null,
   a_jenj_paud                         numeric(1,0)              not null default ((0)),
   a_jenj_tk                           numeric(1,0)              not null default ((0)),
   a_jenj_sd                           numeric(1,0)              not null default ((0)),
   a_jenj_smp                          numeric(1,0)              not null default ((0)),
   a_jenj_sma                          numeric(1,0)              not null default ((0)),
   a_jenj_tinggi                       numeric(1,0)              not null default ((0)),
   dir_bina                            varchar(40)               null,
   a_aktif                             numeric(1,0)              not null default ((1)),
   create_date                         datetime                  not null,
   last_update                         datetime                  not null,
   expired_date                        datetime                  null,
   last_sync                           datetime                  not null,
   constraint pk_bentuk_pendidikan primary key (id_bp)
)
go

-- ============================================================
-- SECTION 2: ENTITAS UTAMA (SDM, MAHASISWA, PRODI)
-- ============================================================

/*==============================================================*/
/* Table: sdm                                               */
/* Description: Data sumber daya manusia (dosen & tenaga kependidikan)*/
/*==============================================================*/
create table siakadu.sdm (
   id_sdm                              uniqueidentifier          not null,
   nm_sdm                              varchar(100)              not null,
   jk                                  char(1)                   not null,
   tmpt_lahir                          varchar(32)               not null,
   tgl_lahir                           date                      not null,
   nik                                 char(20)                  not null,
   niy_nigk                            varchar(30)               null,
   nuptk                               char(16)                  null,
   nidn                                char(10)                  null,
   nsdmi                               char(12)                  null,
   stat_kawin                          numeric(1,0)              not null,
   jln                                 varchar(255)              null,
   rt                                  numeric(3,0)              null,
   rw                                  numeric(3,0)              null,
   nm_dsn                              varchar(60)               null,
   ds_kel                              varchar(60)               null,
   kode_pos                            char(5)                   null,
   no_tel_rmh                          varchar(20)               null,
   no_hp                               varchar(20)               null,
   email                               varchar(60)               null,
   nip                                 varchar(18)               null,
   tmt_pns                             date                      null,
   nm_suami_istri                      varchar(100)              null,
   nip_suami_istri                     char(18)                  null,
   sk_cpns                             varchar(80)               null,
   tgl_sk_cpns                         date                      null,
   sk_angkat                           varchar(80)               null,
   tmt_sk_angkat                       date                      null,
   npwp                                char(15)                  null,
   nm_wp                               varchar(100)              null,
   stat_data                           int                       null,
   akta_ijin_ajar                      char(1)                   null,
   nira                                char(30)                  null,
   jns_reg                             varchar(10)               null,
   kewarganegaraan                     char(2)                   not null,
   id_jns_sdm                          numeric(2,0)              not null,
   id_wil                              char(8)                   not null,
   id_stat_aktif                       numeric(2,0)              not null,
   id_agama                            smallint                  not null,
   id_keahlian_lab                     smallint                  null,
   id_pekerjaan_suami_istri            int                       not null,
   id_lemb_angkat                      numeric(2,0)              not null,
   id_sumber_gaji                      numeric(2,0)              null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_sdm primary key (id_sdm)
)
go

/*==============================================================*/
/* Table: peserta_didik                                     */
/* Description: Data peserta didik/mahasiswa (biodata)       */
/*==============================================================*/
create table siakadu.peserta_didik (
   id_pd                               uniqueidentifier          not null,
   nm_pd                               varchar(120)              not null,
   jk                                  char(1)                   null,
   nisn                                char(10)                  null,
   nik                                 char(20)                  null,
   tmpt_lahir                          varchar(32)               not null,
   tgl_lahir                           date                      null,
   jln                                 varchar(255)              null,
   rt                                  numeric(3,0)              null,
   rw                                  numeric(3,0)              null,
   nm_dsn                              varchar(60)               null,
   ds_kel                              varchar(60)               null,
   kode_pos                            char(5)                   null,
   tlpn_rumah                          varchar(20)               null,
   tlpn_hp                             varchar(20)               null,
   email                               varchar(60)               null,
   a_pmpap                             numeric(1,0)              not null default ((0)),
   a_bidikmisi                         numeric(1,0)              not null default ((0)),
   a_bebas_biaya                       numeric(1,0)              not null default ((0)),
   nm_wali                             varchar(100)              null,
   tgl_lahir_wali                      date                      null,
   id_pendidikan_wali                  numeric(2,0)              null,
   id_pekerjaan_wali                   int                       null,
   id_penghasilan_wali                 int                       null,
   nm_ayah                             varchar(100)              null,
   tgl_lahir_ayah                      date                      null,
   nik_ayah                            char(20)                  null,
   id_pendidikan_ayah                  numeric(2,0)              null,
   id_pekerjaan_ayah                   int                       null,
   id_penghasilan_ayah                 int                       null,
   id_kk_ayah                          int                       null,
   nm_ibu_kandung                      varchar(100)              null,
   tgl_lahir_ibu                       date                      null,
   nik_ibu                             char(20)                  null,
   id_pendidikan_ibu                   numeric(2,0)              null,
   id_pekerjaan_ibu                    int                       null,
   id_penghasilan_ibu                  int                       null,
   id_kk_ibu                           int                       null,
   a_terima_kps                        numeric(1,0)              not null default ((0)),
   no_kps                              varchar(40)               null,
   id_kk                               int                       null,
   id_kewarganegaraan                  char(2)                   not null,
   id_agama                            smallint                  not null,
   id_blob                             uniqueidentifier          null,
   id_jns_tinggal                      numeric(2,0)              null,
   id_stat_mhs                         char(1)                   not null,
   id_alat_transport                   numeric(2,0)              null,
   id_wil                              char(8)                   null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_peserta_didik primary key (id_pd)
)
go

/*==============================================================*/
/* Table: sms                                               */
/* Description: Satuan manajemen sumber daya (program studi) */
/*==============================================================*/
create table siakadu.sms (
   id_sms                              uniqueidentifier          not null,
   id_fak_unila                        uniqueidentifier          null,
   id_lemb_non_sp                      uniqueidentifier          null,
   id_jur_unila                        uniqueidentifier          null,
   id_jur                              varchar(25)               null,
   id_jenj_didik                       numeric(2,0)              not null,
   nm_lemb                             varchar(100)              not null,
   kd_kl                               char(3)                   null,
   kd_satker                           varchar(20)               null,
   smt_mulai                           char(5)                   null,
   a_selenggara_subst                  numeric(1,0)              not null default ((0)),
   stat_prodi_unila                    char(1)                   null,
   tgl_tutup                           datetime                  null,
   kode_snpmb                          varchar(10)               null,
   kode_prodi                          varchar(10)               null,
   nm_prodi_english                    varchar(100)              null,
   kpst_pd                             numeric(5,0)              null,
   sks_lulus                           numeric(3,0)              null,
   gelar_lulusan                       varchar(10)               null,
   stat_prodi                          char(1)                   null default ('A'),
   polesei_nilai                       char(1)                   null default ('B'),
   a_kependidikan                      numeric(1,0)              null default ((0)),
   jln                                 varchar(255)              null,
   rt                                  numeric(3,0)              null,
   rw                                  numeric(3,0)              null,
   nm_dsn                              varchar(60)               null,
   ds_kel                              varchar(60)               null,
   kode_pos                            char(5)                   null,
   lintang                             numeric(11,7)             null,
   bujur                               numeric(11,7)             null,
   no_tel                              varchar(20)               null,
   no_fax                              varchar(20)               null,
   email                               varchar(60)               null,
   website                             varchar(256)              null,
   singkatan                           varchar(50)               null,
   tgl_berdiri                         date                      null,
   sk_selenggara                       varchar(80)               null,
   tgl_sk_selenggara                   date                      null,
   tmt_sk_selenggara                   date                      null,
   tst_sk_selenggara                   date                      null,
   sistem_ajar                         numeric(1,0)              null,
   a_pjj                               numeric(1,0)              null default ((0)),
   a_psdku                             numeric(1,0)              null default ((0)),
   luas_lab                            numeric(5,0)              null,
   kapasitas_prak_satu_shift           numeric(4,0)              null,
   jml_mhs_pengguna                    numeric(6,0)              null,
   jml_jam_penggunaan                  numeric(5,0)              null,
   jml_prodi_pengguna                  numeric(3,0)              null,
   jml_modul_prak_sendiri              numeric(4,0)              null,
   jml_modul_prak_lain                 numeric(4,0)              null,
   fungsi_selain_prak                  char(1)                   null,
   penggunaan_lab                      char(1)                   null,
   a_pkl                               numeric(1,0)              null default ((0)),
   id_sp                               uniqueidentifier          not null,
   id_jns_sms                          numeric(2,0)              not null,
   id_fungsi_lab                       char(1)                   not null,
   id_kel_usaha                        char(8)                   not null,
   id_blob                             uniqueidentifier          null,
   id_wil                              char(8)                   not null,
   id_induk_sms                        uniqueidentifier          null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_sms primary key (id_sms)
)
go

/*==============================================================*/
/* Table: reg_ptk                                           */
/* Description: Registrasi pendidik dan tenaga kependidikan  */
/*==============================================================*/
create table siakadu.reg_ptk (
   id_reg_ptk                          uniqueidentifier          not null,
   id_jns_keluar                       char(1)                   null,
   id_sdm                              uniqueidentifier          null,
   id_sp                               uniqueidentifier          null,
   id_stat_pegawai                     smallint                  not null,
   id_ikatan_kerja                     char(1)                   not null,
   id_sms                              uniqueidentifier          null,
   no_srt_tgs                          varchar(80)               null,
   tgl_srt_tgs                         date                      not null,
   tmt_srt_tgs                         date                      not null,
   tgl_ptk_keluar                      date                      null,
   nidn                                char(10)                  null,
   jns_reg                             varchar(10)               null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_reg_ptk primary key (id_reg_ptk)
)
go

/*==============================================================*/
/* Table: reg_pd                                            */
/* Description: Registrasi peserta didik (mahasiswa terdaftar)*/
/*==============================================================*/
create table siakadu.reg_pd (
   id_reg_pd                           uniqueidentifier          not null,
   id_sp                               uniqueidentifier          not null,
   id_sms                              uniqueidentifier          null,
   id_pd                               uniqueidentifier          not null,
   id_jns_daftar                       numeric(2,0)              not null,
   id_jalur_daftar                     numeric(18,0)             null,
   id_pembiayaan                       numeric(2,0)              null,
   id_smt                              char(5)                   null,
   tgl_masuk_sp                        date                      not null,
   nipd                                varchar(24)               not null,
   id_semester_masuk                   char(5)                   not null,
   id_pt_asal                          uniqueidentifier          null,
   nm_pt_asal                          varchar(100)              null,
   id_prodi_asal                       uniqueidentifier          null,
   nm_prodi_asal                       varchar(100)              null,
   id_jns_keluar                       char(1)                   null,
   tgl_keluar                          date                      null,
   ket                                 varchar(250)              null,
   skhun                               char(20)                  null,
   no_peserta_ujian                    char(20)                  null,
   no_seri_ijazah                      varchar(80)               null,
   asal_data_ijazah                    char(1)                   not null default ('0'),
   bidang_mayor                        varchar(100)              null,
   bidang_minor                        varchar(100)              null,
   sks_diakui                          numeric(3,0)              null,
   jalur_skripsi                       numeric(1,0)              null,
   judul_skripsi                       varchar(500)              null,
   bln_awal_bimbingan                  date                      null,
   bln_akhir_bimbingan                 date                      null,
   sk_yudisium                         varchar(80)               null,
   tgl_sk_yudisium                     date                      null,
   ipk                                 numeric(5,2)              null,
   sert_prof                           varchar(80)               null,
   a_pindah_mhs_asing                  numeric(1,0)              null default ((0)),
   biaya_masuk_kuliah                  numeric(16,2)             null,
   angkatan                            varchar(4)                null,
   sks_total                           int                       null,
   sks_lulus                           int                       null,
   semester                            varchar(10)               null,
   id_status_mahasiswa                 varchar(10)               null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_reg_pd primary key (id_reg_pd)
)
go

-- ============================================================
-- SECTION 3: AKADEMIK (MATAKULIAH, KELAS, KURIKULUM)
-- ============================================================

/*==============================================================*/
/* Table: matkul                                            */
/* Description: Data mata kuliah                             */
/*==============================================================*/
create table siakadu.matkul (
   id_mk                               uniqueidentifier          not null,
   id_kel_mk                           char(1)                   null,
   id_sms                              uniqueidentifier          null,
   id_jns_mk                           varchar(5)                null,
   id_jenj_didik                       numeric(2,0)              not null,
   sks_mk                              numeric(5,2)              null,
   sks_tm                              numeric(5,2)              null,
   sks_prak                            numeric(5,2)              null,
   sks_prak_lap                        numeric(5,2)              null,
   sks_sim                             numeric(5,2)              null,
   kode_mk                             varchar(20)               not null,
   nm_mk                               varchar(120)              null,
   jns_mk                              char(1)                   null,
   kel_mk                              char(1)                   null,
   metode_pelaksanaan_kuliah           varchar(50)               null,
   a_sap                               numeric(1,0)              null default ((0)),
   a_silabus                           numeric(1,0)              null default ((0)),
   a_bahan_ajar                        numeric(1,0)              null default ((0)),
   acara_prak                          numeric(1,0)              null,
   a_diktat                            numeric(1,0)              null default ((0)),
   tgl_mulai_efektif                   date                      null,
   tgl_akhir_efektif                   date                      null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_matkul primary key (id_mk)
)
go

/*==============================================================*/
/* Table: kelas_kuliah                                      */
/* Description: Kelas perkuliahan per semester               */
/*==============================================================*/
create table siakadu.kelas_kuliah (
   id_kls                              uniqueidentifier          not null,
   id_smt                              char(5)                   not null,
   id_sms                              uniqueidentifier          not null,
   id_mk                               uniqueidentifier          not null,
   sks_mk                              numeric(5,2)              null,
   sks_tm                              numeric(5,2)              null,
   sks_prak                            numeric(5,2)              null,
   sks_prak_lap                        numeric(5,2)              null,
   sks_sim                             numeric(5,2)              null,
   nm_kls                              varchar(5)                not null,
   bahasan_case                        varchar(200)              null,
   a_selenggara_pditt                  numeric(1,0)              not null default ((0)),
   a_pengguna_pditt                    numeric(1,0)              not null default ((0)),
   kuota_pditt                         numeric(4,0)              not null default ((0)),
   kode_vclass                         varchar(120)              null,
   url_vclass                          varchar(256)              null,
   lingkup_kelas                       numeric(1,0)              null,
   mode_kuliah                         char(1)                   null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_kelas_kuliah primary key (id_kls)
)
go

/*==============================================================*/
/* Table: matkul_kurikulum                                  */
/* Description: Mata kuliah dalam kurikulum                  */
/*==============================================================*/
create table siakadu.matkul_kurikulum (
   id_kurikulum_sp                     uniqueidentifier          not null,
   id_mk                               uniqueidentifier          not null,
   smt                                 numeric(2,0)              null,
   sks_mk                              numeric(5,2)              null,
   sks_tm                              numeric(5,2)              null,
   sks_prak                            numeric(5,2)              null,
   sks_prak_lap                        numeric(5,2)              null,
   sks_sim                             numeric(5,2)              null,
   a_wajib                             numeric(1,0)              null default ((0)),
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_matkul_kurikulum primary key (id_kurikulum_sp, id_mk)
)
go

/*==============================================================*/
/* Table: substansi_kuliah                                  */
/* Description: Substansi/komponen mata kuliah               */
/*==============================================================*/
create table siakadu.substansi_kuliah (
   id_subst                            uniqueidentifier          not null,
   id_sms                              uniqueidentifier          null,
   id_jns_subst                        char(5)                   not null,
   nm_subst                            varchar(50)               not null,
   sks_mk                              numeric(5,2)              null,
   sks_tm                              numeric(5,2)              null,
   sks_prak                            numeric(5,2)              null,
   sks_prak_lap                        numeric(5,2)              null,
   sks_sim                             numeric(5,2)              null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_substansi_kuliah primary key (id_subst)
)
go

-- ============================================================
-- SECTION 4: PERKULIAHAN & PENGAJARAN
-- ============================================================

/*==============================================================*/
/* Table: kuliah_mhs                                        */
/* Description: Kuliah mahasiswa per semester (KRS/status)   */
/*==============================================================*/
create table siakadu.kuliah_mhs (
   id_reg_pd                           uniqueidentifier          not null,
   id_smt                              char(5)                   not null,
   id_pembiayaan                       numeric(2,0)              null,
   id_stat_mhs                         char(1)                   not null,
   ips                                 numeric(7,4)              null,
   sks_semester                        numeric(5,2)              null,
   ipk                                 numeric(5,2)              null,
   total_sks                           numeric(5,2)              null,
   biaya_smt                           numeric(16,2)             null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_kuliah_mhs primary key (id_reg_pd, id_smt)
)
go

/*==============================================================*/
/* Table: akt_ajar_dosen                                    */
/* Description: Aktivitas mengajar dosen                     */
/*==============================================================*/
create table siakadu.akt_ajar_dosen (
   id_ajar                             uniqueidentifier          not null,
   id_reg_ptk                          uniqueidentifier          not null,
   id_subst                            uniqueidentifier          null,
   id_katgiat                          int                       not null,
   katgiat_ajar_id_katgiat             int                       null,
   id_jns_eval                         smallint                  not null,
   id_kls                              uniqueidentifier          not null,
   sks_subst_tot                       numeric(5,2)              not null,
   sks_tm_subst                        numeric(5,2)              not null,
   sks_prak_subst                      numeric(5,2)              not null,
   sks_prak_lap_subst                  numeric(5,2)              not null,
   sks_sim_subst                       numeric(5,2)              not null,
   jml_tm_renc                         numeric(2,0)              not null,
   jml_tm_real                         numeric(2,0)              null,
   jml_mhs                             smallint                  null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_akt_ajar_dosen primary key (id_ajar)
)
go

/*==============================================================*/
/* Table: jadwal_kelas                                      */
/* Description: Jadwal kelas perkuliahan                     */
/*==============================================================*/
create table siakadu.jadwal_kelas (
   id_jdwl_kls                         uniqueidentifier          not null,
   id_kls                              uniqueidentifier          not null,
   id_smt                              char(5)                   not null,
   pertemuan                           numeric(2,0)              null,
   tgl_jadwal                          datetime                  null,
   waktu_mulai                         varchar(5)                null,
   waktu_selesai                       varchar(5)                null,
   lokasi                              varchar(100)              null,
   status                              varchar(20)               null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_jadwal_kelas primary key (id_jdwl_kls)
)
go

-- ============================================================
-- SECTION 5: NILAI & EVALUASI
-- ============================================================

/*==============================================================*/
/* Table: nilai_smt_mhs                                     */
/* Description: Nilai semester mahasiswa (per kelas)         */
/*==============================================================*/
create table siakadu.nilai_smt_mhs (
   id_reg_pd                           uniqueidentifier          not null,
   id_kls                              uniqueidentifier          not null,
   nilai_angka                         numeric(4,1)              null,
   nilai_huruf                         char(3)                   null,
   nilai_indeks                        numeric(4,2)              null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_nilai_smt_mhs primary key (id_reg_pd, id_kls)
)
go

/*==============================================================*/
/* Table: nilai_transkrip                                   */
/* Description: Nilai transkrip mahasiswa (per mata kuliah)  */
/*==============================================================*/
create table siakadu.nilai_transkrip (
   id_reg_pd                           uniqueidentifier          not null,
   id_mk                               uniqueidentifier          not null,
   id_kls                              uniqueidentifier          null,
   id_konversi_aktivitas               uniqueidentifier          null,
   id_ekuivalensi                      uniqueidentifier          null,
   nilai_angka                         numeric(4,1)              null,
   nilai_huruf                         char(3)                   null,
   nilai_indeks                        numeric(4,2)              null,
   smt_ke                              numeric(2,0)              not null,
   sks_mk                              numeric(5,2)              not null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_nilai_transkrip primary key (id_reg_pd)
)
go

/*==============================================================*/
/* Table: re_mk                                             */
/* Description: Rencana evaluasi mata kuliah                 */
/*==============================================================*/
create table siakadu.re_mk (
   id_re_mk                            uniqueidentifier          not null,
   id_jns_eval                         smallint                  not null,
   id_mk                               uniqueidentifier          not null,
   no_urut                             int                       null,
   komponen_evaluasi                   char(3)                   null,
   desk_indo                           varchar(1000)             not null,
   desk_ing                            varchar(1000)             null,
   bobot_evaluasi                      numeric(7,4)              null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_re_mk primary key (id_re_mk)
)
go

-- ============================================================
-- SECTION 6: AKTIVITAS & PEMBIMBINGAN
-- ============================================================

/*==============================================================*/
/* Table: akt_mhs                                           */
/* Description: Aktivitas mahasiswa (KKN, magang, organisasi, dll)*/
/*==============================================================*/
create table siakadu.akt_mhs (
   id_akt_mhs                          uniqueidentifier          not null,
   id_jns_akt_mhs                      numeric(2,0)              not null,
   id_sms                              uniqueidentifier          not null,
   id_smt                              char(5)                   not null,
   judul_akt_mhs                       varchar(500)              not null,
   lokasi_kegiatan                     varchar(80)               null,
   sk_tugas                            varchar(80)               null,
   tgl_sk_tugas                        date                      null,
   ket_akt                             text          null,
   a_komunal                           numeric(1,0)              not null default ((0)),
   tgl_mulai                           datetime                  null,
   tgl_selesai                         datetime                  null,
   a_flagship                          numeric(1,0)              null default ((0)),
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_akt_mhs primary key (id_akt_mhs)
)
go

/*==============================================================*/
/* Table: anggota_akt_mhs                                   */
/* Description: Anggota aktivitas mahasiswa                  */
/*==============================================================*/
create table siakadu.anggota_akt_mhs (
   id_ang_akt_mhs                      uniqueidentifier          not null,
   id_akt_mhs                          uniqueidentifier          not null,
   id_reg_pd                           uniqueidentifier          not null,
   nm_pd                               varchar(120)              not null,
   nipd                                varchar(24)               not null,
   jns_peran_mhs                       char(1)                   not null default ('3'),
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_anggota_akt_mhs primary key (id_ang_akt_mhs)
)
go

/*==============================================================*/
/* Table: bimbing_dosen                                     */
/* Description: Aktivitas membimbing dosen                   */
/*==============================================================*/
create table siakadu.bimbing_dosen (
   id_bimb_dosen                       uniqueidentifier          not null,
   id_katgiat                          int                       not null,
   tgl_mulai                           date                      not null,
   tgl_selesai                         date                      not null,
   bid_ahli_pembimbing                 varchar(50)               null,
   bid_ahli_bimbingan                  varchar(50)               null,
   desk_kegiatan                       text          null,
   jns_bimbing                         char(1)                   not null,
   sk_tugas                            varchar(80)               not null,
   tgl_sk_tugas                        date                      not null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_bimbing_dosen primary key (id_bimb_dosen)
)
go

/*==============================================================*/
/* Table: bimbing_mhs                                       */
/* Description: Pembimbing mahasiswa (tugas akhir, KKN)      */
/*==============================================================*/
create table siakadu.bimbing_mhs (
   id_bimb_mhs                         uniqueidentifier          not null,
   id_katgiat                          int                       not null,
   id_sdm                              uniqueidentifier          not null,
   id_akt_mhs                          uniqueidentifier          not null,
   urutan_promotor                     numeric(1,0)              not null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_bimbing_mhs primary key (id_bimb_mhs)
)
go

/*==============================================================*/
/* Table: uji_mhs                                           */
/* Description: Penguji mahasiswa (sidang tugas akhir)       */
/*==============================================================*/
create table siakadu.uji_mhs (
   id_uji_mhs                          uniqueidentifier          not null,
   id_sdm                              uniqueidentifier          not null,
   id_katgiat                          int                       not null,
   id_akt_mhs                          uniqueidentifier          not null,
   urutan_uji                          numeric(1,0)              not null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_uji_mhs primary key (id_uji_mhs)
)
go

-- ============================================================
-- SECTION 7: PRESENSI & KINERJA
-- ============================================================

/*==============================================================*/
/* Table: kehadiran_mhs                                     */
/* Description: Data kehadiran/presensi mahasiswa            */
/*==============================================================*/
create table siakadu.kehadiran_mhs (
   id_reg_ptk                          uniqueidentifier          not null,
   id_kls                              uniqueidentifier          not null,
   id_hadir_mhs                        uniqueidentifier          not null,
   tgl_hadir                           datetime                  null,
   waktu_presensi                      datetime                  null,
   stat_hadir                          char(1)                   not null default ('H'),
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_kehadiran_mhs primary key (id_reg_ptk)
)
go

/*==============================================================*/
/* Table: kehadiran_sdm                                     */
/* Description: Data kehadiran/presensi SDM (dosen & tendik) */
/*==============================================================*/
create table siakadu.kehadiran_sdm (
   id_kehadiran_sdm                    uniqueidentifier          not null,
   id_sdm                              uniqueidentifier          not null,
   tgl_hadir                           datetime                  not null,
   waktu_presensi                      datetime                  null,
   lokasi_presensi                     varchar(60)               null,
   waktu_pulang                        datetime                  null,
   lokasi_pulang                       varchar(60)               null,
   rencana_hari_ini                    text          null,
   realisasi_hari_ini                  text          null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_kehadiran_sdm primary key (id_kehadiran_sdm)
)
go

/*==============================================================*/
/* Table: kinerja_dosen                                     */
/* Description: Beban kerja dan kinerja dosen (BKD/EWMP)     */
/*==============================================================*/
create table siakadu.kinerja_dosen (
   id_reg_ptk                          uniqueidentifier          not null,
   id_smt                              char(5)                   not null,
   id_jabfung                          numeric(5,0)              null,
   stat_tugas                          char(1)                   null,
   stat_belajar                        char(1)                   null,
   masa_laks_tgs_awal                  datetime                  null,
   masa_laks_tgs_akhir                 datetime                  null,
   sks_total                           numeric(7,4)              not null default ((0)),
   sks_kinerja                         numeric(7,4)              not null default ((0)),
   sks_lebih                           numeric(7,4)              not null default ((0)),
   sks_kinerja_didik                   numeric(7,4)              not null default ((0)),
   sks_kinerja_ajar                    numeric(7,4)              null,
   sks_kinerja_lit                     numeric(7,4)              not null default ((0)),
   sks_kinerja_pengmas                 numeric(7,4)              not null default ((0)),
   sks_kinerja_penunjang               numeric(7,4)              not null,
   sks_kinerja_tambahan                numeric(7,4)              not null default ((0)),
   sks_lebih_didik                     numeric(7,4)              not null default ((0)),
   sks_lebih_ajar                      numeric(7,4)              null,
   sks_lebih_lit                       numeric(7,4)              not null default ((0)),
   sks_lebih_pengmas                   numeric(7,4)              not null default ((0)),
   sks_lebih_tunjang                   numeric(7,4)              not null,
   sks_lebih_tambahan                  numeric(7,4)              not null,
   ewmp                                numeric(7,4)              null,
   simpulan_asesor                     char(1)                   not null,
   stat_kewajiban                      numeric(1,0)              null,
   penilai_1                           varchar(200)              null,
   penilai_2                           varchar(200)              null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_kinerja_dosen primary key (id_reg_ptk, id_smt)
)
go

-- ============================================================
-- SECTION 8: KEUANGAN MAHASISWA
-- ============================================================

/*==============================================================*/
/* Table: spp_mhs                                           */
/* Description: Pembayaran SPP/UKT mahasiswa                 */
/*==============================================================*/
create table siakadu.spp_mhs (
   id_spp_mhs                          uniqueidentifier          not null,
   id_kelas_ukt                        uniqueidentifier          null,
   id_smt                              char(5)                   not null,
   id_daftar_ukt                       uniqueidentifier          null,
   id_reg_pd                           uniqueidentifier          not null,
   tgl_bayar                           datetime                  not null,
   nominal                             decimal                   not null,
   nm_smt                              nvarchar(50)              null,
   total_tagihan                       decimal                   null default ((0)),
   jumlah_spi                          decimal                   null default ((0)),
   jumlah_denda                        decimal                   null default ((0)),
   jumlah_lainnya                      decimal                   null default ((0)),
   sisa_tagihan                        decimal                   null default ((0)),
   a_cicil                             int                       null default ((0)),
   cicilan_ke                          int                       null default ((0)),
   kode_pembayaran                     nvarchar(50)              null,
   nomor_pin                           nvarchar(50)              null,
   kode_akses                          nvarchar(50)              null,
   bill_ref                            nvarchar(100)             null,
   flag_by                             nvarchar(50)              null,
   ket                                 nvarchar(500)             null,
   create_date                         datetime                  not null default (getdate()),
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null default (getdate()),
   id_updater                          uniqueidentifier          null,
   soft_delete                         int                       not null default ((0)),
   last_sync                           datetime                  null,
   constraint pk_spp_mhs primary key (id_spp_mhs)
)
go

/*==============================================================*/
/* Table: kelas_ukt                                         */
/* Description: Kelas UKT per program studi per tahun        */
/*==============================================================*/
create table siakadu.kelas_ukt (
   id_kelas_ukt                        uniqueidentifier          not null,
   nm_kelas_ukt                        varchar(100)              not null,
   nominal_ukt                         numeric(16,2)             not null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_kelas_ukt primary key (id_kelas_ukt)
)
go

/*==============================================================*/
/* Table: daftar_ukt                                        */
/* Description: Daftar tarif UKT per kelas                   */
/*==============================================================*/
create table siakadu.daftar_ukt (
   id_daftar_ukt                       uniqueidentifier          not null,
   id_prodi_simpedam                   uniqueidentifier          not null,
   nama_prodi                          varchar(255)              not null,
   tahun                               numeric(4,0)              not null,
   kode_fakultas                       varchar(10)               not null,
   nama_fakultas                       varchar(255)              not null,
   kode_kelas                          varchar(10)               not null,
   nama_kelas                          varchar(50)               not null,
   nominal                             numeric(16,2)             not null,
   kode_strata                         numeric(2,0)              not null,
   id_sms                              uniqueidentifier          null,
   id_jenj_didik                       numeric(2,0)              null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_daftar_ukt primary key (id_daftar_ukt)
)
go

-- ============================================================
-- SECTION 9: LAIN-LAIN
-- ============================================================

/*==============================================================*/
/* Table: nilai_tes                                         */
/* Description: Nilai tes kemampuan (TOEFL, TPA, dll)        */
/*==============================================================*/
create table siakadu.nilai_tes (
   id_nilai_tes                        uniqueidentifier          not null,
   id_sdm                              uniqueidentifier          not null,
   id_jns_tes                          numeric(3,0)              not null,
   nm_nilai_tes                        varchar(50)               not null,
   penyelenggara                       varchar(100)              not null,
   thn                                 numeric(4,0)              not null,
   skor                                numeric(6,2)              not null,
   tgl_tes                             date                      null,
   a_valid                             numeric(1,0)              null default ((0)),
   tgl_validasi                        datetime                  null,
   create_date                         datetime                  not null,
   id_creator                          uniqueidentifier          not null,
   last_update                         datetime                  not null,
   id_updater                          uniqueidentifier          null,
   soft_delete                         numeric(1,0)              not null default ((0)),
   last_sync                           datetime                  not null,
   constraint pk_nilai_tes primary key (id_nilai_tes)
)
go


-- ============================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================

alter table siakadu.peserta_didik
   add constraint fk_peserta_didik_status_mahasiswa foreign key (id_stat_mhs)
      references siakadu.status_mahasiswa (id_stat_mhs)
go

alter table siakadu.sms
   add constraint fk_sms_jenjang_pendidikan foreign key (id_jenj_didik)
      references siakadu.jenjang_pendidikan (id_jenj_didik)
go

alter table siakadu.reg_ptk
   add constraint fk_reg_ptk_sdm foreign key (id_sdm)
      references siakadu.sdm (id_sdm)
go

alter table siakadu.reg_ptk
   add constraint fk_reg_ptk_sms foreign key (id_sms)
      references siakadu.sms (id_sms)
go

alter table siakadu.reg_pd
   add constraint fk_reg_pd_sms foreign key (id_sms)
      references siakadu.sms (id_sms)
go

alter table siakadu.reg_pd
   add constraint fk_reg_pd_peserta_didik foreign key (id_pd)
      references siakadu.peserta_didik (id_pd)
go

alter table siakadu.reg_pd
   add constraint fk_reg_pd_semester foreign key (id_smt)
      references siakadu.semester (id_smt)
go

alter table siakadu.matkul
   add constraint fk_matkul_sms foreign key (id_sms)
      references siakadu.sms (id_sms)
go

alter table siakadu.matkul
   add constraint fk_matkul_jenjang_pendidikan foreign key (id_jenj_didik)
      references siakadu.jenjang_pendidikan (id_jenj_didik)
go

alter table siakadu.kelas_kuliah
   add constraint fk_kelas_kuliah_semester foreign key (id_smt)
      references siakadu.semester (id_smt)
go

alter table siakadu.kelas_kuliah
   add constraint fk_kelas_kuliah_sms foreign key (id_sms)
      references siakadu.sms (id_sms)
go

alter table siakadu.kelas_kuliah
   add constraint fk_kelas_kuliah_matkul foreign key (id_mk)
      references siakadu.matkul (id_mk)
go

alter table siakadu.substansi_kuliah
   add constraint fk_substansi_kuliah_sms foreign key (id_sms)
      references siakadu.sms (id_sms)
go

alter table siakadu.kuliah_mhs
   add constraint fk_kuliah_mhs_status_mahasiswa foreign key (id_stat_mhs)
      references siakadu.status_mahasiswa (id_stat_mhs)
go

alter table siakadu.akt_ajar_dosen
   add constraint fk_akt_ajar_dosen_reg_ptk foreign key (id_reg_ptk)
      references siakadu.reg_ptk (id_reg_ptk)
go

alter table siakadu.akt_ajar_dosen
   add constraint fk_akt_ajar_dosen_substansi_kuliah foreign key (id_subst)
      references siakadu.substansi_kuliah (id_subst)
go

alter table siakadu.akt_ajar_dosen
   add constraint fk_akt_ajar_dosen_jenis_evaluasi foreign key (id_jns_eval)
      references siakadu.jenis_evaluasi (id_jns_eval)
go

alter table siakadu.akt_ajar_dosen
   add constraint fk_akt_ajar_dosen_kelas_kuliah foreign key (id_kls)
      references siakadu.kelas_kuliah (id_kls)
go

alter table siakadu.jadwal_kelas
   add constraint fk_jadwal_kelas_kelas_kuliah foreign key (id_kls)
      references siakadu.kelas_kuliah (id_kls)
go

alter table siakadu.jadwal_kelas
   add constraint fk_jadwal_kelas_semester foreign key (id_smt)
      references siakadu.semester (id_smt)
go

alter table siakadu.nilai_transkrip
   add constraint fk_nilai_transkrip_matkul foreign key (id_mk)
      references siakadu.matkul (id_mk)
go

alter table siakadu.nilai_transkrip
   add constraint fk_nilai_transkrip_kelas_kuliah foreign key (id_kls)
      references siakadu.kelas_kuliah (id_kls)
go

alter table siakadu.re_mk
   add constraint fk_re_mk_jenis_evaluasi foreign key (id_jns_eval)
      references siakadu.jenis_evaluasi (id_jns_eval)
go

alter table siakadu.re_mk
   add constraint fk_re_mk_matkul foreign key (id_mk)
      references siakadu.matkul (id_mk)
go

alter table siakadu.akt_mhs
   add constraint fk_akt_mhs_sms foreign key (id_sms)
      references siakadu.sms (id_sms)
go

alter table siakadu.akt_mhs
   add constraint fk_akt_mhs_semester foreign key (id_smt)
      references siakadu.semester (id_smt)
go

alter table siakadu.anggota_akt_mhs
   add constraint fk_anggota_akt_mhs_akt_mhs foreign key (id_akt_mhs)
      references siakadu.akt_mhs (id_akt_mhs)
go

alter table siakadu.anggota_akt_mhs
   add constraint fk_anggota_akt_mhs_reg_pd foreign key (id_reg_pd)
      references siakadu.reg_pd (id_reg_pd)
go

alter table siakadu.bimbing_mhs
   add constraint fk_bimbing_mhs_sdm foreign key (id_sdm)
      references siakadu.sdm (id_sdm)
go

alter table siakadu.bimbing_mhs
   add constraint fk_bimbing_mhs_akt_mhs foreign key (id_akt_mhs)
      references siakadu.akt_mhs (id_akt_mhs)
go

alter table siakadu.uji_mhs
   add constraint fk_uji_mhs_sdm foreign key (id_sdm)
      references siakadu.sdm (id_sdm)
go

alter table siakadu.uji_mhs
   add constraint fk_uji_mhs_akt_mhs foreign key (id_akt_mhs)
      references siakadu.akt_mhs (id_akt_mhs)
go

alter table siakadu.kehadiran_mhs
   add constraint fk_kehadiran_mhs_kelas_kuliah foreign key (id_kls)
      references siakadu.kelas_kuliah (id_kls)
go

alter table siakadu.kehadiran_sdm
   add constraint fk_kehadiran_sdm_sdm foreign key (id_sdm)
      references siakadu.sdm (id_sdm)
go

alter table siakadu.spp_mhs
   add constraint fk_spp_mhs_semester foreign key (id_smt)
      references siakadu.semester (id_smt)
go

alter table siakadu.spp_mhs
   add constraint fk_spp_mhs_reg_pd foreign key (id_reg_pd)
      references siakadu.reg_pd (id_reg_pd)
go

alter table siakadu.daftar_ukt
   add constraint fk_daftar_ukt_sms foreign key (id_sms)
      references siakadu.sms (id_sms)
go

alter table siakadu.daftar_ukt
   add constraint fk_daftar_ukt_jenjang_pendidikan foreign key (id_jenj_didik)
      references siakadu.jenjang_pendidikan (id_jenj_didik)
go

alter table siakadu.nilai_tes
   add constraint fk_nilai_tes_sdm foreign key (id_sdm)
      references siakadu.sdm (id_sdm)
go


-- ============================================================
-- INDEXES
-- ============================================================

create index idx_sdm_active on siakadu.sdm (id_sdm) where soft_delete = 0
go

create index idx_peserta_didik_id_stat_mhs on siakadu.peserta_didik (id_stat_mhs)
go

create index idx_peserta_didik_active on siakadu.peserta_didik (id_pd) where soft_delete = 0
go

create index idx_sms_id_jenj_didik on siakadu.sms (id_jenj_didik)
go

create index idx_sms_active on siakadu.sms (id_sms) where soft_delete = 0
go

create index idx_reg_ptk_id_sdm on siakadu.reg_ptk (id_sdm)
go

create index idx_reg_ptk_id_sms on siakadu.reg_ptk (id_sms)
go

create index idx_reg_ptk_active on siakadu.reg_ptk (id_reg_ptk) where soft_delete = 0
go

create index idx_reg_pd_id_sms on siakadu.reg_pd (id_sms)
go

create index idx_reg_pd_id_pd on siakadu.reg_pd (id_pd)
go

create index idx_reg_pd_id_smt on siakadu.reg_pd (id_smt)
go

create index idx_reg_pd_active on siakadu.reg_pd (id_reg_pd) where soft_delete = 0
go

create index idx_matkul_id_sms on siakadu.matkul (id_sms)
go

create index idx_matkul_id_jenj_didik on siakadu.matkul (id_jenj_didik)
go

create index idx_matkul_active on siakadu.matkul (id_mk) where soft_delete = 0
go

create index idx_kelas_kuliah_id_smt on siakadu.kelas_kuliah (id_smt)
go

create index idx_kelas_kuliah_id_sms on siakadu.kelas_kuliah (id_sms)
go

create index idx_kelas_kuliah_id_mk on siakadu.kelas_kuliah (id_mk)
go

create index idx_kelas_kuliah_active on siakadu.kelas_kuliah (id_kls) where soft_delete = 0
go

create index idx_matkul_kurikulum_active on siakadu.matkul_kurikulum (id_kurikulum_sp) where soft_delete = 0
go

create index idx_substansi_kuliah_id_sms on siakadu.substansi_kuliah (id_sms)
go

create index idx_substansi_kuliah_active on siakadu.substansi_kuliah (id_subst) where soft_delete = 0
go

create index idx_kuliah_mhs_id_stat_mhs on siakadu.kuliah_mhs (id_stat_mhs)
go

create index idx_kuliah_mhs_active on siakadu.kuliah_mhs (id_reg_pd) where soft_delete = 0
go

create index idx_akt_ajar_dosen_id_reg_ptk on siakadu.akt_ajar_dosen (id_reg_ptk)
go

create index idx_akt_ajar_dosen_id_subst on siakadu.akt_ajar_dosen (id_subst)
go

create index idx_akt_ajar_dosen_id_jns_eval on siakadu.akt_ajar_dosen (id_jns_eval)
go

create index idx_akt_ajar_dosen_id_kls on siakadu.akt_ajar_dosen (id_kls)
go

create index idx_akt_ajar_dosen_active on siakadu.akt_ajar_dosen (id_ajar) where soft_delete = 0
go

create index idx_jadwal_kelas_id_kls on siakadu.jadwal_kelas (id_kls)
go

create index idx_jadwal_kelas_id_smt on siakadu.jadwal_kelas (id_smt)
go

create index idx_jadwal_kelas_active on siakadu.jadwal_kelas (id_jdwl_kls) where soft_delete = 0
go

create index idx_nilai_smt_mhs_active on siakadu.nilai_smt_mhs (id_reg_pd) where soft_delete = 0
go

create index idx_nilai_transkrip_id_mk on siakadu.nilai_transkrip (id_mk)
go

create index idx_nilai_transkrip_id_kls on siakadu.nilai_transkrip (id_kls)
go

create index idx_nilai_transkrip_active on siakadu.nilai_transkrip (id_reg_pd) where soft_delete = 0
go

create index idx_re_mk_id_jns_eval on siakadu.re_mk (id_jns_eval)
go

create index idx_re_mk_id_mk on siakadu.re_mk (id_mk)
go

create index idx_re_mk_active on siakadu.re_mk (id_re_mk) where soft_delete = 0
go

create index idx_akt_mhs_id_sms on siakadu.akt_mhs (id_sms)
go

create index idx_akt_mhs_id_smt on siakadu.akt_mhs (id_smt)
go

create index idx_akt_mhs_active on siakadu.akt_mhs (id_akt_mhs) where soft_delete = 0
go

create index idx_anggota_akt_mhs_id_akt_mhs on siakadu.anggota_akt_mhs (id_akt_mhs)
go

create index idx_anggota_akt_mhs_id_reg_pd on siakadu.anggota_akt_mhs (id_reg_pd)
go

create index idx_anggota_akt_mhs_active on siakadu.anggota_akt_mhs (id_ang_akt_mhs) where soft_delete = 0
go

create index idx_bimbing_dosen_active on siakadu.bimbing_dosen (id_bimb_dosen) where soft_delete = 0
go

create index idx_bimbing_mhs_id_sdm on siakadu.bimbing_mhs (id_sdm)
go

create index idx_bimbing_mhs_id_akt_mhs on siakadu.bimbing_mhs (id_akt_mhs)
go

create index idx_bimbing_mhs_active on siakadu.bimbing_mhs (id_bimb_mhs) where soft_delete = 0
go

create index idx_uji_mhs_id_sdm on siakadu.uji_mhs (id_sdm)
go

create index idx_uji_mhs_id_akt_mhs on siakadu.uji_mhs (id_akt_mhs)
go

create index idx_uji_mhs_active on siakadu.uji_mhs (id_uji_mhs) where soft_delete = 0
go

create index idx_kehadiran_mhs_id_kls on siakadu.kehadiran_mhs (id_kls)
go

create index idx_kehadiran_mhs_active on siakadu.kehadiran_mhs (id_reg_ptk) where soft_delete = 0
go

create index idx_kehadiran_sdm_id_sdm on siakadu.kehadiran_sdm (id_sdm)
go

create index idx_kehadiran_sdm_active on siakadu.kehadiran_sdm (id_kehadiran_sdm) where soft_delete = 0
go

create index idx_kinerja_dosen_active on siakadu.kinerja_dosen (id_reg_ptk) where soft_delete = 0
go

create index idx_spp_mhs_id_smt on siakadu.spp_mhs (id_smt)
go

create index idx_spp_mhs_id_reg_pd on siakadu.spp_mhs (id_reg_pd)
go

create index idx_spp_mhs_active on siakadu.spp_mhs (id_spp_mhs) where soft_delete = 0
go

create index idx_kelas_ukt_active on siakadu.kelas_ukt (id_kelas_ukt) where soft_delete = 0
go

create index idx_daftar_ukt_id_sms on siakadu.daftar_ukt (id_sms)
go

create index idx_daftar_ukt_id_jenj_didik on siakadu.daftar_ukt (id_jenj_didik)
go

create index idx_daftar_ukt_active on siakadu.daftar_ukt (id_daftar_ukt) where soft_delete = 0
go

create index idx_nilai_tes_id_sdm on siakadu.nilai_tes (id_sdm)
go

create index idx_nilai_tes_active on siakadu.nilai_tes (id_nilai_tes) where soft_delete = 0
go


-- ============================================================
-- END OF SIAKADU SCHEMA v1.0
-- Total tables: 36
-- ============================================================

-- ============================================================
-- SECTION 10: MAPPING TABLES (SIAKADU → pdut UUID resolution)
-- ============================================================

/*==============================================================*/
/* Table: mapping_unit                                          */
/* Description: Mapping kode unit SIAKADU → id_sms pdut         */
/*==============================================================*/
create table siakadu.mapping_unit (
   kode_siakad              varchar(20)          not null,
   id_sms                   uniqueidentifier     not null,
   nm_unit                  varchar(200)         null,
   jenjang                  varchar(10)          null,
   create_date              datetime             not null default getdate(),
   last_update              datetime             not null default getdate(),
   a_sync_pddikti           numeric(1,0)         not null default ((0)),
   constraint pk_mapping_unit primary key (kode_siakad)
)
go

/*==============================================================*/
/* Table: mapping_matkul                                        */
/* Description: Mapping kode_mk SIAKADU (string) → id_mk UUID  */
/*==============================================================*/
create table siakadu.mapping_matkul (
   kode_mk_siakadu          varchar(20)          not null,
   id_unit_siakadu          varchar(20)          null,
   id_mk                    uniqueidentifier     not null,
   create_date              datetime             not null default getdate(),
   a_sync_pddikti           numeric(1,0)         not null default ((0)),
   constraint pk_mapping_matkul primary key (kode_mk_siakadu, id_unit_siakadu)
)
go

/*==============================================================*/
/* Table: mapping_kurikulum                                     */
/* Description: Mapping kode_mk+thn SIAKADU → id_kurikulum_sp  */
/*==============================================================*/
create table siakadu.mapping_kurikulum (
   kode_mk_siakadu          varchar(20)          not null,
   thn_kurikulum            int                  not null,
   id_unit_siakadu          varchar(20)          null,
   id_kurikulum_sp          uniqueidentifier     not null,
   id_mk                    uniqueidentifier     not null,
   create_date              datetime             not null default getdate(),
   a_sync_pddikti           numeric(1,0)         not null default ((0)),
   constraint pk_mapping_kurikulum primary key (kode_mk_siakadu, thn_kurikulum)
)
go

/*==============================================================*/
/* Table: mapping_kelas                                         */
/* Description: Mapping id_kelas SIAKADU (int) → id_kls UUID    */
/*==============================================================*/
create table siakadu.mapping_kelas (
   id_kelas_siakadu         int                  not null,
   id_kls                   uniqueidentifier     not null,
   id_smt                   char(5)              null,
   create_date              datetime             not null default getdate(),
   a_sync_pddikti           numeric(1,0)         not null default ((0)),
   constraint pk_mapping_kelas primary key (id_kelas_siakadu)
)
go

/*==============================================================*/
/* Table: mapping_jadwal                                        */
/* Description: Mapping id_jadwal SIAKADU (int) → UUID          */
/*==============================================================*/
create table siakadu.mapping_jadwal (
   id_jadwal_siakadu        int                  not null,
   id_jdwl_kls              uniqueidentifier     not null,
   create_date              datetime             not null default getdate(),
   a_sync_pddikti           numeric(1,0)         not null default ((0)),
   constraint pk_mapping_jadwal primary key (id_jadwal_siakadu)
)
go

/*==============================================================*/
/* Table: mapping_pegawai                                       */
/* Description: Mapping id_pegawai SIAKADU (int) → id_sdm UUID  */
/*==============================================================*/
create table siakadu.mapping_pegawai (
   id_pegawai_siakadu       int                  not null,
   id_sdm                   uniqueidentifier     not null,
   nip                      varchar(30)          null,
   create_date              datetime             not null default getdate(),
   a_sync_pddikti           numeric(1,0)         not null default ((0)),
   constraint pk_mapping_pegawai primary key (id_pegawai_siakadu)
)
go

-- ============================================================
-- SECTION 11: WISUDA
-- ============================================================

/*==============================================================*/
/* Table: periode_wisuda                                        */
/* Description: Periode wisuda per semester                     */
/*==============================================================*/
create table siakadu.periode_wisuda (
   id_periode_wisuda        varchar(20)          not null,
   id_smt                   char(5)              null,
   nm_periode               varchar(100)         null,
   tgl_yudisium             datetime             null,
   tgl_awal_daftar          datetime             null,
   tgl_akhir_daftar         datetime             null,
   create_date              datetime             not null default getdate(),
   last_update              datetime             not null default getdate(),
   soft_delete              numeric(1,0)         not null default 0,
   last_sync                datetime             not null default getdate(),
   constraint pk_periode_wisuda primary key (id_periode_wisuda)
)
go

/*==============================================================*/
/* Table: wisuda_mahasiswa                                      */
/* Description: Data peserta wisuda per periode                 */
/*==============================================================*/
create table siakadu.wisuda_mahasiswa (
   id_yudisium              int                  not null,
   id_periode_wisuda        varchar(20)          not null,
   id_reg_pd                uniqueidentifier     null,
   nipd                     varchar(24)          null,
   nm_mahasiswa             varchar(200)         null,
   no_sk_yudisium           varchar(80)          null,
   tgl_sk_yudisium          datetime             null,
   no_ijasah                varchar(80)          null,
   is_wisuda                varchar(5)           null,
   is_hadir_wisuda          numeric(1,0)         null,
   is_valid_wisuda          numeric(1,0)         null,
   keterangan               varchar(500)         null,
   ipk_lulusan              numeric(5,2)         null,
   id_sms                   uniqueidentifier     null,
   create_date              datetime             not null default getdate(),
   last_update              datetime             not null default getdate(),
   soft_delete              numeric(1,0)         not null default 0,
   last_sync                datetime             not null default getdate(),
   constraint pk_wisuda_mahasiswa primary key (id_yudisium)
)
go

-- ============================================================
-- SECTION 12: REFERENSI SIAKADU (yang digunakan oleh sync)
-- ============================================================

/*==============================================================*/
/* Table: ref_agama                                             */
/* Description: Referensi agama dari SIAKADU                    */
/*==============================================================*/
create table siakadu.ref_agama (
   id_agama                 int                  not null,
   nm_agama                 varchar(50)          null,
   last_update              datetime             null,
   constraint pk_ref_agama primary key (id_agama)
)
go

/*==============================================================*/
/* Table: ref_unit                                              */
/* Description: Referensi unit/prodi dari SIAKADU               */
/*==============================================================*/
create table siakadu.ref_unit (
   id_unit                  varchar(20)          not null,
   id_parent_unit           varchar(20)          null,
   jns_unit                 varchar(20)          not null,
   nm_unit                  varchar(200)         null,
   nm_singkat               varchar(50)          null,
   id_jenjang               varchar(10)          null,
   akreditasi               varchar(10)          null,
   is_aktif                 varchar(5)           null,
   last_update              datetime             null,
   constraint pk_ref_unit primary key (id_unit)
)
go

/*==============================================================*/
/* Table: ref_tahun_ajaran                                      */
/* Description: Referensi tahun ajaran/periode akademik          */
/*==============================================================*/
create table siakadu.ref_tahun_ajaran (
   id_periode               varchar(10)          not null,
   id_tahun_ajaran          varchar(10)          null,
   nm_tahun_ajaran          varchar(50)          null,
   nm_periode               varchar(100)         null,
   tgl_awal                 varchar(20)          null,
   tgl_akhir                varchar(20)          null,
   is_aktif                 varchar(5)           null,
   last_update              datetime             null,
   constraint pk_ref_tahun_ajaran primary key (id_periode)
)
go

/*==============================================================*/
/* Table: ref_status_mhs                                        */
/* Description: Referensi status mahasiswa dari SIAKADU          */
/*==============================================================*/
create table siakadu.ref_status_mhs (
   id_status_mhs            varchar(5)           not null,
   nm_status_mhs            varchar(50)          null,
   is_keluar                varchar(5)           null,
   last_update              datetime             null,
   constraint pk_ref_status_mhs primary key (id_status_mhs)
)
go

/*==============================================================*/
/* Table: ref_jalur_daftar                                      */
/* Description: Referensi jalur pendaftaran                     */
/*==============================================================*/
create table siakadu.ref_jalur_daftar (
   id_jalur_daftar          int                  not null,
   nm_jalur                 varchar(100)         null,
   is_transfer              int                  null,
   last_update              datetime             null,
   constraint pk_ref_jalur_daftar primary key (id_jalur_daftar)
)
go

/*==============================================================*/
/* Table: ref_jenis_mk                                          */
/* Description: Referensi jenis mata kuliah                     */
/*==============================================================*/
create table siakadu.ref_jenis_mk (
   id_jenis_mk              varchar(5)           not null,
   nm_jenis_mk              varchar(50)          null,
   last_update              datetime             null,
   constraint pk_ref_jenis_mk primary key (id_jenis_mk)
)
go

-- Indexes for mapping tables
create index idx_mapping_unit_id_sms on siakadu.mapping_unit (id_sms)
go
create index idx_mapping_kelas_id_kls on siakadu.mapping_kelas (id_kls)
go
create index idx_mapping_pegawai_nip on siakadu.mapping_pegawai (nip)
go
create index idx_mapping_pegawai_id_sdm on siakadu.mapping_pegawai (id_sdm)
go
create index idx_wisuda_mhs_periode on siakadu.wisuda_mahasiswa (id_periode_wisuda) where soft_delete = 0
go
create index idx_wisuda_mhs_nipd on siakadu.wisuda_mahasiswa (nipd) where soft_delete = 0
go
create index idx_ref_unit_parent on siakadu.ref_unit (id_parent_unit)
go
create index idx_ref_unit_jenis on siakadu.ref_unit (jns_unit)
go

-- ============================================================
-- SYNC LOG TABLE
-- ============================================================

/*==============================================================*/
/* Table: sync_log                                              */
/* Description: Log sinkronisasi data dari API SIAKADU          */
/*==============================================================*/
create table siakadu.sync_log (
   id_sync                  uniqueidentifier     not null default newid(),
   sync_type                varchar(50)          not null,
   sync_mode                varchar(20)          not null default 'manual',
   status                   varchar(20)          not null default 'running',
   total_fetched            int                  not null default 0,
   total_inserted           int                  not null default 0,
   total_updated            int                  not null default 0,
   total_skipped            int                  not null default 0,
   total_errors             int                  not null default 0,
   error_message            varchar(2000)        null,
   started_at               datetime             not null default getdate(),
   finished_at              datetime             null,
   duration_ms              int                  null,
   synced_by                varchar(100)         null,
   constraint pk_sync_log primary key (id_sync)
)
go

create index idx_sync_log_type on siakadu.sync_log (sync_type, started_at desc)
go

-- ============================================================
-- END OF SIAKADU SCHEMA v1.0 — ADDENDUM
-- Tables added: 12 (mapping: 4, wisuda: 2, referensi: 5, sync: 1)
-- Total tables: 48
-- ============================================================
