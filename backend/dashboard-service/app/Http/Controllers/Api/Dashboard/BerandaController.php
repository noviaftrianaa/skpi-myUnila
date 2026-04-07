<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\Dashboard\BerandaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BerandaController extends Controller
{
    use ApiResponse;

    protected BerandaService $service;

    public function __construct()
    {
        $this->service = new BerandaService();
    }

    /**
     * GET /v1/dashboard/beranda?semester=20241,20242
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'semester' => $request->query('semester'),
            ];
            $data = $this->service->getData($params);
            return $this->success($data, 'Data beranda berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data beranda: ' . $e->getMessage());
        }
    }
}
