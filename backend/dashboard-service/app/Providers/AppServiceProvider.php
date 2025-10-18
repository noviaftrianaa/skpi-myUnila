<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register Repository Layer
        $this->app->singleton(
            \App\Repositories\UniversityProfileRepository::class,
            \App\Repositories\UniversityProfileRepository::class
        );

        // Register Service Layer (with Repository Dependency Injection)
        $this->app->singleton(
            \App\Services\UniversityProfileService::class,
            function ($app) {
                return new \App\Services\UniversityProfileService(
                    $app->make(\App\Repositories\UniversityProfileRepository::class)
                );
            }
        );

        // Register Ranking Service
        $this->app->singleton(
            \App\Services\RankingService::class,
            \App\Services\RankingService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
