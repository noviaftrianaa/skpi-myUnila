<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TestApiSiakaduSeeder extends Seeder
{

    private $url;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->currDateTime = currDateTime();
        $this->url = ENV('URL_WS_SIAKADU');
    }

    public function run()
    {
        $this->kurikulum();
    }

    public function kurikulum()
    {
        $token = cek_token_siakadu();
        $page= 1;
        $page_size=10;
        $thn_kurikulum=0;
        $id_unit="";
        $query = "page=".$page."&page_size=".$page_size;
        $get_data = curlApiSiakadu('GET', $this->url . '/kurikulum/list?'. $query, null, $token);
        dd($get_data);
    }

}
