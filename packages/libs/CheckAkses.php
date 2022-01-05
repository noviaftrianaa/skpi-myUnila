<?php
/**
 * Created by PhpStorm.
 * User: Hendra
 * Date: 6/20/2017
 * Time: 5:04 AM
 */

if (!function_exists('check_akses')) {

    /**
     * cek apakah user logged memiiki akses atas route yg dimasukan dalam parameter
     *
     * @param    String $route nama route
     * @return    bool
     *
     * @since    Apr/2016
     */
    function check_akses($route)
    {
        if (ENV('a_baypass')==0) {
            if( is_null(\Auth::user()) ) return false;

            $middleware = app()->make( \MP\ManAkses\AuthenticateMiddleware::class );

            return $middleware->userCanAccess( $route, session()->get('login.peran.id_peran') );
        } else {
            return true;
        }
    }
}
