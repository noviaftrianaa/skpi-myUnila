<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::prefix('stakeholder')->group(function() {
    //dashboard
    Route::get('/', 'StakeholderController@index');
    Route::get('/beranda', 'StakeholderController@index')->name('stakeholder.dashboard');

    //data mahasiswa
    Route::get('/data-mahasiswa','DataMahasiswaController@index')->name('data-mahasiswa');
    // Route::get('/data-mahasiswa', function () { return view('stakeholder::pages.data_mahasiswa.index'); });

    //absensi
    Route::get('/absensi', function () { return view('stakeholder::pages.absensi.index'); });

    //Riwayah studi
    Route::get('/riwayat-studi', function () { return view('stakeholder::pages.transkrip.index'); });

    //status spp
    Route::get('/status-pembayaran-spp', function() { return view ('stakeholder::pages.status_spp.index');});

    //status beasiswa
    Route::get('/status-beasiswa', function() { return view ('stakeholder::pages.status_beasiswa.index');});

    //prestasi
    Route::get('/prestasi', function() { return view ('stakeholder::pages.prestasi.index');});

    //kemampuan belajar
    Route::get('/kemajuan-belajar', function() { return view ('stakeholder::pages.kemajuan_belajar.index');});
});



