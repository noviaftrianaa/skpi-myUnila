<?php
/**
 * Created by PhpStorm.
 * User: Hendra
 * Date: 7/3/2018
 * Time: 10:36 PM
 */

if (!function_exists('GeneratePinNumber')) {
    function GeneratePinNumber($panjang)
    {
        $A = "012345678998765432100123456789";
        $LenStr = 0;
        $Gen = '';
        while ($LenStr < $panjang) {
            for ($i=1;$i<=$panjang;$i++) {
                $random = rand(0,strlen($A));
                if ($random==30) {
                    $random = 29;
                }
                $Gen .= $A[$random];
            }
            $LenStr = strlen($Gen);
            if ($LenStr <> $panjang || substr($Gen,0,1) == 0) {
                $LenStr = 0; $Gen = '';
            }
        }
        return $Gen;
    }
}
