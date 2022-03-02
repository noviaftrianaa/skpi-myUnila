<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
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

Route::get('/',  [DashboardController::class,'index'])->name('home');
Route::get('/akreditasi',  [DashboardController::class,'akreditasi'])->name('akreditasi');
Route::get('/akreditasi/{id_prodi}/detail',  [DashboardController::class,'detail_akreditasi_prodi'])->name('detail_akreditasi');
Route::get('/iku',  [DashboardController::class,'iku'])->name('iku');

Route::get('/akreditasi/penggunaan_dana',  [DashboardController::class,'add_penggunaan_dana'])->name('penggunaan_dana');
Route::get('/akreditasi/standar_akreditasi',  [DashboardController::class,'standar_akreditasi'])->name('standar_akreditasi');
Route::get('/akreditasi/detail_standar1',  [DashboardController::class,'detail_standar1'])->name('detail_standar1');
Route::get('/akreditasi/detail_standar2',  [DashboardController::class,'detail_standar2'])->name('detail_standar2');
Route::get('/akreditasi/detail_standar3',  [DashboardController::class,'detail_standar3'])->name('detail_standar3');
Route::get('/akreditasi/detail_standar4',  [DashboardController::class,'detail_standar4'])->name('detail_standar4');
Route::get('/akreditasi/detail_standar5',  [DashboardController::class,'detail_standar5'])->name('detail_standar5');
Route::get('/akreditasi/detail_standar6',  [DashboardController::class,'detail_standar6'])->name('detail_standar6');
Route::get('/akreditasi/detail_standar7',  [DashboardController::class,'detail_standar7'])->name('detail_standar7');
Route::get('/akreditasi/detail_standar8',  [DashboardController::class,'detail_standar8'])->name('detail_standar8');
Route::get('/akreditasi/detail_standar9',  [DashboardController::class,'detail_standar9'])->name('detail_standar9');
