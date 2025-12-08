<?php

namespace App\Jobs;

use App\Services\Sync\SyncRadiusService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Sync Radius Job
 *
 * Background job untuk menjalankan sync data dari Radius ke ManAkses
 * Dijalankan secara async via Laravel Queue
 */
class SyncRadiusJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 1;

    /**
     * The maximum number of seconds the job can run.
     * Set to 30 minutes for large data sync
     */
    public int $timeout = 1800;

    /**
     * User ID yang menjalankan sync
     */
    private ?string $userId;

    /**
     * Filter options
     */
    private array $options;

    /**
     * Create a new job instance.
     */
    public function __construct(?string $userId = null, array $options = [])
    {
        $this->userId = $userId;
        $this->options = $options;
        $this->onQueue('sync'); // Use 'sync' queue
    }

    /**
     * Execute the job.
     */
    public function handle(SyncRadiusService $syncService): void
    {
        Log::info('SyncRadiusJob: Starting background sync', [
            'user_id' => $this->userId,
            'options' => $this->options,
        ]);

        try {
            $result = $syncService->startSync($this->userId, $this->options);

            Log::info('SyncRadiusJob: Sync completed', [
                'success' => $result['success'],
                'stats' => $result['stats'] ?? [],
            ]);
        } catch (\Exception $e) {
            Log::error('SyncRadiusJob: Sync failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SyncRadiusJob: Job failed permanently', [
            'error' => $exception->getMessage(),
            'user_id' => $this->userId,
        ]);
    }
}
