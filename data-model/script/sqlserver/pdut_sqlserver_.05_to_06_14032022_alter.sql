/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     14/03/2022 10:21:37                          */
/*==============================================================*/


if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akreditasi_prodi') and o.name = 'fk_akredita_akreditas_sms')
alter table pdrd.akreditasi_prodi
   drop constraint fk_akredita_akreditas_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akreditasi_prodi') and o.name = 'fk_akredita_lemb_akre_lembaga_')
alter table pdrd.akreditasi_prodi
   drop constraint fk_akredita_lemb_akre_lembaga_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akreditasi_prodi') and o.name = 'fk_akredita_nilai_akr_nilai_ak')
alter table pdrd.akreditasi_prodi
   drop constraint fk_akredita_nilai_akr_nilai_ak
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_mhs') and o.name = 'fk_akt_mhs_prodi_akt_sms')
alter table pdrd.akt_mhs
   drop constraint fk_akt_mhs_prodi_akt_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.alat') and o.name = 'fk_alat_alat_mili_sms')
alter table sarpras.alat
   drop constraint fk_alat_alat_mili_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.angkutan') and o.name = 'fk_angkutan_alat_mili_sms')
alter table sarpras.angkutan
   drop constraint fk_angkutan_alat_mili_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('man_akses.aplikasi') and o.name = 'fk_aplikasi_logo_apli_large_ob')
alter table man_akses.aplikasi
   drop constraint fk_aplikasi_logo_apli_large_ob
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.bangunan') and o.name = 'fk_bangunan_sms_pemil_sms')
alter table sarpras.bangunan
   drop constraint fk_bangunan_sms_pemil_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('beasiswa.beasiswa_sdm') and o.name = 'fk_beasiswa_studi_sms_sms')
alter table beasiswa.beasiswa_sdm
   drop constraint fk_beasiswa_studi_sms_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('keuangan.biaya_operasional') and o.name = 'fk_biaya_op_sms_opera_sms')
alter table keuangan.biaya_operasional
   drop constraint fk_biaya_op_sms_opera_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_1') and o.name = 'fk_detail_i_iku1_per__sms')
alter table dashboard.detail_iku_1
   drop constraint fk_detail_i_iku1_per__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_2') and o.name = 'fk_detail_i_iku2_per__sms')
alter table dashboard.detail_iku_2
   drop constraint fk_detail_i_iku2_per__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_3') and o.name = 'fk_detail_i_iku3_per__sms')
alter table dashboard.detail_iku_3
   drop constraint fk_detail_i_iku3_per__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_4') and o.name = 'fk_detail_i_iku4_per__sms')
alter table dashboard.detail_iku_4
   drop constraint fk_detail_i_iku4_per__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_5') and o.name = 'fk_detail_i_iku5_per__sms')
alter table dashboard.detail_iku_5
   drop constraint fk_detail_i_iku5_per__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_7') and o.name = 'fk_detail_i_iku7_per__sms')
alter table dashboard.detail_iku_7
   drop constraint fk_detail_i_iku7_per__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dok_rwy_didik') and o.name = 'fk_dok_rwy__didik_dok_rwy_pend')
alter table dok.dok_rwy_didik
   drop constraint fk_dok_rwy__didik_dok_rwy_pend
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.foto_peserta_didik') and o.name = 'fk_foto_pes_rincian_f_large_ob')
alter table dok.foto_peserta_didik
   drop constraint fk_foto_pes_rincian_f_large_ob
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kelas_kuliah') and o.name = 'fk_kelas_ku_prodi_kel_sms')
alter table pdrd.kelas_kuliah
   drop constraint fk_kelas_ku_prodi_kel_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.matkul') and o.name = 'fk_matkul_prodi_mat_sms')
alter table pdrd.matkul
   drop constraint fk_matkul_prodi_mat_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__foto_pd_large_ob')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__foto_pd_large_ob
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.profil_prodi') and o.name = 'fk_profil_p_profil_pr_sms')
alter table pdrd.profil_prodi
   drop constraint fk_profil_p_profil_pr_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_pd') and o.name = 'fk_reg_pd_prodi_pd_sms')
alter table pdrd.reg_pd
   drop constraint fk_reg_pd_prodi_pd_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_ptk') and o.name = 'fk_reg_ptk_reg_dosen_sms')
alter table pdrd.reg_ptk
   drop constraint fk_reg_ptk_reg_dosen_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.ruang') and o.name = 'fk_ruang_sms_pemil_sms')
alter table sarpras.ruang
   drop constraint fk_ruang_sms_pemil_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_didik_nonformal') and o.name = 'fk_rwy_didi_prodi_pen_sms')
alter table pdrd.rwy_didik_nonformal
   drop constraint fk_rwy_didi_prodi_pen_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_didik_nonformal') and o.name = 'fk_rwy_didi_rwy_didik_rwy_pend')
alter table pdrd.rwy_didik_nonformal
   drop constraint fk_rwy_didi_rwy_didik_rwy_pend
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_pend_formal') and o.name = 'fk_rwy_pend_didik_for_kategori')
alter table pdrd.rwy_pend_formal
   drop constraint fk_rwy_pend_didik_for_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_pend_formal') and o.name = 'fk_rwy_pend_ptk_rwyt__sms')
alter table pdrd.rwy_pend_formal
   drop constraint fk_rwy_pend_ptk_rwyt__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_pend_formal') and o.name = 'fk_rwy_pend_riwayat_g_gelar_ak')
alter table pdrd.rwy_pend_formal
   drop constraint fk_rwy_pend_riwayat_g_gelar_ak
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_pend_formal') and o.name = 'fk_rwy_pend_rwyt_pend_bidang_s')
alter table pdrd.rwy_pend_formal
   drop constraint fk_rwy_pend_rwyt_pend_bidang_s
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_pend_formal') and o.name = 'fk_rwy_pend_rwyt_pend_jenjang_')
alter table pdrd.rwy_pend_formal
   drop constraint fk_rwy_pend_rwyt_pend_jenjang_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_pend_formal') and o.name = 'fk_rwy_pend_rwyt_pend_sdm')
alter table pdrd.rwy_pend_formal
   drop constraint fk_rwy_pend_rwyt_pend_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.satuan_pendidikan') and o.name = 'fk_satuan_p_logo_sp_large_ob')
alter table pdrd.satuan_pendidikan
   drop constraint fk_satuan_p_logo_sp_large_ob
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sms') and o.name = 'fk_sms_fungsi_la_fungsi_l')
alter table pdrd.sms
   drop constraint fk_sms_fungsi_la_fungsi_l
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sms') and o.name = 'fk_sms_induk_sms_sms')
alter table pdrd.sms
   drop constraint fk_sms_induk_sms_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sms') and o.name = 'fk_sms_jursp_jur_jurusan')
alter table pdrd.sms
   drop constraint fk_sms_jursp_jur_jurusan
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sms') and o.name = 'fk_sms_kelompok__kelompok')
alter table pdrd.sms
   drop constraint fk_sms_kelompok__kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sms') and o.name = 'fk_sms_logo_sms_large_ob')
alter table pdrd.sms
   drop constraint fk_sms_logo_sms_large_ob
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sms') and o.name = 'fk_sms_progstudi_jenjang_')
alter table pdrd.sms
   drop constraint fk_sms_progstudi_jenjang_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sms') and o.name = 'fk_sms_sms_jenis_jenis_sm')
alter table pdrd.sms
   drop constraint fk_sms_sms_jenis_jenis_sm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sms') and o.name = 'fk_sms_sms_sp_satuan_p')
alter table pdrd.sms
   drop constraint fk_sms_sms_sp_satuan_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sms') and o.name = 'fk_sms_wilayah_s_wilayah')
alter table pdrd.sms
   drop constraint fk_sms_wilayah_s_wilayah
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kerjasama.sms_kerjasama') and o.name = 'fk_sms_kerj_bidang_ke_bidang_k')
alter table kerjasama.sms_kerjasama
   drop constraint fk_sms_kerj_bidang_ke_bidang_k
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

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.tanah') and o.name = 'fk_tanah_sms_pemil_sms')
alter table sarpras.tanah
   drop constraint fk_tanah_sms_pemil_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tugas_tambahan') and o.name = 'fk_tugas_ta_jabatan_p_sms')
alter table pdrd.tugas_tambahan
   drop constraint fk_tugas_ta_jabatan_p_sms
go

alter table pdrd.akreditasi_prodi
   drop constraint pk_akreditasi_prodi
go

alter table pdrd.akreditasi_prodi
   drop constraint ckc_asal_data_akredita
go

alter table pdrd.akreditasi_prodi
   drop constraint ckc_soft_delete_akredita
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_akreditasi_prodi')
            and   type = 'U')
   drop table pdrd.tmp_akreditasi_prodi
go

execute sp_rename 'pdrd.akreditasi_prodi', tmp_akreditasi_prodi
go

alter table dok.large_object
   drop constraint pk_large_object
go

alter table dok.large_object
   drop constraint ckc_soft_delete_large_ob
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dok.tmp_large_object')
            and   type = 'U')
   drop table dok.tmp_large_object
go

execute sp_rename 'dok.large_object', tmp_large_object
go

alter table pdrd.rwy_didik_nonformal
   drop constraint pk_rwy_didik_nonformal
go

alter table pdrd.rwy_didik_nonformal
   drop constraint ckc_soft_delete_rwy_didi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_rwy_didik_nonformal')
            and   type = 'U')
   drop table pdrd.tmp_rwy_didik_nonformal
go

execute sp_rename 'pdrd.rwy_didik_nonformal', tmp_rwy_didik_nonformal
go

alter table pdrd.rwy_pend_formal
   drop constraint pk_rwy_pend_formal
go

alter table pdrd.rwy_pend_formal
   drop constraint ckc_a_kependidikan_rwy_pend
go

alter table pdrd.rwy_pend_formal
   drop constraint ckc_soft_delete_rwy_pend
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_rwy_pend_formal')
            and   type = 'U')
   drop table pdrd.tmp_rwy_pend_formal
go

execute sp_rename 'pdrd.rwy_pend_formal', tmp_rwy_pend_formal
go

alter table pdrd.sms
   drop constraint pk_sms
go

alter table pdrd.sms
   drop constraint ckc_a_selenggara_subs_sms
go

alter table pdrd.sms
   drop constraint ckc_stat_prodi_sms
go

alter table pdrd.sms
   drop constraint ckc_polesei_nilai_sms
go

alter table pdrd.sms
   drop constraint ckc_a_kependidikan_sms
go

alter table pdrd.sms
   drop constraint ckc_a_pjj_sms
go

alter table pdrd.sms
   drop constraint ckc_a_psdku_sms
go

alter table pdrd.sms
   drop constraint ckc_a_pkl_sms
go

alter table pdrd.sms
   drop constraint ckc_soft_delete_sms
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_sms')
            and   type = 'U')
   drop table pdrd.tmp_sms
go

execute sp_rename 'pdrd.sms', tmp_sms
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
/* Table: akreditasi_prodi                                      */
/*==============================================================*/
create table pdrd.akreditasi_prodi (
   id_akreditasi_prodi  uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_lemb_akred        char(5)              not null,
   id_akred             numeric(1)           not null,
   sk_akreditasi_prodi  varchar(80)          not null,
   tanggal_sk_akreditasi_prodi date                 not null,
   tst_sk_akreditasi_prodi date                 not null,
   asal_data            char(1)              not null default '9'
      constraint ckc_asal_data_akredita check (asal_data in ('1','2','3','4','5','6','9','7','8')),
   a_aktif              numeric(1)           not null default 1
      constraint ckc_a_aktif_akredita check (a_aktif between 0 and 1 and a_aktif in (0,1)),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_akredita check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_akreditasi_prodi primary key (id_akreditasi_prodi)
)
go

insert into pdrd.akreditasi_prodi (id_akreditasi_prodi, id_sms, id_lemb_akred, id_akred, sk_akreditasi_prodi, tanggal_sk_akreditasi_prodi, tst_sk_akreditasi_prodi, asal_data, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_akreditasi_prodi, id_sms, id_lemb_akred, id_akred, sk_akreditasi_prodi, tanggal_sk_akreditasi_prodi, tst_sk_akreditasi_prodi, asal_data, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_akreditasi_prodi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_akreditasi_prodi')
            and   type = 'U')
   drop table pdrd.tmp_akreditasi_prodi
go

/*==============================================================*/
/* Table: bentuk_kegiatan_kerjasama                             */
/*==============================================================*/
create table ref.bentuk_kegiatan_kerjasama (
   id_bntk_giat_kerjasama numeric(2)           identity,
   nm_bntk_giat_kerjasama varchar(60)          not null,
   ket                  varchar(250)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_bentuk_kegiatan_kerjasama primary key (id_bntk_giat_kerjasama)
)
go

/*==============================================================*/
/* Table: kriteria_mitra                                        */
/*==============================================================*/
create table ref.kriteria_mitra (
   id_kriteria_mitra    numeric(2)           identity,
   nm_kriteria_mitra    varchar(100)         not null,
   ket                  varchar(250)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kriteria_mitra primary key (id_kriteria_mitra)
)
go

/*==============================================================*/
/* Table: large_object                                          */
/*==============================================================*/
create table dok.large_object (
   id_blob              uniqueidentifier     not null,
   blob_content         varbinary(max)       not null,
   file_name            varchar(500)         null,
   mime_type            varchar(100)         null,
   url                  varchar(256)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_large_ob check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_large_object primary key (id_blob)
)
go

insert into dok.large_object (id_blob, blob_content, file_name, mime_type, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_blob, blob_content, file_name, mime_type, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from dok.tmp_large_object
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dok.tmp_large_object')
            and   type = 'U')
   drop table dok.tmp_large_object
go

/*==============================================================*/
/* Table: rwy_didik_nonformal                                   */
/*==============================================================*/
create table pdrd.rwy_didik_nonformal (
   id_rwy_didik_nonformal uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_rwy_didik_formal  uniqueidentifier     not null,
   no_sk_setara         varchar(80)          not null,
   tgl_sk_setara        date                 not null,
   tmt_sk_setara        date                 not null,
   level_kkni           int                  not null,
   nm_prodi_penyetara   varchar(100)         not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_rwy_didi check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_rwy_didik_nonformal primary key (id_rwy_didik_nonformal)
)
go

insert into pdrd.rwy_didik_nonformal (id_rwy_didik_nonformal, id_sms, id_rwy_didik_formal, no_sk_setara, tgl_sk_setara, tmt_sk_setara, level_kkni, nm_prodi_penyetara, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_rwy_didik_nonformal, id_sms, id_rwy_didik_formal, no_sk_setara, tgl_sk_setara, tmt_sk_setara, level_kkni, nm_prodi_penyetara, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_rwy_didik_nonformal
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_rwy_didik_nonformal')
            and   type = 'U')
   drop table pdrd.tmp_rwy_didik_nonformal
go

/*==============================================================*/
/* Table: rwy_pend_formal                                       */
/*==============================================================*/
create table pdrd.rwy_pend_formal (
   id_rwy_didik_formal  uniqueidentifier     not null,
   id_sms               uniqueidentifier     null,
   id_katgiat           int                  not null,
   id_sdm               uniqueidentifier     not null,
   id_jenj_didik        numeric(2)           not null,
   id_bid_studi         int                  not null,
   id_gelar_akad        int                  null,
   nm_sp_formal         varchar(100)         not null,
   fak                  varchar(100)         null,
   a_kependidikan       numeric(1)           not null default 0
      constraint ckc_a_kependidikan_rwy_pend check (a_kependidikan between 0 and 1 and a_kependidikan in (0,1)),
   thn_masuk            numeric(4)           not null,
   thn_lulus            numeric(4)           null,
   nipd                 varchar(24)          not null,
   stat_kul             char(1)              not null,
   smt                  numeric(2)           null,
   sks_lulus            numeric(3)           not null,
   ipk                  numeric(5,2)         not null,
   sk_setara            varchar(80)          null,
   tgl_sk_setara        date                 null,
   no_ijazah            varchar(80)          null,
   judul_tesis          varchar(500)         null,
   tgl_lulus            date                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_rwy_pend check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_rwy_pend_formal primary key (id_rwy_didik_formal)
)
go

insert into pdrd.rwy_pend_formal (id_rwy_didik_formal, id_sms, id_katgiat, id_sdm, id_jenj_didik, id_bid_studi, id_gelar_akad, nm_sp_formal, fak, a_kependidikan, thn_masuk, thn_lulus, nipd, stat_kul, smt, sks_lulus, ipk, sk_setara, tgl_sk_setara, no_ijazah, judul_tesis, tgl_lulus, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_rwy_didik_formal, id_sms, id_katgiat, id_sdm, id_jenj_didik, id_bid_studi, id_gelar_akad, nm_sp_formal, fak, a_kependidikan, thn_masuk, thn_lulus, nipd, stat_kul, smt, sks_lulus, ipk, sk_setara, tgl_sk_setara, no_ijazah, judul_tesis, tgl_lulus, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_rwy_pend_formal
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_rwy_pend_formal')
            and   type = 'U')
   drop table pdrd.tmp_rwy_pend_formal
go

/*==============================================================*/
/* Table: sms                                                   */
/*==============================================================*/
create table pdrd.sms (
   id_sms               uniqueidentifier     not null,
   id_fak_unila         uniqueidentifier     null,
   id_jur_unila         uniqueidentifier     null,
   id_jur               varchar(25)          null,
   id_jenj_didik        numeric(2)           not null,
   nm_lemb              varchar(100)         not null,
   kd_kl                char(3)              null,
   kd_satker            varchar(20)          null,
   smt_mulai            char(5)              null,
   a_selenggara_subst   numeric(1)           not null default 0
      constraint ckc_a_selenggara_subs_sms check (a_selenggara_subst between 0 and 1 and a_selenggara_subst in (0,1)),
   stat_prodi_unila     char(1)              null,
   kode_prodi           varchar(10)          null,
   nm_prodi_english     varchar(100)         null,
   kpst_pd              numeric(5)           null,
   sks_lulus            numeric(3)           null,
   gelar_lulusan        varchar(10)          null,
   stat_prodi           char(1)              null default 'A'
      constraint ckc_stat_prodi_sms check (stat_prodi is null or (stat_prodi in ('A','B','K','N','H'))),
   polesei_nilai        char(1)              null default 'B'
      constraint ckc_polesei_nilai_sms check (polesei_nilai is null or (polesei_nilai in ('B','T'))),
   a_kependidikan       numeric(1)           null default 0
      constraint ckc_a_kependidikan_sms check (a_kependidikan is null or (a_kependidikan between 0 and 1 and a_kependidikan in (0,1))),
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          null,
   kode_pos             char(5)              null,
   lintang              numeric(11,7)        null,
   bujur                numeric(11,7)        null,
   no_tel               varchar(20)          null,
   no_fax               varchar(20)          null,
   email                varchar(60)          null,
   website              varchar(256)         null,
   singkatan            varchar(50)          null,
   tgl_berdiri          date                 null,
   sk_selenggara        varchar(80)          null,
   tgl_sk_selenggara    date                 null,
   tmt_sk_selenggara    date                 null,
   tst_sk_selenggara    date                 null,
   sistem_ajar          numeric(1)           null,
   a_pjj                numeric(1)           null default 0
      constraint ckc_a_pjj_sms check (a_pjj is null or (a_pjj between 0 and 1 and a_pjj in (0,1))),
   a_psdku              numeric(1)           null default 0
      constraint ckc_a_psdku_sms check (a_psdku is null or (a_psdku between 0 and 1 and a_psdku in (0,1))),
   luas_lab             numeric(5)           null,
   kapasitas_prak_satu_shift numeric(4)           null,
   jml_mhs_pengguna     numeric(6)           null,
   jml_jam_penggunaan   numeric(5)           null,
   jml_prodi_pengguna   numeric(3)           null,
   jml_modul_prak_sendiri numeric(4)           null,
   jml_modul_prak_lain  numeric(4)           null,
   fungsi_selain_prak   char(1)              null,
   penggunaan_lab       char(1)              null,
   a_pkl                numeric(1)           null default 0
      constraint ckc_a_pkl_sms check (a_pkl is null or (a_pkl between 0 and 1 and a_pkl in (0,1))),
   id_sp                uniqueidentifier     not null,
   id_jns_sms           numeric(2)           not null,
   id_fungsi_lab        char(1)              not null,
   id_kel_usaha         char(8)              not null,
   id_blob              uniqueidentifier     null,
   id_wil               char(8)              not null,
   id_induk_sms         uniqueidentifier     null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_sms check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_sms primary key (id_sms)
)
go

insert into pdrd.sms (id_sms, id_jur, id_jenj_didik, nm_lemb, kd_kl, kd_satker, smt_mulai, a_selenggara_subst, stat_prodi_unila, kode_prodi, nm_prodi_english, kpst_pd, sks_lulus, gelar_lulusan, stat_prodi, polesei_nilai, a_kependidikan, jln, rt, rw, nm_dsn, ds_kel, kode_pos, lintang, bujur, no_tel, no_fax, email, website, singkatan, tgl_berdiri, sk_selenggara, tgl_sk_selenggara, tmt_sk_selenggara, tst_sk_selenggara, sistem_ajar, a_pjj, a_psdku, luas_lab, kapasitas_prak_satu_shift, jml_mhs_pengguna, jml_jam_penggunaan, jml_prodi_pengguna, jml_modul_prak_sendiri, jml_modul_prak_lain, fungsi_selain_prak, penggunaan_lab, a_pkl, id_sp, id_jns_sms, id_fungsi_lab, id_kel_usaha, id_blob, id_wil, id_induk_sms, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_sms, id_jur, id_jenj_didik, nm_lemb, kd_kl, kd_satker, smt_mulai, a_selenggara_subst, stat_prodi_unila, kode_prodi, nm_prodi_english, kpst_pd, sks_lulus, gelar_lulusan, stat_prodi, polesei_nilai, a_kependidikan, jln, rt, rw, nm_dsn, ds_kel, kode_pos, lintang, bujur, no_tel, no_fax, email, website, singkatan, tgl_berdiri, sk_selenggara, tgl_sk_selenggara, tmt_sk_selenggara, tst_sk_selenggara, sistem_ajar, a_pjj, a_psdku, luas_lab, kapasitas_prak_satu_shift, jml_mhs_pengguna, jml_jam_penggunaan, jml_prodi_pengguna, jml_modul_prak_sendiri, jml_modul_prak_lain, fungsi_selain_prak, penggunaan_lab, a_pkl, id_sp, id_jns_sms, id_fungsi_lab, id_kel_usaha, id_blob, id_wil, id_induk_sms, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_sms
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_sms')
            and   type = 'U')
   drop table pdrd.tmp_sms
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

insert into kerjasama.sms_kerjasama (id_sms_kerjasama, id_tingkat_kerjasama, id_sumber_dana, id_sms, id_mou, id_bid_kerjasama, hsl_prod_brg, hsl_prod_jasa, omzet_barang_per_bulan, omzet_jasa_per_bulan, prestasi_penghargaan, pangsa_psr_brg, pangsa_psr_jasa, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_sms_kerjasama, id_tingkat_kerjasama, id_sumber_dana, id_sms, id_mou, id_bid_kerjasama, hsl_prod_brg, hsl_prod_jasa, omzet_barang_per_bulan, omzet_jasa_per_bulan, prestasi_penghargaan, pangsa_psr_brg, pangsa_psr_jasa, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from kerjasama.tmp_sms_kerjasama
go

if exists (select 1
            from  sysobjects
           where  id = object_id('kerjasama.tmp_sms_kerjasama')
            and   type = 'U')
   drop table kerjasama.tmp_sms_kerjasama
go

/*==============================================================*/
/* Table: status_kerjasama                                      */
/*==============================================================*/
create table ref.status_kerjasama (
   id_stat_kerjasama    numeric(2)           identity,
   nm_stat_kerjasama    varchar(60)          not null,
   ket                  varchar(250)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_status_kerjasama primary key (id_stat_kerjasama)
)
go

alter table pdrd.akreditasi_prodi
   add constraint fk_akredita_akreditas_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.akreditasi_prodi
   add constraint fk_akredita_lemb_akre_lembaga_ foreign key (id_lemb_akred)
      references ref.lembaga_akred (id_lemb_akred)
go

alter table pdrd.akreditasi_prodi
   add constraint fk_akredita_nilai_akr_nilai_ak foreign key (id_akred)
      references ref.nilai_akred (id_akred)
go

alter table pdrd.akt_mhs
   add constraint fk_akt_mhs_prodi_akt_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table sarpras.alat
   add constraint fk_alat_alat_mili_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table sarpras.angkutan
   add constraint fk_angkutan_alat_mili_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table man_akses.aplikasi
   add constraint fk_aplikasi_logo_apli_large_ob foreign key (id_blob)
      references dok.large_object (id_blob)
go

alter table sarpras.bangunan
   add constraint fk_bangunan_sms_pemil_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table beasiswa.beasiswa_sdm
   add constraint fk_beasiswa_studi_sms_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table keuangan.biaya_operasional
   add constraint fk_biaya_op_sms_opera_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table dashboard.detail_iku_1
   add constraint fk_detail_i_iku1_per__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table dashboard.detail_iku_2
   add constraint fk_detail_i_iku2_per__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table dashboard.detail_iku_3
   add constraint fk_detail_i_iku3_per__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table dashboard.detail_iku_4
   add constraint fk_detail_i_iku4_per__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table dashboard.detail_iku_5
   add constraint fk_detail_i_iku5_per__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table dashboard.detail_iku_7
   add constraint fk_detail_i_iku7_per__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table dok.dok_rwy_didik
   add constraint fk_dok_rwy__didik_dok_rwy_pend foreign key (id_rwy_didik_formal)
      references pdrd.rwy_pend_formal (id_rwy_didik_formal)
go

alter table dok.foto_peserta_didik
   add constraint fk_foto_pes_rincian_f_large_ob foreign key (id_blob)
      references dok.large_object (id_blob)
go

alter table pdrd.kelas_kuliah
   add constraint fk_kelas_ku_prodi_kel_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.matkul
   add constraint fk_matkul_prodi_mat_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__foto_pd_large_ob foreign key (id_blob)
      references dok.large_object (id_blob)
go

alter table pdrd.profil_prodi
   add constraint fk_profil_p_profil_pr_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_prodi_pd_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.reg_ptk
   add constraint fk_reg_ptk_reg_dosen_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table sarpras.ruang
   add constraint fk_ruang_sms_pemil_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.rwy_didik_nonformal
   add constraint fk_rwy_didi_rwy_didik_rwy_pend foreign key (id_rwy_didik_formal)
      references pdrd.rwy_pend_formal (id_rwy_didik_formal)
go

alter table pdrd.rwy_pend_formal
   add constraint fk_rwy_pend_didik_for_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table pdrd.rwy_pend_formal
   add constraint fk_rwy_pend_riwayat_g_gelar_ak foreign key (id_gelar_akad)
      references ref.gelar_akademik (id_gelar_akad)
go

alter table pdrd.rwy_pend_formal
   add constraint fk_rwy_pend_rwyt_pend_bidang_s foreign key (id_bid_studi)
      references ref.bidang_studi (id_bid_studi)
go

alter table pdrd.rwy_pend_formal
   add constraint fk_rwy_pend_rwyt_pend_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.rwy_pend_formal
   add constraint fk_rwy_pend_rwyt_pend_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.satuan_pendidikan
   add constraint fk_satuan_p_logo_sp_large_ob foreign key (id_blob)
      references dok.large_object (id_blob)
go

alter table pdrd.sms
   add constraint fk_sms_fungsi_la_fungsi_l foreign key (id_fungsi_lab)
      references ref.fungsi_lab (id_fungsi_lab)
go

alter table pdrd.sms
   add constraint fk_sms_induk_sms_sms foreign key (id_induk_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.sms
   add constraint fk_sms_kelompok__kelompok foreign key (id_kel_usaha)
      references ref.kelompok_usaha (id_kel_usaha)
go

alter table pdrd.sms
   add constraint fk_sms_logo_sms_large_ob foreign key (id_blob)
      references dok.large_object (id_blob)
go

alter table pdrd.sms
   add constraint fk_sms_sms_jenis_jenis_sm foreign key (id_jns_sms)
      references ref.jenis_sms (id_jns_sms)
go

alter table pdrd.sms
   add constraint fk_sms_sms_sp_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.sms
   add constraint fk_sms_wilayah_s_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
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

alter table sarpras.tanah
   add constraint fk_tanah_sms_pemil_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.tugas_tambahan
   add constraint fk_tugas_ta_jabatan_p_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

