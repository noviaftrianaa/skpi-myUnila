<?php
/**
 * Created by PhpStorm.
 * User: Hendra
 * Date: 7/3/2018
 * Time: 10:36 PM
 */

if (!function_exists('GenerateToken')) {
    function GenerateToken($panjang)
    {
        $stringToEncode = guid();
        $encoded = base64_encode($stringToEncode);
        $encoded = str_replace(array('+', '/', '='), array('', '', ''), $encoded);
        $encoded = $encoded . str_shuffle($encoded) . str_shuffle(str_shuffle($encoded));
        $lengthKey = $panjang;
        $encodedLength = strlen($encoded);
        $startKey = mt_rand(0, $encodedLength);
        if (($encodedLength - $startKey) <= $lengthKey) {
            $startKey = $startKey - $lengthKey;
        }
        $returnedKey = substr($encoded, $startKey, $lengthKey);
        return $returnedKey;
    }
}