<?php
namespace App\Http\Controllers\Api\DataUnila;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\DataUnila\KknDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KknDataController extends Controller
{
    use ApiResponse;
    protected KknDataService $service;
    public function __construct() { $this->service = new KknDataService(); }

    public function index(Request $request): JsonResponse
    {
        try {
            return $this->success($this->service->getKknList([
                'page' => $request->query('page', 1),
                'limit' => $request->query('limit', 20),
                'search' => $request->query('search'),
                'sort_by' => $request->query('sort_by'),
                'sort_order' => $request->query('sort_order', 'desc'),
                'id_periode' => $request->query('id_periode'),
                'kabupaten' => $request->query('kabupaten'),
                'status' => $request->query('status'),
            ]), 'Data KKN');
        } catch (\Exception $e) { return $this->error('Gagal: ' . $e->getMessage()); }
    }

    public function stats(): JsonResponse
    {
        try { return $this->success($this->service->getKknStats(), 'Stats KKN'); }
        catch (\Exception $e) { return $this->error('Gagal: ' . $e->getMessage()); }
    }

    public function periode(): JsonResponse
    {
        try { return $this->success($this->service->getPeriodeList(), 'List periode KKN'); }
        catch (\Exception $e) { return $this->error('Gagal: ' . $e->getMessage()); }
    }
}
