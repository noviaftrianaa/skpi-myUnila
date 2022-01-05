<?php



if( !function_exists('guid') ){

    /**

     *

     * Digunakan untuk membuat uuid

     *

     * @return  Uuid

     */

    function guid() {

        $guid = \DB::SELECT('SELECT NEWID() AS id');

        if(is_object($guid[0]))

        {

            return $guid[0]->id;

        }

        else

        {

            return $guid[0]['id'];

        }

    }

}