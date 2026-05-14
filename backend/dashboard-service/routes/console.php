<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Pre-warm IKU cache tiap jam — cegah cold compute timeout di dashboard pimpinan
Schedule::command('iku:warm-cache')
    ->hourly()
    ->withoutOverlapping()
    ->runInBackground();
