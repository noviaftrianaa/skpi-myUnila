<?php


if (!function_exists('token_series')) {
    function token_series()
    {
        $stringToEncode = guid();
        $encoded = base64_encode($stringToEncode);
        $encoded = str_replace(array('+', '/', '='), array('', '', ''), $encoded);
        $encoded = $encoded . str_shuffle($encoded) . str_shuffle(str_shuffle($encoded));
        $lengthKey = 20;
        $encodedLength = strlen($encoded);
        $startKey = mt_rand(0, $encodedLength);
        if (($encodedLength - $startKey) <= $lengthKey) {
            $startKey = $startKey - $lengthKey;
        }
        $returnedKey = substr($encoded, $startKey, $lengthKey);
        $list_erase = array(0,'o','O','l',1,'L','i','I');
        $erase_char = str_replace($list_erase,'',$returnedKey);
        $returned_token = substr($erase_char,0,10);
        return $returned_token;
    }
}


if (!function_exists('token_series_small')) {
    function token_series_small()
    {
        $stringToEncode = guid();
        $encoded = base64_encode($stringToEncode);
        $encoded = str_replace(array('+', '/', '='), array('', '', ''), $encoded);
        $encoded = $encoded . str_shuffle($encoded) . str_shuffle(str_shuffle($encoded));
        $lengthKey = 20;
        $encodedLength = strlen($encoded);
        $startKey = mt_rand(0, $encodedLength);
        if (($encodedLength - $startKey) <= $lengthKey) {
            $startKey = $startKey - $lengthKey;
        }
        $returnedKey = substr($encoded, $startKey, $lengthKey);
        $list_erase = array(0,'o','O','l',1,'L','i','I');
        $erase_char = str_replace($list_erase,'',$returnedKey);
        $returned_token = substr($erase_char,0,3);
        return $returned_token;
    }
}