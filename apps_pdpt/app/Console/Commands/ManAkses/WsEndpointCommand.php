<?php

namespace App\Console\Commands\ManAkses;

use App\Models\ManAkses\WsEndpoint;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;

class WsEndpointCommand extends Command
{
    protected $signature = 'ManAkses:WsEndpoint';
    protected $description = 'Sync All Route Api to man_akses.ws_endpoint';
    public function __construct()
    {
        parent::__construct();
    }
    public function handle()
    {
        $routeCollection = Route::getRoutes();
        foreach ($routeCollection as $value) {
            if ($value->getName() == 'api_live') {
                preg_match('/api\/live\/0.1\/([\w]+)/', $value->uri(), $group_name1);
                preg_match('/api\/live\/0.1\/([\w]+)\/[\w]+/', $value->uri(), $group_name2);
                $nm_method = $value->methods()[0];
                $path_url = str_replace('api/live/0.1', '', $value->uri());
                WsEndpoint::updateOrInsert([
                    'nm_method' => $nm_method,
                    'path_url' => $path_url,
                ], [
                    'id_ws_endpoint' => guid(),
                    'nm_group' => $group_name2[1] ?? $group_name1[1],
                    'nm_endpoint' => null,
                    'id_creator' => 'b139c09e-5c93-42f1-9639-511c164d87de',
                    'last_sync' => now(),
                ]);
                print_r($nm_method ." | ". $path_url. "\n");
            }
        }
    }
}
