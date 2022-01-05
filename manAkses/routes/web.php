<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\{
    LoginController, RegisterController, ForgotPasswordController
};
use App\Http\Controllers\{
    HomeController, UserController
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

    Route::get('/', [HomeController::class, 'index'])->name('index');

    Route::namespace('user')->prefix('user')->name('user.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::put('/store', [UserController::class, 'store'])->name('store');
        Route::patch('/{id}/update', [UserController::class, 'update'])->name('update');
        Route::patch('/{id}/reset', [UserController::class, 'reset'])->name('reset');
    });
	
});

Auth::routes();