<?php

use App\Repositories\PdutRepository;
use Illuminate\Support\Facades\Route;
use App\Services\PdutService;
use App\Http\Controllers\Mahasiswa\DashboardController;

Route::get('/dashboard', [DashboardController::class, 'index']);

Route::get('/test-mahasiswa', function (PdutRepository $pdut) {

    return response()->json(
        $pdut->getMahasiswaByNim('2217031142')
    );

});
Route::get('/test-search', function (PdutRepository $pdut) {

    return $pdut->searchMahasiswa('RISTY');

});
Route::get('/test-admin', function (PdutRepository $pdut) {

    return $pdut->getAdminProdi();

});
Route::get('/test-dosen', function (PdutRepository $pdut) {

    return $pdut->getDosenByNidn('0030018102');

});
Route::get('/service-mahasiswa', function (PdutService $service) {
    return response()->json(
        $service->getMahasiswa('2217031142')
    );
});
Route::get('/service-dosen', function (PdutService $service) {
    return response()->json(
        $service->getDosen('0030018102')
    );
});
Route::get('/service-admin', function (PdutService $service) {
    return response()->json(
        $service->getAdminProdi()
    );
});
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|Route::get('/', function () {
    return view('welcome');
    
});

*/


