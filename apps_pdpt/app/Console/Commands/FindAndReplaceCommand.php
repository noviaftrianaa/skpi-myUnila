<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FindAndReplaceCommand extends Command
{
    protected $signature = 'find:replace';

    protected $description = 'Custom Command Find&Replace';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $path = app_path() . DIRECTORY_SEPARATOR . 'Http' . DIRECTORY_SEPARATOR . 'Controllers' . DIRECTORY_SEPARATOR . 'PDUT' . DIRECTORY_SEPARATOR . 'Api' . DIRECTORY_SEPARATOR . 'Pdrd' . DIRECTORY_SEPARATOR . 'PengabdianController.php';
        $readFile = @file_get_contents($path);
        $replaceWord = "'count'";
        $replaceWordTo = "'sort_by'";
        $replace = preg_replace('#([^[]\'sortby\'[^]])+#m', $replaceWordTo, $readFile);

        $f = fopen($path, 'w+');
        flock($f, LOCK_EX);
        fwrite($f, $replace);
        flock($f, LOCK_UN);
        fclose($f);
    }
}
