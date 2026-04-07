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
        // Repositories
        $this->app->singleton(\App\Repositories\ReferenceRepository::class);
        $this->app->singleton(\App\Repositories\Dashboard\BerandaRepository::class);
        $this->app->singleton(\App\Repositories\Dashboard\MahasiswaRepository::class);
        $this->app->singleton(\App\Repositories\Dashboard\DosenRepository::class);
        $this->app->singleton(\App\Repositories\Dashboard\AkreditasiRepository::class);
        $this->app->singleton(\App\Repositories\Dashboard\LulusanRepository::class);
        $this->app->singleton(\App\Repositories\Dashboard\LitabmasRepository::class);
        $this->app->singleton(\App\Repositories\Dashboard\PublikasiRepository::class);
        $this->app->singleton(\App\Repositories\Dashboard\PegawaiRepository::class);
        $this->app->singleton(\App\Repositories\Dashboard\KeuanganRepository::class);
        $this->app->singleton(\App\Repositories\Dashboard\PrestasiRepository::class);
        $this->app->singleton(\App\Repositories\Dashboard\KerjasamaRepository::class);

        // Services
        $this->app->singleton(\App\Services\CacheService::class);
        $this->app->singleton(\App\Services\Dashboard\ReferenceService::class);
        $this->app->singleton(\App\Services\Dashboard\BerandaService::class);
        $this->app->singleton(\App\Services\Dashboard\MahasiswaService::class);
        $this->app->singleton(\App\Services\Dashboard\DosenService::class);
        $this->app->singleton(\App\Services\Dashboard\AkreditasiService::class);
        $this->app->singleton(\App\Services\Dashboard\LulusanService::class);
        $this->app->singleton(\App\Services\Dashboard\LitabmasService::class);
        $this->app->singleton(\App\Services\Dashboard\PublikasiService::class);
        $this->app->singleton(\App\Services\Dashboard\PegawaiService::class);
        $this->app->singleton(\App\Services\Dashboard\KeuanganService::class);
        $this->app->singleton(\App\Services\Dashboard\PrestasiService::class);
        $this->app->singleton(\App\Services\Dashboard\KerjasamaService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
