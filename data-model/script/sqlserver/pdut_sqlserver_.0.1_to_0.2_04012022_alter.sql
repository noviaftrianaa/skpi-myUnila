/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     04/01/2022 11:56:45                          */
/*==============================================================*/


if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_mhs') and o.name = 'fk_akt_mhs_jenis_akt_jenis_ak')
alter table pdrd.akt_mhs
   drop constraint fk_akt_mhs_jenis_akt_jenis_ak
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_mhs') and o.name = 'fk_akt_mhs_smt_akt_m_semester')
alter table pdrd.akt_mhs
   drop constraint fk_akt_mhs_smt_akt_m_semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.alat_long') and o.name = 'fk_alat_lon_smt_pemak_semester')
alter table sarpras.alat_long
   drop constraint fk_alat_lon_smt_pemak_semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('tracer.hasil_tracer_study') and o.name = 'fk_hasil_tr_smt_mengi_semester')
alter table tracer.hasil_tracer_study
   drop constraint fk_hasil_tr_smt_mengi_semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('tracer.hasil_tracer_study') and o.name = 'fk_hasil_tr_tahun_men_tahun_aj')
alter table tracer.hasil_tracer_study
   drop constraint fk_hasil_tr_tahun_men_tahun_aj
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.keaktifan_ptk') and o.name = 'fk_keaktifa_tahun_kea_tahun_aj')
alter table pdrd.keaktifan_ptk
   drop constraint fk_keaktifa_tahun_kea_tahun_aj
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kelas_kuliah') and o.name = 'fk_kelas_ku_smt_kelas_semester')
alter table pdrd.kelas_kuliah
   drop constraint fk_kelas_ku_smt_kelas_semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kuliah_mhs') and o.name = 'fk_kuliah_m_keaktifan_semester')
alter table pdrd.kuliah_mhs
   drop constraint fk_kuliah_m_keaktifan_semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.pengelola_jurnal') and o.name = 'fk_pengelol_jurnal_ke_media_pu')
alter table pdrd.pengelola_jurnal
   drop constraint fk_pengelol_jurnal_ke_media_pu
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.profil_prodi') and o.name = 'fk_ta_profil_prodi')
alter table pdrd.profil_prodi
   drop constraint fk_ta_profil_prodi
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.profil_pt') and o.name = 'fk_ta_profil_pt')
alter table pdrd.profil_pt
   drop constraint fk_ta_profil_pt
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.publikasi') and o.name = 'fk_publikas_pub_media_media_pu')
alter table pdrd.publikasi
   drop constraint fk_publikas_pub_media_media_pu
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_pd') and o.name = 'fk_reg_pd_semester__semester')
alter table pdrd.reg_pd
   drop constraint fk_reg_pd_semester__semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_pd') and o.name = 'fk_reg_pd_smt_yudis_semester')
alter table pdrd.reg_pd
   drop constraint fk_reg_pd_smt_yudis_semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.semester') and o.name = 'fk_semester_ta_semest_tahun_aj')
alter table ref.semester
   drop constraint fk_semester_ta_semest_tahun_aj
go

alter table ref.jenis_akt_mhs
   drop constraint pk_jenis_akt_mhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_akt_mhs')
            and   type = 'U')
   drop table ref.tmp_jenis_akt_mhs
go

execute sp_rename 'ref.jenis_akt_mhs', tmp_jenis_akt_mhs
go

alter table ref.media_publikasi
   drop constraint pk_media_publikasi
go

alter table ref.media_publikasi
   drop constraint ckc_bentuk_media_pub_media_pu
go
alter table ref.media_publikasi
   drop constraint ckc_jns_penerbit_media_pu
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_media_publikasi')
            and   type = 'U')
   drop table ref.tmp_media_publikasi
go

execute sp_rename 'ref.media_publikasi', tmp_media_publikasi
go

alter table ref.semester
   drop constraint pk_semester
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_semester')
            and   type = 'U')
   drop table ref.tmp_semester
go

execute sp_rename 'ref.semester', tmp_semester
go

alter table ref.tahun_ajaran
   drop constraint pk_tahun_ajaran
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_tahun_ajaran')
            and   type = 'U')
   drop table ref.tmp_tahun_ajaran
go

execute sp_rename 'ref.tahun_ajaran', tmp_tahun_ajaran
go

/*==============================================================*/
/* Table: jenis_akt_mhs                                         */
/*==============================================================*/
create table ref.jenis_akt_mhs (
   id_jns_akt_mhs       numeric(2)           not null,
   nm_jns_akt_mhs       varchar(50)          not null,
   ket_jns_akt_mhs      varchar(100)         null,
   a_kegiatan_kampus_merdeka numeric(1)           not null default 0
      constraint ckc_a_kegiatan_kampus_jenis_ak check (a_kegiatan_kampus_merdeka between 0 and 1 and a_kegiatan_kampus_merdeka in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_akt_mhs primary key (id_jns_akt_mhs)
)
go

insert into ref.jenis_akt_mhs (id_jns_akt_mhs, nm_jns_akt_mhs, ket_jns_akt_mhs, create_date, last_update, expired_date, last_sync)
select id_jns_akt_mhs, nm_jns_akt_mhs, ket_jns_akt_mhs, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_akt_mhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_akt_mhs')
            and   type = 'U')
   drop table ref.tmp_jenis_akt_mhs
go

/*==============================================================*/
/* Table: jenis_media_pub                                       */
/*==============================================================*/
create table ref.jenis_media_pub (
   id_jns_media         numeric(2)           not null,
   nm_jns_media         varchar(80)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_media_pub primary key (id_jns_media)
)
go

/*==============================================================*/
/* Table: media_publikasi                                       */
/*==============================================================*/
create table ref.media_publikasi (
   id_media_pub         uniqueidentifier     not null,
   id_jns_media         numeric(2)           not null,
   id_kel_bidang        uniqueidentifier     not null,
   id_sp                uniqueidentifier     null,
   id_negara            char(2)              not null,
   nm_media_pub         varchar(120)         not null,
   bentuk_media_pub     char(1)              null 
      constraint ckc_bentuk_media_pub_media_pu check (bentuk_media_pub is null or (bentuk_media_pub in ('C','E'))),
   grade_sinta          char(1)              null,
   jns_penerbit         char(1)              null 
      constraint ckc_jns_penerbit_media_pu check (jns_penerbit is null or (jns_penerbit in ('P','L'))),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_media_publikasi primary key (id_media_pub)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_media_publikasi')
            and   type = 'U')
   drop table ref.tmp_media_publikasi
go
/*==============================================================*/
/* Table: semester                                              */
/*==============================================================*/
create table ref.semester (
   id_smt               char(5)              not null,
   id_thn_ajaran        numeric(4)           not null,
   tgl_mulai            datetime             not null,
   tgl_selesai          datetime             not null,
   nm_smt               varchar(50)          not null,
   smt                  numeric(2)           not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_semester primary key (id_smt)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_semester')
            and   type = 'U')
   drop table ref.tmp_semester
go
/*==============================================================*/
/* Table: tahun_ajaran                                          */
/*==============================================================*/
create table ref.tahun_ajaran (
   id_thn_ajaran        numeric(4)           not null,
   tgl_mulai            datetime             not null,
   tgl_selesai          datetime             not null,
   nm_thn_ajaran        varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_tahun_ajaran primary key (id_thn_ajaran)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_tahun_ajaran')
            and   type = 'U')
   drop table ref.tmp_tahun_ajaran
go
alter table pdrd.akt_mhs
   add constraint fk_akt_mhs_jenis_akt_jenis_ak foreign key (id_jns_akt_mhs)
      references ref.jenis_akt_mhs (id_jns_akt_mhs)
go

alter table pdrd.akt_mhs
   add constraint fk_akt_mhs_smt_akt_m_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table sarpras.alat_long
   add constraint fk_alat_lon_smt_pemak_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table tracer.hasil_tracer_study
   add constraint fk_hasil_tr_smt_mengi_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table tracer.hasil_tracer_study
   add constraint fk_hasil_tr_tahun_men_tahun_aj foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

alter table pdrd.keaktifan_ptk
   add constraint fk_keaktifa_tahun_kea_tahun_aj foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

alter table pdrd.kelas_kuliah
   add constraint fk_kelas_ku_smt_kelas_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table pdrd.kuliah_mhs
   add constraint fk_kuliah_m_keaktifan_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table ref.media_publikasi
   add constraint fk_media_pu_bidang_me_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
         on update cascade on delete cascade
go

alter table ref.media_publikasi
   add constraint fk_media_pu_jenis_med_jenis_me foreign key (id_jns_media)
      references ref.jenis_media_pub (id_jns_media)
         on update cascade on delete cascade
go

alter table ref.media_publikasi
   add constraint fk_media_pu_negara_me_negara foreign key (id_negara)
      references ref.negara (id_negara)
         on update cascade on delete cascade
go

alter table ref.media_publikasi
   add constraint fk_media_pu_sp_media__satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
         on update cascade on delete cascade
go

alter table pdrd.pengelola_jurnal
   add constraint fk_pengelol_jurnal_ke_media_pu foreign key (id_media_pub)
      references ref.media_publikasi (id_media_pub)
go

alter table pdrd.profil_prodi
   add constraint fk_ta_profil_prodi foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

alter table pdrd.profil_pt
   add constraint fk_ta_profil_pt foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

alter table pdrd.publikasi
   add constraint fk_publikas_pub_media_media_pu foreign key (id_media_pub)
      references ref.media_publikasi (id_media_pub)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_semester__semester foreign key (id_semester_masuk)
      references ref.semester (id_smt)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_smt_yudis_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table ref.semester
   add constraint fk_semester_ta_semest_tahun_aj foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

INSERT INTO man_akses.versi_db (versi,tgl_update) VALUES ('0.2.0',GETDATE())