<?php
/**
 * Created by PhpStorm.
 * User: Hendra
 * Date: 3/13/2018
 * Time: 5:50 PM
 */
if (!function_exists('currency_to_number')) {
    function currency_to_number($number)
    {
        $new_number = str_ireplace('Rp ', '', str_ireplace('.', '', $number));
        return $new_number;
    }
}