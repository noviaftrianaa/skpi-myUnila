<?php

if (!function_exists('WrapResponse')) {
    function WrapResponse($response = [], $message = "", $isSuccess = true)
    {
        $return = array_merge(
            [
                'status' => $isSuccess ? true : false,
                'message' => $message
            ],
            $response
        );

        return response()->json($return);
    }
}
