<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\Dashboard\ReferenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferenceController extends Controller
{
    use ApiResponse;

    protected ReferenceService $service;

    public function __construct()
    {
        $this->service = new ReferenceService();
    }

    /**
     * GET /v1/reference/fakultas
     */
    public function fakultas(): JsonResponse
    {
        try {
            $data = $this->service->getFakultasList();
            return $this->success($data, 'Data fakultas berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data fakultas: ' . $e->getMessage());
        }
    }

    /**
     * GET /v1/reference/prodi?fakultas=<uuid>
     */
    public function prodi(Request $request): JsonResponse
    {
        try {
            $idFakultas = $request->query('fakultas');
            $data = $this->service->getProdiList($idFakultas);
            return $this->success($data, 'Data prodi berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data prodi: ' . $e->getMessage());
        }
    }

    /**
     * GET /v1/reference/semester
     */
    public function semester(): JsonResponse
    {
        try {
            $data = $this->service->getSemesterList();
            return $this->success($data, 'Data semester berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data semester: ' . $e->getMessage());
        }
    }
}
