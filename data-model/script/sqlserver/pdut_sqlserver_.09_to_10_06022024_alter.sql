/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     06/02/2024 13:59:24                          */
/*==============================================================*/


if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akreditasi_prodi') and o.name = 'fk_akredita_akreditas_sms')
alter table pdrd.akreditasi_prodi
   drop constraint fk_akredita_akreditas_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_ajar_dosen') and o.name = 'fk_akt_ajar_pengambil_kelas_ku')
alter table pdrd.akt_ajar_dosen
   drop constraint fk_akt_ajar_pengambil_kelas_ku
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
   where r.fkeyid = object_id('pmb.daya_tampung') and o.name = 'fk_daya_tam_daya_tamp_sms')
alter table pmb.daya_tampung
   drop constraint fk_daya_tam_daya_tamp_sms
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
   where r.fkeyid = object_id('pdrd.diklat') and o.name = 'fk_diklat_diklat_ke_kelompok')
alter table pdrd.diklat
   drop constraint fk_diklat_diklat_ke_kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dok_rwy_sertifikasi') and o.name = 'fk_dok_rwy__rwy_sert__rwy_sert')
alter table dok.dok_rwy_sertifikasi
   drop constraint fk_dok_rwy__rwy_sert__rwy_sert
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('mbkm.ekuiv_transfer') and o.name = 'fk_ekuiv_tr_mk_ekuiv__matkul')
alter table mbkm.ekuiv_transfer
   drop constraint fk_ekuiv_tr_mk_ekuiv__matkul
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.jadwal_kelas') and o.name = 'fk_jadwal_k_jdwl_kls_kelas_ku')
alter table pdrd.jadwal_kelas
   drop constraint fk_jadwal_k_jdwl_kls_kelas_ku
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.jurusan') and o.name = 'fk_jurusan_bid_jur_kelompok')
alter table ref.jurusan
   drop constraint fk_jurusan_bid_jur_kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('presensi.kehadiran_mhs') and o.name = 'fk_kehadira_hadir_mhs_kelas_ku')
alter table presensi.kehadiran_mhs
   drop constraint fk_kehadira_hadir_mhs_kelas_ku
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kelas_kuliah') and o.name = 'fk_kelas_ku_kelas_mat_matkul')
alter table pdrd.kelas_kuliah
   drop constraint fk_kelas_ku_kelas_mat_matkul
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kelas_kuliah') and o.name = 'fk_kelas_ku_prodi_kel_sms')
alter table pdrd.kelas_kuliah
   drop constraint fk_kelas_ku_prodi_kel_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kelas_kuliah') and o.name = 'fk_kelas_ku_smt_kelas_semester')
alter table pdrd.kelas_kuliah
   drop constraint fk_kelas_ku_smt_kelas_semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.kelompok_bidang') and o.name = 'fk_kelompok_induk_kel_kelompok')
alter table ref.kelompok_bidang
   drop constraint fk_kelompok_induk_kel_kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('mbkm.konversi_akt_mhs') and o.name = 'fk_konversi_konversi__matkul')
alter table mbkm.konversi_akt_mhs
   drop constraint fk_konversi_konversi__matkul
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kurikulum_sp') and o.name = 'fk_kurikulu_sms_kurik_sms')
alter table pdrd.kurikulum_sp
   drop constraint fk_kurikulu_sms_kurik_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.lembaga_non_sp') and o.name = 'fk_lembaga__induk_lem_lembaga_')
alter table pdrd.lembaga_non_sp
   drop constraint fk_lembaga__induk_lem_lembaga_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.lembaga_non_sp') and o.name = 'fk_lembaga__jenis_lem_jenis_le')
alter table pdrd.lembaga_non_sp
   drop constraint fk_lembaga__jenis_lem_jenis_le
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.lembaga_non_sp') and o.name = 'fk_lembaga__wilayah_l_wilayah')
alter table pdrd.lembaga_non_sp
   drop constraint fk_lembaga__wilayah_l_wilayah
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.litabmas') and o.name = 'fk_litabmas_rumpun_il_kelompok')
alter table pdrd.litabmas
   drop constraint fk_litabmas_rumpun_il_kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('logger.log_jwt') and o.name = 'fk_log_jwt_log_pengg_pengguna')
alter table logger.log_jwt
   drop constraint fk_log_jwt_log_pengg_pengguna
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('logger.log_login') and o.name = 'fk_log_logi_log_login_pengguna')
alter table logger.log_login
   drop constraint fk_log_logi_log_login_pengguna
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('logger.log_pengguna') and o.name = 'fk_log_peng_log_pengu_pengguna')
alter table logger.log_pengguna
   drop constraint fk_log_peng_log_pengu_pengguna
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('logger.log_table_app') and o.name = 'fk_log_tabl_log_pengg_pengguna')
alter table logger.log_table_app
   drop constraint fk_log_tabl_log_pengg_pengguna
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
   where r.fkeyid = object_id('pdrd.matkul') and o.name = 'fk_matkul_jenjang_p_jenjang_')
alter table pdrd.matkul
   drop constraint fk_matkul_jenjang_p_jenjang_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.matkul') and o.name = 'fk_matkul_prodi_mat_sms')
alter table pdrd.matkul
   drop constraint fk_matkul_prodi_mat_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.matkul_kurikulum') and o.name = 'fk_matkul_k_detail_ma_matkul')
alter table pdrd.matkul_kurikulum
   drop constraint fk_matkul_k_detail_ma_matkul
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.media_publikasi') and o.name = 'fk_media_pu_bidang_me_kelompok')
alter table ref.media_publikasi
   drop constraint fk_media_pu_bidang_me_kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.nilai_smt_mhs') and o.name = 'fk_nilai_sm_kls_nilai_kelas_ku')
alter table pdrd.nilai_smt_mhs
   drop constraint fk_nilai_sm_kls_nilai_kelas_ku
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.nilai_transkrip') and o.name = 'fk_nilai_tr_kelas_tra_kelas_ku')
alter table pdrd.nilai_transkrip
   drop constraint fk_nilai_tr_kelas_tra_kelas_ku
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.nilai_transkrip') and o.name = 'fk_nilai_tr_mk_nilai__matkul')
alter table pdrd.nilai_transkrip
   drop constraint fk_nilai_tr_mk_nilai__matkul
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('man_akses.pj_aplikasi') and o.name = 'fk_pj_aplik_akun_pj_a_pengguna')
alter table man_akses.pj_aplikasi
   drop constraint fk_pj_aplik_akun_pj_a_pengguna
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.profil_prodi') and o.name = 'fk_profil_p_profil_pr_sms')
alter table pdrd.profil_prodi
   drop constraint fk_profil_p_profil_pr_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.re_mk') and o.name = 'fk_re_mk_mk_re_mk_matkul')
alter table pdrd.re_mk
   drop constraint fk_re_mk_mk_re_mk_matkul
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
   where r.fkeyid = object_id('pdrd.rencana_ajar') and o.name = 'fk_rencana__rencana_m_matkul')
alter table pdrd.rencana_ajar
   drop constraint fk_rencana__rencana_m_matkul
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('man_akses.role_pengguna') and o.name = 'fk_role_pen_peran_pen_pengguna')
alter table man_akses.role_pengguna
   drop constraint fk_role_pen_peran_pen_pengguna
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.ruang') and o.name = 'fk_ruang_sms_pemil_sms')
alter table sarpras.ruang
   drop constraint fk_ruang_sms_pemil_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_fungsional') and o.name = 'fk_rwy_fung_jabfung_b_kelompok')
alter table pdrd.rwy_fungsional
   drop constraint fk_rwy_fung_jabfung_b_kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_sertifikasi') and o.name = 'fk_rwy_sert_riwayat_s_sdm')
alter table pdrd.rwy_sertifikasi
   drop constraint fk_rwy_sert_riwayat_s_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_sertifikasi') and o.name = 'fk_rwy_sert_rwyt_bida_bidang_s')
alter table pdrd.rwy_sertifikasi
   drop constraint fk_rwy_sert_rwyt_bida_bidang_s
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_sertifikasi') and o.name = 'fk_rwy_sert_rwyt_sert_jenis_se')
alter table pdrd.rwy_sertifikasi
   drop constraint fk_rwy_sert_rwyt_sert_jenis_se
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.satuan_pendidikan') and o.name = 'fk_satuan_p_pembina_s_lembaga_')
alter table pdrd.satuan_pendidikan
   drop constraint fk_satuan_p_pembina_s_lembaga_
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
   where r.fkeyid = object_id('kerjasama.sms_kerjasama') and o.name = 'fk_sms_kerj_sms_yang__sms')
alter table kerjasama.sms_kerjasama
   drop constraint fk_sms_kerj_sms_yang__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.substansi_kuliah') and o.name = 'fk_substans_substansi_sms')
alter table pdrd.substansi_kuliah
   drop constraint fk_substans_substansi_sms
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

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('man_akses.ws_authorization') and o.name = 'fk_ws_autho_ws_penggu_pengguna')
alter table man_akses.ws_authorization
   drop constraint fk_ws_autho_ws_penggu_pengguna
go

alter table pdrd.kelas_kuliah
   drop constraint pk_kelas_kuliah
go

alter table pdrd.kelas_kuliah
   drop constraint ckc_a_selenggara_pdit_kelas_ku
go

alter table pdrd.kelas_kuliah
   drop constraint ckc_a_pengguna_pditt_kelas_ku
go

alter table pdrd.kelas_kuliah
   drop constraint ckc_soft_delete_kelas_ku
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_kelas_kuliah')
            and   type = 'U')
   drop table pdrd.tmp_kelas_kuliah
go

execute sp_rename 'pdrd.kelas_kuliah', tmp_kelas_kuliah
go

alter table ref.kelompok_bidang
   drop constraint pk_kelompok_bidang
go

alter table ref.kelompok_bidang
   drop constraint ckc_a_ref_pddikti_kelompok2
go

alter table ref.kelompok_bidang
   drop constraint ckc_a_ref_unila_kelompok2
go

alter table ref.kelompok_bidang
   drop constraint ckc_u_sma_kelompok
go

alter table ref.kelompok_bidang
   drop constraint ckc_u_smk_kelompok
go

alter table ref.kelompok_bidang
   drop constraint ckc_u_pt_kelompok
go

alter table ref.kelompok_bidang
   drop constraint ckc_u_iptek_kelompok
go

alter table ref.kelompok_bidang
   drop constraint ckc_u_kepakaran_kelompok
go

alter table ref.kelompok_bidang
   drop constraint ckc_a_leaf_node_kelompok
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kelompok_bidang')
            and   type = 'U')
   drop table ref.tmp_kelompok_bidang
go

execute sp_rename 'ref.kelompok_bidang', tmp_kelompok_bidang
go

alter table pdrd.lembaga_non_sp
   drop constraint pk_lembaga_non_sp
go

alter table pdrd.lembaga_non_sp
   drop constraint ckc_delete_lemb_non_sp
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_lembaga_non_sp')
            and   type = 'U')
   drop table pdrd.tmp_lembaga_non_sp
go

execute sp_rename 'pdrd.lembaga_non_sp', tmp_lembaga_non_sp
go

alter table pdrd.matkul
   drop constraint pk_matkul
go

alter table pdrd.matkul
   drop constraint ckc_a_sap_matkul
go

alter table pdrd.matkul
   drop constraint ckc_a_silabus_matkul
go

alter table pdrd.matkul
   drop constraint ckc_a_bahan_ajar_matkul
go

alter table pdrd.matkul
   drop constraint ckc_a_diktat_matkul
go

alter table pdrd.matkul
   drop constraint ckc_soft_delete_matkul
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_matkul')
            and   type = 'U')
   drop table pdrd.tmp_matkul
go

execute sp_rename 'pdrd.matkul', tmp_matkul
go

alter table man_akses.pengguna
   drop constraint pk_pengguna
go

alter table man_akses.pengguna
   drop constraint ckc_jenis_kelamin_pengguna
go

alter table man_akses.pengguna
   drop constraint ckc_approval_pengguna_pengguna
go

alter table man_akses.pengguna
   drop constraint ckc_a_aktif_pengguna
go

alter table man_akses.pengguna
   drop constraint ckc_disable_pengguna
go

alter table man_akses.pengguna
   drop constraint ckc_soft_delete_pengguna
go

if exists (select 1
            from  sysobjects
           where  id = object_id('man_akses.tmp_pengguna')
            and   type = 'U')
   drop table man_akses.tmp_pengguna
go

execute sp_rename 'man_akses.pengguna', tmp_pengguna
go

alter table pdrd.rwy_sertifikasi
   drop constraint pk_rwy_sertifikasi
go

alter table pdrd.rwy_sertifikasi
   drop constraint ckc_soft_delete_rwy_sert
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_rwy_sertifikasi')
            and   type = 'U')
   drop table pdrd.tmp_rwy_sertifikasi
go

execute sp_rename 'pdrd.rwy_sertifikasi', tmp_rwy_sertifikasi
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

/*==============================================================*/
/* Table: jenis_mk                                              */
/*==============================================================*/
create table ref.jenis_mk (
   id_jns_mk            char(1)              not null,
   nm_jns_mk            varchar(100)         not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_mk check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_mk check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_mk primary key (id_jns_mk)
)
go

/*==============================================================*/
/* Table: kelas_kuliah                                          */
/*==============================================================*/
create table pdrd.kelas_kuliah (
   id_kls               uniqueidentifier     not null,
   id_smt               char(5)              not null,
   id_sms               uniqueidentifier     not null,
   id_mk                uniqueidentifier     not null,
   sks_mk               numeric(5,2)         null,
   sks_tm               numeric(5,2)         null,
   sks_prak             numeric(5,2)         null,
   sks_prak_lap         numeric(5,2)         null,
   sks_sim              numeric(5,2)         null,
   nm_kls               varchar(5)           not null,
   bahasan_case         varchar(200)         null,
   a_selenggara_pditt   numeric(1)           not null default 0
      constraint ckc_a_selenggara_pdit_kelas_ku check (a_selenggara_pditt between 0 and 1 and a_selenggara_pditt in (0,1)),
   a_pengguna_pditt     numeric(1)           not null default 0
      constraint ckc_a_pengguna_pditt_kelas_ku check (a_pengguna_pditt between 0 and 1 and a_pengguna_pditt in (0,1)),
   kuota_pditt          numeric(4)           not null default 0,
   kode_vclass          varchar(120)         null,
   url_vclass           varchar(256)         null,
   lingkup_kelas        numeric(1)           null 
      constraint ckc_lingkup_kelas_kelas_ku check (lingkup_kelas is null or (lingkup_kelas in (1,2,3))),
   mode_kuliah          char(1)              null 
      constraint ckc_mode_kuliah_kelas_ku check (mode_kuliah is null or (mode_kuliah in ('O','F','M'))),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_kelas_ku check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_kelas_kuliah primary key (id_kls)
)
go

insert into pdrd.kelas_kuliah (id_kls, id_smt, id_sms, id_mk, sks_mk, sks_tm, sks_prak, sks_prak_lap, sks_sim, nm_kls, bahasan_case, a_selenggara_pditt, a_pengguna_pditt, kuota_pditt, kode_vclass, url_vclass, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_kls, id_smt, id_sms, id_mk, sks_mk, sks_tm, sks_prak, sks_prak_lap, sks_sim, nm_kls, bahasan_case, a_selenggara_pditt, a_pengguna_pditt, kuota_pditt, kode_vclass, url_vclass, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_kelas_kuliah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_kelas_kuliah')
            and   type = 'U')
   drop table pdrd.tmp_kelas_kuliah
go

/*==============================================================*/
/* Table: kelompok_bidang                                       */
/*==============================================================*/
create table ref.kelompok_bidang (
   id_kel_bidang        uniqueidentifier     not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_kelompok2 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_kelompok2 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   kode_kel_bidang      varchar(20)          not null,
   nm_kel_bidang        varchar(120)         not null,
   u_sma                numeric(1)           not null default 0
      constraint ckc_u_sma_kelompok check (u_sma between 0 and 1 and u_sma in (0,1)),
   u_smk                numeric(1)           not null default 0
      constraint ckc_u_smk_kelompok check (u_smk between 0 and 1 and u_smk in (0,1)),
   u_pt                 numeric(1)           not null default 0
      constraint ckc_u_pt_kelompok check (u_pt between 0 and 1 and u_pt in (0,1)),
   u_iptek              numeric(1)           not null default 0
      constraint ckc_u_iptek_kelompok check (u_iptek between 0 and 1 and u_iptek in (0,1)),
   u_kepakaran          numeric(1)           not null default 0
      constraint ckc_u_kepakaran_kelompok check (u_kepakaran between 0 and 1 and u_kepakaran in (0,1)),
   kat_kel              varchar(3)           null,
   ket_kel_bidang       varchar(200)         null,
   a_leaf_node          numeric(1)           not null default 0
      constraint ckc_a_leaf_node_kelompok check (a_leaf_node between 0 and 1 and a_leaf_node in (0,1)),
   id_induk_bidang      uniqueidentifier     null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kelompok_bidang primary key (id_kel_bidang)
)
go

insert into ref.kelompok_bidang (id_kel_bidang, a_ref_pddikti, a_ref_unila, kode_kel_bidang, nm_kel_bidang, u_sma, u_smk, u_pt, u_iptek, u_kepakaran, kat_kel, ket_kel_bidang, a_leaf_node, id_induk_bidang, create_date, last_update, expired_date, last_sync)
select id_kel_bidang, a_ref_pddikti, a_ref_unila, kode_kel_bidang, nm_kel_bidang, u_sma, u_smk, u_pt, u_iptek, u_kepakaran, kat_kel, ket_kel_bidang, a_leaf_node, id_induk_bidang, create_date, last_update, expired_date, last_sync
from ref.tmp_kelompok_bidang
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kelompok_bidang')
            and   type = 'U')
   drop table ref.tmp_kelompok_bidang
go

/*==============================================================*/
/* Table: kelompok_mk                                           */
/*==============================================================*/
create table ref.kelompok_mk (
   id_kel_mk            char(1)              not null,
   nm_kel_mk            varchar(100)         not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_kelompok4 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_kelompok4 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kelompok_mk primary key (id_kel_mk)
)
go

/*==============================================================*/
/* Table: man_akses.kelompok_tabel_aplikasi                               */
/*==============================================================*/
create table man_akses.kelompok_tabel_aplikasi (
   id_kel_table_app     uniqueidentifier     not null,
   id_table_app         uniqueidentifier     null,
   id_induk_kel_table_app uniqueidentifier     null,
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   url                  varchar(256)         null,
   method               varchar(50)          null,
   enpoint              varchar(200)         null,
   level                numeric(1)           not null default 0
      constraint ckc_level_kelompok check (level between 0 and 9),
   constraint pk_man_akses.kelompok_tabel_aplikasi primary key (id_kel_table_app)
)
go

/*==============================================================*/
/* Table: lembaga_non_sp                                        */
/*==============================================================*/
create table pdrd.lembaga_non_sp (
   id_lemb_non_sp       uniqueidentifier     not null,
   nm_lemb              varchar(100)         not null,
   singkatan            varchar(50)          null,
   deskripsi            varchar(100)         null,
   level_lemb           numeric(2)           not null,
   tgl_mulai_efektif    date                 null,
   tgl_akhir_efektif    date                 null,
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
   kd_kl                char(3)              null,
   kd_satker            varchar(20)          null,
   id_jns_lemb          numeric(5)           not null,
   id_wil               char(8)              not null,
   id_induk_lemb_non_sp uniqueidentifier     null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_lemb_non_sp check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_lembaga_non_sp primary key (id_lemb_non_sp)
)
go

insert into pdrd.lembaga_non_sp (id_lemb_non_sp, nm_lemb, singkatan, deskripsi, level_lemb, tgl_mulai_efektif, tgl_akhir_efektif, jln, rt, rw, nm_dsn, ds_kel, kode_pos, lintang, bujur, no_tel, no_fax, email, website, kd_kl, kd_satker, id_jns_lemb, id_wil, id_induk_lemb_non_sp, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_lemb_non_sp, nm_lemb, singkatan, deskripsi, level_lemb, tgl_mulai_efektif, tgl_akhir_efektif, jln, rt, rw, nm_dsn, ds_kel, kode_pos, lintang, bujur, no_tel, no_fax, email, website, kd_kl, kd_satker, id_jns_lemb, id_wil, id_induk_lemb_non_sp, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_lembaga_non_sp
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_lembaga_non_sp')
            and   type = 'U')
   drop table pdrd.tmp_lembaga_non_sp
go

/*==============================================================*/
/* Table: lembaga_sertifikasi                                   */
/*==============================================================*/
create table ref.lembaga_sertifikasi (
   id_lemb_sert         numeric(2,0)         not null,
   nm_lemb_sert         varchar(100)         null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_lemb_sert check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_lemb_sert check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_lembaga_sertifikasi primary key (id_lemb_sert)
)
go

/*==============================================================*/
/* Table: matkul                                                */
/*==============================================================*/
create table pdrd.matkul (
   id_mk                uniqueidentifier     not null,
   id_kel_mk            char(1)              null,
   id_sms               uniqueidentifier     null,
   id_jns_mk            char(1)              null,
   id_jenj_didik        numeric(2)           not null,
   sks_mk               numeric(5,2)         null,
   sks_tm               numeric(5,2)         null,
   sks_prak             numeric(5,2)         null,
   sks_prak_lap         numeric(5,2)         null,
   sks_sim              numeric(5,2)         null,
   kode_mk              varchar(20)          not null,
   nm_mk                varchar(120)         null,
   jns_mk               char(1)              null,
   kel_mk               char(1)              null,
   metode_pelaksanaan_kuliah varchar(50)          null,
   a_sap                numeric(1)           null default 0
      constraint ckc_a_sap_matkul check (a_sap is null or (a_sap between 0 and 1 and a_sap in (0,1))),
   a_silabus            numeric(1)           null default 0
      constraint ckc_a_silabus_matkul check (a_silabus is null or (a_silabus between 0 and 1 and a_silabus in (0,1))),
   a_bahan_ajar         numeric(1)           null default 0
      constraint ckc_a_bahan_ajar_matkul check (a_bahan_ajar is null or (a_bahan_ajar between 0 and 1 and a_bahan_ajar in (0,1))),
   acara_prak           numeric(1)           null,
   a_diktat             numeric(1)           null default 0
      constraint ckc_a_diktat_matkul check (a_diktat is null or (a_diktat between 0 and 1 and a_diktat in (0,1))),
   tgl_mulai_efektif    date                 null,
   tgl_akhir_efektif    date                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_matkul check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_matkul primary key (id_mk)
)
go

insert into pdrd.matkul (id_mk, id_sms, id_jenj_didik, sks_mk, sks_tm, sks_prak, sks_prak_lap, sks_sim, kode_mk, nm_mk, jns_mk, kel_mk, metode_pelaksanaan_kuliah, a_sap, a_silabus, a_bahan_ajar, acara_prak, a_diktat, tgl_mulai_efektif, tgl_akhir_efektif, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_mk, id_sms, id_jenj_didik, sks_mk, sks_tm, sks_prak, sks_prak_lap, sks_sim, kode_mk, nm_mk, jns_mk, kel_mk, metode_pelaksanaan_kuliah, a_sap, a_silabus, a_bahan_ajar, acara_prak, a_diktat, tgl_mulai_efektif, tgl_akhir_efektif, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_matkul
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_matkul')
            and   type = 'U')
   drop table pdrd.tmp_matkul
go

/*==============================================================*/
/* Table: pengguna                                              */
/*==============================================================*/
create table man_akses.pengguna (
   id_pengguna          uniqueidentifier     not null,
   username             varchar(60)          not null,
   password             varchar(50)          not null,
   password_encrypt     varchar(255)         null,
   type_encrypt         varchar(80)          null,
   nm_pengguna          varchar(200)         null,
   email                varchar(60)          null,
   tempat_lahir         varchar(60)          null,
   tgl_lahir            date                 null,
   jenis_kelamin        char(1)              not null 
      constraint ckc_jenis_kelamin_pengguna check (jenis_kelamin in ('L','P','*')),
   alamat               varchar(255)         null,
   no_tel               varchar(20)          null,
   no_hp                varchar(20)          null,
   approval_pengguna    numeric(1)           not null default 0
      constraint ckc_approval_pengguna_pengguna check (approval_pengguna between 0 and 1 and approval_pengguna in (0,1)),
   a_aktif              numeric(1)           not null default 1
      constraint ckc_a_aktif_pengguna check (a_aktif between 0 and 1 and a_aktif in (0,1)),
   tgl_ganti_pwd        date                 null,
   id_sdm_pengguna      uniqueidentifier     null,
   id_pd_pengguna       uniqueidentifier     null,
   id_calon_pd_pengguna uniqueidentifier     null,
   id_user_sikep        int                  null,
   token_reg            varchar(100)         null,
   jabatan              varchar(80)          null,
   provider             varchar(500)         null,
   disable              numeric(1)           not null default 0
      constraint ckc_disable_pengguna check (disable between 0 and 1 and disable in (0,1)),
   nik                  char(20)             null,
   salt                 varchar(50)          null,
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_pengguna check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   id_updater           uniqueidentifier     not null,
   constraint pk_pengguna primary key (id_pengguna)
)
go

insert into man_akses.pengguna (id_pengguna, username, password, password_encrypt, type_encrypt, nm_pengguna, email, tempat_lahir, tgl_lahir, jenis_kelamin, alamat, no_tel, no_hp, approval_pengguna, a_aktif, tgl_ganti_pwd, id_sdm_pengguna, id_pd_pengguna, id_calon_pd_pengguna, id_user_sikep, token_reg, jabatan, provider, disable, tgl_create, last_update, soft_delete, last_sync, id_updater)
select id_pengguna, username, password, password_encrypt, type_encrypt, nm_pengguna, email, tempat_lahir, tgl_lahir, jenis_kelamin, alamat, no_tel, no_hp, approval_pengguna, a_aktif, tgl_ganti_pwd, id_sdm_pengguna, id_pd_pengguna, id_calon_pd_pengguna, id_user_sikep, token_reg, jabatan, provider, disable, tgl_create, last_update, soft_delete, last_sync, id_updater
from man_akses.tmp_pengguna
go

if exists (select 1
            from  sysobjects
           where  id = object_id('man_akses.tmp_pengguna')
            and   type = 'U')
   drop table man_akses.tmp_pengguna
go

/*==============================================================*/
/* Table: rwy_sertifikasi                                       */
/*==============================================================*/
create table pdrd.rwy_sertifikasi (
   id_rwy_sert          uniqueidentifier     not null,
   id_jns_sert          numeric(3)           not null,
   id_bid_studi         int                  not null,
   id_lemb_sert         numeric(2,0)         null,
   id_sdm               uniqueidentifier     not null,
   thn_sert             numeric(4)           not null,
   sk_sert              varchar(80)          not null,
   nrg                  varchar(15)          null,
   no_peserta           varchar(16)          null,
   tmt_sert             datetime             null,
   tst_sert             datetime             null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_rwy_sert check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_rwy_sertifikasi primary key (id_rwy_sert)
)
go

insert into pdrd.rwy_sertifikasi (id_rwy_sert, id_jns_sert, id_bid_studi, id_sdm, thn_sert, sk_sert, nrg, no_peserta, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_rwy_sert, id_jns_sert, id_bid_studi, id_sdm, thn_sert, sk_sert, nrg, no_peserta, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_rwy_sertifikasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_rwy_sertifikasi')
            and   type = 'U')
   drop table pdrd.tmp_rwy_sertifikasi
go

/*==============================================================*/
/* Table: sms                                                   */
/*==============================================================*/
create table pdrd.sms (
   id_sms               uniqueidentifier     not null,
   id_fak_unila         uniqueidentifier     null,
   id_lemb_non_sp       uniqueidentifier     null,
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
   tgl_tutup            datetime             null,
   kode_snpmb           varchar(10)          null,
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

insert into pdrd.sms (id_sms, id_fak_unila, id_jur_unila, id_jur, id_jenj_didik, nm_lemb, kd_kl, kd_satker, smt_mulai, a_selenggara_subst, stat_prodi_unila, tgl_tutup, kode_snpmb, kode_prodi, nm_prodi_english, kpst_pd, sks_lulus, gelar_lulusan, stat_prodi, polesei_nilai, a_kependidikan, jln, rt, rw, nm_dsn, ds_kel, kode_pos, lintang, bujur, no_tel, no_fax, email, website, singkatan, tgl_berdiri, sk_selenggara, tgl_sk_selenggara, tmt_sk_selenggara, tst_sk_selenggara, sistem_ajar, a_pjj, a_psdku, luas_lab, kapasitas_prak_satu_shift, jml_mhs_pengguna, jml_jam_penggunaan, jml_prodi_pengguna, jml_modul_prak_sendiri, jml_modul_prak_lain, fungsi_selain_prak, penggunaan_lab, a_pkl, id_sp, id_jns_sms, id_fungsi_lab, id_kel_usaha, id_blob, id_wil, id_induk_sms, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_sms, id_fak_unila, id_jur_unila, id_jur, id_jenj_didik, nm_lemb, kd_kl, kd_satker, smt_mulai, a_selenggara_subst, stat_prodi_unila, tgl_tutup, kode_snpmb, kode_prodi, nm_prodi_english, kpst_pd, sks_lulus, gelar_lulusan, stat_prodi, polesei_nilai, a_kependidikan, jln, rt, rw, nm_dsn, ds_kel, kode_pos, lintang, bujur, no_tel, no_fax, email, website, singkatan, tgl_berdiri, sk_selenggara, tgl_sk_selenggara, tmt_sk_selenggara, tst_sk_selenggara, sistem_ajar, a_pjj, a_psdku, luas_lab, kapasitas_prak_satu_shift, jml_mhs_pengguna, jml_jam_penggunaan, jml_prodi_pengguna, jml_modul_prak_sendiri, jml_modul_prak_lain, fungsi_selain_prak, penggunaan_lab, a_pkl, id_sp, id_jns_sms, id_fungsi_lab, id_kel_usaha, id_blob, id_wil, id_induk_sms, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_sms
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_sms')
            and   type = 'U')
   drop table pdrd.tmp_sms
go

alter table pdrd.akreditasi_prodi
   add constraint fk_akredita_akreditas_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_pengambil_kelas_ku foreign key (id_kls)
      references pdrd.kelas_kuliah (id_kls)
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

alter table pmb.daya_tampung
   add constraint fk_daya_tam_daya_tamp_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
         on update cascade on delete cascade
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

alter table pdrd.diklat
   add constraint fk_diklat_diklat_ke_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table dok.dok_rwy_sertifikasi
   add constraint fk_dok_rwy__rwy_sert__rwy_sert foreign key (id_rwy_sert)
      references pdrd.rwy_sertifikasi (id_rwy_sert)
go

alter table mbkm.ekuiv_transfer
   add constraint fk_ekuiv_tr_mk_ekuiv__matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
         on update cascade on delete cascade
go

alter table pdrd.jadwal_kelas
   add constraint fk_jadwal_k_jdwl_kls_kelas_ku foreign key (id_kls)
      references pdrd.kelas_kuliah (id_kls)
go

alter table ref.jurusan
   add constraint fk_jurusan_bid_jur_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table presensi.kehadiran_mhs
   add constraint fk_kehadira_hadir_mhs_kelas_ku foreign key (id_kls)
      references pdrd.kelas_kuliah (id_kls)
go

alter table pdrd.kelas_kuliah
   add constraint fk_kelas_ku_kelas_mat_matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
go

alter table pdrd.kelas_kuliah
   add constraint fk_kelas_ku_prodi_kel_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.kelas_kuliah
   add constraint fk_kelas_ku_smt_kelas_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table ref.kelompok_bidang
   add constraint fk_induk_kelompok foreign key (id_induk_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table man_akses.kelompok_tabel_aplikasi
   add constraint fk_kelompok_detail_ke_table_ap foreign key (id_table_app)
      references man_akses.table_aplikasi (id_table_app)
         on update cascade on delete cascade
go

alter table man_akses.kelompok_tabel_aplikasi
   add constraint fk_kelompok_induk_kel_kelompok foreign key (id_induk_kel_table_app)
      references man_akses.kelompok_tabel_aplikasi (id_kel_table_app)
go

alter table mbkm.konversi_akt_mhs
   add constraint fk_konversi_konversi__matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
go

alter table pdrd.kurikulum_sp
   add constraint fk_kurikulu_sms_kurik_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
         on update cascade on delete cascade
go

alter table pdrd.lembaga_non_sp
   add constraint fk_lembaga__induk_lem_lembaga_ foreign key (id_induk_lemb_non_sp)
      references pdrd.lembaga_non_sp (id_lemb_non_sp)
go

alter table pdrd.lembaga_non_sp
   add constraint fk_lembaga__jenis_lem_jenis_le foreign key (id_jns_lemb)
      references ref.jenis_lembaga (id_jns_lemb)
go

alter table pdrd.lembaga_non_sp
   add constraint fk_lembaga__wilayah_l_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_rumpun_il_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table logger.log_jwt
   add constraint fk_log_jwt_log_pengg_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

alter table logger.log_login
   add constraint fk_log_logi_log_login_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

alter table logger.log_pengguna
   add constraint fk_log_peng_log_pengu_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

alter table logger.log_table_app
   add constraint fk_log_tabl_log_pengg_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

alter table pdrd.map_litabmas_bidang
   add constraint fk_map_lita_litabmas__kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.map_publikasi_bidang
   add constraint fk_map_publ_pub_bidan_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.matkul
   add constraint fk_matkul_jenis_mk_jenis_mk foreign key (id_jns_mk)
      references ref.jenis_mk (id_jns_mk)
         on update cascade on delete cascade
go

alter table pdrd.matkul
   add constraint fk_matkul_jenjang_p_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.matkul
   add constraint fk_matkul_kelompok__kelompok foreign key (id_kel_mk)
      references ref.kelompok_mk (id_kel_mk)
         on update cascade on delete cascade
go

alter table pdrd.matkul
   add constraint fk_matkul_prodi_mat_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table ref.media_publikasi
   add constraint fk_media_pu_bidang_me_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.nilai_smt_mhs
   add constraint fk_nilai_sm_kls_nilai_kelas_ku foreign key (id_kls)
      references pdrd.kelas_kuliah (id_kls)
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

alter table man_akses.pj_aplikasi
   add constraint fk_pj_aplik_akun_pj_a_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

alter table pdrd.profil_prodi
   add constraint fk_profil_p_profil_pr_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.re_mk
   add constraint fk_re_mk_mk_re_mk_matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_prodi_pd_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.reg_ptk
   add constraint fk_reg_ptk_reg_dosen_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.rencana_ajar
   add constraint fk_rencana__rencana_m_matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
go

alter table man_akses.role_pengguna
   add constraint fk_role_pen_peran_pen_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

alter table sarpras.ruang
   add constraint fk_ruang_sms_pemil_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.rwy_fungsional
   add constraint fk_rwy_fung_jabfung_b_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.rwy_sertifikasi
   add constraint fk_rwy_sert_lembaga_s_lembaga_ foreign key (id_lemb_sert)
      references ref.lembaga_sertifikasi (id_lemb_sert)
         on update cascade on delete cascade
go

alter table pdrd.rwy_sertifikasi
   add constraint fk_rwy_sert_riwayat_s_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_sertifikasi
   add constraint fk_rwy_sert_rwyt_bida_bidang_s foreign key (id_bid_studi)
      references ref.bidang_studi (id_bid_studi)
go

alter table pdrd.rwy_sertifikasi
   add constraint fk_rwy_sert_rwyt_sert_jenis_se foreign key (id_jns_sert)
      references ref.jenis_sert (id_jns_sert)
go

alter table pdrd.satuan_pendidikan
   add constraint fk_satuan_p_pembina_s_lembaga_ foreign key (id_pembina)
      references pdrd.lembaga_non_sp (id_lemb_non_sp)
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
   add constraint fk_sms_kelembaga_lembaga_ foreign key (id_lemb_non_sp)
      references pdrd.lembaga_non_sp (id_lemb_non_sp)
         on update cascade on delete cascade
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
   add constraint fk_sms_kerj_sms_yang__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.substansi_kuliah
   add constraint fk_substans_substansi_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
         on update cascade on delete cascade
go

alter table sarpras.tanah
   add constraint fk_tanah_sms_pemil_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.tugas_tambahan
   add constraint fk_tugas_ta_jabatan_p_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table man_akses.ws_authorization
   add constraint fk_ws_autho_ws_penggu_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
         on update cascade on delete cascade
go

INSERT INTO man_akses.versi_db (versi,tgl_update) VALUES ('0.10.0',GETDATE());