<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PDUT\Dashboard\JabfungController;
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
Route::get('/dashboard/dosen',  [DashboardController::class,'dosen'])->name('dashboard.dosen');
Route::get('/dashboard/dosen/profil/{id}',  [DashboardController::class,'dosen_profil'])->name('dashboard.dosen.profil');
Route::get('/dashboard/jabfung_dosen',  [JabfungController::class,'index'])->name('dashboard.jabfung');
Route::post('/dashboard/jabfung_dosen',  [JabfungController::class,'chart'])->name('dashboard.jabfung.chart');
Route::get('/dashboard/jabfung_dosen/load',  [JabfungController::class,'load'])->name('dashboard.jabfung.load');
Route::post('/dashboard/jabfung_dosen/reload',  [JabfungController::class,'reload'])->name('dashboard.jabfung.reload');
Route::get('/akreditasi/{id_prodi}/detail',  [DashboardController::class,'detail_akreditasi_prodi'])->name('detail_akreditasi');
Route::get('/iku',  [DashboardController::class,'iku'])->name('iku');
