/*
 Navicat Premium Data Transfer

 Source Server         : sqlserver-pdut-backend-unila
 Source Server Type    : SQL Server
 Source Server Version : 15002000
 Source Host           : 192.168.123.119:1433
 Source Catalog        : pdut
 Source Schema         : pdrd

 Target Server Type    : SQL Server
 Target Server Version : 15002000
 File Encoding         : 65001

 Date: 18/03/2022 13:34:07
*/


-- ----------------------------
-- Table structure for profil_prodi
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[pdrd].[profil_prodi]') AND type IN ('U'))
	DROP TABLE [pdrd].[profil_prodi]
GO

CREATE TABLE [pdrd].[profil_prodi] (
  [id_thn_ajaran] numeric(4)  NOT NULL,
  [id_sms] uniqueidentifier  NOT NULL,
  [desk_singkat] text COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [visi] text COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [misi] text COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [tujuan] text COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [sasaran] text COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [kompetensi] text COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [capaian_belajar] text COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [upaya_sebar] text COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [keberlanjutan] text COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [frek_kur] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [laks_kur] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [himp_alumni] text COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [create_date] datetime  NOT NULL,
  [id_creator] uniqueidentifier  NOT NULL,
  [last_update] datetime  NOT NULL,
  [id_updater] uniqueidentifier  NULL,
  [soft_delete] numeric(1) DEFAULT ((0)) NOT NULL,
  [last_sync] datetime  NOT NULL
)
GO

ALTER TABLE [pdrd].[profil_prodi] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Checks structure for table profil_prodi
-- ----------------------------
ALTER TABLE [pdrd].[profil_prodi] ADD CONSTRAINT [ckc_delete_profil_prodi] CHECK ([soft_delete]>=(0) AND [soft_delete]<=(1) AND ([soft_delete]=(1) OR [soft_delete]=(0)))
GO


-- ----------------------------
-- Foreign Keys structure for table profil_prodi
-- ----------------------------
ALTER TABLE [pdrd].[profil_prodi] ADD CONSTRAINT [fk_ta_profil_prodi] FOREIGN KEY ([id_thn_ajaran]) REFERENCES [ref].[tahun_ajaran] ([id_thn_ajaran]) ON DELETE NO ACTION ON UPDATE NO ACTION
GO

ALTER TABLE [pdrd].[profil_prodi] ADD CONSTRAINT [fk_profil_p_profil_pr_sms] FOREIGN KEY ([id_sms]) REFERENCES [pdrd].[sms] ([id_sms]) ON DELETE NO ACTION ON UPDATE NO ACTION
GO

