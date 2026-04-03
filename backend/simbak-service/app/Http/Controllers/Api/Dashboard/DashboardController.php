<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Dashboard\DashboardRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    use ApiResponse;

    protected DashboardRepository $repository;

    public function __construct()
    {
        $this->repository = new DashboardRepository();
    }

    /**
     * Overview statistik — role-based.
     */
    public function overview(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $roles = $user->jwt_roles ?? [];

            // Mahasiswa: stats pengajuan sendiri
            if (in_array(39, $roles) && !array_intersect([1, 107, 111], $roles)) {
                $stats = $this->repository->getMyStats($user->id_pengguna);
                return $this->successResponse($stats);
            }

            // Admin/BAK/Dev: stats global
            $stats = $this->repository->getOverviewStats();
            return $this->successResponse($stats);
        } catch (\Exception $e) {
            Log::error('Dashboard.overview: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * SLA compliance rate.
     */
    public function sla(): JsonResponse
    {
        try {
            $result = $this->repository->getSlaCompliance();
            $totalSelesai = (int) ($result->total_selesai ?? 0);
            $tepatWaktu = (int) ($result->tepat_waktu ?? 0);
            $percentage = $totalSelesai > 0 ? round(($tepatWaktu / $totalSelesai) * 100, 1) : 0;

            return $this->successResponse([
                'total_selesai' => $totalSelesai,
                'tepat_waktu' => $tepatWaktu,
                'percentage' => $percentage,
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard.sla: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Recent activity log.
     */
    public function activityLog(Request $request): JsonResponse
    {
        try {
            $limit = (int) $request->get('limit', 10);
            $data = $this->repository->getRecentActivity(min($limit, 50));
            return $this->successResponse($data);
        } catch (\Exception $e) {
            Log::error('Dashboard.activityLog: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }

    /**
     * Trend pengajuan 6 bulan terakhir.
     */
    public function trends(): JsonResponse
    {
        try {
            $data = $this->repository->getTrend6Bulan();
            return $this->successResponse($data);
        } catch (\Exception $e) {
            Log::error('Dashboard.trends: ' . $e->getMessage());
            return $this->serverErrorResponse();
        }
    }
}
