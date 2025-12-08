<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use App\Services\Sync\SyncRadiusService;
use App\Jobs\SyncRadiusJob;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Sync Controller
 *
 * Handle API requests for sync operations between Radius and ManAkses
 */
class SyncController extends Controller
{
    use ApiResponse;

    public function __construct(
        private SyncRadiusService $syncService
    ) {}

    /**
     * Start sync process (foreground)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function startSync(Request $request): JsonResponse
    {
        try {
            // Get user ID from JWT token
            $userId = $request->attributes->get('user_id');

            // Get filter options
            $options = [
                'username_filter' => $request->input('username_filter'),
                'role_filter' => $request->input('role_filter'),
            ];

            // Start sync (foreground)
            $result = $this->syncService->startSync($userId, $options);

            if ($result['success']) {
                return $this->successResponse($result, $result['message']);
            }

            return $this->errorResponse($result['message'], 400);

        } catch (\Exception $e) {
            Log::error('SyncController::startSync error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Terjadi kesalahan saat memulai sync: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Start sync process (background via queue)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function startSyncBackground(Request $request): JsonResponse
    {
        try {
            // Check if sync is already running
            if ($this->syncService->isSyncRunning()) {
                return $this->errorResponse('Sync sedang berjalan. Silakan tunggu hingga selesai.', 409);
            }

            // Get user ID from JWT token
            $userId = $request->attributes->get('user_id');

            // Get filter options
            $options = [
                'username_filter' => $request->input('username_filter'),
                'role_filter' => $request->input('role_filter'),
            ];

            // Dispatch background job
            SyncRadiusJob::dispatch($userId, $options);

            return $this->successResponse([
                'status' => 'queued',
                'message' => 'Sync telah dijadwalkan dan akan segera dimulai',
            ], 'Sync berhasil dijadwalkan');

        } catch (\Exception $e) {
            Log::error('SyncController::startSyncBackground error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Terjadi kesalahan saat menjadwalkan sync: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get current sync progress
     *
     * @return JsonResponse
     */
    public function getProgress(): JsonResponse
    {
        try {
            $progress = $this->syncService->getProgress();

            return $this->successResponse([
                'progress' => $progress,
            ], 'Progress sync berhasil diambil');

        } catch (\Exception $e) {
            Log::error('SyncController::getProgress error', [
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Gagal mengambil progress sync', 500);
        }
    }

    /**
     * Get sync status (is running or not)
     *
     * @return JsonResponse
     */
    public function getStatus(): JsonResponse
    {
        try {
            $isRunning = $this->syncService->isSyncRunning();
            $progress = $this->syncService->getProgress();

            return $this->successResponse([
                'is_running' => $isRunning,
                'status' => $progress['status'] ?? 'idle',
                'progress' => $progress,
            ], 'Status sync berhasil diambil');

        } catch (\Exception $e) {
            Log::error('SyncController::getStatus error', [
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Gagal mengambil status sync', 500);
        }
    }

    /**
     * Get sync logs history
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getLogs(Request $request): JsonResponse
    {
        try {
            $limit = (int) $request->input('limit', 10);
            $limit = min($limit, 50); // Max 50 logs

            $logs = $this->syncService->getSyncLogs($limit);

            return $this->successResponse([
                'logs' => $logs,
                'total' => count($logs),
            ], 'Log sync berhasil diambil');

        } catch (\Exception $e) {
            Log::error('SyncController::getLogs error', [
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Gagal mengambil log sync', 500);
        }
    }

    /**
     * Get Radius database statistics
     *
     * @return JsonResponse
     */
    public function getRadiusStats(): JsonResponse
    {
        try {
            // Count active users in radius
            $totalActive = \DB::connection('radius')
                ->selectOne("
                    SELECT COUNT(*) as total
                    FROM radcheck
                    WHERE a_aktif = 1
                      AND soft_delete = 0
                      AND username IS NOT NULL
                      AND email IS NOT NULL
                ");

            // Count by domain
            $byDomain = \DB::connection('radius')
                ->select("
                    SELECT
                        SUBSTRING_INDEX(SUBSTRING_INDEX(email, '@', -1), '.', 1) AS domain,
                        COUNT(*) as total
                    FROM radcheck
                    WHERE a_aktif = 1
                      AND soft_delete = 0
                      AND username IS NOT NULL
                      AND email IS NOT NULL
                    GROUP BY SUBSTRING_INDEX(SUBSTRING_INDEX(email, '@', -1), '.', 1)
                    ORDER BY total DESC
                    LIMIT 10
                ");

            return $this->successResponse([
                'total_active' => (int) $totalActive->total,
                'by_domain' => array_map(function ($item) {
                    return [
                        'domain' => $item->domain,
                        'total' => (int) $item->total,
                    ];
                }, $byDomain),
            ], 'Statistik Radius berhasil diambil');

        } catch (\Exception $e) {
            Log::error('SyncController::getRadiusStats error', [
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Gagal mengambil statistik Radius: ' . $e->getMessage(), 500);
        }
    }
}
