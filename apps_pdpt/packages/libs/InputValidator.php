<?php

use Illuminate\Support\Facades\Validator;

if (!function_exists('InputValidator')) {
    function InputValidator($rules = [], $messages = [])
    {
        static $validator = null;

        $inputs = [];
        foreach (request()->all() as $key => $value) {
            if (!is_array($value) && !is_bool($value) && !is_null($value)) {
                $varTemp = trim($value);
                $varTemp = stripslashes($varTemp);
                $varTemp = htmlspecialchars($varTemp);
                $inputs[$key] = $varTemp;
            } else {
                $inputs[$key] = $value;
            }
        }

        if (empty($messages)) {
            $validator = Validator::make($inputs, $rules);
        } else {
            $validator = Validator::make($inputs, $rules, $messages);
        }

        if (!is_null($validator)) {
            if ($validator->fails()) {
                header('Content-Type: application/json; charset=utf-8');
                exit(json_encode([
                    'status' => FALSE,
                    'message' => 'request gagal',
                    'error' => $validator->errors()
                ]));
            }

            return $inputs;
        }
    }
}
