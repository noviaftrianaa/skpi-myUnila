<?php
if( !function_exists('Judul')){
    /**
     *
     * Digunakan untuk menampilkan Judul halaman Aktif
     *
     * @return  string
     */
    function Judul() {
        $route = Route::getCurrentRoute()->getName();
        $judul_info = null;
        if(strpos($route, '.') !== false) {
            $pecah = explode('.',$route);
            $last = end($pecah);
            $dictionary = [
                'tambah', 'ubah', 'lihat', 'detail','create','edit','baru','progres'
            ];
            foreach($dictionary as $array) {
                if (strpos($last, $array) !== false) {
                    if(strpos($pecah[count($pecah)-2], '_') !== false) {
                        $judul = ucwords(str_replace("_", " ", $pecah[count($pecah)-2]));
                    } else {
                        $judul = ucwords($pecah[count($pecah)-2]);
                    }
                    if(strpos($last, '_') !== false) {
                        $judul_info = ucwords(str_replace("_", " ", $last));
                    } else {
                        $judul_info = ucwords($last);
                    }
                }
            }
            if(is_null($judul_info)) {
                if(strpos($last, '_') !== false) {
                    $judul = ucwords(str_replace("_", " ", $last));
                } else {
                    $judul = ucwords($last);
                }
            }
        } else {
            if(strpos($route, '_') !== false) {
                $judul = ucwords(str_replace("_", " ", $route));
            } else {
                $judul = ucwords($route);
            }
        }
        if(!is_null($judul_info)) {
            return $judul."<small>".$judul_info."</small>";
        } else {
            return $judul;
        }
    }
}