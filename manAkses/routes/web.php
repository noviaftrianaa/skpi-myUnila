<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\{
    LoginController, RegisterController, ForgotPasswordController
};
use App\Http\Controllers\{
    HomeController, UserController, PeranController, UnitOrganisasiController, AplikasiController, TokenController, PJAplikasiController, MenuController, RolePenggunaController, TableAplikasiController, MenuRoleController, AksesWSController
};
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

Route::get('php_info',function () {
    return phpinfo();
});

Route::namespace('Auth')->group(function () {
    Route::get('auth/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('auth/login', [LoginController::class, 'authenticate'])->name('auth.login');
    Route::get('auth/login/sso', [LoginController::class, 'signing_process'])->name('auth.signing_process');
    Route::post('auth/login/captcha', [LoginController::class, 'submitCaptcha'])->name('auth.login.captcha');
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

Route::middleware(['auth:sanctum', 'verified'])->group(function () {

    Route::get('/', [HomeController::class, 'index'])->name('dashboard.index');
    Route::get('/apps/{name}', [HomeController::class, 'searchApps'])->name('dashboard.search_apps');
    Route::put('/changeRole', [UserController::class, 'role'])->name('dashboard.role');
    Route::put('/changePassword', [UserController::class, 'password'])->name('dashboard.password');
    Route::get('/ubah_password', [HomeController::class, 'index_ubah_password'])->name('dashboard.ubah_password');
    Route::get('/biodata', [HomeController::class, 'biodata'])->name('biodata.index');
    Route::get('/riwayat_pendidikan', [HomeController::class, 'riwayat_pendidikan'])->name('dashboard.riwayat_pendidikan');
    Route::get('/menu_refresh', [HomeController::class, 'refresh'])->name('dashboard.refresh');

    Route::get('/otorisasi', function() {
        return view('error.pages');
    });

    Route::group(['middleware' => ['one_data_man_akses']], function() {

        // Route::prefix('manajemen')->name('manajemen.')->group(function() {
        //     Route::namespace('aplikasi')->prefix('aplikasi')->name('aplikasi.')->group(function () {
        //         Route::get('/', [AplikasiController::class, 'index'])->name('index');
        //         Route::get('/detail/{id}', [AplikasiController::class, 'detail'])->name('detail');
        //         Route::get('/table/{id}', [TableAplikasiController::class, 'index'])->name('table');
        //     });
        // });

        // Route::prefix('master')->group(function() {

            Route::namespace('user')->prefix('user')->name('user.')->group(function () {
                Route::get('/', [UserController::class, 'index'])->name('index');
                Route::get('/create', [UserController::class, 'create'])->name('create');
                Route::put('/store', [UserController::class, 'store'])->name('store');
                Route::get('/{id}', [UserController::class, 'detail'])->name('detail');
                Route::patch('/{id}/update', [UserController::class, 'update'])->name('update');
                Route::patch('/{id}/reset', [UserController::class, 'reset'])->name('reset');
                Route::patch('/edit/{id}', [UserController::class, 'edit'])->name('edit');
                Route::delete('/delete/{id}', [UserController::class, 'destroy'])->name('destroy');

                Route::prefix('role')->name('role.')->group(function() {
                    Route::put('/', [RolePenggunaController::class, 'store'])->name('store');
                    Route::patch('/{id}/update', [RolePenggunaController::class, 'update'])->name('update');
                    Route::delete('/{id}/destroy', [RolePenggunaController::class, 'destroy'])->name('destroy');
                });
            });
            Route::namespace('radius')->prefix('radius')->name('radius.')->group(function () {
                Route::get('/', [UserController::class, 'radiusIndex'])->name('index');
            });
            Route::namespace('peran')->prefix('peran')->name('peran.')->group(function () {
                Route::get('/', [PeranController::class, 'index'])->name('index');
                Route::put('/store', [PeranController::class, 'store'])->name('store');
                Route::patch('/{id}/update', [PeranController::class, 'update'])->name('update');
                Route::delete('/{id}/destroy', [PeranController::class, 'destroy'])->name('destroy');
            });
            Route::namespace('unit')->prefix('unit')->name('unit.')->group(function () {
                Route::get('/', [UnitOrganisasiController::class, 'index'])->name('index');
                Route::put('/store', [UnitOrganisasiController::class, 'store'])->name('store');
                Route::patch('/{id}/update', [UnitOrganisasiController::class, 'update'])->name('update');
                Route::delete('/{id}/destroy', [UnitOrganisasiController::class, 'destroy'])->name('destroy');
            });
            Route::namespace('aplikasi')->prefix('aplikasi')->name('aplikasi.')->group(function () {
                Route::get('/', [AplikasiController::class, 'index'])->name('index');
                Route::get('/detail/{id}', [AplikasiController::class, 'detail'])->name('detail');
                Route::get('/create', [AplikasiController::class, 'create'])->name('create');
                Route::put('/store', [AplikasiController::class, 'store'])->name('store');
                Route::get('/edit/{id}', [AplikasiController::class, 'edit'])->name('edit');
                Route::patch('/update/{id}', [AplikasiController::class, 'update'])->name('update');
                Route::get('/create_menu', [AplikasiController::class, 'create_menu'])->name('create_menu');
                Route::get('/pj_aplikasi', [AplikasiController::class, 'pj_aplikasi'])->name('pj_aplikasi');
                Route::put('/store_menu/{id}', [AplikasiController::class, 'store_menu'])->name('store_menu');
                Route::delete('/destroy/{id}', [AplikasiController::class, 'destroy'])->name('destroy');
                Route::get('/{id}/appKeyGenerate', [AplikasiController::class, 'appKeyGenerate'])->name('appKeyGenerate');

                Route::get('/dataPJ/{id}', [AplikasiController::class, 'dataPJ'])->name('dataPJ');
                Route::get('/dataMenu/{id}', [AplikasiController::class, 'dataMenu'])->name('dataMenu');

                Route::prefix('pj_aplikasi')->name('pj_aplikasi.')->group(function() {
                    Route::put('', [PJAplikasiController::class, 'store'])->name('store');
                    Route::patch('update/{id}', [PJAplikasiController::class, 'update'])->name('update');
                    Route::delete('destroy/{id}', [PJAplikasiController::class, 'destroy'])->name('destroy');

                    Route::prefix('akses_ws')->name('akses_ws.')->group(function() {
                        Route::get('/{id}', [AksesWSController::class, 'index'])->name('index');
                        Route::get('/create/{id}', [AksesWSController::class, 'create'])->name('create');
                        Route::get('/edit/{id}', [AksesWSController::class, 'edit'])->name('edit');
                        Route::put('/store/{id}', [AksesWSController::class, 'store'])->name('store');
                        Route::delete('/delete/{id}', [AksesWSController::class, 'delete'])->name('delete');
                        // Route::get('/body/{id}', [AksesWSController::class, 'body'])->name('body');
                        // Route::get('/{id}/terms', [AksesWSController::class, 'terms'])->name('terms');
                    });
                });

                Route::get('/table/{id}', [TableAplikasiController::class, 'index'])->name('table');
                Route::put('/table/{id}/store', [TableAplikasiController::class, 'store'])->name('table.store');
                Route::patch('/table/{id}/update', [TableAplikasiController::class, 'update'])->name('table.update');

                Route::get('/menu_role/{id}', [MenuRoleController::class, 'index'])->name('menu_role');
                Route::get('/menu_role/{id}/tambah', [MenuRoleController::class, 'create'])->name('menu_role.create');
                Route::put('/menu_role/{id}/store', [MenuRoleController::class, 'store'])->name('menu_role.store');
                Route::get('/menu_role/{id}/{mrole}/edit', [MenuRoleController::class, 'edit'])->name('menu_role.edit');
                Route::patch('/menu_role/{id}/{mrole}/update', [MenuRoleController::class, 'update'])->name('menu_role.update');
                Route::get('/menu_role/{id}/{mrole}/destroy', [MenuRoleController::class, 'destroy'])->name('menu_role.destroy');

                Route::prefix('ws')->name('ws.')->group(function() {
                    Route::get('/{id}', [AplikasiController::class, 'ws'])->name('index');
                    Route::get('/data/{id}', [AplikasiController::class, 'wsData'])->name('data');
                    Route::post('/{id}', [AplikasiController::class, 'wsStore'])->name('store');
                    Route::delete('/{id}', [AplikasiController::class, 'wsDelete'])->name('destroy');
                });
            });
            Route::namespace('token')->prefix('token')->name('token.')->group(function () {
                Route::get('/', [TokenController::class, 'index'])->name('index');
                Route::get('/{id}', [TokenController::class, 'detail'])->name('detail');
            });
            Route::prefix('menu')->name('menu.')->group(function() {
                Route::get('', [MenuController::class, 'index'])->name('index');
                Route::get('{id}', [MenuController::class, 'data'])->name('data');
                Route::put('', [MenuController::class, 'store'])->name('store');
                Route::patch('/{id}/update', [MenuController::class, 'update'])->name('update');
                Route::delete('/{id}/destroy', [MenuController::class, 'destroy'])->name('destroy');
            });

        // });
    });
});

Auth::routes();
