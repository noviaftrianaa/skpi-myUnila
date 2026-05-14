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
                // Kerjasama tidak terikat fakultas/prodi (data MoU bersifat institusional),
                // tapi controller tetap menerima alias agar konsisten cross-app & tidak break
                // ketika FE forcedScope mengirim params. Filter di service/repo = no-op.
                'fakultas' => $request->query('fakultas') ?? $request->query('id_fakultas'),
                'prodi'    => $request->query('prodi') ?? $request->query('id_prodi') ?? $request->query('id_sms'),
            ];
            $data = $this->service->getData($params);
            return $this->success($data, 'Data kerjasama berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data kerjasama: ' . $e->getMessage());
        }
    }
}
