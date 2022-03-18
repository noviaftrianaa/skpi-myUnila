<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PDUT\Dashboard\JabfungController;
use App\Http\Controllers\PDUT\Dashboard\JenjangPendidikan;
use App\Http\Controllers\PDUT\Dashboard\PangkatGolonganController;
use App\Http\Controllers\PDUT\Dashboard\IkatanKerjaController;
use App\Http\Controllers\PDUT\Dashboard\JenisKelaminController;
use App\Http\Controllers\PDUT\Dashboard\StatusKeaktifanController;
use App\Http\Controllers\PDUT\Dashboard\StatusKepegawaianController;
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

/** Dashboard Dosen */
Route::get('/dashboard/dosen',  [DashboardController::class,'dosen'])->name('dashboard.dosen');
Route::get('/dashboard/dosen/profil/{id}',  [DashboardController::class,'dosen_profil'])->name('dashboard.dosen.profil');
Route::get('/dashboard/jabfung_dosen',  [JabfungController::class,'index'])->name('dashboard.jabfung');
Route::post('/dashboard/jabfung_dosen',  [JabfungController::class,'chart'])->name('dashboard.jabfung.chart');
Route::get('/dashboard/jabfung_dosen/load',  [JabfungController::class,'load'])->name('dashboard.jabfung.load');
Route::post('/dashboard/jabfung_dosen/reload',  [JabfungController::class,'reload'])->name('dashboard.jabfung.reload');
Route::get('/dashboard/jenjang_pendidikan',  [JenjangPendidikan::class,'index'])->name('dashboard.jenj_didik');
Route::post('/dashboard/jenjang_pendidikan',  [JenjangPendidikan::class,'chart'])->name('dashboard.jenj_didik.chart');
Route::get('/dashboard/jenjang_pendidikan/load',  [JenjangPendidikan::class,'load'])->name('dashboard.jenj_didik.load');
Route::post('/dashboard/jenjang_pendidikan/reload',  [JenjangPendidikan::class,'reload'])->name('dashboard.jenj_didik.reload');
Route::get('/dashboard/pangkat_golongan',  [PangkatGolonganController::class,'index'])->name('dashboard.pangkat_golongan');
Route::post('/dashboard/pangkat_golongan',  [PangkatGolonganController::class,'chart'])->name('dashboard.pangkat_golongan.chart');
Route::get('/dashboard/pangkat_golongan/load',  [PangkatGolonganController::class,'load'])->name('dashboard.pangkat_golongan.load');
Route::post('/dashboard/pangkat_golongan/reload',  [PangkatGolonganController::class,'reload'])->name('dashboard.pangkat_golongan.reload');
Route::get('/dashboard/ikatan_kerja',  [IkatanKerjaController::class,'index'])->name('dashboard.ikatan_kerja');
Route::post('/dashboard/ikatan_kerja',  [IkatanKerjaController::class,'chart'])->name('dashboard.ikatan_kerja.chart');
Route::get('/dashboard/ikatan_kerja/load',  [IkatanKerjaController::class,'load'])->name('dashboard.ikatan_kerja.load');
Route::post('/dashboard/ikatan_kerja/reload',  [IkatanKerjaController::class,'reload'])->name('dashboard.ikatan_kerja.reload');
Route::get('/dashboard/status_keaktifan',  [StatusKeaktifanController::class,'index'])->name('dashboard.status_keaktifan');
Route::post('/dashboard/status_keaktifan',  [StatusKeaktifanController::class,'chart'])->name('dashboard.status_keaktifan.chart');
Route::get('/dashboard/status_keaktifan/load',  [StatusKeaktifanController::class,'load'])->name('dashboard.status_keaktifan.load');
Route::post('/dashboard/status_keaktifan/reload',  [StatusKeaktifanController::class,'reload'])->name('dashboard.status_keaktifan.reload');
Route::get('/dashboard/status_kepegawaian',  [StatusKepegawaianController::class,'index'])->name('dashboard.status_kepegawaian');
Route::post('/dashboard/status_kepegawaian',  [StatusKepegawaianController::class,'chart'])->name('dashboard.status_kepegawaian.chart');
Route::get('/dashboard/status_kepegawaian/load',  [StatusKepegawaianController::class,'load'])->name('dashboard.status_kepegawaian.load');
Route::post('/dashboard/status_kepegawaian/reload',  [StatusKepegawaianController::class,'reload'])->name('dashboard.status_kepegawaian.reload');
Route::get('/dashboard/jenis_kelamin',  [JenisKelaminController::class,'index'])->name('dashboard.jenis_kelamin');
Route::post('/dashboard/jenis_kelamin',  [JenisKelaminController::class,'chart'])->name('dashboard.jenis_kelamin.chart');
Route::get('/dashboard/jenis_kelamin/load',  [JenisKelaminController::class,'load'])->name('dashboard.jenis_kelamin.load');
Route::post('/dashboard/jenis_kelamin/reload',  [JenisKelaminController::class,'reload'])->name('dashboard.jenis_kelamin.reload');
/** End Dashboar Dosen */
Route::get('/akreditasi',  [DashboardController::class,'akreditasi'])->name('akreditasi');
Route::get('/akreditasi/{id_prodi}/detail',  [DashboardController::class,'detail_akreditasi_prodi'])->name('detail_akreditasi');
Route::get('/iku',  [DashboardController::class,'iku'])->name('iku');
