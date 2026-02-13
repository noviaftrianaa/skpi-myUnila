<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\Dashboard\LulusanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LulusanController extends Controller
{
    use ApiResponse;

    protected LulusanService $service;

    public function __construct()
    {
        $this->service = new LulusanService();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'semester' => $request->query('semester'),
                'fakultas' => $request->query('fakultas'),
                'prodi' => $request->query('prodi'),
            ];
            $data = $this->service->getData($params);
            return $this->success($data, 'Data lulusan berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data lulusan: ' . $e->getMessage());
        }
    }
}
