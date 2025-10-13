<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        \App\Console\Commands\SyncSSOCommand::class,
        \App\Console\Commands\SyncSSOByFilterCommand::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // =========================================
        // SSO SYNC SCHEDULERS
        // =========================================

        // 1. FULL SYNC - Run setiap hari jam 01:00 WIB (dini hari)
        //    Sync semua user tanpa filter
        $schedule->command('sso:sync --now')
            ->dailyAt('01:00')
            ->timezone('Asia/Jakarta') // WIB timezone
            ->onOneServer()
            ->runInBackground()
            ->withoutOverlapping(120) // Prevent overlap max 120 minutes
            ->appendOutputTo(storage_path('logs/sso-sync-scheduler.log'))
            ->emailOutputOnFailure(env('MAIL_ADMIN', 'admin@unila.ac.id'))
            ->onSuccess(function() {
                \Log::info('[Scheduler] SSO Full Sync completed successfully', [
                    'time' => now()->format('Y-m-d H:i:s')
                ]);
            })
            ->onFailure(function() {
                \Log::error('[Scheduler] SSO Full Sync failed', [
                    'time' => now()->format('Y-m-d H:i:s')
                ]);
            });

        // 2. DAILY INCREMENTAL SYNC - Run setiap jam 06:00 WIB (pagi)
        //    Sync user yang dibuat kemarin (lebih cepat)
        $schedule->command('sso:sync-filter', [
            '--date' => now()->subDay()->format('Y-m-d'),
            '--now'
        ])
            ->dailyAt('06:00')
            ->timezone('Asia/Jakarta')
            ->onOneServer()
            ->runInBackground()
            ->withoutOverlapping(30)
            ->appendOutputTo(storage_path('logs/sso-sync-incremental.log'))
            ->emailOutputOnFailure(env('MAIL_ADMIN', 'admin@unila.ac.id'));

        // 3. HOURLY SYNC - Run setiap jam (optional - untuk sync realtime)
        //    Sync user yang dibuat 1 jam terakhir
        // UNCOMMENT jika butuh sync per jam
        /*
        $schedule->command('sso:sync-filter', [
            '--date-from' => now()->subHour()->format('Y-m-d H:i:s'),
            '--now'
        ])
            ->hourly()
            ->timezone('Asia/Jakarta')
            ->onOneServer()
            ->runInBackground()
            ->withoutOverlapping(10)
            ->appendOutputTo(storage_path('logs/sso-sync-hourly.log'));
        */

        // 4. WEEKLY MAINTENANCE - Run setiap Minggu jam 02:00 WIB
        //    Sync ulang semua data 1 minggu terakhir (untuk data integrity)
        $schedule->command('sso:sync-filter', [
            '--date-from' => now()->subWeek()->format('Y-m-d'),
            '--date-to' => now()->format('Y-m-d'),
            '--chunk-size' => 1000,
            '--now'
        ])
            ->weeklyOn(0, '02:00') // 0 = Sunday
            ->timezone('Asia/Jakarta')
            ->onOneServer()
            ->runInBackground()
            ->withoutOverlapping(180)
            ->appendOutputTo(storage_path('logs/sso-sync-weekly.log'))
            ->emailOutputOnFailure(env('MAIL_ADMIN', 'admin@unila.ac.id'));

        // =========================================
        // CLEANUP SCHEDULERS (MAINTENANCE)
        // =========================================

        // Clean old logs - Run setiap hari jam 03:00 WIB
        $schedule->command('log:clear --force')
            ->dailyAt('03:00')
            ->timezone('Asia/Jakarta');

        // Clear cache - Run setiap hari jam 03:30 WIB
        $schedule->command('cache:clear')
            ->dailyAt('03:30')
            ->timezone('Asia/Jakarta');
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
