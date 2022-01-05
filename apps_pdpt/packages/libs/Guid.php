<?php

if( !function_exists('guid') ){
    /**
     *
     * Digunakan untuk membuat uuid
     *
     * @return  Uuid
     */
    function guid() {
        $sql = DB::SELECT(DB::raw('SELECT NEWID() as id'));
        if(is_object($sql[0]))
        {
            return $sql[0]->id;
        }
        else
        {
            return $sql[0]['id'];
        }
    }
}
