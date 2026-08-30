<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    protected DashboardService $service;

    public function __construct(
        DashboardService $service
    ) {
        $this->service = $service;
    }

    /**
     * Dashboard Mahasiswa
     */
    public function index(string $nim): JsonResponse
    {
        return response()->json([

            'success' => true,

            'message' => 'Dashboard berhasil dimuat.',

            'data' => $this->service->getDashboard($nim)

        ]);
    }
}
