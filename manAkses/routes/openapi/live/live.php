<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::group([
    'prefix' => 'live/v1',
    'as' => 'api_live',
    'namespace' => 'App\Http\Controllers\Api',
    'middleware' => ['openapi_live']
], function () {
    Route::post('/auth/login', 'LoginController@login');
    Route::post('/auth/login/ssoLogin', 'LoginController@ssoLogin')->name('login.sso.post');
    Route::get('/auth/login/sso', 'LoginController@sso')->name('login.sso');
    Route::post('/auth/cek_token', 'LoginController@checkToken')->name('check.token');

    Route::middleware('api', 'auth.api')->group(function () {
        //PENGGUNA
        Route::get('/pengguna/list', 'PenggunaController@list')->name('pengguna.list');
        // Route::post('/pengguna/tambah', 'PenggunaController@store')->name('pengguna.store');
        Route::put('/pengguna/ubah_password', 'PenggunaController@password')->name('pengguna.ubah_password');
        //PERAN
        Route::get('/peran/list', 'PeranController@list')->name('peran.list');
    });
});
