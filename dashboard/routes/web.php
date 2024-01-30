<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\language\LanguageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\authentications\LoginBasic;
use App\Http\Controllers\authentications\RegisterBasic;
//MAIN
use App\Http\Controllers\Main\DashboardController as MainDashboardController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// locale
Route::get('lang/{locale}', [LanguageController::class, 'swap'])->name('swap_language');

// Dashboard Public
Route::get('/', [DashboardController::class, 'index'])->name('pages-home');
Route::get('/times_higher_education_ranking', [DashboardController::class, 'times_higher_education_ranking'])->name('pages-times-higher-education-ranking');
Route::get('/qs_world_university_ranking', [DashboardController::class, 'qs_world_university_ranking'])->name('pages-qs-world-university-ranking');
Route::get('/green_metric_ranking', [DashboardController::class, 'green_metric_ranking'])->name('pages-green-metric-ranking');
Route::get('/webometrics_ranking', [DashboardController::class, 'webometrics_ranking'])->name('pages-webometrics-ranking');

//Auth
Route::get('/auth/login', [LoginBasic::class, 'index'])->name('auth-login');
Route::get('/auth/sso', [LoginBasic::class, 'sso'])->name('auth-sso');
Route::post('/auth/captcha', [LoginBasic::class, 'captcha'])->name('auth-captcha');
Route::post('auth/logout', [LoginBasic::class, 'logout'])->name('auth-logout');

//Auth Success
Route::prefix('main')->group(function () {
    Route::get('/', [MainDashboardController::class, 'index'])->name('main-index');
});
