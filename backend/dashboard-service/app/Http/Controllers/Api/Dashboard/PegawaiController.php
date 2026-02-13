<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\Dashboard\PegawaiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PegawaiController extends Controller
{
    use ApiResponse;

    protected PegawaiService $service;

    public function __construct()
    {
        $this->service = new PegawaiService();
    }

    /**
     * GET /v1/dashboard/pegawai?semester=20241,20242
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'semester' => $request->query('semester'),
            ];
            $data = $this->service->getData($params);
            return $this->success($data, 'Data pegawai berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data pegawai: ' . $e->getMessage());
        }
    }
}
