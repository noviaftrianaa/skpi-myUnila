<?php

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

Route::prefix('tendik')->group(function () {
    Route::get('/', 'TendikController@index')->name('tendik.dashboard');
    Route::get('data-pribadi', 'TendikDataPribadiController@index')->name('tendik.data-pribadi');
    Route::prefix('inpassing')->group(function () {
        Route::get('/', 'TendikInpassingController@index')->name('tendik.inpassing');
        Route::get('add', 'TendikInpassingController@create')->name('tendik.inpassing.add');
    });
    Route::prefix('jabatan-fungsional')->group(function () {
        Route::get('/', 'TendikJabatanFungsionalController@index')->name('tendik.jabatan-fungsional');
        Route::get('add', 'TendikJabatanFungsionalController@create')->name('tendik.jabatan-fungsional.add');
    });
    Route::prefix('kepangkatan')->group(function () {
        Route::get('/', 'TendikKepangakatanController@index')->name('tendik.kepangkatan');
        Route::get('add', 'TendikKepangakatanController@create')->name('tendik.kepangkatan.add');
    });
    Route::prefix('penempatan')->group(function () {
        Route::get('/', 'TendikPenempatanController@index')->name('tendik.penempatan');
        Route::get('add', 'TendikPenempatanController@create')->name('tendik.penempatan.add');
    });
    Route::prefix('pendidikan-formal')->group(function () {
        Route::get('/', 'TendikPendidikanFormalController@index')->name('tendik.pendidikan-formal');
        Route::get('add', 'TendikPendidikanFormalController@create')->name('tendik.pendidikan-formal.add');
    });
    Route::prefix('diklat')->group(function () {
        Route::get('/', 'TendikDiklatController@index')->name('tendik.diklat');
        Route::get('add', 'TendikDiklatController@create')->name('tendik.diklat.add');
    });
    Route::prefix('sertifikasi')->group(function () {
        Route::get('/', 'TendikSertifikasiController@index')->name('tendik.sertifikasi');
        Route::get('add', 'TendikSertifikasiController@create')->name('tendik.sertifikasi.add');
    });
    Route::prefix('tes')->group(function () {
        Route::get('/', 'TendikTesController@index')->name('tendik.tes');
        Route::get('add', 'TendikTesController@create')->name('tendik.tes.add');
    });

    Route::prefix('perencanaan')->group(function () {
        Route::get('/', 'TendikPerencanaanController@index')->name('tendik.perencanaan');
        Route::get('add', 'TendikPerencanaanController@create')->name('tendik.perencanaan.add');
    });
    Route::prefix('pengoprasian')->group(function () {
        Route::get('/', 'TendikPengoprasianController@index')->name('tendik.pengoprasian');
        Route::get('add', 'TendikPengoprasianController@create')->name('tendik.pengoprasian.add');
    });
    Route::prefix('pemeliharaan')->group(function () {
        Route::get('/', 'TendikPemeliharaanController@index')->name('tendik.pemeliharaan');
        Route::get('add', 'TendikPemeliharaanController@create')->name('tendik.pemeliharaan.add');
    });
    Route::prefix('pengevaluasian')->group(function () {
        Route::get('/', 'TendikPengevaluasianController@index')->name('tendik.pengevaluasian');
        Route::get('add', 'TendikPengevaluasianController@create')->name('tendik.pengevaluasian.add');
    });
    Route::prefix('pengembangan')->group(function () {
        Route::get('/', 'TendikPengembanganController@index')->name('tendik.pengembangan');
        Route::get('add', 'TendikPengembanganController@create')->name('tendik.pengembangan.add');
    });
    Route::prefix('karya-tulis')->group(function () {
        Route::get('/', 'TendikKaryaTulisController@index')->name('tendik.karya-tulis');
        Route::get('add', 'TendikKaryaTulisController@create')->name('tendik.karya-tulis.add');
    });
    Route::prefix('penerjemahan')->group(function () {
        Route::get('/', 'TendikPenerjemahanController@index')->name('tendik.penerjemahan');
        Route::get('add', 'TendikPenerjemahanController@create')->name('tendik.penerjemahan.add');
    });
    Route::prefix('pembuat-pedoman')->group(function () {
        Route::get('/', 'TendikPembuatPedomanController@index')->name('tendik.pembuat-pedoman');
        Route::get('add', 'TendikPembuatPedomanController@create')->name('tendik.pembuat-pedoman.add');
    });
    Route::prefix('penemuan-teknologi')->group(function () {
        Route::get('/', 'TendikPenemuanTeknologiController@index')->name('tendik.penemuan-teknologi');
        Route::get('add', 'TendikPenemuanTeknologiController@create')->name('tendik.penemuan-teknologi.add');
    });
    Route::prefix('pengajaran')->group(function () {
        Route::get('/', 'TendikPengajaranController@index')->name('tendik.pengajaran');
        Route::get('add', 'TendikPengajaranController@create')->name('tendik.pengajaran.add');
    });
    Route::prefix('pembimbingan')->group(function () {
        Route::get('/', 'TendikPembimbinganController@index')->name('tendik.pembimbingan');
        Route::get('add', 'TendikPembimbinganController@create')->name('tendik.pembimbingan.add');
    });
    Route::prefix('seminar-loka-karya')->group(function () {
        Route::get('/', 'TendikPembuatPedomanController@index')->name('tendik.seminar-loka-karya');
        Route::get('add', 'TendikPembuatPedomanController@create')->name('tendik.seminar-loka-karya');
    });
    Route::prefix('anggota-profesi')->group(function () {
        Route::get('/', 'TendikAnggotaProfesiController@index')->name('tendik.anggota-profesi');
        Route::get('add', 'TendikAnggotaProfesiController@create')->name('tendik.anggota-profesi.add');
    });
    Route::prefix('tim-penilai')->group(function () {
        Route::get('/', 'TendikTimPenilaiController@index')->name('tendik.tim-penilai');
        Route::get('add', 'TendikTimPenilaiController@create')->name('tendik.tim-penilai.add');
    });
    Route::prefix('penghargaan')->group(function () {
        Route::get('/', 'TendikPenghargaanController@index')->name('tendik.penghargaan');
        Route::get('add', 'TendikPenghargaanController@create')->name('tendik.penghargaan.add');
    });
    Route::prefix('beasiswa')->group(function () {
        Route::get('/', 'TendikBeasiswaController@index')->name('tendik.beasiswa');
        Route::get('add', 'TendikBeasiswaController@create')->name('tendik.beasiswa.add');
    });
    Route::prefix('kesejahtraan')->group(function () {
        Route::get('/', 'TendikKesejahtraanController@index')->name('tendik.kesejahtraan');
        Route::get('add', 'TendikKesejahtraanController@create')->name('tendik.kesejahtraan.add');
    });
    Route::prefix('tunjuangan')->group(function () {
        Route::get('/', 'TendikTunjuanganController@index')->name('tendik.tunjuangan');
        Route::get('add', 'TendikTunjuanganController@create')->name('tendik.tunjuangan.add');
    });
});
