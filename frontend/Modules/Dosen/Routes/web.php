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

Route::prefix('dosen')->group(function() {
    Route::get('/', 'DosenController@index')->name('dosen.dashboard');
    Route::get('profile','DosenProfileController@index')->name('dosen.profile');
    Route::prefix('inpassing')->group(function() {
        Route::get('/','DosenInpassingController@index')->name('dosen.inpassing');
        Route::get('add','DosenInpassingController@create')->name('dosen.inpassing.add');
        Route::get('edit','DosenInpassingController@edit')->name('dosen.inpassing.edit');
    });

    Route::prefix('jabatan-fungsional')->group(function() {
        Route::get('/','DosenJabatanFungsionalController@index')->name('dosen.jabatan_fungsional'); 
        Route::get('add','DosenJabatanFungsionalController@create')->name('dosen.jabatan_fungsional.add'); 
    });
});
