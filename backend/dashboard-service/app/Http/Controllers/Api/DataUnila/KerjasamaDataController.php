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

    public function stats(Request $request): JsonResponse
    {
        try { return $this->success($this->service->getStats($this->p($request)), 'Stats kerjasama'); }
        catch (\Exception $e) { return $this->error('Gagal: ' . $e->getMessage()); }
    }

    public function mitra(Request $request): JsonResponse
    {
        try { return $this->success($this->service->getMitraList($this->pMitra($request)), 'Data mitra'); }
        catch (\Exception $e) { return $this->error('Gagal: ' . $e->getMessage()); }
    }

    public function mitraStats(Request $request): JsonResponse
    {
        try { return $this->success($this->service->getMitraStats($this->pMitra($request)), 'Stats mitra'); }
        catch (\Exception $e) { return $this->error('Gagal: ' . $e->getMessage()); }
    }

    private function p(Request $r): array
    {
        return [
            'page' => $r->query('page', 1),
            'limit' => $r->query('limit', 20),
            'search' => $r->query('search'),
            'sort_by' => $r->query('sort_by'),
            'sort_order' => $r->query('sort_order', 'desc'),
            'status' => $r->query('status'),
            'id_fakultas' => $r->query('id_fakultas'),
            'id_prodi' => $r->query('id_prodi'),
            'id_sms' => $r->query('id_sms'),
            'id_jurusan' => $r->query('id_jurusan'),
            'unit_filter' => $r->query('unit_filter'),
        ];
    }

    private function pMitra(Request $r): array
    {
        return [
            'page' => $r->query('page', 1),
            'limit' => $r->query('limit', 20),
            'search' => $r->query('search'),
            'sort_by' => $r->query('sort_by'),
            'sort_order' => $r->query('sort_order', 'asc'),
            'jenis' => $r->query('jenis'),
            'tahun_mou' => $r->query('tahun_mou'),
            'id_fakultas' => $r->query('id_fakultas'),
            'id_prodi' => $r->query('id_prodi'),
            'id_sms' => $r->query('id_sms'),
            'id_jurusan' => $r->query('id_jurusan'),
            'unit_filter' => $r->query('unit_filter'),
        ];
    }
}
