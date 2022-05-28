<?php

use Illuminate\Support\Facades\Validator;

if (!function_exists('InputValidator')) {
    function InputValidator($rules = [], $messages = [])
    {
        static $validator = null;

        if (empty($messages)) {
            $validator = Validator::make(request()->all(), $rules);
        } else {
            $validator = Validator::make(request()->all(), $rules, $messages);
        }

        if (!is_null($validator)) {
            if ($validator->fails()) {
                header('Content-Type: application/json; charset=utf-8');
                exit(json_encode([
                    'status' => FALSE,
                    'message' => 'request gagal',
                    'error' => $validator->errors(),
                    'latency' => AppLatency(),
                    'response' => NULL
                ]));
            }

            return TRUE;
        }
    }
}
