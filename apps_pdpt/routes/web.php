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
