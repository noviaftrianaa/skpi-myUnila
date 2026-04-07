/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     21/01/2026 09:00:00                          */
/* Description:    Daftar UKT dari SIMPEDAM dengan mapping      */
/*==============================================================*/

/*==============================================================*/
/* Drop existing objects if exists (for re-run)                 */
/*==============================================================*/
IF OBJECT_ID('keuangan.v_daftar_ukt_summary', 'V') IS NOT NULL
    DROP VIEW keuangan.v_daftar_ukt_summary
go

IF OBJECT_ID('keuangan.v_daftar_ukt_with_mapping', 'V') IS NOT NULL
    DROP VIEW keuangan.v_daftar_ukt_with_mapping
go

IF OBJECT_ID('keuangan.daftar_ukt', 'U') IS NOT NULL
BEGIN
    ALTER TABLE keuangan.daftar_ukt DROP CONSTRAINT IF EXISTS fk_daftar_ukt_sms
    ALTER TABLE keuangan.daftar_ukt DROP CONSTRAINT IF EXISTS fk_daftar_ukt_jenj_didik
    DROP TABLE keuangan.daftar_ukt
END
go

/*==============================================================*/
/* Table: daftar_ukt                                            */
/* Daftar kelas UKT per prodi per tahun dari SIMPEDAM           */
/* Sudah include id_sms dan id_jenj_didik untuk join ke MyUnila */
/*==============================================================*/
create table keuangan.daftar_ukt (
   id_daftar_ukt        uniqueidentifier     not null,
   id_prodi_simpedam    uniqueidentifier     not null,
   nama_prodi           varchar(255)         not null,
   tahun                numeric(4)           not null,
   kode_fakultas        varchar(10)          not null,
   nama_fakultas        varchar(255)         not null,
   kode_kelas           varchar(10)          not null,
   nama_kelas           varchar(50)          not null,
   nominal              numeric(16,2)        not null,
   kode_strata          numeric(2)           not null
      constraint ckc_kode_strata_daftar_ukt check (kode_strata in (3,4,7)),

   /* MyUnila mapping - relasi ke pdrd.sms */
   id_sms               uniqueidentifier     null,
   id_jenj_didik        numeric(2)           null,

   /* Audit fields */
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_daftar_ukt check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_daftar_ukt primary key (id_daftar_ukt)
)
go

/*==============================================================*/
/* Index: idx_daftar_ukt_1                                      */
/* Untuk lookup by tahun dan kode_strata                        */
/*==============================================================*/
create index idx_daftar_ukt_1 on keuangan.daftar_ukt (
   tahun asc,
   kode_strata asc
)
go

/*==============================================================*/
/* Index: idx_daftar_ukt_2                                      */
/* Untuk lookup by id_prodi_simpedam                            */
/*==============================================================*/
create index idx_daftar_ukt_2 on keuangan.daftar_ukt (
   id_prodi_simpedam asc
)
go

/*==============================================================*/
/* Index: idx_daftar_ukt_3                                      */
/* Untuk lookup by id_sms (MyUnila)                             */
/*==============================================================*/
create index idx_daftar_ukt_3 on keuangan.daftar_ukt (
   id_sms asc
)
go

/*==============================================================*/
/* Index: idx_daftar_ukt_4                                      */
/* Unique: 1 prodi + 1 tahun + 1 kelas = 1 row                  */
/*==============================================================*/
create unique index idx_daftar_ukt_4 on keuangan.daftar_ukt (
   id_prodi_simpedam asc,
   tahun asc,
   kode_kelas asc
)
go

/*==============================================================*/
/* Foreign Key: fk_daftar_ukt_sms                               */
/* Relasi ke tabel pdrd.sms                                     */
/*==============================================================*/
alter table keuangan.daftar_ukt
   add constraint fk_daftar_ukt_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

/*==============================================================*/
/* Foreign Key: fk_daftar_ukt_jenj_didik                        */
/* Relasi ke tabel ref.jenjang_pendidikan                       */
/*==============================================================*/
alter table keuangan.daftar_ukt
   add constraint fk_daftar_ukt_jenj_didik foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

/*==============================================================*/
/* Comment: Keterangan field                                    */
/*==============================================================*/
-- id_daftar_ukt : UUID dari SIMPEDAM
-- id_prodi_simpedam : UUID prodi dari SIMPEDAM (berbeda dengan id_sms)
-- nama_prodi : Nama prodi sesuai di SIMPEDAM
-- tahun : Tahun akademik (e.g., 2024)
-- kode_fakultas : Kode fakultas dari SIMPEDAM (e.g., "01")
-- nama_fakultas : Nama fakultas dari SIMPEDAM
-- kode_kelas : Kode kelas UKT (e.g., "K1", "K2", ..., "K8")
-- nama_kelas : Nama kelas UKT (e.g., "Kelas 1", "Kelas 2", dst)
-- nominal : Nominal UKT dalam rupiah
-- kode_strata : 3=D3, 4=S1 REGULER, 7=S1 NONREG/PARALEL
-- id_sms : UUID prodi di MyUnila (hasil mapping dari mapping_prodi_simpedam)
-- id_jenj_didik : ID jenjang pendidikan (22=D3, 30=S1)
--
-- CATATAN PENTING:
-- - Table ini menggantikan keuangan.temp_daftar_ukt
-- - id_sms dan id_jenj_didik diisi saat sync berdasarkan mapping_prodi_simpedam
-- - Jika tidak ada mapping, id_sms dan id_jenj_didik akan NULL

/*==============================================================*/
/* View: v_daftar_ukt_with_mapping                              */
/* View untuk melihat daftar UKT dengan info mapping lengkap    */
/*==============================================================*/
create or alter view keuangan.v_daftar_ukt_with_mapping
as
select
    d.id_daftar_ukt,
    d.id_prodi_simpedam,
    d.nama_prodi as nama_prodi_simpedam,
    d.tahun,
    d.kode_fakultas,
    d.nama_fakultas,
    d.kode_kelas,
    d.nama_kelas,
    d.nominal,
    d.kode_strata,
    case d.kode_strata
        when 3 then 'D3'
        when 4 then 'S1 REGULER'
        when 7 then 'S1 NON-REG/PARALEL'
    end as jenjang_simpedam,
    d.id_sms,
    s.nm_lemb as nama_prodi_myunila,
    d.id_jenj_didik,
    j.nm_jenj_didik as jenjang_myunila,
    case when d.id_sms is not null then 1 else 0 end as is_mapped,
    d.last_sync
from keuangan.daftar_ukt d
left join pdrd.sms s on d.id_sms = s.id_sms
left join ref.jenjang_pendidikan j on d.id_jenj_didik = j.id_jenj_didik
where d.soft_delete = 0
go

/*==============================================================*/
/* View: v_daftar_ukt_summary                                   */
/* Summary statistik daftar UKT per tahun                       */
/*==============================================================*/
create or alter view keuangan.v_daftar_ukt_summary
as
select
    d.tahun,
    d.kode_strata,
    case d.kode_strata
        when 3 then 'D3'
        when 4 then 'S1 REGULER'
        when 7 then 'S1 NON-REG/PARALEL'
    end as jenjang,
    count(distinct d.id_prodi_simpedam) as total_prodi,
    count(*) as total_kelas_ukt,
    sum(case when d.id_sms is not null then 1 else 0 end) as total_mapped,
    sum(case when d.id_sms is null then 1 else 0 end) as total_unmapped,
    min(d.nominal) as nominal_min,
    max(d.nominal) as nominal_max,
    max(d.last_sync) as last_sync
from keuangan.daftar_ukt d
where d.soft_delete = 0
group by d.tahun, d.kode_strata
go
