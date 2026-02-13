<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\Dashboard\MahasiswaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MahasiswaController extends Controller
{
    use ApiResponse;

    protected MahasiswaService $service;

    public function __construct()
    {
        $this->service = new MahasiswaService();
    }

    /**
     * GET /v1/dashboard/mahasiswa?semester=20241,20242&fakultas=<uuid>
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'semester' => $request->query('semester'),
                'fakultas' => $request->query('fakultas'),
                'prodi' => $request->query('prodi'),
            ];

            $data = $this->service->getData($params);

            return $this->success($data, 'Data mahasiswa berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data mahasiswa: ' . $e->getMessage());
        }
    }
}
