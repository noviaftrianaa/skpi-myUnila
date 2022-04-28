/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     22/04/2022 05:04:50                          */
/*==============================================================*/

/*==============================================================*/
/* Table: ekuiv_transfer                                        */
/*==============================================================*/
create table mbkm.ekuiv_transfer (
   id_ekuivalensi       uniqueidentifier     not null,
   id_akt_mhs           uniqueidentifier     null,
   id_mk                uniqueidentifier     not null,
   id_smt               char(5)              null,
   id_reg_pd            uniqueidentifier     not null,
   kode_mk_asal         varchar(20)          not null,
   nm_mk_asal           varchar(200)         not null,
   sks_asal             numeric(5,2)         not null,
   sks_diakui           numeric(3)           not null,
   nilai_huruf_asal     char(3)              not null,
   nilai_huruf_diakui   char(3)              not null,
   nilai_angka_diakui   numeric(4,1)         not null,
   id_sp                uniqueidentifier     null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_ekuiv_tr check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_ekuiv_transfer primary key (id_ekuivalensi)
)
go

/*==============================================================*/
/* Table: nilai_transkrip                                       */
/*==============================================================*/
create table pdrd.nilai_transkrip (
   id_reg_pd            uniqueidentifier     not null,
   id_mk                uniqueidentifier     not null,
   id_kls               uniqueidentifier     not null,
   id_konversi_aktivitas uniqueidentifier     null,
   id_ekuivalensi       uniqueidentifier     null,
   nilai_angka          numeric(4,1)         null,
   nilai_huruf          char(3)              null,
   nilai_indeks         numeric(4,2)         null,
   smt_ke               numeric(2)           not null,
   sks_mk               numeric(5,2)         not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_nilai_tr check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_nilai_transkrip primary key (id_reg_pd, id_mk, id_kls)
)
go

alter table mbkm.ekuiv_transfer
   add constraint fk_ekuiv_tr_akt_mhs_e_akt_mhs foreign key (id_akt_mhs)
      references pdrd.akt_mhs (id_akt_mhs)
         on update cascade on delete cascade
go

alter table mbkm.ekuiv_transfer
   add constraint fk_ekuiv_tr_mk_ekuiv__matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
         on update cascade on delete cascade
go

alter table mbkm.ekuiv_transfer
   add constraint fk_ekuiv_tr_reg_pd_ek_reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
         on update cascade on delete cascade
go

alter table mbkm.ekuiv_transfer
   add constraint fk_ekuiv_tr_smt_ekuiv_semester foreign key (id_smt)
      references ref.semester (id_smt)
         on update cascade on delete cascade
go

alter table mbkm.ekuiv_transfer
   add constraint fk_ekuiv_tr_sp_ekuiv__satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
         on update cascade on delete cascade
go

alter table pdrd.nilai_transkrip
   add constraint fk_nilai_tr_kelas_tra_kelas_ku foreign key (id_kls)
      references pdrd.kelas_kuliah (id_kls)
         on update cascade on delete cascade
go

alter table pdrd.nilai_transkrip
   add constraint fk_nilai_tr_mk_nilai__matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
         on update cascade on delete cascade
go

alter table pdrd.nilai_transkrip
   add constraint fk_nilai_tr_nilai_eku_ekuiv_tr foreign key (id_ekuivalensi)
      references mbkm.ekuiv_transfer (id_ekuivalensi)
go

alter table pdrd.nilai_transkrip
   add constraint fk_nilai_tr_nilai_kon_konversi foreign key (id_konversi_aktivitas)
      references mbkm.konversi_kampus_merdeka (id_konversi_aktivitas)
         on update cascade on delete cascade
go

alter table pdrd.nilai_transkrip
   add constraint fk_nilai_tr_reg_pd_tr_reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
         on update cascade on delete cascade
go

