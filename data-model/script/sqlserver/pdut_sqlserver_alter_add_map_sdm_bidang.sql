/*==============================================================*/
/* ALTER TABLE Script: Add pdrd.map_sdm_bidang                 */
/* Purpose: Mapping table for Dosen - Bidang Ilmu relationship */
/* Created: 2025-01-08                                          */
/*==============================================================*/

-- Check if table exists, drop if exists (for clean install)
IF OBJECT_ID('pdrd.map_sdm_bidang', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping existing table pdrd.map_sdm_bidang...'
    DROP TABLE pdrd.map_sdm_bidang
END
GO

/*==============================================================*/
/* Table: map_sdm_bidang                                        */
/* Description: Mapping table between SDM (dosen) and          */
/*              kelompok_bidang (field of study)                */
/*==============================================================*/
CREATE TABLE pdrd.map_sdm_bidang (
   id_sdm               uniqueidentifier     NOT NULL,
   id_kel_bidang        uniqueidentifier     NOT NULL,
   urutan               numeric(32)          NOT NULL,
   create_date          datetime             NOT NULL,
   id_creator           uniqueidentifier     NOT NULL,
   last_update          datetime             NOT NULL,
   id_updater           uniqueidentifier     NULL,
   soft_delete          numeric(1)           NOT NULL DEFAULT 0
      CONSTRAINT ckc_soft_delete_map_sdm_bidang CHECK (soft_delete BETWEEN 0 AND 1 AND soft_delete IN (0,1)),
   last_sync            datetime             NOT NULL,
   CONSTRAINT pk_map_sdm_bidang PRIMARY KEY (id_sdm, id_kel_bidang)
)
GO

/*==============================================================*/
/* Index: idx_map_sdm_bidang_sdm                                */
/*==============================================================*/
CREATE INDEX idx_map_sdm_bidang_sdm ON pdrd.map_sdm_bidang (
   id_sdm ASC
)
GO

/*==============================================================*/
/* Index: idx_map_sdm_bidang_kelompok                           */
/*==============================================================*/
CREATE INDEX idx_map_sdm_bidang_kelompok ON pdrd.map_sdm_bidang (
   id_kel_bidang ASC
)
GO

/*==============================================================*/
/* Foreign Key: fk_map_sdm_bidang_sdm                           */
/*==============================================================*/
ALTER TABLE pdrd.map_sdm_bidang
   ADD CONSTRAINT fk_map_sdm_bidang_sdm FOREIGN KEY (id_sdm)
      REFERENCES pdrd.sdm (id_sdm)
GO

/*==============================================================*/
/* Foreign Key: fk_map_sdm_bidang_kelompok                      */
/*==============================================================*/
ALTER TABLE pdrd.map_sdm_bidang
   ADD CONSTRAINT fk_map_sdm_bidang_kelompok FOREIGN KEY (id_kel_bidang)
      REFERENCES ref.kelompok_bidang (id_kel_bidang)
GO

PRINT 'Table pdrd.map_sdm_bidang created successfully with indexes and foreign keys'
GO
