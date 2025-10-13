<?php

namespace App\Console\Commands;

use App\Jobs\SyncSSOToManAksesJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncSSOCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sso:sync
                            {--chunk-size=500 : Number of users per chunk}
                            {--progress-interval=10 : Progress update every N rows}
                            {--queue=default : Queue name to dispatch job to}
                            {--now : Run synchronously without queue}
                            {--status : Check sync status}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync SSO data (MySQL radcheck) to man_akses (SQL Server) with background job processing';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        // Check status
        if ($this->option('status')) {
            return $this->showStatus();
        }

        $chunkSize = (int) $this->option('chunk-size');
        $progressInterval = (int) $this->option('progress-interval');
        $queueName = $this->option('queue');
        $runNow = $this->option('now');

        $this->info('🚀 SSO to man_akses Sync');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Validate connections
        if (!$this->validateConnections()) {
            $this->error('❌ Database connection validation failed!');
            return 1;
        }

        $this->info('✅ Database connections validated');
        $this->newLine();

        // Get total users with proper filters
        $totalUsers = DB::connection('mysql')
            ->table('radcheck')
            ->where('a_aktif', 1)
            ->where('soft_delete', 0)
            ->whereNotNull('username')
            ->whereNotNull('email')
            ->whereNotNull('tanggal_lahir')
            ->where('tanggal_lahir', '!=', '0000-00-00')
            ->count();

        $this->info("📊 Total users to sync: {$totalUsers}");
        $this->info("📦 Chunk size: {$chunkSize}");
        $this->info("📈 Progress interval: every {$progressInterval} rows");
        $this->info("🔍 Filters: Active users with valid email & birth date");
        $this->newLine();

        if (!$this->confirm('Do you want to proceed?', true)) {
            $this->warn('Sync cancelled by user');
            return 0;
        }

        $job = new SyncSSOToManAksesJob($chunkSize, $progressInterval);

        if ($runNow) {
            // Run synchronously
            $this->info('⏳ Running sync synchronously (this may take a while)...');
            $this->newLine();

            dispatch_sync($job);

            $this->newLine();
            $this->info('✅ Sync completed!');
        } else {
            // Dispatch to queue
            $job->onQueue($queueName);
            dispatch($job);

            $this->info("✅ Job dispatched to queue: {$queueName}");
            $this->info("📋 Job ID: {$job->jobId}");
            $this->newLine();
            $this->info('Monitor progress with:');
            $this->line("  php artisan sso:sync --status");
            $this->line("  php artisan queue:work");
        }

        return 0;
    }

    /**
     * Validate database connections
     */
    protected function validateConnections(): bool
    {
        try {
            // Test MySQL SSO
            DB::connection('mysql')->getPdo();
            $this->line('  ✓ MySQL SSO connection OK');

            // Test SQL Server (man_akses)
            DB::connection('sqlsrv')->getPdo();
            $this->line('  ✓ SQL Server (man_akses) connection OK');

            return true;
        } catch (\Exception $e) {
            $this->error('  ✗ Connection failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Show sync status
     */
    protected function showStatus(): int
    {
        $this->info('📊 SSO Sync Status');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->newLine();

        $syncs = DB::connection('sqlsrv')
            ->table('logger.sync_progress')
            ->where('sync_type', 'sso_to_man_akses')
            ->orderBy('started_at', 'desc')
            ->limit(10)
            ->get();

        if ($syncs->isEmpty()) {
            $this->warn('No sync history found');
            return 0;
        }

        foreach ($syncs as $sync) {
            $status = $sync->status;
            $statusIcon = match($status) {
                'running' => '⏳',
                'completed' => '✅',
                'failed' => '❌',
                default => '❓',
            };

            $this->line("{$statusIcon} {$status} - Job ID: {$sync->job_id}");
            $this->line("   Started: {$sync->started_at}");

            if ($sync->completed_at) {
                $this->line("   Completed: {$sync->completed_at}");
            }

            $percentage = $sync->total_records > 0
                ? round(($sync->processed_records / $sync->total_records) * 100, 2)
                : 0;

            $this->line("   Progress: {$sync->processed_records}/{$sync->total_records} ({$percentage}%)");
            $this->line("   Success: {$sync->success_count} | Failed: {$sync->failed_count}");

            // Display role stats if available
            if ($sync->metadata) {
                $metadata = json_decode($sync->metadata, true);
                if ($metadata && isset($metadata['mahasiswa'])) {
                    $this->line("   Role Stats:");
                    $this->line("     - Mahasiswa: {$metadata['mahasiswa']}");
                    $this->line("     - Dosen: {$metadata['dosen']}");
                    $this->line("     - Tendik: {$metadata['tendik']}");
                    $this->line("     - Guest: {$metadata['guest']}");
                }
            }

            if ($sync->error_message) {
                $this->line("   Error: {$sync->error_message}");
            }

            $this->newLine();
        }

        return 0;
    }
}
