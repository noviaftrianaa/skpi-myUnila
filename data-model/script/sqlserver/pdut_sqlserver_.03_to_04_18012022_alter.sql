/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     19/01/2022 00:11:21                          */
/*==============================================================*/


if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_ajar_dosen') and o.name = 'fk_akt_ajar_pengambil_kelas_ku')
alter table pdrd.akt_ajar_dosen
   drop constraint fk_akt_ajar_pengambil_kelas_ku
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
   where r.fkeyid = object_id('pdrd.anggota_aktivitas_mahasiswa') and o.name = 'fk_anggota__akt_mhs_a_akt_mhs')
alter table pdrd.anggota_aktivitas_mahasiswa
   drop constraint fk_anggota__akt_mhs_a_akt_mhs
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
   where r.fkeyid = object_id('pdrd.anggota_panitia') and o.name = 'fk_anggota__panitia_p_sdm')
alter table pdrd.anggota_panitia
   drop constraint fk_anggota__panitia_p_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.angkutan') and o.name = 'fk_angkutan_alat_ptk_sdm')
alter table sarpras.angkutan
   drop constraint fk_angkutan_alat_ptk_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('beasiswa.beasiswa_sdm') and o.name = 'fk_beasiswa_beasiswa__sdm')
alter table beasiswa.beasiswa_sdm
   drop constraint fk_beasiswa_beasiswa__sdm
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
   where r.fkeyid = object_id('dok.foto_peserta_didik') and o.name = 'fk_foto_pes_pemilik_f_peserta_')
alter table dok.foto_peserta_didik
   drop constraint fk_foto_pes_pemilik_f_peserta_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('tracer.hasil_tracer_atasan') and o.name = 'fk_hasil_tr_hasil_ata_hasil_tr')
alter table tracer.hasil_tracer_atasan
   drop constraint fk_hasil_tr_hasil_ata_hasil_tr
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
   where r.fkeyid = object_id('pdrd.jadwal_kelas') and o.name = 'fk_jadwal_k_jdwl_kls_kelas_ku')
alter table pdrd.jadwal_kelas
   drop constraint fk_jadwal_k_jdwl_kls_kelas_ku
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('presensi.kehadiran_mhs') and o.name = 'fk_kehadira_hadir_mhs_kelas_ku')
alter table presensi.kehadiran_mhs
   drop constraint fk_kehadira_hadir_mhs_kelas_ku
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('presensi.kehadiran_sdm') and o.name = 'fk_kehadira_hadir_sdm_sdm')
alter table presensi.kehadiran_sdm
   drop constraint fk_kehadira_hadir_sdm_sdm
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
   where r.fkeyid = object_id('pdrd.kesejahteraan') and o.name = 'fk_kesejaht_kesejahte_sdm')
alter table pdrd.kesejahteraan
   drop constraint fk_kesejaht_kesejahte_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('logger.log_table_app') and o.name = 'fk_log_tabl_log_detai_table_ap')
alter table logger.log_table_app
   drop constraint fk_log_tabl_log_detai_table_ap
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.nilai_smt_mhs') and o.name = 'fk_nilai_sm_kls_nilai_kelas_ku')
alter table pdrd.nilai_smt_mhs
   drop constraint fk_nilai_sm_kls_nilai_kelas_ku
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.nilai_tes') and o.name = 'fk_nilai_te_nilai_tes_sdm')
alter table pdrd.nilai_tes
   drop constraint fk_nilai_te_nilai_tes_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.pd_anggota_litabmas') and o.name = 'fk_pd_anggo_ang_litab_peserta_')
alter table pdrd.pd_anggota_litabmas
   drop constraint fk_pd_anggo_ang_litab_peserta_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.pembicara') and o.name = 'fk_pembicar_pembicata_sdm')
alter table pdrd.pembicara
   drop constraint fk_pembicar_pembicata_sdm
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
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__agama_pd_agama')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__agama_pd_agama
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__alat_tran_alat_tra')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__alat_tran_alat_tra
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__foto_pd_large_ob')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__foto_pd_large_ob
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__jenis_tin_jenis_ti')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__jenis_tin_jenis_ti
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__kebutuhan_kebutuha')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__kebutuhan_kebutuha
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__kewargane_negara')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__kewargane_negara
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__pekerjaan_ibu')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__pekerjaan_ibu
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__pekerjaan_pekerjaa')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__pekerjaan_pekerjaa
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__pekerjaan_wali')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__pekerjaan_wali
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__pendidika_ayah')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__pendidika_ayah
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__pendidika_wali')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__pendidika_wali
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__pendidikan_ibu')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__pendidikan_ibu
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__penghasil_ayah')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__penghasil_ayah
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__penghasil_ibu')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__penghasil_ibu
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__penghasil_wali')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__penghasil_wali
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__provinsi__wilayah')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__provinsi__wilayah
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta__status_ke_status_m')
alter table pdrd.peserta_didik
   drop constraint fk_peserta__status_ke_status_m
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta_kk_ibu')
alter table pdrd.peserta_didik
   drop constraint fk_peserta_kk_ibu
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.peserta_didik') and o.name = 'fk_peserta_kk_pd')
alter table pdrd.peserta_didik
   drop constraint fk_peserta_kk_pd
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.prestasi') and o.name = 'fk_prestasi_prestasi__peserta_')
alter table pdrd.prestasi
   drop constraint fk_prestasi_prestasi__peserta_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_pd') and o.name = 'fk_reg_pd_register__peserta_')
alter table pdrd.reg_pd
   drop constraint fk_reg_pd_register__peserta_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_ptk') and o.name = 'fk_reg_ptk_ptk_terda_sdm')
alter table pdrd.reg_ptk
   drop constraint fk_reg_ptk_ptk_terda_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_fungsional') and o.name = 'fk_rwy_fung_jab_fung__sdm')
alter table pdrd.rwy_fungsional
   drop constraint fk_rwy_fung_jab_fung__sdm
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
   where r.fkeyid = object_id('pdrd.sdm_anggota_litabmas') and o.name = 'fk_sdm_angg_ang_litab_sdm')
alter table pdrd.sdm_anggota_litabmas
   drop constraint fk_sdm_angg_ang_litab_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tugas_belajar') and o.name = 'fk_tugas_be_tugas_bel_sdm')
alter table pdrd.tugas_belajar
   drop constraint fk_tugas_be_tugas_bel_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tugas_tambahan') and o.name = 'fk_tugas_ta_tugtam_pt_sdm')
alter table pdrd.tugas_tambahan
   drop constraint fk_tugas_ta_tugtam_pt_sdm
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
   where r.fkeyid = object_id('pdrd.tulis_pub') and o.name = 'fk_tulis_pu_pd_ang_tu_peserta_')
alter table pdrd.tulis_pub
   drop constraint fk_tulis_pu_pd_ang_tu_peserta_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tulis_pub') and o.name = 'fk_tulis_pu_sdm_ang_t_sdm')
alter table pdrd.tulis_pub
   drop constraint fk_tulis_pu_sdm_ang_t_sdm
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
   where r.fkeyid = object_id('pdrd.visiting_scientist') and o.name = 'fk_visiting_ptk_visit_sdm')
alter table pdrd.visiting_scientist
   drop constraint fk_visiting_ptk_visit_sdm
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.anggota_aktivitas_mahasiswa')
            and   type = 'U')
   drop table pdrd.anggota_aktivitas_mahasiswa
go

alter table tracer.hasil_tracer_study
   drop constraint pk_hasil_tracer_study
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

alter table pdrd.peserta_didik
   drop constraint pk_peserta_didik
go

alter table pdrd.peserta_didik 
   drop constraint ckc_jk_peserta_
go

alter table pdrd.peserta_didik
   drop constraint ckc_a_terima_kps_peserta_
go

alter table pdrd.peserta_didik
   drop constraint ckc_soft_delete_peserta_
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_peserta_didik')
            and   type = 'U')
   drop table pdrd.tmp_peserta_didik
go

execute sp_rename 'pdrd.peserta_didik', tmp_peserta_didik
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

alter table man_akses.table_aplikasi
   drop constraint pk_table_aplikasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('man_akses.tmp_table_aplikasi')
            and   type = 'U')
   drop table man_akses.tmp_table_aplikasi
go

execute sp_rename 'man_akses.table_aplikasi', tmp_table_aplikasi
go

/*==============================================================*/
/* User: mbkm                                                   */
/*==============================================================*/
create schema mbkm
go

/*==============================================================*/
/* Table: akses_table_aplikasi                                  */
/*==============================================================*/
create table man_akses.akses_table_aplikasi (
   id_akses_table_app   uniqueidentifier     not null,
   id_table_app         uniqueidentifier     not null,
   id_aplikasi          uniqueidentifier     not null,
   a_boleh_get          numeric(1)           null default 0
      constraint ckc_a_boleh_get_akses_ta check (a_boleh_get is null or (a_boleh_get between 0 and 1 and a_boleh_get in (0,1))),
   a_boleh_insert       numeric(1)           null default 0
      constraint ckc_a_boleh_insert_akses_ta check (a_boleh_insert is null or (a_boleh_insert between 0 and 1 and a_boleh_insert in (0,1))),
   a_boleh_update       numeric(1)           null default 0
      constraint ckc_a_boleh_update_akses_ta check (a_boleh_update is null or (a_boleh_update between 0 and 1 and a_boleh_update in (0,1))),
   a_boleh_show         numeric(1)           null default 0
      constraint ckc_a_boleh_show_akses_ta check (a_boleh_show is null or (a_boleh_show between 0 and 1 and a_boleh_show in (0,1))),
   a_boleh_delete       numeric(1)           null default 0
      constraint ckc_a_boleh_delete_akses_ta check (a_boleh_delete is null or (a_boleh_delete between 0 and 1 and a_boleh_delete in (0,1))),
   a_aktif              numeric(1)           null default 1
      constraint ckc_a_aktif_akses_ta check (a_aktif is null or (a_aktif between 0 and 1 and a_aktif in (0,1))),
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_akses_ta check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   id_updater           uniqueidentifier     not null,
   constraint pk_akses_table_aplikasi primary key (id_akses_table_app)
)
go

/*==============================================================*/
/* Table: anggota_akt_mhs                                       */
/*==============================================================*/
create table pdrd.anggota_akt_mhs (
   id_ang_akt_mhs       uniqueidentifier     not null,
   id_akt_mhs           uniqueidentifier     not null,
   id_reg_pd            uniqueidentifier     not null,
   nm_pd                varchar(120)         not null,
   nipd                 varchar(24)          not null,
   jns_peran_mhs        char(1)              not null default '3'
      constraint ckc_jns_peran_mhs_anggota_ check (jns_peran_mhs in ('1','2','3')),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_ang_akt_mhs check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_anggota_akt_mhs primary key (id_ang_akt_mhs)
)
go

/*==============================================================*/
/* Table: bidang_pekerjaan                                      */
/*==============================================================*/
create table ref.bidang_pekerjaan (
   id_bid_kerja         numeric(2)           identity,
   nm_bid_kerja         varchar(120)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_bidang_pekerjaan primary key (id_bid_kerja)
)
go

/*==============================================================*/
/* Table: daftar_kampus_merdeka                                 */
/*==============================================================*/
create table mbkm.daftar_kampus_merdeka (
   id_daftar_kampus_merdeka uniqueidentifier     not null,
   id_periode_mbkm      uniqueidentifier     not null,
   id_reg_pd            uniqueidentifier     null,
   id_sp                uniqueidentifier     null,
   lokasi_mbkm          varchar(100)         null,
   nm_pd                varchar(120)         null,
   nipd                 varchar(24)          null,
   a_diluar_pt          numeric(1)           not null default 0
      constraint ckc_a_diluar_pt_daftar_k check (a_diluar_pt between 0 and 1 and a_diluar_pt in (0,1)),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_daftar_k check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_daftar_kampus_merdeka primary key (id_daftar_kampus_merdeka)
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

insert into tracer.hasil_tracer_study (id_hasil_tracer_study, id_thn_ajaran, id_wil, id_reg_pd, id_smt, wkt_pengisian, wkt_tunggu, status_lulusan, jns_tmpt_bekerja, nm_tmpt_bekerja, income_per_bln, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_hasil_tracer_study, id_thn_ajaran, id_wil, id_reg_pd, id_smt, wkt_pengisian, wkt_tunggu, status_lulusan, jns_tmpt_bekerja, nm_tmpt_bekerja, income_per_bln, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from tracer.tmp_hasil_tracer_study
go

if exists (select 1
            from  sysobjects
           where  id = object_id('tracer.tmp_hasil_tracer_study')
            and   type = 'U')
   drop table tracer.tmp_hasil_tracer_study
go

/*==============================================================*/
/* Table: jenis_jalur_pekerjaan                                 */
/*==============================================================*/
create table ref.jenis_jalur_pekerjaan (
   id_jns_jalur_kerja   numeric(2)           identity,
   nm_jns_jalur_kerja   varchar(80)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_jalur_pekerjaan primary key (id_jns_jalur_kerja)
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

insert into pdrd.kelas_kuliah (id_kls, id_smt, id_sms, id_mk, sks_mk, sks_tm, sks_prak, sks_prak_lap, sks_sim, nm_kls, bahasan_case, a_selenggara_pditt, a_pengguna_pditt, kuota_pditt, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_kls, id_smt, id_sms, id_mk, sks_mk, sks_tm, sks_prak, sks_prak_lap, sks_sim, nm_kls, bahasan_case, a_selenggara_pditt, a_pengguna_pditt, kuota_pditt, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_kelas_kuliah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_kelas_kuliah')
            and   type = 'U')
   drop table pdrd.tmp_kelas_kuliah
go

/*==============================================================*/
/* Table: konversi_kampus_merdeka                               */
/*==============================================================*/
create table mbkm.konversi_kampus_merdeka (
   id_konversi_aktivitas uniqueidentifier     not null,
   id_mk                uniqueidentifier     not null,
   id_ang_akt_mhs       uniqueidentifier     null,
   id_akt_mhs           uniqueidentifier     not null,
   id_daftar_kampus_merdeka uniqueidentifier     null,
   nilai_angka          numeric(4,1)         null,
   nilai_huruf          char(3)              null,
   nilai_indeks         numeric(4,2)         null,
   sks_mk               numeric(5,2)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_konversi check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_konversi_kampus_merdeka primary key (id_konversi_aktivitas)
)
go

/*==============================================================*/
/* Table: log_book_mbkm                                         */
/*==============================================================*/
create table mbkm.log_book_mbkm (
   id_log_book_mbkm     uniqueidentifier     not null,
   id_mk_konversi       uniqueidentifier     not null,
   nm_verifikator       varchar(200)         null,
   wkt_selesai_ver      datetime             null,
   ket_periksa          varchar(500)         null,
   judul_log_book       varchar(100)         not null,
   aktivitas_kegiatan   varchar(500)         not null,
   lokasi_kegiatan      varchar(80)          null,
   tgl_kegiatan         datetime             not null,
   stat_ajuan           char(1)              null default '0'
      constraint ckc_stat_ajuan_log_book check (stat_ajuan is null or (stat_ajuan in ('0','1','2','3','4'))),
   wkt_ajuan            datetime             null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_log_book check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_log_book_mbkm primary key (id_log_book_mbkm)
)
go

/*==============================================================*/
/* Table: mk_konversi                                           */
/*==============================================================*/
create table mbkm.mk_konversi (
   id_mk_konversi       uniqueidentifier     not null,
   id_sp                uniqueidentifier     null,
   id_daftar_kampus_merdeka uniqueidentifier     not null,
   nm_verifikator       varchar(200)         null,
   wkt_selesai_ver      datetime             null,
   ket_periksa          varchar(500)         null,
   nm_mk                varchar(120)         null,
   kode_mk              varchar(20)          null,
   sks_mk               numeric(5,2)         null,
   stat_ajuan           char(1)              not null default '0'
      constraint ckc_stat_ajuan_mk_konve check (stat_ajuan in ('0','1','2','3','4')),
   wkt_ajuan            datetime             not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_mk_konve check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_mk_konversi primary key (id_mk_konversi)
)
go

/*==============================================================*/
/* Table: periode_kampus_merdeka                                */
/*==============================================================*/
create table mbkm.periode_kampus_merdeka (
   id_periode_mbkm      uniqueidentifier     not null,
   id_smt               char(5)              not null,
   id_jns_akt_mhs       numeric(2)           not null,
   nm_periode_mbkm      varchar(120)         not null,
   nm_penyelenggara     varchar(100)         null,
   waktu_mulai          varchar(5)           null,
   waktu_selesai        varchar(5)           null,
   a_aktif              numeric(1)           null default 1
      constraint ckc_a_aktif_periode_ check (a_aktif is null or (a_aktif between 0 and 1 and a_aktif in (0,1))),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_periode_ check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_periode_kampus_merdeka primary key (id_periode_mbkm)
)
go

/*==============================================================*/
/* Table: peserta_didik                                         */
/*==============================================================*/
create table pdrd.peserta_didik (
   id_pd                uniqueidentifier     not null,
   nm_pd                varchar(120)         not null,
   jk                   char(1)              null 
      constraint ckc_jk_peserta_ check (jk is null or (jk in ('L','P','*'))),
   nisn                 char(10)             null,
   nik                  char(20)             null,
   tmpt_lahir           varchar(32)          not null,
   tgl_lahir            date                 null,
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          null,
   kode_pos             char(5)              null,
   tlpn_rumah           varchar(20)          null,
   tlpn_hp              varchar(20)          null,
   email                varchar(60)          null,
   nm_wali              varchar(100)         null,
   tgl_lahir_wali       date                 null,
   id_pendidikan_wali   numeric(2)           null,
   id_pekerjaan_wali    int                  null,
   id_penghasilan_wali  int                  null,
   nm_ayah              varchar(100)         null,
   tgl_lahir_ayah       date                 null,
   nik_ayah             char(20)             null,
   id_pendidikan_ayah   numeric(2)           null,
   id_pekerjaan_ayah    int                  null,
   id_penghasilan_ayah  int                  null,
   id_kk_ayah           int                  null,
   nm_ibu_kandung       varchar(100)         null,
   tgl_lahir_ibu        date                 null,
   nik_ibu              char(20)             null,
   id_pendidikan_ibu    numeric(2)           null,
   id_pekerjaan_ibu     int                  null,
   id_penghasilan_ibu   int                  null,
   id_kk_ibu            int                  null,
   a_terima_kps         numeric(1)           not null default 0
      constraint ckc_a_terima_kps_peserta_ check (a_terima_kps between 0 and 1 and a_terima_kps in (0,1)),
   no_kps               varchar(40)          null,
   id_kk                int                  null,
   id_kewarganegaraan   char(2)              not null,
   id_agama             smallint             not null,
   id_blob              uniqueidentifier     null,
   id_jns_tinggal       numeric(2)           null,
   id_stat_mhs          char(1)              not null,
   id_alat_transport    numeric(2)           null,
   id_wil               char(8)              null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_peserta_ check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_peserta_didik primary key (id_pd)
)
go

insert into pdrd.peserta_didik (id_pd, nm_pd, jk, nisn, nik, tmpt_lahir, tgl_lahir, jln, rt, rw, nm_dsn, ds_kel, kode_pos, tlpn_rumah, tlpn_hp, nm_wali, tgl_lahir_wali, id_pendidikan_wali, id_pekerjaan_wali, id_penghasilan_wali, nm_ayah, tgl_lahir_ayah, nik_ayah, id_pendidikan_ayah, id_pekerjaan_ayah, id_penghasilan_ayah, id_kk_ayah, nm_ibu_kandung, tgl_lahir_ibu, nik_ibu, id_pendidikan_ibu, id_pekerjaan_ibu, id_penghasilan_ibu, id_kk_ibu, a_terima_kps, no_kps, id_kk, id_kewarganegaraan, id_agama, id_blob, id_jns_tinggal, id_stat_mhs, id_alat_transport, id_wil, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_pd, nm_pd, jk, nisn, nik, tmpt_lahir, tgl_lahir, jln, rt, rw, nm_dsn, ds_kel, kode_pos, tlpn_rumah, tlpn_hp, nm_wali, tgl_lahir_wali, id_pendidikan_wali, id_pekerjaan_wali, id_penghasilan_wali, nm_ayah, tgl_lahir_ayah, nik_ayah, id_pendidikan_ayah, id_pekerjaan_ayah, id_penghasilan_ayah, id_kk_ayah, nm_ibu_kandung, tgl_lahir_ibu, nik_ibu, id_pendidikan_ibu, id_pekerjaan_ibu, id_penghasilan_ibu, id_kk_ibu, a_terima_kps, no_kps, id_kk, id_kewarganegaraan, id_agama, id_blob, id_jns_tinggal, id_stat_mhs, id_alat_transport, id_wil, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_peserta_didik
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_peserta_didik')
            and   type = 'U')
   drop table pdrd.tmp_peserta_didik
go

/*==============================================================*/
/* Table: rwy_gaji_berkala                                      */
/*==============================================================*/
create table keuangan.rwy_gaji_berkala (
   id_rwy_gaji_berkala  uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_pangkat_gol       numeric(2)           null,
   sk_gaji_berkala      varchar(80)          null,
   tgl_sk_gaji_berkala  datetime             null,
   tmt_kgb              datetime             null,
   masa_kerja_thn       numeric(2)           null,
   masa_kerja_bln       numeric(2)           null,
   gaji_pokok           numeric(16,2)        not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_rwy_gaji check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_rwy_gaji_berkala primary key (id_rwy_gaji_berkala)
)
go

/*==============================================================*/
/* Table: sdm                                                   */
/*==============================================================*/
create table pdrd.sdm (
   id_sdm               uniqueidentifier     not null,
   id_sumber_gaji       numeric(2)           null,
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

insert into pdrd.sdm (id_sdm, nm_sdm, jk, tmpt_lahir, tgl_lahir, nik, niy_nigk, nuptk, nidn, nsdmi, stat_kawin, no_tel_rmh, no_hp, email, nip, tmt_pns, nm_suami_istri, nip_suami_istri, sk_cpns, tgl_sk_cpns, sk_angkat, tmt_sk_angkat, npwp, nm_wp, stat_data, akta_ijin_ajar, nira, kewarganegaraan, id_jns_sdm, id_wil, id_stat_aktif, id_agama, id_keahlian_lab, id_pekerjaan_suami_istri, id_lemb_angkat, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_sdm, nm_sdm, jk, tmpt_lahir, tgl_lahir, nik, niy_nigk, nuptk, nidn, nsdmi, stat_kawin, no_tel_rmh, no_hp, email, nip, tmt_pns, nm_suami_istri, nip_suami_istri, sk_cpns, tgl_sk_cpns, sk_angkat, tmt_sk_angkat, npwp, nm_wp, stat_data, akta_ijin_ajar, nira, kewarganegaraan, id_jns_sdm, id_wil, id_stat_aktif, id_agama, id_keahlian_lab, id_pekerjaan_suami_istri, id_lemb_angkat, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_sdm
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_sdm')
            and   type = 'U')
   drop table pdrd.tmp_sdm
go

/*==============================================================*/
/* Table: sumber_air                                            */
/*==============================================================*/
create table ref.sumber_air (
   id_sumber_air        numeric(2)           not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   nm_sumber_air        varchar(50)          not null,
   constraint pk_sumber_air primary key (id_sumber_air)
)
go

/*==============================================================*/
/* Table: sumber_gaji                                           */
/*==============================================================*/
create table ref.sumber_gaji (
   id_sumber_gaji       numeric(2)           not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   nm_sumber_gaji       varchar(50)          not null,
   constraint pk_sumber_gaji primary key (id_sumber_gaji)
)
go

/*==============================================================*/
/* Table: sumber_listrik                                        */
/*==============================================================*/
create table ref.sumber_listrik (
   id_sumber_listrik    numeric(2)           not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   nm_sumber_listrik    varchar(50)          not null,
   constraint pk_sumber_listrik primary key (id_sumber_listrik)
)
go

/*==============================================================*/
/* Table: table_aplikasi                                        */
/*==============================================================*/
create table man_akses.table_aplikasi (
   id_table_app         uniqueidentifier     not null,
   skema_tbl            varchar(100)         not null,
   nm_tbl               varchar(100)         not null,
   tabel_alias          varchar(100)         null,
   kode_primary         varchar(100)         null,
   sync_type            char(1)              null,
   sync_seq             numeric(4)           not null,
   kolom_kecuali        varchar(200)         null,
   table_status         smallint             null,
   table_ket            varchar(100)         null,
   jml_thread           smallint             null,
   baris_per_thread     int                  null,
   order_ekstra         varchar(100)         null,
   a_table_aktif        numeric(1)           not null default 0
      constraint ckc_a_table_aktif_table_ap check (a_table_aktif between 0 and 1 and a_table_aktif in (0,1)),
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_table_aplikasi primary key (id_table_app)
)
go

if exists (select 1
            from  sysobjects
           where  id = object_id('man_akses.tmp_table_aplikasi')
            and   type = 'U')
   drop table man_akses.tmp_table_aplikasi
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

alter table man_akses.akses_table_aplikasi
   add constraint fk_akses_ta_dtl_akses_aplikasi foreign key (id_aplikasi)
      references man_akses.aplikasi (id_aplikasi)
go

alter table man_akses.akses_table_aplikasi
   add constraint fk_akses_ta_dtl_table_table_ap foreign key (id_table_app)
      references man_akses.table_aplikasi (id_table_app)
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_pengambil_kelas_ku foreign key (id_kls)
      references pdrd.kelas_kuliah (id_kls)
go

alter table sarpras.alat
   add constraint fk_alat_alat_ptk2_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.anak
   add constraint fk_anak_anak_sdm_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.anggota_akt_mhs
   add constraint fk_anggota__akt_mhs_a_akt_mhs foreign key (id_akt_mhs)
      references pdrd.akt_mhs (id_akt_mhs)
go

alter table pdrd.anggota_akt_mhs
   add constraint fk_anggota__reg_ang_a_reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
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
   add constraint fk_angkutan_alat_ptk_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table beasiswa.beasiswa_sdm
   add constraint fk_beasiswa_beasiswa__sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.bimbing_mhs
   add constraint fk_bimbing__dosen_pem_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table mbkm.daftar_kampus_merdeka
   add constraint fk_daftar_k_asal_pt_m_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table mbkm.daftar_kampus_merdeka
   add constraint fk_daftar_k_periode_d_periode_ foreign key (id_periode_mbkm)
      references mbkm.periode_kampus_merdeka (id_periode_mbkm)
go

alter table mbkm.daftar_kampus_merdeka
   add constraint fk_daftar_k_reg_pd_da_reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
go

alter table pdrd.detasering
   add constraint fk_detaseri_ptk_detas_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.diklat
   add constraint fk_diklat_diklat_pt_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table dok.foto_peserta_didik
   add constraint fk_foto_pes_pemilik_f_peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
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

alter table pdrd.jadwal_kelas
   add constraint fk_jadwal_k_jdwl_kls_kelas_ku foreign key (id_kls)
      references pdrd.kelas_kuliah (id_kls)
go

alter table presensi.kehadiran_mhs
   add constraint fk_kehadira_hadir_mhs_kelas_ku foreign key (id_kls)
      references pdrd.kelas_kuliah (id_kls)
go

alter table presensi.kehadiran_sdm
   add constraint fk_kehadira_hadir_sdm_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
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

alter table pdrd.kesejahteraan
   add constraint fk_kesejaht_kesejahte_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table mbkm.konversi_kampus_merdeka
   add constraint fk_konversi_akt_konve_akt_mhs foreign key (id_akt_mhs)
      references pdrd.akt_mhs (id_akt_mhs)
go

alter table mbkm.konversi_kampus_merdeka
   add constraint fk_konversi_hasil_kon_daftar_k foreign key (id_daftar_kampus_merdeka)
      references mbkm.daftar_kampus_merdeka (id_daftar_kampus_merdeka)
go

alter table mbkm.konversi_kampus_merdeka
   add constraint fk_konversi_konversi__anggota_ foreign key (id_ang_akt_mhs)
      references pdrd.anggota_akt_mhs (id_ang_akt_mhs)
go

alter table mbkm.konversi_kampus_merdeka
   add constraint fk_konversi_konversi__matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
go

alter table mbkm.log_book_mbkm
   add constraint fk_log_book_log_book__mk_konve foreign key (id_mk_konversi)
      references mbkm.mk_konversi (id_mk_konversi)
go

alter table logger.log_table_app
   add constraint fk_log_tabl_log_detai_table_ap foreign key (id_table_app)
      references man_akses.table_aplikasi (id_table_app)
go

alter table mbkm.mk_konversi
   add constraint fk_mk_konve_daftar_ko_daftar_k foreign key (id_daftar_kampus_merdeka)
      references mbkm.daftar_kampus_merdeka (id_daftar_kampus_merdeka)
go

alter table mbkm.mk_konversi
   add constraint fk_mk_konve_sp_asal_m_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.nilai_smt_mhs
   add constraint fk_nilai_sm_kls_nilai_kelas_ku foreign key (id_kls)
      references pdrd.kelas_kuliah (id_kls)
go

alter table pdrd.nilai_tes
   add constraint fk_nilai_te_nilai_tes_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.pd_anggota_litabmas
   add constraint fk_pd_anggo_ang_litab_peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
go

alter table pdrd.pembicara
   add constraint fk_pembicar_pembicata_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table man_akses.pengaturan_table_aplikasi
   add constraint fk_pengatur_setting_t_table_ap foreign key (id_table_app)
      references man_akses.table_aplikasi (id_table_app)
go

alter table pdrd.pengelola_jurnal
   add constraint fk_pengelol_kelola_ju_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.penghargaan
   add constraint fk_pengharg_pengharga_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table mbkm.periode_kampus_merdeka
   add constraint fk_periode__jns_akt_m_jenis_ak foreign key (id_jns_akt_mhs)
      references ref.jenis_akt_mhs (id_jns_akt_mhs)
go

alter table mbkm.periode_kampus_merdeka
   add constraint fk_periode__smt_perio_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__agama_pd_agama foreign key (id_agama)
      references ref.agama (id_agama)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__alat_tran_alat_tra foreign key (id_alat_transport)
      references sarpras.alat_transportasi (id_alat_transport)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__foto_pd_large_ob foreign key (id_blob)
      references dok.large_object (id_blob)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__jenis_tin_jenis_ti foreign key (id_jns_tinggal)
      references ref.jenis_tinggal (id_jns_tinggal)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__kebutuhan_kebutuha foreign key (id_kk_ayah)
      references ref.kebutuhan_khusus (id_kk)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta_kk_ibu foreign key (id_kk_ibu)
      references ref.kebutuhan_khusus (id_kk)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta_kk_pd foreign key (id_kk)
      references ref.kebutuhan_khusus (id_kk)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__kewargane_negara foreign key (id_kewarganegaraan)
      references ref.negara (id_negara)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__pekerjaan_pekerjaa foreign key (id_pekerjaan_ayah)
      references ref.pekerjaan (id_pekerjaan)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__pekerjaan_ibu foreign key (id_pekerjaan_ibu)
      references ref.pekerjaan (id_pekerjaan)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__pekerjaan_wali foreign key (id_pekerjaan_wali)
      references ref.pekerjaan (id_pekerjaan)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__pendidika_ayah foreign key (id_pendidikan_ayah)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__pendidikan_ibu foreign key (id_pendidikan_ibu)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__pendidika_wali foreign key (id_pendidikan_wali)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__penghasil_ayah foreign key (id_penghasilan_ayah)
      references ref.penghasilan (id_penghasilan)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__penghasil_ibu foreign key (id_penghasilan_ibu)
      references ref.penghasilan (id_penghasilan)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__penghasil_wali foreign key (id_penghasilan_wali)
      references ref.penghasilan (id_penghasilan)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__provinsi__wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__status_ke_status_m foreign key (id_stat_mhs)
      references ref.status_mahasiswa (id_stat_mhs)
go

alter table pdrd.prestasi
   add constraint fk_prestasi_prestasi__peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_register__peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
go

alter table pdrd.reg_ptk
   add constraint fk_reg_ptk_ptk_terda_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_fungsional
   add constraint fk_rwy_fung_jab_fung__sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table keuangan.rwy_gaji_berkala
   add constraint fk_rwy_gaji_pangkat_g_pangkat_ foreign key (id_pangkat_gol)
      references ref.pangkat_golongan (id_pangkat_gol)
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

alter table pdrd.tugas_belajar
   add constraint fk_tugas_be_tugas_bel_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.tugas_tambahan
   add constraint fk_tugas_ta_tugtam_pt_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.tulis_buku_ajar
   add constraint fk_tulis_bu_pd_ang_tu_peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
go

alter table pdrd.tulis_buku_ajar
   add constraint fk_tulis_bu_sdm_ang_t_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.tulis_pub
   add constraint fk_tulis_pu_pd_ang_tu_peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
go

alter table pdrd.tulis_pub
   add constraint fk_tulis_pu_sdm_ang_t_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
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

INSERT INTO man_akses.versi_db (versi,tgl_update) VALUES ('0.4.0',GETDATE());
INSERT INTO ref.jenis_jalur_pekerjaan (nm_jns_jalur_kerja,create_date,last_update,last_sync) VALUES ('Melalui iklan di koran/majalah, brosur',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.jenis_jalur_pekerjaan (nm_jns_jalur_kerja,create_date,last_update,last_sync) VALUES ('Melamar keperusahaan tanpa mengetahui lowongan yang ada',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.jenis_jalur_pekerjaan (nm_jns_jalur_kerja,create_date,last_update,last_sync) VALUES ('Pergi ke bursa/pameran kerja',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.jenis_jalur_pekerjaan (nm_jns_jalur_kerja,create_date,last_update,last_sync) VALUES ('Mencari lewat internet/iklan online/milis',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.jenis_jalur_pekerjaan (nm_jns_jalur_kerja,create_date,last_update,last_sync) VALUES ('Dihubungi oleh perusahaan',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.jenis_jalur_pekerjaan (nm_jns_jalur_kerja,create_date,last_update,last_sync) VALUES ('Menghubungi Kemenakertrans',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.jenis_jalur_pekerjaan (nm_jns_jalur_kerja,create_date,last_update,last_sync) VALUES ('Menghubungi agen tenaga kerja komersial/swasta',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.jenis_jalur_pekerjaan (nm_jns_jalur_kerja,create_date,last_update,last_sync) VALUES ('Memeroleh informasi dari pusat/kantor pengembangan karir fakultas/universitas',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.jenis_jalur_pekerjaan (nm_jns_jalur_kerja,create_date,last_update,last_sync) VALUES ('Menghubungi kantor kemahasiswaan/hubungan alumni',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.jenis_jalur_pekerjaan (nm_jns_jalur_kerja,create_date,last_update,last_sync) VALUES ('Membangun jejaring (network) sejak masih kuliah',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.jenis_jalur_pekerjaan (nm_jns_jalur_kerja,create_date,last_update,last_sync) VALUES ('Melalui relasi (misalnya dosen, orang tua, saudara, teman, dll)',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.jenis_jalur_pekerjaan (nm_jns_jalur_kerja,create_date,last_update,last_sync) VALUES ('Melalui penempatan kerja atau magang',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.jenis_jalur_pekerjaan (nm_jns_jalur_kerja,create_date,last_update,last_sync) VALUES ('Bekerja ditempat yang sama dengan tempat kerja semasa kuliah',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Kegiatan Badan Internasional dan Badan Ekstra Internasional',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Pengadaan air, Pengelolaan Sampah dan Daur Ulang, Pembuangan dan Pembersihan Limbah dan Sampah',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Pertambangan dan Penggalian',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Jasa Perorangan yang Melayani Rumah Tangga',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Jasa Profesional, Ilmiah dan Teknis',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Kebudayaan Hiburan dan Rekreasi',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Jasa Persewaan, Ketenagakerjaan, Agen Perjalanan dan Penunjang Usaha Lainnya',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Real Estat ',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Transportasi dan Pergudangan',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Informasi dan Komunikasi',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Pengadaan Listrik, Gas, Uap/Air Panas dan Udara Dingin',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Industri Pengolahan',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Penyediaan Akomodasi dan Penyediaan Makan dan Minum',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Administrasi Pemerintahan, Pertahanan, dan Jaminan Sosial Wajib ',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Kegiatan Jasa Lainnya',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Pertanian, Kehutanan, Perikanan',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Jasa Kesehatan dan Kegiatan Sosial',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Konstruksi',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Perdagangan Besar dan Eceran, Reparasi dan Perawatan Mobil dan Sepeda Motor',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Jasa Keuangan dan Asuransi',GETDATE(),GETDATE(),GETDATE());
INSERT INTO ref.bidang_pekerjaan (nm_bid_kerja,create_date,last_update,last_sync) VALUES ('Jasa Pendidikan',GETDATE(),GETDATE(),GETDATE());