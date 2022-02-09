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
            Route::get('/kelasukt/daftar', 'KeuanganKelasUktController@daftar');
            Route::post('/kelasukt/tambah', 'KeuanganKelasUktController@tambah');
            Route::put('/kelasukt/ubah', 'KeuanganKelasUktController@ubah');
            Route::delete('/kelasukt/hapus', 'KeuanganKelasUktController@hapus');

            Route::get('/uktmhs/daftar', 'KeuanganUktMhsController@daftar');
            Route::get('/uktmhs/daftar_id', 'KeuanganUktMhsController@daftar_id');
            Route::post('/uktmhs/tambah', 'KeuanganUktMhsController@tambah');
            Route::put('/uktmhs/ubah', 'KeuanganUktMhsController@ubah');
            Route::delete('/uktmhs/hapus', 'KeuanganUktMhsController@hapus');

            Route::get('/gajisdm/daftar', 'KeuanganGajiSdmController@daftar');
            Route::post('/gajisdm/tambah', 'KeuanganGajiSdmController@tambah');
            Route::put('/gajisdm/ubah', 'KeuanganGajiSdmController@ubah');
            Route::delete('/gajisdm/hapus', 'KeuanganGajiSdmController@hapus');
        });

        Route::prefix('sdm')->group(function () {
            Route::get('dosen/daftar', 'SdmDosenController@daftar');
            Route::get('dosen/daftar_id', 'SdmDosenController@daftar_id');
            Route::get('dosen/detail', 'SdmDosenController@detail');

            Route::get('tendik/daftar', 'SdmTendikController@daftar');
            Route::get('tendik/daftar_id', 'SdmTendikController@daftar_id');
            Route::get('tendik/detail', 'SdmTendikController@detail');

            Route::get('nonca/daftar', 'NonCaController@daftar');
            Route::get('nonca/detail', 'NonCaController@detail');
            Route::post('nonca/tambah', 'NonCaController@tambah');
            Route::put('nonca/ubah', 'NonCaController@ubah');
            Route::delete('nonca/hapus', 'NonCaController@hapus');
        });

        Route::prefix('buku')->group(function () {
            Route::get('ajar/daftar', 'BukuAjarController@daftar');
            Route::get('ajar/daftar_id', 'BukuAjarController@listById');
            Route::get('ajar/detail', 'BukuAjarController@detail');
            Route::post('ajar/tambah', 'BukuAjarController@tambah');
            Route::put('ajar/ubah', 'BukuAjarController@ubah');
            Route::delete('ajar/hapus', 'BukuAjarController@hapus');

            Route::get('referensi/daftar', 'BukuReferensiController@daftar');
            Route::get('referensi/daftar_id', 'BukuReferensiController@daftar_id');
            Route::get('referensi/detail', 'BukuReferensiController@detail');
            Route::post('referensi/tambah', 'BukuReferensiController@tambah');
            Route::put('referensi/ubah', 'BukuReferensiController@ubah');
            Route::delete('referensi/hapus', 'BukuReferensiController@hapus');
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
            Route::get('akreditasi_pt', 'LembagaController@listAkreditasiPt');
            Route::get('daftar_prodi/detail', 'LembagaController@detailDaftarProdi');
            Route::get('profil_prodi/list', 'LembagaController@listProfilProdi');
            Route::get('profil_prodi/list_id', 'LembagaController@listProfilProdiById');
            Route::put('profil_prodi/ubah', 'LembagaController@update');
            Route::get('daftar_sms', 'LembagaController@listSms');
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
