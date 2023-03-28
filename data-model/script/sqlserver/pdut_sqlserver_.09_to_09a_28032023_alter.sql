/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     28/03/2023 22:59:11                          */
/*==============================================================*/


if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('logger.log_jwt') and o.name = 'fk_log_jwt_log_pengg_pengguna')
alter table logger.log_jwt
   drop constraint fk_log_jwt_log_pengg_pengguna
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('logger.log_login') and o.name = 'fk_log_logi_log_login_pengguna')
alter table logger.log_login
   drop constraint fk_log_logi_log_login_pengguna
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('logger.log_pengguna') and o.name = 'fk_log_peng_log_pengu_pengguna')
alter table logger.log_pengguna
   drop constraint fk_log_peng_log_pengu_pengguna
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('logger.log_table_app') and o.name = 'fk_log_tabl_log_pengg_pengguna')
alter table logger.log_table_app
   drop constraint fk_log_tabl_log_pengg_pengguna
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('man_akses.pj_aplikasi') and o.name = 'fk_pj_aplik_akun_pj_a_pengguna')
alter table man_akses.pj_aplikasi
   drop constraint fk_pj_aplik_akun_pj_a_pengguna
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('man_akses.role_pengguna') and o.name = 'fk_role_pen_peran_pen_pengguna')
alter table man_akses.role_pengguna
   drop constraint fk_role_pen_peran_pen_pengguna
go

alter table man_akses.pengguna
   drop constraint pk_pengguna
go

alter table man_akses.pengguna 
   drop constraint ckc_jenis_kelamin_pengguna
go

alter table man_akses.pengguna
   drop constraint ckc_approval_pengguna_pengguna
go

alter table man_akses.pengguna
   drop constraint ckc_a_aktif_pengguna
go

alter table man_akses.pengguna
   drop constraint ckc_disable_pengguna
go

alter table man_akses.pengguna
   drop constraint ckc_soft_delete_pengguna
go

if exists (select 1
            from  sysobjects
           where  id = object_id('man_akses.tmp_pengguna')
            and   type = 'U')
   drop table man_akses.tmp_pengguna
go

execute sp_rename 'man_akses.pengguna', tmp_pengguna
go

/*==============================================================*/
/* Table: pengguna                                              */
/*==============================================================*/
create table man_akses.pengguna (
   id_pengguna          uniqueidentifier     not null,
   username             varchar(60)          not null,
   password             varchar(50)          not null,
   password_encrypt     varchar(255)         null,
   type_encrypt         varchar(80)          null,
   nm_pengguna          varchar(200)         null,
   email                varchar(60)          null,
   tempat_lahir         varchar(60)          null,
   tgl_lahir            date                 null,
   jenis_kelamin        char(1)              not null 
      constraint ckc_jenis_kelamin_pengguna check (jenis_kelamin in ('L','P','*')),
   alamat               varchar(255)         null,
   no_tel               varchar(20)          null,
   no_hp                varchar(20)          null,
   approval_pengguna    numeric(1)           not null default 0
      constraint ckc_approval_pengguna_pengguna check (approval_pengguna between 0 and 1 and approval_pengguna in (0,1)),
   a_aktif              numeric(1)           not null default 1
      constraint ckc_a_aktif_pengguna check (a_aktif between 0 and 1 and a_aktif in (0,1)),
   tgl_ganti_pwd        date                 null,
   id_sdm_pengguna      uniqueidentifier     null,
   id_pd_pengguna       uniqueidentifier     null,
   id_calon_pd_pengguna uniqueidentifier     null,
   id_user_sikep        int                  null,
   token_reg            varchar(100)         null,
   jabatan              varchar(80)          null,
   provider             varchar(500)         null,
   disable              numeric(1)           not null default 0
      constraint ckc_disable_pengguna check (disable between 0 and 1 and disable in (0,1)),
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_pengguna check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   id_updater           uniqueidentifier     not null,
   constraint pk_pengguna primary key (id_pengguna)
)
go

insert into man_akses.pengguna (id_pengguna, username, password, nm_pengguna, email, tempat_lahir, tgl_lahir, jenis_kelamin, alamat, no_tel, no_hp, approval_pengguna, a_aktif, tgl_ganti_pwd, id_sdm_pengguna, id_pd_pengguna, id_calon_pd_pengguna, token_reg, jabatan, provider, disable, tgl_create, last_update, soft_delete, last_sync, id_updater)
select id_pengguna, username, password, nm_pengguna, email, tempat_lahir, tgl_lahir, jenis_kelamin, alamat, no_tel, no_hp, approval_pengguna, a_aktif, tgl_ganti_pwd, id_sdm_pengguna, id_pd_pengguna, id_calon_pd_pengguna, token_reg, jabatan, provider, disable, tgl_create, last_update, soft_delete, last_sync, id_updater
from man_akses.tmp_pengguna
go

if exists (select 1
            from  sysobjects
           where  id = object_id('man_akses.tmp_pengguna')
            and   type = 'U')
   drop table man_akses.tmp_pengguna
go

alter table logger.log_jwt
   add constraint fk_log_jwt_log_pengg_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

alter table logger.log_login
   add constraint fk_log_logi_log_login_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

alter table logger.log_pengguna
   add constraint fk_log_peng_log_pengu_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

alter table logger.log_table_app
   add constraint fk_log_tabl_log_pengg_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

alter table man_akses.pj_aplikasi
   add constraint fk_pj_aplik_akun_pj_a_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

alter table man_akses.role_pengguna
   add constraint fk_role_pen_peran_pen_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

