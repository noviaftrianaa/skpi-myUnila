<?php
namespace App\Http\Controllers\Api\DataUnila;
use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\DataUnila\AkademikDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AkademikDataController extends Controller
{
    use ApiResponse;
    protected AkademikDataService $service;
    public function __construct() { $this->service = new AkademikDataService(); }

    public function prodi(Request $request): JsonResponse
    {
        try { return $this->success($this->service->getProdiList($this->p($request)), 'Data prodi'); }
        catch (\Exception $e) { return $this->error('Gagal: ' . $e->getMessage()); }
    }

    public function akreditasi(Request $request): JsonResponse
    {
        try { return $this->success($this->service->getAkreditasiList($this->p($request)), 'Data akreditasi'); }
        catch (\Exception $e) { return $this->error('Gagal: ' . $e->getMessage()); }
    }

    public function matkul(Request $request): JsonResponse
    {
        try { return $this->success($this->service->getMatkulList($this->p($request)), 'Data matkul'); }
        catch (\Exception $e) { return $this->error('Gagal: ' . $e->getMessage()); }
    }

    private function p(Request $r): array
    {
        return ['page'=>$r->query('page',1),'limit'=>$r->query('limit',20),'search'=>$r->query('search'),
            'sort_by'=>$r->query('sort_by'),'sort_order'=>$r->query('sort_order','asc'),
            'id_fakultas'=>$r->query('id_fakultas'),'id_prodi'=>$r->query('id_prodi'),'id_sms'=>$r->query('id_sms')];
    }
}
