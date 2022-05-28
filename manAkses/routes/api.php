<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\manAksesController;

Route::get('peran', [manAksesController::class, 'peran']);
Route::get('ubah_keaktifan', [manAksesController::class, 'updateLastActive']);
