<?php
namespace App\Http\Controllers\Api\DataUnila;
use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\DataUnila\TracerDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TracerDataController extends Controller
{
    use ApiResponse;
    protected TracerDataService $service;
    public function __construct() { $this->service = new TracerDataService(); }

    public function index(Request $request): JsonResponse
    {
        try { return $this->success($this->service->getList($this->p($request)), 'Data tracer'); }
        catch (\Exception $e) { return $this->error('Gagal: ' . $e->getMessage()); }
    }

    public function stats(Request $request): JsonResponse
    {
        try { return $this->success($this->service->getStats($this->p($request)), 'Stats tracer'); }
        catch (\Exception $e) { return $this->error('Gagal: ' . $e->getMessage()); }
    }

    public function surveyAtasan(Request $request): JsonResponse
    {
        try { return $this->success($this->service->getSurveyAtasanList($this->p($request)), 'Data Survey Atasan'); }
        catch (\Exception $e) { return $this->error('Gagal: ' . $e->getMessage()); }
    }

    public function surveyAtasanStats(Request $request): JsonResponse
    {
        try { return $this->success($this->service->getSurveyAtasanStats($this->p($request)), 'Stats Survey Atasan'); }
        catch (\Exception $e) { return $this->error('Gagal: ' . $e->getMessage()); }
    }

    private function p(Request $r): array
    {
        return ['page'=>$r->query('page',1),'limit'=>$r->query('limit',20),'search'=>$r->query('search'),
            'sort_by'=>$r->query('sort_by'),'sort_order'=>$r->query('sort_order','desc'),
            'id_fakultas'=>$r->query('id_fakultas'),'id_prodi'=>$r->query('id_prodi'),'id_sms'=>$r->query('id_sms'),
            'id_jurusan'=>$r->query('id_jurusan'),'unit_filter'=>$r->query('unit_filter'),
            'tracer_status'=>$r->query('tracer_status')];
    }
}
