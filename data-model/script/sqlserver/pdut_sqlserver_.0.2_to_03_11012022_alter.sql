/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     11/01/2022 14:45:20                          */
/*==============================================================*/


if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_ajar_dosen') and o.name = 'fk_akt_ajar_katgiat_a_kategori')
alter table pdrd.akt_ajar_dosen
   drop constraint fk_akt_ajar_katgiat_a_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_ajar_dosen') and o.name = 'fk_akt_ajar_mengajar__substans')
alter table pdrd.akt_ajar_dosen
   drop constraint fk_akt_ajar_mengajar__substans
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_ajar_dosen') and o.name = 'fk_akt_ajar_pengajara_jenis_ev')
alter table pdrd.akt_ajar_dosen
   drop constraint fk_akt_ajar_pengajara_jenis_ev
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_ajar_dosen') and o.name = 'fk_akt_ajar_pengambil_kelas_ku')
alter table pdrd.akt_ajar_dosen
   drop constraint fk_akt_ajar_pengambil_kelas_ku
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_ajar_dosen') and o.name = 'fk_akt_ajar_ptk_penga_reg_ptk')
alter table pdrd.akt_ajar_dosen
   drop constraint fk_akt_ajar_ptk_penga_reg_ptk
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.anggota_aktivitas_mahasiswa') and o.name = 'fk_anggota__reg_ang_a_reg_pd')
alter table pdrd.anggota_aktivitas_mahasiswa
   drop constraint fk_anggota__reg_ang_a_reg_pd
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.anggota_orgprof') and o.name = 'fk_anggota__orgprof_p_sdm')
alter table pdrd.anggota_orgprof
   drop constraint fk_anggota__orgprof_p_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.anggota_panitia') and o.name = 'fk_anggota__anggota_p_kepaniti')
alter table pdrd.anggota_panitia
   drop constraint fk_anggota__anggota_p_kepaniti
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.anggota_panitia') and o.name = 'fk_anggota__panitia_p_sdm')
alter table pdrd.anggota_panitia
   drop constraint fk_anggota__panitia_p_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.bimbing_mhs') and o.name = 'fk_bimbing__aktmhs_bi_akt_mhs')
alter table pdrd.bimbing_mhs
   drop constraint fk_bimbing__aktmhs_bi_akt_mhs
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.bimbing_mhs') and o.name = 'fk_bimbing__dosen_pem_sdm')
alter table pdrd.bimbing_mhs
   drop constraint fk_bimbing__dosen_pem_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.detasering') and o.name = 'fk_detaseri_pt_sas_de_satuan_p')
alter table pdrd.detasering
   drop constraint fk_detaseri_pt_sas_de_satuan_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.detasering') and o.name = 'fk_detaseri_pt_sum_de_satuan_p')
alter table pdrd.detasering
   drop constraint fk_detaseri_pt_sum_de_satuan_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.detasering') and o.name = 'fk_detaseri_ptk_detas_sdm')
alter table pdrd.detasering
   drop constraint fk_detaseri_ptk_detas_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.diklat') and o.name = 'fk_diklat_diklat_je_jenis_di')
alter table pdrd.diklat
   drop constraint fk_diklat_diklat_je_jenis_di
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.diklat') and o.name = 'fk_diklat_diklat_ke_kelompok')
alter table pdrd.diklat
   drop constraint fk_diklat_diklat_ke_kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.diklat') and o.name = 'fk_diklat_diklat_pt_sdm')
alter table pdrd.diklat
   drop constraint fk_diklat_diklat_pt_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dok_ang_orgprof') and o.name = 'fk_dok_ang__angorgpro_anggota_')
alter table dok.dok_ang_orgprof
   drop constraint fk_dok_ang__angorgpro_anggota_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dok_bimbing_dosen') and o.name = 'fk_dok_bimb_bimb_dos__bimbing_')
alter table dok.dok_bimbing_dosen
   drop constraint fk_dok_bimb_bimb_dos__bimbing_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dok_detasering') and o.name = 'fk_dok_deta_detas_dok_detaseri')
alter table dok.dok_detasering
   drop constraint fk_dok_deta_detas_dok_detaseri
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dok_diklat') and o.name = 'fk_dok_dikl_diklat_do_diklat')
alter table dok.dok_diklat
   drop constraint fk_dok_dikl_diklat_do_diklat
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dok_jabstruk') and o.name = 'fk_dok_jabs_jabstruk__rwy_stru')
alter table dok.dok_jabstruk
   drop constraint fk_dok_jabs_jabstruk__rwy_stru
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dok_pembicara') and o.name = 'fk_dok_pemb_pembicara_pembicar')
alter table dok.dok_pembicara
   drop constraint fk_dok_pemb_pembicara_pembicar
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dok_pengelola_jurnal') and o.name = 'fk_dok_peng_kelolajur_pengelol')
alter table dok.dok_pengelola_jurnal
   drop constraint fk_dok_peng_kelolajur_pengelol
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dok_penghargaan') and o.name = 'fk_dok_peng_pengharga_pengharg')
alter table dok.dok_penghargaan
   drop constraint fk_dok_peng_pengharga_pengharg
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dok_rwy_didik') and o.name = 'fk_dok_rwy__didik_dok_rwy_pend')
alter table dok.dok_rwy_didik
   drop constraint fk_dok_rwy__didik_dok_rwy_pend
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dok_tugtam') and o.name = 'fk_dok_tugt_tugtam_do_tugas_ta')
alter table dok.dok_tugtam
   drop constraint fk_dok_tugt_tugtam_do_tugas_ta
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dok_visit_scientist') and o.name = 'fk_dok_visi_visiting__visiting')
alter table dok.dok_visit_scientist
   drop constraint fk_dok_visi_visiting__visiting
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('tracer.hasil_tracer_study') and o.name = 'fk_hasil_tr_reg_pd_ha_reg_pd')
alter table tracer.hasil_tracer_study
   drop constraint fk_hasil_tr_reg_pd_ha_reg_pd
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kuliah_mhs') and o.name = 'fk_kuliah_m_register__reg_pd')
alter table pdrd.kuliah_mhs
   drop constraint fk_kuliah_m_register__reg_pd
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.pembicara') and o.name = 'fk_pembicar_capaian_p_kategori')
alter table pdrd.pembicara
   drop constraint fk_pembicar_capaian_p_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.pembicara') and o.name = 'fk_pembicar_luaran_pe_litabmas')
alter table pdrd.pembicara
   drop constraint fk_pembicar_luaran_pe_litabmas
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.pembicara') and o.name = 'fk_pembicar_pembicata_sdm')
alter table pdrd.pembicara
   drop constraint fk_pembicar_pembicata_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.pengelola_jurnal') and o.name = 'fk_pengelol_jurnal_ke_media_pu')
alter table pdrd.pengelola_jurnal
   drop constraint fk_pengelol_jurnal_ke_media_pu
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.pengelola_jurnal') and o.name = 'fk_pengelol_kelola_ju_sdm')
alter table pdrd.pengelola_jurnal
   drop constraint fk_pengelol_kelola_ju_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.penghargaan') and o.name = 'fk_pengharg_pengharga_jenis_pe')
alter table pdrd.penghargaan
   drop constraint fk_pengharg_pengharga_jenis_pe
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.penghargaan') and o.name = 'fk_pengharg_pengharga_sdm')
alter table pdrd.penghargaan
   drop constraint fk_pengharg_pengharga_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.penghargaan') and o.name = 'fk_pengharg_pengharga_tingkat_')
alter table pdrd.penghargaan
   drop constraint fk_pengharg_pengharga_tingkat_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_pd') and o.name = 'fk_reg_pd_alasan_ke_jenis_ke')
alter table pdrd.reg_pd
   drop constraint fk_reg_pd_alasan_ke_jenis_ke
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_pd') and o.name = 'fk_reg_pd_biaya_reg_pembiaya')
alter table pdrd.reg_pd
   drop constraint fk_reg_pd_biaya_reg_pembiaya
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_pd') and o.name = 'fk_reg_pd_jalur_daf_jalur_da')
alter table pdrd.reg_pd
   drop constraint fk_reg_pd_jalur_daf_jalur_da
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_pd') and o.name = 'fk_reg_pd_jenis_daf_jenis_pe')
alter table pdrd.reg_pd
   drop constraint fk_reg_pd_jenis_daf_jenis_pe
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_pd') and o.name = 'fk_reg_pd_prodi_pd_sms')
alter table pdrd.reg_pd
   drop constraint fk_reg_pd_prodi_pd_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_pd') and o.name = 'fk_reg_pd_pt_asal_satuan_p')
alter table pdrd.reg_pd
   drop constraint fk_reg_pd_pt_asal_satuan_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_pd') and o.name = 'fk_reg_pd_pt_pd_satuan_p')
alter table pdrd.reg_pd
   drop constraint fk_reg_pd_pt_pd_satuan_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_pd') and o.name = 'fk_reg_pd_register__peserta_')
alter table pdrd.reg_pd
   drop constraint fk_reg_pd_register__peserta_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_pd') and o.name = 'fk_reg_pd_semester__semester')
alter table pdrd.reg_pd
   drop constraint fk_reg_pd_semester__semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_pd') and o.name = 'fk_reg_pd_smt_yudis_semester')
alter table pdrd.reg_pd
   drop constraint fk_reg_pd_smt_yudis_semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_didik_nonformal') and o.name = 'fk_rwy_didi_rwy_didik_rwy_pend')
alter table pdrd.rwy_didik_nonformal
   drop constraint fk_rwy_didi_rwy_didik_rwy_pend
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
   where r.fkeyid = object_id('pdrd.rwy_struktural') and o.name = 'fk_rwy_stru_jab_stru__sdm')
alter table pdrd.rwy_struktural
   drop constraint fk_rwy_stru_jab_stru__sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_struktural') and o.name = 'fk_rwy_stru_rwyt_jab_jab_tgs')
alter table pdrd.rwy_struktural
   drop constraint fk_rwy_stru_rwyt_jab_jab_tgs
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sdm_anggota_litabmas') and o.name = 'fk_sdm_angg_ang_litab_sdm')
alter table pdrd.sdm_anggota_litabmas
   drop constraint fk_sdm_angg_ang_litab_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sdm_anggota_litabmas') and o.name = 'fk_sdm_angg_dosen_ang_litabmas')
alter table pdrd.sdm_anggota_litabmas
   drop constraint fk_sdm_angg_dosen_ang_litabmas
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tugas_tambahan') and o.name = 'fk_tugas_ta_jabatan_p_sms')
alter table pdrd.tugas_tambahan
   drop constraint fk_tugas_ta_jabatan_p_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tugas_tambahan') and o.name = 'fk_tugas_ta_tug_tamba_jab_tgs')
alter table pdrd.tugas_tambahan
   drop constraint fk_tugas_ta_tug_tamba_jab_tgs
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tugas_tambahan') and o.name = 'fk_tugas_ta_tugtam_pt_sdm')
alter table pdrd.tugas_tambahan
   drop constraint fk_tugas_ta_tugtam_pt_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tugas_tambahan') and o.name = 'fk_tugas_ta_tugtam_sp_satuan_p')
alter table pdrd.tugas_tambahan
   drop constraint fk_tugas_ta_tugtam_sp_satuan_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tulis_buku_ajar') and o.name = 'fk_tulis_bu_buku_ajar_buku_aja')
alter table pdrd.tulis_buku_ajar
   drop constraint fk_tulis_bu_buku_ajar_buku_aja
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tulis_pub') and o.name = 'fk_tulis_pu_penulis_p_publikas')
alter table pdrd.tulis_pub
   drop constraint fk_tulis_pu_penulis_p_publikas
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.uji_mhs') and o.name = 'fk_uji_mhs_aktmhs_uj_akt_mhs')
alter table pdrd.uji_mhs
   drop constraint fk_uji_mhs_aktmhs_uj_akt_mhs
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.uji_mhs') and o.name = 'fk_uji_mhs_dosen_pen_sdm')
alter table pdrd.uji_mhs
   drop constraint fk_uji_mhs_dosen_pen_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.visiting_scientist') and o.name = 'fk_visiting_capaian_v_kategori')
alter table pdrd.visiting_scientist
   drop constraint fk_visiting_capaian_v_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.visiting_scientist') and o.name = 'fk_visiting_luaran_vi_litabmas')
alter table pdrd.visiting_scientist
   drop constraint fk_visiting_luaran_vi_litabmas
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.visiting_scientist') and o.name = 'fk_visiting_pengundan_satuan_p')
alter table pdrd.visiting_scientist
   drop constraint fk_visiting_pengundan_satuan_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.visiting_scientist') and o.name = 'fk_visiting_ptk_visit_sdm')
alter table pdrd.visiting_scientist
   drop constraint fk_visiting_ptk_visit_sdm
go

alter table pdrd.akt_ajar_dosen
   drop constraint pk_akt_ajar_dosen
go

alter table pdrd.akt_ajar_dosen
   drop constraint ckc_soft_delete_akt_ajar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_akt_ajar_dosen')
            and   type = 'U')
   drop table pdrd.tmp_akt_ajar_dosen
go

execute sp_rename 'pdrd.akt_ajar_dosen', tmp_akt_ajar_dosen
go

alter table pdrd.anggota_orgprof
   drop constraint pk_anggota_orgprof
go

alter table pdrd.anggota_orgprof
   drop constraint ckc_delete_ang_org
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_anggota_orgprof')
            and   type = 'U')
   drop table pdrd.tmp_anggota_orgprof
go

execute sp_rename 'pdrd.anggota_orgprof', tmp_anggota_orgprof
go

alter table pdrd.anggota_panitia
   drop constraint pk_anggota_panitia
go

alter table pdrd.anggota_panitia
   drop constraint ckc_delete_ang_panitia
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_anggota_panitia')
            and   type = 'U')
   drop table pdrd.tmp_anggota_panitia
go

execute sp_rename 'pdrd.anggota_panitia', tmp_anggota_panitia
go

alter table pdrd.bimbing_dosen
   drop constraint pk_bimbing_dosen
go

alter table pdrd.bimbing_dosen 
   drop constraint ckc_jns_bimbing_bimbing_
go

alter table pdrd.bimbing_dosen
   drop constraint ckc_soft_delete_bimb_dosen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_bimbing_dosen')
            and   type = 'U')
   drop table pdrd.tmp_bimbing_dosen
go

execute sp_rename 'pdrd.bimbing_dosen', tmp_bimbing_dosen
go

alter table pdrd.bimbing_mhs
   drop constraint pk_bimbing_mhs
go

alter table pdrd.bimbing_mhs
   drop constraint ckc_soft_delete_bimb_mhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_bimbing_mhs')
            and   type = 'U')
   drop table pdrd.tmp_bimbing_mhs
go

execute sp_rename 'pdrd.bimbing_mhs', tmp_bimbing_mhs
go

alter table pdrd.detasering
   drop constraint pk_detasering
go

alter table pdrd.detasering
   drop constraint ckc_soft_delete_detaseri
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_detasering')
            and   type = 'U')
   drop table pdrd.tmp_detasering
go

execute sp_rename 'pdrd.detasering', tmp_detasering
go

alter table pdrd.diklat
   drop constraint pk_diklat
go

alter table pdrd.diklat
   drop constraint ckc_soft_delete_diklat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_diklat')
            and   type = 'U')
   drop table pdrd.tmp_diklat
go

execute sp_rename 'pdrd.diklat', tmp_diklat
go

alter table pdrd.pembicara
   drop constraint pk_pembicara
go

alter table pdrd.pembicara
   drop constraint ckc_kat_bicara_pembicar
go

alter table pdrd.pembicara
   drop constraint ckc_tkt_temu_pembicar
go

alter table pdrd.pembicara
   drop constraint ckc_jns_afiliasi_pembicar
go

alter table pdrd.pembicara
   drop constraint ckc_soft_delete_pembicar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_pembicara')
            and   type = 'U')
   drop table pdrd.tmp_pembicara
go

execute sp_rename 'pdrd.pembicara', tmp_pembicara
go

alter table pdrd.pengelola_jurnal
   drop constraint pk_pengelola_jurnal
go

alter table pdrd.pengelola_jurnal
   drop constraint ckc_a_aktif_pengelol
go

alter table pdrd.pengelola_jurnal
   drop constraint ckc_soft_delete_pengelol
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_pengelola_jurnal')
            and   type = 'U')
   drop table pdrd.tmp_pengelola_jurnal
go

execute sp_rename 'pdrd.pengelola_jurnal', tmp_pengelola_jurnal
go

alter table pdrd.penghargaan
   drop constraint pk_penghargaan
go

alter table pdrd.penghargaan
   drop constraint ckc_soft_delete_pengharg
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_penghargaan')
            and   type = 'U')
   drop table pdrd.tmp_penghargaan
go

execute sp_rename 'pdrd.penghargaan', tmp_penghargaan
go

alter table pdrd.reg_pd
   drop constraint pk_reg_pd
go

alter table pdrd.reg_pd
   drop constraint ckc_a_pindah_mhs_asin_reg_pd
go

alter table pdrd.reg_pd
   drop constraint ckc_soft_delete_reg_pd
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_reg_pd')
            and   type = 'U')
   drop table pdrd.tmp_reg_pd
go

execute sp_rename 'pdrd.reg_pd', tmp_reg_pd
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

alter table pdrd.rwy_struktural
   drop constraint pk_rwy_struktural
go

alter table pdrd.rwy_struktural
   drop constraint ckc_soft_delete_rwy_stru
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_rwy_struktural')
            and   type = 'U')
   drop table pdrd.tmp_rwy_struktural
go

execute sp_rename 'pdrd.rwy_struktural', tmp_rwy_struktural
go

alter table pdrd.sdm_anggota_litabmas
   drop constraint pk_sdm_anggota_litabmas
go

alter table pdrd.sdm_anggota_litabmas 
   drop constraint ckc_peran_litabmas_sdm_angg
go

alter table pdrd.sdm_anggota_litabmas
   drop constraint ckc_stat_aktif_sdm_angg
go

alter table pdrd.sdm_anggota_litabmas
   drop constraint ckc_soft_delete_sdm_angg
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_sdm_anggota_litabmas')
            and   type = 'U')
   drop table pdrd.tmp_sdm_anggota_litabmas
go

execute sp_rename 'pdrd.sdm_anggota_litabmas', tmp_sdm_anggota_litabmas
go

alter table pdrd.tugas_tambahan
   drop constraint pk_tugas_tambahan
go

alter table pdrd.tugas_tambahan
   drop constraint ckc_soft_delete_tugas_ta
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_tugas_tambahan')
            and   type = 'U')
   drop table pdrd.tmp_tugas_tambahan
go

execute sp_rename 'pdrd.tugas_tambahan', tmp_tugas_tambahan
go

alter table pdrd.tulis_buku_ajar
   drop constraint pk_tulis_buku_ajar
go

alter table pdrd.tulis_buku_ajar
   drop constraint ckc_peran_tulis_tulis_bu
go

alter table pdrd.tulis_buku_ajar
   drop constraint ckc_jns_penulis_tulis_bu
go

alter table pdrd.tulis_buku_ajar
   drop constraint ckc_soft_delete_tulis_bu
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_tulis_buku_ajar')
            and   type = 'U')
   drop table pdrd.tmp_tulis_buku_ajar
go

execute sp_rename 'pdrd.tulis_buku_ajar', tmp_tulis_buku_ajar
go

alter table pdrd.tulis_pub
   drop constraint pk_tulis_pub
go

alter table pdrd.tulis_pub 
   drop constraint ckc_jns_afiliasi_tulis_pu
go

alter table pdrd.tulis_pub
   drop constraint ckc_peran_tulis_tulis_pu
go

alter table pdrd.tulis_pub
   drop constraint ckc_jns_penulis_tulis_pu
go

alter table pdrd.tulis_pub
   drop constraint ckc_a_corr_author_tulis_pu
go

alter table pdrd.tulis_pub
   drop constraint ckc_soft_delete_tulis_pu
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_tulis_pub')
            and   type = 'U')
   drop table pdrd.tmp_tulis_pub
go

execute sp_rename 'pdrd.tulis_pub', tmp_tulis_pub
go

alter table pdrd.uji_mhs
   drop constraint pk_uji_mhs
go

alter table pdrd.uji_mhs
   drop constraint ckc_soft_delete_uji_mhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_uji_mhs')
            and   type = 'U')
   drop table pdrd.tmp_uji_mhs
go

execute sp_rename 'pdrd.uji_mhs', tmp_uji_mhs
go

alter table pdrd.visiting_scientist
   drop constraint pk_visiting_scientist
go

alter table pdrd.visiting_scientist
   drop constraint ckc_soft_delete_visiting
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_visiting_scientist')
            and   type = 'U')
   drop table pdrd.tmp_visiting_scientist
go

execute sp_rename 'pdrd.visiting_scientist', tmp_visiting_scientist
go

/*==============================================================*/
/* User: presensi                                               */
/*==============================================================*/
create schema presensi
go

/*==============================================================*/
/* Table: akt_ajar_dosen                                        */
/*==============================================================*/
create table pdrd.akt_ajar_dosen (
   id_ajar              uniqueidentifier     not null,
   id_reg_ptk           uniqueidentifier     not null,
   id_subst             uniqueidentifier     null,
   id_katgiat           int                  not null,
   katgiat_ajar_id_katgiat int                  not null,
   id_jns_eval          smallint             not null,
   id_kls               uniqueidentifier     not null,
   sks_subst_tot        numeric(5,2)         not null,
   sks_tm_subst         numeric(5,2)         not null,
   sks_prak_subst       numeric(5,2)         not null,
   sks_prak_lap_subst   numeric(5,2)         not null,
   sks_sim_subst        numeric(5,2)         not null,
   jml_tm_renc          numeric(2)           not null,
   jml_tm_real          numeric(2)           null,
   jml_mhs              smallint             null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_akt_ajar check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_akt_ajar_dosen primary key (id_ajar)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_akt_ajar_dosen')
            and   type = 'U')
   drop table pdrd.tmp_akt_ajar_dosen
go

/*==============================================================*/
/* Table: anggota_orgprof                                       */
/*==============================================================*/
create table pdrd.anggota_orgprof (
   id_ang_orgprof       uniqueidentifier     not null,
   id_katgiat           int                  not null,
   id_sdm               uniqueidentifier     not null,
   nm_org               varchar(100)         not null,
   peran                varchar(30)          not null,
   mulai_anggota        date                 not null,
   selesai_anggota      date                 null,
   instansi_profesi     varchar(100)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_ang_org check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_anggota_orgprof primary key (id_ang_orgprof)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_anggota_orgprof')
            and   type = 'U')
   drop table pdrd.tmp_anggota_orgprof
go
/*==============================================================*/
/* Table: anggota_panitia                                       */
/*==============================================================*/
create table pdrd.anggota_panitia (
   id_ang_panitia       uniqueidentifier     not null,
   id_panitia           uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_katgiat           int                  not null,
   peran                varchar(30)          not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_ang_panitia check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_anggota_panitia primary key (id_ang_panitia)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_anggota_panitia')
            and   type = 'U')
   drop table pdrd.tmp_anggota_panitia
go
/*==============================================================*/
/* Table: basis_evaluasi                                        */
/*==============================================================*/
create table ref.basis_evaluasi (
   id_basis_evaluasi    numeric(2)           not null,
   nm_basis_evaluasi    varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_basis_evaluasi primary key (id_basis_evaluasi)
)
go

/*==============================================================*/
/* Table: bimbing_dosen                                         */
/*==============================================================*/
create table pdrd.bimbing_dosen (
   id_bimb_dosen        uniqueidentifier     not null,
   id_katgiat           int                  not null,
   tgl_mulai            date                 not null,
   tgl_selesai          date                 not null,
   bid_ahli_pembimbing  varchar(50)          null,
   bid_ahli_bimbingan   varchar(50)          null,
   desk_kegiatan        text                 null,
   jns_bimbing          char(1)              not null 
      constraint ckc_jns_bimbing_bimbing_ check (jns_bimbing in ('R','C')),
   sk_tugas             varchar(80)          not null,
   tgl_sk_tugas         date                 not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_bimb_dosen check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_bimbing_dosen primary key (id_bimb_dosen)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_bimbing_dosen')
            and   type = 'U')
   drop table pdrd.tmp_bimbing_dosen
go
/*==============================================================*/
/* Table: bimbing_mhs                                           */
/*==============================================================*/
create table pdrd.bimbing_mhs (
   id_bimb_mhs          uniqueidentifier     not null,
   id_katgiat           int                  not null,
   id_sdm               uniqueidentifier     not null,
   id_akt_mhs           uniqueidentifier     not null,
   urutan_promotor      numeric(1)           not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_bimb_mhs check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_bimbing_mhs primary key (id_bimb_mhs)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_bimbing_mhs')
            and   type = 'U')
   drop table pdrd.tmp_bimbing_mhs
go
/*==============================================================*/
/* Table: detasering                                            */
/*==============================================================*/
create table pdrd.detasering (
   id_detasering        uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_sp_sumber         uniqueidentifier     not null,
   id_sp_sasaran        uniqueidentifier     not null,
   id_katgiat           int                  not null,
   tgl_mulai            date                 null,
   tgl_selesai          date                 null,
   bid_tgs              varchar(100)         null,
   desk_keg             text                 null,
   metode_laks          varchar(30)          null,
   sk_tugas             varchar(80)          not null,
   tgl_sk_tugas         date                 not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_detaseri check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_detasering primary key (id_detasering)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_detasering')
            and   type = 'U')
   drop table pdrd.tmp_detasering
go

/*==============================================================*/
/* Table: diklat                                                */
/*==============================================================*/
create table pdrd.diklat (
   id_diklat            uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_kel_bidang        uniqueidentifier     null,
   id_katgiat           int                  not null,
   id_jns_diklat        int                  not null,
   nm_diklat            varchar(160)         not null,
   penyelenggara        varchar(100)         null,
   thn                  numeric(4)           not null,
   peran                varchar(30)          null,
   tkt                  numeric(2)           null,
   jml_jam              numeric(4)           null,
   no_sert              varchar(80)          null,
   tgl_sert             date                 null,
   tempat               varchar(20)          null,
   tgl_mulai            date                 null,
   tgl_selesai          date                 null,
   sk_tugas             varchar(80)          null,
   tgl_sk_tugas         date                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_diklat check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_diklat primary key (id_diklat)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_diklat')
            and   type = 'U')
   drop table pdrd.tmp_diklat
go

/*==============================================================*/
/* Table: jadwal_kelas                                          */
/*==============================================================*/
create table pdrd.jadwal_kelas (
   id_jdwl_kls          uniqueidentifier     not null,
   id_kls               uniqueidentifier     not null,
   id_smt               char(5)              not null,
   pertemuan            numeric(2)           null,
   tgl_jadwal           datetime             null,
   waktu_mulai          varchar(5)           null,
   waktu_selesai        varchar(5)           null,
   lokasi               varchar(100)         null,
   status               varchar(20)          null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_jadwal_k check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_jadwal_kelas primary key (id_jdwl_kls)
)
go

/*==============================================================*/
/* Table: kategori_tabel                                        */
/*==============================================================*/
create table ref.kategori_tabel (
   id_kat_tabel         uniqueidentifier     not null,
   id_katgiat           int                  not null,
   nm_schema            varchar(100)         null,
   nm_tbl               varchar(100)         not null,
   konfig_kolom         text                 null,
   ket                  varchar(250)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kategori_tabel primary key (id_kat_tabel)
)
go

/*==============================================================*/
/* Table: kehadiran_mhs                                         */
/*==============================================================*/
create table presensi.kehadiran_mhs (
   id_reg_ptk           uniqueidentifier     not null,
   id_kls               uniqueidentifier     not null,
   id_hadir_mhs         uniqueidentifier     not null,
   tgl_hadir            datetime             null,
   waktu_presensi       datetime             null,
   stat_hadir           char(1)              not null default 'H'
      constraint ckc_stat_hadir_kehadira check (stat_hadir in ('A','C','I','H')),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_hadir_mhs check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_kehadiran_mhs primary key (id_reg_ptk, id_kls, id_hadir_mhs)
)
go

/*==============================================================*/
/* Table: kehadiran_sdm                                         */
/*==============================================================*/
create table presensi.kehadiran_sdm (
   id_kehadiran_sdm     uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   tgl_hadir            datetime             not null,
   waktu_presensi       datetime             null,
   lokasi_presensi      varchar(60)          null,
   waktu_pulang         datetime             null,
   lokasi_pulang        varchar(60)          null,
   rencana_hari_ini     text                 null,
   realisasi_hari_ini   text                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_kehadira check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_kehadiran_sdm primary key (id_kehadiran_sdm)
)
go

/*==============================================================*/
/* Table: kelola_unit_fungsi                                    */
/*==============================================================*/
create table kelola_unit_fungsi (
   id_kelola_unit_fungsi uniqueidentifier     not null,
   id_katgiat           int                  not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_kelola_u check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   nm_keg               varchar(160)         null,
   thn_keg              numeric(4)           null,
   jml_keg              numeric(10,3)        null,
   jml_lingkup          numeric(10,3)        null,
   jml_ruang            numeric(10,3)        null,
   jml_pertemuan        numeric(10,3)        null,
   jml_anggota          numeric(10,3)        null,
   jml_mhs              smallint             null,
   jml_dosen            numeric(10,3)        null,
   jml_kelas            numeric(10,3)        null,
   jml_bulan            numeric(10,3)        null,
   jml_minggu           numeric(10,3)        null,
   jml_jam              numeric(4)           null,
   jml_praktikum        numeric(10,3)        null,
   baru_revisi          char(1)              null 
      constraint ckc_baru_revisi_kelola_u check (baru_revisi is null or (baru_revisi in ('B','R'))),
   constraint pk_kelola_unit_fungsi primary key (id_kelola_unit_fungsi)
)
go

/*==============================================================*/
/* Table: log_table_app                                         */
/*==============================================================*/
create table logger.log_table_app (
   id_log_table_app     uniqueidentifier     not null,
   id_aplikasi          uniqueidentifier     not null,
   id_pengguna          uniqueidentifier     not null,
   id_table_app         uniqueidentifier     not null,
   waktu_mulai          varchar(5)           not null,
   keterangan           varchar(255)         null,
   constraint pk_log_table_app primary key (id_log_table_app)
)
go

/*==============================================================*/
/* Table: pembicara                                             */
/*==============================================================*/
create table pdrd.pembicara (
   id_pembicara         uniqueidentifier     not null,
   id_kat_capaian       numeric(3)           null,
   id_sdm               uniqueidentifier     not null,
   id_katgiat           int                  not null,
   id_litabmas          uniqueidentifier     null,
   judul_makalah        varchar(500)         not null,
   nm_temu_ilmiah       varchar(160)         not null,
   kat_bicara           char(1)              not null 
      constraint ckc_kat_bicara_pembicar check (kat_bicara in ('1','2','3')),
   penyelenggara        varchar(100)         not null,
   tgl_laks             date                 null,
   bahasa               varchar(20)          null,
   tkt_temu             char(1)              null 
      constraint ckc_tkt_temu_pembicar check (tkt_temu is null or (tkt_temu in ('L','D','N','I','X'))),
   sk_tugas             varchar(80)          null,
   tgl_sk_tugas         date                 null,
   id_afiliasi          uniqueidentifier     null,
   jns_afiliasi         char(1)              null 
      constraint ckc_jns_afiliasi_pembicar check (jns_afiliasi is null or (jns_afiliasi in ('I','S'))),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_pembicar check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_pembicara primary key (id_pembicara)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_pembicara')
            and   type = 'U')
   drop table pdrd.tmp_pembicara
go

/*==============================================================*/
/* Table: pengaturan_table_aplikasi                             */
/*==============================================================*/
create table man_akses.pengaturan_table_aplikasi (
   id_pengaturan_table_app uniqueidentifier     not null,
   id_table_app         uniqueidentifier     not null,
   id_aplikasi          uniqueidentifier     not null,
   a_enable             numeric(1)           not null default 0
      constraint ckc_a_enable_pengatur check (a_enable between 0 and 1 and a_enable in (0,1)),
   a_boleh_insert       numeric(1)           null default 0
      constraint ckc_a_boleh_insert_pengatur check (a_boleh_insert is null or (a_boleh_insert between 0 and 1 and a_boleh_insert in (0,1))),
   a_boleh_show         numeric(1)           null default 0
      constraint ckc_a_boleh_show_pengatur check (a_boleh_show is null or (a_boleh_show between 0 and 1 and a_boleh_show in (0,1))),
   a_boleh_delete       numeric(1)           null default 0
      constraint ckc_a_boleh_delete_pengatur check (a_boleh_delete is null or (a_boleh_delete between 0 and 1 and a_boleh_delete in (0,1))),
   a_boleh_update       numeric(1)           null default 0
      constraint ckc_a_boleh_update_pengatur check (a_boleh_update is null or (a_boleh_update between 0 and 1 and a_boleh_update in (0,1))),
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_pengaturan_table_aplikasi primary key (id_pengaturan_table_app)
)
go

/*==============================================================*/
/* Table: pengelola_jurnal                                      */
/*==============================================================*/
create table pdrd.pengelola_jurnal (
   id_kelola_jurnal     uniqueidentifier     not null,
   id_media_pub         uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_katgiat           int                  not null,
   peran                varchar(30)          not null,
   sk_tugas             varchar(80)          not null,
   tmt_sk_tugas         date                 not null,
   tst_sk_tugas         date                 null,
   a_aktif              numeric(1)           not null default 1
      constraint ckc_a_aktif_pengelol check (a_aktif between 0 and 1 and a_aktif in (0,1)),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_pengelol check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_pengelola_jurnal primary key (id_kelola_jurnal)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_pengelola_jurnal')
            and   type = 'U')
   drop table pdrd.tmp_pengelola_jurnal
go

/*==============================================================*/
/* Table: penghargaan                                           */
/*==============================================================*/
create table pdrd.penghargaan (
   id_penghargaan       uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_jns_penghargaan   int                  not null,
   id_tkt_penghargaan   int                  not null,
   id_katgiat           int                  not null,
   nm_penghargaan       varchar(160)         not null,
   tgl_penghargaan      date                 null,
   thn_penghargaan      numeric(4)           not null,
   instansi             varchar(100)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_pengharg check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_penghargaan primary key (id_penghargaan)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_penghargaan')
            and   type = 'U')
   drop table pdrd.tmp_penghargaan
go

/*==============================================================*/
/* Table: peta_katgiat_jabfung                                  */
/*==============================================================*/
create table ref.peta_katgiat_jabfung (
   id_katgiat           int                  not null,
   id_jabfung           numeric(5)           not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_peta_katgiat_jabfung primary key (id_katgiat, id_jabfung)
)
go

/*==============================================================*/
/* Table: peta_katgiat_jnsdok                                   */
/*==============================================================*/
create table ref.peta_katgiat_jnsdok (
   id_katgiat           int                  not null,
   id_jns_dok           int                  not null,
   a_wajib              numeric(1)           null default 0
      constraint ckc_a_wajib_peta_kat check (a_wajib is null or (a_wajib between 0 and 1 and a_wajib in (0,1))),
   no_urut              int                  null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_peta_katgiat_jnsdok primary key (id_katgiat, id_jns_dok)
)
go

/*==============================================================*/
/* Table: peta_katgiat_jnspub                                   */
/*==============================================================*/
create table ref.peta_katgiat_jnspub (
   id_katgiat           int                  not null,
   id_jns_pub           int                  not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_peta_katgiat_jnspub primary key (id_katgiat, id_jns_pub)
)
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
   last_sync            datetime             not null,
   constraint pk_re_mk primary key (id_basis_evaluasi, id_mk)
)
go

/*==============================================================*/
/* Table: reg_pd                                                */
/*==============================================================*/
create table pdrd.reg_pd (
   id_reg_pd            uniqueidentifier     not null,
   id_sp                uniqueidentifier     not null,
   id_sms               uniqueidentifier     null,
   id_pd                uniqueidentifier     not null,
   id_jns_daftar        numeric(2)           not null,
   id_jalur_daftar      numeric              not null,
   id_pembiayaan        numeric(2)           not null,
   id_smt               char(5)              null,
   tgl_masuk_sp         date                 not null,
   nipd                 varchar(24)          not null,
   id_semester_masuk    char(5)              not null,
   id_pt_asal           uniqueidentifier     null,
   nm_pt_asal           varchar(100)         null,
   id_prodi_asal        uniqueidentifier     null,
   nm_prodi_asal        varchar(100)         null,
   id_jns_keluar        char(1)              null,
   tgl_keluar           date                 null,
   ket                  varchar(250)         null,
   skhun                char(20)             null,
   no_peserta_ujian     char(20)             null,
   no_seri_ijazah       varchar(80)          null,
   asal_data_ijazah     char(1)              not null default '0',
   bidang_mayor         varchar(100)         null,
   bidang_minor         varchar(100)         null,
   sks_diakui           numeric(3)           null,
   jalur_skripsi        numeric(1)           null,
   judul_skripsi        varchar(500)         null,
   bln_awal_bimbingan   date                 null,
   bln_akhir_bimbingan  date                 null,
   sk_yudisium          varchar(80)          null,
   tgl_sk_yudisium      date                 null,
   ipk                  numeric(5,2)         null,
   sert_prof            varchar(80)          null,
   a_pindah_mhs_asing   numeric(1)           null default 0
      constraint ckc_a_pindah_mhs_asin_reg_pd check (a_pindah_mhs_asing is null or (a_pindah_mhs_asing between 0 and 1 and a_pindah_mhs_asing in (0,1))),
   biaya_masuk_kuliah   numeric(16,2)        null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_reg_pd check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_reg_pd primary key (id_reg_pd)
)
go

insert into pdrd.reg_pd (id_reg_pd, id_sp, id_sms, id_pd, id_jns_daftar, id_jalur_daftar, id_pembiayaan, id_smt, tgl_masuk_sp, nipd, id_semester_masuk, id_pt_asal, nm_pt_asal, id_prodi_asal, nm_prodi_asal, id_jns_keluar, tgl_keluar, ket, skhun, no_peserta_ujian, no_seri_ijazah, asal_data_ijazah, bidang_mayor, bidang_minor, sks_diakui, jalur_skripsi, judul_skripsi, bln_awal_bimbingan, bln_akhir_bimbingan, sk_yudisium, tgl_sk_yudisium, ipk, sert_prof, a_pindah_mhs_asing, biaya_masuk_kuliah, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_reg_pd, id_sp, id_sms, id_pd, id_jns_daftar, id_jalur_daftar, id_pembiayaan, id_smt, tgl_masuk_sp, nipd, id_semester_masuk, id_sp_asal, nm_pt_asal, id_prodi_asal, nm_prodi_asal, id_jns_keluar, tgl_keluar, ket, skhun, no_peserta_ujian, no_seri_ijazah, asal_data_ijazah, bidang_mayor, bidang_minor, sks_diakui, jalur_skripsi, judul_skripsi, bln_awal_bimbingan, bln_akhir_bimbingan, sk_yudisium, tgl_sk_yudisium, ipk, sert_prof, a_pindah_mhs_asing, biaya_masuk_kuliah, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_reg_pd
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_reg_pd')
            and   type = 'U')
   drop table pdrd.tmp_reg_pd
go

/*==============================================================*/
/* Table: rencana_ajar                                          */
/*==============================================================*/
create table pdrd.rencana_ajar (
   id_renc_ajar         uniqueidentifier     not null,
   id_mk                uniqueidentifier     not null,
   pertemuan            numeric(2)           not null,
   materi_indonesia     varchar(1000)        null,
   materi_inggris       varchar(1000)        null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_rencana_ check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_rencana_ajar primary key (id_renc_ajar)
)
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

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_rwy_pend_formal')
            and   type = 'U')
   drop table pdrd.tmp_rwy_pend_formal
go

/*==============================================================*/
/* Table: rwy_struktural                                        */
/*==============================================================*/
create table pdrd.rwy_struktural (
   id_rwy_jabstruk      uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_katgiat           int                  not null,
   id_jab_tgs           numeric(5)           not null,
   sk_jabstruk          varchar(80)          not null,
   tmt_sk_jabstruk      date                 not null,
   tst_sk_jabstruk      date                 null,
   lokasi_tugas         varchar(80)          null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_rwy_stru check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_rwy_struktural primary key (id_rwy_jabstruk)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_rwy_struktural')
            and   type = 'U')
   drop table pdrd.tmp_rwy_struktural
go

/*==============================================================*/
/* Table: sdm_anggota_litabmas                                  */
/*==============================================================*/
create table pdrd.sdm_anggota_litabmas (
   id_litabmas          uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_katgiat           int                  not null,
   peran_litabmas       char(1)              not null 
      constraint ckc_peran_litabmas_sdm_angg check (peran_litabmas in ('A','K')),
   stat_aktif           numeric(1)           not null default 0
      constraint ckc_stat_aktif_sdm_angg check (stat_aktif between 0 and 1 and stat_aktif in (0,1)),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_sdm_angg check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_sdm_anggota_litabmas primary key (id_litabmas, id_sdm)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_sdm_anggota_litabmas')
            and   type = 'U')
   drop table pdrd.tmp_sdm_anggota_litabmas
go

/*==============================================================*/
/* Table: table_aplikasi                                        */
/*==============================================================*/
create table man_akses.table_aplikasi (
   id_table_app         uniqueidentifier     not null,
   skema_tbl            varchar(100)         not null,
   nm_tbl               varchar(100)         not null,
   kode_primary         varchar(100)         null,
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_table_aplikasi primary key (id_table_app)
)
go

/*==============================================================*/
/* Table: tugas_tambahan                                        */
/*==============================================================*/
create table pdrd.tugas_tambahan (
   id_tgs_tambah        uniqueidentifier     not null,
   id_jab_tgs           numeric(5)           not null,
   id_sdm               uniqueidentifier     not null,
   id_katgiat           int                  not null,
   id_sms               uniqueidentifier     null,
   id_sp                uniqueidentifier     not null,
   jml_jam              numeric(4)           not null,
   sk_tugas_tambah      varchar(80)          not null,
   tmt_sk_tambah        date                 not null,
   tst_sk_tambah        date                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_tugas_ta check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_tugas_tambahan primary key (id_tgs_tambah)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_tugas_tambahan')
            and   type = 'U')
   drop table pdrd.tmp_tugas_tambahan
go

/*==============================================================*/
/* Table: tulis_buku_ajar                                       */
/*==============================================================*/
create table pdrd.tulis_buku_ajar (
   id_tulis_buku_ajar   uniqueidentifier     not null,
   id_katgiat           int                  not null,
   id_buku_ajar         uniqueidentifier     not null,
   id_sdm               uniqueidentifier     null,
   id_pd                uniqueidentifier     null,
   id_orang             uniqueidentifier     null,
   urutan2              int                  not null,
   afiliasi             varchar(200)         null,
   peran_tulis          char(1)              not null default 'A'
      constraint ckc_peran_tulis_tulis_bu check (peran_tulis in ('A','B','C','D')),
   jns_penulis          char(1)              not null default '1'
      constraint ckc_jns_penulis_tulis_bu check (jns_penulis in ('1','2','3')),
   nm_pd                varchar(120)         null,
   nipd                 varchar(24)          null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_tulis_bu check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_tulis_buku_ajar primary key (id_tulis_buku_ajar)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_tulis_buku_ajar')
            and   type = 'U')
   drop table pdrd.tmp_tulis_buku_ajar
go

/*==============================================================*/
/* Table: tulis_pub                                             */
/*==============================================================*/
create table pdrd.tulis_pub (
   id_tulis_pub         uniqueidentifier     not null,
   id_publikasi         uniqueidentifier     not null,
   id_sdm               uniqueidentifier     null,
   id_katgiat           int                  not null,
   id_pd                uniqueidentifier     null,
   id_orang             uniqueidentifier     null,
   urutan2              int                  not null,
   afiliasi             varchar(200)         null,
   peran_tulis          char(1)              not null default 'A'
      constraint ckc_peran_tulis_tulis_pu check (peran_tulis in ('A','B','C','D')),
   jns_penulis          char(1)              not null default '1'
      constraint ckc_jns_penulis_tulis_pu check (jns_penulis in ('1','2','3')),
   a_corr_author        numeric(1)           not null default 0
      constraint ckc_a_corr_author_tulis_pu check (a_corr_author between 0 and 1 and a_corr_author in (0,1)),
   nm_pd                varchar(120)         null,
   nipd                 varchar(24)          null,
   id_afiliasi          uniqueidentifier     null,
   jns_afiliasi         char(1)              null 
      constraint ckc_jns_afiliasi_tulis_pu check (jns_afiliasi is null or (jns_afiliasi in ('I','S'))),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_tulis_pu check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_tulis_pub primary key (id_tulis_pub)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_tulis_pub')
            and   type = 'U')
   drop table pdrd.tmp_tulis_pub
go

/*==============================================================*/
/* Table: uji_mhs                                               */
/*==============================================================*/
create table pdrd.uji_mhs (
   id_uji_mhs           uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_katgiat           int                  not null,
   id_akt_mhs           uniqueidentifier     not null,
   urutan_uji           numeric(1)           not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_uji_mhs check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_uji_mhs primary key (id_uji_mhs)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_uji_mhs')
            and   type = 'U')
   drop table pdrd.tmp_uji_mhs
go

/*==============================================================*/
/* Table: visiting_scientist                                    */
/*==============================================================*/
create table pdrd.visiting_scientist (
   id_visit             uniqueidentifier     not null,
   id_sdm               uniqueidentifier     null,
   id_katgiat           int                  not null,
   id_sp                uniqueidentifier     null,
   id_litabmas          uniqueidentifier     null,
   id_kat_capaian       numeric(3)           null,
   pt_pengundang        varchar(100)         null,
   lama_kegiatan        smallint             not null,
   kegiatan_penting     text                 null,
   tgl_laks             date                 null,
   sk_tugas             varchar(80)          null,
   tgl_sk_tugas         date                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_visiting check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_visiting_scientist primary key (id_visit)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_visiting_scientist')
            and   type = 'U')
   drop table pdrd.tmp_visiting_scientist
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_ajar_katg_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_katgiat_a_kategori foreign key (katgiat_ajar_id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_mengajar__substans foreign key (id_subst)
      references pdrd.substansi_kuliah (id_subst)
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_pengajara_jenis_ev foreign key (id_jns_eval)
      references ref.jenis_evaluasi (id_jns_eval)
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_pengambil_kelas_ku foreign key (id_kls)
      references pdrd.kelas_kuliah (id_kls)
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_ptk_penga_reg_ptk foreign key (id_reg_ptk)
      references pdrd.reg_ptk (id_reg_ptk)
go

alter table pdrd.anggota_aktivitas_mahasiswa
   add constraint fk_anggota__reg_ang_a_reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
go

alter table pdrd.anggota_orgprof
   add constraint fk_anggota__orgprof_k_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.anggota_orgprof
   add constraint fk_anggota__orgprof_p_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.anggota_panitia
   add constraint fk_anggota__anggota_p_kepaniti foreign key (id_panitia)
      references pdrd.kepanitiaan (id_panitia)
go

alter table pdrd.anggota_panitia
   add constraint fk_anggota__panitia_k_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.anggota_panitia
   add constraint fk_anggota__panitia_p_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.bimbing_dosen
   add constraint fk_bimbing__bimbdosen_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.bimbing_mhs
   add constraint fk_bimbing__aktmhs_bi_akt_mhs foreign key (id_akt_mhs)
      references pdrd.akt_mhs (id_akt_mhs)
go

alter table pdrd.bimbing_mhs
   add constraint fk_bimbing__bimbingmh_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.bimbing_mhs
   add constraint fk_bimbing__dosen_pem_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.detasering
   add constraint fk_detaseri_detas_kat_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.detasering
   add constraint fk_detaseri_pt_sas_de_satuan_p foreign key (id_sp_sasaran)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.detasering
   add constraint fk_detaseri_pt_sum_de_satuan_p foreign key (id_sp_sumber)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.detasering
   add constraint fk_detaseri_ptk_detas_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.diklat
   add constraint fk_diklat_diklat_je_jenis_di foreign key (id_jns_diklat)
      references ref.jenis_diklat (id_jns_diklat)
go

alter table pdrd.diklat
   add constraint fk_diklat_diklat_ka_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.diklat
   add constraint fk_diklat_diklat_ke_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.diklat
   add constraint fk_diklat_diklat_pt_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table dok.dok_ang_orgprof
   add constraint fk_dok_ang__angorgpro_anggota_ foreign key (id_ang_orgprof)
      references pdrd.anggota_orgprof (id_ang_orgprof)
go

alter table dok.dok_bimbing_dosen
   add constraint fk_dok_bimb_bimb_dos__bimbing_ foreign key (id_bimb_dosen)
      references pdrd.bimbing_dosen (id_bimb_dosen)
go

alter table dok.dok_detasering
   add constraint fk_dok_deta_detas_dok_detaseri foreign key (id_detasering)
      references pdrd.detasering (id_detasering)
go

alter table dok.dok_diklat
   add constraint fk_dok_dikl_diklat_do_diklat foreign key (id_diklat)
      references pdrd.diklat (id_diklat)
go

alter table dok.dok_jabstruk
   add constraint fk_dok_jabs_jabstruk__rwy_stru foreign key (id_rwy_jabstruk)
      references pdrd.rwy_struktural (id_rwy_jabstruk)
go

alter table dok.dok_pembicara
   add constraint fk_dok_pemb_pembicara_pembicar foreign key (id_pembicara)
      references pdrd.pembicara (id_pembicara)
go

alter table dok.dok_pengelola_jurnal
   add constraint fk_dok_peng_kelolajur_pengelol foreign key (id_kelola_jurnal)
      references pdrd.pengelola_jurnal (id_kelola_jurnal)
go

alter table dok.dok_penghargaan
   add constraint fk_dok_peng_pengharga_pengharg foreign key (id_penghargaan)
      references pdrd.penghargaan (id_penghargaan)
go

alter table dok.dok_rwy_didik
   add constraint fk_dok_rwy__didik_dok_rwy_pend foreign key (id_rwy_didik_formal)
      references pdrd.rwy_pend_formal (id_rwy_didik_formal)
go

alter table dok.dok_tugtam
   add constraint fk_dok_tugt_tugtam_do_tugas_ta foreign key (id_tgs_tambah)
      references pdrd.tugas_tambahan (id_tgs_tambah)
go

alter table dok.dok_visit_scientist
   add constraint fk_dok_visi_visiting__visiting foreign key (id_visit)
      references pdrd.visiting_scientist (id_visit)
go

alter table tracer.hasil_tracer_study
   add constraint fk_hasil_tr_reg_pd_ha_reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
go

alter table pdrd.jadwal_kelas
   add constraint fk_jadwal_k_jdwl_kls_kelas_ku foreign key (id_kls)
      references pdrd.kelas_kuliah (id_kls)
         on update cascade on delete cascade
go

alter table pdrd.jadwal_kelas
   add constraint fk_jadwal_k_jdwl_kls__semester foreign key (id_smt)
      references ref.semester (id_smt)
         on update cascade on delete cascade
go

alter table ref.kategori_tabel
   add constraint fk_kategori_kat_metad_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table presensi.kehadiran_mhs
   add constraint fk_kehadira_hadir_mhs_kelas_ku foreign key (id_kls)
      references pdrd.kelas_kuliah (id_kls)
         on update cascade on delete cascade
go

alter table presensi.kehadiran_mhs
   add constraint fk_kehadira_hadir_mhs_reg_ptk foreign key (id_reg_ptk)
      references pdrd.reg_ptk (id_reg_ptk)
         on update cascade on delete cascade
go

alter table presensi.kehadiran_sdm
   add constraint fk_kehadira_hadir_sdm_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
         on update cascade on delete cascade
go

alter table kelola_unit_fungsi
   add constraint fk_kelola_u_kelola_la_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.kuliah_mhs
   add constraint fk_kuliah_m_register__reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
go

alter table logger.log_table_app
   add constraint fk_log_tabl_log_detai_table_ap foreign key (id_table_app)
      references man_akses.table_aplikasi (id_table_app)
         on update cascade on delete cascade
go

alter table logger.log_table_app
   add constraint fk_log_tabl_log_pengg_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
         on update cascade on delete cascade
go

alter table logger.log_table_app
   add constraint fk_log_tabl_log_table_aplikasi foreign key (id_aplikasi)
      references man_akses.aplikasi (id_aplikasi)
         on update cascade on delete cascade
go

alter table pdrd.pembicara
   add constraint fk_pembicar_bicara_ka_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.pembicara
   add constraint fk_pembicar_capaian_p_kategori foreign key (id_kat_capaian)
      references ref.kategori_capaian_luaran (id_kat_capaian)
go

alter table pdrd.pembicara
   add constraint fk_pembicar_luaran_pe_litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table pdrd.pembicara
   add constraint fk_pembicar_pembicata_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table man_akses.pengaturan_table_aplikasi
   add constraint fk_pengatur_app_setup_aplikasi foreign key (id_aplikasi)
      references man_akses.aplikasi (id_aplikasi)
         on update cascade on delete cascade
go

alter table man_akses.pengaturan_table_aplikasi
   add constraint fk_pengatur_setting_t_table_ap foreign key (id_table_app)
      references man_akses.table_aplikasi (id_table_app)
         on update cascade on delete cascade
go

alter table pdrd.pengelola_jurnal
   add constraint fk_pengelol_jurnal_ke_media_pu foreign key (id_media_pub)
      references ref.media_publikasi (id_media_pub)
go

alter table pdrd.pengelola_jurnal
   add constraint fk_pengelol_keljurnal_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.pengelola_jurnal
   add constraint fk_pengelol_kelola_ju_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.penghargaan
   add constraint fk_pengharg_harga_kat_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.penghargaan
   add constraint fk_pengharg_pengharga_jenis_pe foreign key (id_jns_penghargaan)
      references ref.jenis_penghargaan (id_jns_penghargaan)
go

alter table pdrd.penghargaan
   add constraint fk_pengharg_pengharga_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.penghargaan
   add constraint fk_pengharg_pengharga_tingkat_ foreign key (id_tkt_penghargaan)
      references ref.tingkat_penghargaan (id_tkt_penghargaan)
go

alter table ref.peta_katgiat_jabfung
   add constraint fk_peta_kat_jabfung_k_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table ref.peta_katgiat_jabfung
   add constraint fk_peta_kat_katgiat_j_jabfung foreign key (id_jabfung)
      references ref.jabfung (id_jabfung)
         on update cascade on delete cascade
go

alter table ref.peta_katgiat_jnsdok
   add constraint fk_peta_kat_jnsdok_ka_jenis_do foreign key (id_jns_dok)
      references ref.jenis_dokumen (id_jns_dok)
         on update cascade on delete cascade
go

alter table ref.peta_katgiat_jnsdok
   add constraint fk_peta_kat_katgiat_j_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table ref.peta_katgiat_jnspub
   add constraint fk_peta_kat_kat_pub_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table ref.peta_katgiat_jnspub
   add constraint fk_peta_kat_pub_kat_jenis_pu foreign key (id_jns_pub)
      references ref.jenis_publikasi (id_jns_pub)
         on update cascade on delete cascade
go

alter table pdrd.re_mk
   add constraint fk_re_mk_basis_eva_basis_ev foreign key (id_basis_evaluasi)
      references ref.basis_evaluasi (id_basis_evaluasi)
         on update cascade on delete cascade
go

alter table pdrd.re_mk
   add constraint fk_re_mk_mk_re_mk_matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
         on update cascade on delete cascade
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_alasan_ke_jenis_ke foreign key (id_jns_keluar)
      references ref.jenis_keluar (id_jns_keluar)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_biaya_reg_pembiaya foreign key (id_pembiayaan)
      references ref.pembiayaan (id_pembiayaan)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_jalur_daf_jalur_da foreign key (id_jalur_daftar)
      references ref.jalur_daftar (id_jalur_daftar)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_jenis_daf_jenis_pe foreign key (id_jns_daftar)
      references ref.jenis_pendaftaran (id_jns_daftar)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_prodi_pd_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_pt_asal_satuan_p foreign key (id_pt_asal)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_pt_pd_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_register__peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_semester__semester foreign key (id_semester_masuk)
      references ref.semester (id_smt)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_smt_yudis_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table pdrd.rencana_ajar
   add constraint fk_rencana__rencana_m_matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
         on update cascade on delete cascade
go

alter table pdrd.rwy_didik_nonformal
   add constraint fk_rwy_didi_rwy_didik_rwy_pend foreign key (id_rwy_didik_formal)
      references pdrd.rwy_pend_formal (id_rwy_didik_formal)
go

alter table pdrd.rwy_pend_formal
   add constraint fk_rwy_pend_didik_for_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.rwy_pend_formal
   add constraint fk_rwy_pend_ptk_rwyt__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
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

alter table pdrd.rwy_struktural
   add constraint fk_rwy_stru_jab_stru__sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_struktural
   add constraint fk_rwy_stru_jabstruk__kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.rwy_struktural
   add constraint fk_rwy_stru_rwyt_jab_jab_tgs foreign key (id_jab_tgs)
      references ref.jab_tgs (id_jab_tgs)
go

alter table pdrd.sdm_anggota_litabmas
   add constraint fk_sdm_angg_ang_litab_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.sdm_anggota_litabmas
   add constraint fk_sdm_angg_dosen_ang_litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table pdrd.sdm_anggota_litabmas
   add constraint fk_sdm_angg_litabmas__kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.tugas_tambahan
   add constraint fk_tugas_ta_jabatan_p_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.tugas_tambahan
   add constraint fk_tugas_ta_tug_tamba_jab_tgs foreign key (id_jab_tgs)
      references ref.jab_tgs (id_jab_tgs)
go

alter table pdrd.tugas_tambahan
   add constraint fk_tugas_ta_tugtam_ka_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.tugas_tambahan
   add constraint fk_tugas_ta_tugtam_pt_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.tugas_tambahan
   add constraint fk_tugas_ta_tugtam_sp_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.tulis_buku_ajar
   add constraint fk_tulis_bu_buku_ajar_buku_aja foreign key (id_buku_ajar)
      references pdrd.buku_ajar (id_buku_ajar)
go

alter table pdrd.tulis_buku_ajar
   add constraint fk_tulis_bu_na_ang_tu_non_ca foreign key (id_orang)
      references pdrd.non_ca (id_orang)
         on update cascade on delete cascade
go

alter table pdrd.tulis_buku_ajar
   add constraint fk_tulis_bu_pd_ang_tu_peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
         on update cascade on delete cascade
go

alter table pdrd.tulis_buku_ajar
   add constraint fk_tulis_bu_sdm_ang_t_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
         on update cascade on delete cascade
go

alter table pdrd.tulis_buku_ajar
   add constraint fk_tulis_bu_tulis_buk_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.tulis_pub
   add constraint fk_tulis_pu_na_ang_tu_non_ca foreign key (id_orang)
      references pdrd.non_ca (id_orang)
         on update cascade on delete cascade
go

alter table pdrd.tulis_pub
   add constraint fk_tulis_pu_pd_ang_tu_peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
         on update cascade on delete cascade
go

alter table pdrd.tulis_pub
   add constraint fk_tulis_pu_penulis_p_publikas foreign key (id_publikasi)
      references pdrd.publikasi (id_publikasi)
go

alter table pdrd.tulis_pub
   add constraint fk_tulis_pu_sdm_ang_t_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
         on update cascade on delete cascade
go

alter table pdrd.tulis_pub
   add constraint fk_tulis_pu_tulis_pub_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.uji_mhs
   add constraint fk_uji_mhs_aktmhs_uj_akt_mhs foreign key (id_akt_mhs)
      references pdrd.akt_mhs (id_akt_mhs)
go

alter table pdrd.uji_mhs
   add constraint fk_uji_mhs_dosen_pen_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.uji_mhs
   add constraint fk_uji_mhs_ujimhs_ka_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

alter table pdrd.visiting_scientist
   add constraint fk_visiting_capaian_v_kategori foreign key (id_kat_capaian)
      references ref.kategori_capaian_luaran (id_kat_capaian)
go

alter table pdrd.visiting_scientist
   add constraint fk_visiting_luaran_vi_litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table pdrd.visiting_scientist
   add constraint fk_visiting_pengundan_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.visiting_scientist
   add constraint fk_visiting_ptk_visit_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.visiting_scientist
   add constraint fk_visiting_visit_sci_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
         on update cascade on delete cascade
go

INSERT INTO man_akses.versi_db (versi,tgl_update) VALUES ('0.3.0',GETDATE())