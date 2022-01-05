<?php
/**
 * Created by PhpStorm.
 * User: Hendra
 * Date: 3/15/2018
 * Time: 3:35 AM
 */
if( !function_exists('password_gen')){
    function password_gen($value) {
        return md5($value);
    }
}
