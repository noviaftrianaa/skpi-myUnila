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

        // Register Program Studi Repository
        $this->app->singleton(
            \App\Repositories\ProgramStudiRepository::class,
            \App\Repositories\ProgramStudiRepository::class
        );

        // Register Program Studi Service (with Repository and DosenProfileService Dependency Injection)
        $this->app->singleton(
            \App\Services\ProgramStudiService::class,
            function ($app) {
                return new \App\Services\ProgramStudiService(
                    $app->make(\App\Repositories\ProgramStudiRepository::class),
                    $app->make(\App\Services\DosenProfileService::class)
                );
            }
        );

        // Register Unila Statistics Repository
        $this->app->singleton(
            \App\Repositories\UnilaStatisticsRepository::class,
            \App\Repositories\UnilaStatisticsRepository::class
        );

        // Register Unila Statistics Service (with Repository Dependency Injection)
        $this->app->singleton(
            \App\Services\UnilaStatisticsService::class,
            function ($app) {
                return new \App\Services\UnilaStatisticsService(
                    $app->make(\App\Repositories\UnilaStatisticsRepository::class)
                );
            }
        );

        // Register Unila Profile Repository
        $this->app->singleton(
            \App\Repositories\UnilaProfileRepository::class,
            \App\Repositories\UnilaProfileRepository::class
        );

        // Register Unila Profile Service (with Repository Dependency Injection)
        $this->app->singleton(
            \App\Services\UnilaProfileService::class,
            function ($app) {
                return new \App\Services\UnilaProfileService(
                    $app->make(\App\Repositories\UnilaProfileRepository::class)
                );
            }
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
