<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SisterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $startTime=microtime(true);

        ini_set('memory_limit',-1);
        ini_set('max_execution_time',0);
        $nomor_data=0;
        $id_creator = '443701e4-e814-48f3-9528-251bccee8af1';
        $token = generate_token_sister();
        // referensi
        $agama = curl_api_pddikti(env('URL_WS_SISTER').'/referensi/agama',$token);
    }
}
