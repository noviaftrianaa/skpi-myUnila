<?php

namespace App\Console\Commands\ManAkses;

use App\Models\ManAkses\WsAuthorization;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class WsAuthorizationCommand extends Command
{
    protected $signature = 'ManAkses:WsAuthorization';
    protected $description = 'Sync manakses.pj_aplikasi to man_akses.ws_authorization (Full Access Endpoint)';
    public function __construct()
    {
        parent::__construct();
    }
    public function handle()
    {
        $pj_aplikasi = DB::select("
            SELECT
                pj.id_pengguna,
                pj.id_aplikasi
            FROM
                man_akses.pj_aplikasi AS pj
            WHERE
                pj.soft_delete = 0
                AND pj.a_masih = 1
                AND pj.wkt_selesai IS NULL
                AND pj.id_aplikasi = '948df317-78f7-4b92-a53f-0a56215e07de'
        ");
        foreach ($pj_aplikasi as $pj) {
            $ws_endpoint = DB::select("
                SELECT
                    epo.id_ws_endpoint
                FROM
                    man_akses.ws_endpoint AS epo
                WHERE
                    epo.soft_delete = 0
                    AND epo.a_active = 1
            ");
            foreach ($ws_endpoint as $epo) {
                WsAuthorization::updateOrInsert([
                    'id_pengguna' => $pj->id_pengguna,
                    'id_aplikasi' => $pj->id_aplikasi,
                    'id_ws_endpoint' => $epo->id_ws_endpoint,
                ], [
                    'id_ws_authorization' => guid(),
                    'a_active' => 1,
                    'id_creator' => 'b139c09e-5c93-42f1-9639-511c164d87de',
                    'last_sync' => now(),
                ]);
                print_r($pj->id_aplikasi ." | ". $epo->id_ws_endpoint. "\n");
            }
        }
    }
}
