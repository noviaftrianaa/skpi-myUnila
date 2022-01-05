<?php

if( !function_exists('get_tahun_keaktifan') ){
    function get_tahun_keaktifan(){
        $q = \DB::SELECT("select id_thn_ajaran AS tahun from ref.tahun_ajaran where NOW() between tgl_mulai and tgl_selesai and expired_date is null");
        return $q[0]->tahun;
    }
}
