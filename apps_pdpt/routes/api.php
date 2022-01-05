<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group([
    'prefix' => '0.1',
    'as' => 'api.',
    'namespace' => 'App\Http\Controllers\PDUT\Api',
    'middleware' => ['auth.api']
], function () {
    Route::get('referensi/negara','ReferensiController@negara');
    Route::get('referensi/wilayah','ReferensiController@wilayah');
    Route::get('referensi/bentuk_pendidikan','ReferensiController@bentuk_pendidikan');
    Route::get('referensi/agama','ReferensiController@agama');

    Route::get('buku_ajar','Tridarma/BukuAjarController@index');
    Route::post('buku_ajar/simpan','Tridarma/BukuAjarController@store');
});


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

