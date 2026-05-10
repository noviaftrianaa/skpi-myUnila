<?php

namespace App\Http\Controllers\Api\DataUnila;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\DataUnila\TridarmaDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TridarmaDataController extends Controller
{
    use ApiResponse;
    protected TridarmaDataService $service;

    public function __construct()
    {
        $this->service = new TridarmaDataService();
    }

    public function litabmas(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getLitabmas($this->extractParams($request));
            return $this->success($data, 'Data litabmas');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function litabmasStats(): JsonResponse
    {
        try {
            return $this->success($this->service->getLitabmasStats(), 'Stats litabmas');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function publikasi(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getPublikasi($this->extractParams($request));
            return $this->success($data, 'Data publikasi');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function publikasiStats(): JsonResponse
    {
        try {
            return $this->success($this->service->getPublikasiStats(), 'Stats publikasi');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function prestasi(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getPrestasi($this->extractParams($request));
            return $this->success($data, 'Data prestasi');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function prestasiStats(): JsonResponse
    {
        try {
            return $this->success($this->service->getPrestasiStats(), 'Stats prestasi');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    private function extractParams(Request $request): array
    {
        return [
            'page' => $request->query('page', 1),
            'limit' => $request->query('limit', 20),
            'search' => $request->query('search'),
            'sort_by' => $request->query('sort_by'),
            'sort_order' => $request->query('sort_order', 'desc'),
            'jenis' => $request->query('jenis'),
            'tahun' => $request->query('tahun'),
        ];
    }
}
