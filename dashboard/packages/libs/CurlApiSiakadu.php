<?php

if( !function_exists( 'curlApiSiakadu' ) ){
    function curlApiSiakadu($method, $url, $fields_string, $token)
    {
        if (extension_loaded('curl') === true)
        {
            $header = array(
                'Content-Type: application/json',
                'Authorization: Bearer ' . $token
            );

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, FALSE);
            curl_setopt($ch,CURLOPT_CONNECTTIMEOUT, 100000);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            $result = curl_exec($ch);
            if ($result === false) {
                $info = curl_getinfo($ch);
                curl_close($ch);
                $message = "API Siakadu not connected";
                return $message;
                // die('error occured during curl exec. Info: ' . var_export($info));
            }
            curl_close ($ch);
        } else {
            ini_set("allow_url_fopen", 1);
            $result = file_get_contents($url);

        }

        $obj = json_decode($result, TRUE);

        return $obj;

    }
}

if( !function_exists('cek_token_siakadu')) {
    function cek_token_siakadu()
    {
        $token = Cache::get('token');
        if($token === null){
            $token = generate_token_siakadu('POST', ENV('URL_WS_SIAKADU') . '/auth/login');
            Cache::put('token', $token, 60);
            return $token;
        }else{
            return $token;
        }
    }
}

if( !function_exists('generate_token_siakadu')) {
    function generate_token_siakadu($method, $form_url)
    {
        $token = null;
        $form_token = data_get_token_form_siakadu();
        $get_token = curlApiSiakadu($method, $form_url, $form_token, $token);
        if(isset($get_token['success'])){
            $token = $get_token['payload']['access_token'];
            return $token;
        }else{
            $message = "API Siakadu not connected";
            return response()->json($message);
        }
    }
}

if( !function_exists('data_get_token_form_siakadu')) {
    function data_get_token_form_siakadu()
    {
        return json_encode([
            "username" => ENV('WS_SIAKADU_USERNAME'),
            "password" => ENV('WS_SIAKADU_PASSWORD')
        ]);
    }
}
