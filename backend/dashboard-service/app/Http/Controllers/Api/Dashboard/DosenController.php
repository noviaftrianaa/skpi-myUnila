<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\Dashboard\DosenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DosenController extends Controller
{
    use ApiResponse;

    protected DosenService $service;

    public function __construct()
    {
        $this->service = new DosenService();
    }

    /**
     * GET /v1/dashboard/dosen?semester=20241,20242&fakultas=<uuid>
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'semester' => $request->query('semester'),
                'fakultas' => $request->query('fakultas') ?? $request->query('id_fakultas'),
                'prodi'    => $request->query('prodi') ?? $request->query('id_prodi') ?? $request->query('id_sms'),
            ];

            $data = $this->service->getData($params);

            return $this->success($data, 'Data dosen berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data dosen: ' . $e->getMessage());
        }
    }
}
