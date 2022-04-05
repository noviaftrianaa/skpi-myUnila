<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NeoFeederSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $nomor_data=0;
        $id_creator = '443701e4-e814-48f3-9528-251bccee8af1';
        $prodi = DB::table('pdrd.sms')->where('soft_delete',0)->select('id_sms')->groupBy('id_sms')->pluck('id_sms')->toArray();
        $cari_token = DB::table('man_akses.access_token')->where(function ($token) {
            $token->where('waktu_create','>=',currDateTime())->where('waktu_expired','<=',currDateTime());
        })->first();
        $url = ENV('URL_WS_NEO_FEEDER');
        if (is_null($cari_token)) {
            $form_token = $this->data_get_token_form();
            $get_token = $this->curl_api_neo_feeder($url,$form_token);
            $token = $get_token['token'];
            DB::table('man_akses.access_token')->insert([
                'id_token'      => guid(),
                'waktu_create'  => currDateTime(),
                'waktu_expired' => config('mp.exp_data_row.waktu_expired_token'),
                'keterangan'    => 'Token Seeder Data Neo Feeder',
                'token_value'   => $token,
                'is_seq_uri'    => 0,
                'is_reg_user'   => 1,
                'base_url'      => $url
            ]);
        } else {
            $token = $cari_token->token_value;
        }

        // substansi kuliah
        $get_data_substansi_kuliah = $this->curl_api_neo_feeder($url, $this->data_form('GetListSubstansiKuliah',$token));
        $total_data_substansi_kuliah = count($get_data_substansi_kuliah);
        if ($total_data_substansi_kuliah>0) {
            foreach ($get_data_substansi_kuliah AS $no_substansi_kuliah=>$each_substansi_kuliah) {
                echo 'Mendapatkan '.($no_substansi_kuliah+1).' dari '.$total_data_substansi_kuliah;
                DB::table('pdrd.substansi_kuliah')->insert([
                    'id_subst'	    => $each_substansi_kuliah['id_substansi'],
//                    'id_sms'	    => $each_substansi_kuliah['id_prodi'],
                    'id_jns_subst'	=> $each_substansi_kuliah['id_jenis_substansi'],
                    'nm_subst'	    => $each_substansi_kuliah['nama_substansi'],
                    'sks_mk'	    => $each_substansi_kuliah['sks_mata_kuliah'],
                    'sks_tm'	    => $each_substansi_kuliah['sks_tatap_muka'],
                    'sks_prak'	    => $each_substansi_kuliah['sks_praktek'],
                    'sks_prak_lap'	=> $each_substansi_kuliah['sks_praktek_lapangan'],
                    'sks_sim'	    => $each_substansi_kuliah['sks_simulasi'],
                    'create_date'	=> date('Y-m-d H:i:s',strtotime($each_substansi_kuliah['tgl_create'])),
                    'id_creator'	=> $id_creator,
                    'last_update'	=> date('Y-m-d H:i:s',strtotime($each_substansi_kuliah['last_update'])),
                    'id_updater'	=> $id_creator,
                    'soft_delete'	=> 0,
                    'last_sync'	    => currDateTime()
                ]);
                echo " (OK)\n";
            }
        }

        // Kurikulum
        $get_data_substansi_kuliah = $this->curl_api_neo_feeder($url, $this->data_form('GetListSubstansiKuliah',$token));
        $total_data_substansi_kuliah = count($get_data_substansi_kuliah);
        if ($total_data_substansi_kuliah>0) {
            foreach ($get_data_substansi_kuliah AS $no_substansi_kuliah=>$each_substansi_kuliah) {
                echo 'Mendapatkan '.($no_substansi_kuliah+1).' dari '.$total_data_substansi_kuliah;
                DB::table('pdrd.substansi_kuliah')->insert([
                    'id_subst'	    => $each_substansi_kuliah['id_substansi'],
//                    'id_sms'	    => $each_substansi_kuliah['id_prodi'],
                    'id_jns_subst'	=> $each_substansi_kuliah['id_jenis_substansi'],
                    'nm_subst'	    => $each_substansi_kuliah['nama_substansi'],
                    'sks_mk'	    => $each_substansi_kuliah['sks_mata_kuliah'],
                    'sks_tm'	    => $each_substansi_kuliah['sks_tatap_muka'],
                    'sks_prak'	    => $each_substansi_kuliah['sks_praktek'],
                    'sks_prak_lap'	=> $each_substansi_kuliah['sks_praktek_lapangan'],
                    'sks_sim'	    => $each_substansi_kuliah['sks_simulasi'],
                    'create_date'	=> date('Y-m-d H:i:s',strtotime($each_substansi_kuliah['tgl_create'])),
                    'id_creator'	=> $id_creator,
                    'last_update'	=> date('Y-m-d H:i:s',strtotime($each_substansi_kuliah['last_update'])),
                    'id_updater'	=> $id_creator,
                    'soft_delete'	=> 0,
                    'last_sync'	    => currDateTime()
                ]);
                echo " (OK)\n";
            }
        }
    }

    function curl_api_neo_feeder($url,$fields_string) {
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
