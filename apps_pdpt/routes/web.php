<?php

use App\Http\Controllers\Auth\{
    LoginController,
    RegisterController,
    ForgotPasswordController
};

use App\Http\Controllers\AkreditasController;
use App\Http\Controllers\Dashboard\WR\WakilRektor3\AktivitasMahasiswaController;
use App\Http\Controllers\Dashboard\WR\WakilRektor3\TracerStudyController;
use App\Http\Controllers\Dashboard\WR\WakilRektor4\KerjasamaController;
use App\Http\Controllers\Dashboard\WR\WakilRektor4\PengelolaanTikController;
use App\Http\Controllers\ListDaftarDosenController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RenstraController;
use App\Http\Controllers\PDUT\Dashboard\JabfungController;
use App\Http\Controllers\PDUT\Dashboard\JenjangPendidikan;
use App\Http\Controllers\PDUT\Dashboard\PangkatGolonganController;
use App\Http\Controllers\PDUT\Dashboard\IkatanKerjaController;
use App\Http\Controllers\PDUT\Dashboard\JenisKelaminController;
use App\Http\Controllers\PDUT\Dashboard\StatusKeaktifanController;
use App\Http\Controllers\PDUT\Dashboard\StatusKepegawaianController;

use Illuminate\Support\Facades\Route;

/** Auth */
Route::namespace('Auth')->group(function () {
    Route::get('auth/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('auth/login', [LoginController::class, 'authenticate'])->name('auth.login');
    Route::get('auth/login/sso', [LoginController::class, 'signing_process'])->name('auth.signing_process');
    Route::get('auth/logout', [LoginController::class, 'logout'])->name('auth.logout');
    Route::get('auth/register', [RegisterController::class, 'index'])->name('auth.register');
    Route::post('auth/register', [RegisterController::class, 'create'])->name('auth.do_register');
    Route::get('auth/aktivasi/{id}', [RegisterController::class, 'show'])->name('auth.aktivasi');
    Route::post('auth/aktivasi/{id}', [RegisterController::class, 'active'])->name('auth.do_aktivasi');
    Route::get('auth/forgot_password', [ForgotPasswordController::class, 'index'])->name('auth.forgot_password');
    Route::post('auth/forgot_password', [ForgotPasswordController::class, 'create'])->name('auth.do_forgot_password');
    Route::get('auth/forgot_password/aktivasi/{id}', [ForgotPasswordController::class, 'show'])->name('auth.forgot_password.aktivasi');
    Route::post('auth/forgot_password/aktivasi/{id}', [ForgotPasswordController::class, 'active'])->name('auth.forgot_password.do_aktivasi');
});
/** End Auth */

Route::get('/',  [DashboardController::class, 'index'])->name('home');
Route::put('/changeRole', [DashboardController::class, 'role'])->name('role');
Route::get('/refresh_menu', function() { MenuRole(); return redirect()->back(); });

/** Dashboard Mahasiswa */
Route::get('/dashboard/mahasiswa',  [DashboardController::class, 'mahasiswa'])->name('dashboard.mahasiswa');
Route::get('/dashboard/tracer_study',  [DashboardController::class, 'tracer_study'])->name('dashboard.tracer_study');
Route::get('/dashboard/kampus_merdeka',  [DashboardController::class, 'kampus_merdeka'])->name('dashboard.kampus_merdeka');
/** End Dashboard Mahasiswa */

/** Dashboard Dosen */
Route::get('/dashboard/dosen',  [DashboardController::class, 'dosen'])->name('dashboard.dosen');
Route::get('/dashboard/list_daftar_dosen',  [DashboardController::class, 'list_daftar_dosen_blm_s2'])->name('dashboard.list_daftar_dosen');
Route::get('/dashboard/list_daftar_dosen_s2_masa_kerja',  [DashboardController::class, 'list_daftar_dosen_s2_masa_kerja'])->name('dashboard.list_daftar_dosen_s2_masa_kerja');
Route::get('/dashboard/list_daftar_dosen_tanpa_jabfung',  [DashboardController::class, 'list_daftar_dosen_tanpa_jabfung'])->name('dashboard.list_daftar_dosen_tanpa_jabfung');
Route::get('/dashboard/list_daftar_dosen_masa_jabfung',  [DashboardController::class, 'list_daftar_dosen_masa_jabfung'])->name('dashboard.list_daftar_dosen_masa_jabfung');
Route::get('/dashboard/dosen/profil/{id}',  [DashboardController::class, 'dosen_profil'])->name('dashboard.dosen.profil');
Route::get('/dashboard/jabfung_dosen',  [JabfungController::class, 'index'])->name('dashboard.jabfung');
Route::post('/dashboard/jabfung_dosen',  [JabfungController::class, 'chart'])->name('dashboard.jabfung.chart');
Route::get('/dashboard/jabfung_dosen/load',  [JabfungController::class, 'load'])->name('dashboard.jabfung.load');
Route::post('/dashboard/jabfung_dosen/reload',  [JabfungController::class, 'reload'])->name('dashboard.jabfung.reload');
Route::get('/dashboard/jenjang_pendidikan',  [JenjangPendidikan::class, 'index'])->name('dashboard.jenj_didik');
Route::post('/dashboard/jenjang_pendidikan',  [JenjangPendidikan::class, 'chart'])->name('dashboard.jenj_didik.chart');
Route::get('/dashboard/jenjang_pendidikan/load',  [JenjangPendidikan::class, 'load'])->name('dashboard.jenj_didik.load');
Route::post('/dashboard/jenjang_pendidikan/reload',  [JenjangPendidikan::class, 'reload'])->name('dashboard.jenj_didik.reload');
Route::get('/dashboard/pangkat_golongan',  [PangkatGolonganController::class, 'index'])->name('dashboard.pangkat_golongan');
Route::post('/dashboard/pangkat_golongan',  [PangkatGolonganController::class, 'chart'])->name('dashboard.pangkat_golongan.chart');
Route::get('/dashboard/pangkat_golongan/load',  [PangkatGolonganController::class, 'load'])->name('dashboard.pangkat_golongan.load');
Route::post('/dashboard/pangkat_golongan/reload',  [PangkatGolonganController::class, 'reload'])->name('dashboard.pangkat_golongan.reload');
Route::get('/dashboard/ikatan_kerja',  [IkatanKerjaController::class, 'index'])->name('dashboard.ikatan_kerja');
Route::post('/dashboard/ikatan_kerja',  [IkatanKerjaController::class, 'chart'])->name('dashboard.ikatan_kerja.chart');
Route::get('/dashboard/ikatan_kerja/load',  [IkatanKerjaController::class, 'load'])->name('dashboard.ikatan_kerja.load');
Route::post('/dashboard/ikatan_kerja/reload',  [IkatanKerjaController::class, 'reload'])->name('dashboard.ikatan_kerja.reload');
Route::get('/dashboard/status_keaktifan',  [StatusKeaktifanController::class, 'index'])->name('dashboard.status_keaktifan');
Route::post('/dashboard/status_keaktifan',  [StatusKeaktifanController::class, 'chart'])->name('dashboard.status_keaktifan.chart');
Route::get('/dashboard/status_keaktifan/load',  [StatusKeaktifanController::class, 'load'])->name('dashboard.status_keaktifan.load');
Route::post('/dashboard/status_keaktifan/reload',  [StatusKeaktifanController::class, 'reload'])->name('dashboard.status_keaktifan.reload');
Route::get('/dashboard/status_kepegawaian',  [StatusKepegawaianController::class, 'index'])->name('dashboard.status_kepegawaian');
Route::post('/dashboard/status_kepegawaian',  [StatusKepegawaianController::class, 'chart'])->name('dashboard.status_kepegawaian.chart');
Route::get('/dashboard/status_kepegawaian/load',  [StatusKepegawaianController::class, 'load'])->name('dashboard.status_kepegawaian.load');
Route::post('/dashboard/status_kepegawaian/reload',  [StatusKepegawaianController::class, 'reload'])->name('dashboard.status_kepegawaian.reload');
Route::get('/dashboard/jenis_kelamin',  [JenisKelaminController::class, 'index'])->name('dashboard.jenis_kelamin');
Route::post('/dashboard/jenis_kelamin',  [JenisKelaminController::class, 'chart'])->name('dashboard.jenis_kelamin.chart');
Route::get('/dashboard/jenis_kelamin/load',  [JenisKelaminController::class, 'load'])->name('dashboard.jenis_kelamin.load');
Route::post('/dashboard/jenis_kelamin/reload',  [JenisKelaminController::class, 'reload'])->name('dashboard.jenis_kelamin.reload');

/** End Dashboar Dosen */
Route::get('/iku',  [DashboardController::class, 'iku'])->name('iku');
//Route::get('/akreditasi_pt',  [AkreditasController::class, 'index_pt'])->name('akreditasi_pt');
Route::get('/akreditasi_prodi',  [AkreditasController::class, 'index'])->name('akreditasi_prodi');
Route::get('/akreditasi_prodi/{id_prodi}',  [AkreditasController::class, 'show'])->name('akreditasi_prodi.detail_prodi');
// Route::prefix('akreditasi')->group(function () {
//     Route::get('/',  [AkreditasController::class, 'akreditasi'])->name('akreditasi');
//     Route::get('/{id_prodi}/detail',  [AkreditasController::class, 'detail_akreditasi_prodi'])->name('detail_akreditasi');
/** End Dashboard Dosen */

/** Dashboard Institusi */
Route::get('/dashboard/iku',  [DashboardController::class, 'iku'])->name('dashboard.iku');
Route::get('/dashboard/university_rank',  [DashboardController::class, 'university_rank'])->name('dashboard.university_rank');
/** End Dashboard Institusi */





// Route::prefix('akreditasi')->group(function () {
//     Route::get('/',  [AkreditasController::class, 'akreditasi'])->name('akreditasi');
//     Route::get('/{id_prodi}/detail',  [AkreditasController::class, 'detail_akreditasi_prodi'])->name('detail_akreditasi');
//     Route::prefix('lkps')->group(function () {
//         Route::prefix('kerjasama')->group(function () {
//             Route::get('/{jenis_kerjasama}', [AkreditasController::class, 'kerjasama'])->name('kerjasama');
//         });
//         Route::prefix('mahasiswa')->group(function () {
//             Route::get('seleksi_mahasiswa', [AkreditasController::class, 'seleksi_mahasiswa'])->name('seleksi_mahasiswa');
//             Route::get('mahasiswa_asing', [AkreditasController::class, 'mahasiswa_asing'])->name('mahasiswa_asing');
//         });
//         Route::prefix('profil_dosen')->group(function () {
//             Route::get('dosen_tetap', [AkreditasController::class, 'dosen_tetap'])->name('dosen_tetap');
//             Route::get('dosen_pembimbing_utama', [AkreditasController::class, 'dosen_pembimbing_utama_tugas_akhir'])->name('dosen_pembimbing_utama');
//             Route::get('eewmp_dosen_tetap', [AkreditasController::class, 'eewmp_dosen_tetap'])->name('eewmp_dosen_tetap');
//             Route::get('dosen_tidak_tetap', [AkreditasController::class, 'dosen_tidak_tetap'])->name('dosen_tidak_tetap');
//             Route::get('dosen_praktisi_industri', [AkreditasController::class, 'dosen_praktisi_industri'])->name('dosen_praktisi_industri');
//         });
//         Route::prefix('kinerja_dosen')->group(function () {
//             Route::get('dosen_tetap', [AkreditasController::class, 'rekognisi_dtps'])->name('rekognisi_dtps');
//             Route::get('penelitian_dtps', [AkreditasController::class, 'penelitian_dtps'])->name('penelitian_dtps');
//             Route::get('pkm_dtps', [AkreditasController::class, 'pkm_dtps'])->name('pkm_dtps');
//             Route::get('publikasi_dtps', [AkreditasController::class, 'publikasi_dtps'])->name('publikasi_dtps');
//             Route::get('karya_ilmiah_disitasi', [AkreditasController::class, 'karya_ilmiah_disitasi'])->name('karya_ilmiah_disitasi');
//             Route::get('luaran_penelitian_pkm_dtps', [AkreditasController::class, 'luaran_penelitian_pkm_dtps'])->name('luaran_penelitian_pkm_dtps');
//         });
//     });
// });

Route::prefix('dashboard')->group(function () {
    Route::get('iku1',  'App\Http\Controllers\Dashboard\IKU\Iku1Controller@homeIku1')->name('dashboardIku1');
    Route::get('api/iku1',  'App\Http\Controllers\Dashboard\IKU\Iku1Controller@apiIku1')->name('apiDashboardIku1');
    Route::get('api/iku1/alumni',  'App\Http\Controllers\Dashboard\IKU\Iku1Controller@apiIku1Alumni')->name('apiIku1Alumni');
    Route::get('api/iku1/bekerja',  'App\Http\Controllers\Dashboard\IKU\Iku1Controller@apiIku1Bekerja')->name('apiIku1Bekerja');
    Route::get('api/iku1/lanjut-studi',  'App\Http\Controllers\Dashboard\IKU\Iku1Controller@apiIku1LanjutStudi')->name('apiIku1LanjutStudi');

    Route::get('iku2',  'App\Http\Controllers\Dashboard\IKU\Iku2Controller@homeIku2')->name('dashboardIku2');
    Route::get('api/iku2',  'App\Http\Controllers\Dashboard\IKU\Iku2Controller@apiIku2')->name('apiDashboardIku2');

    Route::get('iku3',  'App\Http\Controllers\Dashboard\IKU\Iku3Controller@homeIku3')->name('dashboardIku3');
    Route::get('api/iku3',  'App\Http\Controllers\Dashboard\IKU\Iku3Controller@apiIku3')->name('apiDashboardIku3');
    Route::get('api/iku3/dosen',  'App\Http\Controllers\Dashboard\IKU\Iku3Controller@apiIku3Dosen')->name('apiIku3Dosen');
    Route::get('api/iku3/tridharma',  'App\Http\Controllers\Dashboard\IKU\Iku3Controller@apiIku3Tridharma')->name('apiIku3Tridharma');
    Route::get('api/iku3/qs100',  'App\Http\Controllers\Dashboard\IKU\Iku3Controller@apiIku3Qs100')->name('apiIku3Qs100');
    Route::get('api/iku3/praktisi',  'App\Http\Controllers\Dashboard\IKU\Iku3Controller@apiIku3Praktisi')->name('apiIku3Praktisi');
    Route::get('api/iku3/prestasi',  'App\Http\Controllers\Dashboard\IKU\Iku3Controller@apiIku3Prestasi')->name('apiIku3Prestasi');

    Route::get('iku4',  'App\Http\Controllers\Dashboard\IKU\Iku4Controller@homeIku4')->name('dashboardIku4');
    Route::get('api/iku4',  'App\Http\Controllers\Dashboard\IKU\Iku4Controller@apiIku4')->name('apiDashboardIku4');
    Route::get('api/iku4/dosen',  'App\Http\Controllers\Dashboard\IKU\Iku4Controller@apiIku4Dosen')->name('apiIku4Dosen');
    Route::get('api/iku4/pendidikan',  'App\Http\Controllers\Dashboard\IKU\Iku4Controller@apiIku4Pendidikan')->name('apiIku4Pendidikan');
    Route::get('api/iku4/sertifikasi',  'App\Http\Controllers\Dashboard\IKU\Iku4Controller@apiIku4Sertifikasi')->name('apiIku4Sertifikasi');
    Route::get('api/iku4/praktisi',  'App\Http\Controllers\Dashboard\IKU\Iku4Controller@apiIku4Praktisi')->name('apiIku4Praktisi');

    Route::get('iku5',  'App\Http\Controllers\Dashboard\IKU\Iku5Controller@homeIku5')->name('dashboardIku5');
    Route::get('api/iku5',  'App\Http\Controllers\Dashboard\IKU\Iku5Controller@apiIku5')->name('apiDashboardIku5');
    Route::get('api/iku5/dosen',  'App\Http\Controllers\Dashboard\IKU\Iku5Controller@apiIku5Dosen')->name('apiIku5Dosen');
    Route::get('api/iku5/keluaranpenelitian',  'App\Http\Controllers\Dashboard\IKU\Iku5Controller@apiIku5KeluaranPenelitian')->name('apiIku5KeluaranPenelitian');

    Route::get('iku6',  'App\Http\Controllers\Dashboard\IKU\Iku6Controller@homeIku6')->name('dashboardIku6');
    Route::get('api/iku6',  'App\Http\Controllers\Dashboard\IKU\Iku6Controller@apiIku6')->name('apiDashboardIku6');
    Route::get('api/iku6/kerjasama',  'App\Http\Controllers\Dashboard\IKU\Iku6Controller@apiIku6Kerjasama')->name('apiIku6Kerjasama');

    Route::get('iku7',  'App\Http\Controllers\Dashboard\IKU\Iku7Controller@homeIku7')->name('dashboardIku7');
    Route::get('api/iku7',  'App\Http\Controllers\Dashboard\IKU\Iku7Controller@apiIku7')->name('apiDashboardIku7');
    Route::get('api/iku7/matkul',  'App\Http\Controllers\Dashboard\IKU\Iku7Controller@apiIku7Matkul')->name('apiIku7Matkul');
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/home',  [DashboardController::class, 'index']);
    Route::prefix('profil_pt')->name('profil_pt.')->group(function() {
        Route::get('direktori_pt', 'App\Http\Controllers\ProfilPT\DirektoriPTController@index')->name('direktori_pt');
        Route::get('direktori_pt/data', 'App\Http\Controllers\ProfilPT\DirektoriPTController@data')->name('direktori_pt.data');
        Route::get('direktori_pt/data/detail', 'App\Http\Controllers\ProfilPT\DirektoriPTController@dataDetail')->name('direktori_pt.data.detail');
    });

    /** Dashboard Wakil Rektor III */
    Route::get('/aktivitas_mahasiswa',  [AktivitasMahasiswaController::class, 'index'])->name('aktivitas_mahasiswa');
    Route::post('/aktivitas_mahasiswa',  [AktivitasMahasiswaController::class, 'chart'])->name('aktivitas_mahasiswa.chart');
    Route::get('/aktivitas_mahasiswa/load',  [AktivitasMahasiswaController::class, 'load'])->name('aktivitas_mahasiswa.load');
    Route::post('/aktivitas_mahasiswa/reload',  [AktivitasMahasiswaController::class, 'reload'])->name('aktivitas_mahasiswa.reload');
    Route::get('/mahasiswa/profil/{id}',  [AktivitasMahasiswaController::class, 'mahasiswa_profil'])->name('mahasiswa.profil');
    Route::get('/tracer_study',  [TracerStudyController::class, 'alumni'])->name('tracer_study');
    /** End Dashboard Wakil Rektor III */

    /** Dashboard Wakil Rektor IV */
    Route::get('/dashboard/kerjasama',  [KerjasamaController::class, 'kerjasama'])->name('kerjasama');
    Route::get('/dashboard/aplikasi',  [PengelolaanTikController::class, 'daftar_aplikasi'])->name('aplikasi');
    /** End Dashboard Wakil Rektor IV */



});

Auth::routes();
