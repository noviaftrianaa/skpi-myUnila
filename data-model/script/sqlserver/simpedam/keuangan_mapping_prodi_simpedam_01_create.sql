/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     21/01/2026 09:00:00                          */
/* Description:    Mapping Prodi SIMPEDAM to MyUnila            */
/*==============================================================*/

/*==============================================================*/
/* Table: mapping_prodi_simpedam                                */
/* Mapping antara id_prodi SIMPEDAM dengan id_sms MyUnila       */
/* Kriteria mapping:                                            */
/*   - stat_prodi = 'A' (aktif)                                 */
/*   - id_sp = 'e2b705a7-173e-464a-9fac-509128709515' (UNILA)  */
/*   - kode_strata 3=D3, 4=S1 Reguler, 7=S1 Non-Reg/Paralel    */
/*==============================================================*/
create table keuangan.mapping_prodi_simpedam (
   id_mapping           int                  identity(1,1) not null,
   id_prodi_simpedam    uniqueidentifier     not null,
   nama_prodi_simpedam  varchar(255)         not null,
   kode_strata          numeric(2)           not null
      constraint ckc_kode_strata_mapping check (kode_strata in (3,4,7)),
   id_sms               uniqueidentifier     not null,
   nama_prodi_myunila   varchar(255)         null,
   is_active            numeric(1)           not null default 1
      constraint ckc_is_active_mapping check (is_active between 0 and 1 and is_active in (0,1)),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_mapping check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_mapping_prodi_simpedam primary key (id_mapping)
)
go

/*==============================================================*/
/* Index: idx_mapping_prodi_simpedam_1                          */
/* Unique constraint: 1 id_prodi_simpedam + kode_strata = 1 row */
/*==============================================================*/
create unique index idx_mapping_prodi_simpedam_1 on keuangan.mapping_prodi_simpedam (
   id_prodi_simpedam asc,
   kode_strata asc
)
go

/*==============================================================*/
/* Index: idx_mapping_prodi_simpedam_2                          */
/* For lookup by id_sms                                         */
/*==============================================================*/
create index idx_mapping_prodi_simpedam_2 on keuangan.mapping_prodi_simpedam (
   id_sms asc
)
go

/*==============================================================*/
/* Index: idx_mapping_prodi_simpedam_3                          */
/* For lookup by kode_strata                                    */
/*==============================================================*/
create index idx_mapping_prodi_simpedam_3 on keuangan.mapping_prodi_simpedam (
   kode_strata asc
)
go

/*==============================================================*/
/* Foreign Key: fk_mapping_prodi_sms                            */
/* Relasi ke tabel pdrd.sms                                     */
/*==============================================================*/
alter table keuangan.mapping_prodi_simpedam
   add constraint fk_mapping_prodi_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

/*==============================================================*/
/* Comment: Keterangan field                                    */
/*==============================================================*/
-- id_prodi_simpedam : UUID dari SIMPEDAM (berbeda dengan id_sms)
-- nama_prodi_simpedam : Nama prodi sesuai di SIMPEDAM (uppercase, singkatan)
-- kode_strata : 3=D3, 4=S1 REGULER, 7=S1 NONREG/PARALEL
-- id_sms : UUID prodi di MyUnila (dari pdrd.sms)
-- nama_prodi_myunila : Nama prodi di MyUnila (reference only)
--
-- CATATAN PENTING:
-- - id_prodi SIMPEDAM untuk versi REGULER dan NON-REG/PARALEL BERBEDA
-- - Tapi keduanya dimapping ke id_sms MyUnila yang SAMA
-- - Contoh: AKUNTANSI (strata 4) dan AKUNTANSI (PARALEL) (strata 7)
--   memiliki id_prodi_simpedam berbeda tapi id_sms sama
