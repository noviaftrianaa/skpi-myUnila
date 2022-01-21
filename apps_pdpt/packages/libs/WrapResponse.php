<?php

if (!function_exists('WrapResponse')) {
    function WrapResponse($response = [], $message = "", $isSuccess = true)
    {
        $start = constant('LARAVEL_START');
        $end = microtime(true);
        $exec = ceil($end - $start);

        $return = array_merge(
            [
                'status' => $isSuccess ? true : false,
                'message' => $message,
                'latency' => $exec
            ],
            $response
        );

        return response()->json($return);
    }
}
