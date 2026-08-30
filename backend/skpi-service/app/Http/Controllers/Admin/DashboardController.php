<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    protected AdminService $service;

    public function __construct(
        AdminService $service
    ) {
        $this->service = $service;
    }

    public function index(): JsonResponse
    {
        return response()->json([

            'success' => true,

            'data' => $this->service->dashboard()

        ]);
    }
}