<?php

use Illuminate\Support\Facades\DB;

function curl_api_pddikti($url, $token,$a_dokumen=false) {
    if (extension_loaded('curl') === true)
    {
        $fp = fopen ('dokumen.pdf', 'w+');
        $ch = curl_init();
        curl_setopt($ch,CURLOPT_HTTPHEADER, ['Content-Type: application/json','Authorization: Bearer '.$token]);
        curl_setopt($ch,CURLOPT_URL, $url);
//            curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($ch,CURLOPT_POST, false);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
//        curl_setopt($ch, CURLOPT_FILE,$fp);
//        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
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

    if ($a_dokumen==1) {
        return $result;
    } else {
        $obj = json_decode($result, TRUE);
        return $obj;
    }
}

if (!function_exists('curl_api_neo_feeder')) {
    function curl_api_neo_feeder($url, $fields_string)
    {
        if (extension_loaded('curl') === true) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_URL, $url);
            //            curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, FALSE);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $result = curl_exec($ch);
            if ($result === false) {
                $info = curl_getinfo($ch);
                curl_close($ch);
                die('error occured during curl exec. Info: ' . var_export($info));
            }
            curl_close($ch);
        } else {
            ini_set('allow_url_fopen', 1);
            $result = file_get_contents($url);
        }
        $obj = json_decode($result, true);
        return $obj['data'];
    }
}

if (!function_exists('data_form_feeder')) {
    function data_form_feeder($act, $token, $filter = null, $param = null, $limit = 0, $offset = 0)
    {
        if (is_null($filter)) {
            return json_encode([
                'act' => $act,
                'token' => $token,
                'filter' => '',
                'limit' => 0,
                'offset' => 0,
            ]);
        } else {
            return json_encode([
                'act' => $act,
                'token' => $token,
                'filter' => "{$filter}='{$param}'",
                'limit' => $limit,
                'offset' => $offset,
            ]);
        }
    }
}

if (!function_exists('generate_token_feeder')) {
    function generate_token_feeder()
    {
        $url = ENV('URL_WS_NEO_FEEDER');
        $form_token = data_get_token_form_feeder();
        $get_token = curl_api_neo_feeder($url, $form_token);
        $token = $get_token['token'];
        DB::table('man_akses.access_token')->insert([
            'id_token' => guid(),
            'waktu_create' => currDateTime(),
            'waktu_expired' => config('mp.exp_data_row.waktu_expired_token'),
            'keterangan' => 'Token Seeder Data Neo Feeder',
            'token_value' => $token,
            'is_seq_uri' => 0,
            'is_reg_user' => 1,
            'base_url' => $url,
        ]);
        return $token;
    }
}

if (!function_exists('data_get_token_form_feeder')) {
    function data_get_token_form_feeder()
    {
        return json_encode([
            'act' => 'GetToken',
            'username' => ENV('WS_USERNAME'),
            'password' => ENV('WS_PASSWORD'),
        ]);
    }
}

if (!function_exists('data_get_token_form_sister')) {
    function data_get_token_form_sister()
    {
        return json_encode([
            'username' => ENV('WS_SISTER_USERNAME'),
            'password' => ENV('WS_SISTER_PASSWORD'),
            'id_pengguna' => ENV('WS_SISTER_PENGGUNA'),
        ]);
    }
}

if (!function_exists('curl_api_sister')) {
    function curl_api_sister($url, $fields_string)
    {
        if (extension_loaded('curl') === true) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_URL, $url);
            //            curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, FALSE);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $result = curl_exec($ch);
            if ($result === false) {
                $info = curl_getinfo($ch);
                curl_close($ch);
                die('error occured during curl exec. Info: ' . var_export($info));
            }
            curl_close($ch);
        } else {
            ini_set('allow_url_fopen', 1);
            $result = file_get_contents($url);
        }
        $obj = json_decode($result, true);
        return $obj;
    }
}

if (!function_exists('generate_token_sister')) {
    function generate_token_sister()
    {
        $cari_token = DB::table('man_akses.access_token')->where('keterangan','Token Data SISTER')->where(function ($token) {
            $token->where('waktu_create','<=',currDateTime())->where('waktu_expired','>=',currDateTime());
        })->orderBy('waktu_expired','DESC')->first();
        if (is_null($cari_token)) {
            $url = ENV('URL_WS_SISTER').'/authorize';
            $form_token = data_get_token_form_sister();
            $get_token = curl_api_sister($url, $form_token);
            $token = $get_token['token'];
            \DB::table('man_akses.access_token')->insert([
                'id_token' => guid(),
                'waktu_create' => currDateTime(),
                'waktu_expired' => config('mp.exp_data_row.waktu_expired_token'),
                'keterangan' => 'Token Data SISTER',
                'token_value' => $token,
                'is_seq_uri' => 0,
                'is_reg_user' => 1,
                'base_url' => $url,
            ]);
        } else {
            $token = $cari_token->token_value;
        }
        return $token;
    }
}
