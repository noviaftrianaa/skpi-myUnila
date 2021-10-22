/*==============================================================*/
/* DBMS name:      PostgreSQL 9.x                               */
/* Created on:     15/10/2021 17:13:12                          */
/*==============================================================*/
CREATE EXTENSION "uuid-ossp";

create schema ref;

create schema pdrd;

create schema dok;

/*==============================================================*/
/* Table: agama                                                 */
/*==============================================================*/
create table agama (
   id_agama             int2                 not null,
   nm_agama             varchar(50)          not null,
   constraint pk_agama primary key (id_agama)
);

/*==============================================================*/
/* Index: agama_pk                                              */
/*==============================================================*/
create unique index agama_pk on agama (
id_agama
);

/*==============================================================*/
/* Table: akred_sp                                              */
/*==============================================================*/
create table akred_sp (
   id_akred_sp          uuid                 not null,
   id_lemb_akred        char(5)              not null,
   id_sp                uuid                 not null,
   id_akred             numeric(1)           not null,
   sk_akred_sp          varchar(80)          not null,
   tgl_sk_akred_sp      date                 not null,
   tst_sk_akred_sp      date                 not null,
   asal_data            char(1)              not null default '9'
      constraint ckc_asal_data_akred_sp check (asal_data in ('1','2','3','4','5','6','9','7','8')),
   constraint pk_akred_sp primary key (id_akred_sp)
);

comment on table akred_sp is
'Kegiatan penilaian kelayakan satuan pendidikan berdasarkan kriteria yang telah ditetapkan.';

/*==============================================================*/
/* Index: akred_sp_pk                                           */
/*==============================================================*/
create unique index akred_sp_pk on akred_sp (
id_akred_sp
);

/*==============================================================*/
/* Index: sp_akred_nilai_fk                                     */
/*==============================================================*/
create  index sp_akred_nilai_fk on akred_sp (
id_akred
);

/*==============================================================*/
/* Index: akred_sp_fk                                           */
/*==============================================================*/
create  index akred_sp_fk on akred_sp (
id_sp
);

/*==============================================================*/
/* Index: akred_sp_la_fk                                        */
/*==============================================================*/
create  index akred_sp_la_fk on akred_sp (
id_lemb_akred
);

/*==============================================================*/
/* Table: akreditasi_prodi                                      */
/*==============================================================*/
create table akreditasi_prodi (
   id_akreditasi_prodi  uuid                 not null,
   id_sms               uuid                 not null,
   id_lemb_akred        char(5)              not null,
   id_akred             numeric(1)           not null,
   sk_akreditasi_prodi  varchar(80)          not null,
   tanggal_sk_akreditasi_prodi date                 not null,
   tst_sk_akreditasi_prodi date                 not null,
   asal_data            char(1)              not null default '9'
      constraint ckc_asal_data_akredita check (asal_data in ('1','2','3','4','5','6','9','7','8')),
   constraint pk_akreditasi_prodi primary key (id_akreditasi_prodi)
);

/*==============================================================*/
/* Index: akreditasi_prodi_pk                                   */
/*==============================================================*/
create unique index akreditasi_prodi_pk on akreditasi_prodi (
id_akreditasi_prodi
);

/*==============================================================*/
/* Index: akreditasi_prodi_fk                                   */
/*==============================================================*/
create  index akreditasi_prodi_fk on akreditasi_prodi (
id_sms
);

/*==============================================================*/
/* Index: lemb_akred_prodi_fk                                   */
/*==============================================================*/
create  index lemb_akred_prodi_fk on akreditasi_prodi (
id_lemb_akred
);

/*==============================================================*/
/* Index: nilai_akred_prodi_fk                                  */
/*==============================================================*/
create  index nilai_akred_prodi_fk on akreditasi_prodi (
id_akred
);

/*==============================================================*/
/* Table: akt_ajar_dosen                                        */
/*==============================================================*/
create table akt_ajar_dosen (
   id_ajar              uuid                 not null,
   id_reg_ptk           uuid                 not null,
   id_subst             uuid                 null,
   id_katgiat           int4                 not null,
   id_jns_eval          int2                 not null,
   id_kls               uuid                 not null,
   sks_subst_tot        numeric(5,2)         not null,
   sks_tm_subst         numeric(5,2)         not null,
   sks_prak_subst       numeric(5,2)         not null,
   sks_prak_lap_subst   numeric(5,2)         not null,
   sks_sim_subst        numeric(5,2)         not null,
   jml_tm_renc          numeric(2)           not null,
   jml_tm_real          numeric(2)           null,
   jml_mhs              int2                 null,
   constraint pk_akt_ajar_dosen primary key (id_ajar)
);

comment on table akt_ajar_dosen is
'Kegiatan pembelajaran yang dilakukan oleh dosen di kelas yang meliputi detail pembelajaran, rencana pembelajaran, realisasi tatap muka, dan evaluasi.';

/*==============================================================*/
/* Index: akt_ajar_dosen_pk                                     */
/*==============================================================*/
create unique index akt_ajar_dosen_pk on akt_ajar_dosen (
id_ajar
);

/*==============================================================*/
/* Index: pengambilan_matakuliah_fk                             */
/*==============================================================*/
create  index pengambilan_matakuliah_fk on akt_ajar_dosen (
id_kls
);

/*==============================================================*/
/* Index: mengajar_substansi_fk                                 */
/*==============================================================*/
create  index mengajar_substansi_fk on akt_ajar_dosen (
id_subst
);

/*==============================================================*/
/* Index: pengajaran_evaluasi_fk                                */
/*==============================================================*/
create  index pengajaran_evaluasi_fk on akt_ajar_dosen (
id_jns_eval
);

/*==============================================================*/
/* Index: katgiat_ajar_fk                                       */
/*==============================================================*/
create  index katgiat_ajar_fk on akt_ajar_dosen (
id_katgiat
);

/*==============================================================*/
/* Index: ptk_pengampu_kuliah_fk                                */
/*==============================================================*/
create  index ptk_pengampu_kuliah_fk on akt_ajar_dosen (
id_reg_ptk
);

/*==============================================================*/
/* Table: akt_mhs                                               */
/*==============================================================*/
create table akt_mhs (
   id_akt_mhs           uuid                 not null,
   id_jns_akt_mhs       numeric(2)           not null,
   id_sms               uuid                 not null,
   id_smt               char(5)              not null,
   judul_akt_mhs        varchar(500)         not null,
   lokasi_kegiatan      varchar(80)          null,
   sk_tugas             varchar(80)          null,
   tgl_sk_tugas         date                 null,
   ket_akt              text                 null,
   a_komunal            numeric(1)           not null default 0
      constraint ckc_a_komunal_akt_mhs check (a_komunal between 0 and 1 and a_komunal in (0,1)),
   constraint pk_akt_mhs primary key (id_akt_mhs)
);

/*==============================================================*/
/* Index: akt_mhs_pk                                            */
/*==============================================================*/
create unique index akt_mhs_pk on akt_mhs (
id_akt_mhs
);

/*==============================================================*/
/* Index: jenis_akt_mhs_fk                                      */
/*==============================================================*/
create  index jenis_akt_mhs_fk on akt_mhs (
id_jns_akt_mhs
);

/*==============================================================*/
/* Index: prodi_akt_mhs_fk                                      */
/*==============================================================*/
create  index prodi_akt_mhs_fk on akt_mhs (
id_sms
);

/*==============================================================*/
/* Index: smt_akt_mhs_fk                                        */
/*==============================================================*/
create  index smt_akt_mhs_fk on akt_mhs (
id_smt
);

/*==============================================================*/
/* Table: alat_transportasi                                     */
/*==============================================================*/
create table alat_transportasi (
   id_alat_transport    numeric(2)           not null,
   nm_alat_transport    varchar(60)          not null,
   constraint pk_alat_transportasi primary key (id_alat_transport)
);

/*==============================================================*/
/* Index: alat_transportasi_pk                                  */
/*==============================================================*/
create unique index alat_transportasi_pk on alat_transportasi (
id_alat_transport
);

/*==============================================================*/
/* Table: anak                                                  */
/*==============================================================*/
create table anak (
   id_anak              uuid                 not null,
   id_stat_anak         numeric(1)           not null,
   nisn                 char(10)             null,
   nm_anak              varchar(100)         not null,
   jk                   char(1)              not null
      constraint ckc_jk_anak check (jk in ('L','P','*')),
   tmpt_lahir           varchar(32)          null,
   tgl_lahir            date                 not null,
   thn_masuk            numeric(4)           null,
   constraint pk_anak primary key (id_anak)
);

comment on table anak is
'Keturunan yang dimiliki oleh seseorang.';

/*==============================================================*/
/* Index: anak_pk                                               */
/*==============================================================*/
create unique index anak_pk on anak (
id_anak
);

/*==============================================================*/
/* Index: anak_status_fk                                        */
/*==============================================================*/
create  index anak_status_fk on anak (
id_stat_anak
);

/*==============================================================*/
/* Table: anggota_aktivitas_mahasiswa                           */
/*==============================================================*/
create table anggota_aktivitas_mahasiswa (
   id_ang_akt_mhs       uuid                 not null,
   id_akt_mhs           uuid                 not null,
   id_reg_pd            uuid                 not null,
   nm_pd                varchar(120)         not null,
   nipd                 varchar(24)          not null,
   jns_peran_mhs        char(1)              not null default '3'
      constraint ckc_jns_peran_mhs_anggota_ check (jns_peran_mhs in ('1','2','3')),
   constraint pk_anggota_aktivitas_mahasiswa primary key (id_ang_akt_mhs)
);

/*==============================================================*/
/* Index: anggota_aktivitas_mahasiswa_pk                        */
/*==============================================================*/
create unique index anggota_aktivitas_mahasiswa_pk on anggota_aktivitas_mahasiswa (
id_ang_akt_mhs
);

/*==============================================================*/
/* Index: akt_mhs_anggota_fk                                    */
/*==============================================================*/
create  index akt_mhs_anggota_fk on anggota_aktivitas_mahasiswa (
id_akt_mhs
);

/*==============================================================*/
/* Index: reg_ang_akt_mhs_fk                                    */
/*==============================================================*/
create  index reg_ang_akt_mhs_fk on anggota_aktivitas_mahasiswa (
id_reg_pd
);

/*==============================================================*/
/* Table: bentuk_pendidikan                                     */
/*==============================================================*/
create table bentuk_pendidikan (
   id_bp                int2                 not null,
   nm_bp                varchar(50)          not null,
   a_jenj_paud          numeric(1)           not null default 0
      constraint ckc_a_jenj_paud_bentuk_p check (a_jenj_paud between 0 and 1 and a_jenj_paud in (0,1)),
   a_jenj_tk            numeric(1)           not null default 0
      constraint ckc_a_jenj_tk_bentuk_p check (a_jenj_tk between 0 and 1 and a_jenj_tk in (0,1)),
   a_jenj_sd            numeric(1)           not null default 0
      constraint ckc_a_jenj_sd_bentuk_p check (a_jenj_sd between 0 and 1 and a_jenj_sd in (0,1)),
   a_jenj_smp           numeric(1)           not null default 0
      constraint ckc_a_jenj_smp_bentuk_p check (a_jenj_smp between 0 and 1 and a_jenj_smp in (0,1)),
   a_jenj_sma           numeric(1)           not null default 0
      constraint ckc_a_jenj_sma_bentuk_p check (a_jenj_sma between 0 and 1 and a_jenj_sma in (0,1)),
   a_jenj_tinggi        numeric(1)           not null default 0
      constraint ckc_a_jenj_tinggi_bentuk_p check (a_jenj_tinggi between 0 and 1 and a_jenj_tinggi in (0,1)),
   dir_bina             varchar(40)          null,
   a_aktif              numeric(1)           not null default 0
      constraint ckc_a_aktif_bentuk_p check (a_aktif between 0 and 1 and a_aktif in (0,1)),
   constraint pk_bentuk_pendidikan primary key (id_bp)
);

comment on table bentuk_pendidikan is
'Pembagian atau klasifikasi pendidikan berdasarkan kriteria tertentu. Contoh bentuk pendidikan adalah taman kanak-kanak (TK), sekolah dasar (SD), madrasah ibtidaiyah (MI), sekolah menengah pertama (SMP), sekolah menengah atas (SMA), sekolah luar biasa (SLB), universitas, dll. ';

/*==============================================================*/
/* Index: bentuk_pendidikan_pk                                  */
/*==============================================================*/
create unique index bentuk_pendidikan_pk on bentuk_pendidikan (
id_bp
);

/*==============================================================*/
/* Table: bidang_studi                                          */
/*==============================================================*/
create table bidang_studi (
   id_bid_studi         int4                 not null,
   kelompok_id_bid_studi int4                 null,
   kode_bid_studi       varchar(22)          null,
   nm_bid_studi         varchar(100)         not null,
   a_kel                numeric(1)           not null default 0
      constraint ckc_a_kel_bidang_s check (a_kel between 0 and 1 and a_kel in (0,1)),
   a_jenj_paud          numeric(1)           not null default 0
      constraint ckc_a_jenj_paud_bidang_s check (a_jenj_paud between 0 and 1 and a_jenj_paud in (0,1)),
   a_jenj_tk            numeric(1)           not null default 0
      constraint ckc_a_jenj_tk_bidang_s check (a_jenj_tk between 0 and 1 and a_jenj_tk in (0,1)),
   a_jenj_sd            numeric(1)           not null default 0
      constraint ckc_a_jenj_sd_bidang_s check (a_jenj_sd between 0 and 1 and a_jenj_sd in (0,1)),
   a_jenj_smp           numeric(1)           not null default 0
      constraint ckc_a_jenj_smp_bidang_s check (a_jenj_smp between 0 and 1 and a_jenj_smp in (0,1)),
   a_jenj_sma           numeric(1)           not null default 0
      constraint ckc_a_jenj_sma_bidang_s check (a_jenj_sma between 0 and 1 and a_jenj_sma in (0,1)),
   a_jenj_tinggi        numeric(1)           not null default 0
      constraint ckc_a_jenj_tinggi_bidang_s check (a_jenj_tinggi between 0 and 1 and a_jenj_tinggi in (0,1)),
   constraint pk_bidang_studi primary key (id_bid_studi)
);

comment on table bidang_studi is
'Bidang studi yang menjadi kualifikasi pendidik atau bidang studi sesuai dengan sertifikasi.';

/*==============================================================*/
/* Index: bidang_studi_pk                                       */
/*==============================================================*/
create unique index bidang_studi_pk on bidang_studi (
id_bid_studi
);

/*==============================================================*/
/* Index: kelompok_fk                                           */
/*==============================================================*/
create  index kelompok_fk on bidang_studi (
kelompok_id_bid_studi
);

/*==============================================================*/
/* Table: bimbing_mhs                                           */
/*==============================================================*/
create table bimbing_mhs (
   id_bimb_mhs          uuid                 not null,
   id_sdm               uuid                 not null,
   id_akt_mhs           uuid                 not null,
   urutan_promotor      numeric(1)           not null,
   constraint pk_bimbing_mhs primary key (id_bimb_mhs)
);

comment on table bimbing_mhs is
'Aktivitas membimbing mahasiswa berupa kegiatan bimbingan tugas/laporan akhir, bimbingan akademik, bimbingan kemahasiswaan, dll.';

/*==============================================================*/
/* Index: bimbing_mhs_pk                                        */
/*==============================================================*/
create unique index bimbing_mhs_pk on bimbing_mhs (
id_bimb_mhs
);

/*==============================================================*/
/* Index: dosen_pembimbing_fk                                   */
/*==============================================================*/
create  index dosen_pembimbing_fk on bimbing_mhs (
id_sdm
);

/*==============================================================*/
/* Index: aktmhs_bimb_fk                                        */
/*==============================================================*/
create  index aktmhs_bimb_fk on bimbing_mhs (
id_akt_mhs
);

/*==============================================================*/
/* Table: diklat                                                */
/*==============================================================*/
create table diklat (
   id_diklat            uuid                 not null,
   id_kel_bidang        uuid                 null,
   id_jns_diklat        int4                 not null,
   nm_diklat            varchar(160)         not null,
   penyelenggara        varchar(100)         null,
   thn                  numeric(4)           not null,
   peran                varchar(30)          null,
   tkt                  numeric(2)           null,
   jml_jam              numeric(4)           null,
   no_sert              varchar(80)          null,
   tgl_sert             date                 null,
   tempat               varchar(20)          null,
   tgl_mulai            date                 null,
   tgl_selesai          date                 null,
   sk_tugas             varchar(80)          null,
   tgl_sk_tugas         date                 null,
   constraint pk_diklat primary key (id_diklat)
);

comment on table diklat is
'Pendidikan atau pelatihan yang diadakan untuk upaya pengayaan pengetahuan dan kemampuan bidang tertentu. Termasuk juga kegiatan academic recharging, academic exchange, PEKERTI, Applied Approach, dll.';

/*==============================================================*/
/* Index: diklat_pk                                             */
/*==============================================================*/
create unique index diklat_pk on diklat (
id_diklat
);

/*==============================================================*/
/* Index: diklat_jenis_fk                                       */
/*==============================================================*/
create  index diklat_jenis_fk on diklat (
id_jns_diklat
);

/*==============================================================*/
/* Index: diklat_kelbid_fk                                      */
/*==============================================================*/
create  index diklat_kelbid_fk on diklat (
id_kel_bidang
);

/*==============================================================*/
/* Table: dokumen                                               */
/*==============================================================*/
create table dokumen (
   id_dok               uuid                 not null,
   id_jns_dok           int4                 not null,
   nm_dok               varchar(60)          not null,
   ket_dok              varchar(200)         null,
   file_dok             bytea                null,
   wkt_unggah           date                 not null,
   url                  varchar(256)         null,
   media_type           varchar(250)         null,
   file_name            varchar(500)         null,
   constraint pk_dokumen primary key (id_dok)
);

comment on table dokumen is
'Berisikan tabel penyimapanan dokumen dalam bentuk blob';

/*==============================================================*/
/* Index: dokumen_pk                                            */
/*==============================================================*/
create unique index dokumen_pk on dokumen (
id_dok
);

/*==============================================================*/
/* Index: jenis_dok_dokumen_fk                                  */
/*==============================================================*/
create  index jenis_dok_dokumen_fk on dokumen (
id_jns_dok
);

/*==============================================================*/
/* Table: foto_peserta_didik                                    */
/*==============================================================*/
create table foto_peserta_didik (
   id_foto_pd           uuid                 not null,
   id_blob              uuid                 not null,
   id_pd                uuid                 not null,
   wkt_unggah           date                 not null,
   a_tampil             numeric(1)           not null default 0
      constraint ckc_a_tampil_foto_pes check (a_tampil between 0 and 1 and a_tampil in (0,1)),
   constraint pk_foto_peserta_didik primary key (id_foto_pd)
);

/*==============================================================*/
/* Index: foto_peserta_didik_pk                                 */
/*==============================================================*/
create unique index foto_peserta_didik_pk on foto_peserta_didik (
id_foto_pd
);

/*==============================================================*/
/* Index: pemilik_foto_fk                                       */
/*==============================================================*/
create  index pemilik_foto_fk on foto_peserta_didik (
id_pd
);

/*==============================================================*/
/* Index: rincian_foto_pd_fk                                    */
/*==============================================================*/
create  index rincian_foto_pd_fk on foto_peserta_didik (
id_blob
);

/*==============================================================*/
/* Table: fungsi_lab                                            */
/*==============================================================*/
create table fungsi_lab (
   id_fungsi_lab        char(1)              not null,
   nm_fungsi_lab        varchar(100)         not null,
   constraint pk_fungsi_lab primary key (id_fungsi_lab)
);

/*==============================================================*/
/* Index: fungsi_lab_pk                                         */
/*==============================================================*/
create unique index fungsi_lab_pk on fungsi_lab (
id_fungsi_lab
);

/*==============================================================*/
/* Table: gelar_akademik                                        */
/*==============================================================*/
create table gelar_akademik (
   id_gelar_akad        int4                 not null,
   singkat_gelar        varchar(20)          not null,
   nm_gelar_akad        varchar(80)          not null,
   posisi_gelar         numeric(1)           not null
      constraint ckc_posisi_gelar_gelar_ak check (posisi_gelar in (1,2)),
   constraint pk_gelar_akademik primary key (id_gelar_akad)
);

comment on table gelar_akademik is
'Sebutan akademik yang diterima oleh lulusan pendidikan bidang studi tertentu dari suatu perguruan tinggi.';

/*==============================================================*/
/* Index: gelar_akademik_pk                                     */
/*==============================================================*/
create unique index gelar_akademik_pk on gelar_akademik (
id_gelar_akad
);

/*==============================================================*/
/* Table: ikatan_kerja_sdm                                      */
/*==============================================================*/
create table ikatan_kerja_sdm (
   id_ikatan_kerja      char(1)              not null,
   nm_ikatan_kerja      varchar(50)          not null,
   ket_ikatan_kerja     varchar(150)         not null,
   constraint pk_ikatan_kerja_sdm primary key (id_ikatan_kerja)
);

comment on table ikatan_kerja_sdm is
'Bentuk skema pekerjaan atau perjanjian kerja antara SDM dengan institusinya';

/*==============================================================*/
/* Index: ikatan_kerja_sdm_pk                                   */
/*==============================================================*/
create unique index ikatan_kerja_sdm_pk on ikatan_kerja_sdm (
id_ikatan_kerja
);

/*==============================================================*/
/* Table: inpassing                                             */
/*==============================================================*/
create table inpassing (
   id_inpassing         uuid                 not null,
   id_pangkat_gol       numeric(2)           not null,
   sk_inpassing         varchar(80)          not null,
   tgl_sk_inpassing     date                 null,
   tmt_sk_inpassing     date                 not null,
   angka_kredit         numeric(7,2)         not null default 0,
   masa_kerja_thn       numeric(2)           not null,
   masa_kerja_bln       numeric(2)           not null,
   constraint pk_inpassing primary key (id_inpassing)
);

comment on table inpassing is
'Penetapan jabatan fungsional untuk pendidik dan tenaga kependidikan yang tidak berstatus sebagai pegawai negeri sipil.';

/*==============================================================*/
/* Index: inpassing_pk                                          */
/*==============================================================*/
create unique index inpassing_pk on inpassing (
id_inpassing
);

/*==============================================================*/
/* Index: inpassing_setara_fk                                   */
/*==============================================================*/
create  index inpassing_setara_fk on inpassing (
id_pangkat_gol
);

/*==============================================================*/
/* Table: jalur_daftar                                          */
/*==============================================================*/
create table ref.jalur_daftar (
   id_jalur_daftar      serial               not null,
   nm_jalur_daftar      varchar(100)         not null,
   constraint pk_jalur_daftar primary key (id_jalur_daftar)
);

/*==============================================================*/
/* Index: jalur_daftar_pk                                       */
/*==============================================================*/
create unique index jalur_daftar_pk on ref.jalur_daftar (
id_jalur_daftar
);

/*==============================================================*/
/* Table: jenis_akt_mhs                                         */
/*==============================================================*/
create table jenis_akt_mhs (
   id_jns_akt_mhs       numeric(2)           not null,
   nm_jns_akt_mhs       varchar(50)          not null,
   ket_jns_akt_mhs      varchar(100)         null,
   constraint pk_jenis_akt_mhs primary key (id_jns_akt_mhs)
);

/*==============================================================*/
/* Index: jenis_akt_mhs_pk                                      */
/*==============================================================*/
create unique index jenis_akt_mhs_pk on jenis_akt_mhs (
id_jns_akt_mhs
);

/*==============================================================*/
/* Table: jenis_diklat                                          */
/*==============================================================*/
create table jenis_diklat (
   id_jns_diklat        int4                 not null,
   nm_jns_diklat        varchar(50)          not null,
   u_guru               numeric(1)           not null default 0
      constraint ckc_u_guru_jenis_di check (u_guru between 0 and 1 and u_guru in (0,1)),
   u_dosen              numeric(1)           not null default 0
      constraint ckc_u_dosen_jenis_di check (u_dosen between 0 and 1 and u_dosen in (0,1)),
   u_tendik             numeric(1)           not null default 0
      constraint ckc_u_tendik_jenis_di check (u_tendik between 0 and 1 and u_tendik in (0,1)),
   constraint pk_jenis_diklat primary key (id_jns_diklat)
);

comment on table jenis_diklat is
'Klasifikasi macam pendidikan dan pelatihan.';

/*==============================================================*/
/* Index: jenis_diklat_pk                                       */
/*==============================================================*/
create unique index jenis_diklat_pk on jenis_diklat (
id_jns_diklat
);

/*==============================================================*/
/* Table: jenis_dokumen                                         */
/*==============================================================*/
create table jenis_dokumen (
   id_jns_dok           int4                 not null,
   nm_jns_dok           varchar(50)          not null,
   constraint pk_jenis_dokumen primary key (id_jns_dok)
);

comment on table jenis_dokumen is
'berisikan data referensi dokumen yang di upload';

/*==============================================================*/
/* Index: jenis_dokumen_pk                                      */
/*==============================================================*/
create unique index jenis_dokumen_pk on jenis_dokumen (
id_jns_dok
);

/*==============================================================*/
/* Table: jenis_evaluasi                                        */
/*==============================================================*/
create table jenis_evaluasi (
   id_jns_eval          int2                 not null,
   nm_jns_eval          varchar(50)          not null,
   ket_jns_eval         varchar(100)         null,
   constraint pk_jenis_evaluasi primary key (id_jns_eval)
);

comment on table jenis_evaluasi is
'Klasifikasi macam evaluasi yang dilakukan di dalam pembelajaran.';

/*==============================================================*/
/* Index: jenis_evaluasi_pk                                     */
/*==============================================================*/
create unique index jenis_evaluasi_pk on jenis_evaluasi (
id_jns_eval
);

/*==============================================================*/
/* Table: jenis_keluar                                          */
/*==============================================================*/
create table jenis_keluar (
   id_jns_keluar        char(1)              not null,
   ket_keluar           varchar(40)          not null,
   a_pd                 numeric(1)           not null default 0
      constraint ckc_a_pd_jenis_ke check (a_pd between 0 and 1 and a_pd in (0,1)),
   a_ptk                numeric(1)           not null default 0
      constraint ckc_a_ptk_jenis_ke check (a_ptk between 0 and 1 and a_ptk in (0,1)),
   a_sdm_iptek          numeric(1)           not null default 0
      constraint ckc_a_sdm_iptek_jenis_ke check (a_sdm_iptek between 0 and 1 and a_sdm_iptek in (0,1)),
   constraint pk_jenis_keluar primary key (id_jns_keluar)
);

comment on table jenis_keluar is
'Klasifikasi macam alasan keluar pendidik dan tenaga kependidikan, pengawas, atau peserta didik.';

/*==============================================================*/
/* Index: jenis_keluar_pk                                       */
/*==============================================================*/
create unique index jenis_keluar_pk on jenis_keluar (
id_jns_keluar
);

/*==============================================================*/
/* Table: jenis_lembaga                                         */
/*==============================================================*/
create table jenis_lembaga (
   id_jns_lemb          numeric(5)           not null,
   nm_jns_lemb          varchar(100)         not null,
   a_sp                 numeric(1)           not null default 0
      constraint ckc_a_sp_jenis_le check (a_sp between 0 and 1 and a_sp in (0,1)),
   a_lemb_akred         numeric(1)           not null default 0
      constraint ckc_a_lemb_akred_jenis_le check (a_lemb_akred between 0 and 1 and a_lemb_akred in (0,1)),
   a_pengelola_pendidikan numeric(1)           not null default 0
      constraint ckc_a_pengelola_pendi_jenis_le check (a_pengelola_pendidikan between 0 and 1 and a_pengelola_pendidikan in (0,1)),
   a_sms                numeric(1)           not null default 0
      constraint ckc_a_sms_jenis_le check (a_sms between 0 and 1 and a_sms in (0,1)),
   a_tmpt_pengawas      numeric(1)           not null default 0
      constraint ckc_a_tmpt_pengawas_jenis_le check (a_tmpt_pengawas between 0 and 1 and a_tmpt_pengawas in (0,1)),
   a_lemb_iptek         numeric(1)           not null default 0
      constraint ckc_a_lemb_iptek_jenis_le check (a_lemb_iptek between 0 and 1 and a_lemb_iptek in (0,1)),
   a_smi                numeric(1)           not null default 0
      constraint ckc_a_smi_jenis_le check (a_smi between 0 and 1 and a_smi in (0,1)),
   sort                 int4                 null,
   constraint pk_jenis_lembaga primary key (id_jns_lemb)
);

comment on table jenis_lembaga is
'1	Sekolah
2	UPTD
3	Dinas Pendidikan Kabupaten/Kota
4	Dinas Pendidikan Provinsi
5	Direktorat Teknis
6	Direktorat Jenderal
7	Pusat Pusat di Kementerian
8	Sekretariat Jenderal
11	Lembaga Pembina Pendidikan
20	Kanwil Kemenag
21	Kementerian
22	Perguruan Tinggi
23	Fakultas
24	Prodi
25	Lembaga Pemerintah Nonkementerian
26	Laboratorium
27	UPT
28	Jurusan
29	Rektorat
30	Unit Kerja
31	Penyelenggara MKU
50	Lembaga Pemerintah Non Kementerian
51	Penyelenggara Uji Kompetensi
52	Penjamin Mutu Pendidikan
53	Lembaga Akreditasi
99	Lainnya';

/*==============================================================*/
/* Index: jenis_lembaga_pk                                      */
/*==============================================================*/
create unique index jenis_lembaga_pk on jenis_lembaga (
id_jns_lemb
);

/*==============================================================*/
/* Table: jenis_pendaftaran                                     */
/*==============================================================*/
create table jenis_pendaftaran (
   id_jns_daftar        numeric(2)           not null,
   nm_jns_daftar        varchar(60)          not null,
   u_daftar_sekolah     numeric(1)           not null default 0
      constraint ckc_u_daftar_sekolah_jenis_pe check (u_daftar_sekolah between 0 and 1 and u_daftar_sekolah in (0,1)),
   u_daftar_rombel      numeric(1)           not null default 0
      constraint ckc_u_daftar_rombel_jenis_pe check (u_daftar_rombel between 0 and 1 and u_daftar_rombel in (0,1)),
   constraint pk_jenis_pendaftaran primary key (id_jns_daftar)
);

/*==============================================================*/
/* Index: jenis_pendaftaran_pk                                  */
/*==============================================================*/
create unique index jenis_pendaftaran_pk on jenis_pendaftaran (
id_jns_daftar
);

/*==============================================================*/
/* Table: jenis_prestasi                                        */
/*==============================================================*/
create table jenis_prestasi (
   id_jenis_prestasi    int4                 not null,
   nm_jenis_prestasi    varchar(100)         not null,
   constraint pk_jenis_prestasi primary key (id_jenis_prestasi)
);

/*==============================================================*/
/* Index: jenis_prestasi_pk                                     */
/*==============================================================*/
create unique index jenis_prestasi_pk on jenis_prestasi (
id_jenis_prestasi
);

/*==============================================================*/
/* Table: jenis_sdm                                             */
/*==============================================================*/
create table jenis_sdm (
   id_jns_sdm           numeric(2)           not null,
   nm_jns_sdm           varchar(50)          not null,
   a_guru_kelas         numeric(1)           not null default 0
      constraint ckc_a_guru_kelas_jenis_sd check (a_guru_kelas between 0 and 1 and a_guru_kelas in (0,1)),
   a_guru_mapel         numeric(1)           not null default 0
      constraint ckc_a_guru_mapel_jenis_sd check (a_guru_mapel between 0 and 1 and a_guru_mapel in (0,1)),
   a_guru_bk            numeric(1)           not null default 0
      constraint ckc_a_guru_bk_jenis_sd check (a_guru_bk between 0 and 1 and a_guru_bk in (0,1)),
   a_guru_inklusi       numeric(1)           not null default 0
      constraint ckc_a_guru_inklusi_jenis_sd check (a_guru_inklusi between 0 and 1 and a_guru_inklusi in (0,1)),
   a_pengawas_sp        numeric(1)           not null default 0
      constraint ckc_a_pengawas_sp_jenis_sd check (a_pengawas_sp between 0 and 1 and a_pengawas_sp in (0,1)),
   a_pengawas_plb       numeric(1)           not null default 0
      constraint ckc_a_pengawas_plb_jenis_sd check (a_pengawas_plb between 0 and 1 and a_pengawas_plb in (0,1)),
   a_pengawas_mapel     numeric(1)           not null default 0
      constraint ckc_a_pengawas_mapel_jenis_sd check (a_pengawas_mapel between 0 and 1 and a_pengawas_mapel in (0,1)),
   a_pengawas_bid       numeric(1)           not null default 0
      constraint ckc_a_pengawas_bid_jenis_sd check (a_pengawas_bid between 0 and 1 and a_pengawas_bid in (0,1)),
   a_tas                numeric(1)           not null default 0
      constraint ckc_a_tas_jenis_sd check (a_tas between 0 and 1 and a_tas in (0,1)),
   a_formal             numeric(1)           not null default 0
      constraint ckc_a_formal_jenis_sd check (a_formal between 0 and 1 and a_formal in (0,1)),
   a_dosen              numeric(1)           not null default 0
      constraint ckc_a_dosen_jenis_sd check (a_dosen between 0 and 1 and a_dosen in (0,1)),
   a_peneliti           numeric(1)           not null default 0
      constraint ckc_a_peneliti_jenis_sd check (a_peneliti between 0 and 1 and a_peneliti in (0,1)),
   a_perekayasa         numeric(1)           not null default 0
      constraint ckc_a_perekayasa_jenis_sd check (a_perekayasa between 0 and 1 and a_perekayasa in (0,1)),
   a_pranata_1          numeric(1)           not null default 0
      constraint ckc_a_pranata_1_jenis_sd check (a_pranata_1 between 0 and 1 and a_pranata_1 in (0,1)),
   a_pranata_2          numeric(1)           not null default 0
      constraint ckc_a_pranata_2_jenis_sd check (a_pranata_2 between 0 and 1 and a_pranata_2 in (0,1)),
   a_pranata_3          numeric(1)           not null default 0
      constraint ckc_a_pranata_3_jenis_sd check (a_pranata_3 between 0 and 1 and a_pranata_3 in (0,1)),
   a_pranata_4          numeric(1)           not null default 0
      constraint ckc_a_pranata_4_jenis_sd check (a_pranata_4 between 0 and 1 and a_pranata_4 in (0,1)),
   a_pranata_5          numeric(1)           not null default 0
      constraint ckc_a_pranata_5_jenis_sd check (a_pranata_5 between 0 and 1 and a_pranata_5 in (0,1)),
   a_pranata_6          numeric(1)           not null default 0
      constraint ckc_a_pranata_6_jenis_sd check (a_pranata_6 between 0 and 1 and a_pranata_6 in (0,1)),
   a_pranata_7          numeric(1)           not null default 0
      constraint ckc_a_pranata_7_jenis_sd check (a_pranata_7 between 0 and 1 and a_pranata_7 in (0,1)),
   a_pranata_8          numeric(1)           not null default 0
      constraint ckc_a_pranata_8_jenis_sd check (a_pranata_8 between 0 and 1 and a_pranata_8 in (0,1)),
   a_pranata_9          numeric(1)           not null default 0
      constraint ckc_a_pranata_9_jenis_sd check (a_pranata_9 between 0 and 1 and a_pranata_9 in (0,1)),
   constraint pk_jenis_sdm primary key (id_jns_sdm)
);

comment on table jenis_sdm is
'Klasifikasi macam pendidik dan tenaga kependidikan berdasarkan tugas dan fungsinya.';

/*==============================================================*/
/* Index: jenis_sdm_pk                                          */
/*==============================================================*/
create unique index jenis_sdm_pk on jenis_sdm (
id_jns_sdm
);

/*==============================================================*/
/* Table: jenis_sert                                            */
/*==============================================================*/
create table jenis_sert (
   id_jns_sert          numeric(3)           not null,
   nm_jns_sert          varchar(50)          not null,
   u_prof_guru          numeric(1)           not null default 0
      constraint ckc_u_prof_guru_jenis_se check (u_prof_guru between 0 and 1 and u_prof_guru in (0,1)),
   u_kepsek             numeric(1)           not null default 0
      constraint ckc_u_kepsek_jenis_se check (u_kepsek between 0 and 1 and u_kepsek in (0,1)),
   u_laboran            numeric(1)           not null default 0
      constraint ckc_u_laboran_jenis_se check (u_laboran between 0 and 1 and u_laboran in (0,1)),
   u_prof_dosen         numeric(1)           not null default 0
      constraint ckc_u_prof_dosen_jenis_se check (u_prof_dosen between 0 and 1 and u_prof_dosen in (0,1)),
   u_lembaga            numeric(1)           null default 0
      constraint ckc_u_lembaga_jenis_se check (u_lembaga is null or (u_lembaga between 0 and 1 and u_lembaga in (0,1))),
   constraint pk_jenis_sert primary key (id_jns_sert)
);

comment on table jenis_sert is
'Klasifikasi macam sertifikasi atau pengakuan atas kemampuan atau keahlian.';

/*==============================================================*/
/* Index: jenis_sert_pk                                         */
/*==============================================================*/
create unique index jenis_sert_pk on jenis_sert (
id_jns_sert
);

/*==============================================================*/
/* Table: jenis_sms                                             */
/*==============================================================*/
create table jenis_sms (
   id_jns_sms           numeric(2)           not null,
   nm_jns_sms           varchar(50)          not null,
   constraint pk_jenis_sms primary key (id_jns_sms)
);

comment on table jenis_sms is
'Klasifikasi macam satuan manajemen dan sumber daya. Jenis SMS dapat meliputi direktorat, fakultas, jurusan, program studi, laboratorium, dll.
1	Fakultas
2	Jurusan
3	Program Studi
4	Laboratorium
5	UPT
6	Penyelenggara MKU
7	Rektorat
8	Unit Kerja';

/*==============================================================*/
/* Index: jenis_sms_pk                                          */
/*==============================================================*/
create unique index jenis_sms_pk on jenis_sms (
id_jns_sms
);

/*==============================================================*/
/* Table: jenis_subst                                           */
/*==============================================================*/
create table jenis_subst (
   id_jns_subst         char(5)              not null,
   nm_jns_subst         varchar(50)          not null,
   constraint pk_jenis_subst primary key (id_jns_subst)
);

comment on table jenis_subst is
'Klasifikasi macam substansi mata kuliah.
(strategi pembelajaran yang diterapkan oleh pendidik pada suatu perkuliahan sebagai contoh: tutorial, diskusi, skill lab, ketrampilan medik, praktikum, modul)';

/*==============================================================*/
/* Index: jenis_subst_pk                                        */
/*==============================================================*/
create unique index jenis_subst_pk on jenis_subst (
id_jns_subst
);

/*==============================================================*/
/* Table: jenis_tes                                             */
/*==============================================================*/
create table jenis_tes (
   id_jns_tes           numeric(3)           not null,
   nm_jns_tes           varchar(50)          not null,
   ket                  varchar(250)         null,
   nilai_maks           numeric(6,2)         not null,
   constraint pk_jenis_tes primary key (id_jns_tes)
);

comment on table jenis_tes is
'Klasifikasi macam ujian untuk mengukur kemampuan dalam bidang tertentu.';

/*==============================================================*/
/* Index: jenis_tes_pk                                          */
/*==============================================================*/
create unique index jenis_tes_pk on jenis_tes (
id_jns_tes
);

/*==============================================================*/
/* Table: jenis_tinggal                                         */
/*==============================================================*/
create table jenis_tinggal (
   id_jns_tinggal       numeric(2)           not null,
   nm_jns_tinggal       varchar(50)          not null,
   constraint pk_jenis_tinggal primary key (id_jns_tinggal)
);

/*==============================================================*/
/* Index: jenis_tinggal_pk                                      */
/*==============================================================*/
create unique index jenis_tinggal_pk on jenis_tinggal (
id_jns_tinggal
);

/*==============================================================*/
/* Table: jenjang_pendidikan                                    */
/*==============================================================*/
create table jenjang_pendidikan (
   id_jenj_didik        numeric(2)           not null,
   id_anak              uuid                 not null,
   id_rwy_didik_formal  uuid                 not null,
   nm_jenj_didik        varchar(50)          not null,
   u_jenj_lemb          numeric(1)           not null default 0
      constraint ckc_u_jenj_lemb_jenjang_ check (u_jenj_lemb between 0 and 1 and u_jenj_lemb in (0,1)),
   u_jenj_org           numeric(1)           not null default 0
      constraint ckc_u_jenj_org_jenjang_ check (u_jenj_org between 0 and 1 and u_jenj_org in (0,1)),
   constraint pk_jenjang_pendidikan primary key (id_jenj_didik)
);

comment on table jenjang_pendidikan is
'Tahapan pendidikan yang ditetapkan berdasarkan tingkat perkembangan peserta didik, tujuan yang akan dicapai, dan kemampuan yang dikembangkan. Contoh jenjang pendidikan adalah taman kanak-kanak, sekolah dasar, sekolah menengah pertama, S1, S2, S3, dll.';

/*==============================================================*/
/* Index: jenjang_pendidikan_pk                                 */
/*==============================================================*/
create unique index jenjang_pendidikan_pk on jenjang_pendidikan (
id_jenj_didik
);

/*==============================================================*/
/* Index: rwyt_pend_formal_jenjang_fk                           */
/*==============================================================*/
create  index rwyt_pend_formal_jenjang_fk on jenjang_pendidikan (
id_rwy_didik_formal
);

/*==============================================================*/
/* Index: jenjang_anak_fk                                       */
/*==============================================================*/
create  index jenjang_anak_fk on jenjang_pendidikan (
id_anak
);

/*==============================================================*/
/* Table: jurusan                                               */
/*==============================================================*/
create table jurusan (
   id_jur               varchar(25)          not null,
   induk_program_id_jur varchar(25)          null,
   id_jenj_didik        numeric(2)           not null,
   id_kel_bidang        uuid                 not null,
   nm_jur               varchar(100)         not null,
   nm_intl_jur          varchar(100)         null,
   u_sma                numeric(1)           not null default 0
      constraint ckc_u_sma_jurusan check (u_sma between 0 and 1 and u_sma in (0,1)),
   u_smk                numeric(1)           not null default 0
      constraint ckc_u_smk_jurusan check (u_smk between 0 and 1 and u_smk in (0,1)),
   u_pt                 numeric(1)           not null default 0
      constraint ckc_u_pt_jurusan check (u_pt between 0 and 1 and u_pt in (0,1)),
   u_slb                numeric(1)           not null default 0
      constraint ckc_u_slb_jurusan check (u_slb between 0 and 1 and u_slb in (0,1)),
   constraint pk_jurusan primary key (id_jur)
);

comment on table jurusan is
'Referensi jurusan / prodi standar sesuai nomenklatur untuk diacu oleh prodi di PT atau bidang peminatan di SMA atau paket keahlian di SMK. Referensi ini merupakan kategori untuk variasi prodi/bidang peminatan/paket keahlian yang mungkin akan ada.';

/*==============================================================*/
/* Index: jurusan_pk                                            */
/*==============================================================*/
create unique index jurusan_pk on jurusan (
id_jur
);

/*==============================================================*/
/* Index: induk_program_fk                                      */
/*==============================================================*/
create  index induk_program_fk on jurusan (
induk_program_id_jur
);

/*==============================================================*/
/* Index: bid_jur_fk                                            */
/*==============================================================*/
create  index bid_jur_fk on jurusan (
id_kel_bidang
);

/*==============================================================*/
/* Index: jur_std_jenjang_fk                                    */
/*==============================================================*/
create  index jur_std_jenjang_fk on jurusan (
id_jenj_didik
);

/*==============================================================*/
/* Table: kategori_kegiatan                                     */
/*==============================================================*/
create table kategori_kegiatan (
   id_katgiat           int4                 not null,
   kode_kat_pak         varchar(16)          null,
   kode_kat_bkd         varchar(16)          null,
   nm_kat               varchar(300)         not null,
   kat_unsur            char(1)              null,
   teks_judul           varchar(30)          null,
   teks_sk              varchar(30)          null,
   teks_tgl_sk          varchar(30)          null,
   teks_lokasi          varchar(30)          null,
   level_kat            numeric(1)           not null
      constraint ckc_level_kat_kategori check (level_kat in (1,2,3)),
   sks_bkd              numeric(7,2)         null,
   ak                   numeric(7,2)         null,
   ak_maks              numeric(7,2)         null,
   satuan_nilai         char(1)              null default '2'
      constraint ckc_satuan_nilai_kategori check (satuan_nilai is null or (satuan_nilai in ('1','2','3','4','5','6'))),
   ket                  varchar(250)         null,
   a_aktif              numeric(1)           not null default 0
      constraint ckc_a_aktif_kategori check (a_aktif between 0 and 1 and a_aktif in (0,1)),
   a_anak_bimb          numeric(1)           not null default 0
      constraint ckc_a_anak_bimb_kategori check (a_anak_bimb between 0 and 1 and a_anak_bimb in (0,1)),
   a_judul              numeric(1)           not null default 0
      constraint ckc_a_judul_kategori check (a_judul between 0 and 1 and a_judul in (0,1)),
   a_sk                 numeric(1)           not null default 0
      constraint ckc_a_sk_kategori check (a_sk between 0 and 1 and a_sk in (0,1)),
   a_peer_review        numeric(1)           not null default 0
      constraint ckc_a_peer_review_kategori check (a_peer_review between 0 and 1 and a_peer_review in (0,1)),
   acuan_waktu          char(1)              not null
      constraint ckc_acuan_waktu_kategori check (acuan_waktu in ('1','2','3','4')),
   u_bkd                numeric(1)           not null default 0
      constraint ckc_u_bkd_kategori check (u_bkd between 0 and 1 and u_bkd in (0,1)),
   u_pak                numeric(1)           not null default 0
      constraint ckc_u_pak_kategori check (u_pak between 0 and 1 and u_pak in (0,1)),
   constraint pk_kategori_kegiatan primary key (id_katgiat)
);

comment on table kategori_kegiatan is
'Kategori seluruh kegiatan/aktivitas PTK berdasarkan Permenpan 17/2003.';

/*==============================================================*/
/* Index: kategori_kegiatan_pk                                  */
/*==============================================================*/
create unique index kategori_kegiatan_pk on kategori_kegiatan (
id_katgiat
);

/*==============================================================*/
/* Table: keahlian_lab                                          */
/*==============================================================*/
create table keahlian_lab (
   id_keahlian_lab      int2                 not null,
   nm_keahlian_lab      varchar(50)          not null,
   constraint pk_keahlian_lab primary key (id_keahlian_lab)
);

/*==============================================================*/
/* Index: keahlian_lab_pk                                       */
/*==============================================================*/
create unique index keahlian_lab_pk on keahlian_lab (
id_keahlian_lab
);

/*==============================================================*/
/* Table: keaktifan_ptk                                         */
/*==============================================================*/
create table keaktifan_ptk (
   id_reg_ptk           uuid                 not null,
   id_thn_ajaran        numeric(4)           not null,
   a_sp_homebase        numeric(1)           not null default 0
      constraint ckc_a_sp_homebase_keaktifa check (a_sp_homebase between 0 and 1 and a_sp_homebase in (0,1)),
   a_aktif_bln_1        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_1_keaktifa check (a_aktif_bln_1 between 0 and 1 and a_aktif_bln_1 in (0,1)),
   a_aktif_bln_2        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_2_keaktifa check (a_aktif_bln_2 between 0 and 1 and a_aktif_bln_2 in (0,1)),
   a_aktif_bln_3        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_3_keaktifa check (a_aktif_bln_3 between 0 and 1 and a_aktif_bln_3 in (0,1)),
   a_aktif_bln_4        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_4_keaktifa check (a_aktif_bln_4 between 0 and 1 and a_aktif_bln_4 in (0,1)),
   a_aktif_bln_5        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_5_keaktifa check (a_aktif_bln_5 between 0 and 1 and a_aktif_bln_5 in (0,1)),
   a_aktif_bln_6        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_6_keaktifa check (a_aktif_bln_6 between 0 and 1 and a_aktif_bln_6 in (0,1)),
   a_aktif_bln_7        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_7_keaktifa check (a_aktif_bln_7 between 0 and 1 and a_aktif_bln_7 in (0,1)),
   a_aktif_bln_8        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_8_keaktifa check (a_aktif_bln_8 between 0 and 1 and a_aktif_bln_8 in (0,1)),
   a_aktif_bln_9        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_9_keaktifa check (a_aktif_bln_9 between 0 and 1 and a_aktif_bln_9 in (0,1)),
   a_aktif_bln_10       numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_10_keaktifa check (a_aktif_bln_10 between 0 and 1 and a_aktif_bln_10 in (0,1)),
   a_aktif_bln_11       numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_11_keaktifa check (a_aktif_bln_11 between 0 and 1 and a_aktif_bln_11 in (0,1)),
   a_aktif_bln_12       numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_12_keaktifa check (a_aktif_bln_12 between 0 and 1 and a_aktif_bln_12 in (0,1)),
   constraint pk_keaktifan_ptk primary key (id_reg_ptk, id_thn_ajaran)
);

comment on table keaktifan_ptk is
'Catatan keaktifan seorang PTK di suatu satuan pendidikan setiap periode tahun ajaran.';

/*==============================================================*/
/* Index: keaktifan_ptk_pk                                      */
/*==============================================================*/
create unique index keaktifan_ptk_pk on keaktifan_ptk (
id_reg_ptk,
id_thn_ajaran
);

/*==============================================================*/
/* Index: long_reg_ptk_fk                                       */
/*==============================================================*/
create  index long_reg_ptk_fk on keaktifan_ptk (
id_reg_ptk
);

/*==============================================================*/
/* Index: tahun_keaktifan_fk                                    */
/*==============================================================*/
create  index tahun_keaktifan_fk on keaktifan_ptk (
id_thn_ajaran
);

/*==============================================================*/
/* Table: kebutuhan_khusus                                      */
/*==============================================================*/
create table kebutuhan_khusus (
   id_kk                int4                 not null,
   nm_kk                varchar(50)          not null,
   constraint pk_kebutuhan_khusus primary key (id_kk)
);

/*==============================================================*/
/* Index: kebutuhan_khusus_pk                                   */
/*==============================================================*/
create unique index kebutuhan_khusus_pk on kebutuhan_khusus (
id_kk
);

/*==============================================================*/
/* Table: kelas_kuliah                                          */
/*==============================================================*/
create table kelas_kuliah (
   id_kls               uuid                 not null,
   id_smt               char(5)              not null,
   id_sms               uuid                 not null,
   id_mk                uuid                 not null,
   sks_mk               numeric(5,2)         null,
   sks_tm               numeric(5,2)         null,
   sks_prak             numeric(5,2)         null,
   sks_prak_lap         numeric(5,2)         null,
   sks_sim              numeric(5,2)         null,
   nm_kls               varchar(5)           not null,
   bahasan_case         varchar(200)         null,
   a_selenggara_pditt   numeric(1)           not null default 0
      constraint ckc_a_selenggara_pdit_kelas_ku check (a_selenggara_pditt between 0 and 1 and a_selenggara_pditt in (0,1)),
   a_pengguna_pditt     numeric(1)           not null default 0
      constraint ckc_a_pengguna_pditt_kelas_ku check (a_pengguna_pditt between 0 and 1 and a_pengguna_pditt in (0,1)),
   kuota_pditt          numeric(4)           not null default 0,
   constraint pk_kelas_kuliah primary key (id_kls)
);

comment on table kelas_kuliah is
'Kelas-kelas perkuliahan yang ditawarkan dan dilakukan pada program studi.
Untuk kelas daring (online), di PT pengguna daring di-create-kan recordnya, kemudian id_kls_pditt diisi dengan pilihan dari kelas PDITT yang ditawarkan.
Bagi penyelenggara kuliah daring, menandai a_pditt_selenggara = 1 sebagai usulan untuk disahkan Dit. Belmawa Dikti. Begitu disahkan, record kelas_kuliah ini di-copy ke dalam entitas kelas_pditt (di-publish secara nasional).';

/*==============================================================*/
/* Index: kelas_kuliah_pk                                       */
/*==============================================================*/
create unique index kelas_kuliah_pk on kelas_kuliah (
id_kls
);

/*==============================================================*/
/* Index: kelas_matakuliah_fk                                   */
/*==============================================================*/
create  index kelas_matakuliah_fk on kelas_kuliah (
id_mk
);

/*==============================================================*/
/* Index: prodi_kelas_kuliah_fk                                 */
/*==============================================================*/
create  index prodi_kelas_kuliah_fk on kelas_kuliah (
id_sms
);

/*==============================================================*/
/* Index: smt_kelas_fk                                          */
/*==============================================================*/
create  index smt_kelas_fk on kelas_kuliah (
id_smt
);

/*==============================================================*/
/* Table: kelompok_bidang                                       */
/*==============================================================*/
create table kelompok_bidang (
   id_kel_bidang        uuid                 not null,
   induk_kelompok_id_kel_bidang uuid                 null,
   kode_kel_bidang      varchar(20)          not null,
   nm_kel_bidang        varchar(120)         not null,
   u_sma                numeric(1)           not null default 0
      constraint ckc_u_sma_kelompok check (u_sma between 0 and 1 and u_sma in (0,1)),
   u_smk                numeric(1)           not null default 0
      constraint ckc_u_smk_kelompok check (u_smk between 0 and 1 and u_smk in (0,1)),
   u_pt                 numeric(1)           not null default 0
      constraint ckc_u_pt_kelompok check (u_pt between 0 and 1 and u_pt in (0,1)),
   u_iptek              numeric(1)           not null default 0
      constraint ckc_u_iptek_kelompok check (u_iptek between 0 and 1 and u_iptek in (0,1)),
   u_kepakaran          numeric(1)           not null default 0
      constraint ckc_u_kepakaran_kelompok check (u_kepakaran between 0 and 1 and u_kepakaran in (0,1)),
   kat_kel              varchar(3)           null,
   ket_kel_bidang       varchar(200)         null,
   a_leaf_node          numeric(1)           not null default 0
      constraint ckc_a_leaf_node_kelompok check (a_leaf_node between 0 and 1 and a_leaf_node in (0,1)),
   constraint pk_kelompok_bidang primary key (id_kel_bidang)
);

comment on table kelompok_bidang is
'Pengelompokan bidang keilmuan yang mewadahi spektrum keilmuan, program studi, dan jurusan. Struktur pembidangan KKNI menempati tabel ini.';

/*==============================================================*/
/* Index: kelompok_bidang_pk                                    */
/*==============================================================*/
create unique index kelompok_bidang_pk on kelompok_bidang (
id_kel_bidang
);

/*==============================================================*/
/* Index: induk_kelompok_fk                                     */
/*==============================================================*/
create  index induk_kelompok_fk on kelompok_bidang (
induk_kelompok_id_kel_bidang
);

/*==============================================================*/
/* Table: kelompok_usaha                                        */
/*==============================================================*/
create table kelompok_usaha (
   id_kel_usaha         char(8)              not null,
   nm_kel_usaha         varchar(60)          not null,
   constraint pk_kelompok_usaha primary key (id_kel_usaha)
);

/*==============================================================*/
/* Index: kelompok_usaha_pk                                     */
/*==============================================================*/
create unique index kelompok_usaha_pk on kelompok_usaha (
id_kel_usaha
);

/*==============================================================*/
/* Table: kuliah_mhs                                            */
/*==============================================================*/
create table kuliah_mhs (
   id_smt               char(5)              not null,
   id_reg_pd            uuid                 not null,
   id_stat_mhs          char(1)              not null,
   ips                  numeric(7,4)         null,
   sks_semester         numeric(5,2)         null,
   ipk                  numeric(5,2)         null,
   total_sks            numeric(5,2)         null,
   biaya_smt            numeric(16,2)        null,
   constraint pk_kuliah_mhs primary key (id_reg_pd, id_smt)
);

/*==============================================================*/
/* Index: keaktifan_pd_pk                                       */
/*==============================================================*/
create unique index keaktifan_pd_pk on kuliah_mhs (
id_reg_pd,
id_smt
);

/*==============================================================*/
/* Index: status_mhs_per_smt_fk                                 */
/*==============================================================*/
create  index status_mhs_per_smt_fk on kuliah_mhs (
id_stat_mhs
);

/*==============================================================*/
/* Index: register_mhs_per_smt_fk                               */
/*==============================================================*/
create  index register_mhs_per_smt_fk on kuliah_mhs (
id_reg_pd
);

/*==============================================================*/
/* Index: keaktifan_per_smt_fk                                  */
/*==============================================================*/
create  index keaktifan_per_smt_fk on kuliah_mhs (
id_smt
);

/*==============================================================*/
/* Table: kurikulum_sp                                          */
/*==============================================================*/
create table kurikulum_sp (
   id_kurikulum_sp      uuid                 not null,
   id_jenj_didik        numeric(2)           not null,
   nm_kurikulum_sp      varchar(100)         not null,
   jmlh_smt_normal      numeric(2)           null,
   a_digunakan          numeric(1)           not null default 0
      constraint ckc_a_digunakan_kurikulu check (a_digunakan between 0 and 1 and a_digunakan in (0,1)),
   jmlh_sks_lulus       numeric(5,2)         null,
   jmlh_sks_wajib       numeric(5,2)         null,
   jmlh_sks_pilihan     numeric(5,2)         null,
   constraint pk_kurikulum_sp primary key (id_kurikulum_sp)
);

/*==============================================================*/
/* Index: kurikulum_sp_pk                                       */
/*==============================================================*/
create unique index kurikulum_sp_pk on kurikulum_sp (
id_kurikulum_sp
);

/*==============================================================*/
/* Index: jenjang_kurikulum_fk                                  */
/*==============================================================*/
create  index jenjang_kurikulum_fk on kurikulum_sp (
id_jenj_didik
);

/*==============================================================*/
/* Table: large_object                                          */
/*==============================================================*/
create table large_object (
   id_blob              uuid                 not null,
   blob_content         bytea                not null,
   file_name            varchar(500)         null,
   mime_type            varchar(100)         null,
   constraint pk_large_object primary key (id_blob)
);

/*==============================================================*/
/* Index: large_object_pk                                       */
/*==============================================================*/
create unique index large_object_pk on large_object (
id_blob
);

/*==============================================================*/
/* Table: lembaga_akred                                         */
/*==============================================================*/
create table lembaga_akred (
   id_lemb_akred        char(5)              not null,
   kd_kl                char(3)              null,
   kd_satker            varchar(20)          null,
   tgl_mulai_beroperasi date                 not null,
   ket                  varchar(250)         null,
   target_akred         char(1)              not null default 'P'
      constraint ckc_target_akred_lembaga_ check (target_akred in ('P','K') and target_akred = upper(target_akred)),
   constraint pk_lembaga_akred primary key (id_lemb_akred)
);

comment on table lembaga_akred is
'Badan yang berwenang untuk melakukan kegiatan akreditasi dan memberikan pengakuan terhadap hasil akreditasi.';

/*==============================================================*/
/* Index: lembaga_akred_pk                                      */
/*==============================================================*/
create unique index lembaga_akred_pk on lembaga_akred (
id_lemb_akred
);

/*==============================================================*/
/* Table: lembaga_non_sp                                        */
/*==============================================================*/
create table lembaga_non_sp (
   id_lemb_non_sp       uuid                 not null,
   id_induk_lemb_non_sp uuid                 null,
   id_wil               char(8)              not null,
   id_jns_lemb          numeric(5)           not null,
   nm_lemb              varchar(100)         not null,
   lintang              numeric(11,7)        null,
   bujur                numeric(11,7)        null,
   no_tel               varchar(20)          null,
   no_fax               varchar(20)          null,
   email                varchar(60)          null,
   website              varchar(256)         null,
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          null,
   kode_pos             char(5)              null,
   kd_kl                char(3)              null,
   kd_satker            varchar(20)          null,
   singkatan            varchar(50)          null,
   deskripsi            varchar(100)         null,
   level_lemb           numeric(2)           not null,
   tgl_mulai_efektif    date                 null,
   tgl_akhir_efektif    date                 null,
   constraint pk_lembaga_non_sp primary key (id_lemb_non_sp)
);

/*==============================================================*/
/* Index: lembaga_non_sp_pk                                     */
/*==============================================================*/
create unique index lembaga_non_sp_pk on lembaga_non_sp (
id_lemb_non_sp
);

/*==============================================================*/
/* Index: induk_lembaga_non_sp_fk                               */
/*==============================================================*/
create  index induk_lembaga_non_sp_fk on lembaga_non_sp (
id_induk_lemb_non_sp
);

/*==============================================================*/
/* Index: jenis_lembaga_non_sp_fk                               */
/*==============================================================*/
create  index jenis_lembaga_non_sp_fk on lembaga_non_sp (
id_jns_lemb
);

/*==============================================================*/
/* Index: wilayah_lemb_non_sp_fk                                */
/*==============================================================*/
create  index wilayah_lemb_non_sp_fk on lembaga_non_sp (
id_wil
);

/*==============================================================*/
/* Table: lembaga_pengangkat                                    */
/*==============================================================*/
create table lembaga_pengangkat (
   id_lemb_angkat       numeric(2)           not null,
   nm_lemb_angkat       varchar(100)         not null,
   constraint pk_lembaga_pengangkat primary key (id_lemb_angkat)
);

/*==============================================================*/
/* Index: lembaga_pengangkat_pk                                 */
/*==============================================================*/
create unique index lembaga_pengangkat_pk on lembaga_pengangkat (
id_lemb_angkat
);

/*==============================================================*/
/* Table: matkul                                                */
/*==============================================================*/
create table matkul (
   id_mk                uuid                 not null,
   id_sms               uuid                 null,
   id_jenj_didik        numeric(2)           not null,
   sks_mk               numeric(5,2)         null,
   sks_tm               numeric(5,2)         null,
   sks_prak             numeric(5,2)         null,
   sks_prak_lap         numeric(5,2)         null,
   sks_sim              numeric(5,2)         null,
   kode_mk              varchar(20)          not null,
   nm_mk                varchar(120)         null,
   jns_mk               char(1)              null,
   kel_mk               char(1)              null,
   metode_pelaksanaan_kuliah varchar(50)          null,
   a_sap                numeric(1)           null default 0
      constraint ckc_a_sap_matkul check (a_sap is null or (a_sap between 0 and 1 and a_sap in (0,1))),
   a_silabus            numeric(1)           null default 0
      constraint ckc_a_silabus_matkul check (a_silabus is null or (a_silabus between 0 and 1 and a_silabus in (0,1))),
   a_bahan_ajar         numeric(1)           null default 0
      constraint ckc_a_bahan_ajar_matkul check (a_bahan_ajar is null or (a_bahan_ajar between 0 and 1 and a_bahan_ajar in (0,1))),
   acara_prak           numeric(1)           null,
   a_diktat             numeric(1)           null default 0
      constraint ckc_a_diktat_matkul check (a_diktat is null or (a_diktat between 0 and 1 and a_diktat in (0,1))),
   tgl_mulai_efektif    date                 null,
   tgl_akhir_efektif    date                 null,
   constraint pk_matkul primary key (id_mk)
);

/*==============================================================*/
/* Index: matkul_pk                                             */
/*==============================================================*/
create unique index matkul_pk on matkul (
id_mk
);

/*==============================================================*/
/* Index: prodi_matkul_fk                                       */
/*==============================================================*/
create  index prodi_matkul_fk on matkul (
id_sms
);

/*==============================================================*/
/* Index: jenjang_pendidikan_matkul_fk                          */
/*==============================================================*/
create  index jenjang_pendidikan_matkul_fk on matkul (
id_jenj_didik
);

/*==============================================================*/
/* Table: matkul_kurikulum                                      */
/*==============================================================*/
create table matkul_kurikulum (
   id_kurikulum_sp      uuid                 not null,
   id_mk                uuid                 not null,
   smt                  numeric(2)           null,
   sks_mk               numeric(5,2)         null,
   sks_tm               numeric(5,2)         null,
   sks_prak             numeric(5,2)         null,
   sks_prak_lap         numeric(5,2)         null,
   sks_sim              numeric(5,2)         null,
   a_wajib              numeric(1)           null default 0
      constraint ckc_a_wajib_matkul_k check (a_wajib is null or (a_wajib between 0 and 1 and a_wajib in (0,1))),
   constraint pk_matkul_kurikulum primary key (id_kurikulum_sp)
);

/*==============================================================*/
/* Index: matkul_kurikulum_pk                                   */
/*==============================================================*/
create unique index matkul_kurikulum_pk on matkul_kurikulum (
id_kurikulum_sp
);

/*==============================================================*/
/* Index: detail_matkul_fk                                      */
/*==============================================================*/
create  index detail_matkul_fk on matkul_kurikulum (
id_mk
);

/*==============================================================*/
/* Table: negara                                                */
/*==============================================================*/
create table negara (
   id_negara            char(2)              not null,
   nm_negara            varchar(50)          not null,
   a_ln                 numeric(1)           not null default 0
      constraint ckc_a_ln_negara check (a_ln between 0 and 1 and a_ln in (0,1)),
   benua                numeric(1)           not null
      constraint ckc_benua_negara check (benua in (1,2,3,4,5,6)),
   constraint pk_negara primary key (id_negara)
);

comment on table negara is
'Lingkup wilayah yang memiliki rakyat dan pemerintahannya sendiri';

/*==============================================================*/
/* Index: negara_pk                                             */
/*==============================================================*/
create unique index negara_pk on negara (
id_negara
);

/*==============================================================*/
/* Table: nilai_akred                                           */
/*==============================================================*/
create table nilai_akred (
   id_akred             numeric(1)           not null,
   nm_akred             varchar(50)          not null,
   constraint pk_nilai_akred primary key (id_akred)
);

comment on table nilai_akred is
'Referensi nilai / kisaran mutu program atau satuan pendidikan atau unit usaha / upaya kesehatan sebagai hasil akreditasi. Penilai akreditasi, Badan Akreditasi Nasional (BAN) maupun Lembaga Akreditasi Mandiri (LAM) harus memakai kisaran nilai yang sama.';

/*==============================================================*/
/* Index: nilai_akred_pk                                        */
/*==============================================================*/
create unique index nilai_akred_pk on nilai_akred (
id_akred
);

/*==============================================================*/
/* Table: nilai_smt_mhs                                         */
/*==============================================================*/
create table nilai_smt_mhs (
   id_reg_ptk           uuid                 not null,
   id_kls               uuid                 not null,
   nilai_angka          numeric(4,1)         null,
   nilai_huruf          char(3)              null,
   nilai_indeks         numeric(4,2)         null
);

/*==============================================================*/
/* Index: reg_nilai_smt_mhs_fk                                  */
/*==============================================================*/
create  index reg_nilai_smt_mhs_fk on nilai_smt_mhs (
id_reg_ptk
);

/*==============================================================*/
/* Index: kls_nilai_mhs_smt_fk                                  */
/*==============================================================*/
create  index kls_nilai_mhs_smt_fk on nilai_smt_mhs (
id_kls
);

/*==============================================================*/
/* Table: nilai_tes                                             */
/*==============================================================*/
create table nilai_tes (
   id_nilai_tes         uuid                 not null,
   id_jns_tes           numeric(3)           not null,
   nm_nilai_tes         varchar(50)          not null,
   penyelenggara        varchar(100)         not null,
   thn                  numeric(4)           not null,
   skor                 numeric(6,2)         not null,
   tgl_tes              date                 null,
   constraint pk_nilai_tes primary key (id_nilai_tes)
);

comment on table nilai_tes is
'Hasil ujian dalam bentuk kuantitatif untuk mengukur kemampuan dalam bidang tertentu.';

/*==============================================================*/
/* Index: nilai_tes_pk                                          */
/*==============================================================*/
create unique index nilai_tes_pk on nilai_tes (
id_nilai_tes
);

/*==============================================================*/
/* Index: test_jenis_fk                                         */
/*==============================================================*/
create  index test_jenis_fk on nilai_tes (
id_jns_tes
);

/*==============================================================*/
/* Table: pangkat_golongan                                      */
/*==============================================================*/
create table pangkat_golongan (
   id_pangkat_gol       numeric(2)           not null,
   kode_gol             varchar(5)           not null,
   nm_pangkat           varchar(50)          not null,
   constraint pk_pangkat_golongan primary key (id_pangkat_gol)
);

comment on table pangkat_golongan is
'Kedudukan yang menunjukkan tingkatan seorang pegawai negeri sipil.';

/*==============================================================*/
/* Index: pangkat_golongan_pk                                   */
/*==============================================================*/
create unique index pangkat_golongan_pk on pangkat_golongan (
id_pangkat_gol
);

/*==============================================================*/
/* Table: pekerjaan                                             */
/*==============================================================*/
create table pekerjaan (
   id_pekerjaan         int4                 not null,
   nm_pekerjaan         varchar(50)          not null,
   constraint pk_pekerjaan primary key (id_pekerjaan)
);

/*==============================================================*/
/* Index: pekerjaan_pk                                          */
/*==============================================================*/
create unique index pekerjaan_pk on pekerjaan (
id_pekerjaan
);

/*==============================================================*/
/* Table: pembiayaan                                            */
/*==============================================================*/
create table ref.pembiayaan (
   id_pembiayaan        numeric(2)           not null,
   nm_pembiayaan        varchar(40)          not null,
   constraint pk_pembiayaan primary key (id_pembiayaan)
);

/*==============================================================*/
/* Index: pembiayaan_pk                                         */
/*==============================================================*/
create unique index pembiayaan_pk on ref.pembiayaan (
id_pembiayaan
);

/*==============================================================*/
/* Table: penghasilan                                           */
/*==============================================================*/
create table penghasilan (
   id_penghasilan       int4                 not null,
   nm_penghasilan       varchar(50)          not null,
   constraint pk_penghasilan primary key (id_penghasilan)
);

/*==============================================================*/
/* Index: penghasilan_pk                                        */
/*==============================================================*/
create unique index penghasilan_pk on penghasilan (
id_penghasilan
);

/*==============================================================*/
/* Table: peserta_didik                                         */
/*==============================================================*/
create table peserta_didik (
   id_pd                uuid                 not null,
   nm_pd                varchar(120)         not null,
   jk                   char(1)              null
      constraint ckc_jk_peserta_ check (jk is null or (jk in ('L','P','*'))),
   nisn                 char(10)             null,
   nik                  char(20)             null,
   tmpt_lahir           varchar(32)          not null,
   tgl_lahir            date                 null,
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          null,
   kode_pos             char(5)              null,
   tlpn_rumah           varchar(20)          null,
   tlpn_hp              varchar(20)          null,
   nm_wali              varchar(100)         null,
   tgl_lahir_wali       date                 null,
   id_pekerjaan_wali    int4                 null,
   id_penghasilan_wali  int4                 null,
   id_pendidikan_wali   numeric(2)           null,
   nm_ibu_kandung       varchar(100)         null,
   tgl_lahir_ibu        date                 null,
   nik_ibu              char(20)             null,
   id_pekerjaan_ibu     int4                 null,
   id_penghasilan_ibu   int4                 null,
   id_pendidikan_ibu    numeric(2)           null,
   id_kk_ibu            int4                 null,
   nm_ayah              varchar(100)         null,
   tgl_lahir_ayah       date                 null,
   nik_ayah             char(20)             null,
   id_penghasilan_ayah  int4                 null,
   id_pekerjaan_ayah    int4                 null,
   id_pendidikan_ayah   numeric(2)           null,
   id_kk_ayah           int4                 null,
   a_terima_kps         numeric(1)           not null default 0
      constraint ckc_a_terima_kps_peserta_ check (a_terima_kps between 0 and 1 and a_terima_kps in (0,1)),
   no_kps               varchar(40)          null,
   id_blob              uuid                 null,
   id_kk                int4                 null,
   id_alat_transport    numeric(2)           null,
   id_kewarganegaraan   char(2)              not null,
   id_agama             int2                 not null,
   id_jns_tinggal       numeric(2)           null,
   id_wil               char(8)              null,
   id_stat_mhs          char(1)              not null,
   constraint pk_peserta_didik primary key (id_pd)
);

/*==============================================================*/
/* Index: peserta_didik_pk                                      */
/*==============================================================*/
create unique index peserta_didik_pk on peserta_didik (
id_pd
);

/*==============================================================*/
/* Index: status_keaktifan_mhs_fk                               */
/*==============================================================*/
create  index status_keaktifan_mhs_fk on peserta_didik (
id_stat_mhs
);

/*==============================================================*/
/* Index: kebutuhan_khusus_pd_fk                                */
/*==============================================================*/
create  index kebutuhan_khusus_pd_fk on peserta_didik (
id_kk
);

/*==============================================================*/
/* Index: jenis_tinggal_pd_fk                                   */
/*==============================================================*/
create  index jenis_tinggal_pd_fk on peserta_didik (
id_jns_tinggal
);

/*==============================================================*/
/* Index: alat_transport_pd_fk                                  */
/*==============================================================*/
create  index alat_transport_pd_fk on peserta_didik (
id_alat_transport
);

/*==============================================================*/
/* Index: kewarganegaraan_pd_fk                                 */
/*==============================================================*/
create  index kewarganegaraan_pd_fk on peserta_didik (
id_kewarganegaraan
);

/*==============================================================*/
/* Index: provinsi_pd_fk                                        */
/*==============================================================*/
create  index provinsi_pd_fk on peserta_didik (
id_wil
);

/*==============================================================*/
/* Index: agama_pd_fk                                           */
/*==============================================================*/
create  index agama_pd_fk on peserta_didik (
id_agama
);

/*==============================================================*/
/* Index: foto_pd_fk                                            */
/*==============================================================*/
create  index foto_pd_fk on peserta_didik (
id_blob
);

/*==============================================================*/
/* Index: kebutuhan_khusus_ibu_fk                               */
/*==============================================================*/
create  index kebutuhan_khusus_ibu_fk on peserta_didik (
id_kk_ibu
);

/*==============================================================*/
/* Index: pekerjaan_ibu_fk                                      */
/*==============================================================*/
create  index pekerjaan_ibu_fk on peserta_didik (
id_pekerjaan_ibu
);

/*==============================================================*/
/* Index: penghasilan_ibu_fk                                    */
/*==============================================================*/
create  index penghasilan_ibu_fk on peserta_didik (
id_penghasilan_ibu
);

/*==============================================================*/
/* Index: pendidikan_ibu_fk                                     */
/*==============================================================*/
create  index pendidikan_ibu_fk on peserta_didik (
id_pendidikan_ibu
);

/*==============================================================*/
/* Index: pekerjaan_wali_fk                                     */
/*==============================================================*/
create  index pekerjaan_wali_fk on peserta_didik (
id_pekerjaan_wali
);

/*==============================================================*/
/* Index: penghasilan_wali_fk                                   */
/*==============================================================*/
create  index penghasilan_wali_fk on peserta_didik (
id_penghasilan_wali
);

/*==============================================================*/
/* Index: pendidikan_wali_fk                                    */
/*==============================================================*/
create  index pendidikan_wali_fk on peserta_didik (
id_pendidikan_wali
);

/*==============================================================*/
/* Index: kebutuhan_khusus_ayah_fk                              */
/*==============================================================*/
create  index kebutuhan_khusus_ayah_fk on peserta_didik (
id_kk_ayah
);

/*==============================================================*/
/* Index: pekerjaan_ayah_fk                                     */
/*==============================================================*/
create  index pekerjaan_ayah_fk on peserta_didik (
id_pekerjaan_ayah
);

/*==============================================================*/
/* Index: penghasilan_ayah_fk                                   */
/*==============================================================*/
create  index penghasilan_ayah_fk on peserta_didik (
id_penghasilan_ayah
);

/*==============================================================*/
/* Index: pendidikan_ayah_fk                                    */
/*==============================================================*/
create  index pendidikan_ayah_fk on peserta_didik (
id_pendidikan_ayah
);

/*==============================================================*/
/* Table: prestasi                                              */
/*==============================================================*/
create table prestasi (
   id_prestasi          uuid                 not null,
   id_jenis_prestasi    int4                 not null,
   id_sp                uuid                 not null,
   id_pd                uuid                 not null,
   id_tkt_prestasi      int4                 not null,
   nm_prestasi          varchar(160)         not null,
   thn_prestasi         numeric(4)           not null,
   penyelenggara        varchar(100)         null,
   peringkat            numeric(1)           null,
   constraint pk_prestasi primary key (id_prestasi)
);

/*==============================================================*/
/* Index: prestasi_pk                                           */
/*==============================================================*/
create unique index prestasi_pk on prestasi (
id_prestasi
);

/*==============================================================*/
/* Index: prestasi_mewakili_sp_fk                               */
/*==============================================================*/
create  index prestasi_mewakili_sp_fk on prestasi (
id_sp
);

/*==============================================================*/
/* Index: prestasi_jenis_fk                                     */
/*==============================================================*/
create  index prestasi_jenis_fk on prestasi (
id_jenis_prestasi
);

/*==============================================================*/
/* Index: prestasi_tingkat_fk                                   */
/*==============================================================*/
create  index prestasi_tingkat_fk on prestasi (
id_tkt_prestasi
);

/*==============================================================*/
/* Index: prestasi_pd_fk                                        */
/*==============================================================*/
create  index prestasi_pd_fk on prestasi (
id_pd
);

/*==============================================================*/
/* Table: profil_prodi                                          */
/*==============================================================*/
create table profil_prodi (
   id_thn_ajaran        numeric(4)           not null,
   id_sms               uuid                 not null,
   desk_singkat         text                 null,
   visi                 text                 null,
   misi                 text                 null,
   tujuan               text                 null,
   sasaran              text                 null,
   kompetensi           text                 null,
   capaian_belajar      text                 null,
   upaya_sebar          text                 null,
   keberlanjutan        text                 null,
   frek_kur             char(1)              null,
   laks_kur             char(1)              null,
   himp_alumni          text                 null
);

/*==============================================================*/
/* Index: profil_prodi_fk                                       */
/*==============================================================*/
create  index profil_prodi_fk on profil_prodi (
id_sms
);

/*==============================================================*/
/* Index: ta_dibuat_profil_prodi_fk                             */
/*==============================================================*/
create  index ta_dibuat_profil_prodi_fk on profil_prodi (
id_thn_ajaran
);

/*==============================================================*/
/* Table: profil_pt                                             */
/*==============================================================*/
create table profil_pt (
   id_sp                uuid                 not null,
   id_thn_ajaran        numeric(4)           not null,
   desk_singkat         text                 null,
   visi                 text                 null,
   misi                 text                 null,
   tujuan               text                 null,
   sasaran              text                 null,
   seleksi_terima       text                 null,
   pola_pimpin          text                 null,
   sistem_kelola        text                 null,
   sistem_jamin_mutu    text                 null,
   alasan_transfer_mhs  text                 null,
   peran_ajar           text                 null,
   peran_susun_kur      text                 null,
   peran_suasana_akad   text                 null,
   manfaat_tik          text                 null,
   sebar_info           text                 null,
   renc_kembang_si      text                 null,
   eval_lulusan         text                 null,
   mekanisme_eval_lulusan text                 null
);

/*==============================================================*/
/* Index: profil_sp_fk                                          */
/*==============================================================*/
create  index profil_sp_fk on profil_pt (
id_sp
);

/*==============================================================*/
/* Index: tahun_ajaran_dibuat_profil_fk                         */
/*==============================================================*/
create  index tahun_ajaran_dibuat_profil_fk on profil_pt (
id_thn_ajaran
);

/*==============================================================*/
/* Table: reg_pd                                                */
/*==============================================================*/
create table pdrd.reg_pd (
   id_reg_pd            uuid                 not null,
   id_pd                uuid                 not null,
   id_sp                uuid                 not null,
   id_sms               uuid                 null,
   nipd                 varchar(24)          not null,
   tgl_masuk_sp         date                 not null,
   tgl_keluar           date                 null,
   ket                  varchar(250)         null,
   skhun                char(20)             null,
   no_peserta_ujian     char(20)             null,
   no_seri_ijazah       varchar(80)          null,
   asal_data_ijazah     char(1)              not null default '0',
   bidang_mayor         varchar(100)         null,
   bidang_minor         varchar(100)         null,
   mulai_smt            char(5)              not null,
   sks_diakui           numeric(3)           null,
   jalur_skripsi        numeric(1)           null,
   judul_skripsi        varchar(500)         null,
   bln_awal_bimbingan   date                 null,
   bln_akhir_bimbingan  date                 null,
   sk_yudisium          varchar(80)          null,
   tgl_sk_yudisium      date                 null,
   ipk                  numeric(5,2)         null,
   sert_prof            varchar(80)          null,
   a_pindah_mhs_asing   numeric(1)           null default 0
      constraint ckc_a_pindah_mhs_asin_reg_pd check (a_pindah_mhs_asing is null or (a_pindah_mhs_asing between 0 and 1 and a_pindah_mhs_asing in (0,1))),
   id_sp_asal           uuid                 null,
   nm_pt_asal           varchar(100)         null,
   id_prodi_asal        uuid                 null,
   nm_prodi_asal        varchar(100)         null,
   biaya_masuk_kuliah   numeric(16,2)        null,
   id_jns_keluar        char(1)              null,
   id_jalur_daftar      int4                 not null,
   id_smt               char(5)              null,
   id_pembiayaan        numeric(2)           not null,
   id_jns_daftar        numeric(2)           not null,
   constraint pk_reg_pd primary key (id_reg_pd)
);

/*==============================================================*/
/* Index: reg_pd_pk                                             */
/*==============================================================*/
create unique index reg_pd_pk on pdrd.reg_pd (
id_reg_pd
);

/*==============================================================*/
/* Index: register_pd_fk                                        */
/*==============================================================*/
create  index register_pd_fk on pdrd.reg_pd (
id_pd
);

/*==============================================================*/
/* Index: prodi_pd_fk                                           */
/*==============================================================*/
create  index prodi_pd_fk on pdrd.reg_pd (
id_sms
);

/*==============================================================*/
/* Index: pt_pd_fk                                              */
/*==============================================================*/
create  index pt_pd_fk on pdrd.reg_pd (
id_sp
);

/*==============================================================*/
/* Index: jalur_daftar_pd_fk                                    */
/*==============================================================*/
create  index jalur_daftar_pd_fk on pdrd.reg_pd (
id_jalur_daftar
);

/*==============================================================*/
/* Index: jenis_daftar_pd_fk                                    */
/*==============================================================*/
create  index jenis_daftar_pd_fk on pdrd.reg_pd (
id_jns_daftar
);

/*==============================================================*/
/* Index: semester_masuk_fk                                     */
/*==============================================================*/
create  index semester_masuk_fk on pdrd.reg_pd (
mulai_smt
);

/*==============================================================*/
/* Index: biaya_register_fk                                     */
/*==============================================================*/
create  index biaya_register_fk on pdrd.reg_pd (
id_pembiayaan
);

/*==============================================================*/
/* Index: alasan_keluar_pd_fk                                   */
/*==============================================================*/
create  index alasan_keluar_pd_fk on pdrd.reg_pd (
id_jns_keluar
);

/*==============================================================*/
/* Index: smt_yudisium_fk                                       */
/*==============================================================*/
create  index smt_yudisium_fk on pdrd.reg_pd (
id_smt
);

/*==============================================================*/
/* Index: pt_asal_fk                                            */
/*==============================================================*/
create  index pt_asal_fk on pdrd.reg_pd (
id_sp_asal
);

/*==============================================================*/
/* Table: reg_ptk                                               */
/*==============================================================*/
create table reg_ptk (
   id_reg_ptk           uuid                 not null,
   id_jns_keluar        char(1)              null,
   id_sdm               uuid                 null,
   id_sp                uuid                 not null,
   id_stat_pegawai      int2                 not null,
   id_ikatan_kerja      char(1)              not null,
   id_sms               uuid                 null,
   no_srt_tgs           varchar(80)          not null,
   tgl_srt_tgs          date                 not null,
   tmt_srt_tgs          date                 not null,
   tgl_ptk_keluar       date                 null,
   nidn                 char(10)             null,
   constraint pk_reg_ptk primary key (id_reg_ptk)
);

comment on table reg_ptk is
'Registrasi atau pencatatan riwayat PTK atau penerimaan PTK baru di satuan pendidikan.';

/*==============================================================*/
/* Index: reg_ptk_pk                                            */
/*==============================================================*/
create unique index reg_ptk_pk on reg_ptk (
id_reg_ptk
);

/*==============================================================*/
/* Index: statpeg_ptk_fk                                        */
/*==============================================================*/
create  index statpeg_ptk_fk on reg_ptk (
id_stat_pegawai
);

/*==============================================================*/
/* Index: ptk_keluar_fk                                         */
/*==============================================================*/
create  index ptk_keluar_fk on reg_ptk (
id_jns_keluar
);

/*==============================================================*/
/* Index: ptk_ikatan_kerja_fk                                   */
/*==============================================================*/
create  index ptk_ikatan_kerja_fk on reg_ptk (
id_ikatan_kerja
);

/*==============================================================*/
/* Index: ptk_terdaftar_pt_fk                                   */
/*==============================================================*/
create  index ptk_terdaftar_pt_fk on reg_ptk (
id_sdm
);

/*==============================================================*/
/* Index: reg_dosen_sms_fk                                      */
/*==============================================================*/
create  index reg_dosen_sms_fk on reg_ptk (
id_sms
);

/*==============================================================*/
/* Index: ptk_terdaftar_di_sp_fk                                */
/*==============================================================*/
create  index ptk_terdaftar_di_sp_fk on reg_ptk (
id_sp
);

/*==============================================================*/
/* Table: rwy_didik_nonformal                                   */
/*==============================================================*/
create table rwy_didik_nonformal (
   id_rwy_didik_nonformal uuid                 not null,
   id_sms               uuid                 not null,
   id_rwy_didik_formal  uuid                 not null,
   no_sk_setara         varchar(80)          not null,
   tgl_sk_setara        date                 not null,
   tmt_sk_setara        date                 not null,
   level_kkni           int4                 not null,
   nm_prodi_penyetara   varchar(100)         not null,
   constraint pk_rwy_didik_nonformal primary key (id_rwy_didik_nonformal)
);

/*==============================================================*/
/* Index: rwy_didik_nonformal_pk                                */
/*==============================================================*/
create unique index rwy_didik_nonformal_pk on rwy_didik_nonformal (
id_rwy_didik_nonformal
);

/*==============================================================*/
/* Index: rwy_didik_nonformal_ptk_fk                            */
/*==============================================================*/
create  index rwy_didik_nonformal_ptk_fk on rwy_didik_nonformal (
id_rwy_didik_formal
);

/*==============================================================*/
/* Index: prodi_penyetara_fk                                    */
/*==============================================================*/
create  index prodi_penyetara_fk on rwy_didik_nonformal (
id_sms
);

/*==============================================================*/
/* Table: rwy_kepangkatan                                       */
/*==============================================================*/
create table rwy_kepangkatan (
   id_rwy_pangkat       uuid                 not null,
   id_pangkat_gol       numeric(2)           not null,
   sk_pangkat           varchar(80)          not null,
   tgl_sk_pangkat       date                 not null,
   tmt_sk_pangkat       date                 not null,
   masa_kerja_gol_thn   numeric(2)           not null,
   masa_kerja_gol_bln   numeric(2)           not null,
   constraint pk_rwy_kepangkatan primary key (id_rwy_pangkat)
);

comment on table rwy_kepangkatan is
'Riwayat pangkat dan golongan sejak diangkat menjadi pegawai negeri sipil.';

/*==============================================================*/
/* Index: rwy_kepangkatan_pk                                    */
/*==============================================================*/
create unique index rwy_kepangkatan_pk on rwy_kepangkatan (
id_rwy_pangkat
);

/*==============================================================*/
/* Index: riwayat_pang_gol_fk                                   */
/*==============================================================*/
create  index riwayat_pang_gol_fk on rwy_kepangkatan (
id_pangkat_gol
);

/*==============================================================*/
/* Table: rwy_pend_formal                                       */
/*==============================================================*/
create table rwy_pend_formal (
   id_rwy_didik_formal  uuid                 not null,
   id_sms               uuid                 null,
   id_bid_studi         int4                 not null,
   id_gelar_akad        int4                 null,
   nm_sp_formal         varchar(100)         not null,
   fak                  varchar(100)         null,
   a_kependidikan       numeric(1)           not null default 0
      constraint ckc_a_kependidikan_rwy_pend check (a_kependidikan between 0 and 1 and a_kependidikan in (0,1)),
   thn_masuk            numeric(4)           not null,
   thn_lulus            numeric(4)           null,
   nipd                 varchar(24)          not null,
   stat_kul             char(1)              not null,
   smt                  numeric(2)           null,
   sks_lulus            numeric(3)           not null,
   ipk                  numeric(5,2)         not null,
   sk_setara            varchar(80)          null,
   tgl_sk_setara        date                 null,
   no_ijazah            varchar(80)          null,
   judul_tesis          varchar(500)         null,
   tgl_lulus            date                 null,
   constraint pk_rwy_pend_formal primary key (id_rwy_didik_formal)
);

comment on table rwy_pend_formal is
'Riwayat jalur pendidikan terstruktur dan berjenjang yang terdiri atas pendidikan dasar, pendidikan menengah, dan pendidikan tinggi yang pernah ditempuh.';

/*==============================================================*/
/* Index: rwy_pend_formal_pk                                    */
/*==============================================================*/
create unique index rwy_pend_formal_pk on rwy_pend_formal (
id_rwy_didik_formal
);

/*==============================================================*/
/* Index: rwyt_pend_formal_bidangstudi_fk                       */
/*==============================================================*/
create  index rwyt_pend_formal_bidangstudi_fk on rwy_pend_formal (
id_bid_studi
);

/*==============================================================*/
/* Index: riwayat_gelar_fk                                      */
/*==============================================================*/
create  index riwayat_gelar_fk on rwy_pend_formal (
id_gelar_akad
);

/*==============================================================*/
/* Index: ptk_rwyt_prodi_fk                                     */
/*==============================================================*/
create  index ptk_rwyt_prodi_fk on rwy_pend_formal (
id_sms
);

/*==============================================================*/
/* Table: rwy_sertifikasi                                       */
/*==============================================================*/
create table rwy_sertifikasi (
   id_rwy_sert          uuid                 not null,
   id_jns_sert          numeric(3)           not null,
   id_bid_studi         int4                 not null,
   thn_sert             numeric(4)           not null,
   sk_sert              varchar(80)          not null,
   nrg                  varchar(15)          null,
   no_peserta           varchar(16)          null,
   constraint pk_rwy_sertifikasi primary key (id_rwy_sert)
);

comment on table rwy_sertifikasi is
'Riwayat sertifikasi yang pernah ditempuh oleh pendidik dan tenaga kependidikan.';

/*==============================================================*/
/* Index: rwy_sertifikasi_pk                                    */
/*==============================================================*/
create unique index rwy_sertifikasi_pk on rwy_sertifikasi (
id_rwy_sert
);

/*==============================================================*/
/* Index: rwyt_bidang_sertifikasi_fk                            */
/*==============================================================*/
create  index rwyt_bidang_sertifikasi_fk on rwy_sertifikasi (
id_bid_studi
);

/*==============================================================*/
/* Index: rwyt_sert_jenis_fk                                    */
/*==============================================================*/
create  index rwyt_sert_jenis_fk on rwy_sertifikasi (
id_jns_sert
);

/*==============================================================*/
/* Table: satuan_pendidikan                                     */
/*==============================================================*/
create table satuan_pendidikan (
   id_sp                uuid                 not null,
   id_bp                int2                 not null,
   id_wil               char(8)              not null,
   id_blob              uuid                 null,
   id_stat_milik        numeric(1)           not null,
   id_lemb_non_sp       uuid                 not null,
   nm_lemb              varchar(100)         not null,
   lintang              numeric(11,7)        null,
   bujur                numeric(11,7)        null,
   no_tel               varchar(20)          null,
   no_fax               varchar(20)          null,
   email                varchar(60)          null,
   website              varchar(256)         null,
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          null,
   kode_pos             char(5)              null,
   nss                  char(12)             null,
   npsn                 char(8)              null,
   nm_singkat           varchar(20)          null,
   stat_sp              char(1)              not null,
   sk_pendirian_sp      varchar(80)          null,
   tgl_sk_pendirian_sp  date                 null,
   tgl_berdiri          date                 null,
   sk_izin_operasi      varchar(80)          null,
   tgl_sk_izin_operasi  date                 null,
   no_rek               varchar(20)          null,
   nm_bank              varchar(100)         null,
   unit_cabang          varchar(60)          null,
   nm_rek               varchar(50)          null,
   a_mbs                numeric(1)           not null default 0
      constraint ckc_a_mbs_satuan_p check (a_mbs between 0 and 1 and a_mbs in (0,1)),
   luas_tanah_milik     numeric(7)           not null,
   luas_tanah_bukan_milik numeric(7)           not null,
   a_lptk               numeric(1)           not null default 0
      constraint ckc_a_lptk_satuan_p check (a_lptk between 0 and 1 and a_lptk in (0,1)),
   kode_reg             int8                 null,
   npwp                 char(15)             null,
   nm_wp                varchar(100)         null,
   flag                 char(1)              null,
   constraint pk_satuan_pendidikan primary key (id_sp)
);

comment on table satuan_pendidikan is
'Kelompok layanan pendidikan yang menyelenggarakan pendidikan pada jalur formal, nonformal, dan informal pada setiap jenjang dan jenis pendidikan.';

/*==============================================================*/
/* Index: satuan_pendidikan_pk                                  */
/*==============================================================*/
create unique index satuan_pendidikan_pk on satuan_pendidikan (
id_sp
);

/*==============================================================*/
/* Index: sp_bentuk_fk                                          */
/*==============================================================*/
create  index sp_bentuk_fk on satuan_pendidikan (
id_bp
);

/*==============================================================*/
/* Index: sp_milik_fk                                           */
/*==============================================================*/
create  index sp_milik_fk on satuan_pendidikan (
id_stat_milik
);

/*==============================================================*/
/* Index: logo_sp_fk                                            */
/*==============================================================*/
create  index logo_sp_fk on satuan_pendidikan (
id_blob
);

/*==============================================================*/
/* Index: wilayah_sp_fk                                         */
/*==============================================================*/
create  index wilayah_sp_fk on satuan_pendidikan (
id_wil
);

/*==============================================================*/
/* Index: pembina_sp_fk                                         */
/*==============================================================*/
create  index pembina_sp_fk on satuan_pendidikan (
id_lemb_non_sp
);

/*==============================================================*/
/* Table: sdm                                                   */
/*==============================================================*/
create table sdm (
   id_sdm               uuid                 not null,
   id_keahlian_lab      int2                 null,
   id_jns_sdm           numeric(2)           not null,
   id_agama             int2                 not null,
   id_lemb_angkat       numeric(2)           not null,
   id_pekerjaan         int4                 not null,
   id_stat_aktif        numeric(2)           not null,
   id_negara            char(2)              not null,
   id_wil               char(8)              not null,
   nm_sdm               varchar(100)         not null,
   jk                   char(1)              not null
      constraint ckc_jk_sdm check (jk in ('L','P','*')),
   tmpt_lahir           varchar(32)          not null,
   tgl_lahir            date                 not null,
   nm_ibu_kandung       varchar(100)         not null,
   nik                  char(20)             not null,
   niy_nigk             varchar(30)          null,
   nuptk                char(16)             null,
   nidn                 char(10)             null,
   nsdmi                char(12)             null,
   stat_kawin           numeric(1)           not null,
   no_tel_rmh           varchar(20)          null,
   no_hp                varchar(20)          null,
   email                varchar(60)          null,
   nip                  varchar(18)          null,
   tmt_pns              date                 null,
   nm_suami_istri       varchar(100)         null,
   nip_suami_istri      char(18)             null,
   sk_cpns              varchar(80)          null,
   tgl_sk_cpns          date                 null,
   sk_angkat            varchar(80)          null,
   tmt_sk_angkat        date                 null,
   npwp                 char(15)             null,
   nm_wp                varchar(100)         null,
   stat_data            int4                 null,
   akta_ijin_ajar       char(1)              null,
   nira                 char(30)             null,
   constraint pk_sdm primary key (id_sdm)
);

comment on table sdm is
'SDM meliputi pendidik, peneliti, perekayasa, tenaga kependidikan, dan lain-lain.

Pendidik adalah tenaga kependidikan yang berkualifikasi sebagai guru, dosen, konselor, pamong belajar, widyaiswara, tutor, instruktur, fasilitator, dan sebutan lain yang sesuai dengan kekhususannya, serta berpartisipasi dalam menyelenggarakan pendidikan.

Tenaga kependidikan adalah anggota masyarakat yang mengabdikan diri dan diangkat untuk menunjang penyelenggaraan pendidikan.';

/*==============================================================*/
/* Index: sdm_pk                                                */
/*==============================================================*/
create unique index sdm_pk on sdm (
id_sdm
);

/*==============================================================*/
/* Index: ptk_jenis_fk                                          */
/*==============================================================*/
create  index ptk_jenis_fk on sdm (
id_jns_sdm
);

/*==============================================================*/
/* Index: stataktif_ptk_fk                                      */
/*==============================================================*/
create  index stataktif_ptk_fk on sdm (
id_stat_aktif
);

/*==============================================================*/
/* Index: lemb_pengangkat_sdm_fk                                */
/*==============================================================*/
create  index lemb_pengangkat_sdm_fk on sdm (
id_lemb_angkat
);

/*==============================================================*/
/* Index: keahlian_lab_sdm_fk                                   */
/*==============================================================*/
create  index keahlian_lab_sdm_fk on sdm (
id_keahlian_lab
);

/*==============================================================*/
/* Index: agama_sdm_fk                                          */
/*==============================================================*/
create  index agama_sdm_fk on sdm (
id_agama
);

/*==============================================================*/
/* Index: pekerjaan_suami_istri_fk                              */
/*==============================================================*/
create  index pekerjaan_suami_istri_fk on sdm (
id_pekerjaan
);

/*==============================================================*/
/* Index: kewarganegaraan_fk                                    */
/*==============================================================*/
create  index kewarganegaraan_fk on sdm (
id_negara
);

/*==============================================================*/
/* Index: ptk_kecamatan_domisili_fk                             */
/*==============================================================*/
create  index ptk_kecamatan_domisili_fk on sdm (
id_wil
);

/*==============================================================*/
/* Table: semester                                              */
/*==============================================================*/
create table ref.semester (
   id_smt               char(5)              not null,
   id_thn_ajaran        numeric(4)           not null,
   nm_smt               varchar(50)          not null,
   smt                  numeric(2)           not null,
   constraint pk_semester primary key (id_smt)
);

/*==============================================================*/
/* Index: semester_pk                                           */
/*==============================================================*/
create unique index semester_pk on ref.semester (
id_smt
);

/*==============================================================*/
/* Index: ta_semester_fk                                        */
/*==============================================================*/
create  index ta_semester_fk on ref.semester (
id_thn_ajaran
);

/*==============================================================*/
/* Table: sms                                                   */
/*==============================================================*/
create table sms (
   id_sms               uuid                 not null,
   id_jur               varchar(25)          null,
   id_kel_usaha         char(8)              not null,
   id_sp                uuid                 not null,
   id_jns_sms           numeric(2)           not null,
   id_jenj_didik        numeric(2)           not null,
   induk_sms_id_sms     uuid                 null,
   id_blob              uuid                 null,
   id_fungsi_lab        char(1)              not null,
   id_wil               char(8)              not null,
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          null,
   kode_pos             char(5)              null,
   nm_lemb              varchar(100)         not null,
   lintang              numeric(11,7)        null,
   bujur                numeric(11,7)        null,
   no_tel               varchar(20)          null,
   no_fax               varchar(20)          null,
   email                varchar(60)          null,
   website              varchar(256)         null,
   kd_kl                char(3)              null,
   kd_satker            varchar(20)          null,
   singkatan            varchar(50)          null,
   tgl_berdiri          date                 null,
   sk_selenggara        varchar(80)          null,
   tgl_sk_selenggara    date                 null,
   tmt_sk_selenggara    date                 null,
   tst_sk_selenggara    date                 null,
   smt_mulai            char(5)              null,
   luas_lab             numeric(5)           null,
   kapasitas_prak_satu_shift numeric(4)           null,
   jml_mhs_pengguna     numeric(6)           null,
   jml_jam_penggunaan   numeric(5)           null,
   jml_prodi_pengguna   numeric(3)           null,
   jml_modul_prak_sendiri numeric(4)           null,
   jml_modul_prak_lain  numeric(4)           null,
   fungsi_selain_praktikum_ char(1)              null,
   penggunaan_lab       char(1)              null,
   a_selenggara_subst   numeric(1)           not null default 0
      constraint ckc_a_selenggara_subs_sms check (a_selenggara_subst between 0 and 1 and a_selenggara_subst in (0,1)),
   sistem_ajar          numeric(1)           null,
   a_pjj                numeric(1)           null default 0
      constraint ckc_a_pjj_sms check (a_pjj is null or (a_pjj between 0 and 1 and a_pjj in (0,1))),
   a_psdku              numeric(1)           null default 0
      constraint ckc_a_psdku_sms check (a_psdku is null or (a_psdku between 0 and 1 and a_psdku in (0,1))),
   a_pkl                numeric(1)           null default 0
      constraint ckc_a_pkl_sms check (a_pkl is null or (a_pkl between 0 and 1 and a_pkl in (0,1))),
   kode_prodi           varchar(10)          null,
   nm_prodi_english     varchar(100)         null,
   kpst_pd              numeric(5)           null,
   sks_lulus            numeric(3)           null,
   gelar_lulusan        varchar(10)          null,
   stat_prodi           char(1)              null default 'A'
      constraint ckc_stat_prodi_sms check (stat_prodi is null or (stat_prodi in ('A','B','K','N','H'))),
   polesei_nilai        char(1)              null default 'B'
      constraint ckc_polesei_nilai_sms check (polesei_nilai is null or (polesei_nilai in ('B','T'))),
   a_kependidikan       numeric(1)           null default 0
      constraint ckc_a_kependidikan_sms check (a_kependidikan is null or (a_kependidikan between 0 and 1 and a_kependidikan in (0,1))),
   constraint pk_sms primary key (id_sms)
);

comment on table sms is
'Satuan kerja terkecil yang berada di atas struktur program studi, seperti departemen, jurusan, sekolah, atau fakultas. Tiap satuan umumnya mengelola program studi dalam bidang ilmu yang sama.';

/*==============================================================*/
/* Index: sms_pk                                                */
/*==============================================================*/
create unique index sms_pk on sms (
id_sms
);

/*==============================================================*/
/* Index: induk_sms_fk                                          */
/*==============================================================*/
create  index induk_sms_fk on sms (
induk_sms_id_sms
);

/*==============================================================*/
/* Index: sms_sp_fk                                             */
/*==============================================================*/
create  index sms_sp_fk on sms (
id_sp
);

/*==============================================================*/
/* Index: sms_jenis_fk                                          */
/*==============================================================*/
create  index sms_jenis_fk on sms (
id_jns_sms
);

/*==============================================================*/
/* Index: wilayah_sms_fk                                        */
/*==============================================================*/
create  index wilayah_sms_fk on sms (
id_wil
);

/*==============================================================*/
/* Index: fungsi_lab_sms_fk                                     */
/*==============================================================*/
create  index fungsi_lab_sms_fk on sms (
id_fungsi_lab
);

/*==============================================================*/
/* Index: kelompok_usaha_sms_fk                                 */
/*==============================================================*/
create  index kelompok_usaha_sms_fk on sms (
id_kel_usaha
);

/*==============================================================*/
/* Index: logo_sms_fk                                           */
/*==============================================================*/
create  index logo_sms_fk on sms (
id_blob
);

/*==============================================================*/
/* Index: progstudi_jenjang_fk                                  */
/*==============================================================*/
create  index progstudi_jenjang_fk on sms (
id_jenj_didik
);

/*==============================================================*/
/* Index: jursp_jurstd_fk                                       */
/*==============================================================*/
create  index jursp_jurstd_fk on sms (
id_jur
);

/*==============================================================*/
/* Table: status_anak                                           */
/*==============================================================*/
create table status_anak (
   id_stat_anak         numeric(1)           not null,
   nm_stat_anak         varchar(50)          not null,
   constraint pk_status_anak primary key (id_stat_anak)
);

comment on table status_anak is
'Jenis hubungan keluarga atau hubungan darah antara anak dengan orang tua sebagai contoh: anak kandung, tiri, angkat, dll.';

/*==============================================================*/
/* Index: status_anak_pk                                        */
/*==============================================================*/
create unique index status_anak_pk on status_anak (
id_stat_anak
);

/*==============================================================*/
/* Table: status_keaktifan_pegawai                              */
/*==============================================================*/
create table status_keaktifan_pegawai (
   id_stat_aktif        numeric(2)           not null,
   nm_stat_aktif        varchar(50)          not null,
   constraint pk_status_keaktifan_pegawai primary key (id_stat_aktif)
);

comment on table status_keaktifan_pegawai is
'Kondisi keaktifan pegawai, contoh: aktif atau tidak aktif. ';

/*==============================================================*/
/* Index: status_keaktifan_pegawai_pk                           */
/*==============================================================*/
create unique index status_keaktifan_pegawai_pk on status_keaktifan_pegawai (
id_stat_aktif
);

/*==============================================================*/
/* Table: status_kepegawaian                                    */
/*==============================================================*/
create table status_kepegawaian (
   id_stat_pegawai      int2                 not null,
   nm_stat_pegawai      varchar(50)          not null,
   constraint pk_status_kepegawaian primary key (id_stat_pegawai)
);

comment on table status_kepegawaian is
'Status kepegawaian pendidik dan tenaga kependidikan, contohnya: PNS, PNS diperbantukan, guru bantu pusat, tenaga honor sekolah, dll.';

/*==============================================================*/
/* Index: status_kepegawaian_pk                                 */
/*==============================================================*/
create unique index status_kepegawaian_pk on status_kepegawaian (
id_stat_pegawai
);

/*==============================================================*/
/* Table: status_kepemilikan                                    */
/*==============================================================*/
create table status_kepemilikan (
   id_stat_milik        numeric(1)           not null,
   nm_stat_milik        varchar(50)          not null,
   constraint pk_status_kepemilikan primary key (id_stat_milik)
);

comment on table status_kepemilikan is
'Jenis kepemilikan satuan pendidikan apakah dimiliki oleh yayasan, pemerintah daerah, atau pemerintah pusat.';

/*==============================================================*/
/* Index: status_kepemilikan_pk                                 */
/*==============================================================*/
create unique index status_kepemilikan_pk on status_kepemilikan (
id_stat_milik
);

/*==============================================================*/
/* Table: status_mahasiswa                                      */
/*==============================================================*/
create table status_mahasiswa (
   id_stat_mhs          char(1)              not null,
   nm_stat_mhs          varchar(30)          not null,
   ket_stat_mhs         varchar(100)         null,
   constraint pk_status_mahasiswa primary key (id_stat_mhs)
);

/*==============================================================*/
/* Index: status_mahasiswa_pk                                   */
/*==============================================================*/
create unique index status_mahasiswa_pk on status_mahasiswa (
id_stat_mhs
);

/*==============================================================*/
/* Table: substansi_kuliah                                      */
/*==============================================================*/
create table substansi_kuliah (
   id_subst             uuid                 not null,
   id_jns_subst         char(5)              not null,
   nm_subst             varchar(50)          not null,
   sks_mk               numeric(5,2)         null,
   sks_tm               numeric(5,2)         null,
   sks_prak             numeric(5,2)         null,
   sks_prak_lap         numeric(5,2)         null,
   sks_sim              numeric(5,2)         null,
   constraint pk_substansi_kuliah primary key (id_subst)
);

comment on table substansi_kuliah is
'Kelompok materi suatu bidang ilmu yang spesifik, sebagai contoh substansi pada ilmu kedokteran adalah patologi, genetika, dll.';

/*==============================================================*/
/* Index: substansi_kuliah_pk                                   */
/*==============================================================*/
create unique index substansi_kuliah_pk on substansi_kuliah (
id_subst
);

/*==============================================================*/
/* Index: substansi_jenis_fk                                    */
/*==============================================================*/
create  index substansi_jenis_fk on substansi_kuliah (
id_jns_subst
);

/*==============================================================*/
/* Table: tahun_ajaran                                          */
/*==============================================================*/
create table tahun_ajaran (
   id_thn_ajaran        numeric(4)           not null,
   nm_thn_ajaran        varchar(50)          not null,
   constraint pk_tahun_ajaran primary key (id_thn_ajaran)
);

/*==============================================================*/
/* Index: tahun_ajaran_pk                                       */
/*==============================================================*/
create unique index tahun_ajaran_pk on tahun_ajaran (
id_thn_ajaran
);

/*==============================================================*/
/* Table: tingkat_prestasi                                      */
/*==============================================================*/
create table tingkat_prestasi (
   id_tkt_prestasi      int4                 not null,
   nm_tkt_prestasi      varchar(100)         not null,
   constraint pk_tingkat_prestasi primary key (id_tkt_prestasi)
);

/*==============================================================*/
/* Index: tingkat_prestasi_pk                                   */
/*==============================================================*/
create unique index tingkat_prestasi_pk on tingkat_prestasi (
id_tkt_prestasi
);

/*==============================================================*/
/* Table: uji_mhs                                               */
/*==============================================================*/
create table uji_mhs (
   id_uji_mhs           uuid                 not null,
   id_sdm               uuid                 not null,
   id_akt_mhs           uuid                 not null,
   urutan_uji           numeric(1)           not null,
   constraint pk_uji_mhs primary key (id_uji_mhs)
);

comment on table uji_mhs is
'Aktivitas menguji mahasiswa berupa kegiatan pengujian tugas/laporan akhir, tesis, disertasi, dll.';

/*==============================================================*/
/* Index: uji_mhs_pk                                            */
/*==============================================================*/
create unique index uji_mhs_pk on uji_mhs (
id_uji_mhs
);

/*==============================================================*/
/* Index: dosen_penguji_fk                                      */
/*==============================================================*/
create  index dosen_penguji_fk on uji_mhs (
id_sdm
);

/*==============================================================*/
/* Index: aktmhs_uji_fk                                         */
/*==============================================================*/
create  index aktmhs_uji_fk on uji_mhs (
id_akt_mhs
);

/*==============================================================*/
/* Table: wilayah                                               */
/*==============================================================*/
create table wilayah (
   id_wil               char(8)              not null,
   id_negara            char(2)              not null,
   induk_wil_id_wil     char(8)              null,
   nm_wil               varchar(60)          null,
   asal_wil             char(8)              null,
   kode_bps             char(7)              null,
   kode_dagri           char(7)              null,
   kode_keu             varchar(10)          null,
   constraint pk_wilayah primary key (id_wil)
);

comment on table wilayah is
'Pembagian area di suatu negara berdasarkan pembagian wilayah administratif.';

/*==============================================================*/
/* Index: wilayah_pk                                            */
/*==============================================================*/
create unique index wilayah_pk on wilayah (
id_wil
);

/*==============================================================*/
/* Index: wilayah_negara_fk                                     */
/*==============================================================*/
create  index wilayah_negara_fk on wilayah (
id_negara
);

/*==============================================================*/
/* Index: induk_wil_fk                                          */
/*==============================================================*/
create  index induk_wil_fk on wilayah (
induk_wil_id_wil
);

alter table akred_sp
   add constraint fk_akred_sp_akred_sp_satuan_p foreign key (id_sp)
      references satuan_pendidikan (id_sp)
      on delete restrict on update restrict;

alter table akred_sp
   add constraint fk_akred_sp_akred_sp__lembaga_ foreign key (id_lemb_akred)
      references lembaga_akred (id_lemb_akred)
      on delete restrict on update restrict;

alter table akred_sp
   add constraint fk_akred_sp_sp_akred__nilai_ak foreign key (id_akred)
      references nilai_akred (id_akred)
      on delete restrict on update restrict;

alter table akreditasi_prodi
   add constraint fk_akredita_akreditas_sms foreign key (id_sms)
      references sms (id_sms)
      on delete restrict on update restrict;

alter table akreditasi_prodi
   add constraint fk_akredita_lemb_akre_lembaga_ foreign key (id_lemb_akred)
      references lembaga_akred (id_lemb_akred)
      on delete restrict on update restrict;

alter table akreditasi_prodi
   add constraint fk_akredita_nilai_akr_nilai_ak foreign key (id_akred)
      references nilai_akred (id_akred)
      on delete restrict on update restrict;

alter table akt_ajar_dosen
   add constraint fk_akt_ajar_katgiat_a_kategori foreign key (id_katgiat)
      references kategori_kegiatan (id_katgiat)
      on delete restrict on update restrict;

alter table akt_ajar_dosen
   add constraint fk_akt_ajar_mengajar__substans foreign key (id_subst)
      references substansi_kuliah (id_subst)
      on delete restrict on update restrict;

alter table akt_ajar_dosen
   add constraint fk_akt_ajar_pengajara_jenis_ev foreign key (id_jns_eval)
      references jenis_evaluasi (id_jns_eval)
      on delete restrict on update restrict;

alter table akt_ajar_dosen
   add constraint fk_akt_ajar_pengambil_kelas_ku foreign key (id_kls)
      references kelas_kuliah (id_kls)
      on delete restrict on update restrict;

alter table akt_ajar_dosen
   add constraint fk_akt_ajar_ptk_penga_reg_ptk foreign key (id_reg_ptk)
      references reg_ptk (id_reg_ptk)
      on delete restrict on update restrict;

alter table akt_mhs
   add constraint fk_akt_mhs_jenis_akt_jenis_ak foreign key (id_jns_akt_mhs)
      references jenis_akt_mhs (id_jns_akt_mhs)
      on delete restrict on update restrict;

alter table akt_mhs
   add constraint fk_akt_mhs_prodi_akt_sms foreign key (id_sms)
      references sms (id_sms)
      on delete restrict on update restrict;

alter table akt_mhs
   add constraint fk_akt_mhs_smt_akt_m_semester foreign key (id_smt)
      references ref.semester (id_smt)
      on delete restrict on update restrict;

alter table anak
   add constraint fk_anak_anak_stat_status_a foreign key (id_stat_anak)
      references status_anak (id_stat_anak)
      on delete restrict on update restrict;

alter table anggota_aktivitas_mahasiswa
   add constraint fk_anggota__akt_mhs_a_akt_mhs foreign key (id_akt_mhs)
      references akt_mhs (id_akt_mhs)
      on delete restrict on update restrict;

alter table anggota_aktivitas_mahasiswa
   add constraint fk_anggota__reg_ang_a_reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
      on delete restrict on update restrict;

alter table bidang_studi
   add constraint fk_bidang_s_kelompok_bidang_s foreign key (kelompok_id_bid_studi)
      references bidang_studi (id_bid_studi)
      on delete restrict on update restrict;

alter table bimbing_mhs
   add constraint fk_bimbing__aktmhs_bi_akt_mhs foreign key (id_akt_mhs)
      references akt_mhs (id_akt_mhs)
      on delete restrict on update restrict;

alter table bimbing_mhs
   add constraint fk_bimbing__dosen_pem_sdm foreign key (id_sdm)
      references sdm (id_sdm)
      on delete restrict on update restrict;

alter table diklat
   add constraint fk_diklat_diklat_je_jenis_di foreign key (id_jns_diklat)
      references jenis_diklat (id_jns_diklat)
      on delete restrict on update restrict;

alter table diklat
   add constraint fk_diklat_diklat_ke_kelompok foreign key (id_kel_bidang)
      references kelompok_bidang (id_kel_bidang)
      on delete restrict on update restrict;

alter table dokumen
   add constraint fk_dokumen_jenis_dok_jenis_do foreign key (id_jns_dok)
      references jenis_dokumen (id_jns_dok)
      on delete restrict on update restrict;

alter table foto_peserta_didik
   add constraint fk_foto_pes_pemilik_f_peserta_ foreign key (id_pd)
      references peserta_didik (id_pd)
      on delete restrict on update restrict;

alter table foto_peserta_didik
   add constraint fk_foto_pes_rincian_f_large_ob foreign key (id_blob)
      references large_object (id_blob)
      on delete restrict on update restrict;

alter table inpassing
   add constraint fk_inpassin_inpassing_pangkat_ foreign key (id_pangkat_gol)
      references pangkat_golongan (id_pangkat_gol)
      on delete restrict on update restrict;

alter table jenjang_pendidikan
   add constraint fk_jenjang__jenjang_a_anak foreign key (id_anak)
      references anak (id_anak)
      on delete restrict on update restrict;

alter table jenjang_pendidikan
   add constraint fk_jenjang__rwyt_pend_rwy_pend foreign key (id_rwy_didik_formal)
      references rwy_pend_formal (id_rwy_didik_formal)
      on delete restrict on update restrict;

alter table jurusan
   add constraint fk_jurusan_bid_jur_kelompok foreign key (id_kel_bidang)
      references kelompok_bidang (id_kel_bidang)
      on delete restrict on update restrict;

alter table jurusan
   add constraint fk_jurusan_induk_pro_jurusan foreign key (induk_program_id_jur)
      references jurusan (id_jur)
      on delete restrict on update restrict;

alter table jurusan
   add constraint fk_jurusan_jur_std_j_jenjang_ foreign key (id_jenj_didik)
      references jenjang_pendidikan (id_jenj_didik)
      on delete restrict on update restrict;

alter table keaktifan_ptk
   add constraint fk_keaktifa_long_reg__reg_ptk foreign key (id_reg_ptk)
      references reg_ptk (id_reg_ptk)
      on delete restrict on update restrict;

alter table keaktifan_ptk
   add constraint fk_keaktifa_tahun_kea_tahun_aj foreign key (id_thn_ajaran)
      references tahun_ajaran (id_thn_ajaran)
      on delete restrict on update restrict;

alter table kelas_kuliah
   add constraint fk_kelas_ku_kelas_mat_matkul foreign key (id_mk)
      references matkul (id_mk)
      on delete restrict on update restrict;

alter table kelas_kuliah
   add constraint fk_kelas_ku_prodi_kel_sms foreign key (id_sms)
      references sms (id_sms)
      on delete restrict on update restrict;

alter table kelas_kuliah
   add constraint fk_kelas_ku_smt_kelas_semester foreign key (id_smt)
      references ref.semester (id_smt)
      on delete restrict on update restrict;

alter table kelompok_bidang
   add constraint fk_kelompok_induk_kel_kelompok foreign key (induk_kelompok_id_kel_bidang)
      references kelompok_bidang (id_kel_bidang)
      on delete restrict on update restrict;

alter table kuliah_mhs
   add constraint fk_kuliah_m_keaktifan_semester foreign key (id_smt)
      references ref.semester (id_smt)
      on delete restrict on update restrict;

alter table kuliah_mhs
   add constraint fk_kuliah_m_register__reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
      on delete restrict on update restrict;

alter table kuliah_mhs
   add constraint fk_kuliah_m_status_mh_status_m foreign key (id_stat_mhs)
      references status_mahasiswa (id_stat_mhs)
      on delete restrict on update restrict;

alter table kurikulum_sp
   add constraint fk_kurikulu_jenjang_k_jenjang_ foreign key (id_jenj_didik)
      references jenjang_pendidikan (id_jenj_didik)
      on delete restrict on update restrict;

alter table lembaga_non_sp
   add constraint fk_lembaga__induk_lem_lembaga_ foreign key (id_induk_lemb_non_sp)
      references lembaga_non_sp (id_lemb_non_sp)
      on delete restrict on update restrict;

alter table lembaga_non_sp
   add constraint fk_lembaga__jenis_lem_jenis_le foreign key (id_jns_lemb)
      references jenis_lembaga (id_jns_lemb)
      on delete restrict on update restrict;

alter table lembaga_non_sp
   add constraint fk_lembaga__wilayah_l_wilayah foreign key (id_wil)
      references wilayah (id_wil)
      on delete restrict on update restrict;

alter table matkul
   add constraint fk_matkul_jenjang_p_jenjang_ foreign key (id_jenj_didik)
      references jenjang_pendidikan (id_jenj_didik)
      on delete restrict on update restrict;

alter table matkul
   add constraint fk_matkul_prodi_mat_sms foreign key (id_sms)
      references sms (id_sms)
      on delete restrict on update restrict;

alter table matkul_kurikulum
   add constraint fk_matkul_k_detail_ma_matkul foreign key (id_mk)
      references matkul (id_mk)
      on delete restrict on update restrict;

alter table nilai_smt_mhs
   add constraint fk_nilai_sm_kls_nilai_kelas_ku foreign key (id_kls)
      references kelas_kuliah (id_kls)
      on delete restrict on update restrict;

alter table nilai_smt_mhs
   add constraint fk_nilai_sm_reg_nilai_reg_ptk foreign key (id_reg_ptk)
      references reg_ptk (id_reg_ptk)
      on delete restrict on update restrict;

alter table nilai_tes
   add constraint fk_nilai_te_test_jeni_jenis_te foreign key (id_jns_tes)
      references jenis_tes (id_jns_tes)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__agama_pd_agama foreign key (id_agama)
      references agama (id_agama)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__alat_tran_alat_tra foreign key (id_alat_transport)
      references alat_transportasi (id_alat_transport)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__foto_pd_large_ob foreign key (id_blob)
      references large_object (id_blob)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__jenis_tin_jenis_ti foreign key (id_jns_tinggal)
      references jenis_tinggal (id_jns_tinggal)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__kk_ayah foreign key (id_kk_ayah)
      references kebutuhan_khusus (id_kk)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__kk_ibu foreign key (id_kk_ibu)
      references kebutuhan_khusus (id_kk)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__kk_pd foreign key (id_kk)
      references kebutuhan_khusus (id_kk)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__kewargane_negara foreign key (id_kewarganegaraan)
      references negara (id_negara)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__pekerjaan_ayah foreign key (id_pekerjaan_ayah)
      references pekerjaan (id_pekerjaan)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__pekerjaan_ibu foreign key (id_pekerjaan_ibu)
      references pekerjaan (id_pekerjaan)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__pekerjaan_wali foreign key (id_pekerjaan_wali)
      references pekerjaan (id_pekerjaan)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__pendidikan_ayah foreign key (id_pendidikan_ayah)
      references jenjang_pendidikan (id_jenj_didik)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__pendidikan_ibu foreign key (id_pendidikan_ibu)
      references jenjang_pendidikan (id_jenj_didik)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__pendidikan_wali foreign key (id_pendidikan_wali)
      references jenjang_pendidikan (id_jenj_didik)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__penghasilan_ayah foreign key (id_penghasilan_ayah)
      references penghasilan (id_penghasilan)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__penghasil_ibu foreign key (id_penghasilan_ibu)
      references penghasilan (id_penghasilan)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__penghasilan_wali foreign key (id_penghasilan_wali)
      references penghasilan (id_penghasilan)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__provinsi__wilayah foreign key (id_wil)
      references wilayah (id_wil)
      on delete restrict on update restrict;

alter table peserta_didik
   add constraint fk_peserta__status_ke_status_m foreign key (id_stat_mhs)
      references status_mahasiswa (id_stat_mhs)
      on delete restrict on update restrict;

alter table prestasi
   add constraint fk_prestasi_prestasi__jenis_pr foreign key (id_jenis_prestasi)
      references jenis_prestasi (id_jenis_prestasi)
      on delete restrict on update restrict;

alter table prestasi
   add constraint fk_prestasi_prestasi__satuan_p foreign key (id_sp)
      references satuan_pendidikan (id_sp)
      on delete restrict on update restrict;

alter table prestasi
   add constraint fk_prestasi_prestasi__peserta_ foreign key (id_pd)
      references peserta_didik (id_pd)
      on delete restrict on update restrict;

alter table prestasi
   add constraint fk_prestasi_prestasi__tingkat_ foreign key (id_tkt_prestasi)
      references tingkat_prestasi (id_tkt_prestasi)
      on delete restrict on update restrict;

alter table profil_prodi
   add constraint fk_profil_p_profil_pr_sms foreign key (id_sms)
      references sms (id_sms)
      on delete restrict on update restrict;

alter table profil_prodi
   add constraint fk_profil_p_tahun_aja_tahun_aj foreign key (id_thn_ajaran)
      references tahun_ajaran (id_thn_ajaran)
      on delete restrict on update restrict;

alter table profil_pt
   add constraint fk_profil_p_profil_sp_satuan_p foreign key (id_sp)
      references satuan_pendidikan (id_sp)
      on delete restrict on update restrict;

alter table profil_pt
   add constraint fk_profil_p_tahun_aja_tahun_aj foreign key (id_thn_ajaran)
      references tahun_ajaran (id_thn_ajaran)
      on delete restrict on update restrict;

alter table pdrd.reg_pd
   add constraint fk_reg_pd_alasan_ke_jenis_ke foreign key (id_jns_keluar)
      references jenis_keluar (id_jns_keluar)
      on delete restrict on update restrict;

alter table pdrd.reg_pd
   add constraint fk_reg_pd_biaya_reg_pembiaya foreign key (id_pembiayaan)
      references ref.pembiayaan (id_pembiayaan)
      on delete restrict on update restrict;

alter table pdrd.reg_pd
   add constraint fk_reg_pd_jalur_daf_jalur_da foreign key (id_jalur_daftar)
      references ref.jalur_daftar (id_jalur_daftar)
      on delete restrict on update restrict;

alter table pdrd.reg_pd
   add constraint fk_reg_pd_jenis_daf_jenis_pe foreign key (id_jns_daftar)
      references jenis_pendaftaran (id_jns_daftar)
      on delete restrict on update restrict;

alter table pdrd.reg_pd
   add constraint fk_reg_pd_prodi_pd_sms foreign key (id_sms)
      references sms (id_sms)
      on delete restrict on update restrict;

alter table pdrd.reg_pd
   add constraint fk_reg_pd_pt_asal_satuan_p foreign key (id_sp_asal)
      references satuan_pendidikan (id_sp)
      on delete restrict on update restrict;

alter table pdrd.reg_pd
   add constraint fk_reg_pd_pt_pd_satuan_p foreign key (id_sp)
      references satuan_pendidikan (id_sp)
      on delete restrict on update restrict;

alter table pdrd.reg_pd
   add constraint fk_reg_pd_register__peserta_ foreign key (id_pd)
      references peserta_didik (id_pd)
      on delete restrict on update restrict;

alter table pdrd.reg_pd
   add constraint fk_reg_pd_semester__semester foreign key (mulai_smt)
      references ref.semester (id_smt)
      on delete restrict on update restrict;

alter table pdrd.reg_pd
   add constraint fk_reg_pd_smt_yudis_semester foreign key (id_smt)
      references ref.semester (id_smt)
      on delete restrict on update restrict;

alter table reg_ptk
   add constraint fk_reg_ptk_ptk_ikata_ikatan_k foreign key (id_ikatan_kerja)
      references ikatan_kerja_sdm (id_ikatan_kerja)
      on delete restrict on update restrict;

alter table reg_ptk
   add constraint fk_reg_ptk_ptk_kelua_jenis_ke foreign key (id_jns_keluar)
      references jenis_keluar (id_jns_keluar)
      on delete restrict on update restrict;

alter table reg_ptk
   add constraint fk_reg_ptk_ptk_terda_satuan_p foreign key (id_sp)
      references satuan_pendidikan (id_sp)
      on delete restrict on update restrict;

alter table reg_ptk
   add constraint fk_reg_ptk_ptk_terda_sdm foreign key (id_sdm)
      references sdm (id_sdm)
      on delete restrict on update restrict;

alter table reg_ptk
   add constraint fk_reg_ptk_reg_dosen_sms foreign key (id_sms)
      references sms (id_sms)
      on delete restrict on update restrict;

alter table reg_ptk
   add constraint fk_reg_ptk_statpeg_p_status_k foreign key (id_stat_pegawai)
      references status_kepegawaian (id_stat_pegawai)
      on delete restrict on update restrict;

alter table rwy_didik_nonformal
   add constraint fk_rwy_didi_prodi_pen_sms foreign key (id_sms)
      references sms (id_sms)
      on delete restrict on update restrict;

alter table rwy_didik_nonformal
   add constraint fk_rwy_didi_rwy_didik_rwy_pend foreign key (id_rwy_didik_formal)
      references rwy_pend_formal (id_rwy_didik_formal)
      on delete restrict on update restrict;

alter table rwy_kepangkatan
   add constraint fk_rwy_kepa_riwayat_p_pangkat_ foreign key (id_pangkat_gol)
      references pangkat_golongan (id_pangkat_gol)
      on delete restrict on update restrict;

alter table rwy_pend_formal
   add constraint fk_rwy_pend_ptk_rwyt__sms foreign key (id_sms)
      references sms (id_sms)
      on delete restrict on update restrict;

alter table rwy_pend_formal
   add constraint fk_rwy_pend_riwayat_g_gelar_ak foreign key (id_gelar_akad)
      references gelar_akademik (id_gelar_akad)
      on delete restrict on update restrict;

alter table rwy_pend_formal
   add constraint fk_rwy_pend_rwyt_pend_bidang_s foreign key (id_bid_studi)
      references bidang_studi (id_bid_studi)
      on delete restrict on update restrict;

alter table rwy_sertifikasi
   add constraint fk_rwy_sert_rwyt_bida_bidang_s foreign key (id_bid_studi)
      references bidang_studi (id_bid_studi)
      on delete restrict on update restrict;

alter table rwy_sertifikasi
   add constraint fk_rwy_sert_rwyt_sert_jenis_se foreign key (id_jns_sert)
      references jenis_sert (id_jns_sert)
      on delete restrict on update restrict;

alter table satuan_pendidikan
   add constraint fk_satuan_p_logo_sp_large_ob foreign key (id_blob)
      references large_object (id_blob)
      on delete restrict on update restrict;

alter table satuan_pendidikan
   add constraint fk_satuan_p_pembina_s_lembaga_ foreign key (id_lemb_non_sp)
      references lembaga_non_sp (id_lemb_non_sp)
      on delete restrict on update restrict;

alter table satuan_pendidikan
   add constraint fk_satuan_p_sp_bentuk_bentuk_p foreign key (id_bp)
      references bentuk_pendidikan (id_bp)
      on delete restrict on update restrict;

alter table satuan_pendidikan
   add constraint fk_satuan_p_sp_milik_status_k foreign key (id_stat_milik)
      references status_kepemilikan (id_stat_milik)
      on delete restrict on update restrict;

alter table satuan_pendidikan
   add constraint fk_satuan_p_wilayah_s_wilayah foreign key (id_wil)
      references wilayah (id_wil)
      on delete restrict on update restrict;

alter table sdm
   add constraint fk_sdm_agama_sdm_agama foreign key (id_agama)
      references agama (id_agama)
      on delete restrict on update restrict;

alter table sdm
   add constraint fk_sdm_keahlian__keahlian foreign key (id_keahlian_lab)
      references keahlian_lab (id_keahlian_lab)
      on delete restrict on update restrict;

alter table sdm
   add constraint fk_sdm_kewargane_negara foreign key (id_negara)
      references negara (id_negara)
      on delete restrict on update restrict;

alter table sdm
   add constraint fk_sdm_lemb_peng_lembaga_ foreign key (id_lemb_angkat)
      references lembaga_pengangkat (id_lemb_angkat)
      on delete restrict on update restrict;

alter table sdm
   add constraint fk_sdm_pekerjaan_pekerjaa foreign key (id_pekerjaan)
      references pekerjaan (id_pekerjaan)
      on delete restrict on update restrict;

alter table sdm
   add constraint fk_sdm_ptk_jenis_jenis_sd foreign key (id_jns_sdm)
      references jenis_sdm (id_jns_sdm)
      on delete restrict on update restrict;

alter table sdm
   add constraint fk_sdm_ptk_kecam_wilayah foreign key (id_wil)
      references wilayah (id_wil)
      on delete restrict on update restrict;

alter table sdm
   add constraint fk_sdm_stataktif_status_k foreign key (id_stat_aktif)
      references status_keaktifan_pegawai (id_stat_aktif)
      on delete restrict on update restrict;

alter table ref.semester
   add constraint fk_semester_ta_semest_tahun_aj foreign key (id_thn_ajaran)
      references tahun_ajaran (id_thn_ajaran)
      on delete restrict on update restrict;

alter table sms
   add constraint fk_sms_fungsi_la_fungsi_l foreign key (id_fungsi_lab)
      references fungsi_lab (id_fungsi_lab)
      on delete restrict on update restrict;

alter table sms
   add constraint fk_sms_induk_sms_sms foreign key (induk_sms_id_sms)
      references sms (id_sms)
      on delete restrict on update restrict;

alter table sms
   add constraint fk_sms_jursp_jur_jurusan foreign key (id_jur)
      references jurusan (id_jur)
      on delete restrict on update restrict;

alter table sms
   add constraint fk_sms_kelompok__kelompok foreign key (id_kel_usaha)
      references kelompok_usaha (id_kel_usaha)
      on delete restrict on update restrict;

alter table sms
   add constraint fk_sms_logo_sms_large_ob foreign key (id_blob)
      references large_object (id_blob)
      on delete restrict on update restrict;

alter table sms
   add constraint fk_sms_progstudi_jenjang_ foreign key (id_jenj_didik)
      references jenjang_pendidikan (id_jenj_didik)
      on delete restrict on update restrict;

alter table sms
   add constraint fk_sms_sms_jenis_jenis_sm foreign key (id_jns_sms)
      references jenis_sms (id_jns_sms)
      on delete restrict on update restrict;

alter table sms
   add constraint fk_sms_sms_sp_satuan_p foreign key (id_sp)
      references satuan_pendidikan (id_sp)
      on delete restrict on update restrict;

alter table sms
   add constraint fk_sms_wilayah_s_wilayah foreign key (id_wil)
      references wilayah (id_wil)
      on delete restrict on update restrict;

alter table substansi_kuliah
   add constraint fk_substans_substansi_jenis_su foreign key (id_jns_subst)
      references jenis_subst (id_jns_subst)
      on delete restrict on update restrict;

alter table uji_mhs
   add constraint fk_uji_mhs_aktmhs_uj_akt_mhs foreign key (id_akt_mhs)
      references akt_mhs (id_akt_mhs)
      on delete restrict on update restrict;

alter table uji_mhs
   add constraint fk_uji_mhs_dosen_pen_sdm foreign key (id_sdm)
      references sdm (id_sdm)
      on delete restrict on update restrict;

alter table wilayah
   add constraint fk_wilayah_induk_wil_wilayah foreign key (induk_wil_id_wil)
      references wilayah (id_wil)
      on delete restrict on update restrict;

alter table wilayah
   add constraint fk_wilayah_wilayah_n_negara foreign key (id_negara)
      references negara (id_negara)
      on delete restrict on update restrict;

