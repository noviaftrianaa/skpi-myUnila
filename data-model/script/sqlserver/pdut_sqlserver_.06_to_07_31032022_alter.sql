/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     31/03/2022 05:12:03                          */
/*==============================================================*/


if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('tracer.hasil_tracer_atasan') and o.name = 'fk_hasil_tr_hasil_ata_hasil_tr')
alter table tracer.hasil_tracer_atasan
   drop constraint fk_hasil_tr_hasil_ata_hasil_tr
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('tracer.hasil_tracer_study') and o.name = 'fk_hasil_tr_bid_kerja_bidang_p')
alter table tracer.hasil_tracer_study
   drop constraint fk_hasil_tr_bid_kerja_bidang_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('tracer.hasil_tracer_study') and o.name = 'fk_hasil_tr_jalur_ker_jenis_ja')
alter table tracer.hasil_tracer_study
   drop constraint fk_hasil_tr_jalur_ker_jenis_ja
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('tracer.hasil_tracer_study') and o.name = 'fk_hasil_tr_lingkup_w_wilayah')
alter table tracer.hasil_tracer_study
   drop constraint fk_hasil_tr_lingkup_w_wilayah
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('tracer.hasil_tracer_study') and o.name = 'fk_hasil_tr_reg_pd_ha_reg_pd')
alter table tracer.hasil_tracer_study
   drop constraint fk_hasil_tr_reg_pd_ha_reg_pd
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
   where r.fkeyid = object_id('kerjasama.mou') and o.name = 'fk_mou_mou_antar_dudi')
alter table kerjasama.mou
   drop constraint fk_mou_mou_antar_dudi
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kerjasama.mou') and o.name = 'fk_mou_mou_antar_satuan_p')
alter table kerjasama.mou
   drop constraint fk_mou_mou_antar_satuan_p
go

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
   where r.fkeyid = object_id('kerjasama.sms_kerjasama') and o.name = 'fk_sms_kerj_bidang_ke_bidang_k')
alter table kerjasama.sms_kerjasama
   drop constraint fk_sms_kerj_bidang_ke_bidang_k
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kerjasama.sms_kerjasama') and o.name = 'fk_sms_kerj_bntk_kerj_bentuk_k')
alter table kerjasama.sms_kerjasama
   drop constraint fk_sms_kerj_bntk_kerj_bentuk_k
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kerjasama.sms_kerjasama') and o.name = 'fk_sms_kerj_kriteria__kriteria')
alter table kerjasama.sms_kerjasama
   drop constraint fk_sms_kerj_kriteria__kriteria
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kerjasama.sms_kerjasama') and o.name = 'fk_sms_kerj_mou_kerja_mou')
alter table kerjasama.sms_kerjasama
   drop constraint fk_sms_kerj_mou_kerja_mou
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kerjasama.sms_kerjasama') and o.name = 'fk_sms_kerj_sms_yang__sms')
alter table kerjasama.sms_kerjasama
   drop constraint fk_sms_kerj_sms_yang__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kerjasama.sms_kerjasama') and o.name = 'fk_sms_kerj_status_ke_status_k')
alter table kerjasama.sms_kerjasama
   drop constraint fk_sms_kerj_status_ke_status_k
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kerjasama.sms_kerjasama') and o.name = 'fk_sms_kerj_sumber_da_sumber_d')
alter table kerjasama.sms_kerjasama
   drop constraint fk_sms_kerj_sumber_da_sumber_d
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kerjasama.sms_kerjasama') and o.name = 'fk_sms_kerj_tingkat_k_tingkat_')
alter table kerjasama.sms_kerjasama
   drop constraint fk_sms_kerj_tingkat_k_tingkat_
go

alter table tracer.hasil_tracer_study
   drop constraint pk_hasil_tracer_study
go

alter table tracer.hasil_tracer_study
   drop constraint ckc_hub_bidang_kerja_hasil_tr
go

alter table tracer.hasil_tracer_study
   drop constraint ckc_tkt_kesesuaian_hasil_tr
go

alter table tracer.hasil_tracer_study
   drop constraint ckc_a_kerja_sblm_lulu_hasil_tr
go

alter table tracer.hasil_tracer_study
   drop constraint ckc_delete_hasil_ts
go

if exists (select 1
            from  sysobjects
           where  id = object_id('tracer.tmp_hasil_tracer_study')
            and   type = 'U')
   drop table tracer.tmp_hasil_tracer_study
go

execute sp_rename 'tracer.hasil_tracer_study', tmp_hasil_tracer_study
go

alter table kerjasama.mou
   drop constraint pk_mou
go

alter table kerjasama.mou
   drop constraint ckc_soft_delete_mou
go

if exists (select 1
            from  sysobjects
           where  id = object_id('kerjasama.tmp_mou')
            and   type = 'U')
   drop table kerjasama.tmp_mou
go

execute sp_rename 'kerjasama.mou', tmp_mou
go

alter table pdrd.re_mk
   drop constraint pk_re_mk
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

alter table kerjasama.sms_kerjasama
   drop constraint pk_sms_kerjasama
go

alter table kerjasama.sms_kerjasama
   drop constraint ckc_soft_delete_sms_kerj
go

if exists (select 1
            from  sysobjects
           where  id = object_id('kerjasama.tmp_sms_kerjasama')
            and   type = 'U')
   drop table kerjasama.tmp_sms_kerjasama
go

execute sp_rename 'kerjasama.sms_kerjasama', tmp_sms_kerjasama
go

/*==============================================================*/
/* Table: acuan_spmi                                            */
/*==============================================================*/
create table acuan_spmi (
   id_acuan_spmi        numeric(2)           identity,
   nm_acuan_spmi        varchar(200)         not null,
   ket                  varchar(250)         null,
   constraint pk_acuan_spmi primary key (id_acuan_spmi)
)
go

/*==============================================================*/
/* Table: aktifitas_kerjasama                                   */
/*==============================================================*/
create table ref.aktifitas_kerjasama (
   id_akt_kerjasama     numeric(2)           identity,
   nm_akt_kerjasama     varchar(100)         not null,
   ket                  varchar(250)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_aktifitas_kerjasama primary key (id_akt_kerjasama)
)
go

/*==============================================================*/
/* Table: hasil_tracer_study                                    */
/*==============================================================*/
create table tracer.hasil_tracer_study (
   id_hasil_tracer_study uniqueidentifier     not null,
   id_thn_ajaran        numeric(4)           not null,
   id_bid_kerja         numeric(2)           null,
   id_wil               char(8)              null,
   id_reg_pd            uniqueidentifier     not null,
   id_smt               char(5)              null,
   id_jns_jalur_kerja   numeric(2)           null,
   wkt_pengisian        datetime             not null,
   wkt_tunggu           numeric(4)           null,
   status_lulusan       numeric(1)           not null,
   jns_tmpt_bekerja     varchar(100)         null,
   nm_tmpt_bekerja      varchar(200)         null,
   income_per_bln       numeric(16,2)        null,
   total_instansi_dilamar numeric(3)           null,
   hub_bidang_kerja     numeric(1)           null default 1
      constraint ckc_hub_bidang_kerja_hasil_tr check (hub_bidang_kerja is null or (hub_bidang_kerja between 1 and 5 and hub_bidang_kerja in (1,2,3,4,5))),
   tkt_kesesuaian       numeric(1)           null default 1
      constraint ckc_tkt_kesesuaian_hasil_tr check (tkt_kesesuaian is null or (tkt_kesesuaian between 1 and 4 and tkt_kesesuaian in (1,2,3,4))),
   alasan_tidak_sesuai  varchar(250)         null,
   a_kerja_sblm_lulus   numeric(1)           null default 0
      constraint ckc_a_kerja_sblm_lulu_hasil_tr check (a_kerja_sblm_lulus is null or (a_kerja_sblm_lulus between 0 and 1 and a_kerja_sblm_lulus in (0,1))),
   ket                  varchar(250)         null,
   level_perusahaan     varchar(50)          null,
   status_jabatan       varchar(40)          null,
   nm_pt_lnjt           varchar(200)         null,
   nm_prodi_lnjt        varchar(150)         null,
   wkt_masuk            datetime             null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_hasil_ts check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_hasil_tracer_study primary key (id_hasil_tracer_study)
)
go

insert into tracer.hasil_tracer_study (id_hasil_tracer_study, id_thn_ajaran, id_bid_kerja, id_wil, id_reg_pd, id_smt, id_jns_jalur_kerja, wkt_pengisian, wkt_tunggu, status_lulusan, jns_tmpt_bekerja, nm_tmpt_bekerja, income_per_bln, total_instansi_dilamar, hub_bidang_kerja, tkt_kesesuaian, alasan_tidak_sesuai, a_kerja_sblm_lulus, ket, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_hasil_tracer_study, id_thn_ajaran, id_bid_kerja, id_wil, id_reg_pd, id_smt, id_jns_jalur_kerja, wkt_pengisian, wkt_tunggu, status_lulusan, jns_tmpt_bekerja, nm_tmpt_bekerja, income_per_bln, total_instansi_dilamar, hub_bidang_kerja, tkt_kesesuaian, alasan_tidak_sesuai, a_kerja_sblm_lulus, ket, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from tracer.tmp_hasil_tracer_study
go

if exists (select 1
            from  sysobjects
           where  id = object_id('tracer.tmp_hasil_tracer_study')
            and   type = 'U')
   drop table tracer.tmp_hasil_tracer_study
go

/*==============================================================*/
/* Table: indikator_spmi                                        */
/*==============================================================*/
create table indikator_spmi (
   id_indikator_spmi    numeric(4)           identity,
   id_acuan_spmi        numeric(2)           null,
   id_jenj_didik        numeric(2)           null,
   nm_indikator_spmi    varchar(200)         not null,
   constraint pk_indikator_spmi primary key (id_indikator_spmi)
)
go

/*==============================================================*/
/* Table: mou                                                   */
/*==============================================================*/
create table kerjasama.mou (
   id_mou               uniqueidentifier     not null,
   id_sp                uniqueidentifier     not null,
   id_akt_kerjasama     numeric(2)           null,
   id_dudi              uniqueidentifier     null,
   sk_mou               varchar(80)          not null,
   judul_mou            varchar(500)         not null,
   uraian_mou           varchar(500)         null,
   tgl_mulai            date                 not null,
   tgl_selesai          date                 not null,
   nm_dudi              varchar(100)         not null,
   npwp_dudi            char(20)             null,
   nm_bu                varchar(50)          not null,
   tel_kantor           varchar(20)          null,
   fax                  varchar(20)          null,
   cp                   varchar(100)         null,
   tel_cp               varchar(20)          null,
   jab_cp               varchar(40)          null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_mou check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_mou primary key (id_mou)
)
go

insert into kerjasama.mou (id_mou, id_sp, id_dudi, sk_mou, judul_mou, uraian_mou, tgl_mulai, tgl_selesai, nm_dudi, npwp_dudi, nm_bu, tel_kantor, fax, cp, tel_cp, jab_cp, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_mou, id_sp, id_dudi, sk_mou, judul_mou, uraian_mou, tgl_mulai, tgl_selesai, nm_dudi, npwp_dudi, nm_bu, tel_kantor, fax, cp, tel_cp, jab_cp, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from kerjasama.tmp_mou
go

if exists (select 1
            from  sysobjects
           where  id = object_id('kerjasama.tmp_mou')
            and   type = 'U')
   drop table kerjasama.tmp_mou
go

/*==============================================================*/
/* Table: re_mk                                                 */
/*==============================================================*/
create table pdrd.re_mk (
   id_basis_evaluasi    numeric(2)           not null,
   id_mk                uniqueidentifier     not null,
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
   last_sync            datetime             not null
)
go

insert into pdrd.re_mk (id_basis_evaluasi, id_mk, komponen_evaluasi, desk_indo, desk_ing, bobot_evaluasi, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_basis_evaluasi, id_mk, komponen_evaluasi, desk_indo, desk_ing, bobot_evaluasi, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_re_mk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_re_mk')
            and   type = 'U')
   drop table pdrd.tmp_re_mk
go

/*==============================================================*/
/* Table: sms_kerjasama                                         */
/*==============================================================*/
create table kerjasama.sms_kerjasama (
   id_sms_kerjasama     uniqueidentifier     not null,
   id_tingkat_kerjasama numeric(2)           not null,
   id_sumber_dana       numeric(4)           null,
   id_stat_kerjasama    numeric(2)           null,
   id_sms               uniqueidentifier     not null,
   id_mou               uniqueidentifier     not null,
   id_bid_kerjasama     numeric(2)           null,
   id_kriteria_mitra    numeric(2)           null,
   id_bntk_giat_kerjasama numeric(2)           null,
   hsl_prod_brg         varchar(200)         null,
   hsl_prod_jasa        varchar(200)         null,
   omzet_barang_per_bulan numeric(16,2)        null,
   omzet_jasa_per_bulan numeric(16,2)        null,
   prestasi_penghargaan varchar(200)         null,
   pangsa_psr_brg       varchar(200)         null,
   pangsa_psr_jasa      varchar(200)         null,
   besaran_kerjasama    numeric(16,2)        null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_sms_kerj check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_sms_kerjasama primary key (id_sms_kerjasama)
)
go

insert into kerjasama.sms_kerjasama (id_sms_kerjasama, id_tingkat_kerjasama, id_sumber_dana, id_stat_kerjasama, id_sms, id_mou, id_bid_kerjasama, id_kriteria_mitra, id_bntk_giat_kerjasama, hsl_prod_brg, hsl_prod_jasa, omzet_barang_per_bulan, omzet_jasa_per_bulan, prestasi_penghargaan, pangsa_psr_brg, pangsa_psr_jasa, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_sms_kerjasama, id_tingkat_kerjasama, id_sumber_dana, id_stat_kerjasama, id_sms, id_mou, id_bid_kerjasama, id_kriteria_mitra, id_bntk_giat_kerjasama, hsl_prod_brg, hsl_prod_jasa, omzet_barang_per_bulan, omzet_jasa_per_bulan, prestasi_penghargaan, pangsa_psr_brg, pangsa_psr_jasa, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from kerjasama.tmp_sms_kerjasama
go

if exists (select 1
            from  sysobjects
           where  id = object_id('kerjasama.tmp_sms_kerjasama')
            and   type = 'U')
   drop table kerjasama.tmp_sms_kerjasama
go

alter table tracer.hasil_tracer_atasan
   add constraint fk_hasil_tr_hasil_ata_hasil_tr foreign key (id_hasil_tracer_study)
      references tracer.hasil_tracer_study (id_hasil_tracer_study)
go

alter table tracer.hasil_tracer_study
   add constraint fk_hasil_tr_bid_kerja_bidang_p foreign key (id_bid_kerja)
      references ref.bidang_pekerjaan (id_bid_kerja)
go

alter table tracer.hasil_tracer_study
   add constraint fk_hasil_tr_jalur_ker_jenis_ja foreign key (id_jns_jalur_kerja)
      references ref.jenis_jalur_pekerjaan (id_jns_jalur_kerja)
go

alter table tracer.hasil_tracer_study
   add constraint fk_hasil_tr_lingkup_w_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table tracer.hasil_tracer_study
   add constraint fk_hasil_tr_reg_pd_ha_reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
go

alter table tracer.hasil_tracer_study
   add constraint fk_hasil_tr_smt_mengi_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table tracer.hasil_tracer_study
   add constraint fk_hasil_tr_tahun_men_tahun_aj foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

alter table indikator_spmi
   add constraint fk_indikato_acuan_ind_acuan_sp foreign key (id_acuan_spmi)
      references acuan_spmi (id_acuan_spmi)
         on update cascade on delete cascade
go

alter table indikator_spmi
   add constraint fk_indikato_jenjang_i_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
         on update cascade on delete cascade
go

alter table kerjasama.mou
   add constraint fk_mou_akt_trida_aktifita foreign key (id_akt_kerjasama)
      references ref.aktifitas_kerjasama (id_akt_kerjasama)
         on update cascade on delete cascade
go

alter table kerjasama.mou
   add constraint fk_mou_mou_antar_dudi foreign key (id_dudi)
      references pdrd.dudi (id_dudi)
go

alter table kerjasama.mou
   add constraint fk_mou_mou_antar_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.re_mk
   add constraint fk_re_mk_basis_eva_basis_ev foreign key (id_basis_evaluasi)
      references ref.basis_evaluasi (id_basis_evaluasi)
go

alter table pdrd.re_mk
   add constraint fk_re_mk_mk_re_mk_matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
go

alter table kerjasama.sms_kerjasama
   add constraint fk_sms_kerj_bidang_ke_bidang_k foreign key (id_bid_kerjasama)
      references ref.bidang_kerjasama (id_bid_kerjasama)
go

alter table kerjasama.sms_kerjasama
   add constraint fk_sms_kerj_bntk_kerj_bentuk_k foreign key (id_bntk_giat_kerjasama)
      references ref.bentuk_kegiatan_kerjasama (id_bntk_giat_kerjasama)
         on update cascade on delete cascade
go

alter table kerjasama.sms_kerjasama
   add constraint fk_sms_kerj_kriteria__kriteria foreign key (id_kriteria_mitra)
      references ref.kriteria_mitra (id_kriteria_mitra)
         on update cascade on delete cascade
go

alter table kerjasama.sms_kerjasama
   add constraint fk_sms_kerj_mou_kerja_mou foreign key (id_mou)
      references kerjasama.mou (id_mou)
go

alter table kerjasama.sms_kerjasama
   add constraint fk_sms_kerj_sms_yang__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table kerjasama.sms_kerjasama
   add constraint fk_sms_kerj_status_ke_status_k foreign key (id_stat_kerjasama)
      references ref.status_kerjasama (id_stat_kerjasama)
         on update cascade on delete cascade
go

alter table kerjasama.sms_kerjasama
   add constraint fk_sms_kerj_sumber_da_sumber_d foreign key (id_sumber_dana)
      references ref.sumber_dana (id_sumber_dana)
go

alter table kerjasama.sms_kerjasama
   add constraint fk_sms_kerj_tingkat_k_tingkat_ foreign key (id_tingkat_kerjasama)
      references ref.tingkat_kerjasama (id_tingkat_kerjasama)
go

INSERT INTO man_akses.versi_db (versi,tgl_update) VALUES ('0.7.0',GETDATE());