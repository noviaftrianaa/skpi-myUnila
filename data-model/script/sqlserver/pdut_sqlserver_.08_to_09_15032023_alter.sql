/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     15/03/2023 22:37:50                          */
/*==============================================================*/


if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akred_sp') and o.name = 'fk_akred_sp_akred_sp__lembaga_')
alter table pdrd.akred_sp
   drop constraint fk_akred_sp_akred_sp__lembaga_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akred_sp') and o.name = 'fk_akred_sp_akred_sp_satuan_p')
alter table pdrd.akred_sp
   drop constraint fk_akred_sp_akred_sp_satuan_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akred_sp') and o.name = 'fk_akred_sp_sp_akred__nilai_ak')
alter table pdrd.akred_sp
   drop constraint fk_akred_sp_sp_akred__nilai_ak
go

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
   where r.fkeyid = object_id('pdrd.akt_ajar_dosen') and o.name = 'fk_akt_ajar_ajar_katg_kategori')
alter table pdrd.akt_ajar_dosen
   drop constraint fk_akt_ajar_ajar_katg_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_ajar_dosen') and o.name = 'fk_akt_ajar_katgiat_a_kategori')
alter table pdrd.akt_ajar_dosen
   drop constraint fk_akt_ajar_katgiat_a_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_ajar_dosen') and o.name = 'fk_akt_ajar_pengajara_jenis_ev')
alter table pdrd.akt_ajar_dosen
   drop constraint fk_akt_ajar_pengajara_jenis_ev
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_ajar_dosen') and o.name = 'fk_akt_ajar_ptk_penga_reg_ptk')
alter table pdrd.akt_ajar_dosen
   drop constraint fk_akt_ajar_ptk_penga_reg_ptk
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_mhs') and o.name = 'fk_akt_mhs_jenis_akt_jenis_ak')
alter table pdrd.akt_mhs
   drop constraint fk_akt_mhs_jenis_akt_jenis_ak
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_mhs') and o.name = 'fk_akt_mhs_prodi_akt_sms')
alter table pdrd.akt_mhs
   drop constraint fk_akt_mhs_prodi_akt_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.akt_mhs') and o.name = 'fk_akt_mhs_smt_akt_m_semester')
alter table pdrd.akt_mhs
   drop constraint fk_akt_mhs_smt_akt_m_semester
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
   where r.fkeyid = object_id('sarpras.alat') and o.name = 'fk_alat_hapus_buk_jenis_ha')
alter table sarpras.alat
   drop constraint fk_alat_hapus_buk_jenis_ha
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.alat') and o.name = 'fk_alat_jenis_sar_jenis_sa')
alter table sarpras.alat
   drop constraint fk_alat_jenis_sar_jenis_sa
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.alat') and o.name = 'fk_alat_status_mi_status_m')
alter table sarpras.alat
   drop constraint fk_alat_status_mi_status_m
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.alat_long') and o.name = 'fk_alat_lon_smt_pemak_semester')
alter table sarpras.alat_long
   drop constraint fk_alat_lon_smt_pemak_semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.anak') and o.name = 'fk_anak_anak_sdm_sdm')
alter table pdrd.anak
   drop constraint fk_anak_anak_sdm_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.anak') and o.name = 'fk_anak_anak_stat_status_a')
alter table pdrd.anak
   drop constraint fk_anak_anak_stat_status_a
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.anak') and o.name = 'fk_anak_jenjang_a_jenjang_')
alter table pdrd.anak
   drop constraint fk_anak_jenjang_a_jenjang_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.anggota_akt_mhs') and o.name = 'fk_anggota__akt_mhs_a_akt_mhs')
alter table pdrd.anggota_akt_mhs
   drop constraint fk_anggota__akt_mhs_a_akt_mhs
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.anggota_orgprof') and o.name = 'fk_anggota__orgprof_k_kategori')
alter table pdrd.anggota_orgprof
   drop constraint fk_anggota__orgprof_k_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.anggota_orgprof') and o.name = 'fk_anggota__orgprof_p_sdm')
alter table pdrd.anggota_orgprof
   drop constraint fk_anggota__orgprof_p_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.anggota_panitia') and o.name = 'fk_anggota__panitia_k_kategori')
alter table pdrd.anggota_panitia
   drop constraint fk_anggota__panitia_k_kategori
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
   where r.fkeyid = object_id('sarpras.angkutan') and o.name = 'fk_angkutan_hapus_buk_jenis_ha')
alter table sarpras.angkutan
   drop constraint fk_angkutan_hapus_buk_jenis_ha
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.angkutan') and o.name = 'fk_angkutan_jenis_sar_jenis_sa')
alter table sarpras.angkutan
   drop constraint fk_angkutan_jenis_sar_jenis_sa
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.angkutan') and o.name = 'fk_angkutan_status_mi_status_m')
alter table sarpras.angkutan
   drop constraint fk_angkutan_status_mi_status_m
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.bangunan') and o.name = 'fk_bangunan_hapus_buk_jenis_ha')
alter table sarpras.bangunan
   drop constraint fk_bangunan_hapus_buk_jenis_ha
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.bangunan') and o.name = 'fk_bangunan_jns_prasa_jenis_pr')
alter table sarpras.bangunan
   drop constraint fk_bangunan_jns_prasa_jenis_pr
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.bangunan') and o.name = 'fk_bangunan_satuan_ba_satuan')
alter table sarpras.bangunan
   drop constraint fk_bangunan_satuan_ba_satuan
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.bangunan') and o.name = 'fk_bangunan_sms_pemil_sms')
alter table sarpras.bangunan
   drop constraint fk_bangunan_sms_pemil_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.bangunan') and o.name = 'fk_bangunan_status_mi_status_m')
alter table sarpras.bangunan
   drop constraint fk_bangunan_status_mi_status_m
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('beasiswa.beasiswa_sdm') and o.name = 'fk_beasiswa_beasiswa__jenis_be')
alter table beasiswa.beasiswa_sdm
   drop constraint fk_beasiswa_beasiswa__jenis_be
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
   where r.fkeyid = object_id('keuangan.biaya_operasional') and o.name = 'fk_biaya_op_jenis_bia_jenis_ke')
alter table keuangan.biaya_operasional
   drop constraint fk_biaya_op_jenis_bia_jenis_ke
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
   where r.fkeyid = object_id('ref.bidang_studi') and o.name = 'fk_bidang_s_kelompok_bidang_s')
alter table ref.bidang_studi
   drop constraint fk_bidang_s_kelompok_bidang_s
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.bimbing_dosen') and o.name = 'fk_bimbing__bimbdosen_kategori')
alter table pdrd.bimbing_dosen
   drop constraint fk_bimbing__bimbdosen_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.bimbing_mhs') and o.name = 'fk_bimbing__aktmhs_bi_akt_mhs')
alter table pdrd.bimbing_mhs
   drop constraint fk_bimbing__aktmhs_bi_akt_mhs
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.bimbing_mhs') and o.name = 'fk_bimbing__bimbingmh_kategori')
alter table pdrd.bimbing_mhs
   drop constraint fk_bimbing__bimbingmh_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.bimbing_mhs') and o.name = 'fk_bimbing__dosen_pem_sdm')
alter table pdrd.bimbing_mhs
   drop constraint fk_bimbing__dosen_pem_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.buku_ajar') and o.name = 'fk_buku_aja_capaian_b_kategori')
alter table pdrd.buku_ajar
   drop constraint fk_buku_aja_capaian_b_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.buku_ajar') and o.name = 'fk_buku_aja_jenis_buk_jenis_ba')
alter table pdrd.buku_ajar
   drop constraint fk_buku_aja_jenis_buk_jenis_ba
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('mbkm.daftar_kampus_merdeka') and o.name = 'fk_daftar_k_asal_pt_m_satuan_p')
alter table mbkm.daftar_kampus_merdeka
   drop constraint fk_daftar_k_asal_pt_m_satuan_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pmb.daya_tampung') and o.name = 'fk_daya_tam_daya_tamp_sms')
alter table pmb.daya_tampung
   drop constraint fk_daya_tam_daya_tamp_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pmb.daya_tampung') and o.name = 'fk_daya_tam_smt_daya__semester')
alter table pmb.daya_tampung
   drop constraint fk_daya_tam_smt_daya__semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_1') and o.name = 'fk_detail_i_iku1_per__sms')
alter table dashboard.detail_iku_1
   drop constraint fk_detail_i_iku1_per__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_1') and o.name = 'fk_detail_i_iku1_per__tahun_an')
alter table dashboard.detail_iku_1
   drop constraint fk_detail_i_iku1_per__tahun_an
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_2') and o.name = 'fk_detail_i_iku2_per__sms')
alter table dashboard.detail_iku_2
   drop constraint fk_detail_i_iku2_per__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_2') and o.name = 'fk_detail_i_iku2_per__tahun_an')
alter table dashboard.detail_iku_2
   drop constraint fk_detail_i_iku2_per__tahun_an
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_3') and o.name = 'fk_detail_i_iku3_per__sms')
alter table dashboard.detail_iku_3
   drop constraint fk_detail_i_iku3_per__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_3') and o.name = 'fk_detail_i_iku3_per__tahun_an')
alter table dashboard.detail_iku_3
   drop constraint fk_detail_i_iku3_per__tahun_an
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_4') and o.name = 'fk_detail_i_iku4_per__sms')
alter table dashboard.detail_iku_4
   drop constraint fk_detail_i_iku4_per__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_4') and o.name = 'fk_detail_i_iku4_per__tahun_an')
alter table dashboard.detail_iku_4
   drop constraint fk_detail_i_iku4_per__tahun_an
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_5') and o.name = 'fk_detail_i_iku5_per__sms')
alter table dashboard.detail_iku_5
   drop constraint fk_detail_i_iku5_per__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_5') and o.name = 'fk_detail_i_iku5_per__tahun_an')
alter table dashboard.detail_iku_5
   drop constraint fk_detail_i_iku5_per__tahun_an
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_7') and o.name = 'fk_detail_i_iku7_per__sms')
alter table dashboard.detail_iku_7
   drop constraint fk_detail_i_iku7_per__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.detail_iku_7') and o.name = 'fk_detail_i_iku7_per__tahun_an')
alter table dashboard.detail_iku_7
   drop constraint fk_detail_i_iku7_per__tahun_an
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.detasering') and o.name = 'fk_detaseri_detas_kat_kategori')
alter table pdrd.detasering
   drop constraint fk_detaseri_detas_kat_kategori
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
   where r.fkeyid = object_id('pdrd.diklat') and o.name = 'fk_diklat_diklat_ka_kategori')
alter table pdrd.diklat
   drop constraint fk_diklat_diklat_ka_kategori
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
   where r.fkeyid = object_id('dok.dok_akt_mhs') and o.name = 'fk_dok_akt__akt_mhs_d_akt_mhs')
alter table dok.dok_akt_mhs
   drop constraint fk_dok_akt__akt_mhs_d_akt_mhs
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dok_diklat') and o.name = 'fk_dok_dikl_diklat_do_diklat')
alter table dok.dok_diklat
   drop constraint fk_dok_dikl_diklat_do_diklat
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dok_nilai_tes') and o.name = 'fk_dok_nila_nilaites__nilai_te')
alter table dok.dok_nilai_tes
   drop constraint fk_dok_nila_nilaites__nilai_te
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.dokumen') and o.name = 'fk_dokumen_jenis_dok_jenis_do')
alter table dok.dokumen
   drop constraint fk_dokumen_jenis_dok_jenis_do
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.dudi') and o.name = 'fk_dudi_dudi_bu_bidang_u')
alter table pdrd.dudi
   drop constraint fk_dudi_dudi_bu_bidang_u
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.dudi') and o.name = 'fk_dudi_wil_dudi_wilayah')
alter table pdrd.dudi
   drop constraint fk_dudi_wil_dudi_wilayah
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dok.foto_peserta_didik') and o.name = 'fk_foto_pes_pemilik_f_peserta_')
alter table dok.foto_peserta_didik
   drop constraint fk_foto_pes_pemilik_f_peserta_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('tracer.hasil_tracer_atasan') and o.name = 'fk_hasil_tr_negara_at_negara')
alter table tracer.hasil_tracer_atasan
   drop constraint fk_hasil_tr_negara_at_negara
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('tracer.hasil_tracer_atasan') and o.name = 'fk_hasil_tr_prov_atas_wilayah')
alter table tracer.hasil_tracer_atasan
   drop constraint fk_hasil_tr_prov_atas_wilayah
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
   where r.fkeyid = object_id('indikator_spmi') and o.name = 'fk_indikato_jenjang_i_jenjang_')
alter table indikator_spmi
   drop constraint fk_indikato_jenjang_i_jenjang_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.inpassing') and o.name = 'fk_inpassin_inpassing_pangkat_')
alter table pdrd.inpassing
   drop constraint fk_inpassin_inpassing_pangkat_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.inpassing') and o.name = 'fk_inpassin_inpassing_sdm')
alter table pdrd.inpassing
   drop constraint fk_inpassin_inpassing_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.jab_tgs') and o.name = 'fk_jab_tgs_tugtam_pr_kelompok')
alter table ref.jab_tgs
   drop constraint fk_jab_tgs_tugtam_pr_kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.jabfung') and o.name = 'fk_jabfung_jabfung_p_kelompok')
alter table ref.jabfung
   drop constraint fk_jabfung_jabfung_p_kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.jadwal_kelas') and o.name = 'fk_jadwal_k_jdwl_kls__semester')
alter table pdrd.jadwal_kelas
   drop constraint fk_jadwal_k_jdwl_kls__semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.jenis_beasiswa') and o.name = 'fk_jenis_be_sumber_be_sumber_d')
alter table ref.jenis_beasiswa
   drop constraint fk_jenis_be_sumber_be_sumber_d
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.jurusan') and o.name = 'fk_jurusan_bid_jur_kelompok')
alter table ref.jurusan
   drop constraint fk_jurusan_bid_jur_kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.jurusan') and o.name = 'fk_jurusan_induk_pro_jurusan')
alter table ref.jurusan
   drop constraint fk_jurusan_induk_pro_jurusan
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.jurusan') and o.name = 'fk_jurusan_jur_std_j_jenjang_')
alter table ref.jurusan
   drop constraint fk_jurusan_jur_std_j_jenjang_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.kategori_kegiatan') and o.name = 'fk_kategori_induk_kat_kategori')
alter table ref.kategori_kegiatan
   drop constraint fk_kategori_induk_kat_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.kategori_kegiatan') and o.name = 'fk_kategori_katgiat_s_jenis_sd')
alter table ref.kategori_kegiatan
   drop constraint fk_kategori_katgiat_s_jenis_sd
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.kategori_tabel') and o.name = 'fk_kategori_kat_metad_kategori')
alter table ref.kategori_tabel
   drop constraint fk_kategori_kat_metad_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.kbli') and o.name = 'fk_kbli_induk_kbl_kbli')
alter table ref.kbli
   drop constraint fk_kbli_induk_kbl_kbli
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.keaktifan_ptk') and o.name = 'fk_keaktifa_long_reg__reg_ptk')
alter table pdrd.keaktifan_ptk
   drop constraint fk_keaktifa_long_reg__reg_ptk
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.keaktifan_ptk') and o.name = 'fk_keaktifa_tahun_kea_tahun_aj')
alter table pdrd.keaktifan_ptk
   drop constraint fk_keaktifa_tahun_kea_tahun_aj
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('presensi.kehadiran_mhs') and o.name = 'fk_kehadira_hadir_mhs_reg_ptk')
alter table presensi.kehadiran_mhs
   drop constraint fk_kehadira_hadir_mhs_reg_ptk
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
   where r.fkeyid = object_id('pdrd.kelas_kuliah') and o.name = 'fk_kelas_ku_smt_kelas_semester')
alter table pdrd.kelas_kuliah
   drop constraint fk_kelas_ku_smt_kelas_semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kelola_unit_fungsi') and o.name = 'fk_kelola_u_kelola_la_kategori')
alter table kelola_unit_fungsi
   drop constraint fk_kelola_u_kelola_la_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.kelompok_bidang') and o.name = 'fk_kelompok_induk_kel_kelompok')
alter table ref.kelompok_bidang
   drop constraint fk_kelompok_induk_kel_kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kepanitiaan') and o.name = 'fk_kepaniti_jenis_pan_jenis_ke')
alter table pdrd.kepanitiaan
   drop constraint fk_kepaniti_jenis_pan_jenis_ke
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kesejahteraan') and o.name = 'fk_kesejaht_kesejahte_jenis_ke')
alter table pdrd.kesejahteraan
   drop constraint fk_kesejaht_kesejahte_jenis_ke
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kesejahteraan') and o.name = 'fk_kesejaht_kesejahte_sdm')
alter table pdrd.kesejahteraan
   drop constraint fk_kesejaht_kesejahte_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kinerja_dosen') and o.name = 'fk_kinerja__jabfung_k_jabfung')
alter table pdrd.kinerja_dosen
   drop constraint fk_kinerja__jabfung_k_jabfung
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kinerja_dosen') and o.name = 'fk_kinerja__kinerja_d_reg_ptk')
alter table pdrd.kinerja_dosen
   drop constraint fk_kinerja__kinerja_d_reg_ptk
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kinerja_dosen') and o.name = 'fk_kinerja__kinerja_s_semester')
alter table pdrd.kinerja_dosen
   drop constraint fk_kinerja__kinerja_s_semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dashboard.kontrak_iku_pt') and o.name = 'fk_kontrak__kontrak_i_tahun_an')
alter table dashboard.kontrak_iku_pt
   drop constraint fk_kontrak__kontrak_i_tahun_an
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('mbkm.konversi_kampus_merdeka') and o.name = 'fk_konversi_akt_konve_akt_mhs')
alter table mbkm.konversi_kampus_merdeka
   drop constraint fk_konversi_akt_konve_akt_mhs
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('mbkm.konversi_kampus_merdeka') and o.name = 'fk_konversi_hasil_kon_daftar_k')
alter table mbkm.konversi_kampus_merdeka
   drop constraint fk_konversi_hasil_kon_daftar_k
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('mbkm.konversi_kampus_merdeka') and o.name = 'fk_konversi_konversi__anggota_')
alter table mbkm.konversi_kampus_merdeka
   drop constraint fk_konversi_konversi__anggota_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('mbkm.konversi_kampus_merdeka') and o.name = 'fk_konversi_konversi__matkul')
alter table mbkm.konversi_kampus_merdeka
   drop constraint fk_konversi_konversi__matkul
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kuliah_mhs') and o.name = 'fk_kuliah_m_keaktifan_semester')
alter table pdrd.kuliah_mhs
   drop constraint fk_kuliah_m_keaktifan_semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kuliah_mhs') and o.name = 'fk_kuliah_m_register__reg_pd')
alter table pdrd.kuliah_mhs
   drop constraint fk_kuliah_m_register__reg_pd
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kuliah_mhs') and o.name = 'fk_kuliah_m_status_mh_status_m')
alter table pdrd.kuliah_mhs
   drop constraint fk_kuliah_m_status_mh_status_m
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kurikulum_sp') and o.name = 'fk_kurikulu_jenjang_k_jenjang_')
alter table pdrd.kurikulum_sp
   drop constraint fk_kurikulu_jenjang_k_jenjang_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kurikulum_sp') and o.name = 'fk_kurikulu_sms_kurik_sms')
alter table pdrd.kurikulum_sp
   drop constraint fk_kurikulu_sms_kurik_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.kurikulum_sp') and o.name = 'fk_kurikulu_smt_kurik_semester')
alter table pdrd.kurikulum_sp
   drop constraint fk_kurikulu_smt_kurik_semester
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
   where r.fkeyid = object_id('pdrd.litabmas') and o.name = 'fk_litabmas_jenis_pen_jenis_pe')
alter table pdrd.litabmas
   drop constraint fk_litabmas_jenis_pen_jenis_pe
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.litabmas') and o.name = 'fk_litabmas_rumpun_il_kelompok')
alter table pdrd.litabmas
   drop constraint fk_litabmas_rumpun_il_kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.litabmas') and o.name = 'fk_litabmas_skim_kegi_skim_keg')
alter table pdrd.litabmas
   drop constraint fk_litabmas_skim_kegi_skim_keg
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
   where r.fkeyid = object_id('pdrd.litabmas') and o.name = 'fk_litabmas_tse_litab_tse')
alter table pdrd.litabmas
   drop constraint fk_litabmas_tse_litab_tse
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.map_abmas_tse') and o.name = 'fk_map_abma_abmas_tse_tse')
alter table pdrd.map_abmas_tse
   drop constraint fk_map_abma_abmas_tse_tse
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
   where r.fkeyid = object_id('ref.media_publikasi') and o.name = 'fk_media_pu_bidang_me_kelompok')
alter table ref.media_publikasi
   drop constraint fk_media_pu_bidang_me_kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.media_publikasi') and o.name = 'fk_media_pu_jenis_med_jenis_me')
alter table ref.media_publikasi
   drop constraint fk_media_pu_jenis_med_jenis_me
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.media_publikasi') and o.name = 'fk_media_pu_negara_me_negara')
alter table ref.media_publikasi
   drop constraint fk_media_pu_negara_me_negara
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.media_publikasi') and o.name = 'fk_media_pu_sp_media__satuan_p')
alter table ref.media_publikasi
   drop constraint fk_media_pu_sp_media__satuan_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('man_akses.menu_role') and o.name = 'fk_menu_rol_akses_men_peran')
alter table man_akses.menu_role
   drop constraint fk_menu_rol_akses_men_peran
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('mbkm.mk_konversi') and o.name = 'fk_mk_konve_sp_asal_m_satuan_p')
alter table mbkm.mk_konversi
   drop constraint fk_mk_konve_sp_asal_m_satuan_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kerjasama.mou') and o.name = 'fk_mou_akt_trida_aktifita')
alter table kerjasama.mou
   drop constraint fk_mou_akt_trida_aktifita
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kerjasama.mou') and o.name = 'fk_mou_mou_antar_satuan_p')
alter table kerjasama.mou
   drop constraint fk_mou_mou_antar_satuan_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.nilai_tes') and o.name = 'fk_nilai_te_nilai_tes_sdm')
alter table pdrd.nilai_tes
   drop constraint fk_nilai_te_nilai_tes_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.nilai_tes') and o.name = 'fk_nilai_te_test_jeni_jenis_te')
alter table pdrd.nilai_tes
   drop constraint fk_nilai_te_test_jeni_jenis_te
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.non_ca') and o.name = 'fk_non_ca_kewargane_negara')
alter table pdrd.non_ca
   drop constraint fk_non_ca_kewargane_negara
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.pd_anggota_litabmas') and o.name = 'fk_pd_anggo_ang_litab_peserta_')
alter table pdrd.pd_anggota_litabmas
   drop constraint fk_pd_anggo_ang_litab_peserta_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.pembicara') and o.name = 'fk_pembicar_bicara_ka_kategori')
alter table pdrd.pembicara
   drop constraint fk_pembicar_bicara_ka_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.pembicara') and o.name = 'fk_pembicar_capaian_p_kategori')
alter table pdrd.pembicara
   drop constraint fk_pembicar_capaian_p_kategori
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
   where r.fkeyid = object_id('pdrd.pengelola_jurnal') and o.name = 'fk_pengelol_keljurnal_kategori')
alter table pdrd.pengelola_jurnal
   drop constraint fk_pengelol_keljurnal_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.pengelola_jurnal') and o.name = 'fk_pengelol_kelola_ju_sdm')
alter table pdrd.pengelola_jurnal
   drop constraint fk_pengelol_kelola_ju_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.penghargaan') and o.name = 'fk_pengharg_harga_kat_kategori')
alter table pdrd.penghargaan
   drop constraint fk_pengharg_harga_kat_kategori
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
   where r.fkeyid = object_id('mbkm.periode_kampus_merdeka') and o.name = 'fk_periode__jns_akt_m_jenis_ak')
alter table mbkm.periode_kampus_merdeka
   drop constraint fk_periode__jns_akt_m_jenis_ak
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('mbkm.periode_kampus_merdeka') and o.name = 'fk_periode__smt_perio_semester')
alter table mbkm.periode_kampus_merdeka
   drop constraint fk_periode__smt_perio_semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pmb.periode_pmb') and o.name = 'fk_periode__jalur_daf_jalur_da')
alter table pmb.periode_pmb
   drop constraint fk_periode__jalur_daf_jalur_da
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pmb.periode_pmb') and o.name = 'fk_periode__jenis_pen_jenis_pe')
alter table pmb.periode_pmb
   drop constraint fk_periode__jenis_pen_jenis_pe
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pmb.periode_pmb') and o.name = 'fk_periode__jenjang_p_jenjang_')
alter table pmb.periode_pmb
   drop constraint fk_periode__jenjang_p_jenjang_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pmb.periode_pmb') and o.name = 'fk_periode__pembiayaa_pembiaya')
alter table pmb.periode_pmb
   drop constraint fk_periode__pembiayaa_pembiaya
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pmb.periode_pmb') and o.name = 'fk_periode__thn_ajara_tahun_aj')
alter table pmb.periode_pmb
   drop constraint fk_periode__thn_ajara_tahun_aj
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
   where r.fkeyid = object_id('ref.peta_katgiat_jabfung') and o.name = 'fk_peta_kat_jabfung_k_kategori')
alter table ref.peta_katgiat_jabfung
   drop constraint fk_peta_kat_jabfung_k_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.peta_katgiat_jabfung') and o.name = 'fk_peta_kat_katgiat_j_jabfung')
alter table ref.peta_katgiat_jabfung
   drop constraint fk_peta_kat_katgiat_j_jabfung
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.peta_katgiat_jnsdok') and o.name = 'fk_peta_kat_jnsdok_ka_jenis_do')
alter table ref.peta_katgiat_jnsdok
   drop constraint fk_peta_kat_jnsdok_ka_jenis_do
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.peta_katgiat_jnsdok') and o.name = 'fk_peta_kat_katgiat_j_kategori')
alter table ref.peta_katgiat_jnsdok
   drop constraint fk_peta_kat_katgiat_j_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.peta_katgiat_jnspub') and o.name = 'fk_peta_kat_kat_pub_kategori')
alter table ref.peta_katgiat_jnspub
   drop constraint fk_peta_kat_kat_pub_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.peta_katgiat_jnspub') and o.name = 'fk_peta_kat_pub_kat_jenis_pu')
alter table ref.peta_katgiat_jnspub
   drop constraint fk_peta_kat_pub_kat_jenis_pu
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.prestasi') and o.name = 'fk_prestasi_akt_mhs_p_akt_mhs')
alter table pdrd.prestasi
   drop constraint fk_prestasi_akt_mhs_p_akt_mhs
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
   where r.fkeyid = object_id('pdrd.profil_prodi') and o.name = 'fk_ta_profil_prodi')
alter table pdrd.profil_prodi
   drop constraint fk_ta_profil_prodi
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.profil_pt') and o.name = 'fk_profil_p_profil_sp_satuan_p')
alter table pdrd.profil_pt
   drop constraint fk_profil_p_profil_sp_satuan_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.profil_pt') and o.name = 'fk_ta_profil_pt')
alter table pdrd.profil_pt
   drop constraint fk_ta_profil_pt
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.publikasi') and o.name = 'fk_publikas_capaian_p_kategori')
alter table pdrd.publikasi
   drop constraint fk_publikas_capaian_p_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.publikasi') and o.name = 'fk_publikas_jenis_pub_jenis_pu')
alter table pdrd.publikasi
   drop constraint fk_publikas_jenis_pub_jenis_pu
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.publikasi') and o.name = 'fk_publikas_pub_media_media_pu')
alter table pdrd.publikasi
   drop constraint fk_publikas_pub_media_media_pu
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.re_mk') and o.name = 'fk_re_mk_basis_eva_basis_ev')
alter table pdrd.re_mk
   drop constraint fk_re_mk_basis_eva_basis_ev
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
   where r.fkeyid = object_id('pdrd.reg_ptk') and o.name = 'fk_reg_ptk_ptk_ikata_ikatan_k')
alter table pdrd.reg_ptk
   drop constraint fk_reg_ptk_ptk_ikata_ikatan_k
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_ptk') and o.name = 'fk_reg_ptk_ptk_kelua_jenis_ke')
alter table pdrd.reg_ptk
   drop constraint fk_reg_ptk_ptk_kelua_jenis_ke
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.reg_ptk') and o.name = 'fk_reg_ptk_ptk_terda_satuan_p')
alter table pdrd.reg_ptk
   drop constraint fk_reg_ptk_ptk_terda_satuan_p
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
   where r.fkeyid = object_id('pdrd.reg_ptk') and o.name = 'fk_reg_ptk_statpeg_p_status_k')
alter table pdrd.reg_ptk
   drop constraint fk_reg_ptk_statpeg_p_status_k
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('man_akses.role_pengguna') and o.name = 'fk_role_pen_akses_pen_peran')
alter table man_akses.role_pengguna
   drop constraint fk_role_pen_akses_pen_peran
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.ruang') and o.name = 'fk_ruang_satuan_ru_satuan')
alter table sarpras.ruang
   drop constraint fk_ruang_satuan_ru_satuan
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.ruang') and o.name = 'fk_ruang_sms_pemil_sms')
alter table sarpras.ruang
   drop constraint fk_ruang_sms_pemil_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_fungsional') and o.name = 'fk_rwy_fung_jab_fung__sdm')
alter table pdrd.rwy_fungsional
   drop constraint fk_rwy_fung_jab_fung__sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_fungsional') and o.name = 'fk_rwy_fung_jabfung_b_kelompok')
alter table pdrd.rwy_fungsional
   drop constraint fk_rwy_fung_jabfung_b_kelompok
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_fungsional') and o.name = 'fk_rwy_fung_rwyt_fung_jabfung')
alter table pdrd.rwy_fungsional
   drop constraint fk_rwy_fung_rwyt_fung_jabfung
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('keuangan.rwy_gaji_berkala') and o.name = 'fk_rwy_gaji_pangkat_g_pangkat_')
alter table keuangan.rwy_gaji_berkala
   drop constraint fk_rwy_gaji_pangkat_g_pangkat_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('keuangan.rwy_gaji_berkala') and o.name = 'fk_rwy_gaji_rwy_gaji__sdm')
alter table keuangan.rwy_gaji_berkala
   drop constraint fk_rwy_gaji_rwy_gaji__sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_kepangkatan') and o.name = 'fk_rwy_kepa_riwayat_p_pangkat_')
alter table pdrd.rwy_kepangkatan
   drop constraint fk_rwy_kepa_riwayat_p_pangkat_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_kepangkatan') and o.name = 'fk_rwy_kepa_rwy_pangk_sdm')
alter table pdrd.rwy_kepangkatan
   drop constraint fk_rwy_kepa_rwy_pangk_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_pekerjaan') and o.name = 'fk_rwy_peke_pekerjaan_pekerjaa')
alter table pdrd.rwy_pekerjaan
   drop constraint fk_rwy_peke_pekerjaan_pekerjaa
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_pekerjaan') and o.name = 'fk_rwy_peke_rwy_peker_sdm')
alter table pdrd.rwy_pekerjaan
   drop constraint fk_rwy_peke_rwy_peker_sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_pekerjaan') and o.name = 'fk_rwy_peke_sektor_pe_kbli')
alter table pdrd.rwy_pekerjaan
   drop constraint fk_rwy_peke_sektor_pe_kbli
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_pend_formal') and o.name = 'fk_rwy_pend_didik_for_kategori')
alter table pdrd.rwy_pend_formal
   drop constraint fk_rwy_pend_didik_for_kategori
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
   where r.fkeyid = object_id('pdrd.rwy_struktural') and o.name = 'fk_rwy_stru_jab_stru__sdm')
alter table pdrd.rwy_struktural
   drop constraint fk_rwy_stru_jab_stru__sdm
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_struktural') and o.name = 'fk_rwy_stru_jabstruk__kategori')
alter table pdrd.rwy_struktural
   drop constraint fk_rwy_stru_jabstruk__kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.rwy_struktural') and o.name = 'fk_rwy_stru_rwyt_jab_jab_tgs')
alter table pdrd.rwy_struktural
   drop constraint fk_rwy_stru_rwyt_jab_jab_tgs
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.satuan_pendidikan') and o.name = 'fk_satuan_p_logo_sp_large_ob')
alter table pdrd.satuan_pendidikan
   drop constraint fk_satuan_p_logo_sp_large_ob
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.satuan_pendidikan') and o.name = 'fk_satuan_p_pembina_s_lembaga_')
alter table pdrd.satuan_pendidikan
   drop constraint fk_satuan_p_pembina_s_lembaga_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.satuan_pendidikan') and o.name = 'fk_satuan_p_sp_bentuk_bentuk_p')
alter table pdrd.satuan_pendidikan
   drop constraint fk_satuan_p_sp_bentuk_bentuk_p
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.satuan_pendidikan') and o.name = 'fk_satuan_p_sp_milik_status_k')
alter table pdrd.satuan_pendidikan
   drop constraint fk_satuan_p_sp_milik_status_k
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.satuan_pendidikan') and o.name = 'fk_satuan_p_wilayah_s_wilayah')
alter table pdrd.satuan_pendidikan
   drop constraint fk_satuan_p_wilayah_s_wilayah
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
   where r.fkeyid = object_id('pdrd.sdm_anggota_litabmas') and o.name = 'fk_sdm_angg_litabmas__kategori')
alter table pdrd.sdm_anggota_litabmas
   drop constraint fk_sdm_angg_litabmas__kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.semester') and o.name = 'fk_semester_ta_semest_tahun_aj')
alter table ref.semester
   drop constraint fk_semester_ta_semest_tahun_aj
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.skim_kegiatan') and o.name = 'fk_skim_keg_jenj_pend_jenjang_')
alter table ref.skim_kegiatan
   drop constraint fk_skim_keg_jenj_pend_jenjang_
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
   where r.fkeyid = object_id('kerjasama.sms_kerjasama') and o.name = 'fk_sms_kerj_bidang_ke_bidang_k')
alter table kerjasama.sms_kerjasama
   drop constraint fk_sms_kerj_bidang_ke_bidang_k
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kerjasama.sms_kerjasama') and o.name = 'fk_sms_kerj_bntk_kerj_bentuk_k')
alter table kerjasama.sms_kerjasama
   drop constraint fk_sms_kerj_bntk_kerj_bentuk_k
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kerjasama.sms_kerjasama') and o.name = 'fk_sms_kerj_kriteria__kriteria')
alter table kerjasama.sms_kerjasama
   drop constraint fk_sms_kerj_kriteria__kriteria
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kerjasama.sms_kerjasama') and o.name = 'fk_sms_kerj_sms_yang__sms')
alter table kerjasama.sms_kerjasama
   drop constraint fk_sms_kerj_sms_yang__sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('kerjasama.sms_kerjasama') and o.name = 'fk_sms_kerj_status_ke_status_k')
alter table kerjasama.sms_kerjasama
   drop constraint fk_sms_kerj_status_ke_status_k
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
   where r.fkeyid = object_id('keuangan.spp_mhs') and o.name = 'fk_spp_mhs_bayar_spp_semester')
alter table keuangan.spp_mhs
   drop constraint fk_spp_mhs_bayar_spp_semester
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.substansi_kuliah') and o.name = 'fk_substans_substansi_jenis_su')
alter table pdrd.substansi_kuliah
   drop constraint fk_substans_substansi_jenis_su
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.substansi_kuliah') and o.name = 'fk_substans_substansi_sms')
alter table pdrd.substansi_kuliah
   drop constraint fk_substans_substansi_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.tanah') and o.name = 'fk_tanah_hapus_buk_jenis_ha')
alter table sarpras.tanah
   drop constraint fk_tanah_hapus_buk_jenis_ha
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.tanah') and o.name = 'fk_tanah_jns_prasa_jenis_pr')
alter table sarpras.tanah
   drop constraint fk_tanah_jns_prasa_jenis_pr
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.tanah') and o.name = 'fk_tanah_sms_pemil_sms')
alter table sarpras.tanah
   drop constraint fk_tanah_sms_pemil_sms
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sarpras.tanah') and o.name = 'fk_tanah_status_mi_status_m')
alter table sarpras.tanah
   drop constraint fk_tanah_status_mi_status_m
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tugas_belajar') and o.name = 'fk_tugas_be_tb_jenjan_jenjang_')
alter table pdrd.tugas_belajar
   drop constraint fk_tugas_be_tb_jenjan_jenjang_
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tugas_belajar') and o.name = 'fk_tugas_be_tb_negara_negara')
alter table pdrd.tugas_belajar
   drop constraint fk_tugas_be_tb_negara_negara
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tugas_belajar') and o.name = 'fk_tugas_be_tb_sp_satuan_p')
alter table pdrd.tugas_belajar
   drop constraint fk_tugas_be_tb_sp_satuan_p
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
   where r.fkeyid = object_id('pdrd.tugas_tambahan') and o.name = 'fk_tugas_ta_tug_tamba_jab_tgs')
alter table pdrd.tugas_tambahan
   drop constraint fk_tugas_ta_tug_tamba_jab_tgs
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tugas_tambahan') and o.name = 'fk_tugas_ta_tugtam_ka_kategori')
alter table pdrd.tugas_tambahan
   drop constraint fk_tugas_ta_tugtam_ka_kategori
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
   where r.fkeyid = object_id('pdrd.tulis_pub') and o.name = 'fk_tulis_pu_tulis_pub_kategori')
alter table pdrd.tulis_pub
   drop constraint fk_tulis_pu_tulis_pub_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tunjangan') and o.name = 'fk_tunjanga_tunjangan_jenis_tu')
alter table pdrd.tunjangan
   drop constraint fk_tunjanga_tunjangan_jenis_tu
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.tunjangan') and o.name = 'fk_tunjanga_tunjangan_sdm')
alter table pdrd.tunjangan
   drop constraint fk_tunjanga_tunjangan_sdm
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
   where r.fkeyid = object_id('pdrd.uji_mhs') and o.name = 'fk_uji_mhs_ujimhs_ka_kategori')
alter table pdrd.uji_mhs
   drop constraint fk_uji_mhs_ujimhs_ka_kategori
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
   where r.fkeyid = object_id('man_akses.unit_organisasi') and o.name = 'fk_unit_org_jenis_org_jenis_le')
alter table man_akses.unit_organisasi
   drop constraint fk_unit_org_jenis_org_jenis_le
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('man_akses.unit_organisasi') and o.name = 'fk_unit_org_wilayah_o_wilayah')
alter table man_akses.unit_organisasi
   drop constraint fk_unit_org_wilayah_o_wilayah
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.visiting_scientist') and o.name = 'fk_visiting_capaian_v_kategori')
alter table pdrd.visiting_scientist
   drop constraint fk_visiting_capaian_v_kategori
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

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('pdrd.visiting_scientist') and o.name = 'fk_visiting_visit_sci_kategori')
alter table pdrd.visiting_scientist
   drop constraint fk_visiting_visit_sci_kategori
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.wilayah') and o.name = 'fk_wilayah_induk_wil_wilayah')
alter table ref.wilayah
   drop constraint fk_wilayah_induk_wil_wilayah
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.wilayah') and o.name = 'fk_wilayah_level_wil_level_wi')
alter table ref.wilayah
   drop constraint fk_wilayah_level_wil_level_wi
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ref.wilayah') and o.name = 'fk_wilayah_wilayah_n_negara')
alter table ref.wilayah
   drop constraint fk_wilayah_wilayah_n_negara
go

alter table ref.agama
   drop constraint pk_agama
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_agama')
            and   type = 'U')
   drop table ref.tmp_agama
go

execute sp_rename 'ref.agama', tmp_agama
go

alter table pdrd.akt_mhs
   drop constraint pk_akt_mhs
go

alter table pdrd.akt_mhs
   drop constraint ckc_a_komunal_akt_mhs
go

alter table pdrd.akt_mhs
   drop constraint ckc_soft_delete_akt_mhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_akt_mhs')
            and   type = 'U')
   drop table pdrd.tmp_akt_mhs
go

execute sp_rename 'pdrd.akt_mhs', tmp_akt_mhs
go

alter table ref.aktifitas_kerjasama
   drop constraint pk_aktifitas_kerjasama
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_aktifitas_kerjasama')
            and   type = 'U')
   drop table ref.tmp_aktifitas_kerjasama
go

execute sp_rename 'ref.aktifitas_kerjasama', tmp_aktifitas_kerjasama
go

alter table ref.basis_evaluasi
   drop constraint pk_basis_evaluasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_basis_evaluasi')
            and   type = 'U')
   drop table ref.tmp_basis_evaluasi
go

execute sp_rename 'ref.basis_evaluasi', tmp_basis_evaluasi
go

alter table ref.bentuk_kegiatan_kerjasama
   drop constraint pk_bentuk_kegiatan_kerjasama
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_bentuk_kegiatan_kerjasama')
            and   type = 'U')
   drop table ref.tmp_bentuk_kegiatan_kerjasama
go

execute sp_rename 'ref.bentuk_kegiatan_kerjasama', tmp_bentuk_kegiatan_kerjasama
go

alter table ref.bentuk_pendidikan
   drop constraint pk_bentuk_pendidikan
go

alter table ref.bentuk_pendidikan
   drop constraint ckc_a_jenj_paud_bentuk_p
go

alter table ref.bentuk_pendidikan
   drop constraint ckc_a_jenj_tk_bentuk_p
go

alter table ref.bentuk_pendidikan
   drop constraint ckc_a_jenj_sd_bentuk_p
go

alter table ref.bentuk_pendidikan
   drop constraint ckc_a_jenj_smp_bentuk_p
go

alter table ref.bentuk_pendidikan
   drop constraint ckc_a_jenj_sma_bentuk_p
go

alter table ref.bentuk_pendidikan
   drop constraint ckc_a_jenj_tinggi_bentuk_p
go

alter table ref.bentuk_pendidikan
   drop constraint ckc_a_aktif_bentuk_p
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_bentuk_pendidikan')
            and   type = 'U')
   drop table ref.tmp_bentuk_pendidikan
go

execute sp_rename 'ref.bentuk_pendidikan', tmp_bentuk_pendidikan
go

alter table ref.bidang_kerjasama
   drop constraint pk_bidang_kerjasama
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_bidang_kerjasama')
            and   type = 'U')
   drop table ref.tmp_bidang_kerjasama
go

execute sp_rename 'ref.bidang_kerjasama', tmp_bidang_kerjasama
go

alter table ref.bidang_pekerjaan
   drop constraint pk_bidang_pekerjaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_bidang_pekerjaan')
            and   type = 'U')
   drop table ref.tmp_bidang_pekerjaan
go

execute sp_rename 'ref.bidang_pekerjaan', tmp_bidang_pekerjaan
go

alter table ref.bidang_studi
   drop constraint pk_bidang_studi
go

alter table ref.bidang_studi
   drop constraint ckc_a_kel_bidang_s
go

alter table ref.bidang_studi
   drop constraint ckc_a_jenj_paud_bidang_s
go

alter table ref.bidang_studi
   drop constraint ckc_a_jenj_tk_bidang_s
go

alter table ref.bidang_studi
   drop constraint ckc_a_jenj_sd_bidang_s
go

alter table ref.bidang_studi
   drop constraint ckc_a_jenj_smp_bidang_s
go

alter table ref.bidang_studi
   drop constraint ckc_a_jenj_sma_bidang_s
go

alter table ref.bidang_studi
   drop constraint ckc_a_jenj_tinggi_bidang_s
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_bidang_studi')
            and   type = 'U')
   drop table ref.tmp_bidang_studi
go

execute sp_rename 'ref.bidang_studi', tmp_bidang_studi
go

alter table ref.bidang_usaha
   drop constraint pk_bidang_usaha
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_bidang_usaha')
            and   type = 'U')
   drop table ref.tmp_bidang_usaha
go

execute sp_rename 'ref.bidang_usaha', tmp_bidang_usaha
go

alter table dashboard.detail_iku_1
   drop constraint pk_detail_iku_1
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dashboard.tmp_detail_iku_1')
            and   type = 'U')
   drop table dashboard.tmp_detail_iku_1
go

execute sp_rename 'dashboard.detail_iku_1', tmp_detail_iku_1
go

alter table dashboard.detail_iku_2
   drop constraint pk_detail_iku_2
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dashboard.tmp_detail_iku_2')
            and   type = 'U')
   drop table dashboard.tmp_detail_iku_2
go

execute sp_rename 'dashboard.detail_iku_2', tmp_detail_iku_2
go

alter table dashboard.detail_iku_3
   drop constraint pk_detail_iku_3
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dashboard.tmp_detail_iku_3')
            and   type = 'U')
   drop table dashboard.tmp_detail_iku_3
go

execute sp_rename 'dashboard.detail_iku_3', tmp_detail_iku_3
go

alter table dashboard.detail_iku_4
   drop constraint pk_detail_iku_4
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dashboard.tmp_detail_iku_4')
            and   type = 'U')
   drop table dashboard.tmp_detail_iku_4
go

execute sp_rename 'dashboard.detail_iku_4', tmp_detail_iku_4
go

alter table dashboard.detail_iku_5
   drop constraint pk_detail_iku_5
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dashboard.tmp_detail_iku_5')
            and   type = 'U')
   drop table dashboard.tmp_detail_iku_5
go

execute sp_rename 'dashboard.detail_iku_5', tmp_detail_iku_5
go

alter table dashboard.detail_iku_7
   drop constraint pk_detail_iku_7
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dashboard.tmp_detail_iku_7')
            and   type = 'U')
   drop table dashboard.tmp_detail_iku_7
go

execute sp_rename 'dashboard.detail_iku_7', tmp_detail_iku_7
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

alter table ref.fungsi_lab
   drop constraint pk_fungsi_lab
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_fungsi_lab')
            and   type = 'U')
   drop table ref.tmp_fungsi_lab
go

execute sp_rename 'ref.fungsi_lab', tmp_fungsi_lab
go

alter table ref.gelar_akademik
   drop constraint pk_gelar_akademik
go

alter table ref.gelar_akademik 
   drop constraint ckc_posisi_gelar_gelar_ak
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_gelar_akademik')
            and   type = 'U')
   drop table ref.tmp_gelar_akademik
go

execute sp_rename 'ref.gelar_akademik', tmp_gelar_akademik
go

alter table ref.ikatan_kerja_sdm
   drop constraint pk_ikatan_kerja_sdm
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_ikatan_kerja_sdm')
            and   type = 'U')
   drop table ref.tmp_ikatan_kerja_sdm
go

execute sp_rename 'ref.ikatan_kerja_sdm', tmp_ikatan_kerja_sdm
go

alter table ref.jab_tgs
   drop constraint pk_jab_tgs
go

alter table ref.jab_tgs
   drop constraint ckc_a_jab_utama_sek_jab_tgs
go

alter table ref.jab_tgs
   drop constraint ckc_a_jab_utama_pt_jab_tgs
go

alter table ref.jab_tgs
   drop constraint ckc_a_jab_utama_lpnk_jab_tgs
go

alter table ref.jab_tgs
   drop constraint ckc_a_jab_utama_lpk_jab_tgs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jab_tgs')
            and   type = 'U')
   drop table ref.tmp_jab_tgs
go

execute sp_rename 'ref.jab_tgs', tmp_jab_tgs
go

alter table ref.jabfung
   drop constraint pk_jabfung
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jabfung')
            and   type = 'U')
   drop table ref.tmp_jabfung
go

execute sp_rename 'ref.jabfung', tmp_jabfung
go

alter table ref.jalur_daftar
   drop constraint pk_jalur_daftar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jalur_daftar')
            and   type = 'U')
   drop table ref.tmp_jalur_daftar
go

execute sp_rename 'ref.jalur_daftar', tmp_jalur_daftar
go

alter table ref.jenis_akt_mhs
   drop constraint pk_jenis_akt_mhs
go

alter table ref.jenis_akt_mhs
   drop constraint ckc_a_kegiatan_kampus_jenis_ak
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_akt_mhs')
            and   type = 'U')
   drop table ref.tmp_jenis_akt_mhs
go

execute sp_rename 'ref.jenis_akt_mhs', tmp_jenis_akt_mhs
go

alter table ref.jenis_bahan_ajar
   drop constraint pk_jenis_bahan_ajar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_bahan_ajar')
            and   type = 'U')
   drop table ref.tmp_jenis_bahan_ajar
go

execute sp_rename 'ref.jenis_bahan_ajar', tmp_jenis_bahan_ajar
go

alter table ref.jenis_beasiswa
   drop constraint pk_jenis_beasiswa
go

alter table ref.jenis_beasiswa 
   drop constraint ckc_kat_beasiswa_jenis_be
go

alter table ref.jenis_beasiswa
   drop constraint ckc_u_pd_jenis_be
go

alter table ref.jenis_beasiswa
   drop constraint ckc_u_ptk_jenis_be
go

alter table ref.jenis_beasiswa
   drop constraint ckc_u_non_ca_jenis_be
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_beasiswa')
            and   type = 'U')
   drop table ref.tmp_jenis_beasiswa
go

execute sp_rename 'ref.jenis_beasiswa', tmp_jenis_beasiswa
go

alter table ref.jenis_diklat
   drop constraint pk_jenis_diklat
go

alter table ref.jenis_diklat
   drop constraint ckc_u_guru_jenis_di
go

alter table ref.jenis_diklat
   drop constraint ckc_u_dosen_jenis_di
go

alter table ref.jenis_diklat
   drop constraint ckc_u_tendik_jenis_di
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_diklat')
            and   type = 'U')
   drop table ref.tmp_jenis_diklat
go

execute sp_rename 'ref.jenis_diklat', tmp_jenis_diklat
go

alter table ref.jenis_dokumen
   drop constraint pk_jenis_dokumen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_dokumen')
            and   type = 'U')
   drop table ref.tmp_jenis_dokumen
go

execute sp_rename 'ref.jenis_dokumen', tmp_jenis_dokumen
go

alter table ref.jenis_evaluasi
   drop constraint pk_jenis_evaluasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_evaluasi')
            and   type = 'U')
   drop table ref.tmp_jenis_evaluasi
go

execute sp_rename 'ref.jenis_evaluasi', tmp_jenis_evaluasi
go

alter table ref.jenis_hapus_buku
   drop constraint pk_jenis_hapus_buku
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_hapus_buku')
            and   type = 'U')
   drop table ref.tmp_jenis_hapus_buku
go

execute sp_rename 'ref.jenis_hapus_buku', tmp_jenis_hapus_buku
go

alter table ref.jenis_jalur_pekerjaan
   drop constraint pk_jenis_jalur_pekerjaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_jalur_pekerjaan')
            and   type = 'U')
   drop table ref.tmp_jenis_jalur_pekerjaan
go

execute sp_rename 'ref.jenis_jalur_pekerjaan', tmp_jenis_jalur_pekerjaan
go

alter table ref.jenis_keluar
   drop constraint pk_jenis_keluar
go

alter table ref.jenis_keluar
   drop constraint ckc_a_pd_jenis_ke
go

alter table ref.jenis_keluar
   drop constraint ckc_a_ptk_jenis_ke
go

alter table ref.jenis_keluar
   drop constraint ckc_a_sdm_iptek_jenis_ke
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_keluar')
            and   type = 'U')
   drop table ref.tmp_jenis_keluar
go

execute sp_rename 'ref.jenis_keluar', tmp_jenis_keluar
go

alter table ref.jenis_kepanitiaan
   drop constraint pk_jenis_kepanitiaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_kepanitiaan')
            and   type = 'U')
   drop table ref.tmp_jenis_kepanitiaan
go

execute sp_rename 'ref.jenis_kepanitiaan', tmp_jenis_kepanitiaan
go

alter table ref.jenis_kesejahteraan
   drop constraint pk_jenis_kesejahteraan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_kesejahteraan')
            and   type = 'U')
   drop table ref.tmp_jenis_kesejahteraan
go

execute sp_rename 'ref.jenis_kesejahteraan', tmp_jenis_kesejahteraan
go

alter table ref.jenis_keuangan
   drop constraint pk_jenis_keuangan
go

alter table ref.jenis_keuangan
   drop constraint ckc_a_pengeluaran_jenis_ke
go

alter table ref.jenis_keuangan
   drop constraint ckc_a_pemasukan_jenis_ke
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_keuangan')
            and   type = 'U')
   drop table ref.tmp_jenis_keuangan
go

execute sp_rename 'ref.jenis_keuangan', tmp_jenis_keuangan
go

alter table ref.jenis_lembaga
   drop constraint pk_jenis_lembaga
go

alter table ref.jenis_lembaga
   drop constraint ckc_a_sp_jenis_le
go

alter table ref.jenis_lembaga
   drop constraint ckc_a_lemb_akred_jenis_le
go

alter table ref.jenis_lembaga
   drop constraint ckc_a_pengelola_pendi_jenis_le
go

alter table ref.jenis_lembaga
   drop constraint ckc_a_sms_jenis_le
go

alter table ref.jenis_lembaga
   drop constraint ckc_a_tmpt_pengawas_jenis_le
go

alter table ref.jenis_lembaga
   drop constraint ckc_a_lemb_iptek_jenis_le
go

alter table ref.jenis_lembaga
   drop constraint ckc_a_smi_jenis_le
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_lembaga')
            and   type = 'U')
   drop table ref.tmp_jenis_lembaga
go

execute sp_rename 'ref.jenis_lembaga', tmp_jenis_lembaga
go

alter table ref.jenis_media_pub
   drop constraint pk_jenis_media_pub
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_media_pub')
            and   type = 'U')
   drop table ref.tmp_jenis_media_pub
go

execute sp_rename 'ref.jenis_media_pub', tmp_jenis_media_pub
go

alter table ref.jenis_pendaftaran
   drop constraint pk_jenis_pendaftaran
go

alter table ref.jenis_pendaftaran
   drop constraint ckc_u_daftar_sekolah_jenis_pe
go

alter table ref.jenis_pendaftaran
   drop constraint ckc_u_daftar_rombel_jenis_pe
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_pendaftaran')
            and   type = 'U')
   drop table ref.tmp_jenis_pendaftaran
go

execute sp_rename 'ref.jenis_pendaftaran', tmp_jenis_pendaftaran
go

alter table ref.jenis_penelitian
   drop constraint pk_jenis_penelitian
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_penelitian')
            and   type = 'U')
   drop table ref.tmp_jenis_penelitian
go

execute sp_rename 'ref.jenis_penelitian', tmp_jenis_penelitian
go

alter table ref.jenis_penghargaan
   drop constraint pk_jenis_penghargaan
go

alter table ref.jenis_penghargaan
   drop constraint ckc_u_sdm_jenis_pe
go

alter table ref.jenis_penghargaan
   drop constraint ckc_u_lembaga_jenis_pe
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_penghargaan')
            and   type = 'U')
   drop table ref.tmp_jenis_penghargaan
go

execute sp_rename 'ref.jenis_penghargaan', tmp_jenis_penghargaan
go

alter table ref.jenis_prasarana
   drop constraint pk_jenis_prasarana
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_prasarana')
            and   type = 'U')
   drop table ref.tmp_jenis_prasarana
go

execute sp_rename 'ref.jenis_prasarana', tmp_jenis_prasarana
go

alter table ref.jenis_prestasi
   drop constraint pk_jenis_prestasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_prestasi')
            and   type = 'U')
   drop table ref.tmp_jenis_prestasi
go

execute sp_rename 'ref.jenis_prestasi', tmp_jenis_prestasi
go

alter table ref.jenis_publikasi
   drop constraint pk_jenis_publikasi
go

alter table ref.jenis_publikasi
   drop constraint ckc_a_pub_prestasi_jenis_pu
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_publikasi')
            and   type = 'U')
   drop table ref.tmp_jenis_publikasi
go

execute sp_rename 'ref.jenis_publikasi', tmp_jenis_publikasi
go

alter table ref.jenis_sarana
   drop constraint pk_jenis_sarana
go

alter table ref.jenis_sarana
   drop constraint ckc_a_penempatan_jenis_sa
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_sarana')
            and   type = 'U')
   drop table ref.tmp_jenis_sarana
go

execute sp_rename 'ref.jenis_sarana', tmp_jenis_sarana
go

alter table ref.jenis_sdm
   drop constraint pk_jenis_sdm
go

alter table ref.jenis_sdm
   drop constraint ckc_a_guru_kelas_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_guru_mapel_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_guru_bk_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_guru_inklusi_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_pengawas_sp_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_pengawas_plb_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_pengawas_mapel_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_pengawas_bid_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_tas_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_formal_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_dosen_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_peneliti_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_perekayasa_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_pranata_1_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_pranata_2_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_pranata_3_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_pranata_4_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_pranata_5_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_pranata_6_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_pranata_7_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_pranata_8_jenis_sd
go

alter table ref.jenis_sdm
   drop constraint ckc_a_pranata_9_jenis_sd
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_sdm')
            and   type = 'U')
   drop table ref.tmp_jenis_sdm
go

execute sp_rename 'ref.jenis_sdm', tmp_jenis_sdm
go

alter table ref.jenis_sert
   drop constraint pk_jenis_sert
go

alter table ref.jenis_sert
   drop constraint ckc_u_prof_guru_jenis_se
go

alter table ref.jenis_sert
   drop constraint ckc_u_kepsek_jenis_se
go

alter table ref.jenis_sert
   drop constraint ckc_u_laboran_jenis_se
go

alter table ref.jenis_sert
   drop constraint ckc_u_prof_dosen_jenis_se
go

alter table ref.jenis_sert
   drop constraint ckc_u_lembaga_jenis_se
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_sert')
            and   type = 'U')
   drop table ref.tmp_jenis_sert
go

execute sp_rename 'ref.jenis_sert', tmp_jenis_sert
go

alter table ref.jenis_sms
   drop constraint pk_jenis_sms
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_sms')
            and   type = 'U')
   drop table ref.tmp_jenis_sms
go

execute sp_rename 'ref.jenis_sms', tmp_jenis_sms
go

alter table ref.jenis_subst
   drop constraint pk_jenis_subst
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_subst')
            and   type = 'U')
   drop table ref.tmp_jenis_subst
go

execute sp_rename 'ref.jenis_subst', tmp_jenis_subst
go

alter table ref.jenis_tes
   drop constraint pk_jenis_tes
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_tes')
            and   type = 'U')
   drop table ref.tmp_jenis_tes
go

execute sp_rename 'ref.jenis_tes', tmp_jenis_tes
go

alter table ref.jenis_tinggal
   drop constraint pk_jenis_tinggal
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_tinggal')
            and   type = 'U')
   drop table ref.tmp_jenis_tinggal
go

execute sp_rename 'ref.jenis_tinggal', tmp_jenis_tinggal
go

alter table ref.jenis_tunjangan
   drop constraint pk_jenis_tunjangan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_tunjangan')
            and   type = 'U')
   drop table ref.tmp_jenis_tunjangan
go

execute sp_rename 'ref.jenis_tunjangan', tmp_jenis_tunjangan
go

alter table ref.jenjang_pendidikan
   drop constraint pk_jenjang_pendidikan
go

alter table ref.jenjang_pendidikan
   drop constraint ckc_u_jenj_lemb_jenjang_
go

alter table ref.jenjang_pendidikan
   drop constraint ckc_u_jenj_org_jenjang_
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenjang_pendidikan')
            and   type = 'U')
   drop table ref.tmp_jenjang_pendidikan
go

execute sp_rename 'ref.jenjang_pendidikan', tmp_jenjang_pendidikan
go

alter table ref.jurusan
   drop constraint pk_jurusan
go

alter table ref.jurusan
   drop constraint ckc_u_sma_jurusan
go

alter table ref.jurusan
   drop constraint ckc_u_smk_jurusan
go

alter table ref.jurusan
   drop constraint ckc_u_pt_jurusan
go

alter table ref.jurusan
   drop constraint ckc_u_slb_jurusan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jurusan')
            and   type = 'U')
   drop table ref.tmp_jurusan
go

execute sp_rename 'ref.jurusan', tmp_jurusan
go

alter table ref.kategori_capaian_luaran
   drop constraint pk_kategori_capaian_luaran
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kategori_capaian_luaran')
            and   type = 'U')
   drop table ref.tmp_kategori_capaian_luaran
go

execute sp_rename 'ref.kategori_capaian_luaran', tmp_kategori_capaian_luaran
go

alter table ref.kategori_kegiatan
   drop constraint pk_kategori_kegiatan
go

alter table ref.kategori_kegiatan 
   drop constraint ckc_level_kat_kategori
go
alter table ref.kategori_kegiatan 
   drop constraint ckc_acuan_waktu_kategori
go

alter table ref.kategori_kegiatan
   drop constraint ckc_satuan_nilai_kategori
go

alter table ref.kategori_kegiatan
   drop constraint ckc_a_aktif_kategori
go

alter table ref.kategori_kegiatan
   drop constraint ckc_a_anak_bimb_kategori
go

alter table ref.kategori_kegiatan
   drop constraint ckc_a_judul_kategori
go

alter table ref.kategori_kegiatan
   drop constraint ckc_a_sk_kategori
go

alter table ref.kategori_kegiatan
   drop constraint ckc_a_peer_review_kategori
go

alter table ref.kategori_kegiatan
   drop constraint ckc_u_bkd_kategori
go

alter table ref.kategori_kegiatan
   drop constraint ckc_u_pak_kategori
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kategori_kegiatan')
            and   type = 'U')
   drop table ref.tmp_kategori_kegiatan
go

execute sp_rename 'ref.kategori_kegiatan', tmp_kategori_kegiatan
go

alter table ref.kategori_tabel
   drop constraint pk_kategori_tabel
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kategori_tabel')
            and   type = 'U')
   drop table ref.tmp_kategori_tabel
go

execute sp_rename 'ref.kategori_tabel', tmp_kategori_tabel
go

alter table ref.kbli
   drop constraint pk_kbli
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kbli')
            and   type = 'U')
   drop table ref.tmp_kbli
go

execute sp_rename 'ref.kbli', tmp_kbli
go

alter table ref.keahlian_lab
   drop constraint pk_keahlian_lab
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_keahlian_lab')
            and   type = 'U')
   drop table ref.tmp_keahlian_lab
go

execute sp_rename 'ref.keahlian_lab', tmp_keahlian_lab
go

alter table ref.kebutuhan_khusus
   drop constraint pk_kebutuhan_khusus
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kebutuhan_khusus')
            and   type = 'U')
   drop table ref.tmp_kebutuhan_khusus
go

execute sp_rename 'ref.kebutuhan_khusus', tmp_kebutuhan_khusus
go

alter table ref.kelompok_bidang
   drop constraint pk_kelompok_bidang
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

alter table ref.kelompok_profesi
   drop constraint pk_kelompok_profesi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kelompok_profesi')
            and   type = 'U')
   drop table ref.tmp_kelompok_profesi
go

execute sp_rename 'ref.kelompok_profesi', tmp_kelompok_profesi
go

alter table ref.kelompok_usaha
   drop constraint pk_kelompok_usaha
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kelompok_usaha')
            and   type = 'U')
   drop table ref.tmp_kelompok_usaha
go

execute sp_rename 'ref.kelompok_usaha', tmp_kelompok_usaha
go

alter table dashboard.kontrak_iku_pt
   drop constraint pk_kontrak_iku_pt
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dashboard.tmp_kontrak_iku_pt')
            and   type = 'U')
   drop table dashboard.tmp_kontrak_iku_pt
go

execute sp_rename 'dashboard.kontrak_iku_pt', tmp_kontrak_iku_pt
go

if exists (select 1
            from  sysobjects
           where  id = object_id('mbkm.konversi_kampus_merdeka')
            and   type = 'U')
   drop table mbkm.konversi_kampus_merdeka
go

alter table ref.kriteria_mitra
   drop constraint pk_kriteria_mitra
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kriteria_mitra')
            and   type = 'U')
   drop table ref.tmp_kriteria_mitra
go

execute sp_rename 'ref.kriteria_mitra', tmp_kriteria_mitra
go

alter table pdrd.kuliah_mhs
   drop constraint pk_kuliah_mhs
go

alter table pdrd.kuliah_mhs
   drop constraint ckc_soft_delete_kuliah_m
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_kuliah_mhs')
            and   type = 'U')
   drop table pdrd.tmp_kuliah_mhs
go

execute sp_rename 'pdrd.kuliah_mhs', tmp_kuliah_mhs
go

alter table ref.lembaga_akred
   drop constraint pk_lembaga_akred
go

alter table ref.lembaga_akred
   drop constraint ckc_target_akred_lembaga_
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_lembaga_akred')
            and   type = 'U')
   drop table ref.tmp_lembaga_akred
go

execute sp_rename 'ref.lembaga_akred', tmp_lembaga_akred
go

alter table ref.lembaga_pengangkat
   drop constraint pk_lembaga_pengangkat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_lembaga_pengangkat')
            and   type = 'U')
   drop table ref.tmp_lembaga_pengangkat
go

execute sp_rename 'ref.lembaga_pengangkat', tmp_lembaga_pengangkat
go

alter table ref.level_wilayah
   drop constraint pk_level_wilayah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_level_wilayah')
            and   type = 'U')
   drop table ref.tmp_level_wilayah
go

execute sp_rename 'ref.level_wilayah', tmp_level_wilayah
go

alter table ref.media_publikasi
   drop constraint pk_media_publikasi
go

alter table ref.media_publikasi 
   drop constraint ckc_bentuk_media_pub_media_pu
go
alter table ref.media_publikasi 
   drop constraint ckc_jns_penerbit_media_pu
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_media_publikasi')
            and   type = 'U')
   drop table ref.tmp_media_publikasi
go

execute sp_rename 'ref.media_publikasi', tmp_media_publikasi
go

alter table ref.negara
   drop constraint pk_negara
go

alter table ref.negara 
   drop constraint ckc_benua_negara
go

alter table ref.negara
   drop constraint ckc_a_ln_negara
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_negara')
            and   type = 'U')
   drop table ref.tmp_negara
go

execute sp_rename 'ref.negara', tmp_negara
go

alter table ref.nilai_akred
   drop constraint pk_nilai_akred
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_nilai_akred')
            and   type = 'U')
   drop table ref.tmp_nilai_akred
go

execute sp_rename 'ref.nilai_akred', tmp_nilai_akred
go

alter table pdrd.nilai_tes
   drop constraint pk_nilai_tes
go

alter table pdrd.nilai_tes
   drop constraint ckc_soft_delete_nilai_te
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_nilai_tes')
            and   type = 'U')
   drop table pdrd.tmp_nilai_tes
go

execute sp_rename 'pdrd.nilai_tes', tmp_nilai_tes
go

alter table ref.pangkat_golongan
   drop constraint pk_pangkat_golongan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_pangkat_golongan')
            and   type = 'U')
   drop table ref.tmp_pangkat_golongan
go

execute sp_rename 'ref.pangkat_golongan', tmp_pangkat_golongan
go

alter table ref.pekerjaan
   drop constraint pk_pekerjaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_pekerjaan')
            and   type = 'U')
   drop table ref.tmp_pekerjaan
go

execute sp_rename 'ref.pekerjaan', tmp_pekerjaan
go

alter table ref.pembiayaan
   drop constraint pk_pembiayaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_pembiayaan')
            and   type = 'U')
   drop table ref.tmp_pembiayaan
go

execute sp_rename 'ref.pembiayaan', tmp_pembiayaan
go

alter table ref.penghasilan
   drop constraint pk_penghasilan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_penghasilan')
            and   type = 'U')
   drop table ref.tmp_penghasilan
go

execute sp_rename 'ref.penghasilan', tmp_penghasilan
go

alter table man_akses.peran
   drop constraint pk_peran
go

alter table man_akses.peran
   drop constraint ckc_a_perlu_sk_peran
go

if exists (select 1
            from  sysobjects
           where  id = object_id('man_akses.tmp_peran')
            and   type = 'U')
   drop table man_akses.tmp_peran
go

execute sp_rename 'man_akses.peran', tmp_peran
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

alter table ref.peta_katgiat_jabfung
   drop constraint pk_peta_katgiat_jabfung
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_peta_katgiat_jabfung')
            and   type = 'U')
   drop table ref.tmp_peta_katgiat_jabfung
go

execute sp_rename 'ref.peta_katgiat_jabfung', tmp_peta_katgiat_jabfung
go

alter table ref.peta_katgiat_jnsdok
   drop constraint pk_peta_katgiat_jnsdok
go

alter table ref.peta_katgiat_jnsdok
   drop constraint ckc_a_wajib_peta_kat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_peta_katgiat_jnsdok')
            and   type = 'U')
   drop table ref.tmp_peta_katgiat_jnsdok
go

execute sp_rename 'ref.peta_katgiat_jnsdok', tmp_peta_katgiat_jnsdok
go

alter table ref.peta_katgiat_jnspub
   drop constraint pk_peta_katgiat_jnspub
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_peta_katgiat_jnspub')
            and   type = 'U')
   drop table ref.tmp_peta_katgiat_jnspub
go

execute sp_rename 'ref.peta_katgiat_jnspub', tmp_peta_katgiat_jnspub
go

alter table pdrd.re_mk
   drop column id_basis_evaluasi
go

alter table pdrd.reg_ptk
   drop constraint pk_reg_ptk
go

alter table pdrd.reg_ptk
   drop constraint ckc_soft_delete_reg_ptk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_reg_ptk')
            and   type = 'U')
   drop table pdrd.tmp_reg_ptk
go

execute sp_rename 'pdrd.reg_ptk', tmp_reg_ptk
go

alter table ref.satuan
   drop constraint pk_satuan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_satuan')
            and   type = 'U')
   drop table ref.tmp_satuan
go

execute sp_rename 'ref.satuan', tmp_satuan
go

alter table pdrd.satuan_pendidikan
   drop constraint pk_satuan_pendidikan
go

alter table pdrd.satuan_pendidikan
   drop constraint ckc_a_mbs_satuan_p
go

alter table pdrd.satuan_pendidikan
   drop constraint ckc_a_lptk_satuan_p
go

alter table pdrd.satuan_pendidikan
   drop constraint ckc_soft_delete_satuan_p
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_satuan_pendidikan')
            and   type = 'U')
   drop table pdrd.tmp_satuan_pendidikan
go

execute sp_rename 'pdrd.satuan_pendidikan', tmp_satuan_pendidikan
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

alter table ref.semester
   drop constraint pk_semester
go

alter table ref.semester
   drop constraint ckc_a_periode_aktif_semester
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_semester')
            and   type = 'U')
   drop table ref.tmp_semester
go

execute sp_rename 'ref.semester', tmp_semester
go

alter table ref.skim_kegiatan
   drop constraint pk_skim_kegiatan
go

alter table ref.skim_kegiatan
   drop constraint ckc_jml_min_personil_skim_keg
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_skim_kegiatan')
            and   type = 'U')
   drop table ref.tmp_skim_kegiatan
go

execute sp_rename 'ref.skim_kegiatan', tmp_skim_kegiatan
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

alter table ref.status_anak
   drop constraint pk_status_anak
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_status_anak')
            and   type = 'U')
   drop table ref.tmp_status_anak
go

execute sp_rename 'ref.status_anak', tmp_status_anak
go

alter table ref.status_keaktifan_pegawai
   drop constraint pk_status_keaktifan_pegawai
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_status_keaktifan_pegawai')
            and   type = 'U')
   drop table ref.tmp_status_keaktifan_pegawai
go

execute sp_rename 'ref.status_keaktifan_pegawai', tmp_status_keaktifan_pegawai
go

alter table ref.status_kepegawaian
   drop constraint pk_status_kepegawaian
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_status_kepegawaian')
            and   type = 'U')
   drop table ref.tmp_status_kepegawaian
go

execute sp_rename 'ref.status_kepegawaian', tmp_status_kepegawaian
go

alter table ref.status_kepemilikan
   drop constraint pk_status_kepemilikan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_status_kepemilikan')
            and   type = 'U')
   drop table ref.tmp_status_kepemilikan
go

execute sp_rename 'ref.status_kepemilikan', tmp_status_kepemilikan
go

alter table ref.status_kerjasama
   drop constraint pk_status_kerjasama
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_status_kerjasama')
            and   type = 'U')
   drop table ref.tmp_status_kerjasama
go

execute sp_rename 'ref.status_kerjasama', tmp_status_kerjasama
go

alter table ref.status_mahasiswa
   drop constraint pk_status_mahasiswa
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_status_mahasiswa')
            and   type = 'U')
   drop table ref.tmp_status_mahasiswa
go

execute sp_rename 'ref.status_mahasiswa', tmp_status_mahasiswa
go

alter table ref.status_milik_sarpras
   drop constraint pk_status_milik_sarpras
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_status_milik_sarpras')
            and   type = 'U')
   drop table ref.tmp_status_milik_sarpras
go

execute sp_rename 'ref.status_milik_sarpras', tmp_status_milik_sarpras
go

alter table ref.sumber_air
   drop constraint pk_sumber_air
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_sumber_air')
            and   type = 'U')
   drop table ref.tmp_sumber_air
go

execute sp_rename 'ref.sumber_air', tmp_sumber_air
go

alter table ref.sumber_dana
   drop constraint pk_sumber_dana
go

alter table ref.sumber_dana
   drop constraint ckc_u_blockgrant_sumber_d
go

alter table ref.sumber_dana
   drop constraint ckc_u_beasiswa_sumber_d
go

alter table ref.sumber_dana
   drop constraint ckc_u_lit_sumber_d
go

alter table ref.sumber_dana
   drop constraint ckc_u_unit_usaha_sumber_d
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_sumber_dana')
            and   type = 'U')
   drop table ref.tmp_sumber_dana
go

execute sp_rename 'ref.sumber_dana', tmp_sumber_dana
go

alter table ref.sumber_gaji
   drop constraint pk_sumber_gaji
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_sumber_gaji')
            and   type = 'U')
   drop table ref.tmp_sumber_gaji
go

execute sp_rename 'ref.sumber_gaji', tmp_sumber_gaji
go

alter table ref.sumber_listrik
   drop constraint pk_sumber_listrik
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_sumber_listrik')
            and   type = 'U')
   drop table ref.tmp_sumber_listrik
go

execute sp_rename 'ref.sumber_listrik', tmp_sumber_listrik
go

alter table ref.tahun_ajaran
   drop constraint pk_tahun_ajaran
go

alter table ref.tahun_ajaran
   drop constraint ckc_a_periode_aktif_tahun_aj
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_tahun_ajaran')
            and   type = 'U')
   drop table ref.tmp_tahun_ajaran
go

execute sp_rename 'ref.tahun_ajaran', tmp_tahun_ajaran
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

alter table ref.tingkat_kerjasama
   drop constraint pk_tingkat_kerjasama
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_tingkat_kerjasama')
            and   type = 'U')
   drop table ref.tmp_tingkat_kerjasama
go

execute sp_rename 'ref.tingkat_kerjasama', tmp_tingkat_kerjasama
go

alter table ref.tingkat_penghargaan
   drop constraint pk_tingkat_penghargaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_tingkat_penghargaan')
            and   type = 'U')
   drop table ref.tmp_tingkat_penghargaan
go

execute sp_rename 'ref.tingkat_penghargaan', tmp_tingkat_penghargaan
go

alter table ref.tingkat_prestasi
   drop constraint pk_tingkat_prestasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_tingkat_prestasi')
            and   type = 'U')
   drop table ref.tmp_tingkat_prestasi
go

execute sp_rename 'ref.tingkat_prestasi', tmp_tingkat_prestasi
go

alter table ref.tse
   drop constraint pk_tse
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_tse')
            and   type = 'U')
   drop table ref.tmp_tse
go

execute sp_rename 'ref.tse', tmp_tse
go

alter table ref.wilayah
   drop constraint pk_wilayah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_wilayah')
            and   type = 'U')
   drop table ref.tmp_wilayah
go

execute sp_rename 'ref.wilayah', tmp_wilayah
go

/*==============================================================*/
/* Table: agama                                                 */
/*==============================================================*/
create table ref.agama (
   id_agama             smallint             not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_agama check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_agama check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_agama             varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_agama primary key (id_agama)
)
go

insert into ref.agama (id_agama, nm_agama, create_date, last_update, expired_date, last_sync)
select id_agama, nm_agama, create_date, last_update, expired_date, last_sync
from ref.tmp_agama
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_agama')
            and   type = 'U')
   drop table ref.tmp_agama
go

/*==============================================================*/
/* Table: akt_mhs                                               */
/*==============================================================*/
create table pdrd.akt_mhs (
   id_akt_mhs           uniqueidentifier     not null,
   id_jns_akt_mhs       numeric(2)           not null,
   id_sms               uniqueidentifier     not null,
   id_smt               char(5)              not null,
   judul_akt_mhs        varchar(500)         not null,
   lokasi_kegiatan      varchar(80)          null,
   sk_tugas             varchar(80)          null,
   tgl_sk_tugas         date                 null,
   ket_akt              text                 null,
   a_komunal            numeric(1)           not null default 0
      constraint ckc_a_komunal_akt_mhs check (a_komunal between 0 and 1 and a_komunal in (0,1)),
   tgl_mulai            datetime             null,
   tgl_selesai          datetime             null,
   a_flagship           numeric(1)           null default 0
      constraint ckc_a_flagship_akt_mhs check (a_flagship is null or (a_flagship between 0 and 1 and a_flagship in (0,1))),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_akt_mhs check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_akt_mhs primary key (id_akt_mhs)
)
go

insert into pdrd.akt_mhs (id_akt_mhs, id_jns_akt_mhs, id_sms, id_smt, judul_akt_mhs, lokasi_kegiatan, sk_tugas, tgl_sk_tugas, ket_akt, a_komunal, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_akt_mhs, id_jns_akt_mhs, id_sms, id_smt, judul_akt_mhs, lokasi_kegiatan, sk_tugas, tgl_sk_tugas, ket_akt, a_komunal, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_akt_mhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_akt_mhs')
            and   type = 'U')
   drop table pdrd.tmp_akt_mhs
go

/*==============================================================*/
/* Table: aktifitas_kerjasama                                   */
/*==============================================================*/
create table ref.aktifitas_kerjasama (
   id_akt_kerjasama     numeric(2)           identity,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_aktifita check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_aktifita check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_akt_kerjasama     varchar(100)         not null,
   ket                  varchar(250)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_aktifitas_kerjasama primary key (id_akt_kerjasama)
)
go

set identity_insert ref.aktifitas_kerjasama on
go

insert into ref.aktifitas_kerjasama (id_akt_kerjasama, nm_akt_kerjasama, ket, create_date, last_update, expired_date, last_sync)
select id_akt_kerjasama, nm_akt_kerjasama, ket, create_date, last_update, expired_date, last_sync
from ref.tmp_aktifitas_kerjasama
go

set identity_insert ref.aktifitas_kerjasama off
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_aktifitas_kerjasama')
            and   type = 'U')
   drop table ref.tmp_aktifitas_kerjasama
go

/*==============================================================*/
/* Table: basis_evaluasi                                        */
/*==============================================================*/
create table ref.basis_evaluasi (
   id_basis_evaluasi    numeric(2)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_basis_ev check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_basis_ev check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_basis_evaluasi    varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_basis_evaluasi primary key (id_basis_evaluasi)
)
go

insert into ref.basis_evaluasi (id_basis_evaluasi, nm_basis_evaluasi, create_date, last_update, expired_date, last_sync)
select id_basis_evaluasi, nm_basis_evaluasi, create_date, last_update, expired_date, last_sync
from ref.tmp_basis_evaluasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_basis_evaluasi')
            and   type = 'U')
   drop table ref.tmp_basis_evaluasi
go

/*==============================================================*/
/* Table: bentuk_kegiatan_kerjasama                             */
/*==============================================================*/
create table ref.bentuk_kegiatan_kerjasama (
   id_bntk_giat_kerjasama numeric(2)           identity,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_bentuk_k check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_bentuk_k check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_bntk_giat_kerjasama varchar(60)          not null,
   ket                  varchar(250)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_bentuk_kegiatan_kerjasama primary key (id_bntk_giat_kerjasama)
)
go

set identity_insert ref.bentuk_kegiatan_kerjasama on
go

insert into ref.bentuk_kegiatan_kerjasama (id_bntk_giat_kerjasama, nm_bntk_giat_kerjasama, ket, create_date, last_update, expired_date, last_sync)
select id_bntk_giat_kerjasama, nm_bntk_giat_kerjasama, ket, create_date, last_update, expired_date, last_sync
from ref.tmp_bentuk_kegiatan_kerjasama
go

set identity_insert ref.bentuk_kegiatan_kerjasama off
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_bentuk_kegiatan_kerjasama')
            and   type = 'U')
   drop table ref.tmp_bentuk_kegiatan_kerjasama
go

/*==============================================================*/
/* Table: bentuk_pendidikan                                     */
/*==============================================================*/
create table ref.bentuk_pendidikan (
   id_bp                smallint             not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_bentuk_p check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_bentuk_p check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_bp                varchar(50)          not null,
   a_jenj_paud          numeric(1)           not null default 0
      constraint ckc_a_jenj_paud_bentuk_p check (a_jenj_paud between 0 and 1 and a_jenj_paud in (0,1)),
   a_jenj_tk            numeric(1)           not null default 0
      constraint ckc_a_jenj_tk_bentuk_p check (a_jenj_tk between 0 and 1 and a_jenj_tk in (0,1)),
   a_jenj_sd            numeric(1)           not null default 0
      constraint ckc_a_jenj_sd_bentuk_p check (a_jenj_sd between 0 and 1 and a_jenj_sd in (0,1)),
   a_jenj_smp           numeric(1)           not null default 0
      constraint ckc_a_jenj_smp_bentuk_p check (a_jenj_smp between 0 and 1 and a_jenj_smp in (0,1)),
   a_jenj_sma           numeric(1)           not null default 0
      constraint ckc_a_jenj_sma_bentuk_p check (a_jenj_sma between 0 and 1 and a_jenj_sma in (0,1)),
   a_jenj_tinggi        numeric(1)           not null default 0
      constraint ckc_a_jenj_tinggi_bentuk_p check (a_jenj_tinggi between 0 and 1 and a_jenj_tinggi in (0,1)),
   dir_bina             varchar(40)          null,
   a_aktif              numeric(1)           not null default 1
      constraint ckc_a_aktif_bentuk_p check (a_aktif between 0 and 1 and a_aktif in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_bentuk_pendidikan primary key (id_bp)
)
go

insert into ref.bentuk_pendidikan (id_bp, nm_bp, a_jenj_paud, a_jenj_tk, a_jenj_sd, a_jenj_smp, a_jenj_sma, a_jenj_tinggi, dir_bina, a_aktif, create_date, last_update, expired_date, last_sync)
select id_bp, nm_bp, a_jenj_paud, a_jenj_tk, a_jenj_sd, a_jenj_smp, a_jenj_sma, a_jenj_tinggi, dir_bina, a_aktif, create_date, last_update, expired_date, last_sync
from ref.tmp_bentuk_pendidikan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_bentuk_pendidikan')
            and   type = 'U')
   drop table ref.tmp_bentuk_pendidikan
go

/*==============================================================*/
/* Table: bidang_kerjasama                                      */
/*==============================================================*/
create table ref.bidang_kerjasama (
   id_bid_kerjasama     numeric(2)           identity,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_bidang_k check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_bidang_k check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_bid_kerjasama     varchar(60)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_bidang_kerjasama primary key (id_bid_kerjasama)
)
go

set identity_insert ref.bidang_kerjasama on
go

insert into ref.bidang_kerjasama (id_bid_kerjasama, nm_bid_kerjasama, create_date, last_update, expired_date, last_sync)
select id_bid_kerjasama, nm_bid_kerjasama, create_date, last_update, expired_date, last_sync
from ref.tmp_bidang_kerjasama
go

set identity_insert ref.bidang_kerjasama off
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_bidang_kerjasama')
            and   type = 'U')
   drop table ref.tmp_bidang_kerjasama
go

/*==============================================================*/
/* Table: bidang_pekerjaan                                      */
/*==============================================================*/
create table ref.bidang_pekerjaan (
   id_bid_kerja         numeric(2)           identity,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_bidang_p check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_bidang_p check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_bid_kerja         varchar(120)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_bidang_pekerjaan primary key (id_bid_kerja)
)
go

set identity_insert ref.bidang_pekerjaan on
go

insert into ref.bidang_pekerjaan (id_bid_kerja, nm_bid_kerja, create_date, last_update, expired_date, last_sync)
select id_bid_kerja, nm_bid_kerja, create_date, last_update, expired_date, last_sync
from ref.tmp_bidang_pekerjaan
go

set identity_insert ref.bidang_pekerjaan off
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_bidang_pekerjaan')
            and   type = 'U')
   drop table ref.tmp_bidang_pekerjaan
go

/*==============================================================*/
/* Table: bidang_studi                                          */
/*==============================================================*/
create table ref.bidang_studi (
   id_bid_studi         int                  not null,
   id_induk_bidang_studi int                  null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_bidang_s check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_bidang_s check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   kode_bid_studi       varchar(22)          null,
   nm_bid_studi         varchar(100)         not null,
   a_kel                numeric(1)           not null default 0
      constraint ckc_a_kel_bidang_s check (a_kel between 0 and 1 and a_kel in (0,1)),
   a_jenj_paud          numeric(1)           not null default 0
      constraint ckc_a_jenj_paud_bidang_s check (a_jenj_paud between 0 and 1 and a_jenj_paud in (0,1)),
   a_jenj_tk            numeric(1)           not null default 0
      constraint ckc_a_jenj_tk_bidang_s check (a_jenj_tk between 0 and 1 and a_jenj_tk in (0,1)),
   a_jenj_sd            numeric(1)           not null default 0
      constraint ckc_a_jenj_sd_bidang_s check (a_jenj_sd between 0 and 1 and a_jenj_sd in (0,1)),
   a_jenj_smp           numeric(1)           not null default 0
      constraint ckc_a_jenj_smp_bidang_s check (a_jenj_smp between 0 and 1 and a_jenj_smp in (0,1)),
   a_jenj_sma           numeric(1)           not null default 0
      constraint ckc_a_jenj_sma_bidang_s check (a_jenj_sma between 0 and 1 and a_jenj_sma in (0,1)),
   a_jenj_tinggi        numeric(1)           not null default 0
      constraint ckc_a_jenj_tinggi_bidang_s check (a_jenj_tinggi between 0 and 1 and a_jenj_tinggi in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_bidang_studi primary key (id_bid_studi)
)
go

insert into ref.bidang_studi (id_bid_studi, id_induk_bidang_studi, kode_bid_studi, nm_bid_studi, a_kel, a_jenj_paud, a_jenj_tk, a_jenj_sd, a_jenj_smp, a_jenj_sma, a_jenj_tinggi, create_date, last_update, expired_date, last_sync)
select id_bid_studi, id_induk_bidang_studi, kode_bid_studi, nm_bid_studi, a_kel, a_jenj_paud, a_jenj_tk, a_jenj_sd, a_jenj_smp, a_jenj_sma, a_jenj_tinggi, create_date, last_update, expired_date, last_sync
from ref.tmp_bidang_studi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_bidang_studi')
            and   type = 'U')
   drop table ref.tmp_bidang_studi
go

/*==============================================================*/
/* Table: bidang_usaha                                          */
/*==============================================================*/
create table ref.bidang_usaha (
   id_bu                char(10)             not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_bidang_u check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_bidang_u check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_bu                varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_bidang_usaha primary key (id_bu)
)
go

insert into ref.bidang_usaha (id_bu, nm_bu, create_date, last_update, expired_date, last_sync)
select id_bu, nm_bu, create_date, last_update, expired_date, last_sync
from ref.tmp_bidang_usaha
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_bidang_usaha')
            and   type = 'U')
   drop table ref.tmp_bidang_usaha
go

/*==============================================================*/
/* Table: detail_iku_1                                          */
/*==============================================================*/
create table dashboard.detail_iku_1 (
   id_detail_iku_1      uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_tahun_anggaran    numeric(4)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_detail_i2 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_detail_i2 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
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

insert into dashboard.detail_iku_1 (id_detail_iku_1, id_sms, id_tahun_anggaran, total_bekerja, total_tidak_bekerja, total_wirausaha, total_studi, total_lulusan, total_per_kategori, persentase_iku, create_date, last_update, expired_date, last_sync)
select id_detail_iku_1, id_sms, id_tahun_anggaran, total_bekerja, total_tidak_bekerja, total_wirausaha, total_studi, total_lulusan, total_per_kategori, persentase_iku, create_date, last_update, expired_date, last_sync
from dashboard.tmp_detail_iku_1
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dashboard.tmp_detail_iku_1')
            and   type = 'U')
   drop table dashboard.tmp_detail_iku_1
go

/*==============================================================*/
/* Table: detail_iku_2                                          */
/*==============================================================*/
create table dashboard.detail_iku_2 (
   id_detail_iku_2      uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_tahun_anggaran    numeric(4)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_detail_i3 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_detail_i3 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
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

insert into dashboard.detail_iku_2 (id_detail_iku_2, id_sms, id_tahun_anggaran, total_mahasiswa, total_tidak_masuk_kategori, total_mbkm, total_prestasi, total_lebih_20sks, total_luar_pt, total_dalam_pt, total_nasional_1, total_nasional_2, total_nasional_3, total_internasional_1, total_internasional_2, total_internasional_3, create_date, last_update, expired_date, last_sync)
select id_detail_iku_2, id_sms, id_tahun_anggaran, total_mahasiswa, total_tidak_masuk_kategori, total_mbkm, total_prestasi, total_lebih_20sks, total_luar_pt, total_dalam_pt, total_nasional_1, total_nasional_2, total_nasional_3, total_internasional_1, total_internasional_2, total_internasional_3, create_date, last_update, expired_date, last_sync
from dashboard.tmp_detail_iku_2
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dashboard.tmp_detail_iku_2')
            and   type = 'U')
   drop table dashboard.tmp_detail_iku_2
go

/*==============================================================*/
/* Table: detail_iku_3                                          */
/*==============================================================*/
create table dashboard.detail_iku_3 (
   id_detail_iku_3      uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_tahun_anggaran    numeric(4)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_detail_i4 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_detail_i4 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
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

insert into dashboard.detail_iku_3 (id_detail_iku_3, id_sms, id_tahun_anggaran, total_dosen_nidk, total_dosen_nidn, total_diklat_qs100, total_dosen_praktisi, create_date, last_update, expired_date, last_sync)
select id_detail_iku_3, id_sms, id_tahun_anggaran, total_dosen_nidk, total_dosen_nidn, total_diklat_qs100, total_dosen_praktisi, create_date, last_update, expired_date, last_sync
from dashboard.tmp_detail_iku_3
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dashboard.tmp_detail_iku_3')
            and   type = 'U')
   drop table dashboard.tmp_detail_iku_3
go

/*==============================================================*/
/* Table: detail_iku_4                                          */
/*==============================================================*/
create table dashboard.detail_iku_4 (
   id_detail_iku_4      uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_tahun_anggaran    numeric(4)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_detail_i5 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_detail_i5 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
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

insert into dashboard.detail_iku_4 (id_detail_iku_4, id_sms, id_tahun_anggaran, total_dosen_nidn, total_dosen_nidk, total_dosen_s3, total_dosen_praktisi, total_dosen_tersertifikasi, create_date, last_update, expired_date, last_sync)
select id_detail_iku_4, id_sms, id_tahun_anggaran, total_dosen_nidn, total_dosen_nidk, total_dosen_s3, total_dosen_praktisi, total_dosen_tersertifikasi, create_date, last_update, expired_date, last_sync
from dashboard.tmp_detail_iku_4
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dashboard.tmp_detail_iku_4')
            and   type = 'U')
   drop table dashboard.tmp_detail_iku_4
go

/*==============================================================*/
/* Table: detail_iku_5                                          */
/*==============================================================*/
create table dashboard.detail_iku_5 (
   id_detail_iku_5      uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_tahun_anggaran    numeric(4)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_detail_i6 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_detail_i6 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
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

insert into dashboard.detail_iku_5 (id_detail_iku_5, id_sms, id_tahun_anggaran, total_dosen_tetap, total_luaran_kti, total_luaran_karya_terapan, total_luaran_karya_seni, total_luaran_paten, create_date, last_update, expired_date, last_sync)
select id_detail_iku_5, id_sms, id_tahun_anggaran, total_dosen_tetap, total_luaran_kti, total_luaran_karya_terapan, total_luaran_karya_seni, total_luaran_paten, create_date, last_update, expired_date, last_sync
from dashboard.tmp_detail_iku_5
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dashboard.tmp_detail_iku_5')
            and   type = 'U')
   drop table dashboard.tmp_detail_iku_5
go

/*==============================================================*/
/* Table: detail_iku_7                                          */
/*==============================================================*/
create table dashboard.detail_iku_7 (
   id_detail_iku_7      uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_tahun_anggaran    numeric(4)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_detail_i check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_detail_i check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   total_mk_case_method numeric(8)           null,
   total_mk_team_base_project numeric(8)           null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_detail_iku_7 primary key (id_detail_iku_7)
)
go

insert into dashboard.detail_iku_7 (id_detail_iku_7, id_sms, id_tahun_anggaran, total_mk_case_method, total_mk_team_base_project, create_date, last_update, expired_date, last_sync)
select id_detail_iku_7, id_sms, id_tahun_anggaran, total_mk_case_method, total_mk_team_base_project, create_date, last_update, expired_date, last_sync
from dashboard.tmp_detail_iku_7
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dashboard.tmp_detail_iku_7')
            and   type = 'U')
   drop table dashboard.tmp_detail_iku_7
go

/*==============================================================*/
/* Table: diklat                                                */
/*==============================================================*/
create table pdrd.diklat (
   id_diklat            uniqueidentifier     not null,
   id_sp                uniqueidentifier     null,
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
   a_valid              numeric(1)           null default 0
      constraint ckc_a_valid_diklat check (a_valid is null or (a_valid between 0 and 1 and a_valid in (0,1))),
   tgl_validasi         datetime             null,
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

insert into pdrd.diklat (id_diklat, id_sdm, id_kel_bidang, id_katgiat, id_jns_diklat, nm_diklat, penyelenggara, thn, peran, tkt, jml_jam, no_sert, tgl_sert, tempat, tgl_mulai, tgl_selesai, sk_tugas, tgl_sk_tugas, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_diklat, id_sdm, id_kel_bidang, id_katgiat, id_jns_diklat, nm_diklat, penyelenggara, thn, peran, tkt, jml_jam, no_sert, tgl_sert, tempat, tgl_mulai, tgl_selesai, sk_tugas, tgl_sk_tugas, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_diklat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_diklat')
            and   type = 'U')
   drop table pdrd.tmp_diklat
go

/*==============================================================*/
/* Table: fungsi_lab                                            */
/*==============================================================*/
create table ref.fungsi_lab (
   id_fungsi_lab        char(1)              not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_fungsi_l check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_fungsi_l check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_fungsi_lab        varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_fungsi_lab primary key (id_fungsi_lab)
)
go

insert into ref.fungsi_lab (id_fungsi_lab, nm_fungsi_lab, create_date, last_update, expired_date, last_sync)
select id_fungsi_lab, nm_fungsi_lab, create_date, last_update, expired_date, last_sync
from ref.tmp_fungsi_lab
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_fungsi_lab')
            and   type = 'U')
   drop table ref.tmp_fungsi_lab
go

/*==============================================================*/
/* Table: gelar_akademik                                        */
/*==============================================================*/
create table ref.gelar_akademik (
   id_gelar_akad        int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_gelar_ak check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_gelar_ak check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   singkat_gelar        varchar(30)          not null,
   nm_gelar_akad        varchar(80)          not null,
   posisi_gelar         numeric(1)           not null 
      constraint ckc_posisi_gelar_gelar_ak check (posisi_gelar in (1,2)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_gelar_akademik primary key (id_gelar_akad)
)
go

insert into ref.gelar_akademik (id_gelar_akad, singkat_gelar, nm_gelar_akad, posisi_gelar, create_date, last_update, expired_date, last_sync)
select id_gelar_akad, singkat_gelar, nm_gelar_akad, posisi_gelar, create_date, last_update, expired_date, last_sync
from ref.tmp_gelar_akademik
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_gelar_akademik')
            and   type = 'U')
   drop table ref.tmp_gelar_akademik
go

/*==============================================================*/
/* Table: ikatan_kerja_sdm                                      */
/*==============================================================*/
create table ref.ikatan_kerja_sdm (
   id_ikatan_kerja      char(1)              not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_ikatan_k check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_ikatan_k check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_ikatan_kerja      varchar(50)          not null,
   ket_ikatan_kerja     varchar(150)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_ikatan_kerja_sdm primary key (id_ikatan_kerja)
)
go

insert into ref.ikatan_kerja_sdm (id_ikatan_kerja, nm_ikatan_kerja, ket_ikatan_kerja, create_date, last_update, expired_date, last_sync)
select id_ikatan_kerja, nm_ikatan_kerja, ket_ikatan_kerja, create_date, last_update, expired_date, last_sync
from ref.tmp_ikatan_kerja_sdm
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_ikatan_kerja_sdm')
            and   type = 'U')
   drop table ref.tmp_ikatan_kerja_sdm
go

/*==============================================================*/
/* Table: jab_tgs                                               */
/*==============================================================*/
create table ref.jab_tgs (
   id_jab_tgs           numeric(5)           not null,
   id_kel_prof          numeric(5)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jab_tgs check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jab_tgs check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jab_tgs           varchar(50)          not null,
   a_jab_utama_sek      numeric(1)           not null default 0
      constraint ckc_a_jab_utama_sek_jab_tgs check (a_jab_utama_sek between 0 and 1 and a_jab_utama_sek in (0,1)),
   a_jab_utama_pt       numeric(1)           not null default 0
      constraint ckc_a_jab_utama_pt_jab_tgs check (a_jab_utama_pt between 0 and 1 and a_jab_utama_pt in (0,1)),
   a_jab_utama_lpnk     numeric(1)           not null default 0
      constraint ckc_a_jab_utama_lpnk_jab_tgs check (a_jab_utama_lpnk between 0 and 1 and a_jab_utama_lpnk in (0,1)),
   a_jab_utama_lpk      numeric(1)           not null default 0
      constraint ckc_a_jab_utama_lpk_jab_tgs check (a_jab_utama_lpk between 0 and 1 and a_jab_utama_lpk in (0,1)),
   jml_jam_diakui       numeric(2)           null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jab_tgs primary key (id_jab_tgs)
)
go

insert into ref.jab_tgs (id_jab_tgs, id_kel_prof, nm_jab_tgs, a_jab_utama_sek, a_jab_utama_pt, a_jab_utama_lpnk, a_jab_utama_lpk, jml_jam_diakui, create_date, last_update, expired_date, last_sync)
select id_jab_tgs, id_kel_prof, nm_jab_tgs, a_jab_utama_sek, a_jab_utama_pt, a_jab_utama_lpnk, a_jab_utama_lpk, jml_jam_diakui, create_date, last_update, expired_date, last_sync
from ref.tmp_jab_tgs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jab_tgs')
            and   type = 'U')
   drop table ref.tmp_jab_tgs
go

/*==============================================================*/
/* Table: jabfung                                               */
/*==============================================================*/
create table ref.jabfung (
   id_jabfung           numeric(5)           not null,
   id_kel_prof          numeric(5)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jabfung check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jabfung check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jabfung           varchar(50)          not null,
   angka_kredit         numeric(7,2)         null default 0,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jabfung primary key (id_jabfung)
)
go

insert into ref.jabfung (id_jabfung, id_kel_prof, nm_jabfung, angka_kredit, create_date, last_update, expired_date, last_sync)
select id_jabfung, id_kel_prof, nm_jabfung, angka_kredit, create_date, last_update, expired_date, last_sync
from ref.tmp_jabfung
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jabfung')
            and   type = 'U')
   drop table ref.tmp_jabfung
go

/*==============================================================*/
/* Table: jalur_daftar                                          */
/*==============================================================*/
create table ref.jalur_daftar (
   id_jalur_daftar      numeric              identity,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jalur_da check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jalur_da check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jalur_daftar      varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jalur_daftar primary key (id_jalur_daftar)
)
go

set identity_insert ref.jalur_daftar on
go

insert into ref.jalur_daftar (id_jalur_daftar, nm_jalur_daftar, create_date, last_update, expired_date, last_sync)
select id_jalur_daftar, nm_jalur_daftar, create_date, last_update, expired_date, last_sync
from ref.tmp_jalur_daftar
go

set identity_insert ref.jalur_daftar off
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jalur_daftar')
            and   type = 'U')
   drop table ref.tmp_jalur_daftar
go

/*==============================================================*/
/* Table: jenis_akt_mhs                                         */
/*==============================================================*/
create table ref.jenis_akt_mhs (
   id_jns_akt_mhs       numeric(2)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_ak check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_ak check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_akt_mhs       varchar(50)          not null,
   ket_jns_akt_mhs      varchar(100)         null,
   a_kegiatan_kampus_merdeka numeric(1)           not null default 0
      constraint ckc_a_kegiatan_kampus_jenis_ak check (a_kegiatan_kampus_merdeka between 0 and 1 and a_kegiatan_kampus_merdeka in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_akt_mhs primary key (id_jns_akt_mhs)
)
go

insert into ref.jenis_akt_mhs (id_jns_akt_mhs, nm_jns_akt_mhs, ket_jns_akt_mhs, a_kegiatan_kampus_merdeka, create_date, last_update, expired_date, last_sync)
select id_jns_akt_mhs, nm_jns_akt_mhs, ket_jns_akt_mhs, a_kegiatan_kampus_merdeka, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_akt_mhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_akt_mhs')
            and   type = 'U')
   drop table ref.tmp_jenis_akt_mhs
go

/*==============================================================*/
/* Table: jenis_bahan_ajar                                      */
/*==============================================================*/
create table ref.jenis_bahan_ajar (
   id_jns_bhn_ajar      int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_ba check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_ba check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_bhn_ajar      varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_bahan_ajar primary key (id_jns_bhn_ajar)
)
go

insert into ref.jenis_bahan_ajar (id_jns_bhn_ajar, nm_jns_bhn_ajar, create_date, last_update, expired_date, last_sync)
select id_jns_bhn_ajar, nm_jns_bhn_ajar, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_bahan_ajar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_bahan_ajar')
            and   type = 'U')
   drop table ref.tmp_jenis_bahan_ajar
go

/*==============================================================*/
/* Table: jenis_beasiswa                                        */
/*==============================================================*/
create table ref.jenis_beasiswa (
   id_jns_beasiswa      int                  not null,
   id_sumber_dana       numeric(4)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_be check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_be check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_beasiswa      varchar(50)          not null,
   u_pd                 numeric(1)           not null default 1
      constraint ckc_u_pd_jenis_be check (u_pd between 0 and 1 and u_pd in (0,1)),
   u_ptk                numeric(1)           not null default 0
      constraint ckc_u_ptk_jenis_be check (u_ptk between 0 and 1 and u_ptk in (0,1)),
   u_non_ca             numeric(1)           not null default 0
      constraint ckc_u_non_ca_jenis_be check (u_non_ca between 0 and 1 and u_non_ca in (0,1)),
   kat_beasiswa         numeric(1)           null 
      constraint ckc_kat_beasiswa_jenis_be check (kat_beasiswa is null or (kat_beasiswa in (1,2,3))),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_beasiswa primary key (id_jns_beasiswa)
)
go

insert into ref.jenis_beasiswa (id_jns_beasiswa, id_sumber_dana, nm_jns_beasiswa, u_pd, u_ptk, u_non_ca, kat_beasiswa, create_date, last_update, expired_date, last_sync)
select id_jns_beasiswa, id_sumber_dana, nm_jns_beasiswa, u_pd, u_ptk, u_non_ca, kat_beasiswa, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_beasiswa
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_beasiswa')
            and   type = 'U')
   drop table ref.tmp_jenis_beasiswa
go

/*==============================================================*/
/* Table: jenis_diklat                                          */
/*==============================================================*/
create table ref.jenis_diklat (
   id_jns_diklat        int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_di check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_di check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_diklat        varchar(50)          not null,
   u_guru               numeric(1)           not null default 0
      constraint ckc_u_guru_jenis_di check (u_guru between 0 and 1 and u_guru in (0,1)),
   u_dosen              numeric(1)           not null default 0
      constraint ckc_u_dosen_jenis_di check (u_dosen between 0 and 1 and u_dosen in (0,1)),
   u_tendik             numeric(1)           not null default 0
      constraint ckc_u_tendik_jenis_di check (u_tendik between 0 and 1 and u_tendik in (0,1)),
   a_validasi           numeric(1)           not null default 0
      constraint ckc_a_validasi_jenis_di check (a_validasi between 0 and 1 and a_validasi in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_diklat primary key (id_jns_diklat)
)
go

insert into ref.jenis_diklat (id_jns_diklat, nm_jns_diklat, u_guru, u_dosen, u_tendik, create_date, last_update, expired_date, last_sync)
select id_jns_diklat, nm_jns_diklat, u_guru, u_dosen, u_tendik, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_diklat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_diklat')
            and   type = 'U')
   drop table ref.tmp_jenis_diklat
go

/*==============================================================*/
/* Table: jenis_dokumen                                         */
/*==============================================================*/
create table ref.jenis_dokumen (
   id_jns_dok           int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_do check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_do check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_dok           varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_dokumen primary key (id_jns_dok)
)
go

insert into ref.jenis_dokumen (id_jns_dok, nm_jns_dok, create_date, last_update, expired_date, last_sync)
select id_jns_dok, nm_jns_dok, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_dokumen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_dokumen')
            and   type = 'U')
   drop table ref.tmp_jenis_dokumen
go

/*==============================================================*/
/* Table: jenis_evaluasi                                        */
/*==============================================================*/
create table ref.jenis_evaluasi (
   id_jns_eval          smallint             not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_ev check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_ev check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_eval          varchar(50)          not null,
   ket_jns_eval         varchar(100)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_evaluasi primary key (id_jns_eval)
)
go

insert into ref.jenis_evaluasi (id_jns_eval, nm_jns_eval, ket_jns_eval, create_date, last_update, expired_date, last_sync)
select id_jns_eval, nm_jns_eval, ket_jns_eval, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_evaluasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_evaluasi')
            and   type = 'U')
   drop table ref.tmp_jenis_evaluasi
go

/*==============================================================*/
/* Table: jenis_hapus_buku                                      */
/*==============================================================*/
create table ref.jenis_hapus_buku (
   id_hapus_buku        char(1)              not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_ha check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_ha check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   ket_hapus_buku       varchar(80)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_hapus_buku primary key (id_hapus_buku)
)
go

insert into ref.jenis_hapus_buku (id_hapus_buku, ket_hapus_buku, create_date, last_update, expired_date, last_sync)
select id_hapus_buku, ket_hapus_buku, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_hapus_buku
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_hapus_buku')
            and   type = 'U')
   drop table ref.tmp_jenis_hapus_buku
go

/*==============================================================*/
/* Table: jenis_jalur_pekerjaan                                 */
/*==============================================================*/
create table ref.jenis_jalur_pekerjaan (
   id_jns_jalur_kerja   numeric(2)           identity,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_ja check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_ja check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_jalur_kerja   varchar(80)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_jalur_pekerjaan primary key (id_jns_jalur_kerja)
)
go

set identity_insert ref.jenis_jalur_pekerjaan on
go

insert into ref.jenis_jalur_pekerjaan (id_jns_jalur_kerja, nm_jns_jalur_kerja, create_date, last_update, expired_date, last_sync)
select id_jns_jalur_kerja, nm_jns_jalur_kerja, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_jalur_pekerjaan
go

set identity_insert ref.jenis_jalur_pekerjaan off
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_jalur_pekerjaan')
            and   type = 'U')
   drop table ref.tmp_jenis_jalur_pekerjaan
go

/*==============================================================*/
/* Table: jenis_keluar                                          */
/*==============================================================*/
create table ref.jenis_keluar (
   id_jns_keluar        char(1)              not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_ke2 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_ke2 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   ket_keluar           varchar(40)          not null,
   a_pd                 numeric(1)           not null default 0
      constraint ckc_a_pd_jenis_ke check (a_pd between 0 and 1 and a_pd in (0,1)),
   a_ptk                numeric(1)           not null default 0
      constraint ckc_a_ptk_jenis_ke check (a_ptk between 0 and 1 and a_ptk in (0,1)),
   a_sdm_iptek          numeric(1)           not null default 0
      constraint ckc_a_sdm_iptek_jenis_ke check (a_sdm_iptek between 0 and 1 and a_sdm_iptek in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_keluar primary key (id_jns_keluar)
)
go

insert into ref.jenis_keluar (id_jns_keluar, ket_keluar, a_pd, a_ptk, a_sdm_iptek, create_date, last_update, expired_date, last_sync)
select id_jns_keluar, ket_keluar, a_pd, a_ptk, a_sdm_iptek, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_keluar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_keluar')
            and   type = 'U')
   drop table ref.tmp_jenis_keluar
go

/*==============================================================*/
/* Table: jenis_kepanitiaan                                     */
/*==============================================================*/
create table ref.jenis_kepanitiaan (
   id_jns_panitia       int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_ke check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_ke check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_panitia       varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_kepanitiaan primary key (id_jns_panitia)
)
go

insert into ref.jenis_kepanitiaan (id_jns_panitia, nm_jns_panitia, create_date, last_update, expired_date, last_sync)
select id_jns_panitia, nm_jns_panitia, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_kepanitiaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_kepanitiaan')
            and   type = 'U')
   drop table ref.tmp_jenis_kepanitiaan
go

/*==============================================================*/
/* Table: jenis_kesejahteraan                                   */
/*==============================================================*/
create table ref.jenis_kesejahteraan (
   id_jns_sejahtera     int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_ke3 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_ke3 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_sejahtera     varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_kesejahteraan primary key (id_jns_sejahtera)
)
go

insert into ref.jenis_kesejahteraan (id_jns_sejahtera, nm_jns_sejahtera, create_date, last_update, expired_date, last_sync)
select id_jns_sejahtera, nm_jns_sejahtera, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_kesejahteraan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_kesejahteraan')
            and   type = 'U')
   drop table ref.tmp_jenis_kesejahteraan
go

/*==============================================================*/
/* Table: jenis_keuangan                                        */
/*==============================================================*/
create table ref.jenis_keuangan (
   id_jns_keuangan      int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_ke4 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_ke4 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_keuangan      varchar(100)         not null,
   a_pengeluaran        numeric(1)           not null default 0
      constraint ckc_a_pengeluaran_jenis_ke check (a_pengeluaran between 0 and 1 and a_pengeluaran in (0,1)),
   a_pemasukan          numeric(1)           not null default 0
      constraint ckc_a_pemasukan_jenis_ke check (a_pemasukan between 0 and 1 and a_pemasukan in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_keuangan primary key (id_jns_keuangan)
)
go

insert into ref.jenis_keuangan (id_jns_keuangan, nm_jns_keuangan, a_pengeluaran, a_pemasukan, create_date, last_update, expired_date, last_sync)
select id_jns_keuangan, nm_jns_keuangan, a_pengeluaran, a_pemasukan, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_keuangan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_keuangan')
            and   type = 'U')
   drop table ref.tmp_jenis_keuangan
go

/*==============================================================*/
/* Table: jenis_lembaga                                         */
/*==============================================================*/
create table ref.jenis_lembaga (
   id_jns_lemb          numeric(5)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_le check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_le check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_lemb          varchar(100)         not null,
   a_sp                 numeric(1)           not null default 0
      constraint ckc_a_sp_jenis_le check (a_sp between 0 and 1 and a_sp in (0,1)),
   a_lemb_akred         numeric(1)           not null default 0
      constraint ckc_a_lemb_akred_jenis_le check (a_lemb_akred between 0 and 1 and a_lemb_akred in (0,1)),
   a_pengelola_pendidikan numeric(1)           not null default 0
      constraint ckc_a_pengelola_pendi_jenis_le check (a_pengelola_pendidikan between 0 and 1 and a_pengelola_pendidikan in (0,1)),
   a_sms                numeric(1)           not null default 0
      constraint ckc_a_sms_jenis_le check (a_sms between 0 and 1 and a_sms in (0,1)),
   a_tmpt_pengawas      numeric(1)           not null default 0
      constraint ckc_a_tmpt_pengawas_jenis_le check (a_tmpt_pengawas between 0 and 1 and a_tmpt_pengawas in (0,1)),
   a_lemb_iptek         numeric(1)           not null default 0
      constraint ckc_a_lemb_iptek_jenis_le check (a_lemb_iptek between 0 and 1 and a_lemb_iptek in (0,1)),
   a_smi                numeric(1)           not null default 0
      constraint ckc_a_smi_jenis_le check (a_smi between 0 and 1 and a_smi in (0,1)),
   sort                 int                  null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_lembaga primary key (id_jns_lemb)
)
go

insert into ref.jenis_lembaga (id_jns_lemb, nm_jns_lemb, a_sp, a_lemb_akred, a_pengelola_pendidikan, a_sms, a_tmpt_pengawas, a_lemb_iptek, a_smi, sort, create_date, last_update, expired_date, last_sync)
select id_jns_lemb, nm_jns_lemb, a_sp, a_lemb_akred, a_pengelola_pendidikan, a_sms, a_tmpt_pengawas, a_lemb_iptek, a_smi, sort, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_lembaga
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_lembaga')
            and   type = 'U')
   drop table ref.tmp_jenis_lembaga
go

/*==============================================================*/
/* Table: jenis_media_pub                                       */
/*==============================================================*/
create table ref.jenis_media_pub (
   id_jns_media         numeric(2)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_me check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_me check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_media         varchar(80)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_media_pub primary key (id_jns_media)
)
go

insert into ref.jenis_media_pub (id_jns_media, nm_jns_media, create_date, last_update, expired_date, last_sync)
select id_jns_media, nm_jns_media, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_media_pub
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_media_pub')
            and   type = 'U')
   drop table ref.tmp_jenis_media_pub
go

/*==============================================================*/
/* Table: jenis_pendaftaran                                     */
/*==============================================================*/
create table ref.jenis_pendaftaran (
   id_jns_daftar        numeric(2)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_pe2 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_pe2 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_daftar        varchar(60)          not null,
   u_daftar_sekolah     numeric(1)           not null default 0
      constraint ckc_u_daftar_sekolah_jenis_pe check (u_daftar_sekolah between 0 and 1 and u_daftar_sekolah in (0,1)),
   u_daftar_rombel      numeric(1)           not null default 0
      constraint ckc_u_daftar_rombel_jenis_pe check (u_daftar_rombel between 0 and 1 and u_daftar_rombel in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_pendaftaran primary key (id_jns_daftar)
)
go

insert into ref.jenis_pendaftaran (id_jns_daftar, nm_jns_daftar, u_daftar_sekolah, u_daftar_rombel, create_date, last_update, expired_date, last_sync)
select id_jns_daftar, nm_jns_daftar, u_daftar_sekolah, u_daftar_rombel, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_pendaftaran
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_pendaftaran')
            and   type = 'U')
   drop table ref.tmp_jenis_pendaftaran
go

/*==============================================================*/
/* Table: jenis_penelitian                                      */
/*==============================================================*/
create table ref.jenis_penelitian (
   id_jns_lit           numeric(4)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_pe check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_pe check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_lit           varchar(100)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_penelitian primary key (id_jns_lit)
)
go

insert into ref.jenis_penelitian (id_jns_lit, nm_jns_lit, create_date, last_update, expired_date, last_sync)
select id_jns_lit, nm_jns_lit, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_penelitian
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_penelitian')
            and   type = 'U')
   drop table ref.tmp_jenis_penelitian
go

/*==============================================================*/
/* Table: jenis_penghargaan                                     */
/*==============================================================*/
create table ref.jenis_penghargaan (
   id_jns_penghargaan   int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_pe3 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_pe3 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_penghargaan   varchar(160)         not null,
   u_sdm                numeric(1)           null default 0
      constraint ckc_u_sdm_jenis_pe check (u_sdm is null or (u_sdm between 0 and 1 and u_sdm in (0,1))),
   u_lembaga            numeric(1)           null default 0
      constraint ckc_u_lembaga_jenis_pe check (u_lembaga is null or (u_lembaga between 0 and 1 and u_lembaga in (0,1))),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_penghargaan primary key (id_jns_penghargaan)
)
go

insert into ref.jenis_penghargaan (id_jns_penghargaan, nm_jns_penghargaan, u_sdm, u_lembaga, create_date, last_update, expired_date, last_sync)
select id_jns_penghargaan, nm_jns_penghargaan, u_sdm, u_lembaga, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_penghargaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_penghargaan')
            and   type = 'U')
   drop table ref.tmp_jenis_penghargaan
go

/*==============================================================*/
/* Table: jenis_prasarana                                       */
/*==============================================================*/
create table ref.jenis_prasarana (
   id_jns_prasarana     int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_pr check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_pr check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_prasarana     varchar(250)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_prasarana primary key (id_jns_prasarana)
)
go

insert into ref.jenis_prasarana (id_jns_prasarana, nm_jns_prasarana, create_date, last_update, expired_date, last_sync)
select id_jns_prasarana, nm_jns_prasarana, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_prasarana
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_prasarana')
            and   type = 'U')
   drop table ref.tmp_jenis_prasarana
go

/*==============================================================*/
/* Table: jenis_prestasi                                        */
/*==============================================================*/
create table ref.jenis_prestasi (
   id_jenis_prestasi    int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_pr2 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_pr2 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jenis_prestasi    varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_prestasi primary key (id_jenis_prestasi)
)
go

insert into ref.jenis_prestasi (id_jenis_prestasi, nm_jenis_prestasi, create_date, last_update, expired_date, last_sync)
select id_jenis_prestasi, nm_jenis_prestasi, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_prestasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_prestasi')
            and   type = 'U')
   drop table ref.tmp_jenis_prestasi
go

/*==============================================================*/
/* Table: jenis_publikasi                                       */
/*==============================================================*/
create table ref.jenis_publikasi (
   id_jns_pub           int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_pu check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_pu check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_pub           varchar(100)         not null,
   a_pub_prestasi       numeric(1)           null default 0
      constraint ckc_a_pub_prestasi_jenis_pu check (a_pub_prestasi is null or (a_pub_prestasi between 0 and 1 and a_pub_prestasi in (0,1))),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_publikasi primary key (id_jns_pub)
)
go

insert into ref.jenis_publikasi (id_jns_pub, nm_jns_pub, a_pub_prestasi, create_date, last_update, expired_date, last_sync)
select id_jns_pub, nm_jns_pub, a_pub_prestasi, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_publikasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_publikasi')
            and   type = 'U')
   drop table ref.tmp_jenis_publikasi
go

/*==============================================================*/
/* Table: jenis_sarana                                          */
/*==============================================================*/
create table ref.jenis_sarana (
   id_jns_sarana        int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_sa check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_sa check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_sarana        varchar(60)          not null,
   kel                  varchar(50)          null,
   a_penempatan         numeric(1)           not null default 0
      constraint ckc_a_penempatan_jenis_sa check (a_penempatan between 0 and 1 and a_penempatan in (0,1)),
   ket                  varchar(250)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_sarana primary key (id_jns_sarana)
)
go

insert into ref.jenis_sarana (id_jns_sarana, nm_jns_sarana, kel, a_penempatan, ket, create_date, last_update, expired_date, last_sync)
select id_jns_sarana, nm_jns_sarana, kel, a_penempatan, ket, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_sarana
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_sarana')
            and   type = 'U')
   drop table ref.tmp_jenis_sarana
go

/*==============================================================*/
/* Table: jenis_sdm                                             */
/*==============================================================*/
create table ref.jenis_sdm (
   id_jns_sdm           numeric(2)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_sd check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_sd check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_sdm           varchar(50)          not null,
   a_guru_kelas         numeric(1)           not null default 0
      constraint ckc_a_guru_kelas_jenis_sd check (a_guru_kelas between 0 and 1 and a_guru_kelas in (0,1)),
   a_guru_mapel         numeric(1)           not null default 0
      constraint ckc_a_guru_mapel_jenis_sd check (a_guru_mapel between 0 and 1 and a_guru_mapel in (0,1)),
   a_guru_bk            numeric(1)           not null default 0
      constraint ckc_a_guru_bk_jenis_sd check (a_guru_bk between 0 and 1 and a_guru_bk in (0,1)),
   a_guru_inklusi       numeric(1)           not null default 0
      constraint ckc_a_guru_inklusi_jenis_sd check (a_guru_inklusi between 0 and 1 and a_guru_inklusi in (0,1)),
   a_pengawas_sp        numeric(1)           not null default 0
      constraint ckc_a_pengawas_sp_jenis_sd check (a_pengawas_sp between 0 and 1 and a_pengawas_sp in (0,1)),
   a_pengawas_plb       numeric(1)           not null default 0
      constraint ckc_a_pengawas_plb_jenis_sd check (a_pengawas_plb between 0 and 1 and a_pengawas_plb in (0,1)),
   a_pengawas_mapel     numeric(1)           not null default 0
      constraint ckc_a_pengawas_mapel_jenis_sd check (a_pengawas_mapel between 0 and 1 and a_pengawas_mapel in (0,1)),
   a_pengawas_bid       numeric(1)           not null default 0
      constraint ckc_a_pengawas_bid_jenis_sd check (a_pengawas_bid between 0 and 1 and a_pengawas_bid in (0,1)),
   a_tas                numeric(1)           not null default 0
      constraint ckc_a_tas_jenis_sd check (a_tas between 0 and 1 and a_tas in (0,1)),
   a_formal             numeric(1)           not null default 0
      constraint ckc_a_formal_jenis_sd check (a_formal between 0 and 1 and a_formal in (0,1)),
   a_dosen              numeric(1)           not null default 0
      constraint ckc_a_dosen_jenis_sd check (a_dosen between 0 and 1 and a_dosen in (0,1)),
   a_peneliti           numeric(1)           not null default 0
      constraint ckc_a_peneliti_jenis_sd check (a_peneliti between 0 and 1 and a_peneliti in (0,1)),
   a_perekayasa         numeric(1)           not null default 0
      constraint ckc_a_perekayasa_jenis_sd check (a_perekayasa between 0 and 1 and a_perekayasa in (0,1)),
   a_pranata_1          numeric(1)           not null default 0
      constraint ckc_a_pranata_1_jenis_sd check (a_pranata_1 between 0 and 1 and a_pranata_1 in (0,1)),
   a_pranata_2          numeric(1)           not null default 0
      constraint ckc_a_pranata_2_jenis_sd check (a_pranata_2 between 0 and 1 and a_pranata_2 in (0,1)),
   a_pranata_3          numeric(1)           not null default 0
      constraint ckc_a_pranata_3_jenis_sd check (a_pranata_3 between 0 and 1 and a_pranata_3 in (0,1)),
   a_pranata_4          numeric(1)           not null default 0
      constraint ckc_a_pranata_4_jenis_sd check (a_pranata_4 between 0 and 1 and a_pranata_4 in (0,1)),
   a_pranata_5          numeric(1)           not null default 0
      constraint ckc_a_pranata_5_jenis_sd check (a_pranata_5 between 0 and 1 and a_pranata_5 in (0,1)),
   a_pranata_6          numeric(1)           not null default 0
      constraint ckc_a_pranata_6_jenis_sd check (a_pranata_6 between 0 and 1 and a_pranata_6 in (0,1)),
   a_pranata_7          numeric(1)           not null default 0
      constraint ckc_a_pranata_7_jenis_sd check (a_pranata_7 between 0 and 1 and a_pranata_7 in (0,1)),
   a_pranata_8          numeric(1)           not null default 0
      constraint ckc_a_pranata_8_jenis_sd check (a_pranata_8 between 0 and 1 and a_pranata_8 in (0,1)),
   a_pranata_9          numeric(1)           not null default 0
      constraint ckc_a_pranata_9_jenis_sd check (a_pranata_9 between 0 and 1 and a_pranata_9 in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_sdm primary key (id_jns_sdm)
)
go

insert into ref.jenis_sdm (id_jns_sdm, nm_jns_sdm, a_guru_kelas, a_guru_mapel, a_guru_bk, a_guru_inklusi, a_pengawas_sp, a_pengawas_plb, a_pengawas_mapel, a_pengawas_bid, a_tas, a_formal, a_dosen, a_peneliti, a_perekayasa, a_pranata_1, a_pranata_2, a_pranata_3, a_pranata_4, a_pranata_5, a_pranata_6, a_pranata_7, a_pranata_8, a_pranata_9, create_date, last_update, expired_date, last_sync)
select id_jns_sdm, nm_jns_sdm, a_guru_kelas, a_guru_mapel, a_guru_bk, a_guru_inklusi, a_pengawas_sp, a_pengawas_plb, a_pengawas_mapel, a_pengawas_bid, a_tas, a_formal, a_dosen, a_peneliti, a_perekayasa, a_pranata_1, a_pranata_2, a_pranata_3, a_pranata_4, a_pranata_5, a_pranata_6, a_pranata_7, a_pranata_8, a_pranata_9, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_sdm
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_sdm')
            and   type = 'U')
   drop table ref.tmp_jenis_sdm
go

/*==============================================================*/
/* Table: jenis_sert                                            */
/*==============================================================*/
create table ref.jenis_sert (
   id_jns_sert          numeric(3)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_se check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_se check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_sert          varchar(50)          not null,
   u_prof_guru          numeric(1)           not null default 0
      constraint ckc_u_prof_guru_jenis_se check (u_prof_guru between 0 and 1 and u_prof_guru in (0,1)),
   u_kepsek             numeric(1)           not null default 0
      constraint ckc_u_kepsek_jenis_se check (u_kepsek between 0 and 1 and u_kepsek in (0,1)),
   u_laboran            numeric(1)           not null default 0
      constraint ckc_u_laboran_jenis_se check (u_laboran between 0 and 1 and u_laboran in (0,1)),
   u_prof_dosen         numeric(1)           not null default 0
      constraint ckc_u_prof_dosen_jenis_se check (u_prof_dosen between 0 and 1 and u_prof_dosen in (0,1)),
   u_lembaga            numeric(1)           null default 0
      constraint ckc_u_lembaga_jenis_se check (u_lembaga is null or (u_lembaga between 0 and 1 and u_lembaga in (0,1))),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_sert primary key (id_jns_sert)
)
go

insert into ref.jenis_sert (id_jns_sert, nm_jns_sert, u_prof_guru, u_kepsek, u_laboran, u_prof_dosen, u_lembaga, create_date, last_update, expired_date, last_sync)
select id_jns_sert, nm_jns_sert, u_prof_guru, u_kepsek, u_laboran, u_prof_dosen, u_lembaga, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_sert
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_sert')
            and   type = 'U')
   drop table ref.tmp_jenis_sert
go

/*==============================================================*/
/* Table: jenis_sms                                             */
/*==============================================================*/
create table ref.jenis_sms (
   id_jns_sms           numeric(2)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_sm check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_sm check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_sms           varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_sms primary key (id_jns_sms)
)
go

insert into ref.jenis_sms (id_jns_sms, nm_jns_sms, create_date, last_update, expired_date, last_sync)
select id_jns_sms, nm_jns_sms, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_sms
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_sms')
            and   type = 'U')
   drop table ref.tmp_jenis_sms
go

/*==============================================================*/
/* Table: jenis_subst                                           */
/*==============================================================*/
create table ref.jenis_subst (
   id_jns_subst         char(5)              not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_su check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_su check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_subst         varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_subst primary key (id_jns_subst)
)
go

insert into ref.jenis_subst (id_jns_subst, nm_jns_subst, create_date, last_update, expired_date, last_sync)
select id_jns_subst, nm_jns_subst, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_subst
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_subst')
            and   type = 'U')
   drop table ref.tmp_jenis_subst
go

/*==============================================================*/
/* Table: jenis_tes                                             */
/*==============================================================*/
create table ref.jenis_tes (
   id_jns_tes           numeric(3)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_te check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_te check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_tes           varchar(50)          not null,
   ket                  varchar(250)         null,
   nilai_maks           numeric(6,2)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_tes primary key (id_jns_tes)
)
go

insert into ref.jenis_tes (id_jns_tes, nm_jns_tes, ket, nilai_maks, create_date, last_update, expired_date, last_sync)
select id_jns_tes, nm_jns_tes, ket, nilai_maks, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_tes
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_tes')
            and   type = 'U')
   drop table ref.tmp_jenis_tes
go

/*==============================================================*/
/* Table: jenis_tinggal                                         */
/*==============================================================*/
create table ref.jenis_tinggal (
   id_jns_tinggal       numeric(2)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_ti check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_ti check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_tinggal       varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_tinggal primary key (id_jns_tinggal)
)
go

insert into ref.jenis_tinggal (id_jns_tinggal, nm_jns_tinggal, create_date, last_update, expired_date, last_sync)
select id_jns_tinggal, nm_jns_tinggal, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_tinggal
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_tinggal')
            and   type = 'U')
   drop table ref.tmp_jenis_tinggal
go

/*==============================================================*/
/* Table: jenis_tunjangan                                       */
/*==============================================================*/
create table ref.jenis_tunjangan (
   id_jns_tunj          int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenis_tu check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenis_tu check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jns_tunj          varchar(50)          null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_tunjangan primary key (id_jns_tunj)
)
go

insert into ref.jenis_tunjangan (id_jns_tunj, nm_jns_tunj, create_date, last_update, expired_date, last_sync)
select id_jns_tunj, nm_jns_tunj, create_date, last_update, expired_date, last_sync
from ref.tmp_jenis_tunjangan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenis_tunjangan')
            and   type = 'U')
   drop table ref.tmp_jenis_tunjangan
go

/*==============================================================*/
/* Table: jenjang_pendidikan                                    */
/*==============================================================*/
create table ref.jenjang_pendidikan (
   id_jenj_didik        numeric(2)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jenjang_ check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jenjang_ check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jenj_didik        varchar(50)          not null,
   u_jenj_lemb          numeric(1)           not null default 0
      constraint ckc_u_jenj_lemb_jenjang_ check (u_jenj_lemb between 0 and 1 and u_jenj_lemb in (0,1)),
   u_jenj_org           numeric(1)           not null default 0
      constraint ckc_u_jenj_org_jenjang_ check (u_jenj_org between 0 and 1 and u_jenj_org in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenjang_pendidikan primary key (id_jenj_didik)
)
go

insert into ref.jenjang_pendidikan (id_jenj_didik, nm_jenj_didik, u_jenj_lemb, u_jenj_org, create_date, last_update, expired_date, last_sync)
select id_jenj_didik, nm_jenj_didik, u_jenj_lemb, u_jenj_org, create_date, last_update, expired_date, last_sync
from ref.tmp_jenjang_pendidikan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jenjang_pendidikan')
            and   type = 'U')
   drop table ref.tmp_jenjang_pendidikan
go

/*==============================================================*/
/* Table: jurusan                                               */
/*==============================================================*/
create table ref.jurusan (
   id_jur               varchar(25)          not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_jurusan check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_jurusan check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_jur               varchar(100)         not null,
   nm_intl_jur          varchar(100)         null,
   kode_nomenklatur     varchar(10)          null,
   u_sma                numeric(1)           not null default 0
      constraint ckc_u_sma_jurusan check (u_sma between 0 and 1 and u_sma in (0,1)),
   u_smk                numeric(1)           not null default 0
      constraint ckc_u_smk_jurusan check (u_smk between 0 and 1 and u_smk in (0,1)),
   u_pt                 numeric(1)           not null default 0
      constraint ckc_u_pt_jurusan check (u_pt between 0 and 1 and u_pt in (0,1)),
   u_slb                numeric(1)           not null default 0
      constraint ckc_u_slb_jurusan check (u_slb between 0 and 1 and u_slb in (0,1)),
   id_induk_jurusan     varchar(25)          null,
   id_jenj_didik        numeric(2)           not null,
   id_kel_bidang        uniqueidentifier     not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jurusan primary key (id_jur)
)
go

insert into ref.jurusan (id_jur, nm_jur, nm_intl_jur, u_sma, u_smk, u_pt, u_slb, id_induk_jurusan, id_jenj_didik, id_kel_bidang, create_date, last_update, expired_date, last_sync)
select id_jur, nm_jur, nm_intl_jur, u_sma, u_smk, u_pt, u_slb, id_induk_jurusan, id_jenj_didik, id_kel_bidang, create_date, last_update, expired_date, last_sync
from ref.tmp_jurusan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_jurusan')
            and   type = 'U')
   drop table ref.tmp_jurusan
go

/*==============================================================*/
/* Table: kategori_capaian_luaran                               */
/*==============================================================*/
create table ref.kategori_capaian_luaran (
   id_kat_capaian       numeric(3)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_kategori check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_kategori check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_kat_capaian       varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kategori_capaian_luaran primary key (id_kat_capaian)
)
go

insert into ref.kategori_capaian_luaran (id_kat_capaian, nm_kat_capaian, create_date, last_update, expired_date, last_sync)
select id_kat_capaian, nm_kat_capaian, create_date, last_update, expired_date, last_sync
from ref.tmp_kategori_capaian_luaran
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kategori_capaian_luaran')
            and   type = 'U')
   drop table ref.tmp_kategori_capaian_luaran
go

/*==============================================================*/
/* Table: kategori_kegiatan                                     */
/*==============================================================*/
create table ref.kategori_kegiatan (
   id_katgiat           int                  not null,
   id_induk_katgiat     int                  null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_kategori2 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_kategori2 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   id_jns_sdm           numeric(2)           not null,
   kode_kat_pak         varchar(16)          null,
   kode_kat_bkd         varchar(16)          null,
   nm_kat               varchar(300)         not null,
   kat_unsur            char(1)              null,
   teks_judul           varchar(30)          null,
   teks_sk              varchar(30)          null,
   teks_tgl_sk          varchar(30)          null,
   teks_lokasi          varchar(30)          null,
   level_kat            numeric(1)           not null 
      constraint ckc_level_kat_kategori check (level_kat in (1,2,3)),
   sks_bkd              numeric(7,2)         null,
   ak                   numeric(7,2)         null,
   ak_maks              numeric(7,2)         null,
   satuan_nilai         char(1)              null default '2'
      constraint ckc_satuan_nilai_kategori check (satuan_nilai is null or (satuan_nilai in ('1','2','3','4','5','6'))),
   ket                  varchar(250)         null,
   a_aktif              numeric(1)           not null default 1
      constraint ckc_a_aktif_kategori check (a_aktif between 0 and 1 and a_aktif in (0,1)),
   a_anak_bimb          numeric(1)           not null default 0
      constraint ckc_a_anak_bimb_kategori check (a_anak_bimb between 0 and 1 and a_anak_bimb in (0,1)),
   a_judul              numeric(1)           not null default 0
      constraint ckc_a_judul_kategori check (a_judul between 0 and 1 and a_judul in (0,1)),
   a_sk                 numeric(1)           not null default 0
      constraint ckc_a_sk_kategori check (a_sk between 0 and 1 and a_sk in (0,1)),
   a_peer_review        numeric(1)           not null default 0
      constraint ckc_a_peer_review_kategori check (a_peer_review between 0 and 1 and a_peer_review in (0,1)),
   acuan_waktu          char(1)              not null 
      constraint ckc_acuan_waktu_kategori check (acuan_waktu in ('1','2','3','4')),
   u_bkd                numeric(1)           not null default 0
      constraint ckc_u_bkd_kategori check (u_bkd between 0 and 1 and u_bkd in (0,1)),
   u_pak                numeric(1)           not null default 0
      constraint ckc_u_pak_kategori check (u_pak between 0 and 1 and u_pak in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kategori_kegiatan primary key (id_katgiat)
)
go

insert into ref.kategori_kegiatan (id_katgiat, id_induk_katgiat, id_jns_sdm, kode_kat_pak, kode_kat_bkd, nm_kat, kat_unsur, teks_judul, teks_sk, teks_tgl_sk, teks_lokasi, level_kat, sks_bkd, ak, ak_maks, satuan_nilai, ket, a_aktif, a_anak_bimb, a_judul, a_sk, a_peer_review, acuan_waktu, u_bkd, u_pak, create_date, last_update, expired_date, last_sync)
select id_katgiat, id_induk_katgiat, id_jns_sdm, kode_kat_pak, kode_kat_bkd, nm_kat, kat_unsur, teks_judul, teks_sk, teks_tgl_sk, teks_lokasi, level_kat, sks_bkd, ak, ak_maks, satuan_nilai, ket, a_aktif, a_anak_bimb, a_judul, a_sk, a_peer_review, acuan_waktu, u_bkd, u_pak, create_date, last_update, expired_date, last_sync
from ref.tmp_kategori_kegiatan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kategori_kegiatan')
            and   type = 'U')
   drop table ref.tmp_kategori_kegiatan
go

/*==============================================================*/
/* Table: kategori_tabel                                        */
/*==============================================================*/
create table ref.kategori_tabel (
   id_kat_tabel         uniqueidentifier     not null,
   id_katgiat           int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_kategori3 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_kategori3 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
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

insert into ref.kategori_tabel (id_kat_tabel, id_katgiat, nm_schema, nm_tbl, konfig_kolom, ket, create_date, last_update, expired_date, last_sync)
select id_kat_tabel, id_katgiat, nm_schema, nm_tbl, konfig_kolom, ket, create_date, last_update, expired_date, last_sync
from ref.tmp_kategori_tabel
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kategori_tabel')
            and   type = 'U')
   drop table ref.tmp_kategori_tabel
go

/*==============================================================*/
/* Table: kbli                                                  */
/*==============================================================*/
create table ref.kbli (
   id_kbli              numeric(7)           not null,
   id_induk_kbli        numeric(7)           null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_kbli check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_kbli check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   kategori             varchar(2)           not null,
   kode                 varchar(5)           not null,
   judul                varchar(500)         not null,
   lv_kbli              numeric(2)           not null default 1,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kbli primary key (id_kbli)
)
go

insert into ref.kbli (id_kbli, id_induk_kbli, kategori, kode, judul, lv_kbli, create_date, last_update, expired_date, last_sync)
select id_kbli, id_induk_kbli, kategori, kode, judul, lv_kbli, create_date, last_update, expired_date, last_sync
from ref.tmp_kbli
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kbli')
            and   type = 'U')
   drop table ref.tmp_kbli
go

/*==============================================================*/
/* Table: keahlian_lab                                          */
/*==============================================================*/
create table ref.keahlian_lab (
   id_keahlian_lab      smallint             not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_keahlian check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_keahlian check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_keahlian_lab      varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_keahlian_lab primary key (id_keahlian_lab)
)
go

insert into ref.keahlian_lab (id_keahlian_lab, nm_keahlian_lab, create_date, last_update, expired_date, last_sync)
select id_keahlian_lab, nm_keahlian_lab, create_date, last_update, expired_date, last_sync
from ref.tmp_keahlian_lab
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_keahlian_lab')
            and   type = 'U')
   drop table ref.tmp_keahlian_lab
go

/*==============================================================*/
/* Table: kebutuhan_khusus                                      */
/*==============================================================*/
create table ref.kebutuhan_khusus (
   id_kk                int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_kebutuha check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_kebutuha check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_kk                varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kebutuhan_khusus primary key (id_kk)
)
go

insert into ref.kebutuhan_khusus (id_kk, nm_kk, create_date, last_update, expired_date, last_sync)
select id_kk, nm_kk, create_date, last_update, expired_date, last_sync
from ref.tmp_kebutuhan_khusus
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kebutuhan_khusus')
            and   type = 'U')
   drop table ref.tmp_kebutuhan_khusus
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

insert into ref.kelompok_bidang (id_kel_bidang, kode_kel_bidang, nm_kel_bidang, u_sma, u_smk, u_pt, u_iptek, u_kepakaran, kat_kel, ket_kel_bidang, a_leaf_node, id_induk_bidang, create_date, last_update, expired_date, last_sync)
select id_kel_bidang, kode_kel_bidang, nm_kel_bidang, u_sma, u_smk, u_pt, u_iptek, u_kepakaran, kat_kel, ket_kel_bidang, a_leaf_node, id_induk_bidang, create_date, last_update, expired_date, last_sync
from ref.tmp_kelompok_bidang
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kelompok_bidang')
            and   type = 'U')
   drop table ref.tmp_kelompok_bidang
go

/*==============================================================*/
/* Table: kelompok_profesi                                      */
/*==============================================================*/
create table ref.kelompok_profesi (
   id_kel_prof          numeric(5)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_kelompok check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_kelompok check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_kel_prof          varchar(50)          not null,
   ket_kel_prof         varchar(250)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kelompok_profesi primary key (id_kel_prof)
)
go

insert into ref.kelompok_profesi (id_kel_prof, nm_kel_prof, ket_kel_prof, create_date, last_update, expired_date, last_sync)
select id_kel_prof, nm_kel_prof, ket_kel_prof, create_date, last_update, expired_date, last_sync
from ref.tmp_kelompok_profesi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kelompok_profesi')
            and   type = 'U')
   drop table ref.tmp_kelompok_profesi
go

/*==============================================================*/
/* Table: kelompok_usaha                                        */
/*==============================================================*/
create table ref.kelompok_usaha (
   id_kel_usaha         char(8)              not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_kelompok3 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_kelompok3 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_kel_usaha         varchar(60)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kelompok_usaha primary key (id_kel_usaha)
)
go

insert into ref.kelompok_usaha (id_kel_usaha, nm_kel_usaha, create_date, last_update, expired_date, last_sync)
select id_kel_usaha, nm_kel_usaha, create_date, last_update, expired_date, last_sync
from ref.tmp_kelompok_usaha
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kelompok_usaha')
            and   type = 'U')
   drop table ref.tmp_kelompok_usaha
go

/*==============================================================*/
/* Table: kontrak_iku_pt                                        */
/*==============================================================*/
create table dashboard.kontrak_iku_pt (
   id_kontak_iku_pt     uniqueidentifier     not null,
   id_tahun_anggaran    numeric(4)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_kontrak_ check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_kontrak_ check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
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

insert into dashboard.kontrak_iku_pt (id_kontak_iku_pt, id_tahun_anggaran, iku1, iku2, iku3, iku4, iku5, iku6, iku7, iku8, iku9, create_date, last_update, expired_date, last_sync)
select id_kontak_iku_pt, id_tahun_anggaran, iku1, iku2, iku3, iku4, iku5, iku6, iku7, iku8, iku9, create_date, last_update, expired_date, last_sync
from dashboard.tmp_kontrak_iku_pt
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dashboard.tmp_kontrak_iku_pt')
            and   type = 'U')
   drop table dashboard.tmp_kontrak_iku_pt
go

/*==============================================================*/
/* Table: konversi_akt_mhs                                      */
/*==============================================================*/
create table mbkm.konversi_akt_mhs (
   id_konversi_aktivitas uniqueidentifier     not null,
   id_mk                uniqueidentifier     not null,
   id_ang_akt_mhs       uniqueidentifier     null,
   id_smt               char(5)              null,
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
   constraint pk_konversi_akt_mhs primary key (id_konversi_aktivitas)
)
go

/*==============================================================*/
/* Table: kriteria_mitra                                        */
/*==============================================================*/
create table ref.kriteria_mitra (
   id_kriteria_mitra    numeric(2)           identity,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_kriteria check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_kriteria check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_kriteria_mitra    varchar(100)         not null,
   ket                  varchar(250)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kriteria_mitra primary key (id_kriteria_mitra)
)
go

set identity_insert ref.kriteria_mitra on
go

insert into ref.kriteria_mitra (id_kriteria_mitra, nm_kriteria_mitra, ket, create_date, last_update, expired_date, last_sync)
select id_kriteria_mitra, nm_kriteria_mitra, ket, create_date, last_update, expired_date, last_sync
from ref.tmp_kriteria_mitra
go

set identity_insert ref.kriteria_mitra off
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_kriteria_mitra')
            and   type = 'U')
   drop table ref.tmp_kriteria_mitra
go

/*==============================================================*/
/* Table: kuliah_mhs                                            */
/*==============================================================*/
create table pdrd.kuliah_mhs (
   id_reg_pd            uniqueidentifier     not null,
   id_smt               char(5)              not null,
   id_pembiayaan        numeric(2)           null,
   id_stat_mhs          char(1)              not null,
   ips                  numeric(7,4)         null,
   sks_semester         numeric(5,2)         null,
   ipk                  numeric(5,2)         null,
   total_sks            numeric(5,2)         null,
   biaya_smt            numeric(16,2)        null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_kuliah_m check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_kuliah_mhs primary key (id_reg_pd, id_smt)
)
go

insert into pdrd.kuliah_mhs (id_reg_pd, id_smt, id_stat_mhs, ips, sks_semester, ipk, total_sks, biaya_smt, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_reg_pd, id_smt, id_stat_mhs, ips, sks_semester, ipk, total_sks, biaya_smt, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_kuliah_mhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_kuliah_mhs')
            and   type = 'U')
   drop table pdrd.tmp_kuliah_mhs
go

/*==============================================================*/
/* Table: lembaga_akred                                         */
/*==============================================================*/
create table ref.lembaga_akred (
   id_lemb_akred        char(5)              not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_lembaga_2 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_lembaga_2 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_lemb              varchar(100)         not null,
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
   tgl_mulai_beroperasi date                 not null,
   ket                  varchar(250)         null,
   target_akred         char(1)              not null default 'P'
      constraint ckc_target_akred_lembaga_ check (target_akred in ('P','K') and target_akred = upper(target_akred)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_lembaga_akred primary key (id_lemb_akred)
)
go

insert into ref.lembaga_akred (id_lemb_akred, nm_lemb, jln, rt, rw, nm_dsn, ds_kel, kode_pos, lintang, bujur, no_tel, no_fax, email, website, kd_kl, kd_satker, tgl_mulai_beroperasi, ket, target_akred, create_date, last_update, expired_date, last_sync)
select id_lemb_akred, nm_lemb, jln, rt, rw, nm_dsn, ds_kel, kode_pos, lintang, bujur, no_tel, no_fax, email, website, kd_kl, kd_satker, tgl_mulai_beroperasi, ket, target_akred, create_date, last_update, expired_date, last_sync
from ref.tmp_lembaga_akred
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_lembaga_akred')
            and   type = 'U')
   drop table ref.tmp_lembaga_akred
go

/*==============================================================*/
/* Table: lembaga_pengangkat                                    */
/*==============================================================*/
create table ref.lembaga_pengangkat (
   id_lemb_angkat       numeric(2)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_lembaga_ check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_lembaga_ check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_lemb_angkat       varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_lembaga_pengangkat primary key (id_lemb_angkat)
)
go

insert into ref.lembaga_pengangkat (id_lemb_angkat, nm_lemb_angkat, create_date, last_update, expired_date, last_sync)
select id_lemb_angkat, nm_lemb_angkat, create_date, last_update, expired_date, last_sync
from ref.tmp_lembaga_pengangkat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_lembaga_pengangkat')
            and   type = 'U')
   drop table ref.tmp_lembaga_pengangkat
go

/*==============================================================*/
/* Table: level_wilayah                                         */
/*==============================================================*/
create table ref.level_wilayah (
   id_level_wil         smallint             not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_level_wi check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_level_wi check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_level_wilayah     varchar(50)          null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_level_wilayah primary key (id_level_wil)
)
go

insert into ref.level_wilayah (id_level_wil, nm_level_wilayah, create_date, last_update, expired_date, last_sync)
select id_level_wil, nm_level_wilayah, create_date, last_update, expired_date, last_sync
from ref.tmp_level_wilayah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_level_wilayah')
            and   type = 'U')
   drop table ref.tmp_level_wilayah
go

/*==============================================================*/
/* Table: media_publikasi                                       */
/*==============================================================*/
create table ref.media_publikasi (
   id_media_pub         uniqueidentifier     not null,
   id_jns_media         numeric(2)           not null,
   id_kel_bidang        uniqueidentifier     not null,
   id_sp                uniqueidentifier     null,
   id_negara            char(2)              not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_media_pu check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_media_pu check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_media_pub         varchar(120)         not null,
   bentuk_media_pub     char(1)              null 
      constraint ckc_bentuk_media_pub_media_pu check (bentuk_media_pub is null or (bentuk_media_pub in ('C','E'))),
   grade_sinta          char(1)              null,
   jns_penerbit         char(1)              null 
      constraint ckc_jns_penerbit_media_pu check (jns_penerbit is null or (jns_penerbit in ('P','L'))),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_media_publikasi primary key (id_media_pub)
)
go

insert into ref.media_publikasi (id_media_pub, id_jns_media, id_kel_bidang, id_sp, id_negara, nm_media_pub, bentuk_media_pub, grade_sinta, jns_penerbit, create_date, last_update, expired_date, last_sync)
select id_media_pub, id_jns_media, id_kel_bidang, id_sp, id_negara, nm_media_pub, bentuk_media_pub, grade_sinta, jns_penerbit, create_date, last_update, expired_date, last_sync
from ref.tmp_media_publikasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_media_publikasi')
            and   type = 'U')
   drop table ref.tmp_media_publikasi
go

/*==============================================================*/
/* Table: negara                                                */
/*==============================================================*/
create table ref.negara (
   id_negara            char(2)              not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_negara check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_negara check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_negara            varchar(50)          not null,
   a_ln                 numeric(1)           not null default 0
      constraint ckc_a_ln_negara check (a_ln between 0 and 1 and a_ln in (0,1)),
   benua                numeric(1)           not null 
      constraint ckc_benua_negara check (benua in (1,2,3,4,5,6)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_negara primary key (id_negara)
)
go

insert into ref.negara (id_negara, nm_negara, a_ln, benua, create_date, last_update, expired_date, last_sync)
select id_negara, nm_negara, a_ln, benua, create_date, last_update, expired_date, last_sync
from ref.tmp_negara
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_negara')
            and   type = 'U')
   drop table ref.tmp_negara
go

/*==============================================================*/
/* Table: nilai_akred                                           */
/*==============================================================*/
create table ref.nilai_akred (
   id_akred             numeric(1)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_nilai_ak check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_nilai_ak check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_akred             varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_nilai_akred primary key (id_akred)
)
go

insert into ref.nilai_akred (id_akred, nm_akred, create_date, last_update, expired_date, last_sync)
select id_akred, nm_akred, create_date, last_update, expired_date, last_sync
from ref.tmp_nilai_akred
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_nilai_akred')
            and   type = 'U')
   drop table ref.tmp_nilai_akred
go

/*==============================================================*/
/* Table: nilai_tes                                             */
/*==============================================================*/
create table pdrd.nilai_tes (
   id_nilai_tes         uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_jns_tes           numeric(3)           not null,
   nm_nilai_tes         varchar(50)          not null,
   penyelenggara        varchar(100)         not null,
   thn                  numeric(4)           not null,
   skor                 numeric(6,2)         not null,
   tgl_tes              date                 null,
   a_valid              numeric(1)           null default 0
      constraint ckc_a_valid_nilai_te check (a_valid is null or (a_valid between 0 and 1 and a_valid in (0,1))),
   tgl_validasi         datetime             null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_nilai_te check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_nilai_tes primary key (id_nilai_tes)
)
go

insert into pdrd.nilai_tes (id_nilai_tes, id_sdm, id_jns_tes, nm_nilai_tes, penyelenggara, thn, skor, tgl_tes, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_nilai_tes, id_sdm, id_jns_tes, nm_nilai_tes, penyelenggara, thn, skor, tgl_tes, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_nilai_tes
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_nilai_tes')
            and   type = 'U')
   drop table pdrd.tmp_nilai_tes
go

/*==============================================================*/
/* Table: pangkat_golongan                                      */
/*==============================================================*/
create table ref.pangkat_golongan (
   id_pangkat_gol       numeric(2)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_pangkat_ check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_pangkat_ check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   kode_gol             varchar(5)           not null,
   nm_pangkat           varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_pangkat_golongan primary key (id_pangkat_gol)
)
go

insert into ref.pangkat_golongan (id_pangkat_gol, kode_gol, nm_pangkat, create_date, last_update, expired_date, last_sync)
select id_pangkat_gol, kode_gol, nm_pangkat, create_date, last_update, expired_date, last_sync
from ref.tmp_pangkat_golongan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_pangkat_golongan')
            and   type = 'U')
   drop table ref.tmp_pangkat_golongan
go

/*==============================================================*/
/* Table: pekerjaan                                             */
/*==============================================================*/
create table ref.pekerjaan (
   id_pekerjaan         int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_pekerjaa check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_pekerjaa check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_pekerjaan         varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_pekerjaan primary key (id_pekerjaan)
)
go

insert into ref.pekerjaan (id_pekerjaan, nm_pekerjaan, create_date, last_update, expired_date, last_sync)
select id_pekerjaan, nm_pekerjaan, create_date, last_update, expired_date, last_sync
from ref.tmp_pekerjaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_pekerjaan')
            and   type = 'U')
   drop table ref.tmp_pekerjaan
go

/*==============================================================*/
/* Table: pembiayaan                                            */
/*==============================================================*/
create table ref.pembiayaan (
   id_pembiayaan        numeric(2)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_pembiaya check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_pembiaya check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_pembiayaan        varchar(40)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_pembiayaan primary key (id_pembiayaan)
)
go

insert into ref.pembiayaan (id_pembiayaan, nm_pembiayaan, create_date, last_update, expired_date, last_sync)
select id_pembiayaan, nm_pembiayaan, create_date, last_update, expired_date, last_sync
from ref.tmp_pembiayaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_pembiayaan')
            and   type = 'U')
   drop table ref.tmp_pembiayaan
go

/*==============================================================*/
/* Table: penghasilan                                           */
/*==============================================================*/
create table ref.penghasilan (
   id_penghasilan       int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_penghasi check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_penghasi check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_penghasilan       varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_penghasilan primary key (id_penghasilan)
)
go

insert into ref.penghasilan (id_penghasilan, nm_penghasilan, create_date, last_update, expired_date, last_sync)
select id_penghasilan, nm_penghasilan, create_date, last_update, expired_date, last_sync
from ref.tmp_penghasilan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_penghasilan')
            and   type = 'U')
   drop table ref.tmp_penghasilan
go

/*==============================================================*/
/* Table: peran                                                 */
/*==============================================================*/
create table man_akses.peran (
   id_peran             int                  not null,
   nm_peran             varchar(50)          not null,
   a_perlu_sk           numeric(1)           not null default 0
      constraint ckc_a_perlu_sk_peran check (a_perlu_sk between 0 and 1 and a_perlu_sk in (0,1)),
   peran_pddikti        numeric(1)           not null default 0
      constraint ckc_peran_pddikti_peran check (peran_pddikti between 0 and 1 and peran_pddikti in (0,1)),
   peran_unila          numeric(1)           not null default 0
      constraint ckc_peran_unila_peran check (peran_unila between 0 and 1 and peran_unila in (0,1)),
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_peran primary key (id_peran)
)
go

insert into man_akses.peran (id_peran, nm_peran, a_perlu_sk, tgl_create, last_update, expired_date, last_sync)
select id_peran, nm_peran, a_perlu_sk, tgl_create, last_update, expired_date, last_sync
from man_akses.tmp_peran
go

if exists (select 1
            from  sysobjects
           where  id = object_id('man_akses.tmp_peran')
            and   type = 'U')
   drop table man_akses.tmp_peran
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
   a_pmpap              numeric(1)           not null default 0
      constraint ckc_a_pmpap_peserta_ check (a_pmpap between 0 and 1 and a_pmpap in (0,1)),
   a_bidikmisi          numeric(1)           not null default 0
      constraint ckc_a_bidikmisi_peserta_ check (a_bidikmisi between 0 and 1 and a_bidikmisi in (0,1)),
   a_bebas_biaya        numeric(1)           not null default 0
      constraint ckc_a_bebas_biaya_peserta_ check (a_bebas_biaya between 0 and 1 and a_bebas_biaya in (0,1)),
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

insert into pdrd.peserta_didik (id_pd, nm_pd, jk, nisn, nik, tmpt_lahir, tgl_lahir, jln, rt, rw, nm_dsn, ds_kel, kode_pos, tlpn_rumah, tlpn_hp, email, nm_wali, tgl_lahir_wali, id_pendidikan_wali, id_pekerjaan_wali, id_penghasilan_wali, nm_ayah, tgl_lahir_ayah, nik_ayah, id_pendidikan_ayah, id_pekerjaan_ayah, id_penghasilan_ayah, id_kk_ayah, nm_ibu_kandung, tgl_lahir_ibu, nik_ibu, id_pendidikan_ibu, id_pekerjaan_ibu, id_penghasilan_ibu, id_kk_ibu, a_terima_kps, no_kps, id_kk, id_kewarganegaraan, id_agama, id_blob, id_jns_tinggal, id_stat_mhs, id_alat_transport, id_wil, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_pd, nm_pd, jk, nisn, nik, tmpt_lahir, tgl_lahir, jln, rt, rw, nm_dsn, ds_kel, kode_pos, tlpn_rumah, tlpn_hp, email, nm_wali, tgl_lahir_wali, id_pendidikan_wali, id_pekerjaan_wali, id_penghasilan_wali, nm_ayah, tgl_lahir_ayah, nik_ayah, id_pendidikan_ayah, id_pekerjaan_ayah, id_penghasilan_ayah, id_kk_ayah, nm_ibu_kandung, tgl_lahir_ibu, nik_ibu, id_pendidikan_ibu, id_pekerjaan_ibu, id_penghasilan_ibu, id_kk_ibu, a_terima_kps, no_kps, id_kk, id_kewarganegaraan, id_agama, id_blob, id_jns_tinggal, id_stat_mhs, id_alat_transport, id_wil, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_peserta_didik
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_peserta_didik')
            and   type = 'U')
   drop table pdrd.tmp_peserta_didik
go

/*==============================================================*/
/* Table: peta_katgiat_jabfung                                  */
/*==============================================================*/
create table ref.peta_katgiat_jabfung (
   id_katgiat           int                  not null,
   id_jabfung           numeric(5)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_peta_kat2 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_peta_kat2 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_peta_katgiat_jabfung primary key (id_katgiat, id_jabfung)
)
go

insert into ref.peta_katgiat_jabfung (id_katgiat, id_jabfung, create_date, last_update, expired_date, last_sync)
select id_katgiat, id_jabfung, create_date, last_update, expired_date, last_sync
from ref.tmp_peta_katgiat_jabfung
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_peta_katgiat_jabfung')
            and   type = 'U')
   drop table ref.tmp_peta_katgiat_jabfung
go

/*==============================================================*/
/* Table: peta_katgiat_jnsdok                                   */
/*==============================================================*/
create table ref.peta_katgiat_jnsdok (
   id_katgiat           int                  not null,
   id_jns_dok           int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_peta_kat check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_peta_kat check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
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

insert into ref.peta_katgiat_jnsdok (id_katgiat, id_jns_dok, a_wajib, no_urut, create_date, last_update, expired_date, last_sync)
select id_katgiat, id_jns_dok, a_wajib, no_urut, create_date, last_update, expired_date, last_sync
from ref.tmp_peta_katgiat_jnsdok
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_peta_katgiat_jnsdok')
            and   type = 'U')
   drop table ref.tmp_peta_katgiat_jnsdok
go

/*==============================================================*/
/* Table: peta_katgiat_jnspub                                   */
/*==============================================================*/
create table ref.peta_katgiat_jnspub (
   id_katgiat           int                  not null,
   id_jns_pub           int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_peta_kat3 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_peta_kat3 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_peta_katgiat_jnspub primary key (id_katgiat, id_jns_pub)
)
go

insert into ref.peta_katgiat_jnspub (id_katgiat, id_jns_pub, create_date, last_update, expired_date, last_sync)
select id_katgiat, id_jns_pub, create_date, last_update, expired_date, last_sync
from ref.tmp_peta_katgiat_jnspub
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_peta_katgiat_jnspub')
            and   type = 'U')
   drop table ref.tmp_peta_katgiat_jnspub
go

/*==============================================================*/
/* Table: reg_ptk                                               */
/*==============================================================*/
create table pdrd.reg_ptk (
   id_reg_ptk           uniqueidentifier     not null,
   id_jns_keluar        char(1)              null,
   id_sdm               uniqueidentifier     null,
   id_sp                uniqueidentifier     not null,
   id_stat_pegawai      smallint             not null,
   id_ikatan_kerja      char(1)              not null,
   id_sms               uniqueidentifier     null,
   no_srt_tgs           varchar(80)          not null,
   tgl_srt_tgs          date                 not null,
   tmt_srt_tgs          date                 not null,
   tgl_ptk_keluar       date                 null,
   nidn                 char(10)             null,
   jns_reg              varchar(10)          null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_reg_ptk check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_reg_ptk primary key (id_reg_ptk)
)
go

insert into pdrd.reg_ptk (id_reg_ptk, id_jns_keluar, id_sdm, id_sp, id_stat_pegawai, id_ikatan_kerja, id_sms, no_srt_tgs, tgl_srt_tgs, tmt_srt_tgs, tgl_ptk_keluar, nidn, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_reg_ptk, id_jns_keluar, id_sdm, id_sp, id_stat_pegawai, id_ikatan_kerja, id_sms, no_srt_tgs, tgl_srt_tgs, tmt_srt_tgs, tgl_ptk_keluar, nidn, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_reg_ptk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_reg_ptk')
            and   type = 'U')
   drop table pdrd.tmp_reg_ptk
go

/*==============================================================*/
/* Table: satuan                                                */
/*==============================================================*/
create table ref.satuan (
   kd_satuan            char(1)              not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_satuan check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_satuan check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_satuan            varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_satuan primary key (kd_satuan)
)
go

insert into ref.satuan (kd_satuan, nm_satuan, create_date, last_update, expired_date, last_sync)
select kd_satuan, nm_satuan, create_date, last_update, expired_date, last_sync
from ref.tmp_satuan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_satuan')
            and   type = 'U')
   drop table ref.tmp_satuan
go

/*==============================================================*/
/* Table: satuan_pendidikan                                     */
/*==============================================================*/
create table pdrd.satuan_pendidikan (
   id_sp                uniqueidentifier     not null,
   nm_lemb              varchar(100)         not null,
   nss                  char(12)             null,
   npsn                 char(8)              null,
   nm_singkat           varchar(20)          null,
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
   stat_sp              char(1)              not null,
   sk_pendirian_sp      varchar(80)          null,
   tgl_sk_pendirian_sp  date                 null,
   tgl_berdiri          date                 null,
   sk_izin_operasi      varchar(80)          null,
   tgl_sk_izin_operasi  date                 null,
   no_rek               varchar(20)          null,
   nm_bank              varchar(100)         null,
   unit_cabang          varchar(60)          null,
   nm_rek               varchar(50)          null,
   a_mbs                numeric(1)           not null default 0
      constraint ckc_a_mbs_satuan_p check (a_mbs between 0 and 1 and a_mbs in (0,1)),
   luas_tanah_milik     numeric(7)           not null,
   luas_tanah_bukan_milik numeric(7)           not null,
   a_lptk               numeric(1)           not null default 0
      constraint ckc_a_lptk_satuan_p check (a_lptk between 0 and 1 and a_lptk in (0,1)),
   kode_reg             bigint               null,
   npwp                 char(15)             null,
   nm_wp                varchar(100)         null,
   flag                 char(1)              null,
   tgl_tutup            datetime             null,
   kode_snpmb           varchar(10)          null,
   id_pembina           uniqueidentifier     not null,
   id_blob              uniqueidentifier     null,
   id_stat_milik        numeric(1)           not null,
   id_wil               char(8)              not null,
   id_bp                smallint             not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_satuan_p check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_satuan_pendidikan primary key (id_sp)
)
go

insert into pdrd.satuan_pendidikan (id_sp, nm_lemb, nss, npsn, nm_singkat, jln, rt, rw, nm_dsn, ds_kel, kode_pos, lintang, bujur, no_tel, no_fax, email, website, stat_sp, sk_pendirian_sp, tgl_sk_pendirian_sp, tgl_berdiri, sk_izin_operasi, tgl_sk_izin_operasi, no_rek, nm_bank, unit_cabang, nm_rek, a_mbs, luas_tanah_milik, luas_tanah_bukan_milik, a_lptk, kode_reg, npwp, nm_wp, flag, id_pembina, id_blob, id_stat_milik, id_wil, id_bp, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_sp, nm_lemb, nss, npsn, nm_singkat, jln, rt, rw, nm_dsn, ds_kel, kode_pos, lintang, bujur, no_tel, no_fax, email, website, stat_sp, sk_pendirian_sp, tgl_sk_pendirian_sp, tgl_berdiri, sk_izin_operasi, tgl_sk_izin_operasi, no_rek, nm_bank, unit_cabang, nm_rek, a_mbs, luas_tanah_milik, luas_tanah_bukan_milik, a_lptk, kode_reg, npwp, nm_wp, flag, id_pembina, id_blob, id_stat_milik, id_wil, id_bp, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_satuan_pendidikan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_satuan_pendidikan')
            and   type = 'U')
   drop table pdrd.tmp_satuan_pendidikan
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
   jns_reg              varchar(10)          null,
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

insert into pdrd.sdm (id_sdm, nm_sdm, jk, tmpt_lahir, tgl_lahir, nik, niy_nigk, nuptk, nidn, nsdmi, stat_kawin, jln, rt, rw, nm_dsn, ds_kel, kode_pos, no_tel_rmh, no_hp, email, nip, tmt_pns, nm_suami_istri, nip_suami_istri, sk_cpns, tgl_sk_cpns, sk_angkat, tmt_sk_angkat, npwp, nm_wp, stat_data, akta_ijin_ajar, nira, kewarganegaraan, id_jns_sdm, id_wil, id_stat_aktif, id_agama, id_keahlian_lab, id_pekerjaan_suami_istri, id_lemb_angkat, id_sumber_gaji, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_sdm, nm_sdm, jk, tmpt_lahir, tgl_lahir, nik, niy_nigk, nuptk, nidn, nsdmi, stat_kawin, jln, rt, rw, nm_dsn, ds_kel, kode_pos, no_tel_rmh, no_hp, email, nip, tmt_pns, nm_suami_istri, nip_suami_istri, sk_cpns, tgl_sk_cpns, sk_angkat, tmt_sk_angkat, npwp, nm_wp, stat_data, akta_ijin_ajar, nira, kewarganegaraan, id_jns_sdm, id_wil, id_stat_aktif, id_agama, id_keahlian_lab, id_pekerjaan_suami_istri, id_lemb_angkat, id_sumber_gaji, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_sdm
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_sdm')
            and   type = 'U')
   drop table pdrd.tmp_sdm
go

/*==============================================================*/
/* Table: semester                                              */
/*==============================================================*/
create table ref.semester (
   id_smt               char(5)              not null,
   id_thn_ajaran        numeric(4)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_semester check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_semester check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_smt               varchar(50)          not null,
   smt                  numeric(2)           not null,
   a_periode_aktif      numeric(1)           null default 0
      constraint ckc_a_periode_aktif_semester check (a_periode_aktif is null or (a_periode_aktif between 0 and 1 and a_periode_aktif in (0,1))),
   tgl_mulai            datetime             not null,
   tgl_selesai          datetime             not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_semester primary key (id_smt)
)
go

insert into ref.semester (id_smt, id_thn_ajaran, nm_smt, smt, a_periode_aktif, tgl_mulai, tgl_selesai, create_date, last_update, expired_date, last_sync)
select id_smt, id_thn_ajaran, nm_smt, smt, a_periode_aktif, tgl_mulai, tgl_selesai, create_date, last_update, expired_date, last_sync
from ref.tmp_semester
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_semester')
            and   type = 'U')
   drop table ref.tmp_semester
go

/*==============================================================*/
/* Table: skim_kegiatan                                         */
/*==============================================================*/
create table ref.skim_kegiatan (
   id_skim              uniqueidentifier     not null,
   id_jenj_didik        numeric(2)           null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_skim_keg check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_skim_keg check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_skim              varchar(80)          not null,
   nm_singkat_skim      varchar(40)          null,
   kd_skim              varchar(20)          null,
   tst_skim             date                 null,
   jml_min_personil     smallint             not null default 1
      constraint ckc_jml_min_personil_skim_keg check (jml_min_personil >= 1),
   jml_maks_personil    smallint             not null default 1,
   jml_maks_keikutsertaan smallint             null default 2,
   jml_maks_sbg_ketua   smallint             null default 1,
   dana_min_thn_berjalan numeric(16,2)        null,
   dana_maks_thn_berjalan numeric(16,2)        not null,
   ket_skim             varchar(512)         null,
   deviasi_nilai        float                not null,
   passing_grade        float                not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_skim_kegiatan primary key (id_skim)
)
go

insert into ref.skim_kegiatan (id_skim, id_jenj_didik, nm_skim, nm_singkat_skim, kd_skim, tst_skim, jml_min_personil, jml_maks_personil, jml_maks_keikutsertaan, jml_maks_sbg_ketua, dana_min_thn_berjalan, dana_maks_thn_berjalan, ket_skim, deviasi_nilai, passing_grade, create_date, last_update, expired_date, last_sync)
select id_skim, id_jenj_didik, nm_skim, nm_singkat_skim, kd_skim, tst_skim, jml_min_personil, jml_maks_personil, jml_maks_keikutsertaan, jml_maks_sbg_ketua, dana_min_thn_berjalan, dana_maks_thn_berjalan, ket_skim, deviasi_nilai, passing_grade, create_date, last_update, expired_date, last_sync
from ref.tmp_skim_kegiatan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_skim_kegiatan')
            and   type = 'U')
   drop table ref.tmp_skim_kegiatan
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

insert into pdrd.sms (id_sms, id_fak_unila, id_jur_unila, id_jur, id_jenj_didik, nm_lemb, kd_kl, kd_satker, smt_mulai, a_selenggara_subst, stat_prodi_unila, kode_prodi, nm_prodi_english, kpst_pd, sks_lulus, gelar_lulusan, stat_prodi, polesei_nilai, a_kependidikan, jln, rt, rw, nm_dsn, ds_kel, kode_pos, lintang, bujur, no_tel, no_fax, email, website, singkatan, tgl_berdiri, sk_selenggara, tgl_sk_selenggara, tmt_sk_selenggara, tst_sk_selenggara, sistem_ajar, a_pjj, a_psdku, luas_lab, kapasitas_prak_satu_shift, jml_mhs_pengguna, jml_jam_penggunaan, jml_prodi_pengguna, jml_modul_prak_sendiri, jml_modul_prak_lain, fungsi_selain_prak, penggunaan_lab, a_pkl, id_sp, id_jns_sms, id_fungsi_lab, id_kel_usaha, id_blob, id_wil, id_induk_sms, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
select id_sms, id_fak_unila, id_jur_unila, id_jur, id_jenj_didik, nm_lemb, kd_kl, kd_satker, smt_mulai, a_selenggara_subst, stat_prodi_unila, kode_prodi, nm_prodi_english, kpst_pd, sks_lulus, gelar_lulusan, stat_prodi, polesei_nilai, a_kependidikan, jln, rt, rw, nm_dsn, ds_kel, kode_pos, lintang, bujur, no_tel, no_fax, email, website, singkatan, tgl_berdiri, sk_selenggara, tgl_sk_selenggara, tmt_sk_selenggara, tst_sk_selenggara, sistem_ajar, a_pjj, a_psdku, luas_lab, kapasitas_prak_satu_shift, jml_mhs_pengguna, jml_jam_penggunaan, jml_prodi_pengguna, jml_modul_prak_sendiri, jml_modul_prak_lain, fungsi_selain_prak, penggunaan_lab, a_pkl, id_sp, id_jns_sms, id_fungsi_lab, id_kel_usaha, id_blob, id_wil, id_induk_sms, create_date, id_creator, last_update, id_updater, soft_delete, last_sync
from pdrd.tmp_sms
go

if exists (select 1
            from  sysobjects
           where  id = object_id('pdrd.tmp_sms')
            and   type = 'U')
   drop table pdrd.tmp_sms
go

/*==============================================================*/
/* Table: status_anak                                           */
/*==============================================================*/
create table ref.status_anak (
   id_stat_anak         numeric(1)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_status_a check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_status_a check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_stat_anak         varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_status_anak primary key (id_stat_anak)
)
go

insert into ref.status_anak (id_stat_anak, nm_stat_anak, create_date, last_update, expired_date, last_sync)
select id_stat_anak, nm_stat_anak, create_date, last_update, expired_date, last_sync
from ref.tmp_status_anak
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_status_anak')
            and   type = 'U')
   drop table ref.tmp_status_anak
go

/*==============================================================*/
/* Table: status_keaktifan_pegawai                              */
/*==============================================================*/
create table ref.status_keaktifan_pegawai (
   id_stat_aktif        numeric(2)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_status_k3 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_status_k3 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_stat_aktif        varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_status_keaktifan_pegawai primary key (id_stat_aktif)
)
go

insert into ref.status_keaktifan_pegawai (id_stat_aktif, nm_stat_aktif, create_date, last_update, expired_date, last_sync)
select id_stat_aktif, nm_stat_aktif, create_date, last_update, expired_date, last_sync
from ref.tmp_status_keaktifan_pegawai
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_status_keaktifan_pegawai')
            and   type = 'U')
   drop table ref.tmp_status_keaktifan_pegawai
go

/*==============================================================*/
/* Table: status_kepegawaian                                    */
/*==============================================================*/
create table ref.status_kepegawaian (
   id_stat_pegawai      smallint             not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_status_k4 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_status_k4 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_stat_pegawai      varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_status_kepegawaian primary key (id_stat_pegawai)
)
go

insert into ref.status_kepegawaian (id_stat_pegawai, nm_stat_pegawai, create_date, last_update, expired_date, last_sync)
select id_stat_pegawai, nm_stat_pegawai, create_date, last_update, expired_date, last_sync
from ref.tmp_status_kepegawaian
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_status_kepegawaian')
            and   type = 'U')
   drop table ref.tmp_status_kepegawaian
go

/*==============================================================*/
/* Table: status_kepemilikan                                    */
/*==============================================================*/
create table ref.status_kepemilikan (
   id_stat_milik        numeric(1)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_status_k2 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_status_k2 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_stat_milik        varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_status_kepemilikan primary key (id_stat_milik)
)
go

insert into ref.status_kepemilikan (id_stat_milik, nm_stat_milik, create_date, last_update, expired_date, last_sync)
select id_stat_milik, nm_stat_milik, create_date, last_update, expired_date, last_sync
from ref.tmp_status_kepemilikan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_status_kepemilikan')
            and   type = 'U')
   drop table ref.tmp_status_kepemilikan
go

/*==============================================================*/
/* Table: status_kerjasama                                      */
/*==============================================================*/
create table ref.status_kerjasama (
   id_stat_kerjasama    numeric(2)           identity,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_status_k check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_status_k check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_stat_kerjasama    varchar(60)          not null,
   ket                  varchar(250)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_status_kerjasama primary key (id_stat_kerjasama)
)
go

set identity_insert ref.status_kerjasama on
go

insert into ref.status_kerjasama (id_stat_kerjasama, nm_stat_kerjasama, ket, create_date, last_update, expired_date, last_sync)
select id_stat_kerjasama, nm_stat_kerjasama, ket, create_date, last_update, expired_date, last_sync
from ref.tmp_status_kerjasama
go

set identity_insert ref.status_kerjasama off
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_status_kerjasama')
            and   type = 'U')
   drop table ref.tmp_status_kerjasama
go

/*==============================================================*/
/* Table: status_mahasiswa                                      */
/*==============================================================*/
create table ref.status_mahasiswa (
   id_stat_mhs          char(1)              not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_status_m2 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_status_m2 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_stat_mhs          varchar(30)          not null,
   ket_stat_mhs         varchar(100)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_status_mahasiswa primary key (id_stat_mhs)
)
go

insert into ref.status_mahasiswa (id_stat_mhs, nm_stat_mhs, ket_stat_mhs, create_date, last_update, expired_date, last_sync)
select id_stat_mhs, nm_stat_mhs, ket_stat_mhs, create_date, last_update, expired_date, last_sync
from ref.tmp_status_mahasiswa
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_status_mahasiswa')
            and   type = 'U')
   drop table ref.tmp_status_mahasiswa
go

/*==============================================================*/
/* Table: status_milik_sarpras                                  */
/*==============================================================*/
create table ref.status_milik_sarpras (
   id_stat_milik_sarpras numeric(1)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_status_m check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_status_m check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_stat_milik_sarpras varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_status_milik_sarpras primary key (id_stat_milik_sarpras)
)
go

insert into ref.status_milik_sarpras (id_stat_milik_sarpras, nm_stat_milik_sarpras, create_date, last_update, expired_date, last_sync)
select id_stat_milik_sarpras, nm_stat_milik_sarpras, create_date, last_update, expired_date, last_sync
from ref.tmp_status_milik_sarpras
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_status_milik_sarpras')
            and   type = 'U')
   drop table ref.tmp_status_milik_sarpras
go

/*==============================================================*/
/* Table: sumber_air                                            */
/*==============================================================*/
create table ref.sumber_air (
   id_sumber_air        numeric(2)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_sumber_a check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_sumber_a check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   nm_sumber_air        varchar(50)          not null,
   constraint pk_sumber_air primary key (id_sumber_air)
)
go

insert into ref.sumber_air (id_sumber_air, create_date, last_update, expired_date, last_sync, nm_sumber_air)
select id_sumber_air, create_date, last_update, expired_date, last_sync, nm_sumber_air
from ref.tmp_sumber_air
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_sumber_air')
            and   type = 'U')
   drop table ref.tmp_sumber_air
go

/*==============================================================*/
/* Table: sumber_dana                                           */
/*==============================================================*/
create table ref.sumber_dana (
   id_sumber_dana       numeric(4)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_sumber_d check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_sumber_d check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_sumber_dana       varchar(80)          not null,
   u_blockgrant         numeric(1)           not null default 0
      constraint ckc_u_blockgrant_sumber_d check (u_blockgrant between 0 and 1 and u_blockgrant in (0,1)),
   u_beasiswa           numeric(1)           not null default 0
      constraint ckc_u_beasiswa_sumber_d check (u_beasiswa between 0 and 1 and u_beasiswa in (0,1)),
   u_lit                numeric(1)           not null default 0
      constraint ckc_u_lit_sumber_d check (u_lit between 0 and 1 and u_lit in (0,1)),
   u_unit_usaha         numeric(1)           not null default 0
      constraint ckc_u_unit_usaha_sumber_d check (u_unit_usaha between 0 and 1 and u_unit_usaha in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_sumber_dana primary key (id_sumber_dana)
)
go

insert into ref.sumber_dana (id_sumber_dana, nm_sumber_dana, u_blockgrant, u_beasiswa, u_lit, u_unit_usaha, create_date, last_update, expired_date, last_sync)
select id_sumber_dana, nm_sumber_dana, u_blockgrant, u_beasiswa, u_lit, u_unit_usaha, create_date, last_update, expired_date, last_sync
from ref.tmp_sumber_dana
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_sumber_dana')
            and   type = 'U')
   drop table ref.tmp_sumber_dana
go

/*==============================================================*/
/* Table: sumber_gaji                                           */
/*==============================================================*/
create table ref.sumber_gaji (
   id_sumber_gaji       numeric(2)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_sumber_g check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_sumber_g check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   nm_sumber_gaji       varchar(50)          not null,
   constraint pk_sumber_gaji primary key (id_sumber_gaji)
)
go

insert into ref.sumber_gaji (id_sumber_gaji, create_date, last_update, expired_date, last_sync, nm_sumber_gaji)
select id_sumber_gaji, create_date, last_update, expired_date, last_sync, nm_sumber_gaji
from ref.tmp_sumber_gaji
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_sumber_gaji')
            and   type = 'U')
   drop table ref.tmp_sumber_gaji
go

/*==============================================================*/
/* Table: sumber_listrik                                        */
/*==============================================================*/
create table ref.sumber_listrik (
   id_sumber_listrik    numeric(2)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_sumber_l check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_sumber_l check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   nm_sumber_listrik    varchar(50)          not null,
   constraint pk_sumber_listrik primary key (id_sumber_listrik)
)
go

insert into ref.sumber_listrik (id_sumber_listrik, create_date, last_update, expired_date, last_sync, nm_sumber_listrik)
select id_sumber_listrik, create_date, last_update, expired_date, last_sync, nm_sumber_listrik
from ref.tmp_sumber_listrik
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_sumber_listrik')
            and   type = 'U')
   drop table ref.tmp_sumber_listrik
go

/*==============================================================*/
/* Table: tahun_ajaran                                          */
/*==============================================================*/
create table ref.tahun_ajaran (
   id_thn_ajaran        numeric(4)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_tahun_aj check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_tahun_aj check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_thn_ajaran        varchar(50)          not null,
   a_periode_aktif      numeric(1)           null default 0
      constraint ckc_a_periode_aktif_tahun_aj check (a_periode_aktif is null or (a_periode_aktif between 0 and 1 and a_periode_aktif in (0,1))),
   tgl_mulai            datetime             not null,
   tgl_selesai          datetime             not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_tahun_ajaran primary key (id_thn_ajaran)
)
go

insert into ref.tahun_ajaran (id_thn_ajaran, nm_thn_ajaran, a_periode_aktif, tgl_mulai, tgl_selesai, create_date, last_update, expired_date, last_sync)
select id_thn_ajaran, nm_thn_ajaran, a_periode_aktif, tgl_mulai, tgl_selesai, create_date, last_update, expired_date, last_sync
from ref.tmp_tahun_ajaran
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_tahun_ajaran')
            and   type = 'U')
   drop table ref.tmp_tahun_ajaran
go

/*==============================================================*/
/* Table: tahun_anggaran                                        */
/*==============================================================*/
create table ref.tahun_anggaran (
   id_tahun_anggaran    numeric(4)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_tahun_an check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_tahun_an check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
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
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_tingkat_ check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_tingkat_ check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_tingkat_kerjasama varchar(60)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_tingkat_kerjasama primary key (id_tingkat_kerjasama)
)
go

set identity_insert ref.tingkat_kerjasama on
go

insert into ref.tingkat_kerjasama (id_tingkat_kerjasama, nm_tingkat_kerjasama, create_date, last_update, expired_date, last_sync)
select id_tingkat_kerjasama, nm_tingkat_kerjasama, create_date, last_update, expired_date, last_sync
from ref.tmp_tingkat_kerjasama
go

set identity_insert ref.tingkat_kerjasama off
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_tingkat_kerjasama')
            and   type = 'U')
   drop table ref.tmp_tingkat_kerjasama
go

/*==============================================================*/
/* Table: tingkat_penghargaan                                   */
/*==============================================================*/
create table ref.tingkat_penghargaan (
   id_tkt_penghargaan   int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_tingkat_3 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_tingkat_3 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_tkt_penghargaan   varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_tingkat_penghargaan primary key (id_tkt_penghargaan)
)
go

insert into ref.tingkat_penghargaan (id_tkt_penghargaan, nm_tkt_penghargaan, create_date, last_update, expired_date, last_sync)
select id_tkt_penghargaan, nm_tkt_penghargaan, create_date, last_update, expired_date, last_sync
from ref.tmp_tingkat_penghargaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_tingkat_penghargaan')
            and   type = 'U')
   drop table ref.tmp_tingkat_penghargaan
go

/*==============================================================*/
/* Table: tingkat_prestasi                                      */
/*==============================================================*/
create table ref.tingkat_prestasi (
   id_tkt_prestasi      int                  not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_tingkat_2 check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_tingkat_2 check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_tkt_prestasi      varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_tingkat_prestasi primary key (id_tkt_prestasi)
)
go

insert into ref.tingkat_prestasi (id_tkt_prestasi, nm_tkt_prestasi, create_date, last_update, expired_date, last_sync)
select id_tkt_prestasi, nm_tkt_prestasi, create_date, last_update, expired_date, last_sync
from ref.tmp_tingkat_prestasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_tingkat_prestasi')
            and   type = 'U')
   drop table ref.tmp_tingkat_prestasi
go

/*==============================================================*/
/* Table: tse                                                   */
/*==============================================================*/
create table ref.tse (
   id_tse               numeric(5)           not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_tse check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_tse check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   kode_tse             varchar(20)          not null,
   nm_tse               varchar(120)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_tse primary key (id_tse)
)
go

insert into ref.tse (id_tse, kode_tse, nm_tse, create_date, last_update, expired_date, last_sync)
select id_tse, kode_tse, nm_tse, create_date, last_update, expired_date, last_sync
from ref.tmp_tse
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_tse')
            and   type = 'U')
   drop table ref.tmp_tse
go

/*==============================================================*/
/* Table: wilayah                                               */
/*==============================================================*/
create table ref.wilayah (
   id_wil               char(8)              not null,
   id_negara            char(2)              not null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_wilayah check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_wilayah check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
   nm_wil               varchar(60)          null,
   asal_wil             char(8)              null,
   kode_bps             char(7)              null,
   kode_dagri           char(7)              null,
   kode_keu             varchar(10)          null,
   id_induk_wilayah     char(8)              null,
   id_level_wil         smallint             not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_wilayah primary key (id_wil)
)
go

insert into ref.wilayah (id_wil, id_negara, nm_wil, asal_wil, kode_bps, kode_dagri, kode_keu, id_induk_wilayah, id_level_wil, create_date, last_update, expired_date, last_sync)
select id_wil, id_negara, nm_wil, asal_wil, kode_bps, kode_dagri, kode_keu, id_induk_wilayah, id_level_wil, create_date, last_update, expired_date, last_sync
from ref.tmp_wilayah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.tmp_wilayah')
            and   type = 'U')
   drop table ref.tmp_wilayah
go

alter table pdrd.akred_sp
   add constraint fk_akred_sp_akred_sp_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.akred_sp
   add constraint fk_akred_sp_akred_sp__lembaga_ foreign key (id_lemb_akred)
      references ref.lembaga_akred (id_lemb_akred)
go

alter table pdrd.akred_sp
   add constraint fk_akred_sp_sp_akred__nilai_ak foreign key (id_akred)
      references ref.nilai_akred (id_akred)
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

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_ajar_katg_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_katgiat_a_kategori foreign key (katgiat_ajar_id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_pengajara_jenis_ev foreign key (id_jns_eval)
      references ref.jenis_evaluasi (id_jns_eval)
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_ptk_penga_reg_ptk foreign key (id_reg_ptk)
      references pdrd.reg_ptk (id_reg_ptk)
go

alter table pdrd.akt_mhs
   add constraint fk_akt_mhs_jenis_akt_jenis_ak foreign key (id_jns_akt_mhs)
      references ref.jenis_akt_mhs (id_jns_akt_mhs)
go

alter table pdrd.akt_mhs
   add constraint fk_akt_mhs_prodi_akt_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.akt_mhs
   add constraint fk_akt_mhs_smt_akt_m_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table sarpras.alat
   add constraint fk_alat_alat_mili_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table sarpras.alat
   add constraint fk_alat_alat_ptk2_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table sarpras.alat
   add constraint fk_alat_hapus_buk_jenis_ha foreign key (id_hapus_buku)
      references ref.jenis_hapus_buku (id_hapus_buku)
go

alter table sarpras.alat
   add constraint fk_alat_jenis_sar_jenis_sa foreign key (id_jns_sarana)
      references ref.jenis_sarana (id_jns_sarana)
go

alter table sarpras.alat
   add constraint fk_alat_status_mi_status_m foreign key (id_stat_milik_sarpras)
      references ref.status_milik_sarpras (id_stat_milik_sarpras)
go

alter table sarpras.alat_long
   add constraint fk_alat_lon_smt_pemak_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table pdrd.anak
   add constraint fk_anak_anak_sdm_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.anak
   add constraint fk_anak_anak_stat_status_a foreign key (id_stat_anak)
      references ref.status_anak (id_stat_anak)
go

alter table pdrd.anak
   add constraint fk_anak_jenjang_a_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.anggota_akt_mhs
   add constraint fk_anggota__akt_mhs_a_akt_mhs foreign key (id_akt_mhs)
      references pdrd.akt_mhs (id_akt_mhs)
go

alter table pdrd.anggota_orgprof
   add constraint fk_anggota__orgprof_k_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table pdrd.anggota_orgprof
   add constraint fk_anggota__orgprof_p_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.anggota_panitia
   add constraint fk_anggota__panitia_k_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
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

alter table sarpras.angkutan
   add constraint fk_angkutan_hapus_buk_jenis_ha foreign key (id_hapus_buku)
      references ref.jenis_hapus_buku (id_hapus_buku)
go

alter table sarpras.angkutan
   add constraint fk_angkutan_jenis_sar_jenis_sa foreign key (id_jns_sarana)
      references ref.jenis_sarana (id_jns_sarana)
go

alter table sarpras.angkutan
   add constraint fk_angkutan_status_mi_status_m foreign key (id_stat_milik_sarpras)
      references ref.status_milik_sarpras (id_stat_milik_sarpras)
go

alter table sarpras.bangunan
   add constraint fk_bangunan_hapus_buk_jenis_ha foreign key (id_hapus_buku)
      references ref.jenis_hapus_buku (id_hapus_buku)
go

alter table sarpras.bangunan
   add constraint fk_bangunan_jns_prasa_jenis_pr foreign key (id_jns_prasarana)
      references ref.jenis_prasarana (id_jns_prasarana)
go

alter table sarpras.bangunan
   add constraint fk_bangunan_satuan_ba_satuan foreign key (kd_satuan)
      references ref.satuan (kd_satuan)
go

alter table sarpras.bangunan
   add constraint fk_bangunan_sms_pemil_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table sarpras.bangunan
   add constraint fk_bangunan_status_mi_status_m foreign key (id_stat_milik_sarpras)
      references ref.status_milik_sarpras (id_stat_milik_sarpras)
go

alter table beasiswa.beasiswa_sdm
   add constraint fk_beasiswa_beasiswa__sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table beasiswa.beasiswa_sdm
   add constraint fk_beasiswa_beasiswa__jenis_be foreign key (id_jns_beasiswa)
      references ref.jenis_beasiswa (id_jns_beasiswa)
go

alter table beasiswa.beasiswa_sdm
   add constraint fk_beasiswa_studi_sms_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table keuangan.biaya_operasional
   add constraint fk_biaya_op_jenis_bia_jenis_ke foreign key (id_jns_keuangan)
      references ref.jenis_keuangan (id_jns_keuangan)
go

alter table keuangan.biaya_operasional
   add constraint fk_biaya_op_sms_opera_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table keuangan.biaya_operasional
   add constraint fk_biaya_op_thn_angga_tahun_an foreign key (id_tahun_anggaran)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table ref.bidang_studi
   add constraint fk_bidang_s_kelompok_bidang_s foreign key (id_induk_bidang_studi)
      references ref.bidang_studi (id_bid_studi)
go

alter table pdrd.bimbing_dosen
   add constraint fk_bimbing__bimbdosen_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table pdrd.bimbing_mhs
   add constraint fk_bimbing__aktmhs_bi_akt_mhs foreign key (id_akt_mhs)
      references pdrd.akt_mhs (id_akt_mhs)
go

alter table pdrd.bimbing_mhs
   add constraint fk_bimbing__bimbingmh_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table pdrd.bimbing_mhs
   add constraint fk_bimbing__dosen_pem_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.buku_ajar
   add constraint fk_buku_aja_capaian_b_kategori foreign key (id_kat_capaian)
      references ref.kategori_capaian_luaran (id_kat_capaian)
go

alter table pdrd.buku_ajar
   add constraint fk_buku_aja_jenis_buk_jenis_ba foreign key (id_jns_bhn_ajar)
      references ref.jenis_bahan_ajar (id_jns_bhn_ajar)
go

alter table mbkm.daftar_kampus_merdeka
   add constraint fk_daftar_k_asal_pt_m_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pmb.daya_tampung
   add constraint fk_daya_tam_daya_tamp_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
         on update cascade on delete cascade
go

alter table pmb.daya_tampung
   add constraint fk_daya_tam_smt_daya__semester foreign key (id_smt)
      references ref.semester (id_smt)
         on update cascade on delete cascade
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
   add constraint fk_detaseri_detas_kat_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
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
go

alter table pdrd.diklat
   add constraint fk_diklat_diklat_ke_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.diklat
   add constraint fk_diklat_diklat_pt_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.diklat
   add constraint fk_diklat_sp_diklat_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
         on update cascade on delete cascade
go

alter table dok.dok_akt_mhs
   add constraint fk_dok_akt__akt_mhs_d_akt_mhs foreign key (id_akt_mhs)
      references pdrd.akt_mhs (id_akt_mhs)
go

alter table dok.dok_diklat
   add constraint fk_dok_dikl_diklat_do_diklat foreign key (id_diklat)
      references pdrd.diklat (id_diklat)
go

alter table dok.dok_nilai_tes
   add constraint fk_dok_nila_nilaites__nilai_te foreign key (id_nilai_tes)
      references pdrd.nilai_tes (id_nilai_tes)
go

alter table dok.dokumen
   add constraint fk_dokumen_jenis_dok_jenis_do foreign key (id_jns_dok)
      references ref.jenis_dokumen (id_jns_dok)
go

alter table pdrd.dudi
   add constraint fk_dudi_dudi_bu_bidang_u foreign key (id_bu)
      references ref.bidang_usaha (id_bu)
go

alter table pdrd.dudi
   add constraint fk_dudi_wil_dudi_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table mbkm.ekuiv_transfer
   add constraint fk_ekuiv_tr_akt_mhs_e_akt_mhs foreign key (id_akt_mhs)
      references pdrd.akt_mhs (id_akt_mhs)
         on update cascade on delete cascade
go

alter table mbkm.ekuiv_transfer
   add constraint fk_ekuiv_tr_smt_ekuiv_semester foreign key (id_smt)
      references ref.semester (id_smt)
         on update cascade on delete cascade
go

alter table mbkm.ekuiv_transfer
   add constraint fk_ekuiv_tr_sp_ekuiv__satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
         on update cascade on delete cascade
go

alter table dok.foto_peserta_didik
   add constraint fk_foto_pes_pemilik_f_peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
go

alter table tracer.hasil_tracer_atasan
   add constraint fk_hasil_tr_negara_at_negara foreign key (id_negara)
      references ref.negara (id_negara)
go

alter table tracer.hasil_tracer_atasan
   add constraint fk_hasil_tr_prov_atas_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
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
   add constraint fk_hasil_tr_smt_mengi_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table tracer.hasil_tracer_study
   add constraint fk_hasil_tr_tahun_men_tahun_aj foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

alter table indikator_spmi
   add constraint fk_indikato_jenjang_i_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
         on update cascade on delete cascade
go

alter table pdrd.inpassing
   add constraint fk_inpassin_inpassing_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.inpassing
   add constraint fk_inpassin_inpassing_pangkat_ foreign key (id_pangkat_gol)
      references ref.pangkat_golongan (id_pangkat_gol)
go

alter table ref.jab_tgs
   add constraint fk_jab_tgs_tugtam_pr_kelompok foreign key (id_kel_prof)
      references ref.kelompok_profesi (id_kel_prof)
go

alter table ref.jabfung
   add constraint fk_jabfung_jabfung_p_kelompok foreign key (id_kel_prof)
      references ref.kelompok_profesi (id_kel_prof)
go

alter table pdrd.jadwal_kelas
   add constraint fk_jadwal_k_jdwl_kls__semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table ref.jenis_beasiswa
   add constraint fk_jenis_be_sumber_be_sumber_d foreign key (id_sumber_dana)
      references ref.sumber_dana (id_sumber_dana)
go

alter table ref.jurusan
   add constraint fk_jurusan_bid_jur_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table ref.jurusan
   add constraint fk_jurusan_induk_pro_jurusan foreign key (id_induk_jurusan)
      references ref.jurusan (id_jur)
go

alter table ref.jurusan
   add constraint fk_jurusan_jur_std_j_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table ref.kategori_kegiatan
   add constraint fk_kategori_induk_kat_kategori foreign key (id_induk_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table ref.kategori_kegiatan
   add constraint fk_kategori_katgiat_s_jenis_sd foreign key (id_jns_sdm)
      references ref.jenis_sdm (id_jns_sdm)
go

alter table ref.kategori_tabel
   add constraint fk_kategori_kat_metad_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table ref.kbli
   add constraint fk_kbli_induk_kbl_kbli foreign key (id_induk_kbli)
      references ref.kbli (id_kbli)
go

alter table pdrd.keaktifan_ptk
   add constraint fk_keaktifa_long_reg__reg_ptk foreign key (id_reg_ptk)
      references pdrd.reg_ptk (id_reg_ptk)
go

alter table pdrd.keaktifan_ptk
   add constraint fk_keaktifa_tahun_kea_tahun_aj foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

alter table presensi.kehadiran_mhs
   add constraint fk_kehadira_hadir_mhs_reg_ptk foreign key (id_reg_ptk)
      references pdrd.reg_ptk (id_reg_ptk)
go

alter table presensi.kehadiran_sdm
   add constraint fk_kehadira_hadir_sdm_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.kelas_kuliah
   add constraint fk_kelas_ku_prodi_kel_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.kelas_kuliah
   add constraint fk_kelas_ku_smt_kelas_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table kelola_unit_fungsi
   add constraint fk_kelola_u_kelola_la_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table ref.kelompok_bidang
   add constraint fk_kelompok_induk_kel_kelompok foreign key (id_induk_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.kepanitiaan
   add constraint fk_kepaniti_jenis_pan_jenis_ke foreign key (id_jns_panitia)
      references ref.jenis_kepanitiaan (id_jns_panitia)
go

alter table pdrd.kesejahteraan
   add constraint fk_kesejaht_kesejahte_jenis_ke foreign key (id_jns_sejahtera)
      references ref.jenis_kesejahteraan (id_jns_sejahtera)
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

alter table mbkm.konversi_akt_mhs
   add constraint fk_konversi_akt_konve_akt_mhs foreign key (id_akt_mhs)
      references pdrd.akt_mhs (id_akt_mhs)
go

alter table mbkm.konversi_akt_mhs
   add constraint fk_konversi_hasil_kon_daftar_k foreign key (id_daftar_kampus_merdeka)
      references mbkm.daftar_kampus_merdeka (id_daftar_kampus_merdeka)
go

alter table mbkm.konversi_akt_mhs
   add constraint fk_konversi_konversi__anggota_ foreign key (id_ang_akt_mhs)
      references pdrd.anggota_akt_mhs (id_ang_akt_mhs)
go

alter table mbkm.konversi_akt_mhs
   add constraint fk_konversi_konversi__matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
go

alter table mbkm.konversi_akt_mhs
   add constraint fk_konversi_smt_konve_semester foreign key (id_smt)
      references ref.semester (id_smt)
         on update cascade on delete cascade
go

alter table pdrd.kuliah_mhs
   add constraint fk_kuliah_m_keaktifan_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table pdrd.kuliah_mhs
   add constraint fk_kuliah_m_pembiayaa_pembiaya foreign key (id_pembiayaan)
      references ref.pembiayaan (id_pembiayaan)
         on update cascade on delete cascade
go

alter table pdrd.kuliah_mhs
   add constraint fk_kuliah_m_register__reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
go

alter table pdrd.kuliah_mhs
   add constraint fk_kuliah_m_status_mh_status_m foreign key (id_stat_mhs)
      references ref.status_mahasiswa (id_stat_mhs)
go

alter table pdrd.kurikulum_sp
   add constraint fk_kurikulu_jenjang_k_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.kurikulum_sp
   add constraint fk_kurikulu_sms_kurik_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
         on update cascade on delete cascade
go

alter table pdrd.kurikulum_sp
   add constraint fk_kurikulu_smt_kurik_semester foreign key (id_smt)
      references ref.semester (id_smt)
         on update cascade on delete cascade
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
   add constraint fk_litabmas_jenis_pen_jenis_pe foreign key (id_jns_lit)
      references ref.jenis_penelitian (id_jns_lit)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_rumpun_il_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_skim_kegi_skim_keg foreign key (id_skim)
      references ref.skim_kegiatan (id_skim)
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

alter table pdrd.litabmas
   add constraint fk_litabmas_tse_litab_tse foreign key (id_tse)
      references ref.tse (id_tse)
go

alter table pdrd.map_abmas_tse
   add constraint fk_map_abma_abmas_tse_tse foreign key (id_tse)
      references ref.tse (id_tse)
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
   add constraint fk_matkul_jenjang_p_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.matkul
   add constraint fk_matkul_prodi_mat_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table ref.media_publikasi
   add constraint fk_media_pu_bidang_me_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table ref.media_publikasi
   add constraint fk_media_pu_jenis_med_jenis_me foreign key (id_jns_media)
      references ref.jenis_media_pub (id_jns_media)
go

alter table ref.media_publikasi
   add constraint fk_media_pu_negara_me_negara foreign key (id_negara)
      references ref.negara (id_negara)
go

alter table ref.media_publikasi
   add constraint fk_media_pu_sp_media__satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table man_akses.menu_role
   add constraint fk_menu_rol_akses_men_peran foreign key (id_peran)
      references man_akses.peran (id_peran)
go

alter table mbkm.mk_konversi
   add constraint fk_mk_konve_sp_asal_m_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table kerjasama.mou
   add constraint fk_mou_akt_trida_aktifita foreign key (id_akt_kerjasama)
      references ref.aktifitas_kerjasama (id_akt_kerjasama)
         on update cascade on delete cascade
go

alter table kerjasama.mou
   add constraint fk_mou_mou_antar_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.nilai_tes
   add constraint fk_nilai_te_nilai_tes_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.nilai_tes
   add constraint fk_nilai_te_test_jeni_jenis_te foreign key (id_jns_tes)
      references ref.jenis_tes (id_jns_tes)
go

alter table pdrd.nilai_transkrip
   add constraint fk_nilai_tr_nilai_kon_konversi foreign key (id_konversi_aktivitas)
      references mbkm.konversi_akt_mhs (id_konversi_aktivitas)
         on update cascade on delete cascade
go

alter table pdrd.non_ca
   add constraint fk_non_ca_kewargane_negara foreign key (id_negara)
      references ref.negara (id_negara)
go

alter table pdrd.pd_anggota_litabmas
   add constraint fk_pd_anggo_ang_litab_peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
go

alter table pdrd.pembicara
   add constraint fk_pembicar_bicara_ka_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table pdrd.pembicara
   add constraint fk_pembicar_capaian_p_kategori foreign key (id_kat_capaian)
      references ref.kategori_capaian_luaran (id_kat_capaian)
go

alter table pdrd.pembicara
   add constraint fk_pembicar_pembicata_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.pengelola_jurnal
   add constraint fk_pengelol_jurnal_ke_media_pu foreign key (id_media_pub)
      references ref.media_publikasi (id_media_pub)
go

alter table pdrd.pengelola_jurnal
   add constraint fk_pengelol_keljurnal_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table pdrd.pengelola_jurnal
   add constraint fk_pengelol_kelola_ju_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.penghargaan
   add constraint fk_pengharg_harga_kat_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
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

alter table mbkm.periode_kampus_merdeka
   add constraint fk_periode__jns_akt_m_jenis_ak foreign key (id_jns_akt_mhs)
      references ref.jenis_akt_mhs (id_jns_akt_mhs)
go

alter table mbkm.periode_kampus_merdeka
   add constraint fk_periode__smt_perio_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table pmb.periode_pmb
   add constraint fk_periode__jalur_daf_jalur_da foreign key (id_jalur_daftar)
      references ref.jalur_daftar (id_jalur_daftar)
         on update cascade on delete cascade
go

alter table pmb.periode_pmb
   add constraint fk_periode__jenis_pen_jenis_pe foreign key (id_jns_daftar)
      references ref.jenis_pendaftaran (id_jns_daftar)
         on update cascade on delete cascade
go

alter table pmb.periode_pmb
   add constraint fk_periode__jenjang_p_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
         on update cascade on delete cascade
go

alter table pmb.periode_pmb
   add constraint fk_periode__pembiayaa_pembiaya foreign key (id_pembiayaan)
      references ref.pembiayaan (id_pembiayaan)
         on update cascade on delete cascade
go

alter table pmb.periode_pmb
   add constraint fk_periode__thn_ajara_tahun_aj foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
         on update cascade on delete cascade
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

alter table ref.peta_katgiat_jabfung
   add constraint fk_peta_kat_jabfung_k_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table ref.peta_katgiat_jabfung
   add constraint fk_peta_kat_katgiat_j_jabfung foreign key (id_jabfung)
      references ref.jabfung (id_jabfung)
go

alter table ref.peta_katgiat_jnsdok
   add constraint fk_peta_kat_jnsdok_ka_jenis_do foreign key (id_jns_dok)
      references ref.jenis_dokumen (id_jns_dok)
go

alter table ref.peta_katgiat_jnsdok
   add constraint fk_peta_kat_katgiat_j_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table ref.peta_katgiat_jnspub
   add constraint fk_peta_kat_kat_pub_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table ref.peta_katgiat_jnspub
   add constraint fk_peta_kat_pub_kat_jenis_pu foreign key (id_jns_pub)
      references ref.jenis_publikasi (id_jns_pub)
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

alter table pdrd.profil_prodi
   add constraint fk_ta_profil_prodi foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

alter table pdrd.profil_pt
   add constraint fk_profil_p_profil_sp_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.profil_pt
   add constraint fk_ta_profil_pt foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

alter table pdrd.publikasi
   add constraint fk_publikas_capaian_p_kategori foreign key (id_kat_capaian)
      references ref.kategori_capaian_luaran (id_kat_capaian)
go

alter table pdrd.publikasi
   add constraint fk_publikas_jenis_pub_jenis_pu foreign key (id_jns_pub)
      references ref.jenis_publikasi (id_jns_pub)
go

alter table pdrd.publikasi
   add constraint fk_publikas_pub_media_media_pu foreign key (id_media_pub)
      references ref.media_publikasi (id_media_pub)
go

alter table pdrd.re_mk
   add constraint fk_re_mk_jns_evalu_jenis_ev foreign key (id_jns_eval)
      references ref.jenis_evaluasi (id_jns_eval)
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

alter table pdrd.reg_ptk
   add constraint fk_reg_ptk_ptk_ikata_ikatan_k foreign key (id_ikatan_kerja)
      references ref.ikatan_kerja_sdm (id_ikatan_kerja)
go

alter table pdrd.reg_ptk
   add constraint fk_reg_ptk_ptk_kelua_jenis_ke foreign key (id_jns_keluar)
      references ref.jenis_keluar (id_jns_keluar)
go

alter table pdrd.reg_ptk
   add constraint fk_reg_ptk_ptk_terda_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.reg_ptk
   add constraint fk_reg_ptk_ptk_terda_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.reg_ptk
   add constraint fk_reg_ptk_reg_dosen_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.reg_ptk
   add constraint fk_reg_ptk_statpeg_p_status_k foreign key (id_stat_pegawai)
      references ref.status_kepegawaian (id_stat_pegawai)
go

alter table man_akses.role_pengguna
   add constraint fk_role_pen_akses_pen_peran foreign key (id_peran)
      references man_akses.peran (id_peran)
go

alter table sarpras.ruang
   add constraint fk_ruang_satuan_ru_satuan foreign key (kd_satuan)
      references ref.satuan (kd_satuan)
go

alter table sarpras.ruang
   add constraint fk_ruang_sms_pemil_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.rwy_fungsional
   add constraint fk_rwy_fung_jab_fung__sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_fungsional
   add constraint fk_rwy_fung_jabfung_b_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.rwy_fungsional
   add constraint fk_rwy_fung_rwyt_fung_jabfung foreign key (id_jabfung)
      references ref.jabfung (id_jabfung)
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
   add constraint fk_rwy_kepa_riwayat_p_pangkat_ foreign key (id_pangkat_gol)
      references ref.pangkat_golongan (id_pangkat_gol)
go

alter table pdrd.rwy_kepangkatan
   add constraint fk_rwy_kepa_rwy_pangk_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_pekerjaan
   add constraint fk_rwy_peke_pekerjaan_pekerjaa foreign key (id_pekerjaan)
      references ref.pekerjaan (id_pekerjaan)
go

alter table pdrd.rwy_pekerjaan
   add constraint fk_rwy_peke_rwy_peker_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_pekerjaan
   add constraint fk_rwy_peke_sektor_pe_kbli foreign key (id_kbli)
      references ref.kbli (id_kbli)
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

alter table pdrd.rwy_struktural
   add constraint fk_rwy_stru_jab_stru__sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_struktural
   add constraint fk_rwy_stru_jabstruk__kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table pdrd.rwy_struktural
   add constraint fk_rwy_stru_rwyt_jab_jab_tgs foreign key (id_jab_tgs)
      references ref.jab_tgs (id_jab_tgs)
go

alter table pdrd.satuan_pendidikan
   add constraint fk_satuan_p_logo_sp_large_ob foreign key (id_blob)
      references dok.large_object (id_blob)
go

alter table pdrd.satuan_pendidikan
   add constraint fk_satuan_p_pembina_s_lembaga_ foreign key (id_pembina)
      references pdrd.lembaga_non_sp (id_lemb_non_sp)
go

alter table pdrd.satuan_pendidikan
   add constraint fk_satuan_p_sp_bentuk_bentuk_p foreign key (id_bp)
      references ref.bentuk_pendidikan (id_bp)
go

alter table pdrd.satuan_pendidikan
   add constraint fk_satuan_p_sp_milik_status_k foreign key (id_stat_milik)
      references ref.status_kepemilikan (id_stat_milik)
go

alter table pdrd.satuan_pendidikan
   add constraint fk_satuan_p_wilayah_s_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
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

alter table pdrd.sdm_anggota_litabmas
   add constraint fk_sdm_angg_litabmas__kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table ref.semester
   add constraint fk_semester_ta_semest_tahun_aj foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

alter table ref.skim_kegiatan
   add constraint fk_skim_keg_jenj_pend_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
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

alter table keuangan.spp_mhs
   add constraint fk_spp_mhs_bayar_spp_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table pdrd.substansi_kuliah
   add constraint fk_substans_substansi_jenis_su foreign key (id_jns_subst)
      references ref.jenis_subst (id_jns_subst)
go

alter table pdrd.substansi_kuliah
   add constraint fk_substans_substansi_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
         on update cascade on delete cascade
go

alter table sarpras.tanah
   add constraint fk_tanah_hapus_buk_jenis_ha foreign key (id_hapus_buku)
      references ref.jenis_hapus_buku (id_hapus_buku)
go

alter table sarpras.tanah
   add constraint fk_tanah_jns_prasa_jenis_pr foreign key (id_jns_prasarana)
      references ref.jenis_prasarana (id_jns_prasarana)
go

alter table sarpras.tanah
   add constraint fk_tanah_sms_pemil_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table sarpras.tanah
   add constraint fk_tanah_status_mi_status_m foreign key (id_stat_milik_sarpras)
      references ref.status_milik_sarpras (id_stat_milik_sarpras)
go

alter table pdrd.tugas_belajar
   add constraint fk_tugas_be_tb_jenjan_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.tugas_belajar
   add constraint fk_tugas_be_tb_negara_negara foreign key (id_negara)
      references ref.negara (id_negara)
go

alter table pdrd.tugas_belajar
   add constraint fk_tugas_be_tb_sp_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
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
   add constraint fk_tugas_ta_tug_tamba_jab_tgs foreign key (id_jab_tgs)
      references ref.jab_tgs (id_jab_tgs)
go

alter table pdrd.tugas_tambahan
   add constraint fk_tugas_ta_tugtam_ka_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
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
   add constraint fk_tulis_pu_pd_ang_tu_peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
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
   add constraint fk_tunjanga_tunjangan_jenis_tu foreign key (id_jns_tunj)
      references ref.jenis_tunjangan (id_jns_tunj)
go

alter table pdrd.tunjangan
   add constraint fk_tunjanga_tunjangan_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
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
go

alter table tracer.umr_wilayah
   add constraint fk_umr_wila_thn_angga_tahun_an foreign key (id_tahun_anggaran)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table tracer.umr_wilayah
   add constraint fk_umr_wila_umr_kota_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table man_akses.unit_organisasi
   add constraint fk_unit_org_jenis_org_jenis_le foreign key (id_jns_lemb)
      references ref.jenis_lembaga (id_jns_lemb)
go

alter table man_akses.unit_organisasi
   add constraint fk_unit_org_wilayah_o_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table pdrd.visiting_scientist
   add constraint fk_visiting_capaian_v_kategori foreign key (id_kat_capaian)
      references ref.kategori_capaian_luaran (id_kat_capaian)
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
go

alter table ref.wilayah
   add constraint fk_wilayah_induk_wil_wilayah foreign key (id_induk_wilayah)
      references ref.wilayah (id_wil)
go

alter table ref.wilayah
   add constraint fk_wilayah_level_wil_level_wi foreign key (id_level_wil)
      references ref.level_wilayah (id_level_wil)
go

alter table ref.wilayah
   add constraint fk_wilayah_wilayah_n_negara foreign key (id_negara)
      references ref.negara (id_negara)
go

INSERT INTO man_akses.versi_db (versi,tgl_update) VALUES ('0.9.0',GETDATE());