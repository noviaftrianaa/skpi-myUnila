<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;
use Str;

class CreateAnotationCommand extends Command
{
    protected $signature = 'make:anotation {--scan} {--r}';

    protected $description = 'Create Anotation OpenApi l5-Swagger';

    protected $anotationPath = "";

    public function __construct()
    {
        parent::__construct();
        $this->anotationPath = base_path('app/Anotations');
    }

    public function handle()
    {
        exit();
        $routeList = Route::getRoutes();
        foreach ($routeList as $route) {
            if (is_null($route->action['middleware'])) {
                continue;
            }

            preg_match('/api\/0.1\/?([a-z\_]+)?/', $route->action['prefix'], $prefix);
            if (in_array('api', $route->action['middleware']) && !empty($prefix)) {
                $getPrefix = explode("/", $route->uri);

                $folderName = $this->makeFolderName($getPrefix[2]);
                $fileName = $this->makeFileName($getPrefix[3]);

                $filePath  = $this->anotationPath . DIRECTORY_SEPARATOR . $folderName . DIRECTORY_SEPARATOR . $fileName . 'Anotation.php';
                $folderPath = $this->anotationPath . DIRECTORY_SEPARATOR . $folderName;

                $this->makeFolder($folderPath);
                $this->makeFile($filePath);
            }
        }
    }

    public function makeFolderName($folderName = "")
    {
        $folderName = trim($folderName);
        $folderName = str_replace("_", " ", $folderName);
        $folderName = Str::studly($folderName);
        return $folderName;
    }

    public function makeFileName($fileName = "")
    {
        $fileName = trim($fileName);
        $fileName = Str::studly($fileName);
        return $fileName;
    }

    public function makeFile($path = "", $forceRecreate = false)
    {
        if (file_exists($path)) {
            return;
        }

        if ($forceRecreate) {
            @unlink($path);
        }

        $file = fopen($path, 'w');
        flock($file, LOCK_EX);
        fwrite($file, "<?php\r\n");
        flock($file, LOCK_UN);
        fclose($file);
    }

    public function makeFolder($path = "", $forceRecreate = false)
    {
        if (file_exists($path)) {
            return;
        }

        if ($forceRecreate) {
            rmdir($path);
        }
        mkdir($path);
    }
}
