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
    Route::get('referensi/negara','Referensi\NegaraController@index');
});


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

