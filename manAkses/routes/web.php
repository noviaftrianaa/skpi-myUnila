<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\{
    LoginController, RegisterController, ForgotPasswordController
};
use App\Http\Controllers\{
    HomeController, UserController, PeranController, UnitOrganisasiController, AplikasiController, TokenController, PJAplikasiController, MenuController, RolePenggunaController, TableAplikasiController, PengaturanTableAplikasiController
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
    
    Route::get('/otorisasi', function() {
        return view('error.pages');
    });

    Route::group(['middleware' => ['admin']], function() {

        Route::get('/', [HomeController::class, 'index'])->name('index');
        
        Route::namespace('user')->prefix('user')->name('user.')->group(function () {
            Route::get('/', [UserController::class, 'index'])->name('index');
            Route::get('/create', [UserController::class, 'create'])->name('create');
            Route::put('/store', [UserController::class, 'store'])->name('store');
            Route::get('/{id}', [UserController::class, 'detail'])->name('detail');
            Route::patch('/{id}/update', [UserController::class, 'update'])->name('update');
            Route::patch('/{id}/reset', [UserController::class, 'reset'])->name('reset');
            Route::put('/role', [UserController::class, 'role'])->name('role');
            Route::put('/password', [UserController::class, 'password'])->name('password');
            Route::patch('/edit/{id}', [UserController::class, 'edit'])->name('edit');
            Route::delete('/delete/{id}', [UserController::class, 'destroy'])->name('destroy');
        });
        Route::prefix('role')->name('role.')->group(function() {
            Route::put('/', [RolePenggunaController::class, 'store'])->name('store');
            Route::patch('/{id}/update', [RolePenggunaController::class, 'update'])->name('update');
            Route::delete('/{id}/destroy', [RolePenggunaController::class, 'destroy'])->name('destroy');
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
            Route::get('/{id}', [AplikasiController::class, 'detail'])->name('detail');
            Route::get('/create', [AplikasiController::class, 'create'])->name('create');
            Route::put('/store', [AplikasiController::class, 'store'])->name('store');
            Route::get('/edit/{id}', [AplikasiController::class, 'edit'])->name('edit');
            Route::patch('/update/{id}', [AplikasiController::class, 'update'])->name('update');
            Route::get('/create_menu', [AplikasiController::class, 'create_menu'])->name('create_menu');
            Route::get('/pj_aplikasi', [AplikasiController::class, 'pj_aplikasi'])->name('pj_aplikasi');
            Route::put('/store_menu/{id}', [AplikasiController::class, 'store_menu'])->name('store_menu');
            Route::delete('/destroy/{id}', [AplikasiController::class, 'destroy'])->name('destroy');

            Route::get('/table/{id}', [TableAplikasiController::class, 'index'])->name('table');
            Route::put('/table/{id}/store', [TableAplikasiController::class, 'store'])->name('table.store');
            Route::patch('/table/{id}/update', [TableAplikasiController::class, 'update'])->name('table.update');
        });
        Route::namespace('token')->prefix('token')->name('token.')->group(function () {
            Route::get('/', [TokenController::class, 'index'])->name('index');
            Route::get('/{id}', [TokenController::class, 'detail'])->name('detail');
        });
        Route::prefix('pj_aplikasi')->name('pj_aplikasi.')->group(function() {
            Route::put('/', [PJAplikasiController::class, 'store'])->name('store');
            Route::patch('/{id}/update', [PJAplikasiController::class, 'update'])->name('update');
            Route::delete('/{id}/destroy', [PJAplikasiController::class, 'destroy'])->name('destroy');
        });
        Route::prefix('menu')->name('menu.')->group(function() {
            Route::put('/', [MenuController::class, 'store'])->name('store');
            Route::patch('/{id}/update', [MenuController::class, 'update'])->name('update');
            Route::delete('/{id}/destroy', [MenuController::class, 'destroy'])->name('destroy');
        });
    });
});

Auth::routes();