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
    'prefix' => '0.1',
    'as' => 'api.',
    'namespace' => 'App\Http\Controllers\PDUT\Api',
    'middleware' => ['auth']
], function () {

    Route::post('auth/login', 'LoginController@login');
    Route::post('auth/token', 'LoginController@token');

    Route::get('referensi/agama', 'ReferensiController@agama');
    Route::get('referensi/bentuk_pendidikan', 'ReferensiController@bentuk_pendidikan');
    Route::get('referensi/bidang_studi', 'ReferensiController@bidang_studi');
    Route::get('referensi/bidang_usaha', 'ReferensiController@bidang_usaha');
    Route::get('referensi/fungsi_lab', 'ReferensiController@fungsi_lab');
    Route::get('referensi/gelar_akademik', 'ReferensiController@gelar_akademik');
    Route::get('referensi/ikatan_kerja_sdm', 'ReferensiController@ikatan_kerja_sdm');
    Route::get('referensi/jabfung', 'ReferensiController@jabfung');
    Route::get('referensi/jab_tgs', 'ReferensiController@jab_tgs');
    Route::get('referensi/jalur_daftar', 'ReferensiController@jalur_daftar');
    Route::get('referensi/jenis_akt_mhs', 'ReferensiController@jenis_akt_mhs');
    Route::get('referensi/jenis_bahan_ajar', 'ReferensiController@jenis_bahan_ajar');
    Route::get('referensi/jenis_beasiswa', 'ReferensiController@jenis_beasiswa');
    Route::get('referensi/jenis_diklat', 'ReferensiController@jenis_diklat');
    Route::get('referensi/jenis_dokumen', 'ReferensiController@jenis_dokumen');
    Route::get('referensi/jenis_evaluasi', 'ReferensiController@jenis_evaluasi');
    Route::get('referensi/jenis_hapus_buku', 'ReferensiController@jenis_hapus_buku');
    Route::get('referensi/jenis_keluar', 'ReferensiController@jenis_keluar');
    Route::get('referensi/jenis_kepanitiaan', 'ReferensiController@jenis_kepanitiaan');
    Route::get('referensi/jenis_kesejahteraan', 'ReferensiController@jenis_kesejahteraan');
    Route::get('referensi/jenis_keuangan', 'ReferensiController@jenis_keuangan');
    Route::get('referensi/jenis_lembaga', 'ReferensiController@jenis_lembaga');
    Route::get('referensi/jenis_media_pub', 'ReferensiController@jenis_media_pub');
    Route::get('referensi/jenis_pendaftaran', 'ReferensiController@jenis_pendaftaran');
    Route::get('referensi/jenis_penelitian', 'ReferensiController@jenis_penelitian');
    Route::get('referensi/jenis_penghargaan', 'ReferensiController@jenis_penghargaan');
    Route::get('referensi/jenis_prasarana', 'ReferensiController@jenis_prasarana');
    Route::get('referensi/jenis_prestasi', 'ReferensiController@jenis_prestasi');
    Route::get('referensi/jenis_publikasi', 'ReferensiController@jenis_publikasi');
    Route::get('referensi/jenis_sarana', 'ReferensiController@jenis_sarana');
    Route::get('referensi/jenis_sdm', 'ReferensiController@jenis_sdm');
    Route::get('referensi/jenis_sert', 'ReferensiController@jenis_sert');
    Route::get('referensi/jenis_sms', 'ReferensiController@jenis_sms');
    Route::get('referensi/jenis_subst', 'ReferensiController@jenis_subst');
    Route::get('referensi/jenis_tes', 'ReferensiController@jenis_tes');
    Route::get('referensi/jenis_tinggal', 'ReferensiController@jenis_tinggal');
    Route::get('referensi/jenis_tunjangan', 'ReferensiController@jenis_tunjangan');
    Route::get('referensi/jenjang_pendidikan', 'ReferensiController@jenjang_pendidikan');
    Route::get('referensi/jurusan', 'ReferensiController@jurusan');
    Route::get('referensi/kategori_capaian_iuran', 'ReferensiController@kategori_capaian_iuran');
    Route::get('referensi/kategori_kegiatan', 'ReferensiController@kategori_kegiatan');
    Route::get('referensi/kbli', 'ReferensiController@kbli');
    Route::get('referensi/keahlian_lab', 'ReferensiController@keahlian_lab');
    Route::get('referensi/kebutuhan_khusus', 'ReferensiController@kebutuhan_khusus');
    Route::get('referensi/kelompok_bidang', 'ReferensiController@kelompok_bidang');
    Route::get('referensi/kelompok_profesi', 'ReferensiController@kelompok_profesi');
    Route::get('referensi/kelompok_usaha', 'ReferensiController@kelompok_usaha');
    Route::get('referensi/lembaga_akred', 'ReferensiController@lembaga_akred');
    Route::get('referensi/lembaga_pengangkat', 'ReferensiController@lembaga_pengangkat');
    Route::get('referensi/level_wilayah', 'ReferensiController@level_wilayah');
    Route::get('referensi/media_publikasi', 'ReferensiController@media_publikasi');
    Route::get('referensi/negara', 'ReferensiController@negara');
    Route::get('referensi/nilai_akred', 'ReferensiController@nilai_akred');
    Route::get('referensi/pangkat_golongan', 'ReferensiController@pangkat_golongan');
    Route::get('referensi/pekerjaan', 'ReferensiController@pekerjaan');
    Route::get('referensi/pembiayaan', 'ReferensiController@pembiayaan');
    Route::get('referensi/penghasilan', 'ReferensiController@penghasilan');
    Route::get('referensi/satuan', 'ReferensiController@satuan');
    Route::get('referensi/semester', 'ReferensiController@semester');
    Route::get('referensi/skim_kegiatan', 'ReferensiController@skim_kegiatan');
    Route::get('referensi/status_anak', 'ReferensiController@status_anak');
    Route::get('referensi/status_keaktifan_pegawai', 'ReferensiController@status_keaktifan_pegawai');
    Route::get('referensi/status_kepemilikan', 'ReferensiController@status_kepemilikan');
    Route::get('referensi/status_mahasiswa', 'ReferensiController@status_mahasiswa');
    Route::get('referensi/status_milik_sarpas', 'ReferensiController@status_milik_sarpas');
    Route::get('referensi/sumber_dana', 'ReferensiController@sumber_dana');
    Route::get('referensi/tahun_ajaran', 'ReferensiController@tahun_ajaran');
    Route::get('referensi/tahun_anggaran', 'ReferensiController@tahun_anggaran');
    Route::get('referensi/tingkat_penghargaan', 'ReferensiController@tingkat_penghargaan');
    Route::get('referensi/tingkat_prestasi', 'ReferensiController@tingkat_prestasi');
    Route::get('referensi/tse', 'ReferensiController@tse');
    Route::get('referensi/wilayah', 'ReferensiController@wilayah');

    Route::group([
        'namespace' => 'Pdrd',
    ], function () {

        Route::prefix('dosen')->group(function () {
            Route::get('/list', 'SdmDosenController@list');
            Route::get('/detail', 'SdmDosenController@detail');
        });

        Route::prefix('tendik')->group(function () {
            Route::get('/list', 'SdmTendikController@list');
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
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
