/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     02/02/2022 02:15:44                          */
/*==============================================================*/


if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akreditasi_prodi') and o.name = 'fk_akredita_akreditas_sms')
alter table pdrd.akreditasi_prodi
   drop constraint fk_akredita_akreditas_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('man_akses.akses_table_aplikasi') and o.name = 'fk_akses_ta_dtl_akses_aplikasi')
alter table man_akses.akses_table_aplikasi
   drop constraint fk_akses_ta_dtl_akses_aplikasi
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
   where r.fkeyid = object_id('sarpras.alat') and o.name = 'fk_alat_alat_ptk2_sdm')
alter table sarpras.alat
   drop constraint fk_alat_alat_ptk2_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.anak') and o.name = 'fk_anak_anak_sdm_sdm')
alter table pdrd.anak
   drop constraint fk_anak_anak_sdm_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.anggota_orgprof') and o.name = 'fk_anggota__orgprof_p_sdm')
alter table pdrd.anggota_orgprof
   drop constraint fk_anggota__orgprof_p_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.anggota_panitia') and o.name = 'fk_anggota__panitia_p_sdm')
alter table pdrd.anggota_panitia
   drop constraint fk_anggota__panitia_p_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.angkutan') and o.name = 'fk_angkutan_alat_mili_sms')
alter table sarpras.angkutan
   drop constraint fk_angkutan_alat_mili_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.angkutan') and o.name = 'fk_angkutan_alat_ptk_sdm')
alter table sarpras.angkutan
   drop constraint fk_angkutan_alat_ptk_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('man_akses.aplikasi') and o.name = 'fk_aplikasi_unit_pemi_unit_org')
alter table man_akses.aplikasi
   drop constraint fk_aplikasi_unit_pemi_unit_org
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.bangunan') and o.name = 'fk_bangunan_sms_pemil_sms')
alter table sarpras.bangunan
   drop constraint fk_bangunan_sms_pemil_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('beasiswa.beasiswa_sdm') and o.name = 'fk_beasiswa_beasiswa__sdm')
alter table beasiswa.beasiswa_sdm
   drop constraint fk_beasiswa_beasiswa__sdm
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
   where r.fkeyid = object_id('keuangan.biaya_operasional') and o.name = 'fk_biaya_op_thn_angga_tahun_an')
alter table keuangan.biaya_operasional
   drop constraint fk_biaya_op_thn_angga_tahun_an
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.bimbing_mhs') and o.name = 'fk_bimbing__dosen_pem_sdm')
alter table pdrd.bimbing_mhs
   drop constraint fk_bimbing__dosen_pem_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.detasering') and o.name = 'fk_detaseri_ptk_detas_sdm')
alter table pdrd.detasering
   drop constraint fk_detaseri_ptk_detas_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.diklat') and o.name = 'fk_diklat_diklat_pt_sdm')
alter table pdrd.diklat
   drop constraint fk_diklat_diklat_pt_sdm
go

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
   where r.fkeyid = object_id('pdrd.inpassing') and o.name = 'fk_inpassin_inpassing_sdm')
alter table pdrd.inpassing
   drop constraint fk_inpassin_inpassing_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('presensi.kehadiran_sdm') and o.name = 'fk_kehadira_hadir_sdm_sdm')
alter table presensi.kehadiran_sdm
   drop constraint fk_kehadira_hadir_sdm_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kelas_kuliah') and o.name = 'fk_kelas_ku_prodi_kel_sms')
alter table pdrd.kelas_kuliah
   drop constraint fk_kelas_ku_prodi_kel_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kesejahteraan') and o.name = 'fk_kesejaht_kesejahte_sdm')
alter table pdrd.kesejahteraan
   drop constraint fk_kesejaht_kesejahte_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.litabmas') and o.name = 'fk_litabmas_tahun_keg_tahun_an')
alter table pdrd.litabmas
   drop constraint fk_litabmas_tahun_keg_tahun_an
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.litabmas') and o.name = 'fk_litabmas_tahun_pel_tahun_an')
alter table pdrd.litabmas
   drop constraint fk_litabmas_tahun_pel_tahun_an
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.litabmas') and o.name = 'fk_litabmas_tahun_usu_tahun_an')
alter table pdrd.litabmas
   drop constraint fk_litabmas_tahun_usu_tahun_an
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('logger.log_jwt') and o.name = 'fk_log_jwt_app_pemin_aplikasi')
alter table logger.log_jwt
   drop constraint fk_log_jwt_app_pemin_aplikasi
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('logger.log_login') and o.name = 'fk_log_logi_log_login_aplikasi')
alter table logger.log_login
   drop constraint fk_log_logi_log_login_aplikasi
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('logger.log_pengguna') and o.name = 'fk_log_peng_log_app_l_aplikasi')
alter table logger.log_pengguna
   drop constraint fk_log_peng_log_app_l_aplikasi
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('logger.log_table_app') and o.name = 'fk_log_tabl_log_table_aplikasi')
alter table logger.log_table_app
   drop constraint fk_log_tabl_log_table_aplikasi
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.map_abmas_tse') and o.name = 'fk_map_abma_abmas_tse_tse')
alter table pdrd.map_abmas_tse
   drop constraint fk_map_abma_abmas_tse_tse
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.map_abmas_tse') and o.name = 'fk_map_abma_tse_abmas_litabmas')
alter table pdrd.map_abmas_tse
   drop constraint fk_map_abma_tse_abmas_litabmas
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.map_litabmas_bidang') and o.name = 'fk_map_lita_bidang_li_litabmas')
alter table pdrd.map_litabmas_bidang
   drop constraint fk_map_lita_bidang_li_litabmas
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.map_litabmas_bidang') and o.name = 'fk_map_lita_litabmas__kelompok')
alter table pdrd.map_litabmas_bidang
   drop constraint fk_map_lita_litabmas__kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.map_publikasi_bidang') and o.name = 'fk_map_publ_pub_bidan_kelompok')
alter table pdrd.map_publikasi_bidang
   drop constraint fk_map_publ_pub_bidan_kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.map_publikasi_bidang') and o.name = 'fk_map_publ_pub_bidan_publikas')
alter table pdrd.map_publikasi_bidang
   drop constraint fk_map_publ_pub_bidan_publikas
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.matkul') and o.name = 'fk_matkul_prodi_mat_sms')
alter table pdrd.matkul
   drop constraint fk_matkul_prodi_mat_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('man_akses.menu') and o.name = 'fk_menu_menu_apli_aplikasi')
alter table man_akses.menu
   drop constraint fk_menu_menu_apli_aplikasi
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.nilai_tes') and o.name = 'fk_nilai_te_nilai_tes_sdm')
alter table pdrd.nilai_tes
   drop constraint fk_nilai_te_nilai_tes_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.pembicara') and o.name = 'fk_pembicar_pembicata_sdm')
alter table pdrd.pembicara
   drop constraint fk_pembicar_pembicata_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('man_akses.pengaturan_table_aplikasi') and o.name = 'fk_pengatur_app_setup_aplikasi')
alter table man_akses.pengaturan_table_aplikasi
   drop constraint fk_pengatur_app_setup_aplikasi
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('man_akses.pengaturan_table_aplikasi') and o.name = 'fk_pengatur_setting_t_table_ap')
alter table man_akses.pengaturan_table_aplikasi
   drop constraint fk_pengatur_setting_t_table_ap
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.pengelola_jurnal') and o.name = 'fk_pengelol_kelola_ju_sdm')
alter table pdrd.pengelola_jurnal
   drop constraint fk_pengelol_kelola_ju_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.penghargaan') and o.name = 'fk_pengharg_pengharga_sdm')
alter table pdrd.penghargaan
   drop constraint fk_pengharg_pengharga_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('man_akses.pj_aplikasi') and o.name = 'fk_pj_aplik_list_pj_a_aplikasi')
alter table man_akses.pj_aplikasi
   drop constraint fk_pj_aplik_list_pj_a_aplikasi
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.prestasi') and o.name = 'fk_prestasi_prestasi__jenis_pr')
alter table pdrd.prestasi
   drop constraint fk_prestasi_prestasi__jenis_pr
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.prestasi') and o.name = 'fk_prestasi_prestasi__peserta_')
alter table pdrd.prestasi
   drop constraint fk_prestasi_prestasi__peserta_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.prestasi') and o.name = 'fk_prestasi_prestasi__satuan_p')
alter table pdrd.prestasi
   drop constraint fk_prestasi_prestasi__satuan_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.prestasi') and o.name = 'fk_prestasi_prestasi__tingkat_')
alter table pdrd.prestasi
   drop constraint fk_prestasi_prestasi__tingkat_
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
   where r.fkeyid = object_id('pdrd.reg_ptk') and o.name = 'fk_reg_ptk_ptk_terda_sdm')
alter table pdrd.reg_ptk
   drop constraint fk_reg_ptk_ptk_terda_sdm
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
   where r.fkeyid = object_id('pdrd.rwy_fungsional') and o.name = 'fk_rwy_fung_jab_fung__sdm')
alter table pdrd.rwy_fungsional
   drop constraint fk_rwy_fung_jab_fung__sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('keuangan.rwy_gaji_berkala') and o.name = 'fk_rwy_gaji_rwy_gaji__sdm')
alter table keuangan.rwy_gaji_berkala
   drop constraint fk_rwy_gaji_rwy_gaji__sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_kepangkatan') and o.name = 'fk_rwy_kepa_rwy_pangk_sdm')
alter table pdrd.rwy_kepangkatan
   drop constraint fk_rwy_kepa_rwy_pangk_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_pekerjaan') and o.name = 'fk_rwy_peke_rwy_peker_sdm')
alter table pdrd.rwy_pekerjaan
   drop constraint fk_rwy_peke_rwy_peker_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_pend_formal') and o.name = 'fk_rwy_pend_ptk_rwyt__sms')
alter table pdrd.rwy_pend_formal
   drop constraint fk_rwy_pend_ptk_rwyt__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_pend_formal') and o.name = 'fk_rwy_pend_rwyt_pend_sdm')
alter table pdrd.rwy_pend_formal
   drop constraint fk_rwy_pend_rwyt_pend_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_sertifikasi') and o.name = 'fk_rwy_sert_riwayat_s_sdm')
alter table pdrd.rwy_sertifikasi
   drop constraint fk_rwy_sert_riwayat_s_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_struktural') and o.name = 'fk_rwy_stru_jab_stru__sdm')
alter table pdrd.rwy_struktural
   drop constraint fk_rwy_stru_jab_stru__sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sdm') and o.name = 'fk_sdm_agama_sdm_agama')
alter table pdrd.sdm
   drop constraint fk_sdm_agama_sdm_agama
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sdm') and o.name = 'fk_sdm_keahlian__keahlian')
alter table pdrd.sdm
   drop constraint fk_sdm_keahlian__keahlian
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sdm') and o.name = 'fk_sdm_kewargane_negara')
alter table pdrd.sdm
   drop constraint fk_sdm_kewargane_negara
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sdm') and o.name = 'fk_sdm_lemb_peng_lembaga_')
alter table pdrd.sdm
   drop constraint fk_sdm_lemb_peng_lembaga_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sdm') and o.name = 'fk_sdm_pekerjaan_pekerjaa')
alter table pdrd.sdm
   drop constraint fk_sdm_pekerjaan_pekerjaa
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sdm') and o.name = 'fk_sdm_ptk_jenis_jenis_sd')
alter table pdrd.sdm
   drop constraint fk_sdm_ptk_jenis_jenis_sd
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sdm') and o.name = 'fk_sdm_ptk_kecam_wilayah')
alter table pdrd.sdm
   drop constraint fk_sdm_ptk_kecam_wilayah
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sdm') and o.name = 'fk_sdm_stataktif_status_k')
alter table pdrd.sdm
   drop constraint fk_sdm_stataktif_status_k
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sdm') and o.name = 'fk_sdm_sumber_ga_sumber_g')
alter table pdrd.sdm
   drop constraint fk_sdm_sumber_ga_sumber_g
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.sdm_anggota_litabmas') and o.name = 'fk_sdm_angg_ang_litab_sdm')
alter table pdrd.sdm_anggota_litabmas
   drop constraint fk_sdm_angg_ang_litab_sdm
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
   where r.fkeyid = object_id('sarpras.tanah') and o.name = 'fk_tanah_sms_pemil_sms')
alter table sarpras.tanah
   drop constraint fk_tanah_sms_pemil_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tugas_belajar') and o.name = 'fk_tugas_be_tugas_bel_sdm')
alter table pdrd.tugas_belajar
   drop constraint fk_tugas_be_tugas_bel_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tugas_tambahan') and o.name = 'fk_tugas_ta_jabatan_p_sms')
alter table pdrd.tugas_tambahan
   drop constraint fk_tugas_ta_jabatan_p_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tugas_tambahan') and o.name = 'fk_tugas_ta_tugtam_pt_sdm')
alter table pdrd.tugas_tambahan
   drop constraint fk_tugas_ta_tugtam_pt_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tulis_buku_ajar') and o.name = 'fk_tulis_bu_buku_ajar_buku_aja')
alter table pdrd.tulis_buku_ajar
   drop constraint fk_tulis_bu_buku_ajar_buku_aja
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tulis_buku_ajar') and o.name = 'fk_tulis_bu_na_ang_tu_non_ca')
alter table pdrd.tulis_buku_ajar
   drop constraint fk_tulis_bu_na_ang_tu_non_ca
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tulis_buku_ajar') and o.name = 'fk_tulis_bu_pd_ang_tu_peserta_')
alter table pdrd.tulis_buku_ajar
   drop constraint fk_tulis_bu_pd_ang_tu_peserta_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tulis_buku_ajar') and o.name = 'fk_tulis_bu_sdm_ang_t_sdm')
alter table pdrd.tulis_buku_ajar
   drop constraint fk_tulis_bu_sdm_ang_t_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tulis_buku_ajar') and o.name = 'fk_tulis_bu_tulis_buk_kategori')
alter table pdrd.tulis_buku_ajar
   drop constraint fk_tulis_bu_tulis_buk_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tulis_pub') and o.name = 'fk_tulis_pu_na_ang_tu_non_ca')
alter table pdrd.tulis_pub
   drop constraint fk_tulis_pu_na_ang_tu_non_ca
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tulis_pub') and o.name = 'fk_tulis_pu_pd_ang_tu_peserta_')
alter table pdrd.tulis_pub
   drop constraint fk_tulis_pu_pd_ang_tu_peserta_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tulis_pub') and o.name = 'fk_tulis_pu_penulis_p_publikas')
alter table pdrd.tulis_pub
   drop constraint fk_tulis_pu_penulis_p_publikas
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tulis_pub') and o.name = 'fk_tulis_pu_sdm_ang_t_sdm')
alter table pdrd.tulis_pub
   drop constraint fk_tulis_pu_sdm_ang_t_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tulis_pub') and o.name = 'fk_tulis_pu_tulis_pub_kategori')
alter table pdrd.tulis_pub
   drop constraint fk_tulis_pu_tulis_pub_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tunjangan') and o.name = 'fk_tunjanga_tunjangan_sdm')
alter table pdrd.tunjangan
   drop constraint fk_tunjanga_tunjangan_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.uji_mhs') and o.name = 'fk_uji_mhs_dosen_pen_sdm')
alter table pdrd.uji_mhs
   drop constraint fk_uji_mhs_dosen_pen_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('tracer.umr_wilayah') and o.name = 'fk_umr_wila_thn_angga_tahun_an')
alter table tracer.umr_wilayah
   drop constraint fk_umr_wila_thn_angga_tahun_an
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('tracer.umr_wilayah') and o.name = 'fk_umr_wila_umr_kota_wilayah')
alter table tracer.umr_wilayah
   drop constraint fk_umr_wila_umr_kota_wilayah
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.visiting_scientist') and o.name = 'fk_visiting_ptk_visit_sdm')
alter table pdrd.visiting_scientist
   drop constraint fk_visiting_ptk_visit_sdm
go

alter table man_akses.aplikasi
   drop constraint pk_aplikasi
go

alter table man_akses.aplikasi
   drop constraint ckc_a_generate_menu_aplikasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('man_akses.tmp_aplikasi')
            and   type = 'U')
   drop table man_akses.tmp_aplikasi
go

execute sp_rename 'man_akses.aplikasi', tmp_aplikasi
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

alter table pdrd.map_abmas_tse
   drop constraint pk_map_abmas_tse
go

alter table pdrd.map_abmas_tse
   drop constraint ckc_soft_delete_map_abma
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_map_abmas_tse')
            and   type = 'U')
   drop table pdrd.tmp_map_abmas_tse
go

execute sp_rename 'pdrd.map_abmas_tse', tmp_map_abmas_tse
go

alter table pdrd.map_litabmas_bidang
   drop constraint pk_map_litabmas_bidang
go

alter table pdrd.map_litabmas_bidang
   drop constraint ckc_soft_delete_map_lita
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_map_litabmas_bidang')
            and   type = 'U')
   drop table pdrd.tmp_map_litabmas_bidang
go

execute sp_rename 'pdrd.map_litabmas_bidang', tmp_map_litabmas_bidang
go

alter table pdrd.map_publikasi_bidang
   drop constraint pk_map_publikasi_bidang
go

alter table pdrd.map_publikasi_bidang
   drop constraint ckc_soft_delete_map_publ
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_map_publikasi_bidang')
            and   type = 'U')
   drop table pdrd.tmp_map_publikasi_bidang
go

execute sp_rename 'pdrd.map_publikasi_bidang', tmp_map_publikasi_bidang
go

if exists (select 1
            from  sysobjects
           where  id = object_id('man_akses.pengaturan_table_aplikasi')
            and   type = 'U')
   drop table man_akses.pengaturan_table_aplikasi
go

alter table pdrd.prestasi
   drop constraint pk_prestasi
go

alter table pdrd.prestasi
   drop constraint ckc_soft_delete_prestasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_prestasi')
            and   type = 'U')
   drop table pdrd.tmp_prestasi
go

execute sp_rename 'pdrd.prestasi', tmp_prestasi
go

alter table pdrd.sdm
   drop constraint pk_sdm
go

alter table pdrd.sdm 
   drop constraint ckc_jk_sdm
go

alter table pdrd.sdm
   drop constraint ckc_soft_delete_sdm
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_sdm')
            and   type = 'U')
   drop table pdrd.tmp_sdm
go

execute sp_rename 'pdrd.sdm', tmp_sdm
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

alter table ref.tahun_anggaran
   drop constraint pk_tahun_anggaran
go

alter table ref.tahun_anggaran
   drop constraint ckc_a_periode_aktif_tahun_an
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_tahun_anggaran')
            and   type = 'U')
   drop table ref.tmp_tahun_anggaran
go

execute sp_rename 'ref.tahun_anggaran', tmp_tahun_anggaran
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
   drop constraint ckc_peran_tulis_tulis_pu
go

alter table pdrd.tulis_pub
   drop constraint ckc_jns_penulis_tulis_pu
go

alter table pdrd.tulis_pub
   drop constraint ckc_a_corr_author_tulis_pu
go

alter table pdrd.tulis_pub
   drop constraint ckc_jns_afiliasi_tulis_pu
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

alter table tracer.umr_wilayah
   drop constraint pk_umr_wilayah
go

alter table tracer.umr_wilayah
   drop constraint ckc_soft_delete_umr_wila
go

if exists (select 1
            from  sysobjects
           where  id = object_id('tracer.tmp_umr_wilayah')
            and   type = 'U')
   drop table tracer.tmp_umr_wilayah
go

execute sp_rename 'tracer.umr_wilayah', tmp_umr_wilayah
go

/*==============================================================*/
/* User: dashboard                                              */
/*==============================================================*/
create schema dashboard
go

/*==============================================================*/
/* Table: aplikasi                                              */
/*==============================================================*/
create table man_akses.aplikasi (
   id_aplikasi          uniqueidentifier     not null,
   id_blob              uniqueidentifier     null,
   id_organisasi        uniqueidentifier     null,
   nm_aplikasi          varchar(100)         not null,
   ket_aplikasi         varchar(500)         null,
   token_aplikasi       varchar(1000)        null,
   app_key              varchar(500)         null,
   url                  varchar(256)         null,
   endpoint_ws          varchar(256)         null,
   a_generate_menu      numeric(1)           not null default 0
      constraint ckc_a_generate_menu_aplikasi check (a_generate_menu between 0 and 1 and a_generate_menu in (0,1)),
   a_integrasi_cas      numeric(1)           not null default 0
      constraint ckc_a_integrasi_cas_aplikasi check (a_integrasi_cas between 0 and 1 and a_integrasi_cas in (0,1)),
   a_sistem_internal_pt numeric(1)           not null default 0
      constraint ckc_a_sistem_internal_aplikasi check (a_sistem_internal_pt between 0 and 1 and a_sistem_internal_pt in (0,1)),
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_aplikasi primary key (id_aplikasi)
)
go

insert into man_akses.aplikasi (id_aplikasi, id_organisasi, nm_aplikasi, ket_aplikasi, token_aplikasi, app_key, url, a_generate_menu, tgl_create, last_update, expired_date, last_sync)
select id_aplikasi, id_organisasi, nm_aplikasi, ket_aplikasi, token_aplikasi, app_key, url, a_generate_menu, tgl_create, last_update, expired_date, last_sync
from man_akses.tmp_aplikasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('man_akses.tmp_aplikasi')
            and   type = 'U')
   drop table man_akses.tmp_aplikasi
go

/*==============================================================*/
/* Table: bidang_kerjasama                                      */
/*==============================================================*/
create table ref.bidang_kerjasama (
   id_bid_kerjasama     numeric(2)           identity,
   nm_bid_kerjasama     varchar(60)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_bidang_kerjasama primary key (id_bid_kerjasama)
)
go

/*==============================================================*/
/* Table: detail_iku_1                                          */
/*==============================================================*/
create table dashboard.detail_iku_1 (
   id_detail_iku_1      uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_tahun_anggaran    numeric(4)           not null,
   total_bekerja        numeric(8)           null,
   total_tidak_bekerja  numeric(8)           null,
   total_wirausaha      numeric(8)           null,
   total_studi          numeric(8)           null,
   total_lulusan        numeric(8)           null,
   total_per_kategori   numeric(8)           null,
   persentase_iku       numeric(7,4)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_detail_iku_1 primary key (id_detail_iku_1)
)
go

/*==============================================================*/
/* Table: detail_iku_2                                          */
/*==============================================================*/
create table dashboard.detail_iku_2 (
   id_detail_iku_2      uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_tahun_anggaran    numeric(4)           not null,
   total_mahasiswa      numeric(8)           null,
   total_tidak_masuk_kategori numeric(8)           null,
   total_mbkm           numeric(8)           null,
   total_prestasi       numeric(8)           null,
   total_lebih_20sks    numeric(8)           null,
   total_luar_pt        numeric(8)           null,
   total_dalam_pt       numeric(8)           null,
   total_nasional_1     numeric(8)           null,
   total_nasional_2     numeric(8)           null,
   total_nasional_3     numeric(8)           null,
   total_internasional_1 numeric(8)           null,
   total_internasional_2 numeric(8)           null,
   total_internasional_3 numeric(8)           null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_detail_iku_2 primary key (id_detail_iku_2)
)
go

/*==============================================================*/
/* Table: detail_iku_3                                          */
/*==============================================================*/
create table dashboard.detail_iku_3 (
   id_detail_iku_3      uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_tahun_anggaran    numeric(4)           not null,
   total_dosen_nidk     numeric(8)           null,
   total_dosen_nidn     numeric(8)           null,
   total_diklat_qs100   numeric(8)           null,
   total_dosen_praktisi numeric(8)           null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_detail_iku_3 primary key (id_detail_iku_3)
)
go

/*==============================================================*/
/* Table: detail_iku_4                                          */
/*==============================================================*/
create table dashboard.detail_iku_4 (
   id_detail_iku_4      uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_tahun_anggaran    numeric(4)           not null,
   total_dosen_nidn     numeric(8)           null,
   total_dosen_nidk     numeric(8)           null,
   total_dosen_s3       numeric(8)           null,
   total_dosen_praktisi numeric(8)           null,
   total_dosen_tersertifikasi numeric(8)           null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_detail_iku_4 primary key (id_detail_iku_4)
)
go

/*==============================================================*/
/* Table: detail_iku_5                                          */
/*==============================================================*/
create table dashboard.detail_iku_5 (
   id_detail_iku_5      uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_tahun_anggaran    numeric(4)           not null,
   total_dosen_tetap    numeric(8)           null,
   total_luaran_kti     numeric(8)           null,
   total_luaran_karya_terapan numeric(8)           null,
   total_luaran_karya_seni numeric(8)           null,
   total_luaran_paten   numeric(8)           null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_detail_iku_5 primary key (id_detail_iku_5)
)
go

/*==============================================================*/
/* Table: detail_iku_7                                          */
/*==============================================================*/
create table dashboard.detail_iku_7 (
   id_detail_iku_7      uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_tahun_anggaran    numeric(4)           not null,
   total_mk_case_method numeric(8)           null,
   total_mk_team_base_project numeric(8)           null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_detail_iku_7 primary key (id_detail_iku_7)
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
   jns_tmpt_bekerja     varchar(40)          null,
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

insert into tracer.hasil_tracer_study (id_hasil_tracer_study, id_thn_ajaran, id_bid_kerja, id_wil, id_reg_pd, id_smt, id_jns_jalur_kerja, wkt_pengisian, wkt_tunggu, status_lulusan, jns_tmpt_bekerja, nm_tmpt_bekerja, income_per_bln, total_instansi_dilamar, hub_bidang_kerja, tkt_kesesuaian, alasan_tidak_sesuai, ket, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_hasil_tracer_study, id_thn_ajaran, id_bid_kerja, id_wil, id_reg_pd, id_smt, id_jns_jalur_kerja, wkt_pengisian, wkt_tunggu, status_lulusan, jns_tmpt_bekerja, nm_tmpt_bekerja, income_per_bln, total_instansi_dilamar, hub_bidang_kerja, tkt_kesesuaian, alasan_tidak_sesuai, ket, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from tracer.tmp_hasil_tracer_study
go

if exists (select 1
            from  sysobjects
           where  id = object_id('tracer.tmp_hasil_tracer_study')
            and   type = 'U')
   drop table tracer.tmp_hasil_tracer_study
go

/*==============================================================*/
/* Table: kelas_ukt                                             */
/*==============================================================*/
create table keuangan.kelas_ukt (
   id_kelas_ukt         uniqueidentifier     not null,
   nm_kelas_ukt         varchar(100)         not null,
   nominal_ukt          numeric(16,2)        not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_kelas_uk check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_kelas_ukt primary key (id_kelas_ukt)
)
go

/*==============================================================*/
/* Table: kinerja_dosen                                         */
/*==============================================================*/
create table pdrd.kinerja_dosen (
   id_reg_ptk           uniqueidentifier     not null,
   id_smt               char(5)              not null,
   id_jabfung           numeric(5)           null,
   stat_tugas           char(1)              null,
   stat_belajar         char(1)              null,
   masa_laks_tgs_awal   datetime             null,
   masa_laks_tgs_akhir  datetime             null,
   sks_total            numeric(7,4)         not null default 0,
   sks_kinerja          numeric(7,4)         not null default 0,
   sks_lebih            numeric(7,4)         not null default 0,
   sks_kinerja_didik    numeric(7,4)         not null default 0,
   sks_kinerja_ajar     numeric(7,4)         null,
   sks_kinerja_lit      numeric(7,4)         not null default 0,
   sks_kinerja_pengmas  numeric(7,4)         not null default 0,
   sks_kinerja_penunjang numeric(7,4)         not null,
   sks_kinerja_tambahan numeric(7,4)         not null default 0,
   sks_lebih_didik      numeric(7,4)         not null default 0,
   sks_lebih_ajar       numeric(7,4)         null,
   sks_lebih_lit        numeric(7,4)         not null default 0,
   sks_lebih_pengmas    numeric(7,4)         not null default 0,
   sks_lebih_tunjang    numeric(7,4)         not null,
   sks_lebih_tambahan   numeric(7,4)         not null,
   ewmp                 numeric(7,4)         null,
   simpulan_asesor      char(1)              not null 
      constraint ckc_simpulan_asesor_kinerja_ check (simpulan_asesor in ('M','T')),
   stat_kewajiban       numeric(1)           null,
   penilai_1            varchar(200)         null,
   penilai_2            varchar(200)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_kinerja_ check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_kinerja_dosen primary key (id_reg_ptk, id_smt)
)
go

/*==============================================================*/
/* Table: kontrak_iku_pt                                        */
/*==============================================================*/
create table dashboard.kontrak_iku_pt (
   id_kontak_iku_pt     uniqueidentifier     not null,
   id_tahun_anggaran    numeric(4)           not null,
   iku1                 numeric(5,2)         null,
   iku2                 numeric(5,2)         null,
   iku3                 numeric(5,2)         null,
   iku4                 numeric(5,2)         null,
   iku5                 numeric(5,2)         null,
   iku6                 numeric(5,2)         null,
   iku7                 numeric(5,2)         null,
   iku8                 numeric(5,2)         null,
   iku9                 numeric(5,2)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kontrak_iku_pt primary key (id_kontak_iku_pt)
)
go

/*==============================================================*/
/* Table: map_abmas_tse                                         */
/*==============================================================*/
create table pdrd.map_abmas_tse (
   id_tse               numeric(5)           not null,
   id_litabmas          uniqueidentifier     not null,
   urutan               numeric(2)           not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_map_abma check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_map_abmas_tse primary key (id_tse, id_litabmas)
)
go

insert into pdrd.map_abmas_tse (id_tse, id_litabmas, urutan, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_tse, id_litabmas, urutan3, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_map_abmas_tse
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_map_abmas_tse')
            and   type = 'U')
   drop table pdrd.tmp_map_abmas_tse
go

/*==============================================================*/
/* Table: map_litabmas_bidang                                   */
/*==============================================================*/
create table pdrd.map_litabmas_bidang (
   id_kel_bidang        uniqueidentifier     not null,
   id_litabmas          uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_map_lita check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_map_litabmas_bidang primary key (id_kel_bidang, id_litabmas)
)
go

insert into pdrd.map_litabmas_bidang (id_kel_bidang, id_litabmas, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_kel_bidang, id_litabmas, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_map_litabmas_bidang
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_map_litabmas_bidang')
            and   type = 'U')
   drop table pdrd.tmp_map_litabmas_bidang
go

/*==============================================================*/
/* Table: map_publikasi_bidang                                  */
/*==============================================================*/
create table pdrd.map_publikasi_bidang (
   id_kel_bidang        uniqueidentifier     not null,
   id_publikasi         uniqueidentifier     not null,
   urutan               numeric(2)           not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_map_publ check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_map_publikasi_bidang primary key (id_kel_bidang, id_publikasi)
)
go

insert into pdrd.map_publikasi_bidang (id_kel_bidang, id_publikasi, urutan, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_kel_bidang, id_publikasi, urutan, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_map_publikasi_bidang
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_map_publikasi_bidang')
            and   type = 'U')
   drop table pdrd.tmp_map_publikasi_bidang
go

/*==============================================================*/
/* Table: prestasi                                              */
/*==============================================================*/
create table pdrd.prestasi (
   id_prestasi          uniqueidentifier     not null,
   id_jenis_prestasi    int                  not null,
   id_akt_mhs           uniqueidentifier     null,
   nm_prestasi          varchar(160)         not null,
   thn_prestasi         numeric(4)           not null,
   penyelenggara        varchar(100)         null,
   peringkat            numeric(1)           null,
   id_sp                uniqueidentifier     not null,
   id_pd                uniqueidentifier     not null,
   id_tkt_prestasi      int                  not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_prestasi check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_prestasi primary key (id_prestasi)
)
go

insert into pdrd.prestasi (id_prestasi, id_jenis_prestasi, nm_prestasi, thn_prestasi, penyelenggara, peringkat, id_sp, id_pd, id_tkt_prestasi, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_prestasi, id_jenis_prestasi, nm_prestasi, thn_prestasi, penyelenggara, peringkat, id_sp, id_pd, id_tkt_prestasi, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_prestasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_prestasi')
            and   type = 'U')
   drop table pdrd.tmp_prestasi
go

/*==============================================================*/
/* Table: sdm                                                   */
/*==============================================================*/
create table pdrd.sdm (
   id_sdm               uniqueidentifier     not null,
   nm_sdm               varchar(100)         not null,
   jk                   char(1)              not null 
      constraint ckc_jk_sdm check (jk in ('L','P','*')),
   tmpt_lahir           varchar(32)          not null,
   tgl_lahir            date                 not null,
   nik                  char(20)             not null,
   niy_nigk             varchar(30)          null,
   nuptk                char(16)             null,
   nidn                 char(10)             null,
   nsdmi                char(12)             null,
   stat_kawin           numeric(1)           not null,
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          null,
   kode_pos             char(5)              null,
   no_tel_rmh           varchar(20)          null,
   no_hp                varchar(20)          null,
   email                varchar(60)          null,
   nip                  varchar(18)          null,
   tmt_pns              date                 null,
   nm_suami_istri       varchar(100)         null,
   nip_suami_istri      char(18)             null,
   sk_cpns              varchar(80)          null,
   tgl_sk_cpns          date                 null,
   sk_angkat            varchar(80)          null,
   tmt_sk_angkat        date                 null,
   npwp                 char(15)             null,
   nm_wp                varchar(100)         null,
   stat_data            int                  null,
   akta_ijin_ajar       char(1)              null,
   nira                 char(30)             null,
   kewarganegaraan      char(2)              not null,
   id_jns_sdm           numeric(2)           not null,
   id_wil               char(8)              not null,
   id_stat_aktif        numeric(2)           not null,
   id_agama             smallint             not null,
   id_keahlian_lab      smallint             null,
   id_pekerjaan_suami_istri int                  not null,
   id_lemb_angkat       numeric(2)           not null,
   id_sumber_gaji       numeric(2)           null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_sdm check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_sdm primary key (id_sdm)
)
go

insert into pdrd.sdm (id_sdm, nm_sdm, jk, tmpt_lahir, tgl_lahir, nik, niy_nigk, nuptk, nidn, nsdmi, stat_kawin, no_tel_rmh, no_hp, email, nip, tmt_pns, nm_suami_istri, nip_suami_istri, sk_cpns, tgl_sk_cpns, sk_angkat, tmt_sk_angkat, npwp, nm_wp, stat_data, akta_ijin_ajar, nira, kewarganegaraan, id_jns_sdm, id_wil, id_stat_aktif, id_agama, id_keahlian_lab, id_pekerjaan_suami_istri, id_lemb_angkat, id_sumber_gaji, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_sdm, nm_sdm, jk, tmpt_lahir, tgl_lahir, nik, niy_nigk, nuptk, nidn, nsdmi, stat_kawin, no_tel_rmh, no_hp, email, nip, tmt_pns, nm_suami_istri, nip_suami_istri, sk_cpns, tgl_sk_cpns, sk_angkat, tmt_sk_angkat, npwp, nm_wp, stat_data, akta_ijin_ajar, nira, kewarganegaraan, id_jns_sdm, id_wil, id_stat_aktif, id_agama, id_keahlian_lab, id_pekerjaan_suami_istri, id_lemb_angkat, id_sumber_gaji, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_sdm
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_sdm')
            and   type = 'U')
   drop table pdrd.tmp_sdm
go

/*==============================================================*/
/* Table: sms                                                   */
/*==============================================================*/
create table pdrd.sms (
   id_sms               uniqueidentifier     not null,
   nm_lemb              varchar(100)         not null,
   kd_kl                char(3)              null,
   kd_satker            varchar(20)          null,
   smt_mulai            char(5)              null,
   a_selenggara_subst   numeric(1)           not null default 0
      constraint ckc_a_selenggara_subs_sms check (a_selenggara_subst between 0 and 1 and a_selenggara_subst in (0,1)),
   stat_prodi_unila     char(1)              null,
   kode_prodi           varchar(10)          null,
   nm_prodi_english     varchar(100)         null,
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
   kpst_pd              numeric(5)           null,
   sks_lulus            numeric(3)           null,
   gelar_lulusan        varchar(10)          null,
   stat_prodi           char(1)              null default 'A'
      constraint ckc_stat_prodi_sms check (stat_prodi is null or (stat_prodi in ('A','B','K','N','H'))),
   polesei_nilai        char(1)              null default 'B'
      constraint ckc_polesei_nilai_sms check (polesei_nilai is null or (polesei_nilai in ('B','T'))),
   a_kependidikan       numeric(1)           null default 0
      constraint ckc_a_kependidikan_sms check (a_kependidikan is null or (a_kependidikan between 0 and 1 and a_kependidikan in (0,1))),
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
   id_jenj_didik        numeric(2)           not null,
   id_jns_sms           numeric(2)           not null,
   id_fungsi_lab        char(1)              not null,
   id_kel_usaha         char(8)              not null,
   id_blob              uniqueidentifier     null,
   id_wil               char(8)              not null,
   id_jur               varchar(25)          null,
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

insert into pdrd.sms (id_sms, nm_lemb, kd_kl, kd_satker, smt_mulai, a_selenggara_subst, kode_prodi, nm_prodi_english, jln, rt, rw, nm_dsn, ds_kel, kode_pos, lintang, bujur, no_tel, no_fax, email, website, singkatan, tgl_berdiri, sk_selenggara, tgl_sk_selenggara, tmt_sk_selenggara, tst_sk_selenggara, kpst_pd, sks_lulus, gelar_lulusan, stat_prodi, polesei_nilai, a_kependidikan, sistem_ajar, a_pjj, a_psdku, luas_lab, kapasitas_prak_satu_shift, jml_mhs_pengguna, jml_jam_penggunaan, jml_prodi_pengguna, jml_modul_prak_sendiri, jml_modul_prak_lain, fungsi_selain_prak, penggunaan_lab, a_pkl, id_sp, id_jenj_didik, id_jns_sms, id_fungsi_lab, id_kel_usaha, id_blob, id_wil, id_jur, id_induk_sms, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_sms, nm_lemb, kd_kl, kd_satker, smt_mulai, a_selenggara_subst, kode_prodi, nm_prodi_english, jln, rt, rw, nm_dsn, ds_kel, kode_pos, lintang, bujur, no_tel, no_fax, email, website, singkatan, tgl_berdiri, sk_selenggara, tgl_sk_selenggara, tmt_sk_selenggara, tst_sk_selenggara, kpst_pd, sks_lulus, gelar_lulusan, stat_prodi, polesei_nilai, a_kependidikan, sistem_ajar, a_pjj, a_psdku, luas_lab, kapasitas_prak_satu_shift, jml_mhs_pengguna, jml_jam_penggunaan, jml_prodi_pengguna, jml_modul_prak_sendiri, jml_modul_prak_lain, fungsi_selain_prak, penggunaan_lab, a_pkl, id_sp, id_jenj_didik, id_jns_sms, id_fungsi_lab, id_kel_usaha, id_blob, id_wil, id_jur, id_induk_sms, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
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
   id_sms               uniqueidentifier     not null,
   id_mou               uniqueidentifier     not null,
   id_bid_kerjasama     numeric(2)           null,
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

if exists (select 1
            from  sysobjects
           where  id = object_id('kerjasama.tmp_sms_kerjasama')
            and   type = 'U')
   drop table kerjasama.tmp_sms_kerjasama
go

/*==============================================================*/
/* Table: spp_mhs                                               */
/*==============================================================*/
create table keuangan.spp_mhs (
   id_spp_mhs           uniqueidentifier     not null,
   id_kelas_ukt         uniqueidentifier     null,
   id_smt               char(5)              not null,
   id_reg_pd            uniqueidentifier     not null,
   tgl_bayar            datetime             not null,
   nominal              numeric(16,2)        not null,
   kode_pembayaran      varchar(15)          not null,
   nomor_pin            varchar(12)          null,
   kode_akses           varchar(8)           null,
   bill_ref             varchar(40)          null,
   flag_by              varchar(10)          not null,
   ket                  varchar(250)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_spp_mhs check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_spp_mhs primary key (id_spp_mhs)
)
go

/*==============================================================*/
/* Table: tahun_anggaran                                        */
/*==============================================================*/
create table ref.tahun_anggaran (
   id_tahun_anggaran    numeric(4)           not null,
   nm_tahun_anggaran    varchar(50)          not null,
   a_periode_aktif      numeric(1)           not null default 0
      constraint ckc_a_periode_aktif_tahun_an check (a_periode_aktif between 0 and 1 and a_periode_aktif in (0,1)),
   tgl_mulai            date                 not null,
   tgl_selesai          date                 not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_tahun_anggaran primary key (id_tahun_anggaran)
)
go

insert into ref.tahun_anggaran (id_tahun_anggaran, nm_tahun_anggaran, a_periode_aktif, tgl_mulai, tgl_selesai, create_date, last_update, expired_date, last_sync)
select id_tahun_anggaran, nm_tahun_anggaran, a_periode_aktif, tgl_mulai, tgl_selesai, create_date, last_update, expired_date, last_sync
from ref.tmp_tahun_anggaran
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_tahun_anggaran')
            and   type = 'U')
   drop table ref.tmp_tahun_anggaran
go

/*==============================================================*/
/* Table: tingkat_kerjasama                                     */
/*==============================================================*/
create table ref.tingkat_kerjasama (
   id_tingkat_kerjasama numeric(2)           identity,
   nm_tingkat_kerjasama varchar(60)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_tingkat_kerjasama primary key (id_tingkat_kerjasama)
)
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
   urutan               numeric(2)           null,
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

insert into pdrd.tulis_buku_ajar (id_tulis_buku_ajar, id_katgiat, id_buku_ajar, id_sdm, id_pd, id_orang, afiliasi, peran_tulis, jns_penulis, nm_pd, nipd, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_tulis_buku_ajar, id_katgiat, id_buku_ajar, id_sdm, id_pd, id_orang, afiliasi, peran_tulis, jns_penulis, nm_pd, nipd, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_tulis_buku_ajar
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
   urutan               numeric(2)           not null,
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

insert into pdrd.tulis_pub (id_tulis_pub, id_publikasi, id_sdm, id_katgiat, id_pd, id_orang, urutan, afiliasi, peran_tulis, jns_penulis, a_corr_author, nm_pd, nipd, id_afiliasi, jns_afiliasi, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_tulis_pub, id_publikasi, id_sdm, id_katgiat, id_pd, id_orang, urutan2, afiliasi, peran_tulis, jns_penulis, a_corr_author, nm_pd, nipd, id_afiliasi, jns_afiliasi, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_tulis_pub
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_tulis_pub')
            and   type = 'U')
   drop table pdrd.tmp_tulis_pub
go

/*==============================================================*/
/* Table: umr_wilayah                                           */
/*==============================================================*/
create table tracer.umr_wilayah (
   id_umr_wil           uniqueidentifier     not null,
   id_wil               char(8)              not null,
   id_tahun_anggaran    numeric(4)           not null,
   besaran_umr          numeric(16,2)        not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_umr_wila check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_umr_wilayah primary key (id_umr_wil)
)
go

insert into tracer.umr_wilayah (id_umr_wil, id_wil, id_tahun_anggaran, besaran_umr, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_umr_wil, id_wil, id_tahun_anggaran, besaran_umr, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from tracer.tmp_umr_wilayah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('tracer.tmp_umr_wilayah')
            and   type = 'U')
   drop table tracer.tmp_umr_wilayah
go

alter table pdrd.akreditasi_prodi
   add constraint fk_akredita_akreditas_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table man_akses.akses_table_aplikasi
   add constraint fk_akses_ta_dtl_akses_aplikasi foreign key (id_aplikasi)
      references man_akses.aplikasi (id_aplikasi)
go

alter table pdrd.akt_mhs
   add constraint fk_akt_mhs_prodi_akt_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table sarpras.alat
   add constraint fk_alat_alat_mili_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table sarpras.alat
   add constraint fk_alat_alat_ptk2_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.anak
   add constraint fk_anak_anak_sdm_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.anggota_orgprof
   add constraint fk_anggota__orgprof_p_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.anggota_panitia
   add constraint fk_anggota__panitia_p_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table sarpras.angkutan
   add constraint fk_angkutan_alat_mili_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table sarpras.angkutan
   add constraint fk_angkutan_alat_ptk_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table man_akses.aplikasi
   add constraint fk_aplikasi_logo_apli_large_ob foreign key (id_blob)
      references dok.large_object (id_blob)
go

alter table man_akses.aplikasi
   add constraint fk_aplikasi_unit_pemi_unit_org foreign key (id_organisasi)
      references man_akses.unit_organisasi (id_organisasi)
go

alter table sarpras.bangunan
   add constraint fk_bangunan_sms_pemil_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table beasiswa.beasiswa_sdm
   add constraint fk_beasiswa_beasiswa__sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table beasiswa.beasiswa_sdm
   add constraint fk_beasiswa_studi_sms_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table keuangan.biaya_operasional
   add constraint fk_biaya_op_sms_opera_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table keuangan.biaya_operasional
   add constraint fk_biaya_op_thn_angga_tahun_an foreign key (id_tahun_anggaran)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table pdrd.bimbing_mhs
   add constraint fk_bimbing__dosen_pem_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table dashboard.detail_iku_1
   add constraint fk_detail_i_iku1_per__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table dashboard.detail_iku_1
   add constraint fk_detail_i_iku1_per__tahun_an foreign key (id_tahun_anggaran)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table dashboard.detail_iku_2
   add constraint fk_detail_i_iku2_per__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table dashboard.detail_iku_2
   add constraint fk_detail_i_iku2_per__tahun_an foreign key (id_tahun_anggaran)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table dashboard.detail_iku_3
   add constraint fk_detail_i_iku3_per__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table dashboard.detail_iku_3
   add constraint fk_detail_i_iku3_per__tahun_an foreign key (id_tahun_anggaran)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table dashboard.detail_iku_4
   add constraint fk_detail_i_iku4_per__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table dashboard.detail_iku_4
   add constraint fk_detail_i_iku4_per__tahun_an foreign key (id_tahun_anggaran)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table dashboard.detail_iku_5
   add constraint fk_detail_i_iku5_per__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table dashboard.detail_iku_5
   add constraint fk_detail_i_iku5_per__tahun_an foreign key (id_tahun_anggaran)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table dashboard.detail_iku_7
   add constraint fk_detail_i_iku7_per__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table dashboard.detail_iku_7
   add constraint fk_detail_i_iku7_per__tahun_an foreign key (id_tahun_anggaran)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table pdrd.detasering
   add constraint fk_detaseri_ptk_detas_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.diklat
   add constraint fk_diklat_diklat_pt_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
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

alter table pdrd.inpassing
   add constraint fk_inpassin_inpassing_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table presensi.kehadiran_sdm
   add constraint fk_kehadira_hadir_sdm_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.kelas_kuliah
   add constraint fk_kelas_ku_prodi_kel_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.kesejahteraan
   add constraint fk_kesejaht_kesejahte_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.kinerja_dosen
   add constraint fk_kinerja__jabfung_k_jabfung foreign key (id_jabfung)
      references ref.jabfung (id_jabfung)
go

alter table pdrd.kinerja_dosen
   add constraint fk_kinerja__kinerja_d_reg_ptk foreign key (id_reg_ptk)
      references pdrd.reg_ptk (id_reg_ptk)
go

alter table pdrd.kinerja_dosen
   add constraint fk_kinerja__kinerja_s_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table dashboard.kontrak_iku_pt
   add constraint fk_kontrak__kontrak_i_tahun_an foreign key (id_tahun_anggaran)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_tahun_keg_tahun_an foreign key (id_thn_kegiatan)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_tahun_pel_tahun_an foreign key (id_thn_laks)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_tahun_usu_tahun_an foreign key (id_thn_usulan)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table logger.log_jwt
   add constraint fk_log_jwt_app_pemin_aplikasi foreign key (id_aplikasi)
      references man_akses.aplikasi (id_aplikasi)
go

alter table logger.log_login
   add constraint fk_log_logi_log_login_aplikasi foreign key (id_aplikasi)
      references man_akses.aplikasi (id_aplikasi)
go

alter table logger.log_pengguna
   add constraint fk_log_peng_log_app_l_aplikasi foreign key (id_aplikasi)
      references man_akses.aplikasi (id_aplikasi)
go

alter table logger.log_table_app
   add constraint fk_log_tabl_log_table_aplikasi foreign key (id_aplikasi)
      references man_akses.aplikasi (id_aplikasi)
go

alter table pdrd.map_abmas_tse
   add constraint fk_map_abma_abmas_tse_tse foreign key (id_tse)
      references ref.tse (id_tse)
go

alter table pdrd.map_abmas_tse
   add constraint fk_map_abma_tse_abmas_litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table pdrd.map_litabmas_bidang
   add constraint fk_map_lita_bidang_li_litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table pdrd.map_litabmas_bidang
   add constraint fk_map_lita_litabmas__kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.map_publikasi_bidang
   add constraint fk_map_publ_pub_bidan_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.map_publikasi_bidang
   add constraint fk_map_publ_pub_bidan_publikas foreign key (id_publikasi)
      references pdrd.publikasi (id_publikasi)
go

alter table pdrd.matkul
   add constraint fk_matkul_prodi_mat_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table man_akses.menu
   add constraint fk_menu_menu_apli_aplikasi foreign key (id_aplikasi)
      references man_akses.aplikasi (id_aplikasi)
go

alter table pdrd.nilai_tes
   add constraint fk_nilai_te_nilai_tes_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.pembicara
   add constraint fk_pembicar_pembicata_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.pengelola_jurnal
   add constraint fk_pengelol_kelola_ju_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.penghargaan
   add constraint fk_pengharg_pengharga_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table man_akses.pj_aplikasi
   add constraint fk_pj_aplik_list_pj_a_aplikasi foreign key (id_aplikasi)
      references man_akses.aplikasi (id_aplikasi)
go

alter table pdrd.prestasi
   add constraint fk_prestasi_akt_mhs_p_akt_mhs foreign key (id_akt_mhs)
      references pdrd.akt_mhs (id_akt_mhs)
go

alter table pdrd.prestasi
   add constraint fk_prestasi_prestasi__jenis_pr foreign key (id_jenis_prestasi)
      references ref.jenis_prestasi (id_jenis_prestasi)
go

alter table pdrd.prestasi
   add constraint fk_prestasi_prestasi__satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.prestasi
   add constraint fk_prestasi_prestasi__peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
go

alter table pdrd.prestasi
   add constraint fk_prestasi_prestasi__tingkat_ foreign key (id_tkt_prestasi)
      references ref.tingkat_prestasi (id_tkt_prestasi)
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
   add constraint fk_reg_ptk_ptk_terda_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
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
   add constraint fk_rwy_didi_prodi_pen_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.rwy_fungsional
   add constraint fk_rwy_fung_jab_fung__sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table keuangan.rwy_gaji_berkala
   add constraint fk_rwy_gaji_rwy_gaji__sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_kepangkatan
   add constraint fk_rwy_kepa_rwy_pangk_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_pekerjaan
   add constraint fk_rwy_peke_rwy_peker_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_pend_formal
   add constraint fk_rwy_pend_ptk_rwyt__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.rwy_pend_formal
   add constraint fk_rwy_pend_rwyt_pend_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_sertifikasi
   add constraint fk_rwy_sert_riwayat_s_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_struktural
   add constraint fk_rwy_stru_jab_stru__sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.sdm
   add constraint fk_sdm_agama_sdm_agama foreign key (id_agama)
      references ref.agama (id_agama)
go

alter table pdrd.sdm
   add constraint fk_sdm_keahlian__keahlian foreign key (id_keahlian_lab)
      references ref.keahlian_lab (id_keahlian_lab)
go

alter table pdrd.sdm
   add constraint fk_sdm_kewargane_negara foreign key (kewarganegaraan)
      references ref.negara (id_negara)
go

alter table pdrd.sdm
   add constraint fk_sdm_lemb_peng_lembaga_ foreign key (id_lemb_angkat)
      references ref.lembaga_pengangkat (id_lemb_angkat)
go

alter table pdrd.sdm
   add constraint fk_sdm_pekerjaan_pekerjaa foreign key (id_pekerjaan_suami_istri)
      references ref.pekerjaan (id_pekerjaan)
go

alter table pdrd.sdm
   add constraint fk_sdm_ptk_jenis_jenis_sd foreign key (id_jns_sdm)
      references ref.jenis_sdm (id_jns_sdm)
go

alter table pdrd.sdm
   add constraint fk_sdm_ptk_kecam_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table pdrd.sdm
   add constraint fk_sdm_stataktif_status_k foreign key (id_stat_aktif)
      references ref.status_keaktifan_pegawai (id_stat_aktif)
go

alter table pdrd.sdm
   add constraint fk_sdm_sumber_ga_sumber_g foreign key (id_sumber_gaji)
      references ref.sumber_gaji (id_sumber_gaji)
go

alter table pdrd.sdm_anggota_litabmas
   add constraint fk_sdm_angg_ang_litab_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
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
   add constraint fk_sms_jursp_jur_jurusan foreign key (id_jur)
      references ref.jurusan (id_jur)
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
   add constraint fk_sms_progstudi_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
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
   add constraint fk_sms_kerj_mou_kerja_mou foreign key (id_mou)
      references kerjasama.mou (id_mou)
go

alter table kerjasama.sms_kerjasama
   add constraint fk_sms_kerj_sms_yang__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table kerjasama.sms_kerjasama
   add constraint fk_sms_kerj_sumber_da_sumber_d foreign key (id_sumber_dana)
      references ref.sumber_dana (id_sumber_dana)
go

alter table kerjasama.sms_kerjasama
   add constraint fk_sms_kerj_tingkat_k_tingkat_ foreign key (id_tingkat_kerjasama)
      references ref.tingkat_kerjasama (id_tingkat_kerjasama)
go

alter table keuangan.spp_mhs
   add constraint fk_spp_mhs_bayar_spp_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table keuangan.spp_mhs
   add constraint fk_spp_mhs_kelas_ukt_kelas_uk foreign key (id_kelas_ukt)
      references keuangan.kelas_ukt (id_kelas_ukt)
go

alter table keuangan.spp_mhs
   add constraint fk_spp_mhs_reg_spp_m_reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
go

alter table sarpras.tanah
   add constraint fk_tanah_sms_pemil_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.tugas_belajar
   add constraint fk_tugas_be_tugas_bel_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.tugas_tambahan
   add constraint fk_tugas_ta_jabatan_p_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.tugas_tambahan
   add constraint fk_tugas_ta_tugtam_pt_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.tulis_buku_ajar
   add constraint fk_tulis_bu_buku_ajar_buku_aja foreign key (id_buku_ajar)
      references pdrd.buku_ajar (id_buku_ajar)
go

alter table pdrd.tulis_buku_ajar
   add constraint fk_tulis_bu_na_ang_tu_non_ca foreign key (id_orang)
      references pdrd.non_ca (id_orang)
go

alter table pdrd.tulis_buku_ajar
   add constraint fk_tulis_bu_pd_ang_tu_peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
go

alter table pdrd.tulis_buku_ajar
   add constraint fk_tulis_bu_sdm_ang_t_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.tulis_buku_ajar
   add constraint fk_tulis_bu_tulis_buk_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table pdrd.tulis_pub
   add constraint fk_tulis_pu_na_ang_tu_non_ca foreign key (id_orang)
      references pdrd.non_ca (id_orang)
go

alter table pdrd.tulis_pub
   add constraint fk_tulis_pu_pd_ang_tu_peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
go

alter table pdrd.tulis_pub
   add constraint fk_tulis_pu_penulis_p_publikas foreign key (id_publikasi)
      references pdrd.publikasi (id_publikasi)
go

alter table pdrd.tulis_pub
   add constraint fk_tulis_pu_sdm_ang_t_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.tulis_pub
   add constraint fk_tulis_pu_tulis_pub_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table pdrd.tunjangan
   add constraint fk_tunjanga_tunjangan_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.uji_mhs
   add constraint fk_uji_mhs_dosen_pen_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table tracer.umr_wilayah
   add constraint fk_umr_wila_thn_angga_tahun_an foreign key (id_tahun_anggaran)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table tracer.umr_wilayah
   add constraint fk_umr_wila_umr_kota_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table pdrd.visiting_scientist
   add constraint fk_visiting_ptk_visit_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

INSERT INTO man_akses.versi_db (versi,tgl_update) VALUES ('0.5.0',GETDATE());