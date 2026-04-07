<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\Dashboard\PublikasiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublikasiController extends Controller
{
    use ApiResponse;

    protected PublikasiService $service;

    public function __construct()
    {
        $this->service = new PublikasiService();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'semester' => $request->query('semester'),
                'fakultas' => $request->query('fakultas'),
            ];
            $data = $this->service->getData($params);
            return $this->success($data, 'Data publikasi berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data publikasi: ' . $e->getMessage());
        }
    }
}
