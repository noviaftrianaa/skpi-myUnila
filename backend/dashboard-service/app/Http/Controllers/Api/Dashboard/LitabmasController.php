<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\Dashboard\LitabmasService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LitabmasController extends Controller
{
    use ApiResponse;

    protected LitabmasService $service;

    public function __construct()
    {
        $this->service = new LitabmasService();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $params = [
                'semester' => $request->query('semester'),
                'fakultas' => $request->query('fakultas') ?? $request->query('id_fakultas'),
                'prodi'    => $request->query('prodi') ?? $request->query('id_prodi') ?? $request->query('id_sms'),
            ];
            $data = $this->service->getData($params);
            return $this->success($data, 'Data litabmas berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data litabmas: ' . $e->getMessage());
        }
    }
}
