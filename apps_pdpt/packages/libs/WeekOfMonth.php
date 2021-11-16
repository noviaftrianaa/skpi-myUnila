<?php
/**
 * Created by PhpStorm.
 * User: Hendra
 * Date: 3/11/2018
 * Time: 5:27 PM
 */
if( !function_exists( 'weekOfMonth' ) ){
    function weekOfMonth($date)
    {
        $firstOfMonth = strtotime(date("Y-m-01", strtotime($date)));
        return intval(date("W", strtotime($date))) - intval(date("W", $firstOfMonth)) + 1;
    }
}