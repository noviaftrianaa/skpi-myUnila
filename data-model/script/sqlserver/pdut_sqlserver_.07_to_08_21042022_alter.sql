/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     21/04/2022 00:51:20                          */
/*==============================================================*/


if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kurikulum_sp') and o.name = 'fk_kurikulu_jenjang_k_jenjang_')
alter table pdrd.kurikulum_sp
   drop constraint fk_kurikulu_jenjang_k_jenjang_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kurikulum_sp') and o.name = 'fk_kurikulu_sms_kurik_sms')
alter table pdrd.kurikulum_sp
   drop constraint fk_kurikulu_sms_kurik_sms
go

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
   where r.fkeyid = object_id('pdrd.nilai_smt_mhs') and o.name = 'fk_nilai_sm_kls_nilai_kelas_ku')
alter table pdrd.nilai_smt_mhs
   drop constraint fk_nilai_sm_kls_nilai_kelas_ku
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.nilai_smt_mhs') and o.name = 'fk_nilai_sm_reg_nilai_reg_ptk')
alter table pdrd.nilai_smt_mhs
   drop constraint fk_nilai_sm_reg_nilai_reg_ptk
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

alter table pdrd.nilai_smt_mhs
   drop constraint pk_nilai_smt_mhs
go

alter table pdrd.nilai_smt_mhs
   drop constraint ckc_soft_delete_nilai_sm
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_nilai_smt_mhs')
            and   type = 'U')
   drop table pdrd.tmp_nilai_smt_mhs
go

execute sp_rename 'pdrd.nilai_smt_mhs', tmp_nilai_smt_mhs
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
/* User: pmb                                                    */
/*==============================================================*/
create schema pmb
go

/*==============================================================*/
/* Table: daya_tampung                                          */
/*==============================================================*/
create table pmb.daya_tampung (
   id_periode_pmb       uniqueidentifier     not null,
   id_smt               char(5)              not null,
   id_sms               uniqueidentifier     not null,
   target_mhs_baru      numeric(6)           null,
   calon_ikut_seleksi   numeric(6)           null,
   calon_pilihan_1      numeric(6)           null,
   calon_pilihan_2      numeric(6)           null,
   calon_pilihan_3      numeric(6)           null,
   ketetatan_statistik  numeric(7,4)         null,
   ketetatan_probabilitas numeric(7,4)         null,
   calon_lulus_seleksi  numeric(6)           null,
   daftar_sbg_mhs       numeric(6)           null,
   pst_undur_diri       numeric(5)           null,
   tgl_awal_kul         datetime             null,
   tgl_akhir_kul        datetime             null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_daya_tam check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_daya_tampung primary key (id_smt, id_sms, id_periode_pmb)
)
go

/*==============================================================*/
/* Table: kurikulum_sp                                          */
/*==============================================================*/
create table pdrd.kurikulum_sp (
   id_kurikulum_sp      uniqueidentifier     not null,
   id_jenj_didik        numeric(2)           not null,
   id_smt               char(5)              not null,
   id_sms               uniqueidentifier     not null,
   nm_kurikulum_sp      varchar(100)         not null,
   jmlh_smt_normal      numeric(2)           null,
   a_digunakan          numeric(1)           not null default 0
      constraint ckc_a_digunakan_kurikulu check (a_digunakan between 0 and 1 and a_digunakan in (0,1)),
   jmlh_sks_lulus       numeric(5,2)         null,
   jmlh_sks_wajib       numeric(5,2)         null,
   jmlh_sks_pilihan     numeric(5,2)         null,
   jmlh_sks_mk_wajib    numeric(5,2)         null,
   jmlh_sks_mk_pilih    numeric(5,2)         null,
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
/* Table: nilai_smt_mhs                                         */
/*==============================================================*/
create table pdrd.nilai_smt_mhs (
   id_reg_pd            uniqueidentifier     not null,
   id_kls               uniqueidentifier     not null,
   nilai_angka          numeric(4,1)         null,
   nilai_huruf          char(3)              null,
   nilai_indeks         numeric(4,2)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_nilai_sm check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_nilai_smt_mhs primary key (id_reg_pd, id_kls)
)
go

if exists (select 1
	from  sysobjects
	where  id = object_id('pdrd.tmp_nilai_smt_mhs')
	and   type = 'U')
	drop table pdrd.tmp_nilai_smt_mhs
go

/*==============================================================*/
/* Table: pengguna                                              */
/*==============================================================*/
create table man_akses.pengguna (
   id_pengguna          uniqueidentifier     not null,
   username             varchar(60)          not null,
   password             varchar(50)          not null,
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

insert into man_akses.pengguna (id_pengguna, username, password, nm_pengguna, tempat_lahir, tgl_lahir, jenis_kelamin, alamat, no_tel, no_hp, approval_pengguna, a_aktif, tgl_ganti_pwd, id_sdm_pengguna, id_pd_pengguna, id_calon_pd_pengguna, token_reg, jabatan, provider, disable, tgl_create, last_update, soft_delete, last_sync, id_updater)
select id_pengguna, username, password, nm_pengguna, tempat_lahir, tgl_lahir, jenis_kelamin, alamat, no_tel, no_hp, approval_pengguna, a_aktif, tgl_ganti_pwd, id_sdm_pengguna, id_pd_pengguna, id_calon_pd_pengguna, token_reg, jabatan, provider, disable, tgl_create, last_update, soft_delete, last_sync, id_updater
from man_akses.tmp_pengguna
go

if exists (select 1
            from  sysobjects
           where  id = object_id('man_akses.tmp_pengguna')
            and   type = 'U')
   drop table man_akses.tmp_pengguna
go

/*==============================================================*/
/* Table: periode_pmb                                           */
/*==============================================================*/
create table pmb.periode_pmb (
   id_periode_pmb       uniqueidentifier     not null,
   id_pembiayaan        numeric(2)           not null,
   id_jenj_didik        numeric(2)           not null,
   id_jns_daftar        numeric(2)           not null,
   id_thn_ajaran        numeric(4)           not null,
   id_jalur_daftar      numeric              not null,
   nm_periode_pmb       varchar(60)          not null,
   gelombang            numeric(2)           null,
   smt                  numeric(2)           null,
   a_internal           numeric(1)           null default 0
      constraint ckc_a_internal_periode_ check (a_internal is null or (a_internal between 0 and 1 and a_internal in (0,1))),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_periode_pmb check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_periode_pmb primary key (id_periode_pmb)
)
go

alter table pmb.daya_tampung
   add constraint fk_daya_tam_daya_tamp_periode_ foreign key (id_periode_pmb)
      references pmb.periode_pmb (id_periode_pmb)
         on update cascade on delete cascade
go

alter table pmb.daya_tampung
   add constraint fk_daya_tam_daya_tamp_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
         on update cascade on delete cascade
go

alter table pmb.daya_tampung
   add constraint fk_daya_tam_smt_daya__semester foreign key (id_smt)
      references ref.semester (id_smt)
         on update cascade on delete cascade
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

alter table pdrd.kurikulum_sp
   add constraint fk_kurikulu_smt_kurik_semester foreign key (id_smt)
      references ref.semester (id_smt)
         on update cascade on delete cascade
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

alter table pdrd.nilai_smt_mhs
   add constraint fk_nilai_sm_kls_nilai_kelas_ku foreign key (id_kls)
      references pdrd.kelas_kuliah (id_kls)
go

alter table pdrd.nilai_smt_mhs
   add constraint fk_nilai_sm_reg_nilai_reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
go

alter table pmb.periode_pmb
   add constraint fk_periode__jalur_daf_jalur_da foreign key (id_jalur_daftar)
      references ref.jalur_daftar (id_jalur_daftar)
         on update cascade on delete cascade
go

alter table pmb.periode_pmb
   add constraint fk_periode__jenis_pen_jenis_pe foreign key (id_jns_daftar)
      references ref.jenis_pendaftaran (id_jns_daftar)
         on update cascade on delete cascade
go

alter table pmb.periode_pmb
   add constraint fk_periode__jenjang_p_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
         on update cascade on delete cascade
go

alter table pmb.periode_pmb
   add constraint fk_periode__pembiayaa_pembiaya foreign key (id_pembiayaan)
      references ref.pembiayaan (id_pembiayaan)
         on update cascade on delete cascade
go

alter table pmb.periode_pmb
   add constraint fk_periode__thn_ajara_tahun_aj foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
         on update cascade on delete cascade
go

alter table man_akses.pj_aplikasi
   add constraint fk_pj_aplik_akun_pj_a_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

alter table man_akses.role_pengguna
   add constraint fk_role_pen_peran_pen_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

INSERT INTO man_akses.versi_db (versi,tgl_update) VALUES ('0.8.0',GETDATE());