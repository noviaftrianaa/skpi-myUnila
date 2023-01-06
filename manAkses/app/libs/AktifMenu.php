<?php



if( !function_exists('AktifMenu') ){

    function AktifMenu($path, $level = 1) {

        $path_sekarang = \Route::currentRouteName();

        if(strpos($path_sekarang,'.')!==false){

            $pecah_path = explode('.',$path_sekarang);

            if($level==2) {

                $new_path = $pecah_path[0].'.'.$pecah_path[1];
                if($new_path == $path) {
                    $match_path = true;
                } else {
                    $match_path = false;
                }

            } else {

                $new_path = $pecah_path[0];
                $path = explode('.', $path);
                $match_path = in_array($new_path, $path);

            }

        }else{

            $new_path = $path_sekarang;

        }

        return ($match_path==true)?'active':'';

    }

}