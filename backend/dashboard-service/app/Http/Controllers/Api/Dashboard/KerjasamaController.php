<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\Dashboard\KerjasamaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KerjasamaController extends Controller
{
    use ApiResponse;

    protected KerjasamaService $service;

    public function __construct()
    {
        $this->service = new KerjasamaService();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'semester' => $request->query('semester'),
            ];
            $data = $this->service->getData($params);
            return $this->success($data, 'Data kerjasama berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data kerjasama: ' . $e->getMessage());
        }
    }
}
