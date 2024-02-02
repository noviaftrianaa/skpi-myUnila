<?php

if (!function_exists('WrapResponse')) {
  function WrapResponse($response = [], $message = '', $isSuccess = true)
  {
    $start = constant('LARAVEL_START');
    $end = microtime(true);
    $exec = $end - $start;

    $return = array_merge(
      [
        'status' => $isSuccess ? true : false,
        'message' => $message,
        'latency' => $exec,
        'env' => DB::getDefaultConnection() == 'sqlsrv_live' ? 'live' : 'sandbox',
      ],
      $response
    );

    if (DB::getDefaultConnection() == 'sqlsrv_live') {
      unset($return['env']);
    }

    return response()->json($return);
  }
}
