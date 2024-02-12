<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\language\LanguageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProgramStudiController;
use App\Http\Controllers\DosenController;
use App\Http\Controllers\Main\SDM\DosenController AS DosenSMSController;
use App\Http\Controllers\Main\SDM\TendikController AS TendikSMSController;
use App\Http\Controllers\MahasiswaController;
use App\Http\Controllers\SyncController;
use App\Http\Controllers\authentications\LoginBasic;
use App\Http\Controllers\authentications\RegisterBasic;
//MAIN
use App\Http\Controllers\Main\DashboardController as MainDashboardController;

//Iku
use App\Http\Controllers\Main\iku\Iku1Controller as IkuController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// locale
Route::get('lang/{locale}', [LanguageController::class, 'swap'])->name('swap_language');

// Dashboard Public
Route::get('/', [DashboardController::class, 'index'])->name('pages-home');
Route::get('/programstudi', [DashboardController::class, 'programstudi'])->name('pages-home-programstudi');
Route::get('/mahasiswa', [DashboardController::class, 'mahasiswa'])->name('pages-home-mahasiswa');
Route::get('/mahasiswa/detail', [DashboardController::class, 'detailMahasiswa'])->name('pages-home-mahasiswa-detail');
Route::get('/dosen', [DashboardController::class, 'dosen'])->name('pages-home-dosen');
Route::get('/dosen/detail', [DashboardController::class, 'detailDosen'])->name('pages-home-dosen-detail');
Route::get('/tendik', [DashboardController::class, 'tendik'])->name('pages-home-tendik');
Route::get('/tendik/detail', [DashboardController::class, 'detailTendik'])->name('pages-home-tendik-detail');
//University Rank
Route::get('/times_higher_education_ranking', [DashboardController::class, 'times_higher_education_ranking'])->name(
  'pages-times-higher-education-ranking'
);
Route::get('/qs_world_university_ranking', [DashboardController::class, 'qs_world_university_ranking'])->name(
  'pages-qs-world-university-ranking'
);
Route::get('/green_metric_ranking', [DashboardController::class, 'green_metric_ranking'])->name(
  'pages-green-metric-ranking'
);
Route::get('/webometrics_ranking', [DashboardController::class, 'webometrics_ranking'])->name(
  'pages-webometrics-ranking'
);
//Prodi
Route::get('/prodi/{id}', [ProgramStudiController::class, 'index'])->name('pages-prodi');
Route::get('/prodi/mahasiswa/{id}', [ProgramStudiController::class, 'mahasiswa'])->name('pages-prodi-mahasiswa');
//Dosen
Route::get('/dosen/{id}', [DosenController::class, 'index'])->name('pages-dosen');
Route::get('/dosen/pengajaran/{id}', [DosenController::class, 'pengajaran'])->name('pages-dosen-pengajaran');
Route::get('/dosen/bimbingan/{id}', [DosenController::class, 'bimbingan'])->name('pages-dosen-bimbingan');
Route::get('/dosen/pengujian/{id}', [DosenController::class, 'pengujian'])->name('pages-dosen-pengujian');
//Mahasiswa
Route::get('/mahasiswa/{id}', [MahasiswaController::class, 'index'])->name('pages-mahasiswa');
Route::get('/mahasiswa/semester/{id}', [MahasiswaController::class, 'semester'])->name('pages-mahasiswa-semester');
Route::get('/mahasiswa/mk/{id}', [MahasiswaController::class, 'mk'])->name('pages-mahasiswa-mk');
Route::get('/mahasiswa/aktivitas/{id}', [MahasiswaController::class, 'aktivitas'])->name('pages-mahasiswa-aktivitas');
Route::get('/mahasiswa/prestasi/{id}', [MahasiswaController::class, 'prestasi'])->name('pages-mahasiswa-prestasi');

//Auth
Route::get('/auth/login', [LoginBasic::class, 'index'])->name('auth-login');
Route::get('/auth/sso', [LoginBasic::class, 'sso'])->name('auth-sso');
Route::post('/auth/captcha', [LoginBasic::class, 'captcha'])->name('auth-captcha');
Route::post('auth/logout', [LoginBasic::class, 'logout'])->name('auth-logout');

//Maintenance
Route::get('maintanance', function () {
  return view('maintenance');
});

//Auth Success
Route::middleware(['auth'])->group(function () {
  Route::prefix('main')->group(function () {
    Route::get('/', [MainDashboardController::class, 'index'])->name('main-index');
    Route::get('/peran', [MainDashboardController::class, 'peran'])->name('main-peran');
    Route::get('/changePeran', [MainDashboardController::class, 'changePeran'])->name('main-changePeran');

    //iku
    // Route::prefix('iku')->group(function () {
      Route::get('/main-iku1', [IkuController::class, 'index'])->name('main-iku1');
      Route::get('/json/point', [IkuController::class, 'listTotalPoint'])->name('json-iku1-point');
    // });

    //SDM
    Route::get('sdm/dosen',[DosenSMSController::class,'index'])->name('sdm.dosen');
    Route::get('sdm/tendik',[TendikSMSController::class,'index'])->name('sdm.tendik');
  });

  Route::get('sync_data',[SyncController::class,'index'])->name('sync_data');
});
