<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\Dashboard\KeuanganService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KeuanganController extends Controller
{
    use ApiResponse;

    protected KeuanganService $service;

    public function __construct()
    {
        $this->service = new KeuanganService();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'semester' => $request->query('semester'),
                'fakultas' => $request->query('fakultas'),
            ];
            $data = $this->service->getData($params);
            return $this->success($data, 'Data keuangan berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data keuangan: ' . $e->getMessage());
        }
    }
}
