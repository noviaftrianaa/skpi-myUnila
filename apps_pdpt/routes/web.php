<?php

use App\Http\Controllers\AkreditasController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
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

// Route::get('/',  [DashboardController::class,'index'])->name('home');
// Route::get('/akreditasi',  [DashboardController::class,'akreditasi'])->name('akreditasi');
// Route::get('/akreditasi/{id_prodi}/detail',  [DashboardController::class,'detail_akreditasi_prodi'])->name('detail_akreditasi');
// Route::get('/iku',  [DashboardController::class,'iku'])->name('iku');

// Route::get('/akreditasi/penggunaan_dana',  [DashboardController::class,'add_penggunaan_dana'])->name('penggunaan_dana');
// Route::get('/akreditasi/standar_akreditasi',  [DashboardController::class,'standar_akreditasi'])->name('standar_akreditasi');
// Route::get('/akreditasi/kriteria2',  [DashboardController::class,'kriteria2'])->name('kriteria2');
// Route::get('/akreditasi/kriteria3',  [DashboardController::class, 'kriteria3'])->name('kriteria3');
// Route::get('/akreditasi/kriteria4',  [DashboardController::class,'kriteria4'])->name('kriteria4');
// Route::get('/akreditasi/kriteria5',  [DashboardController::class,'kriteria5'])->name('kriteria5');
// Route::get('/akreditasi/kriteria6',  [DashboardController::class,'kriteria6'])->name('kriteria6');
// Route::get('/akreditasi/kriteria7',  [DashboardController::class,'kriteria7'])->name('kriteria7');
// Route::get('/akreditasi/kriteria8',  [DashboardController::class,'kriteria8'])->name('kriteria8');
// Route::get('/akreditasi/kriteria9',  [DashboardController::class,'kriteria9'])->name('kriteria9');

Route::prefix('akreditasi')->group(function () {
    Route::get('/',  [AkreditasController::class, 'akreditasi'])->name('akreditasi');
    Route::get('/{id_prodi}/detail',  [AkreditasController::class, 'detail_akreditasi_prodi'])->name('detail_akreditasi');

    Route::prefix('lkps')->group(function () {
        Route::prefix('kerjasama')->group(function () {
            Route::get('/{jenis_kerjasama}', [AkreditasController::class, 'kerjasama'])->name('kerjasama');
        });
        Route::prefix('mahasiswa')->group(function () {
            Route::get('seleksi_mahasiswa', [AkreditasController::class, 'seleksi_mahasiswa'])->name('seleksi_mahasiswa');
            Route::get('mahasiswa_asing', [AkreditasController::class, 'mahasiswa_asing'])->name('mahasiswa_asing');
        });
        Route::prefix('profil_dosen')->group(function () {
            Route::get('dosen_tetap', [AkreditasController::class, 'dosen_tetap'])->name('dosen_tetap');
            Route::get('dosen_pembimbing_utama', [AkreditasController::class, 'dosen_pembimbing_utama_tugas_akhir'])->name('dosen_pembimbing_utama');
            Route::get('eewmp_dosen_tetap', [AkreditasController::class, 'eewmp_dosen_tetap'])->name('eewmp_dosen_tetap');
            Route::get('dosen_tidak_tetap', [AkreditasController::class, 'dosen_tidak_tetap'])->name('dosen_tidak_tetap');
            Route::get('dosen_praktisi_industri', [AkreditasController::class, 'dosen_praktisi_industri'])->name('dosen_praktisi_industri');
        });
    });
});
