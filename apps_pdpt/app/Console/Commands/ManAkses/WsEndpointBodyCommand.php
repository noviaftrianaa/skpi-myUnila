<?php

namespace App\Console\Commands\ManAkses;

use App\Models\ManAkses\WsEndpointBody;
use File;
use Illuminate\Console\Command;

class WsEndpointBodyCommand extends Command
{
    protected $signature = 'ManAkses:WsEndpointBody';
    protected $description = 'Sync All Anotation Request Body to man_akses.ws_req_body';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $anotationsDir = app_path() . DIRECTORY_SEPARATOR . 'Anotations';
        $filesInFolder = File::allFiles($anotationsDir);
        $data = [];
        $reformat = [];

        foreach ($filesInFolder as $path) {
            $files = pathinfo($path);
            $readFile = @file_get_contents($files['dirname'] . DIRECTORY_SEPARATOR . $files['basename']);

            preg_match_all('#\/\*\*([\w\W]+)(\*\/)#U', $readFile, $section);
            $data[$files['basename']] = $section[1];

            if (count($data[$files['basename']]) == 0) {
                unset($data[$files['basename']]);
            }

            foreach ($section[1] as $value) {
                // preg_match('/path="(.*?)",/', $value, $path_url);
                preg_match('/(?:@OA[\W]+)(.*?)\([\s]+.*?path="(.*?)",/', $value, $path_url);
                preg_match_all('/(?:name|property)="([a-z \_]+)"/', $value, $req_body);
                preg_match_all('/@OA[\W]+(?:Schema|Property)[\W\w]+type="([\w]+)"/U', $value, $req_type_data);
                if (!isset($req_body[1])) {
                    continue;
                }

                $reformat[$path_url[2]]['req_method'] = trim($path_url[1]);
                $reformat[$path_url[2]]['req_body'] = $req_body[1];
                $reformat[$path_url[2]]['req_type_data'] = $req_type_data[1];
            }
        }

        foreach ($reformat as $krf => $rf) {
            $getIdWsEndpoint = \DB::select("
                SELECT TOP 1
                    we.id_ws_endpoint
                FROM
                    man_akses.ws_endpoint AS we
                WHERE
                    we.soft_delete = 0
                    AND we.a_active = 1
                    AND we.nm_method = ?
                    AND we.path_url = ?
            ", [$rf['req_method'], rtrim($krf, "/")]);

            foreach ($rf['req_body'] as $krb => $rb) {
                if (trim($rb) != 'message') {
                    WsEndpointBody::updateOrInsert([
                        'id_ws_endpoint' => $getIdWsEndpoint[0]->id_ws_endpoint,
                        'nm_req' => $rb,
                        'type_data' => $rf['req_type_data'][$krb],
                    ], [
                        'id_ws_endpoint_body' => guid(),
                        'id_creator' => 'b139c09e-5c93-42f1-9639-511c164d87de',
                        'last_sync' => now(),
                    ]);
                }
            }
            print_r($krf . ' | ' . $getIdWsEndpoint[0]->id_ws_endpoint . "\n");
        }
    }
}
