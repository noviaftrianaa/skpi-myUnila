/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     04/04/2022 09:41:43                          */
/*==============================================================*/


if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_ajar_dosen') and o.name = 'fk_akt_ajar_mengajar__substans')
alter table pdrd.akt_ajar_dosen
   drop constraint fk_akt_ajar_mengajar__substans
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kurikulum_sp') and o.name = 'fk_kurikulu_jenjang_k_jenjang_')
alter table pdrd.kurikulum_sp
   drop constraint fk_kurikulu_jenjang_k_jenjang_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.substansi_kuliah') and o.name = 'fk_substans_substansi_jenis_su')
alter table pdrd.substansi_kuliah
   drop constraint fk_substans_substansi_jenis_su
go

alter table pdrd.kurikulum_sp
   drop constraint pk_kurikulum_sp
go

alter table pdrd.kurikulum_sp
   drop constraint ckc_a_digunakan_kurikulu
go

alter table pdrd.kurikulum_sp
   drop constraint ckc_soft_delete_kurikulu
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_kurikulum_sp')
            and   type = 'U')
   drop table pdrd.tmp_kurikulum_sp
go

execute sp_rename 'pdrd.kurikulum_sp', tmp_kurikulum_sp
go

alter table pdrd.substansi_kuliah
   drop constraint pk_substansi_kuliah
go

alter table pdrd.substansi_kuliah
   drop constraint ckc_soft_delete_substans
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_substansi_kuliah')
            and   type = 'U')
   drop table pdrd.tmp_substansi_kuliah
go

execute sp_rename 'pdrd.substansi_kuliah', tmp_substansi_kuliah
go

/*==============================================================*/
/* Table: kurikulum_sp                                          */
/*==============================================================*/
create table pdrd.kurikulum_sp (
   id_kurikulum_sp      uniqueidentifier     not null,
   id_jenj_didik        numeric(2)           not null,
   id_sms               uniqueidentifier     not null,
   nm_kurikulum_sp      varchar(100)         not null,
   jmlh_smt_normal      numeric(2)           null,
   a_digunakan          numeric(1)           not null default 0
      constraint ckc_a_digunakan_kurikulu check (a_digunakan between 0 and 1 and a_digunakan in (0,1)),
   jmlh_sks_lulus       numeric(5,2)         null,
   jmlh_sks_wajib       numeric(5,2)         null,
   jmlh_sks_pilihan     numeric(5,2)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_kurikulu check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_kurikulum_sp primary key (id_kurikulum_sp)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_kurikulum_sp')
            and   type = 'U')
   drop table pdrd.tmp_kurikulum_sp
go

/*==============================================================*/
/* Table: substansi_kuliah                                      */
/*==============================================================*/
create table pdrd.substansi_kuliah (
   id_subst             uniqueidentifier     not null,
   id_sms               uniqueidentifier     null,
   id_jns_subst         char(5)              not null,
   nm_subst             varchar(50)          not null,
   sks_mk               numeric(5,2)         null,
   sks_tm               numeric(5,2)         null,
   sks_prak             numeric(5,2)         null,
   sks_prak_lap         numeric(5,2)         null,
   sks_sim              numeric(5,2)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_substans check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_substansi_kuliah primary key (id_subst)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_substansi_kuliah')
            and   type = 'U')
   drop table pdrd.tmp_substansi_kuliah
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_mengajar__substans foreign key (id_subst)
      references pdrd.substansi_kuliah (id_subst)
go

alter table pdrd.kurikulum_sp
   add constraint fk_kurikulu_jenjang_k_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.kurikulum_sp
   add constraint fk_kurikulu_sms_kurik_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
         on update cascade on delete cascade
go

alter table pdrd.substansi_kuliah
   add constraint fk_substans_substansi_jenis_su foreign key (id_jns_subst)
      references ref.jenis_subst (id_jns_subst)
go

alter table pdrd.substansi_kuliah
   add constraint fk_substans_substansi_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
         on update cascade on delete cascade
go

