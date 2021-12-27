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
    Route::get('/index-da', 'StakeholderController@index');

    //krs&khs
    Route::get('/index-krs', function() { return view ('stakeholder::pages.krs_khs.index-krs');});

    //transkrip
    Route::get('/index-tr', function() { return view ('stakeholder::pages.transkrip.index-tr');});

    //status spp
    Route::get('/index-status-spp', function() { return view ('stakeholder::pages.status_spp.index-status-spp');});

    //status beasiswa
    Route::get('/index-status-beasiswa', function() { return view ('stakeholder::pages.status_beasiswa.index-status-beasiswa');});

    //prestasi
    Route::get('/index-prestasi', function() { return view ('stakeholder::pages.prestasi.index-prestasi');});

    //kemampuan belajar
    Route::get('/index-kemajuan-belajar', function() { return view ('stakeholder::pages.kemajuan_belajar.index-kemajuan-belajar');});
});



