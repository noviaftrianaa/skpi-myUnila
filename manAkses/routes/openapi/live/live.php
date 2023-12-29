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
    Route::post('/auth/login/sso', 'LoginController@sso');
    Route::post('/auth/cek_token', 'LoginController@checkToken');

    Route::middleware('api', 'auth.api')->group(function () {
        //PENGGUNA
        Route::get('/pengguna/list', 'PenggunaController@list');
        // Route::post('/pengguna/tambah', 'PenggunaController@store');
        Route::put('/pengguna/ubah_password', 'PenggunaController@password');
        //PERAN
        Route::get('/peran/list', 'PeranController@list');
    });
});
