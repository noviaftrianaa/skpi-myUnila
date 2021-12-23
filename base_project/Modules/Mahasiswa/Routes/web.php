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

Route::prefix('mahasiswa')->group(function() {
    // dashboard
    Route::get('/beranda', 'MahasiswaController@index');

    //profil
    Route::get('/data-pribadi', function () { return view('mahasiswa::pages.profil.data_pribadi.index'); });
    Route::get('/ukm', function () { return view('mahasiswa::pages.profil.portofolio.index'); });

    //perkuliahaan
    Route::get('/kurikulum', function () { return view('mahasiswa::pages.perkuliahan.kurikulum.index'); });
    Route::get('/jadwal', function () { return view('mahasiswa::pages.perkuliahan.jadwal_kelas.index'); });
    Route::get('/nilai', function () { return view('mahasiswa::pages.profil.portofolio.index'); });
    Route::get('/status-semester', function () { return view('mahasiswa::pages.profil.portofolio.index'); });

    //tugas akhir
    Route::get('/daftar-list', function () { return view('mahasiswa::pages.profil.portofolio.index'); });
    Route::get('/bimbingan', function () { return view('mahasiswa::pages.profil.portofolio.index'); });
    Route::get('/publikasi', function () { return view('mahasiswa::pages.profil.portofolio.index'); });

    //lainnya
    Route::get('/sertifikasi', function () { return view('mahasiswa::pages.profil.portofolio.index'); });
    Route::get('/beasiswa', function () { return view('mahasiswa::pages.profil.portofolio.index'); });

});
