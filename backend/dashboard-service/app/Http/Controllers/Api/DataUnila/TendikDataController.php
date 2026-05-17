<?php

namespace App\Http\Controllers\Api\DataUnila;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\DataUnila\TendikDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TendikDataController extends Controller
{
    use ApiResponse;

    protected TendikDataService $service;

    public function __construct()
    {
        $this->service = new TendikDataService();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getList($this->extractParams($request));
            return $this->success($data, 'Data tendik');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function stats(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getStats($this->extractParams($request));
            return $this->success($data, 'Statistik tendik');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    public function filters(): JsonResponse
    {
        try {
            return $this->success($this->service->getFilterOptions(), 'Filter options tendik');
        } catch (\Exception $e) {
            return $this->error('Gagal: ' . $e->getMessage());
        }
    }

    private function extractParams(Request $request): array
    {
        return [
            'page' => $request->query('page', 1),
            'limit' => $request->query('limit', 10),
            'search' => $request->query('search'),
            'sort_by' => $request->query('sort_by'),
            'sort_order' => $request->query('sort_order'),
            'id_org1' => $request->query('id_org1'),
            'id_org2' => $request->query('id_org2'),
            'status' => $request->query('status'),
            'jns_pegawai' => $request->query('jns_pegawai'),
        ];
    }
}
