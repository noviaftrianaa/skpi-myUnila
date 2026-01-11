<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/**
 * Meilisearch Auto-Sync Scheduler
 *
 * Automatically imports/syncs data from database to Meilisearch
 * to keep search indexes up-to-date
 */
Schedule::command('search:import --model=all')
    ->dailyAt('02:00')
    ->withoutOverlapping()
    ->runInBackground()
    ->onSuccess(function () {
        info('Meilisearch auto-sync completed successfully');
    })
    ->onFailure(function () {
        error('Meilisearch auto-sync failed');
    });
