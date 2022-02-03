<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TemplateRefCommand extends Command
{
    protected $signature = 'generate:ref';

    protected $description = 'Create Ref Controller And Model From Template';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $schema_name = 'ref';
        $selectableFunction = ['func', 'model', 'route'];

        $createModel = $this->choice(
            'Enter Create Mode (exp. 1 = function | 2 = model | 3 = route',
            ['func', 'model', 'route'],
        );
        if (!in_array($createModel, $selectableFunction)) {
            $this->error('Please Enter the Correct Create Mode!');
        }

        $getTable = DB::select("
            SELECT 
                SCHEMA_NAME(t.schema_id) as schema_name, 
                t.name as table_name,
                t.create_date,
                t.modify_date
            FROM sys.tables t
            WHERE SCHEMA_NAME(t.schema_id) =" . "'" . $schema_name . "'" . "
            ORDER BY table_name ASC
        ");

        $data = [];
        foreach ($getTable as $t) {
            $getColumn = DB::select("
                SELECT c.name AS column_name,c.column_id
                FROM sys.columns AS c
                JOIN sys.tables AS t ON c.object_id = t.object_id
                WHERE c.object_id = OBJECT_ID(" . "'" . $schema_name . "." . $t->table_name . "'" . ")
                    AND c.name != 'last_sync'
                    AND c.name != 'expired_date'
                ORDER BY c.column_id ASC
            ");

            $separateTableName = Str::replace(' ', '', $t->table_name);
            $routeName = $routeFunc = $t->table_name;
            $operation = Str::studly($separateTableName);
            $className = $operation;
            $summaryAndDesc = $operation;
            $operation = 'get' . $operation;

            $selectQText = '';
            $inArray = '';
            $fillable = '';
            foreach ($getColumn as $c) {
                $selectQText .= "'" . $c->column_name . "',";
                if ($c->column_name == 'create_date') {
                    $inArray .= "'waktu_data_ditambahkan' => " . '$each_data->' . $c->column_name . ',' . "\r";
                } elseif ($c->column_name == 'last_update') {
                    $inArray .= "'terakhir_diubah' => " . '$each_data->' . $c->column_name . ',' . "\r";
                } else {
                    $inArray .= "'" . $c->column_name . "' => " . '$each_data->' . $c->column_name . ',' . "\r";
                }
                $fillable .= "\t" . "'" . $c->column_name . "'" . ',' . "\r";
            }

            $data = [
                'path' => "/referensi/" . $t->table_name,
                'tag' => 'Referensi',
                'operation' => $operation,
                'summary' => "Dapatkan daftar $summaryAndDesc",
                'description' => "Menampilkan daftar data $summaryAndDesc",
                'function' => $t->table_name,
                'table' => $schema_name . "." . $t->table_name,
                'select' => rtrim($selectQText, ','),
                'array' => $inArray,
                'fillable' => $fillable,
                'class' => $className,
                'primarykey' => current($getColumn)->column_name,
                'namespace' =>  ucfirst($schema_name),
                'routename' => $routeName,
                'routefunc' => $routeFunc,
                'routecontroller' => 'ReferensiController'
            ];

            $templateFunction = "ewogICAgLyoqCiAgICAgKiBAT0FcR2V0KAogICAgICogICAgICBwYXRoPSI9PT09cGF0aD09PT0iLAogICAgICogICAgICBvcGVyYXRpb25JZD0iPT09PW9wZXJhdGlvbj09PT0iLAogICAgICogICAgICB0YWdzPXsiPT09PXRhZz09PT0ifSwKICAgICAqICAgICAgc3VtbWFyeT0iPT09PXN1bW1hcnk9PT09IiwKICAgICAqICAgICAgZGVzY3JpcHRpb249Ij09PT1kZXNjcmlwdGlvbj09PT0iLAogICAgICogICAgICBAT0FcUmVzcG9uc2UoCiAgICAgKiAgICAgICAgICByZXNwb25zZT0yMDAsCiAgICAgKiAgICAgICAgICBkZXNjcmlwdGlvbj0iU3VjY2Vzc2Z1bCBvcGVyYXRpb24iLAogICAgICogICAgICAgKSwKICAgICAqICAgICAgQE9BXFJlc3BvbnNlKAogICAgICogICAgICAgICAgcmVzcG9uc2U9NDAxLAogICAgICogICAgICAgICAgZGVzY3JpcHRpb249IlVuYXV0aGVudGljYXRlZCIsCiAgICAgKiAgICAgICksCiAgICAgKiAgICAgIEBPQVxSZXNwb25zZSgKICAgICAqICAgICAgICAgIHJlc3BvbnNlPTQwMywKICAgICAqICAgICAgICAgIGRlc2NyaXB0aW9uPSJGb3JiaWRkZW4iCiAgICAgKiAgICAgICksCiAgICAgKiAgICAgIHNlY3VyaXR5PXt7ImJlYXJlcl90b2tlbiI6e319fQogICAgICogICAgICkKICAgICAqLwogICAgcHVibGljIGZ1bmN0aW9uID09PT1mdW5jdGlvbj09PT0oUmVxdWVzdCAkcmVxdWVzdCkKICAgIHsKICAgICAgICAkbGlzdGRhdGEgPSBEQjo6dGFibGUoJz09PT10YWJsZT09PT0nKS0+c2VsZWN0KD09PT1zZWxlY3Q9PT09KS0+bGltaXQoNTApLT5nZXQoKS0+dG9BcnJheSgpOwogICAgICAgIGlmIChlbXB0eSgkbGlzdGRhdGEpKSB7CiAgICAgICAgICAgIHJldHVybiBXcmFwUmVzcG9uc2UoW10sICd0aWRhayBhZGEgZGFmdGFyID09PT1mdW5jdGlvbj09PT0geWFuZyBkaXRhbXBpbGthbicpOwogICAgICAgIH0KCiAgICAgICAgJGRhdGEgPSBbXTsKICAgICAgICBmb3JlYWNoICgkbGlzdGRhdGEgQVMgJGVhY2hfZGF0YSkgewogICAgICAgICAgICAkZGF0YVtdID0gWwogICAgICAgICAgICA9PT09YXJyYXk9PT09CiAgICAgICAgICAgIF07CiAgICAgICAgfQogICAgICAgIHJldHVybiBXcmFwUmVzcG9uc2UoY29tcGFjdCgnZGF0YScpLCAnc3Vrc2VzJyk7CiAgICB9";
            $templateFunction = @base64_decode($templateFunction);

            $templateModel = "PD9waHAKCm5hbWVzcGFjZSBBcHBcTW9kZWxzXFBEVVRcPT09PW5hbWVzcGFjZT09PT07Cgp1c2UgSWxsdW1pbmF0ZVxEYXRhYmFzZVxFbG9xdWVudFxNb2RlbDsKCmNsYXNzID09PT1jbGFzcz09PT0gZXh0ZW5kcyBNb2RlbAp7CiAgICBwcm90ZWN0ZWQgJHRhYmxlID0gJz09PT10YWJsZT09PT0nOwogICAgcHJvdGVjdGVkICRwcmltYXJ5S2V5ID0gJz09PT1wcmltYXJ5a2V5PT09PSc7CiAgICBwdWJsaWMgJHRpbWVzdGFtcHMgPSBmYWxzZTsKICAgIHB1YmxpYyAkaW5jcmVtZW50aW5nID0gZmFsc2U7CiAgICBwcm90ZWN0ZWQgJGZpbGxhYmxlID0gWwo9PT09ZmlsbGFibGU9PT09CiAgICBdOwp9";
            $templateModel = @base64_decode($templateModel);

            $templateRoute = "Um91dGU6OmdldCgnPT09PXJvdXRlbmFtZT09PT0nLCAnPT09PXJvdXRlY29udHJvbGxlcj09PT1APT09PXJvdXRlZnVuYz09PT0nKTs=";
            $templateRoute = @base64_decode($templateRoute);

            foreach ($data as $key => $value) {
                $templateFunction = Str::replace("====$key====", $value, $templateFunction);
                $templateModel = Str::replace("====$key====", $value, $templateModel);
                $templateRoute = Str::replace("====$key====", $value, $templateRoute);

                $DirPath = app_path() . DIRECTORY_SEPARATOR . 'Models' . DIRECTORY_SEPARATOR . 'PDUT' . DIRECTORY_SEPARATOR . 'Ref' . DIRECTORY_SEPARATOR;
                $modelNamePath = $DirPath . "$data[class].php";
            }

            if ($createModel == 'func') {
                $DirPath = app_path() . DIRECTORY_SEPARATOR . 'Http' . DIRECTORY_SEPARATOR . 'Controllers' . DIRECTORY_SEPARATOR . 'PDUT' . DIRECTORY_SEPARATOR . 'Api' . DIRECTORY_SEPARATOR;
                $controllerNamePath = $DirPath . "ReferensiController.php";

                $getContentOfController = @file($controllerNamePath);
                $getContentOfController[9] = $templateFunction . "\r\n";
                $reContentOfController = implode('', $getContentOfController);

                $file = fopen($controllerNamePath, 'w');
                flock($file, LOCK_EX);
                fwrite($file, $reContentOfController);
                flock($file, LOCK_UN);
                fclose($file);

                $this->info('Success Create Function ' . $data['path']);
            } elseif ($createModel == 'model') {
                $reContentOfModel = $templateModel;
                $file = fopen($modelNamePath, 'w');
                flock($file, LOCK_EX);
                fwrite($file, $reContentOfModel);
                flock($file, LOCK_UN);
                fclose($file);

                $this->info('Success Create Model ' . $data['path']);
            } elseif ($createModel == 'route') {
                $reContentOfRoute = $templateRoute;
                $routePath = base_path() . DIRECTORY_SEPARATOR . 'routes' . DIRECTORY_SEPARATOR . 'onedata' . DIRECTORY_SEPARATOR . 'referensi.php';

                // $lines = file($routePath);
                $lineStart = 3;
                // $lineStart = false;
                // $lineEnd = false;
                // foreach ($lines as $lineNumber => $line) {
                //     if (strpos($line, 'start_generate_ref_route') !== false) {
                //         $lineStart = $lineNumber;
                //     }

                //     if (strpos($line, 'end_generate_ref_route') !== false) {
                //         $lineEnd = $lineNumber;
                //     }
                // }

                // if (!$lineStart) {
                //     $this->error('start of file not found'); exit;
                // }

                // if (!$lineEnd) {
                //     $this->error('end of file not found'); exit;
                // }

                // $lineStart = $lineStart + 1;
                // $lineEnd = $lineEnd;

                // $i = $lineStart;
                // for ($i > $lineStart; $i < $lineEnd; $i++) { 
                //     unset($lines[$i]);
                // }

                // $reContentOfRoute = implode('', $lines);
                // $file = fopen($routePath, 'w');
                // flock($file, LOCK_EX);
                // fwrite($file, $reContentOfRoute);
                // flock($file, LOCK_UN);
                // fclose($file);

                $getContentOfRoute = file($routePath);
                $getContentOfRoute[$lineStart] = PHP_EOL.$templateRoute.PHP_EOL;
                $reContentOfRoute = implode('', $getContentOfRoute);

                $file = fopen($routePath, 'w');
                flock($file, LOCK_EX);
                fwrite($file, $reContentOfRoute);
                flock($file, LOCK_UN);
                fclose($file);

                $this->info('Success Create Route ' . $data['path']);
            }
        }
    }
}
