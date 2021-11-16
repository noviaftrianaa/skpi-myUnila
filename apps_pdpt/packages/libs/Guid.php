<?php

if( !function_exists('guid') ){
    /**
     *
     * Digunakan untuk membuat uuid
     *
     * @return  Uuid
     */
    function guid() {
        $guid = \DB::SELECT('SELECT uuid_generate_v4()');
        if(is_object($guid[0]))
        {
            return $guid[0]->uuid_generate_v4;
        }
        else
        {
            return $guid[0]['uuid_generate_v4'];
        }
    }
}