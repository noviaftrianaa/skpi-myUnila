<?php

use Illuminate\Support\Facades\Route;

Route::group([
    'prefix' => '0.1',
    'as' => 'api.',
    'namespace' => 'App\Http\Controllers\PDUT\Api',
], function () {
    Route::middleware(['openapi_live'])->group(function () {
        Route::prefix('auth')->group(function () {
            Route::post('login', 'LoginController@login');
            Route::post('cek_token', 'LoginController@checkToken');
        });
    });

    Route::middleware(['auth_api', 'applog'])->group(function () {
        Route::prefix('referensi')->group(base_path('routes/onedata/referensi.php'));
        Route::group([
            'namespace' => 'Pdrd',
        ], function () {
            Route::prefix('keuangan')->group(function () {
                Route::get('/kelasukt/daftar', 'KeuanganKelasUktController@daftar');
                Route::post('/kelasukt/tambah', 'KeuanganKelasUktController@tambah');
                Route::put('/kelasukt/ubah', 'KeuanganKelasUktController@ubah');
                Route::delete('/kelasukt/hapus', 'KeuanganKelasUktController@hapus');
                Route::get('/uktmhs/daftar', 'KeuanganUktMhsController@daftar');
                Route::get('/uktmhs/daftar_id', 'KeuanganUktMhsController@daftar_id');
                Route::post('/uktmhs/tambah', 'KeuanganUktMhsController@tambah');
                Route::put('/uktmhs/ubah', 'KeuanganUktMhsController@ubah');
                Route::delete('/uktmhs/hapus', 'KeuanganUktMhsController@hapus');
                Route::get('/gajisdm/daftar', 'KeuanganGajiSdmController@daftar');
                Route::post('/gajisdm/tambah', 'KeuanganGajiSdmController@tambah');
                Route::put('/gajisdm/ubah', 'KeuanganGajiSdmController@ubah');
                Route::delete('/gajisdm/hapus', 'KeuanganGajiSdmController@hapus');
            });

            Route::prefix('nonca')->group(function () {
                Route::get('daftar', 'NonCaController@daftar');
                Route::get('detail', 'NonCaController@detail');
                Route::post('tambah', 'NonCaController@tambah');
                Route::put('ubah', 'NonCaController@ubah');
                Route::delete('hapus', 'NonCaController@hapus');
            });

            Route::prefix('sdm')->group(function () {
                Route::get('daftar', 'SdmController@daftar');
                Route::get('daftar_id', 'SdmController@daftar_id');
                Route::get('detail', 'SdmController@detail');
            });

            Route::prefix('buku_ajar')->group(function () {
                Route::get('daftar', 'BukuAjarController@daftar');
                Route::get('daftar_id', 'BukuAjarController@daftar_id');
                Route::get('detail', 'BukuAjarController@detail');
                Route::post('tambah', 'BukuAjarController@tambah');
                Route::put('ubah', 'BukuAjarController@ubah');
                Route::delete('hapus', 'BukuAjarController@hapus');
            });

            Route::prefix('buku_referensi')->group(function () {
                Route::get('daftar', 'BukuReferensiController@daftar');
                Route::get('daftar_id', 'BukuReferensiController@daftar_id');
                Route::get('detail', 'BukuReferensiController@detail');
                Route::post('tambah', 'BukuReferensiController@tambah');
                Route::put('ubah', 'BukuReferensiController@ubah');
                Route::delete('hapus', 'BukuReferensiController@hapus');
            });

            Route::prefix('diklat')->group(function () {
                Route::get('list', 'DiklatController@getAllListDiklat');
                Route::post('tambah', 'DiklatController@tambah');
                Route::put('ubah', 'DiklatController@ubahDiklat');
                Route::delete('hapus', 'DiklatController@destroy');
                Route::get('detail', 'DiklatController@getDetail');
            });

            Route::prefix('penelitian')->group(function () {
                Route::get('daftar', 'PenelitianController@daftar');
                Route::get('daftar_id', 'PenelitianController@daftar_id');
                Route::get('detail', 'PenelitianController@detail');
                Route::post('tambah', 'PenelitianController@tambah');
                Route::put('ubah', 'PenelitianController@ubah');
                Route::delete('hapus', 'PenelitianController@hapus');
            });

            Route::prefix('pengabdian')->group(function () {
                Route::get('list', 'PengabdianController@getAllListPengabdian');
                Route::get('list_id', 'PengabdianController@getListPengabdianBySdmId');
                Route::get('detail/{id}', 'PengabdianController@getDetailPengabdianByPengabdianId');
                Route::post('tambah', 'PengabdianController@storePengabdian');
                Route::put('ubah', 'PengabdianController@updatePengabdian');
                Route::delete('hapus', 'PengabdianController@deletePengabdian');
            });

            Route::prefix('publikasi')->group(function () {
                Route::get('daftar', 'PublikasiController@daftar');
                Route::get('daftar_id', 'PublikasiController@daftar_id');
                Route::get('detail', 'PublikasiController@detail');
                Route::post('tambah', 'PublikasiController@tambah');
                Route::put('ubah', 'PublikasiController@tambah');
                Route::delete('hapus', 'PublikasiController@tambah');
            });

            Route::prefix('mahasiswa')->group(function () {
                Route::get('list_mahasiswa', 'MahasiswaController@list');
                Route::get('detail', 'MahasiswaController@detail');
                Route::get('list_status', 'MahasiswaController@status');
                Route::get('list_regis', 'MahasiswaController@regis');
                Route::get('smt_keaktifan', 'MahasiswaController@semester_keaktifan');
                Route::get('list_alumni', 'MahasiswaController@alumni');
                Route::get('luar_pt', 'MahasiswaController@luar_pt');
            });

            Route::prefix('mata_kuliah')->group(function () {
                Route::get('list_kurikulum', 'KurikulumController@index');
                Route::post('kurikulum/tambah', 'KurikulumController@store');
                Route::put('kurikulum/ubah', 'KurikulumController@update');
                Route::delete('kurikulum/hapus', 'KurikulumController@destroy');

                Route::get('list_matkul', 'MataKuliahController@index');
                Route::post('matkul/tambah', 'MataKuliahController@store');
                Route::put('matkul/ubah', 'MataKuliahController@update');
                Route::delete('matkul/hapus', 'MataKuliahController@destroy');

                Route::get('list_kelas', 'KelasController@index');
                Route::post('kelas/tambah', 'KelasController@store');
                Route::put('kelas/ubah', 'KelasController@update');
                Route::delete('kelas/hapus', 'KelasController@destroy');

                Route::get('list_peserta', 'PesertaKelasController@index');
                Route::post('peserta/tambah', 'PesertaKelasController@store');
                Route::put('peserta/ubah', 'PesertaKelasController@update');
                Route::delete('peserta/hapus', 'PesertaKelasController@destroy');

                Route::get('list_re_mk', 'ReMkController@index');
                Route::post('re_mk/tambah', 'ReMkController@store');
                Route::put('re_mk/ubah', 'ReMkController@update');
                Route::delete('re_mk/hapus', 'ReMkController@destroy');

                Route::get('list_re_ajar', 'RencanaAjarController@index');
                Route::post('re_ajar/tambah', 'RencanaAjarController@store');
                Route::put('re_ajar/ubah', 'RencanaAjarController@update');
                Route::delete('re_ajar/hapus', 'RencanaAjarController@destroy');

                Route::get('list_dosen_ajar', 'AktAjarDosenController@index');
                Route::post('dosen_ajar/tambah', 'AktAjarDosenController@store');
                Route::put('dosen_ajar/ubah', 'AktAjarDosenController@update');
                Route::delete('dosen_ajar/hapus', 'AktAjarDosenController@destroy');

                Route::get('list_jadwal', 'JadwalKelasController@index');
                Route::post('jadwal/tambah', 'JadwalKelasController@store');
                Route::put('jadwal/ubah', 'JadwalKelasController@update');
                Route::delete('jadwal/hapus', 'JadwalKelasController@destroy');
            });

            Route::prefix('lembaga')->group(function () {
                Route::get('profil_pt/detail', 'LembagaController@detailProfilPt');
                Route::get('akreditasi_pt', 'LembagaController@listAkreditasiPt');
                Route::get('daftar_prodi/detail', 'LembagaController@detailDaftarProdi');
                Route::get('profil_prodi/daftar', 'LembagaController@listProfilProdi');
                Route::get('profil_prodi/list_id', 'LembagaController@listProfilProdiById');
                Route::put('profil_prodi/ubah', 'LembagaController@ubah');
                Route::get('daftar_lembaga', 'LembagaController@listLembaga');
                Route::get('daftar_satuan_pendidikan', 'LembagaController@listSp');
            });
        });

        Route::group([
            'namespace' => 'Tracer',
            'prefix' => 'tracer_study'
        ], function () {
            Route::get('umr_wilayah', 'UmrController@index');
            Route::post('umr_wilayah/tambah', 'UmrController@store');
            Route::put('umr_wilayah/ubah', 'UmrController@update');
            Route::delete('umr_wilayah/hapus', 'UmrController@destroy');

            Route::get('list', 'TracerStudyController@index');
            Route::post('tambah', 'TracerStudyController@store');
            Route::put('ubah', 'TracerStudyController@update');
            Route::delete('hapus', 'TracerStudyController@destroy');

            Route::get('list_atasan', 'TracerStudyAtasanController@index');
            Route::post('tambah_atasan', 'TracerStudyAtasanController@store');
            Route::put('ubah_atasan', 'TracerStudyAtasanController@update');
            Route::delete('hapus_atasan', 'TracerStudyAtasanController@destroy');
        });

        Route::group([
            'namespace' => 'Mbkm',
            'prefix' => 'mbkm'
        ], function () {
            Route::get('list_periode', 'PeriodeController@index');
            Route::post('tambah_periode', 'PeriodeController@store');
            Route::put('ubah_periode', 'PeriodeController@update');
            Route::delete('hapus_periode', 'PeriodeController@destroy');

            Route::get('list_peserta', 'PesertaController@index');
            Route::post('tambah_peserta', 'PesertaController@store');
            Route::put('ubah_peserta', 'PesertaController@update');
            Route::delete('hapus_peserta', 'PesertaController@destroy');

            Route::get('detail_konversi', 'KonversiController@index');
            Route::post('tambah_konversi', 'KonversiController@store');
            Route::put('ubah_konversi', 'KonversiController@update');
            Route::delete('hapus_konversi', 'KonversiController@destroy');
        });

        Route::group([
            'namespace' => 'Kerjasama',
            'prefix' => 'kerjasama'
        ], function () {
            Route::get('list_sms', 'SmsKerjasamaController@index');
            Route::post('tambah_sms', 'SmsKerjasamaController@store');
            Route::put('ubah_sms', 'SmsKerjasamaController@update');
            Route::delete('hapus_sms', 'SmsKerjasamaController@destroy');

            Route::get('list_mou', 'MouController@index');
            Route::post('tambah_mou', 'MouController@store');
            Route::put('ubah_mou', 'MouController@update');
            Route::delete('hapus_mou', 'MouController@destroy');
        });

        Route::group([
            'namespace' => 'Presensi',
            'prefix' => 'presensi'
        ], function () {
            Route::get('list_id', 'KehadiranSdmController@getListKehadiranBySdmId');
            Route::post('tambah', 'KehadiranSdmController@store');
            Route::put('ubah', 'KehadiranSdmController@update');
            Route::get('list_mhs', 'KehadiranMahasiswaController@getListKehadiranByMhs');
            Route::post('tambah_kehadiran_mhs', 'KehadiranMahasiswaController@store');
        });

        // Route::group([
        //     'namespace' => 'Tracer',
        //     'prefix' => 'tracer_study'
        // ], function () {
        //     //umr
        //     Route::get('umr_wilayah', 'UmrController@index');
        //     Route::post('umr_wilayah/tambah', 'UmrController@store');
        //     Route::put('umr_wilayah/ubah', 'UmrController@update');
        //     Route::delete('umr_wilayah/hapus', 'UmrController@destroy');

        //     //hasil tracer
        //     Route::get('list', 'TracerStudyController@index');
        //     Route::post('tambah', 'TracerStudyController@store');
        //     Route::put('ubah', 'TracerStudyController@update');
        //     Route::delete('hapus', 'TracerStudyController@destroy');

        //     //hasil tracer atasan
        //     Route::get('list_atasan', 'TracerStudyAtasanController@index');
        //     Route::post('tambah_atasan', 'TracerStudyAtasanController@store');
        //     Route::put('ubah_atasan', 'TracerStudyAtasanController@update');
        //     Route::delete('hapus_atasan', 'TracerStudyAtasanController@destroy');
        // });

        // Route::group([
        //     'namespace' => 'Mbkm',
        //     'prefix' => 'mbkm'
        // ], function () {
        //     Route::get('list_periode', 'PeriodeController@index');
        //     Route::post('tambah_periode', 'PeriodeController@store');
        //     Route::put('ubah_periode', 'PeriodeController@update');
        //     Route::delete('hapus_periode', 'PeriodeController@destroy');

        //     Route::get('list_peserta', 'PesertaController@index');
        //     Route::post('tambah_peserta', 'PesertaController@store');
        //     Route::put('ubah_peserta', 'PesertaController@update');
        //     Route::delete('hapus_peserta', 'PesertaController@destroy');

        //     Route::get('detail_konversi', 'KonversiController@index');
        //     Route::post('tambah_konversi', 'KonversiController@store');
        //     Route::put('ubah_konversi', 'KonversiController@update');
        //     Route::delete('hapus_konversi', 'KonversiController@destroy');

        //     Route::get('cari_pt', 'NonUnilaController@cariPt');
        //     Route::get('cari_prodi', 'NonUnilaController@cariProdi');
        //     Route::get('cari_mhs', 'NonUnilaController@cariMhs');
        // });

        Route::group([
            'namespace' => 'Presensi',
            'prefix' => 'presensi'
        ], function () {
            Route::get('list_id', 'KehadiranSdmController@getListKehadiranBySdmId');
            Route::post('tambah', 'KehadiranSdmController@store');
            Route::put('ubah', 'KehadiranSdmController@update');
        });


        Route::group([
            'namespace' => 'Pmb',
            'prefix' => 'pmb'
        ], function () {
            Route::get('list_periode', 'PeriodePmbController@getAllListPeriodePmb');
            Route::post('tambah_periode', 'PeriodePmbController@tambah');
            Route::put('ubah_periode', 'PeriodePmbController@ubahPeriodePmb');
            Route::delete('hapus_periode', 'PeriodePmbController@destroy');
            Route::get('list_daya_tampung', 'DayaTampungController@getAllListDayaTampung');
            Route::post('tambah_daya_tampung', 'DayaTampungController@tambah');
            Route::put('ubah_daya_tampung', 'DayaTampungController@ubahDayaTampung');
            Route::delete('hapus_daya_tampung', 'DayaTampungController@destroy');
            Route::get('list_pengumuman', 'PengumumanMandiriController@getAllPengumuman');
            Route::post('tambah_pengumuman', 'PengumumanMandiriController@tambahPengumuman');
            Route::put('ubah_pengumuman', 'PengumumanMandiriController@ubahPengumuman');
            Route::delete('hapus_pengumuman', 'PengumumanMandiriController@hapusPengumuman');
            Route::get('list_minat_prodi', 'MinatProdiMandiriController@getAllMinatProdi');
            Route::post('tambah_minat_prodi', 'MinatProdiMandiriController@tambahMinatProdi');
            Route::put('ubah_minat_prodi', 'MinatProdiMandiriController@ubahMinatProdi');
            Route::delete('hapus_minat_prodi', 'MinatProdiMandiriController@hapusMinatProdi');
        });

        Route::group([
            'namespace' => 'Sarpras',
            'prefix' => 'sarpras'
        ], function () {
            Route::get('alat/daftar', 'AlatController@daftar');
            Route::get('alat_long/daftar', 'AlatLongController@daftar');
            Route::get('alat_transportasi/daftar', 'AlatTransportasiController@daftar');
            Route::get('angkutan/daftar', 'AngkutanController@daftar');
            Route::get('bangunan/daftar', 'BangunanController@daftar');
            Route::get('dbr/daftar', 'DbrController@daftar');
            Route::get('ruang/daftar', 'RuangController@daftar');
            Route::get('tanah/daftar', 'TanahController@daftar');
            Route::post('alat/tambah', 'AlatController@tambah');
            Route::post('alat_long/tambah', 'AlatLongController@tambah');
            Route::post('alat_transportasi/tambah', 'AlatTransportasiController@tambah');
            Route::post('angkutan/tambah', 'AngkutanController@tambah');
            Route::post('bangunan/tambah', 'BangunanController@tambah');
            Route::post('dbr/tambah', 'DbrController@tambah');
            Route::post('ruang/tambah', 'RuangController@tambah');
            Route::post('tanah/tambah', 'TanahController@tambah');
            Route::put('alat/ubah', 'AlatController@ubah');
            Route::put('alat_long/ubah', 'AlatLongController@ubah');
            Route::put('alat_transportasi/ubah', 'AlatTransportasiController@ubah');
            Route::put('angkutan/ubah', 'AngkutanController@ubah');
            Route::put('bangunan/ubah', 'BangunanController@ubah');
            Route::put('dbr/ubah', 'DbrController@ubah');
            Route::put('ruang/ubah', 'RuangController@ubah');
            Route::put('tanah/ubah', 'TanahController@ubah');
            Route::delete('alat/hapus', 'AlatController@hapus');
            Route::delete('alat_long/hapus', 'AlatLongController@hapus');
            Route::delete('alat_transportasi/hapus', 'AlatTransportasiController@hapus');
            Route::delete('angkutan/hapus', 'AngkutanController@hapus');
            Route::delete('bangunan/hapus', 'BangunanController@hapus');
            Route::delete('dbr/hapus', 'DbrController@hapus');
            Route::delete('ruang/hapus', 'RuangController@hapus');
            Route::delete('tanah/hapus', 'TanahController@hapus');
        });

        Route::group([
            'namespace' => 'Iku',
            'prefix' => 'iku_2'
        ], function () {
            Route::get('list', 'Iku2Controller@daftar');
            Route::post('tambah', 'Iku2Controller@tambah');
        });

        Route::group([
            'namespace' => 'Iku',
            'prefix' => 'iku_6'
        ], function () {
            Route::get('list', 'Iku6Controller@daftar');
            Route::post('tambah', 'Iku6Controller@tambah');
        });

        Route::group([
            'namespace' => 'Iku',
            'prefix' => 'iku_7'
        ], function () {
            Route::get('list', 'Iku7Controller@daftar');
            Route::post('tambah', 'Iku7Controller@tambah');
        });
    });
});
