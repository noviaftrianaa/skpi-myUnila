<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\manAksesController;

Route::group([
    'prefix' => 'live',
    'namespace' => 'App\Http\Controllers\Api'
], function () {

    Route::middleware('api')->group(function () {

        Route::prefix('peran')->group(function () {
            Route::get('', 'manAksesController@peran');
        });
        Route::prefix('ubah_keaktifan')->group(function () {
            Route::get('', 'manAksesController@updateLastActive');
        });
        Route::prefix('pengguna')->group(function () {
            Route::get('/list', 'PenggunaController@list');
            Route::put('', 'PenggunaController@store');
            Route::get('/reset', 'PenggunaController@reset');
        });

        // SSO Radius API - Fetch data from radius MySQL database (protected)
        Route::middleware('auth.api')->prefix('v1/sso-radius')->group(function () {
            Route::get('/stats', 'SsoRadiusController@stats');
            Route::get('/users', 'SsoRadiusController@users');
            Route::get('/preview/{username}', 'SsoRadiusController@preview');
        });

    });
});
