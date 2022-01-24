<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RecheckRouteCommand extends Command
{
    protected $signature = 'recheck:route';

    protected $description = 'Recheck Route API and Copy to sub route openapi sandbox and live';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $routeApiPath = base_path('routes') . DIRECTORY_SEPARATOR . 'api.php';
        $routeOpenApiSandbox = base_path('routes/openapi/sandbox') . DIRECTORY_SEPARATOR . 'sandbox.php';
        $routeOpenApiLive = base_path('routes/openapi/live') . DIRECTORY_SEPARATOR . 'live.php';

        $openFile = fopen($routeApiPath, 'r');
        flock($openFile, LOCK_EX);
        $readFile = fread($openFile, filesize($routeApiPath));
        flock($openFile, LOCK_UN);
        fclose($openFile);

        $paths = ['live' => $routeOpenApiLive, 'sandbox' => $routeOpenApiSandbox];
        foreach ($paths as $file => $path) {
            $findString = strpos($readFile, "'prefix' => '0.1',");
            if ($findString) {
                $replaceFile = str_replace("'prefix' => '0.1',", "'prefix' => '" . $file . "/0.1',", $readFile);
                $replaceFile = str_replace("'as' => 'api.',", "'as' => 'api_" . $file . "',", $replaceFile);

                $writeFile = fopen($path, 'w');
                flock($writeFile, LOCK_EX);
                fwrite($writeFile, $replaceFile);
                flock($writeFile, LOCK_UN);
                fclose($writeFile);

                $this->info("Recheck Route Done and Create/Edit $path");
            } else {
                $this->error("Recheck Route Failed, Notfound Word");
            }
        }
    }
}
