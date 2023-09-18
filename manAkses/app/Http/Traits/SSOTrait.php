<?php

namespace App\Http\Traits;

use GuzzleHttp\Client;
use Illuminate\Http\Request;

trait SSOTrait {

    protected $base_uri;
    protected $client;
    protected $bearer;

    public function __construct(Request $request)
    {
        // $this->base_uri = 'http://login_unila.test/api/live/0.1/';
        $this->base_uri = 'http://login.unila.ac.id/api/live/0.1/';
    }

    public function base_uri($api = "")
    {
        return $this->base_uri . $api;
    }

    public function clients()
    {
        $this->client = new Client(['headers' => [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . env('TOKEN_SSO')
        ]]);

        return $this->client;
    }

    public function get($uri)
    {
        return json_decode($this->clients()->get($this->base_uri($uri))->getBody());
    }

    public function post($uri, $input)
    {
        return $this->clients()->post($this->base_uri($uri), [
            'json' => $input
        ]);
    }

    // public function put($uri, $id, $input)
    public function put($uri, $input)
    {
        unset($input["_token"]);
        unset($input["_method"]);
        return $this->clients()->put($this->base_uri($uri), [
            'json' => $input
        ]);
    }

    public function drop($uri)
    {
        return $this->clients()->delete($this->base_uri($uri));
    }

}
