<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MatkulSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $prodi = DB::table('pdrd.sms')->where('soft_delete',0)->select('id_sms')->groupBy('id_sms')->pluck('id_sms')->toArray();
        $cari_token = DB::table('man_akses.access_token')->where(function ($token) {
            $token->where('waktu_create','>=',currDateTime())->where('waktu_expired','<=',currDateTime());
        })->first();
        if (is_null($cari_token)) {
            $url = ENV('URL_WS_FEEDER');
            $form_token = $this->data_get_token_form();
            $get_token = $this->curl_api_feeder($url,$form_token);
            $token = $get_token['token'];
            DB::table('man_akses.access_token')->insert([
                'id_token'      => guid(),
                'waktu_create'  => currDateTime(),
                'waktu_expired' => config('mp.exp_data_row.waktu_expired_token'),
                'keterangan'    => 'Token Seeder Matakuliah Forlap',
                'token_value'   => $token,
                'is_seq_uri'    => 0,
                'is_reg_user'   => 1,
                'base_url'      => $url
            ]);
        } else {
            $token = $cari_token->token_value;
        }

        foreach ($prodi AS $id_sms) {
            $cari_prodi = DB::table('pdrd.sms')->where('id_sms', $id_sms)->first();
            $jenjang = DB::table('ref.jenjang_pendidikan')->where('id_jenj_didik',$cari_prodi->id_jenj_didik)->first();
            echo "Mendapatkan data kurikulum dari prodi ".($cari_prodi->nm_lemb.' ('.$jenjang->nm_jenj_didik.')')."\n";
            $get_kurikulum = $this->curl_api_feeder($url, $this->data_form('GetListKurikulum',$token,'id_prodi',$id_sms));
            dd($get_kurikulum);
            $total_data = count($get_kurikulum);
        }
    }

    function curl_api_feeder($url,$fields_string) {
        if (extension_loaded('curl') === true)
        {
            $ch = curl_init();
            curl_setopt($ch,CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch,CURLOPT_URL, $url);
//            curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, FALSE);
            curl_setopt($ch,CURLOPT_POST, true);
            curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);
            curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
            $result = curl_exec ($ch);
            if ($result === false) {
                $info = curl_getinfo($ch);
                curl_close($ch);
                die('error occured during curl exec. Info: ' . var_export($info));
            }
            curl_close ($ch);
        } else {
            ini_set("allow_url_fopen", 1);
            $result = file_get_contents($url);
        }
        $obj = json_decode($result, TRUE);
        return $obj['data'];
    }

    function data_form($act,$token,$filter=null,$param=null)
    {
        if (is_null($filter)) {
            return json_encode([
                "act"=> $act,
                "token"=> $token,
                "filter"=> "",
                "limit"=>0,
                "offset"=>0,
            ]);
        } else {
            return json_encode([
                "act"=> $act,
                "token"=> $token,
                "filter"=> "{$filter}='{$param}'",
                "limit"=>0,
                "offset"=>0,
            ]);
        }
    }

    function data_get_token_form()
    {
        return json_encode([
            "act"=> "GetToken",
            "username"=> ENV('WS_USERNAME'),
            "password"=> ENV('WS_PASSWORD')
        ]);
    }
}
