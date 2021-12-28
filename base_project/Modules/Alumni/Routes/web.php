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

Route::prefix('alumni')->group(function() {
    //dashboard
    Route::get('/', 'AlumniController@index');

    //status tugas akhir
    Route::get('/index-ta', function() { return view('alumni::pages.status-ta.index-ta'); });

    //data alumni
    Route::get('/data_alumni', function() { return view('alumni::pages.data-alumni.data_alumni'); });

    //loker
    Route::get('/loker', function() { return view('alumni::pages.loker.loker'); });

    //riwayat pelatihan
    Route::get('/pelatihan', function() { return view('alumni::pages.riwayat-pelatihan.pelatihan'); });

    //riwayat pendidikan
    Route::get('/pendidikan', function() { return view('alumni::pages.riwayat-pendidikan.pendidikan'); });

    //riwayat transkrip
    Route::get('/index-transkrip', function() { return view('alumni::pages.transkrip.index-transkrip'); });
});

