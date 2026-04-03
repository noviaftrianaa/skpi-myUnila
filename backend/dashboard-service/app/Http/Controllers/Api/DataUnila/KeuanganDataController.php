<?php

namespace App\Http\Controllers\Api\DataUnila;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\DataUnila\KeuanganDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KeuanganDataController extends Controller
{
    use ApiResponse;

    protected KeuanganDataService $service;

    public function __construct()
    {
        $this->service = new KeuanganDataService();
    }

    // ---- UKT ----

    public function ukt(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getUktList($this->extractParams($request));
            return $this->success($data, 'Data UKT berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data: ' . $e->getMessage());
        }
    }

    public function uktStats(): JsonResponse
    {
        try {
            $data = $this->service->getUktStats();
            return $this->success($data, 'Statistik UKT');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function uktFilters(): JsonResponse
    {
        try {
            return $this->success([
                'tahun' => $this->service->getUktTahunList(),
            ], 'Filter UKT');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    // ---- SPP ----

    public function spp(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getSppList($this->extractParams($request));
            return $this->success($data, 'Data SPP berhasil diambil');
        } catch (\Exception $e) {
            return $this->error('Gagal mengambil data: ' . $e->getMessage());
        }
    }

    public function sppStats(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getSppStats($this->extractParams($request));
            return $this->success($data, 'Statistik SPP');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function sppFilters(): JsonResponse
    {
        try {
            return $this->success([
                'tahun' => $this->service->getSppTahunList(),
            ], 'Filter SPP');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    private function extractParams(Request $request): array
    {
        return [
            'page'       => $request->query('page', 1),
            'limit'      => $request->query('limit', 20),
            'search'     => $request->query('search'),
            'sort_by'    => $request->query('sort_by'),
            'sort_order' => $request->query('sort_order', 'desc'),
            'id_fakultas'=> $request->query('id_fakultas'),
            'id_prodi'   => $request->query('id_prodi'),
            'id_sms'     => $request->query('id_sms'),
            'tahun'      => $request->query('tahun'),
        ];
    }
}
