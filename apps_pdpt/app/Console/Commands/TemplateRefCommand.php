<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TemplateRefCommand extends Command
{
    protected $signature = 'make:ref';

    protected $description = 'Create Ref Controller From Template';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $schema_name = 'ref';
        $createModel = $this->ask('Enter Create Mode (exp. 1 = function or 2 = model');
        if (!in_array($createModel, [1, 2])) {
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
            ORDER by table_name
        ");

        $data = [];
        foreach ($getTable as $t) {
            $getColumn = DB::select("
                SELECT c.name AS column_name,c.column_id
                FROM sys.columns AS c
                JOIN sys.tables AS t ON c.object_id=t.object_id
                WHERE c.object_id = OBJECT_ID(" . "'" . $schema_name . "." . $t->table_name . "'" . ") 
                    AND c.name != 'create_date'
                    AND c.name != 'last_sync'
                    AND c.name != 'last_update'
                    AND c.name != 'expired_date'
            ");

            $separateTableName = Str::replace(' ', '', $t->table_name);
            $operation = Str::studly($separateTableName);
            $className = $operation;
            $summaryAndDesc = $operation;
            $operation = 'get' . $operation;


            $selectQText = '';
            $inArray = '';
            foreach ($getColumn as $c) {
                $selectQText .= "'" . $c->column_name . "',";
                $inArray .= "'" . $c->column_name . "' => " . '$each_data->' . $c->column_name . ',' . "\r";
            }

            $data = [
                'path' => $t->table_name,
                'operation' => $operation,
                'summary' => "Dapatkan daftar $summaryAndDesc",
                'description' => "Menampilkan daftar data $summaryAndDesc",
                'function' => $t->table_name,
                'table' => $schema_name . "." . $t->table_name,
                'select' => rtrim($selectQText, ','),
                'array' => $inArray,
                'class' => $className,
                'primarykey' => current($getColumn)->column_name
            ];

            $templateFunction = "ewogICAgLyoqCiAgICAgKiBAT0FcR2V0KAogICAgICogICAgICBwYXRoPSIvcmVmZXJlbnNpLz09PT1wYXRoPT09PSIsCiAgICAgKiAgICAgIG9wZXJhdGlvbklkPSI9PT09b3BlcmF0aW9uPT09PSIsCiAgICAgKiAgICAgIHRhZ3M9eyJSZWZlcmVuc2kifSwKICAgICAqICAgICAgc3VtbWFyeT0iPT09PXN1bW1hcnk9PT09IiwKICAgICAqICAgICAgZGVzY3JpcHRpb249Ij09PT1kZXNjcmlwdGlvbj09PT0iLAogICAgICogICAgICBAT0FcUmVzcG9uc2UoCiAgICAgKiAgICAgICAgICByZXNwb25zZT0yMDAsCiAgICAgKiAgICAgICAgICBkZXNjcmlwdGlvbj0iU3VjY2Vzc2Z1bCBvcGVyYXRpb24iLAogICAgICogICAgICAgKSwKICAgICAqICAgICAgQE9BXFJlc3BvbnNlKAogICAgICogICAgICAgICAgcmVzcG9uc2U9NDAxLAogICAgICogICAgICAgICAgZGVzY3JpcHRpb249IlVuYXV0aGVudGljYXRlZCIsCiAgICAgKiAgICAgICksCiAgICAgKiAgICAgIEBPQVxSZXNwb25zZSgKICAgICAqICAgICAgICAgIHJlc3BvbnNlPTQwMywKICAgICAqICAgICAgICAgIGRlc2NyaXB0aW9uPSJGb3JiaWRkZW4iCiAgICAgKiAgICAgICksCiAgICAgKiAgICAgIHNlY3VyaXR5PXt7ImJlYXJlcl90b2tlbiI6e319fQogICAgICogICAgICkKICAgICAqLwogICAgcHVibGljIGZ1bmN0aW9uID09PT1mdW5jdGlvbj09PT0oUmVxdWVzdCAkcmVxdWVzdCkKICAgIHsKICAgICAgICAkbGlzdGRhdGEgPSBEQjo6dGFibGUoJz09PT10YWJsZT09PT0nKS0+c2VsZWN0KD09PT1zZWxlY3Q9PT09KS0+Z2V0KCk7CiAgICAgICAgZm9yZWFjaCAoJGxpc3RkYXRhIEFTICRlYWNoX2RhdGEpIHsKICAgICAgICAgICAgJGRhdGFbXSA9IFsKICAgICAgICAgICAgPT09PWFycmF5PT09PQogICAgICAgICAgICBdOwogICAgICAgIH0KICAgICAgICByZXR1cm4gcmVzcG9uc2UoKS0+anNvbihbCiAgICAgICAgICAgICdzdGF0dXMnID0+IHRydWUsCiAgICAgICAgICAgICdtZXNzYWdlJz0+ICdzdWNjZXNzJywKICAgICAgICAgICAgJ2RhdGEnICA9PiAkZGF0YQogICAgICAgIF0pOwogICAgfQ==";
            $templateFunction = @base64_decode($templateFunction);

            $templateModel = "PD9waHAKCm5hbWVzcGFjZSBBcHBcTW9kZWxzXFBEVVRcUmVmOwoKdXNlIEFwcFxNb2RlbHNcQWJzdHJhY3Rpb25Nb2RlbDsKdXNlIElsbHVtaW5hdGVcRGF0YWJhc2VcRWxvcXVlbnRcTW9kZWw7CgpjbGFzcyA9PT09Y2xhc3M9PT09IGV4dGVuZHMgQWJzdHJhY3Rpb25Nb2RlbAp7CiAgICBwcm90ZWN0ZWQgJHRhYmxlID0gJz09PT10YWJsZT09PT0nOwogICAgcHJvdGVjdGVkICRwcmltYXJ5S2V5ID0gJz09PT1wcmltYXJ5a2V5PT09PSc7Cn0K";
            $templateModel = @base64_decode($templateModel);

            foreach ($data as $key => $value) {
                $templateFunction = Str::replace("====$key====", $value, $templateFunction);
                $templateModel = Str::replace("====$key====", $value, $templateModel);
                $DirPath = app_path() . DIRECTORY_SEPARATOR . 'Models' . DIRECTORY_SEPARATOR . 'PDUT' . DIRECTORY_SEPARATOR . 'Ref' . DIRECTORY_SEPARATOR;
                $modelNamePath = $DirPath . "$data[class].php";
            }

            if ($createModel == 1) {
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
            } elseif ($createModel == 2) {
                if (file_exists($modelNamePath)) {
                    $this->info("Model $modelNamePath is Available");
                }

                $reContentOfModel = $templateModel;
                $file = fopen($modelNamePath, 'w');
                flock($file, LOCK_EX);
                fwrite($file, $reContentOfModel);
                flock($file, LOCK_UN);
                fclose($file);

                $this->info('Success Create Model ' . $data['path']);
            }
        }
    }
}
