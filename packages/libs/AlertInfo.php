<?php
/**
 * Created by PhpStorm.
 * User: Hendra
 * Date: 6/21/2017
 * Time: 5:48 AM
 */
if( !function_exists('AlertInfo') ){
    function AlertInfo($label) {
        return view('__partial.alert.info', [
            'label' => $label
        ]);
    }
}