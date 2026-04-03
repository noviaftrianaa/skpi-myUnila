-- ============================================================
-- Tambah junction table dok.dok_sdm
-- Relasi langsung antara pdrd.sdm dan dok.dokumen
-- Digunakan untuk dokumen dosen yang di-sync dari SISTER ke MinIO
-- (file_dok di dok.dokumen = NULL, url = MinIO object path)
-- ============================================================

create table dok.dok_sdm (
   id_sdm               uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_sdm check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_sdm primary key (id_sdm, id_dok)
)
go

alter table dok.dok_sdm
   add constraint fk_dok_sdm_dok_sdm_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_sdm
   add constraint fk_dok_sdm_id_sdm_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go
