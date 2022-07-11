<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use DB;
use Auth;
use Session;
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
            if(auth()->check()) {
                // $response = Http::withHeaders([
                //     'Content-Type' => 'application/json',
                //     'Authorization' => 'Bearer ' . session()->get('login.token')
                // ])->get(url('/api/0.1/peran?id_pengguna='.auth()->user()->id_pengguna));
                $response = Http::get(url('/api/live/0.1/peran?id_pengguna='.auth()->user()->id_pengguna));
                $message = $response['message'];
    
                if(!empty($message)) {
                    foreach($response['data'] AS $each_data) {
                        $view->with('getPeran', $each_data);
                        Session::put('pj_aplikasi', $each_data->jabatan_pj ?? null);
                    }
                }
            }
        });
    }
}
