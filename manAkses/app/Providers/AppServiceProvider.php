<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use DB;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\View;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        view()->composer('*', function($view) {
            $response = Http::get('http://onedata.unila.ac.id/api/live/0.1/man_akses/peran?id_pengguna='.auth()->user()->id_pengguna);
            $message = $response['message'];

            if(!empty($message)) {
                foreach($response['data'] AS $each_data) {
                    $view->with('users', $each_data);
                    // View::share('users', $each_data);
                }
            }
        });
    }
}
