<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Http;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    protected $base_uri;
    protected $client;

    public function __construct(Request $request)
    {
        $this->base_uri = 'http://onedata.unila.ac.id/api/live/0.1';
    }

    public function clients()
    {
        $auth = Http::post($this->base_uri . '/auth/login', [
            'id_aplikasi' => '948df317-78f7-4b92-a53f-0a56215e07de',
            'username' => 'rio.ananda@staff.unila.ac.id',
            'password' => '12345678',
            'verify' => false
        ]);
        $token = $auth['data']['token'];
        session()->put('login.token', $token);

        $this->client = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $token
        ]);

        return $this->client;
    }
}
