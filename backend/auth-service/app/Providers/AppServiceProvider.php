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
        // Register Repositories as Singletons
        $this->app->singleton(\App\Repositories\UserRepository::class);
        $this->app->singleton(\App\Repositories\TokenRepository::class);

        // Register Services as Singletons
        $this->app->singleton(\App\Services\Auth\AuthService::class);
        $this->app->singleton(\App\Services\TokenService::class);
        $this->app->singleton(\App\Services\CacheService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
