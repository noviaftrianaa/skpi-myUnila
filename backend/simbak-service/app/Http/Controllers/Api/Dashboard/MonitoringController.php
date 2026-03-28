<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Dashboard\DashboardRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MonitoringController extends Controller
{
    use ApiResponse;

    protected DashboardRepository $repository;

    public function __construct()
    {
        $this->repository = new DashboardRepository();
    }

    /**
     * Monitoring mahasiswa aktif (dari pdut SQL Server).
     */
    public function mahasiswaAktif(Request $request): JsonResponse
    {
        try {
            $params = [
                'page' => (int) $request->get('page', 1),
                'limit' => (int) $request->get('limit', 10),
                'fakultas' => $request->get('fakultas'),
            ];
            $result = $this->repository->getMahasiswaAktif($params);
            return $this->paginatedResponse($result['data'], $result['total'], $params['page'], $params['limit']);
        } catch (\Exception $e) {
            Log::error('Monitoring.mahasiswaAktif: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Data lulusan — placeholder, akan diimplementasi.
     */
    public function lulusan(Request $request): JsonResponse
    {
        try {
            // TODO: implement lulusan query dari pdut
            return $this->successResponse([], 'Fitur lulusan akan diimplementasi');
        } catch (\Exception $e) {
            Log::error('Monitoring.lulusan: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Export data monitoring ke CSV.
     */
    public function export(Request $request): JsonResponse
    {
        try {
            // TODO: implement export CSV
            return $this->successResponse(['url' => null], 'Fitur export akan diimplementasi');
        } catch (\Exception $e) {
            Log::error('Monitoring.export: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
