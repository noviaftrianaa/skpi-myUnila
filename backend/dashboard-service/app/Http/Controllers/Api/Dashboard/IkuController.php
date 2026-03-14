<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\Dashboard\IkuService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IkuController extends Controller
{
    use ApiResponse;

    protected IkuService $service;

    public function __construct()
    {
        $this->service = new IkuService();
    }

    /**
     * GET /v1/dashboard/iku?tahun=2026&fakultas=<uuid>
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'tahun' => $request->query('tahun'),
                'fakultas' => $request->query('fakultas'),
            ];

            $data = $this->service->getData($params);

            return $this->success($data, 'Data IKU berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data IKU: ' . $e->getMessage());
        }
    }
}
