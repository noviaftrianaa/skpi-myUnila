/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     21/04/2022 10:01:47                          */
/*==============================================================*/


if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.re_mk') and o.name = 'fk_re_mk_basis_eva_basis_ev')
alter table pdrd.re_mk
   drop constraint fk_re_mk_basis_eva_basis_ev
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.re_mk') and o.name = 'fk_re_mk_mk_re_mk_matkul')
alter table pdrd.re_mk
   drop constraint fk_re_mk_mk_re_mk_matkul
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rencana_ajar') and o.name = 'fk_rencana__rencana_m_matkul')
alter table pdrd.rencana_ajar
   drop constraint fk_rencana__rencana_m_matkul
go

alter table pdrd.re_mk 
   drop constraint ckc_komponen_evaluasi_re_mk
go
alter table pdrd.re_mk 
   drop constraint ckc_bobot_evaluasi_re_mk
go

alter table pdrd.re_mk
   drop constraint ckc_soft_delete_re_mk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_re_mk')
            and   type = 'U')
   drop table pdrd.tmp_re_mk
go

execute sp_rename 'pdrd.re_mk', tmp_re_mk
go

alter table pdrd.rencana_ajar
   drop constraint pk_rencana_ajar
go

alter table pdrd.rencana_ajar
   drop constraint ckc_soft_delete_rencana_
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_rencana_ajar')
            and   type = 'U')
   drop table pdrd.tmp_rencana_ajar
go

execute sp_rename 'pdrd.rencana_ajar', tmp_rencana_ajar
go

/*==============================================================*/
/* Table: re_mk                                                 */
/*==============================================================*/
create table pdrd.re_mk (
   id_re_mk             uniqueidentifier     not null,
   id_jns_eval          smallint             not null,
   id_mk                uniqueidentifier     not null,
   no_urut              int                  null,
   komponen_evaluasi    char(3)              null 
      constraint ckc_komponen_evaluasi_re_mk check (komponen_evaluasi is null or (komponen_evaluasi in ('TGS','QIZ','UTS','UAS'))),
   desk_indo            varchar(1000)        not null,
   desk_ing             varchar(1000)        null,
   bobot_evaluasi       numeric(5,2)         null 
      constraint ckc_bobot_evaluasi_re_mk check (bobot_evaluasi is null or (bobot_evaluasi between 0 and 100)),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_re_mk check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_re_mk primary key nonclustered (id_re_mk)
)
go

if exists (select 1
	from  sysobjects
	where  id = object_id('pdrd.tmp_re_mk')
	and   type = 'U')
	drop table pdrd.tmp_re_mk
go

/*==============================================================*/
/* Table: rencana_ajar                                          */
/*==============================================================*/
create table pdrd.rencana_ajar (
   id_renc_ajar         uniqueidentifier     not null,
   id_mk                uniqueidentifier     not null,
   no_urut              int                  null,
   pertemuan            numeric(2)           not null,
   materi_indonesia     varchar(1000)        null,
   materi_inggris       varchar(1000)        null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_rencana_ check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_rencana_ajar primary key (id_renc_ajar)
)
go

insert into pdrd.rencana_ajar (id_renc_ajar, id_mk, pertemuan, materi_indonesia, materi_inggris, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_renc_ajar, id_mk, pertemuan, materi_indonesia, materi_inggris, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_rencana_ajar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_rencana_ajar')
            and   type = 'U')
   drop table pdrd.tmp_rencana_ajar
go

alter table pdrd.re_mk
   add constraint fk_re_mk_jns_evalu_jenis_ev foreign key (id_jns_eval)
      references ref.jenis_evaluasi (id_jns_eval)
         on update cascade on delete cascade
go

alter table pdrd.re_mk
   add constraint fk_re_mk_mk_re_mk_matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
go

alter table pdrd.rencana_ajar
   add constraint fk_rencana__rencana_m_matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
go

