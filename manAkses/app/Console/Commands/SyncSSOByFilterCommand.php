<?php

namespace App\Console\Commands;

use App\Jobs\SyncSSOByFilterJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncSSOByFilterCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sso:sync-filter
                            {--username= : Sync specific username (single user)}
                            {--date= : Sync users created on specific date (format: YYYY-MM-DD)}
                            {--date-from= : Sync users created from this date (format: YYYY-MM-DD)}
                            {--date-to= : Sync users created until this date (format: YYYY-MM-DD)}
                            {--chunk-size=100 : Number of users per chunk (default: 100 for filtered sync)}
                            {--progress-interval=5 : Progress update every N rows}
                            {--queue=default : Queue name to dispatch job to}
                            {--now : Run synchronously without queue}
                            {--dry-run : Show what would be synced without actually syncing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync SSO data with filters (by username or date range)';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $username = $this->option('username');
        $date = $this->option('date');
        $dateFrom = $this->option('date-from');
        $dateTo = $this->option('date-to');
        $chunkSize = (int) $this->option('chunk-size');
        $progressInterval = (int) $this->option('progress-interval');
        $queueName = $this->option('queue');
        $runNow = $this->option('now');
        $dryRun = $this->option('dry-run');

        $this->info('🔍 SSO Filtered Sync');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->newLine();

        // Validate connections
        if (!$this->validateConnections()) {
            $this->error('❌ Database connection validation failed!');
            return 1;
        }

        $this->info('✅ Database connections validated');
        $this->newLine();

        // Build filter
        $filterData = $this->buildFilter($username, $date, $dateFrom, $dateTo);

        if (!$filterData) {
            $this->error('❌ No valid filter provided!');
            $this->warn('Please specify at least one of: --username, --date, --date-from/--date-to');
            return 1;
        }

        // Get total users matching filter
        $query = $this->buildQuery($filterData);
        $totalUsers = $query->count();

        if ($totalUsers === 0) {
            $this->warn('⚠️  No users found matching the filter criteria');
            return 0;
        }

        // Display filter info
        $this->displayFilterInfo($filterData, $totalUsers, $chunkSize, $progressInterval);

        // Dry run - show preview
        if ($dryRun) {
            $this->newLine();
            $this->info('🔍 DRY RUN - Preview of users to be synced:');
            $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            $preview = $query->select('username', 'email', 'nm_pengguna', 'created_at')
                ->limit(10)
                ->get();

            $this->table(
                ['Username', 'Email', 'Nama', 'Created At'],
                $preview->map(fn($u) => [
                    $u->username,
                    $u->email,
                    $u->nm_pengguna,
                    $u->created_at
                ])
            );

            if ($totalUsers > 10) {
                $this->info("... and " . ($totalUsers - 10) . " more users");
            }

            $this->newLine();
            $this->warn('This was a DRY RUN. No data was synced.');
            $this->info('Remove --dry-run to actually sync the data.');
            return 0;
        }

        // Confirm before sync
        if (!$this->confirm('Do you want to proceed with sync?', true)) {
            $this->warn('Sync cancelled by user');
            return 0;
        }

        // Create job
        $job = new SyncSSOByFilterJob($filterData, $chunkSize, $progressInterval);

        if ($runNow) {
            // Run synchronously
            $this->info('⏳ Running sync synchronously...');
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
     * Build filter data
     */
    protected function buildFilter(?string $username, ?string $date, ?string $dateFrom, ?string $dateTo): ?array
    {
        $filter = [];

        // Username filter (highest priority - single user)
        if ($username) {
            $filter['type'] = 'username';
            $filter['username'] = $username;
            return $filter;
        }

        // Date filter (specific date)
        if ($date) {
            if (!$this->validateDate($date)) {
                $this->error("Invalid date format: {$date}. Use YYYY-MM-DD");
                return null;
            }
            $filter['type'] = 'date';
            $filter['date'] = $date;
            return $filter;
        }

        // Date range filter
        if ($dateFrom || $dateTo) {
            if ($dateFrom && !$this->validateDate($dateFrom)) {
                $this->error("Invalid date-from format: {$dateFrom}. Use YYYY-MM-DD");
                return null;
            }
            if ($dateTo && !$this->validateDate($dateTo)) {
                $this->error("Invalid date-to format: {$dateTo}. Use YYYY-MM-DD");
                return null;
            }

            $filter['type'] = 'date_range';
            if ($dateFrom) $filter['date_from'] = $dateFrom;
            if ($dateTo) $filter['date_to'] = $dateTo;
            return $filter;
        }

        return null;
    }

    /**
     * Build query with filter
     */
    protected function buildQuery(array $filterData)
    {
        $query = DB::connection('mysql')
            ->table('radcheck')
            ->where('a_aktif', 1)
            ->where('soft_delete', 0)
            ->whereNotNull('username')
            ->whereNotNull('email')
            ->whereNotNull('tanggal_lahir')
            ->where('tanggal_lahir', '!=', '0000-00-00');

        // Apply specific filter
        switch ($filterData['type']) {
            case 'username':
                $query->where('username', $filterData['username']);
                break;

            case 'date':
                $query->whereDate('created_at', $filterData['date']);
                break;

            case 'date_range':
                if (isset($filterData['date_from'])) {
                    $query->whereDate('created_at', '>=', $filterData['date_from']);
                }
                if (isset($filterData['date_to'])) {
                    $query->whereDate('created_at', '<=', $filterData['date_to']);
                }
                break;
        }

        return $query;
    }

    /**
     * Display filter information
     */
    protected function displayFilterInfo(array $filterData, int $totalUsers, int $chunkSize, int $progressInterval): void
    {
        $this->info('📊 Sync Information:');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Filter type
        switch ($filterData['type']) {
            case 'username':
                $this->line("  Filter Type: Single User");
                $this->line("  Username: {$filterData['username']}");
                break;

            case 'date':
                $this->line("  Filter Type: Specific Date");
                $this->line("  Date: {$filterData['date']}");
                break;

            case 'date_range':
                $this->line("  Filter Type: Date Range");
                if (isset($filterData['date_from'])) {
                    $this->line("  From: {$filterData['date_from']}");
                }
                if (isset($filterData['date_to'])) {
                    $this->line("  To: {$filterData['date_to']}");
                }
                break;
        }

        $this->line("  Total Users: {$totalUsers}");
        $this->line("  Chunk Size: {$chunkSize}");
        $this->line("  Progress Interval: every {$progressInterval} rows");
        $this->newLine();
    }

    /**
     * Validate date format
     */
    protected function validateDate(string $date): bool
    {
        $d = \DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
}
