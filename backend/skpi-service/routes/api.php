<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PdutController;
use App\Http\Controllers\Mahasiswa\PrestasiController;
use App\Http\Controllers\Mahasiswa\KategoriController;
use App\Http\Controllers\Mahasiswa\KategoriDetailController;
use App\Http\Controllers\Mahasiswa\TingkatanController;
use App\Http\Controllers\Mahasiswa\BobotController;
use App\Http\Controllers\Mahasiswa\PrestasiLampiranController;
use App\Http\Controllers\Mahasiswa\PrestasiPembimbingController;
use App\Http\Controllers\Mahasiswa\PrestasiAnggotaController;
use App\Http\Controllers\Mahasiswa\KaryaController;
use App\Http\Controllers\Mahasiswa\DashboardController as MahasiswaDashboardController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ValidasiController;

Route::prefix('admin')->group(function () {

    Route::get(
        '/dashboard',
        [AdminDashboardController::class, 'index']
    );

    Route::get(
        '/validasi',
        [ValidasiController::class, 'index']
    );

    Route::get(
        '/validasi/{id}',
        [ValidasiController::class, 'show']
    );

    Route::put(
        '/validasi/{id}',
        [ValidasiController::class, 'updateStatus']
    );

});

Route::get(
    '/dashboard/{nim}',
    [MahasiswaDashboardController::class, 'index']
);

Route::get(
    '/mahasiswa/pengajuan/{nim}',
    [PrestasiController::class, 'pengajuan']
);

Route::get(
    '/mahasiswa/notifikasi/{nim}',
    [PrestasiController::class, 'notifikasi']
);

Route::prefix('karya')->group(function () {

    Route::get('/karya/{nim}', [KaryaController::class, 'index']);

    Route::get('/karya/detail/{id}', [KaryaController::class, 'show']);

    Route::post('/karya', [KaryaController::class, 'store']);

    Route::put('/karya/{id}', [KaryaController::class, 'update']);

    Route::delete('/karya/{id}', [KaryaController::class, 'destroy']);
});

Route::prefix('mahasiswa')->group(function () {

    Route::get('/dashboard/{nim}', [PrestasiController::class,'dashboard']);

    Route::get('/prestasi/{nim}', [PrestasiController::class,'index']);

    Route::get('/prestasi/detail/{id}', [PrestasiController::class,'show']);

    Route::post('/prestasi', [PrestasiController::class,'store']);

    Route::put('/prestasi/{id}', [PrestasiController::class,'update']);

    Route::delete('/prestasi/{id}', [PrestasiController::class,'destroy']);

    Route::get('/notifikasi/{nim}', [PrestasiController::class,'notification']);

});

Route::prefix('mahasiswa')->group(function () {

    Route::get(
        '/prestasi/{prestasi}/anggota',
        [PrestasiAnggotaController::class, 'index']
    );

    Route::post(
        '/prestasi/{prestasi}/anggota',
        [PrestasiAnggotaController::class, 'store']
    );

    Route::put(
        '/anggota/{id}',
        [PrestasiAnggotaController::class, 'update']
    );

    Route::delete(
        '/anggota/{id}',
        [PrestasiAnggotaController::class, 'destroy']
    );

});                                                             

Route::prefix('mahasiswa')->group(function () {

    Route::get(
        '/prestasi/{prestasi}/pembimbing',
        [PrestasiPembimbingController::class, 'index']
    );

    Route::post(
        '/prestasi/{prestasi}/pembimbing',
        [PrestasiPembimbingController::class, 'store']
    );

    Route::put(
        '/pembimbing/{id}',
        [PrestasiPembimbingController::class, 'update']
    );

    Route::delete(
        '/pembimbing/{id}',
        [PrestasiPembimbingController::class, 'destroy']
    );

});

Route::prefix('mahasiswa')->group(function () {

    Route::get(
        '/prestasi/{prestasi}/lampiran',
        [PrestasiLampiranController::class, 'index']
    );

    Route::post(
        '/prestasi/{prestasi}/lampiran',
        [PrestasiLampiranController::class, 'store']
    );

    Route::delete(
        '/lampiran/{id}',
        [PrestasiLampiranController::class, 'destroy']
    );

});




Route::prefix('master')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Master Kategori
    |--------------------------------------------------------------------------
    */

    Route::get('/kategori', [KategoriController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | Master Tingkatan
    |--------------------------------------------------------------------------
    */

    Route::get('/tingkatan', [TingkatanController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | Master Kategori Detail
    |--------------------------------------------------------------------------
    */

    Route::get('/kategori-detail/{kategoriId}', [KategoriDetailController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | Lookup Bobot
    |--------------------------------------------------------------------------
    */

    Route::get('/bobot', [BobotController::class, 'index']);
});

Route::prefix('pdut')->group(function () {

    Route::get('/mahasiswa/{nim}', [PdutController::class, 'mahasiswa']);

    Route::get('/dosen/{nidn}', [PdutController::class, 'dosen']);

    Route::get('/admin', [PdutController::class, 'admin']);

    Route::get('/search', [PdutController::class, 'search']);

});