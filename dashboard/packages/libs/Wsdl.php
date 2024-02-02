<?php

if (!function_exists('getAksesSiloket')) {
  function getAksesSiloket()
  {
    try {
      $client = getWsdlSiloket();
      $proxy = $client->getProxy();
      $err = $client->getError();
      if ($err) {
        return false;
      } else {
        $User = 'one_data';
        $Pwd = 'OneData2022';
        $response = $proxy->GetToken($User, $Pwd);
      }
    } catch (Exception $e) {
      $response = '';
    } catch (SoapFault $e) {
      $response = '';
    }
    if ($response['error_code'] == '0') {
      return [
        'status' => 'success',
        'data' => $response['result'],
      ];
    } else {
      return [
        'status' => 'error',
        'error_code' => $response['error_code'],
        'data' => [],
        'error_desc' => $response['error_desc'],
      ];
    }
  }
}

if (!function_exists('getWsdlSiloket')) {
  function getWsdlSiloket()
  {
    $client = new \nusoap_client('https://simpedam.unila.ac.id/ws/live2unila.php?wsdl', true);
    return $client;
  }
}
