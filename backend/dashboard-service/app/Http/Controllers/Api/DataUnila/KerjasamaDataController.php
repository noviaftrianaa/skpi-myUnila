<?php
namespace App\Http\Controllers\Api\DataUnila;
use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\DataUnila\KerjasamaDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KerjasamaDataController extends Controller
{
    use ApiResponse;
    protected KerjasamaDataService $service;
    public function __construct() { $this->service = new KerjasamaDataService(); }

    public function index(Request $request): JsonResponse
    {
        try { return $this->success($this->service->getList($this->p($request)), 'Data kerjasama'); }
        catch (\Exception $e) { return $this->error('Gagal: ' . $e->getMessage()); }
    }

    public function stats(): JsonResponse
    {
        try { return $this->success($this->service->getStats(), 'Stats kerjasama'); }
        catch (\Exception $e) { return $this->error('Gagal: ' . $e->getMessage()); }
    }

    private function p(Request $r): array
    {
        return ['page'=>$r->query('page',1),'limit'=>$r->query('limit',20),'search'=>$r->query('search'),
            'sort_by'=>$r->query('sort_by'),'sort_order'=>$r->query('sort_order','desc')];
    }
}
