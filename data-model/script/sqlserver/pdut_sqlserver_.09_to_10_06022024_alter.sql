/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     06/02/2024 10:35:51                          */
/*==============================================================*/


if exists (select 1
          from sysobjects
          where  id = object_id('public.buat_transkrip_wisuda_final')
          and type in ('IF', 'FN', 'TF'))
   drop function public.buat_transkrip_wisuda_final
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.buat_transkrip_wisuda_temporer')
          and type in ('IF', 'FN', 'TF'))
   drop function public.buat_transkrip_wisuda_temporer
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_batas_nilai_skripsi')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_batas_nilai_skripsi
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_dosen')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_dosen
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_dosen_pa')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_dosen_pa
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_fakultas')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_fakultas
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_jurusan')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_jurusan
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_jurusan_mhs')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_jurusan_mhs
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_ket_nomor_mk')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_ket_nomor_mk
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_kode_jur_dr_kode_ps')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_kode_jur_dr_kode_ps
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_mahasiswa')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_mahasiswa
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_mata_kuliah')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_mata_kuliah
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_mata_kuliah_en')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_mata_kuliah_en
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_max_pengambilan_mk_ke')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_max_pengambilan_mk_ke
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_nama_mk')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_nama_mk
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_nama_mk_dr_no_jadwal')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_nama_mk_dr_no_jadwal
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_nama_pesan')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_nama_pesan
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_nama_strata')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_nama_strata
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_nilai_mk_terakhir')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_nilai_mk_terakhir
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_nilai_mk_terakhir_old')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_nilai_mk_terakhir_old
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_nilai_mk_terbaik')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_nilai_mk_terbaik
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_nip_baru_pa')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_nip_baru_pa
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_nip_pa')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_nip_pa
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_nip_pd1_mhs')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_nip_pd1_mhs
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_norut_semester')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_norut_semester
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_pd1')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_pd1
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_pj_dr_nomor')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_pj_dr_nomor
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_predikat_kelulusan')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_predikat_kelulusan
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_prodi_mhs')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_prodi_mhs
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_program_studi')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_program_studi
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_session')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_session
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_session_2')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_session_2
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_sifat_mk')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_sifat_mk
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_sks_mk')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_sks_mk
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_strata_mahasiswa')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_strata_mahasiswa
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_th_kurikulum_angkatan')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_th_kurikulum_angkatan
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_urutan_semester')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_urutan_semester
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_waktu_1')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_waktu_1
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cari_waktu_2')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cari_waktu_2
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.catat_aktivitas_user')
          and type in ('IF', 'FN', 'TF'))
   drop function public.catat_aktivitas_user
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.catat_dak_ke_krs')
          and type in ('IF', 'FN', 'TF'))
   drop function public.catat_dak_ke_krs
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.catat_insert_user')
          and type in ('IF', 'FN', 'TF'))
   drop function public.catat_insert_user
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.catat_krs_ke_dak')
          and type in ('IF', 'FN', 'TF'))
   drop function public.catat_krs_ke_dak
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.catat_perubahan_jadwal')
          and type in ('IF', 'FN', 'TF'))
   drop function public.catat_perubahan_jadwal
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.catat_perubahan_nilai')
          and type in ('IF', 'FN', 'TF'))
   drop function public.catat_perubahan_nilai
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.catat_ubah_mk_mahasiswa')
          and type in ('IF', 'FN', 'TF'))
   drop function public.catat_ubah_mk_mahasiswa
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_ada_mk_di_jur')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_ada_mk_di_jur
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_ada_mk_di_ps')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_ada_mk_di_ps
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_ada_nilai')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_ada_nilai
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_ganjil_genap')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_ganjil_genap
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_mk_prasyarat')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_mk_prasyarat
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_mk_prasyarat_di_jadwal')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_mk_prasyarat_di_jadwal
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_mk_prasyarat_di_jur')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_mk_prasyarat_di_jur
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_mk_prasyarat_di_jur')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_mk_prasyarat_di_jur
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_mk_prasyarat_di_ps')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_mk_prasyarat_di_ps
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_status_lulus_mk')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_status_lulus_mk
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_status_mk_krs')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_status_mk_krs
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_status_mk_transkrip')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_status_mk_transkrip
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_status_spp')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_status_spp
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_status_spp')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_status_spp
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_waktu_isi_krs')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_waktu_isi_krs
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_waktu_isi_nilai')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_waktu_isi_nilai
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.cek_waktu_perubahan_nilai')
          and type in ('IF', 'FN', 'TF'))
   drop function public.cek_waktu_perubahan_nilai
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.copy_kurikulum')
          and type in ('IF', 'FN', 'TF'))
   drop function public.copy_kurikulum
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_countcekalkeuangan')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_countcekalkeuangan
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_countcuti')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_countcuti
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_countnonaktif')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_countnonaktif
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_formatjadwal')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_formatjadwal
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_formattanggal')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_formattanggal
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_formattgltime')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_formattgltime
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_generateperwalian')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_generateperwalian
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_getbatassks')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_getbatassks
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_getdefunit')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_getdefunit
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_getipslalu')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_getipslalu
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_getmenit')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_getmenit
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_getmkwajib')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_getmkwajib
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_getnamabulan')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_getnamabulan
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_getnamahari')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_getnamahari
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_getnamalengkap')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_getnamalengkap
go

if exists (select 1
          from sysobjects
          where  id = object_id('gate.f_getnewsalt')
          and type in ('IF', 'FN', 'TF'))
   drop function gate.f_getnewsalt
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_getpengajar')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_getpengajar
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_getperiodeaktif')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_getperiodeaktif
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_getperiodesebelumnya')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_getperiodesebelumnya
go

if exists (select 1
          from sysobjects
          where  id = object_id('ref.f_getperiodeurut')
          and type in ('IF', 'FN', 'TF'))
   drop function ref.f_getperiodeurut
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_getsemestermhs')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_getsemestermhs
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_gettimdosen')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_gettimdosen
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_getwaktu')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_getwaktu
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.f_hitungperiode')
          and type in ('IF', 'FN', 'TF'))
   drop function public.f_hitungperiode
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_leveluniv')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_leveluniv
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_migrasikrs')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_migrasikrs
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_migrasikrs1')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_migrasikrs1
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_migrasikrs1')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_migrasikrs1
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_migrasimengajar1')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_migrasimengajar1
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_namalengkap')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_namalengkap
go

if exists (select 1
          from sysobjects
          where  id = object_id('gate.f_resetpassword')
          and type in ('IF', 'FN', 'TF'))
   drop function gate.f_resetpassword
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_setipwalikrs')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_setipwalikrs
go

if exists (select 1
          from sysobjects
          where  id = object_id('gate.f_sortchildunit')
          and type in ('IF', 'FN', 'TF'))
   drop function gate.f_sortchildunit
go

if exists (select 1
          from sysobjects
          where  id = object_id('ref.f_sortchildunit')
          and type in ('IF', 'FN', 'TF'))
   drop function ref.f_sortchildunit
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_updateperwalian')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_updateperwalian
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_updatetranskrip')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_updatetranskrip
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_updatetranskripkonv')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_updatetranskripkonv
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.f_updatetranskripold')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.f_updatetranskripold
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.fta_kelas')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.fta_kelas
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.fta_keluargamhs')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.fta_keluargamhs
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.fta_krs')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.fta_krs
go

if exists (select 1
          from sysobjects
          where  id = object_id('log.fta_log_aktivitas')
          and type in ('IF', 'FN', 'TF'))
   drop function log.fta_log_aktivitas
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.fta_mahasiswa')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.fta_mahasiswa
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.fta_mahasiswa_pdd')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.fta_mahasiswa_pdd
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.fta_matakuliah')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.fta_matakuliah
go

if exists (select 1
          from sysobjects
          where  id = object_id('gate.fta_menu')
          and type in ('IF', 'FN', 'TF'))
   drop function gate.fta_menu
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.fta_nilaitransfer')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.fta_nilaitransfer
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.fta_pegawai')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.fta_pegawai
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.fta_pegawailuar')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.fta_pegawailuar
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.fta_pengajuanskripsi')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.fta_pengajuanskripsi
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.fta_perkuliahan')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.fta_perkuliahan
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.fta_perwalian')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.fta_perwalian
go

if exists (select 1
          from sysobjects
          where  id = object_id('gate.fta_targetrole')
          and type in ('IF', 'FN', 'TF'))
   drop function gate.fta_targetrole
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.fta_transkrip')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.fta_transkrip
go

if exists (select 1
          from sysobjects
          where  id = object_id('gate.fta_unit')
          and type in ('IF', 'FN', 'TF'))
   drop function gate.fta_unit
go

if exists (select 1
          from sysobjects
          where  id = object_id('ref.fta_unit')
          and type in ('IF', 'FN', 'TF'))
   drop function ref.fta_unit
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.fta_yudisium')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.fta_yudisium
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.ftan_softdelete')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.ftan_softdelete
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.ftbn_kelas')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.ftbn_kelas
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.ftbn_konsultasi')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.ftbn_konsultasi
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.ftbn_krs')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.ftbn_krs
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.ftbn_kurikulum')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.ftbn_kurikulum
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.ftbn_mahasiswa')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.ftbn_mahasiswa
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.ftbn_matakuliah')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.ftbn_matakuliah
go

if exists (select 1
          from sysobjects
          where  id = object_id('gate.ftbn_menu')
          and type in ('IF', 'FN', 'TF'))
   drop function gate.ftbn_menu
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.ftbn_pengajuanskripsi')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.ftbn_pengajuanskripsi
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.ftbn_perkuliahan')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.ftbn_perkuliahan
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.ftbn_perwalian')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.ftbn_perwalian
go

if exists (select 1
          from sysobjects
          where  id = object_id('gate.ftbn_targetrole')
          and type in ('IF', 'FN', 'TF'))
   drop function gate.ftbn_targetrole
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.ftbn_transkrip')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.ftbn_transkrip
go

if exists (select 1
          from sysobjects
          where  id = object_id('gate.ftbn_unit')
          and type in ('IF', 'FN', 'TF'))
   drop function gate.ftbn_unit
go

if exists (select 1
          from sysobjects
          where  id = object_id('ref.ftbn_unit')
          and type in ('IF', 'FN', 'TF'))
   drop function ref.ftbn_unit
go

if exists (select 1
          from sysobjects
          where  id = object_id('gate.ftbn_user')
          and type in ('IF', 'FN', 'TF'))
   drop function gate.ftbn_user
go

if exists (select 1
          from sysobjects
          where  id = object_id('akademik.ftbn_yudisium')
          and type in ('IF', 'FN', 'TF'))
   drop function akademik.ftbn_yudisium
go

if exists (select 1
          from sysobjects
          where  id = object_id('log.ftg_log_setting')
          and type in ('IF', 'FN', 'TF'))
   drop function log.ftg_log_setting
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.fungsi_trg_data_do')
          and type in ('IF', 'FN', 'TF'))
   drop function public.fungsi_trg_data_do
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.fungsi_trg_lulusan')
          and type in ('IF', 'FN', 'TF'))
   drop function public.fungsi_trg_lulusan
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.fungsi_trg_pembatalan_do')
          and type in ('IF', 'FN', 'TF'))
   drop function public.fungsi_trg_pembatalan_do
go

if exists (select 1
          from sysobjects
          where  id = object_id('web_service.fungsi_trg_user_ws')
          and type in ('IF', 'FN', 'TF'))
   drop function web_service.fungsi_trg_user_ws
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hapus_transkrip_wisuda_final')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hapus_transkrip_wisuda_final
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_am')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_am
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_ip_smt')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_ip_smt
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_ipk')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_ipk
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_ipk_30_sks')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_ipk_30_sks
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_ipk_40_sks')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_ipk_40_sks
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_ipk_80_sks')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_ipk_80_sks
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_ipk_sampai_smt')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_ipk_sampai_smt
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_ipk_sd_smt')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_ipk_sd_smt
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_ipk_temporer')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_ipk_temporer
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_ipk_wisuda')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_ipk_wisuda
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jatah_sks')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jatah_sks
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jatah_sks')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jatah_sks
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jatah_sks_final')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jatah_sks_final
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jumlah_krs_mhs')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jumlah_krs_mhs
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jumlah_nilai_a')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jumlah_nilai_a
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jumlah_nilai_b')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jumlah_nilai_b
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jumlah_nilai_bplus')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jumlah_nilai_bplus
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jumlah_nilai_c')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jumlah_nilai_c
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jumlah_nilai_cplus')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jumlah_nilai_cplus
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jumlah_nilai_d')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jumlah_nilai_d
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jumlah_nilai_e')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jumlah_nilai_e
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jumlah_nilai_masuk')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jumlah_nilai_masuk
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jumlah_nilai_null')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jumlah_nilai_null
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jumlah_nilai_peserta')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jumlah_nilai_peserta
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jumlah_peserta_mk')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jumlah_peserta_mk
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_jumlah_spp_mhs')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_jumlah_spp_mhs
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_mengulang_mk')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_mengulang_mk
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_sks_kum_sampai_smt')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_sks_kum_sampai_smt
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_sks_sd_smt')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_sks_sd_smt
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_sks_smt')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_sks_smt
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.hitung_tahun_ajaran')
          and type in ('IF', 'FN', 'TF'))
   drop function public.hitung_tahun_ajaran
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.instr')
          and type in ('IF', 'FN', 'TF'))
   drop function public.instr
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.instr')
          and type in ('IF', 'FN', 'TF'))
   drop function public.instr
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.kurikulum_mhs')
          and type in ('IF', 'FN', 'TF'))
   drop function public.kurikulum_mhs
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.smt_krs_to_ganjil_genap')
          and type in ('IF', 'FN', 'TF'))
   drop function public.smt_krs_to_ganjil_genap
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.th_ke_th_ajaran')
          and type in ('IF', 'FN', 'TF'))
   drop function public.th_ke_th_ajaran
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.trg_form_a')
          and type in ('IF', 'FN', 'TF'))
   drop function public.trg_form_a
go

if exists (select 1
          from sysobjects
          where  id = object_id('public.update_status_mk_krs')
          and type in ('IF', 'FN', 'TF'))
   drop function public.update_status_mk_krs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ve_transportlb')
            and   type = 'V')
   drop view akademik.ve_transportlb
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ve_praktikum')
            and   type = 'V')
   drop view akademik.ve_praktikum
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ve_pblslddm')
            and   type = 'V')
   drop view akademik.ve_pblslddm
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ve_mengajarluar')
            and   type = 'V')
   drop view akademik.ve_mengajarluar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ve_mengajar')
            and   type = 'V')
   drop view akademik.ve_mengajar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ve_dosenmengajar')
            and   type = 'V')
   drop view akademik.ve_dosenmengajar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.v_timdosen')
            and   type = 'V')
   drop view akademik.v_timdosen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.v_sksperwalian')
            and   type = 'V')
   drop view akademik.v_sksperwalian
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.v_pesertakelas')
            and   type = 'V')
   drop view akademik.v_pesertakelas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.v_pengajar')
            and   type = 'V')
   drop view akademik.v_pengajar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.v_mhs_penerimatagihan')
            and   type = 'V')
   drop view akademik.v_mhs_penerimatagihan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.v_listkelas')
            and   type = 'V')
   drop view akademik.v_listkelas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.v_laprasio_dosen_mhs')
            and   type = 'V')
   drop view akademik.v_laprasio_dosen_mhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.v_dosenpembimbing')
            and   type = 'V')
   drop view akademik.v_dosenpembimbing
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.v_absensidosen')
            and   type = 'V')
   drop view akademik.v_absensidosen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.transkrip')
            and   type = 'V')
   drop view public.transkrip
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.r_absenmhs')
            and   type = 'V')
   drop view akademik.r_absenmhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.admin_info')
            and   type = 'U')
   drop table public.admin_info
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.agama')
            and   type = 'U')
   drop table public.agama
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_absensidosen')
            and   type = 'U')
   drop table akademik.ak_absensidosen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_absensidosen')
            and   type = 'U')
   drop table siakadu.ak_absensidosen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_absensimhs')
            and   type = 'U')
   drop table akademik.ak_absensimhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_absensimhs')
            and   type = 'U')
   drop table siakadu.ak_absensimhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_acara')
            and   type = 'U')
   drop table akademik.ak_acara
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_ajubimbingan')
            and   type = 'U')
   drop table akademik.ak_ajubimbingan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_ajubukanilai')
            and   type = 'U')
   drop table akademik.ak_ajubukanilai
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_ajucekskripsi')
            and   type = 'U')
   drop table akademik.ak_ajucekskripsi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_ajudospem')
            and   type = 'U')
   drop table akademik.ak_ajudospem
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_ajudosuji')
            and   type = 'U')
   drop table akademik.ak_ajudosuji
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_ajunilaiskripsi')
            and   type = 'U')
   drop table akademik.ak_ajunilaiskripsi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_ajunilaiujianta')
            and   type = 'U')
   drop table akademik.ak_ajunilaiujianta
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_ajuujianta')
            and   type = 'U')
   drop table akademik.ak_ajuujianta
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_angket')
            and   type = 'U')
   drop table akademik.ak_angket
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_angketisian')
            and   type = 'U')
   drop table akademik.ak_angketisian
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_angketjawaban')
            and   type = 'U')
   drop table akademik.ak_angketjawaban
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_angketlayanan')
            and   type = 'U')
   drop table akademik.ak_angketlayanan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_angketlayananmhs')
            and   type = 'U')
   drop table akademik.ak_angketlayananmhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_angketpertanyaan')
            and   type = 'U')
   drop table akademik.ak_angketpertanyaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_aturanekivalensi')
            and   type = 'U')
   drop table akademik.ak_aturanekivalensi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_batassks')
            and   type = 'U')
   drop table akademik.ak_batassks
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_berhentistudi')
            and   type = 'U')
   drop table akademik.ak_berhentistudi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_berita')
            and   type = 'U')
   drop table akademik.ak_berita
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_beritarole')
            and   type = 'U')
   drop table akademik.ak_beritarole
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_bidangmk')
            and   type = 'U')
   drop table akademik.ak_bidangmk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_bidangstudi')
            and   type = 'U')
   drop table akademik.ak_bidangstudi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_bimbingan')
            and   type = 'U')
   drop table akademik.ak_bimbingan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_cekskripsi')
            and   type = 'U')
   drop table akademik.ak_cekskripsi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_cekyudisium')
            and   type = 'U')
   drop table akademik.ak_cekyudisium
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_commentfile')
            and   type = 'U')
   drop table akademik.ak_commentfile
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_commentfile')
            and   type = 'U')
   drop table siakadu.ak_commentfile
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_deptperusahaan')
            and   type = 'U')
   drop table akademik.ak_deptperusahaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_dospem')
            and   type = 'U')
   drop table akademik.ak_dospem
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_dosuji')
            and   type = 'U')
   drop table akademik.ak_dosuji
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.ak_ekivaturan')
            and   type = 'U')
   drop table public.ak_ekivaturan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_ekivaturan')
            and   type = 'U')
   drop table akademik.ak_ekivaturan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_ekivmhs')
            and   type = 'U')
   drop table akademik.ak_ekivmhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_evaluasi')
            and   type = 'U')
   drop table akademik.ak_evaluasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_forum')
            and   type = 'U')
   drop table akademik.ak_forum
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_forum')
            and   type = 'U')
   drop table siakadu.ak_forum
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_forumcomment')
            and   type = 'U')
   drop table akademik.ak_forumcomment
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_forumcomment')
            and   type = 'U')
   drop table siakadu.ak_forumcomment
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_forumfile')
            and   type = 'U')
   drop table akademik.ak_forumfile
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_forumfile')
            and   type = 'U')
   drop table siakadu.ak_forumfile
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_forumkomentar')
            and   type = 'U')
   drop table akademik.ak_forumkomentar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_forumkomentar')
            and   type = 'U')
   drop table siakadu.ak_forumkomentar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_forumlike')
            and   type = 'U')
   drop table akademik.ak_forumlike
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_forumlike')
            and   type = 'U')
   drop table siakadu.ak_forumlike
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_forumseen')
            and   type = 'U')
   drop table akademik.ak_forumseen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_forumseen')
            and   type = 'U')
   drop table siakadu.ak_forumseen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_historyperpindahan')
            and   type = 'U')
   drop table akademik.ak_historyperpindahan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_jadwalujian')
            and   type = 'U')
   drop table akademik.ak_jadwalujian
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_jawabanangketlayanan')
            and   type = 'U')
   drop table akademik.ak_jawabanangketlayanan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_jawabsoal')
            and   type = 'U')
   drop table akademik.ak_jawabsoal
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_kalender')
            and   type = 'U')
   drop table akademik.ak_kalender
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_kalender')
            and   type = 'U')
   drop table siakadu.ak_kalender
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_kebutuhankhususkel')
            and   type = 'U')
   drop table akademik.ak_kebutuhankhususkel
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_kebutuhankhususmhs')
            and   type = 'U')
   drop table akademik.ak_kebutuhankhususmhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_kegiatankkn')
            and   type = 'U')
   drop table akademik.ak_kegiatankkn
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_kelas')
            and   type = 'U')
   drop table akademik.ak_kelas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_kelas')
            and   type = 'U')
   drop table siakadu.ak_kelas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('temp.ak_kelas')
            and   type = 'U')
   drop table temp.ak_kelas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.ak_kelasupdate')
            and   type = 'U')
   drop table public.ak_kelasupdate
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_kelompokwisuda')
            and   type = 'U')
   drop table akademik.ak_kelompokwisuda
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_keluargamhs')
            and   type = 'U')
   drop table akademik.ak_keluargamhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_kerjasamaln')
            and   type = 'U')
   drop table akademik.ak_kerjasamaln
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_kesanmhs')
            and   type = 'U')
   drop table akademik.ak_kesanmhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_kkn')
            and   type = 'U')
   drop table akademik.ak_kkn
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_kkndet')
            and   type = 'U')
   drop table akademik.ak_kkndet
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_konsulpenasehat')
            and   type = 'U')
   drop table akademik.ak_konsulpenasehat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_konsulpenasehatdet')
            and   type = 'U')
   drop table akademik.ak_konsulpenasehatdet
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_konsultasi')
            and   type = 'U')
   drop table akademik.ak_konsultasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_konsultasidet')
            and   type = 'U')
   drop table akademik.ak_konsultasidet
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_krs')
            and   type = 'U')
   drop table akademik.ak_krs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_krs')
            and   type = 'U')
   drop table siakadu.ak_krs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('temp.ak_krs')
            and   type = 'U')
   drop table temp.ak_krs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_kurikulum')
            and   type = 'U')
   drop table akademik.ak_kurikulum
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_kurikulum')
            and   type = 'U')
   drop table siakadu.ak_kurikulum
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_kurikulumbs')
            and   type = 'U')
   drop table akademik.ak_kurikulumbs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_kurikulumbs')
            and   type = 'U')
   drop table siakadu.ak_kurikulumbs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_labeluniv')
            and   type = 'U')
   drop table akademik.ak_labeluniv
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_laporan')
            and   type = 'U')
   drop table akademik.ak_laporan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_laporanfilter')
            and   type = 'U')
   drop table akademik.ak_laporanfilter
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_mahasiswa')
            and   type = 'U')
   drop table akademik.ak_mahasiswa
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_mahasiswa')
            and   type = 'U')
   drop table siakadu.ak_mahasiswa
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.ak_matakuliah')
            and   type = 'U')
   drop table public.ak_matakuliah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_matakuliah')
            and   type = 'U')
   drop table akademik.ak_matakuliah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_matakuliah')
            and   type = 'U')
   drop table siakadu.ak_matakuliah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_mengajar')
            and   type = 'U')
   drop table akademik.ak_mengajar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_mengajar')
            and   type = 'U')
   drop table siakadu.ak_mengajar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_mengajarmodul')
            and   type = 'U')
   drop table akademik.ak_mengajarmodul
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_modulkelas')
            and   type = 'U')
   drop table akademik.ak_modulkelas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_modulmkblok')
            and   type = 'U')
   drop table akademik.ak_modulmkblok
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.ak_nilai')
            and   type = 'U')
   drop table public.ak_nilai
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.ak_nilaibelummasuk')
            and   type = 'U')
   drop table public.ak_nilaibelummasuk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_nilaikkn')
            and   type = 'U')
   drop table akademik.ak_nilaikkn
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.ak_nilaikosong')
            and   type = 'U')
   drop table public.ak_nilaikosong
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_nilaimaksyudisium')
            and   type = 'U')
   drop table akademik.ak_nilaimaksyudisium
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_nilaimhsblok')
            and   type = 'U')
   drop table akademik.ak_nilaimhsblok
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_nilaiskripsi')
            and   type = 'U')
   drop table akademik.ak_nilaiskripsi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_nilaitransfer')
            and   type = 'U')
   drop table akademik.ak_nilaitransfer
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_nilaiujianta')
            and   type = 'U')
   drop table akademik.ak_nilaiujianta
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_panitera')
            and   type = 'U')
   drop table akademik.ak_panitera
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_paniteraabsenmhs')
            and   type = 'U')
   drop table akademik.ak_paniteraabsenmhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_paniterajadwal')
            and   type = 'U')
   drop table akademik.ak_paniterajadwal
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_paniterajadwalmhs')
            and   type = 'U')
   drop table akademik.ak_paniterajadwalmhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_paniteramhs')
            and   type = 'U')
   drop table akademik.ak_paniteramhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_paniteranilaiujian')
            and   type = 'U')
   drop table akademik.ak_paniteranilaiujian
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_paniteraujian')
            and   type = 'U')
   drop table akademik.ak_paniteraujian
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_pegawai')
            and   type = 'U')
   drop table akademik.ak_pegawai
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_pegawai')
            and   type = 'U')
   drop table siakadu.ak_pegawai
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_pegawailuar')
            and   type = 'U')
   drop table akademik.ak_pegawailuar
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_pendidikanasal')
            and   type = 'U')
   drop table akademik.ak_pendidikanasal
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_pengajuanskripsi')
            and   type = 'U')
   drop table akademik.ak_pengajuanskripsi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.ak_perbandingan')
            and   type = 'U')
   drop table public.ak_perbandingan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.ak_perbandingannilai')
            and   type = 'U')
   drop table public.ak_perbandingannilai
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_periodewisuda')
            and   type = 'U')
   drop table akademik.ak_periodewisuda
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_perkuliahan')
            and   type = 'U')
   drop table akademik.ak_perkuliahan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_perkuliahan')
            and   type = 'U')
   drop table siakadu.ak_perkuliahan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_perwalian')
            and   type = 'U')
   drop table akademik.ak_perwalian
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_perwalian')
            and   type = 'U')
   drop table siakadu.ak_perwalian
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_pesertaujian')
            and   type = 'U')
   drop table akademik.ak_pesertaujian
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_praktikummk')
            and   type = 'U')
   drop table akademik.ak_praktikummk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.ak_prasyarat')
            and   type = 'U')
   drop table public.ak_prasyarat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_prasyarat')
            and   type = 'U')
   drop table akademik.ak_prasyarat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_prasyarat')
            and   type = 'U')
   drop table siakadu.ak_prasyarat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_predikat')
            and   type = 'U')
   drop table akademik.ak_predikat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_predikat')
            and   type = 'U')
   drop table siakadu.ak_predikat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_predikatdosen')
            and   type = 'U')
   drop table akademik.ak_predikatdosen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_prodikelas')
            and   type = 'U')
   drop table akademik.ak_prodikelas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_prodikelas')
            and   type = 'U')
   drop table siakadu.ak_prodikelas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_prodiwisuda')
            and   type = 'U')
   drop table akademik.ak_prodiwisuda
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_proporsinilai')
            and   type = 'U')
   drop table akademik.ak_proporsinilai
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_proporsinilai')
            and   type = 'U')
   drop table siakadu.ak_proporsinilai
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_proporsinilaikelas')
            and   type = 'U')
   drop table akademik.ak_proporsinilaikelas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_proporsinilaikelas')
            and   type = 'U')
   drop table siakadu.ak_proporsinilaikelas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_proporsinilaikelasblok')
            and   type = 'U')
   drop table akademik.ak_proporsinilaikelasblok
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_proporsinilaimhs')
            and   type = 'U')
   drop table akademik.ak_proporsinilaimhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_proporsinilaimhs')
            and   type = 'U')
   drop table siakadu.ak_proporsinilaimhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_proporsinilaimkblok')
            and   type = 'U')
   drop table akademik.ak_proporsinilaimkblok
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_rapat')
            and   type = 'U')
   drop table akademik.ak_rapat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_rapatpeserta')
            and   type = 'U')
   drop table akademik.ak_rapatpeserta
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_refjeniskkn')
            and   type = 'U')
   drop table akademik.ak_refjeniskkn
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_refnilai')
            and   type = 'U')
   drop table akademik.ak_refnilai
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_refnilaipnt')
            and   type = 'U')
   drop table akademik.ak_refnilaipnt
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_refnilaiskripsi')
            and   type = 'U')
   drop table akademik.ak_refnilaiskripsi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_refnilaiujianpnt')
            and   type = 'U')
   drop table akademik.ak_refnilaiujianpnt
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_refujianpnt')
            and   type = 'U')
   drop table akademik.ak_refujianpnt
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_rps')
            and   type = 'U')
   drop table akademik.ak_rps
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_sap')
            and   type = 'U')
   drop table akademik.ak_sap
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_sertifikat')
            and   type = 'U')
   drop table akademik.ak_sertifikat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_settingglobal')
            and   type = 'U')
   drop table akademik.ak_settingglobal
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_settingkrs')
            and   type = 'U')
   drop table akademik.ak_settingkrs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_sistemkelas')
            and   type = 'U')
   drop table akademik.ak_sistemkelas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_skalanilai')
            and   type = 'U')
   drop table akademik.ak_skalanilai
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_skdo')
            and   type = 'U')
   drop table akademik.ak_skdo
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_skors')
            and   type = 'U')
   drop table akademik.ak_skors
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_skripsi')
            and   type = 'U')
   drop table akademik.ak_skripsi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_soal')
            and   type = 'U')
   drop table akademik.ak_soal
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_substansikuliah')
            and   type = 'U')
   drop table akademik.ak_substansikuliah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_syaratskripsi')
            and   type = 'U')
   drop table akademik.ak_syaratskripsi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_tahapskripsi')
            and   type = 'U')
   drop table akademik.ak_tahapskripsi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_timdosen')
            and   type = 'U')
   drop table akademik.ak_timdosen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_timdosen')
            and   type = 'U')
   drop table siakadu.ak_timdosen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_transkrip')
            and   type = 'U')
   drop table akademik.ak_transkrip
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_ujianta')
            and   type = 'U')
   drop table akademik.ak_ujianta
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_wisuda')
            and   type = 'U')
   drop table akademik.ak_wisuda
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.ak_yudisium')
            and   type = 'U')
   drop table akademik.ak_yudisium
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ak_yudisium')
            and   type = 'U')
   drop table siakadu.ak_yudisium
go

if exists (select 1
            from  sysobjects
           where  id = object_id('web_service.akses_ws')
            and   type = 'U')
   drop table web_service.akses_ws
go

if exists (select 1
            from  sysobjects
           where  id = object_id('log.aktivitas')
            and   type = 'U')
   drop table log.aktivitas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('log.aktivitas_data_extralarge')
            and   type = 'U')
   drop table log.aktivitas_data_extralarge
go

if exists (select 1
            from  sysobjects
           where  id = object_id('log.aktivitas_data_large')
            and   type = 'U')
   drop table log.aktivitas_data_large
go

if exists (select 1
            from  sysobjects
           where  id = object_id('log.aktivitas_data_medium')
            and   type = 'U')
   drop table log.aktivitas_data_medium
go

if exists (select 1
            from  sysobjects
           where  id = object_id('log.aktivitas_data_small')
            and   type = 'U')
   drop table log.aktivitas_data_small
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.alasan_perbaikan_nilai')
            and   type = 'U')
   drop table public.alasan_perbaikan_nilai
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.alih_program')
            and   type = 'U')
   drop table public.alih_program
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.auth_group')
            and   type = 'U')
   drop table public.auth_group
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.auth_group_permissions')
            and   type = 'U')
   drop table public.auth_group_permissions
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.auth_permission')
            and   type = 'U')
   drop table public.auth_permission
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.auth_user')
            and   type = 'U')
   drop table public.auth_user
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.auth_user_groups')
            and   type = 'U')
   drop table public.auth_user_groups
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.auth_user_temp')
            and   type = 'U')
   drop table public.auth_user_temp
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.auth_user_user_permissions')
            and   type = 'U')
   drop table public.auth_user_user_permissions
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.beban_studi')
            and   type = 'U')
   drop table public.beban_studi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.biodata_mahasiswa')
            and   type = 'U')
   drop table public.biodata_mahasiswa
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.bobot_nilai')
            and   type = 'U')
   drop table public.bobot_nilai
go

if exists (select 1
            from  sysobjects
           where  id = object_id('master.broadcast')
            and   type = 'U')
   drop table master.broadcast
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.cuti')
            and   type = 'U')
   drop table public.cuti
go

if exists (select 1
            from  sysobjects
           where  id = object_id('web_service.daftar_error')
            and   type = 'U')
   drop table web_service.daftar_error
go

if exists (select 1
            from  sysobjects
           where  id = object_id('web_service.daftar_token')
            and   type = 'U')
   drop table web_service.daftar_token
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.data_do')
            and   type = 'U')
   drop table public.data_do
go

if exists (select 1
            from  sysobjects
           where  id = object_id('mobile.devices')
            and   type = 'U')
   drop table mobile.devices
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.disallow_sipuda')
            and   type = 'U')
   drop table public.disallow_sipuda
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.diskripsi_jabatan')
            and   type = 'U')
   drop table public.diskripsi_jabatan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.django_content_type')
            and   type = 'U')
   drop table public.django_content_type
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.django_site')
            and   type = 'U')
   drop table public.django_site
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.dosen')
            and   type = 'U')
   drop table public.dosen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('log.errorimport')
            and   type = 'U')
   drop table log.errorimport
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.fakultas')
            and   type = 'U')
   drop table public.fakultas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.fasilitas')
            and   type = 'U')
   drop table public.fasilitas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.fasilitas_ruangan')
            and   type = 'U')
   drop table public.fasilitas_ruangan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.form_a')
            and   type = 'U')
   drop table public.form_a
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.ganti_nilai')
            and   type = 'U')
   drop table public.ganti_nilai
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.gl_aksesdokumen')
            and   type = 'U')
   drop table gate.gl_aksesdokumen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.gl_dokumen')
            and   type = 'U')
   drop table gate.gl_dokumen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.hari')
            and   type = 'U')
   drop table public.hari
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.hi_akreditasi')
            and   type = 'U')
   drop table ref.hi_akreditasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.hi_pejabat')
            and   type = 'U')
   drop table ref.hi_pejabat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.hi_unit')
            and   type = 'U')
   drop table ref.hi_unit
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.jabatan')
            and   type = 'U')
   drop table public.jabatan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.jabatan_ttd_transkrip')
            and   type = 'U')
   drop table public.jabatan_ttd_transkrip
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.jadwal_mk')
            and   type = 'U')
   drop table public.jadwal_mk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.jadwal_mk_audit')
            and   type = 'U')
   drop table public.jadwal_mk_audit
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.jalur_diterima')
            and   type = 'U')
   drop table public.jalur_diterima
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.jatah_sks')
            and   type = 'U')
   drop table public.jatah_sks
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.jenis_kelamin')
            and   type = 'U')
   drop table public.jenis_kelamin
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.jumlah_session')
            and   type = 'U')
   drop table public.jumlah_session
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.jur_smta')
            and   type = 'U')
   drop table public.jur_smta
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.jurusan')
            and   type = 'U')
   drop table public.jurusan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.kabupaten')
            and   type = 'U')
   drop table public.kabupaten
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.kabupaten_khusus')
            and   type = 'U')
   drop table public.kabupaten_khusus
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.kalender_akademik')
            and   type = 'U')
   drop table public.kalender_akademik
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.kegiatan')
            and   type = 'U')
   drop table public.kegiatan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.kewarganegaraan')
            and   type = 'U')
   drop table public.kewarganegaraan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.krs')
            and   type = 'U')
   drop table public.krs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.krs_mahasiswa')
            and   type = 'U')
   drop table public.krs_mahasiswa
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.kurikulum')
            and   type = 'U')
   drop table public.kurikulum
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.kurikulum_angkatan')
            and   type = 'U')
   drop table public.kurikulum_angkatan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('web_service.list_ws')
            and   type = 'U')
   drop table web_service.list_ws
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.log_ganti_nilai_wd1')
            and   type = 'U')
   drop table public.log_ganti_nilai_wd1
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.log_history')
            and   type = 'U')
   drop table gate.log_history
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.log_jadwal')
            and   type = 'U')
   drop table public.log_jadwal
go

if exists (select 1
            from  sysobjects
           where  id = object_id('log.log_nilai')
            and   type = 'U')
   drop table log.log_nilai
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.log_notifikasi')
            and   type = 'U')
   drop table akademik.log_notifikasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.log_notifikasidetail')
            and   type = 'U')
   drop table akademik.log_notifikasidetail
go

if exists (select 1
            from  sysobjects
           where  id = object_id('web_service.log_request')
            and   type = 'U')
   drop table web_service.log_request
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.log_setting')
            and   type = 'U')
   drop table public.log_setting
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.log_softdelete')
            and   type = 'U')
   drop table akademik.log_softdelete
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.log_token')
            and   type = 'U')
   drop table gate.log_token
go

if exists (select 1
            from  sysobjects
           where  id = object_id('log.login_histories')
            and   type = 'U')
   drop table log.login_histories
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.lulusan')
            and   type = 'U')
   drop table public.lulusan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_agama')
            and   type = 'U')
   drop table ref.lv_agama
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_bidangilmu')
            and   type = 'U')
   drop table ref.lv_bidangilmu
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_eventakademik')
            and   type = 'U')
   drop table ref.lv_eventakademik
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_frektagihan')
            and   type = 'U')
   drop table ref.lv_frektagihan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_gelombang')
            and   type = 'U')
   drop table ref.lv_gelombang
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_grade')
            and   type = 'U')
   drop table ref.lv_grade
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_hobbi')
            and   type = 'U')
   drop table ref.lv_hobbi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_infopendaftaran')
            and   type = 'U')
   drop table ref.lv_infopendaftaran
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_jalurpendaftaran')
            and   type = 'U')
   drop table ref.lv_jalurpendaftaran
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_jenisdo')
            and   type = 'U')
   drop table ref.lv_jenisdo
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_jenisforum')
            and   type = 'U')
   drop table ref.lv_jenisforum
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_jenisinstitusi')
            and   type = 'U')
   drop table ref.lv_jenisinstitusi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_jenismk')
            and   type = 'U')
   drop table ref.lv_jenismk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('akademik.lv_jenismodulmkblok')
            and   type = 'U')
   drop table akademik.lv_jenismodulmkblok
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_jenissekolah')
            and   type = 'U')
   drop table ref.lv_jenissekolah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_jenissertifikat')
            and   type = 'U')
   drop table ref.lv_jenissertifikat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_jenista')
            and   type = 'U')
   drop table ref.lv_jenista
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_jenistagihan')
            and   type = 'U')
   drop table ref.lv_jenistagihan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_jenistinggal')
            and   type = 'U')
   drop table ref.lv_jenistinggal
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_jenjangpendidikan')
            and   type = 'U')
   drop table ref.lv_jenjangpendidikan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_kategoriukt')
            and   type = 'U')
   drop table ref.lv_kategoriukt
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_kebutuhankhusus')
            and   type = 'U')
   drop table ref.lv_kebutuhankhusus
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_kegiatan')
            and   type = 'U')
   drop table ref.lv_kegiatan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_kelasperkuliahan')
            and   type = 'U')
   drop table ref.lv_kelasperkuliahan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.lv_kelasperkuliahan')
            and   type = 'U')
   drop table siakadu.lv_kelasperkuliahan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_kelmatkul')
            and   type = 'U')
   drop table ref.lv_kelmatkul
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_kelompokperkuliahan')
            and   type = 'U')
   drop table ref.lv_kelompokperkuliahan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_kota')
            and   type = 'U')
   drop table ref.lv_kota
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_lebeltabel')
            and   type = 'U')
   drop table ref.lv_lebeltabel
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_minat')
            and   type = 'U')
   drop table ref.lv_minat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_pekerjaan')
            and   type = 'U')
   drop table ref.lv_pekerjaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_penghasilan')
            and   type = 'U')
   drop table ref.lv_penghasilan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_periodewsd')
            and   type = 'U')
   drop table ref.lv_periodewsd
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_praktikum')
            and   type = 'U')
   drop table ref.lv_praktikum
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_sistemkuliah')
            and   type = 'U')
   drop table ref.lv_sistemkuliah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_slotwaktu')
            and   type = 'U')
   drop table ref.lv_slotwaktu
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.lv_slotwaktu')
            and   type = 'U')
   drop table siakadu.lv_slotwaktu
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_statusaktif')
            and   type = 'U')
   drop table ref.lv_statusaktif
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_statusmahasiswa')
            and   type = 'U')
   drop table ref.lv_statusmahasiswa
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_suku')
            and   type = 'U')
   drop table ref.lv_suku
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_sumberinformasi')
            and   type = 'U')
   drop table ref.lv_sumberinformasi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_syaratdaftarulang')
            and   type = 'U')
   drop table ref.lv_syaratdaftarulang
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_syaratwsd')
            and   type = 'U')
   drop table ref.lv_syaratwsd
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_tahappendaftaran')
            and   type = 'U')
   drop table ref.lv_tahappendaftaran
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_transport')
            and   type = 'U')
   drop table ref.lv_transport
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.lv_ukm')
            and   type = 'U')
   drop table ref.lv_ukm
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.mahasiswa')
            and   type = 'U')
   drop table public.mahasiswa
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.mata_kuliah')
            and   type = 'U')
   drop table public.mata_kuliah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.mata_kuliah_temp')
            and   type = 'U')
   drop table public.mata_kuliah_temp
go

if exists (select 1
            from  sysobjects
           where  id = object_id('log.migration')
            and   type = 'U')
   drop table log.migration
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.mk_mahasiswa')
            and   type = 'U')
   drop table public.mk_mahasiswa
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.mk_mahasiswa_audit')
            and   type = 'U')
   drop table public.mk_mahasiswa_audit
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.mk_mahasiswa_test')
            and   type = 'U')
   drop table public.mk_mahasiswa_test
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.mk_mhs_temp')
            and   type = 'U')
   drop table public.mk_mhs_temp
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.mk_nilai_terlambat')
            and   type = 'U')
   drop table public.mk_nilai_terlambat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.mk_persemester')
            and   type = 'U')
   drop table public.mk_persemester
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_cpperusahaan')
            and   type = 'U')
   drop table ref.ms_cpperusahaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_golpangkat')
            and   type = 'U')
   drop table ref.ms_golpangkat
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_jabfung')
            and   type = 'U')
   drop table ref.ms_jabfung
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_jabstruktural')
            and   type = 'U')
   drop table ref.ms_jabstruktural
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_jenisjurnal')
            and   type = 'U')
   drop table ref.ms_jenisjurnal
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_jenispeg')
            and   type = 'U')
   drop table ref.ms_jenispeg
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_jenispertemuan')
            and   type = 'U')
   drop table ref.ms_jenispertemuan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_jenissoal')
            and   type = 'U')
   drop table ref.ms_jenissoal
go

if exists (select 1
            from  sysobjects
           where  id = object_id('master.ms_laporan')
            and   type = 'U')
   drop table master.ms_laporan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_negara')
            and   type = 'U')
   drop table ref.ms_negara
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_periode')
            and   type = 'U')
   drop table ref.ms_periode
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ms_periode')
            and   type = 'U')
   drop table siakadu.ms_periode
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_perusahaan')
            and   type = 'U')
   drop table ref.ms_perusahaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_poinangket')
            and   type = 'U')
   drop table ref.ms_poinangket
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_ruang')
            and   type = 'U')
   drop table ref.ms_ruang
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ms_ruang')
            and   type = 'U')
   drop table siakadu.ms_ruang
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_satuanpendidikan')
            and   type = 'U')
   drop table ref.ms_satuanpendidikan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_sekolah')
            and   type = 'U')
   drop table ref.ms_sekolah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_statushadir')
            and   type = 'U')
   drop table ref.ms_statushadir
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_tahunajaran')
            and   type = 'U')
   drop table ref.ms_tahunajaran
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ms_tahunajaran')
            and   type = 'U')
   drop table siakadu.ms_tahunajaran
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_tahunkurikulum')
            and   type = 'U')
   drop table ref.ms_tahunkurikulum
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ms_tahunkurikulum')
            and   type = 'U')
   drop table siakadu.ms_tahunkurikulum
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_unit')
            and   type = 'U')
   drop table ref.ms_unit
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.ms_unit')
            and   type = 'U')
   drop table siakadu.ms_unit
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_universitas')
            and   type = 'U')
   drop table ref.ms_universitas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.ms_universitas_prodi')
            and   type = 'U')
   drop table ref.ms_universitas_prodi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('temp.nimipk')
            and   type = 'U')
   drop table temp.nimipk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.norut_semester')
            and   type = 'U')
   drop table public.norut_semester
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.pejabat_ttd_transkrip')
            and   type = 'U')
   drop table public.pejabat_ttd_transkrip
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.pekerjaan')
            and   type = 'U')
   drop table public.pekerjaan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.pembatalan_do')
            and   type = 'U')
   drop table public.pembatalan_do
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.pembayaran')
            and   type = 'U')
   drop table public.pembayaran
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.pembayaran_h2h')
            and   type = 'U')
   drop table public.pembayaran_h2h
go

if exists (select 1
            from  sysobjects
           where  id = object_id('web_service.pembayaran_h2h')
            and   type = 'U')
   drop table web_service.pembayaran_h2h
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.pendidikan')
            and   type = 'U')
   drop table public.pendidikan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('master.penerimabroadcast')
            and   type = 'U')
   drop table master.penerimabroadcast
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.penghasilan')
            and   type = 'U')
   drop table public.penghasilan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.pengumuman')
            and   type = 'U')
   drop table public.pengumuman
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.periode_lulusan')
            and   type = 'U')
   drop table public.periode_lulusan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.pesan')
            and   type = 'U')
   drop table public.pesan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.prodi_non_siakad')
            and   type = 'U')
   drop table public.prodi_non_siakad
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.program_studi')
            and   type = 'U')
   drop table public.program_studi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.propinsi')
            and   type = 'U')
   drop table public.propinsi
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.propinsi_khusus')
            and   type = 'U')
   drop table public.propinsi_khusus
go

if exists (select 1
            from  sysobjects
           where  id = object_id('temp.rikues_aktif')
            and   type = 'U')
   drop table temp.rikues_aktif
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.role')
            and   type = 'U')
   drop table public.role
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.ruangan_kelas')
            and   type = 'U')
   drop table public.ruangan_kelas
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.sc_aksestambahan')
            and   type = 'U')
   drop table gate.sc_aksestambahan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.sc_aksestambahanrole')
            and   type = 'U')
   drop table gate.sc_aksestambahanrole
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.sc_menu')
            and   type = 'U')
   drop table gate.sc_menu
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.sc_menurole')
            and   type = 'U')
   drop table gate.sc_menurole
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.sc_modul')
            and   type = 'U')
   drop table gate.sc_modul
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.sc_role')
            and   type = 'U')
   drop table gate.sc_role
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.sc_role')
            and   type = 'U')
   drop table siakadu.sc_role
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.sc_target')
            and   type = 'U')
   drop table gate.sc_target
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.sc_targetparent')
            and   type = 'U')
   drop table gate.sc_targetparent
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.sc_targetrole')
            and   type = 'U')
   drop table gate.sc_targetrole
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.sc_unit')
            and   type = 'U')
   drop table gate.sc_unit
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.sc_unit')
            and   type = 'U')
   drop table siakadu.sc_unit
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.sc_user')
            and   type = 'U')
   drop table gate.sc_user
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.sc_user')
            and   type = 'U')
   drop table siakadu.sc_user
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.sc_userrole')
            and   type = 'U')
   drop table gate.sc_userrole
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.sc_userrole')
            and   type = 'U')
   drop table siakadu.sc_userrole
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.sementara')
            and   type = 'U')
   drop table public.sementara
go

if exists (select 1
            from  sysobjects
           where  id = object_id('temp.sementara')
            and   type = 'U')
   drop table temp.sementara
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.sesi_user')
            and   type = 'U')
   drop table public.sesi_user
go

if exists (select 1
            from  sysobjects
           where  id = object_id('mobile.sessions')
            and   type = 'U')
   drop table mobile.sessions
go

if exists (select 1
            from  sysobjects
           where  id = object_id('master.settingreport')
            and   type = 'U')
   drop table master.settingreport
go

if exists (select 1
            from  sysobjects
           where  id = object_id('master.settingsim')
            and   type = 'U')
   drop table master.settingsim
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.sifat_mk')
            and   type = 'U')
   drop table public.sifat_mk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.simba')
            and   type = 'U')
   drop table public.simba
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.status_mhs')
            and   type = 'U')
   drop table public.status_mhs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.status_mk_krs')
            and   type = 'U')
   drop table public.status_mk_krs
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.status_nikah')
            and   type = 'U')
   drop table public.status_nikah
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.strata_program')
            and   type = 'U')
   drop table public.strata_program
go

if exists (select 1
            from  sysobjects
           where  id = object_id('siakadu.t_kurikulum')
            and   type = 'U')
   drop table siakadu.t_kurikulum
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.t_nilaimengulangterakhir')
            and   type = 'U')
   drop table public.t_nilaimengulangterakhir
go

if exists (select 1
            from  sysobjects
           where  id = object_id('log.table_setting')
            and   type = 'U')
   drop table log.table_setting
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ref.table_setting')
            and   type = 'U')
   drop table ref.table_setting
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.test_jadwal_mk')
            and   type = 'U')
   drop table public.test_jadwal_mk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('log.tmpact')
            and   type = 'U')
   drop table log.tmpact
go

if exists (select 1
            from  sysobjects
           where  id = object_id('mobile.todos')
            and   type = 'U')
   drop table mobile.todos
go

if exists (select 1
            from  sysobjects
           where  id = object_id('gate.tr_pembayaran')
            and   type = 'U')
   drop table gate.tr_pembayaran
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.transkrip_temp')
            and   type = 'U')
   drop table public.transkrip_temp
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.transkrip_wisuda')
            and   type = 'U')
   drop table public.transkrip_wisuda
go

if exists (select 1
            from  sysobjects
           where  id = object_id('log.trx_log')
            and   type = 'U')
   drop table log.trx_log
go

if exists (select 1
            from  sysobjects
           where  id = object_id('temp.unit')
            and   type = 'U')
   drop table temp.unit
go

if exists (select 1
            from  sysobjects
           where  id = object_id('web_service.unit_kerja')
            and   type = 'U')
   drop table web_service.unit_kerja
go

if exists (select 1
            from  sysobjects
           where  id = object_id('temp.unitgate')
            and   type = 'U')
   drop table temp.unitgate
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.untuk_baak')
            and   type = 'U')
   drop table public.untuk_baak
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.user_baru')
            and   type = 'U')
   drop table public.user_baru
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.user_profile')
            and   type = 'U')
   drop table public.user_profile
go

if exists (select 1
            from  sysobjects
           where  id = object_id('mobile.user_tokens')
            and   type = 'U')
   drop table mobile.user_tokens
go

if exists (select 1
            from  sysobjects
           where  id = object_id('web_service.user_ws')
            and   type = 'U')
   drop table web_service.user_ws
go

if exists (select 1
            from  sysobjects
           where  id = object_id('public.vthkur')
            and   type = 'U')
   drop table public.vthkur
go

drop sequence public.admin_info_id_seq
go

drop sequence public.agama_id_seq
go

drop sequence akademik.ak_acara_idacara_seq
go

drop sequence akademik.ak_ajubimbingan_idajubimbingan_seq
go

drop sequence akademik.ak_ajubukanilai_idajubukanilai_seq
go

drop sequence akademik.ak_ajunilaiskripsi_idajunilaiskripsi_seq
go

drop sequence akademik.ak_ajunilaiujianta_idajunilaiujianta_seq
go

drop sequence akademik.ak_ajuujianta_idajuujian_seq
go

drop sequence akademik.ak_angket_idangket_seq
go

drop sequence akademik.ak_angketlayanan_id_seq
go

drop sequence akademik.ak_angketlayananmhs_id_seq
go

drop sequence akademik.ak_berhentistudi_idberhentistudi_seq
go

drop sequence akademik.ak_berita_idberita_seq
go

drop sequence akademik.ak_beritarole_idberita_seq
go

drop sequence akademik.ak_bimbingan_idbimbingan_seq
go

drop sequence akademik.ak_commentfile_idcommentfile_seq
go

drop sequence siakadu.ak_commentfile_idcommentfile_seq
go

drop sequence akademik.ak_deptperusahaan_iddeptperusahaan_seq
go

drop sequence akademik.ak_ekivaturan_idekivaturan_seq
go

drop sequence akademik.ak_forum_idforum_seq
go

drop sequence siakadu.ak_forum_idforum_seq
go

drop sequence akademik.ak_forumcomment_idforumcomment_seq
go

drop sequence siakadu.ak_forumcomment_idforumcomment_seq
go

drop sequence akademik.ak_forumfile_idforumfile_seq
go

drop sequence siakadu.ak_forumfile_idforumfile_seq
go

drop sequence akademik.ak_forumkomentar_idforumkomentar_seq
go

drop sequence siakadu.ak_forumkomentar_idforumkomentar_seq
go

drop sequence akademik.ak_historyperpindahan_idpindah_seq
go

drop sequence akademik.ak_jadwalujian_idjadwalujian_seq
go

drop sequence akademik.ak_jawabanangketlayanan_id_seq
go

drop sequence akademik.ak_kalender_idkalender_seq
go

drop sequence siakadu.ak_kalender_idkalender_seq
go

drop sequence akademik.ak_kegiatankkn_idkegiatankkn_seq
go

drop sequence akademik.ak_kelas_idkelas_seq
go

drop sequence akademik.ak_kelompokwisuda_idkelompok_seq
go

drop sequence akademik.ak_keluargamhs_idkeluargamhs_seq
go

drop sequence akademik.ak_kerjasamaln_idkerjasamaln_seq
go

drop sequence akademik.ak_kkn_idkkn_seq
go

drop sequence akademik.ak_konsulpenasehat_idkonsultasi_seq
go

drop sequence akademik.ak_konsulpenasehatdet_idkonsultasidet_seq
go

drop sequence akademik.ak_konsultasi_idkonsultasi_seq
go

drop sequence akademik.ak_konsultasidet_idkonsultasidet_seq
go

drop sequence akademik.ak_laporan_idlaporan_seq
go

drop sequence akademik.ak_modulkelas_idmodul_seq
go

drop sequence akademik.ak_modulmkblok_idmodul_seq
go

drop sequence akademik.ak_nilaikkn_idnilaikkn_seq
go

drop sequence akademik.ak_nilaimaksyudisium_idnilaimaksyudisium_seq
go

drop sequence akademik.ak_nilaimhsblok_idnilaimhsblok_seq
go

drop sequence akademik.ak_nilaiskripsi_idnilaiskripsi_seq
go

drop sequence akademik.ak_nilaitransfer_idkonversi_seq
go

drop sequence akademik.ak_nilaiujianta_idnilaiujianta_seq
go

drop sequence akademik.ak_panitera_idpanitera_seq
go

drop sequence akademik.ak_paniterajadwal_idpaniterajadwal_seq
go

drop sequence akademik.ak_paniteraujian_idpaniteraujian_seq
go

drop sequence akademik.ak_pegawai_idpegawai_seq
go

drop sequence akademik.ak_pegawai_idpegawai_seq1
go

drop sequence akademik.ak_pendidikanasal_idrwypendidikan_seq
go

drop sequence akademik.ak_pengajuanskripsi_idpengajuanskripsi_seq
go

drop sequence akademik.ak_perkuliahan_idjadwal_seq
go

drop sequence siakadu.ak_perkuliahan_idjadwal_seq
go

drop sequence akademik.ak_proporsinilaikelasblok_idproporsinilaikelasblok_seq
go

drop sequence akademik.ak_proporsinilaimhs_idproporsinilaimhs_seq
go

drop sequence siakadu.ak_proporsinilaimhs_idproporsinilaimhs_seq
go

drop sequence akademik.ak_proporsinilaimkblok_idproporsinilaimkblok_seq
go

drop sequence akademik.ak_rapat_idrapat_seq
go

drop sequence akademik.ak_rps_idrps_seq
go

drop sequence akademik.ak_sap_idsap_seq
go

drop sequence akademik.ak_sertifikat_idsertifikat_seq
go

drop sequence akademik.ak_settingglobal_idsetting_seq
go

drop sequence akademik.ak_skalanilai_idskalanilai_seq
go

drop sequence akademik.ak_skdo_idskdo_seq
go

drop sequence akademik.ak_skors_idskors_seq
go

drop sequence akademik.ak_skripsi_idskripsi_seq
go

drop sequence akademik.ak_soal_idsoalujian_seq
go

drop sequence akademik.ak_substansikuliah_idsubstansi_seq
go

drop sequence akademik.ak_syaratskripsi_idsyaratskripsi_seq
go

drop sequence akademik.ak_tahapskripsi_idtahap_seq
go

drop sequence akademik.ak_ujianta_idujian_seq
go

drop sequence akademik.ak_wisuda_idwisuda_seq
go

drop sequence akademik.ak_yudisium_idyudisium_seq
go

drop sequence log.aktivitas_id_seq
go

drop sequence public.alih_program_id_seq
go

drop sequence public.auth_group_id_seq
go

drop sequence public.auth_group_permissions_id_seq
go

drop sequence public.auth_permission_id_seq
go

drop sequence public.auth_user_groups_id_seq
go

drop sequence public.auth_user_id_seq
go

drop sequence public.auth_user_temp_id_seq
go

drop sequence public.auth_user_user_permissions_id_seq
go

drop sequence master.broadcast_idbroadcast_seq
go

drop sequence public.cuti_id_seq
go

drop sequence public.data_do_id_seq
go

drop sequence mobile.devices_id_seq
go

drop sequence public.django_content_type_id_seq
go

drop sequence public.django_site_id_seq
go

drop sequence public.dosen_id_seq
go

drop sequence log.errorimport_iderrorimport_seq
go

drop sequence gate.gl_dokumen_iddokumen_seq
go

drop sequence ref.hi_akreditasi_idhistoriakreditasi_seq
go

drop sequence ref.hi_pejabat_idhistoripejabat_seq
go

drop sequence ref.hi_unit_idperubahan_seq
go

drop sequence public.jabatan_ttd_transkrip_id_jabatan_seq
go

drop sequence public.jadwal_mk_id_seq
go

drop sequence public.jalur_diterima_id_seq
go

drop sequence public.jumlah_session_id_seq
go

drop sequence public.kalender_akademik_id_seq
go

drop sequence public.krs_id_seq
go

drop sequence public.krs_mahasiswa_id_seq
go

drop sequence public.kurikulum_angkatan_id_seq
go

drop sequence public.kurikulum_id_seq
go

drop sequence gate.log_history_idlog_seq
go

drop sequence log.log_nilai_idlognilai_seq
go

drop sequence akademik.log_notifikasi_idnotif_seq
go

drop sequence akademik.log_softdelete_idsoftdelete_seq
go

drop sequence log.login_histories_idlog_seq
go

drop sequence ref.lv_agama_idagama_seq
go

drop sequence ref.lv_gelombang_idgelombang_seq
go

drop sequence ref.lv_grade_idgrade_seq
go

drop sequence ref.lv_hobbi_idhobbi_seq
go

drop sequence ref.lv_infopendaftaran_idinfo_seq
go

drop sequence ref.lv_jalurpendaftaran_idjalurpendaftaran_seq
go

drop sequence ref.lv_jenisdo_idjenisdo_seq
go

drop sequence ref.lv_jenisforum_idjenisforum_seq
go

drop sequence ref.lv_jenisinstitusi_idjenisinstitusi_seq
go

drop sequence ref.lv_jenissekolah_idjenissekolah_seq
go

drop sequence ref.lv_jenissertifikat_idjenissertifikat_seq
go

drop sequence ref.lv_kota_idkota_seq
go

drop sequence ref.lv_minat_idminat_seq
go

drop sequence ref.lv_pekerjaan_idpekerjaan_seq
go

drop sequence ref.lv_penghasilan_idpenghasilan_seq
go

drop sequence ref.lv_sistemkuliah_idsistemkuliah_seq
go

drop sequence ref.lv_slotwaktu_idslot_seq
go

drop sequence siakadu.lv_slotwaktu_idslot_seq
go

drop sequence ref.lv_suku_idsuku_seq
go

drop sequence ref.lv_sumberinformasi_idsumber_seq
go

drop sequence ref.lv_syaratdaftarulang_idsyarat_seq
go

drop sequence ref.lv_syaratwsd_idsyaratwsd_seq
go

drop sequence public.mahasiswa_id_seq
go

drop sequence public.mata_kuliah_id_seq
go

drop sequence public.mata_kuliah_temp_id_seq
go

drop sequence log.migration_idmigration_seq
go

drop sequence public.mk_mahasiswa_id_seq
go

drop sequence public.mk_nilai_terlambat_id_seq
go

drop sequence ref.ms_cpperusahaan_idcpperusahaan_seq
go

drop sequence master.ms_laporan_idlaporan_seq
go

drop sequence ref.ms_perusahaan_idperusahaan_seq
go

drop sequence ref.ms_satuanpendidikan_idsp_seq
go

drop sequence public.nomor_mk_seq
go

drop sequence public.pembatalan_do_id_seq
go

drop sequence public.pembayaran_id_seq
go

drop sequence master.penerimabroadcast_idpenerimabroadcast_seq
go

drop sequence gate.sc_menu_idmenu_seq
go

drop sequence gate.sc_target_idtarget_seq
go

drop sequence gate.sc_user_userid_seq
go

drop sequence siakadu.sc_user_userid_seq
go

drop sequence public.sementara_id_seq
go

drop sequence master.settingreport_idsettingreport_seq
go

drop sequence master.settingsim_idsetting_seq
go

drop sequence public.status_mhs_id_seq
go

drop sequence log.table_setting_table_id_seq
go

drop sequence ref.table_setting_table_id_seq
go

drop sequence mobile.todos_id_seq
go

drop sequence gate.tr_pembayaran_idpembayaran_seq
go

drop sequence public.transkrip_temp_id_seq
go

drop sequence log.trx_log_idtrxlog_seq
go

drop sequence web_service.unit_kerja_kode_unit_seq
go

drop sequence public.user_profile_temp_id_seq
go

drop sequence mobile.user_tokens_id_seq
go

drop schema akademik
go

drop schema gate
go

drop schema log
go

drop schema master
go

drop schema mobile
go

drop schema siakadu
go

drop schema temp
go

drop schema web_service
go

/*==============================================================*/
/* User: beasiswa                                               */
/*==============================================================*/
create schema beasiswa
go

/*==============================================================*/
/* User: keuangan                                               */
/*==============================================================*/
create schema keuangan
go

/*==============================================================*/
/* User: logger                                                 */
/*==============================================================*/
create schema logger
go

/*==============================================================*/
/* User: presensi                                               */
/*==============================================================*/
create schema presensi
go

/*==============================================================*/
/* User: dashboard                                              */
/*==============================================================*/
create schema dashboard
go

/*==============================================================*/
/* User: dok                                                    */
/*==============================================================*/
create schema dok
go

/*==============================================================*/
/* User: kerjasama                                              */
/*==============================================================*/
create schema kerjasama
go

/*==============================================================*/
/* User: man_akses                                              */
/*==============================================================*/
create schema man_akses
go

/*==============================================================*/
/* User: mbkm                                                   */
/*==============================================================*/
create schema mbkm
go

/*==============================================================*/
/* User: pdrd                                                   */
/*==============================================================*/
create schema pdrd
go

/*==============================================================*/
/* User: pmb                                                    */
/*==============================================================*/
create schema pmb
go

/*==============================================================*/
/* User: sarpras                                                */
/*==============================================================*/
create schema sarpras
go

/*==============================================================*/
/* User: tracer                                                 */
/*==============================================================*/
create schema tracer
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
/* Table: kelompok_tabel_aplikasi                               */
/*==============================================================*/
create table kelompok_tabel_aplikasi (
   id_kel_table_app     uniqueidentifier     not null,
   id_table_app         uniqueidentifier     null,
   induk_kel_table_app_id_kel_table_app uniqueidentifier     null,
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   url                  varchar(256)         null,
   method               varchar(50)          null,
   enpoint              varchar(200)         null,
   level                numeric(1)           not null default 0
      constraint ckc_level_kelompok check (level between 0 and 9),
   constraint pk_kelompok_tabel_aplikasi primary key (id_kel_table_app)
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

/*==============================================================*/
/* Table: lembaga_sertifikasi                                   */
/*==============================================================*/
create table ref.lembaga_sertifikasi (
   id_lemb_sert         numeric(2,0)         not null,
   nm_lemb_sert         varchar(100)         null,
   a_ref_pddikti        numeric(1)           not null default 0
      constraint ckc_a_ref_pddikti_lembaga_ check (a_ref_pddikti between 0 and 1 and a_ref_pddikti in (0,1)),
   a_ref_unila          numeric(1)           not null default 0
      constraint ckc_a_ref_unila_lembaga_ check (a_ref_unila between 0 and 1 and a_ref_unila in (0,1)),
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

alter table kelompok_tabel_aplikasi
   add constraint fk_kelompok_detail_ke_table_ap foreign key (id_table_app)
      references man_akses.table_aplikasi (id_table_app)
         on update cascade on delete cascade
go

alter table kelompok_tabel_aplikasi
   add constraint fk_kelompok_induk_kel_kelompok foreign key (induk_kel_table_app_id_kel_table_app)
      references kelompok_tabel_aplikasi (id_kel_table_app)
         on update cascade on delete cascade
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

alter table pdrd.matkul_kurikulum
   add constraint fk_matkul_k_detail_ma_matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
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

