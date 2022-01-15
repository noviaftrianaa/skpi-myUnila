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
    // 'middleware' => ['auth.api']
], function () {
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
        'prefix' => 'pdrd'
    ], function () {
        Route::prefix('buku')->group(function() {
            Route::prefix('ajar')->group(function() {
                Route::get('list','BukuAjarController@list');
                Route::get('list_id','BukuAjarController@listById');
                Route::get('detail','BukuAjarController@detail');
                Route::post('add','BukuAjarController@add');
                Route::put('update','BukuAjarController@update');
                Route::delete('delete','BukuAjarController@delete');
            });

            Route::prefix('referensi')->group(function() {
                // Buku Referesensi
            });
        });

        Route::prefix('penelitian')->group(function () {
            Route::get('/', 'PenelitianController@getAllListPenelitian');
            Route::get('list/by', 'PenelitianController@getListPenelitianBySdmId');
            Route::get('detail/by', 'PenelitianController@getDetailPenelitianByPenelitianId');
        });

        Route::prefix('pengabdian')->group(function() {
            // Pengabdian
        });

        Route::prefix('mahasiswa')->group(function () {
            Route::get('list_mahasiswa', 'MahasiswaController@list');
            Route::get('detail', 'MahasiswaController@detail');
            Route::get('list_status', 'MahasiswaController@status');
            Route::get('list_regis', 'MahasiswaController@regis');
            Route::get('smt_keaktifan', 'MahasiswaController@semester_keaktifan');
        });
    });

    Route::group([
        'namespace' => 'Tracer',
        'prefix' => 'tracer'
    ], function () {
        Route::get('hasil_tracer_study', 'TracerStudyController@index');
        Route::post('hasil_tracer_study/simpan', 'TracerStudyController@store');
    });

});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
