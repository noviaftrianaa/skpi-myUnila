<?php
/**
 * Created by PhpStorm.
 * User: Hendra
 * Date: 6/21/2017
 * Time: 5:48 AM
 */
if( !function_exists('no_peserta') ){
    function no_peserta($data) {
        $depan = substr($data,0,3);
        $tengah = substr($data,3,2);
        $belakang = substr($data,5,4);
        return $depan.'-'.$tengah.'-'.$belakang;
    }
}
