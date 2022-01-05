<?php
/**
 * Created by PhpStorm.
 * User: Hendra
 * Date: 6/21/2017
 * Time: 5:48 AM
 */
if( !function_exists('tableRow') ){
    function tableRow($label,$data) {
        return "<tr><td><strong>".$label."</strong></td><td>:</td><td>".(is_null($data)?'-':$data)."</td></tr>";
    }
}
