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

Route::prefix('tendik')->group(function () {
    Route::get('/', 'TendikController@index')->name('tendik.dashboard');
});


Route::prefix('tendik')->group(function () {
    Route::get('/', 'TendikController@index')->name('tendik.dashboard');
    Route::get('data-pribadi', 'TendikDataPribadiController@index')->name('tendik.data-pribadi');
    // Route::prefix('inpassing')->group(function () {
    //     Route::get('/', 'DosenInpassingController@index')->name('dosen.inpassing');
    //     Route::get('add', 'DosenInpassingController@create')->name('dosen.inpassing.add');
    // });
});
