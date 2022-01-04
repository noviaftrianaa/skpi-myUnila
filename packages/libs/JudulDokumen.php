<?php
/**
 * Created by PhpStorm.
 * User: Hendra
 * Date: 3/15/2018
 * Time: 3:35 AM
 */
if( !function_exists('judul_dokumen')){
    function judul_dokumen($value) {
        $pecah = explode('_', $value);
        $gabung = implode(' ', $pecah);
        return ucwords($gabung);
    }
}