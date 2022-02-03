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
    'prefix' => 'live/0.1',
    'as' => 'api_live',
    'namespace' => 'App\Http\Controllers\PDUT\Api',
    'middleware' => ['openapi_live','dbaccess']
], function () {

    Route::post('auth/login', 'LoginController@login');
    Route::post('auth/token', 'LoginController@token');

    Route::prefix('referensi')->group(base_path('routes/onedata/referensi.php'));

    Route::group([
        'namespace' => 'Pdrd',
    ], function () {


        Route::prefix('keuangan')->group(function () {
            Route::get('/list_kelasukt', 'KeuanganKelasUktController@list');
            Route::post('/add_kelasukt', 'KeuanganKelasUktController@add');
            Route::put('/update_kelasukt', 'KeuanganKelasUktController@update');
            Route::delete('/delete_kelasukt', 'KeuanganKelasUktController@delete');

            Route::get('/list_uktmhs', 'KeuanganUktMhsController@list');
            Route::post('/add_uktmhs', 'KeuanganUktMhsController@add');
            Route::put('/update_uktmhs', 'KeuanganUktMhsController@update');
            Route::delete('/delete_uktmhs', 'KeuanganUktMhsController@delete');

            Route::get('/list_gajisdm', 'KeuanganGajiSdmController@list');
            Route::post('/add_gajisdm', 'KeuanganGajiSdmController@add');
            Route::put('/update_gajisdm', 'KeuanganGajiSdmController@update');
            Route::delete('/delete_gajisdm', 'KeuanganGajiSdmController@delete');
        });

        Route::prefix('dosen')->group(function () {
            Route::get('/list', 'SdmDosenController@list');
            Route::get('/list_id', 'SdmDosenController@listByIdProdi');
            Route::get('/detail', 'SdmDosenController@detail');
        });

        Route::prefix('tendik')->group(function () {
            Route::get('/list', 'SdmTendikController@list');
            Route::get('/list_id', 'SdmTendikController@listByIdProdi');
            Route::get('/detail', 'SdmTendikController@detail');
        });

        Route::prefix('nonca')->group(function () {
            Route::get('/list', 'NonCaController@list');
            Route::get('/detail', 'NonCaController@detail');
            Route::post('/add', 'NonCaController@add');
            Route::put('/update', 'NonCaController@update');
            Route::delete('/delete', 'NonCaController@delete');
        });

        Route::prefix('buku_ajar')->group(function () {
            Route::get('list', 'BukuAjarController@list');
            Route::get('list_id', 'BukuAjarController@listById');
            Route::get('detail', 'BukuAjarController@detail');
            Route::post('add', 'BukuAjarController@add');
            Route::put('update', 'BukuAjarController@update');
            Route::delete('delete', 'BukuAjarController@delete');
        });

        Route::prefix('buku_referensi')->group(function () {
            Route::get('list', 'BukuReferensiController@list');
            Route::get('list_id', 'BukuReferensiController@listById');
            Route::get('detail', 'BukuReferensiController@detail');
            Route::post('add', 'BukuReferensiController@add');
            Route::put('update', 'BukuReferensiController@update');
            Route::delete('delete', 'BukuReferensiController@delete');
        });

        Route::prefix('penelitian')->group(function () {
            Route::get('list', 'PenelitianController@list');
            Route::get('list_id', 'PenelitianController@listById');
            Route::get('detail/{id}', 'PenelitianController@getDetailPenelitianByPenelitianId');
            Route::post('add', 'PenelitianController@storeNewPenelitian');
            Route::put('update', 'PenelitianController@updatePenelitian');
            Route::delete('delete', 'PenelitianController@deletePenelitian');
        });

        Route::prefix('pengabdian')->group(function () {
            Route::get('list', 'PengabdianController@getAllListPengabdian');
            Route::get('list_id', 'PengabdianController@getListPengabdianBySdmId');
            Route::get('detail/{id}', 'PengabdianController@getDetailPengabdianByPengabdianId');
            Route::post('tambah', 'PengabdianController@storePengabdian');
            Route::put('ubah', 'PengabdianController@updatePengabdian');
            Route::delete('hapus', 'PengabdianController@deletePengabdian');
        });

        Route::prefix('publikasi')->group(function () {
            Route::get('list', 'PublikasiController@getAllListPublikasi');
            Route::get('list_id', 'PublikasiController@getListPublikasiById');
            Route::post('add', 'PublikasiController@storeNewPublikasi');
        });

        Route::prefix('mahasiswa')->group(function () {
            Route::get('list_mahasiswa', 'MahasiswaController@list');
            Route::get('detail', 'MahasiswaController@detail');
            Route::get('list_status', 'MahasiswaController@status');
            Route::get('list_regis', 'MahasiswaController@regis');
            Route::get('smt_keaktifan', 'MahasiswaController@semester_keaktifan');
            Route::get('list_alumni', 'MahasiswaController@alumni');
        });

        Route::prefix('akreditasi_prodi')->group(function () {
            Route::get('list', 'AkreditasiProdiController@index');
        });

        Route::prefix('lembaga')->group(function () {
            Route::get('profilpt/detail', 'LembagaController@detailProfilPt');
            Route::get('akreditasipt', 'LembagaController@listAkreditasiPt');
            Route::get('daftarprodi/detail', 'LembagaController@detailDaftarProdi');
            Route::get('profilprodi/list', 'LembagaController@listProfilProdi');
            Route::get('profilprodi/list_id', 'LembagaController@listProfilProdiById');
            Route::put('profilprodi/ubah', 'LembagaController@update');
            Route::get('daftarsms', 'LembagaController@listSms');
        });
    });

    Route::group([
        'namespace' => 'Tracer',
        'prefix' => 'tracer_study'
    ], function () {
        Route::get('umr_wilayah', 'UmrController@index');
        Route::post('umr_wilayah/tambah', 'UmrController@store');
        Route::put('umr_wilayah/ubah', 'UmrController@update');
        Route::delete('umr_wilayah/hapus', 'UmrController@destroy');

        Route::get('list', 'TracerStudyController@index');
        Route::post('tambah', 'TracerStudyController@store');
        Route::put('ubah', 'TracerStudyController@update');
        Route::delete('hapus', 'TracerStudyController@destroy');
        Route::delete('hapus_atasan', 'TracerStudyController@destroyAtasan');
    });

    Route::group([
        'namespace' => 'Presensi',
        'prefix' => 'presensi'
    ], function () {
        Route::get('list_id', 'KehadiranSdmController@getListKehadiranBySdmId');
        Route::post('tambah', 'KehadiranSdmController@store');
        Route::put('ubah', 'KehadiranSdmController@update');
    });

    Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
        return $request->user();
    });
});
