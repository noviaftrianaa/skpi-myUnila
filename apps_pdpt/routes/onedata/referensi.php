<?php

/* start_generate_ref_route */

Route::get('wilayah', 'ReferensiController@wilayah');
Route::get('tse', 'ReferensiController@tse');
Route::get('tingkat_prestasi', 'ReferensiController@tingkat_prestasi');
Route::get('tingkat_penghargaan', 'ReferensiController@tingkat_penghargaan');
Route::get('tingkat_kerjasama', 'ReferensiController@tingkat_kerjasama');
Route::get('tahun_anggaran', 'ReferensiController@tahun_anggaran');
Route::get('tahun_ajaran', 'ReferensiController@tahun_ajaran');
Route::get('sumber_listrik', 'ReferensiController@sumber_listrik');
Route::get('sumber_gaji', 'ReferensiController@sumber_gaji');
Route::get('sumber_dana', 'ReferensiController@sumber_dana');
Route::get('sumber_air', 'ReferensiController@sumber_air');
Route::get('status_milik_sarpras', 'ReferensiController@status_milik_sarpras');
Route::get('status_mahasiswa', 'ReferensiController@status_mahasiswa');
Route::get('status_kerjasama', 'ReferensiController@status_kerjasama');
Route::get('status_kepemilikan', 'ReferensiController@status_kepemilikan');
Route::get('status_kepegawaian', 'ReferensiController@status_kepegawaian');
Route::get('status_keaktifan_pegawai', 'ReferensiController@status_keaktifan_pegawai');
Route::get('status_anak', 'ReferensiController@status_anak');
Route::get('skim_kegiatan', 'ReferensiController@skim_kegiatan');
Route::get('semester', 'ReferensiController@semester');
Route::get('satuan', 'ReferensiController@satuan');
Route::get('peta_katgiat_jnspub', 'ReferensiController@peta_katgiat_jnspub');
Route::get('peta_katgiat_jnsdok', 'ReferensiController@peta_katgiat_jnsdok');
Route::get('peta_katgiat_jabfung', 'ReferensiController@peta_katgiat_jabfung');
Route::get('penghasilan', 'ReferensiController@penghasilan');
Route::get('pembiayaan', 'ReferensiController@pembiayaan');
Route::get('pekerjaan', 'ReferensiController@pekerjaan');
Route::get('pangkat_golongan', 'ReferensiController@pangkat_golongan');
Route::get('nilai_akred', 'ReferensiController@nilai_akred');
Route::get('negara', 'ReferensiController@negara');
Route::get('media_publikasi', 'ReferensiController@media_publikasi');
Route::get('level_wilayah', 'ReferensiController@level_wilayah');
Route::get('lembaga_pengangkat', 'ReferensiController@lembaga_pengangkat');
Route::get('lembaga_akred', 'ReferensiController@lembaga_akred');
Route::get('kriteria_mitra', 'ReferensiController@kriteria_mitra');
Route::get('kelompok_usaha', 'ReferensiController@kelompok_usaha');
Route::get('kelompok_profesi', 'ReferensiController@kelompok_profesi');
Route::get('kelompok_bidang', 'ReferensiController@kelompok_bidang');
Route::get('kebutuhan_khusus', 'ReferensiController@kebutuhan_khusus');
Route::get('keahlian_lab', 'ReferensiController@keahlian_lab');
Route::get('kbli', 'ReferensiController@kbli');
Route::get('kategori_tabel', 'ReferensiController@kategori_tabel');
Route::get('kategori_kegiatan', 'ReferensiController@kategori_kegiatan');
Route::get('kategori_capaian_luaran', 'ReferensiController@kategori_capaian_luaran');
Route::get('jurusan', 'ReferensiController@jurusan');
Route::get('jenjang_pendidikan', 'ReferensiController@jenjang_pendidikan');
Route::get('jenis_tunjangan', 'ReferensiController@jenis_tunjangan');
Route::get('jenis_tinggal', 'ReferensiController@jenis_tinggal');
Route::get('jenis_tes', 'ReferensiController@jenis_tes');
Route::get('jenis_subst', 'ReferensiController@jenis_subst');
Route::get('jenis_sms', 'ReferensiController@jenis_sms');
Route::get('jenis_sert', 'ReferensiController@jenis_sert');
Route::get('jenis_sdm', 'ReferensiController@jenis_sdm');
Route::get('jenis_sarana', 'ReferensiController@jenis_sarana');
Route::get('jenis_publikasi', 'ReferensiController@jenis_publikasi');
Route::get('jenis_prestasi', 'ReferensiController@jenis_prestasi');
Route::get('jenis_prasarana', 'ReferensiController@jenis_prasarana');
Route::get('jenis_penghargaan', 'ReferensiController@jenis_penghargaan');
Route::get('jenis_penelitian', 'ReferensiController@jenis_penelitian');
Route::get('jenis_pendaftaran', 'ReferensiController@jenis_pendaftaran');
Route::get('jenis_media_pub', 'ReferensiController@jenis_media_pub');
Route::get('jenis_lembaga', 'ReferensiController@jenis_lembaga');
Route::get('jenis_keuangan', 'ReferensiController@jenis_keuangan');
Route::get('jenis_kesejahteraan', 'ReferensiController@jenis_kesejahteraan');
Route::get('jenis_kepanitiaan', 'ReferensiController@jenis_kepanitiaan');
Route::get('jenis_keluar', 'ReferensiController@jenis_keluar');
Route::get('jenis_jalur_pekerjaan', 'ReferensiController@jenis_jalur_pekerjaan');
Route::get('jenis_hapus_buku', 'ReferensiController@jenis_hapus_buku');
Route::get('jenis_evaluasi', 'ReferensiController@jenis_evaluasi');
Route::get('jenis_dokumen', 'ReferensiController@jenis_dokumen');
Route::get('jenis_diklat', 'ReferensiController@jenis_diklat');
Route::get('jenis_beasiswa', 'ReferensiController@jenis_beasiswa');
Route::get('jenis_bahan_ajar', 'ReferensiController@jenis_bahan_ajar');
Route::get('jenis_akt_mhs', 'ReferensiController@jenis_akt_mhs');
Route::get('jalur_daftar', 'ReferensiController@jalur_daftar');
Route::get('jabfung', 'ReferensiController@jabfung');
Route::get('jab_tgs', 'ReferensiController@jab_tgs');
Route::get('ikatan_kerja_sdm', 'ReferensiController@ikatan_kerja_sdm');
Route::get('gelar_akademik', 'ReferensiController@gelar_akademik');
Route::get('fungsi_lab', 'ReferensiController@fungsi_lab');
Route::get('bidang_usaha', 'ReferensiController@bidang_usaha');
Route::get('bidang_studi', 'ReferensiController@bidang_studi');
Route::get('bidang_pekerjaan', 'ReferensiController@bidang_pekerjaan');
Route::get('bidang_kerjasama', 'ReferensiController@bidang_kerjasama');
Route::get('bentuk_pendidikan', 'ReferensiController@bentuk_pendidikan');
Route::get('bentuk_kegiatan_kerjasama', 'ReferensiController@bentuk_kegiatan_kerjasama');
Route::get('basis_evaluasi', 'ReferensiController@basis_evaluasi');
Route::get('aktifitas_kerjasama', 'ReferensiController@aktifitas_kerjasama');
Route::get('agama', 'ReferensiController@agama');
Route::get('wilayah', 'ReferensiController@wilayah');
Route::get('tse', 'ReferensiController@tse');
Route::get('tingkat_prestasi', 'ReferensiController@tingkat_prestasi');
Route::get('tingkat_penghargaan', 'ReferensiController@tingkat_penghargaan');
Route::get('tingkat_kerjasama', 'ReferensiController@tingkat_kerjasama');
Route::get('tahun_anggaran', 'ReferensiController@tahun_anggaran');
Route::get('tahun_ajaran', 'ReferensiController@tahun_ajaran');
Route::get('sumber_listrik', 'ReferensiController@sumber_listrik');
Route::get('sumber_gaji', 'ReferensiController@sumber_gaji');
Route::get('sumber_dana', 'ReferensiController@sumber_dana');
Route::get('sumber_air', 'ReferensiController@sumber_air');
Route::get('status_milik_sarpras', 'ReferensiController@status_milik_sarpras');
Route::get('status_mahasiswa', 'ReferensiController@status_mahasiswa');
Route::get('status_kepemilikan', 'ReferensiController@status_kepemilikan');
Route::get('status_kepegawaian', 'ReferensiController@status_kepegawaian');
Route::get('status_keaktifan_pegawai', 'ReferensiController@status_keaktifan_pegawai');
Route::get('status_anak', 'ReferensiController@status_anak');
Route::get('skim_kegiatan', 'ReferensiController@skim_kegiatan');
Route::get('semester', 'ReferensiController@semester');
Route::get('satuan', 'ReferensiController@satuan');
Route::get('peta_katgiat_jnspub', 'ReferensiController@peta_katgiat_jnspub');
Route::get('peta_katgiat_jnsdok', 'ReferensiController@peta_katgiat_jnsdok');
Route::get('peta_katgiat_jabfung', 'ReferensiController@peta_katgiat_jabfung');
Route::get('penghasilan', 'ReferensiController@penghasilan');
Route::get('pembiayaan', 'ReferensiController@pembiayaan');
Route::get('pekerjaan', 'ReferensiController@pekerjaan');
Route::get('pangkat_golongan', 'ReferensiController@pangkat_golongan');
Route::get('nilai_akred', 'ReferensiController@nilai_akred');
Route::get('negara', 'ReferensiController@negara');
Route::get('media_publikasi', 'ReferensiController@media_publikasi');
Route::get('level_wilayah', 'ReferensiController@level_wilayah');
Route::get('lembaga_pengangkat', 'ReferensiController@lembaga_pengangkat');
Route::get('lembaga_akred', 'ReferensiController@lembaga_akred');
Route::get('kelompok_usaha', 'ReferensiController@kelompok_usaha');
Route::get('kelompok_profesi', 'ReferensiController@kelompok_profesi');
Route::get('kelompok_bidang', 'ReferensiController@kelompok_bidang');
Route::get('kebutuhan_khusus', 'ReferensiController@kebutuhan_khusus');
Route::get('keahlian_lab', 'ReferensiController@keahlian_lab');
Route::get('kbli', 'ReferensiController@kbli');
Route::get('kategori_tabel', 'ReferensiController@kategori_tabel');
Route::get('kategori_kegiatan', 'ReferensiController@kategori_kegiatan');
Route::get('kategori_capaian_luaran', 'ReferensiController@kategori_capaian_luaran');
Route::get('jurusan', 'ReferensiController@jurusan');
Route::get('jenjang_pendidikan', 'ReferensiController@jenjang_pendidikan');
Route::get('jenis_tunjangan', 'ReferensiController@jenis_tunjangan');
Route::get('jenis_tinggal', 'ReferensiController@jenis_tinggal');
Route::get('jenis_tes', 'ReferensiController@jenis_tes');
Route::get('jenis_subst', 'ReferensiController@jenis_subst');
Route::get('jenis_sms', 'ReferensiController@jenis_sms');
Route::get('jenis_sert', 'ReferensiController@jenis_sert');
Route::get('jenis_sdm', 'ReferensiController@jenis_sdm');
Route::get('jenis_sarana', 'ReferensiController@jenis_sarana');
Route::get('jenis_publikasi', 'ReferensiController@jenis_publikasi');
Route::get('jenis_prestasi', 'ReferensiController@jenis_prestasi');
Route::get('jenis_prasarana', 'ReferensiController@jenis_prasarana');
Route::get('jenis_penghargaan', 'ReferensiController@jenis_penghargaan');
Route::get('jenis_penelitian', 'ReferensiController@jenis_penelitian');
Route::get('jenis_pendaftaran', 'ReferensiController@jenis_pendaftaran');
Route::get('jenis_media_pub', 'ReferensiController@jenis_media_pub');
Route::get('jenis_lembaga', 'ReferensiController@jenis_lembaga');
Route::get('jenis_keuangan', 'ReferensiController@jenis_keuangan');
Route::get('jenis_kesejahteraan', 'ReferensiController@jenis_kesejahteraan');
Route::get('jenis_kepanitiaan', 'ReferensiController@jenis_kepanitiaan');
Route::get('jenis_keluar', 'ReferensiController@jenis_keluar');
Route::get('jenis_jalur_pekerjaan', 'ReferensiController@jenis_jalur_pekerjaan');
Route::get('jenis_hapus_buku', 'ReferensiController@jenis_hapus_buku');
Route::get('jenis_evaluasi', 'ReferensiController@jenis_evaluasi');
Route::get('jenis_dokumen', 'ReferensiController@jenis_dokumen');
Route::get('jenis_diklat', 'ReferensiController@jenis_diklat');
Route::get('jenis_beasiswa', 'ReferensiController@jenis_beasiswa');
Route::get('jenis_bahan_ajar', 'ReferensiController@jenis_bahan_ajar');
Route::get('jenis_akt_mhs', 'ReferensiController@jenis_akt_mhs');
Route::get('jalur_daftar', 'ReferensiController@jalur_daftar');
Route::get('jabfung', 'ReferensiController@jabfung');
Route::get('jab_tgs', 'ReferensiController@jab_tgs');
Route::get('ikatan_kerja_sdm', 'ReferensiController@ikatan_kerja_sdm');
Route::get('gelar_akademik', 'ReferensiController@gelar_akademik');
Route::get('fungsi_lab', 'ReferensiController@fungsi_lab');
Route::get('bidang_usaha', 'ReferensiController@bidang_usaha');
Route::get('bidang_studi', 'ReferensiController@bidang_studi');
Route::get('bidang_pekerjaan', 'ReferensiController@bidang_pekerjaan');
Route::get('bidang_kerjasama', 'ReferensiController@bidang_kerjasama');
Route::get('bentuk_pendidikan', 'ReferensiController@bentuk_pendidikan');
Route::get('basis_evaluasi', 'ReferensiController@basis_evaluasi');
Route::get('agama', 'ReferensiController@agama');
/* end_generate_ref_route */































































































































































































































































