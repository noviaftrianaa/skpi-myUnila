<?php

use App\Http\Controllers\SyncDataController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\language\LanguageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProgramStudiController;
use App\Http\Controllers\DosenController;
use App\Http\Controllers\KelulusanTepatWaktuController;
use App\Http\Controllers\Main\SDM\DosenController as DosenSMSController;
use App\Http\Controllers\Main\SDM\TendikController as TendikSMSController;
use App\Http\Controllers\MahasiswaController;
use App\Http\Controllers\SyncController;
use App\Http\Controllers\authentications\LoginBasic;
use App\Http\Controllers\authentications\RegisterBasic;
//MAIN
use App\Http\Controllers\Main\DashboardController as MainDashboardController;
use App\Http\Controllers\Main\KTWController as MainKTWController;
//IKU
use App\Http\Controllers\Main\iku\Iku1Controller as Iku1Controller;
use App\Http\Controllers\Main\iku\Iku2Controller as Iku2Controller;
use App\Http\Controllers\Main\iku\Iku3Controller as Iku3Controller;
use App\Http\Controllers\Main\iku\Iku4Controller as Iku4Controller;
use App\Http\Controllers\Main\iku\Iku5Controller as Iku5Controller;
use App\Http\Controllers\Main\iku\Iku6Controller as Iku6Controller;
use App\Http\Controllers\Main\iku\Iku7Controller as Iku7Controller;
use App\Http\Controllers\Main\iku\Iku8Controller as Iku8Controller;

// locale
Route::get('lang/{locale}', [LanguageController::class, 'swap'])->name('swap_language');

// Dashboard Public
Route::get('/', [DashboardController::class, 'index'])->name('pages-home');
Route::get('/dokumen_publik/{id_dok}', [DashboardController::class, 'dok_publik'])->name('dokumen_publik');
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
//Kelulusan Tepat Waktu
Route::get('/ktw', [KelulusanTepatWaktuController::class, 'index'])->name('pages-ktw');
Route::get('/ktw/data', [KelulusanTepatWaktuController::class, 'data'])->name('pages-ktw-data');
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
    //Kelulusan Tepat Waktu
    Route::get('/ktw', [MainKTWController::class, 'index'])->name('main-ktw');
    Route::get('/ktw/data', [MainKTWController::class, 'data'])->name('main-ktw-data');

     //IKU
     Route::get('iku1', [Iku1Controller::class, 'index'])->name('main-iku1');
     Route::get('iku1/json/point', [Iku1Controller::class, 'listTotalPoint'])->name('json-point-iku1');
     Route::get('iku1/json/raw', [Iku1Controller::class, 'listRawData'])->name('json-raw-iku1');
     Route::get('iku1/download/raw', [Iku1Controller::class, 'downloadRawData'])->name('download-raw-iku1');

     Route::get('iku2', [Iku2Controller::class, 'index'])->name('main-iku2');
     Route::get('iku2/json/point', [Iku2Controller::class, 'listTotalPoint'])->name('json-point-iku2');
     Route::get('iku2/json/raw', [Iku2Controller::class, 'listRawData'])->name('json-raw-iku2');
     Route::get('iku2/download/raw', [Iku2Controller::class, 'downloadRawData'])->name('download-raw-iku2');

    Route::get('iku3', [Iku3Controller::class, 'index'])->name('main-iku3');
    Route::get('iku3/json/point', [Iku3Controller::class, 'listTotalPoint'])->name('json-point-iku3');
    Route::get('iku3/json/raw', [Iku3Controller::class, 'listRawData'])->name('json-raw-iku3');
    Route::get('iku3/download/raw', [Iku3Controller::class, 'downloadRawData'])->name('download-raw-iku3');

    Route::get('iku4', [Iku4Controller::class, 'index'])->name('main-iku4');
    Route::get('iku4/json/point', [Iku4Controller::class, 'listTotalPoint'])->name('json-point-iku4');
    Route::get('iku4/json/raw', [Iku4Controller::class, 'listRawData'])->name('json-raw-iku4');
    Route::get('iku4/download/raw', [Iku4Controller::class, 'downloadRawData'])->name('download-raw-iku4');

    Route::get('iku5', [Iku5Controller::class, 'index'])->name('main-iku5');
    Route::get('iku5/json/point', [Iku5Controller::class, 'listTotalPoint'])->name('json-point-iku5');
    Route::get('iku5/json/raw', [Iku5Controller::class, 'listRawData'])->name('json-raw-iku5');
    Route::get('iku5/download/raw', [Iku5Controller::class, 'downloadRawData'])->name('download-raw-iku5');

    Route::get('iku6', [Iku6Controller::class, 'index'])->name('main-iku6');
    Route::get('iku6/json/point', [Iku6Controller::class, 'listTotalPoint'])->name('json-point-iku6');
    Route::get('iku6/json/raw', [Iku6Controller::class, 'listRawData'])->name('json-raw-iku6');
    Route::get('iku6/download/raw', [Iku6Controller::class, 'downloadRawData'])->name('download-raw-iku6');

    Route::get('iku7', [Iku7Controller::class, 'index'])->name('main-iku7');
    Route::get('iku7/json/point', [Iku7Controller::class, 'listTotalPoint'])->name('json-point-iku7');
    Route::get('iku7/json/raw', [Iku7Controller::class, 'listRawData'])->name('json-raw-iku7');
    Route::get('iku7/download/raw', [Iku7Controller::class, 'downloadRawData'])->name('download-raw-iku7');

    Route::get('iku8', [Iku8Controller::class, 'index'])->name('main-iku8');
    Route::get('iku8/json/point', [Iku8Controller::class, 'listTotalPoint'])->name('json-point-iku8');
    Route::get('iku8/json/raw', [Iku8Controller::class, 'listRawData'])->name('json-raw-iku8');
    Route::get('iku8/download/raw', [Iku8Controller::class, 'downloadRawData'])->name('download-raw-iku8');

    //SDM
    Route::get('sdm/dosen', [DosenSMSController::class, 'index'])->name('sdm.dosen');
    Route::get('sdm/dosen/data', [DosenSMSController::class, 'data'])->name('sdm.dosen.data');
    Route::get('sdm/tendik', [TendikSMSController::class, 'index'])->name('sdm.tendik');
    Route::get('sdm/tendik/data', [TendikSMSController::class, 'data'])->name('sdm.tendik.data');
  });

  #sinkronisasi
  Route::get('sinkronisasi', [SyncController::class, 'index'])->name('sinkronisasi');
  Route::get('sinkronisasi/tambah', [SyncController::class, 'create'])->name('sinkronisasi.tambah');
  Route::post('sinkronisasi/simpan', [SyncController::class, 'store'])->name('sinkronisasi.simpan');
  Route::get('sinkronisasi/{id}/ubah', [SyncController::class, 'edit'])->name('sinkronisasi.ubah');
  Route::put('sinkronisasi/{id}/update', [SyncController::class, 'update'])->name('sinkronisasi.update');

  #sinkronisasi tabel
  Route::get('sinkronisasi/{id}/tabel', [SyncController::class, 'show'])->name('sinkronisasi.tabel');
  Route::get('sinkronisasi/{id}/tabel/tambah', [SyncDataController::class, 'create'])->name(
    'sinkronisasi.tabel.tambah'
  );
  Route::post('sinkronisasi/{id}/tabel/simpan', [SyncDataController::class, 'store'])->name(
    'sinkronisasi.tabel.simpan'
  );
  Route::get('sinkronisasi/{id}/tabel/{id_tabel}/ubah', [SyncDataController::class, 'edit'])->name(
    'sinkronisasi.tabel.ubah'
  );
  Route::put('sinkronisasi/{id}/tabel/{id_tabel}/update', [SyncDataController::class, 'update'])->name(
    'sinkronisasi.tabel.update'
  );

  Route::get('sinkronisasi/{id}/tabel/{id_tabel}/mulai_sync', [SyncDataController::class, 'mulai_sync'])->name(
    'sinkronisasi.tabel.mulai_sync'
  );
});
