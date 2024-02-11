<?php

if (!function_exists('curlApi')) {
  function curlApi($url)
  {
    if (extension_loaded('curl') === true) {
      set_time_limit(0);
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_TIMEOUT,500); // 500 seconds
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
