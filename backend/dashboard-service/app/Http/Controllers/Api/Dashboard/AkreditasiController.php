<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\Dashboard\AkreditasiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AkreditasiController extends Controller
{
    use ApiResponse;

    protected AkreditasiService $service;

    public function __construct()
    {
        $this->service = new AkreditasiService();
    }

    /**
     * GET /v1/dashboard/akreditasi?semester=20241,20242
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'semester' => $request->query('semester'),
            ];

            $data = $this->service->getData($params);

            return $this->success($data, 'Data akreditasi berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data akreditasi: ' . $e->getMessage());
        }
    }
}
